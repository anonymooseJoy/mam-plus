import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ForumMarkRead', () => {
    it('adds mark-read buttons for forum rows on the overview page', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                forumMarkRead: true,
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/forums-overview.html', 'utf8'),
            url: 'https://www.myanonamouse.net/f',
        });

        await waitFor(25);

        const tipsButton = document.getElementById(
            'mp_forumMarkRead_39'
        ) as HTMLAnchorElement | null;
        const bugButton = document.getElementById(
            'mp_forumMarkRead_78'
        ) as HTMLAnchorElement | null;

        expect(tipsButton?.textContent).toBe('Mark Read');
        expect(tipsButton?.href).toBe(
            'https://www.myanonamouse.net/f/b/39&markRead=true'
        );
        expect(bugButton?.href).toBe(
            'https://www.myanonamouse.net/f/b/78&markRead=true'
        );
    });
});
