import { CoverageEntry } from 'puppeteer';
import { runBabelPlugin } from '../babel';
import { CoverageReport } from '../instrument';
import { getUnusedRanges, Range } from './get-unused-ranges';

interface Options {
  getLocalPath(url: string): string;
}

export interface OptimisationResult {
  type: 'css' | 'js';
  file: CoverageEntry;
  unusedRanges: Range[];
  localPath: string;
  optimisedText: string;
  totalBytes: number;
  usedBytes: number;
  usedPercent: number;
  unusedBytes: number;
  unusedPercent: number;
  removedBytes: number;
  removedPercent: number;
}

/**
 * Remove unused code from the given `CoverageReport`.
 */
export async function optimise(
  coverageByType: CoverageReport,
  options: Options,
): Promise<OptimisationResult[]> {
  return (['js', 'css'] as const)
    .flatMap(function createWrapper(type) {
      return coverageByType[type].map((file) => ({
        type,
        file,
        unusedRanges: getUnusedRanges(file.text.length, file.ranges),
        localPath: options.getLocalPath(file.url),
        optimisedText: file.text,
        totalBytes: 0,
        usedBytes: 0,
        usedPercent: 0,
        unusedBytes: 0,
        unusedPercent: 0,
        removedBytes: 0,
        removedPercent: 0,
      }));
    })
    .filter(function hasLocalPath(obj) {
      return obj.localPath;
    })
    .filter(function isExternalFile(obj) {
      return obj.file.url.search(/(css|js)$/) !== -1;
    })
    .map(function removeUnusedCode(obj) {
      const file = obj.file;
      if (file.ranges.length > 0) {
        obj.optimisedText =
          obj.type === 'js'
            ? runBabelPlugin(file.text, obj.unusedRanges, obj.localPath)
            : file.ranges.reduce(
                (str, range) =>
                  `${str}${file.text.slice(range.start, range.end)}`,
                '',
              );
      }
      return obj;
    })
    .map(function withStats(obj) {
      obj.totalBytes = obj.file.text.length;
      obj.usedBytes =
        obj.file.ranges.reduce(
          (sum, { start, end }) => sum + (end - start),
          0,
        ) || obj.totalBytes;
      obj.usedPercent = (obj.usedBytes / obj.totalBytes) * 100;
      obj.unusedBytes = obj.totalBytes - obj.usedBytes;
      obj.unusedPercent = (obj.unusedBytes / obj.totalBytes) * 100;
      obj.removedBytes = obj.totalBytes - obj.optimisedText.length;
      obj.removedPercent = (obj.removedBytes / obj.totalBytes) * 100;
      return obj;
    });
}
