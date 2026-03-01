import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom } from '../helpers/userscriptHarness';

describe('RatioProtect', () => {
    it('triggers level 3 protection when a trivial ratio loss would fall below the minimum', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
                mp_currentPage: 'torrent',
                ratioProtect: true,
                ratioProtectMin_val: '100',
            },
            html: readFileSync('tests/fixtures/torrent-ratio-protect.html', 'utf8'),
            url: 'https://www.myanonamouse.net/t/123',
        });

        const downloadButton = document.getElementById('tddl') as HTMLAnchorElement | null;
        const label = document.querySelector(
            '#download .torDetInnerTop'
        ) as HTMLDivElement | null;
        const ratioCostRow = document.querySelector('.mp_ratioCostRow');

        expect(downloadButton?.textContent).toBe('FL Needed');
        expect(downloadButton?.style.backgroundColor).toBe('Red');
        expect(downloadButton?.style.backgroundImage).toBe('none');
        expect(downloadButton?.style.color).toBe('White');
        expect(label?.style.fontWeight).toBe('bold');
        expect(label?.textContent).toContain('Ratio loss 0.00');
        expect(ratioCostRow?.textContent).toContain('upload');
    });
});
