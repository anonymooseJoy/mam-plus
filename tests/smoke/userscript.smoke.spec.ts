import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

import { installGMStubs, loadFixturePage, loadUserscript } from '../helpers/playwright';

test('new users synthetic page exposes max-ungifted selection', async ({ page }) => {
    await installGMStubs(page, {
        giftNewest: true,
        mp_lastNewGifted: '102',
        mp_version: '4.4.2',
        userGiftDefault_val: '50',
    });
    await loadFixturePage(page, '/newUsers.php', 'tests/fixtures/new-users.html');
    await loadUserscript(page);

    await expect(page.locator('#mp_mp_selectMaxUngifted')).toBeVisible();
    await page.locator('#mp_mp_selectMaxUngifted').click();

    await expect(page.locator('.blockCon input[type="checkbox"]:checked')).toHaveCount(5);
    await expect(page.locator('.blockCon a[href="/u/102"]')).toContainText('✅');
});

test('freeleech synthetic page collapses and expands sections', async ({ page }) => {
    await installGMStubs(page, {
        collapseFreeleechSections: true,
        mp_version: '4.4.2',
    });
    await loadFixturePage(page, '/freeleech.php', 'tests/fixtures/freeleech.html');
    await loadUserscript(page);

    await expect(page.locator('.mp_fl_toolbar')).toBeVisible();
    await expect(page.locator('#fl_cat_audio_1 .torrent').first()).toBeHidden();

    await page.locator('#fl_cat_audio_1 .mp_fl_toggle').click();
    await expect(page.locator('#fl_cat_audio_1 .torrent').first()).toBeVisible();
    await expect(page.locator('#fl_cat_audio_1 .mp_fl_toggle')).toHaveText('Hide');
});

test('browse synthetic page applies bookmark and filetype helpers', async ({ page }) => {
    await installGMStubs(page, {
        bookmarkIcons: true,
        buildTags: true,
        filetypeSearchFilter: true,
        multiSelectBrowse: true,
        mp_version: '4.4.2',
        toggleBookmarked: true,
    });
    await loadFixturePage(page, '/tor/browse.php', 'tests/fixtures/browse.html');
    await loadUserscript(page);

    await expect(page.locator('body')).toHaveClass(/mp_bookmarkOverride/);
    await expect(page.locator('#massActions #mp_multiSelectToolbar')).toBeVisible();
    await expect(page.locator('#ssr .mp_multiSelectBox')).toHaveCount(2);
    await page.locator('#massActions #mp_multiSelectAll').click();
    await expect(page.locator('#ssr .mp_multiSelectBox:checked')).toHaveCount(2);

    await page.locator('#mp_filetypeSearchToggle').click();
    await page.locator('#mp_filetypeSearchPanel input[value="pdf"]').check();
    await expect(page.locator('#torTitle')).toHaveValue(/@filetype\{pdf\}/);

    await page.locator('#mp_bookmarkedToggle').click();
    await expect(page.locator('#tdr1')).toBeHidden();
    await expect(page.locator('#tdr2')).toBeVisible();
    await expect(page.locator('#tdr1 .mp_tags .mp_tag')).toHaveCount(3);
    await expect(page.locator('#tdr1 .torRowDesc')).toBeHidden();
});

test("store synthetic page disables purchases the user can't afford", async ({ page }) => {
    await installGMStubs(page, {
        grayOutStorePurchases: true,
        mp_version: '4.4.2',
    });
    await loadFixturePage(page, '/store.php', 'tests/fixtures/store.html');
    await loadUserscript(page);

    await expect(page.locator('.vipStatusContent button[value="4"]')).toBeDisabled();
    await expect(page.locator('.cheeseContent button')).toBeDisabled();
    await expect(page.locator('.pointsContent button[value="expensive"]')).toBeDisabled();
    await expect(page.locator('.pointsContent button[value="ok"]')).toBeEnabled();
});

test('shoutbox synthetic page retries gift with a lower amount', async ({ page }) => {
    const requestedAmounts: string[] = [];

    await page.route('https://www.myanonamouse.net/json/bonusBuy.php**', async (route) => {
        const url = new URL(route.request().url());
        const amount = url.searchParams.get('amount') || '';
        requestedAmounts.push(amount);

        if (amount === '500') {
            await route.fulfill({
                body: JSON.stringify({
                    success: false,
                    error: 'User can only receive 125 points today',
                }),
                contentType: 'application/json; charset=utf-8',
            });
            return;
        }

        await route.fulfill({
            body: JSON.stringify({
                success: true,
            }),
            contentType: 'application/json; charset=utf-8',
        });
    });

    await installGMStubs(page, {
        giftButton: true,
        mp_recentPointGifts: '[]',
        mp_version: '4.4.2',
        userGiftDefault_val: '500',
    });
    await loadFixturePage(page, '/shoutbox.php', 'tests/fixtures/shoutbox.html');
    await loadUserscript(page);

    await page.locator('.sb_menu').click();
    await expect(page.locator('#giftButton button')).toBeVisible();
    await page.locator('#giftButton button').click();

    await expect(page.locator('#mp_giftStatusElem')).toContainText(
        'Points Gift Successful: Value: 125 (adjusted from 500)'
    );
    expect(requestedAmounts).toEqual(['500', '125']);
});

test('torrent synthetic page keeps Currently Reading as a plain textarea', async ({
    page,
}) => {
    await installGMStubs(page, {
        currentlyReading: true,
        mp_version: '4.4.2',
    });
    await loadFixturePage(page, '/t/123', 'tests/fixtures/torrent.html');
    await loadUserscript(page);

    await expect(page.locator('.mp_crRow textarea.mceNoEditor')).toBeVisible();
    await expect(page.locator('.mp_crRow textarea')).toHaveValue(/Synthetic Book/);
});

test('vault synthetic page replaces stale donation history without a donate form', async ({
    page,
}) => {
    await page.route('https://www.myanonamouse.net/millionaires/pot.php', async (route) => {
        await route.fulfill({
            body: readFileSync('tests/fixtures/pot-history.html', 'utf8'),
            contentType: 'text/html; charset=utf-8',
        });
    });

    await installGMStubs(page, {
        mp_version: '4.4.2',
        potHistory: true,
    });
    await loadFixturePage(page, '/millionaires/index.php', 'tests/fixtures/vault.html');
    await loadUserscript(page);

    await expect(page.locator('#mainBody')).toContainText('Fresh donation history');
    await expect(page.locator('#mainBody')).not.toContainText('Stale donation history');
});
