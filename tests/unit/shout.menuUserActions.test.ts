import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ShoutMenuUserActions', () => {
    it('adds emphasize/block actions to the menu and stores user ids without duplicates', async () => {
        const { document, gmStore } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
                mutedUsers: true,
                mutedUsers_val: '555',
                priorityUsers: true,
                priorityUsers_val: '222',
                shoutMenuUserActions: true,
            },
            html: readFileSync('tests/fixtures/shoutbox.html', 'utf8'),
            url: 'https://www.myanonamouse.net/shoutbox.php',
        });

        await waitFor(25);

        (document.querySelector('.sb_menu') as HTMLElement).click();
        await waitFor(25);

        const emphasize = document.getElementById('mp_sbEmphasize') as HTMLLIElement | null;
        const block = document.getElementById('mp_sbMute') as HTMLLIElement | null;

        expect(emphasize?.textContent).toBe('Emphasize');
        expect(block?.textContent).toBe('Block');

        emphasize!.click();
        block!.click();

        expect(gmStore.get('priorityUsers')).toBe(true);
        expect(gmStore.get('priorityUsers_val')).toBe('222, 123');
        expect(gmStore.get('mutedUsers')).toBe(true);
        expect(gmStore.get('mutedUsers_val')).toBe('555, 123');

        emphasize!.click();
        expect(gmStore.get('priorityUsers_val')).toBe('222, 123');
    });
});
