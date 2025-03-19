import { expect, test } from '@playwright/test'

test('check the url bar exists', async ({ page }) => {
  await page.goto('http://localhost:49152/ducky/')
  await page.waitForTimeout(500)

  const locator = page.locator('.url-container')
  const count = await locator.count()
  expect(count).toBe(1)
})
