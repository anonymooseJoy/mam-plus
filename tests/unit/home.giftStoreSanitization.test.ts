import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom } from '../helpers/userscriptHarness';

describe('Gift store sanitization', () => {
    it('drops stale and malformed recent point-gift entries during feature init', async () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
        const { gmStore } = await loadUserscriptInJsdom({
            gmValues: {
                giftNewest: true,
                mp_lastNewGifted: '',
                mp_recentPointGifts: JSON.stringify([
                    { amount: 100, userID: '101', utcDate: yesterday },
                    { amount: 'oops', userID: '102', utcDate: today },
                    { amount: 75, userID: '103', utcDate: today },
                ]),
                mp_version: '4.4.2',
                userGiftDefault_val: '50',
            },
            html: readFileSync('tests/fixtures/new-users.html', 'utf8'),
            url: 'https://www.myanonamouse.net/newUsers.php',
        });

        expect(gmStore.get('mp_recentPointGifts')).toBe(
            JSON.stringify([{ amount: 75, userID: '103', utcDate: today }])
        );
    });
});
