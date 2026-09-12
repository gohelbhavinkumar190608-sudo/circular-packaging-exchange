const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

const INITIAL_DEMO_USERS = [
  {
    id: "acc_1",
    name: "Sunrise Logistics Pvt Ltd",
    type: "Manufacturer",
    city: "Mumbai",
    state: "Maharashtra",
    email: "sunrise.logistics.pvt.ltd@gmail.com",
    roleBadge: "Seller & Manufacturer",
    passwordHash: hashPassword("password123"),
    isDemo: true
  },
  {
    id: "acc_2",
    name: "Krishna Paper Mills",
    type: "Recycler",
    city: "Ahmedabad",
    state: "Gujarat",
    email: "krishna.paper.mills@business.co.in",
    roleBadge: "Industrial Recycler",
    passwordHash: hashPassword("password123"),
    isDemo: true
  },
  {
    id: "acc_3",
    name: "EcoBox Solutions",
    type: "Distributor",
    city: "Surat",
    state: "Gujarat",
    email: "ecobox.solutions@business.co.in",
    roleBadge: "Packaging Distributor",
    passwordHash: hashPassword("password123"),
    isDemo: true
  },
  {
    id: "acc_4",
    name: "Bharat Pallet Works",
    type: "Manufacturer",
    city: "Mumbai",
    state: "Maharashtra",
    email: "bharat.pallet.works@business.co.in",
    roleBadge: "Pallet Manufacturer",
    passwordHash: hashPassword("password123"),
    isDemo: true
  },
  {
    id: "acc_5",
    name: "GreenPack Industries",
    type: "Recycler",
    city: "Chennai",
    state: "Tamil Nadu",
    email: "greenpack.industries@business.co.in",
    roleBadge: "Circular Recycler",
    passwordHash: hashPassword("password123"),
    isDemo: true
  }
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password || 'password123').digest('hex');
}

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_DEMO_USERS, null, 2), 'utf8');
      return INITIAL_DEMO_USERS;
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(raw || '[]');
    if (users.length === 0) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_DEMO_USERS, null, 2), 'utf8');
      return INITIAL_DEMO_USERS;
    }
    return users;
  } catch (err) {
    console.error('[Auth] Error loading users:', err);
    return INITIAL_DEMO_USERS;
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[Auth] Error saving users:', err);
  }
}

// Generate simple mock session token
function generateToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 })).toString('base64');
}

// Strip password hash from returned user object
function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// GET /api/auth/users (List all accounts for quick selection)
router.get('/users', (req, res) => {
  const users = loadUsers();
  res.json({
    success: true,
    users: users.map(sanitizeUser)
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password, accountId } = req.body;
    const users = loadUsers();

    let user;
    if (accountId) {
      user = users.find(u => u.id === accountId);
    } else if (email) {
      user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No enterprise account found matching this email address.'
      });
    }

    // For demo accounts, accept either password123 or any password if logging in via demo switcher
    if (password && !user.isDemo) {
      const hashed = hashPassword(password);
      if (user.passwordHash && user.passwordHash !== hashed) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password. Please try again.'
        });
      }
    }

    const token = generateToken(user);
    console.log(`[Auth] User logged in: ${user.name} (${user.email})`);

    res.json({
      success: true,
      user: sanitizeUser(user),
      token,
      message: `Welcome back, ${user.name}!`
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, type, city, state, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Company name, official email, and password are required.'
      });
    }

    const users = loadUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An enterprise account is already registered with this email.'
      });
    }

    const newId = `acc_${Date.now().toString().slice(-5)}`;
    const newUser = {
      id: newId,
      name: name.trim(),
      type: type || 'Manufacturer',
      city: city ? city.trim() : 'Mumbai',
      state: state ? state.trim() : 'Maharashtra',
      email: email.trim().toLowerCase(),
      roleBadge: `${type || 'Manufacturer'} Enterprise`,
      passwordHash: hashPassword(password),
      isDemo: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = generateToken(newUser);
    console.log(`[Auth] New enterprise registered: ${newUser.name} (${newUser.email})`);

    res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token,
      message: `Enterprise account registered successfully!`
    });
  } catch (err) {
    console.error('[Auth] Registration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const users = loadUsers();
    const user = users.find(u => u.id === decoded.id || u.email === decoded.email);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User session not found' });
    }

    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }
});

module.exports = router;
