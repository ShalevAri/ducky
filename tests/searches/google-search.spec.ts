import { expect, test } from '@playwright/test'

test('should make sure Google search works', async ({ page }) => {
  const searchTerm = 'test'
  await page.goto('http://localhost:49152/ducky/')
  const baseUrl = new URL(page.url())
  baseUrl.searchParams.set('q', searchTerm)
  baseUrl.searchParams.set('default_bang', 'google')
  await page.goto(baseUrl.toString())
  expect(page.url()).toBe(`http://localhost:49152/ducky/?q=${searchTerm}&default_bang=google`)
})
