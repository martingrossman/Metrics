const { defineConfig } = require('playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: /visual\.spec\.js$/,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide'
    }
  },
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'node tests/static_server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 30_000
  }
});
