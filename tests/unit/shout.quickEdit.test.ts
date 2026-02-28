import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('QuickEditShout', () => {
    it('shows the Ctrl+Up hint and opens the newest editable shout in the site edit UI', async () => {
        const { document, window } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
                quickEditShout: true,
            },
            html: readFileSync('tests/fixtures/shoutbox.html', 'utf8'),
            url: 'https://www.myanonamouse.net/shoutbox.php',
        });

        await waitFor(25);

        const hint = document.getElementById('mp_quickEditShoutHint');
        expect(hint?.textContent).toBe('Press Ctrl+Up to edit your last shout');

        const input = document.getElementById('shbox_text') as HTMLInputElement;
        input.focus();
        input.dispatchEvent(
            new window.KeyboardEvent('keydown', {
                bubbles: true,
                ctrlKey: true,
                key: 'ArrowUp',
            })
        );
        await waitFor(25);

        expect((window as Window & typeof globalThis & { __mpEditedShoutId?: string }).__mpEditedShoutId).toBe(
            '250'
        );
        expect(document.getElementById('sbEditOverlay')?.classList.contains('hideMe')).toBe(
            false
        );
    });
});
