import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom } from '../helpers/userscriptHarness';

describe('CurrentlyReading', () => {
    it('creates a plain textarea with mceNoEditor and the expected snippet', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                currentlyReading: true,
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/torrent.html', 'utf8'),
            url: 'https://www.myanonamouse.net/t/123',
        });

        const textarea = document.querySelector(
            '.mp_crRow textarea.mceNoEditor'
        ) as HTMLTextAreaElement | null;

        expect(textarea).not.toBeNull();
        expect(textarea?.value).toContain('[url=/t/123]Synthetic Book[/url]');
        expect(textarea?.value).toContain(
            '[url=/a/11]Author One[/url], [url=/a/12]Author Two[/url], [url=/a/13]Author Three[/url], etc.'
        );
    });
});
