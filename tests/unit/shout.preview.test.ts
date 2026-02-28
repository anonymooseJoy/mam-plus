import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ShoutPreview', () => {
    it('renders shoutbox preview HTML via the site preview endpoint', async () => {
        let previewBody = '';
        const { document, window } = await loadUserscriptInJsdom({
            beforeEval(currentWindow) {
                currentWindow.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
                    previewBody = String(init?.body || '');
                    return {
                        json: async () => ({
                            message: '<strong>Rendered preview</strong>',
                        }),
                    } as Response;
                }) as typeof fetch;
            },
            gmValues: {
                mp_version: '4.4.2',
                shoutPreview: true,
            },
            html: readFileSync('tests/fixtures/shoutbox.html', 'utf8'),
            url: 'https://www.myanonamouse.net/shoutbox.php',
        });

        const input = document.getElementById('shbox_text') as HTMLInputElement;
        input.value = '[b]Hello[/b]';
        input.dispatchEvent(
            new window.Event('input', {
                bubbles: true,
            })
        );

        const previewButton = document.getElementById(
            'mp_shoutPreviewBtn'
        ) as HTMLButtonElement | null;
        expect(previewButton).not.toBeNull();
        previewButton!.click();

        await waitFor(25);

        expect(previewBody).toContain('messageToTest=%5Bb%5DHello%5B%2Fb%5D');
        expect(document.querySelector('#mp_shoutPreview strong')?.textContent).toBe(
            'Rendered preview'
        );
    });
});
