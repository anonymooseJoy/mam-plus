import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ForumUserFilters', () => {
    it('applies emphasized and muted user styling to forum posts', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                forumUserFilters: true,
                mp_currentPage: 'forum thread',
                mp_version: '4.4.2',
                mutedUsers: true,
                mutedUsers_val: '400',
                priorityUsers: true,
                priorityUsers_val: '200',
            },
            html: readFileSync('tests/fixtures/forum-thread.html', 'utf8'),
            url: 'https://www.myanonamouse.net/f/t/999',
        });

        await waitFor(25);

        expect(
            document.querySelector('a[name="1001"] + .coltable')?.classList.contains(
                'mp_forumPriorityUser'
            )
        ).toBe(true);
        expect(
            document.querySelector('a[name="1004"] + .coltable')?.classList.contains(
                'mp_forumPriorityUser'
            )
        ).toBe(true);
        expect(
            document.querySelector('a[name="1002"] + .coltable')?.classList.contains(
                'mp_forumPriorityUser'
            )
        ).toBe(false);

        expect(
            document.querySelector('a[name="1003"] + .coltable .forumText')?.classList.contains(
                'mp_muted'
            )
        ).toBe(true);
        expect(
            document.querySelector('a[name="1001"] + .coltable .forumText')?.classList.contains(
                'mp_muted'
            )
        ).toBe(false);
    });
});
