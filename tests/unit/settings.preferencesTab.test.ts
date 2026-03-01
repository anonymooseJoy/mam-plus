import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadUserscriptInJsdom } from '../helpers/userscriptHarness';

describe('Preferences MAM+ tab', () => {
    it('adds a MAM+ tab link without rendering the settings table on native preference views', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/preferences.html', 'utf8'),
            url: 'https://www.myanonamouse.net/preferences/index.php?view=general',
        });

        const mamPlusCell = Array.from(document.querySelectorAll('td.torSearchNavBox')).find(
            (cell) => cell.textContent?.trim() === 'MAM+'
        ) as HTMLTableCellElement | undefined;

        expect(mamPlusCell?.textContent?.trim()).toBe('MAM+');
        expect(document.querySelector('.mp_settingsHost')).toBeNull();
        expect(document.getElementById('nativeSettingsTitle')).not.toBeNull();
    });

    it('renders MAM+ settings in a dedicated tab and hides the native settings content', async () => {
        const { document } = await loadUserscriptInJsdom({
            gmValues: {
                mp_version: '4.4.2',
            },
            html: readFileSync('tests/fixtures/preferences.html', 'utf8'),
            url: 'https://www.myanonamouse.net/preferences/index.php?view=mamplus',
        });

        const mamPlusCell = Array.from(document.querySelectorAll('td.torSearchNavBox')).find(
            (cell) => cell.textContent?.trim() === 'MAM+'
        ) as HTMLTableCellElement | undefined;
        const settingsHost = document.querySelector('.mp_settingsHost') as HTMLDivElement | null;
        const nativeTitle = document.getElementById('nativeSettingsTitle') as HTMLElement | null;
        const nativeForm = document.getElementById('prefForm') as HTMLElement | null;

        expect(mamPlusCell?.className).toContain('row1');
        expect(settingsHost?.querySelector('h1')?.textContent).toBe('MAM+ Settings');
        expect(settingsHost?.querySelector('#mp_submit')?.textContent).toBe('Save M+ Settings');
        expect(nativeTitle?.style.display).toBe('none');
        expect(nativeForm?.style.display).toBe('none');
    });
});
