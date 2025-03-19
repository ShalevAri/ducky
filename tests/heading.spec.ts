import { expect, test } from '@playwright/test'

test('check element exists with locator.count', async ({ page }) => {
  await page.goto('http://localhost:49152/ducky/')
  await page.waitForTimeout(500)

  const locator = page.locator('h1')
  const count = await locator.count()
  expect(count).toBeGreaterThanOrEqual(1)
})
