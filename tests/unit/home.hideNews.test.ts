import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('HideNews', () => {
    it('removes the home-page disclaimer while tidying the homepage', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                hideNews: true,
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/home.html', 'utf8'),
            url: 'https://www.myanonamouse.net/',
        });

        await waitFor(50);

        expect(document.querySelector('#mainBody .fpTime')).toBeNull();
        expect(document.querySelector('#disclaimerBlock')).toBeNull();
        expect(document.querySelector('#otherBlock')).not.toBeNull();
        expect((document.querySelector('.mainPageNewsHead') as HTMLElement).style.fontSize).toBe(
            '2em'
        );
    });
});
