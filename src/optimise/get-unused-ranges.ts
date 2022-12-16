export interface Range {
  start: number;
  end: number;
}

/**
 * Invert the
 * [`CoverageEntry.ranges[]`](https://pptr.dev/api/puppeteer.coverageentry.ranges)
 * from ranges of used code to ranges of unused code.
 */
export function getUnusedRanges(
  totalBytes: number,
  usedRanges: Range[],
): Range[] {
  const unusedRanges: Range[] = [];

  if (usedRanges.length === 0) return [];

  const first = usedRanges[0];
  const [last] = usedRanges.slice(-1);

  if (first.start > 0) {
    unusedRanges.push({ start: 0, end: first.start });
  }

  usedRanges.forEach((current, i) => {
    if (i === 0) return;
    const prev = usedRanges[i - 1];
    if (prev.end < current.start) {
      unusedRanges.push({
        start: prev.end,
        end: current.start,
      });
    }
  });

  if (last.end < totalBytes) {
    unusedRanges.push({
      start: last.end,
      end: totalBytes,
    });
  }

  return unusedRanges;
}
