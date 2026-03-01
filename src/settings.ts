/// <reference path="check.ts" />
/// <reference path="util.ts" />
/// <reference path="./modules/core.ts" />

interface SettingsRenderOptions {
    copyId?: string;
    includeCopyPaste?: boolean;
    includeIntro?: boolean;
    saveHint?: string;
    saveId?: string;
    saveText?: string;
    scopes?: SettingGroup[];
    tableClass?: string;
    tableStyle?: string;
    titleText?: string;
}

/**
 * Class for handling settings and the Preferences page
 * @method init: turns features' settings info into a usable table
 */
class Settings {
    private static _defaultOptions: Required<SettingsRenderOptions> = {
        copyId: 'mp_copy',
        includeCopyPaste: true,
        includeIntro: true,
        saveHint: 'Saved!',
        saveId: 'mp_submit',
        saveText: 'Save M+ Settings',
        scopes: [],
        tableClass: 'coltable',
        tableStyle: 'width:100%;min-width:100%;max-width:100%;',
        titleText: 'MAM+ Settings',
    };

    private static _buildIntro() {
        return `<tr><td class="row1" colspan="2"><br><strong>MAM+ v${
            MP.VERSION
        }</strong> - Here you can enable &amp; disable any feature from the <a href="/f/t/41863">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.<br><br>For a detailed look at the available features, <a href="${Util.derefer(
            'https://github.com/gardenshade/mam-plus/wiki/Feature-Overview'
        )}">check the Wiki!</a><br><br></td></tr>`;
    }

    private static _normalizeOptions(
        options: SettingsRenderOptions = {}
    ): Required<SettingsRenderOptions> {
        return {
            ...this._defaultOptions,
            ...options,
        };
    }

    private static _getPreferencesView(): string {
        return new URLSearchParams(window.location.search).get('view') || 'general';
    }

    private static _buildPreferencesTab(active: boolean): HTMLTableCellElement {
        const cell = document.createElement('td');
        const link = document.createElement('a');

        cell.className = `${active ? 'row1' : 'row2'} cen torSearchNavBox`;
        cell.style.display = 'inline-block';
        cell.style.height = '3em';
        cell.style.alignContent = 'center';

        link.href = '/preferences/index.php?view=mamplus';
        link.textContent = 'MAM+';
        cell.appendChild(link);

        return cell;
    }

    private static _injectPreferencesTab(settingNav: HTMLTableElement, active: boolean) {
        const navRow = settingNav.querySelector('tr');
        if (!navRow) {
            return;
        }

        const existingTab = navRow.querySelector(
            'a[href*="/preferences/index.php?view=mamplus"]'
        ) as HTMLAnchorElement | null;
        if (existingTab) {
            return;
        }

        if (active) {
            navRow
                .querySelectorAll('td.torSearchNavBox a[href*="/preferences/index.php?view="]')
                .forEach((link) => {
                    const cell = link.closest('td');
                    if (cell) {
                        cell.classList.remove('row1');
                        cell.classList.add('row2');
                    }
                });
        }

        const mamPlusTab = this._buildPreferencesTab(active);
        const logoutCell = navRow.querySelector(
            'td.torSearchNavBox a[href*="/logout.php"]'
        )?.closest('td');

        if (logoutCell) {
            navRow.insertBefore(mamPlusTab, logoutCell);
        } else {
            navRow.appendChild(mamPlusTab);
        }
    }

    // Function for gathering the needed scopes
    private static _getScopes(
        settings: AnyFeature[],
        scopeFilter?: SettingGroup[]
    ): Promise<SettingGlobObject> {
        if (MP.DEBUG) {
            console.log('_getScopes(', settings, ',', scopeFilter, ')');
        }
        return new Promise((resolve) => {
            const scopeList: SettingGlobObject = {};
            const allowedScopes =
                scopeFilter && scopeFilter.length > 0
                    ? new Set<number>(scopeFilter.map((scope) => Number(scope)))
                    : null;

            for (const setting of settings) {
                const index: number = Number(setting.scope);

                if (allowedScopes && !allowedScopes.has(index)) {
                    continue;
                }

                if (scopeList[index]) {
                    scopeList[index].push(setting);
                } else {
                    scopeList[index] = [setting];
                }
            }
            resolve(scopeList);
        });
    }

    // Function for constructing the table from an object
    private static _buildTable(
        page: SettingGlobObject,
        options: Required<SettingsRenderOptions>
    ): Promise<string> {
        if (MP.DEBUG) console.log('_buildTable(', page, ',', options, ')');
        return new Promise((resolve) => {
            let outp = '<tbody>';

            if (options.includeIntro) {
                outp += this._buildIntro();
            }

            Object.keys(page).forEach((scope) => {
                const scopeNum: number = Number(scope);
                outp += `<tr><td class='row2'>${SettingGroup[scopeNum]}</td><td class='row1'>`;
                Object.keys(page[scopeNum]).forEach((setting) => {
                    const settingNumber: number = Number(setting);
                    const item: AnyFeature = page[scopeNum][settingNumber];

                    const cases = {
                        checkbox: () => {
                            outp += `<input type='checkbox' id='${item.title}' value='true'>${item.desc}<br>`;
                        },
                        textbox: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <input type='text' id='${item.title}' placeholder='${item.placeholder}' class='mp_textInput' size='25'>${item.desc}<br>`;
                        },
                        dropdown: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <select id='${item.title}' class='mp_dropInput'>`;
                            if (item.options) {
                                Object.keys(item.options).forEach((key) => {
                                    outp += `<option value='${key}'>${item.options![key]}</option>`;
                                });
                            }
                            outp += `</select>${item.desc}<br>`;
                        },
                    };
                    if (item.type) cases[item.type]();
                });
                outp += '</td></tr>';
            });

            outp += `<tr><td class="row1" colspan="2"><div id="${options.saveId}" class="mp_settingBtn">${options.saveText}</div>`;
            if (options.includeCopyPaste) {
                outp += `<div id="${options.copyId}" class="mp_settingBtn">Copy Settings</div><div id="mp_inject" class="mp_settingBtn">Paste Settings</div>`;
            }
            outp += `<span class="mp_savestate" style="opacity:0">${options.saveHint}</span></td></tr></tbody>`;

            resolve(outp);
        });
    }

    // Function for retrieving the current settings values
    private static _getSettings(page: SettingGlobObject, root: ParentNode) {
        const allValues: string[] = GM_listValues();
        if (MP.DEBUG) {
            console.log('_getSettings(', page, ')\nStored GM keys:', allValues);
        }
        Object.keys(page).forEach((scope) => {
            Object.keys(page[Number(scope)]).forEach((setting) => {
                const pref = page[Number(scope)][Number(setting)];

                if (MP.DEBUG) {
                    console.log(
                        'Pref:',
                        pref.title,
                        '| Set:',
                        GM_getValue(`${pref.title}`),
                        '| Value:',
                        GM_getValue(`${pref.title}_val`)
                    );
                }

                if (pref !== null && typeof pref === 'object') {
                    const elem = <HTMLInputElement | null>root.querySelector(
                        `#${pref.title}`
                    );
                    if (!elem) {
                        return;
                    }

                    const cases = {
                        checkbox: () => {
                            elem.checked = true;
                        },
                        textbox: () => {
                            const storedValue = GM_getValue(`${pref.title}_val`);
                            elem.value = storedValue ? `${storedValue}` : '';
                        },
                        dropdown: () => {
                            const storedValue = GM_getValue(pref.title);
                            elem.value = storedValue ? `${storedValue}` : '';
                        },
                    };
                    if (cases[pref.type] && GM_getValue(pref.title)) cases[pref.type]();
                }
            });
        });
    }

    private static _setSettings(obj: SettingGlobObject, root: ParentNode) {
        if (MP.DEBUG) console.log(`_setSettings(`, obj, ')');
        Object.keys(obj).forEach((scope) => {
            Object.keys(obj[Number(scope)]).forEach((setting) => {
                const pref = obj[Number(scope)][Number(setting)];

                if (pref !== null && typeof pref === 'object') {
                    const elem = <HTMLInputElement | null>root.querySelector(
                        `#${pref.title}`
                    );
                    if (!elem) {
                        return;
                    }

                    const cases = {
                        checkbox: () => {
                            if (elem.checked) {
                                GM_setValue(pref.title, true);
                            }
                        },
                        textbox: () => {
                            const inp: string = elem.value;

                            if (inp !== '') {
                                GM_setValue(pref.title, true);
                                GM_setValue(`${pref.title}_val`, inp);
                            }
                        },
                        dropdown: () => {
                            GM_setValue(pref.title, elem.value);
                        },
                    };
                    if (cases[pref.type]) cases[pref.type]();
                }
            });
        });
        console.log('[M+] Saved!');
    }

    private static _copySettings(): string {
        const gmList = GM_listValues();
        const outp: [string, string][] = [];

        gmList.map((setting) => {
            if (setting.indexOf('mp_') < 0) {
                outp.push([setting, GM_getValue(setting)]);
            }
        });

        return JSON.stringify(outp);
    }

    private static _pasteSettings(payload: string) {
        if (MP.DEBUG) console.group(`_pasteSettings( )`);
        const settings = JSON.parse(payload);
        settings.forEach((tuple: [string, string][]) => {
            if (tuple[1]) {
                GM_setValue(`${tuple[0]}`, `${tuple[1]}`);
                if (MP.DEBUG) console.log(tuple[0], ': ', tuple[1]);
            }
        });
    }

    // Function that saves the values of the settings table
    private static _saveSettings(
        timer: number,
        obj: SettingGlobObject,
        root: ParentNode,
        saveHint: string
    ) {
        if (MP.DEBUG) console.group(`_saveSettings()`);

        const savestate = <HTMLSpanElement | null>root.querySelector('span.mp_savestate');
        const gmValues: string[] = GM_listValues();

        if (savestate) {
            savestate.style.opacity = '0';
            savestate.textContent = saveHint;
        }
        window.clearTimeout(timer);

        console.log('[M+] Saving...');

        for (const feature in gmValues) {
            if (typeof gmValues[feature] !== 'function') {
                if (!['mp_version', 'style_theme'].includes(gmValues[feature])) {
                    if (gmValues[feature].indexOf('mp_') !== 0) {
                        GM_setValue(gmValues[feature], false);
                    }
                }
            }
        }

        this._setSettings(obj, root);

        if (savestate) {
            savestate.style.opacity = '1';
            try {
                timer = window.setTimeout(() => {
                    savestate.style.opacity = '0';
                }, 2345);
            } catch (e) {
                if (MP.DEBUG) console.warn(e);
            }
        }

        if (MP.DEBUG) console.groupEnd();
    }

    public static async renderInto(
        root: HTMLElement,
        settings: AnyFeature[],
        renderOptions: SettingsRenderOptions = {}
    ) {
        const options = this._normalizeOptions(renderOptions);
        const pageScope = await this._getScopes(settings, options.scopes);
        const wrapper = document.createElement('div');
        const settingTable = document.createElement('table');

        root.innerHTML = '';
        wrapper.className = 'mp_settingsHost';
        settingTable.className = options.tableClass;
        settingTable.setAttribute('cellspacing', '1');
        settingTable.setAttribute('style', options.tableStyle);

        if (options.titleText) {
            const title = document.createElement('h1');
            title.textContent = options.titleText;
            wrapper.appendChild(title);
        }

        settingTable.innerHTML = await this._buildTable(pageScope, options);
        wrapper.appendChild(settingTable);
        root.appendChild(wrapper);
        this._getSettings(pageScope, root);

        const submitBtn = <HTMLDivElement | null>root.querySelector(`#${options.saveId}`);
        const copyBtn = <HTMLDivElement | null>root.querySelector(`#${options.copyId}`);
        const pasteBtn = <HTMLDivElement | null>root.querySelector('#mp_inject');
        let ssTimer: number;

        try {
            submitBtn?.addEventListener(
                'click',
                () => {
                    this._saveSettings(ssTimer, pageScope, root, options.saveHint);
                },
                false
            );

            if (options.includeCopyPaste && pasteBtn && copyBtn) {
                Util.clipboardifyBtn(pasteBtn, this._pasteSettings, false);
                Util.clipboardifyBtn(copyBtn, this._copySettings());
            }
        } catch (err) {
            if (MP.DEBUG) console.warn(err);
        }
    }

    /**
     * Inserts the settings page.
     * @param result Value that must be passed down from `Check.page('settings')`
     * @param settings The array of features to provide settings for
     */
    public static async init(result: boolean, settings: AnyFeature[]) {
        if (result === true) {
            if (MP.DEBUG) {
                console.group(`new Settings()`);
            }

            await Check.elemLoad('#mainBody > table').then(() => {
                if (MP.DEBUG) console.log(`[M+] Starting to build Settings table...`);
                const settingNav = document.querySelector(
                    '#mainBody > table'
                ) as HTMLTableElement | null;
                if (!settingNav) {
                    return;
                }
                const isMamPlusView = this._getPreferencesView() === 'mamplus';
                const settingRoot: HTMLDivElement = document.createElement('div');

                this._injectPreferencesTab(settingNav, isMamPlusView);

                if (!isMamPlusView) {
                    console.log('[M+] Added the MAM+ Preferences tab!');
                    if (MP.DEBUG) {
                        console.groupEnd();
                    }
                    return;
                }

                settingNav.insertAdjacentElement('afterend', settingRoot);
                let sibling = settingRoot.nextElementSibling as HTMLElement | null;
                while (sibling) {
                    sibling.style.display = 'none';
                    sibling = sibling.nextElementSibling as HTMLElement | null;
                }

                this.renderInto(settingRoot, settings, {
                    includeCopyPaste: true,
                    includeIntro: true,
                    saveHint: 'Saved!',
                    saveId: 'mp_submit',
                    saveText: 'Save M+ Settings',
                    titleText: 'MAM+ Settings',
                }).then(() => {
                    console.log('[M+] Added the MAM+ Settings tab!');
                    if (MP.DEBUG) {
                        console.groupEnd();
                    }
                });
            });
        }
    }
}
