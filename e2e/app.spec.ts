import { test, expect } from '@playwright/test'

test('dashboard loads with SQCDP title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'SQCDP' })).toBeVisible()
})

test('navigation to analytics', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pilotage' }).click()
  await expect(page.getByText('Pilotage & Analytics')).toBeVisible()
})

test('week view loads', async ({ page }) => {
  await page.goto('/semaine')
  await expect(page.getByText(/Semaine du/)).toBeVisible()
})
