import { expect, test } from '@playwright/test'

test('test', async ({ page }) => {
  const searchTerm = 'test'
  await page.goto('http://localhost:49152/ducky/')
  await page.getByRole('combobox', { name: 'Care to pick a default bang?' }).click()
  await page.getByRole('combobox', { name: 'Care to pick a default bang?' }).fill('brave')
  await page.getByRole('combobox', { name: 'Care to pick a default bang?' }).press('Enter')
  await page.getByRole('button', { name: 'Apply' }).click()
  await page.getByRole('button', { name: 'Copy' }).click()
  const baseUrl = new URL(page.url())
  baseUrl.searchParams.set('q', searchTerm)
  baseUrl.searchParams.set('default_bang', 'brave')
  await page.goto(baseUrl.toString())
  expect(page.url()).toBe('http://localhost:49152/ducky/?q=test&default_bang=brave')
})
