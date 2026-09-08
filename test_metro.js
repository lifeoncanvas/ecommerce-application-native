const { spawn } = require('child_process');

const child = spawn('npm', ['run', 'web', '--', '-c'], {
  cwd: 'C:\\Users\\Sharon\\ecommerceapp',
  shell: true
});

child.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

child.stderr.on('data', (data) => {
  console.log(`STDERR: ${data}`);
});

// Stop after 15 seconds
setTimeout(() => {
  child.kill();
  console.log('Finished capturing output.');
  process.exit(0);
}, 15000);
