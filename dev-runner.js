const { spawn } = require('child_process');
const path = require('path');

console.log("===============================================================");
console.log("♻️  Starting Circular Packaging & Materials Exchange Platform...");
console.log("===============================================================");

// 1. Launch Backend (Express API) on port 5000
const server = spawn('node', ['server/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: 5000 }
});

// 2. Launch Frontend (Vite Dev Server) on port 3000
const client = spawn('npm.cmd', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log("\nShutting down Circular Packaging Exchange...");
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
