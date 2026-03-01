import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('GiftNewest', () => {
    it('selects the maximum affordable ungifted users on the synthetic new-users page', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                giftNewest: true,
                mp_lastNewGifted: '102',
                mp_version: '4.4.2',
                userGiftDefault_val: '50',
            },
            html: await import('node:fs').then(({ readFileSync }) =>
                readFileSync('tests/fixtures/new-users.html', 'utf8')
            ),
            url: 'https://www.myanonamouse.net/newUsers.php',
        });

        await waitFor(50);

        const selectMaxButton = document.querySelector(
            '#mp_mp_selectMaxUngifted'
        ) as HTMLButtonElement | null;
        expect(selectMaxButton).not.toBeNull();

        selectMaxButton!.dispatchEvent(
            new document.defaultView!.MouseEvent('click', { bubbles: true })
        );

        const checkboxes = Array.from(
            document.querySelectorAll('#newUsersList input[type="checkbox"]')
        ) as HTMLInputElement[];
        const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
        const giftedMember = document.querySelector(
            '#newUsersList a[href="/u/102"]'
        ) as HTMLAnchorElement | null;

        expect(checkedCount).toBe(5);
        expect(giftedMember?.classList.contains('mp_gifted')).toBe(true);
        expect(
            (document.querySelector('#newUsersList a[href="/u/102"]') as HTMLAnchorElement)
                .textContent
        ).toContain('✅');
    });

    it('falls back to the user-menu bonus link when top-bar points are hidden', async () => {
        const html = await import('node:fs').then(({ readFileSync }) =>
            readFileSync('tests/fixtures/new-users.html', 'utf8')
        );
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                giftNewest: true,
                mp_lastNewGifted: '',
                mp_version: '4.4.2',
                userGiftDefault_val: '50',
            },
            html: html
                .replace('<a id="tmBP" href="/store.php">Bonus: 250</a>', '')
                .replace(
                    '<a href="/preferences/index.php">Preferences</a>',
                    '<a href="/preferences/index.php">Preferences</a><a id="bonusLink" href="/store.php">Bonus: 250</a>'
                ),
            url: 'https://www.myanonamouse.net/newUsers.php',
        });

        await waitFor(50);

        const availablePoints = document.querySelector('#mp_giftAllMsg');
        const selectMaxButton = document.querySelector(
            '#mp_mp_selectMaxUngifted'
        ) as HTMLButtonElement | null;

        expect(availablePoints?.textContent).toContain('250');

        selectMaxButton!.dispatchEvent(
            new document.defaultView!.MouseEvent('click', { bubbles: true })
        );

        const checkboxes = Array.from(
            document.querySelectorAll('#newUsersList input[type="checkbox"]')
        ) as HTMLInputElement[];
        const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;

        expect(checkedCount).toBe(5);
    });
});
