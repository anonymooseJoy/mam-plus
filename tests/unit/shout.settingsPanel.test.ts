import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom, waitFor } from '../helpers/userscriptHarness';

describe('ShoutboxSettings', () => {
    it('renders shoutbox-only settings in the shoutbox and saves changes', async () => {
        const { document, gmStore } = await loadUserscriptInJsdom({
            gmValues: {
                giftButton: true,
                mp_version: '4.4.2',
                priorityUsers: true,
                priorityUsers_val: 'system',
            },
            html: readFileSync('tests/fixtures/shoutbox.html', 'utf8'),
            url: 'https://www.myanonamouse.net/shoutbox.php',
        });

        await waitFor(25);

        const toggle = document.getElementById(
            'mp_shoutSettingsToggle'
        ) as HTMLButtonElement | null;
        expect(toggle?.textContent).toBe('Settings');

        toggle!.click();
        await waitFor(25);

        expect(toggle?.textContent).toBe('Hide Settings');
        expect(document.querySelector('#mp_shoutSettingsPanel h1')?.textContent).toBe(
            'Shoutbox Settings'
        );

        const giftButton = document.getElementById('giftButton') as HTMLInputElement;
        const priorityUsers = document.getElementById('priorityUsers') as HTMLInputElement;
        const mutedUsers = document.getElementById('mutedUsers') as HTMLInputElement;

        expect(giftButton.checked).toBe(true);
        expect(priorityUsers.value).toBe('system');

        giftButton.checked = false;
        mutedUsers.value = 'gardenshade';

        const saveButton = document.getElementById(
            'mp_shoutSettingsSubmit'
        ) as HTMLDivElement | null;
        saveButton!.click();

        expect(gmStore.get('giftButton')).toBe(false);
        expect(gmStore.get('mutedUsers')).toBe(true);
        expect(gmStore.get('mutedUsers_val')).toBe('gardenshade');
    });
});
