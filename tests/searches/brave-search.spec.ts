import { expect, test } from '@playwright/test'

test('should make sure Brave search works', async ({ page }) => {
  const searchTerm = 'test'
  await page.goto('http://localhost:49152/ducky/')
  const baseUrl = new URL(page.url())
  baseUrl.searchParams.set('q', searchTerm)
  baseUrl.searchParams.set('default_bang', 'brave')
  await page.goto(baseUrl.toString())
  expect(page.url()).toBe(`https://search.brave.com/search?q=${searchTerm}`)
})
