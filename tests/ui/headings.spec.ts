import { expect, test } from '@playwright/test'

test('check the headings exist with correct text', async ({ page }) => {
  await page.goto('http://localhost:49152/ducky/')
  await page.waitForTimeout(500)

  // Check h1 exists and has correct text
  const h1Locator = page.locator('h1')
  const h1Count = await h1Locator.count()
  expect(h1Count).toBe(1)
  expect(await h1Locator.innerText()).toBe('Ducky')

  // Check h2 elements exist and have correct text
  const h2Locator = page.locator('h2')
  const h2Count = await h2Locator.count()
  expect(h2Count).toBe(3)

  const h2Texts = await h2Locator.allInnerTexts()
  expect(h2Texts).toContain('The Fastest Search Router')
  expect(h2Texts).toContain('Ducky Islands')
  expect(h2Texts).toContain('Ducklings')
})
