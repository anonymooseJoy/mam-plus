import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('HoverShoutUserPosts', () => {
    it('temporarily highlights all visible shouts from the hovered user', async () => {
        const { document, window } = await loadUserscriptInJsdom({
            gmValues: {
                hoverShoutUserPosts: true,
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/shoutbox.html', 'utf8'),
            url: 'https://www.myanonamouse.net/shoutbox.php',
        });

        await waitFor(25);

        const meLink = document.querySelector('#sbid200 a[href="/u/999"]') as HTMLAnchorElement;
        meLink.dispatchEvent(
            new window.MouseEvent('mouseover', {
                bubbles: true,
            })
        );

        expect(document.querySelector('#sbid200 .shoutRow')?.classList.contains('mp_hoverShoutUser')).toBe(
            true
        );
        expect(document.querySelector('#sbid250 .shoutRow')?.classList.contains('mp_hoverShoutUser')).toBe(
            true
        );
        expect(document.querySelector('#sbid100 .shoutRow')?.classList.contains('mp_hoverShoutUser')).toBe(
            false
        );

        const otherLink = document.querySelector(
            '#sbid100 a[href="/u/123"]'
        ) as HTMLAnchorElement;
        meLink.dispatchEvent(
            new window.MouseEvent('mouseout', {
                bubbles: true,
                relatedTarget: otherLink,
            })
        );
        otherLink.dispatchEvent(
            new window.MouseEvent('mouseover', {
                bubbles: true,
            })
        );

        expect(document.querySelector('#sbid200 .shoutRow')?.classList.contains('mp_hoverShoutUser')).toBe(
            false
        );
        expect(document.querySelector('#sbid250 .shoutRow')?.classList.contains('mp_hoverShoutUser')).toBe(
            false
        );
        expect(document.querySelector('#sbid100 .shoutRow')?.classList.contains('mp_hoverShoutUser')).toBe(
            true
        );
    });
});
