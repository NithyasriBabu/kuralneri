import { Platform } from 'react-native';

/**
 * OPFS (web) allows only one sync access handle per database file at a time.
 * Serialize all web SQLite work through a single promise chain.
 */
let webDbChain: Promise<unknown> = Promise.resolve();

export function runWebDbTask<T>(task: () => Promise<T>): Promise<T> {
  if (Platform.OS !== 'web') {
    return task();
  }

  const run = webDbChain.then(task, task);
  webDbChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
