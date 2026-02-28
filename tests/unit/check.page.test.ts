import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom } from '../helpers/userscriptHarness';

describe('Check.page', () => {
    it('recognizes the store page', async () => {
        const { window } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
            },
            html: '<!doctype html><html><head><link rel="stylesheet" href="https://cdn.example.com/ICGstation.css"></head><body><div id="mainTable"></div></body></html>',
            url: 'https://www.myanonamouse.net/store.php',
        });

        expect((window as any).GM_getValue('mp_currentPage')).toBe('store');
    });

    it('recognizes the freeleech page', async () => {
        const { window } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
            },
            html: '<!doctype html><html><head><link rel="stylesheet" href="https://cdn.example.com/ICGstation.css"></head><body><div id="mainBody"><div id="fl_cat_1"></div></div></body></html>',
            url: 'https://www.myanonamouse.net/freeleech.php',
        });

        expect((window as any).GM_getValue('mp_currentPage')).toBe('freeleech');
    });
});
