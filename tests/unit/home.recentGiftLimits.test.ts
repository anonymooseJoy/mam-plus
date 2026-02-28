import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom } from '../helpers/userscriptHarness';

describe('GiftNewest recent gift limits', () => {
    it('marks users who have already hit the daily gift cap today', async () => {
        const today = new Date().toISOString().split('T')[0];
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                giftNewest: true,
                mp_lastNewGifted: '',
                mp_recentPointGifts: JSON.stringify([
                    {
                        amount: 1000,
                        userID: '103',
                        utcDate: today,
                    },
                ]),
                mp_version: '4.4.2',
                userGiftDefault_val: '50',
            },
            html: readFileSync('tests/fixtures/new-users.html', 'utf8'),
            url: 'https://www.myanonamouse.net/newUsers.php',
        });

        const cappedUser = document.querySelector('.blockCon a[href="/u/103"]');

        expect(cappedUser?.textContent).toContain('✅');
        expect(cappedUser?.getAttribute('title')).toBe(
            'Maximum daily points already sent today'
        );
    });
});
