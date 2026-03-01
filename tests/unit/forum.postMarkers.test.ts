import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ForumPostMarkers', () => {
    it('marks OP and staff posts in forum threads', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                forumPostMarkers: true,
                mp_currentPage: 'forum thread',
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/forum-thread.html', 'utf8'),
            url: 'https://www.myanonamouse.net/f/t/999',
        });

        await waitFor(25);

        expect(
            document.querySelector('a[name="1001"] + .coltable .mp_forumPostMarker_op')?.textContent
        ).toBe('OP');
        expect(
            document.querySelector('a[name="1002"] + .coltable .mp_forumPostMarker_staff')
                ?.textContent
        ).toBe('Staff');
        expect(
            document.querySelector('a[name="1003"] + .coltable .mp_forumPostMarker_staff')
                ?.textContent
        ).toBe('Staff');
        expect(
            document.querySelector('a[name="1004"] + .coltable .mp_forumPostMarker_op')?.textContent
        ).toBe('OP');
    });
});
