import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('Torrent external buttons', () => {
    it('still renders book-search buttons when category icons are text-only', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                audibleButton: true,
                goodreadsButton: true,
                mp_version: '4.4.2',
                storyGraphButton: true,
            },
            html: await import('node:fs').then(({ readFileSync }) =>
                readFileSync('tests/fixtures/torrent.html', 'utf8')
            ),
            url: 'https://www.myanonamouse.net/t/123',
        });

        await waitFor(100);

        expect(document.querySelector('.mp_grRow')).not.toBeNull();
        expect(document.querySelector('.mp_auRow')).not.toBeNull();
        expect(document.querySelector('.mp_sgRow')).not.toBeNull();
    });
});
