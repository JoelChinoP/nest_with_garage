import fs from 'fs';

export function isDocker(): boolean {
  return (
    fs.existsSync('/.dockerenv') ||
    (fs.existsSync('/proc/1/cgroup') &&
      fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker'))
  );
}
