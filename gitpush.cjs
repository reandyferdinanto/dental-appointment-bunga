const {spawnSync} = require('child_process');
const opts = {cwd: 'C:/reandy/Dentist_Bunga', encoding: 'utf8', stdio: 'pipe'};

function git(args) {
  const r = spawnSync('git', args, opts);
  return (r.stdout + r.stderr).trim() || '(ok)';
}

console.log('status:', git(['status', '--porcelain']));
console.log('add:',    git(['add', '-A']));
console.log('commit:', git(['commit', '-m', 'fix: add SessionProvider, import AdminUser type, force-dynamic dashboard']));
console.log('push:',   git(['push', 'origin', 'main']));

