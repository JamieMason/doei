import * as babel from '@babel/core';
import babelPluginDoei from './plugin';

export function runBabelPlugin(
  source: string,
  unusedRanges: { start: number; end: number }[],
  localPath: string,
): string {
  const result = babel.transform(source, {
    babelrc: false,
    browserslistConfigFile: false,
    comments: true,
    compact: true,
    configFile: false,
    envName: 'production',
    minified: true,
    plugins: [[babelPluginDoei, { localPath, unusedRanges }]],
  });
  if (!result || !result.code) throw new Error('Babel Transform failed');
  return result.code;
}
