# doei

> Experiment: Remove unused CSS/JS using RUM Code Coverage.

## Status

- 🤔 New research project.
- 😬 Nowhere near ready.
- 💀 Not clear if it's even to be possible/practical.

## General Idea

1. Run [Puppeteer](https://pptr.dev/) against a running web app.
1. Use the application as a real user would.
1. Collect CSS and JS Coverage reports from the Browser.
1. Remove CSS and JS which was never used.

## Obvious Flaws

1. Fail to recreate a real world action and/or device characteristic and you
   will delete code which is needed, and break your app.
1. Huge maintenance burden to try to replicate the above.

## Possible Improvements

1. If Code Coverage could be added to the Real User Metrics which Browser
   Vendors collect already, that data could potentially be used to drive tools
   like this one.
1. Collect Coverage during your eg. [Cypress](https://www.cypress.io/) or
   [Playwright](https://playwright.dev/) tests.

   With a thorough test suite you could get decent sense of its coverage, but
   still far from all the possible things a user might do.

## Contributing

### Install

```
git clone https://github.com/JamieMason/doei.git
yarn install
```

### Run Tool Locally

1. Start a server for the test web page to be optimised:
   ```
   http-server test/input/
   ```
1. Open another Terminal
1. Run Doei
   ```
   yarn ts-node test/run.ts
   ```
1. Start a server to display the optimised web page:
   ```
   http-server -p 8081 test/output/
   ```
1. Compare the optimised page with the original.

### CSS Removal

Keep only source which falls within the
[`CoverageEntry.ranges[]`](https://pptr.dev/api/puppeteer.coverageentry.ranges).

### JS Removal

The CSS approach does not work as blindy removing ranges of code can create
syntax errors, for example:

```diff
- const alwaysOne = 1 || "impossible case"
+ const alwaysOne = 1 ||
```

So the code is run through a [Babel](https://babeljs.io/) Transform at
[src/babel/plugin.ts](src/babel/plugin.ts).

## API

```ts
/**
 * Start Puppeteer and collect Coverage data while
 * your user actions are being performed.
 */
function instrument(
  performUserActions: RunSuite
): Promise<CoverageReport>;

/**
 * Remove unused code from the given `CoverageReport`.
 */
function optimise(
  coverageByType: CoverageReport,
  options: Options,
): Promise<OptimisationResult[]>;

/**
 * Write the files contained within the given
 * optimisation result to disk.
 */
function replaceOriginals(
  result: OptimisationResult[],
): Promise<OptimisationResult[]>;

/**
 * Format and display the given optimisation
 * result as a table.
 */
function logResult(
  results: OptimisationResult[]
): void;
```
