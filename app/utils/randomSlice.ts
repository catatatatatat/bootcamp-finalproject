export function random10<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, 10);
}
