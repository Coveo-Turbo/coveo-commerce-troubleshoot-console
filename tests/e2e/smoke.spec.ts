import {expect, test} from '@playwright/test';

test('hosted local harness boots troubleshoot console', async ({page}) => {
  await page.goto('/index.html');

  await expect(page.getByText('Commerce Troubleshoot Console')).toBeVisible();
  await expect(page.locator('[data-control="tracking"]')).toBeVisible();
  await expect(page.locator('[data-field="status"]')).toContainText(/Running|Completed|Request failed|Loading/);
});
