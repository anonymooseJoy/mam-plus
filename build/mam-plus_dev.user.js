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
     * #### Return today's UTC date in YYYY-MM-DD format
     */
    static getUTCDateString(date = new Date()) {
        return date.toISOString().split('T')[0];
    }
    /**
     * #### Read the local recent point-gift store and drop stale or malformed entries
     */
    static getRecentPointGifts() {
        const key = 'mp_recentPointGifts';
        const today = Util.getUTCDateString();
        const rawGiftHistory = GM_getValue(key);
        if (!rawGiftHistory) {
            GM_setValue(key, '[]');
            return [];
        }
        let parsed;
        try {
            parsed = JSON.parse(rawGiftHistory);
        }
        catch (error) {
            console.warn('[M+] Invalid recent point-gift data; resetting store.', error);
            GM_setValue(key, '[]');
            return [];
        }
        if (!Array.isArray(parsed)) {
            GM_setValue(key, '[]');
            return [];
        }
        const sanitized = parsed
            .map((gift) => {
            return {
                amount: Number(gift.amount),
                userID: `${gift.userID || ''}`,
                utcDate: `${gift.utcDate || ''}`,
            };
        })
            .filter((gift) => {
            return (gift.userID !== '' &&
                !isNaN(gift.amount) &&
                gift.amount > 0 &&
                gift.utcDate === today);
        });
        if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
            GM_setValue(key, JSON.stringify(sanitized));
        }
        return sanitized;
    }
    /**
     * #### Save a point-gift total for a user for the current UTC day
     */
    static recordPointGift(userID, amount) {
        const key = 'mp_recentPointGifts';
        const today = Util.getUTCDateString();
        const normalizedID = `${userID}`;
        const giftHistory = Util.getRecentPointGifts();
        const existing = giftHistory.find((gift) => gift.userID === normalizedID);
        if (existing) {
            existing.amount += amount;
        }
        else {
            giftHistory.unshift({
                amount,
                userID: normalizedID,
                utcDate: today,
            });
        }
        GM_setValue(key, JSON.stringify(giftHistory));
    }
    /**
     * #### Sum locally stored point gifts sent to a user today
     */
    static getSentPointsToday(userID) {
        const normalizedID = `${userID}`;
        return Util.getRecentPointGifts()
            .filter((gift) => gift.userID === normalizedID)
            .reduce((sum, gift) => sum + gift.amount, 0);
    }
    /**
     * #### Determine the maximum points a user can receive today
     *
     * When the current page exposes a native gift input, prefer its `max` value.
     * Otherwise fall back to the site's normal point-gift cap.
     */
    static getPointGiftDailyLimit() {
        const selectors = ['#bonusgift', '#thanksArea input[name=points]'];
        for (const selector of selectors) {
            const pointBox = document.querySelector(selector);
            if (pointBox) {
                const maxPoints = parseInt(pointBox.getAttribute('max') || '');
                if (!isNaN(maxPoints) && maxPoints > 0) {
                    return maxPoints;
                }
            }
        }
        return 1000;
    }
    /**
     * #### Return how many points can still be sent to a user today
     */
    static getRemainingPointGiftAllowance(userID) {
        return Math.max(Util.getPointGiftDailyLimit() - Util.getSentPointsToday(userID), 0);
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
/**
 * #### Convert a human-readable size string into bytes
 * Example inputs: `53.79 GiB`, `102.885 TiB`
 */
Util.parseSizeToBytes = (text) => {
    const match = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(Bytes|KiB|MiB|GiB|TiB|PiB|EiB|ZiB|YiB)/i);
    if (match === null) {
        throw new Error(`Could not parse size from "${text}"`);
    }
    const value = parseFloat(match[1]);
    const unit = match[2];
    const sizeMap = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const power = sizeMap.findIndex((item) => item.toLowerCase() === unit.toLowerCase());
    if (power < 0) {
        throw new Error(`Unknown size unit "${unit}"`);
    }
    return value * Math.pow(1024, power);
};
/**
 * #### Calculate the extra upload needed to reach a target ratio
 */
Util.uploadNeededForTargetRatio = (uploadedBytes, downloadedBytes, targetRatio) => {
    if (downloadedBytes <= 0 || targetRatio <= 0) {
        return 0;
    }
    return Math.max(0, targetRatio * downloadedBytes - uploadedBytes);
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
const updateBrowseResultVisibility = (row) => {
    const hiddenBySnatched = row.dataset.mpHideSnatched === 'true';
    const hiddenByBookmarked = row.dataset.mpHideBookmarked === 'true';
    row.style.display = hiddenBySnatched || hiddenByBookmarked ? 'none' : 'table-row';
};
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
        this._rowStateKey = 'mpHideSnatched';
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
                    snatch.dataset[this._rowStateKey] = 'true';
                }
                else {
                    btn.innerHTML = 'Hide Snatched';
                    snatch.dataset[this._rowStateKey] = 'false';
                }
            }
            else {
                snatch.dataset[this._rowStateKey] = 'false';
            }
            updateBrowseResultVisibility(snatch);
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
            desc: `Make snatched toggle state persist between page loads`,
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
 * Allows Bookmarked torrents to be hidden/shown
 */
class ToggleBookmarked {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'toggleBookmarked',
            desc: `Add a button to hide/show results that you've bookmarked`,
        };
        this._tar = '#ssr';
        this._isVisible = true;
        this._bookmarkHook = 'a[id ^= "torDeBookmark"]';
        this._rowStateKey = 'mpHideBookmarked';
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
            if (storedState === 'false' && GM_getValue('stickyBookmarkedToggle') === true) {
                this._setVisState(false);
            }
            else {
                this._setVisState(true);
            }
            const toggleText = this._isVisible ? 'Hide Bookmarked' : 'Show Bookmarked';
            yield Promise.all([
                (toggle = Util.createButton('bookmarkedToggle', toggleText, 'h1', '#resetNewIcon', 'beforebegin', 'torFormButton')),
                (resultList = this._share.getSearchList()),
            ]);
            toggle
                .then((btn) => {
                btn.addEventListener('click', () => {
                    if (this._isVisible === true) {
                        btn.innerHTML = 'Show Bookmarked';
                        this._setVisState(false);
                    }
                    else {
                        btn.innerHTML = 'Hide Bookmarked';
                        this._setVisState(true);
                    }
                    this._filterResults(results, this._bookmarkHook);
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                results = res;
                this._searchList = res;
                this._filterResults(results, this._bookmarkHook);
                console.log('[M+] Added the Toggle Bookmarked button!');
            }))
                .then(() => {
                Check.elemObserver('#ssr', () => {
                    resultList = this._share.getSearchList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        results = res;
                        this._searchList = res;
                        this._filterResults(results, this._bookmarkHook);
                    }));
                }, {
                    childList: true,
                    subtree: true,
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
        list.forEach((bookmark) => {
            const btn = (document.querySelector('#mp_bookmarkedToggle'));
            const result = bookmark.querySelector(subTar);
            if (result !== null) {
                if (this._isVisible === false) {
                    btn.innerHTML = 'Show Bookmarked';
                    bookmark.dataset[this._rowStateKey] = 'true';
                }
                else {
                    btn.innerHTML = 'Hide Bookmarked';
                    bookmark.dataset[this._rowStateKey] = 'false';
                }
            }
            else {
                bookmark.dataset[this._rowStateKey] = 'false';
            }
            updateBrowseResultVisibility(bookmark);
        });
    }
    _setVisState(val) {
        if (MP.DEBUG) {
            console.log('Bookmark vis state:', this._isVisible, '\nval:', val);
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
 * Remembers the state of ToggleBookmarked between page loads
 */
class StickyBookmarkedToggle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'stickyBookmarkedToggle',
            desc: `Make bookmarked toggle state persist between page loads`,
        };
        this._tar = '#ssr';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Remembered bookmark visibility state!');
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
        GM_setValue(`${this._settings.title}State`, val);
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
 * Adds a filetype picker that writes MAM's @filetype filter into search text
 */
class FiletypeSearchFilter {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'filetypeSearchFilter',
            desc: `Add a filetype picker that inserts @filetype filters into search text`,
        };
        this._tar = '#torSearch';
        this._queryTar = '#torTitle';
        this._panelTar = '#mp_filetypeSearchPanel';
        this._toggleTar = '#mp_filetypeSearchToggle';
        this._defaultFiletypes = [
            'epub',
            'pdf',
            'mobi',
            'azw3',
            'azw',
            'txt',
            'rtf',
            'doc',
            'docx',
            'lit',
            'djvu',
            'cbz',
            'cbr',
            'cb7',
            'm4b',
            'mp3',
            'm4a',
            'flac',
        ];
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const form = document.querySelector(this._tar);
            const queryInput = document.querySelector(this._queryTar);
            const anchorTarget = document.querySelector('#resetNewIcon');
            if (form === null || queryInput === null || anchorTarget === null) {
                throw new Error('Could not initialize filetype search filter');
            }
            const allFiletypes = this._getAllFiletypes(queryInput.value);
            const selectedFiletypes = new Set(this._parseFiletypes(queryInput.value));
            const toggle = yield Util.createButton('filetypeSearchToggle', 'File Types', 'h1', anchorTarget, 'afterend', 'torFormButton');
            toggle.insertAdjacentHTML('afterend', `
                <div id="mp_filetypeSearchPanel" class="mp_filetypeSearchPanel" style="display: none;">
                    <div class="mp_filetypeSearchActions">
                        <span id="mp_filetypeSearchAll" class="mp_plainBtn" role="button">All</span>
                        <span id="mp_filetypeSearchNone" class="mp_plainBtn" role="button">None</span>
                    </div>
                    <div class="mp_filetypeSearchGrid">
                        ${allFiletypes
                .map((type) => {
                const checked = selectedFiletypes.has(type) ? 'checked' : '';
                return `<label class="mp_filetypeSearchItem"><input type="checkbox" value="${type}" ${checked}> ${type}</label>`;
            })
                .join('')}
                    </div>
                </div>
            `);
            toggle.id = 'mp_filetypeSearchToggle';
            toggle.addEventListener('click', () => {
                this._togglePanel();
            });
            this._bindPanelActions(queryInput);
            this._syncSelectionsFromQuery(queryInput);
            queryInput.addEventListener('change', () => {
                this._syncSelectionsFromQuery(queryInput);
            });
            queryInput.addEventListener('blur', () => {
                this._syncSelectionsFromQuery(queryInput);
            });
            form.addEventListener('submit', () => {
                this._applySelectionToQuery(queryInput);
            });
            console.log('[M+] Added the filetype search filter!');
        });
    }
    _bindPanelActions(queryInput) {
        const panel = document.querySelector(this._panelTar);
        const selectAll = document.querySelector('#mp_filetypeSearchAll');
        const selectNone = document.querySelector('#mp_filetypeSearchNone');
        if (panel === null || selectAll === null || selectNone === null) {
            throw new Error('Could not bind filetype search controls');
        }
        panel.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                this._applySelectionToQuery(queryInput);
            });
        });
        selectAll.addEventListener('click', () => {
            panel.querySelectorAll('input[type="checkbox"]').forEach((box) => {
                box.checked = true;
            });
            this._applySelectionToQuery(queryInput);
        });
        selectNone.addEventListener('click', () => {
            panel.querySelectorAll('input[type="checkbox"]').forEach((box) => {
                box.checked = false;
            });
            this._applySelectionToQuery(queryInput);
        });
    }
    _togglePanel() {
        const panel = document.querySelector(this._panelTar);
        const toggle = document.querySelector(this._toggleTar);
        if (panel === null || toggle === null) {
            return;
        }
        const isOpen = panel.style.display === 'block';
        panel.style.display = isOpen ? 'none' : 'block';
        toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    }
    _syncSelectionsFromQuery(queryInput) {
        const selectedFiletypes = new Set(this._parseFiletypes(queryInput.value));
        const panel = document.querySelector(this._panelTar);
        if (panel === null) {
            return;
        }
        panel.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.checked = selectedFiletypes.has(checkbox.value);
        });
    }
    _applySelectionToQuery(queryInput) {
        const panel = document.querySelector(this._panelTar);
        if (panel === null) {
            return;
        }
        const selectedFiletypes = [];
        panel.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            if (checkbox.checked) {
                selectedFiletypes.push(checkbox.value);
            }
        });
        const baseQuery = this._stripFiletypeToken(queryInput.value);
        if (selectedFiletypes.length === 0) {
            queryInput.value = baseQuery;
        }
        else {
            const filterToken = `@filetype{${selectedFiletypes.join('|')}}`;
            queryInput.value = baseQuery === '' ? filterToken : `${baseQuery} ${filterToken}`;
        }
    }
    _getAllFiletypes(queryText) {
        const seen = {};
        const merged = [];
        const resultFiletypes = Array.from(document.querySelectorAll('.torFileTypes a')).map((type) => type.textContent.trim().toLowerCase());
        const queryFiletypes = this._parseFiletypes(queryText);
        [...this._defaultFiletypes, ...resultFiletypes, ...queryFiletypes].forEach((type) => {
            if (type !== '' && seen[type] !== true) {
                seen[type] = true;
                merged.push(type);
            }
        });
        return merged.sort();
    }
    _parseFiletypes(queryText) {
        const match = queryText.match(/@filetype\{([^}]*)\}/i);
        if (match === null || match[1].trim() === '') {
            return [];
        }
        return match[1]
            .split('|')
            .map((type) => type.trim().toLowerCase())
            .filter((type) => type !== '');
    }
    _stripFiletypeToken(queryText) {
        return queryText
            .replace(/\s*@filetype\{[^}]*\}\s*/gi, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
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
 * Adds multi-select checkboxes and bulk actions to browse results
 */
class MultiSelectBrowse {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'multiSelectBrowse',
            desc: `Add checkboxes and bulk actions to search results`,
        };
        this._tar = '#ssr';
        this._share = new Shared();
        this._toolbarID = 'mp_multiSelectToolbar';
        this._checkboxClass = 'mp_multiSelectBox';
        this._rowFlag = 'mpMultiSelectReady';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._ensureToolbar();
            this._decorateResults(yield this._share.getSearchList());
            Check.elemObserver('#ssr', () => __awaiter(this, void 0, void 0, function* () {
                this._ensureToolbar();
                this._decorateResults(yield this._share.getSearchList());
            }));
            Check.elemObserver('body', () => {
                this._ensureToolbar();
            }, {
                childList: true,
                subtree: true,
            });
            console.log('[M+] Added multi-select browse actions!');
        });
    }
    _ensureToolbar() {
        const existingToolbar = document.getElementById(this._toolbarID);
        const massActions = this._findMassActionsAnchor();
        if (existingToolbar !== null) {
            if (massActions !== null &&
                existingToolbar.parentElement !== massActions) {
                existingToolbar.className =
                    'mp_multiSelectToolbar mp_multiSelectToolbar_massActions';
                massActions.classList.add('mp_multiSelectHost');
                massActions.appendChild(existingToolbar);
            }
            return;
        }
        const toolbar = document.createElement('div');
        toolbar.id = this._toolbarID;
        toolbar.className = massActions
            ? 'mp_multiSelectToolbar mp_multiSelectToolbar_massActions'
            : 'mp_multiSelectToolbar';
        toolbar.innerHTML = `
            <span id="mp_multiSelectAll" class="mp_plainBtn" role="button">Select All</span>
            <span id="mp_multiSelectNone" class="mp_plainBtn" role="button">Select None</span>
            <span id="mp_multiSelectOpen" class="mp_plainBtn" role="button">Open Selected</span>
            <span id="mp_multiSelectDownload" class="mp_plainBtn" role="button">Download Selected</span>
            <span id="mp_multiSelectBookmark" class="mp_plainBtn" role="button">Bookmark Selected</span>
        `;
        if (massActions !== null) {
            massActions.classList.add('mp_multiSelectHost');
            massActions.appendChild(toolbar);
        }
        else {
            const anchorTarget = document.querySelector('#resetNewIcon') || document.querySelector('#ssr');
            if (anchorTarget === null || anchorTarget.parentElement === null) {
                throw new Error('Could not create multi-select browse toolbar');
            }
            anchorTarget.insertAdjacentElement('beforebegin', toolbar);
        }
        document.getElementById('mp_multiSelectAll').addEventListener('click', () => {
            this._setCheckedState(true);
        });
        document.getElementById('mp_multiSelectNone').addEventListener('click', () => {
            this._setCheckedState(false);
        });
        document.getElementById('mp_multiSelectOpen').addEventListener('click', () => {
            this._openSelected();
        });
        document.getElementById('mp_multiSelectDownload').addEventListener('click', () => {
            this._downloadSelected();
        });
        document.getElementById('mp_multiSelectBookmark').addEventListener('click', () => {
            this._bookmarkSelected();
        });
    }
    _decorateResults(results) {
        results.forEach((result) => {
            if (result.dataset[this._rowFlag] === 'true') {
                return;
            }
            const firstCell = result.querySelector('td');
            if (firstCell === null) {
                return;
            }
            const boxWrap = document.createElement('span');
            boxWrap.className = 'mp_multiSelectWrap';
            boxWrap.innerHTML = `<input type="checkbox" class="${this._checkboxClass}" aria-label="Select search result">`;
            firstCell.insertBefore(boxWrap, firstCell.firstChild);
            result.dataset[this._rowFlag] = 'true';
        });
    }
    _selectedResults() {
        return Array.from(document.querySelectorAll('#ssr tr[id ^= "tdr"]')).filter((row) => {
            const box = row.querySelector(`.${this._checkboxClass}`);
            return box !== null && box.checked;
        });
    }
    _setCheckedState(checked) {
        document
            .querySelectorAll(`#ssr .${this._checkboxClass}`)
            .forEach((box) => (box.checked = checked));
    }
    _openSelected() {
        this._selectedResults().forEach((row) => {
            var _a;
            const rowID = row.id.match(/^tdr-?(\d+)$/);
            const targetURL = rowID !== null
                ? `${window.location.origin}/t/${rowID[1]}`
                : (_a = row.querySelector('.torTitle')) === null || _a === void 0 ? void 0 : _a.href;
            if (targetURL) {
                window.open(targetURL, '_blank');
            }
        });
    }
    _downloadSelected() {
        this._selectedResults().forEach((row) => {
            const downloadLink = row.querySelector('.directDownload');
            if (downloadLink !== null) {
                downloadLink.click();
            }
        });
    }
    _bookmarkSelected() {
        this._selectedResults().forEach((row) => {
            const bookmarkLink = row.querySelector('a[id^="torBookmark"]');
            if (bookmarkLink !== null) {
                bookmarkLink.click();
            }
        });
    }
    get settings() {
        return this._settings;
    }
    _findMassActionsAnchor() {
        const massActions = document.querySelector('#massActions');
        if (massActions !== null) {
            return massActions;
        }
        const bookmarkActions = document.querySelector('#bookmarkActions');
        if (bookmarkActions !== null) {
            return bookmarkActions;
        }
        const massActionButton = document.querySelector('button[data-bmType]');
        if (massActionButton !== null && massActionButton.parentElement !== null) {
            return massActionButton.parentElement;
        }
        const massActionsLabel = Array.from(document.querySelectorAll('h1, h2, h3, h4, strong')).find((elem) => { var _a; return ((_a = elem.textContent) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) === 'mass actions'; });
        if (massActionsLabel) {
            return massActionsLabel.parentElement;
        }
        return null;
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
        this._giftedStoreKey = 'mp_lastNewGifted';
        this._giftedStoreLimit = 500;
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
            Util.getRecentPointGifts();
            //get the FrontPage NewMembers element containing newest 10 members
            const fpNM = document.querySelector('#fpNM');
            const members = Array.prototype.slice.call(fpNM.getElementsByTagName('a'));
            const lastMem = members[members.length - 1];
            members.forEach((member) => {
                //add a class to the existing element for use in reference in creating buttons
                member.classList.add(`mp_refPoint_${Util.endOfHref(member)}`);
                this._markKnownGiftStatus(member);
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
                let skippedCount = 0;
                for (const member of members) {
                    //update the text to show processing
                    document.getElementById('mp_giftAllMsg').innerText =
                        'Sending Gifts... Please Wait';
                    //if user has not been gifted
                    if (!member.classList.contains('mp_gifted')) {
                        //get the members name for JSON string
                        const userName = member.innerText;
                        //get the points amount from the input box
                        const giftFinalAmount = Number((document.getElementById('mp_giftAmounts')).value);
                        const memberID = Util.endOfHref(member);
                        const remainingAllowance = Util.getRemainingPointGiftAllowance(memberID);
                        if (remainingAllowance < giftFinalAmount) {
                            skippedCount += 1;
                            console.warn(`[M+] Skipping ${userName}; ${remainingAllowance} points remaining today.`);
                            if (remainingAllowance === 0) {
                                this._markGiftedMember(member, 'Maximum daily points already sent today');
                            }
                            continue;
                        }
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
                        const json = JSON.parse(jsonResult);
                        //if gift was successfully sent
                        if (json.success) {
                            this._recordSuccessfulGift(member, giftFinalAmount);
                        }
                        else if (!json.success) {
                            console.warn(json.error);
                        }
                    }
                }
                //disable button after send
                giftAllBtn.disabled = true;
                document.getElementById('mp_giftAllMsg').innerText =
                    skippedCount > 0
                        ? `Gifts completed. Skipped ${skippedCount} over daily limit.`
                        : 'Gifts completed to all Checked Users';
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
            Util.getRecentPointGifts();
            // Select the container holding the newest members
            const fpNM = document.querySelector('.blockCon');
            const footer = document.querySelector('.blockFoot');
            const memberLabels = this._getNewUsersMembers(fpNM);
            const getAvailablePoints = () => {
                const bonusPointText = document.getElementById('tmBP').innerText.split(':')[1];
                const match = bonusPointText.match(/[\d,]+/);
                if (match === null) {
                    return 0;
                }
                return parseInt(match[0].replace(/,/g, ''));
            };
            // Loop through each member and check if they were previously gifted
            memberLabels.forEach(({ member }) => {
                const memberRef = `mp_refPoint_${Util.endOfHref(member)}`;
                member.classList.add(memberRef);
                this._markKnownGiftStatus(member);
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
                let skippedCount = 0;
                const giftAmount = Number(document.getElementById('mp_giftAmounts').value);
                for (const { member, checkbox } of memberLabels) {
                    if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                        const userName = member.innerText;
                        const memberID = Util.endOfHref(member);
                        const remainingAllowance = Util.getRemainingPointGiftAllowance(memberID);
                        if (remainingAllowance < giftAmount) {
                            skippedCount += 1;
                            console.warn(`[M+] Skipping ${userName}; ${remainingAllowance} points remaining today.`);
                            if (remainingAllowance === 0) {
                                this._markGiftedMember(member, 'Maximum daily points already sent today');
                            }
                            continue;
                        }
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftAmount}&giftTo=${userName}`;
                        if (!firstCall)
                            yield Util.sleep(3000);
                        firstCall = false;
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        const json = JSON.parse(jsonResult);
                        if (json.success) {
                            this._recordSuccessfulGift(member, giftAmount);
                        }
                        else {
                            console.warn(json.error);
                        }
                    }
                }
                giftAllBtn.disabled = true;
                document.getElementById('mp_giftAllMsg').innerText =
                    skippedCount > 0
                        ? `Gifts completed. Skipped ${skippedCount} over daily limit.`
                        : 'Gifts completed to all Checked Users';
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
                for (const { member, checkbox } of memberLabels) {
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
                for (const { member, checkbox } of memberLabels) {
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
            // Add "Select Max Ungifted" button
            const selectMaxUngiftedBtn = yield Util.createButton('mp_selectMaxUngifted', 'Select Max Ungifted', 'button', footer, 'afterend', 'mp_btn');
            selectMaxUngiftedBtn.title =
                'Select the maximum number of ungifted users you can afford at the current gift size';
            selectMaxUngiftedBtn.addEventListener('click', () => {
                const giftAmount = Number(giftAmounts.value);
                const availablePoints = getAvailablePoints();
                if (giftAmount < 5 || giftAmount > 100 || isNaN(giftAmount) || giftAmount === 0) {
                    console.warn('[M+] Cannot select max ungifted users; gift amount is invalid.');
                    return;
                }
                const maxSelectable = Math.floor(availablePoints / giftAmount);
                let count = 0;
                for (const { checkbox } of memberLabels) {
                    checkbox.checked = false;
                }
                for (const { member, checkbox } of memberLabels) {
                    if (!member.classList.contains('mp_gifted') && count < maxSelectable) {
                        checkbox.checked = true;
                        count++;
                    }
                }
                console.log(`[M+] Selected ${count} ungifted users using ${availablePoints} available points at ${giftAmount} points each.`);
            });
            // Append all elements to the footer
            footer.appendChild(selectMaxUngiftedBtn);
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
        this._setGiftedUsers(this._getGiftedUsers());
    }
    _getGiftedUsers() {
        const storedGiftedUsers = GM_getValue(this._giftedStoreKey);
        if (storedGiftedUsers === undefined || storedGiftedUsers === '') {
            return [];
        }
        return storedGiftedUsers
            .split(',')
            .map((giftedUser) => giftedUser.trim())
            .filter((giftedUser, index, allGiftedUsers) => {
            return giftedUser !== '' && allGiftedUsers.indexOf(giftedUser) === index;
        });
    }
    _setGiftedUsers(giftedUsers) {
        GM_setValue(this._giftedStoreKey, giftedUsers.slice(0, this._giftedStoreLimit).join(','));
    }
    _storeGiftedMember(memberID) {
        const giftedUsers = this._getGiftedUsers().filter((giftedUser) => giftedUser !== memberID);
        giftedUsers.unshift(memberID);
        this._setGiftedUsers(giftedUsers);
    }
    _markMemberGifted(member) {
        if (!member.classList.contains('mp_gifted')) {
            member.innerText = `${member.innerText} ✅`;
            member.classList.add('mp_gifted');
        }
    }
    _getNewUsersMembers(container) {
        return Array.from(container.querySelectorAll('label')).reduce((memberRows, label) => {
            const member = label.querySelector('a');
            const checkbox = label.querySelector('input[type="checkbox"]');
            if (member instanceof HTMLAnchorElement &&
                checkbox instanceof HTMLInputElement) {
                memberRows.push({ label, member, checkbox });
            }
            return memberRows;
        }, []);
    }
    /**
     * * Add the gifted styling once without duplicating the checkmark text
     */
    _markGiftedMember(member, title) {
        if (!member.classList.contains('mp_gifted')) {
            member.innerText = `${member.innerText} ✅`;
            member.classList.add('mp_gifted');
        }
        if (title) {
            member.title = title;
        }
    }
    /**
     * * Mark users already known as gifted, either from the legacy list or today's cache
     */
    _markKnownGiftStatus(member) {
        const memberID = Util.endOfHref(member);
        if (!memberID) {
            return;
        }
        if (this._getGiftedUsers().includes(memberID)) {
            this._markGiftedMember(member);
        }
        if (Util.getRemainingPointGiftAllowance(memberID) === 0) {
            this._markGiftedMember(member, 'Maximum daily points already sent today');
        }
    }
    /**
     * * Keep legacy tracking and the new daily cache in sync after a successful gift
     */
    _recordSuccessfulGift(member, amount) {
        this._markGiftedMember(member);
        this._storeGiftedMember(Util.endOfHref(member));
        Util.recordPointGift(Util.endOfHref(member), amount);
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
        this._removeDisclaimer = () => {
            const disclaimerHeader = Array.from(document.querySelectorAll('#mainBody .blockHeadCon h4')).find((header) => { var _a; return ((_a = header.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === 'Disclaimer'; });
            const disclaimerBlock = disclaimerHeader === null || disclaimerHeader === void 0 ? void 0 : disclaimerHeader.closest('.blockCon');
            if (disclaimerBlock)
                disclaimerBlock.remove();
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
            this._removeDisclaimer();
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
                giftButton.querySelector('button').addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    const requestedAmount = Number((document.getElementById('mp_giftValue')).value);
                    const knownRemainingAllowance = Util.getRemainingPointGiftAllowance(userName);
                    let giftFinalAmount = requestedAmount;
                    let adjustedFromAmount;
                    if (knownRemainingAllowance > 0 &&
                        knownRemainingAllowance < requestedAmount) {
                        giftFinalAmount = knownRemainingAllowance;
                        adjustedFromAmount = requestedAmount;
                    }
                    else if (knownRemainingAllowance === 0) {
                        this._showGiftStatus(sbfDiv, sbfDivChild, 'Points Gift Failed: Error: Maximum daily points already sent today', false);
                        this._closeGiftMenu(sbfDiv);
                        return;
                    }
                    let json = yield this._sendPointGift(userName, giftFinalAmount, giftMessage);
                    if (!json.success) {
                        const retryAmount = this._getRetryGiftAmount(json.error, giftFinalAmount, knownRemainingAllowance);
                        if (retryAmount !== null && retryAmount !== giftFinalAmount) {
                            adjustedFromAmount = requestedAmount;
                            giftFinalAmount = retryAmount;
                            json = yield this._sendPointGift(userName, giftFinalAmount, giftMessage);
                        }
                    }
                    if (json.success) {
                        Util.recordPointGift(userName, giftFinalAmount);
                        const successMessage = adjustedFromAmount !== undefined &&
                            adjustedFromAmount !== giftFinalAmount
                            ? `Points Gift Successful: Value: ${giftFinalAmount} (adjusted from ${adjustedFromAmount})`
                            : `Points Gift Successful: Value: ${giftFinalAmount}`;
                        this._showGiftStatus(sbfDiv, sbfDivChild, successMessage, true);
                    }
                    else {
                        this._showGiftStatus(sbfDiv, sbfDivChild, 'Points Gift Failed: Error: ' + json.error, false);
                    }
                    //return to main SB window after gift is clicked - these are two steps taken by MAM when clicking out of Menu
                    this._closeGiftMenu(sbfDiv);
                }));
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
    _sendPointGift(userName, amount, giftMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${amount}&giftTo=${userName}&message=${encodeURIComponent(giftMessage)}`;
            return JSON.parse(yield Util.getJSON(url));
        });
    }
    _getRetryGiftAmount(error, attemptedAmount, knownRemainingAllowance) {
        if (!error) {
            return null;
        }
        const candidates = (error.match(/\d[\d,]*/g) || [])
            .map((value) => parseInt(value.replace(/,/g, '')))
            .filter((value) => !isNaN(value) && value >= 5);
        let retryAmount = candidates
            .filter((value) => value < attemptedAmount)
            .sort((a, b) => b - a)[0];
        if (knownRemainingAllowance > 0 &&
            knownRemainingAllowance < attemptedAmount &&
            (retryAmount === undefined || knownRemainingAllowance < retryAmount)) {
            retryAmount = knownRemainingAllowance;
        }
        return retryAmount === undefined ? null : retryAmount;
    }
    _showGiftStatus(sbfDiv, sbfDivChild, message, success) {
        if (!sbfDivChild) {
            return;
        }
        const newDiv = document.createElement('div');
        newDiv.setAttribute('id', 'mp_giftStatusElem');
        newDiv.appendChild(document.createTextNode(message));
        newDiv.classList.add(success ? 'mp_success' : 'mp_fail');
        sbfDivChild.appendChild(newDiv);
        sbfDiv.scrollTop = sbfDiv.scrollHeight;
    }
    _closeGiftMenu(sbfDiv) {
        const clickedRow = sbfDiv.getElementsByClassName('sb_clicked_row')[0];
        if (clickedRow) {
            clickedRow.removeAttribute('class');
        }
        const menu = document.getElementById('sbMenuMain');
        if (menu) {
            menu.setAttribute('class', 'sbBottom hideMe');
        }
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
            const shoutboxPanel = document.getElementById('shoutbox');
            const shoutboxNotifs = document.getElementById('sbNotifs');
            const shoutboxBody = document.getElementById('sbf');
            const shoutboxTabs = document.getElementById('sbMenuTabs');
            const shoutboxForm = document.getElementById('sbform');
            //get the default footer where we will insert our feature
            const defaultShoutFoot = shoutBox.querySelector('.blockFoot');
            const quickShoutFootId = 'mp_blockFoot';
            let isQuickShoutExpanded = false;
            const quickShoutRoot = document.createElement('div');
            quickShoutRoot.id = 'mp_quickShoutRoot';
            const isFullscreenShoutbox = () => {
                if (!shoutboxPanel) {
                    return false;
                }
                return shoutboxPanel.style.position === 'fixed';
            };
            const syncFullscreenBodyHeight = () => {
                if (!isFullscreenShoutbox() ||
                    !shoutboxPanel ||
                    !shoutboxBody ||
                    !shoutboxForm ||
                    !shoutboxNotifs ||
                    !shoutboxTabs) {
                    if (shoutboxBody) {
                        shoutboxBody.style.height = '';
                    }
                    return;
                }
                const extraHeight = shoutboxBody.offsetHeight - shoutboxBody.clientHeight;
                const fullHeight = shoutboxPanel.clientHeight -
                    shoutboxForm.offsetHeight -
                    shoutboxNotifs.offsetHeight -
                    shoutboxTabs.offsetHeight -
                    extraHeight;
                shoutboxBody.style.height = `${Math.max(fullHeight, 0)}px`;
            };
            const syncQuickShoutFoot = () => {
                const targetFoot = isFullscreenShoutbox() && shoutboxNotifs ? shoutboxNotifs : defaultShoutFoot;
                if (quickShoutRoot.parentElement !== targetFoot) {
                    targetFoot.appendChild(quickShoutRoot);
                }
                defaultShoutFoot.id = targetFoot === defaultShoutFoot ? quickShoutFootId : '';
                defaultShoutFoot.style.height =
                    targetFoot === defaultShoutFoot ? (isQuickShoutExpanded ? '11em' : '2.5em') : '';
                syncFullscreenBodyHeight();
            };
            const setQuickShoutExpanded = (expanded) => {
                isQuickShoutExpanded = expanded;
                syncQuickShoutFoot();
            };
            if (shoutboxPanel) {
                new MutationObserver(() => {
                    syncQuickShoutFoot();
                }).observe(shoutboxPanel, {
                    attributeFilter: ['class', 'style'],
                    attributes: true,
                });
            }
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
                        setQuickShoutExpanded(false);
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
                    setQuickShoutExpanded(true);
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
            quickShoutRoot.appendChild(comboBoxDiv);
            quickShoutRoot.appendChild(quickShoutText);
            syncQuickShoutFoot();
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Adds a shoutbox preview that uses the site's own preview endpoint.
 */
class ShoutPreview {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'shoutPreview',
            desc: `Adds a Preview button for shoutbox messages.`,
        };
        this._tar = '#sbform';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Adding Shoutbox Preview...`);
            const shoutForm = document.getElementById('sbform');
            const shoutInput = document.getElementById('shbox_text');
            const shoutNotifs = document.getElementById('sbNotifs');
            const shoutBox = document.getElementById('shoutbox');
            const shoutBody = document.getElementById('sbf');
            const shoutTabs = document.getElementById('sbMenuTabs');
            const previewButton = document.createElement('button');
            const previewRoot = document.createElement('div');
            const previewBody = document.createElement('div');
            let isLoadingPreview = false;
            if (!shoutForm || !shoutInput || !shoutNotifs) {
                return;
            }
            const syncFullscreenBodyHeight = () => {
                if (!shoutBox ||
                    !shoutBody ||
                    !shoutForm ||
                    !shoutNotifs ||
                    !shoutTabs ||
                    shoutBox.style.position !== 'fixed') {
                    if (shoutBody) {
                        shoutBody.style.height = '';
                    }
                    return;
                }
                const extraHeight = shoutBody.offsetHeight - shoutBody.clientHeight;
                const fullHeight = shoutBox.clientHeight -
                    shoutForm.offsetHeight -
                    shoutNotifs.offsetHeight -
                    (previewRoot.style.display !== 'none' ? previewRoot.offsetHeight : 0) -
                    shoutTabs.offsetHeight -
                    extraHeight;
                shoutBody.style.height = `${Math.max(fullHeight, 0)}px`;
            };
            previewButton.id = 'mp_shoutPreviewBtn';
            previewButton.type = 'button';
            previewButton.textContent = 'Preview';
            previewButton.style.marginLeft = '5px';
            previewRoot.id = 'mp_shoutPreview';
            previewRoot.className = 'mp_shoutPreview';
            previewRoot.style.display = 'none';
            previewRoot.innerHTML = `<div class="mp_shoutPreviewHeader">Preview</div>`;
            previewBody.className = 'mp_shoutPreviewBody';
            previewRoot.appendChild(previewBody);
            const setPreviewState = (message, stateClass) => {
                previewBody.className = 'mp_shoutPreviewBody';
                if (stateClass) {
                    previewBody.classList.add(stateClass);
                }
                previewBody.innerHTML = message;
                previewRoot.style.display = '';
                syncFullscreenBodyHeight();
            };
            previewButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                const previewText = shoutInput.value.trim();
                if (!previewText || isLoadingPreview) {
                    return;
                }
                isLoadingPreview = true;
                previewButton.disabled = true;
                setPreviewState('Loading preview...', 'mp_shoutPreview_loading');
                try {
                    const previewResp = yield fetch('/jsonPostTest.php', {
                        body: new URLSearchParams({
                            messageToTest: shoutInput.value,
                        }).toString(),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        },
                        method: 'POST',
                    });
                    const previewJson = yield previewResp.json();
                    if (previewJson.Error) {
                        setPreviewState(previewJson.Error, 'mp_shoutPreview_error');
                    }
                    else {
                        setPreviewState(previewJson.message || '', 'mp_shoutPreview_rendered');
                    }
                }
                catch (_error) {
                    setPreviewState('Preview failed to load.', 'mp_shoutPreview_error');
                }
                finally {
                    isLoadingPreview = false;
                    previewButton.disabled = !shoutInput.value.trim();
                }
            }));
            shoutInput.addEventListener('input', () => {
                previewButton.disabled = !shoutInput.value.trim();
                if (previewRoot.style.display !== 'none') {
                    previewBody.className = 'mp_shoutPreviewBody mp_shoutPreview_stale';
                    previewBody.textContent = 'Preview is out of date. Click Preview again.';
                    syncFullscreenBodyHeight();
                }
            });
            previewButton.disabled = !shoutInput.value.trim();
            shoutForm.appendChild(previewButton);
            shoutNotifs.insertAdjacentElement('afterend', previewRoot);
            if (shoutBox) {
                new MutationObserver(() => {
                    syncFullscreenBodyHeight();
                }).observe(shoutBox, {
                    attributeFilter: ['class', 'style'],
                    attributes: true,
                });
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Loads the most recent editable shout into the site's edit UI.
 */
class QuickEditShout {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'quickEditShout',
            desc: `Shows a hint for Ctrl+Up in the shoutbox input to edit your most recent shout.`,
        };
        this._tar = '#shbox_text';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Adding quick shout edit shortcut...`);
            const shoutInput = document.getElementById('shbox_text');
            const shoutForm = document.getElementById('sbform');
            if (!shoutInput || !shoutForm) {
                return;
            }
            const getLatestEditableMenu = () => {
                let latestMenu = null;
                let latestId = 0;
                document.querySelectorAll('.sbf .sb_menu').forEach((menu) => {
                    if (Number(menu.getAttribute('data-ee') || '0') <= 0) {
                        return;
                    }
                    const shoutRow = menu.closest('div[id^="sbid"]');
                    const parsedId = Number(shoutRow === null || shoutRow === void 0 ? void 0 : shoutRow.id.replace('sbid', ''));
                    if (!isNaN(parsedId) && parsedId > latestId) {
                        latestId = parsedId;
                        latestMenu = menu;
                    }
                });
                return latestMenu;
            };
            const openLatestEditableShout = () => {
                if (getLatestEditableMenu() === null) {
                    return false;
                }
                const script = document.createElement('script');
                script.textContent = `(function () {
                var latestMenu = null;
                var latestId = 0;
                document.querySelectorAll('.sbf .sb_menu').forEach(function (menu) {
                    if (Number(menu.getAttribute('data-ee') || '0') <= 0) {
                        return;
                    }
                    var shoutRow = menu.closest('div[id^="sbid"]');
                    var parsedId = Number((shoutRow && shoutRow.id || '').replace('sbid', ''));
                    if (!isNaN(parsedId) && parsedId > latestId) {
                        latestId = parsedId;
                        latestMenu = menu;
                    }
                });
                if (!latestMenu) {
                    return;
                }
                latestMenu.click();
                window.setTimeout(function () {
                    var editButton = document.getElementById('sbEdit');
                    if (editButton instanceof HTMLElement) {
                        editButton.click();
                    }
                }, 0);
            })();`;
                (document.head || document.documentElement).appendChild(script);
                script.remove();
                return true;
            };
            const quickEditHint = document.createElement('span');
            quickEditHint.id = 'mp_quickEditShoutHint';
            quickEditHint.textContent = 'Press Ctrl+Up to edit your last shout';
            quickEditHint.style.marginLeft = '5px';
            quickEditHint.style.opacity = getLatestEditableMenu() === null ? '0.6' : '1';
            shoutForm.appendChild(quickEditHint);
            document.addEventListener('keydown', (event) => {
                if (document.activeElement !== shoutInput) {
                    return;
                }
                const isUpKey = event.key === 'ArrowUp' ||
                    event.key === 'Up' ||
                    event.code === 'ArrowUp' ||
                    event.keyCode === 38;
                if (!event.ctrlKey || event.altKey || event.metaKey || !isUpKey) {
                    return;
                }
                if (getLatestEditableMenu() === null) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                openLatestEditableShout();
            }, true);
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
        tar.innerHTML = `<textarea class="mceNoEditor" rows="1" cols="80" style='margin-right:5px'>${content}</textarea>`;
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
class CostToSetRatio {
    constructor() {
        this._settings = {
            scope: SettingGroup.Store,
            type: 'textbox',
            title: 'storeTargetRatio',
            tag: 'Target Ratio',
            placeholder: 'ex. 5',
            desc: 'Display how much upload credit you need to buy to reach a target ratio',
        };
        this._tar = '.uploadCreditContent';
        this._outputID = 'mp_storeTargetRatio';
        Util.startFeature(this._settings, this._tar, ['store']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        this._render();
        this._watchForChanges();
        console.log('[M+] Added cost to set ratio to the store page!');
    }
    _render() {
        const targetRatio = parseFloat(GM_getValue(`${this._settings.title}_val`));
        const content = document.querySelector(this._tar);
        if (content === null) {
            return;
        }
        let output = document.getElementById(this._outputID);
        if (output === null) {
            output = document.createElement('div');
            output.id = this._outputID;
            output.className = 'mp_store_ratioTarget';
            content.insertAdjacentElement('afterbegin', output);
        }
        if (isNaN(targetRatio) || targetRatio <= 0) {
            output.textContent = 'Enter a valid target ratio in MAM+ settings to see the upload credit cost.';
            return;
        }
        const currentRatio = this._getRatio();
        const uploadedBytes = this._getBytes('#uploadedTD');
        const downloadedBytes = this._getBytes('#downloadedTD');
        if (currentRatio === null || uploadedBytes === null || downloadedBytes === null) {
            output.textContent =
                'Could not determine your current ratio and totals for the target-ratio calculation.';
            return;
        }
        const uploadNeededBytes = Util.uploadNeededForTargetRatio(uploadedBytes, downloadedBytes, targetRatio);
        if (uploadNeededBytes <= 0) {
            output.innerHTML = `<strong>Target Ratio:</strong> Your current ratio of ${currentRatio.toFixed(2)} already meets or exceeds ${targetRatio.toFixed(2)}.`;
            return;
        }
        const pointsNeeded = Math.ceil((uploadNeededBytes / Math.pow(1024, 3)) * 500);
        output.innerHTML = `<strong>Target Ratio:</strong> Buy <strong>${Util.formatBytes(uploadNeededBytes)}</strong> of upload credit (${pointsNeeded.toLocaleString()} BP) to reach ratio <strong>${targetRatio.toFixed(2)}</strong>.`;
    }
    _watchForChanges() {
        const watchTargets = ['#tmR', '#uploadedTD', '#downloadedTD', '#currentBonusPoints']
            .map((selector) => document.querySelector(selector))
            .filter((elem) => elem !== null);
        if (watchTargets.length === 0) {
            return;
        }
        const observer = new MutationObserver(() => {
            this._render();
        });
        watchTargets.forEach((target) => {
            observer.observe(target, {
                characterData: true,
                childList: true,
                subtree: true,
            });
        });
        const uploadButtons = document.querySelectorAll('.uploadCreditContent button');
        uploadButtons.forEach((button) => {
            button.addEventListener('click', () => {
                window.setTimeout(() => this._render(), 250);
            });
        });
    }
    _getRatio() {
        const ratioElem = document.querySelector('#tmR, #RatioTD');
        if (ratioElem === null) {
            return null;
        }
        const ratio = Util.extractFloat(ratioElem)[0];
        return isNaN(ratio) ? null : ratio;
    }
    _getBytes(selector) {
        const elem = document.querySelector(selector);
        if (elem === null || elem.textContent === null) {
            return null;
        }
        try {
            return Util.parseSizeToBytes(elem.textContent);
        }
        catch (_a) {
            return null;
        }
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
        new ToggleBookmarked();
        new StickyBookmarkedToggle();
        new PlaintextSearch();
        new ToggleSearchbox();
        new FiletypeSearchFilter();
        new BuildTags();
        new MultiSelectBrowse();
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
        new GiftButton();
        new QuickEditShout();
        new ShoutPreview();
        new QuickShout();
        // Initialize Vault functions
        new SimpleVault();
        new PotHistory();
        // Initialize Store functions
        new GrayOutStorePurchases();
        new CostToSetRatio();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL3NoYXJlZC50cyIsInNyYy9tb2R1bGVzL2Jyb3dzZS50cyIsInNyYy9tb2R1bGVzL2ZyZWVsZWVjaC50cyIsInNyYy9tb2R1bGVzL2ZvcnVtLnRzIiwic3JjL21vZHVsZXMvaG9tZS50cyIsInNyYy9tb2R1bGVzL3JlcXVlc3QudHMiLCJzcmMvbW9kdWxlcy9zaG91dC50cyIsInNyYy9tb2R1bGVzL3Rvci50cyIsInNyYy9tb2R1bGVzL3VwbG9hZC50cyIsInNyYy9tb2R1bGVzL3VzZXIudHMiLCJzcmMvbW9kdWxlcy92YXVsdC50cyIsInNyYy9tb2R1bGVzL3N0b3JlLnRzIiwic3JjL2ZlYXR1cmVzLnRzIiwic3JjL3NldHRpbmdzLnRzIiwic3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7R0FFRztBQW9CSCxJQUFLLFlBYUo7QUFiRCxXQUFLLFlBQVk7SUFDYixtREFBUSxDQUFBO0lBQ1IsK0NBQU0sQ0FBQTtJQUNOLG1EQUFRLENBQUE7SUFDUix1REFBVSxDQUFBO0lBQ1YsK0RBQWMsQ0FBQTtJQUNkLHVEQUFVLENBQUE7SUFDVixpREFBTyxDQUFBO0lBQ1AsaURBQU8sQ0FBQTtJQUNQLDJEQUFZLENBQUE7SUFDWiw2REFBYSxDQUFBO0lBQ2Isa0RBQU8sQ0FBQTtJQUNQLGtEQUFPLENBQUE7QUFDWCxDQUFDLEVBYkksWUFBWSxLQUFaLFlBQVksUUFhaEI7QUNuQ0Q7Ozs7R0FJRzs7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FB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Q0FBQyxNQUFNLENBQUM7WUFDN0MsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxLQUFLLEtBQUssZUFBZSxDQUFDLEVBQUU7Z0JBQ2hFLCtCQUErQjtnQkFDL0IsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQSxZQUFZLENBQUMsQ0FBQzthQUN2QztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUg7OztXQUdHO1FBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDdEQsdUJBQXVCO1lBQ3ZCLEdBQUEsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLDZCQUE2QjtZQUM3QixHQUFBLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQSxDQUFDO0FBQ04sQ0FBQyxFQS9EUyxFQUFFLEtBQUYsRUFBRSxRQStEWDtBQUVELHlCQUF5QjtBQUN6QixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoibWFtLXBsdXNfZGV2LnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFR5cGVzLCBJbnRlcmZhY2VzLCBldGMuXG4gKi9cblxudHlwZSBWYWxpZFBhZ2UgPVxuICAgIHwgJ2hvbWUnXG4gICAgfCAnYnJvd3NlJ1xuICAgIHwgJ2ZyZWVsZWVjaCdcbiAgICB8ICdyZXF1ZXN0J1xuICAgIHwgJ3JlcXVlc3QgZGV0YWlscydcbiAgICB8ICd0b3JyZW50J1xuICAgIHwgJ3Nob3V0Ym94J1xuICAgIHwgJ3ZhdWx0J1xuICAgIHwgJ3N0b3JlJ1xuICAgIHwgJ3VzZXInXG4gICAgfCAndXBsb2FkJ1xuICAgIHwgJ2ZvcnVtIHRocmVhZCdcbiAgICB8ICdzZXR0aW5ncydcbiAgICB8ICduZXcgdXNlcnMnO1xuXG50eXBlIEJvb2tEYXRhID0gJ2Jvb2snIHwgJ2F1dGhvcicgfCAnc2VyaWVzJztcblxuZW51bSBTZXR0aW5nR3JvdXAge1xuICAgICdHbG9iYWwnLFxuICAgICdIb21lJyxcbiAgICAnU2VhcmNoJyxcbiAgICAnUmVxdWVzdHMnLFxuICAgICdUb3JyZW50IFBhZ2UnLFxuICAgICdTaG91dGJveCcsXG4gICAgJ1ZhdWx0JyxcbiAgICAnU3RvcmUnLFxuICAgICdVc2VyIFBhZ2VzJyxcbiAgICAnVXBsb2FkIFBhZ2UnLFxuICAgICdGb3J1bScsXG4gICAgJ090aGVyJyxcbn1cblxudHlwZSBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JyB8ICdtdXRlJztcblxudHlwZSBTdG9yZVNvdXJjZSA9XG4gICAgfCAxXG4gICAgfCAnMi41J1xuICAgIHwgJzQnXG4gICAgfCAnNSdcbiAgICB8ICc4J1xuICAgIHwgJzIwJ1xuICAgIHwgJzEwMCdcbiAgICB8ICdwb2ludHMnXG4gICAgfCAnY2hlZXNlJ1xuICAgIHwgJ21heCdcbiAgICB8ICdNYXggQWZmb3JkYWJsZSdcbiAgICB8ICdzZWVkdGltZSdcbiAgICB8ICdTZWxsJ1xuICAgIHwgJ3JhdGlvJ1xuICAgIHwgJ0ZvcnVtJztcblxuaW50ZXJmYWNlIFVzZXJHaWZ0SGlzdG9yeSB7XG4gICAgYW1vdW50OiBudW1iZXI7XG4gICAgb3RoZXJfbmFtZTogc3RyaW5nO1xuICAgIG90aGVyX3VzZXJpZDogbnVtYmVyO1xuICAgIHRpZDogbnVtYmVyIHwgbnVsbDtcbiAgICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgICB0aXRsZTogc3RyaW5nIHwgbnVsbDtcbiAgICB0eXBlOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBSZWNlbnRQb2ludEdpZnQge1xuICAgIGFtb3VudDogbnVtYmVyO1xuICAgIHVzZXJJRDogc3RyaW5nO1xuICAgIHV0Y0RhdGU6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEFycmF5T2JqZWN0IHtcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIFN0cmluZ09iamVjdCB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQm9va0RhdGFPYmplY3QgZXh0ZW5kcyBTdHJpbmdPYmplY3Qge1xuICAgIFsnZXh0cmFjdGVkJ106IHN0cmluZztcbiAgICBbJ2Rlc2MnXTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgRGl2Um93T2JqZWN0IHtcbiAgICBbJ3RpdGxlJ106IHN0cmluZztcbiAgICBbJ2RhdGEnXTogSFRNTERpdkVsZW1lbnQ7XG59XG5cbmludGVyZmFjZSBTZXR0aW5nR2xvYk9iamVjdCB7XG4gICAgW2tleTogbnVtYmVyXTogRmVhdHVyZVNldHRpbmdzW107XG59XG5cbmludGVyZmFjZSBGZWF0dXJlU2V0dGluZ3Mge1xuICAgIHNjb3BlOiBTZXR0aW5nR3JvdXA7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICB0eXBlOiAnY2hlY2tib3gnIHwgJ2Ryb3Bkb3duJyB8ICd0ZXh0Ym94JztcbiAgICBkZXNjOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBBbnlGZWF0dXJlIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcbiAgICB0YWc/OiBzdHJpbmc7XG4gICAgb3B0aW9ucz86IFN0cmluZ09iamVjdDtcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEZlYXR1cmUge1xuICAgIHNldHRpbmdzOiBDaGVja2JveFNldHRpbmcgfCBEcm9wZG93blNldHRpbmcgfCBUZXh0Ym94U2V0dGluZztcbn1cblxuaW50ZXJmYWNlIENoZWNrYm94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XG4gICAgdHlwZTogJ2NoZWNrYm94Jztcbn1cblxuaW50ZXJmYWNlIERyb3Bkb3duU2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XG4gICAgdHlwZTogJ2Ryb3Bkb3duJztcbiAgICB0YWc6IHN0cmluZztcbiAgICBvcHRpb25zOiBTdHJpbmdPYmplY3Q7XG59XG5cbmludGVyZmFjZSBUZXh0Ym94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XG4gICAgdHlwZTogJ3RleHRib3gnO1xuICAgIHRhZzogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyOiBzdHJpbmc7XG59XG5cbi8vIG5hdmlnYXRvci5jbGlwYm9hcmQuZC50c1xuXG4vLyBUeXBlIGRlY2xhcmF0aW9ucyBmb3IgQ2xpcGJvYXJkIEFQSVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NsaXBib2FyZF9BUElcbmludGVyZmFjZSBDbGlwYm9hcmQge1xuICAgIHdyaXRlVGV4dChuZXdDbGlwVGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcbiAgICAvLyBBZGQgYW55IG90aGVyIG1ldGhvZHMgeW91IG5lZWQgaGVyZS5cbn1cblxuaW50ZXJmYWNlIE5hdmlnYXRvckNsaXBib2FyZCB7XG4gICAgLy8gT25seSBhdmFpbGFibGUgaW4gYSBzZWN1cmUgY29udGV4dC5cbiAgICByZWFkb25seSBjbGlwYm9hcmQ/OiBDbGlwYm9hcmQ7XG59XG5cbmludGVyZmFjZSBOYXZpZ2F0b3JFeHRlbmRlZCBleHRlbmRzIE5hdmlnYXRvckNsaXBib2FyZCB7fVxuIiwiLyoqXG4gKiBDbGFzcyBjb250YWluaW5nIGNvbW1vbiB1dGlsaXR5IG1ldGhvZHNcbiAqXG4gKiBJZiB0aGUgbWV0aG9kIHNob3VsZCBoYXZlIHVzZXItY2hhbmdlYWJsZSBzZXR0aW5ncywgY29uc2lkZXIgdXNpbmcgYENvcmUudHNgIGluc3RlYWRcbiAqL1xuXG5jbGFzcyBVdGlsIHtcbiAgICAvKipcbiAgICAgKiBBbmltYXRpb24gZnJhbWUgdGltZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFmVGltZXIoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbGxvd3Mgc2V0dGluZyBtdWx0aXBsZSBhdHRyaWJ1dGVzIGF0IG9uY2VcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNldEF0dHIoZWw6IEVsZW1lbnQsIGF0dHI6IFN0cmluZ09iamVjdCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHIpIHtcbiAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBcImxlbmd0aFwiIG9mIGFuIE9iamVjdFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgb2JqZWN0TGVuZ3RoKG9iajogT2JqZWN0KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvcmNlZnVsbHkgZW1wdGllcyBhbnkgR00gc3RvcmVkIHZhbHVlc1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcHVyZ2VTZXR0aW5ncygpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBHTV9saXN0VmFsdWVzKCkpIHtcbiAgICAgICAgICAgIEdNX2RlbGV0ZVZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvZyBhIG1lc3NhZ2UgYWJvdXQgYSBjb3VudGVkIHJlc3VsdFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVwb3J0Q291bnQoZGlkOiBzdHJpbmcsIG51bTogbnVtYmVyLCB0aGluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNpbmd1bGFyID0gMTtcbiAgICAgICAgaWYgKG51bSAhPT0gc2luZ3VsYXIpIHtcbiAgICAgICAgICAgIHRoaW5nICs9ICdzJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA+ICR7ZGlkfSAke251bX0gJHt0aGluZ31gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgZmVhdHVyZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgc3RhcnRGZWF0dXJlKFxuICAgICAgICBzZXR0aW5nczogRmVhdHVyZVNldHRpbmdzLFxuICAgICAgICBlbGVtOiBzdHJpbmcsXG4gICAgICAgIHBhZ2U/OiBWYWxpZFBhZ2VbXVxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBRdWV1ZSB0aGUgc2V0dGluZ3MgaW4gY2FzZSB0aGV5J3JlIG5lZWRlZFxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaChzZXR0aW5ncyk7XG5cbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gcmV0dXJuIHRydWUgd2hlbiB0aGUgZWxlbWVudCBpcyBsb2FkZWRcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICAgICAgICAgICAgY29uc3QgdGltZXI6IFByb21pc2U8ZmFsc2U+ID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCAyMDAwLCBmYWxzZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBjaGVja0VsZW0gPSBDaGVjay5lbGVtTG9hZChlbGVtKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UoW3RpbWVyLCBjaGVja0VsZW1dKS50aGVuKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgIGBzdGFydEZlYXR1cmUoJHtzZXR0aW5ncy50aXRsZX0pIFVuYWJsZSB0byBpbml0aWF0ZSEgQ291bGQgbm90IGZpbmQgZWxlbWVudDogJHtlbGVtfWBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXMgdGhlIHNldHRpbmcgZW5hYmxlZD9cbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHNldHRpbmdzLnRpdGxlKSkge1xuICAgICAgICAgICAgLy8gQSBzcGVjaWZpYyBwYWdlIGlzIG5lZWRlZFxuICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCByZXF1aXJlZCBwYWdlc1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHM6IGJvb2xlYW5bXSA9IFtdO1xuICAgICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDaGVjay5wYWdlKHApLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCg8Ym9vbGVhbj5yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgYW55IHJlcXVlc3RlZCBwYWdlIG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZSwgcnVuIHRoZSBmZWF0dXJlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMuaW5jbHVkZXModHJ1ZSkgPT09IHRydWUpIHJldHVybiBydW4oKTtcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIFNraXAgdG8gZWxlbWVudCBjaGVja2luZ1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZXR0aW5nIGlzIG5vdCBlbmFibGVkXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmltcyBhIHN0cmluZyBsb25nZXIgdGhhbiBhIHNwZWNpZmllZCBjaGFyIGxpbWl0LCB0byBhIGZ1bGwgd29yZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdHJpbVN0cmluZyhpbnA6IHN0cmluZywgbWF4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBpZiAoaW5wLmxlbmd0aCA+IG1heCkge1xuICAgICAgICAgICAgaW5wID0gaW5wLnN1YnN0cmluZygwLCBtYXggKyAxKTtcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgTWF0aC5taW4oaW5wLmxlbmd0aCwgaW5wLmxhc3RJbmRleE9mKCcgJykpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYnJhY2tldHMgJiBhbGwgY29udGFpbmVkIHdvcmRzIGZyb20gYSBzdHJpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRSZW1vdmVyKGlucDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGlucFxuICAgICAgICAgICAgLnJlcGxhY2UoL3srLio/fSsvZywgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxbXFxbfFxcXVxcXS9nLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88Lio/Pi9nLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXCguKj9cXCkvZywgJycpXG4gICAgICAgICAgICAudHJpbSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlJldHVybiB0aGUgY29udGVudHMgYmV0d2VlbiBicmFja2V0c1xuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJvZiBVdGlsXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0Q29udGVudHMgPSAoaW5wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIGlucC5tYXRjaCgvXFwoKFteKV0rKVxcKS8pIVsxXTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBzdHJpbmcgdG8gYW4gYXJyYXlcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1RvQXJyYXkoaW5wOiBzdHJpbmcsIHNwbGl0UG9pbnQ/OiAnd3MnKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gc3BsaXRQb2ludCAhPT0gdW5kZWZpbmVkICYmIHNwbGl0UG9pbnQgIT09ICd3cydcbiAgICAgICAgICAgID8gaW5wLnNwbGl0KHNwbGl0UG9pbnQpXG4gICAgICAgICAgICA6IGlucC5tYXRjaCgvXFxTKy9nKSB8fCBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhIGNvbW1hIChvciBvdGhlcikgc2VwYXJhdGVkIHZhbHVlIGludG8gYW4gYXJyYXlcbiAgICAgKiBAcGFyYW0gaW5wIFN0cmluZyB0byBiZSBkaXZpZGVkXG4gICAgICogQHBhcmFtIGRpdmlkZXIgVGhlIGRpdmlkZXIgKGRlZmF1bHQ6ICcsJylcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNzdlRvQXJyYXkoaW5wOiBzdHJpbmcsIGRpdmlkZXI6IHN0cmluZyA9ICcsJyk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgYXJyOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBpbnAuc3BsaXQoZGl2aWRlcikuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgYXJyLnB1c2goaXRlbS50cmltKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGFuIGFycmF5IHRvIGEgc3RyaW5nXG4gICAgICogQHBhcmFtIGlucCBzdHJpbmdcbiAgICAgKiBAcGFyYW0gZW5kIGN1dC1vZmYgcG9pbnRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFycmF5VG9TdHJpbmcoaW5wOiBzdHJpbmdbXSwgZW5kPzogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xuICAgICAgICBpbnAuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcbiAgICAgICAgICAgIG91dHAgKz0ga2V5O1xuICAgICAgICAgICAgaWYgKGVuZCAmJiB2YWwgKyAxICE9PSBpbnAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb3V0cCArPSAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gb3V0cDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhIERPTSBub2RlIHJlZmVyZW5jZSBpbnRvIGFuIEhUTUwgRWxlbWVudCByZWZlcmVuY2VcbiAgICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjb252ZXJ0XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBub2RlVG9FbGVtKG5vZGU6IE5vZGUpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGlmIChub2RlLmZpcnN0Q2hpbGQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiA8SFRNTEVsZW1lbnQ+bm9kZS5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50ITtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm9kZS10by1lbGVtIHdpdGhvdXQgY2hpbGRub2RlIGlzIHVudGVzdGVkJyk7XG4gICAgICAgICAgICBjb25zdCB0ZW1wTm9kZTogTm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRlbXBOb2RlKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZCh0ZW1wTm9kZSk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaCBzdHJpbmdzIHdoaWxlIGlnbm9yaW5nIGNhc2Ugc2Vuc2l0aXZpdHlcbiAgICAgKiBAcGFyYW0gYSBGaXJzdCBzdHJpbmdcbiAgICAgKiBAcGFyYW0gYiBTZWNvbmQgc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjYXNlbGVzc1N0cmluZ01hdGNoKGE6IHN0cmluZywgYjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGNvbXBhcmU6IG51bWJlciA9IGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7XG4gICAgICAgICAgICBzZW5zaXRpdml0eTogJ2Jhc2UnLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUgPT09IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IFRvckRldFJvdyBhbmQgcmV0dXJuIHRoZSBpbm5lciBkaXZcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSByb3cgdG8gYmUgdGFyZ2V0dGVkXG4gICAgICogQHBhcmFtIGxhYmVsIFRoZSBuYW1lIHRvIGJlIGRpc3BsYXllZCBmb3IgdGhlIG5ldyByb3dcbiAgICAgKiBAcGFyYW0gcm93Q2xhc3MgVGhlIHJvdydzIGNsYXNzbmFtZSAoc2hvdWxkIHN0YXJ0IHdpdGggbXBfKVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYWRkVG9yRGV0YWlsc1JvdyhcbiAgICAgICAgdGFyOiBIVE1MRGl2RWxlbWVudCB8IG51bGwsXG4gICAgICAgIGxhYmVsOiBzdHJpbmcsXG4gICAgICAgIHJvd0NsYXNzOiBzdHJpbmdcbiAgICApOiBIVE1MRGl2RWxlbWVudCB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGFyKTtcblxuICAgICAgICBpZiAodGFyID09PSBudWxsIHx8IHRhci5wYXJlbnRFbGVtZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFkZCBUb3IgRGV0YWlscyBSb3c6IGVtcHR5IG5vZGUgb3IgcGFyZW50IG5vZGUgQCAke3Rhcn1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhci5wYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj4ke2xhYmVsfTwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3Jvd0NsYXNzfVwiPjxzcGFuIGNsYXNzPVwiZmxleFwiPjwvc3Bhbj48L2Rpdj48L2Rpdj5gXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3Jvd0NsYXNzfSAuZmxleGApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogTWVyZ2Ugd2l0aCBgVXRpbC5jcmVhdGVCdXR0b25gXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIGxpbmsgYnV0dG9uIHRoYXQgaXMgc3R5bGVkIGxpa2UgYSBzaXRlIGJ1dHRvbiAoZXguIGluIHRvciBkZXRhaWxzKVxuICAgICAqIEBwYXJhbSB0YXIgVGhlIGVsZW1lbnQgdGhlIGJ1dHRvbiBzaG91bGQgYmUgYWRkZWQgdG9cbiAgICAgKiBAcGFyYW0gdXJsIFRoZSBVUkwgdGhlIGJ1dHRvbiB3aWxsIHNlbmQgeW91IHRvXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgb24gdGhlIGJ1dHRvblxuICAgICAqIEBwYXJhbSBvcmRlciBPcHRpb25hbDogZmxleCBmbG93IG9yZGVyaW5nXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVMaW5rQnV0dG9uKFxuICAgICAgICB0YXI6IEhUTUxFbGVtZW50LFxuICAgICAgICB1cmw6IHN0cmluZyA9ICdub25lJyxcbiAgICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgICBvcmRlcjogbnVtYmVyID0gMFxuICAgICk6IHZvaWQge1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGJ1dHRvblxuICAgICAgICBjb25zdCBidXR0b246IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAvLyBTZXQgdXAgdGhlIGJ1dHRvblxuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnbXBfYnV0dG9uX2Nsb25lJyk7XG4gICAgICAgIGlmICh1cmwgIT09ICdub25lJykge1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnV0dG9uLmlubmVyVGV4dCA9IHRleHQ7XG4gICAgICAgIGJ1dHRvbi5zdHlsZS5vcmRlciA9IGAke29yZGVyfWA7XG4gICAgICAgIC8vIEluamVjdCB0aGUgYnV0dG9uXG4gICAgICAgIHRhci5pbnNlcnRCZWZvcmUoYnV0dG9uLCB0YXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIG5vbi1saW5rZWQgYnV0dG9uXG4gICAgICogQHBhcmFtIGlkIFRoZSBJRCBvZiB0aGUgYnV0dG9uXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgZGlzcGxheWVkIGluIHRoZSBidXR0b25cbiAgICAgKiBAcGFyYW0gdHlwZSBUaGUgSFRNTCBlbGVtZW50IHRvIGNyZWF0ZS4gRGVmYXVsdDogYGgxYFxuICAgICAqIEBwYXJhbSB0YXIgVGhlIEhUTUwgZWxlbWVudCB0aGUgYnV0dG9uIHdpbGwgYmUgYHJlbGF0aXZlYCB0b1xuICAgICAqIEBwYXJhbSByZWxhdGl2ZSBUaGUgcG9zaXRpb24gb2YgdGhlIGJ1dHRvbiByZWxhdGl2ZSB0byB0aGUgYHRhcmAuIERlZmF1bHQ6IGBhZnRlcmVuZGBcbiAgICAgKiBAcGFyYW0gYnRuQ2xhc3MgVGhlIGNsYXNzbmFtZSBvZiB0aGUgZWxlbWVudC4gRGVmYXVsdDogYG1wX2J0bmBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUJ1dHRvbihcbiAgICAgICAgaWQ6IHN0cmluZyxcbiAgICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgICB0eXBlOiBzdHJpbmcgPSAnaDEnLFxuICAgICAgICB0YXI6IHN0cmluZyB8IEhUTUxFbGVtZW50LFxuICAgICAgICByZWxhdGl2ZTogJ2JlZm9yZWJlZ2luJyB8ICdhZnRlcmVuZCcgPSAnYWZ0ZXJlbmQnLFxuICAgICAgICBidG5DbGFzczogc3RyaW5nID0gJ21wX2J0bidcbiAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBDaG9vc2UgdGhlIG5ldyBidXR0b24gaW5zZXJ0IGxvY2F0aW9uIGFuZCBpbnNlcnQgZWxlbWVudHNcbiAgICAgICAgICAgIC8vIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID1cbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFyID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKSA6IHRhcjtcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGAke3Rhcn0gaXMgbnVsbCFgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Lmluc2VydEFkamFjZW50RWxlbWVudChyZWxhdGl2ZSwgYnRuKTtcbiAgICAgICAgICAgICAgICBVdGlsLnNldEF0dHIoYnRuLCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBgbXBfJHtpZH1gLFxuICAgICAgICAgICAgICAgICAgICBjbGFzczogYnRuQ2xhc3MsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdidXR0b24nLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIGJ1dHRvbiB0ZXh0XG4gICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShidG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhbiBlbGVtZW50IGludG8gYSBidXR0b24gdGhhdCwgd2hlbiBjbGlja2VkLCBjb3BpZXMgdGV4dCB0byBjbGlwYm9hcmRcbiAgICAgKiBAcGFyYW0gYnRuIEFuIEhUTUwgRWxlbWVudCBiZWluZyB1c2VkIGFzIGEgYnV0dG9uXG4gICAgICogQHBhcmFtIHBheWxvYWQgVGhlIHRleHQgdGhhdCB3aWxsIGJlIGNvcGllZCB0byBjbGlwYm9hcmQgb24gYnV0dG9uIGNsaWNrLCBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCB1c2UgdGhlIGNsaXBib2FyZCdzIGN1cnJlbnQgdGV4dFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2xpcGJvYXJkaWZ5QnRuKFxuICAgICAgICBidG46IEhUTUxFbGVtZW50LFxuICAgICAgICBwYXlsb2FkOiBhbnksXG4gICAgICAgIGNvcHk6IGJvb2xlYW4gPSB0cnVlXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIC8vIEhhdmUgdG8gb3ZlcnJpZGUgdGhlIE5hdmlnYXRvciB0eXBlIHRvIHByZXZlbnQgVFMgZXJyb3JzXG4gICAgICAgICAgICBjb25zdCBuYXY6IE5hdmlnYXRvckV4dGVuZGVkIHwgdW5kZWZpbmVkID0gPE5hdmlnYXRvckV4dGVuZGVkPm5hdmlnYXRvcjtcbiAgICAgICAgICAgIGlmIChuYXYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSB0ZXh0LCBsaWtlbHkgZHVlIHRvIG1pc3NpbmcgYnJvd3NlciBzdXBwb3J0LicpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImJyb3dzZXIgZG9lc24ndCBzdXBwb3J0ICduYXZpZ2F0b3InP1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogTmF2aWdhdG9yIEV4aXN0cyAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvcHkgJiYgdHlwZW9mIHBheWxvYWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgcmVzdWx0cyB0byBjbGlwYm9hcmRcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEud3JpdGVUZXh0KHBheWxvYWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgdG8geW91ciBjbGlwYm9hcmQhJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuIHBheWxvYWQgZnVuY3Rpb24gd2l0aCBjbGlwYm9hcmQgdGV4dFxuICAgICAgICAgICAgICAgICAgICBuYXYuY2xpcGJvYXJkIS5yZWFkVGV4dCgpLnRoZW4oKHRleHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQodGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgZnJvbSB5b3VyIGNsaXBib2FyZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnRuLnN0eWxlLmNvbG9yID0gJ2dyZWVuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBIVFRQUmVxdWVzdCBmb3IgR0VUIEpTT04sIHJldHVybnMgdGhlIGZ1bGwgdGV4dCBvZiBIVFRQIEdFVFxuICAgICAqIEBwYXJhbSB1cmwgLSBhIHN0cmluZyBvZiB0aGUgVVJMIHRvIHN1Ym1pdCBmb3IgR0VUIHJlcXVlc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEpTT04odXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ2V0SFRUUCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJlc3VsdHMgd2l0aCB0aGUgYW1vdW50IGVudGVyZWQgYnkgdXNlciBwbHVzIHRoZSB1c2VybmFtZSBmb3VuZCBvbiB0aGUgbWVudSBzZWxlY3RlZFxuICAgICAgICAgICAgZ2V0SFRUUC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgZ2V0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgZ2V0SFRUUC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdldEhUVFAucmVhZHlTdGF0ZSA9PT0gNCAmJiBnZXRIVFRQLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZ2V0SFRUUC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnZXRIVFRQLnNlbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiB0d28gcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSBtaW4gYSBudW1iZXIgb2YgdGhlIGJvdHRvbSBvZiByYW5kb20gbnVtYmVyIHBvb2xcbiAgICAgKiBAcGFyYW0gbWF4IGEgbnVtYmVyIG9mIHRoZSB0b3Agb2YgdGhlIHJhbmRvbSBudW1iZXIgcG9vbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmFuZG9tTnVtYmVyID0gKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciA9PiB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTbGVlcCB1dGlsIHRvIGJlIHVzZWQgaW4gYXN5bmMgZnVuY3Rpb25zIHRvIGRlbGF5IHByb2dyYW1cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNsZWVwID0gKG06IGFueSk6IFByb21pc2U8dm9pZD4gPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgbSkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHNlY3Rpb24gb2YgYW4gSFJFRlxuICAgICAqIEBwYXJhbSBlbGVtIEFuIGFuY2hvciBlbGVtZW50XG4gICAgICogQHBhcmFtIHNwbGl0IE9wdGlvbmFsIGRpdmlkZXIuIERlZmF1bHRzIHRvIGAvYFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZW5kT2ZIcmVmID0gKGVsZW06IEhUTUxBbmNob3JFbGVtZW50LCBzcGxpdCA9ICcvJykgPT5cbiAgICAgICAgZWxlbS5ocmVmLnNwbGl0KHNwbGl0KS5wb3AoKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgaGV4IHZhbHVlIG9mIGEgY29tcG9uZW50IGFzIGEgc3RyaW5nLlxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY29tcG9uZW50VG9IZXggPSAoYzogbnVtYmVyIHwgc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XG4gICAgICAgIHJldHVybiBoZXgubGVuZ3RoID09PSAxID8gYDAke2hleH1gIDogaGV4O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgaGV4IGNvbG9yIGNvZGUgZnJvbSBSR0IuXG4gICAgICogRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4XG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlcm9mIFV0aWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJnYlRvSGV4ID0gKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gYCMke1V0aWwuY29tcG9uZW50VG9IZXgocil9JHtVdGlsLmNvbXBvbmVudFRvSGV4KGcpfSR7VXRpbC5jb21wb25lbnRUb0hleChcbiAgICAgICAgICAgIGJcbiAgICAgICAgKX1gO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IG51bWJlcnMgKHdpdGggZmxvYXQpIGZyb20gdGV4dCBhbmQgcmV0dXJuIHRoZW1cbiAgICAgKiBAcGFyYW0gdGFyIEFuIEhUTUwgZWxlbWVudCB0aGF0IGNvbnRhaW5zIG51bWJlcnNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGbG9hdCA9ICh0YXI6IEhUTUxFbGVtZW50KTogbnVtYmVyW10gPT4ge1xuICAgICAgICBpZiAodGFyLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHRhci50ZXh0Q29udGVudCEucmVwbGFjZSgvLC9nLCAnJykubWF0Y2goL1xcZCtcXC5cXGQrLykgfHwgW10pLm1hcCgobikgPT5cbiAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG4pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgY29udGFpbnMgbm8gdGV4dCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgR2V0IHRoZSB1c2VyIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHRoZSBsb2dnZWQgaW4gdXNlciBhbmQgYSBnaXZlbiBJRFxuICAgICAqIEBwYXJhbSB1c2VySUQgQSB1c2VyIElEOyBjYW4gYmUgYSBzdHJpbmcgb3IgbnVtYmVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBnZXRVc2VyR2lmdEhpc3RvcnkoXG4gICAgICAgIHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nXG4gICAgKTogUHJvbWlzZTxVc2VyR2lmdEhpc3RvcnlbXT4ge1xuICAgICAgICBjb25zdCByYXdHaWZ0SGlzdG9yeTogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKFxuICAgICAgICAgICAgYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi91c2VyQm9udXNIaXN0b3J5LnBocD9vdGhlcl91c2VyaWQ9JHt1c2VySUR9YFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeTogQXJyYXk8VXNlckdpZnRIaXN0b3J5PiA9IEpTT04ucGFyc2UocmF3R2lmdEhpc3RvcnkpO1xuICAgICAgICAvLyBSZXR1cm4gdGhlIGZ1bGwgZGF0YVxuICAgICAgICByZXR1cm4gZ2lmdEhpc3Rvcnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIyMjIyBHZXQgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdGhlIGxvZ2dlZCBpbiB1c2VyIGFuZCBldmVyeW9uZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0QWxsVXNlckdpZnRIaXN0b3J5KCk6IFByb21pc2U8VXNlckdpZnRIaXN0b3J5W10+IHtcbiAgICAgICAgY29uc3QgcmF3R2lmdEhpc3Rvcnk6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTihcbiAgICAgICAgICAgIGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vdXNlckJvbnVzSGlzdG9yeS5waHBgXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5OiBBcnJheTxVc2VyR2lmdEhpc3Rvcnk+ID0gSlNPTi5wYXJzZShyYXdHaWZ0SGlzdG9yeSk7XG4gICAgICAgIC8vIFJldHVybiB0aGUgZnVsbCBkYXRhXG4gICAgICAgIHJldHVybiBnaWZ0SGlzdG9yeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFJldHVybiB0b2RheSdzIFVUQyBkYXRlIGluIFlZWVktTU0tREQgZm9ybWF0XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRVVENEYXRlU3RyaW5nKGRhdGU6IERhdGUgPSBuZXcgRGF0ZSgpKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgUmVhZCB0aGUgbG9jYWwgcmVjZW50IHBvaW50LWdpZnQgc3RvcmUgYW5kIGRyb3Agc3RhbGUgb3IgbWFsZm9ybWVkIGVudHJpZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldFJlY2VudFBvaW50R2lmdHMoKTogUmVjZW50UG9pbnRHaWZ0W10ge1xuICAgICAgICBjb25zdCBrZXkgPSAnbXBfcmVjZW50UG9pbnRHaWZ0cyc7XG4gICAgICAgIGNvbnN0IHRvZGF5ID0gVXRpbC5nZXRVVENEYXRlU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHJhd0dpZnRIaXN0b3J5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShrZXkpO1xuXG4gICAgICAgIGlmICghcmF3R2lmdEhpc3RvcnkpIHtcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKGtleSwgJ1tdJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VkOiBhbnk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHJhd0dpZnRIaXN0b3J5KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW00rXSBJbnZhbGlkIHJlY2VudCBwb2ludC1naWZ0IGRhdGE7IHJlc2V0dGluZyBzdG9yZS4nLCBlcnJvcik7XG4gICAgICAgICAgICBHTV9zZXRWYWx1ZShrZXksICdbXScpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBhcnNlZCkpIHtcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKGtleSwgJ1tdJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzYW5pdGl6ZWQ6IFJlY2VudFBvaW50R2lmdFtdID0gcGFyc2VkXG4gICAgICAgICAgICAubWFwKChnaWZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYW1vdW50OiBOdW1iZXIoZ2lmdC5hbW91bnQpLFxuICAgICAgICAgICAgICAgICAgICB1c2VySUQ6IGAke2dpZnQudXNlcklEIHx8ICcnfWAsXG4gICAgICAgICAgICAgICAgICAgIHV0Y0RhdGU6IGAke2dpZnQudXRjRGF0ZSB8fCAnJ31gLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZpbHRlcigoZ2lmdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIGdpZnQudXNlcklEICE9PSAnJyAmJlxuICAgICAgICAgICAgICAgICAgICAhaXNOYU4oZ2lmdC5hbW91bnQpICYmXG4gICAgICAgICAgICAgICAgICAgIGdpZnQuYW1vdW50ID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICBnaWZ0LnV0Y0RhdGUgPT09IHRvZGF5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShwYXJzZWQpICE9PSBKU09OLnN0cmluZ2lmeShzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICBHTV9zZXRWYWx1ZShrZXksIEpTT04uc3RyaW5naWZ5KHNhbml0aXplZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNhbml0aXplZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFNhdmUgYSBwb2ludC1naWZ0IHRvdGFsIGZvciBhIHVzZXIgZm9yIHRoZSBjdXJyZW50IFVUQyBkYXlcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlY29yZFBvaW50R2lmdCh1c2VySUQ6IG51bWJlciB8IHN0cmluZywgYW1vdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gJ21wX3JlY2VudFBvaW50R2lmdHMnO1xuICAgICAgICBjb25zdCB0b2RheSA9IFV0aWwuZ2V0VVRDRGF0ZVN0cmluZygpO1xuICAgICAgICBjb25zdCBub3JtYWxpemVkSUQgPSBgJHt1c2VySUR9YDtcbiAgICAgICAgY29uc3QgZ2lmdEhpc3RvcnkgPSBVdGlsLmdldFJlY2VudFBvaW50R2lmdHMoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBnaWZ0SGlzdG9yeS5maW5kKChnaWZ0KSA9PiBnaWZ0LnVzZXJJRCA9PT0gbm9ybWFsaXplZElEKTtcblxuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nLmFtb3VudCArPSBhbW91bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnaWZ0SGlzdG9yeS51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICBhbW91bnQsXG4gICAgICAgICAgICAgICAgdXNlcklEOiBub3JtYWxpemVkSUQsXG4gICAgICAgICAgICAgICAgdXRjRGF0ZTogdG9kYXksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEdNX3NldFZhbHVlKGtleSwgSlNPTi5zdHJpbmdpZnkoZ2lmdEhpc3RvcnkpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFN1bSBsb2NhbGx5IHN0b3JlZCBwb2ludCBnaWZ0cyBzZW50IHRvIGEgdXNlciB0b2RheVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0U2VudFBvaW50c1RvZGF5KHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZElEID0gYCR7dXNlcklEfWA7XG4gICAgICAgIHJldHVybiBVdGlsLmdldFJlY2VudFBvaW50R2lmdHMoKVxuICAgICAgICAgICAgLmZpbHRlcigoZ2lmdCkgPT4gZ2lmdC51c2VySUQgPT09IG5vcm1hbGl6ZWRJRClcbiAgICAgICAgICAgIC5yZWR1Y2UoKHN1bSwgZ2lmdCkgPT4gc3VtICsgZ2lmdC5hbW91bnQsIDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgRGV0ZXJtaW5lIHRoZSBtYXhpbXVtIHBvaW50cyBhIHVzZXIgY2FuIHJlY2VpdmUgdG9kYXlcbiAgICAgKlxuICAgICAqIFdoZW4gdGhlIGN1cnJlbnQgcGFnZSBleHBvc2VzIGEgbmF0aXZlIGdpZnQgaW5wdXQsIHByZWZlciBpdHMgYG1heGAgdmFsdWUuXG4gICAgICogT3RoZXJ3aXNlIGZhbGwgYmFjayB0byB0aGUgc2l0ZSdzIG5vcm1hbCBwb2ludC1naWZ0IGNhcC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldFBvaW50R2lmdERhaWx5TGltaXQoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gWycjYm9udXNnaWZ0JywgJyN0aGFua3NBcmVhIGlucHV0W25hbWU9cG9pbnRzXSddO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCBwb2ludEJveCA9IDxIVE1MSW5wdXRFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChwb2ludEJveCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heFBvaW50cyA9IHBhcnNlSW50KHBvaW50Qm94LmdldEF0dHJpYnV0ZSgnbWF4JykgfHwgJycpO1xuICAgICAgICAgICAgICAgIGlmICghaXNOYU4obWF4UG9pbnRzKSAmJiBtYXhQb2ludHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXhQb2ludHM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDEwMDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIyMjIyBSZXR1cm4gaG93IG1hbnkgcG9pbnRzIGNhbiBzdGlsbCBiZSBzZW50IHRvIGEgdXNlciB0b2RheVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UmVtYWluaW5nUG9pbnRHaWZ0QWxsb3dhbmNlKHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAgICAgVXRpbC5nZXRQb2ludEdpZnREYWlseUxpbWl0KCkgLSBVdGlsLmdldFNlbnRQb2ludHNUb2RheSh1c2VySUQpLFxuICAgICAgICAgICAgMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgR2V0cyB0aGUgbG9nZ2VkIGluIHVzZXIncyB1c2VyaWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEN1cnJlbnRVc2VySUQoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgbXlJbmZvID0gPEhUTUxBbmNob3JFbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tbVVzZXJTdGF0cyAuYXZhdGFyIGEnKVxuICAgICAgICApO1xuICAgICAgICBpZiAobXlJbmZvKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VySUQgPSA8c3RyaW5nPnRoaXMuZW5kT2ZIcmVmKG15SW5mbyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBMb2dnZWQgaW4gdXNlcklEIGlzICR7dXNlcklEfWApO1xuICAgICAgICAgICAgcmV0dXJuIHVzZXJJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnTm8gbG9nZ2VkIGluIHVzZXIgZm91bmQuJyk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHByZXR0eVNpdGVUaW1lKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgZGF0ZT86IGJvb2xlYW4sIHRpbWU/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKHVuaXhUaW1lc3RhbXAgKiAxMDAwKS50b0lTT1N0cmluZygpO1xuICAgICAgICBpZiAoZGF0ZSAmJiAhdGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKCFkYXRlICYmIHRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXAuc3BsaXQoJ1QnKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENoZWNrIGEgc3RyaW5nIHRvIHNlZSBpZiBpdCdzIGRpdmlkZWQgd2l0aCBhIGRhc2gsIHJldHVybmluZyB0aGUgZmlyc3QgaGFsZiBpZiBpdCBkb2Vzbid0IGNvbnRhaW4gYSBzcGVjaWZpZWQgc3RyaW5nXG4gICAgICogQHBhcmFtIG9yaWdpbmFsIFRoZSBvcmlnaW5hbCBzdHJpbmcgYmVpbmcgY2hlY2tlZFxuICAgICAqIEBwYXJhbSBjb250YWluZWQgQSBzdHJpbmcgdGhhdCBtaWdodCBiZSBjb250YWluZWQgaW4gdGhlIG9yaWdpbmFsXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjaGVja0Rhc2hlcyhvcmlnaW5hbDogc3RyaW5nLCBjb250YWluZWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgYGNoZWNrRGFzaGVzKCAke29yaWdpbmFsfSwgJHtjb250YWluZWR9ICk6IENvdW50ICR7b3JpZ2luYWwuaW5kZXhPZihcbiAgICAgICAgICAgICAgICAgICAgJyAtICdcbiAgICAgICAgICAgICAgICApfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEYXNoZXMgYXJlIHByZXNlbnRcbiAgICAgICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJyAtICcpICE9PSAtMSkge1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN0cmluZyBjb250YWlucyBhIGRhc2hgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IG9yaWdpbmFsLnNwbGl0KCcgLSAnKTtcbiAgICAgICAgICAgIGlmIChzcGxpdFswXSA9PT0gY29udGFpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgYD4gU3RyaW5nIGJlZm9yZSBkYXNoIGlzIFwiJHtjb250YWluZWR9XCI7IHVzaW5nIHN0cmluZyBiZWhpbmQgZGFzaGBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwbGl0WzFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyBVdGlsaXRpZXMgc3BlY2lmaWMgdG8gR29vZHJlYWRzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnb29kcmVhZHMgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAqIFJlbW92ZXMgc3BhY2VzIGluIGF1dGhvciBuYW1lcyB0aGF0IHVzZSBhZGphY2VudCBpbnRpdGlhbHMuXG4gICAgICAgICAqIEBwYXJhbSBhdXRoIFRoZSBhdXRob3IocylcbiAgICAgICAgICogQGV4YW1wbGUgXCJIIEcgV2VsbHNcIiAtPiBcIkhHIFdlbGxzXCJcbiAgICAgICAgICovXG4gICAgICAgIHNtYXJ0QXV0aDogKGF1dGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gVXRpbC5zdHJpbmdUb0FycmF5KGF1dGgpO1xuICAgICAgICAgICAgYXJyLmZvckVhY2goKGtleSwgdmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBrZXkgaXMgYW4gaW5pdGlhbFxuICAgICAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBuZXh0IGtleSBpcyBhbiBpbml0aWFsLCBkb24ndCBhZGQgYSBzcGFjZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGVuZzogbnVtYmVyID0gYXJyW3ZhbCArIDFdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRMZW5nIDwgMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBrZXk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGAke2tleX0gYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBzcGFjZVxuICAgICAgICAgICAgcmV0dXJuIG91dHAudHJpbSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogKiBUdXJucyBhIHN0cmluZyBpbnRvIGEgR29vZHJlYWRzIHNlYXJjaCBVUkxcbiAgICAgICAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgVVJMIHRvIG1ha2VcbiAgICAgICAgICogQHBhcmFtIGlucCBUaGUgZXh0cmFjdGVkIGRhdGEgdG8gVVJJIGVuY29kZVxuICAgICAgICAgKi9cbiAgICAgICAgYnVpbGRTZWFyY2hVUkw6ICh0eXBlOiBCb29rRGF0YSB8ICdvbicsIGlucDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBnb29kcmVhZHMuYnVpbGRHclNlYXJjaFVSTCggJHt0eXBlfSwgJHtpbnB9IClgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGdyVHlwZTogc3RyaW5nID0gdHlwZTtcbiAgICAgICAgICAgIGNvbnN0IGNhc2VzOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgYm9vazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnclR5cGUgPSAndGl0bGUnO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICdvbic7XG4gICAgICAgICAgICAgICAgICAgIGlucCArPSAnLCAjJztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChjYXNlc1t0eXBlXSkge1xuICAgICAgICAgICAgICAgIGNhc2VzW3R5cGVdKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGh0dHBzOi8vci5tcmQubmluamEvaHR0cHM6Ly93d3cuZ29vZHJlYWRzLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgICBpbnAucmVwbGFjZSgnJScsICcnKVxuICAgICAgICAgICAgKS5yZXBsYWNlKFwiJ1wiLCAnJTI3Jyl9JnNlYXJjaF90eXBlPWJvb2tzJnNlYXJjaCU1QmZpZWxkJTVEPSR7Z3JUeXBlfWA7XG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgUmV0dXJuIGEgY2xlYW5lZCBib29rIHRpdGxlIGZyb20gYW4gZWxlbWVudFxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHRpdGxlIHRleHRcbiAgICAgKiBAcGFyYW0gYXV0aCBBIHN0cmluZyBvZiBhdXRob3JzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rVGl0bGUgPSBhc3luYyAoXG4gICAgICAgIGRhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXG4gICAgICAgIGF1dGg6IHN0cmluZyA9ICcnXG4gICAgKSA9PiB7XG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEJvb2tUaXRsZSgpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZXh0cmFjdGVkID0gZGF0YS5pbm5lclRleHQ7XG4gICAgICAgIC8vIFNob3J0ZW4gdGl0bGUgYW5kIGNoZWNrIGl0IGZvciBicmFja2V0cyAmIGF1dGhvciBuYW1lc1xuICAgICAgICBleHRyYWN0ZWQgPSBVdGlsLnRyaW1TdHJpbmcoVXRpbC5icmFja2V0UmVtb3ZlcihleHRyYWN0ZWQpLCA1MCk7XG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwuY2hlY2tEYXNoZXMoZXh0cmFjdGVkLCBhdXRoKTtcbiAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogIyMjIyBSZXR1cm4gR1ItZm9ybWF0dGVkIGF1dGhvcnMgYXMgYW4gYXJyYXkgbGltaXRlZCB0byBgbnVtYFxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGF1dGhvciBsaW5rc1xuICAgICAqIEBwYXJhbSBudW0gVGhlIG51bWJlciBvZiBhdXRob3JzIHRvIHJldHVybi4gRGVmYXVsdCAzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rQXV0aG9ycyA9IGFzeW5jIChcbiAgICAgICAgZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICBudW06IG51bWJlciA9IDNcbiAgICApID0+IHtcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignZ2V0Qm9va0F1dGhvcnMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgoYXV0aG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aExpc3QucHVzaChVdGlsLmdvb2RyZWFkcy5zbWFydEF1dGgoYXV0aG9yLmlubmVyVGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICBudW0tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBhdXRoTGlzdDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFJldHVybiBzZXJpZXMgYXMgYW4gYXJyYXlcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBzZXJpZXMgbGlua3NcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tTZXJpZXMgPSBhc3luYyAoZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsKSA9PiB7XG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldEJvb2tTZXJpZXMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKChzZXJpZXMpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LnB1c2goc2VyaWVzLmlubmVyVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzZXJpZXNMaXN0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgUmV0dXJuIGEgdGFibGUtbGlrZSBhcnJheSBvZiByb3dzIGFzIGFuIG9iamVjdC5cbiAgICAgKiBTdG9yZSB0aGUgcmV0dXJuZWQgb2JqZWN0IGFuZCBhY2Nlc3MgdXNpbmcgdGhlIHJvdyB0aXRsZSwgZXguIGBzdG9yZWRbJ1RpdGxlOiddYFxuICAgICAqIEBwYXJhbSByb3dMaXN0IEFuIGFycmF5IG9mIHRhYmxlLWxpa2Ugcm93c1xuICAgICAqIEBwYXJhbSB0aXRsZUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSB0aXRsZSBjZWxscy4gRGVmYXVsdCBgLnRvckRldExlZnRgXG4gICAgICogQHBhcmFtIGRhdGFDbGFzcyBUaGUgY2xhc3MgdXNlZCBieSB0aGUgZGF0YSBjZWxscy4gRGVmYXVsdCBgLnRvckRldFJpZ2h0YFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcm93c1RvT2JqID0gKFxuICAgICAgICByb3dMaXN0OiBOb2RlTGlzdE9mPEVsZW1lbnQ+LFxuICAgICAgICB0aXRsZUNsYXNzID0gJy50b3JEZXRMZWZ0JyxcbiAgICAgICAgZGF0YUNsYXNzID0gJy50b3JEZXRSaWdodCdcbiAgICApID0+IHtcbiAgICAgICAgaWYgKHJvd0xpc3QubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVdGlsLnJvd3NUb09iaiggJHtyb3dMaXN0fSApOiBSb3cgbGlzdCB3YXMgZW1wdHkhYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgcm93czogYW55W10gPSBbXTtcblxuICAgICAgICByb3dMaXN0LmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHJvdy5xdWVyeVNlbGVjdG9yKHRpdGxlQ2xhc3MpO1xuICAgICAgICAgICAgY29uc3QgZGF0YTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IoZGF0YUNsYXNzKTtcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgICAgIHJvd3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogdGl0bGUudGV4dENvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkYXRhLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1JvdyB0aXRsZSB3YXMgZW1wdHkhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAoKG9ialtpdGVtLmtleV0gPSBpdGVtLnZhbHVlKSwgb2JqKSwge30pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENvbnZlcnQgYnl0ZXMgaW50byBhIGh1bWFuLXJlYWRhYmxlIHN0cmluZ1xuICAgICAqIENyZWF0ZWQgYnkgeXl5enp6OTk5XG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVzIHRvIGJlIGZvcm1hdHRlZFxuICAgICAqIEBwYXJhbSBiID9cbiAgICAgKiBAcmV0dXJucyBTdHJpbmcgaW4gdGhlIGZvcm1hdCBvZiBleC4gYDEyMyBNQmBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZvcm1hdEJ5dGVzID0gKGJ5dGVzOiBudW1iZXIsIGIgPSAyKSA9PiB7XG4gICAgICAgIGlmIChieXRlcyA9PT0gMCkgcmV0dXJuICcwIEJ5dGVzJztcbiAgICAgICAgY29uc3QgYyA9IDAgPiBiID8gMCA6IGI7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZygxMDI0KSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBwYXJzZUZsb2F0KChieXRlcyAvIE1hdGgucG93KDEwMjQsIGluZGV4KSkudG9GaXhlZChjKSkgK1xuICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgIFsnQnl0ZXMnLCAnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJywgJ1BpQicsICdFaUInLCAnWmlCJywgJ1lpQiddW2luZGV4XVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENvbnZlcnQgYSBodW1hbi1yZWFkYWJsZSBzaXplIHN0cmluZyBpbnRvIGJ5dGVzXG4gICAgICogRXhhbXBsZSBpbnB1dHM6IGA1My43OSBHaUJgLCBgMTAyLjg4NSBUaUJgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZVNpemVUb0J5dGVzID0gKHRleHQ6IHN0cmluZyk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGV4dC5yZXBsYWNlKC8sL2csICcnKS5tYXRjaChcbiAgICAgICAgICAgIC8oXFxkKyg/OlxcLlxcZCspPylcXHMqKEJ5dGVzfEtpQnxNaUJ8R2lCfFRpQnxQaUJ8RWlCfFppQnxZaUIpL2lcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIHNpemUgZnJvbSBcIiR7dGV4dH1cImApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgICAgICAgY29uc3QgdW5pdCA9IG1hdGNoWzJdO1xuICAgICAgICBjb25zdCBzaXplTWFwID0gWydCeXRlcycsICdLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ107XG4gICAgICAgIGNvbnN0IHBvd2VyID0gc2l6ZU1hcC5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0udG9Mb3dlckNhc2UoKSA9PT0gdW5pdC50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICBpZiAocG93ZXIgPCAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc2l6ZSB1bml0IFwiJHt1bml0fVwiYCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWUgKiBNYXRoLnBvdygxMDI0LCBwb3dlcik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgQ2FsY3VsYXRlIHRoZSBleHRyYSB1cGxvYWQgbmVlZGVkIHRvIHJlYWNoIGEgdGFyZ2V0IHJhdGlvXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB1cGxvYWROZWVkZWRGb3JUYXJnZXRSYXRpbyA9IChcbiAgICAgICAgdXBsb2FkZWRCeXRlczogbnVtYmVyLFxuICAgICAgICBkb3dubG9hZGVkQnl0ZXM6IG51bWJlcixcbiAgICAgICAgdGFyZ2V0UmF0aW86IG51bWJlclxuICAgICk6IG51bWJlciA9PiB7XG4gICAgICAgIGlmIChkb3dubG9hZGVkQnl0ZXMgPD0gMCB8fCB0YXJnZXRSYXRpbyA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgwLCB0YXJnZXRSYXRpbyAqIGRvd25sb2FkZWRCeXRlcyAtIHVwbG9hZGVkQnl0ZXMpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgc3RhdGljIGRlcmVmZXIgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphLyR7ZW5jb2RlVVJJKHVybCl9YDtcbiAgICB9O1xuXG4gICAgcHVibGljIHN0YXRpYyBkZWxheSA9IChtczogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICAgIH07XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XG4vKipcbiAqICMgQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbGlkYXRpb24gJiBjb25maXJtYXRpb25cbiAqL1xuY2xhc3MgQ2hlY2sge1xuICAgIHB1YmxpYyBzdGF0aWMgbmV3VmVyOiBzdHJpbmcgPSBHTV9pbmZvLnNjcmlwdC52ZXJzaW9uO1xuICAgIHB1YmxpYyBzdGF0aWMgcHJldlZlcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ21wX3ZlcnNpb24nKTtcblxuICAgIC8qKlxuICAgICAqICogV2FpdCBmb3IgYW4gZWxlbWVudCB0byBleGlzdCwgdGhlbiByZXR1cm4gaXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBUaGUgRE9NIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZWxlY3QgYW4gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8SFRNTEVsZW1lbnQ+fSBQcm9taXNlIG9mIGFuIGVsZW1lbnQgdGhhdCB3YXMgc2VsZWN0ZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1Mb2FkKFxuICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnRcbiAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMgTG9va2luZyBmb3IgJHtzZWxlY3Rvcn1gLCAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1NTUnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgX2NvdW50ZXIgPSAwO1xuICAgICAgICBjb25zdCBfY291bnRlckxpbWl0ID0gMjAwO1xuICAgICAgICBjb25zdCBsb2dpYyA9IGFzeW5jIChcbiAgICAgICAgICAgIHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MRWxlbWVudFxuICAgICAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+ID0+IHtcbiAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgYWN0dWFsIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9XG4gICAgICAgICAgICAgICAgdHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgICAgIDogc2VsZWN0b3I7XG5cbiAgICAgICAgICAgIGlmIChlbGVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBgJHtzZWxlY3Rvcn0gaXMgdW5kZWZpbmVkIWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gbnVsbCAmJiBfY291bnRlciA8IF9jb3VudGVyTGltaXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLmFmVGltZXIoKTtcbiAgICAgICAgICAgICAgICBfY291bnRlcisrO1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBsb2dpYyhzZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPj0gX2NvdW50ZXJMaW1pdCkge1xuICAgICAgICAgICAgICAgIF9jb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBsb2dpYyhzZWxlY3Rvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBSdW4gYSBmdW5jdGlvbiB3aGVuZXZlciBhbiBlbGVtZW50IGNoYW5nZXNcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgZWxlbWVudCB0byBiZSBvYnNlcnZlZC4gQ2FuIGJlIGEgc3RyaW5nLlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgb2JzZXJ2ZXIgdHJpZ2dlcnNcbiAgICAgKiBAcmV0dXJuIFByb21pc2Ugb2YgYSBtdXRhdGlvbiBvYnNlcnZlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZWxlbU9ic2VydmVyKFxuICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnQgfCBudWxsLFxuICAgICAgICBjYWxsYmFjazogTXV0YXRpb25DYWxsYmFjayxcbiAgICAgICAgY29uZmlnOiBNdXRhdGlvbk9ic2VydmVySW5pdCA9IHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIH1cbiAgICApOiBQcm9taXNlPE11dGF0aW9uT2JzZXJ2ZXI+IHtcbiAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2VsZWN0ZWQgPSA8SFRNTEVsZW1lbnQgfCBudWxsPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZG4ndCBmaW5kICcke3NlbGVjdG9yfSdgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGAlYyBTZXR0aW5nIG9ic2VydmVyIG9uICR7c2VsZWN0b3J9OiAke3NlbGVjdGVkfWAsXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiAjNWQ4YWE4J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGNhbGxiYWNrKTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHNlbGVjdGVkISwgY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBzY3JpcHQgaGFzIGJlZW4gdXBkYXRlZCBmcm9tIGFuIG9sZGVyIHZlcnNpb25cbiAgICAgKiBAcmV0dXJuIFRoZSB2ZXJzaW9uIHN0cmluZyBvciBmYWxzZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlZCgpOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKCdDaGVjay51cGRhdGVkKCknKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQUkVWIFZFUiA9ICR7dGhpcy5wcmV2VmVyfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE5FVyBWRVIgPSAke3RoaXMubmV3VmVyfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8gRGlmZmVyZW50IHZlcnNpb25zOyB0aGUgc2NyaXB0IHdhcyB1cGRhdGVkXG4gICAgICAgICAgICBpZiAodGhpcy5uZXdWZXIgIT09IHRoaXMucHJldlZlcikge1xuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGlzIG5ldyBvciB1cGRhdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBuZXcgdmVyc2lvblxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF92ZXJzaW9uJywgdGhpcy5uZXdWZXIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZXZWZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHNjcmlwdCBoYXMgcnVuIGJlZm9yZVxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaGFzIHJ1biBiZWZvcmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCd1cGRhdGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QtdGltZSBydW5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGhhcyBuZXZlciBydW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBFbmFibGUgdGhlIG1vc3QgYmFzaWMgZmVhdHVyZXNcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2dvb2RyZWFkc0J0bicsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnYWxlcnRzJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ2ZpcnN0UnVuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBub3QgdXBkYXRlZCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIENoZWNrIHRvIHNlZSB3aGF0IHBhZ2UgaXMgYmVpbmcgYWNjZXNzZWRcbiAgICAgKiBAcGFyYW0ge1ZhbGlkUGFnZX0gcGFnZVF1ZXJ5IC0gQW4gb3B0aW9uYWwgcGFnZSB0byBzcGVjaWZpY2FsbHkgY2hlY2sgZm9yXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxzdHJpbmc+fSBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBwYWdlXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gT3B0aW9uYWxseSwgYSBib29sZWFuIGlmIHRoZSBjdXJyZW50IHBhZ2UgbWF0Y2hlcyB0aGUgYHBhZ2VRdWVyeWBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHBhZ2UocGFnZVF1ZXJ5PzogVmFsaWRQYWdlKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IHN0b3JlZFBhZ2UgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcbiAgICAgICAgbGV0IGN1cnJlbnRQYWdlOiBWYWxpZFBhZ2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBDaGVjay5wYWdlKCkgaGFzIGJlZW4gcnVuIGFuZCBhIHZhbHVlIHdhcyBzdG9yZWRcbiAgICAgICAgICAgIGlmIChzdG9yZWRQYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBzdG9yZWQgcGFnZVxuICAgICAgICAgICAgICAgIGlmICghcGFnZVF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RvcmVkUGFnZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IHN0b3JlZFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBub3QgcHJldmlvdXMgcnVuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwYWdlXG4gICAgICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5pbmRleE9mKCcucGhwJykgPyBwYXRoLnNwbGl0KCcucGhwJylbMF0gOiBwYXRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgcGFnZS5zaGlmdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQYWdlIFVSTCBAICR7cGFnZS5qb2luKCcgLT4gJyl9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9iamVjdCBsaXRlcmFsIG9mIHNvcnRzIHRvIHVzZSBhcyBhIFwic3dpdGNoXCJcbiAgICAgICAgICAgICAgICBjb25zdCBjYXNlczogeyBba2V5OiBzdHJpbmddOiAoKSA9PiBWYWxpZFBhZ2UgfCB1bmRlZmluZWQgfSA9IHtcbiAgICAgICAgICAgICAgICAgICAgJyc6ICgpID0+ICdob21lJyxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICgpID0+ICdob21lJyxcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRib3g6ICgpID0+ICdzaG91dGJveCcsXG4gICAgICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiAoKSA9PiAnc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICBzdG9yZTogKCkgPT4gJ3N0b3JlJyxcbiAgICAgICAgICAgICAgICAgICAgZnJlZWxlZWNoOiAoKSA9PiAnZnJlZWxlZWNoJyxcbiAgICAgICAgICAgICAgICAgICAgbWlsbGlvbmFpcmVzOiAoKSA9PiAndmF1bHQnLFxuICAgICAgICAgICAgICAgICAgICB0OiAoKSA9PiAndG9ycmVudCcsXG4gICAgICAgICAgICAgICAgICAgIHU6ICgpID0+ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgZjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2VbMV0gPT09ICd0JykgcmV0dXJuICdmb3J1bSB0aHJlYWQnO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0b3I6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlWzFdID09PSAnYnJvd3NlJykgcmV0dXJuICdicm93c2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3JlcXVlc3RzMicpIHJldHVybiAncmVxdWVzdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAndmlld1JlcXVlc3QnKSByZXR1cm4gJ3JlcXVlc3QgZGV0YWlscyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAndXBsb2FkJykgcmV0dXJuICd1cGxvYWQnO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBuZXdVc2VyczogKCkgPT4gJ25ldyB1c2VycycsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGEgY2FzZSB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICAgICAgIGlmIChjYXNlc1twYWdlWzBdXSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFnZSA9IGNhc2VzW3BhZ2VbMF1dKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBQYWdlIFwiJHtwYWdlfVwiIGlzIG5vdCBhIHZhbGlkIE0rIHBhZ2UuIFBhdGg6ICR7cGF0aH1gKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBjdXJyZW50IHBhZ2UgdG8gYmUgYWNjZXNzZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJywgY3VycmVudFBhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGp1c3QgY2hlY2tpbmcgd2hhdCBwYWdlIHdlJ3JlIG9uLCByZXR1cm4gdGhlIHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3VycmVudFBhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgY2hlY2tpbmcgZm9yIGEgc3BlY2lmaWMgcGFnZSwgcmV0dXJuIFRSVUUvRkFMU0VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogQ2hlY2sgdG8gc2VlIGlmIGEgZ2l2ZW4gY2F0ZWdvcnkgaXMgYW4gZWJvb2svYXVkaW9ib29rIGNhdGVnb3J5XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpc0Jvb2tDYXQoY2F0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ3VycmVudGx5LCBhbGwgYm9vayBjYXRlZ29yaWVzIGFyZSBhc3N1bWVkIHRvIGJlIGluIHRoZSByYW5nZSBvZiAzOS0xMjBcbiAgICAgICAgcmV0dXJuIGNhdCA+PSAzOSAmJiBjYXQgPD0gMTIwID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XG5cbi8qKlxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbHVlcyBhbmQgbWV0aG9kcyByZWxhdGVkIHRvIHN0eWxlc1xuICogQGNvbnN0cnVjdG9yIEluaXRpYWxpemVzIHRoZW1lIGJhc2VkIG9uIGxhc3Qgc2F2ZWQgdmFsdWU7IGNhbiBiZSBjYWxsZWQgYmVmb3JlIHBhZ2UgY29udGVudCBpcyBsb2FkZWRcbiAqIEBtZXRob2QgdGhlbWUgR2V0cyBvciBzZXRzIHRoZSBjdXJyZW50IHRoZW1lXG4gKi9cbmNsYXNzIFN0eWxlIHtcbiAgICBwcml2YXRlIF90aGVtZTogc3RyaW5nO1xuICAgIHByaXZhdGUgX3ByZXZUaGVtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX2Nzc0RhdGE6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBUaGUgbGlnaHQgdGhlbWUgaXMgdGhlIGRlZmF1bHQgdGhlbWUsIHNvIHVzZSBNKyBMaWdodCB2YWx1ZXNcbiAgICAgICAgdGhpcy5fdGhlbWUgPSAnbGlnaHQnO1xuXG4gICAgICAgIC8vIEdldCB0aGUgcHJldmlvdXNseSB1c2VkIHRoZW1lIG9iamVjdFxuICAgICAgICB0aGlzLl9wcmV2VGhlbWUgPSB0aGlzLl9nZXRQcmV2VGhlbWUoKTtcblxuICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgdGhlbWUgb2JqZWN0IGV4aXN0cywgYXNzdW1lIHRoZSBjdXJyZW50IHRoZW1lIGlzIGlkZW50aWNhbFxuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gdGhpcy5fcHJldlRoZW1lO1xuICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oJ25vIHByZXZpb3VzIHRoZW1lJyk7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIENTUyBkYXRhXG4gICAgICAgIHRoaXMuX2Nzc0RhdGEgPSBHTV9nZXRSZXNvdXJjZVRleHQoJ01QX0NTUycpO1xuICAgIH1cblxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgcmV0dXJuZWQgKi9cbiAgICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xuICAgIH1cblxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgc2V0ICovXG4gICAgc2V0IHRoZW1lKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3RoZW1lID0gdmFsO1xuICAgIH1cblxuICAgIC8qKiBTZXRzIHRoZSBNKyB0aGVtZSBiYXNlZCBvbiB0aGUgc2l0ZSB0aGVtZSAqL1xuICAgIHB1YmxpYyBhc3luYyBhbGlnblRvU2l0ZVRoZW1lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB0aGVtZTogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2V0U2l0ZUNTUygpO1xuICAgICAgICB0aGlzLl90aGVtZSA9IHRoZW1lLmluZGV4T2YoJ2RhcmsnKSA+IDAgPyAnZGFyaycgOiAnbGlnaHQnO1xuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB0aGlzLl90aGVtZSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0UHJldlRoZW1lKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbmplY3QgdGhlIENTUyBjbGFzcyB1c2VkIGJ5IE0rIGZvciB0aGVtaW5nXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdib2R5JykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2R5OiBIVE1MQm9keUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICAgICAgaWYgKGJvZHkpIHtcbiAgICAgICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoYG1wXyR7dGhpcy5fdGhlbWV9YCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBCb2R5IGlzICR7Ym9keX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIEluamVjdHMgdGhlIHN0eWxlc2hlZXQgbGluayBpbnRvIHRoZSBoZWFkZXIgKi9cbiAgICBwdWJsaWMgaW5qZWN0TGluaygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWQ6IHN0cmluZyA9ICdtcF9jc3MnO1xuICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSkge1xuICAgICAgICAgICAgY29uc3Qgc3R5bGU6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgc3R5bGUuaWQgPSBpZDtcbiAgICAgICAgICAgIHN0eWxlLmlubmVyVGV4dCA9IHRoaXMuX2Nzc0RhdGEgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2Nzc0RhdGEgOiAnJztcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKSEuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKVxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBhbiBlbGVtZW50IHdpdGggdGhlIGlkIFwiJHtpZH1cIiBhbHJlYWR5IGV4aXN0c2ApO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgaWYgaXQgZXhpc3RzICovXG4gICAgcHJpdmF0ZSBfZ2V0UHJldlRoZW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiBHTV9nZXRWYWx1ZSgnc3R5bGVfdGhlbWUnKTtcbiAgICB9XG5cbiAgICAvKiogU2F2ZXMgdGhlIGN1cnJlbnQgdGhlbWUgZm9yIGZ1dHVyZSByZWZlcmVuY2UgKi9cbiAgICBwcml2YXRlIF9zZXRQcmV2VGhlbWUoKTogdm9pZCB7XG4gICAgICAgIEdNX3NldFZhbHVlKCdzdHlsZV90aGVtZScsIHRoaXMuX3RoZW1lKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRTaXRlQ1NTKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhlbWVVUkw6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykhXG4gICAgICAgICAgICAgICAgLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVtZVVSTCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoZW1lVVJMKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihgdGhlbWVVcmwgaXMgbm90IGEgc3RyaW5nOiAke3RoZW1lVVJMfWApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxuLyoqXG4gKiBDT1JFIEZFQVRVUkVTXG4gKlxuICogWW91ciBmZWF0dXJlIGJlbG9uZ3MgaGVyZSBpZiB0aGUgZmVhdHVyZTpcbiAqIEEpIGlzIGNyaXRpY2FsIHRvIHRoZSB1c2Vyc2NyaXB0XG4gKiBCKSBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG90aGVyIGZlYXR1cmVzXG4gKiBDKSB3aWxsIGhhdmUgc2V0dGluZ3MgZGlzcGxheWVkIG9uIHRoZSBTZXR0aW5ncyBwYWdlXG4gKiBJZiBBICYgQiBhcmUgbWV0IGJ1dCBub3QgQyBjb25zaWRlciB1c2luZyBgVXRpbHMudHNgIGluc3RlYWRcbiAqL1xuXG4vKipcbiAqIFRoaXMgZmVhdHVyZSBjcmVhdGVzIGEgcG9wLXVwIG5vdGlmaWNhdGlvblxuICovXG5jbGFzcyBBbGVydHMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLk90aGVyLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2FsZXJ0cycsXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTSsgQWxlcnQgcGFuZWwgZm9yIHVwZGF0ZSBpbmZvcm1hdGlvbiwgZXRjLicsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgcHVibGljIG5vdGlmeShraW5kOiBzdHJpbmcgfCBib29sZWFuLCBsb2c6IEFycmF5T2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKGBBbGVydHMubm90aWZ5KCAke2tpbmR9IClgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8gVmVyaWZ5IGEgbm90aWZpY2F0aW9uIHJlcXVlc3Qgd2FzIG1hZGVcbiAgICAgICAgICAgIGlmIChraW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gVmVyaWZ5IG5vdGlmaWNhdGlvbnMgYXJlIGFsbG93ZWRcbiAgICAgICAgICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ2FsZXJ0cycpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG1zZyB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1aWxkTXNnID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZE1zZyggJHt0aXRsZX0gKWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBhcnJheSBpc24ndCBlbXB0eVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyci5sZW5ndGggPiAwICYmIGFyclswXSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzZWN0aW9uIGhlYWRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbXNnOiBzdHJpbmcgPSBgPGg0PiR7dGl0bGV9OjwvaDQ+PHVsPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggaXRlbSBpbiB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyci5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSBgPGxpPiR7aXRlbX08L2xpPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgbXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSAnPC91bD4nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBub3RpZmljYXRpb24gcGFuZWxcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRQYW5lbCA9IChtc2c6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkUGFuZWwoICR7bXNnfSApYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnYm9keScpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPSdtcF9ub3RpZmljYXRpb24nPiR7bXNnfTxzcGFuPlg8L3NwYW4+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2dCb3g6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX25vdGlmaWNhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUJ0bjogSFRNTFNwYW5FbGVtZW50ID0gbXNnQm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbG9zZUJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGNsb3NlIGJ1dHRvbiBpcyBjbGlja2VkLCByZW1vdmUgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtc2dCb3gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZ0JveC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2U6IHN0cmluZyA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAndXBkYXRlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyB1cGRhdGUgbWVzc2FnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgPHN0cm9uZz5NQU0rIGhhcyBiZWVuIHVwZGF0ZWQhPC9zdHJvbmc+IFlvdSBhcmUgbm93IHVzaW5nIHYke01QLlZFUlNJT059LCBjcmVhdGVkIG9uICR7TVAuVElNRVNUQU1QfS4gRGlzY3VzcyBpdCBvbiA8YSBocmVmPSdmb3J1bXMucGhwP2FjdGlvbj12aWV3dG9waWMmdG9waWNpZD00MTg2Myc+dGhlIGZvcnVtczwvYT4uPGhyPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGNoYW5nZWxvZ1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuVVBEQVRFX0xJU1QsICdDaGFuZ2VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5CVUdfTElTVCwgJ0tub3duIEJ1Z3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAnZmlyc3RSdW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGg0PldlbGNvbWUgdG8gTUFNKyE8L2g0PlBsZWFzZSBoZWFkIG92ZXIgdG8geW91ciA8YSBocmVmPVwiL3ByZWZlcmVuY2VzL2luZGV4LnBocFwiPnByZWZlcmVuY2VzPC9hPiB0byBlbmFibGUgdGhlIE1BTSsgc2V0dGluZ3MuPGJyPkFueSBidWcgcmVwb3J0cywgZmVhdHVyZSByZXF1ZXN0cywgZXRjLiBjYW4gYmUgbWFkZSBvbiA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2dhcmRlbnNoYWRlL21hbS1wbHVzL2lzc3Vlc1wiPkdpdGh1YjwvYT4sIDxhIGhyZWY9XCIvZm9ydW1zLnBocD9hY3Rpb249dmlld3RvcGljJnRvcGljaWQ9NDE4NjNcIj50aGUgZm9ydW1zPC9hPiwgb3IgPGEgaHJlZj1cIi9zZW5kbWVzc2FnZS5waHA/cmVjZWl2ZXI9MTA4MzAzXCI+dGhyb3VnaCBwcml2YXRlIG1lc3NhZ2U8L2E+Lic7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgZmlyc3QgcnVuIG1lc3NhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBSZWNlaXZlZCBtc2cga2luZDogJHtraW5kfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFuZWwobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWRcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG5jbGFzcyBEZWJ1ZyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZGVidWcnLFxuICAgICAgICBkZXNjOlxuICAgICAgICAgICAgJ0Vycm9yIGxvZyAoPGVtPkNsaWNrIHRoaXMgY2hlY2tib3ggdG8gZW5hYmxlIHZlcmJvc2UgbG9nZ2luZyB0byB0aGUgY29uc29sZTwvZW0+KScsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG4iLCIvKipcbiAqICMgR0xPQkFMIEZFQVRVUkVTXG4gKi9cblxuLyoqXG4gKiAjIyBIaWRlIHRoZSBob21lIGJ1dHRvbiBvciB0aGUgYmFubmVyXG4gKi9cbmNsYXNzIEhpZGVIb21lIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIHR5cGU6ICdkcm9wZG93bicsXG4gICAgICAgIHRpdGxlOiAnaGlkZUhvbWUnLFxuICAgICAgICB0YWc6ICdSZW1vdmUgYmFubmVyL2hvbWUnLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiAnRG8gbm90IHJlbW92ZSBlaXRoZXInLFxuICAgICAgICAgICAgaGlkZUJhbm5lcjogJ0hpZGUgdGhlIGJhbm5lcicsXG4gICAgICAgICAgICBoaWRlSG9tZTogJ0hpZGUgdGhlIGhvbWUgYnV0dG9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgaGVhZGVyIGltYWdlIG9yIEhvbWUgYnV0dG9uLCBiZWNhdXNlIGJvdGggbGluayB0byB0aGUgaG9tZXBhZ2UnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5tZW51JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgY29uc3QgaGlkZXI6IHN0cmluZyA9IEdNX2dldFZhbHVlKHRoaXMuX3NldHRpbmdzLnRpdGxlKTtcbiAgICAgICAgaWYgKGhpZGVyID09PSAnaGlkZUhvbWUnKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfaG9tZScpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBob21lIGJ1dHRvbiEnKTtcbiAgICAgICAgfSBlbHNlIGlmIChoaWRlciA9PT0gJ2hpZGVCYW5uZXInKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfYmFubmVyJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIGJhbm5lciEnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBEcm9wZG93blNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIFVzZSBjdXN0b20gYm9va21hcmsgaWNvbnNcbiAqL1xuY2xhc3MgQm9va21hcmtJY29ucyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2Jvb2ttYXJrSWNvbnMnLFxuICAgICAgICBkZXNjOiBgVXNlIE1BTSsncyBjdXN0b20gYm9va21hcmsgaWNvbnMgaW5zdGVhZCBvZiB0aGUgc2l0ZSdzIGRlZmF1bHQgaWNvbnNgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnYm9keSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHRoaXMuX3NldHRpbmdzLnRpdGxlKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl9zZXR0aW5ncy50aXRsZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdtcF9ib29rbWFya092ZXJyaWRlJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIGJvb2ttYXJrIGljb25zIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIEJ5cGFzcyB0aGUgdmF1bHQgaW5mbyBwYWdlXG4gKi9cbmNsYXNzIFZhdWx0TGluayBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3ZhdWx0TGluaycsXG4gICAgICAgIGRlc2M6ICdNYWtlIHRoZSBWYXVsdCBsaW5rIGJ5cGFzcyB0aGUgVmF1bHQgSW5mbyBwYWdlJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtaWxsaW9uSW5mbyc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpIVxuICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvbWlsbGlvbmFpcmVzL2RvbmF0ZS5waHAnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTWFkZSB0aGUgdmF1bHQgdGV4dCBsaW5rIHRvIHRoZSBkb25hdGUgcGFnZSEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyBTaG9ydGVuIHRoZSB2YXVsdCAmIHJhdGlvIHRleHRcbiAqL1xuY2xhc3MgTWluaVZhdWx0SW5mbyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ21pbmlWYXVsdEluZm8nLFxuICAgICAgICBkZXNjOiAnU2hvcnRlbiB0aGUgVmF1bHQgbGluayAmIHJhdGlvIHRleHQnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21pbGxpb25JbmZvJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgY29uc3QgdmF1bHRUZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGNvbnN0IHJhdGlvVGV4dDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpITtcblxuICAgICAgICAvLyBTaG9ydGVuIHRoZSByYXRpbyB0ZXh0XG4gICAgICAgIC8vIFRPRE86IG1vdmUgdGhpcyB0byBpdHMgb3duIHNldHRpbmc/XG4gICAgICAgIC8qIFRoaXMgY2hhaW5lZCBtb25zdHJvc2l0eSBkb2VzIHRoZSBmb2xsb3dpbmc6XG4gICAgICAgIC0gRXh0cmFjdCB0aGUgbnVtYmVyICh3aXRoIGZsb2F0KSBmcm9tIHRoZSBlbGVtZW50XG4gICAgICAgIC0gRml4IHRoZSBmbG9hdCB0byAyIGRlY2ltYWwgcGxhY2VzICh3aGljaCBjb252ZXJ0cyBpdCBiYWNrIGludG8gYSBzdHJpbmcpXG4gICAgICAgIC0gQ29udmVydCB0aGUgc3RyaW5nIGJhY2sgaW50byBhIG51bWJlciBzbyB0aGF0IHdlIGNhbiBjb252ZXJ0IGl0IHdpdGhgdG9Mb2NhbGVTdHJpbmdgIHRvIGdldCBjb21tYXMgYmFjayAqL1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIoVXRpbC5leHRyYWN0RmxvYXQocmF0aW9UZXh0KVswXS50b0ZpeGVkKDIpKS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICByYXRpb1RleHQuaW5uZXJIVE1MID0gYCR7bnVtfSA8aW1nIHNyYz1cIi9waWMvdXBkb3duQmlnLnBuZ1wiIGFsdD1cInJhdGlvXCI+YDtcblxuICAgICAgICAvLyBUdXJuIHRoZSBudW1lcmljIHBvcnRpb24gb2YgdGhlIHZhdWx0IGxpbmsgaW50byBhIG51bWJlclxuICAgICAgICBsZXQgbmV3VGV4dDogbnVtYmVyID0gcGFyc2VJbnQoXG4gICAgICAgICAgICB2YXVsdFRleHQudGV4dENvbnRlbnQhLnNwbGl0KCc6JylbMV0uc3BsaXQoJyAnKVsxXS5yZXBsYWNlKC8sL2csICcnKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIHZhdWx0IGFtb3VudCB0byBtaWxsaW9udGhzXG4gICAgICAgIG5ld1RleHQgPSBOdW1iZXIoKG5ld1RleHQgLyAxZTYpLnRvRml4ZWQoMykpO1xuICAgICAgICAvLyBVcGRhdGUgdGhlIHZhdWx0IHRleHRcbiAgICAgICAgdmF1bHRUZXh0LnRleHRDb250ZW50ID0gYFZhdWx0OiAke25ld1RleHR9IG1pbGxpb25gO1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaG9ydGVuZWQgdGhlIHZhdWx0ICYgcmF0aW8gbnVtYmVycyEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyBEaXNwbGF5IGJvbnVzIHBvaW50IGRlbHRhXG4gKi9cbmNsYXNzIEJvbnVzUG9pbnREZWx0YSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2JvbnVzUG9pbnREZWx0YScsXG4gICAgICAgIGRlc2M6IGBEaXNwbGF5IGhvdyBtYW55IGJvbnVzIHBvaW50cyB5b3UndmUgZ2FpbmVkIHNpbmNlIGxhc3QgcGFnZWxvYWRgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RtQlAnO1xuICAgIHByaXZhdGUgX3ByZXZCUDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jdXJyZW50QlA6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfZGVsdGE6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0KCkge1xuICAgICAgICBjb25zdCBjdXJyZW50QlBFbDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuXG4gICAgICAgIC8vIEdldCBvbGQgQlAgdmFsdWVcbiAgICAgICAgdGhpcy5fcHJldkJQID0gdGhpcy5fZ2V0QlAoKTtcblxuICAgICAgICBpZiAoY3VycmVudEJQRWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEV4dHJhY3Qgb25seSB0aGUgbnVtYmVyIGZyb20gdGhlIEJQIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSBjdXJyZW50QlBFbC50ZXh0Q29udGVudCEubWF0Y2goXG4gICAgICAgICAgICAgICAgL1xcZCsvZ1xuICAgICAgICAgICAgKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuXG4gICAgICAgICAgICAvLyBTZXQgbmV3IEJQIHZhbHVlXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50QlAgPSBwYXJzZUludChjdXJyZW50WzBdKTtcbiAgICAgICAgICAgIHRoaXMuX3NldEJQKHRoaXMuX2N1cnJlbnRCUCk7XG5cbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZWx0YVxuICAgICAgICAgICAgdGhpcy5fZGVsdGEgPSB0aGlzLl9jdXJyZW50QlAgLSB0aGlzLl9wcmV2QlA7XG5cbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRleHQgaWYgbm90IDBcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZWx0YSAhPT0gMCAmJiAhaXNOYU4odGhpcy5fZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcGxheUJQKHRoaXMuX2RlbHRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2Rpc3BsYXlCUCA9IChicDogbnVtYmVyKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGJvbnVzQm94OiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGxldCBkZWx0YUJveDogc3RyaW5nID0gJyc7XG5cbiAgICAgICAgZGVsdGFCb3ggPSBicCA+IDAgPyBgKyR7YnB9YCA6IGAke2JwfWA7XG5cbiAgICAgICAgaWYgKGJvbnVzQm94ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBib251c0JveC5pbm5lckhUTUwgKz0gYDxzcGFuIGNsYXNzPSdtcF9icERlbHRhJz4gKCR7ZGVsdGFCb3h9KTwvc3Bhbj5gO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgX3NldEJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICAgICAgR01fc2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCwgYCR7YnB9YCk7XG4gICAgfTtcbiAgICBwcml2YXRlIF9nZXRCUCA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBzdG9yZWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVZhbGApO1xuICAgICAgICBpZiAoc3RvcmVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0b3JlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMgQmx1ciB0aGUgaGVhZGVyIGJhY2tncm91bmRcbiAqL1xuY2xhc3MgQmx1cnJlZEhlYWRlciBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2JsdXJyZWRIZWFkZXInLFxuICAgICAgICBkZXNjOiBgQWRkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIgYXJlYWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc2l0ZU1haW4gPiBoZWFkZXInO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAke3RoaXMuX3Rhcn1gKTtcbiAgICAgICAgY29uc3QgaGVhZGVySW1nOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKGBpbWdgKTtcblxuICAgICAgICBpZiAoaGVhZGVySW1nKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJTcmM6IHN0cmluZyB8IG51bGwgPSBoZWFkZXJJbWcuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgY29udGFpbmVyIGZvciB0aGUgYmFja2dyb3VuZFxuICAgICAgICAgICAgY29uc3QgYmx1cnJlZEJhY2s6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdtcF9ibHVycmVkQmFjaycpO1xuICAgICAgICAgICAgaGVhZGVyLmFwcGVuZChibHVycmVkQmFjayk7XG4gICAgICAgICAgICBibHVycmVkQmFjay5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBoZWFkZXJTcmMgPyBgdXJsKCR7aGVhZGVyU3JjfSlgIDogJyc7XG4gICAgICAgICAgICBibHVycmVkQmFjay5jbGFzc0xpc3QuYWRkKCdtcF9jb250YWluZXInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIhJyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB0eXBlIHNlbGVjdGVkIGZvciBgdGhpcy5fc2V0dGluZ3NgXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMgSGlkZSB0aGUgc2VlZGJveCBsaW5rXG4gKi9cbmNsYXNzIEhpZGVTZWVkYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdoaWRlU2VlZGJveCcsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBcIkdldCBBIFNlZWRib3hcIiBtZW51IGl0ZW0nLFxuICAgIH07XG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtZW51IC5zYkRvbkNyeXB0byc7XG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3Qgc2VlZGJveEJ0bjogSFRNTExJRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGlmIChzZWVkYm94QnRuKSB7XG4gICAgICAgICAgICBzZWVkYm94QnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIFNlZWRib3ggYnV0dG9uIScpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIEhpZGUgdGhlIGRvbmF0aW9uIGxpbmtcbiAqL1xuY2xhc3MgSGlkZURvbmF0aW9uQm94IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdoaWRlRG9uYXRpb25Cb3gnLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgRG9uYXRpb25zIG1lbnUgaXRlbScsXG4gICAgfTtcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21lbnUgLm1tRG9uQm94JztcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zdCBkb25hdGlvbkJveEJ0bjogSFRNTExJRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGlmIChkb25hdGlvbkJveEJ0bikge1xuICAgICAgICAgICAgZG9uYXRpb25Cb3hCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgRG9uYXRpb24gQm94IGJ1dHRvbiEnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIEZpeGVkIG5hdmlnYXRpb24gJiBzZWFyY2hcbiAqL1xuXG5jbGFzcyBGaXhlZE5hdiBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZml4ZWROYXYnLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcbiAgICAgICAgZGVzYzogJ0ZpeCB0aGUgbmF2aWdhdGlvbi9zZWFyY2ggdG8gdGhlIHRvcCBvZiB0aGUgcGFnZS4nLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnYm9keSc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFtdKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSEuY2xhc3NMaXN0LmFkZCgnbXBfZml4ZWRfbmF2Jyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFBpbm5lZCB0aGUgbmF2L3NlYXJjaCB0byB0aGUgdG9wIScpO1xuICAgIH1cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jaGVjay50c1wiIC8+XG5cbi8qKlxuICogU0hBUkVEIENPREVcbiAqXG4gKiBUaGlzIGlzIGZvciBhbnl0aGluZyB0aGF0J3Mgc2hhcmVkIGJldHdlZW4gZmlsZXMsIGJ1dCBpcyBub3QgZ2VuZXJpYyBlbm91Z2ggdG9cbiAqIHRvIGJlbG9uZyBpbiBgVXRpbHMudHNgLiBJIGNhbid0IHRoaW5rIG9mIGEgYmV0dGVyIHdheSB0byBjYXRlZ29yaXplIERSWSBjb2RlLlxuICovXG5cbmNsYXNzIFNoYXJlZCB7XG4gICAgLyoqXG4gICAgICogUmVjZWl2ZSBhIHRhcmdldCBhbmQgYHRoaXMuX3NldHRpbmdzLnRpdGxlYFxuICAgICAqIEBwYXJhbSB0YXIgQ1NTIHNlbGVjdG9yIGZvciBhIHRleHQgaW5wdXQgYm94XG4gICAgICovXG4gICAgLy8gVE9ETzogd2l0aCBhbGwgQ2hlY2tpbmcgYmVpbmcgZG9uZSBpbiBgVXRpbC5zdGFydEZlYXR1cmUoKWAgaXQncyBubyBsb25nZXIgbmVjZXNzYXJ5IHRvIENoZWNrIGluIHRoaXMgZnVuY3Rpb25cbiAgICBwdWJsaWMgZmlsbEdpZnRCb3ggPSAoXG4gICAgICAgIHRhcjogc3RyaW5nLFxuICAgICAgICBzZXR0aW5nVGl0bGU6IHN0cmluZ1xuICAgICk6IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPiA9PiB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5maWxsR2lmdEJveCggJHt0YXJ9LCAke3NldHRpbmdUaXRsZX0gKWApO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQodGFyKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludEJveDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRCb3gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlclNldFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtzZXR0aW5nVGl0bGV9X3ZhbGApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXhQb2ludHM6IG51bWJlciA9IHBhcnNlSW50KHBvaW50Qm94LmdldEF0dHJpYnV0ZSgnbWF4JykhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTih1c2VyU2V0UG9pbnRzKSAmJiB1c2VyU2V0UG9pbnRzIDw9IG1heFBvaW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4UG9pbnRzID0gdXNlclNldFBvaW50cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwb2ludEJveC52YWx1ZSA9IG1heFBvaW50cy50b0ZpeGVkKDApO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1heFBvaW50cyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBsaXN0IG9mIGFsbCByZXN1bHRzIGZyb20gQnJvd3NlIHBhZ2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2VhcmNoTGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+ID0+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmdldFNlYXJjaExpc3QoIClgKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSBzZWFyY2ggcmVzdWx0cyB0byBleGlzdFxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0gdGQnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hdGNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiA9IDxcbiAgICAgICAgICAgICAgICAgICAgTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxuICAgICAgICAgICAgICAgID5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjc3NyIHRyW2lkIF49IFwidGRyXCJdJyk7XG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgc25hdGNoTGlzdCBpcyAke3NuYXRjaExpc3R9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IE1ha2UgZ29vZHJlYWRzQnV0dG9ucygpIGludG8gYSBnZW5lcmljIGZyYW1ld29yayBmb3Igb3RoZXIgc2l0ZSdzIGJ1dHRvbnNcbiAgICBwdWJsaWMgZ29vZHJlYWRzQnV0dG9ucyA9IGFzeW5jIChcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXG4gICAgICAgIGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgICkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucy4uLicpO1xuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xuXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggR29vZHJlYWRzJywgJ21wX2dyUm93Jyk7XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9nclJvdyAuZmxleCcpO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cgLmZsZXgnKVxuICAgICAgICApO1xuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnc2VyaWVzJywgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgYnV0dG9uVGl0bGUsIDQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCdWlsZCBBdXRob3IgYnV0dG9uXG4gICAgICAgIGF1dGhvclBcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGF1dGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdXRob3JzID0gYXV0aC5qb2luKCcgJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdhdXRob3InLCBhdXRob3JzKTtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnQXV0aG9yJywgMyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBhdXRob3IgZGF0YSBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy8gQnVpbGQgVGl0bGUgYnV0dG9uc1xuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXdhaXQgVXRpbC5nZXRCb29rVGl0bGUoYm9va0RhdGEsIGF1dGhvcnMpO1xuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2Jvb2snLCB0aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ1RpdGxlJywgMik7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGEgdGl0bGUgYW5kIGF1dGhvciBib3RoIGV4aXN0LCBtYWtlIGEgVGl0bGUgKyBBdXRob3IgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRob3JzICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYm90aFVSTCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGl0bGV9ICR7YXV0aG9yc31gXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucyFgKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGF1ZGlibGVCdXR0b25zID0gYXN5bmMgKFxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gICAgKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyB0aGUgTUFNLXRvLUF1ZGlibGUgYnV0dG9ucy4uLicpO1xuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xuXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggQXVkaWJsZScsICdtcF9hdVJvdycpO1xuXG4gICAgICAgIC8vIEV4dHJhY3QgdGhlIFNlcmllcyBhbmQgQXV0aG9yXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcbiAgICAgICAgICAgIChhdXRob3JQID0gVXRpbC5nZXRCb29rQXV0aG9ycyhhdXRob3JEYXRhKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcubXBfYXVSb3cgLmZsZXgnKTtcblxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2F1Um93IC5mbGV4JylcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdXR0b24gcm93IGNhbm5vdCBiZSB0YXJnZXRlZCEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIFNlcmllcyBidXR0b25zXG4gICAgICAgIHNlcmllc1AudGhlbigoc2VyKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZXIuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBidXR0b25UaXRsZSA9IHNlci5sZW5ndGggPiAxID8gYFNlcmllczogJHtpdGVtfWAgOiAnU2VyaWVzJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD9rZXl3b3Jkcz0ke2l0ZW19YDtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCBidXR0b25UaXRsZSwgNCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc2VyaWVzIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cbiAgICAgICAgYXV0aG9yUFxuICAgICAgICAgICAgLnRoZW4oKGF1dGgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcnMgPSBhdXRoLmpvaW4oJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD9hdXRob3JfYXV0aG9yPSR7YXV0aG9yc31gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP3RpdGxlPSR7dGl0bGV9YDtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD90aXRsZT0ke3RpdGxlfSZhdXRob3JfYXV0aG9yPSR7YXV0aG9yc31gO1xuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1BdWRpYmxlIGJ1dHRvbnMhYCk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IFN3aXRjaCB0byBTdG9yeUdyYXBoIEFQSSBvbmNlIGl0IGJlY29tZXMgYXZhaWxhYmxlPyBPciBhZHZhbmNlZCBzZWFyY2hcbiAgICBwdWJsaWMgc3RvcnlHcmFwaEJ1dHRvbnMgPSBhc3luYyAoXG4gICAgICAgIGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcbiAgICAgICAgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgICApID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zLi4uJyk7XG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XG5cbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBUaGVTdG9yeUdyYXBoJywgJ21wX3NnUm93Jyk7XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9zZ1JvdyAuZmxleCcpO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cgLmZsZXgnKVxuICAgICAgICApO1xuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7aXRlbX1gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsIGJ1dHRvblRpdGxlLCA0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZXJpZXMgZGF0YSBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQnVpbGQgQXV0aG9yIGJ1dHRvblxuICAgICAgICBhdXRob3JQXG4gICAgICAgICAgICAudGhlbigoYXV0aCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhdXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7YXV0aG9yc31gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7dGl0bGV9YDtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gYGh0dHBzOi8vYXBwLnRoZXN0b3J5Z3JhcGguY29tL2Jyb3dzZT9zZWFyY2hfdGVybT0ke3RpdGxlfSAke2F1dGhvcnN9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIGJvdGhVUkwsICdUaXRsZSArIEF1dGhvcicsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGdlbmVyYXRlIFRpdGxlK0F1dGhvciBsaW5rIVxcblRpdGxlOiAke3RpdGxlfVxcbkF1dGhvcnM6ICR7YXV0aG9yc31gXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyB0aXRsZSBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGVkIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zIWApO1xuICAgIH07XG5cbiAgICBwdWJsaWMgZ2V0UmF0aW9Qcm90ZWN0TGV2ZWxzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgbDEgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMMV92YWwnKSk7XG4gICAgICAgIGxldCBsMiA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwyX3ZhbCcpKTtcbiAgICAgICAgbGV0IGwzID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDNfdmFsJykpO1xuICAgICAgICBjb25zdCBsMV9kZWYgPSAwLjU7XG4gICAgICAgIGNvbnN0IGwyX2RlZiA9IDE7XG4gICAgICAgIGNvbnN0IGwzX2RlZiA9IDI7XG5cbiAgICAgICAgLy8gRGVmYXVsdCB2YWx1ZXMgaWYgZW1wdHlcbiAgICAgICAgaWYgKGlzTmFOKGwzKSkgbDMgPSBsM19kZWY7XG4gICAgICAgIGlmIChpc05hTihsMikpIGwyID0gbDJfZGVmO1xuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IGwxX2RlZjtcblxuICAgICAgICAvLyBJZiBzb21lb25lIHB1dCB0aGluZ3MgaW4gYSBkdW1iIG9yZGVyLCBpZ25vcmUgc21hbGxlciBudW1iZXJzXG4gICAgICAgIGlmIChsMiA+IGwzKSBsMiA9IGwzO1xuICAgICAgICBpZiAobDEgPiBsMikgbDEgPSBsMjtcblxuICAgICAgICAvLyBJZiBjdXN0b20gbnVtYmVycyBhcmUgc21hbGxlciB0aGFuIGRlZmF1bHQgdmFsdWVzLCBpZ25vcmUgdGhlIGxvd2VyIHdhcm5pbmdcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSBsMyA8IGwyX2RlZiA/IGwzIDogbDJfZGVmO1xuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IGwyIDwgbDFfZGVmID8gbDIgOiBsMV9kZWY7XG5cbiAgICAgICAgcmV0dXJuIFtsMSwgbDIsIGwzXTtcbiAgICB9O1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XG4vKipcbiAqICNCUk9XU0UgUEFHRSBGRUFUVVJFU1xuICovXG5cbmNvbnN0IHVwZGF0ZUJyb3dzZVJlc3VsdFZpc2liaWxpdHkgPSAocm93OiBIVE1MVGFibGVSb3dFbGVtZW50KTogdm9pZCA9PiB7XG4gICAgY29uc3QgaGlkZGVuQnlTbmF0Y2hlZDogYm9vbGVhbiA9IHJvdy5kYXRhc2V0Lm1wSGlkZVNuYXRjaGVkID09PSAndHJ1ZSc7XG4gICAgY29uc3QgaGlkZGVuQnlCb29rbWFya2VkOiBib29sZWFuID0gcm93LmRhdGFzZXQubXBIaWRlQm9va21hcmtlZCA9PT0gJ3RydWUnO1xuXG4gICAgcm93LnN0eWxlLmRpc3BsYXkgPSBoaWRkZW5CeVNuYXRjaGVkIHx8IGhpZGRlbkJ5Qm9va21hcmtlZCA/ICdub25lJyA6ICd0YWJsZS1yb3cnO1xufTtcblxuLyoqXG4gKiBBbGxvd3MgU25hdGNoZWQgdG9ycmVudHMgdG8gYmUgaGlkZGVuL3Nob3duXG4gKi9cbmNsYXNzIFRvZ2dsZVNuYXRjaGVkIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU25hdGNoZWQnLFxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGhpZGUvc2hvdyByZXN1bHRzIHRoYXQgeW91J3ZlIHNuYXRjaGVkYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xuICAgIHByaXZhdGUgX2lzVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBfc2VhcmNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIF9zbmF0Y2hlZEhvb2s6IHN0cmluZyA9ICd0ZCBkaXZbY2xhc3NePVwiYnJvd3NlXCJdJztcbiAgICBwcml2YXRlIF9yb3dTdGF0ZUtleTogc3RyaW5nID0gJ21wSGlkZVNuYXRjaGVkJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsZXQgdG9nZ2xlOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XG4gICAgICAgIGxldCByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+O1xuICAgICAgICBjb25zdCBzdG9yZWRTdGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXG4gICAgICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoc3RvcmVkU3RhdGUgPT09ICdmYWxzZScgJiYgR01fZ2V0VmFsdWUoJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlVGV4dDogc3RyaW5nID0gdGhpcy5faXNWaXNpYmxlID8gJ0hpZGUgU25hdGNoZWQnIDogJ1Nob3cgU25hdGNoZWQnO1xuXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHRvZ2dsZSA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdzbmF0Y2hlZFRvZ2dsZScsXG4gICAgICAgICAgICAgICAgdG9nZ2xlVGV4dCxcbiAgICAgICAgICAgICAgICAnaDEnLFxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBiYXNlZCBvbiB2aXMgc3RhdGVcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBTbmF0Y2hlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0hpZGUgU25hdGNoZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJlc3VsdExpc3RcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBUb2dnbGUgU25hdGNoZWQgYnV0dG9uIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxuICAgICAqIEBwYXJhbSBzdWJUYXIgdGhlIGVsZW1lbnRzIHRoYXQgbXVzdCBiZSBjb250YWluZWQgaW4gb3VyIGZpbHRlcmVkIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxpc3QuZm9yRWFjaCgoc25hdGNoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxIZWFkaW5nRWxlbWVudCA9IDxIVE1MSGVhZGluZ0VsZW1lbnQ+KFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zbmF0Y2hlZFRvZ2dsZScpIVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IG9ubHkgdGhlIGl0ZW1zIHRoYXQgbWF0Y2ggb3VyIHN1YiBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzbmF0Y2gucXVlcnlTZWxlY3RvcihzdWJUYXIpO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gSGlkZS9zaG93IGFzIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdTaG93IFNuYXRjaGVkJztcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLmRhdGFzZXRbdGhpcy5fcm93U3RhdGVLZXldID0gJ3RydWUnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBTbmF0Y2hlZCc7XG4gICAgICAgICAgICAgICAgICAgIHNuYXRjaC5kYXRhc2V0W3RoaXMuX3Jvd1N0YXRlS2V5XSA9ICdmYWxzZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzbmF0Y2guZGF0YXNldFt0aGlzLl9yb3dTdGF0ZUtleV0gPSAnZmFsc2UnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB1cGRhdGVCcm93c2VSZXN1bHRWaXNpYmlsaXR5KHNuYXRjaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldFZpc1N0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTbmF0Y2ggdmlzIHN0YXRlOicsIHRoaXMuX2lzVmlzaWJsZSwgJ1xcbnZhbDonLCB2YWwpO1xuICAgICAgICB9XG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xuICAgICAgICB0aGlzLl9pc1Zpc2libGUgPSB2YWw7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBnZXQgc2VhcmNoTGlzdCgpOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hsaXN0IGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xuICAgIH1cblxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh2YWwpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZW1lbWJlcnMgdGhlIHN0YXRlIG9mIFRvZ2dsZVNuYXRjaGVkIGJldHdlZW4gcGFnZSBsb2Fkc1xuICovXG5jbGFzcyBTdGlja3lTbmF0Y2hlZFRvZ2dsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJyxcbiAgICAgICAgZGVzYzogYE1ha2Ugc25hdGNoZWQgdG9nZ2xlIHN0YXRlIHBlcnNpc3QgYmV0d2VlbiBwYWdlIGxvYWRzYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBSZW1lbWJlcmVkIHNuYXRjaCB2aXNpYmlsaXR5IHN0YXRlIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIEFsbG93cyBCb29rbWFya2VkIHRvcnJlbnRzIHRvIGJlIGhpZGRlbi9zaG93blxuICovXG5jbGFzcyBUb2dnbGVCb29rbWFya2VkIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlQm9va21hcmtlZCcsXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gaGlkZS9zaG93IHJlc3VsdHMgdGhhdCB5b3UndmUgYm9va21hcmtlZGAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9pc1Zpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfYm9va21hcmtIb29rOiBzdHJpbmcgPSAnYVtpZCBePSBcInRvckRlQm9va21hcmtcIl0nO1xuICAgIHByaXZhdGUgX3Jvd1N0YXRlS2V5OiBzdHJpbmcgPSAnbXBIaWRlQm9va21hcmtlZCc7XG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgbGV0IHRvZ2dsZTogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+O1xuICAgICAgICBsZXQgcmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PjtcbiAgICAgICAgY29uc3Qgc3RvcmVkU3RhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxuICAgICAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHN0b3JlZFN0YXRlID09PSAnZmFsc2UnICYmIEdNX2dldFZhbHVlKCdzdGlja3lCb29rbWFya2VkVG9nZ2xlJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlVGV4dDogc3RyaW5nID0gdGhpcy5faXNWaXNpYmxlID8gJ0hpZGUgQm9va21hcmtlZCcgOiAnU2hvdyBCb29rbWFya2VkJztcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAodG9nZ2xlID0gVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAgICAgJ2Jvb2ttYXJrZWRUb2dnbGUnLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVRleHQsXG4gICAgICAgICAgICAgICAgJ2gxJyxcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcbiAgICAgICAgICAgICkpLFxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCkpLFxuICAgICAgICBdKTtcblxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBCb29rbWFya2VkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBCb29rbWFya2VkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fYm9va21hcmtIb29rKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICByZXN1bHRMaXN0XG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcbiAgICAgICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gcmVzO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fYm9va21hcmtIb29rKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgVG9nZ2xlIEJvb2ttYXJrZWQgYnV0dG9uIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXG4gICAgICAgICAgICAgICAgICAgICcjc3NyJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9ib29rbWFya0hvb2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxuICAgICAqIEBwYXJhbSBzdWJUYXIgdGhlIGVsZW1lbnRzIHRoYXQgbXVzdCBiZSBjb250YWluZWQgaW4gb3VyIGZpbHRlcmVkIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxpc3QuZm9yRWFjaCgoYm9va21hcmspID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEhlYWRpbmdFbGVtZW50ID0gPEhUTUxIZWFkaW5nRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2Jvb2ttYXJrZWRUb2dnbGUnKSFcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGJvb2ttYXJrLnF1ZXJ5U2VsZWN0b3Ioc3ViVGFyKTtcblxuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1Zpc2libGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBCb29rbWFya2VkJztcbiAgICAgICAgICAgICAgICAgICAgYm9va21hcmsuZGF0YXNldFt0aGlzLl9yb3dTdGF0ZUtleV0gPSAndHJ1ZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdIaWRlIEJvb2ttYXJrZWQnO1xuICAgICAgICAgICAgICAgICAgICBib29rbWFyay5kYXRhc2V0W3RoaXMuX3Jvd1N0YXRlS2V5XSA9ICdmYWxzZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib29rbWFyay5kYXRhc2V0W3RoaXMuX3Jvd1N0YXRlS2V5XSA9ICdmYWxzZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVwZGF0ZUJyb3dzZVJlc3VsdFZpc2liaWxpdHkoYm9va21hcmspO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRWaXNTdGF0ZSh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQm9va21hcmsgdmlzIHN0YXRlOicsIHRoaXMuX2lzVmlzaWJsZSwgJ1xcbnZhbDonLCB2YWwpO1xuICAgICAgICB9XG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xuICAgICAgICB0aGlzLl9pc1Zpc2libGUgPSB2YWw7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBnZXQgc2VhcmNoTGlzdCgpOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hsaXN0IGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xuICAgIH1cblxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh2YWwpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZW1lbWJlcnMgdGhlIHN0YXRlIG9mIFRvZ2dsZUJvb2ttYXJrZWQgYmV0d2VlbiBwYWdlIGxvYWRzXG4gKi9cbmNsYXNzIFN0aWNreUJvb2ttYXJrZWRUb2dnbGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdzdGlja3lCb29rbWFya2VkVG9nZ2xlJyxcbiAgICAgICAgZGVzYzogYE1ha2UgYm9va21hcmtlZCB0b2dnbGUgc3RhdGUgcGVyc2lzdCBiZXR3ZWVuIHBhZ2UgbG9hZHNgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFJlbWVtYmVyZWQgYm9va21hcmsgdmlzaWJpbGl0eSBzdGF0ZSEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHBsYWludGV4dCBsaXN0IG9mIHNlYXJjaCByZXN1bHRzXG4gKi9cbmNsYXNzIFBsYWludGV4dFNlYXJjaCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFNlYXJjaCcsXG4gICAgICAgIGRlc2M6IGBJbnNlcnQgcGxhaW50ZXh0IHNlYXJjaCByZXN1bHRzIGF0IHRvcCBvZiBwYWdlYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3IgaDEnO1xuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcbiAgICApO1xuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XG5cbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdwbGFpblRvZ2dsZScsXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAnI3NzcicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIHJlc3VsdHMgaW50byBwbGFpbnRleHRcbiAgICAgICAgcmVzdWx0TGlzdFxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb3B5IGJ1dHRvblxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICAgICAgICAgJ3BsYWluQ29weScsXG4gICAgICAgICAgICAgICAgICAgICdDb3B5IFBsYWludGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAnI21wX3BsYWluVG9nZ2xlJyxcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgcGxhaW50ZXh0IGJveFxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgICAgICAgICBgPGJyPjx0ZXh0YXJlYSBjbGFzcz0nbXBfcGxhaW50ZXh0U2VhcmNoJyBzdHlsZT0nZGlzcGxheTogbm9uZSc+PC90ZXh0YXJlYT5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcbiAgICAgICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbml0IG9wZW4gc3RhdGVcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHRoaXMuX2lzT3Blbik7XG5cbiAgICAgICAgLy8gU2V0IHVwIHRvZ2dsZSBidXR0b24gZnVuY3Rpb25hbGl0eVxuICAgICAgICB0b2dnbGVCdG5cbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGV4dGJveCBzaG91bGQgZXhpc3QsIGJ1dCBqdXN0IGluIGNhc2UuLi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRib3g6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dGJveCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGV4dGJveCBkb2Vzbid0IGV4aXN0IWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ3RydWUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnSGlkZSBQbGFpbnRleHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnU2hvdyBQbGFpbnRleHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluc2VydGVkIHBsYWludGV4dCBzZWFyY2ggcmVzdWx0cyEnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxuICAgICAqIEBwYXJhbSB2YWwgc3RyaW5naWZpZWQgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcbiAgICAgICAgR01fc2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgLCB2YWwpO1xuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMoXG4gICAgICAgIHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD5cbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgLy8gUmVzZXQgZWFjaCB0ZXh0IGZpZWxkXG4gICAgICAgICAgICBsZXQgdGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIGxldCBhdXRoVGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IG5hcnJUaXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXG4gICAgICAgICAgICBjb25zdCByYXdUaXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yKCcudG9yVGl0bGUnKTtcbiAgICAgICAgICAgIGNvbnN0IHNlcmllc0xpc3Q6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgICAgID4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2VyaWVzJyk7XG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IG5hcnJMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgTm9kZTonLCBub2RlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc3VsdCB0aXRsZSBzaG91bGQgbm90IGJlIG51bGxgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSByYXdUaXRsZS50ZXh0Q29udGVudCEudHJpbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHNlcmllc1xuICAgICAgICAgICAgaWYgKHNlcmllc0xpc3QgIT09IG51bGwgJiYgc2VyaWVzTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgKz0gYCR7c2VyaWVzLnRleHRDb250ZW50fSAvIGA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IHNlcmllc1RpdGxlLnN1YnN0cmluZygwLCBzZXJpZXNUaXRsZS5sZW5ndGggLSAzKTtcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IGAgKCR7c2VyaWVzVGl0bGV9KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm9jZXNzIGF1dGhvcnNcbiAgICAgICAgICAgIGlmIChhdXRoTGlzdCAhPT0gbnVsbCAmJiBhdXRoTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XG4gICAgICAgICAgICAgICAgYXV0aExpc3QuZm9yRWFjaCgoYXV0aCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhdXRoVGl0bGUgKz0gYCR7YXV0aC50ZXh0Q29udGVudH0gQU5EIGA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9IGF1dGhUaXRsZS5zdWJzdHJpbmcoMCwgYXV0aFRpdGxlLmxlbmd0aCAtIDUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvY2VzcyBuYXJyYXRvcnNcbiAgICAgICAgICAgIGlmIChuYXJyTGlzdCAhPT0gbnVsbCAmJiBuYXJyTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XG4gICAgICAgICAgICAgICAgbmFyckxpc3QuZm9yRWFjaCgobmFycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuYXJyVGl0bGUgKz0gYCR7bmFyci50ZXh0Q29udGVudH0gQU5EIGA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9IG5hcnJUaXRsZS5zdWJzdHJpbmcoMCwgbmFyclRpdGxlLmxlbmd0aCAtIDUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cCArPSBgJHt0aXRsZX0ke3Nlcmllc1RpdGxlfSAke2F1dGhUaXRsZX0gJHtuYXJyVGl0bGV9XFxuYDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBvdXRwO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxuXG4gICAgZ2V0IGlzT3BlbigpOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcbiAgICB9XG5cbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIHRoZSBzZWFyY2ggZmVhdHVyZXMgdG8gYmUgaGlkZGVuL3Nob3duXG4gKi9cbmNsYXNzIFRvZ2dsZVNlYXJjaGJveCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3RvZ2dsZVNlYXJjaGJveCcsXG4gICAgICAgIGRlc2M6IGBDb2xsYXBzZSB0aGUgU2VhcmNoIGJveCBhbmQgbWFrZSBpdCB0b2dnbGVhYmxlYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JTZWFyY2hDb250cm9sJztcbiAgICBwcml2YXRlIF9oZWlnaHQ6IHN0cmluZyA9ICcyNnB4JztcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgPSAnZmFsc2UnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzZWFyY2hib3g6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgaWYgKHNlYXJjaGJveCkge1xuICAgICAgICAgICAgLy8gQWRqdXN0IHRoZSB0aXRsZSB0byBtYWtlIGl0IGNsZWFyIGl0IGlzIGEgdG9nZ2xlIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHNlYXJjaGJveC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICcuYmxvY2tIZWFkQ29uIGg0J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgICAgIC8vIEFkanVzdCB0ZXh0ICYgc3R5bGVcbiAgICAgICAgICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAnVG9nZ2xlIFNlYXJjaCc7XG4gICAgICAgICAgICAgICAgdGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBjbGljayBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90b2dnbGUoc2VhcmNoYm94ISk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBzZXQgdXAgdG9nZ2xlISBUYXJnZXQgZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENvbGxhcHNlIHRoZSBzZWFyY2hib3hcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hib3gsIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogYGhlaWdodDoke3RoaXMuX2hlaWdodH07b3ZlcmZsb3c6aGlkZGVuO2AsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEhpZGUgZXh0cmEgdGV4dFxuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uOiBIVE1MSGVhZGluZ0VsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAnI21haW5Cb2R5ID4gaDMnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZ3VpZGVMaW5rOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICcjbWFpbkJvZHkgPiBoMyB+IGEnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbikgbm90aWZpY2F0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBpZiAoZ3VpZGVMaW5rKSBndWlkZUxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29sbGFwc2VkIHRoZSBTZWFyY2ggYm94IScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNvbGxhcHNlIFNlYXJjaCBib3ghIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfdG9nZ2xlKGVsZW06IEhUTUxEaXZFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gJ3Vuc2V0JztcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9ICd0cnVlJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ2ZhbHNlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdUb2dnbGVkIFNlYXJjaCBib3ghJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWRkcyBhIGZpbGV0eXBlIHBpY2tlciB0aGF0IHdyaXRlcyBNQU0ncyBAZmlsZXR5cGUgZmlsdGVyIGludG8gc2VhcmNoIHRleHRcbiAqL1xuY2xhc3MgRmlsZXR5cGVTZWFyY2hGaWx0ZXIgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdmaWxldHlwZVNlYXJjaEZpbHRlcicsXG4gICAgICAgIGRlc2M6IGBBZGQgYSBmaWxldHlwZSBwaWNrZXIgdGhhdCBpbnNlcnRzIEBmaWxldHlwZSBmaWx0ZXJzIGludG8gc2VhcmNoIHRleHRgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclNlYXJjaCc7XG4gICAgcHJpdmF0ZSBfcXVlcnlUYXI6IHN0cmluZyA9ICcjdG9yVGl0bGUnO1xuICAgIHByaXZhdGUgX3BhbmVsVGFyOiBzdHJpbmcgPSAnI21wX2ZpbGV0eXBlU2VhcmNoUGFuZWwnO1xuICAgIHByaXZhdGUgX3RvZ2dsZVRhcjogc3RyaW5nID0gJyNtcF9maWxldHlwZVNlYXJjaFRvZ2dsZSc7XG4gICAgcHJpdmF0ZSBfZGVmYXVsdEZpbGV0eXBlczogc3RyaW5nW10gPSBbXG4gICAgICAgICdlcHViJyxcbiAgICAgICAgJ3BkZicsXG4gICAgICAgICdtb2JpJyxcbiAgICAgICAgJ2F6dzMnLFxuICAgICAgICAnYXp3JyxcbiAgICAgICAgJ3R4dCcsXG4gICAgICAgICdydGYnLFxuICAgICAgICAnZG9jJyxcbiAgICAgICAgJ2RvY3gnLFxuICAgICAgICAnbGl0JyxcbiAgICAgICAgJ2RqdnUnLFxuICAgICAgICAnY2J6JyxcbiAgICAgICAgJ2NicicsXG4gICAgICAgICdjYjcnLFxuICAgICAgICAnbTRiJyxcbiAgICAgICAgJ21wMycsXG4gICAgICAgICdtNGEnLFxuICAgICAgICAnZmxhYycsXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgZm9ybTogSFRNTEZvcm1FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgY29uc3QgcXVlcnlJbnB1dDogSFRNTElucHV0RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3F1ZXJ5VGFyKTtcbiAgICAgICAgY29uc3QgYW5jaG9yVGFyZ2V0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVzZXROZXdJY29uJyk7XG5cbiAgICAgICAgaWYgKGZvcm0gPT09IG51bGwgfHwgcXVlcnlJbnB1dCA9PT0gbnVsbCB8fCBhbmNob3JUYXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGluaXRpYWxpemUgZmlsZXR5cGUgc2VhcmNoIGZpbHRlcicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsRmlsZXR5cGVzOiBzdHJpbmdbXSA9IHRoaXMuX2dldEFsbEZpbGV0eXBlcyhxdWVyeUlucHV0LnZhbHVlKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRGaWxldHlwZXM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCh0aGlzLl9wYXJzZUZpbGV0eXBlcyhxdWVyeUlucHV0LnZhbHVlKSk7XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlOiBIVE1MRWxlbWVudCA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ2ZpbGV0eXBlU2VhcmNoVG9nZ2xlJyxcbiAgICAgICAgICAgICdGaWxlIFR5cGVzJyxcbiAgICAgICAgICAgICdoMScsXG4gICAgICAgICAgICBhbmNob3JUYXJnZXQsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXG4gICAgICAgICk7XG5cbiAgICAgICAgdG9nZ2xlLmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICBgXG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cIm1wX2ZpbGV0eXBlU2VhcmNoUGFuZWxcIiBjbGFzcz1cIm1wX2ZpbGV0eXBlU2VhcmNoUGFuZWxcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtcF9maWxldHlwZVNlYXJjaEFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfZmlsZXR5cGVTZWFyY2hBbGxcIiBjbGFzcz1cIm1wX3BsYWluQnRuXCIgcm9sZT1cImJ1dHRvblwiPkFsbDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfZmlsZXR5cGVTZWFyY2hOb25lXCIgY2xhc3M9XCJtcF9wbGFpbkJ0blwiIHJvbGU9XCJidXR0b25cIj5Ob25lPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1wX2ZpbGV0eXBlU2VhcmNoR3JpZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgJHthbGxGaWxldHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKCh0eXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBzZWxlY3RlZEZpbGV0eXBlcy5oYXModHlwZSkgPyAnY2hlY2tlZCcgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8bGFiZWwgY2xhc3M9XCJtcF9maWxldHlwZVNlYXJjaEl0ZW1cIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCIke3R5cGV9XCIgJHtjaGVja2VkfT4gJHt0eXBlfTwvbGFiZWw+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgXG4gICAgICAgICk7XG5cbiAgICAgICAgdG9nZ2xlLmlkID0gJ21wX2ZpbGV0eXBlU2VhcmNoVG9nZ2xlJztcbiAgICAgICAgdG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdG9nZ2xlUGFuZWwoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fYmluZFBhbmVsQWN0aW9ucyhxdWVyeUlucHV0KTtcbiAgICAgICAgdGhpcy5fc3luY1NlbGVjdGlvbnNGcm9tUXVlcnkocXVlcnlJbnB1dCk7XG5cbiAgICAgICAgcXVlcnlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zeW5jU2VsZWN0aW9uc0Zyb21RdWVyeShxdWVyeUlucHV0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHF1ZXJ5SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3N5bmNTZWxlY3Rpb25zRnJvbVF1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9hcHBseVNlbGVjdGlvblRvUXVlcnkocXVlcnlJbnB1dCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBmaWxldHlwZSBzZWFyY2ggZmlsdGVyIScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2JpbmRQYW5lbEFjdGlvbnMocXVlcnlJbnB1dDogSFRNTElucHV0RWxlbWVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBwYW5lbDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl9wYW5lbFRhcik7XG4gICAgICAgIGNvbnN0IHNlbGVjdEFsbDogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9maWxldHlwZVNlYXJjaEFsbCcpO1xuICAgICAgICBjb25zdCBzZWxlY3ROb25lOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2ZpbGV0eXBlU2VhcmNoTm9uZScpO1xuXG4gICAgICAgIGlmIChwYW5lbCA9PT0gbnVsbCB8fCBzZWxlY3RBbGwgPT09IG51bGwgfHwgc2VsZWN0Tm9uZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgYmluZCBmaWxldHlwZSBzZWFyY2ggY29udHJvbHMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmZvckVhY2goKGNoZWNrYm94KSA9PiB7XG4gICAgICAgICAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3Rpb25Ub1F1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGVjdEFsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTElucHV0RWxlbWVudD4oJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmZvckVhY2goKGJveCkgPT4ge1xuICAgICAgICAgICAgICAgIGJveC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3Rpb25Ub1F1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxlY3ROb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoYm94KSA9PiB7XG4gICAgICAgICAgICAgICAgYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3Rpb25Ub1F1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF90b2dnbGVQYW5lbCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcGFuZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fcGFuZWxUYXIpO1xuICAgICAgICBjb25zdCB0b2dnbGU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdG9nZ2xlVGFyKTtcblxuICAgICAgICBpZiAocGFuZWwgPT09IG51bGwgfHwgdG9nZ2xlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc09wZW4gPSBwYW5lbC5zdHlsZS5kaXNwbGF5ID09PSAnYmxvY2snO1xuICAgICAgICBwYW5lbC5zdHlsZS5kaXNwbGF5ID0gaXNPcGVuID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGlzT3BlbiA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3N5bmNTZWxlY3Rpb25zRnJvbVF1ZXJ5KHF1ZXJ5SW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRGaWxldHlwZXMgPSBuZXcgU2V0KHRoaXMuX3BhcnNlRmlsZXR5cGVzKHF1ZXJ5SW5wdXQudmFsdWUpKTtcbiAgICAgICAgY29uc3QgcGFuZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fcGFuZWxUYXIpO1xuXG4gICAgICAgIGlmIChwYW5lbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoY2hlY2tib3gpID0+IHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSBzZWxlY3RlZEZpbGV0eXBlcy5oYXMoY2hlY2tib3gudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hcHBseVNlbGVjdGlvblRvUXVlcnkocXVlcnlJbnB1dDogSFRNTElucHV0RWxlbWVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBwYW5lbDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl9wYW5lbFRhcik7XG5cbiAgICAgICAgaWYgKHBhbmVsID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWxlY3RlZEZpbGV0eXBlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoY2hlY2tib3gpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGVja2JveC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxldHlwZXMucHVzaChjaGVja2JveC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGJhc2VRdWVyeSA9IHRoaXMuX3N0cmlwRmlsZXR5cGVUb2tlbihxdWVyeUlucHV0LnZhbHVlKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkRmlsZXR5cGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcXVlcnlJbnB1dC52YWx1ZSA9IGJhc2VRdWVyeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlclRva2VuID0gYEBmaWxldHlwZXske3NlbGVjdGVkRmlsZXR5cGVzLmpvaW4oJ3wnKX19YDtcbiAgICAgICAgICAgIHF1ZXJ5SW5wdXQudmFsdWUgPSBiYXNlUXVlcnkgPT09ICcnID8gZmlsdGVyVG9rZW4gOiBgJHtiYXNlUXVlcnl9ICR7ZmlsdGVyVG9rZW59YDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEFsbEZpbGV0eXBlcyhxdWVyeVRleHQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3Qgc2VlbjogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgICAgY29uc3QgbWVyZ2VkOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCByZXN1bHRGaWxldHlwZXMgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MQW5jaG9yRWxlbWVudD4oJy50b3JGaWxlVHlwZXMgYScpXG4gICAgICAgICkubWFwKCh0eXBlKSA9PiB0eXBlLnRleHRDb250ZW50IS50cmltKCkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5RmlsZXR5cGVzID0gdGhpcy5fcGFyc2VGaWxldHlwZXMocXVlcnlUZXh0KTtcblxuICAgICAgICBbLi4udGhpcy5fZGVmYXVsdEZpbGV0eXBlcywgLi4ucmVzdWx0RmlsZXR5cGVzLCAuLi5xdWVyeUZpbGV0eXBlc10uZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGUgIT09ICcnICYmIHNlZW5bdHlwZV0gIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBzZWVuW3R5cGVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBtZXJnZWQucHVzaCh0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1lcmdlZC5zb3J0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VGaWxldHlwZXMocXVlcnlUZXh0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gcXVlcnlUZXh0Lm1hdGNoKC9AZmlsZXR5cGVcXHsoW159XSopXFx9L2kpO1xuICAgICAgICBpZiAobWF0Y2ggPT09IG51bGwgfHwgbWF0Y2hbMV0udHJpbSgpID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoWzFdXG4gICAgICAgICAgICAuc3BsaXQoJ3wnKVxuICAgICAgICAgICAgLm1hcCgodHlwZSkgPT4gdHlwZS50cmltKCkudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKHR5cGUpID0+IHR5cGUgIT09ICcnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zdHJpcEZpbGV0eXBlVG9rZW4ocXVlcnlUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcXVlcnlUZXh0XG4gICAgICAgICAgICAucmVwbGFjZSgvXFxzKkBmaWxldHlwZVxce1tefV0qXFx9XFxzKi9naSwgJyAnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgJyAnKVxuICAgICAgICAgICAgLnRyaW0oKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEdlbmVyYXRlcyBsaW5rZWQgdGFncyBmcm9tIHRoZSBzaXRlJ3MgcGxhaW50ZXh0IHRhZyBmaWVsZFxuICovXG5jbGFzcyBCdWlsZFRhZ3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdidWlsZFRhZ3MnLFxuICAgICAgICBkZXNjOiBgR2VuZXJhdGUgY2xpY2thYmxlIFRhZ3MgYXV0b21hdGljYWxseWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBsZXQgcmVzdWx0c0xpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3NcbiAgICAgICAgcmVzdWx0c0xpc3RcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzTGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0xpc3QudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3MgYWdhaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocikgPT4gdGhpcy5fcHJvY2Vzc1RhZ1N0cmluZyhyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBDb2RlIHRvIHJ1biBmb3IgZXZlcnkgc2VhcmNoIHJlc3VsdFxuICAgICAqIEBwYXJhbSByZXMgQSBzZWFyY2ggcmVzdWx0IHJvd1xuICAgICAqL1xuICAgIHByaXZhdGUgX3Byb2Nlc3NUYWdTdHJpbmcgPSAocmVzOiBIVE1MVGFibGVSb3dFbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRhZ2xpbmUgPSA8SFRNTFNwYW5FbGVtZW50PnJlcy5xdWVyeVNlbGVjdG9yKCcudG9yUm93RGVzYycpO1xuXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cCh0YWdsaW5lKTtcblxuICAgICAgICAvLyBBc3N1bWUgYnJhY2tldHMgY29udGFpbiB0YWdzXG4gICAgICAgIGxldCB0YWdTdHJpbmcgPSB0YWdsaW5lLmlubmVySFRNTC5yZXBsYWNlKC8oPzpcXFt8XFxdfFxcKHxcXCl8JCkvZ2ksICcsJyk7XG4gICAgICAgIC8vIFJlbW92ZSBIVE1MIEVudGl0aWVzIGFuZCB0dXJuIHRoZW0gaW50byBicmVha3NcbiAgICAgICAgdGFnU3RyaW5nID0gdGFnU3RyaW5nLnNwbGl0KC8oPzomLnsxLDV9OykvZykuam9pbignOycpO1xuICAgICAgICAvLyBTcGxpdCB0YWdzIGF0ICcsJyBhbmQgJzsnIGFuZCAnPicgYW5kICd8J1xuICAgICAgICBsZXQgdGFncyA9IHRhZ1N0cmluZy5zcGxpdCgvXFxzKig/Ojt8LHw+fFxcfHwkKVxccyovKTtcbiAgICAgICAgLy8gUmVtb3ZlIGVtcHR5IG9yIGxvbmcgdGFnc1xuICAgICAgICB0YWdzID0gdGFncy5maWx0ZXIoKHRhZykgPT4gdGFnLmxlbmd0aCA8PSAzMCAmJiB0YWcubGVuZ3RoID4gMCk7XG4gICAgICAgIC8vIEFyZSB0YWdzIGFscmVhZHkgYWRkZWQ/IE9ubHkgYWRkIGlmIG51bGxcbiAgICAgICAgY29uc3QgdGFnQm94OiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVzLnF1ZXJ5U2VsZWN0b3IoJy5tcF90YWdzJyk7XG4gICAgICAgIGlmICh0YWdCb3ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX2luamVjdExpbmtzKHRhZ3MsIHRhZ2xpbmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdzKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAqIEluamVjdHMgdGhlIGdlbmVyYXRlZCB0YWdzXG4gICAgICogQHBhcmFtIHRhZ3MgQXJyYXkgb2YgdGFncyB0byBhZGRcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzZWFyY2ggcmVzdWx0IHJvdyB0aGF0IHRoZSB0YWdzIHdpbGwgYmUgYWRkZWQgdG9cbiAgICAgKi9cbiAgICBwcml2YXRlIF9pbmplY3RMaW5rcyA9ICh0YWdzOiBzdHJpbmdbXSwgdGFyOiBIVE1MU3BhbkVsZW1lbnQpID0+IHtcbiAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBuZXcgdGFnIHJvd1xuICAgICAgICAgICAgY29uc3QgdGFnUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgdGFnUm93LmNsYXNzTGlzdC5hZGQoJ21wX3RhZ3MnKTtcbiAgICAgICAgICAgIHRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgdGFnUm93KTtcbiAgICAgICAgICAgIHRhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgLy8gQWRkIHRoZSB0YWdzIHRvIHRoZSB0YWcgcm93XG4gICAgICAgICAgICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xuICAgICAgICAgICAgICAgIHRhZ1Jvdy5pbm5lckhUTUwgKz0gYDxhIGNsYXNzPSdtcF90YWcnIGhyZWY9Jy90b3IvYnJvd3NlLnBocD90b3IlNUJ0ZXh0JTVEPSUyMiR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICAgICApfSUyMiZ0b3IlNUJzcmNoSW4lNUQlNUJ0YWdzJTVEPXRydWUnPiR7dGFnfTwvYT5gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWRkcyBtdWx0aS1zZWxlY3QgY2hlY2tib3hlcyBhbmQgYnVsayBhY3Rpb25zIHRvIGJyb3dzZSByZXN1bHRzXG4gKi9cbmNsYXNzIE11bHRpU2VsZWN0QnJvd3NlIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnbXVsdGlTZWxlY3RCcm93c2UnLFxuICAgICAgICBkZXNjOiBgQWRkIGNoZWNrYm94ZXMgYW5kIGJ1bGsgYWN0aW9ucyB0byBzZWFyY2ggcmVzdWx0c2AsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuICAgIHByaXZhdGUgX3Rvb2xiYXJJRDogc3RyaW5nID0gJ21wX211bHRpU2VsZWN0VG9vbGJhcic7XG4gICAgcHJpdmF0ZSBfY2hlY2tib3hDbGFzczogc3RyaW5nID0gJ21wX211bHRpU2VsZWN0Qm94JztcbiAgICBwcml2YXRlIF9yb3dGbGFnOiBzdHJpbmcgPSAnbXBNdWx0aVNlbGVjdFJlYWR5JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5fZW5zdXJlVG9vbGJhcigpO1xuICAgICAgICB0aGlzLl9kZWNvcmF0ZVJlc3VsdHMoYXdhaXQgdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKTtcblxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9lbnN1cmVUb29sYmFyKCk7XG4gICAgICAgICAgICB0aGlzLl9kZWNvcmF0ZVJlc3VsdHMoYXdhaXQgdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcihcbiAgICAgICAgICAgICdib2R5JyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbnN1cmVUb29sYmFyKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIG11bHRpLXNlbGVjdCBicm93c2UgYWN0aW9ucyEnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9lbnN1cmVUb29sYmFyKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBleGlzdGluZ1Rvb2xiYXI6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuX3Rvb2xiYXJJRCk7XG4gICAgICAgIGNvbnN0IG1hc3NBY3Rpb25zOiBIVE1MRWxlbWVudCB8IG51bGwgPSB0aGlzLl9maW5kTWFzc0FjdGlvbnNBbmNob3IoKTtcbiAgICAgICAgaWYgKGV4aXN0aW5nVG9vbGJhciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIG1hc3NBY3Rpb25zICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgZXhpc3RpbmdUb29sYmFyLnBhcmVudEVsZW1lbnQgIT09IG1hc3NBY3Rpb25zXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBleGlzdGluZ1Rvb2xiYXIuY2xhc3NOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgJ21wX211bHRpU2VsZWN0VG9vbGJhciBtcF9tdWx0aVNlbGVjdFRvb2xiYXJfbWFzc0FjdGlvbnMnO1xuICAgICAgICAgICAgICAgIG1hc3NBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ21wX211bHRpU2VsZWN0SG9zdCcpO1xuICAgICAgICAgICAgICAgIG1hc3NBY3Rpb25zLmFwcGVuZENoaWxkKGV4aXN0aW5nVG9vbGJhcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b29sYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2xiYXIuaWQgPSB0aGlzLl90b29sYmFySUQ7XG4gICAgICAgIHRvb2xiYXIuY2xhc3NOYW1lID0gbWFzc0FjdGlvbnNcbiAgICAgICAgICAgID8gJ21wX211bHRpU2VsZWN0VG9vbGJhciBtcF9tdWx0aVNlbGVjdFRvb2xiYXJfbWFzc0FjdGlvbnMnXG4gICAgICAgICAgICA6ICdtcF9tdWx0aVNlbGVjdFRvb2xiYXInO1xuICAgICAgICB0b29sYmFyLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfbXVsdGlTZWxlY3RBbGxcIiBjbGFzcz1cIm1wX3BsYWluQnRuXCIgcm9sZT1cImJ1dHRvblwiPlNlbGVjdCBBbGw8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBpZD1cIm1wX211bHRpU2VsZWN0Tm9uZVwiIGNsYXNzPVwibXBfcGxhaW5CdG5cIiByb2xlPVwiYnV0dG9uXCI+U2VsZWN0IE5vbmU8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBpZD1cIm1wX211bHRpU2VsZWN0T3BlblwiIGNsYXNzPVwibXBfcGxhaW5CdG5cIiByb2xlPVwiYnV0dG9uXCI+T3BlbiBTZWxlY3RlZDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfbXVsdGlTZWxlY3REb3dubG9hZFwiIGNsYXNzPVwibXBfcGxhaW5CdG5cIiByb2xlPVwiYnV0dG9uXCI+RG93bmxvYWQgU2VsZWN0ZWQ8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBpZD1cIm1wX211bHRpU2VsZWN0Qm9va21hcmtcIiBjbGFzcz1cIm1wX3BsYWluQnRuXCIgcm9sZT1cImJ1dHRvblwiPkJvb2ttYXJrIFNlbGVjdGVkPC9zcGFuPlxuICAgICAgICBgO1xuXG4gICAgICAgIGlmIChtYXNzQWN0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbWFzc0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnbXBfbXVsdGlTZWxlY3RIb3N0Jyk7XG4gICAgICAgICAgICBtYXNzQWN0aW9ucy5hcHBlbmRDaGlsZCh0b29sYmFyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvclRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVzZXROZXdJY29uJykgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NzcicpO1xuICAgICAgICAgICAgaWYgKGFuY2hvclRhcmdldCA9PT0gbnVsbCB8fCBhbmNob3JUYXJnZXQucGFyZW50RWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGNyZWF0ZSBtdWx0aS1zZWxlY3QgYnJvd3NlIHRvb2xiYXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFuY2hvclRhcmdldC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgdG9vbGJhcik7XG4gICAgICAgIH1cblxuICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9tdWx0aVNlbGVjdEFsbCcpKS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDaGVja2VkU3RhdGUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX211bHRpU2VsZWN0Tm9uZScpKS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDaGVja2VkU3RhdGUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9tdWx0aVNlbGVjdE9wZW4nKSkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX211bHRpU2VsZWN0RG93bmxvYWQnKSkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZG93bmxvYWRTZWxlY3RlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9tdWx0aVNlbGVjdEJvb2ttYXJrJykpLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Jvb2ttYXJrU2VsZWN0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kZWNvcmF0ZVJlc3VsdHMocmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pik6IHZvaWQge1xuICAgICAgICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhc2V0W3RoaXMuX3Jvd0ZsYWddID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGZpcnN0Q2VsbDogSFRNTFRhYmxlQ2VsbEVsZW1lbnQgfCBudWxsID0gcmVzdWx0LnF1ZXJ5U2VsZWN0b3IoJ3RkJyk7XG4gICAgICAgICAgICBpZiAoZmlyc3RDZWxsID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBib3hXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgYm94V3JhcC5jbGFzc05hbWUgPSAnbXBfbXVsdGlTZWxlY3RXcmFwJztcbiAgICAgICAgICAgIGJveFdyYXAuaW5uZXJIVE1MID0gYDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cIiR7dGhpcy5fY2hlY2tib3hDbGFzc31cIiBhcmlhLWxhYmVsPVwiU2VsZWN0IHNlYXJjaCByZXN1bHRcIj5gO1xuICAgICAgICAgICAgZmlyc3RDZWxsLmluc2VydEJlZm9yZShib3hXcmFwLCBmaXJzdENlbGwuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICByZXN1bHQuZGF0YXNldFt0aGlzLl9yb3dGbGFnXSA9ICd0cnVlJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWRSZXN1bHRzKCk6IEhUTUxUYWJsZVJvd0VsZW1lbnRbXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0nKSkuZmlsdGVyKFxuICAgICAgICAgICAgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJveCA9IHJvdy5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLl9jaGVja2JveENsYXNzfWApIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBib3ggIT09IG51bGwgJiYgYm94LmNoZWNrZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICkgYXMgSFRNTFRhYmxlUm93RWxlbWVudFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldENoZWNrZWRTdGF0ZShjaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChgI3NzciAuJHt0aGlzLl9jaGVja2JveENsYXNzfWApXG4gICAgICAgICAgICAuZm9yRWFjaCgoYm94KSA9PiAoKDxIVE1MSW5wdXRFbGVtZW50PmJveCkuY2hlY2tlZCA9IGNoZWNrZWQpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vcGVuU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkUmVzdWx0cygpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93SUQgPSByb3cuaWQubWF0Y2goL150ZHItPyhcXGQrKSQvKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFVSTCA9XG4gICAgICAgICAgICAgICAgcm93SUQgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgPyBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS90LyR7cm93SURbMV19YFxuICAgICAgICAgICAgICAgICAgICA6IChyb3cucXVlcnlTZWxlY3RvcignLnRvclRpdGxlJykgYXMgSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsKT8uaHJlZjtcblxuICAgICAgICAgICAgaWYgKHRhcmdldFVSTCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKHRhcmdldFVSTCwgJ19ibGFuaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kb3dubG9hZFNlbGVjdGVkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZFJlc3VsdHMoKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkTGluayA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlyZWN0RG93bmxvYWQnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgICBpZiAoZG93bmxvYWRMaW5rICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZG93bmxvYWRMaW5rLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2Jvb2ttYXJrU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkUmVzdWx0cygpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm9va21hcmtMaW5rID0gcm93LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgJ2FbaWRePVwidG9yQm9va21hcmtcIl0nXG4gICAgICAgICAgICApIGFzIEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgIGlmIChib29rbWFya0xpbmsgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBib29rbWFya0xpbmsuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9maW5kTWFzc0FjdGlvbnNBbmNob3IoKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgY29uc3QgbWFzc0FjdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFzc0FjdGlvbnMnKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgICAgIGlmIChtYXNzQWN0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hc3NBY3Rpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm9va21hcmtBY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Jvb2ttYXJrQWN0aW9ucycpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgaWYgKGJvb2ttYXJrQWN0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGJvb2ttYXJrQWN0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1hc3NBY3Rpb25CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJ2J1dHRvbltkYXRhLWJtVHlwZV0nXG4gICAgICAgICkgYXMgSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsO1xuICAgICAgICBpZiAobWFzc0FjdGlvbkJ1dHRvbiAhPT0gbnVsbCAmJiBtYXNzQWN0aW9uQnV0dG9uLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXNzQWN0aW9uQnV0dG9uLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtYXNzQWN0aW9uc0xhYmVsID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdoMSwgaDIsIGgzLCBoNCwgc3Ryb25nJykpLmZpbmQoXG4gICAgICAgICAgICAoZWxlbSkgPT4gZWxlbS50ZXh0Q29udGVudD8udHJpbSgpLnRvTG93ZXJDYXNlKCkgPT09ICdtYXNzIGFjdGlvbnMnXG4gICAgICAgICkgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChtYXNzQWN0aW9uc0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFzc0FjdGlvbnNMYWJlbC5wYXJlbnRFbGVtZW50IGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSYW5kb20gQm9vayBmZWF0dXJlIHRvIG9wZW4gYSBuZXcgdGFiL3dpbmRvdyB3aXRoIGEgcmFuZG9tIE1BTSBCb29rXG4gKi9cbmNsYXNzIFJhbmRvbUJvb2sgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdyYW5kb21Cb29rJyxcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBvcGVuIGEgcmFuZG9tbHkgc2VsZWN0ZWQgYm9vayBwYWdlLiAoPGVtPlVzZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjYXRlZ29yeSBpbiB0aGUgZHJvcGRvd248L2VtPilgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxldCByYW5kbzogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGNvbnN0IHJhbmRvVGV4dDogc3RyaW5nID0gJ1JhbmRvbSBCb29rJztcblxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIChyYW5kbyA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdyYW5kb21Cb29rJyxcbiAgICAgICAgICAgICAgICByYW5kb1RleHQsXG4gICAgICAgICAgICAgICAgJ2gxJyxcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcbiAgICAgICAgICAgICkpLFxuICAgICAgICBdKTtcblxuICAgICAgICByYW5kb1xuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY291bnRSZXN1bHQ6IFByb21pc2U8bnVtYmVyPjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXRlZ29yaWVzOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBDYXRlZ29yeSBkcm9wZG93biBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRTZWxlY3Rpb246IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0ZWdvcnlQYXJ0aWFsJylcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgdmFsdWUgY3VycmVudGx5IHNlbGVjdGVkIGluIENhdGVnb3J5IERyb3Bkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRWYWx1ZTogc3RyaW5nID0gY2F0U2VsZWN0aW9uIS5vcHRpb25zW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdFNlbGVjdGlvbi5zZWxlY3RlZEluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICBdLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZXBlbmRpbmcgb24gY2F0ZWdvcnkgc2VsZWN0ZWQsIGNyZWF0ZSBhIGNhdGVnb3J5IHN0cmluZyBmb3IgdGhlIEpTT04gR0VUXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKFN0cmluZyhjYXRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBTEwnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RlZmF1bHRzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTMnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTYnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0VmFsdWUuY2hhckF0KDApID09PSAnYycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvcltjYXRdW109JyArIGNhdFZhbHVlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb3VudFJlc3VsdCA9IHRoaXMuX2dldFJhbmRvbUJvb2tSZXN1bHRzKGNhdGVnb3JpZXMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRSZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoZ2V0UmFuZG9tUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vb3BlbiBuZXcgdGFiIHdpdGggdGhlIHJhbmRvbSBib29rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvdC8nICsgZ2V0UmFuZG9tUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ19ibGFuaydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIFJhbmRvbSBCb29rIGJ1dHRvbiEnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xuICAgICAqIEBwYXJhbSBjYXQgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgY2F0ZWdvcmllcyBuZWVkZWQgZm9yIEpTT04gR2V0XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBfZ2V0UmFuZG9tQm9va1Jlc3VsdHMoY2F0OiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGpzb25SZXN1bHQ6IFByb21pc2U8c3RyaW5nPjtcbiAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3Rvci9qcy9sb2FkU2VhcmNoSlNPTmJhc2ljLnBocD90b3Jbc2VhcmNoVHlwZV09YWxsJnRvcltzZWFyY2hJbl09dG9ycmVudHMke2NhdH0mdG9yW3BlcnBhZ2VdPTUmdG9yW2Jyb3dzZUZsYWdzSGlkZVZzU2hvd109MCZ0b3Jbc3RhcnREYXRlXT0mdG9yW2VuZERhdGVdPSZ0b3JbaGFzaF09JnRvcltzb3J0VHlwZV09cmFuZG9tJnRodW1ibmFpbD10cnVlPyR7VXRpbC5yYW5kb21OdW1iZXIoXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAxMDAwMDBcbiAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFsoanNvblJlc3VsdCA9IFV0aWwuZ2V0SlNPTih1cmwpKV0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpzb25SZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGpzb25GdWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JldHVybiB0aGUgZmlyc3QgdG9ycmVudCBJRCBvZiB0aGUgcmFuZG9tIEpTT04gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKGpzb25GdWxsKS5kYXRhWzBdLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogRlJFRUxFRUNIIEZFQVRVUkVTXG4gKi9cblxuY2xhc3MgQ29sbGFwc2VGcmVlbGVlY2hTZWN0aW9ucyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnY29sbGFwc2VGcmVlbGVlY2hTZWN0aW9ucycsXG4gICAgICAgIGRlc2M6ICdDb2xsYXBzZSBGcmVlbGVlY2ggY2F0ZWdvcnkgc2VjdGlvbnMgYW5kIGFkZCBxdWljay1qdW1wIGxpbmtzJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSBkaXZbaWRePVwiZmxfY2F0X1wiXSc7XG4gICAgcHJpdmF0ZSBfc2VjdGlvbkNvbnRlbnRzOiB7IFtrZXk6IHN0cmluZ106IEhUTUxFbGVtZW50W10gfSA9IHt9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnZnJlZWxlZWNoJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IEFycmF5LmZyb20oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX3RhcilcbiAgICAgICAgKSBhcyBIVE1MRGl2RWxlbWVudFtdO1xuXG4gICAgICAgIGlmIChzZWN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW00rXSBDb3VsZCBub3QgZmluZCBmcmVlbGVlY2ggc2VjdGlvbnMgdG8gY29sbGFwc2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaXN0QmxvY2sgPSBzZWN0aW9uc1swXS5jbG9zZXN0KCcuYmxvY2tDb24nKTtcbiAgICAgICAgaWYgKGxpc3RCbG9jayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fbm9ybWFsaXplTGF5b3V0KGxpc3RCbG9jayk7XG4gICAgICAgICAgICB0aGlzLl9idWlsZFRvb2xiYXIobGlzdEJsb2NrLCBzZWN0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKChzZWN0aW9uKSA9PiB0aGlzLl9jb2xsYXBzZVNlY3Rpb24oc2VjdGlvbikpO1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb2xsYXBzZWQgZnJlZWxlZWNoIHNlY3Rpb25zIScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX25vcm1hbGl6ZUxheW91dChsaXN0QmxvY2s6IEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgYmxvY2tCb2R5ID0gbGlzdEJsb2NrLnF1ZXJ5U2VsZWN0b3IoJy5ibG9ja0JvZHlDb24nKSBhcyBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG4gICAgICAgIGNvbnN0IG1haW5Cb2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5JykgYXMgSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuXG4gICAgICAgIGlmIChtYWluQm9keSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbWFpbkJvZHkuc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJsb2NrQm9keSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgYmxvY2tCb2R5LnN0eWxlLnRleHRBbGlnbiA9ICdsZWZ0JztcbiAgICAgICAgICAgIGJsb2NrQm9keS5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgICAgICAgIGJsb2NrQm9keS5zdHlsZS5tYXhXaWR0aCA9ICcxMDAlJztcbiAgICAgICAgICAgIGJsb2NrQm9keS5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG4gICAgICAgIH1cblxuICAgICAgICAobGlzdEJsb2NrIGFzIEhUTUxEaXZFbGVtZW50KS5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgICAgKGxpc3RCbG9jayBhcyBIVE1MRGl2RWxlbWVudCkuc3R5bGUubWF4V2lkdGggPSAnOTglJztcbiAgICAgICAgKGxpc3RCbG9jayBhcyBIVE1MRGl2RWxlbWVudCkuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2J1aWxkVG9vbGJhcihsaXN0QmxvY2s6IEVsZW1lbnQsIHNlY3Rpb25zOiBIVE1MRGl2RWxlbWVudFtdKSB7XG4gICAgICAgIGNvbnN0IHRvb2xiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbGJhci5jbGFzc05hbWUgPSAnbXBfZmxfdG9vbGJhcic7XG4gICAgICAgIHRvb2xiYXIuc3R5bGUubWFyZ2luQm90dG9tID0gJzE1cHgnO1xuXG4gICAgICAgIGNvbnN0IHRvZ2dsZUFsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b2dnbGVBbGwuY2xhc3NOYW1lID0gJ21wX3BsYWluQnRuIG1wX2ZsX3RvZ2dsZV9hbGwnO1xuICAgICAgICB0b2dnbGVBbGwucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0b2dnbGVBbGwudGV4dENvbnRlbnQgPSAnRXhwYW5kIEFsbCc7XG5cbiAgICAgICAgY29uc3QgdG9jID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvYy5jbGFzc05hbWUgPSAnbXBfZmxfdG9jJztcbiAgICAgICAgdG9jLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgICAgIHRvYy5zdHlsZS5mbGV4V3JhcCA9ICd3cmFwJztcbiAgICAgICAgdG9jLnN0eWxlLmdhcCA9ICc2cHgnO1xuICAgICAgICB0b2Muc3R5bGUubWFyZ2luVG9wID0gJzhweCc7XG5cbiAgICAgICAgc2VjdGlvbnMuZm9yRWFjaCgoc2VjdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gc2VjdGlvbi5xdWVyeVNlbGVjdG9yKCdhLmJpZ2xpbmsnKTtcbiAgICAgICAgICAgIGlmIChoZWFkZXIgPT09IG51bGwgfHwgaGVhZGVyLnRleHRDb250ZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgaXRlbS5jbGFzc05hbWUgPSAnbXBfcGxhaW5CdG4gbXBfZmxfdG9jX2l0ZW0nO1xuICAgICAgICAgICAgaXRlbS5ocmVmID0gYCMke3NlY3Rpb24uaWR9YDtcbiAgICAgICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBoZWFkZXIudGV4dENvbnRlbnQudHJpbSgpO1xuICAgICAgICAgICAgaXRlbS5zdHlsZS5tYXJnaW5SaWdodCA9ICc2cHgnO1xuICAgICAgICAgICAgaXRlbS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnNnB4JztcbiAgICAgICAgICAgIGl0ZW0uc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICAgICAgdG9jLmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b2dnbGVBbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaG91bGRPcGVuID0gdG9nZ2xlQWxsLnRleHRDb250ZW50ID09PSAnRXhwYW5kIEFsbCc7XG4gICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKChzZWN0aW9uKSA9PiB0aGlzLl9zZXRPcGVuU3RhdGUoc2VjdGlvbiwgc2hvdWxkT3BlbikpO1xuICAgICAgICAgICAgdG9nZ2xlQWxsLnRleHRDb250ZW50ID0gc2hvdWxkT3BlbiA/ICdDb2xsYXBzZSBBbGwnIDogJ0V4cGFuZCBBbGwnO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b29sYmFyLmFwcGVuZENoaWxkKHRvZ2dsZUFsbCk7XG4gICAgICAgIHRvb2xiYXIuYXBwZW5kQ2hpbGQodG9jKTtcbiAgICAgICAgbGlzdEJsb2NrLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCB0b29sYmFyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jb2xsYXBzZVNlY3Rpb24oc2VjdGlvbjogSFRNTERpdkVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gc2VjdGlvbi5xdWVyeVNlbGVjdG9yKCdhLmJpZ2xpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGw7XG5cbiAgICAgICAgaWYgKGhlYWRlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdtcF9mbF9zZWN0aW9uJyk7XG4gICAgICAgIHNlY3Rpb24uc3R5bGUuc2Nyb2xsTWFyZ2luVG9wID0gJzgwcHgnO1xuICAgICAgICBzZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBzZWN0aW9uLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICBzZWN0aW9uLnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gQXJyYXkuZnJvbShzZWN0aW9uLmNoaWxkcmVuKS5maWx0ZXIoXG4gICAgICAgICAgICAoY2hpbGQpID0+IGNoaWxkICE9PSBoZWFkZXJcbiAgICAgICAgKSBhcyBIVE1MRWxlbWVudFtdO1xuXG4gICAgICAgIHRoaXMuX3NlY3Rpb25Db250ZW50c1tzZWN0aW9uLmlkXSA9IGNvbnRlbnQ7XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvZ2dsZS5jbGFzc05hbWUgPSAnbXBfcGxhaW5CdG4gbXBfZmxfdG9nZ2xlJztcbiAgICAgICAgdG9nZ2xlLnJvbGUgPSAnYnV0dG9uJztcbiAgICAgICAgdG9nZ2xlLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgdG9nZ2xlLnN0eWxlLm1hcmdpbkxlZnQgPSAnOHB4JztcblxuICAgICAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoc2VjdGlvbiwgIXNlY3Rpb24uY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9mbF9vcGVuJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICBoZWFkZXIuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHRvZ2dsZSk7XG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZShzZWN0aW9uLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHNlY3Rpb246IEhUTUxEaXZFbGVtZW50LCBvcGVuOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHRvZ2dsZSA9IHNlY3Rpb24ucXVlcnlTZWxlY3RvcignLm1wX2ZsX3RvZ2dsZScpIGFzIEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMuX3NlY3Rpb25Db250ZW50c1tzZWN0aW9uLmlkXTtcblxuICAgICAgICBpZiAodG9nZ2xlID09PSBudWxsIHx8IGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgICAgIHNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnbXBfZmxfb3BlbicpO1xuICAgICAgICAgICAgY29udGVudC5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdIaWRlJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlY3Rpb24uY2xhc3NMaXN0LnJlbW92ZSgnbXBfZmxfb3BlbicpO1xuICAgICAgICAgICAgY29udGVudC5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0b2dnbGUudGV4dENvbnRlbnQgPSAnU2hvdyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxuXG4vKipcbiAqICogQWxsb3dzIGdpZnRpbmcgb2YgRkwgd2VkZ2UgdG8gbWVtYmVycyB0aHJvdWdoIGZvcnVtLlxuICovXG5jbGFzcyBGb3J1bUZMR2lmdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuRm9ydW0sXG4gICAgICAgIHRpdGxlOiAnZm9ydW1GTEdpZnQnLFxuICAgICAgICBkZXNjOiBgQWRkIGEgVGhhbmsgYnV0dG9uIHRvIGZvcnVtIHBvc3RzLiAoPGVtPlNlbmRzIGEgRkwgd2VkZ2U8L2VtPilgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLmZvcnVtTGluayc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydmb3J1bSB0aHJlYWQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGluZyBGb3J1bSBHaWZ0IEJ1dHRvbi4uLicpO1xuICAgICAgICAvL21haW5Cb2R5IGlzIGJlc3QgZWxlbWVudCB3aXRoIGFuIElEIEkgY291bGQgZmluZCB0aGF0IGlzIGEgcGFyZW50IHRvIGFsbCBmb3J1bSBwb3N0c1xuICAgICAgICBjb25zdCBtYWluQm9keSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHknKTtcbiAgICAgICAgLy9tYWtlIGFycmF5IG9mIGZvcnVtIHBvc3RzIC0gdGhlcmUgaXMgb25seSBvbmUgY3Vyc29yIGNsYXNzZWQgb2JqZWN0IHBlciBmb3J1bSBwb3N0LCBzbyB0aGlzIHdhcyBiZXN0IHRvIGtleSBvZmYgb2YuIHdpc2ggdGhlcmUgd2VyZSBtb3JlIElEcyBhbmQgc3VjaCB1c2VkIGluIGZvcnVtc1xuICAgICAgICBjb25zdCBmb3J1bVBvc3RzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXG4gICAgICAgICAgICBtYWluQm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2x0YWJsZScpXG4gICAgICAgICk7XG4gICAgICAgIC8vZm9yIGVhY2ggcG9zdCBvbiB0aGUgcGFnZVxuICAgICAgICBmb3J1bVBvc3RzLmZvckVhY2goKGZvcnVtUG9zdCkgPT4ge1xuICAgICAgICAgICAgLy93b3JrIG91ciB3YXkgZG93biB0aGUgc3RydWN0dXJlIG9mIHRoZSBIVE1MIHRvIGdldCB0byBvdXIgcG9zdFxuICAgICAgICAgICAgbGV0IGJvdHRvbVJvdyA9IGZvcnVtUG9zdC5jaGlsZE5vZGVzWzFdO1xuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbNF07XG4gICAgICAgICAgICBib3R0b21Sb3cgPSBib3R0b21Sb3cuY2hpbGROb2Rlc1szXTtcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBJRCBvZiB0aGUgZm9ydW0gZnJvbSB0aGUgY3VzdG9tIE1BTSBhdHRyaWJ1dGVcbiAgICAgICAgICAgIGxldCBwb3N0SUQgPSAoPEhUTUxFbGVtZW50PmZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgICAgICAgIC8vbWFtIGRlY2lkZWQgdG8gaGF2ZSBhIGRpZmZlcmVudCBzdHJ1Y3R1cmUgZm9yIGxhc3QgZm9ydW0uIHdpc2ggdGhleSBqdXN0IGhhZCBJRHMgb3Igc29tZXRoaW5nIGluc3RlYWQgb2YgYWxsIHRoaXMganVtcGluZyBhcm91bmRcbiAgICAgICAgICAgIGlmIChwb3N0SUQgPT09ICdsYXN0Jykge1xuICAgICAgICAgICAgICAgIHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICBmb3J1bVBvc3QucHJldmlvdXNTaWJsaW5nIS5wcmV2aW91c1NpYmxpbmchXG4gICAgICAgICAgICAgICAgKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBlbGVtZW50IGZvciBvdXIgZmVhdHVyZVxuICAgICAgICAgICAgY29uc3QgZ2lmdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAvL3NldCBzYW1lIGNsYXNzIGFzIG90aGVyIG9iamVjdHMgaW4gYXJlYSBmb3Igc2FtZSBwb2ludGVyIGFuZCBmb3JtYXR0aW5nIG9wdGlvbnNcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY3Vyc29yJyk7XG4gICAgICAgICAgICAvL2dpdmUgb3VyIGVsZW1lbnQgYW4gSUQgZm9yIGZ1dHVyZSBzZWxlY3Rpb24gYXMgbmVlZGVkXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wXycgKyBwb3N0SUQgKyAnX3RleHQnKTtcbiAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBpbWcgZWxlbWVudCB0byBsZWFkIG91ciBuZXcgZmVhdHVyZSB2aXN1YWxzXG4gICAgICAgICAgICBjb25zdCBnaWZ0SWNvbkdpZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgLy91c2Ugc2l0ZSBmcmVlbGVlY2ggZ2lmIGljb24gZm9yIG91ciBmZWF0dXJlXG4gICAgICAgICAgICBnaWZ0SWNvbkdpZi5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgJ3NyYycsXG4gICAgICAgICAgICAgICAgJ2h0dHBzOi8vY2RuLm15YW5vbmFtb3VzZS5uZXQvaW1hZ2VidWNrZXQvMTA4MzAzL3RoYW5rLmdpZidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvL21ha2UgdGhlIGdpZiBpY29uIHRoZSBmaXJzdCBjaGlsZCBvZiBlbGVtZW50XG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChnaWZ0SWNvbkdpZik7XG4gICAgICAgICAgICAvL2FkZCB0aGUgZmVhdHVyZSBlbGVtZW50IGluIGxpbmUgd2l0aCB0aGUgY3Vyc29yIG9iamVjdCB3aGljaCBpcyB0aGUgcXVvdGUgYW5kIHJlcG9ydCBidXR0b25zIGF0IGJvdHRvbVxuICAgICAgICAgICAgYm90dG9tUm93LmFwcGVuZENoaWxkKGdpZnRFbGVtZW50KTtcblxuICAgICAgICAgICAgLy9tYWtlIGl0IGEgYnV0dG9uIHZpYSBjbGljayBsaXN0ZW5lclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy90byBhdm9pZCBidXR0b24gdHJpZ2dlcmluZyBtb3JlIHRoYW4gb25jZSBwZXIgcGFnZSBsb2FkLCBjaGVjayBpZiBhbHJlYWR5IGhhdmUganNvbiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZHVlIHRvIGxhY2sgb2YgSURzIGFuZCBjb25mbGljdGluZyBxdWVyeSBzZWxlY3RhYmxlIGVsZW1lbnRzLCBuZWVkIHRvIGp1bXAgdXAgYSBmZXcgcGFyZW50IGxldmVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFBhcmVudE5vZGUgPSBnaWZ0RWxlbWVudC5wYXJlbnRFbGVtZW50IS5wYXJlbnRFbGVtZW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnRFbGVtZW50ITtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vb25jZSBhdCBwYXJlbnQgbm9kZSBvZiB0aGUgcG9zdCwgZmluZCB0aGUgcG9zdGVyJ3MgdXNlciBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlckVsZW0gPSBwb3N0UGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKGBhW2hyZWZePVwiL3UvXCJdYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgVVJMIG9mIHRoZSBwb3N0IHRvIGFkZCB0byBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3N0VVJMID0gKDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi9mL3QvXCJdYCkhXG4gICAgICAgICAgICAgICAgICAgICAgICApKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IE1BTSB1c2VyIHNlbmRpbmcgZ2lmdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbmRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTWVudScpIS5pbm5lclRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NsZWFuIHVwIHRleHQgb2Ygc2VuZGVyIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyID0gc2VuZGVyLnN1YnN0cmluZygwLCBzZW5kZXIuaW5kZXhPZignICcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB0aXRsZSBvZiB0aGUgcGFnZSBzbyB3ZSBjYW4gd3JpdGUgaW4gbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvcnVtVGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3V0IGRvd24gZmx1ZmYgZnJvbSBwYWdlIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlID0gZm9ydW1UaXRsZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ydW1UaXRsZS5pbmRleE9mKCd8JykgLSAxXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gKDxIVE1MRWxlbWVudD51c2VyRWxlbSEpLmlubmVyVGV4dDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIGEgZ2lmdCByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9c2VuZFdlZGdlJmdpZnRUbz0ke3VzZXJOYW1lfSZtZXNzYWdlPSR7c2VuZGVyfSB3YW50cyB0byB0aGFuayB5b3UgZm9yIHlvdXIgY29udHJpYnV0aW9uIHRvIHRoZSBmb3J1bSB0b3BpYyBbdXJsPWh0dHBzOi8vbXlhbm9uYW1vdXNlLm5ldCR7cG9zdFVSTH1dJHtmb3J1bVRpdGxlfVsvdXJsXWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL21ha2UgIyBVUkkgY29tcGF0aWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJyMnLCAnJTIzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3VzZSBNQU0rIGpzb24gZ2V0IHV0aWxpdHkgdG8gcHJvY2VzcyBVUkwgYW5kIHJldHVybiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIGdpZnQgd2FzIHN1Y2Nlc3NmdWxseSBzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgdGV4dCB0byBzaG93IHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgU3VjY2Vzc2Z1bCEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9iYXNlZCBvbiBmYWlsdXJlLCBhZGQgZmVhdHVyZSB0ZXh0IHRvIHNob3cgZmFpbHVyZSByZWFzb24gb3IgZ2VuZXJpY1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGpzb25SZXN1bHQpLmVycm9yID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdZb3UgY2FuIG9ubHkgc2VuZCBhIHVzZXIgb25lIHdlZGdlIHBlciBkYXkuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZDogQWxyZWFkeSBHaWZ0ZWQgVGhpcyBVc2VyIFRvZGF5ISdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ludmFsaWQgdXNlciwgdGhpcyB1c2VyIGlzIG5vdCBjdXJyZW50bHkgYWNjZXB0aW5nIHdlZGdlcydcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IFRoaXMgVXNlciBEb2VzIE5vdCBBY2NlcHQgR2lmdHMhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmx5IGtub3duIGV4YW1wbGUgb2YgdGhpcyAnb3RoZXInIGlzIHdoZW4gZ2lmdGluZyB5b3Vyc2VsZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRkwgR2lmdCBGYWlsZWQhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG4iLCIvKipcbiAqICMjIyBBZGRzIGFiaWxpdHkgdG8gZ2lmdCBuZXdlc3QgMTAgbWVtYmVycyB0byBNQU0gb24gSG9tZXBhZ2Ugb3Igb3BlbiB0aGVpciB1c2VyIHBhZ2VzXG4gKi9cbmNsYXNzIEdpZnROZXdlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICAvKiBUT0RPOiBSZWZhY3RvciBjb2RlIHRvIHJlZHVjZSBkdXBsaWNhdGlvbi4gKi9cbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkhvbWUsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZ2lmdE5ld2VzdCcsXG4gICAgICAgIGRlc2M6IGBBZGQgYnV0dG9ucyB0byBHaWZ0L09wZW4gYWxsIG5ld2VzdCBtZW1iZXJzYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluVGFibGUnO1xuICAgIHByaXZhdGUgX2dpZnRlZFN0b3JlS2V5OiBzdHJpbmcgPSAnbXBfbGFzdE5ld0dpZnRlZCc7XG4gICAgcHJpdmF0ZSBfZ2lmdGVkU3RvcmVMaW1pdDogbnVtYmVyID0gNTAwO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZScsICduZXcgdXNlcnMnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogRGVjaWRlIHdoaWNoIHBhZ2UgdG8gcnVuIG9uXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgQ2hlY2sucGFnZSgpLnRoZW4oKHBhZ2U6VmFsaWRQYWdlKSA9PiB7XG4gICAgICAgICAgICBpZihNUC5ERUJVRykgY29uc29sZS5sb2coJ1VzZXIgZ2lmdGluZyBpbml0IG9uJyxwYWdlKTtcblxuICAgICAgICAgICAgaWYocGFnZSA9PT0gJ2hvbWUnKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9ob21lUGFnZUdpZnRpbmcoKTtcbiAgICAgICAgICAgIH1lbHNlIGlmKHBhZ2UgPT09ICduZXcgdXNlcnMnKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXdVc2Vyc1BhZ2VHaWZ0aW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBGdW5jdGlvbiB0aGF0IHJ1bnMgb24gdGhlIEhvbWUgcGFnZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2hvbWVQYWdlR2lmdGluZygpIHtcbiAgICAgICAgLy9lbnN1cmUgZ2lmdGVkIGxpc3QgaXMgdW5kZXIgNTAwIG1lbWJlciBuYW1lcyBsb25nXG4gICAgICAgIHRoaXMuX3RyaW1HaWZ0TGlzdCgpO1xuICAgICAgICBVdGlsLmdldFJlY2VudFBvaW50R2lmdHMoKTtcbiAgICAgICAgLy9nZXQgdGhlIEZyb250UGFnZSBOZXdNZW1iZXJzIGVsZW1lbnQgY29udGFpbmluZyBuZXdlc3QgMTAgbWVtYmVyc1xuICAgICAgICBjb25zdCBmcE5NID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmcE5NJyk7XG4gICAgICAgIGNvbnN0IG1lbWJlcnM6IEhUTUxBbmNob3JFbGVtZW50W10gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgICAgICAgIGZwTk0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBsYXN0TWVtID0gbWVtYmVyc1ttZW1iZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICBtZW1iZXJzLmZvckVhY2goKG1lbWJlcikgPT4ge1xuICAgICAgICAgICAgLy9hZGQgYSBjbGFzcyB0byB0aGUgZXhpc3RpbmcgZWxlbWVudCBmb3IgdXNlIGluIHJlZmVyZW5jZSBpbiBjcmVhdGluZyBidXR0b25zXG4gICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZChgbXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfWApO1xuICAgICAgICAgICAgdGhpcy5fbWFya0tub3duR2lmdFN0YXR1cyhtZW1iZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcbiAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XG4gICAgICAgIC8vbWFrZSBzdXJlIHRoZSB2YWx1ZSBmYWxscyB3aXRoaW4gdGhlIGFjY2VwdGFibGUgcmFuZ2VcbiAgICAgICAgLy8gVE9ETzogTWFrZSB0aGUgZ2lmdCB2YWx1ZSBjaGVjayBpbnRvIGEgVXRpbFxuICAgICAgICBpZiAoIWdpZnRWYWx1ZVNldHRpbmcpIHtcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcbiAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAgfHwgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKSkge1xuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XG4gICAgICAgIH1cbiAgICAgICAgLy9jcmVhdGUgdGhlIHRleHQgaW5wdXQgZm9yIGhvdyBtYW55IHBvaW50cyB0byBnaXZlXG4gICAgICAgIGNvbnN0IGdpZnRBbW91bnRzOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgVXRpbC5zZXRBdHRyKGdpZnRBbW91bnRzLCB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICBzaXplOiAnMycsXG4gICAgICAgICAgICBpZDogJ21wX2dpZnRBbW91bnRzJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVmFsdWUgYmV0d2VlbiA1IGFuZCAxMDAnLFxuICAgICAgICAgICAgdmFsdWU6IGdpZnRWYWx1ZVNldHRpbmcsXG4gICAgICAgIH0pO1xuICAgICAgICAvL2luc2VydCB0aGUgdGV4dCBib3ggYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lXG4gICAgICAgIGxhc3RNZW0uaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGdpZnRBbW91bnRzKTtcblxuICAgICAgICAvL21ha2UgdGhlIGJ1dHRvbiBhbmQgaW5zZXJ0IGFmdGVyIHRoZSBsYXN0IG1lbWJlcnMgbmFtZSAoYmVmb3JlIHRoZSBpbnB1dCB0ZXh0KVxuICAgICAgICBjb25zdCBnaWZ0QWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnZ2lmdEFsbCcsXG4gICAgICAgICAgICAnR2lmdCBBbGw6ICcsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgIGAubXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihsYXN0TWVtKX1gLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIC8vYWRkIGEgc3BhY2UgYmV0d2VlbiBidXR0b24gYW5kIHRleHRcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5SaWdodCA9ICc1cHgnO1xuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblRvcCA9ICc1cHgnO1xuXG4gICAgICAgIGdpZnRBbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0Q2FsbDogYm9vbGVhbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGV0IHNraXBwZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgdGV4dCB0byBzaG93IHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICdTZW5kaW5nIEdpZnRzLi4uIFBsZWFzZSBXYWl0JztcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB1c2VyIGhhcyBub3QgYmVlbiBnaWZ0ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gbWVtYmVyLmlubmVyVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBwb2ludHMgYW1vdW50IGZyb20gdGhlIGlucHV0IGJveFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICkpIS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJJRCA9IFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikhO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nQWxsb3dhbmNlID0gVXRpbC5nZXRSZW1haW5pbmdQb2ludEdpZnRBbGxvd2FuY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySURcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1haW5pbmdBbGxvd2FuY2UgPCBnaWZ0RmluYWxBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lwcGVkQ291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBbTStdIFNraXBwaW5nICR7dXNlck5hbWV9OyAke3JlbWFpbmluZ0FsbG93YW5jZX0gcG9pbnRzIHJlbWFpbmluZyB0b2RheS5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nQWxsb3dhbmNlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTWF4aW11bSBkYWlseSBwb2ludHMgYWxyZWFkeSBzZW50IHRvZGF5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2dpZnRGaW5hbEFtb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vd2FpdCAzIHNlY29uZHMgYmV0d2VlbiBKU09OIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RDYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RDYWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcXVlc3Qgc2VuZGluZyBwb2ludHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGpzb25SZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBnaWZ0IHdhcyBzdWNjZXNzZnVsbHkgc2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY29yZFN1Y2Nlc3NmdWxHaWZ0KG1lbWJlciwgZ2lmdEZpbmFsQW1vdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWpzb24uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihqc29uLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b24gYWZ0ZXIgc2VuZFxuICAgICAgICAgICAgICAgIChnaWZ0QWxsQnRuIGFzIEhUTUxJbnB1dEVsZW1lbnQpLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxuICAgICAgICAgICAgICAgICAgICBza2lwcGVkQ291bnQgPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGBHaWZ0cyBjb21wbGV0ZWQuIFNraXBwZWQgJHtza2lwcGVkQ291bnR9IG92ZXIgZGFpbHkgbGltaXQuYFxuICAgICAgICAgICAgICAgICAgICAgICAgOiAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIC8vbmV3bGluZSBiZXR3ZWVuIGVsZW1lbnRzXG4gICAgICAgIG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXS5hZnRlcihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcbiAgICAgICAgLy9saXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGlucHV0IGJveCBhbmQgZW5zdXJlIGl0cyBiZXR3ZWVuIDUgYW5kIDEwMDAsIGlmIG5vdCBkaXNhYmxlIGJ1dHRvblxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpXG4gICAgICAgICAgICApKSEudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGwnKTtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA+IDEwMDAgfHxcbiAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPCA1IHx8XG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgJ0Rpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdpZnRBbGwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBgR2lmdCBBbGwgJHt2YWx1ZVRvTnVtYmVyfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9hZGQgYSBidXR0b24gdG8gb3BlbiBhbGwgdW5naWZ0ZWQgbWVtYmVycyBpbiBuZXcgdGFic1xuICAgICAgICBjb25zdCBvcGVuQWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnb3BlblRhYnMnLFxuICAgICAgICAgICAgJ09wZW4gVW5naWZ0ZWQgSW4gVGFicycsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgICdbaWQ9bXBfZ2lmdEFtb3VudHNdJyxcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAnbXBfYnRuJ1xuICAgICAgICApO1xuXG4gICAgICAgIG9wZW5BbGxCdG4uc2V0QXR0cmlidXRlKCd0aXRsZScsICdPcGVuIG5ldyB0YWIgZm9yIGVhY2gnKTtcbiAgICAgICAgb3BlbkFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKG1lbWJlci5ocmVmLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICAgICAgLy9nZXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIGJvbnVzIHBvaW50cyBhdmFpbGFibGUgdG8gc3BlbmRcbiAgICAgICAgbGV0IGJvbnVzUG9pbnRzQXZhaWw6IHN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0bUJQJykhLmlubmVyVGV4dDtcbiAgICAgICAgLy9nZXQgcmlkIG9mIHRoZSBkZWx0YSBkaXNwbGF5XG4gICAgICAgIGlmIChib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKSA+PSAwKSB7XG4gICAgICAgICAgICBib251c1BvaW50c0F2YWlsID0gYm9udXNQb2ludHNBdmFpbC5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3JlY3JlYXRlIHRoZSBib251cyBwb2ludHMgaW4gbmV3IHNwYW4gYW5kIGluc2VydCBpbnRvIGZwTk1cbiAgICAgICAgY29uc3QgbWVzc2FnZVNwYW46IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBtZXNzYWdlU3Bhbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2dpZnRBbGxNc2cnKTtcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gJ0F2YWlsYWJsZSAnICsgYm9udXNQb2ludHNBdmFpbDtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFmdGVyKG1lc3NhZ2VTcGFuKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuYWZ0ZXIoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSFcbiAgICAgICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgJzxicj4nKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIGdpZnQgbmV3IG1lbWJlcnMgYnV0dG9uIHRvIEhvbWUgcGFnZS4uLmApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogRnVuY3Rpb24gdGhhdCBydW5zIG9uIHRoZSBOZXcgVXNlcnMgcGFnZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX25ld1VzZXJzUGFnZUdpZnRpbmcoKSB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGUgZ2lmdGVkIGxpc3QgaXMgdW5kZXIgNTAwIG1lbWJlcnNcbiAgICAgICAgdGhpcy5fdHJpbUdpZnRMaXN0KCk7XG4gICAgICAgIFV0aWwuZ2V0UmVjZW50UG9pbnRHaWZ0cygpO1xuXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgY29udGFpbmVyIGhvbGRpbmcgdGhlIG5ld2VzdCBtZW1iZXJzXG4gICAgICAgIGNvbnN0IGZwTk0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmxvY2tDb24nKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgZm9vdGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJsb2NrRm9vdCcpIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBtZW1iZXJMYWJlbHMgPSB0aGlzLl9nZXROZXdVc2Vyc01lbWJlcnMoZnBOTSk7XG4gICAgICAgIGNvbnN0IGdldEF2YWlsYWJsZVBvaW50cyA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm9udXNQb2ludFRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG1CUCcpIS5pbm5lclRleHQuc3BsaXQoJzonKVsxXTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gYm9udXNQb2ludFRleHQubWF0Y2goL1tcXGQsXSsvKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChtYXRjaFswXS5yZXBsYWNlKC8sL2csICcnKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggbWVtYmVyIGFuZCBjaGVjayBpZiB0aGV5IHdlcmUgcHJldmlvdXNseSBnaWZ0ZWRcbiAgICAgICAgbWVtYmVyTGFiZWxzLmZvckVhY2goKHsgbWVtYmVyIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlclJlZiA9IGBtcF9yZWZQb2ludF8ke1V0aWwuZW5kT2ZIcmVmKG1lbWJlcil9YDtcbiAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKG1lbWJlclJlZik7XG4gICAgICAgICAgICB0aGlzLl9tYXJrS25vd25HaWZ0U3RhdHVzKG1lbWJlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJldHJpZXZlIG9yIGRlZmF1bHQgdGhlIGdpZnQgdmFsdWUgc2V0dGluZ1xuICAgICAgICBsZXQgZ2lmdFZhbHVlU2V0dGluZyA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJykgfHwgJzEwMCc7XG4gICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDUsIE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSkpIHx8IDEwMDtcblxuICAgICAgICAvLyBDcmVhdGUgaW5wdXQgYm94IGZvciBnaWZ0IGFtb3VudFxuICAgICAgICBjb25zdCBnaWZ0QW1vdW50cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIFV0aWwuc2V0QXR0cihnaWZ0QW1vdW50cywge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgc2l6ZTogJzMnLFxuICAgICAgICAgICAgaWQ6ICdtcF9naWZ0QW1vdW50cycsXG4gICAgICAgICAgICB0aXRsZTogJ1ZhbHVlIGJldHdlZW4gNSBhbmQgMTAwJyxcbiAgICAgICAgICAgIHZhbHVlOiBTdHJpbmcoZ2lmdFZhbHVlU2V0dGluZyksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgYnBUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBicFRleHQuaW5uZXJUZXh0ID0gJ3BvaW50cyAnO1xuXG4gICAgICAgIC8vIENyZWF0ZSBcIkdpZnQgQWxsIENoZWNrZWQgVXNlcnNcIiBidXR0b25cbiAgICAgICAgY29uc3QgZ2lmdEFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ21wX2dpZnRBbGwnLFxuICAgICAgICAgICAgJ0dpZnQgQWxsIFNlbGVjdGVkJyxcbiAgICAgICAgICAgICdidXR0b24nLFxuICAgICAgICAgICAgZm9vdGVyLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5Ub3AgPSAnNXB4JztcblxuICAgICAgICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgZ2lmdGluZyBhY3Rpb25cbiAgICAgICAgZ2lmdEFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmlubmVyVGV4dCA9ICdTZW5kaW5nIEdpZnRzLi4uIFBsZWFzZSBXYWl0JztcbiAgICAgICAgICAgIGxldCBmaXJzdENhbGwgPSB0cnVlO1xuICAgICAgICAgICAgbGV0IHNraXBwZWRDb3VudCA9IDA7XG4gICAgICAgICAgICBjb25zdCBnaWZ0QW1vdW50ID0gTnVtYmVyKFxuICAgICAgICAgICAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCB7IG1lbWJlciwgY2hlY2tib3ggfSBvZiBtZW1iZXJMYWJlbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tib3guY2hlY2tlZCAmJiAhbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSBtZW1iZXIuaW5uZXJUZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJJRCA9IFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikhO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdBbGxvd2FuY2UgPSBVdGlsLmdldFJlbWFpbmluZ1BvaW50R2lmdEFsbG93YW5jZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklEXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0FsbG93YW5jZSA8IGdpZnRBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraXBwZWRDb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBbTStdIFNraXBwaW5nICR7dXNlck5hbWV9OyAke3JlbWFpbmluZ0FsbG93YW5jZX0gcG9pbnRzIHJlbWFpbmluZyB0b2RheS5gXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0FsbG93YW5jZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ01heGltdW0gZGFpbHkgcG9pbnRzIGFscmVhZHkgc2VudCB0b2RheSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0QW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX1gO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlyc3RDYWxsKSBhd2FpdCBVdGlsLnNsZWVwKDMwMDApO1xuICAgICAgICAgICAgICAgICAgICBmaXJzdENhbGwgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0ID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGpzb25SZXN1bHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY29yZFN1Y2Nlc3NmdWxHaWZ0KG1lbWJlciwgZ2lmdEFtb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oanNvbi5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIChnaWZ0QWxsQnRuIGFzIEhUTUxCdXR0b25FbGVtZW50KS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxuICAgICAgICAgICAgICAgIHNraXBwZWRDb3VudCA+IDBcbiAgICAgICAgICAgICAgICAgICAgPyBgR2lmdHMgY29tcGxldGVkLiBTa2lwcGVkICR7c2tpcHBlZENvdW50fSBvdmVyIGRhaWx5IGxpbWl0LmBcbiAgICAgICAgICAgICAgICAgICAgOiAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSW5wdXQgdmFsaWRhdGlvbiBmb3IgZ2lmdCBhbW91bnRcbiAgICAgICAgZ2lmdEFtb3VudHMuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGwnKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gTnVtYmVyKGdpZnRBbW91bnRzLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgNSB8fCB2YWx1ZSA+IDEwMCB8fCBpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsQnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsQnRuLnRpdGxlID0gJ0Rpc2FibGVkJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGdpZnRBbGxCdG4udGl0bGUgPSBgR2lmdCBBbGwgJHt2YWx1ZX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgXCJPcGVuIFVuZ2lmdGVkIGluIFRhYnNcIiBidXR0b25cbiAgICAgICAgY29uc3Qgb3BlbkFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ21wX29wZW5UYWJzJyxcbiAgICAgICAgICAgICdPcGVuIFVuZ2lmdGVkIGluIFRhYnMnLFxuICAgICAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgICAgICBmb290ZXIsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ21wX2J0bidcbiAgICAgICAgKTtcbiAgICAgICAgb3BlbkFsbEJ0bi50aXRsZSA9ICdPcGVuIGEgbmV3IHRhYiBmb3IgZWFjaCB1bmdpZnRlZCBtZW1iZXInO1xuICAgICAgICBvcGVuQWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IG1lbWJlciwgY2hlY2tib3ggfSBvZiBtZW1iZXJMYWJlbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tib3guY2hlY2tlZCAmJiAhbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4obWVtYmVyLmhyZWYsICdfYmxhbmsnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERpc3BsYXkgYXZhaWxhYmxlIGJvbnVzIHBvaW50cyBpbiB0aGUgZm9vdGVyXG4gICAgICAgIGxldCBib251c1BvaW50c0F2YWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RtQlAnKSEuaW5uZXJUZXh0LnNwbGl0KCc6JylbMV07XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBtZXNzYWdlU3Bhbi5pZCA9ICdtcF9naWZ0QWxsTXNnJztcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gYCBBdmFpbGFibGUgUG9pbnRzOiAke2JvbnVzUG9pbnRzQXZhaWx9YDtcblxuICAgICAgICAvLyBBZGQgXCJEZXNlbGVjdCBBbGxcIiBidXR0b25cbiAgICAgICAgY29uc3QgZGVzZWxlY3RCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdtcF9kZXNlbGVjdEFsbCcsXG4gICAgICAgICAgICAnVW5zZWxlY3QgYWxsJyxcbiAgICAgICAgICAgICdidXR0b24nLFxuICAgICAgICAgICAgZm9vdGVyLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIGRlc2VsZWN0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm94TGlzdDogTm9kZUxpc3RPZjxIVE1MSW5wdXRFbGVtZW50PiB8IHZvaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpXG5cbiAgICAgICAgICAgIGJveExpc3QuZm9yRWFjaCgoYm94OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgXCJTZWxlY3QgMTAwIFVuZ2lmdGVkXCIgYnV0dG9uXG4gICAgICAgIGNvbnN0IHNlbGVjdFVuZ2lmdGVkQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnbXBfc2VsZWN0VW5naWZ0ZWQnLFxuICAgICAgICAgICAgJ1NlbGVjdCAxMDAgVW5naWZ0ZWQnLFxuICAgICAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgICAgICBmb290ZXIsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ21wX2J0bidcbiAgICAgICAgKTtcbiAgICAgICAgc2VsZWN0VW5naWZ0ZWRCdG4udGl0bGUgPSAnU2VsZWN0IHRoZSBmaXJzdCAxMDAgdW5naWZ0ZWQgdXNlcnMnO1xuICAgICAgICBzZWxlY3RVbmdpZnRlZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgbWVtYmVyLCBjaGVja2JveCB9IG9mIG1lbWJlckxhYmVscykge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBtZW1iZXIgaXMgbm90IGdpZnRlZCBhbmQgaWYgdGhlIGNoZWNrYm94IGlzIG5vdCB5ZXQgc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpICYmICFjaGVja2JveC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSB0cnVlOyAgLy8gU2VsZWN0IHRoZSBjaGVja2JveFxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAvLyBTdG9wIGFmdGVyIHNlbGVjdGluZyAxMDAgdXNlcnNcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID49IDEwMCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2VsZWN0ZWQgJHtjb3VudH0gdW5naWZ0ZWQgdXNlcnMuYCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBcIlNlbGVjdCBNYXggVW5naWZ0ZWRcIiBidXR0b25cbiAgICAgICAgY29uc3Qgc2VsZWN0TWF4VW5naWZ0ZWRCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdtcF9zZWxlY3RNYXhVbmdpZnRlZCcsXG4gICAgICAgICAgICAnU2VsZWN0IE1heCBVbmdpZnRlZCcsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgIGZvb3RlcixcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAnbXBfYnRuJ1xuICAgICAgICApO1xuICAgICAgICBzZWxlY3RNYXhVbmdpZnRlZEJ0bi50aXRsZSA9XG4gICAgICAgICAgICAnU2VsZWN0IHRoZSBtYXhpbXVtIG51bWJlciBvZiB1bmdpZnRlZCB1c2VycyB5b3UgY2FuIGFmZm9yZCBhdCB0aGUgY3VycmVudCBnaWZ0IHNpemUnO1xuICAgICAgICBzZWxlY3RNYXhVbmdpZnRlZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdpZnRBbW91bnQgPSBOdW1iZXIoZ2lmdEFtb3VudHMudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlUG9pbnRzID0gZ2V0QXZhaWxhYmxlUG9pbnRzKCk7XG5cbiAgICAgICAgICAgIGlmIChnaWZ0QW1vdW50IDwgNSB8fCBnaWZ0QW1vdW50ID4gMTAwIHx8IGlzTmFOKGdpZnRBbW91bnQpIHx8IGdpZnRBbW91bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tNK10gQ2Fubm90IHNlbGVjdCBtYXggdW5naWZ0ZWQgdXNlcnM7IGdpZnQgYW1vdW50IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtYXhTZWxlY3RhYmxlID0gTWF0aC5mbG9vcihhdmFpbGFibGVQb2ludHMgLyBnaWZ0QW1vdW50KTtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjaGVja2JveCB9IG9mIG1lbWJlckxhYmVscykge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCB7IG1lbWJlciwgY2hlY2tib3ggfSBvZiBtZW1iZXJMYWJlbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpICYmIGNvdW50IDwgbWF4U2VsZWN0YWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGBbTStdIFNlbGVjdGVkICR7Y291bnR9IHVuZ2lmdGVkIHVzZXJzIHVzaW5nICR7YXZhaWxhYmxlUG9pbnRzfSBhdmFpbGFibGUgcG9pbnRzIGF0ICR7Z2lmdEFtb3VudH0gcG9pbnRzIGVhY2guYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGFsbCBlbGVtZW50cyB0byB0aGUgZm9vdGVyXG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChzZWxlY3RNYXhVbmdpZnRlZEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChzZWxlY3RVbmdpZnRlZEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChkZXNlbGVjdEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChnaWZ0QW1vdW50cyk7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChicFRleHQpO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoZ2lmdEFsbEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChvcGVuQWxsQnRuKTtcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKG1lc3NhZ2VTcGFuKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCBnaWZ0aW5nIG9wdGlvbnMgdG8gdGhlIGZvb3RlciBvZiB0aGUgcGFnZS4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIFRyaW1zIHRoZSBnaWZ0ZWQgbGlzdCB0byBsYXN0IDUwMCBuYW1lcyB0byBhdm9pZCBnZXR0aW5nIHRvbyBsYXJnZSBvdmVyIHRpbWUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdHJpbUdpZnRMaXN0KCkge1xuICAgICAgICB0aGlzLl9zZXRHaWZ0ZWRVc2Vycyh0aGlzLl9nZXRHaWZ0ZWRVc2VycygpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRHaWZ0ZWRVc2VycygpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZEdpZnRlZFVzZXJzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl9naWZ0ZWRTdG9yZUtleSk7XG5cbiAgICAgICAgaWYgKHN0b3JlZEdpZnRlZFVzZXJzID09PSB1bmRlZmluZWQgfHwgc3RvcmVkR2lmdGVkVXNlcnMgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RvcmVkR2lmdGVkVXNlcnNcbiAgICAgICAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAgICAgICAubWFwKChnaWZ0ZWRVc2VyKSA9PiBnaWZ0ZWRVc2VyLnRyaW0oKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGdpZnRlZFVzZXIsIGluZGV4LCBhbGxHaWZ0ZWRVc2VycykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBnaWZ0ZWRVc2VyICE9PSAnJyAmJiBhbGxHaWZ0ZWRVc2Vycy5pbmRleE9mKGdpZnRlZFVzZXIpID09PSBpbmRleDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldEdpZnRlZFVzZXJzKGdpZnRlZFVzZXJzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgICAgICBHTV9zZXRWYWx1ZShcbiAgICAgICAgICAgIHRoaXMuX2dpZnRlZFN0b3JlS2V5LFxuICAgICAgICAgICAgZ2lmdGVkVXNlcnMuc2xpY2UoMCwgdGhpcy5fZ2lmdGVkU3RvcmVMaW1pdCkuam9pbignLCcpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3RvcmVHaWZ0ZWRNZW1iZXIobWVtYmVySUQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBnaWZ0ZWRVc2VycyA9IHRoaXMuX2dldEdpZnRlZFVzZXJzKCkuZmlsdGVyKFxuICAgICAgICAgICAgKGdpZnRlZFVzZXIpID0+IGdpZnRlZFVzZXIgIT09IG1lbWJlcklEXG4gICAgICAgICk7XG4gICAgICAgIGdpZnRlZFVzZXJzLnVuc2hpZnQobWVtYmVySUQpO1xuICAgICAgICB0aGlzLl9zZXRHaWZ0ZWRVc2VycyhnaWZ0ZWRVc2Vycyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbWFya01lbWJlckdpZnRlZChtZW1iZXI6IEhUTUxBbmNob3JFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSDinIVgO1xuICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0TmV3VXNlcnNNZW1iZXJzKFxuICAgICAgICBjb250YWluZXI6IEhUTUxEaXZFbGVtZW50XG4gICAgKTogQXJyYXk8eyBsYWJlbDogSFRNTExhYmVsRWxlbWVudDsgbWVtYmVyOiBIVE1MQW5jaG9yRWxlbWVudDsgY2hlY2tib3g6IEhUTUxJbnB1dEVsZW1lbnQgfT4ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnbGFiZWwnKSkucmVkdWNlKFxuICAgICAgICAgICAgKG1lbWJlclJvd3MsIGxhYmVsKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbGFiZWwucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlciBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50ICYmXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJSb3dzLnB1c2goeyBsYWJlbCwgbWVtYmVyLCBjaGVja2JveCB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbWVtYmVyUm93cztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbXSBhcyBBcnJheTx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IEhUTUxMYWJlbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgbWVtYmVyOiBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICAgICAgICAgICAgICBjaGVja2JveDogSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgIH0+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBBZGQgdGhlIGdpZnRlZCBzdHlsaW5nIG9uY2Ugd2l0aG91dCBkdXBsaWNhdGluZyB0aGUgY2hlY2ttYXJrIHRleHRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tYXJrR2lmdGVkTWVtYmVyKG1lbWJlcjogSFRNTEFuY2hvckVsZW1lbnQsIHRpdGxlPzogc3RyaW5nKSB7XG4gICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSDinIVgO1xuICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICBtZW1iZXIudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogTWFyayB1c2VycyBhbHJlYWR5IGtub3duIGFzIGdpZnRlZCwgZWl0aGVyIGZyb20gdGhlIGxlZ2FjeSBsaXN0IG9yIHRvZGF5J3MgY2FjaGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tYXJrS25vd25HaWZ0U3RhdHVzKG1lbWJlcjogSFRNTEFuY2hvckVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgbWVtYmVySUQgPSBVdGlsLmVuZE9mSHJlZihtZW1iZXIpO1xuICAgICAgICBpZiAoIW1lbWJlcklEKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZ2V0R2lmdGVkVXNlcnMoKS5pbmNsdWRlcyhtZW1iZXJJRCkpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIobWVtYmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChVdGlsLmdldFJlbWFpbmluZ1BvaW50R2lmdEFsbG93YW5jZShtZW1iZXJJRCkgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIobWVtYmVyLCAnTWF4aW11bSBkYWlseSBwb2ludHMgYWxyZWFkeSBzZW50IHRvZGF5Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIEtlZXAgbGVnYWN5IHRyYWNraW5nIGFuZCB0aGUgbmV3IGRhaWx5IGNhY2hlIGluIHN5bmMgYWZ0ZXIgYSBzdWNjZXNzZnVsIGdpZnRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWNvcmRTdWNjZXNzZnVsR2lmdChtZW1iZXI6IEhUTUxBbmNob3JFbGVtZW50LCBhbW91bnQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9tYXJrR2lmdGVkTWVtYmVyKG1lbWJlcik7XG4gICAgICAgIHRoaXMuX3N0b3JlR2lmdGVkTWVtYmVyKFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikhKTtcbiAgICAgICAgVXRpbC5yZWNvcmRQb2ludEdpZnQoVXRpbC5lbmRPZkhyZWYobWVtYmVyKSEsIGFtb3VudCk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBoaWRlIG5ld3MgaXRlbXMgb24gdGhlIHBhZ2VcbiAqL1xuY2xhc3MgSGlkZU5ld3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkhvbWUsXG4gICAgICAgIHRpdGxlOiAnaGlkZU5ld3MnLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBkZXNjOiAnVGlkeSB0aGUgaG9tZXBhZ2UgYW5kIGFsbG93IE5ld3MgdG8gYmUgaGlkZGVuJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5tYWluUGFnZU5ld3NIZWFkJztcbiAgICBwcml2YXRlIF92YWx1ZVRpdGxlOiBzdHJpbmcgPSBgbXBfJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1fdmFsYDtcbiAgICBwcml2YXRlIF9pY29uID0gJ1xcdTI3NGUnO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIC8vIE5PVEU6IGZvciBkZXZlbG9wbWVudFxuICAgICAgICAvLyBHTV9kZWxldGVWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtjb25zb2xlLndhcm4oYFZhbHVlIG9mICR7dGhpcy5fdmFsdWVUaXRsZX0gd2lsbCBiZSBkZWxldGVkIWApO1xuXG4gICAgICAgIHRoaXMuX3JlbW92ZUNsb2NrKCk7XG4gICAgICAgIHRoaXMuX3JlbW92ZURpc2NsYWltZXIoKTtcbiAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIpO1xuICAgICAgICBhd2FpdCB0aGlzLl9jaGVja0ZvclNlZW4oKTtcbiAgICAgICAgdGhpcy5fYWRkSGlkZXJCdXR0b24oKTtcbiAgICAgICAgLy8gdGhpcy5fY2xlYW5WYWx1ZXMoKTsgLy8gRklYOiBOb3Qgd29ya2luZyBhcyBpbnRlbmRlZFxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENsZWFuZWQgdXAgdGhlIGhvbWUgcGFnZSEnKTtcbiAgICB9XG5cbiAgICBfY2hlY2tGb3JTZWVuID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBwcmV2VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGhpcy5fdmFsdWVUaXRsZSwgJzpcXG4nLCBwcmV2VmFsdWUpO1xuXG4gICAgICAgIGlmIChwcmV2VmFsdWUgJiYgbmV3cykge1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBpY29uIHRvIHNwbGl0IG91dCB0aGUga25vd24gaGlkZGVuIG1lc3NhZ2VzXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5BcnJheSA9IHByZXZWYWx1ZS5zcGxpdCh0aGlzLl9pY29uKTtcbiAgICAgICAgICAgIC8qIElmIGFueSBvZiB0aGUgaGlkZGVuIG1lc3NhZ2VzIG1hdGNoIGEgY3VycmVudCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgcmVtb3ZlIHRoZSBjdXJyZW50IG1lc3NhZ2UgZnJvbSB0aGUgRE9NICovXG4gICAgICAgICAgICBoaWRkZW5BcnJheS5mb3JFYWNoKChoaWRkZW4pID0+IHtcbiAgICAgICAgICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS50ZXh0Q29udGVudCA9PT0gaGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gY3VycmVudCBtZXNzYWdlcywgaGlkZSB0aGUgaGVhZGVyXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluUGFnZU5ld3NTdWInKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3JlbW92ZUNsb2NrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjbG9jazogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IC5mcFRpbWUnKTtcbiAgICAgICAgaWYgKGNsb2NrKSBjbG9jay5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgX3JlbW92ZURpc2NsYWltZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NsYWltZXJIZWFkZXIgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21haW5Cb2R5IC5ibG9ja0hlYWRDb24gaDQnKVxuICAgICAgICApLmZpbmQoKGhlYWRlcikgPT4gaGVhZGVyLnRleHRDb250ZW50Py50cmltKCkgPT09ICdEaXNjbGFpbWVyJyk7XG4gICAgICAgIGNvbnN0IGRpc2NsYWltZXJCbG9jayA9IGRpc2NsYWltZXJIZWFkZXI/LmNsb3Nlc3QoJy5ibG9ja0NvbicpIGFzIEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcblxuICAgICAgICBpZiAoZGlzY2xhaW1lckJsb2NrKSBkaXNjbGFpbWVyQmxvY2sucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIF9hZGp1c3RIZWFkZXJTaXplID0gKHNlbGVjdG9yOiBzdHJpbmcsIHZpc2libGU/OiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld3NIZWFkZXI6IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKG5ld3NIZWFkZXIpIHtcbiAgICAgICAgICAgIGlmICh2aXNpYmxlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG5ld3NIZWFkZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3c0hlYWRlci5zdHlsZS5mb250U2l6ZSA9ICcyZW0nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9hZGRIaWRlckJ1dHRvbiA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xuICAgICAgICBpZiAoIW5ld3MpIHJldHVybjtcblxuICAgICAgICAvLyBMb29wIG92ZXIgZWFjaCBuZXdzIGVudHJ5XG4gICAgICAgIG5ld3MuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgeGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgeGJ1dHRvbi50ZXh0Q29udGVudCA9IHRoaXMuX2ljb247XG4gICAgICAgICAgICBVdGlsLnNldEF0dHIoeGJ1dHRvbiwge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTppbmxpbmUtYmxvY2s7bWFyZ2luLXJpZ2h0OjAuN2VtO2N1cnNvcjpwb2ludGVyOycsXG4gICAgICAgICAgICAgICAgY2xhc3M6ICdtcF9jbGVhckJ0bicsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2tzXG4gICAgICAgICAgICB4YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gY2xpY2tlZCwgYXBwZW5kIHRoZSBjb250ZW50IG9mIHRoZSBjdXJyZW50IG5ld3MgcG9zdCB0byB0aGVcbiAgICAgICAgICAgICAgICAvLyBsaXN0IG9mIHJlbWVtYmVyZWQgbmV3cyBpdGVtc1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpXG4gICAgICAgICAgICAgICAgICAgID8gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcbiAgICAgICAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBIaWRpbmcuLi4gJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XG5cbiAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCBgJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XG4gICAgICAgICAgICAgICAgZW50cnkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG1vcmUgbmV3cyBpdGVtcywgcmVtb3ZlIHRoZSBoZWFkZXJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkTmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWROZXdzICYmIHVwZGF0ZWROZXdzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBidXR0b24gYXMgdGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBlbnRyeVxuICAgICAgICAgICAgaWYgKGVudHJ5LmZpcnN0Q2hpbGQpIGVudHJ5LmZpcnN0Q2hpbGQuYmVmb3JlKHhidXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX2NsZWFuVmFsdWVzID0gKG51bSA9IDMpID0+IHtcbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgR01fZ2V0VmFsdWUoJHt0aGlzLl92YWx1ZVRpdGxlfSlgLCB2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBsYXN0IDMgc3RvcmVkIGl0ZW1zIGFmdGVyIHNwbGl0dGluZyB0aGVtIGF0IHRoZSBpY29uXG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuYXJyYXlUb1N0cmluZyh2YWx1ZS5zcGxpdCh0aGlzLl9pY29uKS5zbGljZSgwIC0gbnVtKSk7XG4gICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZhbHVlXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2dldE5ld3NJdGVtcyA9ICgpOiBOb2RlTGlzdE9mPEhUTUxEaXZFbGVtZW50PiB8IG51bGwgPT4ge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2W2NsYXNzXj1cIm1haW5QYWdlTmV3c1wiXScpO1xuICAgIH07XG5cbiAgICAvLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHR5cGUgc2VsZWN0ZWQgZm9yIGB0aGlzLl9zZXR0aW5nc2BcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxuLyoqXG4gKiAjIFJFUVVFU1QgUEFHRSBGRUFUVVJFU1xuICovXG4vKipcbiAqICogSGlkZSByZXF1ZXN0ZXJzIHdobyBhcmUgc2V0IHRvIFwiaGlkZGVuXCJcbiAqL1xuY2xhc3MgVG9nZ2xlSGlkZGVuUmVxdWVzdGVycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlSGlkZGVuUmVxdWVzdGVycycsXG4gICAgICAgIGRlc2M6IGBIaWRlIGhpZGRlbiByZXF1ZXN0ZXJzYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JSb3dzJztcbiAgICBwcml2YXRlIF9zZWFyY2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX2hpZGUgPSB0cnVlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5fYWRkVG9nZ2xlU3dpdGNoKCk7XG4gICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xuICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHRoaXMuX3NlYXJjaExpc3QpO1xuXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcih0aGlzLl90YXIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xuICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkVG9nZ2xlU3dpdGNoKCkge1xuICAgICAgICAvLyBNYWtlIGEgbmV3IGJ1dHRvbiBhbmQgaW5zZXJ0IGJlc2lkZSB0aGUgU2VhcmNoIGJ1dHRvblxuICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdzaG93SGlkZGVuJyxcbiAgICAgICAgICAgICdTaG93IEhpZGRlbicsXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICcjcmVxdWVzdFNlYXJjaCAudG9ycmVudFNlYXJjaCcsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXG4gICAgICAgICk7XG4gICAgICAgIC8vIFNlbGVjdCB0aGUgbmV3IGJ1dHRvbiBhbmQgYWRkIGEgY2xpY2sgbGlzdGVuZXJcbiAgICAgICAgY29uc3QgdG9nZ2xlU3dpdGNoOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc2hvd0hpZGRlbicpXG4gICAgICAgICk7XG4gICAgICAgIHRvZ2dsZVN3aXRjaC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICcjdG9yUm93cyA+IC5tcF9oaWRkZW4nXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ0hpZGUgSGlkZGVuJztcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ2xpc3QtaXRlbSc7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ1Nob3cgSGlkZGVuJztcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFJlcXVlc3RMaXN0KCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3RzIHRvIGV4aXN0XG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyAudG9yUmlnaHQnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBHcmFiIGFsbCByZXF1ZXN0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcUxpc3Q6XG4gICAgICAgICAgICAgICAgICAgIHwgTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PlxuICAgICAgICAgICAgICAgICAgICB8IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfCB1bmRlZmluZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAnI3RvclJvd3MgLnRvclJvdydcbiAgICAgICAgICAgICAgICApIGFzIE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD47XG5cbiAgICAgICAgICAgICAgICBpZiAocmVxTGlzdCA9PT0gbnVsbCB8fCByZXFMaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGByZXFMaXN0IGlzICR7cmVxTGlzdH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcUxpc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4pIHtcbiAgICAgICAgbGlzdC5mb3JFYWNoKChyZXF1ZXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ZXI6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IHJlcXVlc3QucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAnLnRvclJpZ2h0IGEnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Quc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGRlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2YgcmVxdWVzdCByZXN1bHRzXG4gKi9cbmNsYXNzIFBsYWludGV4dFJlcXVlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlJlcXVlc3RzLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFJlcXVlc3QnLFxuICAgICAgICBkZXNjOiBgSW5zZXJ0IHBsYWludGV4dCByZXF1ZXN0IHJlc3VsdHMgYXQgdG9wIG9mIHJlcXVlc3QgcGFnZWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcbiAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXG4gICAgKTtcbiAgICBwcml2YXRlIF9wbGFpblRleHQ6IHN0cmluZyA9ICcnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj47XG5cbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdwbGFpblRvZ2dsZScsXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAnI3NzcicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCkpLFxuICAgICAgICBdKTtcblxuICAgICAgICAvLyBQcm9jZXNzIHRoZSByZXN1bHRzIGludG8gcGxhaW50ZXh0XG4gICAgICAgIHJlc3VsdExpc3RcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgY29weSBidXR0b25cbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAgICAgICAgICdwbGFpbkNvcHknLFxuICAgICAgICAgICAgICAgICAgICAnQ29weSBQbGFpbnRleHQnLFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgJyNtcF9wbGFpblRvZ2dsZScsXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAgICAgICAgICdtcF9jb3B5IG1wX3BsYWluQnRuJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcbiAgICAgICAgICAgICAgICBjb3B5QnRuLmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGEgY2xpY2sgbGlzdGVuZXJcbiAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9wbGFpblRleHQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3BsYWludGV4dFNlYXJjaCcpIS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodGhpcy5faXNPcGVuKTtcblxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XG4gICAgICAgIHRvZ2dsZUJ0blxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dGJveDogSFRNTFRleHRBcmVhRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Ym94ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgndHJ1ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdTaG93IFBsYWludGV4dCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyEnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxuICAgICAqIEBwYXJhbSB2YWwgc3RyaW5naWZpZWQgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcbiAgICAgICAgR01fc2V0VmFsdWUoJ3RvZ2dsZVNuYXRjaGVkU3RhdGUnLCB2YWwpO1xuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMocmVzdWx0czogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBsZXQgc2VyaWVzVGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIC8vIEJyZWFrIG91dCB0aGUgaW1wb3J0YW50IGRhdGEgZnJvbSBlYWNoIG5vZGVcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgJy5hdXRob3InXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAnLm5hcnJhdG9yJ1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHJhd1RpdGxlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LmZvckVhY2goKHNlcmllcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSBsYXN0IHNlcmllcywgdGhlbiBzdHlsZVxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSAnQlkgJztcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSAnRlQgJztcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG91dHA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0UmVxdWVzdExpc3QgPSAoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PiA9PiB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5nZXRTZWFyY2hMaXN0KCApYCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdCByZXN1bHRzIHRvIGV4aXN0XG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyBhJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCByZXF1ZXN0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICBjb25zdCBzbmF0Y2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+ID0gPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yUm93cyAudG9yUm93JylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChzbmF0Y2hMaXN0ID09PSBudWxsIHx8IHNuYXRjaExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHNuYXRjaExpc3QgaXMgJHtzbmF0Y2hMaXN0fWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc25hdGNoTGlzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cblxuICAgIGdldCBpc09wZW4oKTogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XG4gICAgfVxuXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHZhbCk7XG4gICAgfVxufVxuXG5jbGFzcyBHb29kcmVhZHNCdXR0b25SZXEgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvblJlcScsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXG4gICAgICAgIGRlc2M6ICdFbmFibGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zIGZvciByZXF1ZXN0cycsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZmlsbFRvcnJlbnQnO1xuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QgZGV0YWlscyddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIC8vIENvbnZlcnQgcm93IHN0cnVjdHVyZSBpbnRvIHNlYXJjaGFibGUgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJlcVJvd3MgPSBVdGlsLnJvd3NUb09iaihkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiA+IGRpdicpKTtcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IHJlcVJvd3NbJ1RpdGxlOiddLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKTtcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1tcbiAgICAgICAgICAgICdBdXRob3Iocyk6J1xuICAgICAgICBdLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKTtcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1snU2VyaWVzOiddXG4gICAgICAgICAgICA/IHJlcVJvd3NbJ1NlcmllczonXS5xdWVyeVNlbGVjdG9yQWxsKCdhJylcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByZXFSb3dzWydSZWxlYXNlIERhdGUnXTtcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xuICAgICAgICB0aGlzLl9zaGFyZS5nb29kcmVhZHNCdXR0b25zKGJvb2tEYXRhLCBhdXRob3JEYXRhLCBzZXJpZXNEYXRhLCB0YXJnZXQpO1xuICAgIH1cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogUHJvY2VzcyAmIHJldHVybiBpbmZvcm1hdGlvbiBmcm9tIHRoZSBzaG91dGJveFxuICovXG5jbGFzcyBQcm9jZXNzU2hvdXRzIHtcbiAgICAvKipcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxuICAgICAqIEBwYXJhbSBuYW1lcyAoT3B0aW9uYWwpIExpc3Qgb2YgdXNlcm5hbWVzL0lEcyB0byBmaWx0ZXIgZm9yXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIChPcHRpb25hbCkgV2hhdCBmaWx0ZXIgdGhlIG5hbWVzIGFyZSBmb3IuIFJlcXVpcmVkIGlmIGBuYW1lc2AgaXMgcHJvdmlkZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHdhdGNoU2hvdXRib3goXG4gICAgICAgIHRhcjogc3RyaW5nLFxuICAgICAgICBuYW1lcz86IHN0cmluZ1tdLFxuICAgICAgICB1c2VydHlwZT86IFNob3V0Ym94VXNlclR5cGVcbiAgICApOiB2b2lkIHtcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKFxuICAgICAgICAgICAgdGFyLFxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzaG91dGJveCB1cGRhdGVzLCBwcm9jZXNzIHRoZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgIG11dExpc3QuZm9yRWFjaCgobXV0UmVjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xuICAgICAgICAgICAgICAgICAgICBtdXRSZWMuYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlOiBOb2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShub2RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYWRkZWQgYnkgTUFNKyBmb3IgZ2lmdCBidXR0b24sIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBpZ25vcmUgaWYgdGhlIG5vZGUgaXMgYSBkYXRlIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL15tcF8vLnRlc3Qobm9kZURhdGEuZ2V0QXR0cmlidXRlKCdpZCcpISkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGF0YS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBsb29raW5nIGZvciBzcGVjaWZpYyB1c2Vycy4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWVzICE9PSB1bmRlZmluZWQgJiYgbmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VydHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdVc2VydHlwZSBtdXN0IGJlIGRlZmluZWQgaWYgZmlsdGVyaW5nIG5hbWVzISdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJRDogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmXj1cIi91L1wiXScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdocmVmJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAvdS8ke25hbWV9YCA9PT0gdXNlcklEIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNhc2VsZXNzU3RyaW5nTWF0Y2gobmFtZSwgdXNlck5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZVNob3V0KG5vZGUsIHVzZXJ0eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IGNoaWxkTGlzdDogdHJ1ZSB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBpbmZvcm1hdGlvbiBmcm9tIHNob3V0c1xuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHNlbGVjdG9yIHN0cmluZ1xuICAgICAqIEBwYXJhbSBnZXQgVGhlIHJlcXVlc3RlZCBpbmZvIChocmVmIG9yIHRleHQpXG4gICAgICogQHJldHVybnMgVGhlIHN0cmluZyB0aGF0IHdhcyBzcGVjaWZpZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGcm9tU2hvdXQoXG4gICAgICAgIHNob3V0OiBOb2RlLFxuICAgICAgICB0YXI6IHN0cmluZyxcbiAgICAgICAgZ2V0OiAnaHJlZicgfCAndGV4dCdcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKTtcblxuICAgICAgICBpZiAoc2hvdXQgIT09IG51bGwgJiYgIW5vZGVEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICB0YXJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoc2hvdXRFbGVtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV4dHJhY3RlZDogc3RyaW5nIHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0ICE9PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLmdldEF0dHJpYnV0ZShnZXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZCA9IHNob3V0RWxlbS50ZXh0Q29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhY3RlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIEF0dHJpYnV0ZSB3YXMgbnVsbCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgRWxlbWVudCB3YXMgbnVsbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgTm9kZSB3YXMgbnVsbCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRoZSBzdHlsZSBvZiBhIHNob3V0IGJhc2VkIG9uIGZpbHRlciBsaXN0c1xuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cbiAgICAgKiBAcGFyYW0gdXNlcnR5cGUgVGhlIHR5cGUgb2YgdXNlcnMgdGhhdCBoYXZlIGJlZW4gZmlsdGVyZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0eWxlU2hvdXQoc2hvdXQ6IE5vZGUsIHVzZXJ0eXBlOiBTaG91dGJveFVzZXJUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNob3V0RWxlbTogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpO1xuICAgICAgICBpZiAodXNlcnR5cGUgPT09ICdwcmlvcml0eScpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVN0eWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgncHJpb3JpdHlTdHlsZV92YWwnKTtcbiAgICAgICAgICAgIGlmIChjdXN0b21TdHlsZSkge1xuICAgICAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gYGhzbGEoJHtjdXN0b21TdHlsZX0pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvdXRFbGVtLnN0eWxlLmJhY2tncm91bmQgPSAnaHNsYSgwLDAlLDUwJSwwLjMpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh1c2VydHlwZSA9PT0gJ211dGUnKSB7XG4gICAgICAgICAgICBzaG91dEVsZW0uY2xhc3NMaXN0LmFkZCgnbXBfbXV0ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgUHJpb3JpdHlVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5VXNlcnMnLFxuICAgICAgICB0YWc6ICdFbXBoYXNpemUgVXNlcnMnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiBzeXN0ZW0sIDI1NDIwLCA3NzYxOCcsXG4gICAgICAgIGRlc2M6XG4gICAgICAgICAgICAnRW1waGFzaXplcyBtZXNzYWdlcyBmcm9tIHRoZSBsaXN0ZWQgdXNlcnMgaW4gdGhlIHNob3V0Ym94LiAoPGVtPlRoaXMgYWNjZXB0cyB1c2VyIElEcyBhbmQgdXNlcm5hbWVzLiBJdCBpcyBub3QgY2FzZSBzZW5zaXRpdmUuPC9lbT4pJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcbiAgICBwcml2YXRlIF9wcmlvcml0eVVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmlvcml0eVVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9wcmlvcml0eVVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEhpZ2hsaWdodGluZyB1c2VycyBpbiB0aGUgc2hvdXRib3guLi5gKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gcHJpb3JpdHkgdXNlcnNcbiAqL1xuY2xhc3MgUHJpb3JpdHlTdHlsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5U3R5bGUnLFxuICAgICAgICB0YWc6ICdFbXBoYXNpcyBTdHlsZScsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMCwgMCUsIDUwJSwgMC4zJyxcbiAgICAgICAgZGVzYzogYENoYW5nZSB0aGUgY29sb3Ivb3BhY2l0eSBvZiB0aGUgaGlnaGxpZ2h0aW5nIHJ1bGUgZm9yIGVtcGhhc2l6ZWQgdXNlcnMnIHBvc3RzLiAoPGVtPlRoaXMgaXMgZm9ybWF0dGVkIGFzIEh1ZSAoMC0zNjApLCBTYXR1cmF0aW9uICgwLTEwMCUpLCBMaWdodG5lc3MgKDAtMTAwJSksIE9wYWNpdHkgKDAtMSk8L2VtPilgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0dGluZyBjdXN0b20gaGlnaGxpZ2h0IGZvciBwcmlvcml0eSB1c2Vycy4uLmApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBkZXNpcmVkIG11dGVkIHVzZXJzXG4gKi9cbmNsYXNzIE11dGVkVXNlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdtdXRlZFVzZXJzJyxcbiAgICAgICAgdGFnOiAnTXV0ZSB1c2VycycsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEyMzQsIGdhcmRlbnNoYWRlJyxcbiAgICAgICAgZGVzYzogYE9ic2N1cmVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3ggdW50aWwgaG92ZXJlZC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XG4gICAgcHJpdmF0ZSBfbXV0ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcbiAgICBwcml2YXRlIF91c2VyVHlwZTogU2hvdXRib3hVc2VyVHlwZSA9ICdtdXRlJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9tdXRlZFVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9tdXRlZFVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE9ic2N1cmluZyBtdXRlZCB1c2Vycy4uLmApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIEdpZnQgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0IFRyaXBsZSBkb3QgbWVudVxuICovXG5jbGFzcyBHaWZ0QnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdnaWZ0QnV0dG9uJyxcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIEdpZnQgYnV0dG9uIGluIFNob3V0Ym94IGRvdC1tZW51YCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSW5pdGlhbGl6ZWQgR2lmdCBCdXR0b24uYCk7XG4gICAgICAgIGNvbnN0IHNiZkRpdiA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JmJykhO1xuICAgICAgICBjb25zdCBzYmZEaXZDaGlsZCA9IHNiZkRpdiEuZmlyc3RDaGlsZDtcblxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbmV2ZXIgc29tZXRoaW5nIGlzIGNsaWNrZWQgaW4gdGhlIHNiZiBkaXZcbiAgICAgICAgc2JmRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIC8vcHVsbCB0aGUgZXZlbnQgdGFyZ2V0IGludG8gYW4gSFRNTCBFbGVtZW50XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIC8vYWRkIHRoZSBUcmlwbGUgRG90IE1lbnUgYXMgYW4gZWxlbWVudFxuICAgICAgICAgICAgY29uc3Qgc2JNZW51RWxlbSA9IHRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKTtcbiAgICAgICAgICAgIC8vZmluZCB0aGUgbWVzc2FnZSBkaXZcbiAgICAgICAgICAgIGNvbnN0IHNiTWVudVBhcmVudCA9IHRhcmdldCEuY2xvc2VzdChgZGl2YCk7XG4gICAgICAgICAgICAvL2dldCB0aGUgZnVsbCB0ZXh0IG9mIHRoZSBtZXNzYWdlIGRpdlxuICAgICAgICAgICAgbGV0IGdpZnRNZXNzYWdlID0gc2JNZW51UGFyZW50IS5pbm5lclRleHQ7XG4gICAgICAgICAgICAvL2Zvcm1hdCBtZXNzYWdlIHdpdGggc3RhbmRhcmQgdGV4dCArIG1lc3NhZ2UgY29udGVudHMgKyBzZXJ2ZXIgdGltZSBvZiB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgZ2lmdE1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBTZW50IG9uIFNob3V0Ym94IG1lc3NhZ2U6IFwiYCArXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKGdpZnRNZXNzYWdlLmluZGV4T2YoJzogJykgKyAyKSArXG4gICAgICAgICAgICAgICAgYFwiIGF0IGAgK1xuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZygwLCA4KTtcbiAgICAgICAgICAgIC8vaWYgdGhlIHRhcmdldCBvZiB0aGUgY2xpY2sgaXMgbm90IHRoZSBUcmlwbGUgRG90IE1lbnUgT1JcbiAgICAgICAgICAgIC8vaWYgbWVudSBpcyBvbmUgb2YgeW91ciBvd24gY29tbWVudHMgKG9ubHkgd29ya3MgZm9yIGZpcnN0IDEwIG1pbnV0ZXMgb2YgY29tbWVudCBiZWluZyBzZW50KVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0YXJnZXQhLmNsb3Nlc3QoJy5zYl9tZW51JykgfHxcbiAgICAgICAgICAgICAgICBzYk1lbnVFbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZWUnKSEgPT09ICcxJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9nZXQgdGhlIE1lbnUgYWZ0ZXIgaXQgcG9wcyB1cFxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIEdpZnQgQnV0dG9uLi4uYCk7XG4gICAgICAgICAgICBjb25zdCBwb3B1cE1lbnU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJyk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCg1KTtcbiAgICAgICAgICAgIH0gd2hpbGUgKCFwb3B1cE1lbnUhLmhhc0NoaWxkTm9kZXMoKSk7XG4gICAgICAgICAgICAvL2dldCB0aGUgdXNlciBkZXRhaWxzIGZyb20gdGhlIHBvcHVwIG1lbnUgZGV0YWlsc1xuICAgICAgICAgICAgY29uc3QgcG9wdXBVc2VyOiBIVE1MRWxlbWVudCA9IFV0aWwubm9kZVRvRWxlbShwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgLy9tYWtlIHVzZXJuYW1lIGVxdWFsIHRoZSBkYXRhLXVpZCwgZm9yY2Ugbm90IG51bGxcbiAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBzdHJpbmcgPSBwb3B1cFVzZXIhLmdldEF0dHJpYnV0ZSgnZGF0YS11aWQnKSE7XG4gICAgICAgICAgICAvL2dldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBnaWZ0cyBzZXQgaW4gcHJlZmVyZW5jZXMgZm9yIHVzZXIgcGFnZVxuICAgICAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XG4gICAgICAgICAgICAvL2lmIHRoZXkgZGlkIG5vdCBzZXQgYSB2YWx1ZSBpbiBwcmVmZXJlbmNlcywgc2V0IHRvIDEwMFxuICAgICAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAwIHx8XG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAwJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgSFRNTCBkb2N1bWVudCB0aGF0IGhvbGRzIHRoZSBidXR0b24gYW5kIHZhbHVlIHRleHRcbiAgICAgICAgICAgIGNvbnN0IGdpZnRCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGdpZnRCdXR0b24uc2V0QXR0cmlidXRlKCdpZCcsICdnaWZ0QnV0dG9uJyk7XG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgYXMgd2VsbCBhcyBhIHRleHQgZWxlbWVudCBmb3IgdmFsdWUgb2YgZ2lmdC4gUG9wdWxhdGUgd2l0aCB2YWx1ZSBmcm9tIHNldHRpbmdzXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLmlubmVySFRNTCA9IGA8YnV0dG9uPkdpZnQ6IDwvYnV0dG9uPjxzcGFuPiZuYnNwOzwvc3Bhbj48aW5wdXQgdHlwZT1cInRleHRcIiBzaXplPVwiM1wiIGlkPVwibXBfZ2lmdFZhbHVlXCIgdGl0bGU9XCJWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDBcIiB2YWx1ZT1cIiR7Z2lmdFZhbHVlU2V0dGluZ31cIj5gO1xuICAgICAgICAgICAgLy9hZGQgZ2lmdCBlbGVtZW50IHdpdGggYnV0dG9uIGFuZCB0ZXh0IHRvIHRoZSBtZW51XG4gICAgICAgICAgICBwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0uYXBwZW5kQ2hpbGQoZ2lmdEJ1dHRvbik7XG4gICAgICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbiBnaWZ0IGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0ZWRBbW91bnQgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRWYWx1ZScpXG4gICAgICAgICAgICAgICAgKSkhLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA9IFV0aWwuZ2V0UmVtYWluaW5nUG9pbnRHaWZ0QWxsb3dhbmNlKFxuICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbGV0IGdpZnRGaW5hbEFtb3VudCA9IHJlcXVlc3RlZEFtb3VudDtcbiAgICAgICAgICAgICAgICBsZXQgYWRqdXN0ZWRGcm9tQW1vdW50OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGtub3duUmVtYWluaW5nQWxsb3dhbmNlID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA8IHJlcXVlc3RlZEFtb3VudFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBnaWZ0RmluYWxBbW91bnQgPSBrbm93blJlbWFpbmluZ0FsbG93YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgYWRqdXN0ZWRGcm9tQW1vdW50ID0gcmVxdWVzdGVkQW1vdW50O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa25vd25SZW1haW5pbmdBbGxvd2FuY2UgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2hvd0dpZnRTdGF0dXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXZDaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBGYWlsZWQ6IEVycm9yOiBNYXhpbXVtIGRhaWx5IHBvaW50cyBhbHJlYWR5IHNlbnQgdG9kYXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xvc2VHaWZ0TWVudShzYmZEaXYpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBhd2FpdCB0aGlzLl9zZW5kUG9pbnRHaWZ0KHVzZXJOYW1lLCBnaWZ0RmluYWxBbW91bnQsIGdpZnRNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIGlmICghanNvbi5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldHJ5QW1vdW50ID0gdGhpcy5fZ2V0UmV0cnlHaWZ0QW1vdW50KFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRGaW5hbEFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtub3duUmVtYWluaW5nQWxsb3dhbmNlXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJ5QW1vdW50ICE9PSBudWxsICYmIHJldHJ5QW1vdW50ICE9PSBnaWZ0RmluYWxBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkanVzdGVkRnJvbUFtb3VudCA9IHJlcXVlc3RlZEFtb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRGaW5hbEFtb3VudCA9IHJldHJ5QW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAganNvbiA9IGF3YWl0IHRoaXMuX3NlbmRQb2ludEdpZnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEZpbmFsQW1vdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGpzb24uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBVdGlsLnJlY29yZFBvaW50R2lmdCh1c2VyTmFtZSwgZ2lmdEZpbmFsQW1vdW50KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc01lc3NhZ2UgPVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRqdXN0ZWRGcm9tQW1vdW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkanVzdGVkRnJvbUFtb3VudCAhPT0gZ2lmdEZpbmFsQW1vdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgUG9pbnRzIEdpZnQgU3VjY2Vzc2Z1bDogVmFsdWU6ICR7Z2lmdEZpbmFsQW1vdW50fSAoYWRqdXN0ZWQgZnJvbSAke2FkanVzdGVkRnJvbUFtb3VudH0pYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYFBvaW50cyBHaWZ0IFN1Y2Nlc3NmdWw6IFZhbHVlOiAke2dpZnRGaW5hbEFtb3VudH1gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaG93R2lmdFN0YXR1cyhzYmZEaXYsIHNiZkRpdkNoaWxkLCBzdWNjZXNzTWVzc2FnZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2hvd0dpZnRTdGF0dXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXZDaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBGYWlsZWQ6IEVycm9yOiAnICsganNvbi5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gdG8gbWFpbiBTQiB3aW5kb3cgYWZ0ZXIgZ2lmdCBpcyBjbGlja2VkIC0gdGhlc2UgYXJlIHR3byBzdGVwcyB0YWtlbiBieSBNQU0gd2hlbiBjbGlja2luZyBvdXQgb2YgTWVudVxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb3NlR2lmdE1lbnUoc2JmRGl2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpIS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XG4gICAgICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcbiAgICAgICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEdpZnQgQnV0dG9uIGFkZGVkIWApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9zZW5kUG9pbnRHaWZ0KFxuICAgICAgICB1c2VyTmFtZTogbnVtYmVyIHwgc3RyaW5nLFxuICAgICAgICBhbW91bnQ6IG51bWJlcixcbiAgICAgICAgZ2lmdE1lc3NhZ2U6IHN0cmluZ1xuICAgICk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2Ftb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICBnaWZ0TWVzc2FnZVxuICAgICAgICApfWA7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRSZXRyeUdpZnRBbW91bnQoXG4gICAgICAgIGVycm9yOiBzdHJpbmcsXG4gICAgICAgIGF0dGVtcHRlZEFtb3VudDogbnVtYmVyLFxuICAgICAgICBrbm93blJlbWFpbmluZ0FsbG93YW5jZTogbnVtYmVyXG4gICAgKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IChlcnJvci5tYXRjaCgvXFxkW1xcZCxdKi9nKSB8fCBbXSlcbiAgICAgICAgICAgIC5tYXAoKHZhbHVlKSA9PiBwYXJzZUludCh2YWx1ZS5yZXBsYWNlKC8sL2csICcnKSkpXG4gICAgICAgICAgICAuZmlsdGVyKCh2YWx1ZSkgPT4gIWlzTmFOKHZhbHVlKSAmJiB2YWx1ZSA+PSA1KTtcbiAgICAgICAgbGV0IHJldHJ5QW1vdW50ID0gY2FuZGlkYXRlc1xuICAgICAgICAgICAgLmZpbHRlcigodmFsdWUpID0+IHZhbHVlIDwgYXR0ZW1wdGVkQW1vdW50KVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVswXTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA+IDAgJiZcbiAgICAgICAgICAgIGtub3duUmVtYWluaW5nQWxsb3dhbmNlIDwgYXR0ZW1wdGVkQW1vdW50ICYmXG4gICAgICAgICAgICAocmV0cnlBbW91bnQgPT09IHVuZGVmaW5lZCB8fCBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA8IHJldHJ5QW1vdW50KVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHJ5QW1vdW50ID0ga25vd25SZW1haW5pbmdBbGxvd2FuY2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0cnlBbW91bnQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiByZXRyeUFtb3VudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zaG93R2lmdFN0YXR1cyhcbiAgICAgICAgc2JmRGl2OiBIVE1MRGl2RWxlbWVudCxcbiAgICAgICAgc2JmRGl2Q2hpbGQ6IENoaWxkTm9kZSB8IG51bGwsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgc3VjY2VzczogYm9vbGVhblxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXNiZkRpdkNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbmV3RGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfZ2lmdFN0YXR1c0VsZW0nKTtcbiAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKTtcbiAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoc3VjY2VzcyA/ICdtcF9zdWNjZXNzJyA6ICdtcF9mYWlsJyk7XG4gICAgICAgIHNiZkRpdkNoaWxkLmFwcGVuZENoaWxkKG5ld0Rpdik7XG4gICAgICAgIHNiZkRpdi5zY3JvbGxUb3AgPSBzYmZEaXYuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2Nsb3NlR2lmdE1lbnUoc2JmRGl2OiBIVE1MRGl2RWxlbWVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGlja2VkUm93ID0gc2JmRGl2LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NiX2NsaWNrZWRfcm93JylbMF07XG4gICAgICAgIGlmIChjbGlja2VkUm93KSB7XG4gICAgICAgICAgICBjbGlja2VkUm93LnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiTWVudU1haW4nKTtcbiAgICAgICAgaWYgKG1lbnUpIHtcbiAgICAgICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdjbGFzcycsICdzYkJvdHRvbSBoaWRlTWUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgZmVhdHVyZSBmb3IgYnVpbGRpbmcgYSBsaWJyYXJ5IG9mIHF1aWNrIHNob3V0IGl0ZW1zIHRoYXQgY2FuIGFjdCBhcyBhIGNvcHkvcGFzdGUgcmVwbGFjZW1lbnQuXG4gKi9cbmNsYXNzIFF1aWNrU2hvdXQgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3F1aWNrU2hvdXQnLFxuICAgICAgICBkZXNjOiBgQ3JlYXRlIGZlYXR1cmUgYmVsb3cgc2hvdXRib3ggdG8gc3RvcmUgcHJlLXNldCBtZXNzYWdlcy5gLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFF1aWNrIFNob3V0IEJ1dHRvbnMuLi5gKTtcbiAgICAgICAgLy9nZXQgdGhlIG1haW4gc2hvdXRib3ggaW5wdXQgZmllbGRcbiAgICAgICAgY29uc3QgcmVwbHlCb3ggPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hib3hfdGV4dCcpO1xuICAgICAgICAvL2VtcHR5IEpTT04gd2FzIGdpdmluZyBtZSBpc3N1ZXMsIHNvIGRlY2lkZWQgdG8ganVzdCBtYWtlIGFuIGludHJvIGZvciB3aGVuIHRoZSBHTSB2YXJpYWJsZSBpcyBlbXB0eVxuICAgICAgICBsZXQganNvbkxpc3QgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgYHsgXCJJbnRyb1wiOlwiV2VsY29tZSB0byBRdWlja1Nob3V0IE1BTStlciEgSGVyZSB5b3UgY2FuIGNyZWF0ZSBwcmVzZXQgU2hvdXQgbWVzc2FnZXMgZm9yIHF1aWNrIHJlc3BvbnNlcyBhbmQga25vd2xlZGdlIHNoYXJpbmcuICdDbGVhcicgY2xlYXJzIHRoZSBlbnRyeSB0byBzdGFydCBzZWxlY3Rpb24gcHJvY2VzcyBvdmVyLiAnU2VsZWN0JyB0YWtlcyB3aGF0ZXZlciBRdWlja1Nob3V0IGlzIGluIHRoZSBUZXh0QXJlYSBhbmQgcHV0cyBpbiB5b3VyIFNob3V0IHJlc3BvbnNlIGFyZWEuICdTYXZlJyB3aWxsIHN0b3JlIHRoZSBTZWxlY3Rpb24gTmFtZSBhbmQgVGV4dCBBcmVhIENvbWJvIGZvciBmdXR1cmUgdXNlIGFzIGEgUXVpY2tTaG91dCwgYW5kIGhhcyBjb2xvciBpbmRpY2F0b3JzLiBHcmVlbiA9IHNhdmVkIGFzLWlzLiBZZWxsb3cgPSBRdWlja1Nob3V0IE5hbWUgZXhpc3RzIGFuZCBpcyBzYXZlZCwgYnV0IGNvbnRlbnQgZG9lcyBub3QgbWF0Y2ggd2hhdCBpcyBzdG9yZWQuIE9yYW5nZSA9IG5vIGVudHJ5IG1hdGNoaW5nIHRoYXQgbmFtZSwgbm90IHNhdmVkLiAnRGVsZXRlJyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGF0IGVudHJ5IGZyb20geW91ciBzdG9yZWQgUXVpY2tTaG91dHMgKGJ1dHRvbiBvbmx5IHNob3dzIHdoZW4gZXhpc3RzIGluIHN0b3JhZ2UpLiBGb3IgbmV3IGVudHJpZXMgaGF2ZSB5b3VyIFF1aWNrU2hvdXQgTmFtZSB0eXBlZCBpbiBCRUZPUkUgeW91IGNyYWZ0IHlvdXIgdGV4dCBvciByaXNrIGl0IGJlaW5nIG92ZXJ3cml0dGVuIGJ5IHNvbWV0aGluZyB0aGF0IGV4aXN0cyBhcyB5b3UgdHlwZSBpdC4gVGhhbmtzIGZvciB1c2luZyBNQU0rIVwiIH1gXG4gICAgICAgICk7XG4gICAgICAgIC8vZ2V0IFNob3V0Ym94IERJVlxuICAgICAgICBjb25zdCBzaG91dEJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcFNob3V0Jyk7XG4gICAgICAgIGNvbnN0IHNob3V0Ym94UGFuZWwgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3V0Ym94Jyk7XG4gICAgICAgIGNvbnN0IHNob3V0Ym94Tm90aWZzID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JOb3RpZnMnKTtcbiAgICAgICAgY29uc3Qgc2hvdXRib3hCb2R5ID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JmJyk7XG4gICAgICAgIGNvbnN0IHNob3V0Ym94VGFicyA9IDxIVE1MRWxlbWVudCB8IG51bGw+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiTWVudVRhYnMnKTtcbiAgICAgICAgY29uc3Qgc2hvdXRib3hGb3JtID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Jmb3JtJyk7XG4gICAgICAgIC8vZ2V0IHRoZSBkZWZhdWx0IGZvb3RlciB3aGVyZSB3ZSB3aWxsIGluc2VydCBvdXIgZmVhdHVyZVxuICAgICAgICBjb25zdCBkZWZhdWx0U2hvdXRGb290ID0gPEhUTUxFbGVtZW50PnNob3V0Qm94IS5xdWVyeVNlbGVjdG9yKCcuYmxvY2tGb290Jyk7XG4gICAgICAgIGNvbnN0IHF1aWNrU2hvdXRGb290SWQgPSAnbXBfYmxvY2tGb290JztcbiAgICAgICAgbGV0IGlzUXVpY2tTaG91dEV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgcXVpY2tTaG91dFJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcXVpY2tTaG91dFJvb3QuaWQgPSAnbXBfcXVpY2tTaG91dFJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGlzRnVsbHNjcmVlblNob3V0Ym94ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFzaG91dGJveFBhbmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2hvdXRib3hQYW5lbC5zdHlsZS5wb3NpdGlvbiA9PT0gJ2ZpeGVkJztcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzeW5jRnVsbHNjcmVlbkJvZHlIZWlnaHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIWlzRnVsbHNjcmVlblNob3V0Ym94KCkgfHxcbiAgICAgICAgICAgICAgICAhc2hvdXRib3hQYW5lbCB8fFxuICAgICAgICAgICAgICAgICFzaG91dGJveEJvZHkgfHxcbiAgICAgICAgICAgICAgICAhc2hvdXRib3hGb3JtIHx8XG4gICAgICAgICAgICAgICAgIXNob3V0Ym94Tm90aWZzIHx8XG4gICAgICAgICAgICAgICAgIXNob3V0Ym94VGFic1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3V0Ym94Qm9keSkge1xuICAgICAgICAgICAgICAgICAgICBzaG91dGJveEJvZHkuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXh0cmFIZWlnaHQgPSBzaG91dGJveEJvZHkub2Zmc2V0SGVpZ2h0IC0gc2hvdXRib3hCb2R5LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxIZWlnaHQgPVxuICAgICAgICAgICAgICAgIHNob3V0Ym94UGFuZWwuY2xpZW50SGVpZ2h0IC1cbiAgICAgICAgICAgICAgICBzaG91dGJveEZvcm0ub2Zmc2V0SGVpZ2h0IC1cbiAgICAgICAgICAgICAgICBzaG91dGJveE5vdGlmcy5vZmZzZXRIZWlnaHQgLVxuICAgICAgICAgICAgICAgIHNob3V0Ym94VGFicy5vZmZzZXRIZWlnaHQgLVxuICAgICAgICAgICAgICAgIGV4dHJhSGVpZ2h0O1xuICAgICAgICAgICAgc2hvdXRib3hCb2R5LnN0eWxlLmhlaWdodCA9IGAke01hdGgubWF4KGZ1bGxIZWlnaHQsIDApfXB4YDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzeW5jUXVpY2tTaG91dEZvb3QgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRGb290ID1cbiAgICAgICAgICAgICAgICBpc0Z1bGxzY3JlZW5TaG91dGJveCgpICYmIHNob3V0Ym94Tm90aWZzID8gc2hvdXRib3hOb3RpZnMgOiBkZWZhdWx0U2hvdXRGb290O1xuXG4gICAgICAgICAgICBpZiAocXVpY2tTaG91dFJvb3QucGFyZW50RWxlbWVudCAhPT0gdGFyZ2V0Rm9vdCkge1xuICAgICAgICAgICAgICAgIHRhcmdldEZvb3QuYXBwZW5kQ2hpbGQocXVpY2tTaG91dFJvb3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdFNob3V0Rm9vdC5pZCA9IHRhcmdldEZvb3QgPT09IGRlZmF1bHRTaG91dEZvb3QgPyBxdWlja1Nob3V0Rm9vdElkIDogJyc7XG4gICAgICAgICAgICBkZWZhdWx0U2hvdXRGb290LnN0eWxlLmhlaWdodCA9XG4gICAgICAgICAgICAgICAgdGFyZ2V0Rm9vdCA9PT0gZGVmYXVsdFNob3V0Rm9vdCA/IChpc1F1aWNrU2hvdXRFeHBhbmRlZCA/ICcxMWVtJyA6ICcyLjVlbScpIDogJyc7XG4gICAgICAgICAgICBzeW5jRnVsbHNjcmVlbkJvZHlIZWlnaHQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzZXRRdWlja1Nob3V0RXhwYW5kZWQgPSAoZXhwYW5kZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgIGlzUXVpY2tTaG91dEV4cGFuZGVkID0gZXhwYW5kZWQ7XG4gICAgICAgICAgICBzeW5jUXVpY2tTaG91dEZvb3QoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoc2hvdXRib3hQYW5lbCkge1xuICAgICAgICAgICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN5bmNRdWlja1Nob3V0Rm9vdCgpO1xuICAgICAgICAgICAgfSkub2JzZXJ2ZShzaG91dGJveFBhbmVsLCB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJywgJ3N0eWxlJ10sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vY3JlYXRlIGEgbmV3IGRpdmUgdG8gaG9sZCBvdXIgY29tYm9Cb3ggYW5kIGJ1dHRvbnMgYW5kIHNldCB0aGUgc3R5bGUgZm9yIGZvcm1hdHRpbmdcbiAgICAgICAgY29uc3QgY29tYm9Cb3hEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luQm90dG9tID0gJy41ZW0nO1xuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5Ub3AgPSAnLjVlbSc7XG4gICAgICAgIC8vY3JlYXRlIHRoZSBsYWJlbCB0ZXh0IGVsZW1lbnQgYW5kIGFkZCB0aGUgdGV4dCBhbmQgYXR0cmlidXRlcyBmb3IgSURcbiAgICAgICAgY29uc3QgY29tYm9Cb3hMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgIGNvbWJvQm94TGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAncXVpY2tTaG91dERhdGEnKTtcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5pbm5lclRleHQgPSAnQ2hvb3NlIGEgUXVpY2tTaG91dCc7XG4gICAgICAgIGNvbWJvQm94TGFiZWwuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveExhYmVsJyk7XG4gICAgICAgIC8vY3JlYXRlIHRoZSBpbnB1dCBmaWVsZCB0byBsaW5rIHRvIGRhdGFsaXN0IGFuZCBmb3JtYXQgc3R5bGVcbiAgICAgICAgY29uc3QgY29tYm9Cb3hJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGNvbWJvQm94SW5wdXQuc3R5bGUubWFyZ2luTGVmdCA9ICcuNWVtJztcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2xpc3QnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XG4gICAgICAgIGNvbWJvQm94SW5wdXQuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveElucHV0Jyk7XG4gICAgICAgIC8vY3JlYXRlIGEgZGF0YWxpc3QgdG8gc3RvcmUgb3VyIHF1aWNrc2hvdXRzXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGFsaXN0Jyk7XG4gICAgICAgIGNvbWJvQm94TGlzdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94TGlzdCcpO1xuICAgICAgICAvL2lmIHRoZSBHTSB2YXJpYWJsZSBleGlzdHNcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9xdWlja1Nob3V0JykpIHtcbiAgICAgICAgICAgIC8vb3ZlcndyaXRlIGpzb25MaXN0IHZhcmlhYmxlIHdpdGggcGFyc2VkIGRhdGFcbiAgICAgICAgICAgIGpzb25MaXN0ID0gSlNPTi5wYXJzZShHTV9nZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcpKTtcbiAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGl0ZW1cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBPcHRpb24gZWxlbWVudCBhbmQgYWRkIG91ciBkYXRhIGZvciBkaXNwbGF5IHRvIHVzZXJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xuICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vaWYgbm8gR00gdmFyaWFibGVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY3JlYXRlIHZhcmlhYmxlIHdpdGggb3V0IEludHJvIGRhdGFcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcbiAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGl0ZW1cbiAgICAgICAgICAgIC8vIFRPRE86IHByb2JhYmx5IGNhbiBnZXQgcmlkIG9mIHRoZSBmb3JFYWNoIGFuZCBqdXN0IGRvIHNpbmdsZSBleGVjdXRpb24gc2luY2Ugd2Uga25vdyB0aGlzIGlzIEludHJvIG9ubHlcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xuICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vYXBwZW5kIHRoZSBhYm92ZSBlbGVtZW50cyB0byBvdXIgRElWIGZvciB0aGUgY29tYm8gYm94XG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGFiZWwpO1xuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveElucHV0KTtcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hMaXN0KTtcbiAgICAgICAgLy9jcmVhdGUgdGhlIGNsZWFyIGJ1dHRvbiBhbmQgYWRkIHN0eWxlXG4gICAgICAgIGNvbnN0IGNsZWFyQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNsZWFyQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcbiAgICAgICAgY2xlYXJCdXR0b24uaW5uZXJIVE1MID0gJ0NsZWFyJztcbiAgICAgICAgLy9jcmVhdGUgZGVsZXRlIGJ1dHRvbiwgYWRkIHN0eWxlLCBhbmQgdGhlbiBoaWRlIGl0IGZvciBsYXRlciB1c2VcbiAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzZlbSc7XG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1JlZCc7XG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5pbm5lckhUTUwgPSAnREVMRVRFJztcbiAgICAgICAgLy9jcmVhdGUgc2VsZWN0IGJ1dHRvbiBhbmQgc3R5bGUgaXRcbiAgICAgICAgY29uc3Qgc2VsZWN0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHNlbGVjdEJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XG4gICAgICAgIHNlbGVjdEJ1dHRvbi5pbm5lckhUTUwgPSAnXFx1MjE5MSBTZWxlY3QnO1xuICAgICAgICAvL2NyZWF0ZSBzYXZlIGJ1dHRvbiBhbmQgc3R5bGUgaXRcbiAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcbiAgICAgICAgc2F2ZUJ1dHRvbi5pbm5lckhUTUwgPSAnU2F2ZSc7XG4gICAgICAgIC8vYWRkIGFsbCA0IGJ1dHRvbnMgdG8gdGhlIGNvbWJvQm94IERJVlxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjbGVhckJ1dHRvbik7XG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNlbGVjdEJ1dHRvbik7XG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNhdmVCdXR0b24pO1xuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChkZWxldGVCdXR0b24pO1xuICAgICAgICAvL2NyZWF0ZSBvdXIgdGV4dCBhcmVhIGFuZCBzdHlsZSBpdCwgdGhlbiBoaWRlIGl0XG4gICAgICAgIGNvbnN0IHF1aWNrU2hvdXRUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuaGVpZ2h0ID0gJzUwJSc7XG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLm1hcmdpbiA9ICcxZW0nO1xuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS53aWR0aCA9ICc5NyUnO1xuICAgICAgICBxdWlja1Nob3V0VGV4dC5pZCA9ICdtcF9xdWlja1Nob3V0VGV4dCc7XG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAgICAgLy9leGVjdXRlcyB3aGVuIGNsaWNraW5nIHNlbGVjdCBidXR0b25cbiAgICAgICAgc2VsZWN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgc29tZXRoaW5nIGluc2lkZSBvZiB0aGUgcXVpY2tzaG91dCBhcmVhXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vcHV0IHRoZSB0ZXh0IGluIHRoZSBtYWluIHNpdGUgcmVwbHkgZmllbGQgYW5kIGZvY3VzIG9uIGl0XG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gcXVpY2tTaG91dFRleHQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgLy9jcmVhdGUgYSBxdWlja1Nob3V0IGRlbGV0ZSBidXR0b25cbiAgICAgICAgZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBub3QgdGhlIGxhc3QgcXVpY2tTaG91dFxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhqc29uTGlzdCkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB0aGUgZW50cnkgZnJvbSB0aGUgSlNPTiBhbmQgdXBkYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldO1xuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgdGhlIG9wdGlvbnMgZnJvbSBkYXRhbGlzdCB0byByZXNldCB3aXRoIG5ld2x5IGNyZWF0ZWQganNvbkxpc3RcbiAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGl0ZW0gaW4gbmV3IGpzb25MaXN0XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbmV3IG9wdGlvbiBlbGVtZW50IHRvIGFkZCB0byBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGN1cnJlbnQga2V5IHZhbHVlIHRvIHRoZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIGVsZW1lbnQgdG8gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGpzb25saXN0XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgaXRlbSBmcm9tIGpzb25MaXN0XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBqc29uTGlzdFtjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoL+CyoC9nLCAn4LKgJyldO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBlbnRpcmUgdmFyaWFibGUgc28gaXRzIG5vdCBlbXB0eSBHTSB2YXJpYWJsZVxuICAgICAgICAgICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfcXVpY2tTaG91dCcpO1xuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiBmb3IgbmV3IHVuc2F2ZWQgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgbm90IGEgc2F2ZWQgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY3JlYXRlIGlucHV0IGV2ZW50IG9uIGlucHV0IHRvIGZvcmNlIHNvbWUgdXBkYXRlcyBhbmQgZGlzcGF0Y2ggaXRcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgLy9jcmVhdGUgZXZlbnQgb24gc2F2ZSBidXR0b24gdG8gc2F2ZSBxdWlja3Nob3V0XG4gICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBkYXRhIGluIHRoZSBrZXkgYW5kIHZhbHVlIEdVSSBmaWVsZHMsIHByb2NlZWRcbiAgICAgICAgICAgICAgICBpZiAocXVpY2tTaG91dFRleHQudmFsdWUgJiYgY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvL3dhcyBoYXZpbmcgaXNzdWUgd2l0aCBldmFsIHByb2Nlc3NpbmcgdGhlIC5yZXBsYWNlIGRhdGEgc28gbWFkZSBhIHZhcmlhYmxlIHRvIGludGFrZSBpdFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlZFRleHQgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xuICAgICAgICAgICAgICAgICAgICAvL2Z1biB3YXkgdG8gZHluYW1pY2FsbHkgY3JlYXRlIHN0YXRlbWVudHMgLSB0aGlzIHRha2VzIHdoYXRldmVyIGlzIGluIGxpc3QgZmllbGQgdG8gY3JlYXRlIGEga2V5IHdpdGggdGhhdCB0ZXh0IGFuZCB0aGUgdmFsdWUgZnJvbSB0aGUgdGV4dGFyZWFcbiAgICAgICAgICAgICAgICAgICAgZXZhbChcbiAgICAgICAgICAgICAgICAgICAgICAgIGBqc29uTGlzdC5gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlZFRleHQgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGA9IFwiYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHF1aWNrU2hvdXRUZXh0LnZhbHVlKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYFwiO2BcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgLy9vdmVyd3JpdGUgb3IgY3JlYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uTGlzdFxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gbm93IHRoYXQgaXRzIHNhdmVkIGFzLWlzXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL3Nob3cgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgYSBzYXZlZCBlbnRyeVxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBleGlzdGluZyBkYXRhbGlzdCBlbGVtZW50cyB0byByZWJ1aWxkIHdpdGggbmV3IGpzb25saXN0XG4gICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaW4gdGhlIGpzb25saXN0XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBvcHRpb24gZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIGtleSBuYW1lIHRvIHRoZSBvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiB0aGlzIG1heSBvciBtYXkgbm90IGJlIG5lY2Vzc2FyeSwgYnV0IHdhcyBoYXZpbmcgaXNzdWVzIHdpdGggdGhlIHVuaXF1ZSBzeW1ib2wgc3RpbGwgcmFuZG9tbHkgc2hvd2luZyB1cCBhZnRlciBzYXZlc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBjb21ib0JveE9wdGlvbi52YWx1ZS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRvIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjb21ib0JveE9wdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIC8vYWRkIGV2ZW50IGZvciBjbGVhciBidXR0b24gdG8gcmVzZXQgdGhlIGRhdGFsaXN0XG4gICAgICAgIGNsZWFyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vY2xlYXIgdGhlIGlucHV0IGZpZWxkIGFuZCB0ZXh0YXJlYSBmaWVsZFxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIC8vY3JlYXRlIGlucHV0IGV2ZW50IG9uIGlucHV0IHRvIGZvcmNlIHNvbWUgdXBkYXRlcyBhbmQgZGlzcGF0Y2ggaXRcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgLy9OZXh0IHR3byBpbnB1dCBmdW5jdGlvbnMgYXJlIG1lYXQgYW5kIHBvdGF0b2VzIG9mIHRoZSBsb2dpYyBmb3IgdXNlciBmdW5jdGlvbmFsaXR5XG5cbiAgICAgICAgLy93aGVuZXZlciBzb21ldGhpbmcgaXMgdHlwZWQgb3IgY2hhbmdlZCB3aGl0aGluIHRoZSBpbnB1dCBmaWVsZFxuICAgICAgICBjb21ib0JveElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnaW5wdXQnLFxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vaWYgaW5wdXQgaXMgYmxhbmtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgdGV4dGFyZWEgaXMgYWxzbyBibGFuayBtaW5pbWl6ZSByZWFsIGVzdGF0ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIHRleHQgYXJlYVxuICAgICAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hyaW5rIHRoZSBmb290ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFF1aWNrU2hvdXRFeHBhbmRlZChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBzb21ldGhpbmcgaXMgc3RpbGwgaW4gdGhlIHRleHRhcmVhIHdlIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCB1bnNhdmVkIGFuZCB1bm5hbWVkIGRhdGEgaXMgdGhlcmVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3R5bGUgZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWQgaXMgb3JnYW5nZSBzYXZlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vZWl0aGVyIHdheSwgaGlkZSB0aGUgZGVsZXRlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaGFzIGFueSB0ZXh0IGluIGl0XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsID0gY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKTtcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IHRoZSB0ZXh0IGFyZWEgZm9yIGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9leHBhbmQgdGhlIGZvb3RlciB0byBhY2NvbW9kYXRlIGFsbCBmZWF0dXJlIGFzcGVjdHNcbiAgICAgICAgICAgICAgICAgICAgc2V0UXVpY2tTaG91dEV4cGFuZGVkKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHdoYXQgaXMgaW4gdGhlIGlucHV0IGZpZWxkIGlzIGEgc2F2ZWQgZW50cnkga2V5XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uTGlzdFtpbnB1dFZhbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBjYW4gYmUgYSBzdWNreSBsaW5lIG9mIGNvZGUgYmVjYXVzZSBpdCBjYW4gd2lwZSBvdXQgdW5zYXZlZCBkYXRhLCBidXQgaSBjYW5ub3QgdGhpbmsgb2YgYmV0dGVyIHdheVxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXBsYWNlIHRoZSB0ZXh0IGFyZWEgY29udGVudHMgd2l0aCB3aGF0IHRoZSB2YWx1ZSBpcyBpbiB0aGUgbWF0Y2hlZCBwYWlyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWlja1Nob3V0VGV4dC52YWx1ZSA9IGpzb25MaXN0W0pTT04ucGFyc2UoaW5wdXRWYWwpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGlzIG5vdyBleGFjdCBtYXRjaCB0byBzYXZlZCBlbnRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiB0byBzaG93IGl0cyBhIHNhdmVkIGNvbWJvXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgbm90IGEgcmVnaXN0ZXJlZCBrZXkgbmFtZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBiZSBhbiB1bnNhdmVkIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBjYW5ub3QgYmUgc2F2ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgLy93aGVuZXZlciBzb21ldGhpbmcgaXMgdHlwZWQgb3IgZGVsZXRlZCBvdXQgb2YgdGV4dGFyZWFcbiAgICAgICAgcXVpY2tTaG91dFRleHQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdpbnB1dCcsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRWYWwgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xuXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaXMgYmxhbmtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9pZiBpbnB1dCBmaWVsZCBoYXMgdGV4dCBpbiBpdFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBqc29uTGlzdFtpbnB1dFZhbF0gJiZcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgIT09IGRlY29kZVVSSUNvbXBvbmVudChqc29uTGlzdFtpbnB1dFZhbF0pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBhcyB5ZWxsb3cgZm9yIGVkaXR0ZWRcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnWWVsbG93JztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBhIG1hdGNoIGFuZCB0aGUgZGF0YSBpcyBhIG1hdGNoIHRoZW4gd2UgaGF2ZSBhIDEwMCUgc2F2ZWQgZW50cnkgYW5kIGNhbiBwdXQgZXZlcnl0aGluZyBiYWNrIHRvIHNhdmVkXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbaW5wdXRWYWxdICYmXG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID09PSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gZm9yIHNhdmVkXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBrZXkgaXMgbm90IGZvdW5kIGluIHRoZSBzYXZlZCBsaXN0LCBvcmFuZ2UgZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFqc29uTGlzdFtpbnB1dFZhbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgICAgICAvL2FkZCB0aGUgY29tYm9ib3ggYW5kIHRleHQgYXJlYSBlbGVtZW50cyB0byB0aGUgZm9vdGVyXG4gICAgICAgIHF1aWNrU2hvdXRSb290LmFwcGVuZENoaWxkKGNvbWJvQm94RGl2KTtcbiAgICAgICAgcXVpY2tTaG91dFJvb3QuYXBwZW5kQ2hpbGQocXVpY2tTaG91dFRleHQpO1xuICAgICAgICBzeW5jUXVpY2tTaG91dEZvb3QoKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGRzIGEgc2hvdXRib3ggcHJldmlldyB0aGF0IHVzZXMgdGhlIHNpdGUncyBvd24gcHJldmlldyBlbmRwb2ludC5cbiAqL1xuY2xhc3MgU2hvdXRQcmV2aWV3IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdzaG91dFByZXZpZXcnLFxuICAgICAgICBkZXNjOiBgQWRkcyBhIFByZXZpZXcgYnV0dG9uIGZvciBzaG91dGJveCBtZXNzYWdlcy5gLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NiZm9ybSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgU2hvdXRib3ggUHJldmlldy4uLmApO1xuXG4gICAgICAgIGNvbnN0IHNob3V0Rm9ybSA9IDxIVE1MRWxlbWVudCB8IG51bGw+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiZm9ybScpO1xuICAgICAgICBjb25zdCBzaG91dElucHV0ID0gPEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsPmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGJveF90ZXh0Jyk7XG4gICAgICAgIGNvbnN0IHNob3V0Tm90aWZzID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JOb3RpZnMnKTtcbiAgICAgICAgY29uc3Qgc2hvdXRCb3ggPSA8SFRNTEVsZW1lbnQgfCBudWxsPmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaG91dGJveCcpO1xuICAgICAgICBjb25zdCBzaG91dEJvZHkgPSA8SFRNTEVsZW1lbnQgfCBudWxsPmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYmYnKTtcbiAgICAgICAgY29uc3Qgc2hvdXRUYWJzID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JNZW51VGFicycpO1xuICAgICAgICBjb25zdCBwcmV2aWV3QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbnN0IHByZXZpZXdSb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnN0IHByZXZpZXdCb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGxldCBpc0xvYWRpbmdQcmV2aWV3ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFzaG91dEZvcm0gfHwgIXNob3V0SW5wdXQgfHwgIXNob3V0Tm90aWZzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzeW5jRnVsbHNjcmVlbkJvZHlIZWlnaHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXNob3V0Qm94IHx8XG4gICAgICAgICAgICAgICAgIXNob3V0Qm9keSB8fFxuICAgICAgICAgICAgICAgICFzaG91dEZvcm0gfHxcbiAgICAgICAgICAgICAgICAhc2hvdXROb3RpZnMgfHxcbiAgICAgICAgICAgICAgICAhc2hvdXRUYWJzIHx8XG4gICAgICAgICAgICAgICAgc2hvdXRCb3guc3R5bGUucG9zaXRpb24gIT09ICdmaXhlZCdcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGlmIChzaG91dEJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRCb2R5LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4dHJhSGVpZ2h0ID0gc2hvdXRCb2R5Lm9mZnNldEhlaWdodCAtIHNob3V0Qm9keS5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCBmdWxsSGVpZ2h0ID1cbiAgICAgICAgICAgICAgICBzaG91dEJveC5jbGllbnRIZWlnaHQgLVxuICAgICAgICAgICAgICAgIHNob3V0Rm9ybS5vZmZzZXRIZWlnaHQgLVxuICAgICAgICAgICAgICAgIHNob3V0Tm90aWZzLm9mZnNldEhlaWdodCAtXG4gICAgICAgICAgICAgICAgKHByZXZpZXdSb290LnN0eWxlLmRpc3BsYXkgIT09ICdub25lJyA/IHByZXZpZXdSb290Lm9mZnNldEhlaWdodCA6IDApIC1cbiAgICAgICAgICAgICAgICBzaG91dFRhYnMub2Zmc2V0SGVpZ2h0IC1cbiAgICAgICAgICAgICAgICBleHRyYUhlaWdodDtcbiAgICAgICAgICAgIHNob3V0Qm9keS5zdHlsZS5oZWlnaHQgPSBgJHtNYXRoLm1heChmdWxsSGVpZ2h0LCAwKX1weGA7XG4gICAgICAgIH07XG5cbiAgICAgICAgcHJldmlld0J1dHRvbi5pZCA9ICdtcF9zaG91dFByZXZpZXdCdG4nO1xuICAgICAgICBwcmV2aWV3QnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgcHJldmlld0J1dHRvbi50ZXh0Q29udGVudCA9ICdQcmV2aWV3JztcbiAgICAgICAgcHJldmlld0J1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzVweCc7XG5cbiAgICAgICAgcHJldmlld1Jvb3QuaWQgPSAnbXBfc2hvdXRQcmV2aWV3JztcbiAgICAgICAgcHJldmlld1Jvb3QuY2xhc3NOYW1lID0gJ21wX3Nob3V0UHJldmlldyc7XG4gICAgICAgIHByZXZpZXdSb290LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIHByZXZpZXdSb290LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXBfc2hvdXRQcmV2aWV3SGVhZGVyXCI+UHJldmlldzwvZGl2PmA7XG5cbiAgICAgICAgcHJldmlld0JvZHkuY2xhc3NOYW1lID0gJ21wX3Nob3V0UHJldmlld0JvZHknO1xuICAgICAgICBwcmV2aWV3Um9vdC5hcHBlbmRDaGlsZChwcmV2aWV3Qm9keSk7XG5cbiAgICAgICAgY29uc3Qgc2V0UHJldmlld1N0YXRlID0gKG1lc3NhZ2U6IHN0cmluZywgc3RhdGVDbGFzcz86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcHJldmlld0JvZHkuY2xhc3NOYW1lID0gJ21wX3Nob3V0UHJldmlld0JvZHknO1xuICAgICAgICAgICAgaWYgKHN0YXRlQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBwcmV2aWV3Qm9keS5jbGFzc0xpc3QuYWRkKHN0YXRlQ2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldmlld0JvZHkuaW5uZXJIVE1MID0gbWVzc2FnZTtcbiAgICAgICAgICAgIHByZXZpZXdSb290LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIHN5bmNGdWxsc2NyZWVuQm9keUhlaWdodCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHByZXZpZXdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aWV3VGV4dCA9IHNob3V0SW5wdXQudmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFwcmV2aWV3VGV4dCB8fCBpc0xvYWRpbmdQcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpc0xvYWRpbmdQcmV2aWV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIHByZXZpZXdCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2V0UHJldmlld1N0YXRlKCdMb2FkaW5nIHByZXZpZXcuLi4nLCAnbXBfc2hvdXRQcmV2aWV3X2xvYWRpbmcnKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aWV3UmVzcCA9IGF3YWl0IGZldGNoKCcvanNvblBvc3RUZXN0LnBocCcsIHtcbiAgICAgICAgICAgICAgICAgICAgYm9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVG9UZXN0OiBzaG91dElucHV0LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9KS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpZXdKc29uID0gYXdhaXQgcHJldmlld1Jlc3AuanNvbigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpZXdKc29uLkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFByZXZpZXdTdGF0ZShwcmV2aWV3SnNvbi5FcnJvciwgJ21wX3Nob3V0UHJldmlld19lcnJvcicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFByZXZpZXdTdGF0ZShwcmV2aWV3SnNvbi5tZXNzYWdlIHx8ICcnLCAnbXBfc2hvdXRQcmV2aWV3X3JlbmRlcmVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgICAgICAgc2V0UHJldmlld1N0YXRlKCdQcmV2aWV3IGZhaWxlZCB0byBsb2FkLicsICdtcF9zaG91dFByZXZpZXdfZXJyb3InKTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaXNMb2FkaW5nUHJldmlldyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHByZXZpZXdCdXR0b24uZGlzYWJsZWQgPSAhc2hvdXRJbnB1dC52YWx1ZS50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNob3V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcmV2aWV3QnV0dG9uLmRpc2FibGVkID0gIXNob3V0SW5wdXQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAocHJldmlld1Jvb3Quc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgcHJldmlld0JvZHkuY2xhc3NOYW1lID0gJ21wX3Nob3V0UHJldmlld0JvZHkgbXBfc2hvdXRQcmV2aWV3X3N0YWxlJztcbiAgICAgICAgICAgICAgICBwcmV2aWV3Qm9keS50ZXh0Q29udGVudCA9ICdQcmV2aWV3IGlzIG91dCBvZiBkYXRlLiBDbGljayBQcmV2aWV3IGFnYWluLic7XG4gICAgICAgICAgICAgICAgc3luY0Z1bGxzY3JlZW5Cb2R5SGVpZ2h0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByZXZpZXdCdXR0b24uZGlzYWJsZWQgPSAhc2hvdXRJbnB1dC52YWx1ZS50cmltKCk7XG5cbiAgICAgICAgc2hvdXRGb3JtLmFwcGVuZENoaWxkKHByZXZpZXdCdXR0b24pO1xuICAgICAgICBzaG91dE5vdGlmcy5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgcHJldmlld1Jvb3QpO1xuXG4gICAgICAgIGlmIChzaG91dEJveCkge1xuICAgICAgICAgICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN5bmNGdWxsc2NyZWVuQm9keUhlaWdodCgpO1xuICAgICAgICAgICAgfSkub2JzZXJ2ZShzaG91dEJveCwge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZSddLFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIExvYWRzIHRoZSBtb3N0IHJlY2VudCBlZGl0YWJsZSBzaG91dCBpbnRvIHRoZSBzaXRlJ3MgZWRpdCBVSS5cbiAqL1xuY2xhc3MgUXVpY2tFZGl0U2hvdXQgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3F1aWNrRWRpdFNob3V0JyxcbiAgICAgICAgZGVzYzogYFNob3dzIGEgaGludCBmb3IgQ3RybCtVcCBpbiB0aGUgc2hvdXRib3ggaW5wdXQgdG8gZWRpdCB5b3VyIG1vc3QgcmVjZW50IHNob3V0LmAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc2hib3hfdGV4dCc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgcXVpY2sgc2hvdXQgZWRpdCBzaG9ydGN1dC4uLmApO1xuXG4gICAgICAgIGNvbnN0IHNob3V0SW5wdXQgPSA8SFRNTElucHV0RWxlbWVudCB8IG51bGw+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYm94X3RleHQnKTtcbiAgICAgICAgY29uc3Qgc2hvdXRGb3JtID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Jmb3JtJyk7XG4gICAgICAgIGlmICghc2hvdXRJbnB1dCB8fCAhc2hvdXRGb3JtKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZXRMYXRlc3RFZGl0YWJsZU1lbnUgPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGF0ZXN0TWVudTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBsYXRlc3RJZCA9IDA7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zYmYgLnNiX21lbnUnKS5mb3JFYWNoKChtZW51KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKE51bWJlcihtZW51LmdldEF0dHJpYnV0ZSgnZGF0YS1lZScpIHx8ICcwJykgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hvdXRSb3cgPSBtZW51LmNsb3Nlc3QoJ2RpdltpZF49XCJzYmlkXCJdJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkSWQgPSBOdW1iZXIoc2hvdXRSb3c/LmlkLnJlcGxhY2UoJ3NiaWQnLCAnJykpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc05hTihwYXJzZWRJZCkgJiYgcGFyc2VkSWQgPiBsYXRlc3RJZCkge1xuICAgICAgICAgICAgICAgICAgICBsYXRlc3RJZCA9IHBhcnNlZElkO1xuICAgICAgICAgICAgICAgICAgICBsYXRlc3RNZW51ID0gbWVudSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGxhdGVzdE1lbnU7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgb3BlbkxhdGVzdEVkaXRhYmxlU2hvdXQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZ2V0TGF0ZXN0RWRpdGFibGVNZW51KCkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgc2NyaXB0LnRleHRDb250ZW50ID0gYChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhdGVzdE1lbnUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHZhciBsYXRlc3RJZCA9IDA7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNiZiAuc2JfbWVudScpLmZvckVhY2goZnVuY3Rpb24gKG1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE51bWJlcihtZW51LmdldEF0dHJpYnV0ZSgnZGF0YS1lZScpIHx8ICcwJykgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaG91dFJvdyA9IG1lbnUuY2xvc2VzdCgnZGl2W2lkXj1cInNiaWRcIl0nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZElkID0gTnVtYmVyKChzaG91dFJvdyAmJiBzaG91dFJvdy5pZCB8fCAnJykucmVwbGFjZSgnc2JpZCcsICcnKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4ocGFyc2VkSWQpICYmIHBhcnNlZElkID4gbGF0ZXN0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdGVzdElkID0gcGFyc2VkSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXRlc3RNZW51ID0gbWVudTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghbGF0ZXN0TWVudSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxhdGVzdE1lbnUuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlZGl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiRWRpdCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWRpdEJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0QnV0dG9uLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH0pKCk7YDtcbiAgICAgICAgICAgIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIHNjcmlwdC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHF1aWNrRWRpdEhpbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHF1aWNrRWRpdEhpbnQuaWQgPSAnbXBfcXVpY2tFZGl0U2hvdXRIaW50JztcbiAgICAgICAgcXVpY2tFZGl0SGludC50ZXh0Q29udGVudCA9ICdQcmVzcyBDdHJsK1VwIHRvIGVkaXQgeW91ciBsYXN0IHNob3V0JztcbiAgICAgICAgcXVpY2tFZGl0SGludC5zdHlsZS5tYXJnaW5MZWZ0ID0gJzVweCc7XG4gICAgICAgIHF1aWNrRWRpdEhpbnQuc3R5bGUub3BhY2l0eSA9IGdldExhdGVzdEVkaXRhYmxlTWVudSgpID09PSBudWxsID8gJzAuNicgOiAnMSc7XG4gICAgICAgIHNob3V0Rm9ybS5hcHBlbmRDaGlsZChxdWlja0VkaXRIaW50KTtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2tleWRvd24nLFxuICAgICAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHNob3V0SW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaXNVcEtleSA9XG4gICAgICAgICAgICAgICAgZXZlbnQua2V5ID09PSAnQXJyb3dVcCcgfHxcbiAgICAgICAgICAgICAgICBldmVudC5rZXkgPT09ICdVcCcgfHxcbiAgICAgICAgICAgICAgICBldmVudC5jb2RlID09PSAnQXJyb3dVcCcgfHxcbiAgICAgICAgICAgICAgICBldmVudC5rZXlDb2RlID09PSAzODtcblxuICAgICAgICAgICAgICAgIGlmICghZXZlbnQuY3RybEtleSB8fCBldmVudC5hbHRLZXkgfHwgZXZlbnQubWV0YUtleSB8fCAhaXNVcEtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGdldExhdGVzdEVkaXRhYmxlTWVudSgpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIG9wZW5MYXRlc3RFZGl0YWJsZVNob3V0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XG5cbi8qKlxuICogKiBBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy5cbiAqL1xuY2xhc3MgVG9yR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAndG9yR2lmdERlZmF1bHQnLFxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiA1MDAwLCBtYXgnLFxuICAgICAgICBkZXNjOlxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RoYW5rc0FyZWEgaW5wdXRbbmFtZT1wb2ludHNdJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIG5ldyBTaGFyZWQoKVxuICAgICAgICAgICAgLmZpbGxHaWZ0Qm94KHRoaXMuX3RhciwgdGhpcy5fc2V0dGluZ3MudGl0bGUpXG4gICAgICAgICAgICAudGhlbigocG9pbnRzKSA9PlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICogQWRkcyB2YXJpb3VzIGxpbmtzIHRvIEdvb2RyZWFkc1xuICovXG5jbGFzcyBHb29kcmVhZHNCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdnb29kcmVhZHNCdXR0b24nLFxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmZWF0dXJlIHNob3VsZCBvbmx5IHJ1biBvbiBib29rIGNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICBjb25zdCBjYXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8gW2NsYXNzXj1jYXRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgR29vZHJlYWRzIGJ1dHRvbnMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSdcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XG4gICAgICAgIGNvbnN0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gQXVkaWJsZVxuICovXG5jbGFzcyBBdWRpYmxlQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnYXVkaWJsZUJ1dHRvbicsXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTS10by1BdWRpYmxlIGJ1dHRvbnMnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmZWF0dXJlIHNob3VsZCBvbmx5IHJ1biBvbiBib29rIGNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICBjb25zdCBjYXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8gW2NsYXNzXj1jYXRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgQXVkaWJsZSBidXR0b25zJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnKTtcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNTZXJpZXMgYScpO1xuXG4gICAgICAgIGxldCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcblxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3NnUm93JykpIHtcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cnKTtcbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKSkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xuICAgICAgICB0aGlzLl9zaGFyZS5hdWRpYmxlQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBTdG9yeUdyYXBoXG4gKi9cbmNsYXNzIFN0b3J5R3JhcGhCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdzdG9yeUdyYXBoQnV0dG9uJyxcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLVN0b3J5R3JhcGggYnV0dG9ucycsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbyBbY2xhc3NePWNhdF0nKTtcbiAgICAgICAgICAgICAgICBpZiAoY2F0ICYmIENoZWNrLmlzQm9va0NhdChwYXJzZUludChjYXQuY2xhc3NOYW1lLnN1YnN0cmluZygzKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBOb3QgYSBib29rIGNhdGVnb3J5OyBza2lwcGluZyBTdHJveUdyYXBoIGJ1dHRvbnMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSdcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XG5cbiAgICAgICAgbGV0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuXG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKSkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xuICAgICAgICB0aGlzLl9zaGFyZS5zdG9yeUdyYXBoQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEdlbmVyYXRlcyBhIGZpZWxkIGZvciBcIkN1cnJlbnRseSBSZWFkaW5nXCIgYmJjb2RlXG4gKi9cbmNsYXNzIEN1cnJlbnRseVJlYWRpbmcgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdGl0bGU6ICdjdXJyZW50bHlSZWFkaW5nJyxcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBnZW5lcmF0ZSBhIFwiQ3VycmVudGx5IFJlYWRpbmdcIiBmb3J1bSBzbmlwcGV0YCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyBDdXJyZW50bHkgUmVhZGluZyBzZWN0aW9uLi4uJyk7XG4gICAgICAgIC8vIEdldCB0aGUgcmVxdWlyZWQgaW5mb3JtYXRpb25cbiAgICAgICAgY29uc3QgdGl0bGU6IHN0cmluZyA9IGRvY3VtZW50IS5xdWVyeVNlbGVjdG9yKCcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJykhXG4gICAgICAgICAgICAudGV4dENvbnRlbnQhO1xuICAgICAgICBjb25zdCBhdXRob3JzOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYSdcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdG9ySUQ6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpWzJdO1xuICAgICAgICBjb25zdCByb3dUYXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbycpO1xuXG4gICAgICAgIC8vIFRpdGxlIGNhbid0IGJlIG51bGxcbiAgICAgICAgaWYgKHRpdGxlID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRpdGxlIGZpZWxkIHdhcyBudWxsYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBhIG5ldyB0YWJsZSByb3dcbiAgICAgICAgY29uc3QgY3JSb3c6IEhUTUxEaXZFbGVtZW50ID0gYXdhaXQgVXRpbC5hZGRUb3JEZXRhaWxzUm93KFxuICAgICAgICAgICAgcm93VGFyLFxuICAgICAgICAgICAgJ0N1cnJlbnRseSBSZWFkaW5nJyxcbiAgICAgICAgICAgICdtcF9jclJvdydcbiAgICAgICAgKTtcbiAgICAgICAgLy8gUHJvY2VzcyBkYXRhIGludG8gc3RyaW5nXG4gICAgICAgIGNvbnN0IGJsdXJiOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9nZW5lcmF0ZVNuaXBwZXQodG9ySUQsIHRpdGxlLCBhdXRob3JzKTtcbiAgICAgICAgLy8gQnVpbGQgYnV0dG9uXG4gICAgICAgIGNvbnN0IGJ0bjogSFRNTERpdkVsZW1lbnQgPSBhd2FpdCB0aGlzLl9idWlsZEJ1dHRvbihjclJvdywgYmx1cmIpO1xuICAgICAgICAvLyBJbml0IGJ1dHRvblxuICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihidG4sIGJsdXJiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIEJ1aWxkIGEgQkIgQ29kZSB0ZXh0IHNuaXBwZXQgdXNpbmcgdGhlIGJvb2sgaW5mbywgdGhlbiByZXR1cm4gaXRcbiAgICAgKiBAcGFyYW0gaWQgVGhlIHN0cmluZyBJRCBvZiB0aGUgYm9va1xuICAgICAqIEBwYXJhbSB0aXRsZSBUaGUgc3RyaW5nIHRpdGxlIG9mIHRoZSBib29rXG4gICAgICogQHBhcmFtIGF1dGhvcnMgQSBub2RlIGxpc3Qgb2YgYXV0aG9yIGxpbmtzXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTbmlwcGV0KFxuICAgICAgICBpZDogc3RyaW5nLFxuICAgICAgICB0aXRsZTogc3RyaW5nLFxuICAgICAgICBhdXRob3JzOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PlxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAqIEFkZCBBdXRob3IgTGlua1xuICAgICAgICAgKiBAcGFyYW0gYXV0aG9yRWxlbSBBIGxpbmsgY29udGFpbmluZyBhdXRob3IgaW5mb3JtYXRpb25cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGFkZEF1dGhvckxpbmsgPSAoYXV0aG9yRWxlbTogSFRNTEFuY2hvckVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgW3VybD0ke2F1dGhvckVsZW0uaHJlZi5yZXBsYWNlKCdodHRwczovL3d3dy5teWFub25hbW91c2UubmV0JywgJycpfV0ke1xuICAgICAgICAgICAgICAgIGF1dGhvckVsZW0udGV4dENvbnRlbnRcbiAgICAgICAgICAgIH1bL3VybF1gO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIE5vZGVMaXN0IGludG8gYW4gQXJyYXkgd2hpY2ggaXMgZWFzaWVyIHRvIHdvcmsgd2l0aFxuICAgICAgICBsZXQgYXV0aG9yQXJyYXk6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGF1dGhvcnMuZm9yRWFjaCgoYXV0aG9yRWxlbSkgPT4gYXV0aG9yQXJyYXkucHVzaChhZGRBdXRob3JMaW5rKGF1dGhvckVsZW0pKSk7XG4gICAgICAgIC8vIERyb3AgZXh0cmEgaXRlbXNcbiAgICAgICAgaWYgKGF1dGhvckFycmF5Lmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgIGF1dGhvckFycmF5ID0gWy4uLmF1dGhvckFycmF5LnNsaWNlKDAsIDMpLCAnZXRjLiddO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbdXJsPS90LyR7aWR9XSR7dGl0bGV9Wy91cmxdIGJ5IFtpXSR7YXV0aG9yQXJyYXkuam9pbignLCAnKX1bL2ldYDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIEJ1aWxkIGEgYnV0dG9uIG9uIHRoZSB0b3IgZGV0YWlscyBwYWdlXG4gICAgICogQHBhcmFtIHRhciBBcmVhIHdoZXJlIHRoZSBidXR0b24gd2lsbCBiZSBhZGRlZCBpbnRvXG4gICAgICogQHBhcmFtIGNvbnRlbnQgQ29udGVudCB0aGF0IHdpbGwgYmUgYWRkZWQgaW50byB0aGUgdGV4dGFyZWFcbiAgICAgKi9cbiAgICBwcml2YXRlIF9idWlsZEJ1dHRvbih0YXI6IEhUTUxEaXZFbGVtZW50LCBjb250ZW50OiBzdHJpbmcpOiBIVE1MRGl2RWxlbWVudCB7XG4gICAgICAgIC8vIEJ1aWxkIHRleHQgZGlzcGxheVxuICAgICAgICB0YXIuaW5uZXJIVE1MID0gYDx0ZXh0YXJlYSBjbGFzcz1cIm1jZU5vRWRpdG9yXCIgcm93cz1cIjFcIiBjb2xzPVwiODBcIiBzdHlsZT0nbWFyZ2luLXJpZ2h0OjVweCc+JHtjb250ZW50fTwvdGV4dGFyZWE+YDtcbiAgICAgICAgLy8gQnVpbGQgYnV0dG9uXG4gICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbih0YXIsICdub25lJywgJ0NvcHknLCAyKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2NyUm93IC5tcF9idXR0b25fY2xvbmUnKSEuY2xhc3NMaXN0LmFkZCgnbXBfcmVhZGluZycpO1xuICAgICAgICAvLyBSZXR1cm4gYnV0dG9uXG4gICAgICAgIHJldHVybiA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3JlYWRpbmcnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIFByb3RlY3RzIHRoZSB1c2VyIGZyb20gcmF0aW8gdHJvdWJsZXMgYnkgYWRkaW5nIHdhcm5pbmdzIGFuZCBkaXNwbGF5aW5nIHJhdGlvIGRlbHRhXG4gKi9cbmNsYXNzIFJhdGlvUHJvdGVjdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdCcsXG4gICAgICAgIGRlc2M6IGBQcm90ZWN0IHlvdXIgcmF0aW8gd2l0aCB3YXJuaW5ncyAmYW1wOyByYXRpbyBjYWxjdWxhdGlvbnNgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3JhdGlvJztcbiAgICBwcml2YXRlIF9yY1Jvdzogc3RyaW5nID0gJ21wX3JhdGlvQ29zdFJvdyc7XG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxpbmcgcmF0aW8gcHJvdGVjdGlvbi4uLicpO1xuICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgYmxvY2sgdG8gc2hhcmVkXG4gICAgICAgIC8vIFRoZSBkb3dubG9hZCB0ZXh0IGFyZWFcbiAgICAgICAgY29uc3QgZGxCdG46IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0ZGRsJyk7XG4gICAgICAgIC8vIFRoZSBjdXJyZW50bHkgdW51c2VkIGxhYmVsIGFyZWEgYWJvdmUgdGhlIGRvd25sb2FkIHRleHRcbiAgICAgICAgY29uc3QgZGxMYWJlbDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICcjZG93bmxvYWQgLnRvckRldElubmVyVG9wJ1xuICAgICAgICApO1xuICAgICAgICAvLyBJbnNlcnRpb24gdGFyZ2V0IGZvciBtZXNzYWdlc1xuICAgICAgICBjb25zdCBkZXNjQmxvY2sgPSBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLnRvckRldEJvdHRvbScpO1xuICAgICAgICAvLyBXb3VsZCBiZWNvbWUgcmF0aW9cbiAgICAgICAgY29uc3Qgck5ldzogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuICAgICAgICAvLyBDdXJyZW50IHJhdGlvXG4gICAgICAgIGNvbnN0IHJDdXI6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJyk7XG4gICAgICAgIC8vIFNlZWRpbmcgb3IgZG93bmxvYWRpbmdcbiAgICAgICAgY29uc3Qgc2VlZGluZzogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNETGhpc3RvcnknKTtcbiAgICAgICAgLy8gVXNlciBoYXMgYSByYXRpb1xuICAgICAgICBjb25zdCB1c2VySGFzUmF0aW8gPSByQ3VyLnRleHRDb250ZW50LmluZGV4T2YoJ0luZicpIDwgMCA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICAvLyBHZXQgdGhlIGN1c3RvbSByYXRpbyBhbW91bnRzICh3aWxsIHJldHVybiBkZWZhdWx0IHZhbHVlcyBvdGhlcndpc2UpXG4gICAgICAgIGNvbnN0IFtyMSwgcjIsIHIzXSA9IGF3YWl0IHRoaXMuX3NoYXJlLmdldFJhdGlvUHJvdGVjdExldmVscygpO1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBSYXRpbyBwcm90ZWN0aW9uIGxldmVscyBzZXQgdG86ICR7cjF9LCAke3IyfSwgJHtyM31gKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGJveCB3ZSB3aWxsIGRpc3BsYXkgdGV4dCBpblxuICAgICAgICBpZiAoZGVzY0Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBBZGQgbGluZSB1bmRlciBUb3JyZW50OiBkZXRhaWwgZm9yIENvc3QgZGF0YSBcIkNvc3QgdG8gUmVzdG9yZSBSYXRpb1wiXG4gICAgICAgICAgICBkZXNjQmxvY2suaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXG4gICAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJ0b3JEZXRSb3dcIiBpZD1cIm1wX3Jvd1wiPjxkaXYgY2xhc3M9XCJ0b3JEZXRMZWZ0XCI+Q29zdCB0byBSZXN0b3JlIFJhdGlvPC9kaXY+PGRpdiBjbGFzcz1cInRvckRldFJpZ2h0ICR7dGhpcy5fcmNSb3d9XCIgc3R5bGU9XCJmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6ZmxleC1zdGFydDtcIj48c3BhbiBpZD1cIm1wX2Zvb2JhclwiPjwvc3Bhbj48L2Rpdj48L2Rpdj5gXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnLnRvckRldFJvdyBpcyAke2Rlc2NCbG9ja31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9ubHkgcnVuIHRoZSBjb2RlIGlmIHRoZSByYXRpbyBleGlzdHNcbiAgICAgICAgaWYgKHJOZXcgJiYgckN1ciAmJiAhc2VlZGluZyAmJiB1c2VySGFzUmF0aW8pIHtcbiAgICAgICAgICAgIGNvbnN0IHJEaWZmID0gVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gLSBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXTtcblxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBgQ3VycmVudCAke1V0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdfSB8IE5ldyAke1xuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF1cbiAgICAgICAgICAgICAgICAgICAgfSB8IERpZiAke3JEaWZmfWBcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBPbmx5IGFjdGl2YXRlIGlmIGEgcmF0aW8gY2hhbmdlIGlzIGV4cGVjdGVkXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHJEaWZmKSAmJiByRGlmZiA+IDAuMDA5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGRsTGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5pbm5lckhUTUwgPSBgUmF0aW8gbG9zcyAke3JEaWZmLnRvRml4ZWQoMil9YDtcbiAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7IC8vVG8gZGlzdGluZ3Vpc2ggZnJvbSBCT0xEIFRpdGxlc1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSAmIERpc3BsYXkgY29zdCBvZiBkb3dubG9hZCB3L28gRkxcbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgc2hvdyBjYWxjdWxhdGlvbnMgd2hlbiB0aGVyZSBpcyBhIHJhdGlvIGxvc3NcbiAgICAgICAgICAgICAgICBjb25zdCBzaXplRWxlbTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICcjc2l6ZSBzcGFuJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKHNpemVFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpemUgPSBzaXplRWxlbS50ZXh0Q29udGVudCEuc3BsaXQoL1xccysvKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2l6ZU1hcCA9IFsnQnl0ZXMnLCAnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJ107XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgaHVtYW4gcmVhZGFibGUgc2l6ZSB0byBieXRlc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBieXRlU2l6ZWQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyKHNpemVbMF0pICogTWF0aC5wb3coMTAyNCwgc2l6ZU1hcC5pbmRleE9mKHNpemVbMV0pKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjb3ZlcnkgPSBieXRlU2l6ZWQgKiBVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9pbnRBbW50ID0gTWF0aC5mbG9vcihcbiAgICAgICAgICAgICAgICAgICAgICAgICgxMjUgKiByZWNvdmVyeSkgLyAyNjg0MzU0NTZcbiAgICAgICAgICAgICAgICAgICAgKS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlBbW91bnQgPSBNYXRoLmZsb29yKCg1ICogcmVjb3ZlcnkpIC8gMjE0NzQ4MzY0OCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdlZGdlU3RvcmVDb3N0ID0gVXRpbC5mb3JtYXRCeXRlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICgyNjg0MzU0NTYgKiA1MDAwMCkgLyAoVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gKiAxMjUpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdlZGdlVmF1bHRDb3N0ID0gVXRpbC5mb3JtYXRCeXRlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICgyNjg0MzU0NTYgKiAyMDApIC8gKFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdICogMTI1KVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmF0aW8gY29zdCByb3dcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGAuJHt0aGlzLl9yY1Jvd31gXG4gICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IGA8c3Bhbj48Yj4ke1V0aWwuZm9ybWF0Qnl0ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWNvdmVyeVxuICAgICAgICAgICAgICAgICAgICApfTwvYj4mbmJzcDt1cGxvYWQgKCR7cG9pbnRBbW50fSBCUDsgb3Igb25lIEZMIHdlZGdlIHBlciBkYXkgZm9yICR7ZGF5QW1vdW50fSBkYXlzKS4mbmJzcDs8YWJiciB0aXRsZT0nQ29udHJpYnV0aW5nIDIsMDAwIEJQIHRvIGVhY2ggdmF1bHQgY3ljbGUgZ2l2ZXMgeW91IGFsbW9zdCBvbmUgRkwgd2VkZ2UgcGVyIGRheSBvbiBhdmVyYWdlLicgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjpub25lO2N1cnNvcjpoZWxwOyc+JiMxMjg3MTI7PC9hYmJyPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+V2VkZ2Ugc3RvcmUgcHJpY2U6IDxpPiR7d2VkZ2VTdG9yZUNvc3R9PC9pPiZuYnNwOzxhYmJyIHRpdGxlPSdJZiB5b3UgYnV5IHdlZGdlcyBmcm9tIHRoZSBzdG9yZSwgdGhpcyBpcyBob3cgbGFyZ2UgYSB0b3JyZW50IG11c3QgYmUgdG8gYnJlYWsgZXZlbiBvbiB0aGUgY29zdCAoNTAsMDAwIEJQKSBvZiBhIHNpbmdsZSB3ZWRnZS4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPldlZGdlIHZhdWx0IHByaWNlOiA8aT4ke3dlZGdlVmF1bHRDb3N0fTwvaT4mbmJzcDs8YWJiciB0aXRsZT0nSWYgeW91IGNvbnRyaWJ1dGUgdG8gdGhlIHZhdWx0LCB0aGlzIGlzIGhvdyBsYXJnZSBhIHRvcnJlbnQgbXVzdCBiZSB0byBicmVhayBldmVuIG9uIHRoZSBjb3N0ICgyMDAgQlApIG9mIDEwIHdlZGdlcyBmb3IgdGhlIG1heGltdW0gY29udHJpYnV0aW9uIG9mIDIsMDAwIEJQLicgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjpub25lO2N1cnNvcjpoZWxwOyc+JiMxMjg3MTI7PC9hYmJyPjwvc3Bhbj5gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFN0eWxlIHRoZSBkb3dubG9hZCBidXR0b24gYmFzZWQgb24gUmF0aW8gUHJvdGVjdCBsZXZlbCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIGlmIChkbEJ0biAmJiBkbExhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICogVGhpcyBpcyB0aGUgXCJ0cml2aWFsIHJhdGlvIGxvc3NcIiB0aHJlc2hvbGRcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2UgY2hhbmdlcyB3aWxsIGFsd2F5cyBoYXBwZW4gaWYgdGhlIHJhdGlvIGNvbmRpdGlvbnMgYXJlIG1ldFxuICAgICAgICAgICAgICAgICAgICBpZiAockRpZmYgPiByMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0QnV0dG9uU3RhdGUoZGxCdG4sICcxX25vdGlmeScpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gKiBUaGlzIGlzIHRoZSBcIkkgbmV2ZXIgd2FudCB0byBkbCB3L28gRkxcIiB0aHJlc2hvbGRcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbHNvIHVzZXMgdGhlIE1pbmltdW0gUmF0aW8sIGlmIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbHNvIHByZXZlbnRzIGdvaW5nIGJlbG93IDIgcmF0aW8gKFBVIHJlcXVpcmVtZW50KVxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIGRpc2FibGUgYnV0dG9uIHdpdGggYnV5IEZMIGJ1dHRvblxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJEaWZmID4gcjMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdE1pbl92YWwnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF0gPCAyXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0QnV0dG9uU3RhdGUoZGxCdG4sICczX2FsZXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAqIFRoaXMgaXMgdGhlIFwiSSBuZWVkIHRvIHRoaW5rIGFib3V0IHVzaW5nIGEgRkxcIiB0aHJlc2hvbGRcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyRGlmZiA+IHIyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRCdXR0b25TdGF0ZShkbEJ0biwgJzJfd2FybicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgdGhlIHVzZXIgZG9lcyBub3QgaGF2ZSBhIHJhdGlvLCBkaXNwbGF5IGEgc2hvcnQgbWVzc2FnZVxuICAgICAgICB9IGVsc2UgaWYgKCF1c2VySGFzUmF0aW8pIHtcbiAgICAgICAgICAgIHRoaXMuX3NldEJ1dHRvblN0YXRlKGRsQnRuLCAnMV9ub3RpZnknKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgYC4ke3RoaXMuX3JjUm93fWBcbiAgICAgICAgICAgICkhLmlubmVySFRNTCA9IGA8c3Bhbj5SYXRpbyBwb2ludHMgYW5kIGNvc3QgdG8gcmVzdG9yZSByYXRpbyB3aWxsIGFwcGVhciBoZXJlIGFmdGVyIHlvdXIgcmF0aW8gaXMgYSByZWFsIG51bWJlci48L3NwYW4+YDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3NldEJ1dHRvblN0YXRlKFxuICAgICAgICB0YXI6IEhUTUxBbmNob3JFbGVtZW50LFxuICAgICAgICBzdGF0ZTogJzFfbm90aWZ5JyB8ICcyX3dhcm4nIHwgJzNfYWxlcnQnLFxuICAgICAgICBsYWJlbD86IEhUTUxEaXZFbGVtZW50XG4gICAgKSB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJzFfbm90aWZ5Jykge1xuICAgICAgICAgICAgdGFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdTcHJpbmdHcmVlbic7XG4gICAgICAgICAgICB0YXIuc3R5bGUuY29sb3IgPSAnYmxhY2snO1xuICAgICAgICAgICAgdGFyLmlubmVySFRNTCA9ICdEb3dubG9hZD8nO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnMl93YXJuJykge1xuICAgICAgICAgICAgdGFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xuICAgICAgICAgICAgdGFyLmlubmVySFRNTCA9ICdTdWdnZXN0IEZMJztcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJzNfYWxlcnQnKSB7XG4gICAgICAgICAgICBpZiAoIWxhYmVsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBObyBsYWJlbCBwcm92aWRlZCBpbiBfc2V0QnV0dG9uU3RhdGUoKSFgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnUmVkJztcbiAgICAgICAgICAgIHRhci5zdHlsZS5jdXJzb3IgPSAnbm8tZHJvcCc7XG4gICAgICAgICAgICB0YXIuaW5uZXJIVE1MID0gJ0ZMIE5lZWRlZCc7XG4gICAgICAgICAgICBsYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0ZSBcIiR7c3RhdGV9XCIgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIExvdyByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxuICovXG5jbGFzcyBSYXRpb1Byb3RlY3RMMSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMScsXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDEnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDAuNScsXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIHNtYWxsZXN0IHRocmVzaGhvbGQgdG8gaW5kaWNhdGUgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGlzIGEgc2xpZ2h0IGNvbG9yIGNoYW5nZTwvZW0+KS5gLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gTDEhJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIE1lZGl1bSByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxuICovXG5jbGFzcyBSYXRpb1Byb3RlY3RMMiBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMicsXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDInLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDEnLFxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBtZWRpYW4gdGhyZXNoaG9sZCB0byB3YXJuIG9mIHJhdGlvIGNoYW5nZXMuICg8ZW0+VGhpcyBpcyBhIG5vdGljZWFibGUgY29sb3IgY2hhbmdlPC9lbT4pLmAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxlZCBjdXN0b20gUmF0aW8gUHJvdGVjdGlvbiBMMiEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICogSGlnaCByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxuICovXG5jbGFzcyBSYXRpb1Byb3RlY3RMMyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMycsXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDMnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDInLFxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBoaWdoZXN0IHRocmVzaGhvbGQgdG8gcHJldmVudCByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgZGlzYWJsZXMgZG93bmxvYWQgd2l0aG91dCBGTCB1c2U8L2VtPikuYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIEwzIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIFJhdGlvUHJvdGVjdE1pbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdE1pbicsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0YWc6ICdNaW5pbXVtIFJhdGlvJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTAwJyxcbiAgICAgICAgZGVzYzogJ1RyaWdnZXIgUmF0aW8gV2FybiBMMyBpZiB5b3VyIHJhdGlvIHdvdWxkIGRyb3AgYmVsb3cgdGhpcyBudW1iZXIuJyxcbiAgICB9O1xuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xuICAgIC8vIFRoZSBjb2RlIHRoYXQgcnVucyB3aGVuIHRoZSBmZWF0dXJlIGlzIGNyZWF0ZWQgb24gYGZlYXR1cmVzLnRzYC5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gbWluaW11bSEnKTtcbiAgICB9XG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuY2xhc3MgUmF0aW9Qcm90ZWN0SWNvbnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdEljb25zJyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIGRlc2M6ICdFbmFibGUgY3VzdG9tIGJyb3dzZXIgZmF2aWNvbnMgYmFzZWQgb24gUmF0aW8gUHJvdGVjdCBjb25kaXRpb25zPycsXG4gICAgfTtcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3JhdGlvJztcbiAgICBwcml2YXRlIF91c2VySUQ6IG51bWJlciA9IDE2NDEwOTtcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGBbTStdIEVuYWJsaW5nIGN1c3RvbSBSYXRpbyBQcm90ZWN0IGZhdmljb25zIGZyb20gdXNlciAke3RoaXMuX3VzZXJJRH0uLi5gXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBjdXN0b20gcmF0aW8gYW1vdW50cyAod2lsbCByZXR1cm4gZGVmYXVsdCB2YWx1ZXMgb3RoZXJ3aXNlKVxuICAgICAgICBjb25zdCBbcjEsIHIyLCByM10gPSBhd2FpdCB0aGlzLl9zaGFyZS5nZXRSYXRpb1Byb3RlY3RMZXZlbHMoKTtcbiAgICAgICAgLy8gV291bGQgYmVjb21lIHJhdGlvXG4gICAgICAgIGNvbnN0IHJOZXc6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgLy8gQ3VycmVudCByYXRpb1xuICAgICAgICBjb25zdCByQ3VyOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpO1xuICAgICAgICAvLyBEaWZmZXJlbmNlIGJldHdlZW4gbmV3IGFuZCBvbGQgcmF0aW9cbiAgICAgICAgY29uc3QgckRpZmYgPSBVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAtIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdO1xuICAgICAgICAvLyBTZWVkaW5nIG9yIGRvd25sb2FkaW5nXG4gICAgICAgIGNvbnN0IHNlZWRpbmc6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjRExoaXN0b3J5Jyk7XG4gICAgICAgIC8vIFZJUCBzdGF0dXNcbiAgICAgICAgY29uc3Qgdmlwc3RhdDogc3RyaW5nIHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI3JhdGlvIC50b3JEZXRJbm5lckJvdHRvbVNwYW4nXG4gICAgICAgIClcbiAgICAgICAgICAgID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JhdGlvIC50b3JEZXRJbm5lckJvdHRvbVNwYW4nKS50ZXh0Q29udGVudFxuICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAvLyBCb29rY2x1YiBzdGF0dXNcbiAgICAgICAgY29uc3QgYm9va2NsdWI6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgXCJkaXZbaWQ9J2JjZmwnXSBzcGFuXCJcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBGaW5kIGZhdmljb24gbGlua3MgYW5kIGxvYWQgYSBzaW1wbGUgZGVmYXVsdC5cbiAgICAgICAgY29uc3Qgc2l0ZUZhdmljb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImxpbmtbcmVsJD0naWNvbiddXCIpIGFzIE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICBIVE1MTGlua0VsZW1lbnRcbiAgICAgICAgPjtcbiAgICAgICAgaWYgKHNpdGVGYXZpY29ucykgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAndG1fMzJ4MzInKTtcblxuICAgICAgICAvLyBUZXN0IGlmIFZJUFxuICAgICAgICBpZiAodmlwc3RhdCkge1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgVklQID0gJHt2aXBzdGF0fWApO1xuXG4gICAgICAgICAgICBpZiAodmlwc3RhdC5zZWFyY2goJ1ZJUCBleHBpcmVzJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ21vdXNlY2xvY2snKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcbiAgICAgICAgICAgICAgICAgICAgYCB8IEV4cGlyZXMgJHt2aXBzdGF0LnN1YnN0cmluZygyNil9YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdWSVAgbm90IHNldCB0byBleHBpcmUnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnMGNpcicpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxuICAgICAgICAgICAgICAgICAgICAnIHwgTm90IHNldCB0byBleHBpcmUnXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmlwc3RhdC5zZWFyY2goJ1RoaXMgdG9ycmVudCBpcyBmcmVlbGVlY2ghJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ21vdXNlY2xvY2snKTtcbiAgICAgICAgICAgICAgICAvLyBUZXN0IGlmIGJvb2tjbHViXG4gICAgICAgICAgICAgICAgaWYgKGJvb2tjbHViICYmIGJvb2tjbHViLnRleHRDb250ZW50LnNlYXJjaCgnQm9va2NsdWIgRnJlZWxlZWNoJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAnIHwgTXkgQW5vbmFtb3VzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBgIHwgQ2x1YiBleHBpcmVzICR7Ym9va2NsdWIudGV4dENvbnRlbnQuc3Vic3RyaW5nKDI1KX1gXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIgfCAndGlsbCBuZXh0IFNpdGUgRkxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogQ2FsY3VsYXRlIHdoZW4gRkwgZW5kc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYCB8ICd0aWxsICR7dGhpcy5fbmV4dEZMRGF0ZSgpfWBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIHNlZWRpbmcvZG93bmxvYWRpbmdcbiAgICAgICAgaWYgKHNlZWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzEzZWdnJyk7XG4gICAgICAgICAgICAvLyAqIFNpbWlsYXIgaWNvbnM6IDEzc2VlZDgsIDEzc2VlZDcsIDEzZWdnLCAxMywgMTNjaXIsIDEzV2hpdGVDaXJcbiAgICAgICAgfSBlbHNlIGlmICh2aXBzdGF0LnNlYXJjaCgnVGhpcyB0b3JyZW50IGlzIHBlcnNvbmFsIGZyZWVsZWVjaCcpID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgdGhlcmUgd2lsbCBiZSByYXRpbyBsb3NzXG4gICAgICAgIGlmIChyTmV3ICYmIHJDdXIgJiYgIXNlZWRpbmcpIHtcbiAgICAgICAgICAgIC8vIENoYW5nZSBpY29uIGJhc2VkIG9uIFJhdGlvIFByb3RlY3Qgc3RhdGVzXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgckRpZmYgPiByMyB8fFxuICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdE1pbl92YWwnKSB8fFxuICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgMlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnMTInKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAockRpZmYgPiByMikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzNRbW91c2UnKTtcbiAgICAgICAgICAgICAgICAvLyBBbHNvIHRyeSBPcmFuZ2UsIE9yYW5nZVJlZCwgR29sZCwgb3IgMTRcbiAgICAgICAgICAgIH0gZWxzZSBpZiAockRpZmYgPiByMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ1NwcmluZ0dyZWVuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGZ1dHVyZSBWSVBcbiAgICAgICAgICAgIGlmICh2aXBzdGF0LnNlYXJjaCgnT24gbGlzdCBmb3IgbmV4dCBGTCBwaWNrJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ01pcnJvckdyZWVuQ2xvY2snKTsgLy8gQWxzbyB0cnkgZ3JlZW5jbG9ja1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxuICAgICAgICAgICAgICAgICAgICAnIHwgTmV4dCBGTCBwaWNrJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDdXN0b20gUmF0aW8gUHJvdGVjdCBmYXZpY29ucyBlbmFibGVkIScpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IEZ1bmN0aW9uIGZvciBjYWxjdWxhdGluZyB3aGVuIEZMIGVuZHNcbiAgICAvLyA/IEhvdyBhcmUgd2UgYWJsZSB0byBkZXRlcm1pbmUgd2hlbiB0aGUgY3VycmVudCBGTCBwZXJpb2Qgc3RhcnRlZD9cbiAgICAvKiBwcml2YXRlIGFzeW5jIF9uZXh0RkxEYXRlKCkge1xuICAgICAgICBjb25zdCBkID0gbmV3IERhdGUoJ0p1biAxNCwgMjAyMiAwMDowMDowMCBVVEMnKTsgLy8gc2VlZCBkYXRlIG92ZXIgdHdvIHdlZWtzIGFnb1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpOyAvL1BsYWNlIHRlc3QgZGF0ZXMgaGVyZSBsaWtlIERhdGUoXCJKdWwgMTQsIDIwMjIgMDA6MDA6MDAgVVRDXCIpXG4gICAgICAgIGxldCBtc3NpbmNlID0gbm93LmdldFRpbWUoKSAtIGQuZ2V0VGltZSgpOyAvL3RpbWUgc2luY2UgRkwgc3RhcnQgc2VlZCBkYXRlXG4gICAgICAgIGxldCBkYXlzc2luY2UgPSBtc3NpbmNlIC8gODY0MDAwMDA7XG4gICAgICAgIGxldCBxID0gTWF0aC5mbG9vcihkYXlzc2luY2UgLyAxNCk7IC8vIEZMIHBlcmlvZHMgc2luY2Ugc2VlZCBkYXRlXG5cbiAgICAgICAgY29uc3QgYWRkRGF5cyA9IChkYXRlLCBkYXlzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gbmV3IERhdGUoZGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudC5zZXREYXRlKGN1cnJlbnQuZ2V0RGF0ZSgpICsgZGF5cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGRcbiAgICAgICAgICAgIC5hZGREYXlzKHEgKiAxNCArIDE0KVxuICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIC5zdWJzdHIoMCwgMTApO1xuICAgIH0gKi9cblxuICAgIHByaXZhdGUgYXN5bmMgX2J1aWxkSWNvbkxpbmtzKGVsZW1zOiBOb2RlTGlzdE9mPEhUTUxMaW5rRWxlbWVudD4sIGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgZWxlbXMuZm9yRWFjaCgoZWxlbSkgPT4ge1xuICAgICAgICAgICAgZWxlbS5ocmVmID0gYGh0dHBzOi8vY2RuLm15YW5vbmFtb3VzZS5uZXQvaW1hZ2VidWNrZXQvJHt0aGlzLl91c2VySUR9LyR7ZmlsZW5hbWV9LnBuZ2A7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxuXG4gICAgc2V0IHVzZXJJRChuZXdJRDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX3VzZXJJRCA9IG5ld0lEO1xuICAgIH1cbn1cblxuLy8gVE9ETzogQWRkIGZlYXR1cmUgdG8gc2V0IFJhdGlvUHJvdGVjdEljb24ncyBgX3VzZXJJRGAgdmFsdWUuIE9ubHkgbmVjZXNzYXJ5IG9uY2Ugb3RoZXIgaWNvbiBzZXRzIGV4aXN0LlxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxuXG4vKipcbiAqICNVUExPQUQgUEFHRSBGRUFUVVJFU1xuICovXG5cbi8qKlxuICogQWxsb3dzIGVhc2llciBjaGVja2luZyBmb3IgZHVwbGljYXRlIHVwbG9hZHNcbiAqL1xuXG5jbGFzcyBTZWFyY2hGb3JEdXBsaWNhdGVzIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdzZWFyY2hGb3JEdXBsaWNhdGVzJyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXBsb2FkIFBhZ2UnXSxcbiAgICAgICAgZGVzYzogJ0Vhc2llciBzZWFyY2hpbmcgZm9yIGR1cGxpY2F0ZXMgd2hlbiB1cGxvYWRpbmcgY29udGVudCcsXG4gICAgfTtcblxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN1cGxvYWRGb3JtIGlucHV0W3R5cGU9XCJzdWJtaXRcIl0nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXBsb2FkJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5Jyk7XG5cbiAgICAgICAgaWYgKHBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiB0aXRsZScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RpdGxlJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXRbbmFtZT1cInRvclt0aXRsZV1cIl0nLFxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiA3LFxuICAgICAgICAgICAgICAgIHVzZVdpbGRjYXJkOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBhdXRob3IocyknLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdhdXRob3InLFxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dC5hY19hdXRob3InLFxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gc2VyaWVzJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2VyaWVzJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfc2VyaWVzJyxcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTEsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIG5hcnJhdG9yKHMpJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnbmFycmF0b3InLFxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dC5hY19uYXJyYXRvcicsXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDEyLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIHNlYXJjaCB0byB1cGxvYWRzIWApO1xuICAgIH1cbiAgICBwcml2YXRlIF9nZW5lcmF0ZVNlYXJjaCh7XG4gICAgICAgIHBhcmVudEVsZW1lbnQsXG4gICAgICAgIHRpdGxlLFxuICAgICAgICB0eXBlLFxuICAgICAgICBpbnB1dFNlbGVjdG9yLFxuICAgICAgICByb3dQb3NpdGlvbixcbiAgICAgICAgdXNlV2lsZGNhcmQgPSBmYWxzZSxcbiAgICB9OiB7XG4gICAgICAgIHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgICAgICB0aXRsZTogc3RyaW5nO1xuICAgICAgICB0eXBlOiBzdHJpbmc7XG4gICAgICAgIGlucHV0U2VsZWN0b3I6IHN0cmluZztcbiAgICAgICAgcm93UG9zaXRpb246IG51bWJlcjtcbiAgICAgICAgdXNlV2lsZGNhcmQ/OiBib29sZWFuO1xuICAgIH0pIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoRWxlbWVudDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hFbGVtZW50LCB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnLFxuICAgICAgICAgICAgc3R5bGU6ICd0ZXh0LWRlY29yYXRpb246IG5vbmU7IGN1cnNvcjogcG9pbnRlcjsnLFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgIH0pO1xuICAgICAgICBzZWFyY2hFbGVtZW50LnRleHRDb250ZW50ID0gJyDwn5SNJztcblxuICAgICAgICBjb25zdCBsaW5rQmFzZSA9IGAvdG9yL2Jyb3dzZS5waHA/dG9yJTVCc2VhcmNoVHlwZSU1RD1hbGwmdG9yJTVCc2VhcmNoSW4lNUQ9dG9ycmVudHMmdG9yJTVCY2F0JTVEJTVCJTVEPTAmdG9yJTVCYnJvd3NlRmxhZ3NIaWRlVnNTaG93JTVEPTAmdG9yJTVCc29ydFR5cGUlNUQ9ZGF0ZURlc2MmdG9yJTVCc3JjaEluJTVEJTVCJHt0eXBlfSU1RD10cnVlJnRvciU1QnRleHQlNUQ9YDtcblxuICAgICAgICBwYXJlbnRFbGVtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICBgI3VwbG9hZEZvcm0gPiB0Ym9keSA+IHRyOm50aC1jaGlsZCgke3Jvd1Bvc2l0aW9ufSkgPiB0ZDpudGgtY2hpbGQoMSlgXG4gICAgICAgICAgICApXG4gICAgICAgICAgICA/Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgc2VhcmNoRWxlbWVudCk7XG5cbiAgICAgICAgc2VhcmNoRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5wdXRzOiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICAgICAgID4gfCBudWxsID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGlucHV0U2VsZWN0b3IpO1xuXG4gICAgICAgICAgICBpZiAoaW5wdXRzICYmIGlucHV0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dHNMaXN0OiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzTGlzdC5wdXNoKGlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBpbnB1dHNMaXN0LmpvaW4oJyAnKS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoU3RyaW5nID0gdXNlV2lsZGNhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCoke2VuY29kZVVSSUNvbXBvbmVudChpbnB1dHNMaXN0LmpvaW4oJyAnKSl9KmBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0c0xpc3Quam9pbignICcpKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hFbGVtZW50LnNldEF0dHJpYnV0ZSgnaHJlZicsIGxpbmtCYXNlICsgc2VhcmNoU3RyaW5nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxuXG4vKipcbiAqICMgVVNFUiBQQUdFIEZFQVRVUkVTXG4gKi9cblxuLyoqXG4gKiAjIyMjIERlZmF1bHQgVXNlciBHaWZ0IEFtb3VudFxuICovXG5jbGFzcyBVc2VyR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3VzZXJHaWZ0RGVmYXVsdCcsXG4gICAgICAgIHRhZzogJ0RlZmF1bHQgR2lmdCcsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMDAsIG1heCcsXG4gICAgICAgIGRlc2M6XG4gICAgICAgICAgICAnQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuICg8ZW0+T3IgdGhlIG1heCBhbGxvd2FibGUgdmFsdWUsIHdoaWNoZXZlciBpcyBsb3dlcjwvZW0+KScsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjYm9udXNnaWZ0JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3VzZXInXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIG5ldyBTaGFyZWQoKVxuICAgICAgICAgICAgLmZpbGxHaWZ0Qm94KHRoaXMuX3RhciwgdGhpcy5fc2V0dGluZ3MudGl0bGUpXG4gICAgICAgICAgICAudGhlbigocG9pbnRzKSA9PlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIyMgVXNlciBHaWZ0IEhpc3RvcnlcbiAqL1xuY2xhc3MgVXNlckdpZnRIaXN0b3J5IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdEhpc3RvcnknLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXG4gICAgICAgIGRlc2M6ICdEaXNwbGF5IGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHlvdSBhbmQgYW5vdGhlciB1c2VyJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3NlbmRTeW1ib2wgPSBgPHNwYW4gc3R5bGU9J2NvbG9yOm9yYW5nZScgdGl0bGU9J3NlbnQnPlxcdTI3RjA8L3NwYW4+YDtcbiAgICBwcml2YXRlIF9nZXRTeW1ib2wgPSBgPHNwYW4gc3R5bGU9J2NvbG9yOnRlYWwnIHRpdGxlPSdyZWNlaXZlZCc+XFx1MjdGMTwvc3Bhbj5gO1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJ3Rib2R5JztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5pdGlhbGxpemluZyB1c2VyIGdpZnQgaGlzdG9yeS4uLicpO1xuXG4gICAgICAgIC8vIE5hbWUgb2YgdGhlIG90aGVyIHVzZXJcbiAgICAgICAgY29uc3Qgb3RoZXJVc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gaDEnKSEudGV4dENvbnRlbnQhLnRyaW0oKTtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnaWZ0IGhpc3Rvcnkgcm93XG4gICAgICAgIGNvbnN0IGhpc3RvcnlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgICAgICBjb25zdCBpbnNlcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgdGJvZHkgdHI6bGFzdC1vZi10eXBlJyk7XG4gICAgICAgIGlmIChpbnNlcnQpIGluc2VydC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgaGlzdG9yeUNvbnRhaW5lcik7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IHRpdGxlIGZpZWxkXG4gICAgICAgIGNvbnN0IGhpc3RvcnlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGhpc3RvcnlUaXRsZS5jbGFzc0xpc3QuYWRkKCdyb3doZWFkJyk7XG4gICAgICAgIGhpc3RvcnlUaXRsZS50ZXh0Q29udGVudCA9ICdHaWZ0IGhpc3RvcnknO1xuICAgICAgICBoaXN0b3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKGhpc3RvcnlUaXRsZSk7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IGNvbnRlbnQgZmllbGRcbiAgICAgICAgY29uc3QgaGlzdG9yeUJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGhpc3RvcnlCb3guY2xhc3NMaXN0LmFkZCgncm93MScpO1xuICAgICAgICBoaXN0b3J5Qm94LnRleHRDb250ZW50ID0gYFlvdSBoYXZlIG5vdCBleGNoYW5nZWQgZ2lmdHMgd2l0aCAke290aGVyVXNlcn0uYDtcbiAgICAgICAgaGlzdG9yeUJveC5hbGlnbiA9ICdsZWZ0JztcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5Qm94KTtcbiAgICAgICAgLy8gR2V0IHRoZSBVc2VyIElEXG4gICAgICAgIGNvbnN0IHVzZXJJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnBvcCgpO1xuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVc2VySUQgPSBVdGlsLmdldEN1cnJlbnRVc2VySUQoKTtcblxuICAgICAgICAvLyBUT0RPOiB1c2UgYGNkbi5gIGluc3RlYWQgb2YgYHd3dy5gOyBjdXJyZW50bHkgY2F1c2VzIGEgNDAzIGVycm9yXG4gICAgICAgIGlmICh1c2VySUQpIHtcbiAgICAgICAgICAgIGlmICh1c2VySUQgPT09IGN1cnJlbnRVc2VySUQpIHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnUmVjZW50IEdpZnQgSGlzdG9yeSc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlXaXRoQWxsKGhpc3RvcnlCb3gpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlXaXRoVXNlcklEKHVzZXJJRCwgaGlzdG9yeUJveCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVzZXIgSUQgbm90IGZvdW5kOiAke3VzZXJJRH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgRmlsbCBvdXQgaGlzdG9yeSBib3hcbiAgICAgKiBAcGFyYW0gdXNlcklEIHRoZSB1c2VyIHRvIGdldCBoaXN0b3J5IGZyb21cbiAgICAgKiBAcGFyYW0gaGlzdG9yeUJveCB0aGUgYm94IHRvIHB1dCBpdCBpblxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2hpc3RvcnlXaXRoVXNlcklEKHVzZXJJRDogc3RyaW5nLCBoaXN0b3J5Qm94OiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBHZXQgdGhlIGdpZnQgaGlzdG9yeVxuICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeSA9IGF3YWl0IFV0aWwuZ2V0VXNlckdpZnRIaXN0b3J5KHVzZXJJRCk7XG4gICAgICAgIC8vIE9ubHkgZGlzcGxheSBhIGxpc3QgaWYgdGhlcmUgaXMgYSBoaXN0b3J5XG4gICAgICAgIGlmIChnaWZ0SGlzdG9yeS5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIERldGVybWluZSBQb2ludCAmIEZMIHRvdGFsIHZhbHVlc1xuICAgICAgICAgICAgY29uc3QgW3BvaW50c0luLCBwb2ludHNPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0UG9pbnRzJyk7XG4gICAgICAgICAgICBjb25zdCBbd2VkZ2VJbiwgd2VkZ2VPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0V2VkZ2UnKTtcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQb2ludHMgSW4vT3V0OiAke3BvaW50c0lufS8ke3BvaW50c091dH1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgV2VkZ2VzIEluL091dDogJHt3ZWRnZUlufS8ke3dlZGdlT3V0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgb3RoZXJVc2VyID0gZ2lmdEhpc3RvcnlbMF0ub3RoZXJfbmFtZTtcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbWVzc2FnZVxuICAgICAgICAgICAgaGlzdG9yeUJveC5pbm5lckhUTUwgPSBgWW91IGhhdmUgc2VudCAke3RoaXMuX3NlbmRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNPdXR9IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VPdXR9IEZMIHdlZGdlczwvc3Ryb25nPiB0byAke290aGVyVXNlcn0gYW5kIHJlY2VpdmVkICR7dGhpcy5fZ2V0U3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzSW59IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VJbn0gRkwgd2VkZ2VzPC9zdHJvbmc+Ljxocj5gO1xuICAgICAgICAgICAgLy8gQWRkIHRoZSBtZXNzYWdlIHRvIHRoZSBib3hcbiAgICAgICAgICAgIGhpc3RvcnlCb3guYXBwZW5kQ2hpbGQodGhpcy5fc2hvd0dpZnRzKGdpZnRIaXN0b3J5KSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBVc2VyIGdpZnQgaGlzdG9yeSBhZGRlZCEnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE5vIHVzZXIgZ2lmdCBoaXN0b3J5IGZvdW5kIHdpdGggJHt1c2VySUR9LmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIyMjIyBGaWxsIG91dCBoaXN0b3J5IGJveFxuICAgICAqIEBwYXJhbSBoaXN0b3J5Qm94IHRoZSBib3ggdG8gcHV0IGl0IGluXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBfaGlzdG9yeVdpdGhBbGwoaGlzdG9yeUJveDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBnaWZ0IGhpc3RvcnlcbiAgICAgICAgY29uc3QgZ2lmdEhpc3RvcnkgPSBhd2FpdCBVdGlsLmdldEFsbFVzZXJHaWZ0SGlzdG9yeSgpO1xuICAgICAgICAvLyBPbmx5IGRpc3BsYXkgYSBsaXN0IGlmIHRoZXJlIGlzIGEgaGlzdG9yeVxuICAgICAgICBpZiAoZ2lmdEhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgUG9pbnQgJiBGTCB0b3RhbCB2YWx1ZXNcbiAgICAgICAgICAgIGNvbnN0IFtwb2ludHNJbiwgcG9pbnRzT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFBvaW50cycpO1xuICAgICAgICAgICAgY29uc3QgW3dlZGdlSW4sIHdlZGdlT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFdlZGdlJyk7XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUG9pbnRzIEluL091dDogJHtwb2ludHNJbn0vJHtwb2ludHNPdXR9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFdlZGdlcyBJbi9PdXQ6ICR7d2VkZ2VJbn0vJHt3ZWRnZU91dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbWVzc2FnZVxuICAgICAgICAgICAgaGlzdG9yeUJveC5pbm5lckhUTUwgPSBgWW91IGhhdmUgc2VudCAke3RoaXMuX3NlbmRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNPdXR9IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VPdXR9IEZMIHdlZGdlczwvc3Ryb25nPiBhbmQgcmVjZWl2ZWQgJHt0aGlzLl9nZXRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNJbn0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZUlufSBGTCB3ZWRnZXM8L3N0cm9uZz4uPGhyPmA7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIG1lc3NhZ2UgdG8gdGhlIGJveFxuICAgICAgICAgICAgaGlzdG9yeUJveC5hcHBlbmRDaGlsZCh0aGlzLl9zaG93R2lmdHMoZ2lmdEhpc3RvcnkpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFVzZXIgZ2lmdCBoaXN0b3J5IGFkZGVkIScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gTm8gdXNlciBnaWZ0IGhpc3RvcnkgZm91bmQgZm9yIGN1cnJlbnQgdXNlci5gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgU3VtIHRoZSB2YWx1ZXMgb2YgYSBnaXZlbiBnaWZ0IHR5cGUgYXMgSW5mbG93ICYgT3V0ZmxvdyBzdW1zXG4gICAgICogQHBhcmFtIGhpc3RvcnkgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5XG4gICAgICogQHBhcmFtIHR5cGUgcG9pbnRzIG9yIHdlZGdlc1xuICAgICAqL1xuICAgIHByaXZhdGUgX3N1bUdpZnRzKFxuICAgICAgICBoaXN0b3J5OiBVc2VyR2lmdEhpc3RvcnlbXSxcbiAgICAgICAgdHlwZTogJ2dpZnRQb2ludHMnIHwgJ2dpZnRXZWRnZSdcbiAgICApOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICAgICAgY29uc3Qgb3V0ZmxvdyA9IFswXTtcbiAgICAgICAgY29uc3QgaW5mbG93ID0gWzBdO1xuICAgICAgICAvLyBPbmx5IHJldHJpZXZlIGFtb3VudHMgb2YgYSBzcGVjaWZpZWQgZ2lmdCB0eXBlXG4gICAgICAgIGhpc3RvcnkubWFwKChnaWZ0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZ2lmdC50eXBlID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgLy8gU3BsaXQgaW50byBJbmZsb3cvT3V0Zmxvd1xuICAgICAgICAgICAgICAgIGlmIChnaWZ0LmFtb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaW5mbG93LnB1c2goZ2lmdC5hbW91bnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG91dGZsb3cucHVzaChnaWZ0LmFtb3VudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gU3VtIGFsbCBpdGVtcyBpbiB0aGUgZmlsdGVyZWQgYXJyYXlcbiAgICAgICAgY29uc3Qgc3VtT3V0ID0gb3V0Zmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcbiAgICAgICAgY29uc3Qgc3VtSW4gPSBpbmZsb3cucmVkdWNlKChhY2N1bXVsYXRlLCBjdXJyZW50KSA9PiBhY2N1bXVsYXRlICsgY3VycmVudCk7XG4gICAgICAgIHJldHVybiBbc3VtSW4sIE1hdGguYWJzKHN1bU91dCldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgQ3JlYXRlcyBhIGxpc3Qgb2YgdGhlIG1vc3QgcmVjZW50IGdpZnRzXG4gICAgICogQHBhcmFtIGhpc3RvcnkgVGhlIGZ1bGwgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdHdvIHVzZXJzXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2hvd0dpZnRzKGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdKSB7XG4gICAgICAgIC8vIElmIHRoZSBnaWZ0IHdhcyBhIHdlZGdlLCByZXR1cm4gY3VzdG9tIHRleHRcbiAgICAgICAgY29uc3QgX3dlZGdlT3JQb2ludHMgPSAoZ2lmdDogVXNlckdpZnRIaXN0b3J5KTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIGlmIChnaWZ0LnR5cGUgPT09ICdnaWZ0UG9pbnRzJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtNYXRoLmFicyhnaWZ0LmFtb3VudCl9YDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2lmdC50eXBlID09PSAnZ2lmdFdlZGdlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnKEZMKSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgRXJyb3I6IHVua25vd24gZ2lmdCB0eXBlLi4uICR7Z2lmdC50eXBlfTogJHtnaWZ0LmFtb3VudH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIGEgbGlzdCBmb3IgdGhlIGhpc3RvcnlcbiAgICAgICAgY29uc3QgaGlzdG9yeUxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgICAgICBPYmplY3QuYXNzaWduKGhpc3RvcnlMaXN0LnN0eWxlLCB7XG4gICAgICAgICAgICBsaXN0U3R5bGU6ICdub25lJyxcbiAgICAgICAgICAgIHBhZGRpbmc6ICdpbml0aWFsJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwZW0nLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIExvb3Agb3ZlciBoaXN0b3J5IGl0ZW1zIGFuZCBhZGQgdG8gYW4gYXJyYXlcbiAgICAgICAgY29uc3QgZ2lmdHM6IHN0cmluZ1tdID0gaGlzdG9yeVxuICAgICAgICAgICAgLmZpbHRlcigoZ2lmdCkgPT4gZ2lmdC50eXBlID09PSAnZ2lmdFBvaW50cycgfHwgZ2lmdC50eXBlID09PSAnZ2lmdFdlZGdlJylcbiAgICAgICAgICAgIC5tYXAoKGdpZnQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgc29tZSBzdHlsaW5nIGRlcGVuZGluZyBvbiBwb3MvbmVnIG51bWJlcnNcbiAgICAgICAgICAgICAgICBsZXQgZmFuY3lHaWZ0QW1vdW50OiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgICAgICBsZXQgZnJvbVRvOiBzdHJpbmcgPSAnJztcblxuICAgICAgICAgICAgICAgIGlmIChnaWZ0LmFtb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fZ2V0U3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XG4gICAgICAgICAgICAgICAgICAgIGZyb21UbyA9ICdmcm9tJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmYW5jeUdpZnRBbW91bnQgPSBgJHt0aGlzLl9zZW5kU3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XG4gICAgICAgICAgICAgICAgICAgIGZyb21UbyA9ICd0byc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTWFrZSB0aGUgZGF0ZSByZWFkYWJsZVxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBVdGlsLnByZXR0eVNpdGVUaW1lKGdpZnQudGltZXN0YW1wLCB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxsaSBjbGFzcz0nbXBfZ2lmdEl0ZW0nPiR7ZGF0ZX0geW91ICR7ZmFuY3lHaWZ0QW1vdW50fSAke2Zyb21Ub30gPGEgaHJlZj0nL3UvJHtnaWZ0Lm90aGVyX3VzZXJpZH0nPiR7Z2lmdC5vdGhlcl9uYW1lfTwvYT48L2xpPmA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gQWRkIGhpc3RvcnkgaXRlbXMgdG8gdGhlIGxpc3RcbiAgICAgICAgaGlzdG9yeUxpc3QuaW5uZXJIVE1MID0gZ2lmdHMuam9pbignJyk7XG4gICAgICAgIHJldHVybiBoaXN0b3J5TGlzdDtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuY2xhc3MgTm90ZXMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ05vdGVzJyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXNlciBQYWdlcyddLFxuICAgICAgICBkZXNjOiAnQWRkcyBhIG5vdGVzIHRleHRib3gnLFxuICAgIH07XG5cbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICd0Ym9keSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICAvLyBMb2NhdGUgdGhlIHRhYmxlIHdpdGggdGhlIGNsYXNzIFwiY29sdGFibGVcIlxuICAgICAgICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb2x0YWJsZScpIGFzIEhUTUxUYWJsZUVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKHRhYmxlKSB7XG4gICAgICAgICAgICBsZXQgdGJvZHkgPSB0YWJsZS5xdWVyeVNlbGVjdG9yKCd0Ym9keScpO1xuXG4gICAgICAgICAgICBjb25zdCB1c2VySUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL1xcL3VcXC8oXFxkKykvKT8uWzFdO1xuICAgICAgICAgICAgaWYgKCF1c2VySUQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVXNlciBJRCBub3QgZm91bmQgaW4gVVJMLlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld1JvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG4gICAgICAgICAgICBjb25zdCBuZXdDZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgICAgIG5ld0NlbGwuc2V0QXR0cmlidXRlKCdjb2xzcGFuJywgJzInKTtcbiAgICAgICAgICAgIG5ld0NlbGwuc2V0QXR0cmlidXRlKCdjbGFzcycsICdyb3cxJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGlucHV0RmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICAgICAgaW5wdXRGaWVsZC5yb3dzID0gNDtcbiAgICAgICAgICAgIGlucHV0RmllbGQuY29scyA9IDEwMDtcbiAgICAgICAgICAgIGlucHV0RmllbGQucGxhY2Vob2xkZXIgPSAnRW50ZXIgeW91ciBub3RlcyBoZXJlJztcbiAgICAgICAgICAgIGlucHV0RmllbGQudmFsdWUgPSBHTV9nZXRWYWx1ZShgdXNlcl9ub3Rlc18ke3VzZXJJRH1fdmFsYCwgJycpO1xuXG4gICAgICAgICAgICBjb25zdCBzYXZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBzYXZlQnV0dG9uLnRleHRDb250ZW50ID0gJ1NhdmUgTm90ZSc7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgXCJTYXZlZCFcIiBtZXNzYWdlIHNwYW5cbiAgICAgICAgICAgIGNvbnN0IHNhdmVkTWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHNhdmVkTWVzc2FnZS5jbGFzc05hbWUgPSAnbXBfc2F2ZXN0YXRlJzsgLy8gQXBwbHkgdGhlIHN0eWxlIHNpbWlsYXIgdG8gdGhlIGV4YW1wbGVcbiAgICAgICAgICAgIHNhdmVkTWVzc2FnZS50ZXh0Q29udGVudCA9ICdTYXZlZCEnO1xuICAgICAgICAgICAgc2F2ZWRNZXNzYWdlLnN0eWxlLm9wYWNpdHkgPSAnMCc7IC8vIFN0YXJ0IGhpZGRlblxuXG4gICAgICAgICAgICAvLyBBZGQgYSBjbGljayBldmVudCBsaXN0ZW5lciB0byBzYXZlIHRoZSBub3RlIGFuZCBkaXNwbGF5IFwiU2F2ZWQhXCIgbWVzc2FnZVxuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RlVmFsdWUgPSBpbnB1dEZpZWxkLnZhbHVlLnRyaW0oKTtcblxuICAgICAgICAgICAgICAgIGlmIChub3RlVmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIEdNX2RlbGV0ZVZhbHVlKGB1c2VyX25vdGVzXyR7dXNlcklEfV92YWxgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5vdGUgZm9yIHVzZXIgJHt1c2VySUR9IGhhcyBiZWVuIGNsZWFyZWQuYCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYHVzZXJfbm90ZXNfJHt1c2VySUR9X3ZhbGAsIG5vdGVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RlIGZvciB1c2VyICR7dXNlcklEfSBzYXZlZDogJHtub3RlVmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU2hvdyB0aGUgXCJTYXZlZCFcIiBtZXNzYWdlIGJyaWVmbHlcbiAgICAgICAgICAgICAgICBzYXZlZE1lc3NhZ2Uuc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2F2ZWRNZXNzYWdlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICAgICAgICAgICAgfSwgMjAwMCk7IC8vIEhpZGUgYWZ0ZXIgMiBzZWNvbmRzXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbmV3Q2VsbC5hcHBlbmRDaGlsZChpbnB1dEZpZWxkKTtcbiAgICAgICAgICAgIG5ld0NlbGwuYXBwZW5kQ2hpbGQoc2F2ZUJ1dHRvbik7XG4gICAgICAgICAgICBuZXdDZWxsLmFwcGVuZENoaWxkKHNhdmVkTWVzc2FnZSk7IC8vIEFkZCB0aGUgXCJTYXZlZCFcIiBtZXNzYWdlIHNwYW4gdG8gdGhlIGNlbGxcbiAgICAgICAgICAgIG5ld1Jvdy5hcHBlbmRDaGlsZChuZXdDZWxsKTtcbiAgICAgICAgICAgIHRib2R5LmFwcGVuZENoaWxkKG5ld1Jvdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUYWJsZSB3aXRoIGNsYXNzIFwiY29sdGFibGVcIiBub3QgZm91bmQuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufSIsIi8qKlxuICogVkFVTFQgRkVBVFVSRVNcbiAqL1xuXG5jbGFzcyBTaW1wbGVWYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuVmF1bHQsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnc2ltcGxlVmF1bHQnLFxuICAgICAgICBkZXNjOlxuICAgICAgICAgICAgJ1NpbXBsaWZ5IHRoZSBWYXVsdCBwYWdlcy4gKDxlbT5UaGlzIHJlbW92ZXMgZXZlcnl0aGluZyBleGNlcHQgdGhlIGRvbmF0ZSBidXR0b24gJmFtcDsgbGlzdCBvZiByZWNlbnQgZG9uYXRpb25zPC9lbT4pJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd2YXVsdCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3Qgc3ViUGFnZTogc3RyaW5nID0gR01fZ2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBBcHBseWluZyBWYXVsdCAoJHtzdWJQYWdlfSkgc2V0dGluZ3MuLi5gKTtcblxuICAgICAgICAvLyBDbG9uZSB0aGUgaW1wb3J0YW50IHBhcnRzIGFuZCByZXNldCB0aGUgcGFnZVxuICAgICAgICBjb25zdCBkb25hdGVCdG46IEhUTUxGb3JtRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcbiAgICAgICAgY29uc3QgZG9uYXRlVGJsOiBIVE1MVGFibGVFbGVtZW50IHwgbnVsbCA9IHBhZ2UucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICd0YWJsZTpsYXN0LW9mLXR5cGUnXG4gICAgICAgICk7XG4gICAgICAgIHBhZ2UuaW5uZXJIVE1MID0gJyc7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBkb25hdGUgYnV0dG9uIGlmIGl0IGV4aXN0c1xuICAgICAgICBpZiAoZG9uYXRlQnRuICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdEb25hdGU6IEhUTUxGb3JtRWxlbWVudCA9IDxIVE1MRm9ybUVsZW1lbnQ+ZG9uYXRlQnRuLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3RG9uYXRlKTtcbiAgICAgICAgICAgIG5ld0RvbmF0ZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdlLmlubmVySFRNTCA9ICc8aDE+Q29tZSBiYWNrIHRvbW9ycm93ITwvaDE+JztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIHRhYmxlIGlmIGl0IGV4aXN0c1xuICAgICAgICBpZiAoZG9uYXRlVGJsICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IDxIVE1MVGFibGVFbGVtZW50PihcbiAgICAgICAgICAgICAgICBkb25hdGVUYmwuY2xvbmVOb2RlKHRydWUpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcGFnZS5hcHBlbmRDaGlsZChuZXdUYWJsZSk7XG4gICAgICAgICAgICBuZXdUYWJsZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdlLnN0eWxlLnBhZGRpbmdCb3R0b20gPSAnMjVweCc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2ltcGxpZmllZCB0aGUgdmF1bHQgcGFnZSEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuY2xhc3MgUG90SGlzdG9yeSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuVmF1bHQsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAncG90SGlzdG9yeScsXG4gICAgICAgIGRlc2M6ICdBZGQgdGhlIGxpc3Qgb2YgcmVjZW50IGRvbmF0aW9ucyB0byB0aGUgZG9uYXRpb24gcGFnZS4nLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5Cb2R5JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3ZhdWx0J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zdCBzdWJQYWdlOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcbiAgICAgICAgY29uc3QgcGFnZSA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGNvbnN0IGZvcm0gPSA8SFRNTEVsZW1lbnQ+KFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIgKyAnIGZvcm1bbWV0aG9kPVwicG9zdFwiXScpXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgcG90UGFnZVJlc3AgPSBhd2FpdCBmZXRjaCgnL21pbGxpb25haXJlcy9wb3QucGhwJyk7XG4gICAgICAgIGlmICghcG90UGFnZVJlc3Aub2spIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoXG4gICAgICAgICAgICAgICAgYGZhaWxlZCB0byBnZXQgL21pbGxpb25haXJlcy9wb3QucGhwOiAke3BvdFBhZ2VSZXNwLnN0YXR1c30vJHtwb3RQYWdlUmVzcC5zdGF0dXNUZXh0fWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5ncm91cChgQXBwbHlpbmcgVmF1bHQgKCR7c3ViUGFnZX0pIHNldHRpbmdzLi4uYCk7XG4gICAgICAgIGNvbnN0IHBvdFBhZ2VUZXh0OiBzdHJpbmcgPSBhd2FpdCBwb3RQYWdlUmVzcC50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICAgICAgY29uc3QgcG90UGFnZTogRG9jdW1lbnQgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHBvdFBhZ2VUZXh0LCAndGV4dC9odG1sJyk7XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIGltcG9ydGFudCBwYXJ0cyBhbmQgcmVzZXQgdGhlIHBhZ2VcbiAgICAgICAgY29uc3QgZG9uYXRlVGJsOiBIVE1MVGFibGVFbGVtZW50IHwgbnVsbCA9IHBvdFBhZ2UucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICcjbWFpblRhYmxlIHRhYmxlOmxhc3Qtb2YtdHlwZSdcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY3VycmVudFRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoJ3RhYmxlOmxhc3Qtb2YtdHlwZScpO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIHRhYmxlIGlmIGl0IGV4aXN0c1xuICAgICAgICBpZiAoZG9uYXRlVGJsICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IDxIVE1MVGFibGVFbGVtZW50PihcbiAgICAgICAgICAgICAgICBkb25hdGVUYmwuY2xvbmVOb2RlKHRydWUpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbmV3VGFibGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudFRibCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUYmwucmVwbGFjZVdpdGgobmV3VGFibGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JtICE9PSBudWxsICYmIGZvcm0ucGFyZW50RWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvcm0ucGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChuZXdUYWJsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBkb25hdGlvbiBoaXN0b3J5IHRvIHRoZSBkb25hdGlvbiBwYWdlIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBTVE9SRSBGRUFUVVJFU1xuICovXG5cbmNsYXNzIEdyYXlPdXRTdG9yZVB1cmNoYXNlcyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU3RvcmUsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZ3JheU91dFN0b3JlUHVyY2hhc2VzJyxcbiAgICAgICAgZGVzYzogXCJHcmF5IG91dCBzdG9yZSBwdXJjaGFzZXMgeW91IGNhbid0IGFmZm9yZCwgYW5kIGRpc2FibGUgdGhvc2UgYnV0dG9uc1wiLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2N1cnJlbnRCb251c1BvaW50cyc7XG4gICAgcHJpdmF0ZSBfbWF4VmlwRGF5czogbnVtYmVyID0gOTA7XG4gICAgcHJpdmF0ZSBfcG9pbnRzUGVyR2JVcGxvYWQ6IG51bWJlciA9IDUwMDtcbiAgICBwcml2YXRlIF9wb2ludHNQZXJWaXBCbG9jazogbnVtYmVyID0gNTAwMDtcbiAgICBwcml2YXRlIF92aXBCbG9ja1dlZWtzOiBudW1iZXIgPSA0O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc3RvcmUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IHRoaXMuX2dldEN1cnJlbmN5KCcjY3VycmVudEJvbnVzUG9pbnRzJyk7XG4gICAgICAgIGNvbnN0IGNoZWVzZSA9IHRoaXMuX2dldEN1cnJlbmN5KCcjY3VycmVudENoZWVzZScpO1xuICAgICAgICBjb25zdCB2aXBSZW1haW5pbmdEYXlzID0gdGhpcy5fZ2V0VmlwUmVtYWluaW5nRGF5cygpO1xuICAgICAgICBjb25zdCBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICcjbWFpbkJvZHkgLmJvbnVzUm93IGJ1dHRvbidcbiAgICAgICAgKSBhcyBOb2RlTGlzdE9mPEhUTUxCdXR0b25FbGVtZW50PjtcblxuICAgICAgICBidXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVhc29uID0gdGhpcy5fZ2V0RGlzYWJsZVJlYXNvbihcbiAgICAgICAgICAgICAgICBidXR0b24sXG4gICAgICAgICAgICAgICAgcG9pbnRzLFxuICAgICAgICAgICAgICAgIGNoZWVzZSxcbiAgICAgICAgICAgICAgICB2aXBSZW1haW5pbmdEYXlzXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAocmVhc29uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZVB1cmNoYXNlKGJ1dHRvbiwgcmVhc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbWFya0Rpc2FibGVkU2VjdGlvbnMoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJbTStdIERpc2FibGVkIHN0b3JlIHB1cmNoYXNlcyB5b3UgY2FuJ3QgYWZmb3JkIVwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRDdXJyZW5jeShzZWxlY3Rvcjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWxlbSA9PT0gbnVsbCB8fCBlbGVtLnRleHRDb250ZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZUludChlbGVtLnRleHRDb250ZW50LnJlcGxhY2UoL1teXFxkXS9nLCAnJyksIDEwKSB8fCAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFZpcFJlbWFpbmluZ0RheXMoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHVzZXJNZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3VzZXJNZW51ICsgdWwnKTtcbiAgICAgICAgY29uc3QgbWVudVRleHQgPSB1c2VyTWVudSAmJiB1c2VyTWVudS50ZXh0Q29udGVudCA/IHVzZXJNZW51LnRleHRDb250ZW50IDogJyc7XG5cbiAgICAgICAgaWYgKC9FLVZJUHxWSVAgbm90IHNldCB0byBleHBpcmV8ZXRlcm5hbC9pLnRlc3QobWVudVRleHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0ZU1hdGNoID0gbWVudVRleHQubWF0Y2goXG4gICAgICAgICAgICAvVklQIGV4cGlyZXMoPzpcXHMrb24pP1xccysoW0EtWmEtel17Myw5fVxccytcXGR7MSwyfSw/XFxzK1xcZHs0fXxcXGR7NH0tXFxkezJ9LVxcZHsyfSkvaVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChkYXRlTWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXhwaXJ5ID0gbmV3IERhdGUoZGF0ZU1hdGNoWzFdKTtcbiAgICAgICAgaWYgKGlzTmFOKGV4cGlyeS5nZXRUaW1lKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBNYXRoLmNlaWwoKGV4cGlyeS5nZXRUaW1lKCkgLSBEYXRlLm5vdygpKSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXREaXNhYmxlUmVhc29uKFxuICAgICAgICBidXR0b246IEhUTUxCdXR0b25FbGVtZW50LFxuICAgICAgICBwb2ludHM6IG51bWJlcixcbiAgICAgICAgY2hlZXNlOiBudW1iZXIsXG4gICAgICAgIHZpcFJlbWFpbmluZ0RheXM6IG51bWJlciB8IG51bGxcbiAgICApOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRoaXMuX2dldFN0b3JlU2VjdGlvbihidXR0b24pO1xuICAgICAgICBjb25zdCBmaXhlZENvc3QgPSB0aGlzLl9nZXRGaXhlZENvc3QoYnV0dG9uKTtcblxuICAgICAgICBpZiAoZml4ZWRDb3N0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoZml4ZWRDb3N0LmtpbmQgPT09ICdwb2ludHMnICYmIGZpeGVkQ29zdC5hbW91bnQgPiBwb2ludHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ05vdCBlbm91Z2ggYm9udXMgcG9pbnRzJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpeGVkQ29zdC5raW5kID09PSAnY2hlZXNlJyAmJiBmaXhlZENvc3QuYW1vdW50ID4gY2hlZXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdOb3QgZW5vdWdoIGNoZWVzZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VjdGlvbiA9PT0gJ3VwbG9hZENyZWRpdENvbnRlbnQnICYmIHRoaXMuX2lzVXBsb2FkTWF4QnV0dG9uKGJ1dHRvbikpIHtcbiAgICAgICAgICAgIGlmIChwb2ludHMgPCB0aGlzLl9wb2ludHNQZXJHYlVwbG9hZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnTmVlZCBhdCBsZWFzdCA1MDAgYm9udXMgcG9pbnRzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWN0aW9uID09PSAndmlwU3RhdHVzQ29udGVudCcpIHtcbiAgICAgICAgICAgIGlmICh2aXBSZW1haW5pbmdEYXlzID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0V0ZXJuYWwgVklQIGNhbm5vdCBidXkgbW9yZSBWSVAnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgdGhpcy5fd291bGRFeGNlZWRWaXBMaW1pdChidXR0b24sIHZpcFJlbWFpbmluZ0RheXMpICYmXG4gICAgICAgICAgICAgICAgdmlwUmVtYWluaW5nRGF5cyAhPT0gbnVsbFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdXb3VsZCBleGNlZWQgdGhlIDkwIGRheSBWSVAgbGltaXQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5faXNWaXBNYXhCdXR0b24oYnV0dG9uKSAmJiBwb2ludHMgPCB0aGlzLl9wb2ludHNQZXJWaXBCbG9jaykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnTmVlZCBhdCBsZWFzdCA1MDAwIGJvbnVzIHBvaW50cyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRTdG9yZVNlY3Rpb24oYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSBidXR0b24uY2xvc2VzdCgnZGl2LmJvbnVzUm93Jyk7XG5cbiAgICAgICAgaWYgKHNlY3Rpb24gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBBcnJheS5mcm9tKHNlY3Rpb24uY2xhc3NMaXN0KTtcbiAgICAgICAgY29uc3QgY29udGVudENsYXNzID0gY2xhc3Nlcy5maW5kKChpdGVtKSA9PiBpdGVtLmVuZHNXaXRoKCdDb250ZW50JykpO1xuXG4gICAgICAgIHJldHVybiBjb250ZW50Q2xhc3MgIT09IHVuZGVmaW5lZCA/IGNvbnRlbnRDbGFzcyA6ICcnO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEZpeGVkQ29zdChcbiAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudFxuICAgICk6IHsga2luZDogJ3BvaW50cycgfCAnY2hlZXNlJzsgYW1vdW50OiBudW1iZXIgfSB8IG51bGwge1xuICAgICAgICBjb25zdCB0aXRsZSA9IGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ3RpdGxlJyk7XG5cbiAgICAgICAgaWYgKHRpdGxlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvaW50cyA9IHRpdGxlLm1hdGNoKC8oW1xcZCxdKylcXHMrcG9pbnRzL2kpO1xuICAgICAgICBpZiAocG9pbnRzICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdwb2ludHMnLFxuICAgICAgICAgICAgICAgIGFtb3VudDogcGFyc2VJbnQocG9pbnRzWzFdLnJlcGxhY2UoLywvZywgJycpLCAxMCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hlZXNlID0gdGl0bGUubWF0Y2goLyhbXFxkLF0rKVxccytjaGVlc2UvaSk7XG4gICAgICAgIGlmIChjaGVlc2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2luZDogJ2NoZWVzZScsXG4gICAgICAgICAgICAgICAgYW1vdW50OiBwYXJzZUludChjaGVlc2VbMV0ucmVwbGFjZSgvLC9nLCAnJyksIDEwKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pc1VwbG9hZE1heEJ1dHRvbihidXR0b246IEhUTUxCdXR0b25FbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBidXR0b24udGV4dENvbnRlbnQgIT09IG51bGwgJiYgYnV0dG9uLnRleHRDb250ZW50LmluZGV4T2YoJ01heCcpID4gLTE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaXNWaXBNYXhCdXR0b24oYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gYnV0dG9uLnZhbHVlID09PSAnbWF4JztcbiAgICB9XG5cbiAgICBwcml2YXRlIF93b3VsZEV4Y2VlZFZpcExpbWl0KFxuICAgICAgICBidXR0b246IEhUTUxCdXR0b25FbGVtZW50LFxuICAgICAgICB2aXBSZW1haW5pbmdEYXlzOiBudW1iZXIgfCBudWxsXG4gICAgKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh2aXBSZW1haW5pbmdEYXlzID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNWaXBNYXhCdXR0b24oYnV0dG9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZpcFJlbWFpbmluZ0RheXMgPj0gdGhpcy5fbWF4VmlwRGF5cztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdlZWtzVG9CdXkgPSBwYXJzZUludChidXR0b24udmFsdWUsIDEwKTtcbiAgICAgICAgaWYgKGlzTmFOKHdlZWtzVG9CdXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXlzVG9CdXkgPSB3ZWVrc1RvQnV5ICogNztcbiAgICAgICAgcmV0dXJuIHZpcFJlbWFpbmluZ0RheXMgKyBkYXlzVG9CdXkgPiB0aGlzLl9tYXhWaXBEYXlzO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2Rpc2FibGVQdXJjaGFzZShidXR0b246IEhUTUxCdXR0b25FbGVtZW50LCByZWFzb246IHN0cmluZykge1xuICAgICAgICBidXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnbXBfc3RvcmVfZGlzYWJsZWQnKTtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgIGJ1dHRvbi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaXRsZSA9IGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ3RpdGxlJyk7XG4gICAgICAgIGlmIChjdXJyZW50VGl0bGUgIT09IG51bGwgJiYgY3VycmVudFRpdGxlLmluZGV4T2YocmVhc29uKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYCR7Y3VycmVudFRpdGxlfSB8ICR7cmVhc29ufWApO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRUaXRsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgndGl0bGUnLCByZWFzb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbWFya0Rpc2FibGVkU2VjdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IHNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICcjbWFpbkJvZHkgZGl2LmJvbnVzUm93W2NsYXNzKj1cIkNvbnRlbnRcIl0nXG4gICAgICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MRGl2RWxlbWVudD47XG5cbiAgICAgICAgc2VjdGlvbnMuZm9yRWFjaCgoc2VjdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnV0dG9ucyA9IHNlY3Rpb24ucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBpZiAoYnV0dG9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGVuYWJsZWQgPSBBcnJheS5mcm9tKGJ1dHRvbnMpLnNvbWUoKGJ1dHRvbikgPT4gIWJ1dHRvbi5kaXNhYmxlZCk7XG4gICAgICAgICAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBzZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ21wX3N0b3JlX2Rpc2FibGVkX3NlY3Rpb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIENvc3RUb1NldFJhdGlvIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlN0b3JlLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAnc3RvcmVUYXJnZXRSYXRpbycsXG4gICAgICAgIHRhZzogJ1RhcmdldCBSYXRpbycsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDUnLFxuICAgICAgICBkZXNjOiAnRGlzcGxheSBob3cgbXVjaCB1cGxvYWQgY3JlZGl0IHlvdSBuZWVkIHRvIGJ1eSB0byByZWFjaCBhIHRhcmdldCByYXRpbycsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcudXBsb2FkQ3JlZGl0Q29udGVudCc7XG4gICAgcHJpdmF0ZSBfb3V0cHV0SUQ6IHN0cmluZyA9ICdtcF9zdG9yZVRhcmdldFJhdGlvJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3N0b3JlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5fd2F0Y2hGb3JDaGFuZ2VzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIGNvc3QgdG8gc2V0IHJhdGlvIHRvIHRoZSBzdG9yZSBwYWdlIScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlbmRlcigpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0UmF0aW8gPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfV92YWxgKSk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3RhcikgYXMgSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuXG4gICAgICAgIGlmIChjb250ZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb3V0cHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5fb3V0cHV0SUQpIGFzIEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgaWYgKG91dHB1dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgb3V0cHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBvdXRwdXQuaWQgPSB0aGlzLl9vdXRwdXRJRDtcbiAgICAgICAgICAgIG91dHB1dC5jbGFzc05hbWUgPSAnbXBfc3RvcmVfcmF0aW9UYXJnZXQnO1xuICAgICAgICAgICAgY29udGVudC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyYmVnaW4nLCBvdXRwdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzTmFOKHRhcmdldFJhdGlvKSB8fCB0YXJnZXRSYXRpbyA8PSAwKSB7XG4gICAgICAgICAgICBvdXRwdXQudGV4dENvbnRlbnQgPSAnRW50ZXIgYSB2YWxpZCB0YXJnZXQgcmF0aW8gaW4gTUFNKyBzZXR0aW5ncyB0byBzZWUgdGhlIHVwbG9hZCBjcmVkaXQgY29zdC4nO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudFJhdGlvID0gdGhpcy5fZ2V0UmF0aW8oKTtcbiAgICAgICAgY29uc3QgdXBsb2FkZWRCeXRlcyA9IHRoaXMuX2dldEJ5dGVzKCcjdXBsb2FkZWRURCcpO1xuICAgICAgICBjb25zdCBkb3dubG9hZGVkQnl0ZXMgPSB0aGlzLl9nZXRCeXRlcygnI2Rvd25sb2FkZWRURCcpO1xuXG4gICAgICAgIGlmIChjdXJyZW50UmF0aW8gPT09IG51bGwgfHwgdXBsb2FkZWRCeXRlcyA9PT0gbnVsbCB8fCBkb3dubG9hZGVkQnl0ZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG91dHB1dC50ZXh0Q29udGVudCA9XG4gICAgICAgICAgICAgICAgJ0NvdWxkIG5vdCBkZXRlcm1pbmUgeW91ciBjdXJyZW50IHJhdGlvIGFuZCB0b3RhbHMgZm9yIHRoZSB0YXJnZXQtcmF0aW8gY2FsY3VsYXRpb24uJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVwbG9hZE5lZWRlZEJ5dGVzID0gVXRpbC51cGxvYWROZWVkZWRGb3JUYXJnZXRSYXRpbyhcbiAgICAgICAgICAgIHVwbG9hZGVkQnl0ZXMsXG4gICAgICAgICAgICBkb3dubG9hZGVkQnl0ZXMsXG4gICAgICAgICAgICB0YXJnZXRSYXRpb1xuICAgICAgICApO1xuXG4gICAgICAgIGlmICh1cGxvYWROZWVkZWRCeXRlcyA8PSAwKSB7XG4gICAgICAgICAgICBvdXRwdXQuaW5uZXJIVE1MID0gYDxzdHJvbmc+VGFyZ2V0IFJhdGlvOjwvc3Ryb25nPiBZb3VyIGN1cnJlbnQgcmF0aW8gb2YgJHtjdXJyZW50UmF0aW8udG9GaXhlZChcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICApfSBhbHJlYWR5IG1lZXRzIG9yIGV4Y2VlZHMgJHt0YXJnZXRSYXRpby50b0ZpeGVkKDIpfS5gO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG9pbnRzTmVlZGVkID0gTWF0aC5jZWlsKCh1cGxvYWROZWVkZWRCeXRlcyAvIE1hdGgucG93KDEwMjQsIDMpKSAqIDUwMCk7XG4gICAgICAgIG91dHB1dC5pbm5lckhUTUwgPSBgPHN0cm9uZz5UYXJnZXQgUmF0aW86PC9zdHJvbmc+IEJ1eSA8c3Ryb25nPiR7VXRpbC5mb3JtYXRCeXRlcyhcbiAgICAgICAgICAgIHVwbG9hZE5lZWRlZEJ5dGVzXG4gICAgICAgICl9PC9zdHJvbmc+IG9mIHVwbG9hZCBjcmVkaXQgKCR7cG9pbnRzTmVlZGVkLnRvTG9jYWxlU3RyaW5nKCl9IEJQKSB0byByZWFjaCByYXRpbyA8c3Ryb25nPiR7dGFyZ2V0UmF0aW8udG9GaXhlZChcbiAgICAgICAgICAgIDJcbiAgICAgICAgKX08L3N0cm9uZz4uYDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF93YXRjaEZvckNoYW5nZXMoKSB7XG4gICAgICAgIGNvbnN0IHdhdGNoVGFyZ2V0cyA9IFsnI3RtUicsICcjdXBsb2FkZWRURCcsICcjZG93bmxvYWRlZFREJywgJyNjdXJyZW50Qm9udXNQb2ludHMnXVxuICAgICAgICAgICAgLm1hcCgoc2VsZWN0b3IpID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKVxuICAgICAgICAgICAgLmZpbHRlcigoZWxlbSk6IGVsZW0gaXMgSFRNTEVsZW1lbnQgPT4gZWxlbSAhPT0gbnVsbCk7XG5cbiAgICAgICAgaWYgKHdhdGNoVGFyZ2V0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdhdGNoVGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUodGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB1cGxvYWRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICcudXBsb2FkQ3JlZGl0Q29udGVudCBidXR0b24nXG4gICAgICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MQnV0dG9uRWxlbWVudD47XG4gICAgICAgIHVwbG9hZEJ1dHRvbnMuZm9yRWFjaCgoYnV0dG9uKSA9PiB7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy5fcmVuZGVyKCksIDI1MCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0UmF0aW8oKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHJhdGlvRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVIsICNSYXRpb1REJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgICBpZiAocmF0aW9FbGVtID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJhdGlvID0gVXRpbC5leHRyYWN0RmxvYXQocmF0aW9FbGVtKVswXTtcbiAgICAgICAgcmV0dXJuIGlzTmFOKHJhdGlvKSA/IG51bGwgOiByYXRpbztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRCeXRlcyhzZWxlY3Rvcjogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgICAgIGlmIChlbGVtID09PSBudWxsIHx8IGVsZW0udGV4dENvbnRlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBVdGlsLnBhcnNlU2l6ZVRvQnl0ZXMoZWxlbS50ZXh0Q29udGVudCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuIiwiLyoqXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFBMQUNFIEFMTCBNKyBGRUFUVVJFUyBIRVJFXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqXG4gKiBOZWFybHkgYWxsIGZlYXR1cmVzIGJlbG9uZyBoZXJlLCBhcyB0aGV5IHNob3VsZCBoYXZlIGludGVybmFsIGNoZWNrc1xuICogZm9yIERPTSBlbGVtZW50cyBhcyBuZWVkZWQuIE9ubHkgY29yZSBmZWF0dXJlcyBzaG91bGQgYmUgcGxhY2VkIGluIGBhcHAudHNgXG4gKlxuICogVGhpcyBkZXRlcm1pbmVzIHRoZSBvcmRlciBpbiB3aGljaCBzZXR0aW5ncyB3aWxsIGJlIGdlbmVyYXRlZCBvbiB0aGUgU2V0dGluZ3MgcGFnZS5cbiAqIFNldHRpbmdzIHdpbGwgYmUgZ3JvdXBlZCBieSB0eXBlIGFuZCBGZWF0dXJlcyBvZiBvbmUgdHlwZSB0aGF0IGFyZSBjYWxsZWQgYmVmb3JlXG4gKiBvdGhlciBGZWF0dXJlcyBvZiB0aGUgc2FtZSB0eXBlIHdpbGwgYXBwZWFyIGZpcnN0LlxuICpcbiAqIFRoZSBvcmRlciBvZiB0aGUgZmVhdHVyZSBncm91cHMgaXMgbm90IGRldGVybWluZWQgaGVyZS5cbiAqL1xuY2xhc3MgSW5pdEZlYXR1cmVzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBHbG9iYWwgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBIaWRlSG9tZSgpO1xuICAgICAgICBuZXcgQm9va21hcmtJY29ucygpO1xuICAgICAgICBuZXcgSGlkZVNlZWRib3goKTtcbiAgICAgICAgbmV3IEhpZGVEb25hdGlvbkJveCgpO1xuICAgICAgICBuZXcgQmx1cnJlZEhlYWRlcigpO1xuICAgICAgICBuZXcgVmF1bHRMaW5rKCk7XG4gICAgICAgIG5ldyBNaW5pVmF1bHRJbmZvKCk7XG4gICAgICAgIG5ldyBCb251c1BvaW50RGVsdGEoKTtcbiAgICAgICAgbmV3IEZpeGVkTmF2KCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBIb21lIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBIaWRlTmV3cygpO1xuICAgICAgICBuZXcgR2lmdE5ld2VzdCgpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2VhcmNoIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBUb2dnbGVTbmF0Y2hlZCgpO1xuICAgICAgICBuZXcgU3RpY2t5U25hdGNoZWRUb2dnbGUoKTtcbiAgICAgICAgbmV3IFRvZ2dsZUJvb2ttYXJrZWQoKTtcbiAgICAgICAgbmV3IFN0aWNreUJvb2ttYXJrZWRUb2dnbGUoKTtcbiAgICAgICAgbmV3IFBsYWludGV4dFNlYXJjaCgpO1xuICAgICAgICBuZXcgVG9nZ2xlU2VhcmNoYm94KCk7XG4gICAgICAgIG5ldyBGaWxldHlwZVNlYXJjaEZpbHRlcigpO1xuICAgICAgICBuZXcgQnVpbGRUYWdzKCk7XG4gICAgICAgIG5ldyBNdWx0aVNlbGVjdEJyb3dzZSgpO1xuICAgICAgICBuZXcgUmFuZG9tQm9vaygpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgRnJlZWxlZWNoIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBDb2xsYXBzZUZyZWVsZWVjaFNlY3Rpb25zKCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBSZXF1ZXN0IFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBHb29kcmVhZHNCdXR0b25SZXEoKTtcbiAgICAgICAgbmV3IFRvZ2dsZUhpZGRlblJlcXVlc3RlcnMoKTtcbiAgICAgICAgbmV3IFBsYWludGV4dFJlcXVlc3QoKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFRvcnJlbnQgUGFnZSBmdW5jdGlvbnNcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvbigpO1xuICAgICAgICBuZXcgU3RvcnlHcmFwaEJ1dHRvbigpO1xuICAgICAgICBuZXcgQXVkaWJsZUJ1dHRvbigpO1xuICAgICAgICBuZXcgQ3VycmVudGx5UmVhZGluZygpO1xuICAgICAgICBuZXcgVG9yR2lmdERlZmF1bHQoKTtcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdCgpO1xuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0SWNvbnMoKTtcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEwxKCk7XG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMigpO1xuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDMoKTtcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdE1pbigpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2hvdXRib3ggZnVuY3Rpb25zXG4gICAgICAgIG5ldyBQcmlvcml0eVVzZXJzKCk7XG4gICAgICAgIG5ldyBQcmlvcml0eVN0eWxlKCk7XG4gICAgICAgIG5ldyBNdXRlZFVzZXJzKCk7XG4gICAgICAgIG5ldyBHaWZ0QnV0dG9uKCk7XG4gICAgICAgIG5ldyBRdWlja0VkaXRTaG91dCgpO1xuICAgICAgICBuZXcgU2hvdXRQcmV2aWV3KCk7XG4gICAgICAgIG5ldyBRdWlja1Nob3V0KCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBWYXVsdCBmdW5jdGlvbnNcbiAgICAgICAgbmV3IFNpbXBsZVZhdWx0KCk7XG4gICAgICAgIG5ldyBQb3RIaXN0b3J5KCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBTdG9yZSBmdW5jdGlvbnNcbiAgICAgICAgbmV3IEdyYXlPdXRTdG9yZVB1cmNoYXNlcygpO1xuICAgICAgICBuZXcgQ29zdFRvU2V0UmF0aW8oKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFVzZXIgUGFnZSBmdW5jdGlvbnNcbiAgICAgICAgbmV3IFVzZXJHaWZ0RGVmYXVsdCgpO1xuICAgICAgICBuZXcgVXNlckdpZnRIaXN0b3J5KCk7XG4gICAgICAgIG5ldyBOb3RlcygpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgRm9ydW0gUGFnZSBmdW5jdGlvbnNcbiAgICAgICAgbmV3IEZvcnVtRkxHaWZ0KCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVcGxvYWQgUGFnZSBmdW5jdGlvbnNcbiAgICAgICAgbmV3IFNlYXJjaEZvckR1cGxpY2F0ZXMoKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiY2hlY2sudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9jb3JlLnRzXCIgLz5cblxuLyoqXG4gKiBDbGFzcyBmb3IgaGFuZGxpbmcgc2V0dGluZ3MgYW5kIHRoZSBQcmVmZXJlbmNlcyBwYWdlXG4gKiBAbWV0aG9kIGluaXQ6IHR1cm5zIGZlYXR1cmVzJyBzZXR0aW5ncyBpbmZvIGludG8gYSB1c2VhYmxlIHRhYmxlXG4gKi9cbmNsYXNzIFNldHRpbmdzIHtcbiAgICAvLyBGdW5jdGlvbiBmb3IgZ2F0aGVyaW5nIHRoZSBuZWVkZWQgc2NvcGVzXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2dldFNjb3BlcyhzZXR0aW5nczogQW55RmVhdHVyZVtdKTogUHJvbWlzZTxTZXR0aW5nR2xvYk9iamVjdD4ge1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdfZ2V0U2NvcGVzKCcsIHNldHRpbmdzLCAnKScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2NvcGVMaXN0OiBTZXR0aW5nR2xvYk9iamVjdCA9IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBzZXR0aW5nIG9mIHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXg6IG51bWJlciA9IE51bWJlcihzZXR0aW5nLnNjb3BlKTtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgU2NvcGUgZXhpc3RzLCBwdXNoIHRoZSBzZXR0aW5ncyBpbnRvIHRoZSBhcnJheVxuICAgICAgICAgICAgICAgIGlmIChzY29wZUxpc3RbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0ucHVzaChzZXR0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBjcmVhdGUgdGhlIGFycmF5XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVMaXN0W2luZGV4XSA9IFtzZXR0aW5nXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKHNjb3BlTGlzdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIGZvciBjb25zdHJ1Y3RpbmcgdGhlIHRhYmxlIGZyb20gYW4gb2JqZWN0XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2J1aWxkVGFibGUocGFnZTogU2V0dGluZ0dsb2JPYmplY3QpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdfYnVpbGRUYWJsZSgnLCBwYWdlLCAnKScpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGxldCBvdXRwID0gYDx0Ym9keT48dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGJyPjxzdHJvbmc+TUFNKyB2JHtcbiAgICAgICAgICAgICAgICBNUC5WRVJTSU9OXG4gICAgICAgICAgICB9PC9zdHJvbmc+IC0gSGVyZSB5b3UgY2FuIGVuYWJsZSAmYW1wOyBkaXNhYmxlIGFueSBmZWF0dXJlIGZyb20gdGhlIDxhIGhyZWY9XCIvZi90LzQxODYzXCI+TUFNKyB1c2Vyc2NyaXB0PC9hPiEgSG93ZXZlciwgdGhlc2Ugc2V0dGluZ3MgYXJlIDxzdHJvbmc+Tk9UPC9zdHJvbmc+IHN0b3JlZCBvbiBNQU07IHRoZXkgYXJlIHN0b3JlZCB3aXRoaW4gdGhlIFRhbXBlcm1vbmtleS9HcmVhc2Vtb25rZXkgZXh0ZW5zaW9uIGluIHlvdXIgYnJvd3NlciwgYW5kIG11c3QgYmUgY3VzdG9taXplZCBvbiBlYWNoIG9mIHlvdXIgYnJvd3NlcnMvZGV2aWNlcyBzZXBhcmF0ZWx5Ljxicj48YnI+Rm9yIGEgZGV0YWlsZWQgbG9vayBhdCB0aGUgYXZhaWxhYmxlIGZlYXR1cmVzLCA8YSBocmVmPVwiJHtVdGlsLmRlcmVmZXIoXG4gICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9nYXJkZW5zaGFkZS9tYW0tcGx1cy93aWtpL0ZlYXR1cmUtT3ZlcnZpZXcnXG4gICAgICAgICAgICApfVwiPmNoZWNrIHRoZSBXaWtpITwvYT48YnI+PGJyPjwvdGQ+PC90cj5gO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlKS5mb3JFYWNoKChzY29wZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjb3BlTnVtOiBudW1iZXIgPSBOdW1iZXIoc2NvcGUpO1xuICAgICAgICAgICAgICAgIC8vIEluc2VydCB0aGUgc2VjdGlvbiB0aXRsZVxuICAgICAgICAgICAgICAgIG91dHAgKz0gYDx0cj48dGQgY2xhc3M9J3JvdzInPiR7U2V0dGluZ0dyb3VwW3Njb3BlTnVtXX08L3RkPjx0ZCBjbGFzcz0ncm93MSc+YDtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIGlucHV0IGZpZWxkIGJhc2VkIG9uIHRoZSBzZXR0aW5nXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZVtzY29wZU51bV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ051bWJlcjogbnVtYmVyID0gTnVtYmVyKHNldHRpbmcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtOiBBbnlGZWF0dXJlID0gcGFnZVtzY29wZU51bV1bc2V0dGluZ051bWJlcl07XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxpbnB1dCB0eXBlPSdjaGVja2JveCcgaWQ9JyR7aXRlbS50aXRsZX0nIHZhbHVlPSd0cnVlJz4ke2l0ZW0uZGVzY308YnI+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9JyR7aXRlbS50aXRsZX0nIHBsYWNlaG9sZGVyPScke2l0ZW0ucGxhY2Vob2xkZXJ9JyBjbGFzcz0nbXBfdGV4dElucHV0JyBzaXplPScyNSc+JHtpdGVtLmRlc2N9PGJyPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8c3BhbiBjbGFzcz0nbXBfc2V0VGFnJz4ke2l0ZW0udGFnfTo8L3NwYW4+IDxzZWxlY3QgaWQ9JyR7aXRlbS50aXRsZX0nIGNsYXNzPSdtcF9kcm9wSW5wdXQnPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhpdGVtLm9wdGlvbnMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPG9wdGlvbiB2YWx1ZT0nJHtrZXl9Jz4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3B0aW9ucyFba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTwvb3B0aW9uPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8L3NlbGVjdD4ke2l0ZW0uZGVzY308YnI+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUpIGNhc2VzW2l0ZW0udHlwZV0oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgcm93XG4gICAgICAgICAgICAgICAgb3V0cCArPSAnPC90ZD48L3RyPic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgc2F2ZSBidXR0b24gJiBsYXN0IHBhcnQgb2YgdGhlIHRhYmxlXG4gICAgICAgICAgICBvdXRwICs9XG4gICAgICAgICAgICAgICAgJzx0cj48dGQgY2xhc3M9XCJyb3cxXCIgY29sc3Bhbj1cIjJcIj48ZGl2IGlkPVwibXBfc3VibWl0XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+U2F2ZSBNKyBTZXR0aW5ncz8/PC9kaXY+PGRpdiBpZD1cIm1wX2NvcHlcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5Db3B5IFNldHRpbmdzPC9kaXY+PGRpdiBpZD1cIm1wX2luamVjdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlBhc3RlIFNldHRpbmdzPC9kaXY+PHNwYW4gY2xhc3M9XCJtcF9zYXZlc3RhdGVcIiBzdHlsZT1cIm9wYWNpdHk6MFwiPlNhdmVkITwvc3Bhbj48L3RkPjwvdHI+PC90Ym9keT4nO1xuXG4gICAgICAgICAgICByZXNvbHZlKG91dHApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgY3VycmVudCBzZXR0aW5ncyB2YWx1ZXNcbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0U2V0dGluZ3MocGFnZTogU2V0dGluZ0dsb2JPYmplY3QpIHtcbiAgICAgICAgLy8gVXRpbC5wdXJnZVNldHRpbmdzKCk7XG4gICAgICAgIGNvbnN0IGFsbFZhbHVlczogc3RyaW5nW10gPSBHTV9saXN0VmFsdWVzKCk7XG4gICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ19nZXRTZXR0aW5ncygnLCBwYWdlLCAnKVxcblN0b3JlZCBHTSBrZXlzOicsIGFsbFZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2VbTnVtYmVyKHNjb3BlKV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmID0gcGFnZVtOdW1iZXIoc2NvcGUpXVtOdW1iZXIoc2V0dGluZyldO1xuXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1ByZWY6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWYudGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnfCBTZXQ6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAnfCBWYWx1ZTonLFxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWYudGl0bGUpIVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUocHJlZi50aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSAmJiBHTV9nZXRWYWx1ZShwcmVmLnRpdGxlKSkgY2FzZXNbcHJlZi50eXBlXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBfc2V0U2V0dGluZ3Mob2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBfc2V0U2V0dGluZ3MoYCwgb2JqLCAnKScpO1xuICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKHNjb3BlKSA9PiB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmpbTnVtYmVyKHNjb3BlKV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmID0gb2JqW051bWJlcihzY29wZSldW051bWJlcihzZXR0aW5nKV07XG5cbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWYudGl0bGUpIVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbS5jaGVja2VkKSBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wOiBzdHJpbmcgPSBlbGVtLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGAsIGlucCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgZWxlbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSkgY2FzZXNbcHJlZi50eXBlXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2F2ZWQhJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NvcHlTZXR0aW5ncygpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBnbUxpc3QgPSBHTV9saXN0VmFsdWVzKCk7XG4gICAgICAgIGNvbnN0IG91dHA6IFtzdHJpbmcsIHN0cmluZ11bXSA9IFtdO1xuXG4gICAgICAgIC8vIExvb3Agb3ZlciBhbGwgc3RvcmVkIHNldHRpbmdzIGFuZCBwdXNoIHRvIG91dHB1dCBhcnJheVxuICAgICAgICBnbUxpc3QubWFwKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAvLyBEb24ndCBleHBvcnQgbXBfIHNldHRpbmdzIGFzIHRoZXkgc2hvdWxkIG9ubHkgYmUgc2V0IGF0IHJ1bnRpbWVcbiAgICAgICAgICAgIGlmIChzZXR0aW5nLmluZGV4T2YoJ21wXycpIDwgMCkge1xuICAgICAgICAgICAgICAgIG91dHAucHVzaChbc2V0dGluZywgR01fZ2V0VmFsdWUoc2V0dGluZyldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG91dHApO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIF9wYXN0ZVNldHRpbmdzKHBheWxvYWQ6IHN0cmluZykge1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9wYXN0ZVNldHRpbmdzKCApYCk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gSlNPTi5wYXJzZShwYXlsb2FkKTtcbiAgICAgICAgc2V0dGluZ3MuZm9yRWFjaCgodHVwbGU6IFtzdHJpbmcsIHN0cmluZ11bXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR1cGxlWzFdKSB7XG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYCR7dHVwbGVbMF19YCwgYCR7dHVwbGVbMV19YCk7XG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyh0dXBsZVswXSwgJzogJywgdHVwbGVbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0aGF0IHNhdmVzIHRoZSB2YWx1ZXMgb2YgdGhlIHNldHRpbmdzIHRhYmxlXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NhdmVTZXR0aW5ncyh0aW1lcjogbnVtYmVyLCBvYmo6IFNldHRpbmdHbG9iT2JqZWN0KSB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cChgX3NhdmVTZXR0aW5ncygpYCk7XG5cbiAgICAgICAgY29uc3Qgc2F2ZXN0YXRlOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ubXBfc2F2ZXN0YXRlJykhXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGdtVmFsdWVzOiBzdHJpbmdbXSA9IEdNX2xpc3RWYWx1ZXMoKTtcblxuICAgICAgICAvLyBSZXNldCB0aW1lciAmIG1lc3NhZ2VcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNhdmluZy4uLicpO1xuXG4gICAgICAgIC8vIExvb3Agb3ZlciBhbGwgdmFsdWVzIHN0b3JlZCBpbiBHTSBhbmQgcmVzZXQgZXZlcnl0aGluZ1xuICAgICAgICBmb3IgKGNvbnN0IGZlYXR1cmUgaW4gZ21WYWx1ZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZ21WYWx1ZXNbZmVhdHVyZV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGxvb3Agb3ZlciB2YWx1ZXMgdGhhdCBhcmUgZmVhdHVyZSBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIGlmICghWydtcF92ZXJzaW9uJywgJ3N0eWxlX3RoZW1lJ10uaW5jbHVkZXMoZ21WYWx1ZXNbZmVhdHVyZV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgbm90IHBhcnQgb2YgcHJlZmVyZW5jZXMgcGFnZVxuICAgICAgICAgICAgICAgICAgICBpZiAoZ21WYWx1ZXNbZmVhdHVyZV0uaW5kZXhPZignbXBfJykgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGdtVmFsdWVzW2ZlYXR1cmVdLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIHRoZSBzZXR0aW5ncyB0byBHTSB2YWx1ZXNcbiAgICAgICAgdGhpcy5fc2V0U2V0dGluZ3Mob2JqKTtcblxuICAgICAgICAvLyBEaXNwbGF5IHRoZSBjb25maXJtYXRpb24gbWVzc2FnZVxuICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgICAgICAgICAgfSwgMjM0NSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgc2V0dGluZ3MgcGFnZS5cbiAgICAgKiBAcGFyYW0gcmVzdWx0IFZhbHVlIHRoYXQgbXVzdCBiZSBwYXNzZWQgZG93biBmcm9tIGBDaGVjay5wYWdlKCdzZXR0aW5ncycpYFxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyBUaGUgYXJyYXkgb2YgZmVhdHVyZXMgdG8gcHJvdmlkZSBzZXR0aW5ncyBmb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGluaXQocmVzdWx0OiBib29sZWFuLCBzZXR0aW5nczogQW55RmVhdHVyZVtdKSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCBvbmx5IHJ1biBpZiBgQ2hlY2sucGFnZSgnc2V0dGluZ3MpYCByZXR1cm5zIHRydWUgJiBpcyBwYXNzZWQgaGVyZVxuICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwKGBuZXcgU2V0dGluZ3MoKWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNldHRpbmdzIHRhYmxlIGhhcyBsb2FkZWRcbiAgICAgICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcjbWFpbkJvZHkgPiB0YWJsZScpLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBbTStdIFN0YXJ0aW5nIHRvIGJ1aWxkIFNldHRpbmdzIHRhYmxlLi4uYCk7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyB0YWJsZSBlbGVtZW50c1xuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOYXY6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgPiB0YWJsZScpITtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nVGl0bGU6IEhUTUxIZWFkaW5nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gxJyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1RhYmxlOiBIVE1MVGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICAgICAgICAgICAgICBsZXQgcGFnZVNjb3BlOiBTZXR0aW5nR2xvYk9iamVjdDtcblxuICAgICAgICAgICAgICAgIC8vIEluc2VydCB0YWJsZSBlbGVtZW50cyBhZnRlciB0aGUgUHJlZiBuYXZiYXJcbiAgICAgICAgICAgICAgICBzZXR0aW5nTmF2Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBzZXR0aW5nVGl0bGUpO1xuICAgICAgICAgICAgICAgIHNldHRpbmdUaXRsZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgc2V0dGluZ1RhYmxlKTtcbiAgICAgICAgICAgICAgICBVdGlsLnNldEF0dHIoc2V0dGluZ1RhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnY29sdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICBjZWxsc3BhY2luZzogJzEnLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ3dpZHRoOjEwMCU7bWluLXdpZHRoOjEwMCU7bWF4LXdpZHRoOjEwMCU7JyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZXR0aW5nVGl0bGUuaW5uZXJIVE1MID0gJ01BTSsgU2V0dGluZ3MnO1xuICAgICAgICAgICAgICAgIC8vIEdyb3VwIHNldHRpbmdzIGJ5IHBhZ2VcbiAgICAgICAgICAgICAgICB0aGlzLl9nZXRTY29wZXMoc2V0dGluZ3MpXG4gICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRhYmxlIEhUTUwgZnJvbSBmZWF0dXJlIHNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VTY29wZSA9IHNjb3BlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9idWlsZFRhYmxlKHNjb3Blcyk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBjb250ZW50IGludG8gdGhlIG5ldyB0YWJsZSBlbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nVGFibGUuaW5uZXJIVE1MID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIE1BTSsgU2V0dGluZ3MgdGFibGUhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFnZVNjb3BlO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9nZXRTZXR0aW5ncyhzY29wZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlcztcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyBhcmUgZG9uZSBsb2FkaW5nXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Ym1pdEJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zdWJtaXQnKSFcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5QnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2NvcHknKSFcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXN0ZUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9pbmplY3QnKSFcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3NUaW1lcjogbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2F2ZVNldHRpbmdzKHNzVGltZXIsIHNjb3Blcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihwYXN0ZUJ0biwgdGhpcy5fcGFzdGVTZXR0aW5ncywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX2NvcHlTZXR0aW5ncygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwZXMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInN0eWxlLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2dsb2JhbC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2Jyb3dzZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2ZyZWVsZWVjaC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2ZvcnVtLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvaG9tZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3JlcXVlc3QudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9zaG91dC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3Rvci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3VwbG9hZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3VzZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy92YXVsdC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3N0b3JlLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJmZWF0dXJlcy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic2V0dGluZ3MudHNcIiAvPlxuXG4vKipcbiAqICogVXNlcnNjcmlwdCBuYW1lc3BhY2VcbiAqIEBjb25zdGFudCBDSEFOR0VMT0c6IE9iamVjdCBjb250YWluaW5nIGEgbGlzdCBvZiBjaGFuZ2VzIGFuZCBrbm93biBidWdzXG4gKiBAY29uc3RhbnQgVElNRVNUQU1QOiBQbGFjZWhvbGRlciBob29rIGZvciB0aGUgY3VycmVudCBidWlsZCB0aW1lXG4gKiBAY29uc3RhbnQgVkVSU0lPTjogVGhlIGN1cnJlbnQgdXNlcnNjcmlwdCB2ZXJzaW9uXG4gKiBAY29uc3RhbnQgUFJFVl9WRVI6IFRoZSBsYXN0IGluc3RhbGxlZCB1c2Vyc2NyaXB0IHZlcnNpb25cbiAqIEBjb25zdGFudCBFUlJPUkxPRzogVGhlIHRhcmdldCBhcnJheSBmb3IgbG9nZ2luZyBlcnJvcnNcbiAqIEBjb25zdGFudCBQQUdFX1BBVEg6IFRoZSBjdXJyZW50IHBhZ2UgVVJMIHdpdGhvdXQgdGhlIHNpdGUgYWRkcmVzc1xuICogQGNvbnN0YW50IE1QX0NTUzogVGhlIE1BTSsgc3R5bGVzaGVldFxuICogQGNvbnN0YW50IHJ1bigpOiBTdGFydHMgdGhlIHVzZXJzY3JpcHRcbiAqL1xubmFtZXNwYWNlIE1QIHtcbiAgICBleHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgnZGVidWcnKSA/IHRydWUgOiBmYWxzZTtcbiAgICBleHBvcnQgY29uc3QgQ0hBTkdFTE9HOiBBcnJheU9iamVjdCA9IHtcbiAgICAgICAgLyog8J+GleKZu++4j/CfkJ4gKi9cbiAgICAgICAgVVBEQVRFX0xJU1Q6IFtcbiAgICAgICAgICAgICfwn4aVOiBBZGRlZCBHaWZ0IEFsbCBidXR0b24gdG8gdGhlIE5ldyBVc2VycyBwYWdlLiBUaGFua3MgQHNoZXJtYW43NjQwMCEhIScsXG4gICAgICAgICAgICAn8J+GlTogQWRkZWQgYSBzcG90IHRvIHNhdmUgbm90ZXMgb24gdXNlciBwYWdlcy4gQWxzbyB0aGFua3MgQHNoZXJtYW43NjQwMCEnLFxuICAgICAgICBdIGFzIHN0cmluZ1tdLFxuICAgICAgICBCVUdfTElTVDogW10gYXMgc3RyaW5nW10sXG4gICAgfTtcbiAgICBleHBvcnQgY29uc3QgVElNRVNUQU1QOiBzdHJpbmcgPSAnIyNtZXRhX3RpbWVzdGFtcCMjJztcbiAgICBleHBvcnQgY29uc3QgVkVSU0lPTjogc3RyaW5nID0gQ2hlY2submV3VmVyO1xuICAgIGV4cG9ydCBjb25zdCBQUkVWX1ZFUjogc3RyaW5nIHwgdW5kZWZpbmVkID0gQ2hlY2sucHJldlZlcjtcbiAgICBleHBvcnQgY29uc3QgRVJST1JMT0c6IHN0cmluZ1tdID0gW107XG4gICAgZXhwb3J0IGNvbnN0IFBBR0VfUEFUSDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgIGV4cG9ydCBjb25zdCBNUF9DU1M6IFN0eWxlID0gbmV3IFN0eWxlKCk7XG4gICAgZXhwb3J0IGNvbnN0IHNldHRpbmdzR2xvYjogQW55RmVhdHVyZVtdID0gW107XG5cbiAgICBleHBvcnQgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogKiBQUkUgU0NSSVBUXG4gICAgICAgICAqL1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBXZWxjb21lIHRvIE1BTSsgdiR7VkVSU0lPTn0hYCk7XG5cbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgcGFnZSBpcyBub3QgeWV0IGtub3duXG4gICAgICAgIEdNX2RlbGV0ZVZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xuICAgICAgICBDaGVjay5wYWdlKCk7XG4gICAgICAgIC8vIEFkZCBhIHNpbXBsZSBjb29raWUgdG8gYW5ub3VuY2UgdGhlIHNjcmlwdCBpcyBiZWluZyB1c2VkXG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9ICdtcF9lbmFibGVkPTE7ZG9tYWluPW15YW5vbmFtb3VzZS5uZXQ7cGF0aD0vO3NhbWVzaXRlPWxheCc7XG4gICAgICAgIC8vIEluaXRpYWxpemUgY29yZSBmdW5jdGlvbnNcbiAgICAgICAgY29uc3QgYWxlcnRzOiBBbGVydHMgPSBuZXcgQWxlcnRzKCk7XG4gICAgICAgIG5ldyBEZWJ1ZygpO1xuICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgaWYgdGhlIHNjcmlwdCB3YXMgdXBkYXRlZFxuICAgICAgICBDaGVjay51cGRhdGVkKCkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSBhbGVydHMubm90aWZ5KHJlc3VsdCwgQ0hBTkdFTE9HKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGZlYXR1cmVzXG4gICAgICAgIG5ldyBJbml0RmVhdHVyZXMoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogKiBTRVRUSU5HU1xuICAgICAgICAgKi9cbiAgICAgICAgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1YlBnOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSAmJiAoc3ViUGcgPT09ICcnIHx8IHN1YlBnID09PSAnP3ZpZXc9Z2VuZXJhbCcpKSB7XG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2V0dGluZ3MgcGFnZVxuICAgICAgICAgICAgICAgIFNldHRpbmdzLmluaXQocmVzdWx0LCBzZXR0aW5nc0dsb2IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogKiBTVFlMRVNcbiAgICAgICAgICogSW5qZWN0cyBDU1NcbiAgICAgICAgICovXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBBZGQgY3VzdG9tIENTUyBzaGVldFxuICAgICAgICAgICAgTVBfQ1NTLmluamVjdExpbmsoKTtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBzaXRlIHRoZW1lXG4gICAgICAgICAgICBNUF9DU1MuYWxpZ25Ub1NpdGVUaGVtZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfTtcbn1cblxuLy8gKiBTdGFydCB0aGUgdXNlcnNjcmlwdFxuTVAucnVuKCk7XG4iXX0=
