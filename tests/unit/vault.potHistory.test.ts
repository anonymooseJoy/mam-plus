import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom } from '../helpers/userscriptHarness';

describe('PotHistory', () => {
    it('replaces stale donation history even when the donate form is absent', async () => {
        const potHistoryHtml = readFileSync('tests/fixtures/pot-history.html', 'utf8');
        const { document } = await loadUserscriptInJsdom({
            beforeEval(window) {
                Object.defineProperty(window, 'fetch', {
                    configurable: true,
                    value: async () => ({
                        ok: true,
                        status: 200,
                        statusText: 'OK',
                        text: async () => potHistoryHtml,
                    }),
                });
            },
            gmValues: {
                mp_version: '4.4.2',
                potHistory: true,
            },
            html: readFileSync('tests/fixtures/vault.html', 'utf8'),
            url: 'https://www.myanonamouse.net/millionaires/index.php',
        });

        expect(document.querySelector('#mainBody')?.textContent).toContain(
            'Fresh donation history'
        );
        expect(document.querySelector('#mainBody')?.textContent).not.toContain(
            'Stale donation history'
        );
    });
});
