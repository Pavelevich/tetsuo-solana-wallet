// Suppress native binding warnings (runs before main CLI)
const originalStdout = process.stdout.write.bind(process.stdout);
const originalStderr = process.stderr.write.bind(process.stderr);
const suppressPatterns = ['bigint', 'bindings', 'pure JS', 'rebuild?'];

(process.stdout as any).write = (chunk: any, ...args: any[]) => {
  const str = chunk?.toString() || '';
  if (suppressPatterns.some(p => str.includes(p))) return true;
  return originalStdout(chunk, ...args);
};
(process.stderr as any).write = (chunk: any, ...args: any[]) => {
  const str = chunk?.toString() || '';
  if (suppressPatterns.some(p => str.includes(p))) return true;
  return originalStderr(chunk, ...args);
};
