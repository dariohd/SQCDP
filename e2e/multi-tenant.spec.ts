import { test, expect } from '@playwright/test'
import { APP_ROUTES } from '../src/lib/routes'

/**
 * Ces tests couvrent l'isolation par équipe côté client (`getCurrentEquipe` /
 * `filterActionsForEquipe`). En production Supabase, l'isolation multi-tenant
 * réelle est par **site** (`site_id` / `site_members`, migrations 003 + 004) ;
 * le filtre équipe reste un filtre applicatif. Sans projet Supabase de test en CI,
 * on ne peut pas exercer les policies RLS ici : voir docs/MULTI_TENANT.md.
 */

test.describe('Isolation des données par équipe (mode local, sans backend)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_ROUTES.mois)
    await expect(page.getByRole('heading', { name: 'SQCDP' })).toBeVisible()
  })

  test('équipe active par défaut est Ligne 1', async ({ page }) => {
    await expect(page.getByTestId('active-equipe')).toHaveText('Ligne 1')
  })

  test('une action créée sous une équipe est invisible après bascule vers une autre équipe', async ({ page }) => {
    const probleme = `Fuite convoyeur E2E ${Date.now()}`

    // Ouvre le jour courant sur le premier axe (clic centre = jour du jour, cf. DonutChart.onCenterClick)
    await page.locator('canvas').first().click()
    await expect(page.getByRole('heading', { name: /Jour \d+/ })).toBeVisible()

    // Ajoute une action rattachée au jour, donc à l'équipe active (Ligne 1)
    await page.getByRole('button', { name: 'Ajouter' }).first().click()
    await expect(page.getByRole('heading', { name: 'Nouvelle action' })).toBeVisible()
    await page.getByLabel('Problème *').fill(probleme)
    await page.getByLabel('Porteur *').fill('Testeur E2E')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    // Visible côté Ligne 1
    await expect(page.getByText(probleme)).toBeVisible()

    // Bascule vers Ligne 2 via les Paramètres
    await page.getByRole('button', { name: 'Paramètres' }).click()
    await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible()
    await page.getByLabel('Équipe active').selectOption('Ligne 2')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await expect(page.getByTestId('active-equipe')).toHaveText('Ligne 2')
    await expect(page.getByText(probleme)).toHaveCount(0)

    // Retour à Ligne 1 : l'action réapparaît (isolation, pas de perte de donnée)
    await page.getByRole('button', { name: 'Paramètres' }).click()
    await page.getByLabel('Équipe active').selectOption('Ligne 1')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await expect(page.getByTestId('active-equipe')).toHaveText('Ligne 1')
    await expect(page.getByText(probleme)).toBeVisible()
  })
})

test.describe('Paramètres de site', () => {
  test('le champ site est modifiable et persiste après enregistrement', async ({ page }) => {
    await page.goto(APP_ROUTES.mois)
    await expect(page.getByRole('heading', { name: 'SQCDP' })).toBeVisible()

    await page.getByRole('button', { name: 'Paramètres' }).click()
    const siteInput = page.getByLabel('Site')
    await expect(siteInput).toHaveValue('Site principal')

    await siteInput.fill('Site secondaire E2E')
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    await page.getByRole('button', { name: 'Paramètres' }).click()
    await expect(page.getByLabel('Site')).toHaveValue('Site secondaire E2E')
  })
})
