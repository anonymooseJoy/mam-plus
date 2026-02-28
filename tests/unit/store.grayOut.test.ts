import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('GrayOutStorePurchases', () => {
    it("disables synthetic store purchases that the user can't buy", async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                grayOutStorePurchases: true,
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/store.html', 'utf8'),
            url: 'https://www.myanonamouse.net/store.php',
        });

        await waitFor(50);

        const vipButton = document.querySelector(
            '.vipStatusContent button[value="4"]'
        ) as HTMLButtonElement;
        const cheeseButton = document.querySelector(
            '.cheeseContent button'
        ) as HTMLButtonElement;
        const expensivePointsButton = document.querySelector(
            '.pointsContent button[value="expensive"]'
        ) as HTMLButtonElement;
        const affordableButton = document.querySelector(
            '.pointsContent button[value="ok"]'
        ) as HTMLButtonElement;

        expect(vipButton.disabled).toBe(true);
        expect(vipButton.title).toContain('Eternal VIP cannot buy more VIP');
        expect(cheeseButton.disabled).toBe(true);
        expect(cheeseButton.title).toContain('Not enough cheese');
        expect(expensivePointsButton.disabled).toBe(true);
        expect(expensivePointsButton.title).toContain('Not enough bonus points');
        expect(affordableButton.disabled).toBe(false);
        expect(
            document.querySelector('.vipStatusContent')?.classList.contains(
                'mp_store_disabled_section'
            )
        ).toBe(true);
    });
});
