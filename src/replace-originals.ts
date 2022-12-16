import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { OptimisationResult } from './optimise';

/**
 * Write the files contained within the given optimisation result to disk.
 */
export async function replaceOriginals(
  result: OptimisationResult[],
): Promise<OptimisationResult[]> {
  return result.map(function replaceOriginal(obj) {
    const { localPath, optimisedText } = obj;
    const dirPath = localPath.slice(0, localPath.lastIndexOf('/'));
    if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
    writeFileSync(localPath, optimisedText, { encoding: 'utf8' });
    return obj;
  });
}
