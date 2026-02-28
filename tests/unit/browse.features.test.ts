import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('Browse features', () => {
    it('adds bookmark override, filetype picker, clickable tags, and hides bookmarked rows when toggled', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                bookmarkIcons: true,
                buildTags: true,
                filetypeSearchFilter: true,
                mp_version: '4.4.2',
                toggleBookmarked: true,
            },
            html: readFileSync('tests/fixtures/browse.html', 'utf8'),
            url: 'https://www.myanonamouse.net/tor/browse.php',
        });

        await waitFor(50);

        expect(document.body.classList.contains('mp_bookmarkOverride')).toBe(true);

        const toggle = document.querySelector(
            '#mp_filetypeSearchToggle'
        ) as HTMLElement | null;
        expect(toggle).not.toBeNull();
        toggle!.click();

        const pdfCheckbox = document.querySelector(
            '#mp_filetypeSearchPanel input[value="pdf"]'
        ) as HTMLInputElement | null;
        expect(pdfCheckbox).not.toBeNull();
        pdfCheckbox!.checked = true;
        pdfCheckbox!.dispatchEvent(
            new pdfCheckbox!.ownerDocument.defaultView!.Event('change', {
                bubbles: true,
            })
        );

        const queryInput = document.querySelector('#torTitle') as HTMLInputElement;
        expect(queryInput.value).toContain('@filetype{pdf}');

        const bookmarkedToggle = document.querySelector(
            '#mp_bookmarkedToggle'
        ) as HTMLElement | null;
        expect(bookmarkedToggle).not.toBeNull();
        bookmarkedToggle!.click();

        const bookmarkedRow = document.querySelector('#tdr1') as HTMLTableRowElement;
        const unbookmarkedRow = document.querySelector('#tdr2') as HTMLTableRowElement;
        expect(bookmarkedRow.style.display).toBe('none');
        expect(unbookmarkedRow.style.display).toBe('table-row');

        const tagLinks = Array.from(document.querySelectorAll('#tdr1 .mp_tags .mp_tag'));
        expect(tagLinks.map((link) => link.textContent)).toEqual([
            'space opera',
            'aliens',
            'fleet battles',
        ]);
        expect((document.querySelector('#tdr1 .torRowDesc') as HTMLElement).style.display).toBe(
            'none'
        );
        expect(document.querySelector('#tdr1 .mp_tags + br')).toBeNull();
    });

    it('syncs checkbox state from an existing @filetype token in the query', async () => {
        const browseHtml = readFileSync('tests/fixtures/browse.html', 'utf8').replace(
            'value="space opera"',
            'value="space opera @filetype{pdf|m4b}"'
        );
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                filetypeSearchFilter: true,
                mp_version: '4.4.2',
            },
            html: browseHtml,
            url: 'https://www.myanonamouse.net/tor/browse.php',
        });

        expect(
            (document.querySelector(
                '#mp_filetypeSearchPanel input[value="pdf"]'
            ) as HTMLInputElement).checked
        ).toBe(true);
        expect(
            (document.querySelector(
                '#mp_filetypeSearchPanel input[value="m4b"]'
            ) as HTMLInputElement).checked
        ).toBe(true);
        expect(
            (document.querySelector(
                '#mp_filetypeSearchPanel input[value="epub"]'
            ) as HTMLInputElement).checked
        ).toBe(false);
    });

    it('does not add the bookmark override class when the feature is disabled', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                bookmarkIcons: false,
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/browse.html', 'utf8'),
            url: 'https://www.myanonamouse.net/tor/browse.php',
        });

        expect(document.body.classList.contains('mp_bookmarkOverride')).toBe(false);
    });

    it('adds a mass-actions multi-select toolbar and limits bulk actions to selected rows', async () => {
        const openedUrls: string[] = [];
        const { document } = await loadUserscriptInJsdom({
            beforeEval(window) {
                window.open = ((url?: string | URL) => {
                    openedUrls.push(String(url));
                    return null;
                }) as typeof window.open;

                window.document.querySelectorAll('.directDownload').forEach((link, index) => {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        const row = window.document.querySelector(`#tdr${index + 1}`) as HTMLElement;
                        row.dataset.downloaded = 'true';
                    });
                });

                const bookmarkLink = window.document.querySelector('#torBookmark2') as HTMLElement;
                bookmarkLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    bookmarkLink.setAttribute('data-bookmarked', 'true');
                });
            },
            gmValues: {
                mp_version: '4.4.2',
                multiSelectBrowse: true,
            },
            html: readFileSync('tests/fixtures/browse.html', 'utf8'),
            url: 'https://www.myanonamouse.net/tor/browse.php',
        });

        await waitFor(50);

        const toolbar = document.querySelector('#massActions #mp_multiSelectToolbar') as HTMLElement;
        expect(toolbar).not.toBeNull();
        expect(toolbar.className).toContain('mp_multiSelectToolbar_massActions');
        expect(document.querySelectorAll('#ssr .mp_multiSelectBox')).toHaveLength(2);

        (document.querySelector('#tdr1 .mp_multiSelectBox') as HTMLInputElement).checked = true;
        (document.querySelector('#tdr2 .mp_multiSelectBox') as HTMLInputElement).checked = true;

        (document.querySelector('#mp_multiSelectOpen') as HTMLElement).click();
        expect(openedUrls).toEqual([
            'https://www.myanonamouse.net/t/1',
            'https://www.myanonamouse.net/t/2',
        ]);

        (document.querySelector('#tdr1 .mp_multiSelectBox') as HTMLInputElement).checked = false;

        (document.querySelector('#mp_multiSelectDownload') as HTMLElement).click();
        (document.querySelector('#mp_multiSelectBookmark') as HTMLElement).click();

        expect((document.querySelector('#tdr1') as HTMLElement).dataset.downloaded).toBeUndefined();
        expect((document.querySelector('#tdr2') as HTMLElement).dataset.downloaded).toBe('true');
        expect(
            (document.querySelector('#torBookmark2') as HTMLElement).getAttribute('data-bookmarked')
        ).toBe('true');
    });
});
