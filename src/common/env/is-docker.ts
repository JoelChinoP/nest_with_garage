import { existsSync, readFileSync } from 'fs';

export function isDocker(): boolean {
  return (
    existsSync('/.dockerenv') ||
    (existsSync('/proc/1/cgroup') && readFileSync('/proc/1/cgroup', 'utf8').includes('docker'))
  );
}
