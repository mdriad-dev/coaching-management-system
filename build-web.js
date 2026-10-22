const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Current working directory:', process.cwd());

const frontendDir = path.join(process.cwd(), 'frontend');
if (!fs.existsSync(frontendDir)) {
  console.error('Could not locate frontend directory from:', process.cwd());
  process.exit(1);
}

console.log('Installing frontend dependencies in:', frontendDir);
execSync('npm install --legacy-peer-deps', {
  cwd: frontendDir,
  stdio: 'inherit',
  env: { ...process.env, CI: 'false' },
});

console.log('Building Angular production bundle...');
execSync('npm run build', {
  cwd: frontendDir,
  stdio: 'inherit',
  env: { ...process.env, CI: 'false' },
});

const sourceDist = path.join(frontendDir, 'dist', 'coaching-management-frontend', 'browser');
const targetDist = path.join(process.cwd(), 'dist');

if (fs.existsSync(sourceDist)) {
  console.log('Copying build to target dist:', targetDist);
  if (fs.existsSync(targetDist)) {
    fs.rmSync(targetDist, { recursive: true, force: true });
  }
  fs.cpSync(sourceDist, targetDist, { recursive: true });

  const indexPath = path.join(targetDist, 'index.html');
  const fallbackPath = path.join(targetDist, '404.html');
  if (fs.existsSync(indexPath) && !fs.existsSync(fallbackPath)) {
    fs.copyFileSync(indexPath, fallbackPath);
  }
} else {
  console.error('Build output not found at:', sourceDist);
  process.exit(1);
}

console.log('✓ Vercel build completed successfully in dist!');
