import fs from 'fs';
import path from 'path';
import { Page } from 'puppeteer';
import * as doei from '../src';

function sleep(secs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
}

doei
  .instrument(async (page: Page) => {
    const viewports = [
      { width: 640, height: 480, deviceScaleFactor: 1 },
      { width: 1024, height: 768, deviceScaleFactor: 1 },
      { width: 2048, height: 1536, deviceScaleFactor: 1 },
    ];

    for await (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto('http://localhost:8080');
      await sleep(2);
    }
  })
  .then((coverageReport) => {
    return doei.optimise(coverageReport, {
      getLocalPath(url) {
        if (url.startsWith('http://localhost:8080')) {
          return url.replace(
            'http://localhost:8080',
            path.resolve(__dirname, './output'),
          );
        }
        return '';
      },
    });
  })
  .then((optimisationResult) => {
    fs.writeFileSync(
      path.resolve(__dirname, './report.json'),
      JSON.stringify(optimisationResult, null, 2),
      'utf8',
    );
    doei.logResult(optimisationResult);
    return optimisationResult;
  })
  .then((result) => {
    return doei.replaceOriginals(result);
  });
