import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ToggleHiddenRequesters', () => {
    it('shows the number of currently hidden requesters in the toggle label', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
                toggleHiddenRequesters: true,
            },
            html: readFileSync('tests/fixtures/request.html', 'utf8'),
            url: 'https://www.myanonamouse.net/tor/requests2.php',
        });

        await waitFor(50);

        const toggle = document.querySelector('#mp_showHidden') as HTMLDivElement;
        expect(toggle.innerText).toBe('Show Hidden (2 hidden)');
        expect((document.querySelector('#req2') as HTMLLIElement).style.display).toBe('none');

        toggle.click();

        expect(toggle.innerText).toBe('Hide Hidden');
        expect((document.querySelector('#req2') as HTMLLIElement).style.display).toBe(
            'list-item'
        );
    });
});
