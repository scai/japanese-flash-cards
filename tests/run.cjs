// Start an isolated preview server, run every regression check, then clean up.
const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const run = file => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(__dirname, file)], { cwd: root, stdio: 'inherit' });
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${file} exited with ${code}`)));
});

(async () => {
  const server = spawn(process.execPath, ['preview-server.cjs'], { cwd: root, env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'inherit'] });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Preview server startup timed out')), 10000);
      server.once('error', error => { clearTimeout(timeout); reject(error); });
      server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Preview server exited with ${code}`)); });
      server.stdout.on('data', data => {
        const match = data.toString().match(/Preview: (http:\/\/127\.0\.0\.1:\d+)/);
        if (match) { process.env.TEST_BASE_URL = `${match[1]}/`; clearTimeout(timeout); resolve(); }
      });
    });
    for (const file of ['core.cjs', 'pronunciation.cjs', 'voice-input.cjs', 'landscape.cjs', 'offline.cjs']) await run(file);
    console.log('All regression checks passed.');
  } finally { server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
