// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.4.2
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://*.myanonamouse.net/*
// @exclude      https://cdn.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.4.2
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_getResourceText
// ==/UserScript==
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Types, Interfaces, etc.
 */
var SettingGroup;
(function (SettingGroup) {
    SettingGroup[SettingGroup["Global"] = 0] = "Global";
    SettingGroup[SettingGroup["Home"] = 1] = "Home";
    SettingGroup[SettingGroup["Search"] = 2] = "Search";
    SettingGroup[SettingGroup["Requests"] = 3] = "Requests";
    SettingGroup[SettingGroup["Torrent Page"] = 4] = "Torrent Page";
    SettingGroup[SettingGroup["Shoutbox"] = 5] = "Shoutbox";
    SettingGroup[SettingGroup["Vault"] = 6] = "Vault";
    SettingGroup[SettingGroup["Store"] = 7] = "Store";
    SettingGroup[SettingGroup["User Pages"] = 8] = "User Pages";
    SettingGroup[SettingGroup["Upload Page"] = 9] = "Upload Page";
    SettingGroup[SettingGroup["Forum"] = 10] = "Forum";
    SettingGroup[SettingGroup["Other"] = 11] = "Other";
})(SettingGroup || (SettingGroup = {}));
/**
 * Class containing common utility methods
 *
 * If the method should have user-changeable settings, consider using `Core.ts` instead
 */
var _a;
class Util {
    /**
     * Animation frame timer
     */
    static afTimer() {
        return new Promise((resolve) => {
            requestAnimationFrame(resolve);
        });
    }
    /**
     * Allows setting multiple attributes at once
     */
    static setAttr(el, attr) {
        return new Promise((resolve) => {
            for (const key in attr) {
                el.setAttribute(key, attr[key]);
            }
            resolve();
        });
    }
    /**
     * Returns the "length" of an Object
     */
    static objectLength(obj) {
        return Object.keys(obj).length;
    }
    /**
     * Forcefully empties any GM stored values
     */
    static purgeSettings() {
        for (const value of GM_listValues()) {
            GM_deleteValue(value);
        }
    }
    /**
     * Log a message about a counted result
     */
    static reportCount(did, num, thing) {
        const singular = 1;
        if (num !== singular) {
            thing += 's';
        }
        if (MP.DEBUG) {
            console.log(`> ${did} ${num} ${thing}`);
        }
    }
    /**
     * Initializes a feature
     */
    static startFeature(settings, elem, page) {
        return __awaiter(this, void 0, void 0, function* () {
            // Queue the settings in case they're needed
            MP.settingsGlob.push(settings);
            // Function to return true when the element is loaded
            function run() {
                return __awaiter(this, void 0, void 0, function* () {
                    const timer = new Promise((resolve) => setTimeout(resolve, 2000, false));
                    const checkElem = Check.elemLoad(elem);
                    return Promise.race([timer, checkElem]).then((val) => {
                        if (val) {
                            return true;
                        }
                        else {
                            console.warn(`startFeature(${settings.title}) Unable to initiate! Could not find element: ${elem}`);
                            return false;
                        }
                    });
                });
            }
            // Is the setting enabled?
            if (GM_getValue(settings.title)) {
                // A specific page is needed
                if (page && page.length > 0) {
                    // Loop over all required pages
                    const results = [];
                    yield page.forEach((p) => {
                        Check.page(p).then((r) => {
                            results.push(r);
                        });
                    });
                    // If any requested page matches the current page, run the feature
                    if (results.includes(true) === true)
                        return run();
                    else
                        return false;
                    // Skip to element checking
                }
                else {
                    return run();
                }
                // Setting is not enabled
            }
            else {
                return false;
            }
        });
    }
    /**
     * Trims a string longer than a specified char limit, to a full word
     */
    static trimString(inp, max) {
        if (inp.length > max) {
            inp = inp.substring(0, max + 1);
            inp = inp.substring(0, Math.min(inp.length, inp.lastIndexOf(' ')));
        }
        return inp;
    }
    /**
     * Removes brackets & all contained words from a string
     */
    static bracketRemover(inp) {
        return inp
            .replace(/{+.*?}+/g, '')
            .replace(/\[\[|\]\]/g, '')
            .replace(/<.*?>/g, '')
            .replace(/\(.*?\)/g, '')
            .trim();
    }
    /**
     * Converts a string to an array
     */
    static stringToArray(inp, splitPoint) {
        return splitPoint !== undefined && splitPoint !== 'ws'
            ? inp.split(splitPoint)
            : inp.match(/\S+/g) || [];
    }
    /**
     * Converts a comma (or other) separated value into an array
     * @param inp String to be divided
     * @param divider The divider (default: ',')
     */
    static csvToArray(inp, divider = ',') {
        const arr = [];
        inp.split(divider).forEach((item) => {
            arr.push(item.trim());
        });
        return arr;
    }
    /**
     * Convert an array to a string
     * @param inp string
     * @param end cut-off point
     */
    static arrayToString(inp, end) {
        let outp = '';
        inp.forEach((key, val) => {
            outp += key;
            if (end && val + 1 !== inp.length) {
                outp += ' ';
            }
        });
        return outp;
    }
    /**
     * Converts a DOM node reference into an HTML Element reference
     * @param node The node to convert
     */
    static nodeToElem(node) {
        if (node.firstChild !== null) {
            return node.firstChild.parentElement;
        }
        else {
            console.warn('Node-to-elem without childnode is untested');
            const tempNode = node;
            node.appendChild(tempNode);
            const selected = node.firstChild.parentElement;
            node.removeChild(tempNode);
            return selected;
        }
    }
    /**
     * Match strings while ignoring case sensitivity
     * @param a First string
     * @param b Second string
     */
    static caselessStringMatch(a, b) {
        const compare = a.localeCompare(b, 'en', {
            sensitivity: 'base',
        });
        return compare === 0 ? true : false;
    }
    /**
     * Add a new TorDetRow and return the inner div
     * @param tar The row to be targetted
     * @param label The name to be displayed for the new row
     * @param rowClass The row's classname (should start with mp_)
     */
    static addTorDetailsRow(tar, label, rowClass) {
        if (MP.DEBUG)
            console.log(tar);
        if (tar === null || tar.parentElement === null) {
            throw new Error(`Add Tor Details Row: empty node or parent node @ ${tar}`);
        }
        else {
            tar.parentElement.insertAdjacentHTML('afterend', `<div class="torDetRow"><div class="torDetLeft">${label}</div><div class="torDetRight ${rowClass}"><span class="flex"></span></div></div>`);
            return document.querySelector(`.${rowClass} .flex`);
        }
    }
    // TODO: Merge with `Util.createButton`
    /**
     * Inserts a link button that is styled like a site button (ex. in tor details)
     * @param tar The element the button should be added to
     * @param url The URL the button will send you to
     * @param text The text on the button
     * @param order Optional: flex flow ordering
     */
    static createLinkButton(tar, url = 'none', text, order = 0) {
        // Create the button
        const button = document.createElement('a');
        // Set up the button
        button.classList.add('mp_button_clone');
        if (url !== 'none') {
            button.setAttribute('href', url);
            button.setAttribute('target', '_blank');
        }
        button.innerText = text;
        button.style.order = `${order}`;
        // Inject the button
        tar.insertBefore(button, tar.firstChild);
    }
    /**
     * Inserts a non-linked button
     * @param id The ID of the button
     * @param text The text displayed in the button
     * @param type The HTML element to create. Default: `h1`
     * @param tar The HTML element the button will be `relative` to
     * @param relative The position of the button relative to the `tar`. Default: `afterend`
     * @param btnClass The classname of the element. Default: `mp_btn`
     */
    static createButton(id, text, type = 'h1', tar, relative = 'afterend', btnClass = 'mp_btn') {
        return new Promise((resolve, reject) => {
            // Choose the new button insert location and insert elements
            // const target: HTMLElement | null = <HTMLElement>document.querySelector(tar);
            const target = typeof tar === 'string' ? document.querySelector(tar) : tar;
            const btn = document.createElement(type);
            if (target === null) {
                reject(`${tar} is null!`);
            }
            else {
                target.insertAdjacentElement(relative, btn);
                Util.setAttr(btn, {
                    id: `mp_${id}`,
                    class: btnClass,
                    role: 'button',
                });
                // Set initial button text
                btn.innerHTML = text;
                resolve(btn);
            }
        });
    }
    /**
     * Converts an element into a button that, when clicked, copies text to clipboard
     * @param btn An HTML Element being used as a button
     * @param payload The text that will be copied to clipboard on button click, or a callback function that will use the clipboard's current text
     */
    static clipboardifyBtn(btn, payload, copy = true) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            // Have to override the Navigator type to prevent TS errors
            const nav = navigator;
            if (nav === undefined) {
                alert('Failed to copy text, likely due to missing browser support.');
                throw new Error("browser doesn't support 'navigator'?");
            }
            else {
                /* Navigator Exists */
                if (copy && typeof payload === 'string') {
                    // Copy results to clipboard
                    nav.clipboard.writeText(payload);
                    console.log('[M+] Copied to your clipboard!');
                }
                else {
                    // Run payload function with clipboard text
                    nav.clipboard.readText().then((text) => {
                        payload(text);
                    });
                    console.log('[M+] Copied from your clipboard!');
                }
                btn.style.color = 'green';
            }
        });
    }
    /**
     * Creates an HTTPRequest for GET JSON, returns the full text of HTTP GET
     * @param url - a string of the URL to submit for GET request
     */
    static getJSON(url) {
        return new Promise((resolve, reject) => {
            const getHTTP = new XMLHttpRequest();
            //URL to GET results with the amount entered by user plus the username found on the menu selected
            getHTTP.open('GET', url, true);
            getHTTP.setRequestHeader('Content-Type', 'application/json');
            getHTTP.onreadystatechange = function () {
                if (getHTTP.readyState === 4 && getHTTP.status === 200) {
                    resolve(getHTTP.responseText);
                }
            };
            getHTTP.send();
        });
    }
    /**
     * #### Get the user gift history between the logged in user and a given ID
     * @param userID A user ID; can be a string or number
     */
    static getUserGiftHistory(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawGiftHistory = yield Util.getJSON(`https://www.myanonamouse.net/json/userBonusHistory.php?other_userid=${userID}`);
            const giftHistory = JSON.parse(rawGiftHistory);
            // Return the full data
            return giftHistory;
        });
    }
    /**
     * #### Get the user gift history between the logged in user and everyone
     */
    static getAllUserGiftHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawGiftHistory = yield Util.getJSON(`https://www.myanonamouse.net/json/userBonusHistory.php`);
            const giftHistory = JSON.parse(rawGiftHistory);
            // Return the full data
            return giftHistory;
        });
    }
    /**
     * #### Gets the logged in user's userid
     */
    static getCurrentUserID() {
        const myInfo = (document.querySelector('.mmUserStats .avatar a'));
        if (myInfo) {
            const userID = this.endOfHref(myInfo);
            console.log(`[M+] Logged in userID is ${userID}`);
            return userID;
        }
        console.log('No logged in user found.');
        return '';
    }
    static prettySiteTime(unixTimestamp, date, time) {
        const timestamp = new Date(unixTimestamp * 1000).toISOString();
        if (date && !time) {
            return timestamp.split('T')[0];
        }
        else if (!date && time) {
            return timestamp.split('T')[1];
        }
        else {
            return timestamp;
        }
    }
    /**
     * #### Check a string to see if it's divided with a dash, returning the first half if it doesn't contain a specified string
     * @param original The original string being checked
     * @param contained A string that might be contained in the original
     */
    static checkDashes(original, contained) {
        if (MP.DEBUG) {
            console.log(`checkDashes( ${original}, ${contained} ): Count ${original.indexOf(' - ')}`);
        }
        // Dashes are present
        if (original.indexOf(' - ') !== -1) {
            if (MP.DEBUG) {
                console.log(`String contains a dash`);
            }
            const split = original.split(' - ');
            if (split[0] === contained) {
                if (MP.DEBUG) {
                    console.log(`> String before dash is "${contained}"; using string behind dash`);
                }
                return split[1];
            }
            else {
                return split[0];
            }
        }
        else {
            return original;
        }
    }
}
_a = Util;
/**
 *Return the contents between brackets
 *
 * @static
 * @memberof Util
 */
Util.bracketContents = (inp) => {
    return inp.match(/\(([^)]+)\)/)[1];
};
/**
 * Returns a random number between two parameters
 * @param min a number of the bottom of random number pool
 * @param max a number of the top of the random number pool
 */
Util.randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
/**
 * Sleep util to be used in async functions to delay program
 */
Util.sleep = (m) => new Promise((r) => setTimeout(r, m));
/**
 * Return the last section of an HREF
 * @param elem An anchor element
 * @param split Optional divider. Defaults to `/`
 */
Util.endOfHref = (elem, split = '/') => elem.href.split(split).pop();
/**
 * Return the hex value of a component as a string.
 * From https://stackoverflow.com/questions/5623838
 *
 * @static
 * @param {number} c
 * @returns {string}
 * @memberof Util
 */
Util.componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
};
/**
 * Return a hex color code from RGB.
 * From https://stackoverflow.com/questions/5623838
 *
 * @static
 * @memberof Util
 */
Util.rgbToHex = (r, g, b) => {
    return `#${Util.componentToHex(r)}${Util.componentToHex(g)}${Util.componentToHex(b)}`;
};
/**
 * Extract numbers (with float) from text and return them
 * @param tar An HTML element that contains numbers
 */
Util.extractFloat = (tar) => {
    if (tar.textContent) {
        return (tar.textContent.replace(/,/g, '').match(/\d+\.\d+/) || []).map((n) => parseFloat(n));
    }
    else {
        throw new Error('Target contains no text');
    }
};
/**
 * ## Utilities specific to Goodreads
 */
Util.goodreads = {
    /**
     * * Removes spaces in author names that use adjacent intitials.
     * @param auth The author(s)
     * @example "H G Wells" -> "HG Wells"
     */
    smartAuth: (auth) => {
        let outp = '';
        const arr = Util.stringToArray(auth);
        arr.forEach((key, val) => {
            // Current key is an initial
            if (key.length < 2) {
                // If next key is an initial, don't add a space
                const nextLeng = arr[val + 1].length;
                if (nextLeng < 2) {
                    outp += key;
                }
                else {
                    outp += `${key} `;
                }
            }
            else {
                outp += `${key} `;
            }
        });
        // Trim trailing space
        return outp.trim();
    },
    /**
     * * Turns a string into a Goodreads search URL
     * @param type The type of URL to make
     * @param inp The extracted data to URI encode
     */
    buildSearchURL: (type, inp) => {
        if (MP.DEBUG) {
            console.log(`goodreads.buildGrSearchURL( ${type}, ${inp} )`);
        }
        let grType = type;
        const cases = {
            book: () => {
                grType = 'title';
            },
            series: () => {
                grType = 'on';
                inp += ', #';
            },
        };
        if (cases[type]) {
            cases[type]();
        }
        return `https://r.mrd.ninja/https://www.goodreads.com/search?q=${encodeURIComponent(inp.replace('%', '')).replace("'", '%27')}&search_type=books&search%5Bfield%5D=${grType}`;
    },
};
/**
 * #### Return a cleaned book title from an element
 * @param data The element containing the title text
 * @param auth A string of authors
 */
Util.getBookTitle = (data, auth = '') => __awaiter(_a, void 0, void 0, function* () {
    if (data === null) {
        throw new Error('getBookTitle() failed; element was null!');
    }
    let extracted = data.innerText;
    // Shorten title and check it for brackets & author names
    extracted = Util.trimString(Util.bracketRemover(extracted), 50);
    extracted = Util.checkDashes(extracted, auth);
    return extracted;
});
/**
 * #### Return GR-formatted authors as an array limited to `num`
 * @param data The element containing the author links
 * @param num The number of authors to return. Default 3
 */
Util.getBookAuthors = (data, num = 3) => __awaiter(_a, void 0, void 0, function* () {
    if (data === null) {
        console.warn('getBookAuthors() failed; element was null!');
        return [];
    }
    else {
        const authList = [];
        data.forEach((author) => {
            if (num > 0) {
                authList.push(Util.goodreads.smartAuth(author.innerText));
                num--;
            }
        });
        return authList;
    }
});
/**
 * #### Return series as an array
 * @param data The element containing the series links
 */
Util.getBookSeries = (data) => __awaiter(_a, void 0, void 0, function* () {
    if (data === null) {
        console.warn('getBookSeries() failed; element was null!');
        return [];
    }
    else {
        const seriesList = [];
        data.forEach((series) => {
            seriesList.push(series.innerText);
        });
        return seriesList;
    }
});
/**
 * #### Return a table-like array of rows as an object.
 * Store the returned object and access using the row title, ex. `stored['Title:']`
 * @param rowList An array of table-like rows
 * @param titleClass The class used by the title cells. Default `.torDetLeft`
 * @param dataClass The class used by the data cells. Default `.torDetRight`
 */
Util.rowsToObj = (rowList, titleClass = '.torDetLeft', dataClass = '.torDetRight') => {
    if (rowList.length < 1) {
        throw new Error(`Util.rowsToObj( ${rowList} ): Row list was empty!`);
    }
    const rows = [];
    rowList.forEach((row) => {
        const title = row.querySelector(titleClass);
        const data = row.querySelector(dataClass);
        if (title) {
            rows.push({
                key: title.textContent,
                value: data,
            });
        }
        else {
            console.warn('Row title was empty!');
        }
    });
    return rows.reduce((obj, item) => ((obj[item.key] = item.value), obj), {});
};
/**
 * #### Convert bytes into a human-readable string
 * Created by yyyzzz999
 * @param bytes Bytes to be formatted
 * @param b ?
 * @returns String in the format of ex. `123 MB`
 */
Util.formatBytes = (bytes, b = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const c = 0 > b ? 0 : b;
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return (parseFloat((bytes / Math.pow(1024, index)).toFixed(c)) +
        ' ' +
        ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][index]);
};
Util.derefer = (url) => {
    return `https://r.mrd.ninja/${encodeURI(url)}`;
};
Util.delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
/// <reference path="util.ts" />
/**
 * # Class for handling validation & confirmation
 */
class Check {
    /**
     * * Wait for an element to exist, then return it
     * @param {string} selector - The DOM string that will be used to select an element
     * @return {Promise<HTMLElement>} Promise of an element that was selected
     */
    static elemLoad(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (MP.DEBUG) {
                console.log(`%c Looking for ${selector}`, 'background: #222; color: #555');
            }
            let _counter = 0;
            const _counterLimit = 200;
            const logic = (selector) => __awaiter(this, void 0, void 0, function* () {
                // Select the actual element
                const elem = typeof selector === 'string'
                    ? document.querySelector(selector)
                    : selector;
                if (elem === undefined) {
                    throw `${selector} is undefined!`;
                }
                if (elem === null && _counter < _counterLimit) {
                    yield Util.afTimer();
                    _counter++;
                    return yield logic(selector);
                }
                else if (elem === null && _counter >= _counterLimit) {
                    _counter = 0;
                    return false;
                }
                else if (elem) {
                    return elem;
                }
                else {
                    return false;
                }
            });
            return logic(selector);
        });
    }
    /**
     * * Run a function whenever an element changes
     * @param selector - The element to be observed. Can be a string.
     * @param callback - The function to run when the observer triggers
     * @return Promise of a mutation observer
     */
    static elemObserver(selector, callback, config = {
        childList: true,
        attributes: true,
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            let selected = null;
            if (typeof selector === 'string') {
                selected = document.querySelector(selector);
                if (selected === null) {
                    throw new Error(`Couldn't find '${selector}'`);
                }
            }
            if (MP.DEBUG) {
                console.log(`%c Setting observer on ${selector}: ${selected}`, 'background: #222; color: #5d8aa8');
            }
            const observer = new MutationObserver(callback);
            observer.observe(selected, config);
            return observer;
        });
    }
    /**
     * * Check to see if the script has been updated from an older version
     * @return The version string or false
     */
    static updated() {
        if (MP.DEBUG) {
            console.group('Check.updated()');
            console.log(`PREV VER = ${this.prevVer}`);
            console.log(`NEW VER = ${this.newVer}`);
        }
        return new Promise((resolve) => {
            // Different versions; the script was updated
            if (this.newVer !== this.prevVer) {
                if (MP.DEBUG) {
                    console.log('Script is new or updated');
                }
                // Store the new version
                GM_setValue('mp_version', this.newVer);
                if (this.prevVer) {
                    // The script has run before
                    if (MP.DEBUG) {
                        console.log('Script has run before');
                        console.groupEnd();
                    }
                    resolve('updated');
                }
                else {
                    // First-time run
                    if (MP.DEBUG) {
                        console.log('Script has never run');
                        console.groupEnd();
                    }
                    // Enable the most basic features
                    GM_setValue('goodreadsBtn', true);
                    GM_setValue('alerts', true);
                    resolve('firstRun');
                }
            }
            else {
                if (MP.DEBUG) {
                    console.log('Script not updated');
                    console.groupEnd();
                }
                resolve(false);
            }
        });
    }
    /**
     * * Check to see what page is being accessed
     * @param {ValidPage} pageQuery - An optional page to specifically check for
     * @return {Promise<string>} A promise containing the name of the current page
     * @return {Promise<boolean>} Optionally, a boolean if the current page matches the `pageQuery`
     */
    static page(pageQuery) {
        const storedPage = GM_getValue('mp_currentPage');
        let currentPage = undefined;
        return new Promise((resolve) => {
            // Check.page() has been run and a value was stored
            if (storedPage !== undefined) {
                // If we're just checking what page we're on, return the stored page
                if (!pageQuery) {
                    resolve(storedPage);
                    // If we're checking for a specific page, return TRUE/FALSE
                }
                else if (pageQuery === storedPage) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                // Check.page() has not previous run
            }
            else {
                // Get the current page
                let path = window.location.pathname;
                path = path.indexOf('.php') ? path.split('.php')[0] : path;
                const page = path.split('/');
                page.shift();
                if (MP.DEBUG) {
                    console.log(`Page URL @ ${page.join(' -> ')}`);
                }
                // Create an object literal of sorts to use as a "switch"
                const cases = {
                    '': () => 'home',
                    index: () => 'home',
                    shoutbox: () => 'shoutbox',
                    preferences: () => 'settings',
                    store: () => 'store',
                    freeleech: () => 'freeleech',
                    millionaires: () => 'vault',
                    t: () => 'torrent',
                    u: () => 'user',
                    f: () => {
                        if (page[1] === 't')
                            return 'forum thread';
                    },
                    tor: () => {
                        if (page[1] === 'browse')
                            return 'browse';
                        else if (page[1] === 'requests2')
                            return 'request';
                        else if (page[1] === 'viewRequest')
                            return 'request details';
                        else if (page[1] === 'upload')
                            return 'upload';
                    },
                    newUsers: () => 'new users',
                };
                // Check to see if we have a case that matches the current page
                if (cases[page[0]]) {
                    currentPage = cases[page[0]]();
                }
                else {
                    console.warn(`Page "${page}" is not a valid M+ page. Path: ${path}`);
                }
                if (currentPage !== undefined) {
                    // Save the current page to be accessed later
                    GM_setValue('mp_currentPage', currentPage);
                    // If we're just checking what page we're on, return the page
                    if (!pageQuery) {
                        resolve(currentPage);
                        // If we're checking for a specific page, return TRUE/FALSE
                    }
                    else if (pageQuery === currentPage) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            }
            if (MP.DEBUG) {
                console.groupEnd();
            }
        });
    }
    /**
     * * Check to see if a given category is an ebook/audiobook category
     */
    static isBookCat(cat) {
        // Currently, all book categories are assumed to be in the range of 39-120
        return cat >= 39 && cat <= 120 ? true : false;
    }
}
Check.newVer = GM_info.script.version;
Check.prevVer = GM_getValue('mp_version');
/// <reference path="check.ts" />
/**
 * Class for handling values and methods related to styles
 * @constructor Initializes theme based on last saved value; can be called before page content is loaded
 * @method theme Gets or sets the current theme
 */
class Style {
    constructor() {
        // The light theme is the default theme, so use M+ Light values
        this._theme = 'light';
        // Get the previously used theme object
        this._prevTheme = this._getPrevTheme();
        // If the previous theme object exists, assume the current theme is identical
        if (this._prevTheme !== undefined) {
            this._theme = this._prevTheme;
        }
        else if (MP.DEBUG)
            console.warn('no previous theme');
        // Fetch the CSS data
        this._cssData = GM_getResourceText('MP_CSS');
    }
    /** Allows the current theme to be returned */
    get theme() {
        return this._theme;
    }
    /** Allows the current theme to be set */
    set theme(val) {
        this._theme = val;
    }
    /** Sets the M+ theme based on the site theme */
    alignToSiteTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            const theme = yield this._getSiteCSS();
            this._theme = theme.indexOf('dark') > 0 ? 'dark' : 'light';
            if (this._prevTheme !== this._theme) {
                this._setPrevTheme();
            }
            // Inject the CSS class used by M+ for theming
            Check.elemLoad('body').then(() => {
                const body = document.querySelector('body');
                if (body) {
                    body.classList.add(`mp_${this._theme}`);
                }
                else if (MP.DEBUG) {
                    console.warn(`Body is ${body}`);
                }
            });
        });
    }
    /** Injects the stylesheet link into the header */
    injectLink() {
        const id = 'mp_css';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.innerText = this._cssData !== undefined ? this._cssData : '';
            document.querySelector('head').appendChild(style);
        }
        else if (MP.DEBUG)
            console.warn(`an element with the id "${id}" already exists`);
    }
    /** Returns the previous theme object if it exists */
    _getPrevTheme() {
        return GM_getValue('style_theme');
    }
    /** Saves the current theme for future reference */
    _setPrevTheme() {
        GM_setValue('style_theme', this._theme);
    }
    _getSiteCSS() {
        return new Promise((resolve) => {
            const themeURL = document
                .querySelector('head link[href*="ICGstation"]')
                .getAttribute('href');
            if (typeof themeURL === 'string') {
                resolve(themeURL);
            }
            else if (MP.DEBUG)
                console.warn(`themeUrl is not a string: ${themeURL}`);
        });
    }
}
/// <reference path="../check.ts" />
/**
 * CORE FEATURES
 *
 * Your feature belongs here if the feature:
 * A) is critical to the userscript
 * B) is intended to be used by other features
 * C) will have settings displayed on the Settings page
 * If A & B are met but not C consider using `Utils.ts` instead
 */
/**
 * This feature creates a pop-up notification
 */
class Alerts {
    constructor() {
        this._settings = {
            scope: SettingGroup.Other,
            type: 'checkbox',
            title: 'alerts',
            desc: 'Enable the MAM+ Alert panel for update information, etc.',
        };
        MP.settingsGlob.push(this._settings);
    }
    notify(kind, log) {
        if (MP.DEBUG) {
            console.group(`Alerts.notify( ${kind} )`);
        }
        return new Promise((resolve) => {
            // Verify a notification request was made
            if (kind) {
                // Verify notifications are allowed
                if (GM_getValue('alerts')) {
                    // Internal function to build msg text
                    const buildMsg = (arr, title) => {
                        if (MP.DEBUG) {
                            console.log(`buildMsg( ${title} )`);
                        }
                        // Make sure the array isn't empty
                        if (arr.length > 0 && arr[0] !== '') {
                            // Display the section heading
                            let msg = `<h4>${title}:</h4><ul>`;
                            // Loop over each item in the message
                            arr.forEach((item) => {
                                msg += `<li>${item}</li>`;
                            }, msg);
                            // Close the message
                            msg += '</ul>';
                            return msg;
                        }
                        return '';
                    };
                    // Internal function to build notification panel
                    const buildPanel = (msg) => {
                        if (MP.DEBUG) {
                            console.log(`buildPanel( ${msg} )`);
                        }
                        Check.elemLoad('body').then(() => {
                            document.body.innerHTML += `<div class='mp_notification'>${msg}<span>X</span></div>`;
                            const msgBox = document.querySelector('.mp_notification');
                            const closeBtn = msgBox.querySelector('span');
                            try {
                                if (closeBtn) {
                                    // If the close button is clicked, remove it
                                    closeBtn.addEventListener('click', () => {
                                        if (msgBox) {
                                            msgBox.remove();
                                        }
                                    }, false);
                                }
                            }
                            catch (err) {
                                if (MP.DEBUG) {
                                    console.log(err);
                                }
                            }
                        });
                    };
                    let message = '';
                    if (kind === 'updated') {
                        if (MP.DEBUG) {
                            console.log('Building update message');
                        }
                        // Start the message
                        message = `<strong>MAM+ has been updated!</strong> You are now using v${MP.VERSION}, created on ${MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>`;
                        // Add the changelog
                        message += buildMsg(log.UPDATE_LIST, 'Changes');
                        message += buildMsg(log.BUG_LIST, 'Known Bugs');
                    }
                    else if (kind === 'firstRun') {
                        message =
                            '<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="https://github.com/gardenshade/mam-plus/issues">Github</a>, <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a>, or <a href="/sendmessage.php?receiver=108303">through private message</a>.';
                        if (MP.DEBUG) {
                            console.log('Building first run message');
                        }
                    }
                    else if (MP.DEBUG) {
                        console.warn(`Received msg kind: ${kind}`);
                    }
                    buildPanel(message);
                    if (MP.DEBUG) {
                        console.groupEnd();
                    }
                    resolve(true);
                    // Notifications are disabled
                }
                else {
                    if (MP.DEBUG) {
                        console.log('Notifications are disabled.');
                        console.groupEnd();
                    }
                    resolve(false);
                }
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
class Debug {
    constructor() {
        this._settings = {
            scope: SettingGroup.Other,
            type: 'checkbox',
            title: 'debug',
            desc: 'Error log (<em>Click this checkbox to enable verbose logging to the console</em>)',
        };
        MP.settingsGlob.push(this._settings);
    }
    get settings() {
        return this._settings;
    }
}
/**
 * # GLOBAL FEATURES
 */
/**
 * ## Hide the home button or the banner
 */
class HideHome {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'dropdown',
            title: 'hideHome',
            tag: 'Remove banner/home',
            options: {
                default: 'Do not remove either',
                hideBanner: 'Hide the banner',
                hideHome: 'Hide the home button',
            },
            desc: 'Remove the header image or Home button, because both link to the homepage',
        };
        this._tar = '#mainmenu';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const hider = GM_getValue(this._settings.title);
        if (hider === 'hideHome') {
            document.body.classList.add('mp_hide_home');
            console.log('[M+] Hid the home button!');
        }
        else if (hider === 'hideBanner') {
            document.body.classList.add('mp_hide_banner');
            console.log('[M+] Hid the banner!');
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Use custom bookmark icons
 */
class BookmarkIcons {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'bookmarkIcons',
            desc: `Use MAM+'s custom bookmark icons instead of the site's default icons`,
        };
        this._tar = 'body';
        if (GM_getValue(this._settings.title) === undefined) {
            GM_setValue(this._settings.title, true);
        }
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        document.body.classList.add('mp_bookmarkOverride');
        console.log('[M+] Enabled custom bookmark icons!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Bypass the vault info page
 */
class VaultLink {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'vaultLink',
            desc: 'Make the Vault link bypass the Vault Info page',
        };
        this._tar = '#millionInfo';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        document
            .querySelector(this._tar)
            .setAttribute('href', '/millionaires/donate.php');
        console.log('[M+] Made the vault text link to the donate page!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Shorten the vault & ratio text
 */
class MiniVaultInfo {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'miniVaultInfo',
            desc: 'Shorten the Vault link & ratio text',
        };
        this._tar = '#millionInfo';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const vaultText = document.querySelector(this._tar);
        const ratioText = document.querySelector('#tmR');
        // Shorten the ratio text
        // TODO: move this to its own setting?
        /* This chained monstrosity does the following:
        - Extract the number (with float) from the element
        - Fix the float to 2 decimal places (which converts it back into a string)
        - Convert the string back into a number so that we can convert it with`toLocaleString` to get commas back */
        const num = Number(Util.extractFloat(ratioText)[0].toFixed(2)).toLocaleString();
        ratioText.innerHTML = `${num} <img src="/pic/updownBig.png" alt="ratio">`;
        // Turn the numeric portion of the vault link into a number
        let newText = parseInt(vaultText.textContent.split(':')[1].split(' ')[1].replace(/,/g, ''));
        // Convert the vault amount to millionths
        newText = Number((newText / 1e6).toFixed(3));
        // Update the vault text
        vaultText.textContent = `Vault: ${newText} million`;
        console.log('[M+] Shortened the vault & ratio numbers!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Display bonus point delta
 */
class BonusPointDelta {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'bonusPointDelta',
            desc: `Display how many bonus points you've gained since last pageload`,
        };
        this._tar = '#tmBP';
        this._prevBP = 0;
        this._currentBP = 0;
        this._delta = 0;
        this._displayBP = (bp) => {
            const bonusBox = document.querySelector(this._tar);
            let deltaBox = '';
            deltaBox = bp > 0 ? `+${bp}` : `${bp}`;
            if (bonusBox !== null) {
                bonusBox.innerHTML += `<span class='mp_bpDelta'> (${deltaBox})</span>`;
            }
        };
        this._setBP = (bp) => {
            GM_setValue(`${this._settings.title}Val`, `${bp}`);
        };
        this._getBP = () => {
            const stored = GM_getValue(`${this._settings.title}Val`);
            if (stored === undefined) {
                return 0;
            }
            else {
                return parseInt(stored);
            }
        };
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const currentBPEl = document.querySelector(this._tar);
        // Get old BP value
        this._prevBP = this._getBP();
        if (currentBPEl !== null) {
            // Extract only the number from the BP element
            const current = currentBPEl.textContent.match(/\d+/g);
            // Set new BP value
            this._currentBP = parseInt(current[0]);
            this._setBP(this._currentBP);
            // Calculate delta
            this._delta = this._currentBP - this._prevBP;
            // Show the text if not 0
            if (this._delta !== 0 && !isNaN(this._delta)) {
                this._displayBP(this._delta);
            }
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Blur the header background
 */
class BlurredHeader {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'blurredHeader',
            desc: `Add a blurred background to the header area`,
        };
        this._tar = '#siteMain > header';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const header = document.querySelector(`${this._tar}`);
            const headerImg = header.querySelector(`img`);
            if (headerImg) {
                const headerSrc = headerImg.getAttribute('src');
                // Generate a container for the background
                const blurredBack = document.createElement('div');
                header.classList.add('mp_blurredBack');
                header.append(blurredBack);
                blurredBack.style.backgroundImage = headerSrc ? `url(${headerSrc})` : '';
                blurredBack.classList.add('mp_container');
            }
            console.log('[M+] Added a blurred background to the header!');
        });
    }
    // This must match the type selected for `this._settings`
    get settings() {
        return this._settings;
    }
}
/**
 * ## Hide the seedbox link
 */
class HideSeedbox {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'hideSeedbox',
            scope: SettingGroup.Global,
            desc: 'Remove the "Get A Seedbox" menu item',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#menu .sbDonCrypto';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const seedboxBtn = document.querySelector(this._tar);
            if (seedboxBtn) {
                seedboxBtn.style.display = 'none';
                console.log('[M+] Hid the Seedbox button!');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Hide the donation link
 */
class HideDonationBox {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'hideDonationBox',
            scope: SettingGroup.Global,
            desc: 'Remove the Donations menu item',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#menu .mmDonBox';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const donationBoxBtn = document.querySelector(this._tar);
            if (donationBoxBtn) {
                donationBoxBtn.style.display = 'none';
                console.log('[M+] Hid the Donation Box button!');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * # Fixed navigation & search
 */
class FixedNav {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'fixedNav',
            scope: SettingGroup.Global,
            desc: 'Fix the navigation/search to the top of the page.',
        };
        this._tar = 'body';
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            document.querySelector('body').classList.add('mp_fixed_nav');
            console.log('[M+] Pinned the nav/search to the top!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="../check.ts" />
/**
 * SHARED CODE
 *
 * This is for anything that's shared between files, but is not generic enough to
 * to belong in `Utils.ts`. I can't think of a better way to categorize DRY code.
 */
class Shared {
    constructor() {
        /**
         * Receive a target and `this._settings.title`
         * @param tar CSS selector for a text input box
         */
        // TODO: with all Checking being done in `Util.startFeature()` it's no longer necessary to Check in this function
        this.fillGiftBox = (tar, settingTitle) => {
            if (MP.DEBUG)
                console.log(`Shared.fillGiftBox( ${tar}, ${settingTitle} )`);
            return new Promise((resolve) => {
                Check.elemLoad(tar).then(() => {
                    const pointBox = (document.querySelector(tar));
                    if (pointBox) {
                        const userSetPoints = parseInt(GM_getValue(`${settingTitle}_val`));
                        let maxPoints = parseInt(pointBox.getAttribute('max'));
                        if (!isNaN(userSetPoints) && userSetPoints <= maxPoints) {
                            maxPoints = userSetPoints;
                        }
                        pointBox.value = maxPoints.toFixed(0);
                        resolve(maxPoints);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        };
        /**
         * Returns list of all results from Browse page
         */
        this.getSearchList = () => {
            if (MP.DEBUG)
                console.log(`Shared.getSearchList( )`);
            return new Promise((resolve, reject) => {
                // Wait for the search results to exist
                Check.elemLoad('#ssr tr[id ^= "tdr"] td').then(() => {
                    // Select all search results
                    const snatchList = document.querySelectorAll('#ssr tr[id ^= "tdr"]');
                    if (snatchList === null || snatchList === undefined) {
                        reject(`snatchList is ${snatchList}`);
                    }
                    else {
                        resolve(snatchList);
                    }
                });
            });
        };
        // TODO: Make goodreadsButtons() into a generic framework for other site's buttons
        this.goodreadsButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-Goodreads buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search Goodreads', 'mp_grRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_grRow .flex');
            const buttonTar = (document.querySelector('.mp_grRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = Util.goodreads.buildSearchURL('series', item);
                        Util.createLinkButton(buttonTar, url, buttonTitle, 4);
                    });
                }
                else {
                    console.warn('No series data detected!');
                }
            });
            // Build Author button
            authorP
                .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = Util.goodreads.buildSearchURL('author', authors);
                    Util.createLinkButton(buttonTar, url, 'Author', 3);
                }
                else {
                    console.warn('No author data detected!');
                }
            })
                // Build Title buttons
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const title = yield Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = Util.goodreads.buildSearchURL('book', title);
                    Util.createLinkButton(buttonTar, url, 'Title', 2);
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = Util.goodreads.buildSearchURL('on', `${title} ${authors}`);
                        Util.createLinkButton(buttonTar, bothURL, 'Title + Author', 1);
                    }
                    else if (MP.DEBUG) {
                        console.log(`Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`);
                    }
                }
                else {
                    console.warn('No title data detected!');
                }
            }));
            console.log(`[M+] Added the MAM-to-Goodreads buttons!`);
        });
        this.audibleButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-Audible buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search Audible', 'mp_auRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_auRow .flex');
            const buttonTar = (document.querySelector('.mp_auRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = `https://www.audible.com/search?keywords=${item}`;
                        Util.createLinkButton(buttonTar, url, buttonTitle, 4);
                    });
                }
                else {
                    console.warn('No series data detected!');
                }
            });
            // Build Author button
            authorP
                .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = `https://www.audible.com/search?author_author=${authors}`;
                    Util.createLinkButton(buttonTar, url, 'Author', 3);
                }
                else {
                    console.warn('No author data detected!');
                }
            })
                // Build Title buttons
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const title = yield Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = `https://www.audible.com/search?title=${title}`;
                    Util.createLinkButton(buttonTar, url, 'Title', 2);
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://www.audible.com/search?title=${title}&author_author=${authors}`;
                        Util.createLinkButton(buttonTar, bothURL, 'Title + Author', 1);
                    }
                    else if (MP.DEBUG) {
                        console.log(`Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`);
                    }
                }
                else {
                    console.warn('No title data detected!');
                }
            }));
            console.log(`[M+] Added the MAM-to-Audible buttons!`);
        });
        // TODO: Switch to StoryGraph API once it becomes available? Or advanced search
        this.storyGraphButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-StoryGraph buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search TheStoryGraph', 'mp_sgRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_sgRow .flex');
            const buttonTar = (document.querySelector('.mp_sgRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = `https://app.thestorygraph.com/browse?search_term=${item}`;
                        Util.createLinkButton(buttonTar, url, buttonTitle, 4);
                    });
                }
                else {
                    console.warn('No series data detected!');
                }
            });
            // Build Author button
            authorP
                .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = `https://app.thestorygraph.com/browse?search_term=${authors}`;
                    Util.createLinkButton(buttonTar, url, 'Author', 3);
                }
                else {
                    console.warn('No author data detected!');
                }
            })
                // Build Title buttons
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const title = yield Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = `https://app.thestorygraph.com/browse?search_term=${title}`;
                    Util.createLinkButton(buttonTar, url, 'Title', 2);
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://app.thestorygraph.com/browse?search_term=${title} ${authors}`;
                        Util.createLinkButton(buttonTar, bothURL, 'Title + Author', 1);
                    }
                    else if (MP.DEBUG) {
                        console.log(`Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`);
                    }
                }
                else {
                    console.warn('No title data detected!');
                }
            }));
            console.log(`[M+] Added the MAM-to-StoryGraph buttons!`);
        });
        this.getRatioProtectLevels = () => __awaiter(this, void 0, void 0, function* () {
            let l1 = parseFloat(GM_getValue('ratioProtectL1_val'));
            let l2 = parseFloat(GM_getValue('ratioProtectL2_val'));
            let l3 = parseFloat(GM_getValue('ratioProtectL3_val'));
            const l1_def = 0.5;
            const l2_def = 1;
            const l3_def = 2;
            // Default values if empty
            if (isNaN(l3))
                l3 = l3_def;
            if (isNaN(l2))
                l2 = l2_def;
            if (isNaN(l1))
                l1 = l1_def;
            // If someone put things in a dumb order, ignore smaller numbers
            if (l2 > l3)
                l2 = l3;
            if (l1 > l2)
                l1 = l2;
            // If custom numbers are smaller than default values, ignore the lower warning
            if (isNaN(l2))
                l2 = l3 < l2_def ? l3 : l2_def;
            if (isNaN(l1))
                l1 = l2 < l1_def ? l2 : l1_def;
            return [l1, l2, l3];
        });
    }
}
/// <reference path="shared.ts" />
/**
 * #BROWSE PAGE FEATURES
 */
/**
 * Allows Snatched torrents to be hidden/shown
 */
class ToggleSnatched {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'toggleSnatched',
            desc: `Add a button to hide/show results that you've snatched`,
        };
        this._tar = '#ssr';
        this._isVisible = true;
        this._snatchedHook = 'td div[class^="browse"]';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggle;
            let resultList;
            let results;
            const storedState = GM_getValue(`${this._settings.title}State`);
            if (storedState === 'false' && GM_getValue('stickySnatchedToggle') === true) {
                this._setVisState(false);
            }
            else {
                this._setVisState(true);
            }
            const toggleText = this._isVisible ? 'Hide Snatched' : 'Show Snatched';
            // Queue building the button and getting the results
            yield Promise.all([
                (toggle = Util.createButton('snatchedToggle', toggleText, 'h1', '#resetNewIcon', 'beforebegin', 'torFormButton')),
                (resultList = this._share.getSearchList()),
            ]);
            toggle
                .then((btn) => {
                // Update based on vis state
                btn.addEventListener('click', () => {
                    if (this._isVisible === true) {
                        btn.innerHTML = 'Show Snatched';
                        this._setVisState(false);
                    }
                    else {
                        btn.innerHTML = 'Hide Snatched';
                        this._setVisState(true);
                    }
                    this._filterResults(results, this._snatchedHook);
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                results = res;
                this._searchList = res;
                this._filterResults(results, this._snatchedHook);
                console.log('[M+] Added the Toggle Snatched button!');
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultList = this._share.getSearchList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        results = res;
                        this._searchList = res;
                        this._filterResults(results, this._snatchedHook);
                    }));
                });
            });
        });
    }
    /**
     * Filters search results
     * @param list a search results list
     * @param subTar the elements that must be contained in our filtered results
     */
    _filterResults(list, subTar) {
        list.forEach((snatch) => {
            const btn = (document.querySelector('#mp_snatchedToggle'));
            // Select only the items that match our sub element
            const result = snatch.querySelector(subTar);
            if (result !== null) {
                // Hide/show as required
                if (this._isVisible === false) {
                    btn.innerHTML = 'Show Snatched';
                    snatch.style.display = 'none';
                }
                else {
                    btn.innerHTML = 'Hide Snatched';
                    snatch.style.display = 'table-row';
                }
            }
        });
    }
    _setVisState(val) {
        if (MP.DEBUG) {
            console.log('Snatch vis state:', this._isVisible, '\nval:', val);
        }
        GM_setValue(`${this._settings.title}State`, `${val}`);
        this._isVisible = val;
    }
    get settings() {
        return this._settings;
    }
    get searchList() {
        if (this._searchList === undefined) {
            throw new Error('searchlist is undefined');
        }
        return this._searchList;
    }
    get visible() {
        return this._isVisible;
    }
    set visible(val) {
        this._setVisState(val);
    }
}
/**
 * Remembers the state of ToggleSnatched between page loads
 */
class StickySnatchedToggle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'stickySnatchedToggle',
            desc: `Make toggle state persist between page loads`,
        };
        this._tar = '#ssr';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Remembered snatch visibility state!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Generate a plaintext list of search results
 */
class PlaintextSearch {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'plaintextSearch',
            desc: `Insert plaintext search results at top of page`,
        };
        this._tar = '#ssr h1';
        this._isOpen = GM_getValue(`${this._settings.title}State`);
        this._share = new Shared();
        this._plainText = '';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggleBtn;
            let copyBtn;
            let resultList;
            // Queue building the toggle button and getting the results
            yield Promise.all([
                (toggleBtn = Util.createButton('plainToggle', 'Show Plaintext', 'div', '#ssr', 'beforebegin', 'mp_toggle mp_plainBtn')),
                (resultList = this._share.getSearchList()),
            ]);
            // Process the results into plaintext
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                // Build the copy button
                copyBtn = yield Util.createButton('plainCopy', 'Copy Plaintext', 'div', '#mp_plainToggle', 'afterend', 'mp_copy mp_plainBtn');
                // Build the plaintext box
                copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);
                // Insert plaintext results
                this._plainText = yield this._processResults(res);
                document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch').innerHTML = '';
                    resultList = this._share.getSearchList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        // Insert plaintext results
                        this._plainText = yield this._processResults(res);
                        document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                    }));
                });
            });
            // Init open state
            this._setOpenState(this._isOpen);
            // Set up toggle button functionality
            toggleBtn
                .then((btn) => {
                btn.addEventListener('click', () => {
                    // Textbox should exist, but just in case...
                    const textbox = document.querySelector('.mp_plaintextSearch');
                    if (textbox === null) {
                        throw new Error(`textbox doesn't exist!`);
                    }
                    else if (this._isOpen === 'false') {
                        this._setOpenState('true');
                        textbox.style.display = 'block';
                        btn.innerText = 'Hide Plaintext';
                    }
                    else {
                        this._setOpenState('false');
                        textbox.style.display = 'none';
                        btn.innerText = 'Show Plaintext';
                    }
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            console.log('[M+] Inserted plaintext search results!');
        });
    }
    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    _setOpenState(val) {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }
    _processResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            let outp = '';
            results.forEach((node) => {
                // Reset each text field
                let title = '';
                let seriesTitle = '';
                let authTitle = '';
                let narrTitle = '';
                // Break out the important data from each node
                const rawTitle = node.querySelector('.torTitle');
                const seriesList = node.querySelectorAll('.series');
                const authList = node.querySelectorAll('.author');
                const narrList = node.querySelectorAll('.narrator');
                if (rawTitle === null) {
                    console.warn('Error Node:', node);
                    throw new Error(`Result title should not be null`);
                }
                else {
                    title = rawTitle.textContent.trim();
                }
                // Process series
                if (seriesList !== null && seriesList.length > 0) {
                    seriesList.forEach((series) => {
                        seriesTitle += `${series.textContent} / `;
                    });
                    // Remove trailing slash from last series, then style
                    seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                    seriesTitle = ` (${seriesTitle})`;
                }
                // Process authors
                if (authList !== null && authList.length > 0) {
                    authTitle = 'BY ';
                    authList.forEach((auth) => {
                        authTitle += `${auth.textContent} AND `;
                    });
                    // Remove trailing AND
                    authTitle = authTitle.substring(0, authTitle.length - 5);
                }
                // Process narrators
                if (narrList !== null && narrList.length > 0) {
                    narrTitle = 'FT ';
                    narrList.forEach((narr) => {
                        narrTitle += `${narr.textContent} AND `;
                    });
                    // Remove trailing AND
                    narrTitle = narrTitle.substring(0, narrTitle.length - 5);
                }
                outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
            });
            return outp;
        });
    }
    get settings() {
        return this._settings;
    }
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(val) {
        this._setOpenState(val);
    }
}
/**
 * Allows the search features to be hidden/shown
 */
class ToggleSearchbox {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'toggleSearchbox',
            desc: `Collapse the Search box and make it toggleable`,
        };
        this._tar = '#torSearchControl';
        this._height = '26px';
        this._isOpen = 'false';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchbox = document.querySelector(this._tar);
            if (searchbox) {
                // Adjust the title to make it clear it is a toggle button
                const title = searchbox.querySelector('.blockHeadCon h4');
                if (title) {
                    // Adjust text & style
                    title.innerHTML = 'Toggle Search';
                    title.style.cursor = 'pointer';
                    // Set up click listener
                    title.addEventListener('click', () => {
                        this._toggle(searchbox);
                    });
                }
                else {
                    console.error('Could not set up toggle! Target does not exist');
                }
                // Collapse the searchbox
                Util.setAttr(searchbox, {
                    style: `height:${this._height};overflow:hidden;`,
                });
                // Hide extra text
                const notification = document.querySelector('#mainBody > h3');
                const guideLink = document.querySelector('#mainBody > h3 ~ a');
                if (notification)
                    notification.style.display = 'none';
                if (guideLink)
                    guideLink.style.display = 'none';
                console.log('[M+] Collapsed the Search box!');
            }
            else {
                console.error('Could not collapse Search box! Target does not exist');
            }
        });
    }
    _toggle(elem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isOpen === 'false') {
                elem.style.height = 'unset';
                this._isOpen = 'true';
            }
            else {
                elem.style.height = this._height;
                this._isOpen = 'false';
            }
            if (MP.DEBUG)
                console.log('Toggled Search box!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generates linked tags from the site's plaintext tag field
 */
class BuildTags {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'buildTags',
            desc: `Generate clickable Tags automatically`,
        };
        this._tar = '#ssr';
        this._share = new Shared();
        /**
         * * Code to run for every search result
         * @param res A search result row
         */
        this._processTagString = (res) => {
            const tagline = res.querySelector('.torRowDesc');
            if (MP.DEBUG)
                console.group(tagline);
            // Assume brackets contain tags
            let tagString = tagline.innerHTML.replace(/(?:\[|\]|\(|\)|$)/gi, ',');
            // Remove HTML Entities and turn them into breaks
            tagString = tagString.split(/(?:&.{1,5};)/g).join(';');
            // Split tags at ',' and ';' and '>' and '|'
            let tags = tagString.split(/\s*(?:;|,|>|\||$)\s*/);
            // Remove empty or long tags
            tags = tags.filter((tag) => tag.length <= 30 && tag.length > 0);
            // Are tags already added? Only add if null
            const tagBox = res.querySelector('.mp_tags');
            if (tagBox === null) {
                this._injectLinks(tags, tagline);
            }
            if (MP.DEBUG) {
                console.log(tags);
                console.groupEnd();
            }
        };
        /**
         * * Injects the generated tags
         * @param tags Array of tags to add
         * @param tar The search result row that the tags will be added to
         */
        this._injectLinks = (tags, tar) => {
            if (tags.length > 0) {
                // Insert the new tag row
                const tagRow = document.createElement('span');
                tagRow.classList.add('mp_tags');
                tar.insertAdjacentElement('beforebegin', tagRow);
                tar.style.display = 'none';
                tagRow.insertAdjacentElement('afterend', document.createElement('br'));
                // Add the tags to the tag row
                tags.forEach((tag) => {
                    tagRow.innerHTML += `<a class='mp_tag' href='/tor/browse.php?tor%5Btext%5D=%22${encodeURIComponent(tag)}%22&tor%5BsrchIn%5D%5Btags%5D=true'>${tag}</a>`;
                });
            }
        };
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsList = this._share.getSearchList();
            // Build the tags
            resultsList
                .then((results) => {
                results.forEach((r) => this._processTagString(r));
                console.log('[M+] Built tag links!');
            })
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultsList = this._share.getSearchList();
                    resultsList.then((results) => {
                        // Build the tags again
                        results.forEach((r) => this._processTagString(r));
                        console.log('[M+] Built tag links!');
                    });
                });
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Random Book feature to open a new tab/window with a random MAM Book
 */
class RandomBook {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'randomBook',
            desc: `Add a button to open a randomly selected book page. (<em>Uses the currently selected category in the dropdown</em>)`,
        };
        this._tar = '#ssr';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let rando;
            const randoText = 'Random Book';
            // Queue building the button and getting the results
            yield Promise.all([
                (rando = Util.createButton('randomBook', randoText, 'h1', '#resetNewIcon', 'beforebegin', 'torFormButton')),
            ]);
            rando
                .then((btn) => {
                btn.addEventListener('click', () => {
                    let countResult;
                    let categories = '';
                    //get the Category dropdown element
                    const catSelection = (document.getElementById('categoryPartial'));
                    //get the value currently selected in Category Dropdown
                    const catValue = catSelection.options[catSelection.selectedIndex].value;
                    //depending on category selected, create a category string for the JSON GET
                    switch (String(catValue)) {
                        case 'ALL':
                            categories = '';
                            break;
                        case 'defaults':
                            categories = '';
                            break;
                        case 'm13':
                            categories = '&tor[main_cat][]=13';
                            break;
                        case 'm14':
                            categories = '&tor[main_cat][]=14';
                            break;
                        case 'm15':
                            categories = '&tor[main_cat][]=15';
                            break;
                        case 'm16':
                            categories = '&tor[main_cat][]=16';
                            break;
                        default:
                            if (catValue.charAt(0) === 'c') {
                                categories = '&tor[cat][]=' + catValue.substring(1);
                            }
                    }
                    Promise.all([
                        (countResult = this._getRandomBookResults(categories)),
                    ]);
                    countResult
                        .then((getRandomResult) => {
                        //open new tab with the random book
                        window.open('https://www.myanonamouse.net/t/' + getRandomResult, '_blank');
                    })
                        .catch((err) => {
                        throw new Error(err);
                    });
                }, false);
                console.log('[M+] Added the Random Book button!');
            })
                .catch((err) => {
                throw new Error(err);
            });
        });
    }
    /**
     * Filters search results
     * @param cat a string containing the categories needed for JSON Get
     */
    _getRandomBookResults(cat) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let jsonResult;
                //URL to GET random search results
                const url = `https://www.myanonamouse.net/tor/js/loadSearchJSONbasic.php?tor[searchType]=all&tor[searchIn]=torrents${cat}&tor[perpage]=5&tor[browseFlagsHideVsShow]=0&tor[startDate]=&tor[endDate]=&tor[hash]=&tor[sortType]=random&thumbnail=true?${Util.randomNumber(1, 100000)}`;
                Promise.all([(jsonResult = Util.getJSON(url))]).then(() => {
                    jsonResult
                        .then((jsonFull) => {
                        //return the first torrent ID of the random JSON text
                        resolve(JSON.parse(jsonFull).data[0].id);
                    })
                        .catch((err) => {
                        throw new Error(err);
                    });
                });
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * FREELEECH FEATURES
 */
class CollapseFreeleechSections {
    constructor() {
        this._settings = {
            scope: SettingGroup.Other,
            type: 'checkbox',
            title: 'collapseFreeleechSections',
            desc: 'Collapse Freeleech category sections and add quick-jump links',
        };
        this._tar = '#mainBody div[id^="fl_cat_"]';
        this._sectionContents = {};
        Util.startFeature(this._settings, this._tar, ['freeleech']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const sections = Array.from(document.querySelectorAll(this._tar));
        if (sections.length === 0) {
            console.warn('[M+] Could not find freeleech sections to collapse.');
            return;
        }
        const listBlock = sections[0].closest('.blockCon');
        if (listBlock !== null) {
            this._normalizeLayout(listBlock);
            this._buildToolbar(listBlock, sections);
        }
        sections.forEach((section) => this._collapseSection(section));
        console.log('[M+] Collapsed freeleech sections!');
    }
    _normalizeLayout(listBlock) {
        const blockBody = listBlock.querySelector('.blockBodyCon');
        const mainBody = document.querySelector('#mainBody');
        if (mainBody !== null) {
            mainBody.style.textAlign = 'left';
        }
        if (blockBody !== null) {
            blockBody.style.textAlign = 'left';
            blockBody.style.width = '100%';
            blockBody.style.maxWidth = '100%';
            blockBody.style.boxSizing = 'border-box';
        }
        listBlock.style.width = '100%';
        listBlock.style.maxWidth = '98%';
        listBlock.style.boxSizing = 'border-box';
    }
    _buildToolbar(listBlock, sections) {
        const toolbar = document.createElement('div');
        toolbar.className = 'mp_fl_toolbar';
        toolbar.style.marginBottom = '15px';
        const toggleAll = document.createElement('div');
        toggleAll.className = 'mp_plainBtn mp_fl_toggle_all';
        toggleAll.role = 'button';
        toggleAll.textContent = 'Expand All';
        const toc = document.createElement('div');
        toc.className = 'mp_fl_toc';
        toc.style.display = 'flex';
        toc.style.flexWrap = 'wrap';
        toc.style.gap = '6px';
        toc.style.marginTop = '8px';
        sections.forEach((section) => {
            const header = section.querySelector('a.biglink');
            if (header === null || header.textContent === null) {
                return;
            }
            const item = document.createElement('a');
            item.className = 'mp_plainBtn mp_fl_toc_item';
            item.href = `#${section.id}`;
            item.textContent = header.textContent.trim();
            item.style.marginRight = '6px';
            item.style.marginBottom = '6px';
            item.style.whiteSpace = 'nowrap';
            toc.appendChild(item);
        });
        toggleAll.addEventListener('click', () => {
            const shouldOpen = toggleAll.textContent === 'Expand All';
            sections.forEach((section) => this._setOpenState(section, shouldOpen));
            toggleAll.textContent = shouldOpen ? 'Collapse All' : 'Expand All';
        });
        toolbar.appendChild(toggleAll);
        toolbar.appendChild(toc);
        listBlock.insertAdjacentElement('beforebegin', toolbar);
    }
    _collapseSection(section) {
        const header = section.querySelector('a.biglink');
        if (header === null) {
            return;
        }
        section.classList.add('mp_fl_section');
        section.style.scrollMarginTop = '80px';
        section.style.display = 'block';
        section.style.width = '100%';
        section.style.boxSizing = 'border-box';
        const content = Array.from(section.children).filter((child) => child !== header);
        this._sectionContents[section.id] = content;
        const toggle = document.createElement('div');
        toggle.className = 'mp_plainBtn mp_fl_toggle';
        toggle.role = 'button';
        toggle.style.display = 'inline-block';
        toggle.style.marginLeft = '8px';
        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            this._setOpenState(section, !section.classList.contains('mp_fl_open'));
        });
        header.insertAdjacentElement('afterend', toggle);
        this._setOpenState(section, false);
    }
    _setOpenState(section, open) {
        const toggle = section.querySelector('.mp_fl_toggle');
        const content = this._sectionContents[section.id];
        if (toggle === null || content === undefined) {
            return;
        }
        if (open) {
            section.classList.add('mp_fl_open');
            content.forEach((elem) => {
                elem.style.display = '';
            });
            toggle.textContent = 'Hide';
        }
        else {
            section.classList.remove('mp_fl_open');
            content.forEach((elem) => {
                elem.style.display = 'none';
            });
            toggle.textContent = 'Show';
        }
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * * Allows gifting of FL wedge to members through forum.
 */
class ForumFLGift {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup.Forum,
            title: 'forumFLGift',
            desc: `Add a Thank button to forum posts. (<em>Sends a FL wedge</em>)`,
        };
        this._tar = '.forumLink';
        Util.startFeature(this._settings, this._tar, ['forum thread']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabling Forum Gift Button...');
            //mainBody is best element with an ID I could find that is a parent to all forum posts
            const mainBody = document.querySelector('#mainBody');
            //make array of forum posts - there is only one cursor classed object per forum post, so this was best to key off of. wish there were more IDs and such used in forums
            const forumPosts = Array.prototype.slice.call(mainBody.getElementsByClassName('coltable'));
            //for each post on the page
            forumPosts.forEach((forumPost) => {
                //work our way down the structure of the HTML to get to our post
                let bottomRow = forumPost.childNodes[1];
                bottomRow = bottomRow.childNodes[4];
                bottomRow = bottomRow.childNodes[3];
                //get the ID of the forum from the custom MAM attribute
                let postID = forumPost.previousSibling.getAttribute('name');
                //mam decided to have a different structure for last forum. wish they just had IDs or something instead of all this jumping around
                if (postID === 'last') {
                    postID = (forumPost.previousSibling.previousSibling).getAttribute('name');
                }
                //create a new element for our feature
                const giftElement = document.createElement('a');
                //set same class as other objects in area for same pointer and formatting options
                giftElement.setAttribute('class', 'cursor');
                //give our element an ID for future selection as needed
                giftElement.setAttribute('id', 'mp_' + postID + '_text');
                //create new img element to lead our new feature visuals
                const giftIconGif = document.createElement('img');
                //use site freeleech gif icon for our feature
                giftIconGif.setAttribute('src', 'https://cdn.myanonamouse.net/imagebucket/108303/thank.gif');
                //make the gif icon the first child of element
                giftElement.appendChild(giftIconGif);
                //add the feature element in line with the cursor object which is the quote and report buttons at bottom
                bottomRow.appendChild(giftElement);
                //make it a button via click listener
                giftElement.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    //to avoid button triggering more than once per page load, check if already have json result
                    if (giftElement.childNodes.length <= 1) {
                        //due to lack of IDs and conflicting query selectable elements, need to jump up a few parent levels
                        const postParentNode = giftElement.parentElement.parentElement
                            .parentElement;
                        //once at parent node of the post, find the poster's user id
                        const userElem = postParentNode.querySelector(`a[href^="/u/"]`);
                        //get the URL of the post to add to message
                        const postURL = (postParentNode.querySelector(`a[href^="/f/t/"]`)).getAttribute('href');
                        //get the name of the current MAM user sending gift
                        let sender = document.getElementById('userMenu').innerText;
                        //clean up text of sender obj
                        sender = sender.substring(0, sender.indexOf(' '));
                        //get the title of the page so we can write in message
                        let forumTitle = document.title;
                        //cut down fluff from page title
                        forumTitle = forumTitle.substring(22, forumTitle.indexOf('|') - 1);
                        //get the members name for JSON string
                        const userName = userElem.innerText;
                        //URL to GET a gift result
                        let url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=sendWedge&giftTo=${userName}&message=${sender} wants to thank you for your contribution to the forum topic [url=https://myanonamouse.net${postURL}]${forumTitle}[/url]`;
                        //make # URI compatible
                        url = url.replace('#', '%23');
                        //use MAM+ json get utility to process URL and return results
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        //if gift was successfully sent
                        if (JSON.parse(jsonResult).success) {
                            //add the feature text to show success
                            giftElement.appendChild(document.createTextNode('FL Gift Successful!'));
                            //based on failure, add feature text to show failure reason or generic
                        }
                        else if (JSON.parse(jsonResult).error ===
                            'You can only send a user one wedge per day.') {
                            giftElement.appendChild(document.createTextNode('Failed: Already Gifted This User Today!'));
                        }
                        else if (JSON.parse(jsonResult).error ===
                            'Invalid user, this user is not currently accepting wedges') {
                            giftElement.appendChild(document.createTextNode('Failed: This User Does Not Accept Gifts!'));
                        }
                        else {
                            //only known example of this 'other' is when gifting yourself
                            giftElement.appendChild(document.createTextNode('FL Gift Failed!'));
                        }
                    }
                }), false);
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ### Adds ability to gift newest 10 members to MAM on Homepage or open their user pages
 */
class GiftNewest {
    constructor() {
        /* TODO: Refactor code to reduce duplication. */
        this._settings = {
            scope: SettingGroup.Home,
            type: 'checkbox',
            title: 'giftNewest',
            desc: `Add buttons to Gift/Open all newest members`,
        };
        this._tar = '#mainTable';
        Util.startFeature(this._settings, this._tar, ['home', 'new users']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    /**
     * * Decide which page to run on
     */
    _init() {
        Check.page().then((page) => {
            if (MP.DEBUG)
                console.log('User gifting init on', page);
            if (page === 'home') {
                this._homePageGifting();
            }
            else if (page === 'new users') {
                this._newUsersPageGifting();
            }
        });
    }
    /**
     * * Function that runs on the Home page
     */
    _homePageGifting() {
        return __awaiter(this, void 0, void 0, function* () {
            //ensure gifted list is under 500 member names long
            this._trimGiftList();
            //get the FrontPage NewMembers element containing newest 10 members
            const fpNM = document.querySelector('#fpNM');
            const members = Array.prototype.slice.call(fpNM.getElementsByTagName('a'));
            const lastMem = members[members.length - 1];
            members.forEach((member) => {
                //add a class to the existing element for use in reference in creating buttons
                member.setAttribute('class', `mp_refPoint_${Util.endOfHref(member)}`);
                //if the member has been gifted through this feature previously
                if (GM_getValue('mp_lastNewGifted').indexOf(Util.endOfHref(member)) >= 0) {
                    //add checked box to text
                    member.innerText = `${member.innerText} ✅`;
                    member.classList.add('mp_gifted');
                }
            });
            //get the default value of gifts set in preferences for user page
            let giftValueSetting = GM_getValue('userGiftDefault_val');
            //make sure the value falls within the acceptable range
            // TODO: Make the gift value check into a Util
            if (!giftValueSetting) {
                giftValueSetting = '100';
            }
            else if (Number(giftValueSetting) > 100 || isNaN(Number(giftValueSetting))) {
                giftValueSetting = '100';
            }
            else if (Number(giftValueSetting) < 5) {
                giftValueSetting = '5';
            }
            //create the text input for how many points to give
            const giftAmounts = document.createElement('input');
            Util.setAttr(giftAmounts, {
                type: 'text',
                size: '3',
                id: 'mp_giftAmounts',
                title: 'Value between 5 and 100',
                value: giftValueSetting,
            });
            //insert the text box after the last members name
            lastMem.insertAdjacentElement('afterend', giftAmounts);
            //make the button and insert after the last members name (before the input text)
            const giftAllBtn = yield Util.createButton('giftAll', 'Gift All: ', 'button', `.mp_refPoint_${Util.endOfHref(lastMem)}`, 'afterend', 'mp_btn');
            //add a space between button and text
            giftAllBtn.style.marginRight = '5px';
            giftAllBtn.style.marginTop = '5px';
            giftAllBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                let firstCall = true;
                for (const member of members) {
                    //update the text to show processing
                    document.getElementById('mp_giftAllMsg').innerText =
                        'Sending Gifts... Please Wait';
                    //if user has not been gifted
                    if (!member.classList.contains('mp_gifted')) {
                        //get the members name for JSON string
                        const userName = member.innerText;
                        //get the points amount from the input box
                        const giftFinalAmount = (document.getElementById('mp_giftAmounts')).value;
                        //URL to GET random search results
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}`;
                        //wait 3 seconds between JSON calls
                        if (firstCall) {
                            firstCall = false;
                        }
                        else {
                            yield Util.sleep(3000);
                        }
                        //request sending points
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        //if gift was successfully sent
                        if (JSON.parse(jsonResult).success) {
                            //check off box
                            member.innerText = `${member.innerText} \u2611`;
                            member.classList.add('mp_gifted');
                            //add member to the stored member list
                            GM_setValue('mp_lastNewGifted', `${Util.endOfHref(member)},${GM_getValue('mp_lastNewGifted')}`);
                        }
                        else if (!JSON.parse(jsonResult).success) {
                            console.warn(JSON.parse(jsonResult).error);
                        }
                    }
                }
                //disable button after send
                giftAllBtn.disabled = true;
                document.getElementById('mp_giftAllMsg').innerText =
                    'Gifts completed to all Checked Users';
            }), false);
            //newline between elements
            members[members.length - 1].after(document.createElement('br'));
            //listen for changes to the input box and ensure its between 5 and 1000, if not disable button
            document.getElementById('mp_giftAmounts').addEventListener('input', () => {
                const valueToNumber = (document.getElementById('mp_giftAmounts')).value;
                const giftAll = document.getElementById('mp_giftAll');
                if (Number(valueToNumber) > 1000 ||
                    Number(valueToNumber) < 5 ||
                    isNaN(Number(valueToNumber))) {
                    giftAll.disabled = true;
                    giftAll.setAttribute('title', 'Disabled');
                }
                else {
                    giftAll.disabled = false;
                    giftAll.setAttribute('title', `Gift All ${valueToNumber}`);
                }
            });
            //add a button to open all ungifted members in new tabs
            const openAllBtn = yield Util.createButton('openTabs', 'Open Ungifted In Tabs', 'button', '[id=mp_giftAmounts]', 'afterend', 'mp_btn');
            openAllBtn.setAttribute('title', 'Open new tab for each');
            openAllBtn.addEventListener('click', () => {
                for (const member of members) {
                    if (!member.classList.contains('mp_gifted')) {
                        window.open(member.href, '_blank');
                    }
                }
            }, false);
            //get the current amount of bonus points available to spend
            let bonusPointsAvail = document.getElementById('tmBP').innerText;
            //get rid of the delta display
            if (bonusPointsAvail.indexOf('(') >= 0) {
                bonusPointsAvail = bonusPointsAvail.substring(0, bonusPointsAvail.indexOf('('));
            }
            //recreate the bonus points in new span and insert into fpNM
            const messageSpan = document.createElement('span');
            messageSpan.setAttribute('id', 'mp_giftAllMsg');
            messageSpan.innerText = 'Available ' + bonusPointsAvail;
            document.getElementById('mp_giftAmounts').after(messageSpan);
            document.getElementById('mp_giftAllMsg').after(document.createElement('br'));
            document
                .getElementById('mp_giftAllMsg')
                .insertAdjacentHTML('beforebegin', '<br>');
            console.log(`[M+] Adding gift new members button to Home page...`);
        });
    }
    /**
     * * Function that runs on the New Users page
     */
    _newUsersPageGifting() {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure the gifted list is under 500 members
            this._trimGiftList();
            // Select the container holding the newest members
            const fpNM = document.querySelector('.blockCon');
            const footer = document.querySelector('.blockFoot');
            const memberLabels = Array.from(fpNM.querySelectorAll('label'));
            // Loop through each member and check if they were previously gifted
            memberLabels.forEach((label) => {
                const member = label.querySelector('a');
                const checkbox = label.querySelector('input[type="checkbox"]');
                const memberRef = `mp_refPoint_${Util.endOfHref(member)}`;
                member.classList.add(memberRef);
                // If the member has already been gifted, update the display
                if (GM_getValue('mp_lastNewGifted').includes(Util.endOfHref(member))) {
                    member.innerText += ' ✅';
                    member.classList.add('mp_gifted');
                }
            });
            // Retrieve or default the gift value setting
            let giftValueSetting = GM_getValue('userGiftDefault_val') || '100';
            giftValueSetting = Math.min(100, Math.max(5, Number(giftValueSetting))) || 100;
            // Create input box for gift amount
            const giftAmounts = document.createElement('input');
            Util.setAttr(giftAmounts, {
                type: 'text',
                size: '3',
                id: 'mp_giftAmounts',
                title: 'Value between 5 and 100',
                value: String(giftValueSetting),
            });
            let bpText = document.createElement('span');
            bpText.innerText = 'points ';
            // Create "Gift All Checked Users" button
            const giftAllBtn = yield Util.createButton('mp_giftAll', 'Gift All Selected', 'button', footer, 'afterend', 'mp_btn');
            giftAllBtn.style.marginRight = '5px';
            giftAllBtn.style.marginTop = '5px';
            // Event listener for gifting action
            giftAllBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                document.getElementById('mp_giftAllMsg').innerText = 'Sending Gifts... Please Wait';
                let firstCall = true;
                const giftAmount = document.getElementById('mp_giftAmounts').value;
                for (const label of memberLabels) {
                    const member = label.querySelector('a');
                    const checkbox = label.querySelector('input[type="checkbox"]');
                    if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                        const userName = member.innerText;
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftAmount}&giftTo=${userName}`;
                        if (!firstCall)
                            yield Util.sleep(3000);
                        firstCall = false;
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        if (JSON.parse(jsonResult).success) {
                            member.innerText += ' ✅';
                            member.classList.add('mp_gifted');
                            GM_setValue('mp_lastNewGifted', `${Util.endOfHref(member)},${GM_getValue('mp_lastNewGifted')}`);
                        }
                        else {
                            console.warn(JSON.parse(jsonResult).error);
                        }
                    }
                }
                giftAllBtn.disabled = true;
                document.getElementById('mp_giftAllMsg').innerText = 'Gifts completed to all Checked Users';
            }));
            // Input validation for gift amount
            giftAmounts.addEventListener('input', () => {
                const giftAllBtn = document.getElementById('mp_giftAll');
                const value = Number(giftAmounts.value);
                if (value < 5 || value > 100 || isNaN(value)) {
                    giftAllBtn.disabled = true;
                    giftAllBtn.title = 'Disabled';
                }
                else {
                    giftAllBtn.disabled = false;
                    giftAllBtn.title = `Gift All ${value}`;
                }
            });
            // Create "Open Ungifted in Tabs" button
            const openAllBtn = yield Util.createButton('mp_openTabs', 'Open Ungifted in Tabs', 'button', footer, 'afterend', 'mp_btn');
            openAllBtn.title = 'Open a new tab for each ungifted member';
            openAllBtn.addEventListener('click', () => {
                for (const label of memberLabels) {
                    const member = label.querySelector('a');
                    const checkbox = label.querySelector('input[type="checkbox"]');
                    if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                        window.open(member.href, '_blank');
                    }
                }
            });
            // Display available bonus points in the footer
            let bonusPointsAvail = document.getElementById('tmBP').innerText.split(':')[1];
            const messageSpan = document.createElement('span');
            messageSpan.id = 'mp_giftAllMsg';
            messageSpan.innerText = ` Available Points: ${bonusPointsAvail}`;
            // Add "Deselect All" button
            const deselectBtn = yield Util.createButton('mp_deselectAll', 'Unselect all', 'button', footer, 'afterend', 'mp_btn');
            deselectBtn.addEventListener('click', () => {
                const boxList = document.querySelectorAll('input[type=checkbox]');
                boxList.forEach((box) => {
                    box.checked = false;
                });
            });
            // Add "Select 100 Ungifted" button
            const selectUngiftedBtn = yield Util.createButton('mp_selectUngifted', 'Select 100 Ungifted', 'button', footer, 'afterend', 'mp_btn');
            selectUngiftedBtn.title = 'Select the first 100 ungifted users';
            selectUngiftedBtn.addEventListener('click', () => {
                let count = 0;
                for (const label of memberLabels) {
                    const member = label.querySelector('a');
                    const checkbox = label.querySelector('input[type="checkbox"]');
                    // Check if the member is not gifted and if the checkbox is not yet selected
                    if (!member.classList.contains('mp_gifted') && !checkbox.checked) {
                        checkbox.checked = true; // Select the checkbox
                        count++;
                        // Stop after selecting 100 users
                        if (count >= 100)
                            break;
                    }
                }
                console.log(`[M+] Selected ${count} ungifted users.`);
            });
            // Append all elements to the footer
            footer.appendChild(selectUngiftedBtn);
            footer.appendChild(deselectBtn);
            footer.appendChild(giftAmounts);
            footer.appendChild(bpText);
            footer.appendChild(giftAllBtn);
            footer.appendChild(openAllBtn);
            footer.appendChild(messageSpan);
            console.log('[M+] Added gifting options to the footer of the page.');
        });
    }
    /**
     * * Trims the gifted list to last 500 names to avoid getting too large over time.
     */
    _trimGiftList() {
        //if value exists in GM
        if (GM_getValue('mp_lastNewGifted')) {
            //GM value is a comma delim value, split value into array of names
            const giftNames = GM_getValue('mp_lastNewGifted').split(',');
            let newGiftNames = '';
            if (giftNames.length > 500) {
                for (const giftName of giftNames) {
                    if (giftNames.indexOf(giftName) <= 499) {
                        //rebuild a comma delim string out of the first 49 names
                        newGiftNames = newGiftNames + giftName + ',';
                        //set new string in GM
                        GM_setValue('mp_lastNewGifted', newGiftNames);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        else {
            //set value if doesnt exist
            GM_setValue('mp_lastNewGifted', '');
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ### Adds ability to hide news items on the page
 */
class HideNews {
    constructor() {
        this._settings = {
            scope: SettingGroup.Home,
            title: 'hideNews',
            type: 'checkbox',
            desc: 'Tidy the homepage and allow News to be hidden',
        };
        this._tar = '.mainPageNewsHead';
        this._valueTitle = `mp_${this._settings.title}_val`;
        this._icon = '\u274e';
        this._checkForSeen = () => __awaiter(this, void 0, void 0, function* () {
            const prevValue = GM_getValue(this._valueTitle);
            const news = this._getNewsItems();
            if (MP.DEBUG)
                console.log(this._valueTitle, ':\n', prevValue);
            if (prevValue && news) {
                // Use the icon to split out the known hidden messages
                const hiddenArray = prevValue.split(this._icon);
                /* If any of the hidden messages match a current message
                    remove the current message from the DOM */
                hiddenArray.forEach((hidden) => {
                    news.forEach((entry) => {
                        if (entry.textContent === hidden) {
                            entry.remove();
                        }
                    });
                });
                // If there are no current messages, hide the header
                if (!document.querySelector('.mainPageNewsSub')) {
                    this._adjustHeaderSize(this._tar, false);
                }
            }
            else {
                return;
            }
        });
        this._removeClock = () => {
            const clock = document.querySelector('#mainBody .fpTime');
            if (clock)
                clock.remove();
        };
        this._adjustHeaderSize = (selector, visible) => {
            const newsHeader = document.querySelector(selector);
            if (newsHeader) {
                if (visible === false) {
                    newsHeader.style.display = 'none';
                }
                else {
                    newsHeader.style.fontSize = '2em';
                }
            }
        };
        this._addHiderButton = () => {
            const news = this._getNewsItems();
            if (!news)
                return;
            // Loop over each news entry
            news.forEach((entry) => {
                // Create a button
                const xbutton = document.createElement('div');
                xbutton.textContent = this._icon;
                Util.setAttr(xbutton, {
                    style: 'display:inline-block;margin-right:0.7em;cursor:pointer;',
                    class: 'mp_clearBtn',
                });
                // Listen for clicks
                xbutton.addEventListener('click', () => {
                    // When clicked, append the content of the current news post to the
                    // list of remembered news items
                    const previousValue = GM_getValue(this._valueTitle)
                        ? GM_getValue(this._valueTitle)
                        : '';
                    if (MP.DEBUG)
                        console.log(`Hiding... ${previousValue}${entry.textContent}`);
                    GM_setValue(this._valueTitle, `${previousValue}${entry.textContent}`);
                    entry.remove();
                    // If there are no more news items, remove the header
                    const updatedNews = this._getNewsItems();
                    if (updatedNews && updatedNews.length < 1) {
                        this._adjustHeaderSize(this._tar, false);
                    }
                });
                // Add the button as the first child of the entry
                if (entry.firstChild)
                    entry.firstChild.before(xbutton);
            });
        };
        this._cleanValues = (num = 3) => {
            let value = GM_getValue(this._valueTitle);
            if (MP.DEBUG)
                console.log(`GM_getValue(${this._valueTitle})`, value);
            if (value) {
                // Return the last 3 stored items after splitting them at the icon
                value = Util.arrayToString(value.split(this._icon).slice(0 - num));
                // Store the new value
                GM_setValue(this._valueTitle, value);
            }
        };
        this._getNewsItems = () => {
            return document.querySelectorAll('div[class^="mainPageNews"]');
        };
        Util.startFeature(this._settings, this._tar, ['home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // NOTE: for development
            // GM_deleteValue(this._valueTitle);console.warn(`Value of ${this._valueTitle} will be deleted!`);
            this._removeClock();
            this._adjustHeaderSize(this._tar);
            yield this._checkForSeen();
            this._addHiderButton();
            // this._cleanValues(); // FIX: Not working as intended
            console.log('[M+] Cleaned up the home page!');
        });
    }
    // This must match the type selected for `this._settings`
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/**
 * # REQUEST PAGE FEATURES
 */
/**
 * * Hide requesters who are set to "hidden"
 */
class ToggleHiddenRequesters {
    constructor() {
        this._settings = {
            scope: SettingGroup.Requests,
            type: 'checkbox',
            title: 'toggleHiddenRequesters',
            desc: `Hide hidden requesters`,
        };
        this._tar = '#torRows';
        this._hide = true;
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._addToggleSwitch();
            this._searchList = yield this._getRequestList();
            this._filterResults(this._searchList);
            Check.elemObserver(this._tar, () => __awaiter(this, void 0, void 0, function* () {
                this._searchList = yield this._getRequestList();
                this._filterResults(this._searchList);
            }));
        });
    }
    _addToggleSwitch() {
        // Make a new button and insert beside the Search button
        Util.createButton('showHidden', 'Show Hidden', 'div', '#requestSearch .torrentSearch', 'afterend', 'torFormButton');
        // Select the new button and add a click listener
        const toggleSwitch = (document.querySelector('#mp_showHidden'));
        toggleSwitch.addEventListener('click', () => {
            const hiddenList = document.querySelectorAll('#torRows > .mp_hidden');
            if (this._hide) {
                this._hide = false;
                toggleSwitch.innerText = 'Hide Hidden';
                hiddenList.forEach((item) => {
                    item.style.display = 'list-item';
                    item.style.opacity = '0.5';
                });
            }
            else {
                this._hide = true;
                toggleSwitch.innerText = 'Show Hidden';
                hiddenList.forEach((item) => {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                });
            }
        });
    }
    _getRequestList() {
        return new Promise((resolve, reject) => {
            // Wait for the requests to exist
            Check.elemLoad('#torRows .torRow .torRight').then(() => {
                // Grab all requests
                const reqList = document.querySelectorAll('#torRows .torRow');
                if (reqList === null || reqList === undefined) {
                    reject(`reqList is ${reqList}`);
                }
                else {
                    resolve(reqList);
                }
            });
        });
    }
    _filterResults(list) {
        list.forEach((request) => {
            const requester = request.querySelector('.torRight a');
            if (requester === null) {
                request.style.display = 'none';
                request.classList.add('mp_hidden');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generate a plaintext list of request results
 */
class PlaintextRequest {
    constructor() {
        this._settings = {
            scope: SettingGroup.Requests,
            type: 'checkbox',
            title: 'plaintextRequest',
            desc: `Insert plaintext request results at top of request page`,
        };
        this._tar = '#ssr';
        this._isOpen = GM_getValue(`${this._settings.title}State`);
        this._plainText = '';
        this._getRequestList = () => {
            if (MP.DEBUG)
                console.log(`Shared.getSearchList( )`);
            return new Promise((resolve, reject) => {
                // Wait for the request results to exist
                Check.elemLoad('#torRows .torRow a').then(() => {
                    // Select all request results
                    const snatchList = (document.querySelectorAll('#torRows .torRow'));
                    if (snatchList === null || snatchList === undefined) {
                        reject(`snatchList is ${snatchList}`);
                    }
                    else {
                        resolve(snatchList);
                    }
                });
            });
        };
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggleBtn;
            let copyBtn;
            let resultList;
            // Queue building the toggle button and getting the results
            yield Promise.all([
                (toggleBtn = Util.createButton('plainToggle', 'Show Plaintext', 'div', '#ssr', 'beforebegin', 'mp_toggle mp_plainBtn')),
                (resultList = this._getRequestList()),
            ]);
            // Process the results into plaintext
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                // Build the copy button
                copyBtn = yield Util.createButton('plainCopy', 'Copy Plaintext', 'div', '#mp_plainToggle', 'afterend', 'mp_copy mp_plainBtn');
                // Build the plaintext box
                copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);
                // Insert plaintext results
                this._plainText = yield this._processResults(res);
                document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch').innerHTML = '';
                    resultList = this._getRequestList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        // Insert plaintext results
                        this._plainText = yield this._processResults(res);
                        document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                    }));
                });
            });
            // Init open state
            this._setOpenState(this._isOpen);
            // Set up toggle button functionality
            toggleBtn
                .then((btn) => {
                btn.addEventListener('click', () => {
                    // Textbox should exist, but just in case...
                    const textbox = document.querySelector('.mp_plaintextSearch');
                    if (textbox === null) {
                        throw new Error(`textbox doesn't exist!`);
                    }
                    else if (this._isOpen === 'false') {
                        this._setOpenState('true');
                        textbox.style.display = 'block';
                        btn.innerText = 'Hide Plaintext';
                    }
                    else {
                        this._setOpenState('false');
                        textbox.style.display = 'none';
                        btn.innerText = 'Show Plaintext';
                    }
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            console.log('[M+] Inserted plaintext request results!');
        });
    }
    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    _setOpenState(val) {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }
    _processResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            let outp = '';
            results.forEach((node) => {
                // Reset each text field
                let title = '';
                let seriesTitle = '';
                let authTitle = '';
                let narrTitle = '';
                // Break out the important data from each node
                const rawTitle = node.querySelector('.torTitle');
                const seriesList = node.querySelectorAll('.series');
                const authList = node.querySelectorAll('.author');
                const narrList = node.querySelectorAll('.narrator');
                if (rawTitle === null) {
                    console.warn('Error Node:', node);
                    throw new Error(`Result title should not be null`);
                }
                else {
                    title = rawTitle.textContent.trim();
                }
                // Process series
                if (seriesList !== null && seriesList.length > 0) {
                    seriesList.forEach((series) => {
                        seriesTitle += `${series.textContent} / `;
                    });
                    // Remove trailing slash from last series, then style
                    seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                    seriesTitle = ` (${seriesTitle})`;
                }
                // Process authors
                if (authList !== null && authList.length > 0) {
                    authTitle = 'BY ';
                    authList.forEach((auth) => {
                        authTitle += `${auth.textContent} AND `;
                    });
                    // Remove trailing AND
                    authTitle = authTitle.substring(0, authTitle.length - 5);
                }
                // Process narrators
                if (narrList !== null && narrList.length > 0) {
                    narrTitle = 'FT ';
                    narrList.forEach((narr) => {
                        narrTitle += `${narr.textContent} AND `;
                    });
                    // Remove trailing AND
                    narrTitle = narrTitle.substring(0, narrTitle.length - 5);
                }
                outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
            });
            return outp;
        });
    }
    get settings() {
        return this._settings;
    }
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(val) {
        this._setOpenState(val);
    }
}
class GoodreadsButtonReq {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'goodreadsButtonReq',
            scope: SettingGroup.Requests,
            desc: 'Enable MAM-to-Goodreads buttons for requests',
        };
        this._tar = '#fillTorrent';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['request details']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert row structure into searchable object
            const reqRows = Util.rowsToObj(document.querySelectorAll('#torDetMainCon > div'));
            // Select the data points
            const bookData = reqRows['Title:'].querySelector('span');
            const authorData = reqRows['Author(s):'].querySelectorAll('a');
            const seriesData = reqRows['Series:']
                ? reqRows['Series:'].querySelectorAll('a')
                : null;
            const target = reqRows['Release Date'];
            // Generate buttons
            this._share.goodreadsButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Process & return information from the shoutbox
 */
class ProcessShouts {
    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param names (Optional) List of usernames/IDs to filter for
     * @param usertype (Optional) What filter the names are for. Required if `names` is provided
     */
    static watchShoutbox(tar, names, usertype) {
        // Observe the shoutbox
        Check.elemObserver(tar, (mutList) => {
            // When the shoutbox updates, process the information
            mutList.forEach((mutRec) => {
                // Get the changed nodes
                mutRec.addedNodes.forEach((node) => {
                    const nodeData = Util.nodeToElem(node);
                    // If the node is added by MAM+ for gift button, ignore
                    // Also ignore if the node is a date break
                    if (/^mp_/.test(nodeData.getAttribute('id')) ||
                        nodeData.classList.contains('dateBreak')) {
                        return;
                    }
                    // If we're looking for specific users...
                    if (names !== undefined && names.length > 0) {
                        if (usertype === undefined) {
                            throw new Error('Usertype must be defined if filtering names!');
                        }
                        // Extract
                        const userID = this.extractFromShout(node, 'a[href^="/u/"]', 'href');
                        const userName = this.extractFromShout(node, 'a > span', 'text');
                        // Filter
                        names.forEach((name) => {
                            if (`/u/${name}` === userID ||
                                Util.caselessStringMatch(name, userName)) {
                                this.styleShout(node, usertype);
                            }
                        });
                    }
                });
            });
        }, { childList: true });
    }
    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param buttons Number to represent checkbox selections 1 = Reply, 2 = Reply With Quote
     * @param charLimit Number of characters to include in quote, , charLimit?:number - Currently unused
     */
    static watchShoutboxReply(tar, buttons) {
        if (MP.DEBUG)
            console.log('watchShoutboxReply(', tar, buttons, ')');
        const _getUID = (node) => this.extractFromShout(node, 'a[href^="/u/"]', 'href');
        const _getRawColor = (elem) => {
            if (elem.style.backgroundColor) {
                return elem.style.backgroundColor;
            }
            else if (elem.style.color) {
                return elem.style.color;
            }
            else {
                return null;
            }
        };
        const _getNameColor = (elem) => {
            if (elem) {
                const rawColor = _getRawColor(elem);
                if (rawColor) {
                    // Convert to hex
                    const rgb = Util.bracketContents(rawColor).split(',');
                    return Util.rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
                }
                else {
                    return null;
                }
            }
            else {
                throw new Error(`Element is null!\n${elem}`);
            }
        };
        const _makeNameTag = (name, hex, uid) => {
            uid = uid.match(/\d+/g).join(''); // Get the UID, but only the digits
            hex = hex ? `;${hex}` : ''; // If there is a hex value, prepend `;`
            return `@[ulink=${uid}${hex}]${name}[/ulink]`;
        };
        // Get the reply box
        const replyBox = document.getElementById('shbox_text');
        // Observe the shoutbox
        Check.elemObserver(tar, (mutList) => {
            // When the shoutbox updates, process the information
            mutList.forEach((mutRec) => {
                // Get the changed nodes
                mutRec.addedNodes.forEach((node) => {
                    const nodeData = Util.nodeToElem(node);
                    // If the node is added by MAM+ for gift button, ignore
                    // Also ignore if the node is a date break
                    if (/^mp_/.test(nodeData.getAttribute('id')) ||
                        nodeData.classList.contains('dateBreak')) {
                        return;
                    }
                    // Select the name information
                    const shoutName = Util.nodeToElem(node).querySelector('a[href^="/u/"] span');
                    // Grab the background color of the name, or text color
                    const nameColor = _getNameColor(shoutName);
                    //extract the username from node for use in reply
                    const userName = this.extractFromShout(node, 'a > span', 'text');
                    const userID = this.extractFromShout(node, 'a[href^="/u/"]', 'href');
                    //create a span element to be body of button added to page - button uses relative node context at click time to do calculations
                    const replyButton = document.createElement('span');
                    //if this is a ReplySimple request, then create Reply Simple button
                    if (buttons === 1) {
                        //create button with onclick action of setting sb text field to username with potential color block with a colon and space to reply, focus cursor in text box
                        replyButton.innerHTML = '<button>\u293a</button>';
                        replyButton
                            .querySelector('button')
                            .addEventListener('click', () => {
                            // Add the styled name tag to the reply box
                            // If nothing was in the reply box, add a colon
                            if (replyBox.value === '') {
                                replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: `;
                            }
                            else {
                                replyBox.value = `${replyBox.value} ${_makeNameTag(userName, nameColor, userID)} `;
                            }
                            replyBox.focus();
                        });
                    }
                    //if this is a replyQuote request, then create reply quote button
                    else if (buttons === 2) {
                        //create button with onclick action of getting that line's text, stripping down to 65 char with no word break, then insert into SB text field, focus cursor in text box
                        replyButton.innerHTML = '<button>\u293d</button>';
                        replyButton
                            .querySelector('button')
                            .addEventListener('click', () => {
                            const text = this.quoteShout(node, 65);
                            if (text !== '') {
                                // Add quote to reply box
                                replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: \u201c[i]${text}[/i]\u201d `;
                                replyBox.focus();
                            }
                            else {
                                // Just reply
                                replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: `;
                                replyBox.focus();
                            }
                        });
                    }
                    //give span an ID for potential use later
                    replyButton.setAttribute('class', 'mp_replyButton');
                    //insert button prior to username or another button
                    node.insertBefore(replyButton, node.childNodes[2]);
                });
            });
        }, { childList: true });
    }
    static quoteShout(shout, length) {
        const textArr = [];
        // Get number of reply buttons to remove from text
        const btnCount = shout.firstChild.parentElement.querySelectorAll('.mp_replyButton').length;
        // Get the text of all child nodes
        shout.childNodes.forEach((child) => {
            /* If the child is a node with children (ex. not plain text) check to see if
            the child is a link. If the link does NOT start with `/u/` (indicating a user)
            then change the link to the string `[Link]`.
            In all other cases, return the child text content. */
            if (child.childNodes.length > 0) {
                const childElem = Util.nodeToElem(child);
                if (!childElem.hasAttribute('href')) {
                    textArr.push(child.textContent);
                }
                else if (childElem.getAttribute('href').indexOf('/u/') < 0) {
                    textArr.push('[Link]');
                }
                else {
                    textArr.push(child.textContent);
                }
            }
            else {
                textArr.push(child.textContent);
            }
        });
        // Make a string, but toss out the first few nodes
        let nodeText = textArr.slice(3 + btnCount).join('');
        if (nodeText.indexOf(':') === 0) {
            nodeText = nodeText.substr(2);
        }
        // At this point we should have just the message text.
        // Remove any quotes that might be contained:
        nodeText = nodeText.replace(/\u{201c}(.*?)\u{201d}/gu, '');
        // Trim the text to a max length and add ... if shortened
        let trimmedText = Util.trimString(nodeText.trim(), length);
        if (trimmedText !== nodeText.trim()) {
            trimmedText += ' [\u2026]';
        }
        // Done!
        return trimmedText;
    }
    /**
     * Extract information from shouts
     * @param shout The node containing shout info
     * @param tar The element selector string
     * @param get The requested info (href or text)
     * @returns The string that was specified
     */
    static extractFromShout(shout, tar, get) {
        const nodeData = Util.nodeToElem(shout).classList.contains('dateBreak');
        if (shout !== null && !nodeData) {
            const shoutElem = Util.nodeToElem(shout).querySelector(tar);
            if (shoutElem !== null) {
                let extracted;
                if (get !== 'text') {
                    extracted = shoutElem.getAttribute(get);
                }
                else {
                    extracted = shoutElem.textContent;
                }
                if (extracted !== null) {
                    return extracted;
                }
                else {
                    throw new Error('Could not extract shout! Attribute was null');
                }
            }
            else {
                throw new Error('Could not extract shout! Element was null');
            }
        }
        else {
            throw new Error('Could not extract shout! Node was null');
        }
    }
    /**
     * Change the style of a shout based on filter lists
     * @param shout The node containing shout info
     * @param usertype The type of users that have been filtered
     */
    static styleShout(shout, usertype) {
        const shoutElem = Util.nodeToElem(shout);
        if (usertype === 'priority') {
            const customStyle = GM_getValue('priorityStyle_val');
            if (customStyle) {
                shoutElem.style.background = `hsla(${customStyle})`;
            }
            else {
                shoutElem.style.background = 'hsla(0,0%,50%,0.3)';
            }
        }
        else if (usertype === 'mute') {
            shoutElem.classList.add('mp_muted');
        }
    }
}
class PriorityUsers {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'priorityUsers',
            tag: 'Emphasize Users',
            placeholder: 'ex. system, 25420, 77618',
            desc: 'Emphasizes messages from the listed users in the shoutbox. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)',
        };
        this._tar = '.sbf div';
        this._priorityUsers = [];
        this._userType = 'priority';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gmValue = GM_getValue(`${this.settings.title}_val`);
            if (gmValue !== undefined) {
                this._priorityUsers = yield Util.csvToArray(gmValue);
            }
            else {
                throw new Error('Userlist is not defined!');
            }
            ProcessShouts.watchShoutbox(this._tar, this._priorityUsers, this._userType);
            console.log(`[M+] Highlighting users in the shoutbox...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows a custom background to be applied to priority users
 */
class PriorityStyle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'priorityStyle',
            tag: 'Emphasis Style',
            placeholder: 'default: 0, 0%, 50%, 0.3',
            desc: `Change the color/opacity of the highlighting rule for emphasized users' posts. (<em>This is formatted as Hue (0-360), Saturation (0-100%), Lightness (0-100%), Opacity (0-1)</em>)`,
        };
        this._tar = '.sbf div';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Setting custom highlight for priority users...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows a custom background to be applied to desired muted users
 */
class MutedUsers {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'mutedUsers',
            tag: 'Mute users',
            placeholder: 'ex. 1234, gardenshade',
            desc: `Obscures messages from the listed users in the shoutbox until hovered. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)`,
        };
        this._tar = '.sbf div';
        this._mutedUsers = [];
        this._userType = 'mute';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gmValue = GM_getValue(`${this.settings.title}_val`);
            if (gmValue !== undefined) {
                this._mutedUsers = yield Util.csvToArray(gmValue);
            }
            else {
                throw new Error('Userlist is not defined!');
            }
            ProcessShouts.watchShoutbox(this._tar, this._mutedUsers, this._userType);
            console.log(`[M+] Obscuring muted users...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Gift button to be added to Shout Triple dot menu
 */
class GiftButton {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'giftButton',
            desc: `Places a Gift button in Shoutbox dot-menu`,
        };
        this._tar = '.sbf';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Initialized Gift Button.`);
            const sbfDiv = document.getElementById('sbf');
            const sbfDivChild = sbfDiv.firstChild;
            //add event listener for whenever something is clicked in the sbf div
            sbfDiv.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
                //pull the event target into an HTML Element
                const target = e.target;
                //add the Triple Dot Menu as an element
                const sbMenuElem = target.closest('.sb_menu');
                //find the message div
                const sbMenuParent = target.closest(`div`);
                //get the full text of the message div
                let giftMessage = sbMenuParent.innerText;
                //format message with standard text + message contents + server time of the message
                giftMessage =
                    `Sent on Shoutbox message: "` +
                        giftMessage.substring(giftMessage.indexOf(': ') + 2) +
                        `" at ` +
                        giftMessage.substring(0, 8);
                //if the target of the click is not the Triple Dot Menu OR
                //if menu is one of your own comments (only works for first 10 minutes of comment being sent)
                if (!target.closest('.sb_menu') ||
                    sbMenuElem.getAttribute('data-ee') === '1') {
                    return;
                }
                //get the Menu after it pops up
                console.log(`[M+] Adding Gift Button...`);
                const popupMenu = document.getElementById('sbMenuMain');
                do {
                    yield Util.sleep(5);
                } while (!popupMenu.hasChildNodes());
                //get the user details from the popup menu details
                const popupUser = Util.nodeToElem(popupMenu.childNodes[0]);
                //make username equal the data-uid, force not null
                const userName = popupUser.getAttribute('data-uid');
                //get the default value of gifts set in preferences for user page
                let giftValueSetting = GM_getValue('userGiftDefault_val');
                //if they did not set a value in preferences, set to 100
                if (!giftValueSetting) {
                    giftValueSetting = '100';
                }
                else if (Number(giftValueSetting) > 1000 ||
                    isNaN(Number(giftValueSetting))) {
                    giftValueSetting = '1000';
                }
                else if (Number(giftValueSetting) < 5) {
                    giftValueSetting = '5';
                }
                //create the HTML document that holds the button and value text
                const giftButton = document.createElement('span');
                giftButton.setAttribute('id', 'giftButton');
                //create the button element as well as a text element for value of gift. Populate with value from settings
                giftButton.innerHTML = `<button>Gift: </button><span>&nbsp;</span><input type="text" size="3" id="mp_giftValue" title="Value between 5 and 1000" value="${giftValueSetting}">`;
                //add gift element with button and text to the menu
                popupMenu.childNodes[0].appendChild(giftButton);
                //add event listener for when gift button is clicked
                giftButton.querySelector('button').addEventListener('click', () => {
                    //pull whatever the final value of the text box equals
                    const giftFinalAmount = (document.getElementById('mp_giftValue')).value;
                    //begin setting up the GET request to MAM JSON
                    const giftHTTP = new XMLHttpRequest();
                    //URL to GET results with the amount entered by user plus the username found on the menu selected
                    //added message contents encoded to prevent unintended characters from breaking JSON URL
                    const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}&message=${encodeURIComponent(giftMessage)}`;
                    giftHTTP.open('GET', url, true);
                    giftHTTP.setRequestHeader('Content-Type', 'application/json');
                    giftHTTP.onreadystatechange = function () {
                        if (giftHTTP.readyState === 4 && giftHTTP.status === 200) {
                            const json = JSON.parse(giftHTTP.responseText);
                            //create a new line in SB that shows gift was successful to acknowledge gift worked/failed
                            const newDiv = document.createElement('div');
                            newDiv.setAttribute('id', 'mp_giftStatusElem');
                            sbfDivChild.appendChild(newDiv);
                            //if the gift succeeded
                            if (json.success) {
                                const successMsg = document.createTextNode('Points Gift Successful: Value: ' + giftFinalAmount);
                                newDiv.appendChild(successMsg);
                                newDiv.classList.add('mp_success');
                            }
                            else {
                                const failedMsg = document.createTextNode('Points Gift Failed: Error: ' + json.error);
                                newDiv.appendChild(failedMsg);
                                newDiv.classList.add('mp_fail');
                            }
                            //after we add line in SB, scroll to bottom to show result
                            sbfDiv.scrollTop = sbfDiv.scrollHeight;
                        }
                        //after we add line in SB, scroll to bottom to show result
                        sbfDiv.scrollTop = sbfDiv.scrollHeight;
                    };
                    giftHTTP.send();
                    //return to main SB window after gift is clicked - these are two steps taken by MAM when clicking out of Menu
                    sbfDiv
                        .getElementsByClassName('sb_clicked_row')[0]
                        .removeAttribute('class');
                    document
                        .getElementById('sbMenuMain')
                        .setAttribute('class', 'sbBottom hideMe');
                });
                giftButton.querySelector('input').addEventListener('input', () => {
                    const valueToNumber = (document.getElementById('mp_giftValue')).value;
                    if (Number(valueToNumber) > 1000 ||
                        Number(valueToNumber) < 5 ||
                        isNaN(Number(valueToNumber))) {
                        giftButton.querySelector('button').disabled = true;
                    }
                    else {
                        giftButton.querySelector('button').disabled = false;
                    }
                });
                console.log(`[M+] Gift Button added!`);
            }));
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Reply button to be added to Shout
 */
class ReplySimple {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'replySimple',
            //tag: "Reply",
            desc: `Places a Reply button in Shoutbox: &#10554;`,
        };
        this._tar = '.sbf div';
        this._replySimple = 1;
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            ProcessShouts.watchShoutboxReply(this._tar, this._replySimple);
            console.log(`[M+] Adding Reply Button...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Reply With Quote button to be added to Shout
 */
class ReplyQuote {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'replyQuote',
            //tag: "Reply With Quote",
            desc: `Places a Reply with Quote button in Shoutbox: &#10557;`,
        };
        this._tar = '.sbf div';
        this._replyQuote = 2;
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            ProcessShouts.watchShoutboxReply(this._tar, this._replyQuote);
            console.log(`[M+] Adding Reply with Quote Button...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Creates feature for building a library of quick shout items that can act as a copy/paste replacement.
 */
class QuickShout {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'quickShout',
            desc: `Create feature below shoutbox to store pre-set messages.`,
        };
        this._tar = '.sbf div';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Adding Quick Shout Buttons...`);
            //get the main shoutbox input field
            const replyBox = document.getElementById('shbox_text');
            //empty JSON was giving me issues, so decided to just make an intro for when the GM variable is empty
            let jsonList = JSON.parse(`{ "Intro":"Welcome to QuickShout MAM+er! Here you can create preset Shout messages for quick responses and knowledge sharing. 'Clear' clears the entry to start selection process over. 'Select' takes whatever QuickShout is in the TextArea and puts in your Shout response area. 'Save' will store the Selection Name and Text Area Combo for future use as a QuickShout, and has color indicators. Green = saved as-is. Yellow = QuickShout Name exists and is saved, but content does not match what is stored. Orange = no entry matching that name, not saved. 'Delete' will permanently remove that entry from your stored QuickShouts (button only shows when exists in storage). For new entries have your QuickShout Name typed in BEFORE you craft your text or risk it being overwritten by something that exists as you type it. Thanks for using MAM+!" }`);
            //get Shoutbox DIV
            const shoutBox = document.getElementById('fpShout');
            //get the footer where we will insert our feature
            const shoutFoot = shoutBox.querySelector('.blockFoot');
            //give it an ID and set the size
            shoutFoot.setAttribute('id', 'mp_blockFoot');
            shoutFoot.style.height = '2.5em';
            //create a new dive to hold our comboBox and buttons and set the style for formatting
            const comboBoxDiv = document.createElement('div');
            comboBoxDiv.style.float = 'left';
            comboBoxDiv.style.marginLeft = '1em';
            comboBoxDiv.style.marginBottom = '.5em';
            comboBoxDiv.style.marginTop = '.5em';
            //create the label text element and add the text and attributes for ID
            const comboBoxLabel = document.createElement('label');
            comboBoxLabel.setAttribute('for', 'quickShoutData');
            comboBoxLabel.innerText = 'Choose a QuickShout';
            comboBoxLabel.setAttribute('id', 'mp_comboBoxLabel');
            //create the input field to link to datalist and format style
            const comboBoxInput = document.createElement('input');
            comboBoxInput.style.marginLeft = '.5em';
            comboBoxInput.setAttribute('list', 'mp_comboBoxList');
            comboBoxInput.setAttribute('id', 'mp_comboBoxInput');
            //create a datalist to store our quickshouts
            const comboBoxList = document.createElement('datalist');
            comboBoxList.setAttribute('id', 'mp_comboBoxList');
            //if the GM variable exists
            if (GM_getValue('mp_quickShout')) {
                //overwrite jsonList variable with parsed data
                jsonList = JSON.parse(GM_getValue('mp_quickShout'));
                //for each key item
                Object.keys(jsonList).forEach((key) => {
                    //create a new Option element and add our data for display to user
                    const comboBoxOption = document.createElement('option');
                    comboBoxOption.value = key.replace(/ಠ/g, ' ');
                    comboBoxList.appendChild(comboBoxOption);
                });
                //if no GM variable
            }
            else {
                //create variable with out Intro data
                GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                //for each key item
                // TODO: probably can get rid of the forEach and just do single execution since we know this is Intro only
                Object.keys(jsonList).forEach((key) => {
                    const comboBoxOption = document.createElement('option');
                    comboBoxOption.value = key.replace(/ಠ/g, ' ');
                    comboBoxList.appendChild(comboBoxOption);
                });
            }
            //append the above elements to our DIV for the combo box
            comboBoxDiv.appendChild(comboBoxLabel);
            comboBoxDiv.appendChild(comboBoxInput);
            comboBoxDiv.appendChild(comboBoxList);
            //create the clear button and add style
            const clearButton = document.createElement('button');
            clearButton.style.marginLeft = '1em';
            clearButton.innerHTML = 'Clear';
            //create delete button, add style, and then hide it for later use
            const deleteButton = document.createElement('button');
            deleteButton.style.marginLeft = '6em';
            deleteButton.style.display = 'none';
            deleteButton.style.backgroundColor = 'Red';
            deleteButton.innerHTML = 'DELETE';
            //create select button and style it
            const selectButton = document.createElement('button');
            selectButton.style.marginLeft = '1em';
            selectButton.innerHTML = '\u2191 Select';
            //create save button and style it
            const saveButton = document.createElement('button');
            saveButton.style.marginLeft = '1em';
            saveButton.innerHTML = 'Save';
            //add all 4 buttons to the comboBox DIV
            comboBoxDiv.appendChild(clearButton);
            comboBoxDiv.appendChild(selectButton);
            comboBoxDiv.appendChild(saveButton);
            comboBoxDiv.appendChild(deleteButton);
            //create our text area and style it, then hide it
            const quickShoutText = document.createElement('textarea');
            quickShoutText.style.height = '50%';
            quickShoutText.style.margin = '1em';
            quickShoutText.style.width = '97%';
            quickShoutText.id = 'mp_quickShoutText';
            quickShoutText.style.display = 'none';
            //executes when clicking select button
            selectButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if there is something inside of the quickshout area
                if (quickShoutText.value) {
                    //put the text in the main site reply field and focus on it
                    replyBox.value = quickShoutText.value;
                    replyBox.focus();
                }
            }), false);
            //create a quickShout delete button
            deleteButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if this is not the last quickShout
                if (Object.keys(jsonList).length > 1) {
                    //delete the entry from the JSON and update the GM variable with new json list
                    delete jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')];
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                    //delete the options from datalist to reset with newly created jsonList
                    comboBoxList.innerHTML = '';
                    //for each item in new jsonList
                    Object.keys(jsonList).forEach((key) => {
                        //new option element to add to list
                        const comboBoxOption = document.createElement('option');
                        //add the current key value to the element
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //add element to the list
                        comboBoxList.appendChild(comboBoxOption);
                    });
                    //if the last item in the jsonlist
                }
                else {
                    //delete item from jsonList
                    delete jsonList[comboBoxInput.value.replace(/ಠ/g, 'ಠ')];
                    //delete entire variable so its not empty GM variable
                    GM_deleteValue('mp_quickShout');
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                }
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            }), false);
            //create event on save button to save quickshout
            saveButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if there is data in the key and value GUI fields, proceed
                if (quickShoutText.value && comboBoxInput.value) {
                    //was having issue with eval processing the .replace data so made a variable to intake it
                    const replacedText = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //fun way to dynamically create statements - this takes whatever is in list field to create a key with that text and the value from the textarea
                    eval(`jsonList.` +
                        replacedText +
                        `= "` +
                        encodeURIComponent(quickShoutText.value) +
                        `";`);
                    //overwrite or create the GM variable with new jsonList
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style save button to green now that its saved as-is
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //show delete button now that its a saved entry
                    deleteButton.style.display = '';
                    //delete existing datalist elements to rebuild with new jsonlist
                    comboBoxList.innerHTML = '';
                    //for each key in the jsonlist
                    Object.keys(jsonList).forEach((key) => {
                        //create new option element
                        const comboBoxOption = document.createElement('option');
                        //add key name to the option
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //TODO: this may or may not be necessary, but was having issues with the unique symbol still randomly showing up after saves
                        comboBoxOption.value = comboBoxOption.value.replace(/ಠ/g, ' ');
                        //add to the list
                        // console.log(comboBoxOption);
                        comboBoxList.appendChild(comboBoxOption);
                    });
                }
            }), false);
            //add event for clear button to reset the datalist
            clearButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //clear the input field and textarea field
                comboBoxInput.value = '';
                quickShoutText.value = '';
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            }), false);
            //Next two input functions are meat and potatoes of the logic for user functionality
            //whenever something is typed or changed whithin the input field
            comboBoxInput.addEventListener('input', () => __awaiter(this, void 0, void 0, function* () {
                //if input is blank
                if (!comboBoxInput.value) {
                    //if the textarea is also blank minimize real estate
                    if (!quickShoutText.value) {
                        //hide the text area
                        quickShoutText.style.display = 'none';
                        //shrink the footer
                        shoutFoot.style.height = '2.5em';
                        //re-style the save button to default
                        saveButton.style.backgroundColor = '';
                        saveButton.style.color = '';
                        //if something is still in the textarea we need to indicate that unsaved and unnamed data is there
                    }
                    else {
                        //style for unsaved and unnamed is organge save button
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                    }
                    //either way, hide the delete button
                    deleteButton.style.display = 'none';
                }
                //if the input field has any text in it
                else {
                    const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //show the text area for input
                    quickShoutText.style.display = '';
                    //expand the footer to accomodate all feature aspects
                    shoutFoot.style.height = '11em';
                    //if what is in the input field is a saved entry key
                    if (jsonList[inputVal]) {
                        //this can be a sucky line of code because it can wipe out unsaved data, but i cannot think of better way
                        //replace the text area contents with what the value is in the matched pair
                        // quickShoutText.value = jsonList[JSON.parse(inputVal)];
                        quickShoutText.value = decodeURIComponent(jsonList[inputVal]);
                        //show the delete button since this is now exact match to saved entry
                        deleteButton.style.display = '';
                        //restyle save button to show its a saved combo
                        saveButton.style.backgroundColor = 'Green';
                        saveButton.style.color = '';
                        //if this is not a registered key name
                    }
                    else {
                        //restyle the save button to be an unsaved entry
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                        //hide the delete button since this cannot be saved
                        deleteButton.style.display = 'none';
                    }
                }
            }), false);
            //whenever something is typed or deleted out of textarea
            quickShoutText.addEventListener('input', () => __awaiter(this, void 0, void 0, function* () {
                const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');
                //if the input field is blank
                if (!comboBoxInput.value) {
                    //restyle save button for unsaved and unnamed
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    //hide delete button
                    deleteButton.style.display = 'none';
                }
                //if input field has text in it
                else if (jsonList[inputVal] &&
                    quickShoutText.value !== decodeURIComponent(jsonList[inputVal])) {
                    //restyle save button as yellow for editted
                    saveButton.style.backgroundColor = 'Yellow';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = '';
                    //if the key is a match and the data is a match then we have a 100% saved entry and can put everything back to saved
                }
                else if (jsonList[inputVal] &&
                    quickShoutText.value === decodeURIComponent(jsonList[inputVal])) {
                    //restyle save button to green for saved
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    deleteButton.style.display = '';
                    //if the key is not found in the saved list, orange for unsaved and unnamed
                }
                else if (!jsonList[inputVal]) {
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = 'none';
                }
            }), false);
            //add the combobox and text area elements to the footer
            shoutFoot.appendChild(comboBoxDiv);
            shoutFoot.appendChild(quickShoutText);
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * * Autofills the Gift box with a specified number of points.
 */
class TorGiftDefault {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'torGiftDefault',
            tag: 'Default Gift',
            placeholder: 'ex. 5000, max',
            desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
        };
        this._tar = '#thanksArea input[name=points]';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to Goodreads
 */
class GoodreadsButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'goodreadsButton',
            desc: 'Enable the MAM-to-Goodreads buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping Goodreads buttons');
                }
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Select the data points
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            const target = document.querySelector(this._tar);
            // Generate buttons
            this._share.goodreadsButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to Audible
 */
class AudibleButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'audibleButton',
            desc: 'Enable the MAM-to-Audible buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping Audible buttons');
                }
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Select the data points
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            let target = document.querySelector(this._tar);
            if (document.querySelector('.mp_sgRow')) {
                target = document.querySelector('.mp_sgRow');
            }
            else if (document.querySelector('.mp_grRow')) {
                target = document.querySelector('.mp_grRow');
            }
            // Generate buttons
            this._share.audibleButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to StoryGraph
 */
class StoryGraphButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'storyGraphButton',
            desc: 'Enable the MAM-to-StoryGraph buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping StroyGraph buttons');
                }
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Select the data points
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            let target = document.querySelector(this._tar);
            if (document.querySelector('.mp_grRow')) {
                target = document.querySelector('.mp_grRow');
            }
            // Generate buttons
            this._share.storyGraphButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generates a field for "Currently Reading" bbcode
 */
class CurrentlyReading {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup['Torrent Page'],
            title: 'currentlyReading',
            desc: `Add a button to generate a "Currently Reading" forum snippet`,
        };
        this._tar = '#torDetMainCon .TorrentTitle';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding Currently Reading section...');
            // Get the required information
            const title = document.querySelector('#torDetMainCon .TorrentTitle')
                .textContent;
            const authors = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const torID = window.location.pathname.split('/')[2];
            const rowTar = document.querySelector('#fInfo');
            // Title can't be null
            if (title === null) {
                throw new Error(`Title field was null`);
            }
            // Build a new table row
            const crRow = yield Util.addTorDetailsRow(rowTar, 'Currently Reading', 'mp_crRow');
            // Process data into string
            const blurb = yield this._generateSnippet(torID, title, authors);
            // Build button
            const btn = yield this._buildButton(crRow, blurb);
            // Init button
            Util.clipboardifyBtn(btn, blurb);
        });
    }
    /**
     * * Build a BB Code text snippet using the book info, then return it
     * @param id The string ID of the book
     * @param title The string title of the book
     * @param authors A node list of author links
     */
    _generateSnippet(id, title, authors) {
        /**
         * * Add Author Link
         * @param authorElem A link containing author information
         */
        const addAuthorLink = (authorElem) => {
            return `[url=${authorElem.href.replace('https://www.myanonamouse.net', '')}]${authorElem.textContent}[/url]`;
        };
        // Convert the NodeList into an Array which is easier to work with
        let authorArray = [];
        authors.forEach((authorElem) => authorArray.push(addAuthorLink(authorElem)));
        // Drop extra items
        if (authorArray.length > 3) {
            authorArray = [...authorArray.slice(0, 3), 'etc.'];
        }
        return `[url=/t/${id}]${title}[/url] by [i]${authorArray.join(', ')}[/i]`;
    }
    /**
     * * Build a button on the tor details page
     * @param tar Area where the button will be added into
     * @param content Content that will be added into the textarea
     */
    _buildButton(tar, content) {
        // Build text display
        tar.innerHTML = `<textarea rows="1" cols="80" style='margin-right:5px'>${content}</textarea>`;
        // Build button
        Util.createLinkButton(tar, 'none', 'Copy', 2);
        document.querySelector('.mp_crRow .mp_button_clone').classList.add('mp_reading');
        // Return button
        return document.querySelector('.mp_reading');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Protects the user from ratio troubles by adding warnings and displaying ratio delta
 */
class RatioProtect {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup['Torrent Page'],
            title: 'ratioProtect',
            desc: `Protect your ratio with warnings &amp; ratio calculations`,
        };
        this._tar = '#ratio';
        this._rcRow = 'mp_ratioCostRow';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabling ratio protection...');
            // TODO: Move this block to shared
            // The download text area
            const dlBtn = document.querySelector('#tddl');
            // The currently unused label area above the download text
            const dlLabel = document.querySelector('#download .torDetInnerTop');
            // Insertion target for messages
            const descBlock = yield Check.elemLoad('.torDetBottom');
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // User has a ratio
            const userHasRatio = rCur.textContent.indexOf('Inf') < 0 ? true : false;
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = yield this._share.getRatioProtectLevels();
            if (MP.DEBUG)
                console.log(`Ratio protection levels set to: ${r1}, ${r2}, ${r3}`);
            // Create the box we will display text in
            if (descBlock) {
                // Add line under Torrent: detail for Cost data "Cost to Restore Ratio"
                descBlock.insertAdjacentHTML('beforebegin', `<div class="torDetRow" id="mp_row"><div class="torDetLeft">Cost to Restore Ratio</div><div class="torDetRight ${this._rcRow}" style="flex-direction:column;align-items:flex-start;"><span id="mp_foobar"></span></div></div>`);
            }
            else {
                throw new Error(`'.torDetRow is ${descBlock}`);
            }
            // Only run the code if the ratio exists
            if (rNew && rCur && !seeding && userHasRatio) {
                const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
                if (MP.DEBUG)
                    console.log(`Current ${Util.extractFloat(rCur)[0]} | New ${Util.extractFloat(rNew)[0]} | Dif ${rDiff}`);
                // Only activate if a ratio change is expected
                if (!isNaN(rDiff) && rDiff > 0.009) {
                    if (dlLabel) {
                        dlLabel.innerHTML = `Ratio loss ${rDiff.toFixed(2)}`;
                        dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
                    }
                    // Calculate & Display cost of download w/o FL
                    // Always show calculations when there is a ratio loss
                    const sizeElem = document.querySelector('#size span');
                    if (sizeElem) {
                        const size = sizeElem.textContent.split(/\s+/);
                        const sizeMap = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
                        // Convert human readable size to bytes
                        const byteSized = Number(size[0]) * Math.pow(1024, sizeMap.indexOf(size[1]));
                        const recovery = byteSized * Util.extractFloat(rCur)[0];
                        const pointAmnt = Math.floor((125 * recovery) / 268435456).toLocaleString();
                        const dayAmount = Math.floor((5 * recovery) / 2147483648);
                        const wedgeStoreCost = Util.formatBytes((268435456 * 50000) / (Util.extractFloat(rCur)[0] * 125));
                        const wedgeVaultCost = Util.formatBytes((268435456 * 200) / (Util.extractFloat(rCur)[0] * 125));
                        // Update the ratio cost row
                        document.querySelector(`.${this._rcRow}`).innerHTML = `<span><b>${Util.formatBytes(recovery)}</b>&nbsp;upload (${pointAmnt} BP; or one FL wedge per day for ${dayAmount} days).&nbsp;<abbr title='Contributing 2,000 BP to each vault cycle gives you almost one FL wedge per day on average.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>
                    <span>Wedge store price: <i>${wedgeStoreCost}</i>&nbsp;<abbr title='If you buy wedges from the store, this is how large a torrent must be to break even on the cost (50,000 BP) of a single wedge.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>
                    <span>Wedge vault price: <i>${wedgeVaultCost}</i>&nbsp;<abbr title='If you contribute to the vault, this is how large a torrent must be to break even on the cost (200 BP) of 10 wedges for the maximum contribution of 2,000 BP.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>`;
                    }
                    // Style the download button based on Ratio Protect level settings
                    if (dlBtn && dlLabel) {
                        // * This is the "trivial ratio loss" threshold
                        // These changes will always happen if the ratio conditions are met
                        if (rDiff > r1) {
                            this._setButtonState(dlBtn, '1_notify');
                        }
                        // * This is the "I never want to dl w/o FL" threshold
                        // This also uses the Minimum Ratio, if enabled
                        // This also prevents going below 2 ratio (PU requirement)
                        // TODO: Replace disable button with buy FL button
                        if (rDiff > r3 ||
                            Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                            Util.extractFloat(rNew)[0] < 2) {
                            this._setButtonState(dlBtn, '3_alert');
                            // * This is the "I need to think about using a FL" threshold
                        }
                        else if (rDiff > r2) {
                            this._setButtonState(dlBtn, '2_warn');
                        }
                    }
                }
                // If the user does not have a ratio, display a short message
            }
            else if (!userHasRatio) {
                this._setButtonState(dlBtn, '1_notify');
                document.querySelector(`.${this._rcRow}`).innerHTML = `<span>Ratio points and cost to restore ratio will appear here after your ratio is a real number.</span>`;
            }
        });
    }
    _setButtonState(tar, state, label) {
        if (state === '1_notify') {
            tar.style.backgroundColor = 'SpringGreen';
            tar.style.color = 'black';
            tar.innerHTML = 'Download?';
        }
        else if (state === '2_warn') {
            tar.style.backgroundColor = 'Orange';
            tar.innerHTML = 'Suggest FL';
        }
        else if (state === '3_alert') {
            if (!label) {
                console.warn(`No label provided in _setButtonState()!`);
            }
            tar.style.backgroundColor = 'Red';
            tar.style.cursor = 'no-drop';
            tar.innerHTML = 'FL Needed';
            label.style.fontWeight = 'bold';
        }
        else {
            throw new Error(`State "${state}" does not exist.`);
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Low ratio protection amount
 */
class RatioProtectL1 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL1',
            tag: 'Ratio Warn L1',
            placeholder: 'default: 0.5',
            desc: `Set the smallest threshhold to indicate ratio changes. (<em>This is a slight color change</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L1!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Medium ratio protection amount
 */
class RatioProtectL2 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL2',
            tag: 'Ratio Warn L2',
            placeholder: 'default: 1',
            desc: `Set the median threshhold to warn of ratio changes. (<em>This is a noticeable color change</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L2!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * High ratio protection amount
 */
class RatioProtectL3 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL3',
            tag: 'Ratio Warn L3',
            placeholder: 'default: 2',
            desc: `Set the highest threshhold to prevent ratio changes. (<em>This disables download without FL use</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L3!');
    }
    get settings() {
        return this._settings;
    }
}
class RatioProtectMin {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'textbox',
            title: 'ratioProtectMin',
            scope: SettingGroup['Torrent Page'],
            tag: 'Minimum Ratio',
            placeholder: 'ex. 100',
            desc: 'Trigger Ratio Warn L3 if your ratio would drop below this number.',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#download';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabled custom Ratio Protection minimum!');
        });
    }
    get settings() {
        return this._settings;
    }
}
class RatioProtectIcons {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'ratioProtectIcons',
            scope: SettingGroup['Torrent Page'],
            desc: 'Enable custom browser favicons based on Ratio Protect conditions?',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#ratio';
        this._userID = 164109;
        this._share = new Shared();
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Enabling custom Ratio Protect favicons from user ${this._userID}...`);
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = yield this._share.getRatioProtectLevels();
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Difference between new and old ratio
            const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // VIP status
            const vipstat = document.querySelector('#ratio .torDetInnerBottomSpan')
                ? document.querySelector('#ratio .torDetInnerBottomSpan').textContent
                : null;
            // Bookclub status
            const bookclub = document.querySelector("div[id='bcfl'] span");
            // Find favicon links and load a simple default.
            const siteFavicons = document.querySelectorAll("link[rel$='icon']");
            if (siteFavicons)
                this._buildIconLinks(siteFavicons, 'tm_32x32');
            // Test if VIP
            if (vipstat) {
                if (MP.DEBUG)
                    console.log(`VIP = ${vipstat}`);
                if (vipstat.search('VIP expires') > -1) {
                    this._buildIconLinks(siteFavicons, 'mouseclock');
                    document.title = document.title.replace(' | My Anonamouse', ` | Expires ${vipstat.substring(26)}`);
                }
                else if (vipstat.search('VIP not set to expire') > -1) {
                    this._buildIconLinks(siteFavicons, '0cir');
                    document.title = document.title.replace(' | My Anonamouse', ' | Not set to expire');
                }
                else if (vipstat.search('This torrent is freeleech!') > -1) {
                    this._buildIconLinks(siteFavicons, 'mouseclock');
                    // Test if bookclub
                    if (bookclub && bookclub.textContent.search('Bookclub Freeleech') > -1) {
                        document.title = document.title.replace(' | My Anonamouse', ` | Club expires ${bookclub.textContent.substring(25)}`);
                    }
                    else {
                        document.title = document.title.replace(' | My Anonamouse', " | 'till next Site FL"
                        // TODO: Calculate when FL ends
                        // ` | 'till ${this._nextFLDate()}`
                        );
                    }
                }
            }
            // Test if seeding/downloading
            if (seeding) {
                this._buildIconLinks(siteFavicons, '13egg');
                // * Similar icons: 13seed8, 13seed7, 13egg, 13, 13cir, 13WhiteCir
            }
            else if (vipstat.search('This torrent is personal freeleech') > -1) {
                this._buildIconLinks(siteFavicons, '5');
            }
            // Test if there will be ratio loss
            if (rNew && rCur && !seeding) {
                // Change icon based on Ratio Protect states
                if (rDiff > r3 ||
                    Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                    Util.extractFloat(rNew)[0] < 2) {
                    this._buildIconLinks(siteFavicons, '12');
                }
                else if (rDiff > r2) {
                    this._buildIconLinks(siteFavicons, '3Qmouse');
                    // Also try Orange, OrangeRed, Gold, or 14
                }
                else if (rDiff > r1) {
                    this._buildIconLinks(siteFavicons, 'SpringGreen');
                }
                // Check if future VIP
                if (vipstat.search('On list for next FL pick') > -1) {
                    this._buildIconLinks(siteFavicons, 'MirrorGreenClock'); // Also try greenclock
                    document.title = document.title.replace(' | My Anonamouse', ' | Next FL pick');
                }
            }
            console.log('[M+] Custom Ratio Protect favicons enabled!');
        });
    }
    // TODO: Function for calculating when FL ends
    // ? How are we able to determine when the current FL period started?
    /* private async _nextFLDate() {
        const d = new Date('Jun 14, 2022 00:00:00 UTC'); // seed date over two weeks ago
        const now = new Date(); //Place test dates here like Date("Jul 14, 2022 00:00:00 UTC")
        let mssince = now.getTime() - d.getTime(); //time since FL start seed date
        let dayssince = mssince / 86400000;
        let q = Math.floor(dayssince / 14); // FL periods since seed date

        const addDays = (date, days) => {
            const current = new Date(date);
            return current.setDate(current.getDate() + days);
        };

        return d
            .addDays(q * 14 + 14)
            .toISOString()
            .substr(0, 10);
    } */
    _buildIconLinks(elems, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            elems.forEach((elem) => {
                elem.href = `https://cdn.myanonamouse.net/imagebucket/${this._userID}/${filename}.png`;
            });
        });
    }
    get settings() {
        return this._settings;
    }
    set userID(newID) {
        this._userID = newID;
    }
}
// TODO: Add feature to set RatioProtectIcon's `_userID` value. Only necessary once other icon sets exist.
/// <reference path="../util.ts" />
/**
 * #UPLOAD PAGE FEATURES
 */
/**
 * Allows easier checking for duplicate uploads
 */
class SearchForDuplicates {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'searchForDuplicates',
            scope: SettingGroup['Upload Page'],
            desc: 'Easier searching for duplicates when uploading content',
        };
        this._tar = '#uploadForm input[type="submit"]';
        Util.startFeature(this._settings, this._tar, ['upload']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const parentElement = document.querySelector('#mainBody');
            if (parentElement) {
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given title',
                    type: 'title',
                    inputSelector: 'input[name="tor[title]"]',
                    rowPosition: 7,
                    useWildcard: true,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given author(s)',
                    type: 'author',
                    inputSelector: 'input.ac_author',
                    rowPosition: 10,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given series',
                    type: 'series',
                    inputSelector: 'input.ac_series',
                    rowPosition: 11,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given narrator(s)',
                    type: 'narrator',
                    inputSelector: 'input.ac_narrator',
                    rowPosition: 12,
                });
            }
            console.log(`[M+] Adding search to uploads!`);
        });
    }
    _generateSearch({ parentElement, title, type, inputSelector, rowPosition, useWildcard = false, }) {
        var _a;
        const searchElement = document.createElement('a');
        Util.setAttr(searchElement, {
            target: '_blank',
            style: 'text-decoration: none; cursor: pointer;',
            title,
        });
        searchElement.textContent = ' 🔍';
        const linkBase = `/tor/browse.php?tor%5BsearchType%5D=all&tor%5BsearchIn%5D=torrents&tor%5Bcat%5D%5B%5D=0&tor%5BbrowseFlagsHideVsShow%5D=0&tor%5BsortType%5D=dateDesc&tor%5BsrchIn%5D%5B${type}%5D=true&tor%5Btext%5D=`;
        (_a = parentElement
            .querySelector(`#uploadForm > tbody > tr:nth-child(${rowPosition}) > td:nth-child(1)`)) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('beforeend', searchElement);
        searchElement.addEventListener('click', (event) => {
            const inputs = parentElement.querySelectorAll(inputSelector);
            if (inputs && inputs.length) {
                const inputsList = [];
                inputs.forEach((input) => {
                    if (input.value) {
                        inputsList.push(input.value);
                    }
                });
                const query = inputsList.join(' ').trim();
                if (query) {
                    const searchString = useWildcard
                        ? `*${encodeURIComponent(inputsList.join(' '))}*`
                        : encodeURIComponent(inputsList.join(' '));
                    searchElement.setAttribute('href', linkBase + searchString);
                }
                else {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            else {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * # USER PAGE FEATURES
 */
/**
 * #### Default User Gift Amount
 */
class UserGiftDefault {
    constructor() {
        this._settings = {
            scope: SettingGroup['User Pages'],
            type: 'textbox',
            title: 'userGiftDefault',
            tag: 'Default Gift',
            placeholder: 'ex. 1000, max',
            desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
        };
        this._tar = '#bonusgift';
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }
    get settings() {
        return this._settings;
    }
}
/**
 * #### User Gift History
 */
class UserGiftHistory {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'userGiftHistory',
            scope: SettingGroup['User Pages'],
            desc: 'Display gift history between you and another user',
        };
        this._sendSymbol = `<span style='color:orange' title='sent'>\u27F0</span>`;
        this._getSymbol = `<span style='color:teal' title='received'>\u27F1</span>`;
        this._tar = 'tbody';
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Initiallizing user gift history...');
            // Name of the other user
            const otherUser = document.querySelector('#mainBody > h1').textContent.trim();
            // Create the gift history row
            const historyContainer = document.createElement('tr');
            const insert = document.querySelector('#mainBody tbody tr:last-of-type');
            if (insert)
                insert.insertAdjacentElement('beforebegin', historyContainer);
            // Create the gift history title field
            const historyTitle = document.createElement('td');
            historyTitle.classList.add('rowhead');
            historyTitle.textContent = 'Gift history';
            historyContainer.appendChild(historyTitle);
            // Create the gift history content field
            const historyBox = document.createElement('td');
            historyBox.classList.add('row1');
            historyBox.textContent = `You have not exchanged gifts with ${otherUser}.`;
            historyBox.align = 'left';
            historyContainer.appendChild(historyBox);
            // Get the User ID
            const userID = window.location.pathname.split('/').pop();
            const currentUserID = Util.getCurrentUserID();
            // TODO: use `cdn.` instead of `www.`; currently causes a 403 error
            if (userID) {
                if (userID === currentUserID) {
                    historyTitle.textContent = 'Recent Gift History';
                    return this._historyWithAll(historyBox);
                }
                return this._historyWithUserID(userID, historyBox);
            }
            else {
                throw new Error(`User ID not found: ${userID}`);
            }
        });
    }
    /**
     * #### Fill out history box
     * @param userID the user to get history from
     * @param historyBox the box to put it in
     */
    _historyWithUserID(userID, historyBox) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the gift history
            const giftHistory = yield Util.getUserGiftHistory(userID);
            // Only display a list if there is a history
            if (giftHistory.length) {
                // Determine Point & FL total values
                const [pointsIn, pointsOut] = this._sumGifts(giftHistory, 'giftPoints');
                const [wedgeIn, wedgeOut] = this._sumGifts(giftHistory, 'giftWedge');
                if (MP.DEBUG) {
                    console.log(`Points In/Out: ${pointsIn}/${pointsOut}`);
                    console.log(`Wedges In/Out: ${wedgeIn}/${wedgeOut}`);
                }
                const otherUser = giftHistory[0].other_name;
                // Generate a message
                historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> to ${otherUser} and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
                // Add the message to the box
                historyBox.appendChild(this._showGifts(giftHistory));
                console.log('[M+] User gift history added!');
            }
            else {
                console.log(`[M+] No user gift history found with ${userID}.`);
            }
        });
    }
    /**
     * #### Fill out history box
     * @param historyBox the box to put it in
     */
    _historyWithAll(historyBox) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the gift history
            const giftHistory = yield Util.getAllUserGiftHistory();
            // Only display a list if there is a history
            if (giftHistory.length) {
                // Determine Point & FL total values
                const [pointsIn, pointsOut] = this._sumGifts(giftHistory, 'giftPoints');
                const [wedgeIn, wedgeOut] = this._sumGifts(giftHistory, 'giftWedge');
                if (MP.DEBUG) {
                    console.log(`Points In/Out: ${pointsIn}/${pointsOut}`);
                    console.log(`Wedges In/Out: ${wedgeIn}/${wedgeOut}`);
                }
                // Generate a message
                historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
                // Add the message to the box
                historyBox.appendChild(this._showGifts(giftHistory));
                console.log('[M+] User gift history added!');
            }
            else {
                console.log(`[M+] No user gift history found for current user.`);
            }
        });
    }
    /**
     * #### Sum the values of a given gift type as Inflow & Outflow sums
     * @param history the user gift history
     * @param type points or wedges
     */
    _sumGifts(history, type) {
        const outflow = [0];
        const inflow = [0];
        // Only retrieve amounts of a specified gift type
        history.map((gift) => {
            if (gift.type === type) {
                // Split into Inflow/Outflow
                if (gift.amount > 0) {
                    inflow.push(gift.amount);
                }
                else {
                    outflow.push(gift.amount);
                }
            }
        });
        // Sum all items in the filtered array
        const sumOut = outflow.reduce((accumulate, current) => accumulate + current);
        const sumIn = inflow.reduce((accumulate, current) => accumulate + current);
        return [sumIn, Math.abs(sumOut)];
    }
    /**
     * #### Creates a list of the most recent gifts
     * @param history The full gift history between two users
     */
    _showGifts(history) {
        // If the gift was a wedge, return custom text
        const _wedgeOrPoints = (gift) => {
            if (gift.type === 'giftPoints') {
                return `${Math.abs(gift.amount)}`;
            }
            else if (gift.type === 'giftWedge') {
                return '(FL)';
            }
            else {
                return `Error: unknown gift type... ${gift.type}: ${gift.amount}`;
            }
        };
        // Generate a list for the history
        const historyList = document.createElement('ul');
        Object.assign(historyList.style, {
            listStyle: 'none',
            padding: 'initial',
            height: '10em',
            overflow: 'auto',
        });
        // Loop over history items and add to an array
        const gifts = history
            .filter((gift) => gift.type === 'giftPoints' || gift.type === 'giftWedge')
            .map((gift) => {
            // Add some styling depending on pos/neg numbers
            let fancyGiftAmount = '';
            let fromTo = '';
            if (gift.amount > 0) {
                fancyGiftAmount = `${this._getSymbol} ${_wedgeOrPoints(gift)}`;
                fromTo = 'from';
            }
            else {
                fancyGiftAmount = `${this._sendSymbol} ${_wedgeOrPoints(gift)}`;
                fromTo = 'to';
            }
            // Make the date readable
            const date = Util.prettySiteTime(gift.timestamp, true);
            return `<li class='mp_giftItem'>${date} you ${fancyGiftAmount} ${fromTo} <a href='/u/${gift.other_userid}'>${gift.other_name}</a></li>`;
        });
        // Add history items to the list
        historyList.innerHTML = gifts.join('');
        return historyList;
    }
    get settings() {
        return this._settings;
    }
}
class Notes {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'Notes',
            scope: SettingGroup['User Pages'],
            desc: 'Adds a notes textbox',
        };
        this._tar = 'tbody';
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Locate the table with the class "coltable"
            const table = document.querySelector('.coltable');
            if (table) {
                let tbody = table.querySelector('tbody');
                const userID = (_a = window.location.pathname.match(/\/u\/(\d+)/)) === null || _a === void 0 ? void 0 : _a[1];
                if (!userID) {
                    console.error("User ID not found in URL.");
                    return;
                }
                const newRow = document.createElement('tr');
                const newCell = document.createElement('td');
                newCell.setAttribute('colspan', '2');
                newCell.setAttribute('class', 'row1');
                const inputField = document.createElement('textarea');
                inputField.rows = 4;
                inputField.cols = 100;
                inputField.placeholder = 'Enter your notes here';
                inputField.value = GM_getValue(`user_notes_${userID}_val`, '');
                const saveButton = document.createElement('button');
                saveButton.textContent = 'Save Note';
                // Create the "Saved!" message span
                const savedMessage = document.createElement('span');
                savedMessage.className = 'mp_savestate'; // Apply the style similar to the example
                savedMessage.textContent = 'Saved!';
                savedMessage.style.opacity = '0'; // Start hidden
                // Add a click event listener to save the note and display "Saved!" message
                saveButton.addEventListener('click', () => {
                    const noteValue = inputField.value.trim();
                    if (noteValue === '') {
                        GM_deleteValue(`user_notes_${userID}_val`);
                        console.log(`Note for user ${userID} has been cleared.`);
                    }
                    else {
                        GM_setValue(`user_notes_${userID}_val`, noteValue);
                        console.log(`Note for user ${userID} saved: ${noteValue}`);
                    }
                    // Show the "Saved!" message briefly
                    savedMessage.style.opacity = '1';
                    setTimeout(() => {
                        savedMessage.style.opacity = '0';
                    }, 2000); // Hide after 2 seconds
                });
                newCell.appendChild(inputField);
                newCell.appendChild(saveButton);
                newCell.appendChild(savedMessage); // Add the "Saved!" message span to the cell
                newRow.appendChild(newCell);
                tbody.appendChild(newRow);
            }
            else {
                console.error('Table with class "coltable" not found.');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * VAULT FEATURES
 */
class SimpleVault {
    constructor() {
        this._settings = {
            scope: SettingGroup.Vault,
            type: 'checkbox',
            title: 'simpleVault',
            desc: 'Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)',
        };
        this._tar = '#mainBody';
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const subPage = GM_getValue('mp_currentPage');
            const page = document.querySelector(this._tar);
            console.group(`Applying Vault (${subPage}) settings...`);
            // Clone the important parts and reset the page
            const donateBtn = page.querySelector('form');
            const donateTbl = page.querySelector('table:last-of-type');
            page.innerHTML = '';
            // Add the donate button if it exists
            if (donateBtn !== null) {
                const newDonate = donateBtn.cloneNode(true);
                page.appendChild(newDonate);
                newDonate.classList.add('mp_vaultClone');
            }
            else {
                page.innerHTML = '<h1>Come back tomorrow!</h1>';
            }
            // Add the donate table if it exists
            if (donateTbl !== null) {
                const newTable = (donateTbl.cloneNode(true));
                page.appendChild(newTable);
                newTable.classList.add('mp_vaultClone');
            }
            else {
                page.style.paddingBottom = '25px';
            }
            console.log('[M+] Simplified the vault page!');
        });
    }
    get settings() {
        return this._settings;
    }
}
class PotHistory {
    constructor() {
        this._settings = {
            scope: SettingGroup.Vault,
            type: 'checkbox',
            title: 'potHistory',
            desc: 'Add the list of recent donations to the donation page.',
        };
        this._tar = '#mainBody';
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const subPage = GM_getValue('mp_currentPage');
            const page = document.querySelector(this._tar);
            const form = (document.querySelector(this._tar + ' form[method="post"]'));
            const potPageResp = yield fetch('/millionaires/pot.php');
            if (!potPageResp.ok) {
                console.group(`failed to get /millionaires/pot.php: ${potPageResp.status}/${potPageResp.statusText}`);
                return;
            }
            console.group(`Applying Vault (${subPage}) settings...`);
            const potPageText = yield potPageResp.text();
            const parser = new DOMParser();
            const potPage = parser.parseFromString(potPageText, 'text/html');
            // Clone the important parts and reset the page
            const donateTbl = potPage.querySelector('#mainTable table:last-of-type');
            const currentTbl = page.querySelector('table:last-of-type');
            // Add the donate table if it exists
            if (donateTbl !== null) {
                const newTable = (donateTbl.cloneNode(true));
                newTable.classList.add('mp_vaultClone');
                if (currentTbl !== null) {
                    currentTbl.replaceWith(newTable);
                }
                else if (form !== null && form.parentElement !== null) {
                    form.parentElement.appendChild(newTable);
                }
                else {
                    page.appendChild(newTable);
                }
            }
            console.log('[M+] Added the donation history to the donation page!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * STORE FEATURES
 */
class GrayOutStorePurchases {
    constructor() {
        this._settings = {
            scope: SettingGroup.Store,
            type: 'checkbox',
            title: 'grayOutStorePurchases',
            desc: "Gray out store purchases you can't afford, and disable those buttons",
        };
        this._tar = '#currentBonusPoints';
        this._maxVipDays = 90;
        this._pointsPerGbUpload = 500;
        this._pointsPerVipBlock = 5000;
        this._vipBlockWeeks = 4;
        Util.startFeature(this._settings, this._tar, ['store']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const points = this._getCurrency('#currentBonusPoints');
        const cheese = this._getCurrency('#currentCheese');
        const vipRemainingDays = this._getVipRemainingDays();
        const buttons = document.querySelectorAll('#mainBody .bonusRow button');
        buttons.forEach((button) => {
            const reason = this._getDisableReason(button, points, cheese, vipRemainingDays);
            if (reason !== null) {
                this._disablePurchase(button, reason);
            }
        });
        this._markDisabledSections();
        console.log("[M+] Disabled store purchases you can't afford!");
    }
    _getCurrency(selector) {
        const elem = document.querySelector(selector);
        if (elem === null || elem.textContent === null) {
            return 0;
        }
        return parseInt(elem.textContent.replace(/[^\d]/g, ''), 10) || 0;
    }
    _getVipRemainingDays() {
        const userMenu = document.querySelector('#userMenu + ul');
        const menuText = userMenu && userMenu.textContent ? userMenu.textContent : '';
        if (/E-VIP|VIP not set to expire|eternal/i.test(menuText)) {
            return Number.POSITIVE_INFINITY;
        }
        const dateMatch = menuText.match(/VIP expires(?:\s+on)?\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i);
        if (dateMatch === null) {
            return null;
        }
        const expiry = new Date(dateMatch[1]);
        if (isNaN(expiry.getTime())) {
            return null;
        }
        return Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    }
    _getDisableReason(button, points, cheese, vipRemainingDays) {
        const section = this._getStoreSection(button);
        const fixedCost = this._getFixedCost(button);
        if (fixedCost !== null) {
            if (fixedCost.kind === 'points' && fixedCost.amount > points) {
                return 'Not enough bonus points';
            }
            if (fixedCost.kind === 'cheese' && fixedCost.amount > cheese) {
                return 'Not enough cheese';
            }
        }
        if (section === 'uploadCreditContent' && this._isUploadMaxButton(button)) {
            if (points < this._pointsPerGbUpload) {
                return 'Need at least 500 bonus points';
            }
        }
        if (section === 'vipStatusContent') {
            if (vipRemainingDays === Number.POSITIVE_INFINITY) {
                return 'Eternal VIP cannot buy more VIP';
            }
            if (this._wouldExceedVipLimit(button, vipRemainingDays) &&
                vipRemainingDays !== null) {
                return 'Would exceed the 90 day VIP limit';
            }
            if (this._isVipMaxButton(button) && points < this._pointsPerVipBlock) {
                return 'Need at least 5000 bonus points';
            }
        }
        return null;
    }
    _getStoreSection(button) {
        const section = button.closest('div.bonusRow');
        if (section === null) {
            return '';
        }
        const classes = Array.from(section.classList);
        const contentClass = classes.find((item) => item.endsWith('Content'));
        return contentClass !== undefined ? contentClass : '';
    }
    _getFixedCost(button) {
        const title = button.getAttribute('title');
        if (title === null) {
            return null;
        }
        const points = title.match(/([\d,]+)\s+points/i);
        if (points !== null) {
            return {
                kind: 'points',
                amount: parseInt(points[1].replace(/,/g, ''), 10),
            };
        }
        const cheese = title.match(/([\d,]+)\s+cheese/i);
        if (cheese !== null) {
            return {
                kind: 'cheese',
                amount: parseInt(cheese[1].replace(/,/g, ''), 10),
            };
        }
        return null;
    }
    _isUploadMaxButton(button) {
        return button.textContent !== null && button.textContent.indexOf('Max') > -1;
    }
    _isVipMaxButton(button) {
        return button.value === 'max';
    }
    _wouldExceedVipLimit(button, vipRemainingDays) {
        if (vipRemainingDays === null) {
            return false;
        }
        if (this._isVipMaxButton(button)) {
            return vipRemainingDays >= this._maxVipDays;
        }
        const weeksToBuy = parseInt(button.value, 10);
        if (isNaN(weeksToBuy)) {
            return false;
        }
        const daysToBuy = weeksToBuy * 7;
        return vipRemainingDays + daysToBuy > this._maxVipDays;
    }
    _disablePurchase(button, reason) {
        button.disabled = true;
        button.classList.add('mp_store_disabled');
        button.setAttribute('aria-disabled', 'true');
        button.style.pointerEvents = 'none';
        const currentTitle = button.getAttribute('title');
        if (currentTitle !== null && currentTitle.indexOf(reason) === -1) {
            button.setAttribute('title', `${currentTitle} | ${reason}`);
        }
        else if (currentTitle === null) {
            button.setAttribute('title', reason);
        }
    }
    _markDisabledSections() {
        const sections = document.querySelectorAll('#mainBody div.bonusRow[class*="Content"]');
        sections.forEach((section) => {
            const buttons = section.querySelectorAll('button');
            if (buttons.length === 0) {
                return;
            }
            const enabled = Array.from(buttons).some((button) => !button.disabled);
            if (!enabled) {
                section.classList.add('mp_store_disabled_section');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ===========================
 * PLACE ALL M+ FEATURES HERE
 * ===========================
 *
 * Nearly all features belong here, as they should have internal checks
 * for DOM elements as needed. Only core features should be placed in `app.ts`
 *
 * This determines the order in which settings will be generated on the Settings page.
 * Settings will be grouped by type and Features of one type that are called before
 * other Features of the same type will appear first.
 *
 * The order of the feature groups is not determined here.
 */
class InitFeatures {
    constructor() {
        // Initialize Global functions
        new HideHome();
        new BookmarkIcons();
        new HideSeedbox();
        new HideDonationBox();
        new BlurredHeader();
        new VaultLink();
        new MiniVaultInfo();
        new BonusPointDelta();
        new FixedNav();
        // Initialize Home Page functions
        new HideNews();
        new GiftNewest();
        // Initialize Search Page functions
        new ToggleSnatched();
        new StickySnatchedToggle();
        new PlaintextSearch();
        new ToggleSearchbox();
        new BuildTags();
        new RandomBook();
        // Initialize Freeleech Page functions
        new CollapseFreeleechSections();
        // Initialize Request Page functions
        new GoodreadsButtonReq();
        new ToggleHiddenRequesters();
        new PlaintextRequest();
        // Initialize Torrent Page functions
        new GoodreadsButton();
        new StoryGraphButton();
        new AudibleButton();
        new CurrentlyReading();
        new TorGiftDefault();
        new RatioProtect();
        new RatioProtectIcons();
        new RatioProtectL1();
        new RatioProtectL2();
        new RatioProtectL3();
        new RatioProtectMin();
        // Initialize Shoutbox functions
        new PriorityUsers();
        new PriorityStyle();
        new MutedUsers();
        new ReplySimple();
        new ReplyQuote();
        new GiftButton();
        new QuickShout();
        // Initialize Vault functions
        new SimpleVault();
        new PotHistory();
        // Initialize Store functions
        new GrayOutStorePurchases();
        // Initialize User Page functions
        new UserGiftDefault();
        new UserGiftHistory();
        new Notes();
        // Initialize Forum Page functions
        new ForumFLGift();
        // Initialize Upload Page functions
        new SearchForDuplicates();
    }
}
/// <reference path="check.ts" />
/// <reference path="util.ts" />
/// <reference path="./modules/core.ts" />
/**
 * Class for handling settings and the Preferences page
 * @method init: turns features' settings info into a useable table
 */
class Settings {
    // Function for gathering the needed scopes
    static _getScopes(settings) {
        if (MP.DEBUG) {
            console.log('_getScopes(', settings, ')');
        }
        return new Promise((resolve) => {
            const scopeList = {};
            for (const setting of settings) {
                const index = Number(setting.scope);
                // If the Scope exists, push the settings into the array
                if (scopeList[index]) {
                    scopeList[index].push(setting);
                    // Otherwise, create the array
                }
                else {
                    scopeList[index] = [setting];
                }
            }
            resolve(scopeList);
        });
    }
    // Function for constructing the table from an object
    static _buildTable(page) {
        if (MP.DEBUG)
            console.log('_buildTable(', page, ')');
        return new Promise((resolve) => {
            let outp = `<tbody><tr><td class="row1" colspan="2"><br><strong>MAM+ v${MP.VERSION}</strong> - Here you can enable &amp; disable any feature from the <a href="/f/t/41863">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.<br><br>For a detailed look at the available features, <a href="${Util.derefer('https://github.com/gardenshade/mam-plus/wiki/Feature-Overview')}">check the Wiki!</a><br><br></td></tr>`;
            Object.keys(page).forEach((scope) => {
                const scopeNum = Number(scope);
                // Insert the section title
                outp += `<tr><td class='row2'>${SettingGroup[scopeNum]}</td><td class='row1'>`;
                // Create the required input field based on the setting
                Object.keys(page[scopeNum]).forEach((setting) => {
                    const settingNumber = Number(setting);
                    const item = page[scopeNum][settingNumber];
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
                                    outp += `<option value='${key}'>${item.options[key]}</option>`;
                                });
                            }
                            outp += `</select>${item.desc}<br>`;
                        },
                    };
                    if (item.type)
                        cases[item.type]();
                });
                // Close the row
                outp += '</td></tr>';
            });
            // Add the save button & last part of the table
            outp +=
                '<tr><td class="row1" colspan="2"><div id="mp_submit" class="mp_settingBtn">Save M+ Settings??</div><div id="mp_copy" class="mp_settingBtn">Copy Settings</div><div id="mp_inject" class="mp_settingBtn">Paste Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>';
            resolve(outp);
        });
    }
    // Function for retrieving the current settings values
    static _getSettings(page) {
        // Util.purgeSettings();
        const allValues = GM_listValues();
        if (MP.DEBUG) {
            console.log('_getSettings(', page, ')\nStored GM keys:', allValues);
        }
        Object.keys(page).forEach((scope) => {
            Object.keys(page[Number(scope)]).forEach((setting) => {
                const pref = page[Number(scope)][Number(setting)];
                if (MP.DEBUG) {
                    console.log('Pref:', pref.title, '| Set:', GM_getValue(`${pref.title}`), '| Value:', GM_getValue(`${pref.title}_val`));
                }
                if (pref !== null && typeof pref === 'object') {
                    const elem = (document.getElementById(pref.title));
                    const cases = {
                        checkbox: () => {
                            elem.setAttribute('checked', 'checked');
                        },
                        textbox: () => {
                            elem.value = GM_getValue(`${pref.title}_val`);
                        },
                        dropdown: () => {
                            elem.value = GM_getValue(pref.title);
                        },
                    };
                    if (cases[pref.type] && GM_getValue(pref.title))
                        cases[pref.type]();
                }
            });
        });
    }
    static _setSettings(obj) {
        if (MP.DEBUG)
            console.log(`_setSettings(`, obj, ')');
        Object.keys(obj).forEach((scope) => {
            Object.keys(obj[Number(scope)]).forEach((setting) => {
                const pref = obj[Number(scope)][Number(setting)];
                if (pref !== null && typeof pref === 'object') {
                    const elem = (document.getElementById(pref.title));
                    const cases = {
                        checkbox: () => {
                            if (elem.checked)
                                GM_setValue(pref.title, true);
                        },
                        textbox: () => {
                            const inp = elem.value;
                            if (inp !== '') {
                                GM_setValue(pref.title, true);
                                GM_setValue(`${pref.title}_val`, inp);
                            }
                        },
                        dropdown: () => {
                            GM_setValue(pref.title, elem.value);
                        },
                    };
                    if (cases[pref.type])
                        cases[pref.type]();
                }
            });
        });
        console.log('[M+] Saved!');
    }
    static _copySettings() {
        const gmList = GM_listValues();
        const outp = [];
        // Loop over all stored settings and push to output array
        gmList.map((setting) => {
            // Don't export mp_ settings as they should only be set at runtime
            if (setting.indexOf('mp_') < 0) {
                outp.push([setting, GM_getValue(setting)]);
            }
        });
        return JSON.stringify(outp);
    }
    static _pasteSettings(payload) {
        if (MP.DEBUG)
            console.group(`_pasteSettings( )`);
        const settings = JSON.parse(payload);
        settings.forEach((tuple) => {
            if (tuple[1]) {
                GM_setValue(`${tuple[0]}`, `${tuple[1]}`);
                if (MP.DEBUG)
                    console.log(tuple[0], ': ', tuple[1]);
            }
        });
    }
    // Function that saves the values of the settings table
    static _saveSettings(timer, obj) {
        if (MP.DEBUG)
            console.group(`_saveSettings()`);
        const savestate = (document.querySelector('span.mp_savestate'));
        const gmValues = GM_listValues();
        // Reset timer & message
        savestate.style.opacity = '0';
        window.clearTimeout(timer);
        console.log('[M+] Saving...');
        // Loop over all values stored in GM and reset everything
        for (const feature in gmValues) {
            if (typeof gmValues[feature] !== 'function') {
                // Only loop over values that are feature settings
                if (!['mp_version', 'style_theme'].includes(gmValues[feature])) {
                    //if not part of preferences page
                    if (gmValues[feature].indexOf('mp_') !== 0) {
                        GM_setValue(gmValues[feature], false);
                    }
                }
            }
        }
        // Save the settings to GM values
        this._setSettings(obj);
        // Display the confirmation message
        savestate.style.opacity = '1';
        try {
            timer = window.setTimeout(() => {
                savestate.style.opacity = '0';
            }, 2345);
        }
        catch (e) {
            if (MP.DEBUG)
                console.warn(e);
        }
        if (MP.DEBUG)
            console.groupEnd();
    }
    /**
     * Inserts the settings page.
     * @param result Value that must be passed down from `Check.page('settings')`
     * @param settings The array of features to provide settings for
     */
    static init(result, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            // This will only run if `Check.page('settings)` returns true & is passed here
            if (result === true) {
                if (MP.DEBUG) {
                    console.group(`new Settings()`);
                }
                // Make sure the settings table has loaded
                yield Check.elemLoad('#mainBody > table').then((r) => {
                    if (MP.DEBUG)
                        console.log(`[M+] Starting to build Settings table...`);
                    // Create new table elements
                    const settingNav = document.querySelector('#mainBody > table');
                    const settingTitle = document.createElement('h1');
                    const settingTable = document.createElement('table');
                    let pageScope;
                    // Insert table elements after the Pref navbar
                    settingNav.insertAdjacentElement('afterend', settingTitle);
                    settingTitle.insertAdjacentElement('afterend', settingTable);
                    Util.setAttr(settingTable, {
                        class: 'coltable',
                        cellspacing: '1',
                        style: 'width:100%;min-width:100%;max-width:100%;',
                    });
                    settingTitle.innerHTML = 'MAM+ Settings';
                    // Group settings by page
                    this._getScopes(settings)
                        // Generate table HTML from feature settings
                        .then((scopes) => {
                        pageScope = scopes;
                        return this._buildTable(scopes);
                    })
                        // Insert content into the new table elements
                        .then((result) => {
                        settingTable.innerHTML = result;
                        console.log('[M+] Added the MAM+ Settings table!');
                        return pageScope;
                    })
                        .then((scopes) => {
                        this._getSettings(scopes);
                        return scopes;
                    })
                        // Make sure the settings are done loading
                        .then((scopes) => {
                        const submitBtn = (document.querySelector('#mp_submit'));
                        const copyBtn = (document.querySelector('#mp_copy'));
                        const pasteBtn = (document.querySelector('#mp_inject'));
                        let ssTimer;
                        try {
                            submitBtn.addEventListener('click', () => {
                                this._saveSettings(ssTimer, scopes);
                            }, false);
                            Util.clipboardifyBtn(pasteBtn, this._pasteSettings, false);
                            Util.clipboardifyBtn(copyBtn, this._copySettings());
                        }
                        catch (err) {
                            if (MP.DEBUG)
                                console.warn(err);
                        }
                        if (MP.DEBUG) {
                            console.groupEnd();
                        }
                    });
                });
            }
        });
    }
}
/// <reference path="types.ts" />
/// <reference path="style.ts" />
/// <reference path="./modules/core.ts" />
/// <reference path="./modules/global.ts" />
/// <reference path="./modules/browse.ts" />
/// <reference path="./modules/freeleech.ts" />
/// <reference path="./modules/forum.ts" />
/// <reference path="./modules/home.ts" />
/// <reference path="./modules/request.ts" />
/// <reference path="./modules/shout.ts" />
/// <reference path="./modules/tor.ts" />
/// <reference path="./modules/upload.ts" />
/// <reference path="./modules/user.ts" />
/// <reference path="./modules/vault.ts" />
/// <reference path="./modules/store.ts" />
/// <reference path="features.ts" />
/// <reference path="settings.ts" />
/**
 * * Userscript namespace
 * @constant CHANGELOG: Object containing a list of changes and known bugs
 * @constant TIMESTAMP: Placeholder hook for the current build time
 * @constant VERSION: The current userscript version
 * @constant PREV_VER: The last installed userscript version
 * @constant ERRORLOG: The target array for logging errors
 * @constant PAGE_PATH: The current page URL without the site address
 * @constant MP_CSS: The MAM+ stylesheet
 * @constant run(): Starts the userscript
 */
var MP;
(function (MP) {
    MP.DEBUG = GM_getValue('debug') ? true : false;
    MP.CHANGELOG = {
        /* 🆕♻️🐞 */
        UPDATE_LIST: [
            '🆕: Added Gift All button to the New Users page. Thanks @sherman76400!!!',
            '🆕: Added a spot to save notes on user pages. Also thanks @sherman76400!',
        ],
        BUG_LIST: [],
    };
    MP.TIMESTAMP = 'Feb 28';
    MP.VERSION = Check.newVer;
    MP.PREV_VER = Check.prevVer;
    MP.ERRORLOG = [];
    MP.PAGE_PATH = window.location.pathname;
    MP.MP_CSS = new Style();
    MP.settingsGlob = [];
    MP.run = () => __awaiter(this, void 0, void 0, function* () {
        /**
         * * PRE SCRIPT
         */
        console.group(`Welcome to MAM+ v${MP.VERSION}!`);
        // The current page is not yet known
        GM_deleteValue('mp_currentPage');
        Check.page();
        // Add a simple cookie to announce the script is being used
        document.cookie = 'mp_enabled=1;domain=myanonamouse.net;path=/;samesite=lax';
        // Initialize core functions
        const alerts = new Alerts();
        new Debug();
        // Notify the user if the script was updated
        Check.updated().then((result) => {
            if (result)
                alerts.notify(result, MP.CHANGELOG);
        });
        // Initialize the features
        new InitFeatures();
        /**
         * * SETTINGS
         */
        Check.page('settings').then((result) => {
            const subPg = window.location.search;
            if (result === true && (subPg === '' || subPg === '?view=general')) {
                // Initialize the settings page
                Settings.init(result, MP.settingsGlob);
            }
        });
        /**
         * * STYLES
         * Injects CSS
         */
        Check.elemLoad('head link[href*="ICGstation"]').then(() => {
            // Add custom CSS sheet
            MP.MP_CSS.injectLink();
            // Get the current site theme
            MP.MP_CSS.alignToSiteTheme();
        });
        console.groupEnd();
    });
})(MP || (MP = {}));
// * Start the userscript
MP.run();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL3NoYXJlZC50cyIsInNyYy9tb2R1bGVzL2Jyb3dzZS50cyIsInNyYy9tb2R1bGVzL2ZyZWVsZWVjaC50cyIsInNyYy9tb2R1bGVzL2ZvcnVtLnRzIiwic3JjL21vZHVsZXMvaG9tZS50cyIsInNyYy9tb2R1bGVzL3JlcXVlc3QudHMiLCJzcmMvbW9kdWxlcy9zaG91dC50cyIsInNyYy9tb2R1bGVzL3Rvci50cyIsInNyYy9tb2R1bGVzL3VwbG9hZC50cyIsInNyYy9tb2R1bGVzL3VzZXIudHMiLCJzcmMvbW9kdWxlcy92YXVsdC50cyIsInNyYy9tb2R1bGVzL3N0b3JlLnRzIiwic3JjL2ZlYXR1cmVzLnRzIiwic3JjL3NldHRpbmdzLnRzIiwic3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7R0FFRztBQW9CSCxJQUFLLFlBYUo7QUFiRCxXQUFLLFlBQVk7SUFDYixtREFBUSxDQUFBO0lBQ1IsK0NBQU0sQ0FBQTtJQUNOLG1EQUFRLENBQUE7SUFDUix1REFBVSxDQUFBO0lBQ1YsK0RBQWMsQ0FBQTtJQUNkLHVEQUFVLENBQUE7SUFDVixpREFBTyxDQUFBO0lBQ1AsaURBQU8sQ0FBQTtJQUNQLDJEQUFZLENBQUE7SUFDWiw2REFBYSxDQUFBO0lBQ2Isa0RBQU8sQ0FBQTtJQUNQLGtEQUFPLENBQUE7QUFDWCxDQUFDLEVBYkksWUFBWSxLQUFaLFlBQVksUUFhaEI7QUNuQ0Q7Ozs7R0FJRzs7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FB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Z0IsRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQSxDQUFDO0FBQ04sQ0FBQyxFQS9EUyxFQUFFLEtBQUYsRUFBRSxRQStEWDtBQUVELHlCQUF5QjtBQUN6QixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoibWFtLXBsdXNfZGV2LnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFR5cGVzLCBJbnRlcmZhY2VzLCBldGMuXG4gKi9cblxudHlwZSBWYWxpZFBhZ2UgPVxuICAgIHwgJ2hvbWUnXG4gICAgfCAnYnJvd3NlJ1xuICAgIHwgJ2ZyZWVsZWVjaCdcbiAgICB8ICdyZXF1ZXN0J1xuICAgIHwgJ3JlcXVlc3QgZGV0YWlscydcbiAgICB8ICd0b3JyZW50J1xuICAgIHwgJ3Nob3V0Ym94J1xuICAgIHwgJ3ZhdWx0J1xuICAgIHwgJ3N0b3JlJ1xuICAgIHwgJ3VzZXInXG4gICAgfCAndXBsb2FkJ1xuICAgIHwgJ2ZvcnVtIHRocmVhZCdcbiAgICB8ICdzZXR0aW5ncydcbiAgICB8ICduZXcgdXNlcnMnO1xuXG50eXBlIEJvb2tEYXRhID0gJ2Jvb2snIHwgJ2F1dGhvcicgfCAnc2VyaWVzJztcblxuZW51bSBTZXR0aW5nR3JvdXAge1xuICAgICdHbG9iYWwnLFxuICAgICdIb21lJyxcbiAgICAnU2VhcmNoJyxcbiAgICAnUmVxdWVzdHMnLFxuICAgICdUb3JyZW50IFBhZ2UnLFxuICAgICdTaG91dGJveCcsXG4gICAgJ1ZhdWx0JyxcbiAgICAnU3RvcmUnLFxuICAgICdVc2VyIFBhZ2VzJyxcbiAgICAnVXBsb2FkIFBhZ2UnLFxuICAgICdGb3J1bScsXG4gICAgJ090aGVyJyxcbn1cblxudHlwZSBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JyB8ICdtdXRlJztcblxudHlwZSBTdG9yZVNvdXJjZSA9XG4gICAgfCAxXG4gICAgfCAnMi41J1xuICAgIHwgJzQnXG4gICAgfCAnNSdcbiAgICB8ICc4J1xuICAgIHwgJzIwJ1xuICAgIHwgJzEwMCdcbiAgICB8ICdwb2ludHMnXG4gICAgfCAnY2hlZXNlJ1xuICAgIHwgJ21heCdcbiAgICB8ICdNYXggQWZmb3JkYWJsZSdcbiAgICB8ICdzZWVkdGltZSdcbiAgICB8ICdTZWxsJ1xuICAgIHwgJ3JhdGlvJ1xuICAgIHwgJ0ZvcnVtJztcblxuaW50ZXJmYWNlIFVzZXJHaWZ0SGlzdG9yeSB7XG4gICAgYW1vdW50OiBudW1iZXI7XG4gICAgb3RoZXJfbmFtZTogc3RyaW5nO1xuICAgIG90aGVyX3VzZXJpZDogbnVtYmVyO1xuICAgIHRpZDogbnVtYmVyIHwgbnVsbDtcbiAgICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgICB0aXRsZTogc3RyaW5nIHwgbnVsbDtcbiAgICB0eXBlOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBBcnJheU9iamVjdCB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBTdHJpbmdPYmplY3Qge1xuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEJvb2tEYXRhT2JqZWN0IGV4dGVuZHMgU3RyaW5nT2JqZWN0IHtcbiAgICBbJ2V4dHJhY3RlZCddOiBzdHJpbmc7XG4gICAgWydkZXNjJ106IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIERpdlJvd09iamVjdCB7XG4gICAgWyd0aXRsZSddOiBzdHJpbmc7XG4gICAgWydkYXRhJ106IEhUTUxEaXZFbGVtZW50O1xufVxuXG5pbnRlcmZhY2UgU2V0dGluZ0dsb2JPYmplY3Qge1xuICAgIFtrZXk6IG51bWJlcl06IEZlYXR1cmVTZXR0aW5nc1tdO1xufVxuXG5pbnRlcmZhY2UgRmVhdHVyZVNldHRpbmdzIHtcbiAgICBzY29wZTogU2V0dGluZ0dyb3VwO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgdHlwZTogJ2NoZWNrYm94JyB8ICdkcm9wZG93bicgfCAndGV4dGJveCc7XG4gICAgZGVzYzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQW55RmVhdHVyZSBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XG4gICAgdGFnPzogc3RyaW5nO1xuICAgIG9wdGlvbnM/OiBTdHJpbmdPYmplY3Q7XG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBGZWF0dXJlIHtcbiAgICBzZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nIHwgRHJvcGRvd25TZXR0aW5nIHwgVGV4dGJveFNldHRpbmc7XG59XG5cbmludGVyZmFjZSBDaGVja2JveFNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xuICAgIHR5cGU6ICdjaGVja2JveCc7XG59XG5cbmludGVyZmFjZSBEcm9wZG93blNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xuICAgIHR5cGU6ICdkcm9wZG93bic7XG4gICAgdGFnOiBzdHJpbmc7XG4gICAgb3B0aW9uczogU3RyaW5nT2JqZWN0O1xufVxuXG5pbnRlcmZhY2UgVGV4dGJveFNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xuICAgIHR5cGU6ICd0ZXh0Ym94JztcbiAgICB0YWc6IHN0cmluZztcbiAgICBwbGFjZWhvbGRlcjogc3RyaW5nO1xufVxuXG4vLyBuYXZpZ2F0b3IuY2xpcGJvYXJkLmQudHNcblxuLy8gVHlwZSBkZWNsYXJhdGlvbnMgZm9yIENsaXBib2FyZCBBUElcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DbGlwYm9hcmRfQVBJXG5pbnRlcmZhY2UgQ2xpcGJvYXJkIHtcbiAgICB3cml0ZVRleHQobmV3Q2xpcFRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XG4gICAgLy8gQWRkIGFueSBvdGhlciBtZXRob2RzIHlvdSBuZWVkIGhlcmUuXG59XG5cbmludGVyZmFjZSBOYXZpZ2F0b3JDbGlwYm9hcmQge1xuICAgIC8vIE9ubHkgYXZhaWxhYmxlIGluIGEgc2VjdXJlIGNvbnRleHQuXG4gICAgcmVhZG9ubHkgY2xpcGJvYXJkPzogQ2xpcGJvYXJkO1xufVxuXG5pbnRlcmZhY2UgTmF2aWdhdG9yRXh0ZW5kZWQgZXh0ZW5kcyBOYXZpZ2F0b3JDbGlwYm9hcmQge31cbiIsIi8qKlxuICogQ2xhc3MgY29udGFpbmluZyBjb21tb24gdXRpbGl0eSBtZXRob2RzXG4gKlxuICogSWYgdGhlIG1ldGhvZCBzaG91bGQgaGF2ZSB1c2VyLWNoYW5nZWFibGUgc2V0dGluZ3MsIGNvbnNpZGVyIHVzaW5nIGBDb3JlLnRzYCBpbnN0ZWFkXG4gKi9cblxuY2xhc3MgVXRpbCB7XG4gICAgLyoqXG4gICAgICogQW5pbWF0aW9uIGZyYW1lIHRpbWVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhZlRpbWVyKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWxsb3dzIHNldHRpbmcgbXVsdGlwbGUgYXR0cmlidXRlcyBhdCBvbmNlXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzZXRBdHRyKGVsOiBFbGVtZW50LCBhdHRyOiBTdHJpbmdPYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyKSB7XG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cltrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgXCJsZW5ndGhcIiBvZiBhbiBPYmplY3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG9iamVjdExlbmd0aChvYmo6IE9iamVjdCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb3JjZWZ1bGx5IGVtcHRpZXMgYW55IEdNIHN0b3JlZCB2YWx1ZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHB1cmdlU2V0dGluZ3MoKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgR01fbGlzdFZhbHVlcygpKSB7XG4gICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2cgYSBtZXNzYWdlIGFib3V0IGEgY291bnRlZCByZXN1bHRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlcG9ydENvdW50KGRpZDogc3RyaW5nLCBudW06IG51bWJlciwgdGhpbmc6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBzaW5ndWxhciA9IDE7XG4gICAgICAgIGlmIChudW0gIT09IHNpbmd1bGFyKSB7XG4gICAgICAgICAgICB0aGluZyArPSAncyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgPiAke2RpZH0gJHtudW19ICR7dGhpbmd9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIGZlYXR1cmVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHN0YXJ0RmVhdHVyZShcbiAgICAgICAgc2V0dGluZ3M6IEZlYXR1cmVTZXR0aW5ncyxcbiAgICAgICAgZWxlbTogc3RyaW5nLFxuICAgICAgICBwYWdlPzogVmFsaWRQYWdlW11cbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gUXVldWUgdGhlIHNldHRpbmdzIGluIGNhc2UgdGhleSdyZSBuZWVkZWRcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2goc2V0dGluZ3MpO1xuXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIHJldHVybiB0cnVlIHdoZW4gdGhlIGVsZW1lbnQgaXMgbG9hZGVkXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVyOiBQcm9taXNlPGZhbHNlPiA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMjAwMCwgZmFsc2UpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgY2hlY2tFbGVtID0gQ2hlY2suZWxlbUxvYWQoZWxlbSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lciwgY2hlY2tFbGVtXSkudGhlbigodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICBgc3RhcnRGZWF0dXJlKCR7c2V0dGluZ3MudGl0bGV9KSBVbmFibGUgdG8gaW5pdGlhdGUhIENvdWxkIG5vdCBmaW5kIGVsZW1lbnQ6ICR7ZWxlbX1gXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElzIHRoZSBzZXR0aW5nIGVuYWJsZWQ/XG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZShzZXR0aW5ncy50aXRsZSkpIHtcbiAgICAgICAgICAgIC8vIEEgc3BlY2lmaWMgcGFnZSBpcyBuZWVkZWRcbiAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIExvb3Agb3ZlciBhbGwgcmVxdWlyZWQgcGFnZXNcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzOiBib29sZWFuW10gPSBbXTtcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ2hlY2sucGFnZShwKS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goPGJvb2xlYW4+cik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIElmIGFueSByZXF1ZXN0ZWQgcGFnZSBtYXRjaGVzIHRoZSBjdXJyZW50IHBhZ2UsIHJ1biB0aGUgZmVhdHVyZVxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmluY2x1ZGVzKHRydWUpID09PSB0cnVlKSByZXR1cm4gcnVuKCk7XG4gICAgICAgICAgICAgICAgZWxzZSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAvLyBTa2lwIHRvIGVsZW1lbnQgY2hlY2tpbmdcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2V0dGluZyBpcyBub3QgZW5hYmxlZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpbXMgYSBzdHJpbmcgbG9uZ2VyIHRoYW4gYSBzcGVjaWZpZWQgY2hhciBsaW1pdCwgdG8gYSBmdWxsIHdvcmRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRyaW1TdHJpbmcoaW5wOiBzdHJpbmcsIG1heDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKGlucC5sZW5ndGggPiBtYXgpIHtcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgbWF4ICsgMSk7XG4gICAgICAgICAgICBpbnAgPSBpbnAuc3Vic3RyaW5nKDAsIE1hdGgubWluKGlucC5sZW5ndGgsIGlucC5sYXN0SW5kZXhPZignICcpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGJyYWNrZXRzICYgYWxsIGNvbnRhaW5lZCB3b3JkcyBmcm9tIGEgc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0UmVtb3ZlcihpbnA6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBpbnBcbiAgICAgICAgICAgIC5yZXBsYWNlKC97Ky4qP30rL2csICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcW1xcW3xcXF1cXF0vZywgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC4qPz4vZywgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwoLio/XFwpL2csICcnKVxuICAgICAgICAgICAgLnRyaW0oKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpSZXR1cm4gdGhlIGNvbnRlbnRzIGJldHdlZW4gYnJhY2tldHNcbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYnJhY2tldENvbnRlbnRzID0gKGlucDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBpbnAubWF0Y2goL1xcKChbXildKylcXCkvKSFbMV07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGEgc3RyaW5nIHRvIGFuIGFycmF5XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdUb0FycmF5KGlucDogc3RyaW5nLCBzcGxpdFBvaW50PzogJ3dzJyk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHNwbGl0UG9pbnQgIT09IHVuZGVmaW5lZCAmJiBzcGxpdFBvaW50ICE9PSAnd3MnXG4gICAgICAgICAgICA/IGlucC5zcGxpdChzcGxpdFBvaW50KVxuICAgICAgICAgICAgOiBpbnAubWF0Y2goL1xcUysvZykgfHwgW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBjb21tYSAob3Igb3RoZXIpIHNlcGFyYXRlZCB2YWx1ZSBpbnRvIGFuIGFycmF5XG4gICAgICogQHBhcmFtIGlucCBTdHJpbmcgdG8gYmUgZGl2aWRlZFxuICAgICAqIEBwYXJhbSBkaXZpZGVyIFRoZSBkaXZpZGVyIChkZWZhdWx0OiAnLCcpXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjc3ZUb0FycmF5KGlucDogc3RyaW5nLCBkaXZpZGVyOiBzdHJpbmcgPSAnLCcpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgaW5wLnNwbGl0KGRpdmlkZXIpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGFyci5wdXNoKGl0ZW0udHJpbSgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBhbiBhcnJheSB0byBhIHN0cmluZ1xuICAgICAqIEBwYXJhbSBpbnAgc3RyaW5nXG4gICAgICogQHBhcmFtIGVuZCBjdXQtb2ZmIHBvaW50XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhcnJheVRvU3RyaW5nKGlucDogc3RyaW5nW10sIGVuZD86IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcbiAgICAgICAgaW5wLmZvckVhY2goKGtleSwgdmFsKSA9PiB7XG4gICAgICAgICAgICBvdXRwICs9IGtleTtcbiAgICAgICAgICAgIGlmIChlbmQgJiYgdmFsICsgMSAhPT0gaW5wLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG91dHAgKz0gJyAnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG91dHA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBET00gbm9kZSByZWZlcmVuY2UgaW50byBhbiBIVE1MIEVsZW1lbnQgcmVmZXJlbmNlXG4gICAgICogQHBhcmFtIG5vZGUgVGhlIG5vZGUgdG8gY29udmVydFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbm9kZVRvRWxlbShub2RlOiBOb2RlKTogSFRNTEVsZW1lbnQge1xuICAgICAgICBpZiAobm9kZS5maXJzdENoaWxkICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gPEhUTUxFbGVtZW50Pm5vZGUuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vZGUtdG8tZWxlbSB3aXRob3V0IGNoaWxkbm9kZSBpcyB1bnRlc3RlZCcpO1xuICAgICAgICAgICAgY29uc3QgdGVtcE5vZGU6IE5vZGUgPSBub2RlO1xuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0ZW1wTm9kZSk7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+bm9kZS5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50ITtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQodGVtcE5vZGUpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWF0Y2ggc3RyaW5ncyB3aGlsZSBpZ25vcmluZyBjYXNlIHNlbnNpdGl2aXR5XG4gICAgICogQHBhcmFtIGEgRmlyc3Qgc3RyaW5nXG4gICAgICogQHBhcmFtIGIgU2Vjb25kIHN0cmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2FzZWxlc3NTdHJpbmdNYXRjaChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjb21wYXJlOiBudW1iZXIgPSBhLmxvY2FsZUNvbXBhcmUoYiwgJ2VuJywge1xuICAgICAgICAgICAgc2Vuc2l0aXZpdHk6ICdiYXNlJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb21wYXJlID09PSAwID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBUb3JEZXRSb3cgYW5kIHJldHVybiB0aGUgaW5uZXIgZGl2XG4gICAgICogQHBhcmFtIHRhciBUaGUgcm93IHRvIGJlIHRhcmdldHRlZFxuICAgICAqIEBwYXJhbSBsYWJlbCBUaGUgbmFtZSB0byBiZSBkaXNwbGF5ZWQgZm9yIHRoZSBuZXcgcm93XG4gICAgICogQHBhcmFtIHJvd0NsYXNzIFRoZSByb3cncyBjbGFzc25hbWUgKHNob3VsZCBzdGFydCB3aXRoIG1wXylcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFkZFRvckRldGFpbHNSb3coXG4gICAgICAgIHRhcjogSFRNTERpdkVsZW1lbnQgfCBudWxsLFxuICAgICAgICBsYWJlbDogc3RyaW5nLFxuICAgICAgICByb3dDbGFzczogc3RyaW5nXG4gICAgKTogSFRNTERpdkVsZW1lbnQge1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHRhcik7XG5cbiAgICAgICAgaWYgKHRhciA9PT0gbnVsbCB8fCB0YXIucGFyZW50RWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBZGQgVG9yIERldGFpbHMgUm93OiBlbXB0eSBub2RlIG9yIHBhcmVudCBub2RlIEAgJHt0YXJ9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXIucGFyZW50RWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cInRvckRldFJvd1wiPjxkaXYgY2xhc3M9XCJ0b3JEZXRMZWZ0XCI+JHtsYWJlbH08L2Rpdj48ZGl2IGNsYXNzPVwidG9yRGV0UmlnaHQgJHtyb3dDbGFzc31cIj48c3BhbiBjbGFzcz1cImZsZXhcIj48L3NwYW4+PC9kaXY+PC9kaXY+YFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtyb3dDbGFzc30gLmZsZXhgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE86IE1lcmdlIHdpdGggYFV0aWwuY3JlYXRlQnV0dG9uYFxuICAgIC8qKlxuICAgICAqIEluc2VydHMgYSBsaW5rIGJ1dHRvbiB0aGF0IGlzIHN0eWxlZCBsaWtlIGEgc2l0ZSBidXR0b24gKGV4LiBpbiB0b3IgZGV0YWlscylcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHRoZSBidXR0b24gc2hvdWxkIGJlIGFkZGVkIHRvXG4gICAgICogQHBhcmFtIHVybCBUaGUgVVJMIHRoZSBidXR0b24gd2lsbCBzZW5kIHlvdSB0b1xuICAgICAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IG9uIHRoZSBidXR0b25cbiAgICAgKiBAcGFyYW0gb3JkZXIgT3B0aW9uYWw6IGZsZXggZmxvdyBvcmRlcmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGlua0J1dHRvbihcbiAgICAgICAgdGFyOiBIVE1MRWxlbWVudCxcbiAgICAgICAgdXJsOiBzdHJpbmcgPSAnbm9uZScsXG4gICAgICAgIHRleHQ6IHN0cmluZyxcbiAgICAgICAgb3JkZXI6IG51bWJlciA9IDBcbiAgICApOiB2b2lkIHtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBidXR0b25cbiAgICAgICAgY29uc3QgYnV0dG9uOiBIVE1MQW5jaG9yRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgLy8gU2V0IHVwIHRoZSBidXR0b25cbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ21wX2J1dHRvbl9jbG9uZScpO1xuICAgICAgICBpZiAodXJsICE9PSAnbm9uZScpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xuICAgICAgICB9XG4gICAgICAgIGJ1dHRvbi5pbm5lclRleHQgPSB0ZXh0O1xuICAgICAgICBidXR0b24uc3R5bGUub3JkZXIgPSBgJHtvcmRlcn1gO1xuICAgICAgICAvLyBJbmplY3QgdGhlIGJ1dHRvblxuICAgICAgICB0YXIuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgdGFyLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc2VydHMgYSBub24tbGlua2VkIGJ1dHRvblxuICAgICAqIEBwYXJhbSBpZCBUaGUgSUQgb2YgdGhlIGJ1dHRvblxuICAgICAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IGRpc3BsYXllZCBpbiB0aGUgYnV0dG9uXG4gICAgICogQHBhcmFtIHR5cGUgVGhlIEhUTUwgZWxlbWVudCB0byBjcmVhdGUuIERlZmF1bHQ6IGBoMWBcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBIVE1MIGVsZW1lbnQgdGhlIGJ1dHRvbiB3aWxsIGJlIGByZWxhdGl2ZWAgdG9cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmUgVGhlIHBvc2l0aW9uIG9mIHRoZSBidXR0b24gcmVsYXRpdmUgdG8gdGhlIGB0YXJgLiBEZWZhdWx0OiBgYWZ0ZXJlbmRgXG4gICAgICogQHBhcmFtIGJ0bkNsYXNzIFRoZSBjbGFzc25hbWUgb2YgdGhlIGVsZW1lbnQuIERlZmF1bHQ6IGBtcF9idG5gXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVCdXR0b24oXG4gICAgICAgIGlkOiBzdHJpbmcsXG4gICAgICAgIHRleHQ6IHN0cmluZyxcbiAgICAgICAgdHlwZTogc3RyaW5nID0gJ2gxJyxcbiAgICAgICAgdGFyOiBzdHJpbmcgfCBIVE1MRWxlbWVudCxcbiAgICAgICAgcmVsYXRpdmU6ICdiZWZvcmViZWdpbicgfCAnYWZ0ZXJlbmQnID0gJ2FmdGVyZW5kJyxcbiAgICAgICAgYnRuQ2xhc3M6IHN0cmluZyA9ICdtcF9idG4nXG4gICAgKTogUHJvbWlzZTxIVE1MRWxlbWVudD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gQ2hvb3NlIHRoZSBuZXcgYnV0dG9uIGluc2VydCBsb2NhdGlvbiBhbmQgaW5zZXJ0IGVsZW1lbnRzXG4gICAgICAgICAgICAvLyBjb25zdCB0YXJnZXQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcik7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9XG4gICAgICAgICAgICAgICAgdHlwZW9mIHRhciA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcikgOiB0YXI7XG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlamVjdChgJHt0YXJ9IGlzIG51bGwhYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldC5pbnNlcnRBZGphY2VudEVsZW1lbnQocmVsYXRpdmUsIGJ0bik7XG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKGJ0biwge1xuICAgICAgICAgICAgICAgICAgICBpZDogYG1wXyR7aWR9YCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGJ0bkNsYXNzLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiAnYnV0dG9uJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCBidXR0b24gdGV4dFxuICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYnRuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYW4gZWxlbWVudCBpbnRvIGEgYnV0dG9uIHRoYXQsIHdoZW4gY2xpY2tlZCwgY29waWVzIHRleHQgdG8gY2xpcGJvYXJkXG4gICAgICogQHBhcmFtIGJ0biBBbiBIVE1MIEVsZW1lbnQgYmVpbmcgdXNlZCBhcyBhIGJ1dHRvblxuICAgICAqIEBwYXJhbSBwYXlsb2FkIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBjb3BpZWQgdG8gY2xpcGJvYXJkIG9uIGJ1dHRvbiBjbGljaywgb3IgYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgdXNlIHRoZSBjbGlwYm9hcmQncyBjdXJyZW50IHRleHRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNsaXBib2FyZGlmeUJ0bihcbiAgICAgICAgYnRuOiBIVE1MRWxlbWVudCxcbiAgICAgICAgcGF5bG9hZDogYW55LFxuICAgICAgICBjb3B5OiBib29sZWFuID0gdHJ1ZVxuICAgICk6IHZvaWQge1xuICAgICAgICBidG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBIYXZlIHRvIG92ZXJyaWRlIHRoZSBOYXZpZ2F0b3IgdHlwZSB0byBwcmV2ZW50IFRTIGVycm9yc1xuICAgICAgICAgICAgY29uc3QgbmF2OiBOYXZpZ2F0b3JFeHRlbmRlZCB8IHVuZGVmaW5lZCA9IDxOYXZpZ2F0b3JFeHRlbmRlZD5uYXZpZ2F0b3I7XG4gICAgICAgICAgICBpZiAobmF2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgdGV4dCwgbGlrZWx5IGR1ZSB0byBtaXNzaW5nIGJyb3dzZXIgc3VwcG9ydC4nKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCAnbmF2aWdhdG9yJz9cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIE5hdmlnYXRvciBFeGlzdHMgKi9cblxuICAgICAgICAgICAgICAgIGlmIChjb3B5ICYmIHR5cGVvZiBwYXlsb2FkID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHJlc3VsdHMgdG8gY2xpcGJvYXJkXG4gICAgICAgICAgICAgICAgICAgIG5hdi5jbGlwYm9hcmQhLndyaXRlVGV4dChwYXlsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIHRvIHlvdXIgY2xpcGJvYXJkIScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1biBwYXlsb2FkIGZ1bmN0aW9uIHdpdGggY2xpcGJvYXJkIHRleHRcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEucmVhZFRleHQoKS50aGVuKCh0ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkKHRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIGZyb20geW91ciBjbGlwYm9hcmQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ0bi5zdHlsZS5jb2xvciA9ICdncmVlbic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gSFRUUFJlcXVlc3QgZm9yIEdFVCBKU09OLCByZXR1cm5zIHRoZSBmdWxsIHRleHQgb2YgSFRUUCBHRVRcbiAgICAgKiBAcGFyYW0gdXJsIC0gYSBzdHJpbmcgb2YgdGhlIFVSTCB0byBzdWJtaXQgZm9yIEdFVCByZXF1ZXN0XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRKU09OKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdldEhUVFAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByZXN1bHRzIHdpdGggdGhlIGFtb3VudCBlbnRlcmVkIGJ5IHVzZXIgcGx1cyB0aGUgdXNlcm5hbWUgZm91bmQgb24gdGhlIG1lbnUgc2VsZWN0ZWRcbiAgICAgICAgICAgIGdldEhUVFAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIGdldEhUVFAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIGdldEhUVFAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRIVFRQLnJlYWR5U3RhdGUgPT09IDQgJiYgZ2V0SFRUUC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGdldEhUVFAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2V0SFRUUC5zZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdHdvIHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0gbWluIGEgbnVtYmVyIG9mIHRoZSBib3R0b20gb2YgcmFuZG9tIG51bWJlciBwb29sXG4gICAgICogQHBhcmFtIG1heCBhIG51bWJlciBvZiB0aGUgdG9wIG9mIHRoZSByYW5kb20gbnVtYmVyIHBvb2xcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJhbmRvbU51bWJlciA9IChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2xlZXAgdXRpbCB0byBiZSB1c2VkIGluIGFzeW5jIGZ1bmN0aW9ucyB0byBkZWxheSBwcm9ncmFtXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzbGVlcCA9IChtOiBhbnkpOiBQcm9taXNlPHZvaWQ+ID0+IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIG0pKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgbGFzdCBzZWN0aW9uIG9mIGFuIEhSRUZcbiAgICAgKiBAcGFyYW0gZWxlbSBBbiBhbmNob3IgZWxlbWVudFxuICAgICAqIEBwYXJhbSBzcGxpdCBPcHRpb25hbCBkaXZpZGVyLiBEZWZhdWx0cyB0byBgL2BcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGVuZE9mSHJlZiA9IChlbGVtOiBIVE1MQW5jaG9yRWxlbWVudCwgc3BsaXQgPSAnLycpID0+XG4gICAgICAgIGVsZW0uaHJlZi5zcGxpdChzcGxpdCkucG9wKCk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGhleCB2YWx1ZSBvZiBhIGNvbXBvbmVudCBhcyBhIHN0cmluZy5cbiAgICAgKiBGcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzhcbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIFV0aWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbXBvbmVudFRvSGV4ID0gKGM6IG51bWJlciB8IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgIGNvbnN0IGhleCA9IGMudG9TdHJpbmcoMTYpO1xuICAgICAgICByZXR1cm4gaGV4Lmxlbmd0aCA9PT0gMSA/IGAwJHtoZXh9YCA6IGhleDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGhleCBjb2xvciBjb2RlIGZyb20gUkdCLlxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJvZiBVdGlsXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZ2JUb0hleCA9IChyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuIGAjJHtVdGlsLmNvbXBvbmVudFRvSGV4KHIpfSR7VXRpbC5jb21wb25lbnRUb0hleChnKX0ke1V0aWwuY29tcG9uZW50VG9IZXgoXG4gICAgICAgICAgICBiXG4gICAgICAgICl9YDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBudW1iZXJzICh3aXRoIGZsb2F0KSBmcm9tIHRleHQgYW5kIHJldHVybiB0aGVtXG4gICAgICogQHBhcmFtIHRhciBBbiBIVE1MIGVsZW1lbnQgdGhhdCBjb250YWlucyBudW1iZXJzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0RmxvYXQgPSAodGFyOiBIVE1MRWxlbWVudCk6IG51bWJlcltdID0+IHtcbiAgICAgICAgaWYgKHRhci50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuICh0YXIudGV4dENvbnRlbnQhLnJlcGxhY2UoLywvZywgJycpLm1hdGNoKC9cXGQrXFwuXFxkKy8pIHx8IFtdKS5tYXAoKG4pID0+XG4gICAgICAgICAgICAgICAgcGFyc2VGbG9hdChuKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGFyZ2V0IGNvbnRhaW5zIG5vIHRleHQnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIEdldCB0aGUgdXNlciBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0aGUgbG9nZ2VkIGluIHVzZXIgYW5kIGEgZ2l2ZW4gSURcbiAgICAgKiBAcGFyYW0gdXNlcklEIEEgdXNlciBJRDsgY2FuIGJlIGEgc3RyaW5nIG9yIG51bWJlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0VXNlckdpZnRIaXN0b3J5KFxuICAgICAgICB1c2VySUQ6IG51bWJlciB8IHN0cmluZ1xuICAgICk6IFByb21pc2U8VXNlckdpZnRIaXN0b3J5W10+IHtcbiAgICAgICAgY29uc3QgcmF3R2lmdEhpc3Rvcnk6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTihcbiAgICAgICAgICAgIGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vdXNlckJvbnVzSGlzdG9yeS5waHA/b3RoZXJfdXNlcmlkPSR7dXNlcklEfWBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZ2lmdEhpc3Rvcnk6IEFycmF5PFVzZXJHaWZ0SGlzdG9yeT4gPSBKU09OLnBhcnNlKHJhd0dpZnRIaXN0b3J5KTtcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBmdWxsIGRhdGFcbiAgICAgICAgcmV0dXJuIGdpZnRIaXN0b3J5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgR2V0IHRoZSB1c2VyIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHRoZSBsb2dnZWQgaW4gdXNlciBhbmQgZXZlcnlvbmVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGdldEFsbFVzZXJHaWZ0SGlzdG9yeSgpOiBQcm9taXNlPFVzZXJHaWZ0SGlzdG9yeVtdPiB7XG4gICAgICAgIGNvbnN0IHJhd0dpZnRIaXN0b3J5OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04oXG4gICAgICAgICAgICBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL3VzZXJCb251c0hpc3RvcnkucGhwYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeTogQXJyYXk8VXNlckdpZnRIaXN0b3J5PiA9IEpTT04ucGFyc2UocmF3R2lmdEhpc3RvcnkpO1xuICAgICAgICAvLyBSZXR1cm4gdGhlIGZ1bGwgZGF0YVxuICAgICAgICByZXR1cm4gZ2lmdEhpc3Rvcnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIyMjIyBHZXRzIHRoZSBsb2dnZWQgaW4gdXNlcidzIHVzZXJpZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q3VycmVudFVzZXJJRCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBteUluZm8gPSA8SFRNTEFuY2hvckVsZW1lbnQ+KFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1tVXNlclN0YXRzIC5hdmF0YXIgYScpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChteUluZm8pIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJRCA9IDxzdHJpbmc+dGhpcy5lbmRPZkhyZWYobXlJbmZvKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIExvZ2dlZCBpbiB1c2VySUQgaXMgJHt1c2VySUR9YCk7XG4gICAgICAgICAgICByZXR1cm4gdXNlcklEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdObyBsb2dnZWQgaW4gdXNlciBmb3VuZC4nKTtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcHJldHR5U2l0ZVRpbWUodW5peFRpbWVzdGFtcDogbnVtYmVyLCBkYXRlPzogYm9vbGVhbiwgdGltZT86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUodW5peFRpbWVzdGFtcCAqIDEwMDApLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGlmIChkYXRlICYmICF0aW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLnNwbGl0KCdUJylbMF07XG4gICAgICAgIH0gZWxzZSBpZiAoIWRhdGUgJiYgdGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgQ2hlY2sgYSBzdHJpbmcgdG8gc2VlIGlmIGl0J3MgZGl2aWRlZCB3aXRoIGEgZGFzaCwgcmV0dXJuaW5nIHRoZSBmaXJzdCBoYWxmIGlmIGl0IGRvZXNuJ3QgY29udGFpbiBhIHNwZWNpZmllZCBzdHJpbmdcbiAgICAgKiBAcGFyYW0gb3JpZ2luYWwgVGhlIG9yaWdpbmFsIHN0cmluZyBiZWluZyBjaGVja2VkXG4gICAgICogQHBhcmFtIGNvbnRhaW5lZCBBIHN0cmluZyB0aGF0IG1pZ2h0IGJlIGNvbnRhaW5lZCBpbiB0aGUgb3JpZ2luYWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNoZWNrRGFzaGVzKG9yaWdpbmFsOiBzdHJpbmcsIGNvbnRhaW5lZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICBgY2hlY2tEYXNoZXMoICR7b3JpZ2luYWx9LCAke2NvbnRhaW5lZH0gKTogQ291bnQgJHtvcmlnaW5hbC5pbmRleE9mKFxuICAgICAgICAgICAgICAgICAgICAnIC0gJ1xuICAgICAgICAgICAgICAgICl9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERhc2hlcyBhcmUgcHJlc2VudFxuICAgICAgICBpZiAob3JpZ2luYWwuaW5kZXhPZignIC0gJykgIT09IC0xKSB7XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3RyaW5nIGNvbnRhaW5zIGEgZGFzaGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3BsaXQ6IHN0cmluZ1tdID0gb3JpZ2luYWwuc3BsaXQoJyAtICcpO1xuICAgICAgICAgICAgaWYgKHNwbGl0WzBdID09PSBjb250YWluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgICAgICAgICBgPiBTdHJpbmcgYmVmb3JlIGRhc2ggaXMgXCIke2NvbnRhaW5lZH1cIjsgdXNpbmcgc3RyaW5nIGJlaGluZCBkYXNoYFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBzcGxpdFswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIFV0aWxpdGllcyBzcGVjaWZpYyB0byBHb29kcmVhZHNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdvb2RyZWFkcyA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqICogUmVtb3ZlcyBzcGFjZXMgaW4gYXV0aG9yIG5hbWVzIHRoYXQgdXNlIGFkamFjZW50IGludGl0aWFscy5cbiAgICAgICAgICogQHBhcmFtIGF1dGggVGhlIGF1dGhvcihzKVxuICAgICAgICAgKiBAZXhhbXBsZSBcIkggRyBXZWxsc1wiIC0+IFwiSEcgV2VsbHNcIlxuICAgICAgICAgKi9cbiAgICAgICAgc21hcnRBdXRoOiAoYXV0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBVdGlsLnN0cmluZ1RvQXJyYXkoYXV0aCk7XG4gICAgICAgICAgICBhcnIuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IGtleSBpcyBhbiBpbml0aWFsXG4gICAgICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5leHQga2V5IGlzIGFuIGluaXRpYWwsIGRvbid0IGFkZCBhIHNwYWNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRMZW5nOiBudW1iZXIgPSBhcnJbdmFsICsgMV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dExlbmcgPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGtleTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgJHtrZXl9IGA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBUcmltIHRyYWlsaW5nIHNwYWNlXG4gICAgICAgICAgICByZXR1cm4gb3V0cC50cmltKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAqIFR1cm5zIGEgc3RyaW5nIGludG8gYSBHb29kcmVhZHMgc2VhcmNoIFVSTFxuICAgICAgICAgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBVUkwgdG8gbWFrZVxuICAgICAgICAgKiBAcGFyYW0gaW5wIFRoZSBleHRyYWN0ZWQgZGF0YSB0byBVUkkgZW5jb2RlXG4gICAgICAgICAqL1xuICAgICAgICBidWlsZFNlYXJjaFVSTDogKHR5cGU6IEJvb2tEYXRhIHwgJ29uJywgaW5wOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGdvb2RyZWFkcy5idWlsZEdyU2VhcmNoVVJMKCAke3R5cGV9LCAke2lucH0gKWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZ3JUeXBlOiBzdHJpbmcgPSB0eXBlO1xuICAgICAgICAgICAgY29uc3QgY2FzZXM6IGFueSA9IHtcbiAgICAgICAgICAgICAgICBib29rOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICd0aXRsZSc7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXJpZXM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZ3JUeXBlID0gJ29uJztcbiAgICAgICAgICAgICAgICAgICAgaW5wICs9ICcsICMnO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGNhc2VzW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgY2FzZXNbdHlwZV0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgaHR0cHM6Ly9yLm1yZC5uaW5qYS9odHRwczovL3d3dy5nb29kcmVhZHMuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgIGlucC5yZXBsYWNlKCclJywgJycpXG4gICAgICAgICAgICApLnJlcGxhY2UoXCInXCIsICclMjcnKX0mc2VhcmNoX3R5cGU9Ym9va3Mmc2VhcmNoJTVCZmllbGQlNUQ9JHtnclR5cGV9YDtcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogIyMjIyBSZXR1cm4gYSBjbGVhbmVkIGJvb2sgdGl0bGUgZnJvbSBhbiBlbGVtZW50XG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGl0bGUgdGV4dFxuICAgICAqIEBwYXJhbSBhdXRoIEEgc3RyaW5nIG9mIGF1dGhvcnNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tUaXRsZSA9IGFzeW5jIChcbiAgICAgICAgZGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcbiAgICAgICAgYXV0aDogc3RyaW5nID0gJydcbiAgICApID0+IHtcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0Qm9va1RpdGxlKCkgZmFpbGVkOyBlbGVtZW50IHdhcyBudWxsIScpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBleHRyYWN0ZWQgPSBkYXRhLmlubmVyVGV4dDtcbiAgICAgICAgLy8gU2hvcnRlbiB0aXRsZSBhbmQgY2hlY2sgaXQgZm9yIGJyYWNrZXRzICYgYXV0aG9yIG5hbWVzXG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwudHJpbVN0cmluZyhVdGlsLmJyYWNrZXRSZW1vdmVyKGV4dHJhY3RlZCksIDUwKTtcbiAgICAgICAgZXh0cmFjdGVkID0gVXRpbC5jaGVja0Rhc2hlcyhleHRyYWN0ZWQsIGF1dGgpO1xuICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFJldHVybiBHUi1mb3JtYXR0ZWQgYXV0aG9ycyBhcyBhbiBhcnJheSBsaW1pdGVkIHRvIGBudW1gXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYXV0aG9yIGxpbmtzXG4gICAgICogQHBhcmFtIG51bSBUaGUgbnVtYmVyIG9mIGF1dGhvcnMgdG8gcmV0dXJuLiBEZWZhdWx0IDNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tBdXRob3JzID0gYXN5bmMgKFxuICAgICAgICBkYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXG4gICAgICAgIG51bTogbnVtYmVyID0gM1xuICAgICkgPT4ge1xuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZXRCb29rQXV0aG9ycygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKChhdXRob3IpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdXRoTGlzdC5wdXNoKFV0aWwuZ29vZHJlYWRzLnNtYXJ0QXV0aChhdXRob3IuaW5uZXJUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIG51bS0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGF1dGhMaXN0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgUmV0dXJuIHNlcmllcyBhcyBhbiBhcnJheVxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHNlcmllcyBsaW5rc1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va1NlcmllcyA9IGFzeW5jIChkYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwpID0+IHtcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignZ2V0Qm9va1NlcmllcygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcmllc0xpc3Q6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKHNlcmllcykgPT4ge1xuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QucHVzaChzZXJpZXMuaW5uZXJUZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHNlcmllc0xpc3Q7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogIyMjIyBSZXR1cm4gYSB0YWJsZS1saWtlIGFycmF5IG9mIHJvd3MgYXMgYW4gb2JqZWN0LlxuICAgICAqIFN0b3JlIHRoZSByZXR1cm5lZCBvYmplY3QgYW5kIGFjY2VzcyB1c2luZyB0aGUgcm93IHRpdGxlLCBleC4gYHN0b3JlZFsnVGl0bGU6J11gXG4gICAgICogQHBhcmFtIHJvd0xpc3QgQW4gYXJyYXkgb2YgdGFibGUtbGlrZSByb3dzXG4gICAgICogQHBhcmFtIHRpdGxlQ2xhc3MgVGhlIGNsYXNzIHVzZWQgYnkgdGhlIHRpdGxlIGNlbGxzLiBEZWZhdWx0IGAudG9yRGV0TGVmdGBcbiAgICAgKiBAcGFyYW0gZGF0YUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSBkYXRhIGNlbGxzLiBEZWZhdWx0IGAudG9yRGV0UmlnaHRgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByb3dzVG9PYmogPSAoXG4gICAgICAgIHJvd0xpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4sXG4gICAgICAgIHRpdGxlQ2xhc3MgPSAnLnRvckRldExlZnQnLFxuICAgICAgICBkYXRhQ2xhc3MgPSAnLnRvckRldFJpZ2h0J1xuICAgICkgPT4ge1xuICAgICAgICBpZiAocm93TGlzdC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFV0aWwucm93c1RvT2JqKCAke3Jvd0xpc3R9ICk6IFJvdyBsaXN0IHdhcyBlbXB0eSFgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3dzOiBhbnlbXSA9IFtdO1xuXG4gICAgICAgIHJvd0xpc3QuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aXRsZTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IodGl0bGVDbGFzcyk7XG4gICAgICAgICAgICBjb25zdCBkYXRhOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByb3cucXVlcnlTZWxlY3RvcihkYXRhQ2xhc3MpO1xuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiB0aXRsZS50ZXh0Q29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUm93IHRpdGxlIHdhcyBlbXB0eSEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJvd3MucmVkdWNlKChvYmosIGl0ZW0pID0+ICgob2JqW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWUpLCBvYmopLCB7fSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgQ29udmVydCBieXRlcyBpbnRvIGEgaHVtYW4tcmVhZGFibGUgc3RyaW5nXG4gICAgICogQ3JlYXRlZCBieSB5eXl6eno5OTlcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZXMgdG8gYmUgZm9ybWF0dGVkXG4gICAgICogQHBhcmFtIGIgP1xuICAgICAqIEByZXR1cm5zIFN0cmluZyBpbiB0aGUgZm9ybWF0IG9mIGV4LiBgMTIzIE1CYFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZm9ybWF0Qnl0ZXMgPSAoYnl0ZXM6IG51bWJlciwgYiA9IDIpID0+IHtcbiAgICAgICAgaWYgKGJ5dGVzID09PSAwKSByZXR1cm4gJzAgQnl0ZXMnO1xuICAgICAgICBjb25zdCBjID0gMCA+IGIgPyAwIDogYjtcbiAgICAgICAgY29uc3QgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKDEwMjQpKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHBhcnNlRmxvYXQoKGJ5dGVzIC8gTWF0aC5wb3coMTAyNCwgaW5kZXgpKS50b0ZpeGVkKGMpKSArXG4gICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgWydCeXRlcycsICdLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ11baW5kZXhdXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBzdGF0aWMgZGVyZWZlciA9ICh1cmw6IHN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gYGh0dHBzOi8vci5tcmQubmluamEvJHtlbmNvZGVVUkkodXJsKX1gO1xuICAgIH07XG5cbiAgICBwdWJsaWMgc3RhdGljIGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgfTtcbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cbi8qKlxuICogIyBDbGFzcyBmb3IgaGFuZGxpbmcgdmFsaWRhdGlvbiAmIGNvbmZpcm1hdGlvblxuICovXG5jbGFzcyBDaGVjayB7XG4gICAgcHVibGljIHN0YXRpYyBuZXdWZXI6IHN0cmluZyA9IEdNX2luZm8uc2NyaXB0LnZlcnNpb247XG4gICAgcHVibGljIHN0YXRpYyBwcmV2VmVyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgnbXBfdmVyc2lvbicpO1xuXG4gICAgLyoqXG4gICAgICogKiBXYWl0IGZvciBhbiBlbGVtZW50IHRvIGV4aXN0LCB0aGVuIHJldHVybiBpdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIFRoZSBET00gc3RyaW5nIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHNlbGVjdCBhbiBlbGVtZW50XG4gICAgICogQHJldHVybiB7UHJvbWlzZTxIVE1MRWxlbWVudD59IFByb21pc2Ugb2YgYW4gZWxlbWVudCB0aGF0IHdhcyBzZWxlY3RlZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZWxlbUxvYWQoXG4gICAgICAgIHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MRWxlbWVudFxuICAgICk6IFByb21pc2U8SFRNTEVsZW1lbnQgfCBmYWxzZT4ge1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAlYyBMb29raW5nIGZvciAke3NlbGVjdG9yfWAsICdiYWNrZ3JvdW5kOiAjMjIyOyBjb2xvcjogIzU1NScpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBfY291bnRlciA9IDA7XG4gICAgICAgIGNvbnN0IF9jb3VudGVyTGltaXQgPSAyMDA7XG4gICAgICAgIGNvbnN0IGxvZ2ljID0gYXN5bmMgKFxuICAgICAgICAgICAgc2VsZWN0b3I6IHN0cmluZyB8IEhUTUxFbGVtZW50XG4gICAgICAgICk6IFByb21pc2U8SFRNTEVsZW1lbnQgfCBmYWxzZT4gPT4ge1xuICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBhY3R1YWwgZWxlbWVudFxuICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTEVsZW1lbnQgfCBudWxsID1cbiAgICAgICAgICAgICAgICB0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICAgICAgICAgICAgICAgICAgOiBzZWxlY3RvcjtcblxuICAgICAgICAgICAgaWYgKGVsZW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRocm93IGAke3NlbGVjdG9yfSBpcyB1bmRlZmluZWQhYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbGVtID09PSBudWxsICYmIF9jb3VudGVyIDwgX2NvdW50ZXJMaW1pdCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuYWZUaW1lcigpO1xuICAgICAgICAgICAgICAgIF9jb3VudGVyKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGxvZ2ljKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbSA9PT0gbnVsbCAmJiBfY291bnRlciA+PSBfY291bnRlckxpbWl0KSB7XG4gICAgICAgICAgICAgICAgX2NvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGxvZ2ljKHNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIFJ1biBhIGZ1bmN0aW9uIHdoZW5ldmVyIGFuIGVsZW1lbnQgY2hhbmdlc1xuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFRoZSBlbGVtZW50IHRvIGJlIG9ic2VydmVkLiBDYW4gYmUgYSBzdHJpbmcuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBvYnNlcnZlciB0cmlnZ2Vyc1xuICAgICAqIEByZXR1cm4gUHJvbWlzZSBvZiBhIG11dGF0aW9uIG9ic2VydmVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBlbGVtT2JzZXJ2ZXIoXG4gICAgICAgIHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MRWxlbWVudCB8IG51bGwsXG4gICAgICAgIGNhbGxiYWNrOiBNdXRhdGlvbkNhbGxiYWNrLFxuICAgICAgICBjb25maWc6IE11dGF0aW9uT2JzZXJ2ZXJJbml0ID0ge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgfVxuICAgICk6IFByb21pc2U8TXV0YXRpb25PYnNlcnZlcj4ge1xuICAgICAgICBsZXQgc2VsZWN0ZWQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZWxlY3RlZCA9IDxIVE1MRWxlbWVudCB8IG51bGw+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgJyR7c2VsZWN0b3J9J2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgYCVjIFNldHRpbmcgb2JzZXJ2ZXIgb24gJHtzZWxlY3Rvcn06ICR7c2VsZWN0ZWR9YCxcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1ZDhhYTgnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoc2VsZWN0ZWQhLCBjb25maWcpO1xuICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBDaGVjayB0byBzZWUgaWYgdGhlIHNjcmlwdCBoYXMgYmVlbiB1cGRhdGVkIGZyb20gYW4gb2xkZXIgdmVyc2lvblxuICAgICAqIEByZXR1cm4gVGhlIHZlcnNpb24gc3RyaW5nIG9yIGZhbHNlXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB1cGRhdGVkKCk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoJ0NoZWNrLnVwZGF0ZWQoKScpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFBSRVYgVkVSID0gJHt0aGlzLnByZXZWZXJ9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTkVXIFZFUiA9ICR7dGhpcy5uZXdWZXJ9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBEaWZmZXJlbnQgdmVyc2lvbnM7IHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1ZlciAhPT0gdGhpcy5wcmV2VmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaXMgbmV3IG9yIHVwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhlIG5ldyB2ZXJzaW9uXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3ZlcnNpb24nLCB0aGlzLm5ld1Zlcik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJldlZlcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgc2NyaXB0IGhhcyBydW4gYmVmb3JlXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgcnVuIGJlZm9yZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ3VwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBGaXJzdC10aW1lIHJ1blxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaGFzIG5ldmVyIHJ1bicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEVuYWJsZSB0aGUgbW9zdCBiYXNpYyBmZWF0dXJlc1xuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnZ29vZHJlYWRzQnRuJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdhbGVydHMnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgnZmlyc3RSdW4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IG5vdCB1cGRhdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogQ2hlY2sgdG8gc2VlIHdoYXQgcGFnZSBpcyBiZWluZyBhY2Nlc3NlZFxuICAgICAqIEBwYXJhbSB7VmFsaWRQYWdlfSBwYWdlUXVlcnkgLSBBbiBvcHRpb25hbCBwYWdlIHRvIHNwZWNpZmljYWxseSBjaGVjayBmb3JcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPHN0cmluZz59IEEgcHJvbWlzZSBjb250YWluaW5nIHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IHBhZ2VcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2xlYW4+fSBPcHRpb25hbGx5LCBhIGJvb2xlYW4gaWYgdGhlIGN1cnJlbnQgcGFnZSBtYXRjaGVzIHRoZSBgcGFnZVF1ZXJ5YFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcGFnZShwYWdlUXVlcnk/OiBWYWxpZFBhZ2UpOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkUGFnZSA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xuICAgICAgICBsZXQgY3VycmVudFBhZ2U6IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIC8vIENoZWNrLnBhZ2UoKSBoYXMgYmVlbiBydW4gYW5kIGEgdmFsdWUgd2FzIHN0b3JlZFxuICAgICAgICAgICAgaWYgKHN0b3JlZFBhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGp1c3QgY2hlY2tpbmcgd2hhdCBwYWdlIHdlJ3JlIG9uLCByZXR1cm4gdGhlIHN0b3JlZCBwYWdlXG4gICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdG9yZWRQYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgY2hlY2tpbmcgZm9yIGEgc3BlY2lmaWMgcGFnZSwgcmV0dXJuIFRSVUUvRkFMU0VcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VRdWVyeSA9PT0gc3RvcmVkUGFnZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDaGVjay5wYWdlKCkgaGFzIG5vdCBwcmV2aW91cyBydW5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBhZ2VcbiAgICAgICAgICAgICAgICBsZXQgcGF0aDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLmluZGV4T2YoJy5waHAnKSA/IHBhdGguc3BsaXQoJy5waHAnKVswXSA6IHBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFnZSA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICBwYWdlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBhZ2UgVVJMIEAgJHtwYWdlLmpvaW4oJyAtPiAnKX1gKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IGxpdGVyYWwgb2Ygc29ydHMgdG8gdXNlIGFzIGEgXCJzd2l0Y2hcIlxuICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCB9ID0ge1xuICAgICAgICAgICAgICAgICAgICAnJzogKCkgPT4gJ2hvbWUnLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogKCkgPT4gJ2hvbWUnLFxuICAgICAgICAgICAgICAgICAgICBzaG91dGJveDogKCkgPT4gJ3Nob3V0Ym94JyxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICgpID0+ICdzZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlOiAoKSA9PiAnc3RvcmUnLFxuICAgICAgICAgICAgICAgICAgICBmcmVlbGVlY2g6ICgpID0+ICdmcmVlbGVlY2gnLFxuICAgICAgICAgICAgICAgICAgICBtaWxsaW9uYWlyZXM6ICgpID0+ICd2YXVsdCcsXG4gICAgICAgICAgICAgICAgICAgIHQ6ICgpID0+ICd0b3JyZW50JyxcbiAgICAgICAgICAgICAgICAgICAgdTogKCkgPT4gJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICBmOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZVsxXSA9PT0gJ3QnKSByZXR1cm4gJ2ZvcnVtIHRocmVhZCc7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRvcjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2VbMV0gPT09ICdicm93c2UnKSByZXR1cm4gJ2Jyb3dzZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAncmVxdWVzdHMyJykgcmV0dXJuICdyZXF1ZXN0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhZ2VbMV0gPT09ICd2aWV3UmVxdWVzdCcpIHJldHVybiAncmVxdWVzdCBkZXRhaWxzJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhZ2VbMV0gPT09ICd1cGxvYWQnKSByZXR1cm4gJ3VwbG9hZCc7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5ld1VzZXJzOiAoKSA9PiAnbmV3IHVzZXJzJyxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYSBjYXNlIHRoYXQgbWF0Y2hlcyB0aGUgY3VycmVudCBwYWdlXG4gICAgICAgICAgICAgICAgaWYgKGNhc2VzW3BhZ2VbMF1dKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlID0gY2FzZXNbcGFnZVswXV0oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFBhZ2UgXCIke3BhZ2V9XCIgaXMgbm90IGEgdmFsaWQgTSsgcGFnZS4gUGF0aDogJHtwYXRofWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgcGFnZSB0byBiZSBhY2Nlc3NlZCBsYXRlclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnLCBjdXJyZW50UGFnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUganVzdCBjaGVja2luZyB3aGF0IHBhZ2Ugd2UncmUgb24sIHJldHVybiB0aGUgcGFnZVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhZ2VRdWVyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjdXJyZW50UGFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBjaGVja2luZyBmb3IgYSBzcGVjaWZpYyBwYWdlLCByZXR1cm4gVFJVRS9GQUxTRVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VRdWVyeSA9PT0gY3VycmVudFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBDaGVjayB0byBzZWUgaWYgYSBnaXZlbiBjYXRlZ29yeSBpcyBhbiBlYm9vay9hdWRpb2Jvb2sgY2F0ZWdvcnlcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGlzQm9va0NhdChjYXQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyBDdXJyZW50bHksIGFsbCBib29rIGNhdGVnb3JpZXMgYXJlIGFzc3VtZWQgdG8gYmUgaW4gdGhlIHJhbmdlIG9mIDM5LTEyMFxuICAgICAgICByZXR1cm4gY2F0ID49IDM5ICYmIGNhdCA8PSAxMjAgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNoZWNrLnRzXCIgLz5cblxuLyoqXG4gKiBDbGFzcyBmb3IgaGFuZGxpbmcgdmFsdWVzIGFuZCBtZXRob2RzIHJlbGF0ZWQgdG8gc3R5bGVzXG4gKiBAY29uc3RydWN0b3IgSW5pdGlhbGl6ZXMgdGhlbWUgYmFzZWQgb24gbGFzdCBzYXZlZCB2YWx1ZTsgY2FuIGJlIGNhbGxlZCBiZWZvcmUgcGFnZSBjb250ZW50IGlzIGxvYWRlZFxuICogQG1ldGhvZCB0aGVtZSBHZXRzIG9yIHNldHMgdGhlIGN1cnJlbnQgdGhlbWVcbiAqL1xuY2xhc3MgU3R5bGUge1xuICAgIHByaXZhdGUgX3RoZW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfcHJldlRoZW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfY3NzRGF0YTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIFRoZSBsaWdodCB0aGVtZSBpcyB0aGUgZGVmYXVsdCB0aGVtZSwgc28gdXNlIE0rIExpZ2h0IHZhbHVlc1xuICAgICAgICB0aGlzLl90aGVtZSA9ICdsaWdodCc7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBwcmV2aW91c2x5IHVzZWQgdGhlbWUgb2JqZWN0XG4gICAgICAgIHRoaXMuX3ByZXZUaGVtZSA9IHRoaXMuX2dldFByZXZUaGVtZSgpO1xuXG4gICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgZXhpc3RzLCBhc3N1bWUgdGhlIGN1cnJlbnQgdGhlbWUgaXMgaWRlbnRpY2FsXG4gICAgICAgIGlmICh0aGlzLl9wcmV2VGhlbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fdGhlbWUgPSB0aGlzLl9wcmV2VGhlbWU7XG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2Fybignbm8gcHJldmlvdXMgdGhlbWUnKTtcblxuICAgICAgICAvLyBGZXRjaCB0aGUgQ1NTIGRhdGFcbiAgICAgICAgdGhpcy5fY3NzRGF0YSA9IEdNX2dldFJlc291cmNlVGV4dCgnTVBfQ1NTJyk7XG4gICAgfVxuXG4gICAgLyoqIEFsbG93cyB0aGUgY3VycmVudCB0aGVtZSB0byBiZSByZXR1cm5lZCAqL1xuICAgIGdldCB0aGVtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGhlbWU7XG4gICAgfVxuXG4gICAgLyoqIEFsbG93cyB0aGUgY3VycmVudCB0aGVtZSB0byBiZSBzZXQgKi9cbiAgICBzZXQgdGhlbWUodmFsOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fdGhlbWUgPSB2YWw7XG4gICAgfVxuXG4gICAgLyoqIFNldHMgdGhlIE0rIHRoZW1lIGJhc2VkIG9uIHRoZSBzaXRlIHRoZW1lICovXG4gICAgcHVibGljIGFzeW5jIGFsaWduVG9TaXRlVGhlbWUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHRoZW1lOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9nZXRTaXRlQ1NTKCk7XG4gICAgICAgIHRoaXMuX3RoZW1lID0gdGhlbWUuaW5kZXhPZignZGFyaycpID4gMCA/ICdkYXJrJyA6ICdsaWdodCc7XG4gICAgICAgIGlmICh0aGlzLl9wcmV2VGhlbWUgIT09IHRoaXMuX3RoZW1lKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRQcmV2VGhlbWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluamVjdCB0aGUgQ1NTIGNsYXNzIHVzZWQgYnkgTSsgZm9yIHRoZW1pbmdcbiAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2JvZHknKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvZHk6IEhUTUxCb2R5RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gICAgICAgICAgICBpZiAoYm9keSkge1xuICAgICAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZChgbXBfJHt0aGlzLl90aGVtZX1gKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEJvZHkgaXMgJHtib2R5fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogSW5qZWN0cyB0aGUgc3R5bGVzaGVldCBsaW5rIGludG8gdGhlIGhlYWRlciAqL1xuICAgIHB1YmxpYyBpbmplY3RMaW5rKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBpZDogc3RyaW5nID0gJ21wX2Nzcyc7XG4gICAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7XG4gICAgICAgICAgICBjb25zdCBzdHlsZTogSFRNTFN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICBzdHlsZS5pZCA9IGlkO1xuICAgICAgICAgICAgc3R5bGUuaW5uZXJUZXh0ID0gdGhpcy5fY3NzRGF0YSAhPT0gdW5kZWZpbmVkID8gdGhpcy5fY3NzRGF0YSA6ICcnO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpIS5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGFuIGVsZW1lbnQgd2l0aCB0aGUgaWQgXCIke2lkfVwiIGFscmVhZHkgZXhpc3RzYCk7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybnMgdGhlIHByZXZpb3VzIHRoZW1lIG9iamVjdCBpZiBpdCBleGlzdHMgKi9cbiAgICBwcml2YXRlIF9nZXRQcmV2VGhlbWUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIEdNX2dldFZhbHVlKCdzdHlsZV90aGVtZScpO1xuICAgIH1cblxuICAgIC8qKiBTYXZlcyB0aGUgY3VycmVudCB0aGVtZSBmb3IgZnV0dXJlIHJlZmVyZW5jZSAqL1xuICAgIHByaXZhdGUgX3NldFByZXZUaGVtZSgpOiB2b2lkIHtcbiAgICAgICAgR01fc2V0VmFsdWUoJ3N0eWxlX3RoZW1lJywgdGhpcy5fdGhlbWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFNpdGVDU1MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aGVtZVVSTDogc3RyaW5nIHwgbnVsbCA9IGRvY3VtZW50XG4gICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2hlYWQgbGlua1tocmVmKj1cIklDR3N0YXRpb25cIl0nKSFcbiAgICAgICAgICAgICAgICAuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoZW1lVVJMID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhlbWVVUkwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGB0aGVtZVVybCBpcyBub3QgYSBzdHJpbmc6ICR7dGhlbWVVUkx9YCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jaGVjay50c1wiIC8+XG4vKipcbiAqIENPUkUgRkVBVFVSRVNcbiAqXG4gKiBZb3VyIGZlYXR1cmUgYmVsb25ncyBoZXJlIGlmIHRoZSBmZWF0dXJlOlxuICogQSkgaXMgY3JpdGljYWwgdG8gdGhlIHVzZXJzY3JpcHRcbiAqIEIpIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgYnkgb3RoZXIgZmVhdHVyZXNcbiAqIEMpIHdpbGwgaGF2ZSBzZXR0aW5ncyBkaXNwbGF5ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2VcbiAqIElmIEEgJiBCIGFyZSBtZXQgYnV0IG5vdCBDIGNvbnNpZGVyIHVzaW5nIGBVdGlscy50c2AgaW5zdGVhZFxuICovXG5cbi8qKlxuICogVGhpcyBmZWF0dXJlIGNyZWF0ZXMgYSBwb3AtdXAgbm90aWZpY2F0aW9uXG4gKi9cbmNsYXNzIEFsZXJ0cyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnYWxlcnRzJyxcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNKyBBbGVydCBwYW5lbCBmb3IgdXBkYXRlIGluZm9ybWF0aW9uLCBldGMuJyxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIE1QLnNldHRpbmdzR2xvYi5wdXNoKHRoaXMuX3NldHRpbmdzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbm90aWZ5KGtpbmQ6IHN0cmluZyB8IGJvb2xlYW4sIGxvZzogQXJyYXlPYmplY3QpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFsZXJ0cy5ub3RpZnkoICR7a2luZH0gKWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBWZXJpZnkgYSBub3RpZmljYXRpb24gcmVxdWVzdCB3YXMgbWFkZVxuICAgICAgICAgICAgaWYgKGtpbmQpIHtcbiAgICAgICAgICAgICAgICAvLyBWZXJpZnkgbm90aWZpY2F0aW9ucyBhcmUgYWxsb3dlZFxuICAgICAgICAgICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnYWxlcnRzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdG8gYnVpbGQgbXNnIHRleHRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRNc2cgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnI6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkTXNnKCAke3RpdGxlfSApYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGFycmF5IGlzbid0IGVtcHR5XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyLmxlbmd0aCA+IDAgJiYgYXJyWzBdICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNlY3Rpb24gaGVhZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtc2c6IHN0cmluZyA9IGA8aDQ+JHt0aXRsZX06PC9oND48dWw+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMb29wIG92ZXIgZWFjaCBpdGVtIGluIHRoZSBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9IGA8bGk+JHtpdGVtfTwvbGk+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBtc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9ICc8L3VsPic7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG5vdGlmaWNhdGlvbiBwYW5lbFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsZFBhbmVsID0gKG1zZzogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgYnVpbGRQYW5lbCggJHttc2d9IClgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCdib2R5JykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgKz0gYDxkaXYgY2xhc3M9J21wX25vdGlmaWNhdGlvbic+JHttc2d9PHNwYW4+WDwvc3Bhbj48L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZ0JveDogRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfbm90aWZpY2F0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlQnRuOiBIVE1MU3BhbkVsZW1lbnQgPSBtc2dCb3gucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3NlQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgY2xvc2UgYnV0dG9uIGlzIGNsaWNrZWQsIHJlbW92ZSBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1zZ0JveCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnQm94LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTogc3RyaW5nID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGtpbmQgPT09ICd1cGRhdGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0J1aWxkaW5nIHVwZGF0ZSBtZXNzYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGA8c3Ryb25nPk1BTSsgaGFzIGJlZW4gdXBkYXRlZCE8L3N0cm9uZz4gWW91IGFyZSBub3cgdXNpbmcgdiR7TVAuVkVSU0lPTn0sIGNyZWF0ZWQgb24gJHtNUC5USU1FU1RBTVB9LiBEaXNjdXNzIGl0IG9uIDxhIGhyZWY9J2ZvcnVtcy5waHA/YWN0aW9uPXZpZXd0b3BpYyZ0b3BpY2lkPTQxODYzJz50aGUgZm9ydW1zPC9hPi48aHI+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgY2hhbmdlbG9nXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5VUERBVEVfTElTVCwgJ0NoYW5nZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gYnVpbGRNc2cobG9nLkJVR19MSVNULCAnS25vd24gQnVncycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICdmaXJzdFJ1bicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8aDQ+V2VsY29tZSB0byBNQU0rITwvaDQ+UGxlYXNlIGhlYWQgb3ZlciB0byB5b3VyIDxhIGhyZWY9XCIvcHJlZmVyZW5jZXMvaW5kZXgucGhwXCI+cHJlZmVyZW5jZXM8L2E+IHRvIGVuYWJsZSB0aGUgTUFNKyBzZXR0aW5ncy48YnI+QW55IGJ1ZyByZXBvcnRzLCBmZWF0dXJlIHJlcXVlc3RzLCBldGMuIGNhbiBiZSBtYWRlIG9uIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvaXNzdWVzXCI+R2l0aHViPC9hPiwgPGEgaHJlZj1cIi9mb3J1bXMucGhwP2FjdGlvbj12aWV3dG9waWMmdG9waWNpZD00MTg2M1wiPnRoZSBmb3J1bXM8L2E+LCBvciA8YSBocmVmPVwiL3NlbmRtZXNzYWdlLnBocD9yZWNlaXZlcj0xMDgzMDNcIj50aHJvdWdoIHByaXZhdGUgbWVzc2FnZTwvYT4uJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyBmaXJzdCBydW4gbWVzc2FnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFJlY2VpdmVkIG1zZyBraW5kOiAke2tpbmR9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnVpbGRQYW5lbChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdGlmaWNhdGlvbnMgYXJlIGRpc2FibGVkLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIERlYnVnIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5PdGhlcixcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdkZWJ1ZycsXG4gICAgICAgIGRlc2M6XG4gICAgICAgICAgICAnRXJyb3IgbG9nICg8ZW0+Q2xpY2sgdGhpcyBjaGVja2JveCB0byBlbmFibGUgdmVyYm9zZSBsb2dnaW5nIHRvIHRoZSBjb25zb2xlPC9lbT4pJyxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIE1QLnNldHRpbmdzR2xvYi5wdXNoKHRoaXMuX3NldHRpbmdzKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogIyBHTE9CQUwgRkVBVFVSRVNcbiAqL1xuXG4vKipcbiAqICMjIEhpZGUgdGhlIGhvbWUgYnV0dG9uIG9yIHRoZSBiYW5uZXJcbiAqL1xuY2xhc3MgSGlkZUhvbWUgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogRHJvcGRvd25TZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcbiAgICAgICAgdHlwZTogJ2Ryb3Bkb3duJyxcbiAgICAgICAgdGl0bGU6ICdoaWRlSG9tZScsXG4gICAgICAgIHRhZzogJ1JlbW92ZSBiYW5uZXIvaG9tZScsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdEbyBub3QgcmVtb3ZlIGVpdGhlcicsXG4gICAgICAgICAgICBoaWRlQmFubmVyOiAnSGlkZSB0aGUgYmFubmVyJyxcbiAgICAgICAgICAgIGhpZGVIb21lOiAnSGlkZSB0aGUgaG9tZSBidXR0b24nLFxuICAgICAgICB9LFxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBoZWFkZXIgaW1hZ2Ugb3IgSG9tZSBidXR0b24sIGJlY2F1c2UgYm90aCBsaW5rIHRvIHRoZSBob21lcGFnZScsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWFpbm1lbnUnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zdCBoaWRlcjogc3RyaW5nID0gR01fZ2V0VmFsdWUodGhpcy5fc2V0dGluZ3MudGl0bGUpO1xuICAgICAgICBpZiAoaGlkZXIgPT09ICdoaWRlSG9tZScpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9ob21lJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIGhvbWUgYnV0dG9uIScpO1xuICAgICAgICB9IGVsc2UgaWYgKGhpZGVyID09PSAnaGlkZUJhbm5lcicpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9iYW5uZXInKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgYmFubmVyIScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IERyb3Bkb3duU2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMgVXNlIGN1c3RvbSBib29rbWFyayBpY29uc1xuICovXG5jbGFzcyBCb29rbWFya0ljb25zIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnYm9va21hcmtJY29ucycsXG4gICAgICAgIGRlc2M6IGBVc2UgTUFNKydzIGN1c3RvbSBib29rbWFyayBpY29ucyBpbnN0ZWFkIG9mIHRoZSBzaXRlJ3MgZGVmYXVsdCBpY29uc2AsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICdib2R5JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoR01fZ2V0VmFsdWUodGhpcy5fc2V0dGluZ3MudGl0bGUpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKHRoaXMuX3NldHRpbmdzLnRpdGxlLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2Jvb2ttYXJrT3ZlcnJpZGUnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxlZCBjdXN0b20gYm9va21hcmsgaWNvbnMhJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMgQnlwYXNzIHRoZSB2YXVsdCBpbmZvIHBhZ2VcbiAqL1xuY2xhc3MgVmF1bHRMaW5rIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndmF1bHRMaW5rJyxcbiAgICAgICAgZGVzYzogJ01ha2UgdGhlIFZhdWx0IGxpbmsgYnlwYXNzIHRoZSBWYXVsdCBJbmZvIHBhZ2UnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21pbGxpb25JbmZvJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKHRoaXMuX3RhcikhXG4gICAgICAgICAgICAuc2V0QXR0cmlidXRlKCdocmVmJywgJy9taWxsaW9uYWlyZXMvZG9uYXRlLnBocCcpO1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBNYWRlIHRoZSB2YXVsdCB0ZXh0IGxpbmsgdG8gdGhlIGRvbmF0ZSBwYWdlIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIFNob3J0ZW4gdGhlIHZhdWx0ICYgcmF0aW8gdGV4dFxuICovXG5jbGFzcyBNaW5pVmF1bHRJbmZvIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnbWluaVZhdWx0SW5mbycsXG4gICAgICAgIGRlc2M6ICdTaG9ydGVuIHRoZSBWYXVsdCBsaW5rICYgcmF0aW8gdGV4dCcsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWlsbGlvbkluZm8nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zdCB2YXVsdFRleHQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgY29uc3QgcmF0aW9UZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJykhO1xuXG4gICAgICAgIC8vIFNob3J0ZW4gdGhlIHJhdGlvIHRleHRcbiAgICAgICAgLy8gVE9ETzogbW92ZSB0aGlzIHRvIGl0cyBvd24gc2V0dGluZz9cbiAgICAgICAgLyogVGhpcyBjaGFpbmVkIG1vbnN0cm9zaXR5IGRvZXMgdGhlIGZvbGxvd2luZzpcbiAgICAgICAgLSBFeHRyYWN0IHRoZSBudW1iZXIgKHdpdGggZmxvYXQpIGZyb20gdGhlIGVsZW1lbnRcbiAgICAgICAgLSBGaXggdGhlIGZsb2F0IHRvIDIgZGVjaW1hbCBwbGFjZXMgKHdoaWNoIGNvbnZlcnRzIGl0IGJhY2sgaW50byBhIHN0cmluZylcbiAgICAgICAgLSBDb252ZXJ0IHRoZSBzdHJpbmcgYmFjayBpbnRvIGEgbnVtYmVyIHNvIHRoYXQgd2UgY2FuIGNvbnZlcnQgaXQgd2l0aGB0b0xvY2FsZVN0cmluZ2AgdG8gZ2V0IGNvbW1hcyBiYWNrICovXG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihVdGlsLmV4dHJhY3RGbG9hdChyYXRpb1RleHQpWzBdLnRvRml4ZWQoMikpLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgIHJhdGlvVGV4dC5pbm5lckhUTUwgPSBgJHtudW19IDxpbWcgc3JjPVwiL3BpYy91cGRvd25CaWcucG5nXCIgYWx0PVwicmF0aW9cIj5gO1xuXG4gICAgICAgIC8vIFR1cm4gdGhlIG51bWVyaWMgcG9ydGlvbiBvZiB0aGUgdmF1bHQgbGluayBpbnRvIGEgbnVtYmVyXG4gICAgICAgIGxldCBuZXdUZXh0OiBudW1iZXIgPSBwYXJzZUludChcbiAgICAgICAgICAgIHZhdWx0VGV4dC50ZXh0Q29udGVudCEuc3BsaXQoJzonKVsxXS5zcGxpdCgnICcpWzFdLnJlcGxhY2UoLywvZywgJycpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gQ29udmVydCB0aGUgdmF1bHQgYW1vdW50IHRvIG1pbGxpb250aHNcbiAgICAgICAgbmV3VGV4dCA9IE51bWJlcigobmV3VGV4dCAvIDFlNikudG9GaXhlZCgzKSk7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdmF1bHQgdGV4dFxuICAgICAgICB2YXVsdFRleHQudGV4dENvbnRlbnQgPSBgVmF1bHQ6ICR7bmV3VGV4dH0gbWlsbGlvbmA7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNob3J0ZW5lZCB0aGUgdmF1bHQgJiByYXRpbyBudW1iZXJzIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIERpc3BsYXkgYm9udXMgcG9pbnQgZGVsdGFcbiAqL1xuY2xhc3MgQm9udXNQb2ludERlbHRhIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnYm9udXNQb2ludERlbHRhJyxcbiAgICAgICAgZGVzYzogYERpc3BsYXkgaG93IG1hbnkgYm9udXMgcG9pbnRzIHlvdSd2ZSBnYWluZWQgc2luY2UgbGFzdCBwYWdlbG9hZGAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG1CUCc7XG4gICAgcHJpdmF0ZSBfcHJldkJQOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2N1cnJlbnRCUDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9kZWx0YTogbnVtYmVyID0gMDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRCUEVsOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG5cbiAgICAgICAgLy8gR2V0IG9sZCBCUCB2YWx1ZVxuICAgICAgICB0aGlzLl9wcmV2QlAgPSB0aGlzLl9nZXRCUCgpO1xuXG4gICAgICAgIGlmIChjdXJyZW50QlBFbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gRXh0cmFjdCBvbmx5IHRoZSBudW1iZXIgZnJvbSB0aGUgQlAgZWxlbWVudFxuICAgICAgICAgICAgY29uc3QgY3VycmVudDogUmVnRXhwTWF0Y2hBcnJheSA9IGN1cnJlbnRCUEVsLnRleHRDb250ZW50IS5tYXRjaChcbiAgICAgICAgICAgICAgICAvXFxkKy9nXG4gICAgICAgICAgICApIGFzIFJlZ0V4cE1hdGNoQXJyYXk7XG5cbiAgICAgICAgICAgIC8vIFNldCBuZXcgQlAgdmFsdWVcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRCUCA9IHBhcnNlSW50KGN1cnJlbnRbMF0pO1xuICAgICAgICAgICAgdGhpcy5fc2V0QlAodGhpcy5fY3VycmVudEJQKTtcblxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGRlbHRhXG4gICAgICAgICAgICB0aGlzLl9kZWx0YSA9IHRoaXMuX2N1cnJlbnRCUCAtIHRoaXMuX3ByZXZCUDtcblxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgdGV4dCBpZiBub3QgMFxuICAgICAgICAgICAgaWYgKHRoaXMuX2RlbHRhICE9PSAwICYmICFpc05hTih0aGlzLl9kZWx0YSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwbGF5QlAodGhpcy5fZGVsdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZGlzcGxheUJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgYm9udXNCb3g6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgbGV0IGRlbHRhQm94OiBzdHJpbmcgPSAnJztcblxuICAgICAgICBkZWx0YUJveCA9IGJwID4gMCA/IGArJHticH1gIDogYCR7YnB9YDtcblxuICAgICAgICBpZiAoYm9udXNCb3ggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGJvbnVzQm94LmlubmVySFRNTCArPSBgPHNwYW4gY2xhc3M9J21wX2JwRGVsdGEnPiAoJHtkZWx0YUJveH0pPC9zcGFuPmA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBfc2V0QlAgPSAoYnA6IG51bWJlcik6IHZvaWQgPT4ge1xuICAgICAgICBHTV9zZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1WYWxgLCBgJHticH1gKTtcbiAgICB9O1xuICAgIHByaXZhdGUgX2dldEJQID0gKCk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCk7XG4gICAgICAgIGlmIChzdG9yZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RvcmVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyBCbHVyIHRoZSBoZWFkZXIgYmFja2dyb3VuZFxuICovXG5jbGFzcyBCbHVycmVkSGVhZGVyIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnYmx1cnJlZEhlYWRlcicsXG4gICAgICAgIGRlc2M6IGBBZGQgYSBibHVycmVkIGJhY2tncm91bmQgdG8gdGhlIGhlYWRlciBhcmVhYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzaXRlTWFpbiA+IGhlYWRlcic7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zdCBoZWFkZXI6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCR7dGhpcy5fdGFyfWApO1xuICAgICAgICBjb25zdCBoZWFkZXJJbWc6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoYGltZ2ApO1xuXG4gICAgICAgIGlmIChoZWFkZXJJbWcpIHtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlclNyYzogc3RyaW5nIHwgbnVsbCA9IGhlYWRlckltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBjb250YWluZXIgZm9yIHRoZSBiYWNrZ3JvdW5kXG4gICAgICAgICAgICBjb25zdCBibHVycmVkQmFjazogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ21wX2JsdXJyZWRCYWNrJyk7XG4gICAgICAgICAgICBoZWFkZXIuYXBwZW5kKGJsdXJyZWRCYWNrKTtcbiAgICAgICAgICAgIGJsdXJyZWRCYWNrLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGhlYWRlclNyYyA/IGB1cmwoJHtoZWFkZXJTcmN9KWAgOiAnJztcbiAgICAgICAgICAgIGJsdXJyZWRCYWNrLmNsYXNzTGlzdC5hZGQoJ21wX2NvbnRhaW5lcicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgYSBibHVycmVkIGJhY2tncm91bmQgdG8gdGhlIGhlYWRlciEnKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHR5cGUgc2VsZWN0ZWQgZm9yIGB0aGlzLl9zZXR0aW5nc2BcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyBIaWRlIHRoZSBzZWVkYm94IGxpbmtcbiAqL1xuY2xhc3MgSGlkZVNlZWRib3ggaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2hpZGVTZWVkYm94JyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIGRlc2M6ICdSZW1vdmUgdGhlIFwiR2V0IEEgU2VlZGJveFwiIG1lbnUgaXRlbScsXG4gICAgfTtcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21lbnUgLnNiRG9uQ3J5cHRvJztcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zdCBzZWVkYm94QnRuOiBIVE1MTElFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgaWYgKHNlZWRib3hCdG4pIHtcbiAgICAgICAgICAgIHNlZWRib3hCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgU2VlZGJveCBidXR0b24hJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMgSGlkZSB0aGUgZG9uYXRpb24gbGlua1xuICovXG5jbGFzcyBIaWRlRG9uYXRpb25Cb3ggaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2hpZGVEb25hdGlvbkJveCcsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBEb25hdGlvbnMgbWVudSBpdGVtJyxcbiAgICB9O1xuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWVudSAubW1Eb25Cb3gnO1xuICAgIC8vIFRoZSBjb2RlIHRoYXQgcnVucyB3aGVuIHRoZSBmZWF0dXJlIGlzIGNyZWF0ZWQgb24gYGZlYXR1cmVzLnRzYC5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFtdKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGRvbmF0aW9uQm94QnRuOiBIVE1MTElFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgaWYgKGRvbmF0aW9uQm94QnRuKSB7XG4gICAgICAgICAgICBkb25hdGlvbkJveEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBEb25hdGlvbiBCb3ggYnV0dG9uIScpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMgRml4ZWQgbmF2aWdhdGlvbiAmIHNlYXJjaFxuICovXG5cbmNsYXNzIEZpeGVkTmF2IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdmaXhlZE5hdicsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICBkZXNjOiAnRml4IHRoZSBuYXZpZ2F0aW9uL3NlYXJjaCB0byB0aGUgdG9wIG9mIHRoZSBwYWdlLicsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICdib2R5JztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpIS5jbGFzc0xpc3QuYWRkKCdtcF9maXhlZF9uYXYnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gUGlubmVkIHRoZSBuYXYvc2VhcmNoIHRvIHRoZSB0b3AhJyk7XG4gICAgfVxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NoZWNrLnRzXCIgLz5cblxuLyoqXG4gKiBTSEFSRUQgQ09ERVxuICpcbiAqIFRoaXMgaXMgZm9yIGFueXRoaW5nIHRoYXQncyBzaGFyZWQgYmV0d2VlbiBmaWxlcywgYnV0IGlzIG5vdCBnZW5lcmljIGVub3VnaCB0b1xuICogdG8gYmVsb25nIGluIGBVdGlscy50c2AuIEkgY2FuJ3QgdGhpbmsgb2YgYSBiZXR0ZXIgd2F5IHRvIGNhdGVnb3JpemUgRFJZIGNvZGUuXG4gKi9cblxuY2xhc3MgU2hhcmVkIHtcbiAgICAvKipcbiAgICAgKiBSZWNlaXZlIGEgdGFyZ2V0IGFuZCBgdGhpcy5fc2V0dGluZ3MudGl0bGVgXG4gICAgICogQHBhcmFtIHRhciBDU1Mgc2VsZWN0b3IgZm9yIGEgdGV4dCBpbnB1dCBib3hcbiAgICAgKi9cbiAgICAvLyBUT0RPOiB3aXRoIGFsbCBDaGVja2luZyBiZWluZyBkb25lIGluIGBVdGlsLnN0YXJ0RmVhdHVyZSgpYCBpdCdzIG5vIGxvbmdlciBuZWNlc3NhcnkgdG8gQ2hlY2sgaW4gdGhpcyBmdW5jdGlvblxuICAgIHB1YmxpYyBmaWxsR2lmdEJveCA9IChcbiAgICAgICAgdGFyOiBzdHJpbmcsXG4gICAgICAgIHNldHRpbmdUaXRsZTogc3RyaW5nXG4gICAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+ID0+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmZpbGxHaWZ0Qm94KCAke3Rhcn0sICR7c2V0dGluZ1RpdGxlfSApYCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCh0YXIpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50Qm94OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChwb2ludEJveCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyU2V0UG9pbnRzOiBudW1iZXIgPSBwYXJzZUludChcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3NldHRpbmdUaXRsZX1fdmFsYClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1heFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQocG9pbnRCb3guZ2V0QXR0cmlidXRlKCdtYXgnKSEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKHVzZXJTZXRQb2ludHMpICYmIHVzZXJTZXRQb2ludHMgPD0gbWF4UG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhQb2ludHMgPSB1c2VyU2V0UG9pbnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBvaW50Qm94LnZhbHVlID0gbWF4UG9pbnRzLnRvRml4ZWQoMCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWF4UG9pbnRzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGxpc3Qgb2YgYWxsIHJlc3VsdHMgZnJvbSBCcm93c2UgcGFnZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZWFyY2hMaXN0ID0gKCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj4gPT4ge1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZ2V0U2VhcmNoTGlzdCggKWApO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHNlYXJjaCByZXN1bHRzIHRvIGV4aXN0XG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3NzciB0cltpZCBePSBcInRkclwiXSB0ZCcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCBhbGwgc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgICAgICAgICBjb25zdCBzbmF0Y2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+ID0gPFxuICAgICAgICAgICAgICAgICAgICBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+XG4gICAgICAgICAgICAgICAgPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0nKTtcbiAgICAgICAgICAgICAgICBpZiAoc25hdGNoTGlzdCA9PT0gbnVsbCB8fCBzbmF0Y2hMaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBzbmF0Y2hMaXN0IGlzICR7c25hdGNoTGlzdH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNuYXRjaExpc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogTWFrZSBnb29kcmVhZHNCdXR0b25zKCkgaW50byBhIGdlbmVyaWMgZnJhbWV3b3JrIGZvciBvdGhlciBzaXRlJ3MgYnV0dG9uc1xuICAgIHB1YmxpYyBnb29kcmVhZHNCdXR0b25zID0gYXN5bmMgKFxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gICAgKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zLi4uJyk7XG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XG5cbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBHb29kcmVhZHMnLCAnbXBfZ3JSb3cnKTtcblxuICAgICAgICAvLyBFeHRyYWN0IHRoZSBTZXJpZXMgYW5kIEF1dGhvclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAoc2VyaWVzUCA9IFV0aWwuZ2V0Qm9va1NlcmllcyhzZXJpZXNEYXRhKSksXG4gICAgICAgICAgICAoYXV0aG9yUCA9IFV0aWwuZ2V0Qm9va0F1dGhvcnMoYXV0aG9yRGF0YSkpLFxuICAgICAgICBdKTtcblxuICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLm1wX2dyUm93IC5mbGV4Jyk7XG5cbiAgICAgICAgY29uc3QgYnV0dG9uVGFyOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdyAuZmxleCcpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChidXR0b25UYXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnV0dG9uIHJvdyBjYW5ub3QgYmUgdGFyZ2V0ZWQhJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBTZXJpZXMgYnV0dG9uc1xuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xuICAgICAgICAgICAgaWYgKHNlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc2VyLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdzZXJpZXMnLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCBidXR0b25UaXRsZSwgNCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc2VyaWVzIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cbiAgICAgICAgYXV0aG9yUFxuICAgICAgICAgICAgLnRoZW4oKGF1dGgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcnMgPSBhdXRoLmpvaW4oJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2F1dGhvcicsIGF1dGhvcnMpO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnYm9vaycsIHRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0aXRsZX0gJHthdXRob3JzfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCBib3RoVVJMLCAnVGl0bGUgKyBBdXRob3InLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBnZW5lcmF0ZSBUaXRsZStBdXRob3IgbGluayFcXG5UaXRsZTogJHt0aXRsZX1cXG5BdXRob3JzOiAke2F1dGhvcnN9YFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gdGl0bGUgZGF0YSBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRlZCB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zIWApO1xuICAgIH07XG5cbiAgICBwdWJsaWMgYXVkaWJsZUJ1dHRvbnMgPSBhc3luYyAoXG4gICAgICAgIGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcbiAgICAgICAgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgICApID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tQXVkaWJsZSBidXR0b25zLi4uJyk7XG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XG5cbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBBdWRpYmxlJywgJ21wX2F1Um93Jyk7XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9hdVJvdyAuZmxleCcpO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfYXVSb3cgLmZsZXgnKVxuICAgICAgICApO1xuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP2tleXdvcmRzPSR7aXRlbX1gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsIGJ1dHRvblRpdGxlLCA0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZXJpZXMgZGF0YSBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQnVpbGQgQXV0aG9yIGJ1dHRvblxuICAgICAgICBhdXRob3JQXG4gICAgICAgICAgICAudGhlbigoYXV0aCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhdXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP2F1dGhvcl9hdXRob3I9JHthdXRob3JzfWA7XG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ0F1dGhvcicsIDMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gYXV0aG9yIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIEJ1aWxkIFRpdGxlIGJ1dHRvbnNcbiAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGF3YWl0IFV0aWwuZ2V0Qm9va1RpdGxlKGJvb2tEYXRhLCBhdXRob3JzKTtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5hdWRpYmxlLmNvbS9zZWFyY2g/dGl0bGU9JHt0aXRsZX1gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdUaXRsZScsIDIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHRpdGxlIGFuZCBhdXRob3IgYm90aCBleGlzdCwgbWFrZSBhIFRpdGxlICsgQXV0aG9yIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0aG9ycyAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvdGhVUkwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP3RpdGxlPSR7dGl0bGV9JmF1dGhvcl9hdXRob3I9JHthdXRob3JzfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCBib3RoVVJMLCAnVGl0bGUgKyBBdXRob3InLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBnZW5lcmF0ZSBUaXRsZStBdXRob3IgbGluayFcXG5UaXRsZTogJHt0aXRsZX1cXG5BdXRob3JzOiAke2F1dGhvcnN9YFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gdGl0bGUgZGF0YSBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRlZCB0aGUgTUFNLXRvLUF1ZGlibGUgYnV0dG9ucyFgKTtcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogU3dpdGNoIHRvIFN0b3J5R3JhcGggQVBJIG9uY2UgaXQgYmVjb21lcyBhdmFpbGFibGU/IE9yIGFkdmFuY2VkIHNlYXJjaFxuICAgIHB1YmxpYyBzdG9yeUdyYXBoQnV0dG9ucyA9IGFzeW5jIChcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXG4gICAgICAgIGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgICkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1TdG9yeUdyYXBoIGJ1dHRvbnMuLi4nKTtcbiAgICAgICAgbGV0IHNlcmllc1A6IFByb21pc2U8c3RyaW5nW10+LCBhdXRob3JQOiBQcm9taXNlPHN0cmluZ1tdPjtcbiAgICAgICAgbGV0IGF1dGhvcnMgPSAnJztcblxuICAgICAgICBVdGlsLmFkZFRvckRldGFpbHNSb3codGFyZ2V0LCAnU2VhcmNoIFRoZVN0b3J5R3JhcGgnLCAnbXBfc2dSb3cnKTtcblxuICAgICAgICAvLyBFeHRyYWN0IHRoZSBTZXJpZXMgYW5kIEF1dGhvclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAoc2VyaWVzUCA9IFV0aWwuZ2V0Qm9va1NlcmllcyhzZXJpZXNEYXRhKSksXG4gICAgICAgICAgICAoYXV0aG9yUCA9IFV0aWwuZ2V0Qm9va0F1dGhvcnMoYXV0aG9yRGF0YSkpLFxuICAgICAgICBdKTtcblxuICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLm1wX3NnUm93IC5mbGV4Jyk7XG5cbiAgICAgICAgY29uc3QgYnV0dG9uVGFyOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9zZ1JvdyAuZmxleCcpXG4gICAgICAgICk7XG4gICAgICAgIGlmIChidXR0b25UYXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnV0dG9uIHJvdyBjYW5ub3QgYmUgdGFyZ2V0ZWQhJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBTZXJpZXMgYnV0dG9uc1xuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xuICAgICAgICAgICAgaWYgKHNlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc2VyLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC50aGVzdG9yeWdyYXBoLmNvbS9icm93c2U/c2VhcmNoX3Rlcm09JHtpdGVtfWA7XG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgYnV0dG9uVGl0bGUsIDQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCdWlsZCBBdXRob3IgYnV0dG9uXG4gICAgICAgIGF1dGhvclBcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGF1dGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdXRob3JzID0gYXV0aC5qb2luKCcgJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC50aGVzdG9yeWdyYXBoLmNvbS9icm93c2U/c2VhcmNoX3Rlcm09JHthdXRob3JzfWA7XG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ0F1dGhvcicsIDMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gYXV0aG9yIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIEJ1aWxkIFRpdGxlIGJ1dHRvbnNcbiAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGF3YWl0IFV0aWwuZ2V0Qm9va1RpdGxlKGJvb2tEYXRhLCBhdXRob3JzKTtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC50aGVzdG9yeWdyYXBoLmNvbS9icm93c2U/c2VhcmNoX3Rlcm09JHt0aXRsZX1gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdUaXRsZScsIDIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHRpdGxlIGFuZCBhdXRob3IgYm90aCBleGlzdCwgbWFrZSBhIFRpdGxlICsgQXV0aG9yIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0aG9ycyAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvdGhVUkwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7dGl0bGV9ICR7YXV0aG9yc31gO1xuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1TdG9yeUdyYXBoIGJ1dHRvbnMhYCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBnZXRSYXRpb1Byb3RlY3RMZXZlbHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGxldCBsMSA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwxX3ZhbCcpKTtcbiAgICAgICAgbGV0IGwyID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDJfdmFsJykpO1xuICAgICAgICBsZXQgbDMgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMM192YWwnKSk7XG4gICAgICAgIGNvbnN0IGwxX2RlZiA9IDAuNTtcbiAgICAgICAgY29uc3QgbDJfZGVmID0gMTtcbiAgICAgICAgY29uc3QgbDNfZGVmID0gMjtcblxuICAgICAgICAvLyBEZWZhdWx0IHZhbHVlcyBpZiBlbXB0eVxuICAgICAgICBpZiAoaXNOYU4obDMpKSBsMyA9IGwzX2RlZjtcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSBsMl9kZWY7XG4gICAgICAgIGlmIChpc05hTihsMSkpIGwxID0gbDFfZGVmO1xuXG4gICAgICAgIC8vIElmIHNvbWVvbmUgcHV0IHRoaW5ncyBpbiBhIGR1bWIgb3JkZXIsIGlnbm9yZSBzbWFsbGVyIG51bWJlcnNcbiAgICAgICAgaWYgKGwyID4gbDMpIGwyID0gbDM7XG4gICAgICAgIGlmIChsMSA+IGwyKSBsMSA9IGwyO1xuXG4gICAgICAgIC8vIElmIGN1c3RvbSBudW1iZXJzIGFyZSBzbWFsbGVyIHRoYW4gZGVmYXVsdCB2YWx1ZXMsIGlnbm9yZSB0aGUgbG93ZXIgd2FybmluZ1xuICAgICAgICBpZiAoaXNOYU4obDIpKSBsMiA9IGwzIDwgbDJfZGVmID8gbDMgOiBsMl9kZWY7XG4gICAgICAgIGlmIChpc05hTihsMSkpIGwxID0gbDIgPCBsMV9kZWYgPyBsMiA6IGwxX2RlZjtcblxuICAgICAgICByZXR1cm4gW2wxLCBsMiwgbDNdO1xuICAgIH07XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cbi8qKlxuICogI0JST1dTRSBQQUdFIEZFQVRVUkVTXG4gKi9cblxuLyoqXG4gKiBBbGxvd3MgU25hdGNoZWQgdG9ycmVudHMgdG8gYmUgaGlkZGVuL3Nob3duXG4gKi9cbmNsYXNzIFRvZ2dsZVNuYXRjaGVkIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU25hdGNoZWQnLFxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGhpZGUvc2hvdyByZXN1bHRzIHRoYXQgeW91J3ZlIHNuYXRjaGVkYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xuICAgIHByaXZhdGUgX2lzVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBfc2VhcmNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIF9zbmF0Y2hlZEhvb2s6IHN0cmluZyA9ICd0ZCBkaXZbY2xhc3NePVwiYnJvd3NlXCJdJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsZXQgdG9nZ2xlOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XG4gICAgICAgIGxldCByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+O1xuICAgICAgICBjb25zdCBzdG9yZWRTdGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXG4gICAgICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoc3RvcmVkU3RhdGUgPT09ICdmYWxzZScgJiYgR01fZ2V0VmFsdWUoJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlVGV4dDogc3RyaW5nID0gdGhpcy5faXNWaXNpYmxlID8gJ0hpZGUgU25hdGNoZWQnIDogJ1Nob3cgU25hdGNoZWQnO1xuXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHRvZ2dsZSA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdzbmF0Y2hlZFRvZ2dsZScsXG4gICAgICAgICAgICAgICAgdG9nZ2xlVGV4dCxcbiAgICAgICAgICAgICAgICAnaDEnLFxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBiYXNlZCBvbiB2aXMgc3RhdGVcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBTbmF0Y2hlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0hpZGUgU25hdGNoZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJlc3VsdExpc3RcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBUb2dnbGUgU25hdGNoZWQgYnV0dG9uIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxuICAgICAqIEBwYXJhbSBzdWJUYXIgdGhlIGVsZW1lbnRzIHRoYXQgbXVzdCBiZSBjb250YWluZWQgaW4gb3VyIGZpbHRlcmVkIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxpc3QuZm9yRWFjaCgoc25hdGNoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxIZWFkaW5nRWxlbWVudCA9IDxIVE1MSGVhZGluZ0VsZW1lbnQ+KFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zbmF0Y2hlZFRvZ2dsZScpIVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IG9ubHkgdGhlIGl0ZW1zIHRoYXQgbWF0Y2ggb3VyIHN1YiBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzbmF0Y2gucXVlcnlTZWxlY3RvcihzdWJUYXIpO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gSGlkZS9zaG93IGFzIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdTaG93IFNuYXRjaGVkJztcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdIaWRlIFNuYXRjaGVkJztcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLnN0eWxlLmRpc3BsYXkgPSAndGFibGUtcm93JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldFZpc1N0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTbmF0Y2ggdmlzIHN0YXRlOicsIHRoaXMuX2lzVmlzaWJsZSwgJ1xcbnZhbDonLCB2YWwpO1xuICAgICAgICB9XG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xuICAgICAgICB0aGlzLl9pc1Zpc2libGUgPSB2YWw7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBnZXQgc2VhcmNoTGlzdCgpOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hsaXN0IGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xuICAgIH1cblxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh2YWwpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZW1lbWJlcnMgdGhlIHN0YXRlIG9mIFRvZ2dsZVNuYXRjaGVkIGJldHdlZW4gcGFnZSBsb2Fkc1xuICovXG5jbGFzcyBTdGlja3lTbmF0Y2hlZFRvZ2dsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJyxcbiAgICAgICAgZGVzYzogYE1ha2UgdG9nZ2xlIHN0YXRlIHBlcnNpc3QgYmV0d2VlbiBwYWdlIGxvYWRzYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBSZW1lbWJlcmVkIHNuYXRjaCB2aXNpYmlsaXR5IHN0YXRlIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2Ygc2VhcmNoIHJlc3VsdHNcbiAqL1xuY2xhc3MgUGxhaW50ZXh0U2VhcmNoIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0U2VhcmNoJyxcbiAgICAgICAgZGVzYzogYEluc2VydCBwbGFpbnRleHQgc2VhcmNoIHJlc3VsdHMgYXQgdG9wIG9mIHBhZ2VgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NzciBoMSc7XG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXG4gICAgICAgIGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYFxuICAgICk7XG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcbiAgICBwcml2YXRlIF9wbGFpblRleHQ6IHN0cmluZyA9ICcnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcbiAgICAgICAgbGV0IGNvcHlCdG46IEhUTUxFbGVtZW50O1xuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PjtcblxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgdG9nZ2xlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAgICAgJ3BsYWluVG9nZ2xlJyxcbiAgICAgICAgICAgICAgICAnU2hvdyBQbGFpbnRleHQnLFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICcjc3NyJyxcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nXG4gICAgICAgICAgICApKSxcbiAgICAgICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVzdWx0cyBpbnRvIHBsYWludGV4dFxuICAgICAgICByZXN1bHRMaXN0XG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGNvcHkgYnV0dG9uXG4gICAgICAgICAgICAgICAgY29weUJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICAgICAncGxhaW5Db3B5JyxcbiAgICAgICAgICAgICAgICAgICAgJ0NvcHkgUGxhaW50ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICcjbXBfcGxhaW5Ub2dnbGUnLFxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgICAgICAgICAnbXBfY29weSBtcF9wbGFpbkJ0bidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBwbGFpbnRleHQgYm94XG4gICAgICAgICAgICAgICAgY29weUJ0bi5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAgICAgICAgIGA8YnI+PHRleHRhcmVhIGNsYXNzPSdtcF9wbGFpbnRleHRTZWFyY2gnIHN0eWxlPSdkaXNwbGF5OiBub25lJz48L3RleHRhcmVhPmBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXG4gICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBhIGNsaWNrIGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fcGxhaW5UZXh0KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9wbGFpbnRleHRTZWFyY2gnKSEuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodGhpcy5faXNPcGVuKTtcblxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XG4gICAgICAgIHRvZ2dsZUJ0blxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dGJveDogSFRNTFRleHRBcmVhRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Ym94ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgndHJ1ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdTaG93IFBsYWludGV4dCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHNlYXJjaCByZXN1bHRzIScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgT3BlbiBTdGF0ZSB0byB0cnVlL2ZhbHNlIGludGVybmFsbHkgYW5kIGluIHNjcmlwdCBzdG9yYWdlXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbCA9ICdmYWxzZSc7XG4gICAgICAgIH0gLy8gRGVmYXVsdCB2YWx1ZVxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XG4gICAgICAgIHRoaXMuX2lzT3BlbiA9IHZhbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9wcm9jZXNzUmVzdWx0cyhcbiAgICAgICAgcmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxuICAgICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBsZXQgc2VyaWVzVGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIC8vIEJyZWFrIG91dCB0aGUgaW1wb3J0YW50IGRhdGEgZnJvbSBlYWNoIG5vZGVcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgJy5hdXRob3InXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAnLm5hcnJhdG9yJ1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHJhd1RpdGxlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LmZvckVhY2goKHNlcmllcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSBsYXN0IHNlcmllcywgdGhlbiBzdHlsZVxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSAnQlkgJztcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSAnRlQgJztcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG91dHA7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBnZXQgaXNPcGVuKCk6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNPcGVuO1xuICAgIH1cblxuICAgIHNldCBpc09wZW4odmFsOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh2YWwpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBbGxvd3MgdGhlIHNlYXJjaCBmZWF0dXJlcyB0byBiZSBoaWRkZW4vc2hvd25cbiAqL1xuY2xhc3MgVG9nZ2xlU2VhcmNoYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU2VhcmNoYm94JyxcbiAgICAgICAgZGVzYzogYENvbGxhcHNlIHRoZSBTZWFyY2ggYm94IGFuZCBtYWtlIGl0IHRvZ2dsZWFibGVgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclNlYXJjaENvbnRyb2wnO1xuICAgIHByaXZhdGUgX2hlaWdodDogc3RyaW5nID0gJzI2cHgnO1xuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyA9ICdmYWxzZSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHNlYXJjaGJveDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuICAgICAgICBpZiAoc2VhcmNoYm94KSB7XG4gICAgICAgICAgICAvLyBBZGp1c3QgdGhlIHRpdGxlIHRvIG1ha2UgaXQgY2xlYXIgaXQgaXMgYSB0b2dnbGUgYnV0dG9uXG4gICAgICAgICAgICBjb25zdCB0aXRsZTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gc2VhcmNoYm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgJy5ibG9ja0hlYWRDb24gaDQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0IHRleHQgJiBzdHlsZVxuICAgICAgICAgICAgICAgIHRpdGxlLmlubmVySFRNTCA9ICdUb2dnbGUgU2VhcmNoJztcbiAgICAgICAgICAgICAgICB0aXRsZS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGNsaWNrIGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgdGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvZ2dsZShzZWFyY2hib3ghKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IHNldCB1cCB0b2dnbGUhIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ29sbGFwc2UgdGhlIHNlYXJjaGJveFxuICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNlYXJjaGJveCwge1xuICAgICAgICAgICAgICAgIHN0eWxlOiBgaGVpZ2h0OiR7dGhpcy5faGVpZ2h0fTtvdmVyZmxvdzpoaWRkZW47YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gSGlkZSBleHRyYSB0ZXh0XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb246IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICcjbWFpbkJvZHkgPiBoMydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBndWlkZUxpbms6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgJyNtYWluQm9keSA+IGgzIH4gYSdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uKSBub3RpZmljYXRpb24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIGlmIChndWlkZUxpbmspIGd1aWRlTGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb2xsYXBzZWQgdGhlIFNlYXJjaCBib3ghJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgY29sbGFwc2UgU2VhcmNoIGJveCEgVGFyZ2V0IGRvZXMgbm90IGV4aXN0Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF90b2dnbGUoZWxlbTogSFRNTERpdkVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgZWxlbS5zdHlsZS5oZWlnaHQgPSAndW5zZXQnO1xuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ3RydWUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbS5zdHlsZS5oZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSAnZmFsc2UnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ1RvZ2dsZWQgU2VhcmNoIGJveCEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEdlbmVyYXRlcyBsaW5rZWQgdGFncyBmcm9tIHRoZSBzaXRlJ3MgcGxhaW50ZXh0IHRhZyBmaWVsZFxuICovXG5jbGFzcyBCdWlsZFRhZ3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdidWlsZFRhZ3MnLFxuICAgICAgICBkZXNjOiBgR2VuZXJhdGUgY2xpY2thYmxlIFRhZ3MgYXV0b21hdGljYWxseWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBsZXQgcmVzdWx0c0xpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3NcbiAgICAgICAgcmVzdWx0c0xpc3RcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzTGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0xpc3QudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3MgYWdhaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocikgPT4gdGhpcy5fcHJvY2Vzc1RhZ1N0cmluZyhyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBDb2RlIHRvIHJ1biBmb3IgZXZlcnkgc2VhcmNoIHJlc3VsdFxuICAgICAqIEBwYXJhbSByZXMgQSBzZWFyY2ggcmVzdWx0IHJvd1xuICAgICAqL1xuICAgIHByaXZhdGUgX3Byb2Nlc3NUYWdTdHJpbmcgPSAocmVzOiBIVE1MVGFibGVSb3dFbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRhZ2xpbmUgPSA8SFRNTFNwYW5FbGVtZW50PnJlcy5xdWVyeVNlbGVjdG9yKCcudG9yUm93RGVzYycpO1xuXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cCh0YWdsaW5lKTtcblxuICAgICAgICAvLyBBc3N1bWUgYnJhY2tldHMgY29udGFpbiB0YWdzXG4gICAgICAgIGxldCB0YWdTdHJpbmcgPSB0YWdsaW5lLmlubmVySFRNTC5yZXBsYWNlKC8oPzpcXFt8XFxdfFxcKHxcXCl8JCkvZ2ksICcsJyk7XG4gICAgICAgIC8vIFJlbW92ZSBIVE1MIEVudGl0aWVzIGFuZCB0dXJuIHRoZW0gaW50byBicmVha3NcbiAgICAgICAgdGFnU3RyaW5nID0gdGFnU3RyaW5nLnNwbGl0KC8oPzomLnsxLDV9OykvZykuam9pbignOycpO1xuICAgICAgICAvLyBTcGxpdCB0YWdzIGF0ICcsJyBhbmQgJzsnIGFuZCAnPicgYW5kICd8J1xuICAgICAgICBsZXQgdGFncyA9IHRhZ1N0cmluZy5zcGxpdCgvXFxzKig/Ojt8LHw+fFxcfHwkKVxccyovKTtcbiAgICAgICAgLy8gUmVtb3ZlIGVtcHR5IG9yIGxvbmcgdGFnc1xuICAgICAgICB0YWdzID0gdGFncy5maWx0ZXIoKHRhZykgPT4gdGFnLmxlbmd0aCA8PSAzMCAmJiB0YWcubGVuZ3RoID4gMCk7XG4gICAgICAgIC8vIEFyZSB0YWdzIGFscmVhZHkgYWRkZWQ/IE9ubHkgYWRkIGlmIG51bGxcbiAgICAgICAgY29uc3QgdGFnQm94OiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVzLnF1ZXJ5U2VsZWN0b3IoJy5tcF90YWdzJyk7XG4gICAgICAgIGlmICh0YWdCb3ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX2luamVjdExpbmtzKHRhZ3MsIHRhZ2xpbmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdzKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAqIEluamVjdHMgdGhlIGdlbmVyYXRlZCB0YWdzXG4gICAgICogQHBhcmFtIHRhZ3MgQXJyYXkgb2YgdGFncyB0byBhZGRcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzZWFyY2ggcmVzdWx0IHJvdyB0aGF0IHRoZSB0YWdzIHdpbGwgYmUgYWRkZWQgdG9cbiAgICAgKi9cbiAgICBwcml2YXRlIF9pbmplY3RMaW5rcyA9ICh0YWdzOiBzdHJpbmdbXSwgdGFyOiBIVE1MU3BhbkVsZW1lbnQpID0+IHtcbiAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBuZXcgdGFnIHJvd1xuICAgICAgICAgICAgY29uc3QgdGFnUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgdGFnUm93LmNsYXNzTGlzdC5hZGQoJ21wX3RhZ3MnKTtcbiAgICAgICAgICAgIHRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgdGFnUm93KTtcbiAgICAgICAgICAgIHRhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgdGFnUm93Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgdGFncyB0byB0aGUgdGFnIHJvd1xuICAgICAgICAgICAgdGFncy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgICAgICAgICAgICB0YWdSb3cuaW5uZXJIVE1MICs9IGA8YSBjbGFzcz0nbXBfdGFnJyBocmVmPScvdG9yL2Jyb3dzZS5waHA/dG9yJTVCdGV4dCU1RD0lMjIke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICAgICAgKX0lMjImdG9yJTVCc3JjaEluJTVEJTVCdGFncyU1RD10cnVlJz4ke3RhZ308L2E+YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIFJhbmRvbSBCb29rIGZlYXR1cmUgdG8gb3BlbiBhIG5ldyB0YWIvd2luZG93IHdpdGggYSByYW5kb20gTUFNIEJvb2tcbiAqL1xuY2xhc3MgUmFuZG9tQm9vayBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3JhbmRvbUJvb2snLFxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIG9wZW4gYSByYW5kb21seSBzZWxlY3RlZCBib29rIHBhZ2UuICg8ZW0+VXNlcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGNhdGVnb3J5IGluIHRoZSBkcm9wZG93bjwvZW0+KWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgbGV0IHJhbmRvOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcbiAgICAgICAgY29uc3QgcmFuZG9UZXh0OiBzdHJpbmcgPSAnUmFuZG9tIEJvb2snO1xuXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHJhbmRvID0gVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAgICAgJ3JhbmRvbUJvb2snLFxuICAgICAgICAgICAgICAgIHJhbmRvVGV4dCxcbiAgICAgICAgICAgICAgICAnaDEnLFxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHJhbmRvXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb3VudFJlc3VsdDogUHJvbWlzZTxudW1iZXI+O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhdGVnb3JpZXM6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIENhdGVnb3J5IGRyb3Bkb3duIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdFNlbGVjdGlvbjogSFRNTFNlbGVjdEVsZW1lbnQgPSA8SFRNTFNlbGVjdEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXRlZ29yeVBhcnRpYWwnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB2YWx1ZSBjdXJyZW50bHkgc2VsZWN0ZWQgaW4gQ2F0ZWdvcnkgRHJvcGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdFZhbHVlOiBzdHJpbmcgPSBjYXRTZWxlY3Rpb24hLm9wdGlvbnNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0U2VsZWN0aW9uLnNlbGVjdGVkSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIF0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2RlcGVuZGluZyBvbiBjYXRlZ29yeSBzZWxlY3RlZCwgY3JlYXRlIGEgY2F0ZWdvcnkgc3RyaW5nIGZvciB0aGUgSlNPTiBHRVRcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKGNhdFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0FMTCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGVmYXVsdHMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xMyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xMyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRWYWx1ZS5jaGFyQXQoMCkgPT09ICdjJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW2NhdF1bXT0nICsgY2F0VmFsdWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvdW50UmVzdWx0ID0gdGhpcy5fZ2V0UmFuZG9tQm9va1Jlc3VsdHMoY2F0ZWdvcmllcykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudFJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChnZXRSYW5kb21SZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vcGVuIG5ldyB0YWIgd2l0aCB0aGUgcmFuZG9tIGJvb2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC90LycgKyBnZXRSYW5kb21SZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnX2JsYW5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgUmFuZG9tIEJvb2sgYnV0dG9uIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaWx0ZXJzIHNlYXJjaCByZXN1bHRzXG4gICAgICogQHBhcmFtIGNhdCBhIHN0cmluZyBjb250YWluaW5nIHRoZSBjYXRlZ29yaWVzIG5lZWRlZCBmb3IgSlNPTiBHZXRcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIF9nZXRSYW5kb21Cb29rUmVzdWx0cyhjYXQ6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQganNvblJlc3VsdDogUHJvbWlzZTxzdHJpbmc+O1xuICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJhbmRvbSBzZWFyY2ggcmVzdWx0c1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvdG9yL2pzL2xvYWRTZWFyY2hKU09OYmFzaWMucGhwP3RvcltzZWFyY2hUeXBlXT1hbGwmdG9yW3NlYXJjaEluXT10b3JyZW50cyR7Y2F0fSZ0b3JbcGVycGFnZV09NSZ0b3JbYnJvd3NlRmxhZ3NIaWRlVnNTaG93XT0wJnRvcltzdGFydERhdGVdPSZ0b3JbZW5kRGF0ZV09JnRvcltoYXNoXT0mdG9yW3NvcnRUeXBlXT1yYW5kb20mdGh1bWJuYWlsPXRydWU/JHtVdGlsLnJhbmRvbU51bWJlcihcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIDEwMDAwMFxuICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgUHJvbWlzZS5hbGwoWyhqc29uUmVzdWx0ID0gVXRpbC5nZXRKU09OKHVybCkpXSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAganNvblJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAudGhlbigoanNvbkZ1bGwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmV0dXJuIHRoZSBmaXJzdCB0b3JyZW50IElEIG9mIHRoZSByYW5kb20gSlNPTiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoanNvbkZ1bGwpLmRhdGFbMF0uaWQpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBGUkVFTEVFQ0ggRkVBVFVSRVNcbiAqL1xuXG5jbGFzcyBDb2xsYXBzZUZyZWVsZWVjaFNlY3Rpb25zIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5PdGhlcixcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdjb2xsYXBzZUZyZWVsZWVjaFNlY3Rpb25zJyxcbiAgICAgICAgZGVzYzogJ0NvbGxhcHNlIEZyZWVsZWVjaCBjYXRlZ29yeSBzZWN0aW9ucyBhbmQgYWRkIHF1aWNrLWp1bXAgbGlua3MnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5Cb2R5IGRpdltpZF49XCJmbF9jYXRfXCJdJztcbiAgICBwcml2YXRlIF9zZWN0aW9uQ29udGVudHM6IHsgW2tleTogc3RyaW5nXTogSFRNTEVsZW1lbnRbXSB9ID0ge307XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydmcmVlbGVlY2gnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IHNlY3Rpb25zID0gQXJyYXkuZnJvbShcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fdGFyKVxuICAgICAgICApIGFzIEhUTUxEaXZFbGVtZW50W107XG5cbiAgICAgICAgaWYgKHNlY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbTStdIENvdWxkIG5vdCBmaW5kIGZyZWVsZWVjaCBzZWN0aW9ucyB0byBjb2xsYXBzZS4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxpc3RCbG9jayA9IHNlY3Rpb25zWzBdLmNsb3Nlc3QoJy5ibG9ja0NvbicpO1xuICAgICAgICBpZiAobGlzdEJsb2NrICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9ub3JtYWxpemVMYXlvdXQobGlzdEJsb2NrKTtcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkVG9vbGJhcihsaXN0QmxvY2ssIHNlY3Rpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb24pID0+IHRoaXMuX2NvbGxhcHNlU2VjdGlvbihzZWN0aW9uKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENvbGxhcHNlZCBmcmVlbGVlY2ggc2VjdGlvbnMhJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbm9ybWFsaXplTGF5b3V0KGxpc3RCbG9jazogRWxlbWVudCkge1xuICAgICAgICBjb25zdCBibG9ja0JvZHkgPSBsaXN0QmxvY2sucXVlcnlTZWxlY3RvcignLmJsb2NrQm9keUNvbicpIGFzIEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgY29uc3QgbWFpbkJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHknKSBhcyBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG5cbiAgICAgICAgaWYgKG1haW5Cb2R5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBtYWluQm9keS5zdHlsZS50ZXh0QWxpZ24gPSAnbGVmdCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmxvY2tCb2R5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBibG9ja0JvZHkuc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgICAgICAgICAgYmxvY2tCb2R5LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICAgICAgYmxvY2tCb2R5LnN0eWxlLm1heFdpZHRoID0gJzEwMCUnO1xuICAgICAgICAgICAgYmxvY2tCb2R5LnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgICAgICAgfVxuXG4gICAgICAgIChsaXN0QmxvY2sgYXMgSFRNTERpdkVsZW1lbnQpLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICAobGlzdEJsb2NrIGFzIEhUTUxEaXZFbGVtZW50KS5zdHlsZS5tYXhXaWR0aCA9ICc5OCUnO1xuICAgICAgICAobGlzdEJsb2NrIGFzIEhUTUxEaXZFbGVtZW50KS5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYnVpbGRUb29sYmFyKGxpc3RCbG9jazogRWxlbWVudCwgc2VjdGlvbnM6IEhUTUxEaXZFbGVtZW50W10pIHtcbiAgICAgICAgY29uc3QgdG9vbGJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b29sYmFyLmNsYXNzTmFtZSA9ICdtcF9mbF90b29sYmFyJztcbiAgICAgICAgdG9vbGJhci5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnMTVweCc7XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlQWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvZ2dsZUFsbC5jbGFzc05hbWUgPSAnbXBfcGxhaW5CdG4gbXBfZmxfdG9nZ2xlX2FsbCc7XG4gICAgICAgIHRvZ2dsZUFsbC5yb2xlID0gJ2J1dHRvbic7XG4gICAgICAgIHRvZ2dsZUFsbC50ZXh0Q29udGVudCA9ICdFeHBhbmQgQWxsJztcblxuICAgICAgICBjb25zdCB0b2MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9jLmNsYXNzTmFtZSA9ICdtcF9mbF90b2MnO1xuICAgICAgICB0b2Muc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICAgICAgdG9jLnN0eWxlLmZsZXhXcmFwID0gJ3dyYXAnO1xuICAgICAgICB0b2Muc3R5bGUuZ2FwID0gJzZweCc7XG4gICAgICAgIHRvYy5zdHlsZS5tYXJnaW5Ub3AgPSAnOHB4JztcblxuICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKChzZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBzZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoJ2EuYmlnbGluaycpO1xuICAgICAgICAgICAgaWYgKGhlYWRlciA9PT0gbnVsbCB8fCBoZWFkZXIudGV4dENvbnRlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTmFtZSA9ICdtcF9wbGFpbkJ0biBtcF9mbF90b2NfaXRlbSc7XG4gICAgICAgICAgICBpdGVtLmhyZWYgPSBgIyR7c2VjdGlvbi5pZH1gO1xuICAgICAgICAgICAgaXRlbS50ZXh0Q29udGVudCA9IGhlYWRlci50ZXh0Q29udGVudC50cmltKCk7XG4gICAgICAgICAgICBpdGVtLnN0eWxlLm1hcmdpblJpZ2h0ID0gJzZweCc7XG4gICAgICAgICAgICBpdGVtLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICc2cHgnO1xuICAgICAgICAgICAgaXRlbS5zdHlsZS53aGl0ZVNwYWNlID0gJ25vd3JhcCc7XG4gICAgICAgICAgICB0b2MuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRvZ2dsZUFsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNob3VsZE9wZW4gPSB0b2dnbGVBbGwudGV4dENvbnRlbnQgPT09ICdFeHBhbmQgQWxsJztcbiAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb24pID0+IHRoaXMuX3NldE9wZW5TdGF0ZShzZWN0aW9uLCBzaG91bGRPcGVuKSk7XG4gICAgICAgICAgICB0b2dnbGVBbGwudGV4dENvbnRlbnQgPSBzaG91bGRPcGVuID8gJ0NvbGxhcHNlIEFsbCcgOiAnRXhwYW5kIEFsbCc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRvb2xiYXIuYXBwZW5kQ2hpbGQodG9nZ2xlQWxsKTtcbiAgICAgICAgdG9vbGJhci5hcHBlbmRDaGlsZCh0b2MpO1xuICAgICAgICBsaXN0QmxvY2suaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIHRvb2xiYXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NvbGxhcHNlU2VjdGlvbihzZWN0aW9uOiBIVE1MRGl2RWxlbWVudCkge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSBzZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoJ2EuYmlnbGluaycpIGFzIEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbDtcblxuICAgICAgICBpZiAoaGVhZGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ21wX2ZsX3NlY3Rpb24nKTtcbiAgICAgICAgc2VjdGlvbi5zdHlsZS5zY3JvbGxNYXJnaW5Ub3AgPSAnODBweCc7XG4gICAgICAgIHNlY3Rpb24uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIHNlY3Rpb24uc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgIHNlY3Rpb24uc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBBcnJheS5mcm9tKHNlY3Rpb24uY2hpbGRyZW4pLmZpbHRlcihcbiAgICAgICAgICAgIChjaGlsZCkgPT4gY2hpbGQgIT09IGhlYWRlclxuICAgICAgICApIGFzIEhUTUxFbGVtZW50W107XG5cbiAgICAgICAgdGhpcy5fc2VjdGlvbkNvbnRlbnRzW3NlY3Rpb24uaWRdID0gY29udGVudDtcblxuICAgICAgICBjb25zdCB0b2dnbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9nZ2xlLmNsYXNzTmFtZSA9ICdtcF9wbGFpbkJ0biBtcF9mbF90b2dnbGUnO1xuICAgICAgICB0b2dnbGUucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0b2dnbGUuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICB0b2dnbGUuc3R5bGUubWFyZ2luTGVmdCA9ICc4cHgnO1xuXG4gICAgICAgIHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZShzZWN0aW9uLCAhc2VjdGlvbi5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2ZsX29wZW4nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGhlYWRlci5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgdG9nZ2xlKTtcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHNlY3Rpb24sIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRPcGVuU3RhdGUoc2VjdGlvbjogSFRNTERpdkVsZW1lbnQsIG9wZW46IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgdG9nZ2xlID0gc2VjdGlvbi5xdWVyeVNlbGVjdG9yKCcubXBfZmxfdG9nZ2xlJykgYXMgSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5fc2VjdGlvbkNvbnRlbnRzW3NlY3Rpb24uaWRdO1xuXG4gICAgICAgIGlmICh0b2dnbGUgPT09IG51bGwgfHwgY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdtcF9mbF9vcGVuJyk7XG4gICAgICAgICAgICBjb250ZW50LmZvckVhY2goKGVsZW0pID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdG9nZ2xlLnRleHRDb250ZW50ID0gJ0hpZGUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdtcF9mbF9vcGVuJyk7XG4gICAgICAgICAgICBjb250ZW50LmZvckVhY2goKGVsZW0pID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdTaG93JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XG5cbi8qKlxuICogKiBBbGxvd3MgZ2lmdGluZyBvZiBGTCB3ZWRnZSB0byBtZW1iZXJzIHRocm91Z2ggZm9ydW0uXG4gKi9cbmNsYXNzIEZvcnVtRkxHaWZ0IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5Gb3J1bSxcbiAgICAgICAgdGl0bGU6ICdmb3J1bUZMR2lmdCcsXG4gICAgICAgIGRlc2M6IGBBZGQgYSBUaGFuayBidXR0b24gdG8gZm9ydW0gcG9zdHMuICg8ZW0+U2VuZHMgYSBGTCB3ZWRnZTwvZW0+KWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuZm9ydW1MaW5rJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2ZvcnVtIHRocmVhZCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIEZvcnVtIEdpZnQgQnV0dG9uLi4uJyk7XG4gICAgICAgIC8vbWFpbkJvZHkgaXMgYmVzdCBlbGVtZW50IHdpdGggYW4gSUQgSSBjb3VsZCBmaW5kIHRoYXQgaXMgYSBwYXJlbnQgdG8gYWxsIGZvcnVtIHBvc3RzXG4gICAgICAgIGNvbnN0IG1haW5Cb2R5ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xuICAgICAgICAvL21ha2UgYXJyYXkgb2YgZm9ydW0gcG9zdHMgLSB0aGVyZSBpcyBvbmx5IG9uZSBjdXJzb3IgY2xhc3NlZCBvYmplY3QgcGVyIGZvcnVtIHBvc3QsIHNvIHRoaXMgd2FzIGJlc3QgdG8ga2V5IG9mZiBvZi4gd2lzaCB0aGVyZSB3ZXJlIG1vcmUgSURzIGFuZCBzdWNoIHVzZWQgaW4gZm9ydW1zXG4gICAgICAgIGNvbnN0IGZvcnVtUG9zdHM6IEhUTUxBbmNob3JFbGVtZW50W10gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgICAgICAgIG1haW5Cb2R5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbHRhYmxlJylcbiAgICAgICAgKTtcbiAgICAgICAgLy9mb3IgZWFjaCBwb3N0IG9uIHRoZSBwYWdlXG4gICAgICAgIGZvcnVtUG9zdHMuZm9yRWFjaCgoZm9ydW1Qb3N0KSA9PiB7XG4gICAgICAgICAgICAvL3dvcmsgb3VyIHdheSBkb3duIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIEhUTUwgdG8gZ2V0IHRvIG91ciBwb3N0XG4gICAgICAgICAgICBsZXQgYm90dG9tUm93ID0gZm9ydW1Qb3N0LmNoaWxkTm9kZXNbMV07XG4gICAgICAgICAgICBib3R0b21Sb3cgPSBib3R0b21Sb3cuY2hpbGROb2Rlc1s0XTtcbiAgICAgICAgICAgIGJvdHRvbVJvdyA9IGJvdHRvbVJvdy5jaGlsZE5vZGVzWzNdO1xuICAgICAgICAgICAgLy9nZXQgdGhlIElEIG9mIHRoZSBmb3J1bSBmcm9tIHRoZSBjdXN0b20gTUFNIGF0dHJpYnV0ZVxuICAgICAgICAgICAgbGV0IHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+Zm9ydW1Qb3N0LnByZXZpb3VzU2libGluZyEpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgICAgICAgLy9tYW0gZGVjaWRlZCB0byBoYXZlIGEgZGlmZmVyZW50IHN0cnVjdHVyZSBmb3IgbGFzdCBmb3J1bS4gd2lzaCB0aGV5IGp1c3QgaGFkIElEcyBvciBzb21ldGhpbmcgaW5zdGVhZCBvZiBhbGwgdGhpcyBqdW1waW5nIGFyb3VuZFxuICAgICAgICAgICAgaWYgKHBvc3RJRCA9PT0gJ2xhc3QnKSB7XG4gICAgICAgICAgICAgICAgcG9zdElEID0gKDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgIGZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchLnByZXZpb3VzU2libGluZyFcbiAgICAgICAgICAgICAgICApKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGVsZW1lbnQgZm9yIG91ciBmZWF0dXJlXG4gICAgICAgICAgICBjb25zdCBnaWZ0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgIC8vc2V0IHNhbWUgY2xhc3MgYXMgb3RoZXIgb2JqZWN0cyBpbiBhcmVhIGZvciBzYW1lIHBvaW50ZXIgYW5kIGZvcm1hdHRpbmcgb3B0aW9uc1xuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdjdXJzb3InKTtcbiAgICAgICAgICAgIC8vZ2l2ZSBvdXIgZWxlbWVudCBhbiBJRCBmb3IgZnV0dXJlIHNlbGVjdGlvbiBhcyBuZWVkZWRcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfJyArIHBvc3RJRCArICdfdGV4dCcpO1xuICAgICAgICAgICAgLy9jcmVhdGUgbmV3IGltZyBlbGVtZW50IHRvIGxlYWQgb3VyIG5ldyBmZWF0dXJlIHZpc3VhbHNcbiAgICAgICAgICAgIGNvbnN0IGdpZnRJY29uR2lmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgICAgICAvL3VzZSBzaXRlIGZyZWVsZWVjaCBnaWYgaWNvbiBmb3Igb3VyIGZlYXR1cmVcbiAgICAgICAgICAgIGdpZnRJY29uR2lmLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAnc3JjJyxcbiAgICAgICAgICAgICAgICAnaHR0cHM6Ly9jZG4ubXlhbm9uYW1vdXNlLm5ldC9pbWFnZWJ1Y2tldC8xMDgzMDMvdGhhbmsuZ2lmJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vbWFrZSB0aGUgZ2lmIGljb24gdGhlIGZpcnN0IGNoaWxkIG9mIGVsZW1lbnRcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKGdpZnRJY29uR2lmKTtcbiAgICAgICAgICAgIC8vYWRkIHRoZSBmZWF0dXJlIGVsZW1lbnQgaW4gbGluZSB3aXRoIHRoZSBjdXJzb3Igb2JqZWN0IHdoaWNoIGlzIHRoZSBxdW90ZSBhbmQgcmVwb3J0IGJ1dHRvbnMgYXQgYm90dG9tXG4gICAgICAgICAgICBib3R0b21Sb3cuYXBwZW5kQ2hpbGQoZ2lmdEVsZW1lbnQpO1xuXG4gICAgICAgICAgICAvL21ha2UgaXQgYSBidXR0b24gdmlhIGNsaWNrIGxpc3RlbmVyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvL3RvIGF2b2lkIGJ1dHRvbiB0cmlnZ2VyaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBwYWdlIGxvYWQsIGNoZWNrIGlmIGFscmVhZHkgaGF2ZSBqc29uIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9kdWUgdG8gbGFjayBvZiBJRHMgYW5kIGNvbmZsaWN0aW5nIHF1ZXJ5IHNlbGVjdGFibGUgZWxlbWVudHMsIG5lZWQgdG8ganVtcCB1cCBhIGZldyBwYXJlbnQgbGV2ZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3N0UGFyZW50Tm9kZSA9IGdpZnRFbGVtZW50LnBhcmVudEVsZW1lbnQhLnBhcmVudEVsZW1lbnQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudEVsZW1lbnQhO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmNlIGF0IHBhcmVudCBub2RlIG9mIHRoZSBwb3N0LCBmaW5kIHRoZSBwb3N0ZXIncyB1c2VyIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyRWxlbSA9IHBvc3RQYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoYGFbaHJlZl49XCIvdS9cIl1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBVUkwgb2YgdGhlIHBvc3QgdG8gYWRkIHRvIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3RVUkwgPSAoPEhUTUxFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKGBhW2hyZWZePVwiL2YvdC9cIl1gKSFcbiAgICAgICAgICAgICAgICAgICAgICAgICkpLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgTUFNIHVzZXIgc2VuZGluZyBnaWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VuZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJNZW51JykhLmlubmVyVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY2xlYW4gdXAgdGV4dCBvZiBzZW5kZXIgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIgPSBzZW5kZXIuc3Vic3RyaW5nKDAsIHNlbmRlci5pbmRleE9mKCcgJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHRpdGxlIG9mIHRoZSBwYWdlIHNvIHdlIGNhbiB3cml0ZSBpbiBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9ydW1UaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jdXQgZG93biBmbHVmZiBmcm9tIHBhZ2UgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcnVtVGl0bGUgPSBmb3J1bVRpdGxlLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlLmluZGV4T2YoJ3wnKSAtIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbWVtYmVycyBuYW1lIGZvciBKU09OIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSAoPEhUTUxFbGVtZW50PnVzZXJFbGVtISkuaW5uZXJUZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1VSTCB0byBHRVQgYSBnaWZ0IHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1zZW5kV2VkZ2UmZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtzZW5kZXJ9IHdhbnRzIHRvIHRoYW5rIHlvdSBmb3IgeW91ciBjb250cmlidXRpb24gdG8gdGhlIGZvcnVtIHRvcGljIFt1cmw9aHR0cHM6Ly9teWFub25hbW91c2UubmV0JHtwb3N0VVJMfV0ke2ZvcnVtVGl0bGV9Wy91cmxdYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWFrZSAjIFVSSSBjb21wYXRpYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgnIycsICclMjMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlIE1BTSsganNvbiBnZXQgdXRpbGl0eSB0byBwcm9jZXNzIFVSTCBhbmQgcmV0dXJuIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgZ2lmdCB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnBhcnNlKGpzb25SZXN1bHQpLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0aGUgZmVhdHVyZSB0ZXh0IHRvIHNob3cgc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRkwgR2lmdCBTdWNjZXNzZnVsIScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2Jhc2VkIG9uIGZhaWx1cmUsIGFkZCBmZWF0dXJlIHRleHQgdG8gc2hvdyBmYWlsdXJlIHJlYXNvbiBvciBnZW5lcmljXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1lvdSBjYW4gb25seSBzZW5kIGEgdXNlciBvbmUgd2VkZ2UgcGVyIGRheS4nXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkOiBBbHJlYWR5IEdpZnRlZCBUaGlzIFVzZXIgVG9kYXkhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvciA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSW52YWxpZCB1c2VyLCB0aGlzIHVzZXIgaXMgbm90IGN1cnJlbnRseSBhY2NlcHRpbmcgd2VkZ2VzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZDogVGhpcyBVc2VyIERvZXMgTm90IEFjY2VwdCBHaWZ0cyEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL29ubHkga25vd24gZXhhbXBsZSBvZiB0aGlzICdvdGhlcicgaXMgd2hlbiBnaWZ0aW5nIHlvdXJzZWxmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdGTCBHaWZ0IEZhaWxlZCEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBnaWZ0IG5ld2VzdCAxMCBtZW1iZXJzIHRvIE1BTSBvbiBIb21lcGFnZSBvciBvcGVuIHRoZWlyIHVzZXIgcGFnZXNcbiAqL1xuY2xhc3MgR2lmdE5ld2VzdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIC8qIFRPRE86IFJlZmFjdG9yIGNvZGUgdG8gcmVkdWNlIGR1cGxpY2F0aW9uLiAqL1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdnaWZ0TmV3ZXN0JyxcbiAgICAgICAgZGVzYzogYEFkZCBidXR0b25zIHRvIEdpZnQvT3BlbiBhbGwgbmV3ZXN0IG1lbWJlcnNgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5UYWJsZSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydob21lJywgJ25ldyB1c2VycyddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBEZWNpZGUgd2hpY2ggcGFnZSB0byBydW4gb25cbiAgICAgKi9cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBDaGVjay5wYWdlKCkudGhlbigocGFnZTpWYWxpZFBhZ2UpID0+IHtcbiAgICAgICAgICAgIGlmKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnVXNlciBnaWZ0aW5nIGluaXQgb24nLHBhZ2UpO1xuXG4gICAgICAgICAgICBpZihwYWdlID09PSAnaG9tZScpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2hvbWVQYWdlR2lmdGluZygpO1xuICAgICAgICAgICAgfWVsc2UgaWYocGFnZSA9PT0gJ25ldyB1c2Vycycpe1xuICAgICAgICAgICAgICAgIHRoaXMuX25ld1VzZXJzUGFnZUdpZnRpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIEZ1bmN0aW9uIHRoYXQgcnVucyBvbiB0aGUgSG9tZSBwYWdlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBfaG9tZVBhZ2VHaWZ0aW5nKCkge1xuICAgICAgICAvL2Vuc3VyZSBnaWZ0ZWQgbGlzdCBpcyB1bmRlciA1MDAgbWVtYmVyIG5hbWVzIGxvbmdcbiAgICAgICAgdGhpcy5fdHJpbUdpZnRMaXN0KCk7XG4gICAgICAgIC8vZ2V0IHRoZSBGcm9udFBhZ2UgTmV3TWVtYmVycyBlbGVtZW50IGNvbnRhaW5pbmcgbmV3ZXN0IDEwIG1lbWJlcnNcbiAgICAgICAgY29uc3QgZnBOTSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZnBOTScpO1xuICAgICAgICBjb25zdCBtZW1iZXJzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXG4gICAgICAgICAgICBmcE5NLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbGFzdE1lbSA9IG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXTtcbiAgICAgICAgbWVtYmVycy5mb3JFYWNoKChtZW1iZXIpID0+IHtcbiAgICAgICAgICAgIC8vYWRkIGEgY2xhc3MgdG8gdGhlIGV4aXN0aW5nIGVsZW1lbnQgZm9yIHVzZSBpbiByZWZlcmVuY2UgaW4gY3JlYXRpbmcgYnV0dG9uc1xuICAgICAgICAgICAgbWVtYmVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgbXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfWApO1xuICAgICAgICAgICAgLy9pZiB0aGUgbWVtYmVyIGhhcyBiZWVuIGdpZnRlZCB0aHJvdWdoIHRoaXMgZmVhdHVyZSBwcmV2aW91c2x5XG4gICAgICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKS5pbmRleE9mKFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikpID49IDApIHtcbiAgICAgICAgICAgICAgICAvL2FkZCBjaGVja2VkIGJveCB0byB0ZXh0XG4gICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCA9IGAke21lbWJlci5pbm5lclRleHR9IOKchWA7XG4gICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcbiAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XG4gICAgICAgIC8vbWFrZSBzdXJlIHRoZSB2YWx1ZSBmYWxscyB3aXRoaW4gdGhlIGFjY2VwdGFibGUgcmFuZ2VcbiAgICAgICAgLy8gVE9ETzogTWFrZSB0aGUgZ2lmdCB2YWx1ZSBjaGVjayBpbnRvIGEgVXRpbFxuICAgICAgICBpZiAoIWdpZnRWYWx1ZVNldHRpbmcpIHtcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcbiAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAgfHwgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKSkge1xuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XG4gICAgICAgIH1cbiAgICAgICAgLy9jcmVhdGUgdGhlIHRleHQgaW5wdXQgZm9yIGhvdyBtYW55IHBvaW50cyB0byBnaXZlXG4gICAgICAgIGNvbnN0IGdpZnRBbW91bnRzOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgVXRpbC5zZXRBdHRyKGdpZnRBbW91bnRzLCB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICBzaXplOiAnMycsXG4gICAgICAgICAgICBpZDogJ21wX2dpZnRBbW91bnRzJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVmFsdWUgYmV0d2VlbiA1IGFuZCAxMDAnLFxuICAgICAgICAgICAgdmFsdWU6IGdpZnRWYWx1ZVNldHRpbmcsXG4gICAgICAgIH0pO1xuICAgICAgICAvL2luc2VydCB0aGUgdGV4dCBib3ggYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lXG4gICAgICAgIGxhc3RNZW0uaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGdpZnRBbW91bnRzKTtcblxuICAgICAgICAvL21ha2UgdGhlIGJ1dHRvbiBhbmQgaW5zZXJ0IGFmdGVyIHRoZSBsYXN0IG1lbWJlcnMgbmFtZSAoYmVmb3JlIHRoZSBpbnB1dCB0ZXh0KVxuICAgICAgICBjb25zdCBnaWZ0QWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnZ2lmdEFsbCcsXG4gICAgICAgICAgICAnR2lmdCBBbGw6ICcsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgIGAubXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihsYXN0TWVtKX1gLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIC8vYWRkIGEgc3BhY2UgYmV0d2VlbiBidXR0b24gYW5kIHRleHRcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5SaWdodCA9ICc1cHgnO1xuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblRvcCA9ICc1cHgnO1xuXG4gICAgICAgIGdpZnRBbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0Q2FsbDogYm9vbGVhbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgdGV4dCB0byBzaG93IHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICdTZW5kaW5nIEdpZnRzLi4uIFBsZWFzZSBXYWl0JztcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB1c2VyIGhhcyBub3QgYmVlbiBnaWZ0ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gbWVtYmVyLmlubmVyVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBwb2ludHMgYW1vdW50IGZyb20gdGhlIGlucHV0IGJveFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gKDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSkhLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJhbmRvbSBzZWFyY2ggcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPWdpZnQmYW1vdW50PSR7Z2lmdEZpbmFsQW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy93YWl0IDMgc2Vjb25kcyBiZXR3ZWVuIEpTT04gY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdENhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdENhbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCgzMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVxdWVzdCBzZW5kaW5nIHBvaW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvblJlc3VsdDogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdHaWZ0IFJlc3VsdCcsIGpzb25SZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBnaWZ0IHdhcyBzdWNjZXNzZnVsbHkgc2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgb2ZmIGJveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSBcXHUyNjExYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZCgnbXBfZ2lmdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgbWVtYmVyIHRvIHRoZSBzdG9yZWQgbWVtYmVyIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21wX2xhc3ROZXdHaWZ0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfSwke0dNX2dldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21wX2xhc3ROZXdHaWZ0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFKU09OLnBhcnNlKGpzb25SZXN1bHQpLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL2Rpc2FibGUgYnV0dG9uIGFmdGVyIHNlbmRcbiAgICAgICAgICAgICAgICAoZ2lmdEFsbEJ0biBhcyBIVE1MSW5wdXRFbGVtZW50KS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgJ0dpZnRzIGNvbXBsZXRlZCB0byBhbGwgQ2hlY2tlZCBVc2Vycyc7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICAvL25ld2xpbmUgYmV0d2VlbiBlbGVtZW50c1xuICAgICAgICBtZW1iZXJzW21lbWJlcnMubGVuZ3RoIC0gMV0uYWZ0ZXIoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XG4gICAgICAgIC8vbGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBpbnB1dCBib3ggYW5kIGVuc3VyZSBpdHMgYmV0d2VlbiA1IGFuZCAxMDAwLCBpZiBub3QgZGlzYWJsZSBidXR0b25cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWVUb051bWJlcjogU3RyaW5nID0gKDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKVxuICAgICAgICAgICAgKSkhLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgZ2lmdEFsbCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsJyk7XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XG4gICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpIDwgNSB8fFxuICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcih2YWx1ZVRvTnVtYmVyKSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGdpZnRBbGwuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGdpZnRBbGwuc2V0QXR0cmlidXRlKCd0aXRsZScsICdEaXNhYmxlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYEdpZnQgQWxsICR7dmFsdWVUb051bWJlcn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vYWRkIGEgYnV0dG9uIHRvIG9wZW4gYWxsIHVuZ2lmdGVkIG1lbWJlcnMgaW4gbmV3IHRhYnNcbiAgICAgICAgY29uc3Qgb3BlbkFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ29wZW5UYWJzJyxcbiAgICAgICAgICAgICdPcGVuIFVuZ2lmdGVkIEluIFRhYnMnLFxuICAgICAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgICAgICAnW2lkPW1wX2dpZnRBbW91bnRzXScsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ21wX2J0bidcbiAgICAgICAgKTtcblxuICAgICAgICBvcGVuQWxsQnRuLnNldEF0dHJpYnV0ZSgndGl0bGUnLCAnT3BlbiBuZXcgdGFiIGZvciBlYWNoJyk7XG4gICAgICAgIG9wZW5BbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihtZW1iZXIuaHJlZiwgJ19ibGFuaycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG4gICAgICAgIC8vZ2V0IHRoZSBjdXJyZW50IGFtb3VudCBvZiBib251cyBwb2ludHMgYXZhaWxhYmxlIHRvIHNwZW5kXG4gICAgICAgIGxldCBib251c1BvaW50c0F2YWlsOiBzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG1CUCcpIS5pbm5lclRleHQ7XG4gICAgICAgIC8vZ2V0IHJpZCBvZiB0aGUgZGVsdGEgZGlzcGxheVxuICAgICAgICBpZiAoYm9udXNQb2ludHNBdmFpbC5pbmRleE9mKCcoJykgPj0gMCkge1xuICAgICAgICAgICAgYm9udXNQb2ludHNBdmFpbCA9IGJvbnVzUG9pbnRzQXZhaWwuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgYm9udXNQb2ludHNBdmFpbC5pbmRleE9mKCcoJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgLy9yZWNyZWF0ZSB0aGUgYm9udXMgcG9pbnRzIGluIG5ldyBzcGFuIGFuZCBpbnNlcnQgaW50byBmcE5NXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VTcGFuOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgbWVzc2FnZVNwYW4uc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0QWxsTXNnJyk7XG4gICAgICAgIG1lc3NhZ2VTcGFuLmlubmVyVGV4dCA9ICdBdmFpbGFibGUgJyArIGJvbnVzUG9pbnRzQXZhaWw7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpIS5hZnRlcihtZXNzYWdlU3Bhbik7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmFmdGVyKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgICAgLmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhXG4gICAgICAgICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsICc8YnI+Jyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBnaWZ0IG5ldyBtZW1iZXJzIGJ1dHRvbiB0byBIb21lIHBhZ2UuLi5gKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIEZ1bmN0aW9uIHRoYXQgcnVucyBvbiB0aGUgTmV3IFVzZXJzIHBhZ2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIF9uZXdVc2Vyc1BhZ2VHaWZ0aW5nKCkge1xuICAgICAgICAvLyBFbnN1cmUgdGhlIGdpZnRlZCBsaXN0IGlzIHVuZGVyIDUwMCBtZW1iZXJzXG4gICAgICAgIHRoaXMuX3RyaW1HaWZ0TGlzdCgpO1xuXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgY29udGFpbmVyIGhvbGRpbmcgdGhlIG5ld2VzdCBtZW1iZXJzXG4gICAgICAgIGNvbnN0IGZwTk0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmxvY2tDb24nKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgZm9vdGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJsb2NrRm9vdCcpIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBtZW1iZXJMYWJlbHMgPSBBcnJheS5mcm9tKGZwTk0ucXVlcnlTZWxlY3RvckFsbCgnbGFiZWwnKSk7XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggbWVtYmVyIGFuZCBjaGVjayBpZiB0aGV5IHdlcmUgcHJldmlvdXNseSBnaWZ0ZWRcbiAgICAgICAgbWVtYmVyTGFiZWxzLmZvckVhY2goKGxhYmVsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSBsYWJlbC5xdWVyeVNlbGVjdG9yKCdhJykgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gICAgICAgICAgICBjb25zdCBjaGVja2JveCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgICAgICBjb25zdCBtZW1iZXJSZWYgPSBgbXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfWA7XG4gICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZChtZW1iZXJSZWYpO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgbWVtYmVyIGhhcyBhbHJlYWR5IGJlZW4gZ2lmdGVkLCB1cGRhdGUgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpLmluY2x1ZGVzKFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikpKSB7XG4gICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCArPSAnIOKchSc7XG4gICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZXRyaWV2ZSBvciBkZWZhdWx0IHRoZSBnaWZ0IHZhbHVlIHNldHRpbmdcbiAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmcgPSBHTV9nZXRWYWx1ZSgndXNlckdpZnREZWZhdWx0X3ZhbCcpIHx8ICcxMDAnO1xuICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gTWF0aC5taW4oMTAwLCBNYXRoLm1heCg1LCBOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpKSB8fCAxMDA7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGlucHV0IGJveCBmb3IgZ2lmdCBhbW91bnRcbiAgICAgICAgY29uc3QgZ2lmdEFtb3VudHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBVdGlsLnNldEF0dHIoZ2lmdEFtb3VudHMsIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHNpemU6ICczJyxcbiAgICAgICAgICAgIGlkOiAnbXBfZ2lmdEFtb3VudHMnLFxuICAgICAgICAgICAgdGl0bGU6ICdWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMCcsXG4gICAgICAgICAgICB2YWx1ZTogU3RyaW5nKGdpZnRWYWx1ZVNldHRpbmcpLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGJwVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgYnBUZXh0LmlubmVyVGV4dCA9ICdwb2ludHMgJztcblxuICAgICAgICAvLyBDcmVhdGUgXCJHaWZ0IEFsbCBDaGVja2VkIFVzZXJzXCIgYnV0dG9uXG4gICAgICAgIGNvbnN0IGdpZnRBbGxCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdtcF9naWZ0QWxsJyxcbiAgICAgICAgICAgICdHaWZ0IEFsbCBTZWxlY3RlZCcsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgIGZvb3RlcixcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAnbXBfYnRuJ1xuICAgICAgICApO1xuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblJpZ2h0ID0gJzVweCc7XG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUubWFyZ2luVG9wID0gJzVweCc7XG5cbiAgICAgICAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIGdpZnRpbmcgYWN0aW9uXG4gICAgICAgIGdpZnRBbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPSAnU2VuZGluZyBHaWZ0cy4uLiBQbGVhc2UgV2FpdCc7XG4gICAgICAgICAgICBsZXQgZmlyc3RDYWxsID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGdpZnRBbW91bnQgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWU7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgbGFiZWwgb2YgbWVtYmVyTGFiZWxzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbGFiZWwucXVlcnlTZWxlY3RvcignYScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykgYXMgSFRNTElucHV0RWxlbWVudDtcblxuICAgICAgICAgICAgICAgIGlmIChjaGVja2JveC5jaGVja2VkICYmICFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZSA9IG1lbWJlci5pbm5lclRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2dpZnRBbW91bnR9JmdpZnRUbz0ke3VzZXJOYW1lfWA7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaXJzdENhbGwpIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Q2FsbCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIuaW5uZXJUZXh0ICs9ICcg4pyFJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKCdtcF9naWZ0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJywgYCR7VXRpbC5lbmRPZkhyZWYobWVtYmVyKX0sJHtHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpfWApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAoZ2lmdEFsbEJ0biBhcyBIVE1MQnV0dG9uRWxlbWVudCkuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID0gJ0dpZnRzIGNvbXBsZXRlZCB0byBhbGwgQ2hlY2tlZCBVc2Vycyc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIElucHV0IHZhbGlkYXRpb24gZm9yIGdpZnQgYW1vdW50XG4gICAgICAgIGdpZnRBbW91bnRzLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ2lmdEFsbEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsJykgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcihnaWZ0QW1vdW50cy52YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IDUgfHwgdmFsdWUgPiAxMDAgfHwgaXNOYU4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbEJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbEJ0bi50aXRsZSA9ICdEaXNhYmxlZCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdpZnRBbGxCdG4uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsQnRuLnRpdGxlID0gYEdpZnQgQWxsICR7dmFsdWV9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIFwiT3BlbiBVbmdpZnRlZCBpbiBUYWJzXCIgYnV0dG9uXG4gICAgICAgIGNvbnN0IG9wZW5BbGxCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdtcF9vcGVuVGFicycsXG4gICAgICAgICAgICAnT3BlbiBVbmdpZnRlZCBpbiBUYWJzJyxcbiAgICAgICAgICAgICdidXR0b24nLFxuICAgICAgICAgICAgZm9vdGVyLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIG9wZW5BbGxCdG4udGl0bGUgPSAnT3BlbiBhIG5ldyB0YWIgZm9yIGVhY2ggdW5naWZ0ZWQgbWVtYmVyJztcbiAgICAgICAgb3BlbkFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGFiZWwgb2YgbWVtYmVyTGFiZWxzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbGFiZWwucXVlcnlTZWxlY3RvcignYScpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tib3guY2hlY2tlZCAmJiAhbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4obWVtYmVyLmhyZWYsICdfYmxhbmsnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERpc3BsYXkgYXZhaWxhYmxlIGJvbnVzIHBvaW50cyBpbiB0aGUgZm9vdGVyXG4gICAgICAgIGxldCBib251c1BvaW50c0F2YWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RtQlAnKSEuaW5uZXJUZXh0LnNwbGl0KCc6JylbMV07XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBtZXNzYWdlU3Bhbi5pZCA9ICdtcF9naWZ0QWxsTXNnJztcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gYCBBdmFpbGFibGUgUG9pbnRzOiAke2JvbnVzUG9pbnRzQXZhaWx9YDtcblxuICAgICAgICAvLyBBZGQgXCJEZXNlbGVjdCBBbGxcIiBidXR0b25cbiAgICAgICAgY29uc3QgZGVzZWxlY3RCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdtcF9kZXNlbGVjdEFsbCcsXG4gICAgICAgICAgICAnVW5zZWxlY3QgYWxsJyxcbiAgICAgICAgICAgICdidXR0b24nLFxuICAgICAgICAgICAgZm9vdGVyLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIGRlc2VsZWN0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm94TGlzdDogTm9kZUxpc3RPZjxIVE1MSW5wdXRFbGVtZW50PiB8IHZvaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpXG5cbiAgICAgICAgICAgIGJveExpc3QuZm9yRWFjaCgoYm94OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgXCJTZWxlY3QgMTAwIFVuZ2lmdGVkXCIgYnV0dG9uXG4gICAgICAgIGNvbnN0IHNlbGVjdFVuZ2lmdGVkQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnbXBfc2VsZWN0VW5naWZ0ZWQnLFxuICAgICAgICAgICAgJ1NlbGVjdCAxMDAgVW5naWZ0ZWQnLFxuICAgICAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgICAgICBmb290ZXIsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ21wX2J0bidcbiAgICAgICAgKTtcbiAgICAgICAgc2VsZWN0VW5naWZ0ZWRCdG4udGl0bGUgPSAnU2VsZWN0IHRoZSBmaXJzdCAxMDAgdW5naWZ0ZWQgdXNlcnMnO1xuICAgICAgICBzZWxlY3RVbmdpZnRlZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxhYmVsIG9mIG1lbWJlckxhYmVscykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2EnKSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVja2JveCA9IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgbWVtYmVyIGlzIG5vdCBnaWZ0ZWQgYW5kIGlmIHRoZSBjaGVja2JveCBpcyBub3QgeWV0IHNlbGVjdGVkXG4gICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSAmJiAhY2hlY2tib3guY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gdHJ1ZTsgIC8vIFNlbGVjdCB0aGUgY2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgLy8gU3RvcCBhZnRlciBzZWxlY3RpbmcgMTAwIHVzZXJzXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA+PSAxMDApIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNlbGVjdGVkICR7Y291bnR9IHVuZ2lmdGVkIHVzZXJzLmApO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIEFwcGVuZCBhbGwgZWxlbWVudHMgdG8gdGhlIGZvb3RlclxuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoc2VsZWN0VW5naWZ0ZWRCdG4pO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoZGVzZWxlY3RCdG4pO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoZ2lmdEFtb3VudHMpO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoYnBUZXh0KTtcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGdpZnRBbGxCdG4pO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQob3BlbkFsbEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChtZXNzYWdlU3Bhbik7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgZ2lmdGluZyBvcHRpb25zIHRvIHRoZSBmb290ZXIgb2YgdGhlIHBhZ2UuJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBUcmltcyB0aGUgZ2lmdGVkIGxpc3QgdG8gbGFzdCA1MDAgbmFtZXMgdG8gYXZvaWQgZ2V0dGluZyB0b28gbGFyZ2Ugb3ZlciB0aW1lLlxuICAgICAqL1xuICAgIHByaXZhdGUgX3RyaW1HaWZ0TGlzdCgpIHtcbiAgICAgICAgLy9pZiB2YWx1ZSBleGlzdHMgaW4gR01cbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJykpIHtcbiAgICAgICAgICAgIC8vR00gdmFsdWUgaXMgYSBjb21tYSBkZWxpbSB2YWx1ZSwgc3BsaXQgdmFsdWUgaW50byBhcnJheSBvZiBuYW1lc1xuICAgICAgICAgICAgY29uc3QgZ2lmdE5hbWVzID0gR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgbGV0IG5ld0dpZnROYW1lczogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBpZiAoZ2lmdE5hbWVzLmxlbmd0aCA+IDUwMCkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZ2lmdE5hbWUgb2YgZ2lmdE5hbWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0TmFtZXMuaW5kZXhPZihnaWZ0TmFtZSkgPD0gNDk5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlYnVpbGQgYSBjb21tYSBkZWxpbSBzdHJpbmcgb3V0IG9mIHRoZSBmaXJzdCA0OSBuYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3R2lmdE5hbWVzID0gbmV3R2lmdE5hbWVzICsgZ2lmdE5hbWUgKyAnLCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NldCBuZXcgc3RyaW5nIGluIEdNXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsIG5ld0dpZnROYW1lcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vc2V0IHZhbHVlIGlmIGRvZXNudCBleGlzdFxuICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnLCAnJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyMgQWRkcyBhYmlsaXR5IHRvIGhpZGUgbmV3cyBpdGVtcyBvbiB0aGUgcGFnZVxuICovXG5jbGFzcyBIaWRlTmV3cyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcbiAgICAgICAgdGl0bGU6ICdoaWRlTmV3cycsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIGRlc2M6ICdUaWR5IHRoZSBob21lcGFnZSBhbmQgYWxsb3cgTmV3cyB0byBiZSBoaWRkZW4nLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLm1haW5QYWdlTmV3c0hlYWQnO1xuICAgIHByaXZhdGUgX3ZhbHVlVGl0bGU6IHN0cmluZyA9IGBtcF8ke3RoaXMuX3NldHRpbmdzLnRpdGxlfV92YWxgO1xuICAgIHByaXZhdGUgX2ljb24gPSAnXFx1Mjc0ZSc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgLy8gTk9URTogZm9yIGRldmVsb3BtZW50XG4gICAgICAgIC8vIEdNX2RlbGV0ZVZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO2NvbnNvbGUud2FybihgVmFsdWUgb2YgJHt0aGlzLl92YWx1ZVRpdGxlfSB3aWxsIGJlIGRlbGV0ZWQhYCk7XG5cbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvY2soKTtcbiAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIpO1xuICAgICAgICBhd2FpdCB0aGlzLl9jaGVja0ZvclNlZW4oKTtcbiAgICAgICAgdGhpcy5fYWRkSGlkZXJCdXR0b24oKTtcbiAgICAgICAgLy8gdGhpcy5fY2xlYW5WYWx1ZXMoKTsgLy8gRklYOiBOb3Qgd29ya2luZyBhcyBpbnRlbmRlZFxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENsZWFuZWQgdXAgdGhlIGhvbWUgcGFnZSEnKTtcbiAgICB9XG5cbiAgICBfY2hlY2tGb3JTZWVuID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBwcmV2VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGhpcy5fdmFsdWVUaXRsZSwgJzpcXG4nLCBwcmV2VmFsdWUpO1xuXG4gICAgICAgIGlmIChwcmV2VmFsdWUgJiYgbmV3cykge1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBpY29uIHRvIHNwbGl0IG91dCB0aGUga25vd24gaGlkZGVuIG1lc3NhZ2VzXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5BcnJheSA9IHByZXZWYWx1ZS5zcGxpdCh0aGlzLl9pY29uKTtcbiAgICAgICAgICAgIC8qIElmIGFueSBvZiB0aGUgaGlkZGVuIG1lc3NhZ2VzIG1hdGNoIGEgY3VycmVudCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgcmVtb3ZlIHRoZSBjdXJyZW50IG1lc3NhZ2UgZnJvbSB0aGUgRE9NICovXG4gICAgICAgICAgICBoaWRkZW5BcnJheS5mb3JFYWNoKChoaWRkZW4pID0+IHtcbiAgICAgICAgICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS50ZXh0Q29udGVudCA9PT0gaGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gY3VycmVudCBtZXNzYWdlcywgaGlkZSB0aGUgaGVhZGVyXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluUGFnZU5ld3NTdWInKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3JlbW92ZUNsb2NrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjbG9jazogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IC5mcFRpbWUnKTtcbiAgICAgICAgaWYgKGNsb2NrKSBjbG9jay5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgX2FkanVzdEhlYWRlclNpemUgPSAoc2VsZWN0b3I6IHN0cmluZywgdmlzaWJsZT86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgY29uc3QgbmV3c0hlYWRlcjogSFRNTEhlYWRpbmdFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAobmV3c0hlYWRlcikge1xuICAgICAgICAgICAgaWYgKHZpc2libGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgbmV3c0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdzSGVhZGVyLnN0eWxlLmZvbnRTaXplID0gJzJlbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2FkZEhpZGVyQnV0dG9uID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XG4gICAgICAgIGlmICghbmV3cykgcmV0dXJuO1xuXG4gICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIG5ld3MgZW50cnlcbiAgICAgICAgbmV3cy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgYnV0dG9uXG4gICAgICAgICAgICBjb25zdCB4YnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB4YnV0dG9uLnRleHRDb250ZW50ID0gdGhpcy5faWNvbjtcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cih4YnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OmlubGluZS1ibG9jazttYXJnaW4tcmlnaHQ6MC43ZW07Y3Vyc29yOnBvaW50ZXI7JyxcbiAgICAgICAgICAgICAgICBjbGFzczogJ21wX2NsZWFyQnRuJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGlja3NcbiAgICAgICAgICAgIHhidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gV2hlbiBjbGlja2VkLCBhcHBlbmQgdGhlIGNvbnRlbnQgb2YgdGhlIGN1cnJlbnQgbmV3cyBwb3N0IHRvIHRoZVxuICAgICAgICAgICAgICAgIC8vIGxpc3Qgb2YgcmVtZW1iZXJlZCBuZXdzIGl0ZW1zXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcbiAgICAgICAgICAgICAgICAgICAgPyBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKVxuICAgICAgICAgICAgICAgICAgICA6ICcnO1xuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRylcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEhpZGluZy4uLiAke3ByZXZpb3VzVmFsdWV9JHtlbnRyeS50ZXh0Q29udGVudH1gKTtcblxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUsIGAke3ByZXZpb3VzVmFsdWV9JHtlbnRyeS50ZXh0Q29udGVudH1gKTtcbiAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gbW9yZSBuZXdzIGl0ZW1zLCByZW1vdmUgdGhlIGhlYWRlclxuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWROZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlZE5ld3MgJiYgdXBkYXRlZE5ld3MubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGp1c3RIZWFkZXJTaXplKHRoaXMuX3RhciwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIGJ1dHRvbiBhcyB0aGUgZmlyc3QgY2hpbGQgb2YgdGhlIGVudHJ5XG4gICAgICAgICAgICBpZiAoZW50cnkuZmlyc3RDaGlsZCkgZW50cnkuZmlyc3RDaGlsZC5iZWZvcmUoeGJ1dHRvbik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfY2xlYW5WYWx1ZXMgPSAobnVtID0gMykgPT4ge1xuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBHTV9nZXRWYWx1ZSgke3RoaXMuX3ZhbHVlVGl0bGV9KWAsIHZhbHVlKTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGxhc3QgMyBzdG9yZWQgaXRlbXMgYWZ0ZXIgc3BsaXR0aW5nIHRoZW0gYXQgdGhlIGljb25cbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5hcnJheVRvU3RyaW5nKHZhbHVlLnNwbGl0KHRoaXMuX2ljb24pLnNsaWNlKDAgLSBudW0pKTtcbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBuZXcgdmFsdWVcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfZ2V0TmV3c0l0ZW1zID0gKCk6IE5vZGVMaXN0T2Y8SFRNTERpdkVsZW1lbnQ+IHwgbnVsbCA9PiB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXZbY2xhc3NePVwibWFpblBhZ2VOZXdzXCJdJyk7XG4gICAgfTtcblxuICAgIC8vIFRoaXMgbXVzdCBtYXRjaCB0aGUgdHlwZSBzZWxlY3RlZCBmb3IgYHRoaXMuX3NldHRpbmdzYFxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XG4vKipcbiAqICMgUkVRVUVTVCBQQUdFIEZFQVRVUkVTXG4gKi9cbi8qKlxuICogKiBIaWRlIHJlcXVlc3RlcnMgd2hvIGFyZSBzZXQgdG8gXCJoaWRkZW5cIlxuICovXG5jbGFzcyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVIaWRkZW5SZXF1ZXN0ZXJzJyxcbiAgICAgICAgZGVzYzogYEhpZGUgaGlkZGVuIHJlcXVlc3RlcnNgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclJvd3MnO1xuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfaGlkZSA9IHRydWU7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydyZXF1ZXN0J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLl9hZGRUb2dnbGVTd2l0Y2goKTtcbiAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IGF3YWl0IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XG4gICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHModGhpcy5fc2VhcmNoTGlzdCk7XG5cbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKHRoaXMuX3RhciwgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IGF3YWl0IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHRoaXMuX3NlYXJjaExpc3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRUb2dnbGVTd2l0Y2goKSB7XG4gICAgICAgIC8vIE1ha2UgYSBuZXcgYnV0dG9uIGFuZCBpbnNlcnQgYmVzaWRlIHRoZSBTZWFyY2ggYnV0dG9uXG4gICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ3Nob3dIaWRkZW4nLFxuICAgICAgICAgICAgJ1Nob3cgSGlkZGVuJyxcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgJyNyZXF1ZXN0U2VhcmNoIC50b3JyZW50U2VhcmNoJyxcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcbiAgICAgICAgKTtcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBuZXcgYnV0dG9uIGFuZCBhZGQgYSBjbGljayBsaXN0ZW5lclxuICAgICAgICBjb25zdCB0b2dnbGVTd2l0Y2g6IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zaG93SGlkZGVuJylcbiAgICAgICAgKTtcbiAgICAgICAgdG9nZ2xlU3dpdGNoLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGlkZGVuTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgJyN0b3JSb3dzID4gLm1wX2hpZGRlbidcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSAnSGlkZSBIaWRkZW4nO1xuICAgICAgICAgICAgICAgIGhpZGRlbkxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbGlzdC1pdGVtJztcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSAnU2hvdyBIaWRkZW4nO1xuICAgICAgICAgICAgICAgIGhpZGRlbkxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0UmVxdWVzdExpc3QoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdHMgdG8gZXhpc3RcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjdG9yUm93cyAudG9yUm93IC50b3JSaWdodCcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEdyYWIgYWxsIHJlcXVlc3RzXG4gICAgICAgICAgICAgICAgY29uc3QgcmVxTGlzdDpcbiAgICAgICAgICAgICAgICAgICAgfCBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+XG4gICAgICAgICAgICAgICAgICAgIHwgbnVsbFxuICAgICAgICAgICAgICAgICAgICB8IHVuZGVmaW5lZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICcjdG9yUm93cyAudG9yUm93J1xuICAgICAgICAgICAgICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PjtcblxuICAgICAgICAgICAgICAgIGlmIChyZXFMaXN0ID09PSBudWxsIHx8IHJlcUxpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHJlcUxpc3QgaXMgJHtyZXFMaXN0fWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxTGlzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2ZpbHRlclJlc3VsdHMobGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pikge1xuICAgICAgICBsaXN0LmZvckVhY2goKHJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RlcjogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gcmVxdWVzdC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICcudG9yUmlnaHQgYSdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAocmVxdWVzdGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICogR2VuZXJhdGUgYSBwbGFpbnRleHQgbGlzdCBvZiByZXF1ZXN0IHJlc3VsdHNcbiAqL1xuY2xhc3MgUGxhaW50ZXh0UmVxdWVzdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0UmVxdWVzdCcsXG4gICAgICAgIGRlc2M6IGBJbnNlcnQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyBhdCB0b3Agb2YgcmVxdWVzdCBwYWdlYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcbiAgICApO1xuICAgIHByaXZhdGUgX3BsYWluVGV4dDogc3RyaW5nID0gJyc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydyZXF1ZXN0J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcbiAgICAgICAgbGV0IGNvcHlCdG46IEhUTUxFbGVtZW50O1xuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PjtcblxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgdG9nZ2xlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAgICAgJ3BsYWluVG9nZ2xlJyxcbiAgICAgICAgICAgICAgICAnU2hvdyBQbGFpbnRleHQnLFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICcjc3NyJyxcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nXG4gICAgICAgICAgICApKSxcbiAgICAgICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fZ2V0UmVxdWVzdExpc3QoKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIHJlc3VsdHMgaW50byBwbGFpbnRleHRcbiAgICAgICAgcmVzdWx0TGlzdFxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb3B5IGJ1dHRvblxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICAgICAgICAgJ3BsYWluQ29weScsXG4gICAgICAgICAgICAgICAgICAgICdDb3B5IFBsYWludGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAnI21wX3BsYWluVG9nZ2xlJyxcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgcGxhaW50ZXh0IGJveFxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgICAgICAgICBgPGJyPjx0ZXh0YXJlYSBjbGFzcz0nbXBfcGxhaW50ZXh0U2VhcmNoJyBzdHlsZT0nZGlzcGxheTogbm9uZSc+PC90ZXh0YXJlYT5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXG4gICAgICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSW5pdCBvcGVuIHN0YXRlXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh0aGlzLl9pc09wZW4pO1xuXG4gICAgICAgIC8vIFNldCB1cCB0b2dnbGUgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgdG9nZ2xlQnRuXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRleHRib3ggc2hvdWxkIGV4aXN0LCBidXQganVzdCBpbiBjYXNlLi4uXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Ym94OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRib3ggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRleHRib3ggZG9lc24ndCBleGlzdCFgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCd0cnVlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ0hpZGUgUGxhaW50ZXh0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCdmYWxzZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1Nob3cgUGxhaW50ZXh0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBJbnNlcnRlZCBwbGFpbnRleHQgcmVxdWVzdCByZXN1bHRzIScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgT3BlbiBTdGF0ZSB0byB0cnVlL2ZhbHNlIGludGVybmFsbHkgYW5kIGluIHNjcmlwdCBzdG9yYWdlXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbCA9ICdmYWxzZSc7XG4gICAgICAgIH0gLy8gRGVmYXVsdCB2YWx1ZVxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XG4gICAgICAgIHRoaXMuX2lzT3BlbiA9IHZhbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9wcm9jZXNzUmVzdWx0cyhyZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xuICAgICAgICByZXN1bHRzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgIC8vIFJlc2V0IGVhY2ggdGV4dCBmaWVsZFxuICAgICAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIGxldCBzZXJpZXNUaXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBsZXQgYXV0aFRpdGxlOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIGxldCBuYXJyVGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IHRoZSBpbXBvcnRhbnQgZGF0YSBmcm9tIGVhY2ggbm9kZVxuICAgICAgICAgICAgY29uc3QgcmF3VGl0bGU6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvcignLnRvclRpdGxlJyk7XG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgICAgICA+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnLnNlcmllcycpO1xuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAnLmF1dGhvcidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBuYXJyTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICcubmFycmF0b3InXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAocmF3VGl0bGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIE5vZGU6Jywgbm9kZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXN1bHQgdGl0bGUgc2hvdWxkIG5vdCBiZSBudWxsYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpdGxlID0gcmF3VGl0bGUudGV4dENvbnRlbnQhLnRyaW0oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHJvY2VzcyBzZXJpZXNcbiAgICAgICAgICAgIGlmIChzZXJpZXNMaXN0ICE9PSBudWxsICYmIHNlcmllc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QuZm9yRWFjaCgoc2VyaWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlICs9IGAke3Nlcmllcy50ZXh0Q29udGVudH0gLyBgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIGxhc3Qgc2VyaWVzLCB0aGVuIHN0eWxlXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBzZXJpZXNUaXRsZS5zdWJzdHJpbmcoMCwgc2VyaWVzVGl0bGUubGVuZ3RoIC0gMyk7XG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBgICgke3Nlcmllc1RpdGxlfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvY2VzcyBhdXRob3JzXG4gICAgICAgICAgICBpZiAoYXV0aExpc3QgIT09IG51bGwgJiYgYXV0aExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9ICdCWSAnO1xuICAgICAgICAgICAgICAgIGF1dGhMaXN0LmZvckVhY2goKGF1dGgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aFRpdGxlICs9IGAke2F1dGgudGV4dENvbnRlbnR9IEFORCBgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSBhdXRoVGl0bGUuc3Vic3RyaW5nKDAsIGF1dGhUaXRsZS5sZW5ndGggLSA1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2Nlc3MgbmFycmF0b3JzXG4gICAgICAgICAgICBpZiAobmFyckxpc3QgIT09IG51bGwgJiYgbmFyckxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9ICdGVCAnO1xuICAgICAgICAgICAgICAgIG5hcnJMaXN0LmZvckVhY2goKG5hcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbmFyclRpdGxlICs9IGAke25hcnIudGV4dENvbnRlbnR9IEFORCBgO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSBuYXJyVGl0bGUuc3Vic3RyaW5nKDAsIG5hcnJUaXRsZS5sZW5ndGggLSA1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHAgKz0gYCR7dGl0bGV9JHtzZXJpZXNUaXRsZX0gJHthdXRoVGl0bGV9ICR7bmFyclRpdGxlfVxcbmA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gb3V0cDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRSZXF1ZXN0TGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+ID0+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmdldFNlYXJjaExpc3QoIClgKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSByZXF1ZXN0IHJlc3VsdHMgdG8gZXhpc3RcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjdG9yUm93cyAudG9yUm93IGEnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHJlcXVlc3QgcmVzdWx0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXRjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSA8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4oXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JSb3dzIC50b3JSb3cnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgc25hdGNoTGlzdCBpcyAke3NuYXRjaExpc3R9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxuXG4gICAgZ2V0IGlzT3BlbigpOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcbiAgICB9XG5cbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcbiAgICB9XG59XG5cbmNsYXNzIEdvb2RyZWFkc0J1dHRvblJlcSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZ29vZHJlYWRzQnV0dG9uUmVxJyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcbiAgICAgICAgZGVzYzogJ0VuYWJsZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMgZm9yIHJlcXVlc3RzJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNmaWxsVG9ycmVudCc7XG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCBkZXRhaWxzJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgLy8gQ29udmVydCByb3cgc3RydWN0dXJlIGludG8gc2VhcmNoYWJsZSBvYmplY3RcbiAgICAgICAgY29uc3QgcmVxUm93cyA9IFV0aWwucm93c1RvT2JqKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uID4gZGl2JykpO1xuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVxUm93c1snVGl0bGU6J10ucXVlcnlTZWxlY3Rvcignc3BhbicpO1xuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSByZXFSb3dzW1xuICAgICAgICAgICAgJ0F1dGhvcihzKTonXG4gICAgICAgIF0ucXVlcnlTZWxlY3RvckFsbCgnYScpO1xuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSByZXFSb3dzWydTZXJpZXM6J11cbiAgICAgICAgICAgID8gcmVxUm93c1snU2VyaWVzOiddLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHJlcVJvd3NbJ1JlbGVhc2UgRGF0ZSddO1xuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XG4gICAgfVxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBQcm9jZXNzICYgcmV0dXJuIGluZm9ybWF0aW9uIGZyb20gdGhlIHNob3V0Ym94XG4gKi9cbmNsYXNzIFByb2Nlc3NTaG91dHMge1xuICAgIC8qKlxuICAgICAqIFdhdGNoIHRoZSBzaG91dGJveCBmb3IgY2hhbmdlcywgdHJpZ2dlcmluZyBhY3Rpb25zIGZvciBmaWx0ZXJlZCBzaG91dHNcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzaG91dGJveCBlbGVtZW50IHNlbGVjdG9yXG4gICAgICogQHBhcmFtIG5hbWVzIChPcHRpb25hbCkgTGlzdCBvZiB1c2VybmFtZXMvSURzIHRvIGZpbHRlciBmb3JcbiAgICAgKiBAcGFyYW0gdXNlcnR5cGUgKE9wdGlvbmFsKSBXaGF0IGZpbHRlciB0aGUgbmFtZXMgYXJlIGZvci4gUmVxdWlyZWQgaWYgYG5hbWVzYCBpcyBwcm92aWRlZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgd2F0Y2hTaG91dGJveChcbiAgICAgICAgdGFyOiBzdHJpbmcsXG4gICAgICAgIG5hbWVzPzogc3RyaW5nW10sXG4gICAgICAgIHVzZXJ0eXBlPzogU2hvdXRib3hVc2VyVHlwZVxuICAgICk6IHZvaWQge1xuICAgICAgICAvLyBPYnNlcnZlIHRoZSBzaG91dGJveFxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXG4gICAgICAgICAgICB0YXIsXG4gICAgICAgICAgICAobXV0TGlzdCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIHNob3V0Ym94IHVwZGF0ZXMsIHByb2Nlc3MgdGhlIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgbXV0TGlzdC5mb3JFYWNoKChtdXRSZWMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjaGFuZ2VkIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgIG11dFJlYy5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGU6IE5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVEYXRhID0gVXRpbC5ub2RlVG9FbGVtKG5vZGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSBpcyBhZGRlZCBieSBNQU0rIGZvciBnaWZ0IGJ1dHRvbiwgaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIGlnbm9yZSBpZiB0aGUgbm9kZSBpcyBhIGRhdGUgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXm1wXy8udGVzdChub2RlRGF0YS5nZXRBdHRyaWJ1dGUoJ2lkJykhKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZUJyZWFrJylcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGxvb2tpbmcgZm9yIHNwZWNpZmljIHVzZXJzLi4uXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZXMgIT09IHVuZGVmaW5lZCAmJiBuYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJ0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZXJ0eXBlIG11c3QgYmUgZGVmaW5lZCBpZiBmaWx0ZXJpbmcgbmFtZXMhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklEOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWZePVwiL3UvXCJdJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hyZWYnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSA+IHNwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYC91LyR7bmFtZX1gID09PSB1c2VySUQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2FzZWxlc3NTdHJpbmdNYXRjaChuYW1lLCB1c2VyTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlU2hvdXQobm9kZSwgdXNlcnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgY2hpbGRMaXN0OiB0cnVlIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxuICAgICAqIEBwYXJhbSBidXR0b25zIE51bWJlciB0byByZXByZXNlbnQgY2hlY2tib3ggc2VsZWN0aW9ucyAxID0gUmVwbHksIDIgPSBSZXBseSBXaXRoIFF1b3RlXG4gICAgICogQHBhcmFtIGNoYXJMaW1pdCBOdW1iZXIgb2YgY2hhcmFjdGVycyB0byBpbmNsdWRlIGluIHF1b3RlLCAsIGNoYXJMaW1pdD86bnVtYmVyIC0gQ3VycmVudGx5IHVudXNlZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgd2F0Y2hTaG91dGJveFJlcGx5KHRhcjogc3RyaW5nLCBidXR0b25zPzogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ3dhdGNoU2hvdXRib3hSZXBseSgnLCB0YXIsIGJ1dHRvbnMsICcpJyk7XG5cbiAgICAgICAgY29uc3QgX2dldFVJRCA9IChub2RlOiBOb2RlKTogc3RyaW5nID0+XG4gICAgICAgICAgICB0aGlzLmV4dHJhY3RGcm9tU2hvdXQobm9kZSwgJ2FbaHJlZl49XCIvdS9cIl0nLCAnaHJlZicpO1xuXG4gICAgICAgIGNvbnN0IF9nZXRSYXdDb2xvciA9IChlbGVtOiBIVE1MU3BhbkVsZW1lbnQpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICAgICAgICAgIGlmIChlbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbS5zdHlsZS5jb2xvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLnN0eWxlLmNvbG9yO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgX2dldE5hbWVDb2xvciA9IChlbGVtOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgICAgICAgICBpZiAoZWxlbSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhd0NvbG9yOiBzdHJpbmcgfCBudWxsID0gX2dldFJhd0NvbG9yKGVsZW0pO1xuICAgICAgICAgICAgICAgIGlmIChyYXdDb2xvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGhleFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZ2I6IHN0cmluZ1tdID0gVXRpbC5icmFja2V0Q29udGVudHMocmF3Q29sb3IpLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlsLnJnYlRvSGV4KFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJnYlsxXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZ2JbMl0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVsZW1lbnQgaXMgbnVsbCFcXG4ke2VsZW19YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IF9tYWtlTmFtZVRhZyA9IChuYW1lOiBzdHJpbmcsIGhleDogc3RyaW5nIHwgbnVsbCwgdWlkOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgdWlkID0gdWlkLm1hdGNoKC9cXGQrL2cpIS5qb2luKCcnKTsgLy8gR2V0IHRoZSBVSUQsIGJ1dCBvbmx5IHRoZSBkaWdpdHNcbiAgICAgICAgICAgIGhleCA9IGhleCA/IGA7JHtoZXh9YCA6ICcnOyAvLyBJZiB0aGVyZSBpcyBhIGhleCB2YWx1ZSwgcHJlcGVuZCBgO2BcbiAgICAgICAgICAgIHJldHVybiBgQFt1bGluaz0ke3VpZH0ke2hleH1dJHtuYW1lfVsvdWxpbmtdYDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBHZXQgdGhlIHJlcGx5IGJveFxuICAgICAgICBjb25zdCByZXBseUJveCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGJveF90ZXh0Jyk7XG4gICAgICAgIC8vIE9ic2VydmUgdGhlIHNob3V0Ym94XG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcihcbiAgICAgICAgICAgIHRhcixcbiAgICAgICAgICAgIChtdXRMaXN0KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2hvdXRib3ggdXBkYXRlcywgcHJvY2VzcyB0aGUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICBtdXRMaXN0LmZvckVhY2goKG11dFJlYykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGNoYW5nZWQgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgbXV0UmVjLmFkZGVkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0obm9kZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBub2RlIGlzIGFkZGVkIGJ5IE1BTSsgZm9yIGdpZnQgYnV0dG9uLCBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIGlmIHRoZSBub2RlIGlzIGEgZGF0ZSBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9ebXBfLy50ZXN0KG5vZGVEYXRhLmdldEF0dHJpYnV0ZSgnaWQnKSEpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURhdGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIG5hbWUgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3V0TmFtZTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICApLnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZl49XCIvdS9cIl0gc3BhbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR3JhYiB0aGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgbmFtZSwgb3IgdGV4dCBjb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZUNvbG9yOiBzdHJpbmcgfCBudWxsID0gX2dldE5hbWVDb2xvcihzaG91dE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9leHRyYWN0IHRoZSB1c2VybmFtZSBmcm9tIG5vZGUgZm9yIHVzZSBpbiByZXBseVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhID4gc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklEOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmXj1cIi91L1wiXScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hyZWYnXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBzcGFuIGVsZW1lbnQgdG8gYmUgYm9keSBvZiBidXR0b24gYWRkZWQgdG8gcGFnZSAtIGJ1dHRvbiB1c2VzIHJlbGF0aXZlIG5vZGUgY29udGV4dCBhdCBjbGljayB0aW1lIHRvIGRvIGNhbGN1bGF0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbHlCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIGEgUmVwbHlTaW1wbGUgcmVxdWVzdCwgdGhlbiBjcmVhdGUgUmVwbHkgU2ltcGxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ1dHRvbnMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBidXR0b24gd2l0aCBvbmNsaWNrIGFjdGlvbiBvZiBzZXR0aW5nIHNiIHRleHQgZmllbGQgdG8gdXNlcm5hbWUgd2l0aCBwb3RlbnRpYWwgY29sb3IgYmxvY2sgd2l0aCBhIGNvbG9uIGFuZCBzcGFjZSB0byByZXBseSwgZm9jdXMgY3Vyc29yIGluIHRleHQgYm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uaW5uZXJIVE1MID0gJzxidXR0b24+XFx1MjkzYTwvYnV0dG9uPic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIHN0eWxlZCBuYW1lIHRhZyB0byB0aGUgcmVwbHkgYm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBub3RoaW5nIHdhcyBpbiB0aGUgcmVwbHkgYm94LCBhZGQgYSBjb2xvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGx5Qm94LnZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7X21ha2VOYW1lVGFnKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICR7X21ha2VOYW1lVGFnKHVzZXJOYW1lLCBuYW1lQ29sb3IsIHVzZXJJRCl9IGA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBhIHJlcGx5UXVvdGUgcmVxdWVzdCwgdGhlbiBjcmVhdGUgcmVwbHkgcXVvdGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChidXR0b25zID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYnV0dG9uIHdpdGggb25jbGljayBhY3Rpb24gb2YgZ2V0dGluZyB0aGF0IGxpbmUncyB0ZXh0LCBzdHJpcHBpbmcgZG93biB0byA2NSBjaGFyIHdpdGggbm8gd29yZCBicmVhaywgdGhlbiBpbnNlcnQgaW50byBTQiB0ZXh0IGZpZWxkLCBmb2N1cyBjdXJzb3IgaW4gdGV4dCBib3hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5pbm5lckhUTUwgPSAnPGJ1dHRvbj5cXHUyOTNkPC9idXR0b24+JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignYnV0dG9uJykhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnF1b3RlU2hvdXQobm9kZSwgNjUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHQgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHF1b3RlIHRvIHJlcGx5IGJveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7X21ha2VOYW1lVGFnKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogXFx1MjAxY1tpXSR7dGV4dH1bL2ldXFx1MjAxZCBgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcmVwbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX06IGA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dpdmUgc3BhbiBhbiBJRCBmb3IgcG90ZW50aWFsIHVzZSBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdtcF9yZXBseUJ1dHRvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pbnNlcnQgYnV0dG9uIHByaW9yIHRvIHVzZXJuYW1lIG9yIGFub3RoZXIgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZShyZXBseUJ1dHRvbiwgbm9kZS5jaGlsZE5vZGVzWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgcXVvdGVTaG91dChzaG91dDogTm9kZSwgbGVuZ3RoOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdGV4dEFycjogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgLy8gR2V0IG51bWJlciBvZiByZXBseSBidXR0b25zIHRvIHJlbW92ZSBmcm9tIHRleHRcbiAgICAgICAgY29uc3QgYnRuQ291bnQgPSBzaG91dC5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50IS5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJy5tcF9yZXBseUJ1dHRvbidcbiAgICAgICAgKS5sZW5ndGg7XG4gICAgICAgIC8vIEdldCB0aGUgdGV4dCBvZiBhbGwgY2hpbGQgbm9kZXNcbiAgICAgICAgc2hvdXQuY2hpbGROb2Rlcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgLyogSWYgdGhlIGNoaWxkIGlzIGEgbm9kZSB3aXRoIGNoaWxkcmVuIChleC4gbm90IHBsYWluIHRleHQpIGNoZWNrIHRvIHNlZSBpZlxuICAgICAgICAgICAgdGhlIGNoaWxkIGlzIGEgbGluay4gSWYgdGhlIGxpbmsgZG9lcyBOT1Qgc3RhcnQgd2l0aCBgL3UvYCAoaW5kaWNhdGluZyBhIHVzZXIpXG4gICAgICAgICAgICB0aGVuIGNoYW5nZSB0aGUgbGluayB0byB0aGUgc3RyaW5nIGBbTGlua11gLlxuICAgICAgICAgICAgSW4gYWxsIG90aGVyIGNhc2VzLCByZXR1cm4gdGhlIGNoaWxkIHRleHQgY29udGVudC4gKi9cbiAgICAgICAgICAgIGlmIChjaGlsZC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVsZW0gPSBVdGlsLm5vZGVUb0VsZW0oY2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjaGlsZEVsZW0uaGFzQXR0cmlidXRlKCdocmVmJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZEVsZW0uZ2V0QXR0cmlidXRlKCdocmVmJykhLmluZGV4T2YoJy91LycpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goJ1tMaW5rXScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHRBcnIucHVzaChjaGlsZC50ZXh0Q29udGVudCEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBNYWtlIGEgc3RyaW5nLCBidXQgdG9zcyBvdXQgdGhlIGZpcnN0IGZldyBub2Rlc1xuICAgICAgICBsZXQgbm9kZVRleHQgPSB0ZXh0QXJyLnNsaWNlKDMgKyBidG5Db3VudCkuam9pbignJyk7XG4gICAgICAgIGlmIChub2RlVGV4dC5pbmRleE9mKCc6JykgPT09IDApIHtcbiAgICAgICAgICAgIG5vZGVUZXh0ID0gbm9kZVRleHQuc3Vic3RyKDIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGhhdmUganVzdCB0aGUgbWVzc2FnZSB0ZXh0LlxuICAgICAgICAvLyBSZW1vdmUgYW55IHF1b3RlcyB0aGF0IG1pZ2h0IGJlIGNvbnRhaW5lZDpcbiAgICAgICAgbm9kZVRleHQgPSBub2RlVGV4dC5yZXBsYWNlKC9cXHV7MjAxY30oLio/KVxcdXsyMDFkfS9ndSwgJycpO1xuICAgICAgICAvLyBUcmltIHRoZSB0ZXh0IHRvIGEgbWF4IGxlbmd0aCBhbmQgYWRkIC4uLiBpZiBzaG9ydGVuZWRcbiAgICAgICAgbGV0IHRyaW1tZWRUZXh0ID0gVXRpbC50cmltU3RyaW5nKG5vZGVUZXh0LnRyaW0oKSwgbGVuZ3RoKTtcbiAgICAgICAgaWYgKHRyaW1tZWRUZXh0ICE9PSBub2RlVGV4dC50cmltKCkpIHtcbiAgICAgICAgICAgIHRyaW1tZWRUZXh0ICs9ICcgW1xcdTIwMjZdJztcbiAgICAgICAgfVxuICAgICAgICAvLyBEb25lIVxuICAgICAgICByZXR1cm4gdHJpbW1lZFRleHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBpbmZvcm1hdGlvbiBmcm9tIHNob3V0c1xuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHNlbGVjdG9yIHN0cmluZ1xuICAgICAqIEBwYXJhbSBnZXQgVGhlIHJlcXVlc3RlZCBpbmZvIChocmVmIG9yIHRleHQpXG4gICAgICogQHJldHVybnMgVGhlIHN0cmluZyB0aGF0IHdhcyBzcGVjaWZpZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGcm9tU2hvdXQoXG4gICAgICAgIHNob3V0OiBOb2RlLFxuICAgICAgICB0YXI6IHN0cmluZyxcbiAgICAgICAgZ2V0OiAnaHJlZicgfCAndGV4dCdcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKTtcblxuICAgICAgICBpZiAoc2hvdXQgIT09IG51bGwgJiYgIW5vZGVEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICB0YXJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoc2hvdXRFbGVtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV4dHJhY3RlZDogc3RyaW5nIHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0ICE9PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLmdldEF0dHJpYnV0ZShnZXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZCA9IHNob3V0RWxlbS50ZXh0Q29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhY3RlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIEF0dHJpYnV0ZSB3YXMgbnVsbCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgRWxlbWVudCB3YXMgbnVsbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgTm9kZSB3YXMgbnVsbCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRoZSBzdHlsZSBvZiBhIHNob3V0IGJhc2VkIG9uIGZpbHRlciBsaXN0c1xuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cbiAgICAgKiBAcGFyYW0gdXNlcnR5cGUgVGhlIHR5cGUgb2YgdXNlcnMgdGhhdCBoYXZlIGJlZW4gZmlsdGVyZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0eWxlU2hvdXQoc2hvdXQ6IE5vZGUsIHVzZXJ0eXBlOiBTaG91dGJveFVzZXJUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNob3V0RWxlbTogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpO1xuICAgICAgICBpZiAodXNlcnR5cGUgPT09ICdwcmlvcml0eScpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVN0eWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgncHJpb3JpdHlTdHlsZV92YWwnKTtcbiAgICAgICAgICAgIGlmIChjdXN0b21TdHlsZSkge1xuICAgICAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gYGhzbGEoJHtjdXN0b21TdHlsZX0pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvdXRFbGVtLnN0eWxlLmJhY2tncm91bmQgPSAnaHNsYSgwLDAlLDUwJSwwLjMpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh1c2VydHlwZSA9PT0gJ211dGUnKSB7XG4gICAgICAgICAgICBzaG91dEVsZW0uY2xhc3NMaXN0LmFkZCgnbXBfbXV0ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgUHJpb3JpdHlVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5VXNlcnMnLFxuICAgICAgICB0YWc6ICdFbXBoYXNpemUgVXNlcnMnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiBzeXN0ZW0sIDI1NDIwLCA3NzYxOCcsXG4gICAgICAgIGRlc2M6XG4gICAgICAgICAgICAnRW1waGFzaXplcyBtZXNzYWdlcyBmcm9tIHRoZSBsaXN0ZWQgdXNlcnMgaW4gdGhlIHNob3V0Ym94LiAoPGVtPlRoaXMgYWNjZXB0cyB1c2VyIElEcyBhbmQgdXNlcm5hbWVzLiBJdCBpcyBub3QgY2FzZSBzZW5zaXRpdmUuPC9lbT4pJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcbiAgICBwcml2YXRlIF9wcmlvcml0eVVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmlvcml0eVVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9wcmlvcml0eVVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEhpZ2hsaWdodGluZyB1c2VycyBpbiB0aGUgc2hvdXRib3guLi5gKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gcHJpb3JpdHkgdXNlcnNcbiAqL1xuY2xhc3MgUHJpb3JpdHlTdHlsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5U3R5bGUnLFxuICAgICAgICB0YWc6ICdFbXBoYXNpcyBTdHlsZScsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMCwgMCUsIDUwJSwgMC4zJyxcbiAgICAgICAgZGVzYzogYENoYW5nZSB0aGUgY29sb3Ivb3BhY2l0eSBvZiB0aGUgaGlnaGxpZ2h0aW5nIHJ1bGUgZm9yIGVtcGhhc2l6ZWQgdXNlcnMnIHBvc3RzLiAoPGVtPlRoaXMgaXMgZm9ybWF0dGVkIGFzIEh1ZSAoMC0zNjApLCBTYXR1cmF0aW9uICgwLTEwMCUpLCBMaWdodG5lc3MgKDAtMTAwJSksIE9wYWNpdHkgKDAtMSk8L2VtPilgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0dGluZyBjdXN0b20gaGlnaGxpZ2h0IGZvciBwcmlvcml0eSB1c2Vycy4uLmApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBkZXNpcmVkIG11dGVkIHVzZXJzXG4gKi9cbmNsYXNzIE11dGVkVXNlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdtdXRlZFVzZXJzJyxcbiAgICAgICAgdGFnOiAnTXV0ZSB1c2VycycsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEyMzQsIGdhcmRlbnNoYWRlJyxcbiAgICAgICAgZGVzYzogYE9ic2N1cmVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3ggdW50aWwgaG92ZXJlZC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XG4gICAgcHJpdmF0ZSBfbXV0ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcbiAgICBwcml2YXRlIF91c2VyVHlwZTogU2hvdXRib3hVc2VyVHlwZSA9ICdtdXRlJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9tdXRlZFVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9tdXRlZFVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE9ic2N1cmluZyBtdXRlZCB1c2Vycy4uLmApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIEdpZnQgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0IFRyaXBsZSBkb3QgbWVudVxuICovXG5jbGFzcyBHaWZ0QnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdnaWZ0QnV0dG9uJyxcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIEdpZnQgYnV0dG9uIGluIFNob3V0Ym94IGRvdC1tZW51YCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSW5pdGlhbGl6ZWQgR2lmdCBCdXR0b24uYCk7XG4gICAgICAgIGNvbnN0IHNiZkRpdiA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JmJykhO1xuICAgICAgICBjb25zdCBzYmZEaXZDaGlsZCA9IHNiZkRpdiEuZmlyc3RDaGlsZDtcblxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbmV2ZXIgc29tZXRoaW5nIGlzIGNsaWNrZWQgaW4gdGhlIHNiZiBkaXZcbiAgICAgICAgc2JmRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIC8vcHVsbCB0aGUgZXZlbnQgdGFyZ2V0IGludG8gYW4gSFRNTCBFbGVtZW50XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIC8vYWRkIHRoZSBUcmlwbGUgRG90IE1lbnUgYXMgYW4gZWxlbWVudFxuICAgICAgICAgICAgY29uc3Qgc2JNZW51RWxlbSA9IHRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKTtcbiAgICAgICAgICAgIC8vZmluZCB0aGUgbWVzc2FnZSBkaXZcbiAgICAgICAgICAgIGNvbnN0IHNiTWVudVBhcmVudCA9IHRhcmdldCEuY2xvc2VzdChgZGl2YCk7XG4gICAgICAgICAgICAvL2dldCB0aGUgZnVsbCB0ZXh0IG9mIHRoZSBtZXNzYWdlIGRpdlxuICAgICAgICAgICAgbGV0IGdpZnRNZXNzYWdlID0gc2JNZW51UGFyZW50IS5pbm5lclRleHQ7XG4gICAgICAgICAgICAvL2Zvcm1hdCBtZXNzYWdlIHdpdGggc3RhbmRhcmQgdGV4dCArIG1lc3NhZ2UgY29udGVudHMgKyBzZXJ2ZXIgdGltZSBvZiB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgZ2lmdE1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBTZW50IG9uIFNob3V0Ym94IG1lc3NhZ2U6IFwiYCArXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKGdpZnRNZXNzYWdlLmluZGV4T2YoJzogJykgKyAyKSArXG4gICAgICAgICAgICAgICAgYFwiIGF0IGAgK1xuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZygwLCA4KTtcbiAgICAgICAgICAgIC8vaWYgdGhlIHRhcmdldCBvZiB0aGUgY2xpY2sgaXMgbm90IHRoZSBUcmlwbGUgRG90IE1lbnUgT1JcbiAgICAgICAgICAgIC8vaWYgbWVudSBpcyBvbmUgb2YgeW91ciBvd24gY29tbWVudHMgKG9ubHkgd29ya3MgZm9yIGZpcnN0IDEwIG1pbnV0ZXMgb2YgY29tbWVudCBiZWluZyBzZW50KVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0YXJnZXQhLmNsb3Nlc3QoJy5zYl9tZW51JykgfHxcbiAgICAgICAgICAgICAgICBzYk1lbnVFbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZWUnKSEgPT09ICcxJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9nZXQgdGhlIE1lbnUgYWZ0ZXIgaXQgcG9wcyB1cFxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIEdpZnQgQnV0dG9uLi4uYCk7XG4gICAgICAgICAgICBjb25zdCBwb3B1cE1lbnU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJyk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCg1KTtcbiAgICAgICAgICAgIH0gd2hpbGUgKCFwb3B1cE1lbnUhLmhhc0NoaWxkTm9kZXMoKSk7XG4gICAgICAgICAgICAvL2dldCB0aGUgdXNlciBkZXRhaWxzIGZyb20gdGhlIHBvcHVwIG1lbnUgZGV0YWlsc1xuICAgICAgICAgICAgY29uc3QgcG9wdXBVc2VyOiBIVE1MRWxlbWVudCA9IFV0aWwubm9kZVRvRWxlbShwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgLy9tYWtlIHVzZXJuYW1lIGVxdWFsIHRoZSBkYXRhLXVpZCwgZm9yY2Ugbm90IG51bGxcbiAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBTdHJpbmcgPSBwb3B1cFVzZXIhLmdldEF0dHJpYnV0ZSgnZGF0YS11aWQnKSE7XG4gICAgICAgICAgICAvL2dldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBnaWZ0cyBzZXQgaW4gcHJlZmVyZW5jZXMgZm9yIHVzZXIgcGFnZVxuICAgICAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XG4gICAgICAgICAgICAvL2lmIHRoZXkgZGlkIG5vdCBzZXQgYSB2YWx1ZSBpbiBwcmVmZXJlbmNlcywgc2V0IHRvIDEwMFxuICAgICAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAwIHx8XG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAwJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgSFRNTCBkb2N1bWVudCB0aGF0IGhvbGRzIHRoZSBidXR0b24gYW5kIHZhbHVlIHRleHRcbiAgICAgICAgICAgIGNvbnN0IGdpZnRCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGdpZnRCdXR0b24uc2V0QXR0cmlidXRlKCdpZCcsICdnaWZ0QnV0dG9uJyk7XG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgYXMgd2VsbCBhcyBhIHRleHQgZWxlbWVudCBmb3IgdmFsdWUgb2YgZ2lmdC4gUG9wdWxhdGUgd2l0aCB2YWx1ZSBmcm9tIHNldHRpbmdzXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLmlubmVySFRNTCA9IGA8YnV0dG9uPkdpZnQ6IDwvYnV0dG9uPjxzcGFuPiZuYnNwOzwvc3Bhbj48aW5wdXQgdHlwZT1cInRleHRcIiBzaXplPVwiM1wiIGlkPVwibXBfZ2lmdFZhbHVlXCIgdGl0bGU9XCJWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDBcIiB2YWx1ZT1cIiR7Z2lmdFZhbHVlU2V0dGluZ31cIj5gO1xuICAgICAgICAgICAgLy9hZGQgZ2lmdCBlbGVtZW50IHdpdGggYnV0dG9uIGFuZCB0ZXh0IHRvIHRoZSBtZW51XG4gICAgICAgICAgICBwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0uYXBwZW5kQ2hpbGQoZ2lmdEJ1dHRvbik7XG4gICAgICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbiBnaWZ0IGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL3B1bGwgd2hhdGV2ZXIgdGhlIGZpbmFsIHZhbHVlIG9mIHRoZSB0ZXh0IGJveCBlcXVhbHNcbiAgICAgICAgICAgICAgICBjb25zdCBnaWZ0RmluYWxBbW91bnQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XG4gICAgICAgICAgICAgICAgLy9iZWdpbiBzZXR0aW5nIHVwIHRoZSBHRVQgcmVxdWVzdCB0byBNQU0gSlNPTlxuICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRIVFRQID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJlc3VsdHMgd2l0aCB0aGUgYW1vdW50IGVudGVyZWQgYnkgdXNlciBwbHVzIHRoZSB1c2VybmFtZSBmb3VuZCBvbiB0aGUgbWVudSBzZWxlY3RlZFxuICAgICAgICAgICAgICAgIC8vYWRkZWQgbWVzc2FnZSBjb250ZW50cyBlbmNvZGVkIHRvIHByZXZlbnQgdW5pbnRlbmRlZCBjaGFyYWN0ZXJzIGZyb20gYnJlYWtpbmcgSlNPTiBVUkxcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0RmluYWxBbW91bnR9JmdpZnRUbz0ke3VzZXJOYW1lfSZtZXNzYWdlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgICAgICBnaWZ0TWVzc2FnZVxuICAgICAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgICAgIGdpZnRIVFRQLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdEhUVFAucmVhZHlTdGF0ZSA9PT0gNCAmJiBnaWZ0SFRUUC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZ2lmdEhUVFAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGxpbmUgaW4gU0IgdGhhdCBzaG93cyBnaWZ0IHdhcyBzdWNjZXNzZnVsIHRvIGFja25vd2xlZGdlIGdpZnQgd29ya2VkL2ZhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0U3RhdHVzRWxlbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2JmRGl2Q2hpbGQhLmFwcGVuZENoaWxkKG5ld0Rpdik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBnaWZ0IHN1Y2NlZWRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NNc2cgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BvaW50cyBHaWZ0IFN1Y2Nlc3NmdWw6IFZhbHVlOiAnICsgZ2lmdEZpbmFsQW1vdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuYXBwZW5kQ2hpbGQoc3VjY2Vzc01zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoJ21wX3N1Y2Nlc3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkTXNnID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBGYWlsZWQ6IEVycm9yOiAnICsganNvbi5lcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKGZhaWxlZE1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoJ21wX2ZhaWwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNiZkRpdi5zY3JvbGxUb3AgPSBzYmZEaXYuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgc2JmRGl2LnNjcm9sbFRvcCA9IHNiZkRpdi5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLnNlbmQoKTtcbiAgICAgICAgICAgICAgICAvL3JldHVybiB0byBtYWluIFNCIHdpbmRvdyBhZnRlciBnaWZ0IGlzIGNsaWNrZWQgLSB0aGVzZSBhcmUgdHdvIHN0ZXBzIHRha2VuIGJ5IE1BTSB3aGVuIGNsaWNraW5nIG91dCBvZiBNZW51XG4gICAgICAgICAgICAgICAgc2JmRGl2XG4gICAgICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzYl9jbGlja2VkX3JvdycpWzBdIVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50QnlJZCgnc2JNZW51TWFpbicpIVxuICAgICAgICAgICAgICAgICAgICAuc2V0QXR0cmlidXRlKCdjbGFzcycsICdzYkJvdHRvbSBoaWRlTWUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpIS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XG4gICAgICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcbiAgICAgICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEdpZnQgQnV0dG9uIGFkZGVkIWApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBbGxvd3MgUmVwbHkgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0XG4gKi9cbmNsYXNzIFJlcGx5U2ltcGxlIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdyZXBseVNpbXBsZScsXG4gICAgICAgIC8vdGFnOiBcIlJlcGx5XCIsXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBSZXBseSBidXR0b24gaW4gU2hvdXRib3g6ICYjMTA1NTQ7YCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcbiAgICBwcml2YXRlIF9yZXBseVNpbXBsZTogbnVtYmVyID0gMTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveFJlcGx5KHRoaXMuX3RhciwgdGhpcy5fcmVwbHlTaW1wbGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUmVwbHkgQnV0dG9uLi4uYCk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIFJlcGx5IFdpdGggUXVvdGUgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0XG4gKi9cbmNsYXNzIFJlcGx5UXVvdGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3JlcGx5UXVvdGUnLFxuICAgICAgICAvL3RhZzogXCJSZXBseSBXaXRoIFF1b3RlXCIsXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBSZXBseSB3aXRoIFF1b3RlIGJ1dHRvbiBpbiBTaG91dGJveDogJiMxMDU1NztgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xuICAgIHByaXZhdGUgX3JlcGx5UXVvdGU6IG51bWJlciA9IDI7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3hSZXBseSh0aGlzLl90YXIsIHRoaXMuX3JlcGx5UXVvdGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUmVwbHkgd2l0aCBRdW90ZSBCdXR0b24uLi5gKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGZlYXR1cmUgZm9yIGJ1aWxkaW5nIGEgbGlicmFyeSBvZiBxdWljayBzaG91dCBpdGVtcyB0aGF0IGNhbiBhY3QgYXMgYSBjb3B5L3Bhc3RlIHJlcGxhY2VtZW50LlxuICovXG5jbGFzcyBRdWlja1Nob3V0IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdxdWlja1Nob3V0JyxcbiAgICAgICAgZGVzYzogYENyZWF0ZSBmZWF0dXJlIGJlbG93IHNob3V0Ym94IHRvIHN0b3JlIHByZS1zZXQgbWVzc2FnZXMuYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBRdWljayBTaG91dCBCdXR0b25zLi4uYCk7XG4gICAgICAgIC8vZ2V0IHRoZSBtYWluIHNob3V0Ym94IGlucHV0IGZpZWxkXG4gICAgICAgIGNvbnN0IHJlcGx5Qm94ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYm94X3RleHQnKTtcbiAgICAgICAgLy9lbXB0eSBKU09OIHdhcyBnaXZpbmcgbWUgaXNzdWVzLCBzbyBkZWNpZGVkIHRvIGp1c3QgbWFrZSBhbiBpbnRybyBmb3Igd2hlbiB0aGUgR00gdmFyaWFibGUgaXMgZW1wdHlcbiAgICAgICAgbGV0IGpzb25MaXN0ID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgIGB7IFwiSW50cm9cIjpcIldlbGNvbWUgdG8gUXVpY2tTaG91dCBNQU0rZXIhIEhlcmUgeW91IGNhbiBjcmVhdGUgcHJlc2V0IFNob3V0IG1lc3NhZ2VzIGZvciBxdWljayByZXNwb25zZXMgYW5kIGtub3dsZWRnZSBzaGFyaW5nLiAnQ2xlYXInIGNsZWFycyB0aGUgZW50cnkgdG8gc3RhcnQgc2VsZWN0aW9uIHByb2Nlc3Mgb3Zlci4gJ1NlbGVjdCcgdGFrZXMgd2hhdGV2ZXIgUXVpY2tTaG91dCBpcyBpbiB0aGUgVGV4dEFyZWEgYW5kIHB1dHMgaW4geW91ciBTaG91dCByZXNwb25zZSBhcmVhLiAnU2F2ZScgd2lsbCBzdG9yZSB0aGUgU2VsZWN0aW9uIE5hbWUgYW5kIFRleHQgQXJlYSBDb21ibyBmb3IgZnV0dXJlIHVzZSBhcyBhIFF1aWNrU2hvdXQsIGFuZCBoYXMgY29sb3IgaW5kaWNhdG9ycy4gR3JlZW4gPSBzYXZlZCBhcy1pcy4gWWVsbG93ID0gUXVpY2tTaG91dCBOYW1lIGV4aXN0cyBhbmQgaXMgc2F2ZWQsIGJ1dCBjb250ZW50IGRvZXMgbm90IG1hdGNoIHdoYXQgaXMgc3RvcmVkLiBPcmFuZ2UgPSBubyBlbnRyeSBtYXRjaGluZyB0aGF0IG5hbWUsIG5vdCBzYXZlZC4gJ0RlbGV0ZScgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgdGhhdCBlbnRyeSBmcm9tIHlvdXIgc3RvcmVkIFF1aWNrU2hvdXRzIChidXR0b24gb25seSBzaG93cyB3aGVuIGV4aXN0cyBpbiBzdG9yYWdlKS4gRm9yIG5ldyBlbnRyaWVzIGhhdmUgeW91ciBRdWlja1Nob3V0IE5hbWUgdHlwZWQgaW4gQkVGT1JFIHlvdSBjcmFmdCB5b3VyIHRleHQgb3IgcmlzayBpdCBiZWluZyBvdmVyd3JpdHRlbiBieSBzb21ldGhpbmcgdGhhdCBleGlzdHMgYXMgeW91IHR5cGUgaXQuIFRoYW5rcyBmb3IgdXNpbmcgTUFNKyFcIiB9YFxuICAgICAgICApO1xuICAgICAgICAvL2dldCBTaG91dGJveCBESVZcbiAgICAgICAgY29uc3Qgc2hvdXRCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnBTaG91dCcpO1xuICAgICAgICAvL2dldCB0aGUgZm9vdGVyIHdoZXJlIHdlIHdpbGwgaW5zZXJ0IG91ciBmZWF0dXJlXG4gICAgICAgIGNvbnN0IHNob3V0Rm9vdCA9IDxIVE1MRWxlbWVudD5zaG91dEJveCEucXVlcnlTZWxlY3RvcignLmJsb2NrRm9vdCcpO1xuICAgICAgICAvL2dpdmUgaXQgYW4gSUQgYW5kIHNldCB0aGUgc2l6ZVxuICAgICAgICBzaG91dEZvb3QhLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfYmxvY2tGb290Jyk7XG4gICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzIuNWVtJztcbiAgICAgICAgLy9jcmVhdGUgYSBuZXcgZGl2ZSB0byBob2xkIG91ciBjb21ib0JveCBhbmQgYnV0dG9ucyBhbmQgc2V0IHRoZSBzdHlsZSBmb3IgZm9ybWF0dGluZ1xuICAgICAgICBjb25zdCBjb21ib0JveERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5mbG9hdCA9ICdsZWZ0JztcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnLjVlbSc7XG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpblRvcCA9ICcuNWVtJztcbiAgICAgICAgLy9jcmVhdGUgdGhlIGxhYmVsIHRleHQgZWxlbWVudCBhbmQgYWRkIHRoZSB0ZXh0IGFuZCBhdHRyaWJ1dGVzIGZvciBJRFxuICAgICAgICBjb25zdCBjb21ib0JveExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICdxdWlja1Nob3V0RGF0YScpO1xuICAgICAgICBjb21ib0JveExhYmVsLmlubmVyVGV4dCA9ICdDaG9vc2UgYSBRdWlja1Nob3V0JztcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94TGFiZWwnKTtcbiAgICAgICAgLy9jcmVhdGUgdGhlIGlucHV0IGZpZWxkIHRvIGxpbmsgdG8gZGF0YWxpc3QgYW5kIGZvcm1hdCBzdHlsZVxuICAgICAgICBjb25zdCBjb21ib0JveElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zdHlsZS5tYXJnaW5MZWZ0ID0gJy41ZW0nO1xuICAgICAgICBjb21ib0JveElucHV0LnNldEF0dHJpYnV0ZSgnbGlzdCcsICdtcF9jb21ib0JveExpc3QnKTtcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94SW5wdXQnKTtcbiAgICAgICAgLy9jcmVhdGUgYSBkYXRhbGlzdCB0byBzdG9yZSBvdXIgcXVpY2tzaG91dHNcbiAgICAgICAgY29uc3QgY29tYm9Cb3hMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0YWxpc3QnKTtcbiAgICAgICAgY29tYm9Cb3hMaXN0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XG4gICAgICAgIC8vaWYgdGhlIEdNIHZhcmlhYmxlIGV4aXN0c1xuICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnKSkge1xuICAgICAgICAgICAgLy9vdmVyd3JpdGUganNvbkxpc3QgdmFyaWFibGUgd2l0aCBwYXJzZWQgZGF0YVxuICAgICAgICAgICAganNvbkxpc3QgPSBKU09OLnBhcnNlKEdNX2dldFZhbHVlKCdtcF9xdWlja1Nob3V0JykpO1xuICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaXRlbVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IE9wdGlvbiBlbGVtZW50IGFuZCBhZGQgb3VyIGRhdGEgZm9yIGRpc3BsYXkgdG8gdXNlclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XG4gICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9pZiBubyBHTSB2YXJpYWJsZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jcmVhdGUgdmFyaWFibGUgd2l0aCBvdXQgSW50cm8gZGF0YVxuICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xuICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaXRlbVxuICAgICAgICAgICAgLy8gVE9ETzogcHJvYmFibHkgY2FuIGdldCByaWQgb2YgdGhlIGZvckVhY2ggYW5kIGp1c3QgZG8gc2luZ2xlIGV4ZWN1dGlvbiBzaW5jZSB3ZSBrbm93IHRoaXMgaXMgSW50cm8gb25seVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XG4gICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9hcHBlbmQgdGhlIGFib3ZlIGVsZW1lbnRzIHRvIG91ciBESVYgZm9yIHRoZSBjb21ibyBib3hcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hMYWJlbCk7XG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94SW5wdXQpO1xuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveExpc3QpO1xuICAgICAgICAvL2NyZWF0ZSB0aGUgY2xlYXIgYnV0dG9uIGFuZCBhZGQgc3R5bGVcbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY2xlYXJCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xuICAgICAgICBjbGVhckJ1dHRvbi5pbm5lckhUTUwgPSAnQ2xlYXInO1xuICAgICAgICAvL2NyZWF0ZSBkZWxldGUgYnV0dG9uLCBhZGQgc3R5bGUsIGFuZCB0aGVuIGhpZGUgaXQgZm9yIGxhdGVyIHVzZVxuICAgICAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnNmVtJztcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnUmVkJztcbiAgICAgICAgZGVsZXRlQnV0dG9uLmlubmVySFRNTCA9ICdERUxFVEUnO1xuICAgICAgICAvL2NyZWF0ZSBzZWxlY3QgYnV0dG9uIGFuZCBzdHlsZSBpdFxuICAgICAgICBjb25zdCBzZWxlY3RCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgc2VsZWN0QnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcbiAgICAgICAgc2VsZWN0QnV0dG9uLmlubmVySFRNTCA9ICdcXHUyMTkxIFNlbGVjdCc7XG4gICAgICAgIC8vY3JlYXRlIHNhdmUgYnV0dG9uIGFuZCBzdHlsZSBpdFxuICAgICAgICBjb25zdCBzYXZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHNhdmVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xuICAgICAgICBzYXZlQnV0dG9uLmlubmVySFRNTCA9ICdTYXZlJztcbiAgICAgICAgLy9hZGQgYWxsIDQgYnV0dG9ucyB0byB0aGUgY29tYm9Cb3ggRElWXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNsZWFyQnV0dG9uKTtcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoc2VsZWN0QnV0dG9uKTtcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoc2F2ZUJ1dHRvbik7XG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGRlbGV0ZUJ1dHRvbik7XG4gICAgICAgIC8vY3JlYXRlIG91ciB0ZXh0IGFyZWEgYW5kIHN0eWxlIGl0LCB0aGVuIGhpZGUgaXRcbiAgICAgICAgY29uc3QgcXVpY2tTaG91dFRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5oZWlnaHQgPSAnNTAlJztcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUubWFyZ2luID0gJzFlbSc7XG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLndpZHRoID0gJzk3JSc7XG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LmlkID0gJ21wX3F1aWNrU2hvdXRUZXh0JztcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgICAvL2V4ZWN1dGVzIHdoZW4gY2xpY2tpbmcgc2VsZWN0IGJ1dHRvblxuICAgICAgICBzZWxlY3RCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBzb21ldGhpbmcgaW5zaWRlIG9mIHRoZSBxdWlja3Nob3V0IGFyZWFcbiAgICAgICAgICAgICAgICBpZiAocXVpY2tTaG91dFRleHQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9wdXQgdGhlIHRleHQgaW4gdGhlIG1haW4gc2l0ZSByZXBseSBmaWVsZCBhbmQgZm9jdXMgb24gaXRcbiAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBxdWlja1Nob3V0VGV4dC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICAvL2NyZWF0ZSBhIHF1aWNrU2hvdXQgZGVsZXRlIGJ1dHRvblxuICAgICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCB0aGUgbGFzdCBxdWlja1Nob3V0XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGpzb25MaXN0KS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlbnRyeSBmcm9tIHRoZSBKU09OIGFuZCB1cGRhdGUgdGhlIEdNIHZhcmlhYmxlIHdpdGggbmV3IGpzb24gbGlzdFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV07XG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gZm9yIG5ldyB1bnNhdmVkIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIG5vdCBhIHNhdmVkIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB0aGUgb3B0aW9ucyBmcm9tIGRhdGFsaXN0IHRvIHJlc2V0IHdpdGggbmV3bHkgY3JlYXRlZCBqc29uTGlzdFxuICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vZm9yIGVhY2ggaXRlbSBpbiBuZXcganNvbkxpc3RcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9uZXcgb3B0aW9uIGVsZW1lbnQgdG8gYWRkIHRvIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0aGUgY3VycmVudCBrZXkgdmFsdWUgdG8gdGhlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgZWxlbWVudCB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGxhc3QgaXRlbSBpbiB0aGUganNvbmxpc3RcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBpdGVtIGZyb20ganNvbkxpc3RcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgv4LKgL2csICfgsqAnKV07XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGVudGlyZSB2YXJpYWJsZSBzbyBpdHMgbm90IGVtcHR5IEdNIHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgICAgIEdNX2RlbGV0ZVZhbHVlKCdtcF9xdWlja1Nob3V0Jyk7XG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICAvL2NyZWF0ZSBldmVudCBvbiBzYXZlIGJ1dHRvbiB0byBzYXZlIHF1aWNrc2hvdXRcbiAgICAgICAgc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIGRhdGEgaW4gdGhlIGtleSBhbmQgdmFsdWUgR1VJIGZpZWxkcywgcHJvY2VlZFxuICAgICAgICAgICAgICAgIGlmIChxdWlja1Nob3V0VGV4dC52YWx1ZSAmJiBjb21ib0JveElucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vd2FzIGhhdmluZyBpc3N1ZSB3aXRoIGV2YWwgcHJvY2Vzc2luZyB0aGUgLnJlcGxhY2UgZGF0YSBzbyBtYWRlIGEgdmFyaWFibGUgdG8gaW50YWtlIGl0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VkVGV4dCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vZnVuIHdheSB0byBkeW5hbWljYWxseSBjcmVhdGUgc3RhdGVtZW50cyAtIHRoaXMgdGFrZXMgd2hhdGV2ZXIgaXMgaW4gbGlzdCBmaWVsZCB0byBjcmVhdGUgYSBrZXkgd2l0aCB0aGF0IHRleHQgYW5kIHRoZSB2YWx1ZSBmcm9tIHRoZSB0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgICBldmFsKFxuICAgICAgICAgICAgICAgICAgICAgICAgYGpzb25MaXN0LmAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VkVGV4dCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYD0gXCJgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQocXVpY2tTaG91dFRleHQudmFsdWUpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgXCI7YFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAvL292ZXJ3cml0ZSBvciBjcmVhdGUgdGhlIEdNIHZhcmlhYmxlIHdpdGggbmV3IGpzb25MaXN0XG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSBzYXZlIGJ1dHRvbiB0byBncmVlbiBub3cgdGhhdCBpdHMgc2F2ZWQgYXMtaXNcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vc2hvdyBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBhIHNhdmVkIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGV4aXN0aW5nIGRhdGFsaXN0IGVsZW1lbnRzIHRvIHJlYnVpbGQgd2l0aCBuZXcganNvbmxpc3RcbiAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpbiB0aGUganNvbmxpc3RcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgbmV3IG9wdGlvbiBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQga2V5IG5hbWUgdG8gdGhlIG9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE86IHRoaXMgbWF5IG9yIG1heSBub3QgYmUgbmVjZXNzYXJ5LCBidXQgd2FzIGhhdmluZyBpc3N1ZXMgd2l0aCB0aGUgdW5pcXVlIHN5bWJvbCBzdGlsbCByYW5kb21seSBzaG93aW5nIHVwIGFmdGVyIHNhdmVzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGNvbWJvQm94T3B0aW9uLnZhbHVlLnJlcGxhY2UoL+CyoC9nLCAnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdG8gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbWJvQm94T3B0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgLy9hZGQgZXZlbnQgZm9yIGNsZWFyIGJ1dHRvbiB0byByZXNldCB0aGUgZGF0YWxpc3RcbiAgICAgICAgY2xlYXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jbGVhciB0aGUgaW5wdXQgZmllbGQgYW5kIHRleHRhcmVhIGZpZWxkXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hJbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICAvL05leHQgdHdvIGlucHV0IGZ1bmN0aW9ucyBhcmUgbWVhdCBhbmQgcG90YXRvZXMgb2YgdGhlIGxvZ2ljIGZvciB1c2VyIGZ1bmN0aW9uYWxpdHlcblxuICAgICAgICAvL3doZW5ldmVyIHNvbWV0aGluZyBpcyB0eXBlZCBvciBjaGFuZ2VkIHdoaXRoaW4gdGhlIGlucHV0IGZpZWxkXG4gICAgICAgIGNvbWJvQm94SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdpbnB1dCcsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9pZiBpbnB1dCBpcyBibGFua1xuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSB0ZXh0YXJlYSBpcyBhbHNvIGJsYW5rIG1pbmltaXplIHJlYWwgZXN0YXRlXG4gICAgICAgICAgICAgICAgICAgIGlmICghcXVpY2tTaG91dFRleHQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgdGV4dCBhcmVhXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9zaHJpbmsgdGhlIGZvb3RlclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMi41ZW0nO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gdG8gZGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgc29tZXRoaW5nIGlzIHN0aWxsIGluIHRoZSB0ZXh0YXJlYSB3ZSBuZWVkIHRvIGluZGljYXRlIHRoYXQgdW5zYXZlZCBhbmQgdW5uYW1lZCBkYXRhIGlzIHRoZXJlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3N0eWxlIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkIGlzIG9yZ2FuZ2Ugc2F2ZSBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL2VpdGhlciB3YXksIGhpZGUgdGhlIGRlbGV0ZSBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIGlucHV0IGZpZWxkIGhhcyBhbnkgdGV4dCBpbiBpdFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgdGV4dCBhcmVhIGZvciBpbnB1dFxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vZXhwYW5kIHRoZSBmb290ZXIgdG8gYWNjb21vZGF0ZSBhbGwgZmVhdHVyZSBhc3BlY3RzXG4gICAgICAgICAgICAgICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzExZW0nO1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHdoYXQgaXMgaW4gdGhlIGlucHV0IGZpZWxkIGlzIGEgc2F2ZWQgZW50cnkga2V5XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uTGlzdFtpbnB1dFZhbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBjYW4gYmUgYSBzdWNreSBsaW5lIG9mIGNvZGUgYmVjYXVzZSBpdCBjYW4gd2lwZSBvdXQgdW5zYXZlZCBkYXRhLCBidXQgaSBjYW5ub3QgdGhpbmsgb2YgYmV0dGVyIHdheVxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXBsYWNlIHRoZSB0ZXh0IGFyZWEgY29udGVudHMgd2l0aCB3aGF0IHRoZSB2YWx1ZSBpcyBpbiB0aGUgbWF0Y2hlZCBwYWlyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWlja1Nob3V0VGV4dC52YWx1ZSA9IGpzb25MaXN0W0pTT04ucGFyc2UoaW5wdXRWYWwpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGlzIG5vdyBleGFjdCBtYXRjaCB0byBzYXZlZCBlbnRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiB0byBzaG93IGl0cyBhIHNhdmVkIGNvbWJvXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgbm90IGEgcmVnaXN0ZXJlZCBrZXkgbmFtZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBiZSBhbiB1bnNhdmVkIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBjYW5ub3QgYmUgc2F2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgLy93aGVuZXZlciBzb21ldGhpbmcgaXMgdHlwZWQgb3IgZGVsZXRlZCBvdXQgb2YgdGV4dGFyZWFcbiAgICAgICAgcXVpY2tTaG91dFRleHQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdpbnB1dCcsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRWYWwgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xuXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaXMgYmxhbmtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9pZiBpbnB1dCBmaWVsZCBoYXMgdGV4dCBpbiBpdFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBqc29uTGlzdFtpbnB1dFZhbF0gJiZcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgIT09IGRlY29kZVVSSUNvbXBvbmVudChqc29uTGlzdFtpbnB1dFZhbF0pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBhcyB5ZWxsb3cgZm9yIGVkaXR0ZWRcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnWWVsbG93JztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBhIG1hdGNoIGFuZCB0aGUgZGF0YSBpcyBhIG1hdGNoIHRoZW4gd2UgaGF2ZSBhIDEwMCUgc2F2ZWQgZW50cnkgYW5kIGNhbiBwdXQgZXZlcnl0aGluZyBiYWNrIHRvIHNhdmVkXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbaW5wdXRWYWxdICYmXG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID09PSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gZm9yIHNhdmVkXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBrZXkgaXMgbm90IGZvdW5kIGluIHRoZSBzYXZlZCBsaXN0LCBvcmFuZ2UgZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFqc29uTGlzdFtpbnB1dFZhbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgICAgICAvL2FkZCB0aGUgY29tYm9ib3ggYW5kIHRleHQgYXJlYSBlbGVtZW50cyB0byB0aGUgZm9vdGVyXG4gICAgICAgIHNob3V0Rm9vdC5hcHBlbmRDaGlsZChjb21ib0JveERpdik7XG4gICAgICAgIHNob3V0Rm9vdC5hcHBlbmRDaGlsZChxdWlja1Nob3V0VGV4dCk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cblxuLyoqXG4gKiAqIEF1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLlxuICovXG5jbGFzcyBUb3JHaWZ0RGVmYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICd0b3JHaWZ0RGVmYXVsdCcsXG4gICAgICAgIHRhZzogJ0RlZmF1bHQgR2lmdCcsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDUwMDAsIG1heCcsXG4gICAgICAgIGRlc2M6XG4gICAgICAgICAgICAnQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuICg8ZW0+T3IgdGhlIG1heCBhbGxvd2FibGUgdmFsdWUsIHdoaWNoZXZlciBpcyBsb3dlcjwvZW0+KScsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdGhhbmtzQXJlYSBpbnB1dFtuYW1lPXBvaW50c10nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgbmV3IFNoYXJlZCgpXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcbiAgICAgICAgICAgIC50aGVuKChwb2ludHMpID0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0IHRoZSBkZWZhdWx0IGdpZnQgYW1vdW50IHRvICR7cG9pbnRzfWApXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gR29vZHJlYWRzXG4gKi9cbmNsYXNzIEdvb2RyZWFkc0J1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvbicsXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucycsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbyBbY2xhc3NePWNhdF0nKTtcbiAgICAgICAgICAgICAgICBpZiAoY2F0ICYmIENoZWNrLmlzQm9va0NhdChwYXJzZUludChjYXQuY2xhc3NOYW1lLnN1YnN0cmluZygzKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBOb3QgYSBib29rIGNhdGVnb3J5OyBza2lwcGluZyBHb29kcmVhZHMgYnV0dG9ucycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJyk7XG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjU2VyaWVzIGEnKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcbiAgICAgICAgdGhpcy5fc2hhcmUuZ29vZHJlYWRzQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBBdWRpYmxlXG4gKi9cbmNsYXNzIEF1ZGlibGVCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdhdWRpYmxlQnV0dG9uJyxcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLUF1ZGlibGUgYnV0dG9ucycsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbyBbY2xhc3NePWNhdF0nKTtcbiAgICAgICAgICAgICAgICBpZiAoY2F0ICYmIENoZWNrLmlzQm9va0NhdChwYXJzZUludChjYXQuY2xhc3NOYW1lLnN1YnN0cmluZygzKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBOb3QgYSBib29rIGNhdGVnb3J5OyBza2lwcGluZyBBdWRpYmxlIGJ1dHRvbnMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSdcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XG5cbiAgICAgICAgbGV0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuXG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cnKSkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9zZ1JvdycpO1xuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXG4gICAgICAgIHRoaXMuX3NoYXJlLmF1ZGlibGVCdXR0b25zKGJvb2tEYXRhLCBhdXRob3JEYXRhLCBzZXJpZXNEYXRhLCB0YXJnZXQpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICogQWRkcyB2YXJpb3VzIGxpbmtzIHRvIFN0b3J5R3JhcGhcbiAqL1xuY2xhc3MgU3RvcnlHcmFwaEJ1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3N0b3J5R3JhcGhCdXR0b24nLFxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzdWJtaXRJbmZvJztcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmVhdHVyZSBzaG91bGQgb25seSBydW4gb24gYm9vayBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xuICAgICAgICAgICAgICAgIGlmIChjYXQgJiYgQ2hlY2suaXNCb29rQ2F0KHBhcnNlSW50KGNhdC5jbGFzc05hbWUuc3Vic3RyaW5nKDMpKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vdCBhIGJvb2sgY2F0ZWdvcnk7IHNraXBwaW5nIFN0cm95R3JhcGggYnV0dG9ucycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJyk7XG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjU2VyaWVzIGEnKTtcblxuICAgICAgICBsZXQgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXG4gICAgICAgIHRoaXMuX3NoYXJlLnN0b3J5R3JhcGhCdXR0b25zKGJvb2tEYXRhLCBhdXRob3JEYXRhLCBzZXJpZXNEYXRhLCB0YXJnZXQpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICogR2VuZXJhdGVzIGEgZmllbGQgZm9yIFwiQ3VycmVudGx5IFJlYWRpbmdcIiBiYmNvZGVcbiAqL1xuY2xhc3MgQ3VycmVudGx5UmVhZGluZyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0aXRsZTogJ2N1cnJlbnRseVJlYWRpbmcnLFxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGdlbmVyYXRlIGEgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGZvcnVtIHNuaXBwZXRgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIEN1cnJlbnRseSBSZWFkaW5nIHNlY3Rpb24uLi4nKTtcbiAgICAgICAgLy8gR2V0IHRoZSByZXF1aXJlZCBpbmZvcm1hdGlvblxuICAgICAgICBjb25zdCB0aXRsZTogc3RyaW5nID0gZG9jdW1lbnQhLnF1ZXJ5U2VsZWN0b3IoJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnKSFcbiAgICAgICAgICAgIC50ZXh0Q29udGVudCE7XG4gICAgICAgIGNvbnN0IGF1dGhvcnM6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCB0b3JJRDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbMl07XG4gICAgICAgIGNvbnN0IHJvd1RhcjogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvJyk7XG5cbiAgICAgICAgLy8gVGl0bGUgY2FuJ3QgYmUgbnVsbFxuICAgICAgICBpZiAodGl0bGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGl0bGUgZmllbGQgd2FzIG51bGxgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIGEgbmV3IHRhYmxlIHJvd1xuICAgICAgICBjb25zdCBjclJvdzogSFRNTERpdkVsZW1lbnQgPSBhd2FpdCBVdGlsLmFkZFRvckRldGFpbHNSb3coXG4gICAgICAgICAgICByb3dUYXIsXG4gICAgICAgICAgICAnQ3VycmVudGx5IFJlYWRpbmcnLFxuICAgICAgICAgICAgJ21wX2NyUm93J1xuICAgICAgICApO1xuICAgICAgICAvLyBQcm9jZXNzIGRhdGEgaW50byBzdHJpbmdcbiAgICAgICAgY29uc3QgYmx1cmI6IHN0cmluZyA9IGF3YWl0IHRoaXMuX2dlbmVyYXRlU25pcHBldCh0b3JJRCwgdGl0bGUsIGF1dGhvcnMpO1xuICAgICAgICAvLyBCdWlsZCBidXR0b25cbiAgICAgICAgY29uc3QgYnRuOiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IHRoaXMuX2J1aWxkQnV0dG9uKGNyUm93LCBibHVyYik7XG4gICAgICAgIC8vIEluaXQgYnV0dG9uXG4gICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGJ0biwgYmx1cmIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogQnVpbGQgYSBCQiBDb2RlIHRleHQgc25pcHBldCB1c2luZyB0aGUgYm9vayBpbmZvLCB0aGVuIHJldHVybiBpdFxuICAgICAqIEBwYXJhbSBpZCBUaGUgc3RyaW5nIElEIG9mIHRoZSBib29rXG4gICAgICogQHBhcmFtIHRpdGxlIFRoZSBzdHJpbmcgdGl0bGUgb2YgdGhlIGJvb2tcbiAgICAgKiBAcGFyYW0gYXV0aG9ycyBBIG5vZGUgbGlzdCBvZiBhdXRob3IgbGlua3NcbiAgICAgKi9cbiAgICBwcml2YXRlIF9nZW5lcmF0ZVNuaXBwZXQoXG4gICAgICAgIGlkOiBzdHJpbmcsXG4gICAgICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgICAgIGF1dGhvcnM6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+XG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqICogQWRkIEF1dGhvciBMaW5rXG4gICAgICAgICAqIEBwYXJhbSBhdXRob3JFbGVtIEEgbGluayBjb250YWluaW5nIGF1dGhvciBpbmZvcm1hdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgYWRkQXV0aG9yTGluayA9IChhdXRob3JFbGVtOiBIVE1MQW5jaG9yRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGBbdXJsPSR7YXV0aG9yRWxlbS5ocmVmLnJlcGxhY2UoJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQnLCAnJyl9XSR7XG4gICAgICAgICAgICAgICAgYXV0aG9yRWxlbS50ZXh0Q29udGVudFxuICAgICAgICAgICAgfVsvdXJsXWA7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29udmVydCB0aGUgTm9kZUxpc3QgaW50byBhbiBBcnJheSB3aGljaCBpcyBlYXNpZXIgdG8gd29yayB3aXRoXG4gICAgICAgIGxldCBhdXRob3JBcnJheTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgYXV0aG9ycy5mb3JFYWNoKChhdXRob3JFbGVtKSA9PiBhdXRob3JBcnJheS5wdXNoKGFkZEF1dGhvckxpbmsoYXV0aG9yRWxlbSkpKTtcbiAgICAgICAgLy8gRHJvcCBleHRyYSBpdGVtc1xuICAgICAgICBpZiAoYXV0aG9yQXJyYXkubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgYXV0aG9yQXJyYXkgPSBbLi4uYXV0aG9yQXJyYXkuc2xpY2UoMCwgMyksICdldGMuJ107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFt1cmw9L3QvJHtpZH1dJHt0aXRsZX1bL3VybF0gYnkgW2ldJHthdXRob3JBcnJheS5qb2luKCcsICcpfVsvaV1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogQnVpbGQgYSBidXR0b24gb24gdGhlIHRvciBkZXRhaWxzIHBhZ2VcbiAgICAgKiBAcGFyYW0gdGFyIEFyZWEgd2hlcmUgdGhlIGJ1dHRvbiB3aWxsIGJlIGFkZGVkIGludG9cbiAgICAgKiBAcGFyYW0gY29udGVudCBDb250ZW50IHRoYXQgd2lsbCBiZSBhZGRlZCBpbnRvIHRoZSB0ZXh0YXJlYVxuICAgICAqL1xuICAgIHByaXZhdGUgX2J1aWxkQnV0dG9uKHRhcjogSFRNTERpdkVsZW1lbnQsIGNvbnRlbnQ6IHN0cmluZyk6IEhUTUxEaXZFbGVtZW50IHtcbiAgICAgICAgLy8gQnVpbGQgdGV4dCBkaXNwbGF5XG4gICAgICAgIHRhci5pbm5lckhUTUwgPSBgPHRleHRhcmVhIHJvd3M9XCIxXCIgY29scz1cIjgwXCIgc3R5bGU9J21hcmdpbi1yaWdodDo1cHgnPiR7Y29udGVudH08L3RleHRhcmVhPmA7XG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxuICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24odGFyLCAnbm9uZScsICdDb3B5JywgMik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9jclJvdyAubXBfYnV0dG9uX2Nsb25lJykhLmNsYXNzTGlzdC5hZGQoJ21wX3JlYWRpbmcnKTtcbiAgICAgICAgLy8gUmV0dXJuIGJ1dHRvblxuICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9yZWFkaW5nJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBQcm90ZWN0cyB0aGUgdXNlciBmcm9tIHJhdGlvIHRyb3VibGVzIGJ5IGFkZGluZyB3YXJuaW5ncyBhbmQgZGlzcGxheWluZyByYXRpbyBkZWx0YVxuICovXG5jbGFzcyBSYXRpb1Byb3RlY3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3QnLFxuICAgICAgICBkZXNjOiBgUHJvdGVjdCB5b3VyIHJhdGlvIHdpdGggd2FybmluZ3MgJmFtcDsgcmF0aW8gY2FsY3VsYXRpb25zYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNyYXRpbyc7XG4gICAgcHJpdmF0ZSBfcmNSb3c6IHN0cmluZyA9ICdtcF9yYXRpb0Nvc3RSb3cnO1xuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIHJhdGlvIHByb3RlY3Rpb24uLi4nKTtcbiAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIGJsb2NrIHRvIHNoYXJlZFxuICAgICAgICAvLyBUaGUgZG93bmxvYWQgdGV4dCBhcmVhXG4gICAgICAgIGNvbnN0IGRsQnRuOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGRkbCcpO1xuICAgICAgICAvLyBUaGUgY3VycmVudGx5IHVudXNlZCBsYWJlbCBhcmVhIGFib3ZlIHRoZSBkb3dubG9hZCB0ZXh0XG4gICAgICAgIGNvbnN0IGRsTGFiZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI2Rvd25sb2FkIC50b3JEZXRJbm5lclRvcCdcbiAgICAgICAgKTtcbiAgICAgICAgLy8gSW5zZXJ0aW9uIHRhcmdldCBmb3IgbWVzc2FnZXNcbiAgICAgICAgY29uc3QgZGVzY0Jsb2NrID0gYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy50b3JEZXRCb3R0b20nKTtcbiAgICAgICAgLy8gV291bGQgYmVjb21lIHJhdGlvXG4gICAgICAgIGNvbnN0IHJOZXc6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgLy8gQ3VycmVudCByYXRpb1xuICAgICAgICBjb25zdCByQ3VyOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpO1xuICAgICAgICAvLyBTZWVkaW5nIG9yIGRvd25sb2FkaW5nXG4gICAgICAgIGNvbnN0IHNlZWRpbmc6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjRExoaXN0b3J5Jyk7XG4gICAgICAgIC8vIFVzZXIgaGFzIGEgcmF0aW9cbiAgICAgICAgY29uc3QgdXNlckhhc1JhdGlvID0gckN1ci50ZXh0Q29udGVudC5pbmRleE9mKCdJbmYnKSA8IDAgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBjdXN0b20gcmF0aW8gYW1vdW50cyAod2lsbCByZXR1cm4gZGVmYXVsdCB2YWx1ZXMgb3RoZXJ3aXNlKVxuICAgICAgICBjb25zdCBbcjEsIHIyLCByM10gPSBhd2FpdCB0aGlzLl9zaGFyZS5nZXRSYXRpb1Byb3RlY3RMZXZlbHMoKTtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgUmF0aW8gcHJvdGVjdGlvbiBsZXZlbHMgc2V0IHRvOiAke3IxfSwgJHtyMn0sICR7cjN9YCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBib3ggd2Ugd2lsbCBkaXNwbGF5IHRleHQgaW5cbiAgICAgICAgaWYgKGRlc2NCbG9jaykge1xuICAgICAgICAgICAgLy8gQWRkIGxpbmUgdW5kZXIgVG9ycmVudDogZGV0YWlsIGZvciBDb3N0IGRhdGEgXCJDb3N0IHRvIFJlc3RvcmUgUmF0aW9cIlxuICAgICAgICAgICAgZGVzY0Jsb2NrLmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCIgaWQ9XCJtcF9yb3dcIj48ZGl2IGNsYXNzPVwidG9yRGV0TGVmdFwiPkNvc3QgdG8gUmVzdG9yZSBSYXRpbzwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3RoaXMuX3JjUm93fVwiIHN0eWxlPVwiZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7XCI+PHNwYW4gaWQ9XCJtcF9mb29iYXJcIj48L3NwYW4+PC9kaXY+PC9kaXY+YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJy50b3JEZXRSb3cgaXMgJHtkZXNjQmxvY2t9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmx5IHJ1biB0aGUgY29kZSBpZiB0aGUgcmF0aW8gZXhpc3RzXG4gICAgICAgIGlmIChyTmV3ICYmIHJDdXIgJiYgIXNlZWRpbmcgJiYgdXNlckhhc1JhdGlvKSB7XG4gICAgICAgICAgICBjb25zdCByRGlmZiA9IFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdIC0gVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF07XG5cbiAgICAgICAgICAgIGlmIChNUC5ERUJVRylcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYEN1cnJlbnQgJHtVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXX0gfCBOZXcgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdXG4gICAgICAgICAgICAgICAgICAgIH0gfCBEaWYgJHtyRGlmZn1gXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gT25seSBhY3RpdmF0ZSBpZiBhIHJhdGlvIGNoYW5nZSBpcyBleHBlY3RlZFxuICAgICAgICAgICAgaWYgKCFpc05hTihyRGlmZikgJiYgckRpZmYgPiAwLjAwOSkge1xuICAgICAgICAgICAgICAgIGlmIChkbExhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuaW5uZXJIVE1MID0gYFJhdGlvIGxvc3MgJHtyRGlmZi50b0ZpeGVkKDIpfWA7XG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuc3R5bGUuZm9udFdlaWdodCA9ICdub3JtYWwnOyAvL1RvIGRpc3Rpbmd1aXNoIGZyb20gQk9MRCBUaXRsZXNcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgJiBEaXNwbGF5IGNvc3Qgb2YgZG93bmxvYWQgdy9vIEZMXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIHNob3cgY2FsY3VsYXRpb25zIHdoZW4gdGhlcmUgaXMgYSByYXRpbyBsb3NzXG4gICAgICAgICAgICAgICAgY29uc3Qgc2l6ZUVsZW06IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAnI3NpemUgc3BhbidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChzaXplRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaXplID0gc2l6ZUVsZW0udGV4dENvbnRlbnQhLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpemVNYXAgPSBbJ0J5dGVzJywgJ0tpQicsICdNaUInLCAnR2lCJywgJ1RpQiddO1xuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IGh1bWFuIHJlYWRhYmxlIHNpemUgdG8gYnl0ZXNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnl0ZVNpemVkID1cbiAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlcihzaXplWzBdKSAqIE1hdGgucG93KDEwMjQsIHNpemVNYXAuaW5kZXhPZihzaXplWzFdKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY292ZXJ5ID0gYnl0ZVNpemVkICogVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50QW1udCA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAoMTI1ICogcmVjb3ZlcnkpIC8gMjY4NDM1NDU2XG4gICAgICAgICAgICAgICAgICAgICkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF5QW1vdW50ID0gTWF0aC5mbG9vcigoNSAqIHJlY292ZXJ5KSAvIDIxNDc0ODM2NDgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3ZWRnZVN0b3JlQ29zdCA9IFV0aWwuZm9ybWF0Qnl0ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAoMjY4NDM1NDU2ICogNTAwMDApIC8gKFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdICogMTI1KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3ZWRnZVZhdWx0Q29zdCA9IFV0aWwuZm9ybWF0Qnl0ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAoMjY4NDM1NDU2ICogMjAwKSAvIChVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAqIDEyNSlcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJhdGlvIGNvc3Qgcm93XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7dGhpcy5fcmNSb3d9YFxuICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSBgPHNwYW4+PGI+JHtVdGlsLmZvcm1hdEJ5dGVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlcbiAgICAgICAgICAgICAgICAgICAgKX08L2I+Jm5ic3A7dXBsb2FkICgke3BvaW50QW1udH0gQlA7IG9yIG9uZSBGTCB3ZWRnZSBwZXIgZGF5IGZvciAke2RheUFtb3VudH0gZGF5cykuJm5ic3A7PGFiYnIgdGl0bGU9J0NvbnRyaWJ1dGluZyAyLDAwMCBCUCB0byBlYWNoIHZhdWx0IGN5Y2xlIGdpdmVzIHlvdSBhbG1vc3Qgb25lIEZMIHdlZGdlIHBlciBkYXkgb24gYXZlcmFnZS4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPldlZGdlIHN0b3JlIHByaWNlOiA8aT4ke3dlZGdlU3RvcmVDb3N0fTwvaT4mbmJzcDs8YWJiciB0aXRsZT0nSWYgeW91IGJ1eSB3ZWRnZXMgZnJvbSB0aGUgc3RvcmUsIHRoaXMgaXMgaG93IGxhcmdlIGEgdG9ycmVudCBtdXN0IGJlIHRvIGJyZWFrIGV2ZW4gb24gdGhlIGNvc3QgKDUwLDAwMCBCUCkgb2YgYSBzaW5nbGUgd2VkZ2UuJyBzdHlsZT0ndGV4dC1kZWNvcmF0aW9uOm5vbmU7Y3Vyc29yOmhlbHA7Jz4mIzEyODcxMjs8L2FiYnI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5XZWRnZSB2YXVsdCBwcmljZTogPGk+JHt3ZWRnZVZhdWx0Q29zdH08L2k+Jm5ic3A7PGFiYnIgdGl0bGU9J0lmIHlvdSBjb250cmlidXRlIHRvIHRoZSB2YXVsdCwgdGhpcyBpcyBob3cgbGFyZ2UgYSB0b3JyZW50IG11c3QgYmUgdG8gYnJlYWsgZXZlbiBvbiB0aGUgY29zdCAoMjAwIEJQKSBvZiAxMCB3ZWRnZXMgZm9yIHRoZSBtYXhpbXVtIGNvbnRyaWJ1dGlvbiBvZiAyLDAwMCBCUC4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+YDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTdHlsZSB0aGUgZG93bmxvYWQgYnV0dG9uIGJhc2VkIG9uIFJhdGlvIFByb3RlY3QgbGV2ZWwgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBpZiAoZGxCdG4gJiYgZGxMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyAqIFRoaXMgaXMgdGhlIFwidHJpdmlhbCByYXRpbyBsb3NzXCIgdGhyZXNob2xkXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIGNoYW5nZXMgd2lsbCBhbHdheXMgaGFwcGVuIGlmIHRoZSByYXRpbyBjb25kaXRpb25zIGFyZSBtZXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJEaWZmID4gcjEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEJ1dHRvblN0YXRlKGRsQnRuLCAnMV9ub3RpZnknKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vICogVGhpcyBpcyB0aGUgXCJJIG5ldmVyIHdhbnQgdG8gZGwgdy9vIEZMXCIgdGhyZXNob2xkXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxzbyB1c2VzIHRoZSBNaW5pbXVtIFJhdGlvLCBpZiBlbmFibGVkXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxzbyBwcmV2ZW50cyBnb2luZyBiZWxvdyAyIHJhdGlvIChQVSByZXF1aXJlbWVudClcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVwbGFjZSBkaXNhYmxlIGJ1dHRvbiB3aXRoIGJ1eSBGTCBidXR0b25cblxuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICByRGlmZiA+IHIzIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RNaW5fdmFsJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgMlxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEJ1dHRvblN0YXRlKGRsQnRuLCAnM19hbGVydCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gKiBUaGlzIGlzIHRoZSBcIkkgbmVlZCB0byB0aGluayBhYm91dCB1c2luZyBhIEZMXCIgdGhyZXNob2xkXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAockRpZmYgPiByMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0QnV0dG9uU3RhdGUoZGxCdG4sICcyX3dhcm4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHRoZSB1c2VyIGRvZXMgbm90IGhhdmUgYSByYXRpbywgZGlzcGxheSBhIHNob3J0IG1lc3NhZ2VcbiAgICAgICAgfSBlbHNlIGlmICghdXNlckhhc1JhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRCdXR0b25TdGF0ZShkbEJ0biwgJzFfbm90aWZ5Jyk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgIGAuJHt0aGlzLl9yY1Jvd31gXG4gICAgICAgICAgICApIS5pbm5lckhUTUwgPSBgPHNwYW4+UmF0aW8gcG9pbnRzIGFuZCBjb3N0IHRvIHJlc3RvcmUgcmF0aW8gd2lsbCBhcHBlYXIgaGVyZSBhZnRlciB5b3VyIHJhdGlvIGlzIGEgcmVhbCBudW1iZXIuPC9zcGFuPmA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRCdXR0b25TdGF0ZShcbiAgICAgICAgdGFyOiBIVE1MQW5jaG9yRWxlbWVudCxcbiAgICAgICAgc3RhdGU6ICcxX25vdGlmeScgfCAnMl93YXJuJyB8ICczX2FsZXJ0JyxcbiAgICAgICAgbGFiZWw/OiBIVE1MRGl2RWxlbWVudFxuICAgICkge1xuICAgICAgICBpZiAoc3RhdGUgPT09ICcxX25vdGlmeScpIHtcbiAgICAgICAgICAgIHRhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnU3ByaW5nR3JlZW4nO1xuICAgICAgICAgICAgdGFyLnN0eWxlLmNvbG9yID0gJ2JsYWNrJztcbiAgICAgICAgICAgIHRhci5pbm5lckhUTUwgPSAnRG93bmxvYWQ/JztcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJzJfd2FybicpIHtcbiAgICAgICAgICAgIHRhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcbiAgICAgICAgICAgIHRhci5pbm5lckhUTUwgPSAnU3VnZ2VzdCBGTCc7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICczX2FsZXJ0Jykge1xuICAgICAgICAgICAgaWYgKCFsYWJlbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm8gbGFiZWwgcHJvdmlkZWQgaW4gX3NldEJ1dHRvblN0YXRlKCkhYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1JlZCc7XG4gICAgICAgICAgICB0YXIuc3R5bGUuY3Vyc29yID0gJ25vLWRyb3AnO1xuICAgICAgICAgICAgdGFyLmlubmVySFRNTCA9ICdGTCBOZWVkZWQnO1xuICAgICAgICAgICAgbGFiZWwuc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3RhdGUgXCIke3N0YXRlfVwiIGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBMb3cgcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcbiAqL1xuY2xhc3MgUmF0aW9Qcm90ZWN0TDEgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDEnLFxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwxJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjUnLFxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBzbWFsbGVzdCB0aHJlc2hob2xkIHRvIGluZGljYXRlIHJhdGlvIGNoYW5nZXMuICg8ZW0+VGhpcyBpcyBhIHNsaWdodCBjb2xvciBjaGFuZ2U8L2VtPikuYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIEwxIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBNZWRpdW0gcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcbiAqL1xuY2xhc3MgUmF0aW9Qcm90ZWN0TDIgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDInLFxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwyJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAxJyxcbiAgICAgICAgZGVzYzogYFNldCB0aGUgbWVkaWFuIHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBub3RpY2VhYmxlIGNvbG9yIGNoYW5nZTwvZW0+KS5gLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gTDIhJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEhpZ2ggcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcbiAqL1xuY2xhc3MgUmF0aW9Qcm90ZWN0TDMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDMnLFxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwzJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAyJyxcbiAgICAgICAgZGVzYzogYFNldCB0aGUgaGlnaGVzdCB0aHJlc2hob2xkIHRvIHByZXZlbnQgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGRpc2FibGVzIGRvd25sb2FkIHdpdGhvdXQgRkwgdXNlPC9lbT4pLmAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxlZCBjdXN0b20gUmF0aW8gUHJvdGVjdGlvbiBMMyEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG5jbGFzcyBSYXRpb1Byb3RlY3RNaW4gaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RNaW4nLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdGFnOiAnTWluaW11bSBSYXRpbycsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMCcsXG4gICAgICAgIGRlc2M6ICdUcmlnZ2VyIFJhdGlvIFdhcm4gTDMgaWYgeW91ciByYXRpbyB3b3VsZCBkcm9wIGJlbG93IHRoaXMgbnVtYmVyLicsXG4gICAgfTtcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIG1pbmltdW0hJyk7XG4gICAgfVxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIFJhdGlvUHJvdGVjdEljb25zIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RJY29ucycsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICBkZXNjOiAnRW5hYmxlIGN1c3RvbSBicm93c2VyIGZhdmljb25zIGJhc2VkIG9uIFJhdGlvIFByb3RlY3QgY29uZGl0aW9ucz8nLFxuICAgIH07XG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNyYXRpbyc7XG4gICAgcHJpdmF0ZSBfdXNlcklEOiBudW1iZXIgPSAxNjQxMDk7XG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBgW00rXSBFbmFibGluZyBjdXN0b20gUmF0aW8gUHJvdGVjdCBmYXZpY29ucyBmcm9tIHVzZXIgJHt0aGlzLl91c2VySUR9Li4uYFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEdldCB0aGUgY3VzdG9tIHJhdGlvIGFtb3VudHMgKHdpbGwgcmV0dXJuIGRlZmF1bHQgdmFsdWVzIG90aGVyd2lzZSlcbiAgICAgICAgY29uc3QgW3IxLCByMiwgcjNdID0gYXdhaXQgdGhpcy5fc2hhcmUuZ2V0UmF0aW9Qcm90ZWN0TGV2ZWxzKCk7XG4gICAgICAgIC8vIFdvdWxkIGJlY29tZSByYXRpb1xuICAgICAgICBjb25zdCByTmV3OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIC8vIEN1cnJlbnQgcmF0aW9cbiAgICAgICAgY29uc3QgckN1cjogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVInKTtcbiAgICAgICAgLy8gRGlmZmVyZW5jZSBiZXR3ZWVuIG5ldyBhbmQgb2xkIHJhdGlvXG4gICAgICAgIGNvbnN0IHJEaWZmID0gVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gLSBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXTtcbiAgICAgICAgLy8gU2VlZGluZyBvciBkb3dubG9hZGluZ1xuICAgICAgICBjb25zdCBzZWVkaW5nOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0RMaGlzdG9yeScpO1xuICAgICAgICAvLyBWSVAgc3RhdHVzXG4gICAgICAgIGNvbnN0IHZpcHN0YXQ6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJyNyYXRpbyAudG9yRGV0SW5uZXJCb3R0b21TcGFuJ1xuICAgICAgICApXG4gICAgICAgICAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyYXRpbyAudG9yRGV0SW5uZXJCb3R0b21TcGFuJykudGV4dENvbnRlbnRcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgLy8gQm9va2NsdWIgc3RhdHVzXG4gICAgICAgIGNvbnN0IGJvb2tjbHViOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgIFwiZGl2W2lkPSdiY2ZsJ10gc3BhblwiXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gRmluZCBmYXZpY29uIGxpbmtzIGFuZCBsb2FkIGEgc2ltcGxlIGRlZmF1bHQuXG4gICAgICAgIGNvbnN0IHNpdGVGYXZpY29ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rW3JlbCQ9J2ljb24nXVwiKSBhcyBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTExpbmtFbGVtZW50XG4gICAgICAgID47XG4gICAgICAgIGlmIChzaXRlRmF2aWNvbnMpIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ3RtXzMyeDMyJyk7XG5cbiAgICAgICAgLy8gVGVzdCBpZiBWSVBcbiAgICAgICAgaWYgKHZpcHN0YXQpIHtcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFZJUCA9ICR7dmlwc3RhdH1gKTtcblxuICAgICAgICAgICAgaWYgKHZpcHN0YXQuc2VhcmNoKCdWSVAgZXhwaXJlcycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdtb3VzZWNsb2NrJyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAnIHwgTXkgQW5vbmFtb3VzZScsXG4gICAgICAgICAgICAgICAgICAgIGAgfCBFeHBpcmVzICR7dmlwc3RhdC5zdWJzdHJpbmcoMjYpfWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2aXBzdGF0LnNlYXJjaCgnVklQIG5vdCBzZXQgdG8gZXhwaXJlJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzBjaXInKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcbiAgICAgICAgICAgICAgICAgICAgJyB8IE5vdCBzZXQgdG8gZXhwaXJlJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdUaGlzIHRvcnJlbnQgaXMgZnJlZWxlZWNoIScpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdtb3VzZWNsb2NrJyk7XG4gICAgICAgICAgICAgICAgLy8gVGVzdCBpZiBib29rY2x1YlxuICAgICAgICAgICAgICAgIGlmIChib29rY2x1YiAmJiBib29rY2x1Yi50ZXh0Q29udGVudC5zZWFyY2goJ0Jvb2tjbHViIEZyZWVsZWVjaCcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYCB8IENsdWIgZXhwaXJlcyAke2Jvb2tjbHViLnRleHRDb250ZW50LnN1YnN0cmluZygyNSl9YFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIHwgJ3RpbGwgbmV4dCBTaXRlIEZMXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSB3aGVuIEZMIGVuZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGAgfCAndGlsbCAke3RoaXMuX25leHRGTERhdGUoKX1gXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBzZWVkaW5nL2Rvd25sb2FkaW5nXG4gICAgICAgIGlmIChzZWVkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICcxM2VnZycpO1xuICAgICAgICAgICAgLy8gKiBTaW1pbGFyIGljb25zOiAxM3NlZWQ4LCAxM3NlZWQ3LCAxM2VnZywgMTMsIDEzY2lyLCAxM1doaXRlQ2lyXG4gICAgICAgIH0gZWxzZSBpZiAodmlwc3RhdC5zZWFyY2goJ1RoaXMgdG9ycmVudCBpcyBwZXJzb25hbCBmcmVlbGVlY2gnKSA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICc1Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIHRoZXJlIHdpbGwgYmUgcmF0aW8gbG9zc1xuICAgICAgICBpZiAock5ldyAmJiByQ3VyICYmICFzZWVkaW5nKSB7XG4gICAgICAgICAgICAvLyBDaGFuZ2UgaWNvbiBiYXNlZCBvbiBSYXRpbyBQcm90ZWN0IHN0YXRlc1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHJEaWZmID4gcjMgfHxcbiAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RNaW5fdmFsJykgfHxcbiAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IDJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzEyJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICczUW1vdXNlJyk7XG4gICAgICAgICAgICAgICAgLy8gQWxzbyB0cnkgT3JhbmdlLCBPcmFuZ2VSZWQsIEdvbGQsIG9yIDE0XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdTcHJpbmdHcmVlbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBmdXR1cmUgVklQXG4gICAgICAgICAgICBpZiAodmlwc3RhdC5zZWFyY2goJ09uIGxpc3QgZm9yIG5leHQgRkwgcGljaycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdNaXJyb3JHcmVlbkNsb2NrJyk7IC8vIEFsc28gdHJ5IGdyZWVuY2xvY2tcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcbiAgICAgICAgICAgICAgICAgICAgJyB8IE5leHQgRkwgcGljaydcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ3VzdG9tIFJhdGlvIFByb3RlY3QgZmF2aWNvbnMgZW5hYmxlZCEnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBGdW5jdGlvbiBmb3IgY2FsY3VsYXRpbmcgd2hlbiBGTCBlbmRzXG4gICAgLy8gPyBIb3cgYXJlIHdlIGFibGUgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIGN1cnJlbnQgRkwgcGVyaW9kIHN0YXJ0ZWQ/XG4gICAgLyogcHJpdmF0ZSBhc3luYyBfbmV4dEZMRGF0ZSgpIHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCdKdW4gMTQsIDIwMjIgMDA6MDA6MDAgVVRDJyk7IC8vIHNlZWQgZGF0ZSBvdmVyIHR3byB3ZWVrcyBhZ29cbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTsgLy9QbGFjZSB0ZXN0IGRhdGVzIGhlcmUgbGlrZSBEYXRlKFwiSnVsIDE0LCAyMDIyIDAwOjAwOjAwIFVUQ1wiKVxuICAgICAgICBsZXQgbXNzaW5jZSA9IG5vdy5nZXRUaW1lKCkgLSBkLmdldFRpbWUoKTsgLy90aW1lIHNpbmNlIEZMIHN0YXJ0IHNlZWQgZGF0ZVxuICAgICAgICBsZXQgZGF5c3NpbmNlID0gbXNzaW5jZSAvIDg2NDAwMDAwO1xuICAgICAgICBsZXQgcSA9IE1hdGguZmxvb3IoZGF5c3NpbmNlIC8gMTQpOyAvLyBGTCBwZXJpb2RzIHNpbmNlIHNlZWQgZGF0ZVxuXG4gICAgICAgIGNvbnN0IGFkZERheXMgPSAoZGF0ZSwgZGF5cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IG5ldyBEYXRlKGRhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQuc2V0RGF0ZShjdXJyZW50LmdldERhdGUoKSArIGRheXMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBkXG4gICAgICAgICAgICAuYWRkRGF5cyhxICogMTQgKyAxNClcbiAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAuc3Vic3RyKDAsIDEwKTtcbiAgICB9ICovXG5cbiAgICBwcml2YXRlIGFzeW5jIF9idWlsZEljb25MaW5rcyhlbGVtczogTm9kZUxpc3RPZjxIVE1MTGlua0VsZW1lbnQ+LCBmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGVsZW1zLmZvckVhY2goKGVsZW0pID0+IHtcbiAgICAgICAgICAgIGVsZW0uaHJlZiA9IGBodHRwczovL2Nkbi5teWFub25hbW91c2UubmV0L2ltYWdlYnVja2V0LyR7dGhpcy5fdXNlcklEfS8ke2ZpbGVuYW1lfS5wbmdgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cblxuICAgIHNldCB1c2VySUQobmV3SUQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLl91c2VySUQgPSBuZXdJRDtcbiAgICB9XG59XG5cbi8vIFRPRE86IEFkZCBmZWF0dXJlIHRvIHNldCBSYXRpb1Byb3RlY3RJY29uJ3MgYF91c2VySURgIHZhbHVlLiBPbmx5IG5lY2Vzc2FyeSBvbmNlIG90aGVyIGljb24gc2V0cyBleGlzdC5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cblxuLyoqXG4gKiAjVVBMT0FEIFBBR0UgRkVBVFVSRVNcbiAqL1xuXG4vKipcbiAqIEFsbG93cyBlYXNpZXIgY2hlY2tpbmcgZm9yIGR1cGxpY2F0ZSB1cGxvYWRzXG4gKi9cblxuY2xhc3MgU2VhcmNoRm9yRHVwbGljYXRlcyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnc2VhcmNoRm9yRHVwbGljYXRlcycsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VwbG9hZCBQYWdlJ10sXG4gICAgICAgIGRlc2M6ICdFYXNpZXIgc2VhcmNoaW5nIGZvciBkdXBsaWNhdGVzIHdoZW4gdXBsb2FkaW5nIGNvbnRlbnQnLFxuICAgIH07XG5cbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdXBsb2FkRm9ybSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3VwbG9hZCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xuXG4gICAgICAgIGlmIChwYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gdGl0bGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICd0aXRsZScsXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0W25hbWU9XCJ0b3JbdGl0bGVdXCJdJyxcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogNyxcbiAgICAgICAgICAgICAgICB1c2VXaWxkY2FyZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gYXV0aG9yKHMpJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXV0aG9yJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfYXV0aG9yJyxcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTAsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIHNlcmllcycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlcmllcycsXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX3NlcmllcycsXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDExLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBuYXJyYXRvcihzKScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ25hcnJhdG9yJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfbmFycmF0b3InLFxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBzZWFyY2ggdG8gdXBsb2FkcyFgKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTZWFyY2goe1xuICAgICAgICBwYXJlbnRFbGVtZW50LFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgaW5wdXRTZWxlY3RvcixcbiAgICAgICAgcm93UG9zaXRpb24sXG4gICAgICAgIHVzZVdpbGRjYXJkID0gZmFsc2UsXG4gICAgfToge1xuICAgICAgICBwYXJlbnRFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICAgICAgdGl0bGU6IHN0cmluZztcbiAgICAgICAgdHlwZTogc3RyaW5nO1xuICAgICAgICBpbnB1dFNlbGVjdG9yOiBzdHJpbmc7XG4gICAgICAgIHJvd1Bvc2l0aW9uOiBudW1iZXI7XG4gICAgICAgIHVzZVdpbGRjYXJkPzogYm9vbGVhbjtcbiAgICB9KSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaEVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBVdGlsLnNldEF0dHIoc2VhcmNoRWxlbWVudCwge1xuICAgICAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJyxcbiAgICAgICAgICAgIHN0eWxlOiAndGV4dC1kZWNvcmF0aW9uOiBub25lOyBjdXJzb3I6IHBvaW50ZXI7JyxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICB9KTtcbiAgICAgICAgc2VhcmNoRWxlbWVudC50ZXh0Q29udGVudCA9ICcg8J+UjSc7XG5cbiAgICAgICAgY29uc3QgbGlua0Jhc2UgPSBgL3Rvci9icm93c2UucGhwP3RvciU1QnNlYXJjaFR5cGUlNUQ9YWxsJnRvciU1QnNlYXJjaEluJTVEPXRvcnJlbnRzJnRvciU1QmNhdCU1RCU1QiU1RD0wJnRvciU1QmJyb3dzZUZsYWdzSGlkZVZzU2hvdyU1RD0wJnRvciU1QnNvcnRUeXBlJTVEPWRhdGVEZXNjJnRvciU1QnNyY2hJbiU1RCU1QiR7dHlwZX0lNUQ9dHJ1ZSZ0b3IlNUJ0ZXh0JTVEPWA7XG5cbiAgICAgICAgcGFyZW50RWxlbWVudFxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgYCN1cGxvYWRGb3JtID4gdGJvZHkgPiB0cjpudGgtY2hpbGQoJHtyb3dQb3NpdGlvbn0pID4gdGQ6bnRoLWNoaWxkKDEpYFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgPy5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIHNlYXJjaEVsZW1lbnQpO1xuXG4gICAgICAgIHNlYXJjaEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0czogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50XG4gICAgICAgICAgICA+IHwgbnVsbCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChpbnB1dFNlbGVjdG9yKTtcblxuICAgICAgICAgICAgaWYgKGlucHV0cyAmJiBpbnB1dHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRzTGlzdDogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgICAgIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0xpc3QucHVzaChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gaW5wdXRzTGlzdC5qb2luKCcgJykudHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaFN0cmluZyA9IHVzZVdpbGRjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAqJHtlbmNvZGVVUklDb21wb25lbnQoaW5wdXRzTGlzdC5qb2luKCcgJykpfSpgXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVuY29kZVVSSUNvbXBvbmVudChpbnB1dHNMaXN0LmpvaW4oJyAnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBsaW5rQmFzZSArIHNlYXJjaFN0cmluZyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cblxuLyoqXG4gKiAjIFVTRVIgUEFHRSBGRUFUVVJFU1xuICovXG5cbi8qKlxuICogIyMjIyBEZWZhdWx0IFVzZXIgR2lmdCBBbW91bnRcbiAqL1xuY2xhc3MgVXNlckdpZnREZWZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdERlZmF1bHQnLFxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMDAwLCBtYXgnLFxuICAgICAgICBkZXNjOlxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2JvbnVzZ2lmdCc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBuZXcgU2hhcmVkKClcbiAgICAgICAgICAgIC5maWxsR2lmdEJveCh0aGlzLl90YXIsIHRoaXMuX3NldHRpbmdzLnRpdGxlKVxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXQgdGhlIGRlZmF1bHQgZ2lmdCBhbW91bnQgdG8gJHtwb2ludHN9YClcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyMjIFVzZXIgR2lmdCBIaXN0b3J5XG4gKi9cbmNsYXNzIFVzZXJHaWZ0SGlzdG9yeSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndXNlckdpZnRIaXN0b3J5JyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXNlciBQYWdlcyddLFxuICAgICAgICBkZXNjOiAnRGlzcGxheSBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB5b3UgYW5kIGFub3RoZXIgdXNlcicsXG4gICAgfTtcbiAgICBwcml2YXRlIF9zZW5kU3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjpvcmFuZ2UnIHRpdGxlPSdzZW50Jz5cXHUyN0YwPC9zcGFuPmA7XG4gICAgcHJpdmF0ZSBfZ2V0U3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjp0ZWFsJyB0aXRsZT0ncmVjZWl2ZWQnPlxcdTI3RjE8L3NwYW4+YDtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICd0Ym9keSc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluaXRpYWxsaXppbmcgdXNlciBnaWZ0IGhpc3RvcnkuLi4nKTtcblxuICAgICAgICAvLyBOYW1lIG9mIHRoZSBvdGhlciB1c2VyXG4gICAgICAgIGNvbnN0IG90aGVyVXNlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSA+IGgxJykhLnRleHRDb250ZW50IS50cmltKCk7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IHJvd1xuICAgICAgICBjb25zdCBoaXN0b3J5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICAgICAgY29uc3QgaW5zZXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IHRib2R5IHRyOmxhc3Qtb2YtdHlwZScpO1xuICAgICAgICBpZiAoaW5zZXJ0KSBpbnNlcnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIGhpc3RvcnlDb250YWluZXIpO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSB0aXRsZSBmaWVsZFxuICAgICAgICBjb25zdCBoaXN0b3J5VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBoaXN0b3J5VGl0bGUuY2xhc3NMaXN0LmFkZCgncm93aGVhZCcpO1xuICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnR2lmdCBoaXN0b3J5JztcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5VGl0bGUpO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSBjb250ZW50IGZpZWxkXG4gICAgICAgIGNvbnN0IGhpc3RvcnlCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBoaXN0b3J5Qm94LmNsYXNzTGlzdC5hZGQoJ3JvdzEnKTtcbiAgICAgICAgaGlzdG9yeUJveC50ZXh0Q29udGVudCA9IGBZb3UgaGF2ZSBub3QgZXhjaGFuZ2VkIGdpZnRzIHdpdGggJHtvdGhlclVzZXJ9LmA7XG4gICAgICAgIGhpc3RvcnlCb3guYWxpZ24gPSAnbGVmdCc7XG4gICAgICAgIGhpc3RvcnlDb250YWluZXIuYXBwZW5kQ2hpbGQoaGlzdG9yeUJveCk7XG4gICAgICAgIC8vIEdldCB0aGUgVXNlciBJRFxuICAgICAgICBjb25zdCB1c2VySUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5wb3AoKTtcblxuICAgICAgICBjb25zdCBjdXJyZW50VXNlcklEID0gVXRpbC5nZXRDdXJyZW50VXNlcklEKCk7XG5cbiAgICAgICAgLy8gVE9ETzogdXNlIGBjZG4uYCBpbnN0ZWFkIG9mIGB3d3cuYDsgY3VycmVudGx5IGNhdXNlcyBhIDQwMyBlcnJvclxuICAgICAgICBpZiAodXNlcklEKSB7XG4gICAgICAgICAgICBpZiAodXNlcklEID09PSBjdXJyZW50VXNlcklEKSB7XG4gICAgICAgICAgICAgICAgaGlzdG9yeVRpdGxlLnRleHRDb250ZW50ID0gJ1JlY2VudCBHaWZ0IEhpc3RvcnknO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9oaXN0b3J5V2l0aEFsbChoaXN0b3J5Qm94KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oaXN0b3J5V2l0aFVzZXJJRCh1c2VySUQsIGhpc3RvcnlCb3gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVc2VyIElEIG5vdCBmb3VuZDogJHt1c2VySUR9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIEZpbGwgb3V0IGhpc3RvcnkgYm94XG4gICAgICogQHBhcmFtIHVzZXJJRCB0aGUgdXNlciB0byBnZXQgaGlzdG9yeSBmcm9tXG4gICAgICogQHBhcmFtIGhpc3RvcnlCb3ggdGhlIGJveCB0byBwdXQgaXQgaW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIF9oaXN0b3J5V2l0aFVzZXJJRCh1c2VySUQ6IHN0cmluZywgaGlzdG9yeUJveDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBnaWZ0IGhpc3RvcnlcbiAgICAgICAgY29uc3QgZ2lmdEhpc3RvcnkgPSBhd2FpdCBVdGlsLmdldFVzZXJHaWZ0SGlzdG9yeSh1c2VySUQpO1xuICAgICAgICAvLyBPbmx5IGRpc3BsYXkgYSBsaXN0IGlmIHRoZXJlIGlzIGEgaGlzdG9yeVxuICAgICAgICBpZiAoZ2lmdEhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgUG9pbnQgJiBGTCB0b3RhbCB2YWx1ZXNcbiAgICAgICAgICAgIGNvbnN0IFtwb2ludHNJbiwgcG9pbnRzT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFBvaW50cycpO1xuICAgICAgICAgICAgY29uc3QgW3dlZGdlSW4sIHdlZGdlT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFdlZGdlJyk7XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUG9pbnRzIEluL091dDogJHtwb2ludHNJbn0vJHtwb2ludHNPdXR9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFdlZGdlcyBJbi9PdXQ6ICR7d2VkZ2VJbn0vJHt3ZWRnZU91dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG90aGVyVXNlciA9IGdpZnRIaXN0b3J5WzBdLm90aGVyX25hbWU7XG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGhpc3RvcnlCb3guaW5uZXJIVE1MID0gYFlvdSBoYXZlIHNlbnQgJHt0aGlzLl9zZW5kU3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzT3V0fSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlT3V0fSBGTCB3ZWRnZXM8L3N0cm9uZz4gdG8gJHtvdGhlclVzZXJ9IGFuZCByZWNlaXZlZCAke3RoaXMuX2dldFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c0lufSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlSW59IEZMIHdlZGdlczwvc3Ryb25nPi48aHI+YDtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbWVzc2FnZSB0byB0aGUgYm94XG4gICAgICAgICAgICBoaXN0b3J5Qm94LmFwcGVuZENoaWxkKHRoaXMuX3Nob3dHaWZ0cyhnaWZ0SGlzdG9yeSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gVXNlciBnaWZ0IGhpc3RvcnkgYWRkZWQhJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBObyB1c2VyIGdpZnQgaGlzdG9yeSBmb3VuZCB3aXRoICR7dXNlcklEfS5gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgRmlsbCBvdXQgaGlzdG9yeSBib3hcbiAgICAgKiBAcGFyYW0gaGlzdG9yeUJveCB0aGUgYm94IHRvIHB1dCBpdCBpblxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2hpc3RvcnlXaXRoQWxsKGhpc3RvcnlCb3g6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIC8vIEdldCB0aGUgZ2lmdCBoaXN0b3J5XG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5ID0gYXdhaXQgVXRpbC5nZXRBbGxVc2VyR2lmdEhpc3RvcnkoKTtcbiAgICAgICAgLy8gT25seSBkaXNwbGF5IGEgbGlzdCBpZiB0aGVyZSBpcyBhIGhpc3RvcnlcbiAgICAgICAgaWYgKGdpZnRIaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIFBvaW50ICYgRkwgdG90YWwgdmFsdWVzXG4gICAgICAgICAgICBjb25zdCBbcG9pbnRzSW4sIHBvaW50c091dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRQb2ludHMnKTtcbiAgICAgICAgICAgIGNvbnN0IFt3ZWRnZUluLCB3ZWRnZU91dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRXZWRnZScpO1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBvaW50cyBJbi9PdXQ6ICR7cG9pbnRzSW59LyR7cG9pbnRzT3V0fWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBXZWRnZXMgSW4vT3V0OiAke3dlZGdlSW59LyR7d2VkZ2VPdXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGhpc3RvcnlCb3guaW5uZXJIVE1MID0gYFlvdSBoYXZlIHNlbnQgJHt0aGlzLl9zZW5kU3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzT3V0fSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlT3V0fSBGTCB3ZWRnZXM8L3N0cm9uZz4gYW5kIHJlY2VpdmVkICR7dGhpcy5fZ2V0U3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzSW59IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VJbn0gRkwgd2VkZ2VzPC9zdHJvbmc+Ljxocj5gO1xuICAgICAgICAgICAgLy8gQWRkIHRoZSBtZXNzYWdlIHRvIHRoZSBib3hcbiAgICAgICAgICAgIGhpc3RvcnlCb3guYXBwZW5kQ2hpbGQodGhpcy5fc2hvd0dpZnRzKGdpZnRIaXN0b3J5KSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBVc2VyIGdpZnQgaGlzdG9yeSBhZGRlZCEnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE5vIHVzZXIgZ2lmdCBoaXN0b3J5IGZvdW5kIGZvciBjdXJyZW50IHVzZXIuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFN1bSB0aGUgdmFsdWVzIG9mIGEgZ2l2ZW4gZ2lmdCB0eXBlIGFzIEluZmxvdyAmIE91dGZsb3cgc3Vtc1xuICAgICAqIEBwYXJhbSBoaXN0b3J5IHRoZSB1c2VyIGdpZnQgaGlzdG9yeVxuICAgICAqIEBwYXJhbSB0eXBlIHBvaW50cyBvciB3ZWRnZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zdW1HaWZ0cyhcbiAgICAgICAgaGlzdG9yeTogVXNlckdpZnRIaXN0b3J5W10sXG4gICAgICAgIHR5cGU6ICdnaWZ0UG9pbnRzJyB8ICdnaWZ0V2VkZ2UnXG4gICAgKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgICAgIGNvbnN0IG91dGZsb3cgPSBbMF07XG4gICAgICAgIGNvbnN0IGluZmxvdyA9IFswXTtcbiAgICAgICAgLy8gT25seSByZXRyaWV2ZSBhbW91bnRzIG9mIGEgc3BlY2lmaWVkIGdpZnQgdHlwZVxuICAgICAgICBoaXN0b3J5Lm1hcCgoZ2lmdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGdpZnQudHlwZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIFNwbGl0IGludG8gSW5mbG93L091dGZsb3dcbiAgICAgICAgICAgICAgICBpZiAoZ2lmdC5hbW91bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdXRmbG93LnB1c2goZ2lmdC5hbW91bnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFN1bSBhbGwgaXRlbXMgaW4gdGhlIGZpbHRlcmVkIGFycmF5XG4gICAgICAgIGNvbnN0IHN1bU91dCA9IG91dGZsb3cucmVkdWNlKChhY2N1bXVsYXRlLCBjdXJyZW50KSA9PiBhY2N1bXVsYXRlICsgY3VycmVudCk7XG4gICAgICAgIGNvbnN0IHN1bUluID0gaW5mbG93LnJlZHVjZSgoYWNjdW11bGF0ZSwgY3VycmVudCkgPT4gYWNjdW11bGF0ZSArIGN1cnJlbnQpO1xuICAgICAgICByZXR1cm4gW3N1bUluLCBNYXRoLmFicyhzdW1PdXQpXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENyZWF0ZXMgYSBsaXN0IG9mIHRoZSBtb3N0IHJlY2VudCBnaWZ0c1xuICAgICAqIEBwYXJhbSBoaXN0b3J5IFRoZSBmdWxsIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHR3byB1c2Vyc1xuICAgICAqL1xuICAgIHByaXZhdGUgX3Nob3dHaWZ0cyhoaXN0b3J5OiBVc2VyR2lmdEhpc3RvcnlbXSkge1xuICAgICAgICAvLyBJZiB0aGUgZ2lmdCB3YXMgYSB3ZWRnZSwgcmV0dXJuIGN1c3RvbSB0ZXh0XG4gICAgICAgIGNvbnN0IF93ZWRnZU9yUG9pbnRzID0gKGdpZnQ6IFVzZXJHaWZ0SGlzdG9yeSk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICBpZiAoZ2lmdC50eXBlID09PSAnZ2lmdFBvaW50cycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7TWF0aC5hYnMoZ2lmdC5hbW91bnQpfWA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyhGTCknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVycm9yOiB1bmtub3duIGdpZnQgdHlwZS4uLiAke2dpZnQudHlwZX06ICR7Z2lmdC5hbW91bnR9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBhIGxpc3QgZm9yIHRoZSBoaXN0b3J5XG4gICAgICAgIGNvbnN0IGhpc3RvcnlMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihoaXN0b3J5TGlzdC5zdHlsZSwge1xuICAgICAgICAgICAgbGlzdFN0eWxlOiAnbm9uZScsXG4gICAgICAgICAgICBwYWRkaW5nOiAnaW5pdGlhbCcsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMGVtJyxcbiAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bycsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBMb29wIG92ZXIgaGlzdG9yeSBpdGVtcyBhbmQgYWRkIHRvIGFuIGFycmF5XG4gICAgICAgIGNvbnN0IGdpZnRzOiBzdHJpbmdbXSA9IGhpc3RvcnlcbiAgICAgICAgICAgIC5maWx0ZXIoKGdpZnQpID0+IGdpZnQudHlwZSA9PT0gJ2dpZnRQb2ludHMnIHx8IGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpXG4gICAgICAgICAgICAubWFwKChnaWZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHNvbWUgc3R5bGluZyBkZXBlbmRpbmcgb24gcG9zL25lZyBudW1iZXJzXG4gICAgICAgICAgICAgICAgbGV0IGZhbmN5R2lmdEFtb3VudDogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGZyb21Ubzogc3RyaW5nID0gJyc7XG5cbiAgICAgICAgICAgICAgICBpZiAoZ2lmdC5hbW91bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhbmN5R2lmdEFtb3VudCA9IGAke3RoaXMuX2dldFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xuICAgICAgICAgICAgICAgICAgICBmcm9tVG8gPSAnZnJvbSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fc2VuZFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xuICAgICAgICAgICAgICAgICAgICBmcm9tVG8gPSAndG8nO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE1ha2UgdGhlIGRhdGUgcmVhZGFibGVcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gVXRpbC5wcmV0dHlTaXRlVGltZShnaWZ0LnRpbWVzdGFtcCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8bGkgY2xhc3M9J21wX2dpZnRJdGVtJz4ke2RhdGV9IHlvdSAke2ZhbmN5R2lmdEFtb3VudH0gJHtmcm9tVG99IDxhIGhyZWY9Jy91LyR7Z2lmdC5vdGhlcl91c2VyaWR9Jz4ke2dpZnQub3RoZXJfbmFtZX08L2E+PC9saT5gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIEFkZCBoaXN0b3J5IGl0ZW1zIHRvIHRoZSBsaXN0XG4gICAgICAgIGhpc3RvcnlMaXN0LmlubmVySFRNTCA9IGdpZnRzLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaGlzdG9yeUxpc3Q7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIE5vdGVzIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdOb3RlcycsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcbiAgICAgICAgZGVzYzogJ0FkZHMgYSBub3RlcyB0ZXh0Ym94JyxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAndGJvZHknO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgLy8gTG9jYXRlIHRoZSB0YWJsZSB3aXRoIHRoZSBjbGFzcyBcImNvbHRhYmxlXCJcbiAgICAgICAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29sdGFibGUnKSBhcyBIVE1MVGFibGVFbGVtZW50O1xuXG4gICAgICAgIGlmICh0YWJsZSkge1xuICAgICAgICAgICAgbGV0IHRib2R5ID0gdGFibGUucXVlcnlTZWxlY3RvcigndGJvZHknKTtcblxuICAgICAgICAgICAgY29uc3QgdXNlcklEID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9cXC91XFwvKFxcZCspLyk/LlsxXTtcbiAgICAgICAgICAgIGlmICghdXNlcklEKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVzZXIgSUQgbm90IGZvdW5kIGluIFVSTC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBuZXdSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgICAgICAgICAgY29uc3QgbmV3Q2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgICAgICBuZXdDZWxsLnNldEF0dHJpYnV0ZSgnY29sc3BhbicsICcyJyk7XG4gICAgICAgICAgICBuZXdDZWxsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAncm93MScpO1xuXG4gICAgICAgICAgICBjb25zdCBpbnB1dEZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgICAgIGlucHV0RmllbGQucm93cyA9IDQ7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLmNvbHMgPSAxMDA7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLnBsYWNlaG9sZGVyID0gJ0VudGVyIHlvdXIgbm90ZXMgaGVyZSc7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLnZhbHVlID0gR01fZ2V0VmFsdWUoYHVzZXJfbm90ZXNfJHt1c2VySUR9X3ZhbGAsICcnKTtcblxuICAgICAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdTYXZlIE5vdGUnO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIFwiU2F2ZWQhXCIgbWVzc2FnZSBzcGFuXG4gICAgICAgICAgICBjb25zdCBzYXZlZE1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBzYXZlZE1lc3NhZ2UuY2xhc3NOYW1lID0gJ21wX3NhdmVzdGF0ZSc7IC8vIEFwcGx5IHRoZSBzdHlsZSBzaW1pbGFyIHRvIHRoZSBleGFtcGxlXG4gICAgICAgICAgICBzYXZlZE1lc3NhZ2UudGV4dENvbnRlbnQgPSAnU2F2ZWQhJztcbiAgICAgICAgICAgIHNhdmVkTWVzc2FnZS5zdHlsZS5vcGFjaXR5ID0gJzAnOyAvLyBTdGFydCBoaWRkZW5cblxuICAgICAgICAgICAgLy8gQWRkIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgdG8gc2F2ZSB0aGUgbm90ZSBhbmQgZGlzcGxheSBcIlNhdmVkIVwiIG1lc3NhZ2VcbiAgICAgICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90ZVZhbHVlID0gaW5wdXRGaWVsZC52YWx1ZS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAobm90ZVZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBHTV9kZWxldGVWYWx1ZShgdXNlcl9ub3Rlc18ke3VzZXJJRH1fdmFsYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RlIGZvciB1c2VyICR7dXNlcklEfSBoYXMgYmVlbiBjbGVhcmVkLmApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGB1c2VyX25vdGVzXyR7dXNlcklEfV92YWxgLCBub3RlVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90ZSBmb3IgdXNlciAke3VzZXJJRH0gc2F2ZWQ6ICR7bm90ZVZhbHVlfWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNob3cgdGhlIFwiU2F2ZWQhXCIgbWVzc2FnZSBicmllZmx5XG4gICAgICAgICAgICAgICAgc2F2ZWRNZXNzYWdlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVkTWVzc2FnZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgICAgICAgICAgICAgIH0sIDIwMDApOyAvLyBIaWRlIGFmdGVyIDIgc2Vjb25kc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG5ld0NlbGwuYXBwZW5kQ2hpbGQoaW5wdXRGaWVsZCk7XG4gICAgICAgICAgICBuZXdDZWxsLmFwcGVuZENoaWxkKHNhdmVCdXR0b24pO1xuICAgICAgICAgICAgbmV3Q2VsbC5hcHBlbmRDaGlsZChzYXZlZE1lc3NhZ2UpOyAvLyBBZGQgdGhlIFwiU2F2ZWQhXCIgbWVzc2FnZSBzcGFuIHRvIHRoZSBjZWxsXG4gICAgICAgICAgICBuZXdSb3cuYXBwZW5kQ2hpbGQobmV3Q2VsbCk7XG4gICAgICAgICAgICB0Ym9keS5hcHBlbmRDaGlsZChuZXdSb3cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGFibGUgd2l0aCBjbGFzcyBcImNvbHRhYmxlXCIgbm90IGZvdW5kLicpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn0iLCIvKipcbiAqIFZBVUxUIEZFQVRVUkVTXG4gKi9cblxuY2xhc3MgU2ltcGxlVmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlZhdWx0LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3NpbXBsZVZhdWx0JyxcbiAgICAgICAgZGVzYzpcbiAgICAgICAgICAgICdTaW1wbGlmeSB0aGUgVmF1bHQgcGFnZXMuICg8ZW0+VGhpcyByZW1vdmVzIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBkb25hdGUgYnV0dG9uICZhbXA7IGxpc3Qgb2YgcmVjZW50IGRvbmF0aW9uczwvZW0+KScsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWFpbkJvZHknO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndmF1bHQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IHN1YlBhZ2U6IHN0cmluZyA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xuICAgICAgICBjb25zdCBwYWdlID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgY29uc29sZS5ncm91cChgQXBwbHlpbmcgVmF1bHQgKCR7c3ViUGFnZX0pIHNldHRpbmdzLi4uYCk7XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIGltcG9ydGFudCBwYXJ0cyBhbmQgcmVzZXQgdGhlIHBhZ2VcbiAgICAgICAgY29uc3QgZG9uYXRlQnRuOiBIVE1MRm9ybUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XG4gICAgICAgIGNvbnN0IGRvbmF0ZVRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAndGFibGU6bGFzdC1vZi10eXBlJ1xuICAgICAgICApO1xuICAgICAgICBwYWdlLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIGJ1dHRvbiBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKGRvbmF0ZUJ0biAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbmV3RG9uYXRlOiBIVE1MRm9ybUVsZW1lbnQgPSA8SFRNTEZvcm1FbGVtZW50PmRvbmF0ZUJ0bi5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld0RvbmF0ZSk7XG4gICAgICAgICAgICBuZXdEb25hdGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFnZS5pbm5lckhUTUwgPSAnPGgxPkNvbWUgYmFjayB0b21vcnJvdyE8L2gxPic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSB0YWJsZSBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKGRvbmF0ZVRibCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgZG9uYXRlVGJsLmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xuICAgICAgICAgICAgbmV3VGFibGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFnZS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzI1cHgnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNpbXBsaWZpZWQgdGhlIHZhdWx0IHBhZ2UhJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIFBvdEhpc3RvcnkgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlZhdWx0LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3BvdEhpc3RvcnknLFxuICAgICAgICBkZXNjOiAnQWRkIHRoZSBsaXN0IG9mIHJlY2VudCBkb25hdGlvbnMgdG8gdGhlIGRvbmF0aW9uIHBhZ2UuJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd2YXVsdCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3Qgc3ViUGFnZTogc3RyaW5nID0gR01fZ2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuICAgICAgICBjb25zdCBmb3JtID0gPEhUTUxFbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyICsgJyBmb3JtW21ldGhvZD1cInBvc3RcIl0nKVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHBvdFBhZ2VSZXNwID0gYXdhaXQgZmV0Y2goJy9taWxsaW9uYWlyZXMvcG90LnBocCcpO1xuICAgICAgICBpZiAoIXBvdFBhZ2VSZXNwLm9rKSB7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKFxuICAgICAgICAgICAgICAgIGBmYWlsZWQgdG8gZ2V0IC9taWxsaW9uYWlyZXMvcG90LnBocDogJHtwb3RQYWdlUmVzcC5zdGF0dXN9LyR7cG90UGFnZVJlc3Auc3RhdHVzVGV4dH1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFwcGx5aW5nIFZhdWx0ICgke3N1YlBhZ2V9KSBzZXR0aW5ncy4uLmApO1xuICAgICAgICBjb25zdCBwb3RQYWdlVGV4dDogc3RyaW5nID0gYXdhaXQgcG90UGFnZVJlc3AudGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgICAgIGNvbnN0IHBvdFBhZ2U6IERvY3VtZW50ID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhwb3RQYWdlVGV4dCwgJ3RleHQvaHRtbCcpO1xuXG4gICAgICAgIC8vIENsb25lIHRoZSBpbXBvcnRhbnQgcGFydHMgYW5kIHJlc2V0IHRoZSBwYWdlXG4gICAgICAgIGNvbnN0IGRvbmF0ZVRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwb3RQYWdlLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI21haW5UYWJsZSB0YWJsZTpsYXN0LW9mLXR5cGUnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUYmw6IEhUTUxUYWJsZUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKCd0YWJsZTpsYXN0LW9mLXR5cGUnKTtcblxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSB0YWJsZSBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKGRvbmF0ZVRibCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgZG9uYXRlVGJsLmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG5ld1RhYmxlLmNsYXNzTGlzdC5hZGQoJ21wX3ZhdWx0Q2xvbmUnKTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRUYmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VGJsLnJlcGxhY2VXaXRoKG5ld1RhYmxlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZm9ybSAhPT0gbnVsbCAmJiBmb3JtLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBmb3JtLnBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld1RhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgZG9uYXRpb24gaGlzdG9yeSB0byB0aGUgZG9uYXRpb24gcGFnZSEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogU1RPUkUgRkVBVFVSRVNcbiAqL1xuXG5jbGFzcyBHcmF5T3V0U3RvcmVQdXJjaGFzZXMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlN0b3JlLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2dyYXlPdXRTdG9yZVB1cmNoYXNlcycsXG4gICAgICAgIGRlc2M6IFwiR3JheSBvdXQgc3RvcmUgcHVyY2hhc2VzIHlvdSBjYW4ndCBhZmZvcmQsIGFuZCBkaXNhYmxlIHRob3NlIGJ1dHRvbnNcIixcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNjdXJyZW50Qm9udXNQb2ludHMnO1xuICAgIHByaXZhdGUgX21heFZpcERheXM6IG51bWJlciA9IDkwO1xuICAgIHByaXZhdGUgX3BvaW50c1BlckdiVXBsb2FkOiBudW1iZXIgPSA1MDA7XG4gICAgcHJpdmF0ZSBfcG9pbnRzUGVyVmlwQmxvY2s6IG51bWJlciA9IDUwMDA7XG4gICAgcHJpdmF0ZSBfdmlwQmxvY2tXZWVrczogbnVtYmVyID0gNDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3N0b3JlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zdCBwb2ludHMgPSB0aGlzLl9nZXRDdXJyZW5jeSgnI2N1cnJlbnRCb251c1BvaW50cycpO1xuICAgICAgICBjb25zdCBjaGVlc2UgPSB0aGlzLl9nZXRDdXJyZW5jeSgnI2N1cnJlbnRDaGVlc2UnKTtcbiAgICAgICAgY29uc3QgdmlwUmVtYWluaW5nRGF5cyA9IHRoaXMuX2dldFZpcFJlbWFpbmluZ0RheXMoKTtcbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnI21haW5Cb2R5IC5ib251c1JvdyBidXR0b24nXG4gICAgICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MQnV0dG9uRWxlbWVudD47XG5cbiAgICAgICAgYnV0dG9ucy5mb3JFYWNoKChidXR0b24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlYXNvbiA9IHRoaXMuX2dldERpc2FibGVSZWFzb24oXG4gICAgICAgICAgICAgICAgYnV0dG9uLFxuICAgICAgICAgICAgICAgIHBvaW50cyxcbiAgICAgICAgICAgICAgICBjaGVlc2UsXG4gICAgICAgICAgICAgICAgdmlwUmVtYWluaW5nRGF5c1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHJlYXNvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVQdXJjaGFzZShidXR0b24sIHJlYXNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21hcmtEaXNhYmxlZFNlY3Rpb25zKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW00rXSBEaXNhYmxlZCBzdG9yZSBwdXJjaGFzZXMgeW91IGNhbid0IGFmZm9yZCFcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0Q3VycmVuY3koc2VsZWN0b3I6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW0gPT09IG51bGwgfHwgZWxlbS50ZXh0Q29udGVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoZWxlbS50ZXh0Q29udGVudC5yZXBsYWNlKC9bXlxcZF0vZywgJycpLCAxMCkgfHwgMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRWaXBSZW1haW5pbmdEYXlzKCk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBjb25zdCB1c2VyTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN1c2VyTWVudSArIHVsJyk7XG4gICAgICAgIGNvbnN0IG1lbnVUZXh0ID0gdXNlck1lbnUgJiYgdXNlck1lbnUudGV4dENvbnRlbnQgPyB1c2VyTWVudS50ZXh0Q29udGVudCA6ICcnO1xuXG4gICAgICAgIGlmICgvRS1WSVB8VklQIG5vdCBzZXQgdG8gZXhwaXJlfGV0ZXJuYWwvaS50ZXN0KG1lbnVUZXh0KSkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRhdGVNYXRjaCA9IG1lbnVUZXh0Lm1hdGNoKFxuICAgICAgICAgICAgL1ZJUCBleHBpcmVzKD86XFxzK29uKT9cXHMrKFtBLVphLXpdezMsOX1cXHMrXFxkezEsMn0sP1xccytcXGR7NH18XFxkezR9LVxcZHsyfS1cXGR7Mn0pL2lcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoZGF0ZU1hdGNoID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4cGlyeSA9IG5ldyBEYXRlKGRhdGVNYXRjaFsxXSk7XG4gICAgICAgIGlmIChpc05hTihleHBpcnkuZ2V0VGltZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgTWF0aC5jZWlsKChleHBpcnkuZ2V0VGltZSgpIC0gRGF0ZS5ub3coKSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0RGlzYWJsZVJlYXNvbihcbiAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICAgICAgcG9pbnRzOiBudW1iZXIsXG4gICAgICAgIGNoZWVzZTogbnVtYmVyLFxuICAgICAgICB2aXBSZW1haW5pbmdEYXlzOiBudW1iZXIgfCBudWxsXG4gICAgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0aGlzLl9nZXRTdG9yZVNlY3Rpb24oYnV0dG9uKTtcbiAgICAgICAgY29uc3QgZml4ZWRDb3N0ID0gdGhpcy5fZ2V0Rml4ZWRDb3N0KGJ1dHRvbik7XG5cbiAgICAgICAgaWYgKGZpeGVkQ29zdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGZpeGVkQ29zdC5raW5kID09PSAncG9pbnRzJyAmJiBmaXhlZENvc3QuYW1vdW50ID4gcG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdOb3QgZW5vdWdoIGJvbnVzIHBvaW50cyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaXhlZENvc3Qua2luZCA9PT0gJ2NoZWVzZScgJiYgZml4ZWRDb3N0LmFtb3VudCA+IGNoZWVzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnTm90IGVub3VnaCBjaGVlc2UnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlY3Rpb24gPT09ICd1cGxvYWRDcmVkaXRDb250ZW50JyAmJiB0aGlzLl9pc1VwbG9hZE1heEJ1dHRvbihidXR0b24pKSB7XG4gICAgICAgICAgICBpZiAocG9pbnRzIDwgdGhpcy5fcG9pbnRzUGVyR2JVcGxvYWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ05lZWQgYXQgbGVhc3QgNTAwIGJvbnVzIHBvaW50cyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VjdGlvbiA9PT0gJ3ZpcFN0YXR1c0NvbnRlbnQnKSB7XG4gICAgICAgICAgICBpZiAodmlwUmVtYWluaW5nRGF5cyA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdFdGVybmFsIFZJUCBjYW5ub3QgYnV5IG1vcmUgVklQJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHRoaXMuX3dvdWxkRXhjZWVkVmlwTGltaXQoYnV0dG9uLCB2aXBSZW1haW5pbmdEYXlzKSAmJlxuICAgICAgICAgICAgICAgIHZpcFJlbWFpbmluZ0RheXMgIT09IG51bGxcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnV291bGQgZXhjZWVkIHRoZSA5MCBkYXkgVklQIGxpbWl0JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlwTWF4QnV0dG9uKGJ1dHRvbikgJiYgcG9pbnRzIDwgdGhpcy5fcG9pbnRzUGVyVmlwQmxvY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ05lZWQgYXQgbGVhc3QgNTAwMCBib251cyBwb2ludHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0U3RvcmVTZWN0aW9uKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBzZWN0aW9uID0gYnV0dG9uLmNsb3Nlc3QoJ2Rpdi5ib251c1JvdycpO1xuXG4gICAgICAgIGlmIChzZWN0aW9uID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gQXJyYXkuZnJvbShzZWN0aW9uLmNsYXNzTGlzdCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRDbGFzcyA9IGNsYXNzZXMuZmluZCgoaXRlbSkgPT4gaXRlbS5lbmRzV2l0aCgnQ29udGVudCcpKTtcblxuICAgICAgICByZXR1cm4gY29udGVudENsYXNzICE9PSB1bmRlZmluZWQgPyBjb250ZW50Q2xhc3MgOiAnJztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRGaXhlZENvc3QoXG4gICAgICAgIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnRcbiAgICApOiB7IGtpbmQ6ICdwb2ludHMnIHwgJ2NoZWVzZSc7IGFtb3VudDogbnVtYmVyIH0gfCBudWxsIHtcbiAgICAgICAgY29uc3QgdGl0bGUgPSBidXR0b24uZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuXG4gICAgICAgIGlmICh0aXRsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwb2ludHMgPSB0aXRsZS5tYXRjaCgvKFtcXGQsXSspXFxzK3BvaW50cy9pKTtcbiAgICAgICAgaWYgKHBvaW50cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBraW5kOiAncG9pbnRzJyxcbiAgICAgICAgICAgICAgICBhbW91bnQ6IHBhcnNlSW50KHBvaW50c1sxXS5yZXBsYWNlKC8sL2csICcnKSwgMTApLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoZWVzZSA9IHRpdGxlLm1hdGNoKC8oW1xcZCxdKylcXHMrY2hlZXNlL2kpO1xuICAgICAgICBpZiAoY2hlZXNlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdjaGVlc2UnLFxuICAgICAgICAgICAgICAgIGFtb3VudDogcGFyc2VJbnQoY2hlZXNlWzFdLnJlcGxhY2UoLywvZywgJycpLCAxMCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaXNVcGxvYWRNYXhCdXR0b24oYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gYnV0dG9uLnRleHRDb250ZW50ICE9PSBudWxsICYmIGJ1dHRvbi50ZXh0Q29udGVudC5pbmRleE9mKCdNYXgnKSA+IC0xO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2lzVmlwTWF4QnV0dG9uKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbi52YWx1ZSA9PT0gJ21heCc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfd291bGRFeGNlZWRWaXBMaW1pdChcbiAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICAgICAgdmlwUmVtYWluaW5nRGF5czogbnVtYmVyIHwgbnVsbFxuICAgICk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodmlwUmVtYWluaW5nRGF5cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzVmlwTWF4QnV0dG9uKGJ1dHRvbikpIHtcbiAgICAgICAgICAgIHJldHVybiB2aXBSZW1haW5pbmdEYXlzID49IHRoaXMuX21heFZpcERheXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3ZWVrc1RvQnV5ID0gcGFyc2VJbnQoYnV0dG9uLnZhbHVlLCAxMCk7XG4gICAgICAgIGlmIChpc05hTih3ZWVrc1RvQnV5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF5c1RvQnV5ID0gd2Vla3NUb0J1eSAqIDc7XG4gICAgICAgIHJldHVybiB2aXBSZW1haW5pbmdEYXlzICsgZGF5c1RvQnV5ID4gdGhpcy5fbWF4VmlwRGF5cztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kaXNhYmxlUHVyY2hhc2UoYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCwgcmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgYnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ21wX3N0b3JlX2Rpc2FibGVkJyk7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICBidXR0b24uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcblxuICAgICAgICBjb25zdCBjdXJyZW50VGl0bGUgPSBidXR0b24uZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuICAgICAgICBpZiAoY3VycmVudFRpdGxlICE9PSBudWxsICYmIGN1cnJlbnRUaXRsZS5pbmRleE9mKHJlYXNvbikgPT09IC0xKSB7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0aXRsZScsIGAke2N1cnJlbnRUaXRsZX0gfCAke3JlYXNvbn1gKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VGl0bGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgcmVhc29uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX21hcmtEaXNhYmxlZFNlY3Rpb25zKCkge1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnI21haW5Cb2R5IGRpdi5ib251c1Jvd1tjbGFzcyo9XCJDb250ZW50XCJdJ1xuICAgICAgICApIGFzIE5vZGVMaXN0T2Y8SFRNTERpdkVsZW1lbnQ+O1xuXG4gICAgICAgIHNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBzZWN0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xuICAgICAgICAgICAgaWYgKGJ1dHRvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBlbmFibGVkID0gQXJyYXkuZnJvbShidXR0b25zKS5zb21lKChidXR0b24pID0+ICFidXR0b24uZGlzYWJsZWQpO1xuICAgICAgICAgICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdtcF9zdG9yZV9kaXNhYmxlZF9zZWN0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLyoqXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFBMQUNFIEFMTCBNKyBGRUFUVVJFUyBIRVJFXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqXG4gKiBOZWFybHkgYWxsIGZlYXR1cmVzIGJlbG9uZyBoZXJlLCBhcyB0aGV5IHNob3VsZCBoYXZlIGludGVybmFsIGNoZWNrc1xuICogZm9yIERPTSBlbGVtZW50cyBhcyBuZWVkZWQuIE9ubHkgY29yZSBmZWF0dXJlcyBzaG91bGQgYmUgcGxhY2VkIGluIGBhcHAudHNgXG4gKlxuICogVGhpcyBkZXRlcm1pbmVzIHRoZSBvcmRlciBpbiB3aGljaCBzZXR0aW5ncyB3aWxsIGJlIGdlbmVyYXRlZCBvbiB0aGUgU2V0dGluZ3MgcGFnZS5cbiAqIFNldHRpbmdzIHdpbGwgYmUgZ3JvdXBlZCBieSB0eXBlIGFuZCBGZWF0dXJlcyBvZiBvbmUgdHlwZSB0aGF0IGFyZSBjYWxsZWQgYmVmb3JlXG4gKiBvdGhlciBGZWF0dXJlcyBvZiB0aGUgc2FtZSB0eXBlIHdpbGwgYXBwZWFyIGZpcnN0LlxuICpcbiAqIFRoZSBvcmRlciBvZiB0aGUgZmVhdHVyZSBncm91cHMgaXMgbm90IGRldGVybWluZWQgaGVyZS5cbiAqL1xuY2xhc3MgSW5pdEZlYXR1cmVzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBHbG9iYWwgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBIaWRlSG9tZSgpO1xuICAgICAgICBuZXcgQm9va21hcmtJY29ucygpO1xuICAgICAgICBuZXcgSGlkZVNlZWRib3goKTtcbiAgICAgICAgbmV3IEhpZGVEb25hdGlvbkJveCgpO1xuICAgICAgICBuZXcgQmx1cnJlZEhlYWRlcigpO1xuICAgICAgICBuZXcgVmF1bHRMaW5rKCk7XG4gICAgICAgIG5ldyBNaW5pVmF1bHRJbmZvKCk7XG4gICAgICAgIG5ldyBCb251c1BvaW50RGVsdGEoKTtcbiAgICAgICAgbmV3IEZpeGVkTmF2KCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBIb21lIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBIaWRlTmV3cygpO1xuICAgICAgICBuZXcgR2lmdE5ld2VzdCgpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2VhcmNoIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBUb2dnbGVTbmF0Y2hlZCgpO1xuICAgICAgICBuZXcgU3RpY2t5U25hdGNoZWRUb2dnbGUoKTtcbiAgICAgICAgbmV3IFBsYWludGV4dFNlYXJjaCgpO1xuICAgICAgICBuZXcgVG9nZ2xlU2VhcmNoYm94KCk7XG4gICAgICAgIG5ldyBCdWlsZFRhZ3MoKTtcbiAgICAgICAgbmV3IFJhbmRvbUJvb2soKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIEZyZWVsZWVjaCBQYWdlIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgQ29sbGFwc2VGcmVlbGVlY2hTZWN0aW9ucygpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgUmVxdWVzdCBQYWdlIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgR29vZHJlYWRzQnV0dG9uUmVxKCk7XG4gICAgICAgIG5ldyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzKCk7XG4gICAgICAgIG5ldyBQbGFpbnRleHRSZXF1ZXN0KCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUb3JyZW50IFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBHb29kcmVhZHNCdXR0b24oKTtcbiAgICAgICAgbmV3IFN0b3J5R3JhcGhCdXR0b24oKTtcbiAgICAgICAgbmV3IEF1ZGlibGVCdXR0b24oKTtcbiAgICAgICAgbmV3IEN1cnJlbnRseVJlYWRpbmcoKTtcbiAgICAgICAgbmV3IFRvckdpZnREZWZhdWx0KCk7XG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3QoKTtcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEljb25zKCk7XG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMSgpO1xuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDIoKTtcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEwzKCk7XG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RNaW4oKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFNob3V0Ym94IGZ1bmN0aW9uc1xuICAgICAgICBuZXcgUHJpb3JpdHlVc2VycygpO1xuICAgICAgICBuZXcgUHJpb3JpdHlTdHlsZSgpO1xuICAgICAgICBuZXcgTXV0ZWRVc2VycygpO1xuICAgICAgICBuZXcgUmVwbHlTaW1wbGUoKTtcbiAgICAgICAgbmV3IFJlcGx5UXVvdGUoKTtcbiAgICAgICAgbmV3IEdpZnRCdXR0b24oKTtcbiAgICAgICAgbmV3IFF1aWNrU2hvdXQoKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFZhdWx0IGZ1bmN0aW9uc1xuICAgICAgICBuZXcgU2ltcGxlVmF1bHQoKTtcbiAgICAgICAgbmV3IFBvdEhpc3RvcnkoKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFN0b3JlIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgR3JheU91dFN0b3JlUHVyY2hhc2VzKCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVc2VyIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBVc2VyR2lmdERlZmF1bHQoKTtcbiAgICAgICAgbmV3IFVzZXJHaWZ0SGlzdG9yeSgpO1xuICAgICAgICBuZXcgTm90ZXMoKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIEZvcnVtIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBGb3J1bUZMR2lmdCgpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgVXBsb2FkIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBTZWFyY2hGb3JEdXBsaWNhdGVzKCk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNoZWNrLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XG5cbi8qKlxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHNldHRpbmdzIGFuZCB0aGUgUHJlZmVyZW5jZXMgcGFnZVxuICogQG1ldGhvZCBpbml0OiB0dXJucyBmZWF0dXJlcycgc2V0dGluZ3MgaW5mbyBpbnRvIGEgdXNlYWJsZSB0YWJsZVxuICovXG5jbGFzcyBTZXR0aW5ncyB7XG4gICAgLy8gRnVuY3Rpb24gZm9yIGdhdGhlcmluZyB0aGUgbmVlZGVkIHNjb3Blc1xuICAgIHByaXZhdGUgc3RhdGljIF9nZXRTY29wZXMoc2V0dGluZ3M6IEFueUZlYXR1cmVbXSk6IFByb21pc2U8U2V0dGluZ0dsb2JPYmplY3Q+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnX2dldFNjb3BlcygnLCBzZXR0aW5ncywgJyknKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjb3BlTGlzdDogU2V0dGluZ0dsb2JPYmplY3QgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2V0dGluZyBvZiBzZXR0aW5ncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBOdW1iZXIoc2V0dGluZy5zY29wZSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIFNjb3BlIGV4aXN0cywgcHVzaCB0aGUgc2V0dGluZ3MgaW50byB0aGUgYXJyYXlcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGVMaXN0W2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZUxpc3RbaW5kZXhdLnB1c2goc2V0dGluZyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgY3JlYXRlIHRoZSBhcnJheVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0gPSBbc2V0dGluZ107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZShzY29wZUxpc3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiBmb3IgY29uc3RydWN0aW5nIHRoZSB0YWJsZSBmcm9tIGFuIG9iamVjdFxuICAgIHByaXZhdGUgc3RhdGljIF9idWlsZFRhYmxlKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnX2J1aWxkVGFibGUoJywgcGFnZSwgJyknKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cCA9IGA8dGJvZHk+PHRyPjx0ZCBjbGFzcz1cInJvdzFcIiBjb2xzcGFuPVwiMlwiPjxicj48c3Ryb25nPk1BTSsgdiR7XG4gICAgICAgICAgICAgICAgTVAuVkVSU0lPTlxuICAgICAgICAgICAgfTwvc3Ryb25nPiAtIEhlcmUgeW91IGNhbiBlbmFibGUgJmFtcDsgZGlzYWJsZSBhbnkgZmVhdHVyZSBmcm9tIHRoZSA8YSBocmVmPVwiL2YvdC80MTg2M1wiPk1BTSsgdXNlcnNjcmlwdDwvYT4hIEhvd2V2ZXIsIHRoZXNlIHNldHRpbmdzIGFyZSA8c3Ryb25nPk5PVDwvc3Ryb25nPiBzdG9yZWQgb24gTUFNOyB0aGV5IGFyZSBzdG9yZWQgd2l0aGluIHRoZSBUYW1wZXJtb25rZXkvR3JlYXNlbW9ua2V5IGV4dGVuc2lvbiBpbiB5b3VyIGJyb3dzZXIsIGFuZCBtdXN0IGJlIGN1c3RvbWl6ZWQgb24gZWFjaCBvZiB5b3VyIGJyb3dzZXJzL2RldmljZXMgc2VwYXJhdGVseS48YnI+PGJyPkZvciBhIGRldGFpbGVkIGxvb2sgYXQgdGhlIGF2YWlsYWJsZSBmZWF0dXJlcywgPGEgaHJlZj1cIiR7VXRpbC5kZXJlZmVyKFxuICAgICAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvd2lraS9GZWF0dXJlLU92ZXJ2aWV3J1xuICAgICAgICAgICAgKX1cIj5jaGVjayB0aGUgV2lraSE8L2E+PGJyPjxicj48L3RkPjwvdHI+YDtcblxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzY29wZU51bTogbnVtYmVyID0gTnVtYmVyKHNjb3BlKTtcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGhlIHNlY3Rpb24gdGl0bGVcbiAgICAgICAgICAgICAgICBvdXRwICs9IGA8dHI+PHRkIGNsYXNzPSdyb3cyJz4ke1NldHRpbmdHcm91cFtzY29wZU51bV19PC90ZD48dGQgY2xhc3M9J3JvdzEnPmA7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSByZXF1aXJlZCBpbnB1dCBmaWVsZCBiYXNlZCBvbiB0aGUgc2V0dGluZ1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2Vbc2NvcGVOdW1dKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOdW1iZXI6IG51bWJlciA9IE51bWJlcihzZXR0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTogQW55RmVhdHVyZSA9IHBhZ2Vbc2NvcGVOdW1dW3NldHRpbmdOdW1iZXJdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8aW5wdXQgdHlwZT0nY2hlY2tib3gnIGlkPScke2l0ZW0udGl0bGV9JyB2YWx1ZT0ndHJ1ZSc+JHtpdGVtLmRlc2N9PGJyPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxzcGFuIGNsYXNzPSdtcF9zZXRUYWcnPiR7aXRlbS50YWd9Ojwvc3Bhbj4gPGlucHV0IHR5cGU9J3RleHQnIGlkPScke2l0ZW0udGl0bGV9JyBwbGFjZWhvbGRlcj0nJHtpdGVtLnBsYWNlaG9sZGVyfScgY2xhc3M9J21wX3RleHRJbnB1dCcgc2l6ZT0nMjUnPiR7aXRlbS5kZXNjfTxicj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8c2VsZWN0IGlkPScke2l0ZW0udGl0bGV9JyBjbGFzcz0nbXBfZHJvcElucHV0Jz5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaXRlbS5vcHRpb25zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxvcHRpb24gdmFsdWU9JyR7a2V5fSc+JHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9wdGlvbnMhW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L29wdGlvbj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPC9zZWxlY3Q+JHtpdGVtLmRlc2N9PGJyPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlKSBjYXNlc1tpdGVtLnR5cGVdKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIHJvd1xuICAgICAgICAgICAgICAgIG91dHAgKz0gJzwvdGQ+PC90cj4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNhdmUgYnV0dG9uICYgbGFzdCBwYXJ0IG9mIHRoZSB0YWJsZVxuICAgICAgICAgICAgb3V0cCArPVxuICAgICAgICAgICAgICAgICc8dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGRpdiBpZD1cIm1wX3N1Ym1pdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlNhdmUgTSsgU2V0dGluZ3M/PzwvZGl2PjxkaXYgaWQ9XCJtcF9jb3B5XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+Q29weSBTZXR0aW5nczwvZGl2PjxkaXYgaWQ9XCJtcF9pbmplY3RcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5QYXN0ZSBTZXR0aW5nczwvZGl2PjxzcGFuIGNsYXNzPVwibXBfc2F2ZXN0YXRlXCIgc3R5bGU9XCJvcGFjaXR5OjBcIj5TYXZlZCE8L3NwYW4+PC90ZD48L3RyPjwvdGJvZHk+JztcblxuICAgICAgICAgICAgcmVzb2x2ZShvdXRwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgc2V0dGluZ3MgdmFsdWVzXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2dldFNldHRpbmdzKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KSB7XG4gICAgICAgIC8vIFV0aWwucHVyZ2VTZXR0aW5ncygpO1xuICAgICAgICBjb25zdCBhbGxWYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdfZ2V0U2V0dGluZ3MoJywgcGFnZSwgJylcXG5TdG9yZWQgR00ga2V5czonLCBhbGxWYWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5rZXlzKHBhZ2UpLmZvckVhY2goKHNjb3BlKSA9PiB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IHBhZ2VbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcblxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICdQcmVmOicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgU2V0OicsXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgVmFsdWU6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKHByZWYudGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0gJiYgR01fZ2V0VmFsdWUocHJlZi50aXRsZSkpIGNhc2VzW3ByZWYudHlwZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NldFNldHRpbmdzKG9iajogU2V0dGluZ0dsb2JPYmplY3QpIHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgX3NldFNldHRpbmdzKGAsIG9iaiwgJyknKTtcbiAgICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChzY29wZSkgPT4ge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IG9ialtOdW1iZXIoc2NvcGUpXVtOdW1iZXIoc2V0dGluZyldO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0uY2hlY2tlZCkgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucDogc3RyaW5nID0gZWxlbS52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnAgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgLCBpbnApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIGVsZW0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0pIGNhc2VzW3ByZWYudHlwZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNhdmVkIScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIF9jb3B5U2V0dGluZ3MoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZ21MaXN0ID0gR01fbGlzdFZhbHVlcygpO1xuICAgICAgICBjb25zdCBvdXRwOiBbc3RyaW5nLCBzdHJpbmddW10gPSBbXTtcblxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHN0b3JlZCBzZXR0aW5ncyBhbmQgcHVzaCB0byBvdXRwdXQgYXJyYXlcbiAgICAgICAgZ21MaXN0Lm1hcCgoc2V0dGluZykgPT4ge1xuICAgICAgICAgICAgLy8gRG9uJ3QgZXhwb3J0IG1wXyBzZXR0aW5ncyBhcyB0aGV5IHNob3VsZCBvbmx5IGJlIHNldCBhdCBydW50aW1lXG4gICAgICAgICAgICBpZiAoc2V0dGluZy5pbmRleE9mKCdtcF8nKSA8IDApIHtcbiAgICAgICAgICAgICAgICBvdXRwLnB1c2goW3NldHRpbmcsIEdNX2dldFZhbHVlKHNldHRpbmcpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvdXRwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBfcGFzdGVTZXR0aW5ncyhwYXlsb2FkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKGBfcGFzdGVTZXR0aW5ncyggKWApO1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IEpTT04ucGFyc2UocGF5bG9hZCk7XG4gICAgICAgIHNldHRpbmdzLmZvckVhY2goKHR1cGxlOiBbc3RyaW5nLCBzdHJpbmddW10pID0+IHtcbiAgICAgICAgICAgIGlmICh0dXBsZVsxXSkge1xuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGAke3R1cGxlWzBdfWAsIGAke3R1cGxlWzFdfWApO1xuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codHVwbGVbMF0sICc6ICcsIHR1cGxlWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdGhhdCBzYXZlcyB0aGUgdmFsdWVzIG9mIHRoZSBzZXR0aW5ncyB0YWJsZVxuICAgIHByaXZhdGUgc3RhdGljIF9zYXZlU2V0dGluZ3ModGltZXI6IG51bWJlciwgb2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9zYXZlU2V0dGluZ3MoKWApO1xuXG4gICAgICAgIGNvbnN0IHNhdmVzdGF0ZTogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLm1wX3NhdmVzdGF0ZScpIVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBnbVZhbHVlczogc3RyaW5nW10gPSBHTV9saXN0VmFsdWVzKCk7XG5cbiAgICAgICAgLy8gUmVzZXQgdGltZXIgJiBtZXNzYWdlXG4gICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTYXZpbmcuLi4nKTtcblxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHZhbHVlcyBzdG9yZWQgaW4gR00gYW5kIHJlc2V0IGV2ZXJ5dGhpbmdcbiAgICAgICAgZm9yIChjb25zdCBmZWF0dXJlIGluIGdtVmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGdtVmFsdWVzW2ZlYXR1cmVdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgLy8gT25seSBsb29wIG92ZXIgdmFsdWVzIHRoYXQgYXJlIGZlYXR1cmUgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBpZiAoIVsnbXBfdmVyc2lvbicsICdzdHlsZV90aGVtZSddLmluY2x1ZGVzKGdtVmFsdWVzW2ZlYXR1cmVdKSkge1xuICAgICAgICAgICAgICAgICAgICAvL2lmIG5vdCBwYXJ0IG9mIHByZWZlcmVuY2VzIHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdtVmFsdWVzW2ZlYXR1cmVdLmluZGV4T2YoJ21wXycpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShnbVZhbHVlc1tmZWF0dXJlXSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgc2V0dGluZ3MgdG8gR00gdmFsdWVzXG4gICAgICAgIHRoaXMuX3NldFNldHRpbmdzKG9iaik7XG5cbiAgICAgICAgLy8gRGlzcGxheSB0aGUgY29uZmlybWF0aW9uIG1lc3NhZ2VcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICAgICAgICAgIH0sIDIzNDUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhlIHNldHRpbmdzIHBhZ2UuXG4gICAgICogQHBhcmFtIHJlc3VsdCBWYWx1ZSB0aGF0IG11c3QgYmUgcGFzc2VkIGRvd24gZnJvbSBgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKWBcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgVGhlIGFycmF5IG9mIGZlYXR1cmVzIHRvIHByb3ZpZGUgc2V0dGluZ3MgZm9yXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBpbml0KHJlc3VsdDogYm9vbGVhbiwgc2V0dGluZ3M6IEFueUZlYXR1cmVbXSkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgb25seSBydW4gaWYgYENoZWNrLnBhZ2UoJ3NldHRpbmdzKWAgcmV0dXJucyB0cnVlICYgaXMgcGFzc2VkIGhlcmVcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cChgbmV3IFNldHRpbmdzKClgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyB0YWJsZSBoYXMgbG9hZGVkXG4gICAgICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnI21haW5Cb2R5ID4gdGFibGUnKS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgW00rXSBTdGFydGluZyB0byBidWlsZCBTZXR0aW5ncyB0YWJsZS4uLmApO1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgdGFibGUgZWxlbWVudHNcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nTmF2OiBFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gdGFibGUnKSE7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1RpdGxlOiBIVE1MSGVhZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XG4gICAgICAgICAgICAgICAgbGV0IHBhZ2VTY29wZTogU2V0dGluZ0dsb2JPYmplY3Q7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGFibGUgZWxlbWVudHMgYWZ0ZXIgdGhlIFByZWYgbmF2YmFyXG4gICAgICAgICAgICAgICAgc2V0dGluZ05hdi5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgc2V0dGluZ1RpdGxlKTtcbiAgICAgICAgICAgICAgICBzZXR0aW5nVGl0bGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHNldHRpbmdUYWJsZSk7XG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNldHRpbmdUYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogJ2NvbHRhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgY2VsbHNwYWNpbmc6ICcxJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICd3aWR0aDoxMDAlO21pbi13aWR0aDoxMDAlO21heC13aWR0aDoxMDAlOycsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ1RpdGxlLmlubmVySFRNTCA9ICdNQU0rIFNldHRpbmdzJztcbiAgICAgICAgICAgICAgICAvLyBHcm91cCBzZXR0aW5ncyBieSBwYWdlXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2NvcGVzKHNldHRpbmdzKVxuICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0YWJsZSBIVE1MIGZyb20gZmVhdHVyZSBzZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlU2NvcGUgPSBzY29wZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYnVpbGRUYWJsZShzY29wZXMpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgY29udGVudCBpbnRvIHRoZSBuZXcgdGFibGUgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ1RhYmxlLmlubmVySFRNTCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBNQU0rIFNldHRpbmdzIHRhYmxlIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VTY29wZTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2V0dGluZ3Moc2NvcGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZXM7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2V0dGluZ3MgYXJlIGRvbmUgbG9hZGluZ1xuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc3VibWl0JykhXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29weUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9jb3B5JykhXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzdGVCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfaW5qZWN0JykhXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNzVGltZXI6IG51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVTZXR0aW5ncyhzc1RpbWVyLCBzY29wZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4ocGFzdGVCdG4sIHRoaXMuX3Bhc3RlU2V0dGluZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9jb3B5U2V0dGluZ3MoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInR5cGVzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzdHlsZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2NvcmUudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9nbG9iYWwudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9icm93c2UudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9mcmVlbGVlY2gudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9mb3J1bS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2hvbWUudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9yZXF1ZXN0LnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvc2hvdXQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy90b3IudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy91cGxvYWQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy91c2VyLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdmF1bHQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9zdG9yZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZmVhdHVyZXMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNldHRpbmdzLnRzXCIgLz5cblxuLyoqXG4gKiAqIFVzZXJzY3JpcHQgbmFtZXNwYWNlXG4gKiBAY29uc3RhbnQgQ0hBTkdFTE9HOiBPYmplY3QgY29udGFpbmluZyBhIGxpc3Qgb2YgY2hhbmdlcyBhbmQga25vd24gYnVnc1xuICogQGNvbnN0YW50IFRJTUVTVEFNUDogUGxhY2Vob2xkZXIgaG9vayBmb3IgdGhlIGN1cnJlbnQgYnVpbGQgdGltZVxuICogQGNvbnN0YW50IFZFUlNJT046IFRoZSBjdXJyZW50IHVzZXJzY3JpcHQgdmVyc2lvblxuICogQGNvbnN0YW50IFBSRVZfVkVSOiBUaGUgbGFzdCBpbnN0YWxsZWQgdXNlcnNjcmlwdCB2ZXJzaW9uXG4gKiBAY29uc3RhbnQgRVJST1JMT0c6IFRoZSB0YXJnZXQgYXJyYXkgZm9yIGxvZ2dpbmcgZXJyb3JzXG4gKiBAY29uc3RhbnQgUEFHRV9QQVRIOiBUaGUgY3VycmVudCBwYWdlIFVSTCB3aXRob3V0IHRoZSBzaXRlIGFkZHJlc3NcbiAqIEBjb25zdGFudCBNUF9DU1M6IFRoZSBNQU0rIHN0eWxlc2hlZXRcbiAqIEBjb25zdGFudCBydW4oKTogU3RhcnRzIHRoZSB1c2Vyc2NyaXB0XG4gKi9cbm5hbWVzcGFjZSBNUCB7XG4gICAgZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ2RlYnVnJykgPyB0cnVlIDogZmFsc2U7XG4gICAgZXhwb3J0IGNvbnN0IENIQU5HRUxPRzogQXJyYXlPYmplY3QgPSB7XG4gICAgICAgIC8qIPCfhpXimbvvuI/wn5CeICovXG4gICAgICAgIFVQREFURV9MSVNUOiBbXG4gICAgICAgICAgICAn8J+GlTogQWRkZWQgR2lmdCBBbGwgYnV0dG9uIHRvIHRoZSBOZXcgVXNlcnMgcGFnZS4gVGhhbmtzIEBzaGVybWFuNzY0MDAhISEnLFxuICAgICAgICAgICAgJ/CfhpU6IEFkZGVkIGEgc3BvdCB0byBzYXZlIG5vdGVzIG9uIHVzZXIgcGFnZXMuIEFsc28gdGhhbmtzIEBzaGVybWFuNzY0MDAhJyxcbiAgICAgICAgXSBhcyBzdHJpbmdbXSxcbiAgICAgICAgQlVHX0xJU1Q6IFtdIGFzIHN0cmluZ1tdLFxuICAgIH07XG4gICAgZXhwb3J0IGNvbnN0IFRJTUVTVEFNUDogc3RyaW5nID0gJyMjbWV0YV90aW1lc3RhbXAjIyc7XG4gICAgZXhwb3J0IGNvbnN0IFZFUlNJT046IHN0cmluZyA9IENoZWNrLm5ld1ZlcjtcbiAgICBleHBvcnQgY29uc3QgUFJFVl9WRVI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IENoZWNrLnByZXZWZXI7XG4gICAgZXhwb3J0IGNvbnN0IEVSUk9STE9HOiBzdHJpbmdbXSA9IFtdO1xuICAgIGV4cG9ydCBjb25zdCBQQUdFX1BBVEg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICBleHBvcnQgY29uc3QgTVBfQ1NTOiBTdHlsZSA9IG5ldyBTdHlsZSgpO1xuICAgIGV4cG9ydCBjb25zdCBzZXR0aW5nc0dsb2I6IEFueUZlYXR1cmVbXSA9IFtdO1xuXG4gICAgZXhwb3J0IGNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqICogUFJFIFNDUklQVFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc29sZS5ncm91cChgV2VsY29tZSB0byBNQU0rIHYke1ZFUlNJT059IWApO1xuXG4gICAgICAgIC8vIFRoZSBjdXJyZW50IHBhZ2UgaXMgbm90IHlldCBrbm93blxuICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcbiAgICAgICAgQ2hlY2sucGFnZSgpO1xuICAgICAgICAvLyBBZGQgYSBzaW1wbGUgY29va2llIHRvIGFubm91bmNlIHRoZSBzY3JpcHQgaXMgYmVpbmcgdXNlZFxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSAnbXBfZW5hYmxlZD0xO2RvbWFpbj1teWFub25hbW91c2UubmV0O3BhdGg9LztzYW1lc2l0ZT1sYXgnO1xuICAgICAgICAvLyBJbml0aWFsaXplIGNvcmUgZnVuY3Rpb25zXG4gICAgICAgIGNvbnN0IGFsZXJ0czogQWxlcnRzID0gbmV3IEFsZXJ0cygpO1xuICAgICAgICBuZXcgRGVidWcoKTtcbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIGlmIHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcbiAgICAgICAgQ2hlY2sudXBkYXRlZCgpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkgYWxlcnRzLm5vdGlmeShyZXN1bHQsIENIQU5HRUxPRyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBmZWF0dXJlc1xuICAgICAgICBuZXcgSW5pdEZlYXR1cmVzKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICogU0VUVElOR1NcbiAgICAgICAgICovXG4gICAgICAgIENoZWNrLnBhZ2UoJ3NldHRpbmdzJykudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJQZzogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgJiYgKHN1YlBnID09PSAnJyB8fCBzdWJQZyA9PT0gJz92aWV3PWdlbmVyYWwnKSkge1xuICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIHNldHRpbmdzIHBhZ2VcbiAgICAgICAgICAgICAgICBTZXR0aW5ncy5pbml0KHJlc3VsdCwgc2V0dGluZ3NHbG9iKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICogU1RZTEVTXG4gICAgICAgICAqIEluamVjdHMgQ1NTXG4gICAgICAgICAqL1xuICAgICAgICBDaGVjay5lbGVtTG9hZCgnaGVhZCBsaW5rW2hyZWYqPVwiSUNHc3RhdGlvblwiXScpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQWRkIGN1c3RvbSBDU1Mgc2hlZXRcbiAgICAgICAgICAgIE1QX0NTUy5pbmplY3RMaW5rKCk7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgc2l0ZSB0aGVtZVxuICAgICAgICAgICAgTVBfQ1NTLmFsaWduVG9TaXRlVGhlbWUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH07XG59XG5cbi8vICogU3RhcnQgdGhlIHVzZXJzY3JpcHRcbk1QLnJ1bigpO1xuIl19
