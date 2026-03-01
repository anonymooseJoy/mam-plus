import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('WorldCatButtonReq', () => {
    it('adds WorldCat request-detail buttons with title, author, and series searches', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
                mp_currentPage: 'request details',
                worldCatButtonReq: true,
            },
            html: readFileSync('tests/fixtures/request-details.html', 'utf8'),
            url: 'https://www.myanonamouse.net/t/r/123',
        });

        await waitFor(25);

        const row = document.querySelector('.mp_wcRow');
        const links = Array.from(
            document.querySelectorAll('.mp_wcRow .mp_button_clone')
        ) as HTMLAnchorElement[];

        expect(row?.closest('.torDetRow')?.querySelector('.torDetLeft')?.textContent).toBe(
            'Search WorldCat'
        );
        expect(links.map((link) => link.textContent)).toEqual([
            'Title + Author',
            'Title',
            'Author',
            'Series',
        ]);
        expect(links[0]?.href).toBe(
            'https://search.worldcat.org/search?q=The%20Long%20Way%20to%20a%20Small%2C%20Angry%20Planet%20Becky%20Chambers'
        );
        expect(links[3]?.href).toBe(
            'https://search.worldcat.org/search?q=Wayfarers'
        );
    });
});
