import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('Torrent bookmark proxy', () => {
    it('moves the bookmark control next to the title and keeps it in sync', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                moveBookmarkButton: true,
                mp_version: '4.4.2',
            },
            html: await import('node:fs').then(({ readFileSync }) =>
                readFileSync('tests/fixtures/torrent.html', 'utf8')
            ),
            url: 'https://www.myanonamouse.net/t/123',
        });

        await waitFor(100);

        const source = document.querySelector('#torBookmark123') as HTMLAnchorElement;
        const proxy = document.querySelector('#mp_torBookmarkProxy') as HTMLAnchorElement;

        expect(proxy).not.toBeNull();
        expect(source.style.display).toBe('none');
        expect(proxy.textContent).toBe('Bookmark');
        expect(proxy.parentElement).toBe(document.querySelector('.TorrentTitle')!.parentElement);

        const replacement = document.createElement('a');
        replacement.id = 'torDeBookmark123';
        replacement.title = 'Remove bookmark';
        replacement.setAttribute('role', 'button');
        replacement.textContent = 'Remove bookmark';
        source.replaceWith(replacement);
        await waitFor(100);

        expect(proxy.textContent).toBe('Remove bookmark');
        expect(proxy.getAttribute('data-bookmark-state')).toBe('remove');
        expect(
            (document.querySelector('#torDeBookmark123') as HTMLAnchorElement).style.display
        ).toBe('none');
    });
});
