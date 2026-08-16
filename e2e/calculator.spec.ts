import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('calculates and explains a complete bilingual estimate without Axe violations', async ({
  page,
}) => {
  await page.goto('./');

  await expect(
    page.getByRole('heading', { name: 'Stipendio netto a Milano' }),
  ).toBeVisible();
  await page
    .getByRole('textbox', { name: /retribuzione annua lorda/i })
    .fill('40.000');
  await page.getByRole('combobox', { name: /mensilità/i }).click();
  await page.getByRole('option', { name: '14' }).click();
  await page.getByRole('button', { name: 'Calcola' }).click();

  const result = page.getByRole('region', { name: /risultato della stima/i });
  await expect(result).toBeFocused();
  await expect(page.getByTestId('annual-net')).toContainText('27.960,25');
  await expect(result).toContainText('Netto annuo ÷ 14 mensilità');

  await page.getByText('Come abbiamo calcolato').click();
  await expect(result).toContainText('Reddito imponibile IRPEF');
  await expect(result).toContainText('Addizionali Lombardia e Milano');

  await page.getByRole('button', { name: 'English' }).click();
  await expect(
    page.getByRole('heading', { name: 'Net salary in Milan' }),
  ).toBeVisible();
  const englishResult = page.getByRole('region', { name: /estimate result/i });
  await expect(englishResult).toContainText('Estimated annual net');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test('works by keyboard at 320px without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('./');

  const input = page.getByRole('textbox', {
    name: /retribuzione annua lorda/i,
  });
  await input.focus();
  await page.keyboard.type('30000');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('combobox', { name: /mensilità/i }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Calcola' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(
    page.getByRole('region', { name: /risultato della stima/i }),
  ).toBeFocused();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
