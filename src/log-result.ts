import { OptimisationResult } from './optimise';

const byteFormat = new Intl.NumberFormat('en-GB', {
  style: 'unit',
  unit: 'byte',
  unitDisplay: 'narrow',
});

function formatByte(bytes: number): string {
  return byteFormat.format(bytes);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format and display the given optimisation result as a table.
 */
export function logResult(results: OptimisationResult[]) {
  console.table(
    results
      .map((result) => ({
        url: new URL(result.file.url).pathname,
        totalBytes: result.totalBytes,
        usedBytes: result.usedBytes,
        unusedBytes: result.unusedBytes,
        removedBytes: result.removedBytes,
        usedPercent: result.usedPercent,
        unusedPercent: result.unusedPercent,
        removedPercent: result.removedPercent,
      }))
      .concat(
        results.reduce(
          (obj, result) => {
            obj.totalBytes += result.totalBytes;
            obj.usedBytes += result.usedBytes;
            obj.unusedBytes += result.unusedBytes;
            obj.removedBytes += result.removedBytes;
            obj.usedPercent = (obj.usedBytes / obj.totalBytes) * 100;
            obj.unusedPercent = (obj.unusedBytes / obj.totalBytes) * 100;
            obj.removedPercent = (obj.removedBytes / obj.totalBytes) * 100;
            return obj;
          },
          {
            url: 'TOTAL',
            totalBytes: 0,
            usedBytes: 0,
            unusedBytes: 0,
            removedBytes: 0,
            usedPercent: 0,
            unusedPercent: 0,
            removedPercent: 0,
          },
        ),
      )
      .map((obj) => ({
        url: obj.url,
        totalBytes: formatByte(obj.totalBytes),
        usedBytes: formatByte(obj.usedBytes),
        unusedBytes: formatByte(obj.unusedBytes),
        removedBytes: formatByte(obj.removedBytes),
        usedPercent: formatPercent(obj.usedPercent),
        unusedPercent: formatPercent(obj.unusedPercent),
        removedPercent: formatPercent(obj.removedPercent),
      })),
  );
}
