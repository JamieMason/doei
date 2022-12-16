import puppeteer, { CoverageEntry, Page } from 'puppeteer';

type RunSuite = (page: Page) => Promise<void>;

export interface CoverageReport {
  css: CoverageEntry[];
  js: CoverageEntry[];
}

/**
 * Start Puppeteer and collect Coverage data while your user actions are being
 * performed.
 */
export async function instrument(
  performUserActions: RunSuite,
): Promise<CoverageReport> {
  const browser = await puppeteer.launch({
    args: ['--force-dark-mode'],
  });
  const page = await browser.newPage();

  await Promise.all([
    page.coverage.startJSCoverage({
      includeRawScriptCoverage: false,
      reportAnonymousScripts: false,
      resetOnNavigation: false,
      useBlockCoverage: false,
    }),
    page.coverage.startCSSCoverage({
      resetOnNavigation: false,
    }),
  ]);

  await performUserActions(page);

  const [css, js] = await Promise.all([
    page.coverage.stopCSSCoverage(),
    page.coverage.stopJSCoverage(),
  ]);

  await browser.close();

  return { css, js };
}
