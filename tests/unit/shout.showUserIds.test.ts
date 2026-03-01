import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ShowShoutUID', () => {
    it('appends inline user IDs after shoutbox usernames', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
                showShoutUID: true,
            },
            html: readFileSync('tests/fixtures/shoutbox.html', 'utf8'),
            url: 'https://www.myanonamouse.net/shoutbox.php',
        });

        await waitFor(100);

        expect(document.querySelector('#sbid100 .mp_shoutUid')?.textContent).toBe(' [123]');
        expect(document.querySelector('#sbid200 .mp_shoutUid')?.textContent).toBe(' [999]');
        expect(document.querySelectorAll('.mp_shoutUid')).toHaveLength(3);
    });
});
