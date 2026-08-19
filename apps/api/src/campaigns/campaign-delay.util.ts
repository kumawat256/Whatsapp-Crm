/** Inclusive random integer in [minSeconds, maxSeconds]. Falls back to minSeconds if the range is invalid. */
export function randomDelaySeconds(
  minSeconds: number,
  maxSeconds: number,
): number {
  if (maxSeconds <= minSeconds) return Math.max(0, minSeconds);
  return minSeconds + Math.floor(Math.random() * (maxSeconds - minSeconds + 1));
}
