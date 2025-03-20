import { expect, test } from '@playwright/test'

test('should redirect to GitHub when query is "github"', async ({ page }) => {
  await page.goto('http://localhost:49152/ducky/?q=github')
  expect(page.url()).toBe('https://github.com/')
})
