import { expect, test } from '@playwright/test'

test('should redirect to GitHub when query is "github"', async ({ page }) => {
  await page.goto('http://localhost:49152/ducky/?q=github')
  //   const baseUrl = new URL(page.url())
  //   baseUrl.searchParams.set('q', 'github')
  //   await page.goto(baseUrl.toString())
  expect(page.url()).toBe('https://github.com/')
})
