import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('QuickShout', () => {
    it('moves into the fullscreen shoutbox and back out when fullscreen is toggled', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
                quickShout: true,
            },
            html: readFileSync('tests/fixtures/quick-shout.html', 'utf8'),
            url: 'https://www.myanonamouse.net/',
        });

        await waitFor(50);

        expect(document.querySelector('#fpShout > #mp_blockFoot')).not.toBeNull();
        expect(document.querySelector('#fpShout > #mp_blockFoot #mp_comboBoxInput')).not.toBeNull();

        const shoutbox = document.getElementById('shoutbox') as HTMLElement;
        shoutbox.style.position = 'fixed';
        shoutbox.style.inset = '0px';

        await waitFor(50);

        expect(document.querySelector('#sbNotifs > #mp_quickShoutRoot')).not.toBeNull();
        expect(document.querySelector('#sbNotifs #mp_comboBoxInput')).not.toBeNull();
        expect(document.querySelector('#fpShout > #mp_blockFoot')).toBeNull();

        shoutbox.style.position = '';
        shoutbox.style.inset = '';

        await waitFor(50);

        expect(document.querySelector('#fpShout > #mp_blockFoot')).not.toBeNull();
        expect(document.querySelector('#fpShout > #mp_blockFoot #mp_comboBoxInput')).not.toBeNull();
    });
});
