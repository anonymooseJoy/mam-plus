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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL3NoYXJlZC50cyIsInNyYy9tb2R1bGVzL2Jyb3dzZS50cyIsInNyYy9tb2R1bGVzL2ZyZWVsZWVjaC50cyIsInNyYy9tb2R1bGVzL2ZvcnVtLnRzIiwic3JjL21vZHVsZXMvaG9tZS50cyIsInNyYy9tb2R1bGVzL3JlcXVlc3QudHMiLCJzcmMvbW9kdWxlcy9zaG91dC50cyIsInNyYy9tb2R1bGVzL3Rvci50cyIsInNyYy9tb2R1bGVzL3VwbG9hZC50cyIsInNyYy9tb2R1bGVzL3VzZXIudHMiLCJzcmMvbW9kdWxlcy92YXVsdC50cyIsInNyYy9tb2R1bGVzL3N0b3JlLnRzIiwic3JjL2ZlYXR1cmVzLnRzIiwic3JjL3NldHRpbmdzLnRzIiwic3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7R0FFRztBQW9CSCxJQUFLLFlBYUo7QUFiRCxXQUFLLFlBQVk7SUFDYixtREFBUSxDQUFBO0lBQ1IsK0NBQU0sQ0FBQTtJQUNOLG1EQUFRLENBQUE7SUFDUix1REFBVSxDQUFBO0lBQ1YsK0RBQWMsQ0FBQTtJQUNkLHVEQUFVLENBQUE7SUFDVixpREFBTyxDQUFBO0lBQ1AsaURBQU8sQ0FBQTtJQUNQLDJEQUFZLENBQUE7SUFDWiw2REFBYSxDQUFBO0lBQ2Isa0RBQU8sQ0FBQTtJQUNQLGtEQUFPLENBQUE7QUFDWCxDQUFDLEVBYkksWUFBWSxLQUFaLFlBQVksUUFhaEI7QUNuQ0Q7Ozs7R0FJRzs7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FB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QUFFLEtBQUYsRUFBRSxRQStEWDtBQUVELHlCQUF5QjtBQUN6QixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoibWFtLXBsdXNfZGV2LnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFR5cGVzLCBJbnRlcmZhY2VzLCBldGMuXG4gKi9cblxudHlwZSBWYWxpZFBhZ2UgPVxuICAgIHwgJ2hvbWUnXG4gICAgfCAnYnJvd3NlJ1xuICAgIHwgJ2ZyZWVsZWVjaCdcbiAgICB8ICdyZXF1ZXN0J1xuICAgIHwgJ3JlcXVlc3QgZGV0YWlscydcbiAgICB8ICd0b3JyZW50J1xuICAgIHwgJ3Nob3V0Ym94J1xuICAgIHwgJ3ZhdWx0J1xuICAgIHwgJ3N0b3JlJ1xuICAgIHwgJ3VzZXInXG4gICAgfCAndXBsb2FkJ1xuICAgIHwgJ2ZvcnVtIHRocmVhZCdcbiAgICB8ICdzZXR0aW5ncydcbiAgICB8ICduZXcgdXNlcnMnO1xuXG50eXBlIEJvb2tEYXRhID0gJ2Jvb2snIHwgJ2F1dGhvcicgfCAnc2VyaWVzJztcblxuZW51bSBTZXR0aW5nR3JvdXAge1xuICAgICdHbG9iYWwnLFxuICAgICdIb21lJyxcbiAgICAnU2VhcmNoJyxcbiAgICAnUmVxdWVzdHMnLFxuICAgICdUb3JyZW50IFBhZ2UnLFxuICAgICdTaG91dGJveCcsXG4gICAgJ1ZhdWx0JyxcbiAgICAnU3RvcmUnLFxuICAgICdVc2VyIFBhZ2VzJyxcbiAgICAnVXBsb2FkIFBhZ2UnLFxuICAgICdGb3J1bScsXG4gICAgJ090aGVyJyxcbn1cblxudHlwZSBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JyB8ICdtdXRlJztcblxudHlwZSBTdG9yZVNvdXJjZSA9XG4gICAgfCAxXG4gICAgfCAnMi41J1xuICAgIHwgJzQnXG4gICAgfCAnNSdcbiAgICB8ICc4J1xuICAgIHwgJzIwJ1xuICAgIHwgJzEwMCdcbiAgICB8ICdwb2ludHMnXG4gICAgfCAnY2hlZXNlJ1xuICAgIHwgJ21heCdcbiAgICB8ICdNYXggQWZmb3JkYWJsZSdcbiAgICB8ICdzZWVkdGltZSdcbiAgICB8ICdTZWxsJ1xuICAgIHwgJ3JhdGlvJ1xuICAgIHwgJ0ZvcnVtJztcblxuaW50ZXJmYWNlIFVzZXJHaWZ0SGlzdG9yeSB7XG4gICAgYW1vdW50OiBudW1iZXI7XG4gICAgb3RoZXJfbmFtZTogc3RyaW5nO1xuICAgIG90aGVyX3VzZXJpZDogbnVtYmVyO1xuICAgIHRpZDogbnVtYmVyIHwgbnVsbDtcbiAgICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgICB0aXRsZTogc3RyaW5nIHwgbnVsbDtcbiAgICB0eXBlOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBSZWNlbnRQb2ludEdpZnQge1xuICAgIGFtb3VudDogbnVtYmVyO1xuICAgIHVzZXJJRDogc3RyaW5nO1xuICAgIHV0Y0RhdGU6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEFycmF5T2JqZWN0IHtcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIFN0cmluZ09iamVjdCB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQm9va0RhdGFPYmplY3QgZXh0ZW5kcyBTdHJpbmdPYmplY3Qge1xuICAgIFsnZXh0cmFjdGVkJ106IHN0cmluZztcbiAgICBbJ2Rlc2MnXTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgRGl2Um93T2JqZWN0IHtcbiAgICBbJ3RpdGxlJ106IHN0cmluZztcbiAgICBbJ2RhdGEnXTogSFRNTERpdkVsZW1lbnQ7XG59XG5cbmludGVyZmFjZSBTZXR0aW5nR2xvYk9iamVjdCB7XG4gICAgW2tleTogbnVtYmVyXTogRmVhdHVyZVNldHRpbmdzW107XG59XG5cbmludGVyZmFjZSBGZWF0dXJlU2V0dGluZ3Mge1xuICAgIHNjb3BlOiBTZXR0aW5nR3JvdXA7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICB0eXBlOiAnY2hlY2tib3gnIHwgJ2Ryb3Bkb3duJyB8ICd0ZXh0Ym94JztcbiAgICBkZXNjOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBBbnlGZWF0dXJlIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcbiAgICB0YWc/OiBzdHJpbmc7XG4gICAgb3B0aW9ucz86IFN0cmluZ09iamVjdDtcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEZlYXR1cmUge1xuICAgIHNldHRpbmdzOiBDaGVja2JveFNldHRpbmcgfCBEcm9wZG93blNldHRpbmcgfCBUZXh0Ym94U2V0dGluZztcbn1cblxuaW50ZXJmYWNlIENoZWNrYm94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XG4gICAgdHlwZTogJ2NoZWNrYm94Jztcbn1cblxuaW50ZXJmYWNlIERyb3Bkb3duU2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XG4gICAgdHlwZTogJ2Ryb3Bkb3duJztcbiAgICB0YWc6IHN0cmluZztcbiAgICBvcHRpb25zOiBTdHJpbmdPYmplY3Q7XG59XG5cbmludGVyZmFjZSBUZXh0Ym94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XG4gICAgdHlwZTogJ3RleHRib3gnO1xuICAgIHRhZzogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyOiBzdHJpbmc7XG59XG5cbi8vIG5hdmlnYXRvci5jbGlwYm9hcmQuZC50c1xuXG4vLyBUeXBlIGRlY2xhcmF0aW9ucyBmb3IgQ2xpcGJvYXJkIEFQSVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NsaXBib2FyZF9BUElcbmludGVyZmFjZSBDbGlwYm9hcmQge1xuICAgIHdyaXRlVGV4dChuZXdDbGlwVGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcbiAgICAvLyBBZGQgYW55IG90aGVyIG1ldGhvZHMgeW91IG5lZWQgaGVyZS5cbn1cblxuaW50ZXJmYWNlIE5hdmlnYXRvckNsaXBib2FyZCB7XG4gICAgLy8gT25seSBhdmFpbGFibGUgaW4gYSBzZWN1cmUgY29udGV4dC5cbiAgICByZWFkb25seSBjbGlwYm9hcmQ/OiBDbGlwYm9hcmQ7XG59XG5cbmludGVyZmFjZSBOYXZpZ2F0b3JFeHRlbmRlZCBleHRlbmRzIE5hdmlnYXRvckNsaXBib2FyZCB7fVxuIiwiLyoqXG4gKiBDbGFzcyBjb250YWluaW5nIGNvbW1vbiB1dGlsaXR5IG1ldGhvZHNcbiAqXG4gKiBJZiB0aGUgbWV0aG9kIHNob3VsZCBoYXZlIHVzZXItY2hhbmdlYWJsZSBzZXR0aW5ncywgY29uc2lkZXIgdXNpbmcgYENvcmUudHNgIGluc3RlYWRcbiAqL1xuXG5jbGFzcyBVdGlsIHtcbiAgICAvKipcbiAgICAgKiBBbmltYXRpb24gZnJhbWUgdGltZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFmVGltZXIoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbGxvd3Mgc2V0dGluZyBtdWx0aXBsZSBhdHRyaWJ1dGVzIGF0IG9uY2VcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNldEF0dHIoZWw6IEVsZW1lbnQsIGF0dHI6IFN0cmluZ09iamVjdCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHIpIHtcbiAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBcImxlbmd0aFwiIG9mIGFuIE9iamVjdFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgb2JqZWN0TGVuZ3RoKG9iajogT2JqZWN0KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvcmNlZnVsbHkgZW1wdGllcyBhbnkgR00gc3RvcmVkIHZhbHVlc1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcHVyZ2VTZXR0aW5ncygpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBHTV9saXN0VmFsdWVzKCkpIHtcbiAgICAgICAgICAgIEdNX2RlbGV0ZVZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvZyBhIG1lc3NhZ2UgYWJvdXQgYSBjb3VudGVkIHJlc3VsdFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVwb3J0Q291bnQoZGlkOiBzdHJpbmcsIG51bTogbnVtYmVyLCB0aGluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNpbmd1bGFyID0gMTtcbiAgICAgICAgaWYgKG51bSAhPT0gc2luZ3VsYXIpIHtcbiAgICAgICAgICAgIHRoaW5nICs9ICdzJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA+ICR7ZGlkfSAke251bX0gJHt0aGluZ31gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgZmVhdHVyZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgc3RhcnRGZWF0dXJlKFxuICAgICAgICBzZXR0aW5nczogRmVhdHVyZVNldHRpbmdzLFxuICAgICAgICBlbGVtOiBzdHJpbmcsXG4gICAgICAgIHBhZ2U/OiBWYWxpZFBhZ2VbXVxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBRdWV1ZSB0aGUgc2V0dGluZ3MgaW4gY2FzZSB0aGV5J3JlIG5lZWRlZFxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaChzZXR0aW5ncyk7XG5cbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gcmV0dXJuIHRydWUgd2hlbiB0aGUgZWxlbWVudCBpcyBsb2FkZWRcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICAgICAgICAgICAgY29uc3QgdGltZXI6IFByb21pc2U8ZmFsc2U+ID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCAyMDAwLCBmYWxzZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBjaGVja0VsZW0gPSBDaGVjay5lbGVtTG9hZChlbGVtKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UoW3RpbWVyLCBjaGVja0VsZW1dKS50aGVuKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgIGBzdGFydEZlYXR1cmUoJHtzZXR0aW5ncy50aXRsZX0pIFVuYWJsZSB0byBpbml0aWF0ZSEgQ291bGQgbm90IGZpbmQgZWxlbWVudDogJHtlbGVtfWBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXMgdGhlIHNldHRpbmcgZW5hYmxlZD9cbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHNldHRpbmdzLnRpdGxlKSkge1xuICAgICAgICAgICAgLy8gQSBzcGVjaWZpYyBwYWdlIGlzIG5lZWRlZFxuICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCByZXF1aXJlZCBwYWdlc1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHM6IGJvb2xlYW5bXSA9IFtdO1xuICAgICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDaGVjay5wYWdlKHApLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCg8Ym9vbGVhbj5yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgYW55IHJlcXVlc3RlZCBwYWdlIG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZSwgcnVuIHRoZSBmZWF0dXJlXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMuaW5jbHVkZXModHJ1ZSkgPT09IHRydWUpIHJldHVybiBydW4oKTtcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIFNraXAgdG8gZWxlbWVudCBjaGVja2luZ1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZXR0aW5nIGlzIG5vdCBlbmFibGVkXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmltcyBhIHN0cmluZyBsb25nZXIgdGhhbiBhIHNwZWNpZmllZCBjaGFyIGxpbWl0LCB0byBhIGZ1bGwgd29yZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdHJpbVN0cmluZyhpbnA6IHN0cmluZywgbWF4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBpZiAoaW5wLmxlbmd0aCA+IG1heCkge1xuICAgICAgICAgICAgaW5wID0gaW5wLnN1YnN0cmluZygwLCBtYXggKyAxKTtcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgTWF0aC5taW4oaW5wLmxlbmd0aCwgaW5wLmxhc3RJbmRleE9mKCcgJykpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYnJhY2tldHMgJiBhbGwgY29udGFpbmVkIHdvcmRzIGZyb20gYSBzdHJpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRSZW1vdmVyKGlucDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGlucFxuICAgICAgICAgICAgLnJlcGxhY2UoL3srLio/fSsvZywgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxbXFxbfFxcXVxcXS9nLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88Lio/Pi9nLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXCguKj9cXCkvZywgJycpXG4gICAgICAgICAgICAudHJpbSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlJldHVybiB0aGUgY29udGVudHMgYmV0d2VlbiBicmFja2V0c1xuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJvZiBVdGlsXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0Q29udGVudHMgPSAoaW5wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIGlucC5tYXRjaCgvXFwoKFteKV0rKVxcKS8pIVsxXTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBzdHJpbmcgdG8gYW4gYXJyYXlcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1RvQXJyYXkoaW5wOiBzdHJpbmcsIHNwbGl0UG9pbnQ/OiAnd3MnKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gc3BsaXRQb2ludCAhPT0gdW5kZWZpbmVkICYmIHNwbGl0UG9pbnQgIT09ICd3cydcbiAgICAgICAgICAgID8gaW5wLnNwbGl0KHNwbGl0UG9pbnQpXG4gICAgICAgICAgICA6IGlucC5tYXRjaCgvXFxTKy9nKSB8fCBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhIGNvbW1hIChvciBvdGhlcikgc2VwYXJhdGVkIHZhbHVlIGludG8gYW4gYXJyYXlcbiAgICAgKiBAcGFyYW0gaW5wIFN0cmluZyB0byBiZSBkaXZpZGVkXG4gICAgICogQHBhcmFtIGRpdmlkZXIgVGhlIGRpdmlkZXIgKGRlZmF1bHQ6ICcsJylcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNzdlRvQXJyYXkoaW5wOiBzdHJpbmcsIGRpdmlkZXI6IHN0cmluZyA9ICcsJyk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgYXJyOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBpbnAuc3BsaXQoZGl2aWRlcikuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgYXJyLnB1c2goaXRlbS50cmltKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGFuIGFycmF5IHRvIGEgc3RyaW5nXG4gICAgICogQHBhcmFtIGlucCBzdHJpbmdcbiAgICAgKiBAcGFyYW0gZW5kIGN1dC1vZmYgcG9pbnRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFycmF5VG9TdHJpbmcoaW5wOiBzdHJpbmdbXSwgZW5kPzogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xuICAgICAgICBpbnAuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcbiAgICAgICAgICAgIG91dHAgKz0ga2V5O1xuICAgICAgICAgICAgaWYgKGVuZCAmJiB2YWwgKyAxICE9PSBpbnAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb3V0cCArPSAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gb3V0cDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhIERPTSBub2RlIHJlZmVyZW5jZSBpbnRvIGFuIEhUTUwgRWxlbWVudCByZWZlcmVuY2VcbiAgICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjb252ZXJ0XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBub2RlVG9FbGVtKG5vZGU6IE5vZGUpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGlmIChub2RlLmZpcnN0Q2hpbGQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiA8SFRNTEVsZW1lbnQ+bm9kZS5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50ITtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm9kZS10by1lbGVtIHdpdGhvdXQgY2hpbGRub2RlIGlzIHVudGVzdGVkJyk7XG4gICAgICAgICAgICBjb25zdCB0ZW1wTm9kZTogTm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRlbXBOb2RlKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZCh0ZW1wTm9kZSk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaCBzdHJpbmdzIHdoaWxlIGlnbm9yaW5nIGNhc2Ugc2Vuc2l0aXZpdHlcbiAgICAgKiBAcGFyYW0gYSBGaXJzdCBzdHJpbmdcbiAgICAgKiBAcGFyYW0gYiBTZWNvbmQgc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjYXNlbGVzc1N0cmluZ01hdGNoKGE6IHN0cmluZywgYjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGNvbXBhcmU6IG51bWJlciA9IGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7XG4gICAgICAgICAgICBzZW5zaXRpdml0eTogJ2Jhc2UnLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUgPT09IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IFRvckRldFJvdyBhbmQgcmV0dXJuIHRoZSBpbm5lciBkaXZcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSByb3cgdG8gYmUgdGFyZ2V0dGVkXG4gICAgICogQHBhcmFtIGxhYmVsIFRoZSBuYW1lIHRvIGJlIGRpc3BsYXllZCBmb3IgdGhlIG5ldyByb3dcbiAgICAgKiBAcGFyYW0gcm93Q2xhc3MgVGhlIHJvdydzIGNsYXNzbmFtZSAoc2hvdWxkIHN0YXJ0IHdpdGggbXBfKVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYWRkVG9yRGV0YWlsc1JvdyhcbiAgICAgICAgdGFyOiBIVE1MRGl2RWxlbWVudCB8IG51bGwsXG4gICAgICAgIGxhYmVsOiBzdHJpbmcsXG4gICAgICAgIHJvd0NsYXNzOiBzdHJpbmdcbiAgICApOiBIVE1MRGl2RWxlbWVudCB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGFyKTtcblxuICAgICAgICBpZiAodGFyID09PSBudWxsIHx8IHRhci5wYXJlbnRFbGVtZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFkZCBUb3IgRGV0YWlscyBSb3c6IGVtcHR5IG5vZGUgb3IgcGFyZW50IG5vZGUgQCAke3Rhcn1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhci5wYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj4ke2xhYmVsfTwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3Jvd0NsYXNzfVwiPjxzcGFuIGNsYXNzPVwiZmxleFwiPjwvc3Bhbj48L2Rpdj48L2Rpdj5gXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3Jvd0NsYXNzfSAuZmxleGApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogTWVyZ2Ugd2l0aCBgVXRpbC5jcmVhdGVCdXR0b25gXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIGxpbmsgYnV0dG9uIHRoYXQgaXMgc3R5bGVkIGxpa2UgYSBzaXRlIGJ1dHRvbiAoZXguIGluIHRvciBkZXRhaWxzKVxuICAgICAqIEBwYXJhbSB0YXIgVGhlIGVsZW1lbnQgdGhlIGJ1dHRvbiBzaG91bGQgYmUgYWRkZWQgdG9cbiAgICAgKiBAcGFyYW0gdXJsIFRoZSBVUkwgdGhlIGJ1dHRvbiB3aWxsIHNlbmQgeW91IHRvXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgb24gdGhlIGJ1dHRvblxuICAgICAqIEBwYXJhbSBvcmRlciBPcHRpb25hbDogZmxleCBmbG93IG9yZGVyaW5nXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVMaW5rQnV0dG9uKFxuICAgICAgICB0YXI6IEhUTUxFbGVtZW50LFxuICAgICAgICB1cmw6IHN0cmluZyA9ICdub25lJyxcbiAgICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgICBvcmRlcjogbnVtYmVyID0gMFxuICAgICk6IHZvaWQge1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGJ1dHRvblxuICAgICAgICBjb25zdCBidXR0b246IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAvLyBTZXQgdXAgdGhlIGJ1dHRvblxuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnbXBfYnV0dG9uX2Nsb25lJyk7XG4gICAgICAgIGlmICh1cmwgIT09ICdub25lJykge1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnV0dG9uLmlubmVyVGV4dCA9IHRleHQ7XG4gICAgICAgIGJ1dHRvbi5zdHlsZS5vcmRlciA9IGAke29yZGVyfWA7XG4gICAgICAgIC8vIEluamVjdCB0aGUgYnV0dG9uXG4gICAgICAgIHRhci5pbnNlcnRCZWZvcmUoYnV0dG9uLCB0YXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIG5vbi1saW5rZWQgYnV0dG9uXG4gICAgICogQHBhcmFtIGlkIFRoZSBJRCBvZiB0aGUgYnV0dG9uXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgZGlzcGxheWVkIGluIHRoZSBidXR0b25cbiAgICAgKiBAcGFyYW0gdHlwZSBUaGUgSFRNTCBlbGVtZW50IHRvIGNyZWF0ZS4gRGVmYXVsdDogYGgxYFxuICAgICAqIEBwYXJhbSB0YXIgVGhlIEhUTUwgZWxlbWVudCB0aGUgYnV0dG9uIHdpbGwgYmUgYHJlbGF0aXZlYCB0b1xuICAgICAqIEBwYXJhbSByZWxhdGl2ZSBUaGUgcG9zaXRpb24gb2YgdGhlIGJ1dHRvbiByZWxhdGl2ZSB0byB0aGUgYHRhcmAuIERlZmF1bHQ6IGBhZnRlcmVuZGBcbiAgICAgKiBAcGFyYW0gYnRuQ2xhc3MgVGhlIGNsYXNzbmFtZSBvZiB0aGUgZWxlbWVudC4gRGVmYXVsdDogYG1wX2J0bmBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUJ1dHRvbihcbiAgICAgICAgaWQ6IHN0cmluZyxcbiAgICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgICB0eXBlOiBzdHJpbmcgPSAnaDEnLFxuICAgICAgICB0YXI6IHN0cmluZyB8IEhUTUxFbGVtZW50LFxuICAgICAgICByZWxhdGl2ZTogJ2JlZm9yZWJlZ2luJyB8ICdhZnRlcmVuZCcgPSAnYWZ0ZXJlbmQnLFxuICAgICAgICBidG5DbGFzczogc3RyaW5nID0gJ21wX2J0bidcbiAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBDaG9vc2UgdGhlIG5ldyBidXR0b24gaW5zZXJ0IGxvY2F0aW9uIGFuZCBpbnNlcnQgZWxlbWVudHNcbiAgICAgICAgICAgIC8vIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID1cbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFyID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKSA6IHRhcjtcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGAke3Rhcn0gaXMgbnVsbCFgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Lmluc2VydEFkamFjZW50RWxlbWVudChyZWxhdGl2ZSwgYnRuKTtcbiAgICAgICAgICAgICAgICBVdGlsLnNldEF0dHIoYnRuLCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBgbXBfJHtpZH1gLFxuICAgICAgICAgICAgICAgICAgICBjbGFzczogYnRuQ2xhc3MsXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdidXR0b24nLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIGJ1dHRvbiB0ZXh0XG4gICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShidG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhbiBlbGVtZW50IGludG8gYSBidXR0b24gdGhhdCwgd2hlbiBjbGlja2VkLCBjb3BpZXMgdGV4dCB0byBjbGlwYm9hcmRcbiAgICAgKiBAcGFyYW0gYnRuIEFuIEhUTUwgRWxlbWVudCBiZWluZyB1c2VkIGFzIGEgYnV0dG9uXG4gICAgICogQHBhcmFtIHBheWxvYWQgVGhlIHRleHQgdGhhdCB3aWxsIGJlIGNvcGllZCB0byBjbGlwYm9hcmQgb24gYnV0dG9uIGNsaWNrLCBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCB1c2UgdGhlIGNsaXBib2FyZCdzIGN1cnJlbnQgdGV4dFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2xpcGJvYXJkaWZ5QnRuKFxuICAgICAgICBidG46IEhUTUxFbGVtZW50LFxuICAgICAgICBwYXlsb2FkOiBhbnksXG4gICAgICAgIGNvcHk6IGJvb2xlYW4gPSB0cnVlXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIC8vIEhhdmUgdG8gb3ZlcnJpZGUgdGhlIE5hdmlnYXRvciB0eXBlIHRvIHByZXZlbnQgVFMgZXJyb3JzXG4gICAgICAgICAgICBjb25zdCBuYXY6IE5hdmlnYXRvckV4dGVuZGVkIHwgdW5kZWZpbmVkID0gPE5hdmlnYXRvckV4dGVuZGVkPm5hdmlnYXRvcjtcbiAgICAgICAgICAgIGlmIChuYXYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSB0ZXh0LCBsaWtlbHkgZHVlIHRvIG1pc3NpbmcgYnJvd3NlciBzdXBwb3J0LicpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImJyb3dzZXIgZG9lc24ndCBzdXBwb3J0ICduYXZpZ2F0b3InP1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogTmF2aWdhdG9yIEV4aXN0cyAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvcHkgJiYgdHlwZW9mIHBheWxvYWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgcmVzdWx0cyB0byBjbGlwYm9hcmRcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEud3JpdGVUZXh0KHBheWxvYWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgdG8geW91ciBjbGlwYm9hcmQhJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuIHBheWxvYWQgZnVuY3Rpb24gd2l0aCBjbGlwYm9hcmQgdGV4dFxuICAgICAgICAgICAgICAgICAgICBuYXYuY2xpcGJvYXJkIS5yZWFkVGV4dCgpLnRoZW4oKHRleHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQodGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgZnJvbSB5b3VyIGNsaXBib2FyZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnRuLnN0eWxlLmNvbG9yID0gJ2dyZWVuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBIVFRQUmVxdWVzdCBmb3IgR0VUIEpTT04sIHJldHVybnMgdGhlIGZ1bGwgdGV4dCBvZiBIVFRQIEdFVFxuICAgICAqIEBwYXJhbSB1cmwgLSBhIHN0cmluZyBvZiB0aGUgVVJMIHRvIHN1Ym1pdCBmb3IgR0VUIHJlcXVlc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEpTT04odXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ2V0SFRUUCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJlc3VsdHMgd2l0aCB0aGUgYW1vdW50IGVudGVyZWQgYnkgdXNlciBwbHVzIHRoZSB1c2VybmFtZSBmb3VuZCBvbiB0aGUgbWVudSBzZWxlY3RlZFxuICAgICAgICAgICAgZ2V0SFRUUC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgZ2V0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgZ2V0SFRUUC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdldEhUVFAucmVhZHlTdGF0ZSA9PT0gNCAmJiBnZXRIVFRQLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZ2V0SFRUUC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnZXRIVFRQLnNlbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiB0d28gcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSBtaW4gYSBudW1iZXIgb2YgdGhlIGJvdHRvbSBvZiByYW5kb20gbnVtYmVyIHBvb2xcbiAgICAgKiBAcGFyYW0gbWF4IGEgbnVtYmVyIG9mIHRoZSB0b3Agb2YgdGhlIHJhbmRvbSBudW1iZXIgcG9vbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmFuZG9tTnVtYmVyID0gKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciA9PiB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTbGVlcCB1dGlsIHRvIGJlIHVzZWQgaW4gYXN5bmMgZnVuY3Rpb25zIHRvIGRlbGF5IHByb2dyYW1cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNsZWVwID0gKG06IGFueSk6IFByb21pc2U8dm9pZD4gPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgbSkpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHNlY3Rpb24gb2YgYW4gSFJFRlxuICAgICAqIEBwYXJhbSBlbGVtIEFuIGFuY2hvciBlbGVtZW50XG4gICAgICogQHBhcmFtIHNwbGl0IE9wdGlvbmFsIGRpdmlkZXIuIERlZmF1bHRzIHRvIGAvYFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZW5kT2ZIcmVmID0gKGVsZW06IEhUTUxBbmNob3JFbGVtZW50LCBzcGxpdCA9ICcvJykgPT5cbiAgICAgICAgZWxlbS5ocmVmLnNwbGl0KHNwbGl0KS5wb3AoKTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgaGV4IHZhbHVlIG9mIGEgY29tcG9uZW50IGFzIGEgc3RyaW5nLlxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY29tcG9uZW50VG9IZXggPSAoYzogbnVtYmVyIHwgc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XG4gICAgICAgIHJldHVybiBoZXgubGVuZ3RoID09PSAxID8gYDAke2hleH1gIDogaGV4O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgaGV4IGNvbG9yIGNvZGUgZnJvbSBSR0IuXG4gICAgICogRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4XG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlcm9mIFV0aWxcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJnYlRvSGV4ID0gKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gYCMke1V0aWwuY29tcG9uZW50VG9IZXgocil9JHtVdGlsLmNvbXBvbmVudFRvSGV4KGcpfSR7VXRpbC5jb21wb25lbnRUb0hleChcbiAgICAgICAgICAgIGJcbiAgICAgICAgKX1gO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IG51bWJlcnMgKHdpdGggZmxvYXQpIGZyb20gdGV4dCBhbmQgcmV0dXJuIHRoZW1cbiAgICAgKiBAcGFyYW0gdGFyIEFuIEhUTUwgZWxlbWVudCB0aGF0IGNvbnRhaW5zIG51bWJlcnNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGbG9hdCA9ICh0YXI6IEhUTUxFbGVtZW50KTogbnVtYmVyW10gPT4ge1xuICAgICAgICBpZiAodGFyLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gKHRhci50ZXh0Q29udGVudCEucmVwbGFjZSgvLC9nLCAnJykubWF0Y2goL1xcZCtcXC5cXGQrLykgfHwgW10pLm1hcCgobikgPT5cbiAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG4pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgY29udGFpbnMgbm8gdGV4dCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgR2V0IHRoZSB1c2VyIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHRoZSBsb2dnZWQgaW4gdXNlciBhbmQgYSBnaXZlbiBJRFxuICAgICAqIEBwYXJhbSB1c2VySUQgQSB1c2VyIElEOyBjYW4gYmUgYSBzdHJpbmcgb3IgbnVtYmVyXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBnZXRVc2VyR2lmdEhpc3RvcnkoXG4gICAgICAgIHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nXG4gICAgKTogUHJvbWlzZTxVc2VyR2lmdEhpc3RvcnlbXT4ge1xuICAgICAgICBjb25zdCByYXdHaWZ0SGlzdG9yeTogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKFxuICAgICAgICAgICAgYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi91c2VyQm9udXNIaXN0b3J5LnBocD9vdGhlcl91c2VyaWQ9JHt1c2VySUR9YFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeTogQXJyYXk8VXNlckdpZnRIaXN0b3J5PiA9IEpTT04ucGFyc2UocmF3R2lmdEhpc3RvcnkpO1xuICAgICAgICAvLyBSZXR1cm4gdGhlIGZ1bGwgZGF0YVxuICAgICAgICByZXR1cm4gZ2lmdEhpc3Rvcnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIyMjIyBHZXQgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdGhlIGxvZ2dlZCBpbiB1c2VyIGFuZCBldmVyeW9uZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0QWxsVXNlckdpZnRIaXN0b3J5KCk6IFByb21pc2U8VXNlckdpZnRIaXN0b3J5W10+IHtcbiAgICAgICAgY29uc3QgcmF3R2lmdEhpc3Rvcnk6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTihcbiAgICAgICAgICAgIGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vdXNlckJvbnVzSGlzdG9yeS5waHBgXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5OiBBcnJheTxVc2VyR2lmdEhpc3Rvcnk+ID0gSlNPTi5wYXJzZShyYXdHaWZ0SGlzdG9yeSk7XG4gICAgICAgIC8vIFJldHVybiB0aGUgZnVsbCBkYXRhXG4gICAgICAgIHJldHVybiBnaWZ0SGlzdG9yeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFJldHVybiB0b2RheSdzIFVUQyBkYXRlIGluIFlZWVktTU0tREQgZm9ybWF0XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRVVENEYXRlU3RyaW5nKGRhdGU6IERhdGUgPSBuZXcgRGF0ZSgpKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgUmVhZCB0aGUgbG9jYWwgcmVjZW50IHBvaW50LWdpZnQgc3RvcmUgYW5kIGRyb3Agc3RhbGUgb3IgbWFsZm9ybWVkIGVudHJpZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldFJlY2VudFBvaW50R2lmdHMoKTogUmVjZW50UG9pbnRHaWZ0W10ge1xuICAgICAgICBjb25zdCBrZXkgPSAnbXBfcmVjZW50UG9pbnRHaWZ0cyc7XG4gICAgICAgIGNvbnN0IHRvZGF5ID0gVXRpbC5nZXRVVENEYXRlU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHJhd0dpZnRIaXN0b3J5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShrZXkpO1xuXG4gICAgICAgIGlmICghcmF3R2lmdEhpc3RvcnkpIHtcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKGtleSwgJ1tdJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VkOiBhbnk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHJhd0dpZnRIaXN0b3J5KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW00rXSBJbnZhbGlkIHJlY2VudCBwb2ludC1naWZ0IGRhdGE7IHJlc2V0dGluZyBzdG9yZS4nLCBlcnJvcik7XG4gICAgICAgICAgICBHTV9zZXRWYWx1ZShrZXksICdbXScpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBhcnNlZCkpIHtcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKGtleSwgJ1tdJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzYW5pdGl6ZWQ6IFJlY2VudFBvaW50R2lmdFtdID0gcGFyc2VkXG4gICAgICAgICAgICAubWFwKChnaWZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYW1vdW50OiBOdW1iZXIoZ2lmdC5hbW91bnQpLFxuICAgICAgICAgICAgICAgICAgICB1c2VySUQ6IGAke2dpZnQudXNlcklEIHx8ICcnfWAsXG4gICAgICAgICAgICAgICAgICAgIHV0Y0RhdGU6IGAke2dpZnQudXRjRGF0ZSB8fCAnJ31gLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZpbHRlcigoZ2lmdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIGdpZnQudXNlcklEICE9PSAnJyAmJlxuICAgICAgICAgICAgICAgICAgICAhaXNOYU4oZ2lmdC5hbW91bnQpICYmXG4gICAgICAgICAgICAgICAgICAgIGdpZnQuYW1vdW50ID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICBnaWZ0LnV0Y0RhdGUgPT09IHRvZGF5XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShwYXJzZWQpICE9PSBKU09OLnN0cmluZ2lmeShzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICBHTV9zZXRWYWx1ZShrZXksIEpTT04uc3RyaW5naWZ5KHNhbml0aXplZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNhbml0aXplZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFNhdmUgYSBwb2ludC1naWZ0IHRvdGFsIGZvciBhIHVzZXIgZm9yIHRoZSBjdXJyZW50IFVUQyBkYXlcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJlY29yZFBvaW50R2lmdCh1c2VySUQ6IG51bWJlciB8IHN0cmluZywgYW1vdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gJ21wX3JlY2VudFBvaW50R2lmdHMnO1xuICAgICAgICBjb25zdCB0b2RheSA9IFV0aWwuZ2V0VVRDRGF0ZVN0cmluZygpO1xuICAgICAgICBjb25zdCBub3JtYWxpemVkSUQgPSBgJHt1c2VySUR9YDtcbiAgICAgICAgY29uc3QgZ2lmdEhpc3RvcnkgPSBVdGlsLmdldFJlY2VudFBvaW50R2lmdHMoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBnaWZ0SGlzdG9yeS5maW5kKChnaWZ0KSA9PiBnaWZ0LnVzZXJJRCA9PT0gbm9ybWFsaXplZElEKTtcblxuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nLmFtb3VudCArPSBhbW91bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnaWZ0SGlzdG9yeS51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICBhbW91bnQsXG4gICAgICAgICAgICAgICAgdXNlcklEOiBub3JtYWxpemVkSUQsXG4gICAgICAgICAgICAgICAgdXRjRGF0ZTogdG9kYXksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIEdNX3NldFZhbHVlKGtleSwgSlNPTi5zdHJpbmdpZnkoZ2lmdEhpc3RvcnkpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFN1bSBsb2NhbGx5IHN0b3JlZCBwb2ludCBnaWZ0cyBzZW50IHRvIGEgdXNlciB0b2RheVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0U2VudFBvaW50c1RvZGF5KHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZElEID0gYCR7dXNlcklEfWA7XG4gICAgICAgIHJldHVybiBVdGlsLmdldFJlY2VudFBvaW50R2lmdHMoKVxuICAgICAgICAgICAgLmZpbHRlcigoZ2lmdCkgPT4gZ2lmdC51c2VySUQgPT09IG5vcm1hbGl6ZWRJRClcbiAgICAgICAgICAgIC5yZWR1Y2UoKHN1bSwgZ2lmdCkgPT4gc3VtICsgZ2lmdC5hbW91bnQsIDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgRGV0ZXJtaW5lIHRoZSBtYXhpbXVtIHBvaW50cyBhIHVzZXIgY2FuIHJlY2VpdmUgdG9kYXlcbiAgICAgKlxuICAgICAqIFdoZW4gdGhlIGN1cnJlbnQgcGFnZSBleHBvc2VzIGEgbmF0aXZlIGdpZnQgaW5wdXQsIHByZWZlciBpdHMgYG1heGAgdmFsdWUuXG4gICAgICogT3RoZXJ3aXNlIGZhbGwgYmFjayB0byB0aGUgc2l0ZSdzIG5vcm1hbCBwb2ludC1naWZ0IGNhcC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldFBvaW50R2lmdERhaWx5TGltaXQoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gWycjYm9udXNnaWZ0JywgJyN0aGFua3NBcmVhIGlucHV0W25hbWU9cG9pbnRzXSddO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCBwb2ludEJveCA9IDxIVE1MSW5wdXRFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChwb2ludEJveCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heFBvaW50cyA9IHBhcnNlSW50KHBvaW50Qm94LmdldEF0dHJpYnV0ZSgnbWF4JykgfHwgJycpO1xuICAgICAgICAgICAgICAgIGlmICghaXNOYU4obWF4UG9pbnRzKSAmJiBtYXhQb2ludHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXhQb2ludHM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDEwMDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIyMjIyBSZXR1cm4gaG93IG1hbnkgcG9pbnRzIGNhbiBzdGlsbCBiZSBzZW50IHRvIGEgdXNlciB0b2RheVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0UmVtYWluaW5nUG9pbnRHaWZ0QWxsb3dhbmNlKHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAgICAgVXRpbC5nZXRQb2ludEdpZnREYWlseUxpbWl0KCkgLSBVdGlsLmdldFNlbnRQb2ludHNUb2RheSh1c2VySUQpLFxuICAgICAgICAgICAgMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgR2V0cyB0aGUgbG9nZ2VkIGluIHVzZXIncyB1c2VyaWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEN1cnJlbnRVc2VySUQoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgbXlJbmZvID0gPEhUTUxBbmNob3JFbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tbVVzZXJTdGF0cyAuYXZhdGFyIGEnKVxuICAgICAgICApO1xuICAgICAgICBpZiAobXlJbmZvKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VySUQgPSA8c3RyaW5nPnRoaXMuZW5kT2ZIcmVmKG15SW5mbyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBMb2dnZWQgaW4gdXNlcklEIGlzICR7dXNlcklEfWApO1xuICAgICAgICAgICAgcmV0dXJuIHVzZXJJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnTm8gbG9nZ2VkIGluIHVzZXIgZm91bmQuJyk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHByZXR0eVNpdGVUaW1lKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgZGF0ZT86IGJvb2xlYW4sIHRpbWU/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKHVuaXhUaW1lc3RhbXAgKiAxMDAwKS50b0lTT1N0cmluZygpO1xuICAgICAgICBpZiAoZGF0ZSAmJiAhdGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKCFkYXRlICYmIHRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXAuc3BsaXQoJ1QnKVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENoZWNrIGEgc3RyaW5nIHRvIHNlZSBpZiBpdCdzIGRpdmlkZWQgd2l0aCBhIGRhc2gsIHJldHVybmluZyB0aGUgZmlyc3QgaGFsZiBpZiBpdCBkb2Vzbid0IGNvbnRhaW4gYSBzcGVjaWZpZWQgc3RyaW5nXG4gICAgICogQHBhcmFtIG9yaWdpbmFsIFRoZSBvcmlnaW5hbCBzdHJpbmcgYmVpbmcgY2hlY2tlZFxuICAgICAqIEBwYXJhbSBjb250YWluZWQgQSBzdHJpbmcgdGhhdCBtaWdodCBiZSBjb250YWluZWQgaW4gdGhlIG9yaWdpbmFsXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjaGVja0Rhc2hlcyhvcmlnaW5hbDogc3RyaW5nLCBjb250YWluZWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgYGNoZWNrRGFzaGVzKCAke29yaWdpbmFsfSwgJHtjb250YWluZWR9ICk6IENvdW50ICR7b3JpZ2luYWwuaW5kZXhPZihcbiAgICAgICAgICAgICAgICAgICAgJyAtICdcbiAgICAgICAgICAgICAgICApfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEYXNoZXMgYXJlIHByZXNlbnRcbiAgICAgICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJyAtICcpICE9PSAtMSkge1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN0cmluZyBjb250YWlucyBhIGRhc2hgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IG9yaWdpbmFsLnNwbGl0KCcgLSAnKTtcbiAgICAgICAgICAgIGlmIChzcGxpdFswXSA9PT0gY29udGFpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgYD4gU3RyaW5nIGJlZm9yZSBkYXNoIGlzIFwiJHtjb250YWluZWR9XCI7IHVzaW5nIHN0cmluZyBiZWhpbmQgZGFzaGBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwbGl0WzFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyBVdGlsaXRpZXMgc3BlY2lmaWMgdG8gR29vZHJlYWRzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnb29kcmVhZHMgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAqIFJlbW92ZXMgc3BhY2VzIGluIGF1dGhvciBuYW1lcyB0aGF0IHVzZSBhZGphY2VudCBpbnRpdGlhbHMuXG4gICAgICAgICAqIEBwYXJhbSBhdXRoIFRoZSBhdXRob3IocylcbiAgICAgICAgICogQGV4YW1wbGUgXCJIIEcgV2VsbHNcIiAtPiBcIkhHIFdlbGxzXCJcbiAgICAgICAgICovXG4gICAgICAgIHNtYXJ0QXV0aDogKGF1dGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gVXRpbC5zdHJpbmdUb0FycmF5KGF1dGgpO1xuICAgICAgICAgICAgYXJyLmZvckVhY2goKGtleSwgdmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBrZXkgaXMgYW4gaW5pdGlhbFxuICAgICAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBuZXh0IGtleSBpcyBhbiBpbml0aWFsLCBkb24ndCBhZGQgYSBzcGFjZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGVuZzogbnVtYmVyID0gYXJyW3ZhbCArIDFdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRMZW5nIDwgMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBrZXk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGAke2tleX0gYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBzcGFjZVxuICAgICAgICAgICAgcmV0dXJuIG91dHAudHJpbSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogKiBUdXJucyBhIHN0cmluZyBpbnRvIGEgR29vZHJlYWRzIHNlYXJjaCBVUkxcbiAgICAgICAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgVVJMIHRvIG1ha2VcbiAgICAgICAgICogQHBhcmFtIGlucCBUaGUgZXh0cmFjdGVkIGRhdGEgdG8gVVJJIGVuY29kZVxuICAgICAgICAgKi9cbiAgICAgICAgYnVpbGRTZWFyY2hVUkw6ICh0eXBlOiBCb29rRGF0YSB8ICdvbicsIGlucDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBnb29kcmVhZHMuYnVpbGRHclNlYXJjaFVSTCggJHt0eXBlfSwgJHtpbnB9IClgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGdyVHlwZTogc3RyaW5nID0gdHlwZTtcbiAgICAgICAgICAgIGNvbnN0IGNhc2VzOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgYm9vazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnclR5cGUgPSAndGl0bGUnO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICdvbic7XG4gICAgICAgICAgICAgICAgICAgIGlucCArPSAnLCAjJztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChjYXNlc1t0eXBlXSkge1xuICAgICAgICAgICAgICAgIGNhc2VzW3R5cGVdKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGh0dHBzOi8vci5tcmQubmluamEvaHR0cHM6Ly93d3cuZ29vZHJlYWRzLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgICBpbnAucmVwbGFjZSgnJScsICcnKVxuICAgICAgICAgICAgKS5yZXBsYWNlKFwiJ1wiLCAnJTI3Jyl9JnNlYXJjaF90eXBlPWJvb2tzJnNlYXJjaCU1QmZpZWxkJTVEPSR7Z3JUeXBlfWA7XG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgUmV0dXJuIGEgY2xlYW5lZCBib29rIHRpdGxlIGZyb20gYW4gZWxlbWVudFxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHRpdGxlIHRleHRcbiAgICAgKiBAcGFyYW0gYXV0aCBBIHN0cmluZyBvZiBhdXRob3JzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rVGl0bGUgPSBhc3luYyAoXG4gICAgICAgIGRhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXG4gICAgICAgIGF1dGg6IHN0cmluZyA9ICcnXG4gICAgKSA9PiB7XG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEJvb2tUaXRsZSgpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZXh0cmFjdGVkID0gZGF0YS5pbm5lclRleHQ7XG4gICAgICAgIC8vIFNob3J0ZW4gdGl0bGUgYW5kIGNoZWNrIGl0IGZvciBicmFja2V0cyAmIGF1dGhvciBuYW1lc1xuICAgICAgICBleHRyYWN0ZWQgPSBVdGlsLnRyaW1TdHJpbmcoVXRpbC5icmFja2V0UmVtb3ZlcihleHRyYWN0ZWQpLCA1MCk7XG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwuY2hlY2tEYXNoZXMoZXh0cmFjdGVkLCBhdXRoKTtcbiAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogIyMjIyBSZXR1cm4gR1ItZm9ybWF0dGVkIGF1dGhvcnMgYXMgYW4gYXJyYXkgbGltaXRlZCB0byBgbnVtYFxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGF1dGhvciBsaW5rc1xuICAgICAqIEBwYXJhbSBudW0gVGhlIG51bWJlciBvZiBhdXRob3JzIHRvIHJldHVybi4gRGVmYXVsdCAzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rQXV0aG9ycyA9IGFzeW5jIChcbiAgICAgICAgZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICBudW06IG51bWJlciA9IDNcbiAgICApID0+IHtcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignZ2V0Qm9va0F1dGhvcnMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgoYXV0aG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aExpc3QucHVzaChVdGlsLmdvb2RyZWFkcy5zbWFydEF1dGgoYXV0aG9yLmlubmVyVGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICBudW0tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBhdXRoTGlzdDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFJldHVybiBzZXJpZXMgYXMgYW4gYXJyYXlcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBzZXJpZXMgbGlua3NcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tTZXJpZXMgPSBhc3luYyAoZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsKSA9PiB7XG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldEJvb2tTZXJpZXMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKChzZXJpZXMpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LnB1c2goc2VyaWVzLmlubmVyVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzZXJpZXNMaXN0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgUmV0dXJuIGEgdGFibGUtbGlrZSBhcnJheSBvZiByb3dzIGFzIGFuIG9iamVjdC5cbiAgICAgKiBTdG9yZSB0aGUgcmV0dXJuZWQgb2JqZWN0IGFuZCBhY2Nlc3MgdXNpbmcgdGhlIHJvdyB0aXRsZSwgZXguIGBzdG9yZWRbJ1RpdGxlOiddYFxuICAgICAqIEBwYXJhbSByb3dMaXN0IEFuIGFycmF5IG9mIHRhYmxlLWxpa2Ugcm93c1xuICAgICAqIEBwYXJhbSB0aXRsZUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSB0aXRsZSBjZWxscy4gRGVmYXVsdCBgLnRvckRldExlZnRgXG4gICAgICogQHBhcmFtIGRhdGFDbGFzcyBUaGUgY2xhc3MgdXNlZCBieSB0aGUgZGF0YSBjZWxscy4gRGVmYXVsdCBgLnRvckRldFJpZ2h0YFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcm93c1RvT2JqID0gKFxuICAgICAgICByb3dMaXN0OiBOb2RlTGlzdE9mPEVsZW1lbnQ+LFxuICAgICAgICB0aXRsZUNsYXNzID0gJy50b3JEZXRMZWZ0JyxcbiAgICAgICAgZGF0YUNsYXNzID0gJy50b3JEZXRSaWdodCdcbiAgICApID0+IHtcbiAgICAgICAgaWYgKHJvd0xpc3QubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVdGlsLnJvd3NUb09iaiggJHtyb3dMaXN0fSApOiBSb3cgbGlzdCB3YXMgZW1wdHkhYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgcm93czogYW55W10gPSBbXTtcblxuICAgICAgICByb3dMaXN0LmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHJvdy5xdWVyeVNlbGVjdG9yKHRpdGxlQ2xhc3MpO1xuICAgICAgICAgICAgY29uc3QgZGF0YTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IoZGF0YUNsYXNzKTtcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgICAgIHJvd3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogdGl0bGUudGV4dENvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkYXRhLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1JvdyB0aXRsZSB3YXMgZW1wdHkhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAoKG9ialtpdGVtLmtleV0gPSBpdGVtLnZhbHVlKSwgb2JqKSwge30pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENvbnZlcnQgYnl0ZXMgaW50byBhIGh1bWFuLXJlYWRhYmxlIHN0cmluZ1xuICAgICAqIENyZWF0ZWQgYnkgeXl5enp6OTk5XG4gICAgICogQHBhcmFtIGJ5dGVzIEJ5dGVzIHRvIGJlIGZvcm1hdHRlZFxuICAgICAqIEBwYXJhbSBiID9cbiAgICAgKiBAcmV0dXJucyBTdHJpbmcgaW4gdGhlIGZvcm1hdCBvZiBleC4gYDEyMyBNQmBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZvcm1hdEJ5dGVzID0gKGJ5dGVzOiBudW1iZXIsIGIgPSAyKSA9PiB7XG4gICAgICAgIGlmIChieXRlcyA9PT0gMCkgcmV0dXJuICcwIEJ5dGVzJztcbiAgICAgICAgY29uc3QgYyA9IDAgPiBiID8gMCA6IGI7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZygxMDI0KSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBwYXJzZUZsb2F0KChieXRlcyAvIE1hdGgucG93KDEwMjQsIGluZGV4KSkudG9GaXhlZChjKSkgK1xuICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgIFsnQnl0ZXMnLCAnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJywgJ1BpQicsICdFaUInLCAnWmlCJywgJ1lpQiddW2luZGV4XVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENvbnZlcnQgYSBodW1hbi1yZWFkYWJsZSBzaXplIHN0cmluZyBpbnRvIGJ5dGVzXG4gICAgICogRXhhbXBsZSBpbnB1dHM6IGA1My43OSBHaUJgLCBgMTAyLjg4NSBUaUJgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZVNpemVUb0J5dGVzID0gKHRleHQ6IHN0cmluZyk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGV4dC5yZXBsYWNlKC8sL2csICcnKS5tYXRjaChcbiAgICAgICAgICAgIC8oXFxkKyg/OlxcLlxcZCspPylcXHMqKEJ5dGVzfEtpQnxNaUJ8R2lCfFRpQnxQaUJ8RWlCfFppQnxZaUIpL2lcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIHNpemUgZnJvbSBcIiR7dGV4dH1cImApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgICAgICAgY29uc3QgdW5pdCA9IG1hdGNoWzJdO1xuICAgICAgICBjb25zdCBzaXplTWFwID0gWydCeXRlcycsICdLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ107XG4gICAgICAgIGNvbnN0IHBvd2VyID0gc2l6ZU1hcC5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0udG9Mb3dlckNhc2UoKSA9PT0gdW5pdC50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICBpZiAocG93ZXIgPCAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc2l6ZSB1bml0IFwiJHt1bml0fVwiYCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWUgKiBNYXRoLnBvdygxMDI0LCBwb3dlcik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqICMjIyMgQ2FsY3VsYXRlIHRoZSBleHRyYSB1cGxvYWQgbmVlZGVkIHRvIHJlYWNoIGEgdGFyZ2V0IHJhdGlvXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB1cGxvYWROZWVkZWRGb3JUYXJnZXRSYXRpbyA9IChcbiAgICAgICAgdXBsb2FkZWRCeXRlczogbnVtYmVyLFxuICAgICAgICBkb3dubG9hZGVkQnl0ZXM6IG51bWJlcixcbiAgICAgICAgdGFyZ2V0UmF0aW86IG51bWJlclxuICAgICk6IG51bWJlciA9PiB7XG4gICAgICAgIGlmIChkb3dubG9hZGVkQnl0ZXMgPD0gMCB8fCB0YXJnZXRSYXRpbyA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgwLCB0YXJnZXRSYXRpbyAqIGRvd25sb2FkZWRCeXRlcyAtIHVwbG9hZGVkQnl0ZXMpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgc3RhdGljIGRlcmVmZXIgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphLyR7ZW5jb2RlVVJJKHVybCl9YDtcbiAgICB9O1xuXG4gICAgcHVibGljIHN0YXRpYyBkZWxheSA9IChtczogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICAgIH07XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XG4vKipcbiAqICMgQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbGlkYXRpb24gJiBjb25maXJtYXRpb25cbiAqL1xuY2xhc3MgQ2hlY2sge1xuICAgIHB1YmxpYyBzdGF0aWMgbmV3VmVyOiBzdHJpbmcgPSBHTV9pbmZvLnNjcmlwdC52ZXJzaW9uO1xuICAgIHB1YmxpYyBzdGF0aWMgcHJldlZlcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ21wX3ZlcnNpb24nKTtcblxuICAgIC8qKlxuICAgICAqICogV2FpdCBmb3IgYW4gZWxlbWVudCB0byBleGlzdCwgdGhlbiByZXR1cm4gaXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBUaGUgRE9NIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZWxlY3QgYW4gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8SFRNTEVsZW1lbnQ+fSBQcm9taXNlIG9mIGFuIGVsZW1lbnQgdGhhdCB3YXMgc2VsZWN0ZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1Mb2FkKFxuICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnRcbiAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMgTG9va2luZyBmb3IgJHtzZWxlY3Rvcn1gLCAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1NTUnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgX2NvdW50ZXIgPSAwO1xuICAgICAgICBjb25zdCBfY291bnRlckxpbWl0ID0gMjAwO1xuICAgICAgICBjb25zdCBsb2dpYyA9IGFzeW5jIChcbiAgICAgICAgICAgIHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MRWxlbWVudFxuICAgICAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+ID0+IHtcbiAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgYWN0dWFsIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9XG4gICAgICAgICAgICAgICAgdHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgICAgIDogc2VsZWN0b3I7XG5cbiAgICAgICAgICAgIGlmIChlbGVtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBgJHtzZWxlY3Rvcn0gaXMgdW5kZWZpbmVkIWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gbnVsbCAmJiBfY291bnRlciA8IF9jb3VudGVyTGltaXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLmFmVGltZXIoKTtcbiAgICAgICAgICAgICAgICBfY291bnRlcisrO1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBsb2dpYyhzZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPj0gX2NvdW50ZXJMaW1pdCkge1xuICAgICAgICAgICAgICAgIF9jb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBsb2dpYyhzZWxlY3Rvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBSdW4gYSBmdW5jdGlvbiB3aGVuZXZlciBhbiBlbGVtZW50IGNoYW5nZXNcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgZWxlbWVudCB0byBiZSBvYnNlcnZlZC4gQ2FuIGJlIGEgc3RyaW5nLlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgb2JzZXJ2ZXIgdHJpZ2dlcnNcbiAgICAgKiBAcmV0dXJuIFByb21pc2Ugb2YgYSBtdXRhdGlvbiBvYnNlcnZlclxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZWxlbU9ic2VydmVyKFxuICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnQgfCBudWxsLFxuICAgICAgICBjYWxsYmFjazogTXV0YXRpb25DYWxsYmFjayxcbiAgICAgICAgY29uZmlnOiBNdXRhdGlvbk9ic2VydmVySW5pdCA9IHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIH1cbiAgICApOiBQcm9taXNlPE11dGF0aW9uT2JzZXJ2ZXI+IHtcbiAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2VsZWN0ZWQgPSA8SFRNTEVsZW1lbnQgfCBudWxsPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZG4ndCBmaW5kICcke3NlbGVjdG9yfSdgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGAlYyBTZXR0aW5nIG9ic2VydmVyIG9uICR7c2VsZWN0b3J9OiAke3NlbGVjdGVkfWAsXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiAjNWQ4YWE4J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGNhbGxiYWNrKTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHNlbGVjdGVkISwgY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBzY3JpcHQgaGFzIGJlZW4gdXBkYXRlZCBmcm9tIGFuIG9sZGVyIHZlcnNpb25cbiAgICAgKiBAcmV0dXJuIFRoZSB2ZXJzaW9uIHN0cmluZyBvciBmYWxzZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlZCgpOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKCdDaGVjay51cGRhdGVkKCknKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQUkVWIFZFUiA9ICR7dGhpcy5wcmV2VmVyfWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE5FVyBWRVIgPSAke3RoaXMubmV3VmVyfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8gRGlmZmVyZW50IHZlcnNpb25zOyB0aGUgc2NyaXB0IHdhcyB1cGRhdGVkXG4gICAgICAgICAgICBpZiAodGhpcy5uZXdWZXIgIT09IHRoaXMucHJldlZlcikge1xuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGlzIG5ldyBvciB1cGRhdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBuZXcgdmVyc2lvblxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF92ZXJzaW9uJywgdGhpcy5uZXdWZXIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZXZWZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHNjcmlwdCBoYXMgcnVuIGJlZm9yZVxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaGFzIHJ1biBiZWZvcmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCd1cGRhdGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QtdGltZSBydW5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGhhcyBuZXZlciBydW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBFbmFibGUgdGhlIG1vc3QgYmFzaWMgZmVhdHVyZXNcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2dvb2RyZWFkc0J0bicsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnYWxlcnRzJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ2ZpcnN0UnVuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBub3QgdXBkYXRlZCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIENoZWNrIHRvIHNlZSB3aGF0IHBhZ2UgaXMgYmVpbmcgYWNjZXNzZWRcbiAgICAgKiBAcGFyYW0ge1ZhbGlkUGFnZX0gcGFnZVF1ZXJ5IC0gQW4gb3B0aW9uYWwgcGFnZSB0byBzcGVjaWZpY2FsbHkgY2hlY2sgZm9yXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxzdHJpbmc+fSBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBwYWdlXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gT3B0aW9uYWxseSwgYSBib29sZWFuIGlmIHRoZSBjdXJyZW50IHBhZ2UgbWF0Y2hlcyB0aGUgYHBhZ2VRdWVyeWBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHBhZ2UocGFnZVF1ZXJ5PzogVmFsaWRQYWdlKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IHN0b3JlZFBhZ2UgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcbiAgICAgICAgbGV0IGN1cnJlbnRQYWdlOiBWYWxpZFBhZ2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBDaGVjay5wYWdlKCkgaGFzIGJlZW4gcnVuIGFuZCBhIHZhbHVlIHdhcyBzdG9yZWRcbiAgICAgICAgICAgIGlmIChzdG9yZWRQYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBzdG9yZWQgcGFnZVxuICAgICAgICAgICAgICAgIGlmICghcGFnZVF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RvcmVkUGFnZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IHN0b3JlZFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBub3QgcHJldmlvdXMgcnVuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwYWdlXG4gICAgICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5pbmRleE9mKCcucGhwJykgPyBwYXRoLnNwbGl0KCcucGhwJylbMF0gOiBwYXRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgcGFnZS5zaGlmdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQYWdlIFVSTCBAICR7cGFnZS5qb2luKCcgLT4gJyl9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9iamVjdCBsaXRlcmFsIG9mIHNvcnRzIHRvIHVzZSBhcyBhIFwic3dpdGNoXCJcbiAgICAgICAgICAgICAgICBjb25zdCBjYXNlczogeyBba2V5OiBzdHJpbmddOiAoKSA9PiBWYWxpZFBhZ2UgfCB1bmRlZmluZWQgfSA9IHtcbiAgICAgICAgICAgICAgICAgICAgJyc6ICgpID0+ICdob21lJyxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICgpID0+ICdob21lJyxcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRib3g6ICgpID0+ICdzaG91dGJveCcsXG4gICAgICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiAoKSA9PiAnc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICBzdG9yZTogKCkgPT4gJ3N0b3JlJyxcbiAgICAgICAgICAgICAgICAgICAgZnJlZWxlZWNoOiAoKSA9PiAnZnJlZWxlZWNoJyxcbiAgICAgICAgICAgICAgICAgICAgbWlsbGlvbmFpcmVzOiAoKSA9PiAndmF1bHQnLFxuICAgICAgICAgICAgICAgICAgICB0OiAoKSA9PiAndG9ycmVudCcsXG4gICAgICAgICAgICAgICAgICAgIHU6ICgpID0+ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgZjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2VbMV0gPT09ICd0JykgcmV0dXJuICdmb3J1bSB0aHJlYWQnO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0b3I6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlWzFdID09PSAnYnJvd3NlJykgcmV0dXJuICdicm93c2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3JlcXVlc3RzMicpIHJldHVybiAncmVxdWVzdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAndmlld1JlcXVlc3QnKSByZXR1cm4gJ3JlcXVlc3QgZGV0YWlscyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAndXBsb2FkJykgcmV0dXJuICd1cGxvYWQnO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBuZXdVc2VyczogKCkgPT4gJ25ldyB1c2VycycsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGEgY2FzZSB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICAgICAgIGlmIChjYXNlc1twYWdlWzBdXSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFnZSA9IGNhc2VzW3BhZ2VbMF1dKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBQYWdlIFwiJHtwYWdlfVwiIGlzIG5vdCBhIHZhbGlkIE0rIHBhZ2UuIFBhdGg6ICR7cGF0aH1gKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBjdXJyZW50IHBhZ2UgdG8gYmUgYWNjZXNzZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJywgY3VycmVudFBhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGp1c3QgY2hlY2tpbmcgd2hhdCBwYWdlIHdlJ3JlIG9uLCByZXR1cm4gdGhlIHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3VycmVudFBhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgY2hlY2tpbmcgZm9yIGEgc3BlY2lmaWMgcGFnZSwgcmV0dXJuIFRSVUUvRkFMU0VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogQ2hlY2sgdG8gc2VlIGlmIGEgZ2l2ZW4gY2F0ZWdvcnkgaXMgYW4gZWJvb2svYXVkaW9ib29rIGNhdGVnb3J5XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpc0Jvb2tDYXQoY2F0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ3VycmVudGx5LCBhbGwgYm9vayBjYXRlZ29yaWVzIGFyZSBhc3N1bWVkIHRvIGJlIGluIHRoZSByYW5nZSBvZiAzOS0xMjBcbiAgICAgICAgcmV0dXJuIGNhdCA+PSAzOSAmJiBjYXQgPD0gMTIwID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XG5cbi8qKlxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbHVlcyBhbmQgbWV0aG9kcyByZWxhdGVkIHRvIHN0eWxlc1xuICogQGNvbnN0cnVjdG9yIEluaXRpYWxpemVzIHRoZW1lIGJhc2VkIG9uIGxhc3Qgc2F2ZWQgdmFsdWU7IGNhbiBiZSBjYWxsZWQgYmVmb3JlIHBhZ2UgY29udGVudCBpcyBsb2FkZWRcbiAqIEBtZXRob2QgdGhlbWUgR2V0cyBvciBzZXRzIHRoZSBjdXJyZW50IHRoZW1lXG4gKi9cbmNsYXNzIFN0eWxlIHtcbiAgICBwcml2YXRlIF90aGVtZTogc3RyaW5nO1xuICAgIHByaXZhdGUgX3ByZXZUaGVtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX2Nzc0RhdGE6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBUaGUgbGlnaHQgdGhlbWUgaXMgdGhlIGRlZmF1bHQgdGhlbWUsIHNvIHVzZSBNKyBMaWdodCB2YWx1ZXNcbiAgICAgICAgdGhpcy5fdGhlbWUgPSAnbGlnaHQnO1xuXG4gICAgICAgIC8vIEdldCB0aGUgcHJldmlvdXNseSB1c2VkIHRoZW1lIG9iamVjdFxuICAgICAgICB0aGlzLl9wcmV2VGhlbWUgPSB0aGlzLl9nZXRQcmV2VGhlbWUoKTtcblxuICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgdGhlbWUgb2JqZWN0IGV4aXN0cywgYXNzdW1lIHRoZSBjdXJyZW50IHRoZW1lIGlzIGlkZW50aWNhbFxuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gdGhpcy5fcHJldlRoZW1lO1xuICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oJ25vIHByZXZpb3VzIHRoZW1lJyk7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIENTUyBkYXRhXG4gICAgICAgIHRoaXMuX2Nzc0RhdGEgPSBHTV9nZXRSZXNvdXJjZVRleHQoJ01QX0NTUycpO1xuICAgIH1cblxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgcmV0dXJuZWQgKi9cbiAgICBnZXQgdGhlbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xuICAgIH1cblxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgc2V0ICovXG4gICAgc2V0IHRoZW1lKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3RoZW1lID0gdmFsO1xuICAgIH1cblxuICAgIC8qKiBTZXRzIHRoZSBNKyB0aGVtZSBiYXNlZCBvbiB0aGUgc2l0ZSB0aGVtZSAqL1xuICAgIHB1YmxpYyBhc3luYyBhbGlnblRvU2l0ZVRoZW1lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB0aGVtZTogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2V0U2l0ZUNTUygpO1xuICAgICAgICB0aGlzLl90aGVtZSA9IHRoZW1lLmluZGV4T2YoJ2RhcmsnKSA+IDAgPyAnZGFyaycgOiAnbGlnaHQnO1xuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB0aGlzLl90aGVtZSkge1xuICAgICAgICAgICAgdGhpcy5fc2V0UHJldlRoZW1lKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbmplY3QgdGhlIENTUyBjbGFzcyB1c2VkIGJ5IE0rIGZvciB0aGVtaW5nXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdib2R5JykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2R5OiBIVE1MQm9keUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgICAgICAgICAgaWYgKGJvZHkpIHtcbiAgICAgICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoYG1wXyR7dGhpcy5fdGhlbWV9YCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBCb2R5IGlzICR7Ym9keX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIEluamVjdHMgdGhlIHN0eWxlc2hlZXQgbGluayBpbnRvIHRoZSBoZWFkZXIgKi9cbiAgICBwdWJsaWMgaW5qZWN0TGluaygpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaWQ6IHN0cmluZyA9ICdtcF9jc3MnO1xuICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSkge1xuICAgICAgICAgICAgY29uc3Qgc3R5bGU6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgc3R5bGUuaWQgPSBpZDtcbiAgICAgICAgICAgIHN0eWxlLmlubmVyVGV4dCA9IHRoaXMuX2Nzc0RhdGEgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2Nzc0RhdGEgOiAnJztcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKSEuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKVxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBhbiBlbGVtZW50IHdpdGggdGhlIGlkIFwiJHtpZH1cIiBhbHJlYWR5IGV4aXN0c2ApO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgaWYgaXQgZXhpc3RzICovXG4gICAgcHJpdmF0ZSBfZ2V0UHJldlRoZW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiBHTV9nZXRWYWx1ZSgnc3R5bGVfdGhlbWUnKTtcbiAgICB9XG5cbiAgICAvKiogU2F2ZXMgdGhlIGN1cnJlbnQgdGhlbWUgZm9yIGZ1dHVyZSByZWZlcmVuY2UgKi9cbiAgICBwcml2YXRlIF9zZXRQcmV2VGhlbWUoKTogdm9pZCB7XG4gICAgICAgIEdNX3NldFZhbHVlKCdzdHlsZV90aGVtZScsIHRoaXMuX3RoZW1lKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRTaXRlQ1NTKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGhlbWVVUkw6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykhXG4gICAgICAgICAgICAgICAgLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVtZVVSTCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoZW1lVVJMKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihgdGhlbWVVcmwgaXMgbm90IGEgc3RyaW5nOiAke3RoZW1lVVJMfWApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxuLyoqXG4gKiBDT1JFIEZFQVRVUkVTXG4gKlxuICogWW91ciBmZWF0dXJlIGJlbG9uZ3MgaGVyZSBpZiB0aGUgZmVhdHVyZTpcbiAqIEEpIGlzIGNyaXRpY2FsIHRvIHRoZSB1c2Vyc2NyaXB0XG4gKiBCKSBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG90aGVyIGZlYXR1cmVzXG4gKiBDKSB3aWxsIGhhdmUgc2V0dGluZ3MgZGlzcGxheWVkIG9uIHRoZSBTZXR0aW5ncyBwYWdlXG4gKiBJZiBBICYgQiBhcmUgbWV0IGJ1dCBub3QgQyBjb25zaWRlciB1c2luZyBgVXRpbHMudHNgIGluc3RlYWRcbiAqL1xuXG4vKipcbiAqIFRoaXMgZmVhdHVyZSBjcmVhdGVzIGEgcG9wLXVwIG5vdGlmaWNhdGlvblxuICovXG5jbGFzcyBBbGVydHMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLk90aGVyLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2FsZXJ0cycsXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTSsgQWxlcnQgcGFuZWwgZm9yIHVwZGF0ZSBpbmZvcm1hdGlvbiwgZXRjLicsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgcHVibGljIG5vdGlmeShraW5kOiBzdHJpbmcgfCBib29sZWFuLCBsb2c6IEFycmF5T2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKGBBbGVydHMubm90aWZ5KCAke2tpbmR9IClgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8gVmVyaWZ5IGEgbm90aWZpY2F0aW9uIHJlcXVlc3Qgd2FzIG1hZGVcbiAgICAgICAgICAgIGlmIChraW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gVmVyaWZ5IG5vdGlmaWNhdGlvbnMgYXJlIGFsbG93ZWRcbiAgICAgICAgICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ2FsZXJ0cycpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG1zZyB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1aWxkTXNnID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZE1zZyggJHt0aXRsZX0gKWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBhcnJheSBpc24ndCBlbXB0eVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyci5sZW5ndGggPiAwICYmIGFyclswXSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzZWN0aW9uIGhlYWRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbXNnOiBzdHJpbmcgPSBgPGg0PiR7dGl0bGV9OjwvaDQ+PHVsPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggaXRlbSBpbiB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyci5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSBgPGxpPiR7aXRlbX08L2xpPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgbXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyArPSAnPC91bD4nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBub3RpZmljYXRpb24gcGFuZWxcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRQYW5lbCA9IChtc2c6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkUGFuZWwoICR7bXNnfSApYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnYm9keScpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPSdtcF9ub3RpZmljYXRpb24nPiR7bXNnfTxzcGFuPlg8L3NwYW4+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2dCb3g6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX25vdGlmaWNhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUJ0bjogSFRNTFNwYW5FbGVtZW50ID0gbXNnQm94LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbG9zZUJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGNsb3NlIGJ1dHRvbiBpcyBjbGlja2VkLCByZW1vdmUgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtc2dCb3gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZ0JveC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2U6IHN0cmluZyA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAndXBkYXRlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyB1cGRhdGUgbWVzc2FnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgPHN0cm9uZz5NQU0rIGhhcyBiZWVuIHVwZGF0ZWQhPC9zdHJvbmc+IFlvdSBhcmUgbm93IHVzaW5nIHYke01QLlZFUlNJT059LCBjcmVhdGVkIG9uICR7TVAuVElNRVNUQU1QfS4gRGlzY3VzcyBpdCBvbiA8YSBocmVmPSdmb3J1bXMucGhwP2FjdGlvbj12aWV3dG9waWMmdG9waWNpZD00MTg2Myc+dGhlIGZvcnVtczwvYT4uPGhyPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGNoYW5nZWxvZ1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuVVBEQVRFX0xJU1QsICdDaGFuZ2VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5CVUdfTElTVCwgJ0tub3duIEJ1Z3MnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAnZmlyc3RSdW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGg0PldlbGNvbWUgdG8gTUFNKyE8L2g0PlBsZWFzZSBoZWFkIG92ZXIgdG8geW91ciA8YSBocmVmPVwiL3ByZWZlcmVuY2VzL2luZGV4LnBocFwiPnByZWZlcmVuY2VzPC9hPiB0byBlbmFibGUgdGhlIE1BTSsgc2V0dGluZ3MuPGJyPkFueSBidWcgcmVwb3J0cywgZmVhdHVyZSByZXF1ZXN0cywgZXRjLiBjYW4gYmUgbWFkZSBvbiA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2dhcmRlbnNoYWRlL21hbS1wbHVzL2lzc3Vlc1wiPkdpdGh1YjwvYT4sIDxhIGhyZWY9XCIvZm9ydW1zLnBocD9hY3Rpb249dmlld3RvcGljJnRvcGljaWQ9NDE4NjNcIj50aGUgZm9ydW1zPC9hPiwgb3IgPGEgaHJlZj1cIi9zZW5kbWVzc2FnZS5waHA/cmVjZWl2ZXI9MTA4MzAzXCI+dGhyb3VnaCBwcml2YXRlIG1lc3NhZ2U8L2E+Lic7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgZmlyc3QgcnVuIG1lc3NhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBSZWNlaXZlZCBtc2cga2luZDogJHtraW5kfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFuZWwobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWRcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG5jbGFzcyBEZWJ1ZyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZGVidWcnLFxuICAgICAgICBkZXNjOlxuICAgICAgICAgICAgJ0Vycm9yIGxvZyAoPGVtPkNsaWNrIHRoaXMgY2hlY2tib3ggdG8gZW5hYmxlIHZlcmJvc2UgbG9nZ2luZyB0byB0aGUgY29uc29sZTwvZW0+KScsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG4iLCIvKipcbiAqICMgR0xPQkFMIEZFQVRVUkVTXG4gKi9cblxuLyoqXG4gKiAjIyBIaWRlIHRoZSBob21lIGJ1dHRvbiBvciB0aGUgYmFubmVyXG4gKi9cbmNsYXNzIEhpZGVIb21lIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXG4gICAgICAgIHR5cGU6ICdkcm9wZG93bicsXG4gICAgICAgIHRpdGxlOiAnaGlkZUhvbWUnLFxuICAgICAgICB0YWc6ICdSZW1vdmUgYmFubmVyL2hvbWUnLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiAnRG8gbm90IHJlbW92ZSBlaXRoZXInLFxuICAgICAgICAgICAgaGlkZUJhbm5lcjogJ0hpZGUgdGhlIGJhbm5lcicsXG4gICAgICAgICAgICBoaWRlSG9tZTogJ0hpZGUgdGhlIGhvbWUgYnV0dG9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgaGVhZGVyIGltYWdlIG9yIEhvbWUgYnV0dG9uLCBiZWNhdXNlIGJvdGggbGluayB0byB0aGUgaG9tZXBhZ2UnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5tZW51JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgY29uc3QgaGlkZXI6IHN0cmluZyA9IEdNX2dldFZhbHVlKHRoaXMuX3NldHRpbmdzLnRpdGxlKTtcbiAgICAgICAgaWYgKGhpZGVyID09PSAnaGlkZUhvbWUnKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfaG9tZScpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBob21lIGJ1dHRvbiEnKTtcbiAgICAgICAgfSBlbHNlIGlmIChoaWRlciA9PT0gJ2hpZGVCYW5uZXInKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfYmFubmVyJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIGJhbm5lciEnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBEcm9wZG93blNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIFVzZSBjdXN0b20gYm9va21hcmsgaWNvbnNcbiAqL1xuY2xhc3MgQm9va21hcmtJY29ucyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2Jvb2ttYXJrSWNvbnMnLFxuICAgICAgICBkZXNjOiBgVXNlIE1BTSsncyBjdXN0b20gYm9va21hcmsgaWNvbnMgaW5zdGVhZCBvZiB0aGUgc2l0ZSdzIGRlZmF1bHQgaWNvbnNgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnYm9keSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHRoaXMuX3NldHRpbmdzLnRpdGxlKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl9zZXR0aW5ncy50aXRsZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdtcF9ib29rbWFya092ZXJyaWRlJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIGJvb2ttYXJrIGljb25zIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIEJ5cGFzcyB0aGUgdmF1bHQgaW5mbyBwYWdlXG4gKi9cbmNsYXNzIFZhdWx0TGluayBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3ZhdWx0TGluaycsXG4gICAgICAgIGRlc2M6ICdNYWtlIHRoZSBWYXVsdCBsaW5rIGJ5cGFzcyB0aGUgVmF1bHQgSW5mbyBwYWdlJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtaWxsaW9uSW5mbyc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpIVxuICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvbWlsbGlvbmFpcmVzL2RvbmF0ZS5waHAnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTWFkZSB0aGUgdmF1bHQgdGV4dCBsaW5rIHRvIHRoZSBkb25hdGUgcGFnZSEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyBTaG9ydGVuIHRoZSB2YXVsdCAmIHJhdGlvIHRleHRcbiAqL1xuY2xhc3MgTWluaVZhdWx0SW5mbyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ21pbmlWYXVsdEluZm8nLFxuICAgICAgICBkZXNjOiAnU2hvcnRlbiB0aGUgVmF1bHQgbGluayAmIHJhdGlvIHRleHQnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21pbGxpb25JbmZvJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgY29uc3QgdmF1bHRUZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGNvbnN0IHJhdGlvVGV4dDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpITtcblxuICAgICAgICAvLyBTaG9ydGVuIHRoZSByYXRpbyB0ZXh0XG4gICAgICAgIC8vIFRPRE86IG1vdmUgdGhpcyB0byBpdHMgb3duIHNldHRpbmc/XG4gICAgICAgIC8qIFRoaXMgY2hhaW5lZCBtb25zdHJvc2l0eSBkb2VzIHRoZSBmb2xsb3dpbmc6XG4gICAgICAgIC0gRXh0cmFjdCB0aGUgbnVtYmVyICh3aXRoIGZsb2F0KSBmcm9tIHRoZSBlbGVtZW50XG4gICAgICAgIC0gRml4IHRoZSBmbG9hdCB0byAyIGRlY2ltYWwgcGxhY2VzICh3aGljaCBjb252ZXJ0cyBpdCBiYWNrIGludG8gYSBzdHJpbmcpXG4gICAgICAgIC0gQ29udmVydCB0aGUgc3RyaW5nIGJhY2sgaW50byBhIG51bWJlciBzbyB0aGF0IHdlIGNhbiBjb252ZXJ0IGl0IHdpdGhgdG9Mb2NhbGVTdHJpbmdgIHRvIGdldCBjb21tYXMgYmFjayAqL1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIoVXRpbC5leHRyYWN0RmxvYXQocmF0aW9UZXh0KVswXS50b0ZpeGVkKDIpKS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICByYXRpb1RleHQuaW5uZXJIVE1MID0gYCR7bnVtfSA8aW1nIHNyYz1cIi9waWMvdXBkb3duQmlnLnBuZ1wiIGFsdD1cInJhdGlvXCI+YDtcblxuICAgICAgICAvLyBUdXJuIHRoZSBudW1lcmljIHBvcnRpb24gb2YgdGhlIHZhdWx0IGxpbmsgaW50byBhIG51bWJlclxuICAgICAgICBsZXQgbmV3VGV4dDogbnVtYmVyID0gcGFyc2VJbnQoXG4gICAgICAgICAgICB2YXVsdFRleHQudGV4dENvbnRlbnQhLnNwbGl0KCc6JylbMV0uc3BsaXQoJyAnKVsxXS5yZXBsYWNlKC8sL2csICcnKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIHZhdWx0IGFtb3VudCB0byBtaWxsaW9udGhzXG4gICAgICAgIG5ld1RleHQgPSBOdW1iZXIoKG5ld1RleHQgLyAxZTYpLnRvRml4ZWQoMykpO1xuICAgICAgICAvLyBVcGRhdGUgdGhlIHZhdWx0IHRleHRcbiAgICAgICAgdmF1bHRUZXh0LnRleHRDb250ZW50ID0gYFZhdWx0OiAke25ld1RleHR9IG1pbGxpb25gO1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaG9ydGVuZWQgdGhlIHZhdWx0ICYgcmF0aW8gbnVtYmVycyEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyBEaXNwbGF5IGJvbnVzIHBvaW50IGRlbHRhXG4gKi9cbmNsYXNzIEJvbnVzUG9pbnREZWx0YSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2JvbnVzUG9pbnREZWx0YScsXG4gICAgICAgIGRlc2M6IGBEaXNwbGF5IGhvdyBtYW55IGJvbnVzIHBvaW50cyB5b3UndmUgZ2FpbmVkIHNpbmNlIGxhc3QgcGFnZWxvYWRgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RtQlAnO1xuICAgIHByaXZhdGUgX3ByZXZCUDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9jdXJyZW50QlA6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfZGVsdGE6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0KCkge1xuICAgICAgICBjb25zdCBjdXJyZW50QlBFbDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuXG4gICAgICAgIC8vIEdldCBvbGQgQlAgdmFsdWVcbiAgICAgICAgdGhpcy5fcHJldkJQID0gdGhpcy5fZ2V0QlAoKTtcblxuICAgICAgICBpZiAoY3VycmVudEJQRWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEV4dHJhY3Qgb25seSB0aGUgbnVtYmVyIGZyb20gdGhlIEJQIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSBjdXJyZW50QlBFbC50ZXh0Q29udGVudCEubWF0Y2goXG4gICAgICAgICAgICAgICAgL1xcZCsvZ1xuICAgICAgICAgICAgKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xuXG4gICAgICAgICAgICAvLyBTZXQgbmV3IEJQIHZhbHVlXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50QlAgPSBwYXJzZUludChjdXJyZW50WzBdKTtcbiAgICAgICAgICAgIHRoaXMuX3NldEJQKHRoaXMuX2N1cnJlbnRCUCk7XG5cbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZWx0YVxuICAgICAgICAgICAgdGhpcy5fZGVsdGEgPSB0aGlzLl9jdXJyZW50QlAgLSB0aGlzLl9wcmV2QlA7XG5cbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRleHQgaWYgbm90IDBcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZWx0YSAhPT0gMCAmJiAhaXNOYU4odGhpcy5fZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcGxheUJQKHRoaXMuX2RlbHRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2Rpc3BsYXlCUCA9IChicDogbnVtYmVyKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGJvbnVzQm94OiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGxldCBkZWx0YUJveDogc3RyaW5nID0gJyc7XG5cbiAgICAgICAgZGVsdGFCb3ggPSBicCA+IDAgPyBgKyR7YnB9YCA6IGAke2JwfWA7XG5cbiAgICAgICAgaWYgKGJvbnVzQm94ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBib251c0JveC5pbm5lckhUTUwgKz0gYDxzcGFuIGNsYXNzPSdtcF9icERlbHRhJz4gKCR7ZGVsdGFCb3h9KTwvc3Bhbj5gO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgX3NldEJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICAgICAgR01fc2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCwgYCR7YnB9YCk7XG4gICAgfTtcbiAgICBwcml2YXRlIF9nZXRCUCA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBzdG9yZWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVZhbGApO1xuICAgICAgICBpZiAoc3RvcmVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0b3JlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMgQmx1ciB0aGUgaGVhZGVyIGJhY2tncm91bmRcbiAqL1xuY2xhc3MgQmx1cnJlZEhlYWRlciBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2JsdXJyZWRIZWFkZXInLFxuICAgICAgICBkZXNjOiBgQWRkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIgYXJlYWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc2l0ZU1haW4gPiBoZWFkZXInO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAke3RoaXMuX3Rhcn1gKTtcbiAgICAgICAgY29uc3QgaGVhZGVySW1nOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKGBpbWdgKTtcblxuICAgICAgICBpZiAoaGVhZGVySW1nKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJTcmM6IHN0cmluZyB8IG51bGwgPSBoZWFkZXJJbWcuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgY29udGFpbmVyIGZvciB0aGUgYmFja2dyb3VuZFxuICAgICAgICAgICAgY29uc3QgYmx1cnJlZEJhY2s6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdtcF9ibHVycmVkQmFjaycpO1xuICAgICAgICAgICAgaGVhZGVyLmFwcGVuZChibHVycmVkQmFjayk7XG4gICAgICAgICAgICBibHVycmVkQmFjay5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBoZWFkZXJTcmMgPyBgdXJsKCR7aGVhZGVyU3JjfSlgIDogJyc7XG4gICAgICAgICAgICBibHVycmVkQmFjay5jbGFzc0xpc3QuYWRkKCdtcF9jb250YWluZXInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIhJyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB0eXBlIHNlbGVjdGVkIGZvciBgdGhpcy5fc2V0dGluZ3NgXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMgSGlkZSB0aGUgc2VlZGJveCBsaW5rXG4gKi9cbmNsYXNzIEhpZGVTZWVkYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdoaWRlU2VlZGJveCcsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBcIkdldCBBIFNlZWRib3hcIiBtZW51IGl0ZW0nLFxuICAgIH07XG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtZW51IC5zYkRvbkNyeXB0byc7XG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3Qgc2VlZGJveEJ0bjogSFRNTExJRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGlmIChzZWVkYm94QnRuKSB7XG4gICAgICAgICAgICBzZWVkYm94QnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIFNlZWRib3ggYnV0dG9uIScpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICMjIEhpZGUgdGhlIGRvbmF0aW9uIGxpbmtcbiAqL1xuY2xhc3MgSGlkZURvbmF0aW9uQm94IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdoaWRlRG9uYXRpb25Cb3gnLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgRG9uYXRpb25zIG1lbnUgaXRlbScsXG4gICAgfTtcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21lbnUgLm1tRG9uQm94JztcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zdCBkb25hdGlvbkJveEJ0bjogSFRNTExJRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIGlmIChkb25hdGlvbkJveEJ0bikge1xuICAgICAgICAgICAgZG9uYXRpb25Cb3hCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgRG9uYXRpb24gQm94IGJ1dHRvbiEnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIEZpeGVkIG5hdmlnYXRpb24gJiBzZWFyY2hcbiAqL1xuXG5jbGFzcyBGaXhlZE5hdiBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZml4ZWROYXYnLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcbiAgICAgICAgZGVzYzogJ0ZpeCB0aGUgbmF2aWdhdGlvbi9zZWFyY2ggdG8gdGhlIHRvcCBvZiB0aGUgcGFnZS4nLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnYm9keSc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFtdKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSEuY2xhc3NMaXN0LmFkZCgnbXBfZml4ZWRfbmF2Jyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFBpbm5lZCB0aGUgbmF2L3NlYXJjaCB0byB0aGUgdG9wIScpO1xuICAgIH1cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jaGVjay50c1wiIC8+XG5cbi8qKlxuICogU0hBUkVEIENPREVcbiAqXG4gKiBUaGlzIGlzIGZvciBhbnl0aGluZyB0aGF0J3Mgc2hhcmVkIGJldHdlZW4gZmlsZXMsIGJ1dCBpcyBub3QgZ2VuZXJpYyBlbm91Z2ggdG9cbiAqIHRvIGJlbG9uZyBpbiBgVXRpbHMudHNgLiBJIGNhbid0IHRoaW5rIG9mIGEgYmV0dGVyIHdheSB0byBjYXRlZ29yaXplIERSWSBjb2RlLlxuICovXG5cbmNsYXNzIFNoYXJlZCB7XG4gICAgLyoqXG4gICAgICogUmVjZWl2ZSBhIHRhcmdldCBhbmQgYHRoaXMuX3NldHRpbmdzLnRpdGxlYFxuICAgICAqIEBwYXJhbSB0YXIgQ1NTIHNlbGVjdG9yIGZvciBhIHRleHQgaW5wdXQgYm94XG4gICAgICovXG4gICAgLy8gVE9ETzogd2l0aCBhbGwgQ2hlY2tpbmcgYmVpbmcgZG9uZSBpbiBgVXRpbC5zdGFydEZlYXR1cmUoKWAgaXQncyBubyBsb25nZXIgbmVjZXNzYXJ5IHRvIENoZWNrIGluIHRoaXMgZnVuY3Rpb25cbiAgICBwdWJsaWMgZmlsbEdpZnRCb3ggPSAoXG4gICAgICAgIHRhcjogc3RyaW5nLFxuICAgICAgICBzZXR0aW5nVGl0bGU6IHN0cmluZ1xuICAgICk6IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPiA9PiB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5maWxsR2lmdEJveCggJHt0YXJ9LCAke3NldHRpbmdUaXRsZX0gKWApO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQodGFyKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludEJveDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRCb3gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlclNldFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtzZXR0aW5nVGl0bGV9X3ZhbGApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXhQb2ludHM6IG51bWJlciA9IHBhcnNlSW50KHBvaW50Qm94LmdldEF0dHJpYnV0ZSgnbWF4JykhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTih1c2VyU2V0UG9pbnRzKSAmJiB1c2VyU2V0UG9pbnRzIDw9IG1heFBvaW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4UG9pbnRzID0gdXNlclNldFBvaW50cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwb2ludEJveC52YWx1ZSA9IG1heFBvaW50cy50b0ZpeGVkKDApO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1heFBvaW50cyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBsaXN0IG9mIGFsbCByZXN1bHRzIGZyb20gQnJvd3NlIHBhZ2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2VhcmNoTGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+ID0+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmdldFNlYXJjaExpc3QoIClgKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSBzZWFyY2ggcmVzdWx0cyB0byBleGlzdFxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0gdGQnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hdGNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiA9IDxcbiAgICAgICAgICAgICAgICAgICAgTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxuICAgICAgICAgICAgICAgID5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjc3NyIHRyW2lkIF49IFwidGRyXCJdJyk7XG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgc25hdGNoTGlzdCBpcyAke3NuYXRjaExpc3R9YCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IE1ha2UgZ29vZHJlYWRzQnV0dG9ucygpIGludG8gYSBnZW5lcmljIGZyYW1ld29yayBmb3Igb3RoZXIgc2l0ZSdzIGJ1dHRvbnNcbiAgICBwdWJsaWMgZ29vZHJlYWRzQnV0dG9ucyA9IGFzeW5jIChcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXG4gICAgICAgIGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxuICAgICkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucy4uLicpO1xuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xuXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggR29vZHJlYWRzJywgJ21wX2dyUm93Jyk7XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9nclJvdyAuZmxleCcpO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cgLmZsZXgnKVxuICAgICAgICApO1xuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnc2VyaWVzJywgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgYnV0dG9uVGl0bGUsIDQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCdWlsZCBBdXRob3IgYnV0dG9uXG4gICAgICAgIGF1dGhvclBcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGF1dGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdXRob3JzID0gYXV0aC5qb2luKCcgJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdhdXRob3InLCBhdXRob3JzKTtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnQXV0aG9yJywgMyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBhdXRob3IgZGF0YSBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy8gQnVpbGQgVGl0bGUgYnV0dG9uc1xuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXdhaXQgVXRpbC5nZXRCb29rVGl0bGUoYm9va0RhdGEsIGF1dGhvcnMpO1xuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2Jvb2snLCB0aXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ1RpdGxlJywgMik7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGEgdGl0bGUgYW5kIGF1dGhvciBib3RoIGV4aXN0LCBtYWtlIGEgVGl0bGUgKyBBdXRob3IgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRob3JzICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYm90aFVSTCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGl0bGV9ICR7YXV0aG9yc31gXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucyFgKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGF1ZGlibGVCdXR0b25zID0gYXN5bmMgKFxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxuICAgICAgICBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXG4gICAgKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyB0aGUgTUFNLXRvLUF1ZGlibGUgYnV0dG9ucy4uLicpO1xuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xuXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggQXVkaWJsZScsICdtcF9hdVJvdycpO1xuXG4gICAgICAgIC8vIEV4dHJhY3QgdGhlIFNlcmllcyBhbmQgQXV0aG9yXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcbiAgICAgICAgICAgIChhdXRob3JQID0gVXRpbC5nZXRCb29rQXV0aG9ycyhhdXRob3JEYXRhKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcubXBfYXVSb3cgLmZsZXgnKTtcblxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2F1Um93IC5mbGV4JylcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdXR0b24gcm93IGNhbm5vdCBiZSB0YXJnZXRlZCEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIFNlcmllcyBidXR0b25zXG4gICAgICAgIHNlcmllc1AudGhlbigoc2VyKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZXIuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBidXR0b25UaXRsZSA9IHNlci5sZW5ndGggPiAxID8gYFNlcmllczogJHtpdGVtfWAgOiAnU2VyaWVzJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD9rZXl3b3Jkcz0ke2l0ZW19YDtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCBidXR0b25UaXRsZSwgNCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc2VyaWVzIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cbiAgICAgICAgYXV0aG9yUFxuICAgICAgICAgICAgLnRoZW4oKGF1dGgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcnMgPSBhdXRoLmpvaW4oJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD9hdXRob3JfYXV0aG9yPSR7YXV0aG9yc31gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP3RpdGxlPSR7dGl0bGV9YDtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD90aXRsZT0ke3RpdGxlfSZhdXRob3JfYXV0aG9yPSR7YXV0aG9yc31gO1xuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1BdWRpYmxlIGJ1dHRvbnMhYCk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IFN3aXRjaCB0byBTdG9yeUdyYXBoIEFQSSBvbmNlIGl0IGJlY29tZXMgYXZhaWxhYmxlPyBPciBhZHZhbmNlZCBzZWFyY2hcbiAgICBwdWJsaWMgc3RvcnlHcmFwaEJ1dHRvbnMgPSBhc3luYyAoXG4gICAgICAgIGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcbiAgICAgICAgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcbiAgICApID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zLi4uJyk7XG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XG5cbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBUaGVTdG9yeUdyYXBoJywgJ21wX3NnUm93Jyk7XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9zZ1JvdyAuZmxleCcpO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cgLmZsZXgnKVxuICAgICAgICApO1xuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7aXRlbX1gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsIGJ1dHRvblRpdGxlLCA0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZXJpZXMgZGF0YSBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQnVpbGQgQXV0aG9yIGJ1dHRvblxuICAgICAgICBhdXRob3JQXG4gICAgICAgICAgICAudGhlbigoYXV0aCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhdXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7YXV0aG9yc31gO1xuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7dGl0bGV9YDtcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gYGh0dHBzOi8vYXBwLnRoZXN0b3J5Z3JhcGguY29tL2Jyb3dzZT9zZWFyY2hfdGVybT0ke3RpdGxlfSAke2F1dGhvcnN9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIGJvdGhVUkwsICdUaXRsZSArIEF1dGhvcicsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGdlbmVyYXRlIFRpdGxlK0F1dGhvciBsaW5rIVxcblRpdGxlOiAke3RpdGxlfVxcbkF1dGhvcnM6ICR7YXV0aG9yc31gXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyB0aXRsZSBkYXRhIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGVkIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zIWApO1xuICAgIH07XG5cbiAgICBwdWJsaWMgZ2V0UmF0aW9Qcm90ZWN0TGV2ZWxzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgbDEgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMMV92YWwnKSk7XG4gICAgICAgIGxldCBsMiA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwyX3ZhbCcpKTtcbiAgICAgICAgbGV0IGwzID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDNfdmFsJykpO1xuICAgICAgICBjb25zdCBsMV9kZWYgPSAwLjU7XG4gICAgICAgIGNvbnN0IGwyX2RlZiA9IDE7XG4gICAgICAgIGNvbnN0IGwzX2RlZiA9IDI7XG5cbiAgICAgICAgLy8gRGVmYXVsdCB2YWx1ZXMgaWYgZW1wdHlcbiAgICAgICAgaWYgKGlzTmFOKGwzKSkgbDMgPSBsM19kZWY7XG4gICAgICAgIGlmIChpc05hTihsMikpIGwyID0gbDJfZGVmO1xuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IGwxX2RlZjtcblxuICAgICAgICAvLyBJZiBzb21lb25lIHB1dCB0aGluZ3MgaW4gYSBkdW1iIG9yZGVyLCBpZ25vcmUgc21hbGxlciBudW1iZXJzXG4gICAgICAgIGlmIChsMiA+IGwzKSBsMiA9IGwzO1xuICAgICAgICBpZiAobDEgPiBsMikgbDEgPSBsMjtcblxuICAgICAgICAvLyBJZiBjdXN0b20gbnVtYmVycyBhcmUgc21hbGxlciB0aGFuIGRlZmF1bHQgdmFsdWVzLCBpZ25vcmUgdGhlIGxvd2VyIHdhcm5pbmdcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSBsMyA8IGwyX2RlZiA/IGwzIDogbDJfZGVmO1xuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IGwyIDwgbDFfZGVmID8gbDIgOiBsMV9kZWY7XG5cbiAgICAgICAgcmV0dXJuIFtsMSwgbDIsIGwzXTtcbiAgICB9O1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XG4vKipcbiAqICNCUk9XU0UgUEFHRSBGRUFUVVJFU1xuICovXG5cbmNvbnN0IHVwZGF0ZUJyb3dzZVJlc3VsdFZpc2liaWxpdHkgPSAocm93OiBIVE1MVGFibGVSb3dFbGVtZW50KTogdm9pZCA9PiB7XG4gICAgY29uc3QgaGlkZGVuQnlTbmF0Y2hlZDogYm9vbGVhbiA9IHJvdy5kYXRhc2V0Lm1wSGlkZVNuYXRjaGVkID09PSAndHJ1ZSc7XG4gICAgY29uc3QgaGlkZGVuQnlCb29rbWFya2VkOiBib29sZWFuID0gcm93LmRhdGFzZXQubXBIaWRlQm9va21hcmtlZCA9PT0gJ3RydWUnO1xuXG4gICAgcm93LnN0eWxlLmRpc3BsYXkgPSBoaWRkZW5CeVNuYXRjaGVkIHx8IGhpZGRlbkJ5Qm9va21hcmtlZCA/ICdub25lJyA6ICd0YWJsZS1yb3cnO1xufTtcblxuLyoqXG4gKiBBbGxvd3MgU25hdGNoZWQgdG9ycmVudHMgdG8gYmUgaGlkZGVuL3Nob3duXG4gKi9cbmNsYXNzIFRvZ2dsZVNuYXRjaGVkIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU25hdGNoZWQnLFxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGhpZGUvc2hvdyByZXN1bHRzIHRoYXQgeW91J3ZlIHNuYXRjaGVkYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xuICAgIHByaXZhdGUgX2lzVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBfc2VhcmNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIF9zbmF0Y2hlZEhvb2s6IHN0cmluZyA9ICd0ZCBkaXZbY2xhc3NePVwiYnJvd3NlXCJdJztcbiAgICBwcml2YXRlIF9yb3dTdGF0ZUtleTogc3RyaW5nID0gJ21wSGlkZVNuYXRjaGVkJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsZXQgdG9nZ2xlOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XG4gICAgICAgIGxldCByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+O1xuICAgICAgICBjb25zdCBzdG9yZWRTdGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXG4gICAgICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoc3RvcmVkU3RhdGUgPT09ICdmYWxzZScgJiYgR01fZ2V0VmFsdWUoJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlVGV4dDogc3RyaW5nID0gdGhpcy5faXNWaXNpYmxlID8gJ0hpZGUgU25hdGNoZWQnIDogJ1Nob3cgU25hdGNoZWQnO1xuXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHRvZ2dsZSA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdzbmF0Y2hlZFRvZ2dsZScsXG4gICAgICAgICAgICAgICAgdG9nZ2xlVGV4dCxcbiAgICAgICAgICAgICAgICAnaDEnLFxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBiYXNlZCBvbiB2aXMgc3RhdGVcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBTbmF0Y2hlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0hpZGUgU25hdGNoZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJlc3VsdExpc3RcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBUb2dnbGUgU25hdGNoZWQgYnV0dG9uIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxuICAgICAqIEBwYXJhbSBzdWJUYXIgdGhlIGVsZW1lbnRzIHRoYXQgbXVzdCBiZSBjb250YWluZWQgaW4gb3VyIGZpbHRlcmVkIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxpc3QuZm9yRWFjaCgoc25hdGNoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxIZWFkaW5nRWxlbWVudCA9IDxIVE1MSGVhZGluZ0VsZW1lbnQ+KFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zbmF0Y2hlZFRvZ2dsZScpIVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IG9ubHkgdGhlIGl0ZW1zIHRoYXQgbWF0Y2ggb3VyIHN1YiBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzbmF0Y2gucXVlcnlTZWxlY3RvcihzdWJUYXIpO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gSGlkZS9zaG93IGFzIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdTaG93IFNuYXRjaGVkJztcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLmRhdGFzZXRbdGhpcy5fcm93U3RhdGVLZXldID0gJ3RydWUnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBTbmF0Y2hlZCc7XG4gICAgICAgICAgICAgICAgICAgIHNuYXRjaC5kYXRhc2V0W3RoaXMuX3Jvd1N0YXRlS2V5XSA9ICdmYWxzZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzbmF0Y2guZGF0YXNldFt0aGlzLl9yb3dTdGF0ZUtleV0gPSAnZmFsc2UnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB1cGRhdGVCcm93c2VSZXN1bHRWaXNpYmlsaXR5KHNuYXRjaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldFZpc1N0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTbmF0Y2ggdmlzIHN0YXRlOicsIHRoaXMuX2lzVmlzaWJsZSwgJ1xcbnZhbDonLCB2YWwpO1xuICAgICAgICB9XG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xuICAgICAgICB0aGlzLl9pc1Zpc2libGUgPSB2YWw7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBnZXQgc2VhcmNoTGlzdCgpOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hsaXN0IGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xuICAgIH1cblxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh2YWwpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZW1lbWJlcnMgdGhlIHN0YXRlIG9mIFRvZ2dsZVNuYXRjaGVkIGJldHdlZW4gcGFnZSBsb2Fkc1xuICovXG5jbGFzcyBTdGlja3lTbmF0Y2hlZFRvZ2dsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJyxcbiAgICAgICAgZGVzYzogYE1ha2Ugc25hdGNoZWQgdG9nZ2xlIHN0YXRlIHBlcnNpc3QgYmV0d2VlbiBwYWdlIGxvYWRzYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBSZW1lbWJlcmVkIHNuYXRjaCB2aXNpYmlsaXR5IHN0YXRlIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIEFsbG93cyBCb29rbWFya2VkIHRvcnJlbnRzIHRvIGJlIGhpZGRlbi9zaG93blxuICovXG5jbGFzcyBUb2dnbGVCb29rbWFya2VkIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlQm9va21hcmtlZCcsXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gaGlkZS9zaG93IHJlc3VsdHMgdGhhdCB5b3UndmUgYm9va21hcmtlZGAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9pc1Zpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfYm9va21hcmtIb29rOiBzdHJpbmcgPSAnYVtpZCBePSBcInRvckRlQm9va21hcmtcIl0nO1xuICAgIHByaXZhdGUgX3Jvd1N0YXRlS2V5OiBzdHJpbmcgPSAnbXBIaWRlQm9va21hcmtlZCc7XG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgbGV0IHRvZ2dsZTogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+O1xuICAgICAgICBsZXQgcmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PjtcbiAgICAgICAgY29uc3Qgc3RvcmVkU3RhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxuICAgICAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHN0b3JlZFN0YXRlID09PSAnZmFsc2UnICYmIEdNX2dldFZhbHVlKCdzdGlja3lCb29rbWFya2VkVG9nZ2xlJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlVGV4dDogc3RyaW5nID0gdGhpcy5faXNWaXNpYmxlID8gJ0hpZGUgQm9va21hcmtlZCcgOiAnU2hvdyBCb29rbWFya2VkJztcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAodG9nZ2xlID0gVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAgICAgJ2Jvb2ttYXJrZWRUb2dnbGUnLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVRleHQsXG4gICAgICAgICAgICAgICAgJ2gxJyxcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcbiAgICAgICAgICAgICkpLFxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCkpLFxuICAgICAgICBdKTtcblxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBCb29rbWFya2VkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBCb29rbWFya2VkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fYm9va21hcmtIb29rKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICByZXN1bHRMaXN0XG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcbiAgICAgICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gcmVzO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fYm9va21hcmtIb29rKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgVG9nZ2xlIEJvb2ttYXJrZWQgYnV0dG9uIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXG4gICAgICAgICAgICAgICAgICAgICcjc3NyJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9ib29rbWFya0hvb2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxuICAgICAqIEBwYXJhbSBzdWJUYXIgdGhlIGVsZW1lbnRzIHRoYXQgbXVzdCBiZSBjb250YWluZWQgaW4gb3VyIGZpbHRlcmVkIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxpc3QuZm9yRWFjaCgoYm9va21hcmspID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEhlYWRpbmdFbGVtZW50ID0gPEhUTUxIZWFkaW5nRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2Jvb2ttYXJrZWRUb2dnbGUnKSFcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGJvb2ttYXJrLnF1ZXJ5U2VsZWN0b3Ioc3ViVGFyKTtcblxuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1Zpc2libGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBCb29rbWFya2VkJztcbiAgICAgICAgICAgICAgICAgICAgYm9va21hcmsuZGF0YXNldFt0aGlzLl9yb3dTdGF0ZUtleV0gPSAndHJ1ZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdIaWRlIEJvb2ttYXJrZWQnO1xuICAgICAgICAgICAgICAgICAgICBib29rbWFyay5kYXRhc2V0W3RoaXMuX3Jvd1N0YXRlS2V5XSA9ICdmYWxzZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib29rbWFyay5kYXRhc2V0W3RoaXMuX3Jvd1N0YXRlS2V5XSA9ICdmYWxzZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVwZGF0ZUJyb3dzZVJlc3VsdFZpc2liaWxpdHkoYm9va21hcmspO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRWaXNTdGF0ZSh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQm9va21hcmsgdmlzIHN0YXRlOicsIHRoaXMuX2lzVmlzaWJsZSwgJ1xcbnZhbDonLCB2YWwpO1xuICAgICAgICB9XG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xuICAgICAgICB0aGlzLl9pc1Zpc2libGUgPSB2YWw7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBnZXQgc2VhcmNoTGlzdCgpOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hsaXN0IGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xuICAgIH1cblxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xuICAgIH1cblxuICAgIHNldCB2aXNpYmxlKHZhbDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh2YWwpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZW1lbWJlcnMgdGhlIHN0YXRlIG9mIFRvZ2dsZUJvb2ttYXJrZWQgYmV0d2VlbiBwYWdlIGxvYWRzXG4gKi9cbmNsYXNzIFN0aWNreUJvb2ttYXJrZWRUb2dnbGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdzdGlja3lCb29rbWFya2VkVG9nZ2xlJyxcbiAgICAgICAgZGVzYzogYE1ha2UgYm9va21hcmtlZCB0b2dnbGUgc3RhdGUgcGVyc2lzdCBiZXR3ZWVuIHBhZ2UgbG9hZHNgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFJlbWVtYmVyZWQgYm9va21hcmsgdmlzaWJpbGl0eSBzdGF0ZSEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHBsYWludGV4dCBsaXN0IG9mIHNlYXJjaCByZXN1bHRzXG4gKi9cbmNsYXNzIFBsYWludGV4dFNlYXJjaCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFNlYXJjaCcsXG4gICAgICAgIGRlc2M6IGBJbnNlcnQgcGxhaW50ZXh0IHNlYXJjaCByZXN1bHRzIGF0IHRvcCBvZiBwYWdlYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3IgaDEnO1xuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcbiAgICApO1xuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XG5cbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdwbGFpblRvZ2dsZScsXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAnI3NzcicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXG4gICAgICAgIF0pO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIHJlc3VsdHMgaW50byBwbGFpbnRleHRcbiAgICAgICAgcmVzdWx0TGlzdFxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb3B5IGJ1dHRvblxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICAgICAgICAgJ3BsYWluQ29weScsXG4gICAgICAgICAgICAgICAgICAgICdDb3B5IFBsYWludGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAnI21wX3BsYWluVG9nZ2xlJyxcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgcGxhaW50ZXh0IGJveFxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgICAgICAgICBgPGJyPjx0ZXh0YXJlYSBjbGFzcz0nbXBfcGxhaW50ZXh0U2VhcmNoJyBzdHlsZT0nZGlzcGxheTogbm9uZSc+PC90ZXh0YXJlYT5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcbiAgICAgICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbml0IG9wZW4gc3RhdGVcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHRoaXMuX2lzT3Blbik7XG5cbiAgICAgICAgLy8gU2V0IHVwIHRvZ2dsZSBidXR0b24gZnVuY3Rpb25hbGl0eVxuICAgICAgICB0b2dnbGVCdG5cbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGV4dGJveCBzaG91bGQgZXhpc3QsIGJ1dCBqdXN0IGluIGNhc2UuLi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRib3g6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dGJveCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGV4dGJveCBkb2Vzbid0IGV4aXN0IWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ3RydWUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnSGlkZSBQbGFpbnRleHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnU2hvdyBQbGFpbnRleHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluc2VydGVkIHBsYWludGV4dCBzZWFyY2ggcmVzdWx0cyEnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxuICAgICAqIEBwYXJhbSB2YWwgc3RyaW5naWZpZWQgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcbiAgICAgICAgR01fc2V0VmFsdWUoJ3RvZ2dsZVNuYXRjaGVkU3RhdGUnLCB2YWwpO1xuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMoXG4gICAgICAgIHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD5cbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgLy8gUmVzZXQgZWFjaCB0ZXh0IGZpZWxkXG4gICAgICAgICAgICBsZXQgdGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIGxldCBhdXRoVGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IG5hcnJUaXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXG4gICAgICAgICAgICBjb25zdCByYXdUaXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yKCcudG9yVGl0bGUnKTtcbiAgICAgICAgICAgIGNvbnN0IHNlcmllc0xpc3Q6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgICAgID4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2VyaWVzJyk7XG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IG5hcnJMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgTm9kZTonLCBub2RlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc3VsdCB0aXRsZSBzaG91bGQgbm90IGJlIG51bGxgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSByYXdUaXRsZS50ZXh0Q29udGVudCEudHJpbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHNlcmllc1xuICAgICAgICAgICAgaWYgKHNlcmllc0xpc3QgIT09IG51bGwgJiYgc2VyaWVzTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgKz0gYCR7c2VyaWVzLnRleHRDb250ZW50fSAvIGA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IHNlcmllc1RpdGxlLnN1YnN0cmluZygwLCBzZXJpZXNUaXRsZS5sZW5ndGggLSAzKTtcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IGAgKCR7c2VyaWVzVGl0bGV9KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm9jZXNzIGF1dGhvcnNcbiAgICAgICAgICAgIGlmIChhdXRoTGlzdCAhPT0gbnVsbCAmJiBhdXRoTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XG4gICAgICAgICAgICAgICAgYXV0aExpc3QuZm9yRWFjaCgoYXV0aCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhdXRoVGl0bGUgKz0gYCR7YXV0aC50ZXh0Q29udGVudH0gQU5EIGA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9IGF1dGhUaXRsZS5zdWJzdHJpbmcoMCwgYXV0aFRpdGxlLmxlbmd0aCAtIDUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvY2VzcyBuYXJyYXRvcnNcbiAgICAgICAgICAgIGlmIChuYXJyTGlzdCAhPT0gbnVsbCAmJiBuYXJyTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XG4gICAgICAgICAgICAgICAgbmFyckxpc3QuZm9yRWFjaCgobmFycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuYXJyVGl0bGUgKz0gYCR7bmFyci50ZXh0Q29udGVudH0gQU5EIGA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9IG5hcnJUaXRsZS5zdWJzdHJpbmcoMCwgbmFyclRpdGxlLmxlbmd0aCAtIDUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cCArPSBgJHt0aXRsZX0ke3Nlcmllc1RpdGxlfSAke2F1dGhUaXRsZX0gJHtuYXJyVGl0bGV9XFxuYDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBvdXRwO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxuXG4gICAgZ2V0IGlzT3BlbigpOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcbiAgICB9XG5cbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIHRoZSBzZWFyY2ggZmVhdHVyZXMgdG8gYmUgaGlkZGVuL3Nob3duXG4gKi9cbmNsYXNzIFRvZ2dsZVNlYXJjaGJveCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3RvZ2dsZVNlYXJjaGJveCcsXG4gICAgICAgIGRlc2M6IGBDb2xsYXBzZSB0aGUgU2VhcmNoIGJveCBhbmQgbWFrZSBpdCB0b2dnbGVhYmxlYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JTZWFyY2hDb250cm9sJztcbiAgICBwcml2YXRlIF9oZWlnaHQ6IHN0cmluZyA9ICcyNnB4JztcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgPSAnZmFsc2UnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzZWFyY2hib3g6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgaWYgKHNlYXJjaGJveCkge1xuICAgICAgICAgICAgLy8gQWRqdXN0IHRoZSB0aXRsZSB0byBtYWtlIGl0IGNsZWFyIGl0IGlzIGEgdG9nZ2xlIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHNlYXJjaGJveC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICcuYmxvY2tIZWFkQ29uIGg0J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgICAgIC8vIEFkanVzdCB0ZXh0ICYgc3R5bGVcbiAgICAgICAgICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAnVG9nZ2xlIFNlYXJjaCc7XG4gICAgICAgICAgICAgICAgdGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBjbGljayBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90b2dnbGUoc2VhcmNoYm94ISk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBzZXQgdXAgdG9nZ2xlISBUYXJnZXQgZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENvbGxhcHNlIHRoZSBzZWFyY2hib3hcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hib3gsIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogYGhlaWdodDoke3RoaXMuX2hlaWdodH07b3ZlcmZsb3c6aGlkZGVuO2AsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEhpZGUgZXh0cmEgdGV4dFxuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uOiBIVE1MSGVhZGluZ0VsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAnI21haW5Cb2R5ID4gaDMnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZ3VpZGVMaW5rOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICcjbWFpbkJvZHkgPiBoMyB+IGEnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbikgbm90aWZpY2F0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBpZiAoZ3VpZGVMaW5rKSBndWlkZUxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29sbGFwc2VkIHRoZSBTZWFyY2ggYm94IScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNvbGxhcHNlIFNlYXJjaCBib3ghIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfdG9nZ2xlKGVsZW06IEhUTUxEaXZFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gJ3Vuc2V0JztcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9ICd0cnVlJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ2ZhbHNlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdUb2dnbGVkIFNlYXJjaCBib3ghJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWRkcyBhIGZpbGV0eXBlIHBpY2tlciB0aGF0IHdyaXRlcyBNQU0ncyBAZmlsZXR5cGUgZmlsdGVyIGludG8gc2VhcmNoIHRleHRcbiAqL1xuY2xhc3MgRmlsZXR5cGVTZWFyY2hGaWx0ZXIgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdmaWxldHlwZVNlYXJjaEZpbHRlcicsXG4gICAgICAgIGRlc2M6IGBBZGQgYSBmaWxldHlwZSBwaWNrZXIgdGhhdCBpbnNlcnRzIEBmaWxldHlwZSBmaWx0ZXJzIGludG8gc2VhcmNoIHRleHRgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclNlYXJjaCc7XG4gICAgcHJpdmF0ZSBfcXVlcnlUYXI6IHN0cmluZyA9ICcjdG9yVGl0bGUnO1xuICAgIHByaXZhdGUgX3BhbmVsVGFyOiBzdHJpbmcgPSAnI21wX2ZpbGV0eXBlU2VhcmNoUGFuZWwnO1xuICAgIHByaXZhdGUgX3RvZ2dsZVRhcjogc3RyaW5nID0gJyNtcF9maWxldHlwZVNlYXJjaFRvZ2dsZSc7XG4gICAgcHJpdmF0ZSBfZGVmYXVsdEZpbGV0eXBlczogc3RyaW5nW10gPSBbXG4gICAgICAgICdlcHViJyxcbiAgICAgICAgJ3BkZicsXG4gICAgICAgICdtb2JpJyxcbiAgICAgICAgJ2F6dzMnLFxuICAgICAgICAnYXp3JyxcbiAgICAgICAgJ3R4dCcsXG4gICAgICAgICdydGYnLFxuICAgICAgICAnZG9jJyxcbiAgICAgICAgJ2RvY3gnLFxuICAgICAgICAnbGl0JyxcbiAgICAgICAgJ2RqdnUnLFxuICAgICAgICAnY2J6JyxcbiAgICAgICAgJ2NicicsXG4gICAgICAgICdjYjcnLFxuICAgICAgICAnbTRiJyxcbiAgICAgICAgJ21wMycsXG4gICAgICAgICdtNGEnLFxuICAgICAgICAnZmxhYycsXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgZm9ybTogSFRNTEZvcm1FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgY29uc3QgcXVlcnlJbnB1dDogSFRNTElucHV0RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3F1ZXJ5VGFyKTtcbiAgICAgICAgY29uc3QgYW5jaG9yVGFyZ2V0OiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVzZXROZXdJY29uJyk7XG5cbiAgICAgICAgaWYgKGZvcm0gPT09IG51bGwgfHwgcXVlcnlJbnB1dCA9PT0gbnVsbCB8fCBhbmNob3JUYXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGluaXRpYWxpemUgZmlsZXR5cGUgc2VhcmNoIGZpbHRlcicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsRmlsZXR5cGVzOiBzdHJpbmdbXSA9IHRoaXMuX2dldEFsbEZpbGV0eXBlcyhxdWVyeUlucHV0LnZhbHVlKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRGaWxldHlwZXM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCh0aGlzLl9wYXJzZUZpbGV0eXBlcyhxdWVyeUlucHV0LnZhbHVlKSk7XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlOiBIVE1MRWxlbWVudCA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ2ZpbGV0eXBlU2VhcmNoVG9nZ2xlJyxcbiAgICAgICAgICAgICdGaWxlIFR5cGVzJyxcbiAgICAgICAgICAgICdoMScsXG4gICAgICAgICAgICBhbmNob3JUYXJnZXQsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXG4gICAgICAgICk7XG5cbiAgICAgICAgdG9nZ2xlLmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICBgXG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cIm1wX2ZpbGV0eXBlU2VhcmNoUGFuZWxcIiBjbGFzcz1cIm1wX2ZpbGV0eXBlU2VhcmNoUGFuZWxcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtcF9maWxldHlwZVNlYXJjaEFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfZmlsZXR5cGVTZWFyY2hBbGxcIiBjbGFzcz1cIm1wX3BsYWluQnRuXCIgcm9sZT1cImJ1dHRvblwiPkFsbDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfZmlsZXR5cGVTZWFyY2hOb25lXCIgY2xhc3M9XCJtcF9wbGFpbkJ0blwiIHJvbGU9XCJidXR0b25cIj5Ob25lPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1wX2ZpbGV0eXBlU2VhcmNoR3JpZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgJHthbGxGaWxldHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKCh0eXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSBzZWxlY3RlZEZpbGV0eXBlcy5oYXModHlwZSkgPyAnY2hlY2tlZCcgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8bGFiZWwgY2xhc3M9XCJtcF9maWxldHlwZVNlYXJjaEl0ZW1cIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCIke3R5cGV9XCIgJHtjaGVja2VkfT4gJHt0eXBlfTwvbGFiZWw+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgXG4gICAgICAgICk7XG5cbiAgICAgICAgdG9nZ2xlLmlkID0gJ21wX2ZpbGV0eXBlU2VhcmNoVG9nZ2xlJztcbiAgICAgICAgdG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdG9nZ2xlUGFuZWwoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fYmluZFBhbmVsQWN0aW9ucyhxdWVyeUlucHV0KTtcbiAgICAgICAgdGhpcy5fc3luY1NlbGVjdGlvbnNGcm9tUXVlcnkocXVlcnlJbnB1dCk7XG5cbiAgICAgICAgcXVlcnlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zeW5jU2VsZWN0aW9uc0Zyb21RdWVyeShxdWVyeUlucHV0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHF1ZXJ5SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3N5bmNTZWxlY3Rpb25zRnJvbVF1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9hcHBseVNlbGVjdGlvblRvUXVlcnkocXVlcnlJbnB1dCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBmaWxldHlwZSBzZWFyY2ggZmlsdGVyIScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2JpbmRQYW5lbEFjdGlvbnMocXVlcnlJbnB1dDogSFRNTElucHV0RWxlbWVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBwYW5lbDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl9wYW5lbFRhcik7XG4gICAgICAgIGNvbnN0IHNlbGVjdEFsbDogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9maWxldHlwZVNlYXJjaEFsbCcpO1xuICAgICAgICBjb25zdCBzZWxlY3ROb25lOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2ZpbGV0eXBlU2VhcmNoTm9uZScpO1xuXG4gICAgICAgIGlmIChwYW5lbCA9PT0gbnVsbCB8fCBzZWxlY3RBbGwgPT09IG51bGwgfHwgc2VsZWN0Tm9uZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgYmluZCBmaWxldHlwZSBzZWFyY2ggY29udHJvbHMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmZvckVhY2goKGNoZWNrYm94KSA9PiB7XG4gICAgICAgICAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3Rpb25Ub1F1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGVjdEFsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTElucHV0RWxlbWVudD4oJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmZvckVhY2goKGJveCkgPT4ge1xuICAgICAgICAgICAgICAgIGJveC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3Rpb25Ub1F1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxlY3ROb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoYm94KSA9PiB7XG4gICAgICAgICAgICAgICAgYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3Rpb25Ub1F1ZXJ5KHF1ZXJ5SW5wdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF90b2dnbGVQYW5lbCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcGFuZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fcGFuZWxUYXIpO1xuICAgICAgICBjb25zdCB0b2dnbGU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdG9nZ2xlVGFyKTtcblxuICAgICAgICBpZiAocGFuZWwgPT09IG51bGwgfHwgdG9nZ2xlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc09wZW4gPSBwYW5lbC5zdHlsZS5kaXNwbGF5ID09PSAnYmxvY2snO1xuICAgICAgICBwYW5lbC5zdHlsZS5kaXNwbGF5ID0gaXNPcGVuID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICAgICAgdG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGlzT3BlbiA/ICdmYWxzZScgOiAndHJ1ZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3N5bmNTZWxlY3Rpb25zRnJvbVF1ZXJ5KHF1ZXJ5SW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRGaWxldHlwZXMgPSBuZXcgU2V0KHRoaXMuX3BhcnNlRmlsZXR5cGVzKHF1ZXJ5SW5wdXQudmFsdWUpKTtcbiAgICAgICAgY29uc3QgcGFuZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fcGFuZWxUYXIpO1xuXG4gICAgICAgIGlmIChwYW5lbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoY2hlY2tib3gpID0+IHtcbiAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSBzZWxlY3RlZEZpbGV0eXBlcy5oYXMoY2hlY2tib3gudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hcHBseVNlbGVjdGlvblRvUXVlcnkocXVlcnlJbnB1dDogSFRNTElucHV0RWxlbWVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBwYW5lbDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl9wYW5lbFRhcik7XG5cbiAgICAgICAgaWYgKHBhbmVsID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWxlY3RlZEZpbGV0eXBlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50PignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoY2hlY2tib3gpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGVja2JveC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxldHlwZXMucHVzaChjaGVja2JveC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGJhc2VRdWVyeSA9IHRoaXMuX3N0cmlwRmlsZXR5cGVUb2tlbihxdWVyeUlucHV0LnZhbHVlKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkRmlsZXR5cGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcXVlcnlJbnB1dC52YWx1ZSA9IGJhc2VRdWVyeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlclRva2VuID0gYEBmaWxldHlwZXske3NlbGVjdGVkRmlsZXR5cGVzLmpvaW4oJ3wnKX19YDtcbiAgICAgICAgICAgIHF1ZXJ5SW5wdXQudmFsdWUgPSBiYXNlUXVlcnkgPT09ICcnID8gZmlsdGVyVG9rZW4gOiBgJHtiYXNlUXVlcnl9ICR7ZmlsdGVyVG9rZW59YDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEFsbEZpbGV0eXBlcyhxdWVyeVRleHQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3Qgc2VlbjogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgICAgY29uc3QgbWVyZ2VkOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCByZXN1bHRGaWxldHlwZXMgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MQW5jaG9yRWxlbWVudD4oJy50b3JGaWxlVHlwZXMgYScpXG4gICAgICAgICkubWFwKCh0eXBlKSA9PiB0eXBlLnRleHRDb250ZW50IS50cmltKCkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5RmlsZXR5cGVzID0gdGhpcy5fcGFyc2VGaWxldHlwZXMocXVlcnlUZXh0KTtcblxuICAgICAgICBbLi4udGhpcy5fZGVmYXVsdEZpbGV0eXBlcywgLi4ucmVzdWx0RmlsZXR5cGVzLCAuLi5xdWVyeUZpbGV0eXBlc10uZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGUgIT09ICcnICYmIHNlZW5bdHlwZV0gIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBzZWVuW3R5cGVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBtZXJnZWQucHVzaCh0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1lcmdlZC5zb3J0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcGFyc2VGaWxldHlwZXMocXVlcnlUZXh0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gcXVlcnlUZXh0Lm1hdGNoKC9AZmlsZXR5cGVcXHsoW159XSopXFx9L2kpO1xuICAgICAgICBpZiAobWF0Y2ggPT09IG51bGwgfHwgbWF0Y2hbMV0udHJpbSgpID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoWzFdXG4gICAgICAgICAgICAuc3BsaXQoJ3wnKVxuICAgICAgICAgICAgLm1hcCgodHlwZSkgPT4gdHlwZS50cmltKCkudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKHR5cGUpID0+IHR5cGUgIT09ICcnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zdHJpcEZpbGV0eXBlVG9rZW4ocXVlcnlUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcXVlcnlUZXh0XG4gICAgICAgICAgICAucmVwbGFjZSgvXFxzKkBmaWxldHlwZVxce1tefV0qXFx9XFxzKi9naSwgJyAnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgJyAnKVxuICAgICAgICAgICAgLnRyaW0oKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEdlbmVyYXRlcyBsaW5rZWQgdGFncyBmcm9tIHRoZSBzaXRlJ3MgcGxhaW50ZXh0IHRhZyBmaWVsZFxuICovXG5jbGFzcyBCdWlsZFRhZ3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdidWlsZFRhZ3MnLFxuICAgICAgICBkZXNjOiBgR2VuZXJhdGUgY2xpY2thYmxlIFRhZ3MgYXV0b21hdGljYWxseWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBsZXQgcmVzdWx0c0xpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3NcbiAgICAgICAgcmVzdWx0c0xpc3RcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzTGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0xpc3QudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3MgYWdhaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocikgPT4gdGhpcy5fcHJvY2Vzc1RhZ1N0cmluZyhyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBDb2RlIHRvIHJ1biBmb3IgZXZlcnkgc2VhcmNoIHJlc3VsdFxuICAgICAqIEBwYXJhbSByZXMgQSBzZWFyY2ggcmVzdWx0IHJvd1xuICAgICAqL1xuICAgIHByaXZhdGUgX3Byb2Nlc3NUYWdTdHJpbmcgPSAocmVzOiBIVE1MVGFibGVSb3dFbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRhZ2xpbmUgPSA8SFRNTFNwYW5FbGVtZW50PnJlcy5xdWVyeVNlbGVjdG9yKCcudG9yUm93RGVzYycpO1xuXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cCh0YWdsaW5lKTtcblxuICAgICAgICAvLyBBc3N1bWUgYnJhY2tldHMgY29udGFpbiB0YWdzXG4gICAgICAgIGxldCB0YWdTdHJpbmcgPSB0YWdsaW5lLmlubmVySFRNTC5yZXBsYWNlKC8oPzpcXFt8XFxdfFxcKHxcXCl8JCkvZ2ksICcsJyk7XG4gICAgICAgIC8vIFJlbW92ZSBIVE1MIEVudGl0aWVzIGFuZCB0dXJuIHRoZW0gaW50byBicmVha3NcbiAgICAgICAgdGFnU3RyaW5nID0gdGFnU3RyaW5nLnNwbGl0KC8oPzomLnsxLDV9OykvZykuam9pbignOycpO1xuICAgICAgICAvLyBTcGxpdCB0YWdzIGF0ICcsJyBhbmQgJzsnIGFuZCAnPicgYW5kICd8J1xuICAgICAgICBsZXQgdGFncyA9IHRhZ1N0cmluZy5zcGxpdCgvXFxzKig/Ojt8LHw+fFxcfHwkKVxccyovKTtcbiAgICAgICAgLy8gUmVtb3ZlIGVtcHR5IG9yIGxvbmcgdGFnc1xuICAgICAgICB0YWdzID0gdGFncy5maWx0ZXIoKHRhZykgPT4gdGFnLmxlbmd0aCA8PSAzMCAmJiB0YWcubGVuZ3RoID4gMCk7XG4gICAgICAgIC8vIEFyZSB0YWdzIGFscmVhZHkgYWRkZWQ/IE9ubHkgYWRkIGlmIG51bGxcbiAgICAgICAgY29uc3QgdGFnQm94OiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVzLnF1ZXJ5U2VsZWN0b3IoJy5tcF90YWdzJyk7XG4gICAgICAgIGlmICh0YWdCb3ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX2luamVjdExpbmtzKHRhZ3MsIHRhZ2xpbmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdzKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAqIEluamVjdHMgdGhlIGdlbmVyYXRlZCB0YWdzXG4gICAgICogQHBhcmFtIHRhZ3MgQXJyYXkgb2YgdGFncyB0byBhZGRcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzZWFyY2ggcmVzdWx0IHJvdyB0aGF0IHRoZSB0YWdzIHdpbGwgYmUgYWRkZWQgdG9cbiAgICAgKi9cbiAgICBwcml2YXRlIF9pbmplY3RMaW5rcyA9ICh0YWdzOiBzdHJpbmdbXSwgdGFyOiBIVE1MU3BhbkVsZW1lbnQpID0+IHtcbiAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBuZXcgdGFnIHJvd1xuICAgICAgICAgICAgY29uc3QgdGFnUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgdGFnUm93LmNsYXNzTGlzdC5hZGQoJ21wX3RhZ3MnKTtcbiAgICAgICAgICAgIHRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgdGFnUm93KTtcbiAgICAgICAgICAgIHRhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgLy8gQWRkIHRoZSB0YWdzIHRvIHRoZSB0YWcgcm93XG4gICAgICAgICAgICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xuICAgICAgICAgICAgICAgIHRhZ1Jvdy5pbm5lckhUTUwgKz0gYDxhIGNsYXNzPSdtcF90YWcnIGhyZWY9Jy90b3IvYnJvd3NlLnBocD90b3IlNUJ0ZXh0JTVEPSUyMiR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICAgICApfSUyMiZ0b3IlNUJzcmNoSW4lNUQlNUJ0YWdzJTVEPXRydWUnPiR7dGFnfTwvYT5gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWRkcyBtdWx0aS1zZWxlY3QgY2hlY2tib3hlcyBhbmQgYnVsayBhY3Rpb25zIHRvIGJyb3dzZSByZXN1bHRzXG4gKi9cbmNsYXNzIE11bHRpU2VsZWN0QnJvd3NlIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnbXVsdGlTZWxlY3RCcm93c2UnLFxuICAgICAgICBkZXNjOiBgQWRkIGNoZWNrYm94ZXMgYW5kIGJ1bGsgYWN0aW9ucyB0byBzZWFyY2ggcmVzdWx0c2AsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xuICAgIHByaXZhdGUgX3Rvb2xiYXJJRDogc3RyaW5nID0gJ21wX211bHRpU2VsZWN0VG9vbGJhcic7XG4gICAgcHJpdmF0ZSBfY2hlY2tib3hDbGFzczogc3RyaW5nID0gJ21wX211bHRpU2VsZWN0Qm94JztcbiAgICBwcml2YXRlIF9yb3dGbGFnOiBzdHJpbmcgPSAnbXBNdWx0aVNlbGVjdFJlYWR5JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5fZW5zdXJlVG9vbGJhcigpO1xuICAgICAgICB0aGlzLl9kZWNvcmF0ZVJlc3VsdHMoYXdhaXQgdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKTtcblxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9lbnN1cmVUb29sYmFyKCk7XG4gICAgICAgICAgICB0aGlzLl9kZWNvcmF0ZVJlc3VsdHMoYXdhaXQgdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcihcbiAgICAgICAgICAgICdib2R5JyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbnN1cmVUb29sYmFyKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIG11bHRpLXNlbGVjdCBicm93c2UgYWN0aW9ucyEnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9lbnN1cmVUb29sYmFyKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBleGlzdGluZ1Rvb2xiYXI6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuX3Rvb2xiYXJJRCk7XG4gICAgICAgIGNvbnN0IG1hc3NBY3Rpb25zOiBIVE1MRWxlbWVudCB8IG51bGwgPSB0aGlzLl9maW5kTWFzc0FjdGlvbnNBbmNob3IoKTtcbiAgICAgICAgaWYgKGV4aXN0aW5nVG9vbGJhciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIG1hc3NBY3Rpb25zICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgZXhpc3RpbmdUb29sYmFyLnBhcmVudEVsZW1lbnQgIT09IG1hc3NBY3Rpb25zXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBleGlzdGluZ1Rvb2xiYXIuY2xhc3NOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgJ21wX211bHRpU2VsZWN0VG9vbGJhciBtcF9tdWx0aVNlbGVjdFRvb2xiYXJfbWFzc0FjdGlvbnMnO1xuICAgICAgICAgICAgICAgIG1hc3NBY3Rpb25zLmNsYXNzTGlzdC5hZGQoJ21wX211bHRpU2VsZWN0SG9zdCcpO1xuICAgICAgICAgICAgICAgIG1hc3NBY3Rpb25zLmFwcGVuZENoaWxkKGV4aXN0aW5nVG9vbGJhcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b29sYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvb2xiYXIuaWQgPSB0aGlzLl90b29sYmFySUQ7XG4gICAgICAgIHRvb2xiYXIuY2xhc3NOYW1lID0gbWFzc0FjdGlvbnNcbiAgICAgICAgICAgID8gJ21wX211bHRpU2VsZWN0VG9vbGJhciBtcF9tdWx0aVNlbGVjdFRvb2xiYXJfbWFzc0FjdGlvbnMnXG4gICAgICAgICAgICA6ICdtcF9tdWx0aVNlbGVjdFRvb2xiYXInO1xuICAgICAgICB0b29sYmFyLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfbXVsdGlTZWxlY3RBbGxcIiBjbGFzcz1cIm1wX3BsYWluQnRuXCIgcm9sZT1cImJ1dHRvblwiPlNlbGVjdCBBbGw8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBpZD1cIm1wX211bHRpU2VsZWN0Tm9uZVwiIGNsYXNzPVwibXBfcGxhaW5CdG5cIiByb2xlPVwiYnV0dG9uXCI+U2VsZWN0IE5vbmU8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBpZD1cIm1wX211bHRpU2VsZWN0T3BlblwiIGNsYXNzPVwibXBfcGxhaW5CdG5cIiByb2xlPVwiYnV0dG9uXCI+T3BlbiBTZWxlY3RlZDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGlkPVwibXBfbXVsdGlTZWxlY3REb3dubG9hZFwiIGNsYXNzPVwibXBfcGxhaW5CdG5cIiByb2xlPVwiYnV0dG9uXCI+RG93bmxvYWQgU2VsZWN0ZWQ8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBpZD1cIm1wX211bHRpU2VsZWN0Qm9va21hcmtcIiBjbGFzcz1cIm1wX3BsYWluQnRuXCIgcm9sZT1cImJ1dHRvblwiPkJvb2ttYXJrIFNlbGVjdGVkPC9zcGFuPlxuICAgICAgICBgO1xuXG4gICAgICAgIGlmIChtYXNzQWN0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbWFzc0FjdGlvbnMuY2xhc3NMaXN0LmFkZCgnbXBfbXVsdGlTZWxlY3RIb3N0Jyk7XG4gICAgICAgICAgICBtYXNzQWN0aW9ucy5hcHBlbmRDaGlsZCh0b29sYmFyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGFuY2hvclRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVzZXROZXdJY29uJykgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NzcicpO1xuICAgICAgICAgICAgaWYgKGFuY2hvclRhcmdldCA9PT0gbnVsbCB8fCBhbmNob3JUYXJnZXQucGFyZW50RWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGNyZWF0ZSBtdWx0aS1zZWxlY3QgYnJvd3NlIHRvb2xiYXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFuY2hvclRhcmdldC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgdG9vbGJhcik7XG4gICAgICAgIH1cblxuICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9tdWx0aVNlbGVjdEFsbCcpKS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDaGVja2VkU3RhdGUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX211bHRpU2VsZWN0Tm9uZScpKS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDaGVja2VkU3RhdGUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9tdWx0aVNlbGVjdE9wZW4nKSkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgICg8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX211bHRpU2VsZWN0RG93bmxvYWQnKSkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZG93bmxvYWRTZWxlY3RlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICAoPEhUTUxFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9tdWx0aVNlbGVjdEJvb2ttYXJrJykpLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Jvb2ttYXJrU2VsZWN0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kZWNvcmF0ZVJlc3VsdHMocmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pik6IHZvaWQge1xuICAgICAgICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhc2V0W3RoaXMuX3Jvd0ZsYWddID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGZpcnN0Q2VsbDogSFRNTFRhYmxlQ2VsbEVsZW1lbnQgfCBudWxsID0gcmVzdWx0LnF1ZXJ5U2VsZWN0b3IoJ3RkJyk7XG4gICAgICAgICAgICBpZiAoZmlyc3RDZWxsID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBib3hXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgYm94V3JhcC5jbGFzc05hbWUgPSAnbXBfbXVsdGlTZWxlY3RXcmFwJztcbiAgICAgICAgICAgIGJveFdyYXAuaW5uZXJIVE1MID0gYDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cIiR7dGhpcy5fY2hlY2tib3hDbGFzc31cIiBhcmlhLWxhYmVsPVwiU2VsZWN0IHNlYXJjaCByZXN1bHRcIj5gO1xuICAgICAgICAgICAgZmlyc3RDZWxsLmluc2VydEJlZm9yZShib3hXcmFwLCBmaXJzdENlbGwuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICByZXN1bHQuZGF0YXNldFt0aGlzLl9yb3dGbGFnXSA9ICd0cnVlJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWRSZXN1bHRzKCk6IEhUTUxUYWJsZVJvd0VsZW1lbnRbXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0nKSkuZmlsdGVyKFxuICAgICAgICAgICAgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJveCA9IHJvdy5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLl9jaGVja2JveENsYXNzfWApIGFzIEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBib3ggIT09IG51bGwgJiYgYm94LmNoZWNrZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICkgYXMgSFRNTFRhYmxlUm93RWxlbWVudFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldENoZWNrZWRTdGF0ZShjaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChgI3NzciAuJHt0aGlzLl9jaGVja2JveENsYXNzfWApXG4gICAgICAgICAgICAuZm9yRWFjaCgoYm94KSA9PiAoKDxIVE1MSW5wdXRFbGVtZW50PmJveCkuY2hlY2tlZCA9IGNoZWNrZWQpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vcGVuU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkUmVzdWx0cygpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93SUQgPSByb3cuaWQubWF0Y2goL150ZHItPyhcXGQrKSQvKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFVSTCA9XG4gICAgICAgICAgICAgICAgcm93SUQgIT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgPyBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS90LyR7cm93SURbMV19YFxuICAgICAgICAgICAgICAgICAgICA6IChyb3cucXVlcnlTZWxlY3RvcignLnRvclRpdGxlJykgYXMgSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsKT8uaHJlZjtcblxuICAgICAgICAgICAgaWYgKHRhcmdldFVSTCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKHRhcmdldFVSTCwgJ19ibGFuaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kb3dubG9hZFNlbGVjdGVkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZFJlc3VsdHMoKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkTGluayA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlyZWN0RG93bmxvYWQnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgICBpZiAoZG93bmxvYWRMaW5rICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZG93bmxvYWRMaW5rLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2Jvb2ttYXJrU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkUmVzdWx0cygpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm9va21hcmtMaW5rID0gcm93LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgJ2FbaWRePVwidG9yQm9va21hcmtcIl0nXG4gICAgICAgICAgICApIGFzIEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgIGlmIChib29rbWFya0xpbmsgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBib29rbWFya0xpbmsuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9maW5kTWFzc0FjdGlvbnNBbmNob3IoKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgY29uc3QgbWFzc0FjdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFzc0FjdGlvbnMnKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgICAgIGlmIChtYXNzQWN0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hc3NBY3Rpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm9va21hcmtBY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Jvb2ttYXJrQWN0aW9ucycpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgaWYgKGJvb2ttYXJrQWN0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGJvb2ttYXJrQWN0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1hc3NBY3Rpb25CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJ2J1dHRvbltkYXRhLWJtVHlwZV0nXG4gICAgICAgICkgYXMgSFRNTEJ1dHRvbkVsZW1lbnQgfCBudWxsO1xuICAgICAgICBpZiAobWFzc0FjdGlvbkJ1dHRvbiAhPT0gbnVsbCAmJiBtYXNzQWN0aW9uQnV0dG9uLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXNzQWN0aW9uQnV0dG9uLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtYXNzQWN0aW9uc0xhYmVsID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdoMSwgaDIsIGgzLCBoNCwgc3Ryb25nJykpLmZpbmQoXG4gICAgICAgICAgICAoZWxlbSkgPT4gZWxlbS50ZXh0Q29udGVudD8udHJpbSgpLnRvTG93ZXJDYXNlKCkgPT09ICdtYXNzIGFjdGlvbnMnXG4gICAgICAgICkgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChtYXNzQWN0aW9uc0xhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFzc0FjdGlvbnNMYWJlbC5wYXJlbnRFbGVtZW50IGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSYW5kb20gQm9vayBmZWF0dXJlIHRvIG9wZW4gYSBuZXcgdGFiL3dpbmRvdyB3aXRoIGEgcmFuZG9tIE1BTSBCb29rXG4gKi9cbmNsYXNzIFJhbmRvbUJvb2sgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdyYW5kb21Cb29rJyxcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBvcGVuIGEgcmFuZG9tbHkgc2VsZWN0ZWQgYm9vayBwYWdlLiAoPGVtPlVzZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjYXRlZ29yeSBpbiB0aGUgZHJvcGRvd248L2VtPilgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxldCByYW5kbzogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGNvbnN0IHJhbmRvVGV4dDogc3RyaW5nID0gJ1JhbmRvbSBCb29rJztcblxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIChyYW5kbyA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdyYW5kb21Cb29rJyxcbiAgICAgICAgICAgICAgICByYW5kb1RleHQsXG4gICAgICAgICAgICAgICAgJ2gxJyxcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcbiAgICAgICAgICAgICkpLFxuICAgICAgICBdKTtcblxuICAgICAgICByYW5kb1xuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY291bnRSZXN1bHQ6IFByb21pc2U8bnVtYmVyPjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXRlZ29yaWVzOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBDYXRlZ29yeSBkcm9wZG93biBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRTZWxlY3Rpb246IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0ZWdvcnlQYXJ0aWFsJylcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgdmFsdWUgY3VycmVudGx5IHNlbGVjdGVkIGluIENhdGVnb3J5IERyb3Bkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRWYWx1ZTogc3RyaW5nID0gY2F0U2VsZWN0aW9uIS5vcHRpb25zW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdFNlbGVjdGlvbi5zZWxlY3RlZEluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICBdLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZXBlbmRpbmcgb24gY2F0ZWdvcnkgc2VsZWN0ZWQsIGNyZWF0ZSBhIGNhdGVnb3J5IHN0cmluZyBmb3IgdGhlIEpTT04gR0VUXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKFN0cmluZyhjYXRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBTEwnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RlZmF1bHRzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTMnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTYnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0VmFsdWUuY2hhckF0KDApID09PSAnYycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvcltjYXRdW109JyArIGNhdFZhbHVlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb3VudFJlc3VsdCA9IHRoaXMuX2dldFJhbmRvbUJvb2tSZXN1bHRzKGNhdGVnb3JpZXMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRSZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoZ2V0UmFuZG9tUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vb3BlbiBuZXcgdGFiIHdpdGggdGhlIHJhbmRvbSBib29rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvdC8nICsgZ2V0UmFuZG9tUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ19ibGFuaydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIFJhbmRvbSBCb29rIGJ1dHRvbiEnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xuICAgICAqIEBwYXJhbSBjYXQgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgY2F0ZWdvcmllcyBuZWVkZWQgZm9yIEpTT04gR2V0XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBfZ2V0UmFuZG9tQm9va1Jlc3VsdHMoY2F0OiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGpzb25SZXN1bHQ6IFByb21pc2U8c3RyaW5nPjtcbiAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3Rvci9qcy9sb2FkU2VhcmNoSlNPTmJhc2ljLnBocD90b3Jbc2VhcmNoVHlwZV09YWxsJnRvcltzZWFyY2hJbl09dG9ycmVudHMke2NhdH0mdG9yW3BlcnBhZ2VdPTUmdG9yW2Jyb3dzZUZsYWdzSGlkZVZzU2hvd109MCZ0b3Jbc3RhcnREYXRlXT0mdG9yW2VuZERhdGVdPSZ0b3JbaGFzaF09JnRvcltzb3J0VHlwZV09cmFuZG9tJnRodW1ibmFpbD10cnVlPyR7VXRpbC5yYW5kb21OdW1iZXIoXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAxMDAwMDBcbiAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFsoanNvblJlc3VsdCA9IFV0aWwuZ2V0SlNPTih1cmwpKV0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGpzb25SZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGpzb25GdWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JldHVybiB0aGUgZmlyc3QgdG9ycmVudCBJRCBvZiB0aGUgcmFuZG9tIEpTT04gdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKGpzb25GdWxsKS5kYXRhWzBdLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogRlJFRUxFRUNIIEZFQVRVUkVTXG4gKi9cblxuY2xhc3MgQ29sbGFwc2VGcmVlbGVlY2hTZWN0aW9ucyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnY29sbGFwc2VGcmVlbGVlY2hTZWN0aW9ucycsXG4gICAgICAgIGRlc2M6ICdDb2xsYXBzZSBGcmVlbGVlY2ggY2F0ZWdvcnkgc2VjdGlvbnMgYW5kIGFkZCBxdWljay1qdW1wIGxpbmtzJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSBkaXZbaWRePVwiZmxfY2F0X1wiXSc7XG4gICAgcHJpdmF0ZSBfc2VjdGlvbkNvbnRlbnRzOiB7IFtrZXk6IHN0cmluZ106IEhUTUxFbGVtZW50W10gfSA9IHt9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnZnJlZWxlZWNoJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IEFycmF5LmZyb20oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX3RhcilcbiAgICAgICAgKSBhcyBIVE1MRGl2RWxlbWVudFtdO1xuXG4gICAgICAgIGlmIChzZWN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW00rXSBDb3VsZCBub3QgZmluZCBmcmVlbGVlY2ggc2VjdGlvbnMgdG8gY29sbGFwc2UuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaXN0QmxvY2sgPSBzZWN0aW9uc1swXS5jbG9zZXN0KCcuYmxvY2tDb24nKTtcbiAgICAgICAgaWYgKGxpc3RCbG9jayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fbm9ybWFsaXplTGF5b3V0KGxpc3RCbG9jayk7XG4gICAgICAgICAgICB0aGlzLl9idWlsZFRvb2xiYXIobGlzdEJsb2NrLCBzZWN0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKChzZWN0aW9uKSA9PiB0aGlzLl9jb2xsYXBzZVNlY3Rpb24oc2VjdGlvbikpO1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb2xsYXBzZWQgZnJlZWxlZWNoIHNlY3Rpb25zIScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX25vcm1hbGl6ZUxheW91dChsaXN0QmxvY2s6IEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgYmxvY2tCb2R5ID0gbGlzdEJsb2NrLnF1ZXJ5U2VsZWN0b3IoJy5ibG9ja0JvZHlDb24nKSBhcyBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG4gICAgICAgIGNvbnN0IG1haW5Cb2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5JykgYXMgSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuXG4gICAgICAgIGlmIChtYWluQm9keSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbWFpbkJvZHkuc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJsb2NrQm9keSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgYmxvY2tCb2R5LnN0eWxlLnRleHRBbGlnbiA9ICdsZWZ0JztcbiAgICAgICAgICAgIGJsb2NrQm9keS5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgICAgICAgIGJsb2NrQm9keS5zdHlsZS5tYXhXaWR0aCA9ICcxMDAlJztcbiAgICAgICAgICAgIGJsb2NrQm9keS5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG4gICAgICAgIH1cblxuICAgICAgICAobGlzdEJsb2NrIGFzIEhUTUxEaXZFbGVtZW50KS5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgICAgKGxpc3RCbG9jayBhcyBIVE1MRGl2RWxlbWVudCkuc3R5bGUubWF4V2lkdGggPSAnOTglJztcbiAgICAgICAgKGxpc3RCbG9jayBhcyBIVE1MRGl2RWxlbWVudCkuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2J1aWxkVG9vbGJhcihsaXN0QmxvY2s6IEVsZW1lbnQsIHNlY3Rpb25zOiBIVE1MRGl2RWxlbWVudFtdKSB7XG4gICAgICAgIGNvbnN0IHRvb2xiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdG9vbGJhci5jbGFzc05hbWUgPSAnbXBfZmxfdG9vbGJhcic7XG4gICAgICAgIHRvb2xiYXIuc3R5bGUubWFyZ2luQm90dG9tID0gJzE1cHgnO1xuXG4gICAgICAgIGNvbnN0IHRvZ2dsZUFsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b2dnbGVBbGwuY2xhc3NOYW1lID0gJ21wX3BsYWluQnRuIG1wX2ZsX3RvZ2dsZV9hbGwnO1xuICAgICAgICB0b2dnbGVBbGwucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0b2dnbGVBbGwudGV4dENvbnRlbnQgPSAnRXhwYW5kIEFsbCc7XG5cbiAgICAgICAgY29uc3QgdG9jID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvYy5jbGFzc05hbWUgPSAnbXBfZmxfdG9jJztcbiAgICAgICAgdG9jLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgICAgIHRvYy5zdHlsZS5mbGV4V3JhcCA9ICd3cmFwJztcbiAgICAgICAgdG9jLnN0eWxlLmdhcCA9ICc2cHgnO1xuICAgICAgICB0b2Muc3R5bGUubWFyZ2luVG9wID0gJzhweCc7XG5cbiAgICAgICAgc2VjdGlvbnMuZm9yRWFjaCgoc2VjdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gc2VjdGlvbi5xdWVyeVNlbGVjdG9yKCdhLmJpZ2xpbmsnKTtcbiAgICAgICAgICAgIGlmIChoZWFkZXIgPT09IG51bGwgfHwgaGVhZGVyLnRleHRDb250ZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgaXRlbS5jbGFzc05hbWUgPSAnbXBfcGxhaW5CdG4gbXBfZmxfdG9jX2l0ZW0nO1xuICAgICAgICAgICAgaXRlbS5ocmVmID0gYCMke3NlY3Rpb24uaWR9YDtcbiAgICAgICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBoZWFkZXIudGV4dENvbnRlbnQudHJpbSgpO1xuICAgICAgICAgICAgaXRlbS5zdHlsZS5tYXJnaW5SaWdodCA9ICc2cHgnO1xuICAgICAgICAgICAgaXRlbS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnNnB4JztcbiAgICAgICAgICAgIGl0ZW0uc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICAgICAgdG9jLmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b2dnbGVBbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaG91bGRPcGVuID0gdG9nZ2xlQWxsLnRleHRDb250ZW50ID09PSAnRXhwYW5kIEFsbCc7XG4gICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKChzZWN0aW9uKSA9PiB0aGlzLl9zZXRPcGVuU3RhdGUoc2VjdGlvbiwgc2hvdWxkT3BlbikpO1xuICAgICAgICAgICAgdG9nZ2xlQWxsLnRleHRDb250ZW50ID0gc2hvdWxkT3BlbiA/ICdDb2xsYXBzZSBBbGwnIDogJ0V4cGFuZCBBbGwnO1xuICAgICAgICB9KTtcblxuICAgICAgICB0b29sYmFyLmFwcGVuZENoaWxkKHRvZ2dsZUFsbCk7XG4gICAgICAgIHRvb2xiYXIuYXBwZW5kQ2hpbGQodG9jKTtcbiAgICAgICAgbGlzdEJsb2NrLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCB0b29sYmFyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jb2xsYXBzZVNlY3Rpb24oc2VjdGlvbjogSFRNTERpdkVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gc2VjdGlvbi5xdWVyeVNlbGVjdG9yKCdhLmJpZ2xpbmsnKSBhcyBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGw7XG5cbiAgICAgICAgaWYgKGhlYWRlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdtcF9mbF9zZWN0aW9uJyk7XG4gICAgICAgIHNlY3Rpb24uc3R5bGUuc2Nyb2xsTWFyZ2luVG9wID0gJzgwcHgnO1xuICAgICAgICBzZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBzZWN0aW9uLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICBzZWN0aW9uLnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gQXJyYXkuZnJvbShzZWN0aW9uLmNoaWxkcmVuKS5maWx0ZXIoXG4gICAgICAgICAgICAoY2hpbGQpID0+IGNoaWxkICE9PSBoZWFkZXJcbiAgICAgICAgKSBhcyBIVE1MRWxlbWVudFtdO1xuXG4gICAgICAgIHRoaXMuX3NlY3Rpb25Db250ZW50c1tzZWN0aW9uLmlkXSA9IGNvbnRlbnQ7XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRvZ2dsZS5jbGFzc05hbWUgPSAnbXBfcGxhaW5CdG4gbXBfZmxfdG9nZ2xlJztcbiAgICAgICAgdG9nZ2xlLnJvbGUgPSAnYnV0dG9uJztcbiAgICAgICAgdG9nZ2xlLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgdG9nZ2xlLnN0eWxlLm1hcmdpbkxlZnQgPSAnOHB4JztcblxuICAgICAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoc2VjdGlvbiwgIXNlY3Rpb24uY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9mbF9vcGVuJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICBoZWFkZXIuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHRvZ2dsZSk7XG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZShzZWN0aW9uLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHNlY3Rpb246IEhUTUxEaXZFbGVtZW50LCBvcGVuOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHRvZ2dsZSA9IHNlY3Rpb24ucXVlcnlTZWxlY3RvcignLm1wX2ZsX3RvZ2dsZScpIGFzIEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMuX3NlY3Rpb25Db250ZW50c1tzZWN0aW9uLmlkXTtcblxuICAgICAgICBpZiAodG9nZ2xlID09PSBudWxsIHx8IGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgICAgIHNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnbXBfZmxfb3BlbicpO1xuICAgICAgICAgICAgY29udGVudC5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRvZ2dsZS50ZXh0Q29udGVudCA9ICdIaWRlJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlY3Rpb24uY2xhc3NMaXN0LnJlbW92ZSgnbXBfZmxfb3BlbicpO1xuICAgICAgICAgICAgY29udGVudC5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0b2dnbGUudGV4dENvbnRlbnQgPSAnU2hvdyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxuXG4vKipcbiAqICogQWxsb3dzIGdpZnRpbmcgb2YgRkwgd2VkZ2UgdG8gbWVtYmVycyB0aHJvdWdoIGZvcnVtLlxuICovXG5jbGFzcyBGb3J1bUZMR2lmdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuRm9ydW0sXG4gICAgICAgIHRpdGxlOiAnZm9ydW1GTEdpZnQnLFxuICAgICAgICBkZXNjOiBgQWRkIGEgVGhhbmsgYnV0dG9uIHRvIGZvcnVtIHBvc3RzLiAoPGVtPlNlbmRzIGEgRkwgd2VkZ2U8L2VtPilgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLmZvcnVtTGluayc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydmb3J1bSB0aHJlYWQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGluZyBGb3J1bSBHaWZ0IEJ1dHRvbi4uLicpO1xuICAgICAgICAvL21haW5Cb2R5IGlzIGJlc3QgZWxlbWVudCB3aXRoIGFuIElEIEkgY291bGQgZmluZCB0aGF0IGlzIGEgcGFyZW50IHRvIGFsbCBmb3J1bSBwb3N0c1xuICAgICAgICBjb25zdCBtYWluQm9keSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHknKTtcbiAgICAgICAgLy9tYWtlIGFycmF5IG9mIGZvcnVtIHBvc3RzIC0gdGhlcmUgaXMgb25seSBvbmUgY3Vyc29yIGNsYXNzZWQgb2JqZWN0IHBlciBmb3J1bSBwb3N0LCBzbyB0aGlzIHdhcyBiZXN0IHRvIGtleSBvZmYgb2YuIHdpc2ggdGhlcmUgd2VyZSBtb3JlIElEcyBhbmQgc3VjaCB1c2VkIGluIGZvcnVtc1xuICAgICAgICBjb25zdCBmb3J1bVBvc3RzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXG4gICAgICAgICAgICBtYWluQm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2x0YWJsZScpXG4gICAgICAgICk7XG4gICAgICAgIC8vZm9yIGVhY2ggcG9zdCBvbiB0aGUgcGFnZVxuICAgICAgICBmb3J1bVBvc3RzLmZvckVhY2goKGZvcnVtUG9zdCkgPT4ge1xuICAgICAgICAgICAgLy93b3JrIG91ciB3YXkgZG93biB0aGUgc3RydWN0dXJlIG9mIHRoZSBIVE1MIHRvIGdldCB0byBvdXIgcG9zdFxuICAgICAgICAgICAgbGV0IGJvdHRvbVJvdyA9IGZvcnVtUG9zdC5jaGlsZE5vZGVzWzFdO1xuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbNF07XG4gICAgICAgICAgICBib3R0b21Sb3cgPSBib3R0b21Sb3cuY2hpbGROb2Rlc1szXTtcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBJRCBvZiB0aGUgZm9ydW0gZnJvbSB0aGUgY3VzdG9tIE1BTSBhdHRyaWJ1dGVcbiAgICAgICAgICAgIGxldCBwb3N0SUQgPSAoPEhUTUxFbGVtZW50PmZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgICAgICAgIC8vbWFtIGRlY2lkZWQgdG8gaGF2ZSBhIGRpZmZlcmVudCBzdHJ1Y3R1cmUgZm9yIGxhc3QgZm9ydW0uIHdpc2ggdGhleSBqdXN0IGhhZCBJRHMgb3Igc29tZXRoaW5nIGluc3RlYWQgb2YgYWxsIHRoaXMganVtcGluZyBhcm91bmRcbiAgICAgICAgICAgIGlmIChwb3N0SUQgPT09ICdsYXN0Jykge1xuICAgICAgICAgICAgICAgIHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICBmb3J1bVBvc3QucHJldmlvdXNTaWJsaW5nIS5wcmV2aW91c1NpYmxpbmchXG4gICAgICAgICAgICAgICAgKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBlbGVtZW50IGZvciBvdXIgZmVhdHVyZVxuICAgICAgICAgICAgY29uc3QgZ2lmdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAvL3NldCBzYW1lIGNsYXNzIGFzIG90aGVyIG9iamVjdHMgaW4gYXJlYSBmb3Igc2FtZSBwb2ludGVyIGFuZCBmb3JtYXR0aW5nIG9wdGlvbnNcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY3Vyc29yJyk7XG4gICAgICAgICAgICAvL2dpdmUgb3VyIGVsZW1lbnQgYW4gSUQgZm9yIGZ1dHVyZSBzZWxlY3Rpb24gYXMgbmVlZGVkXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wXycgKyBwb3N0SUQgKyAnX3RleHQnKTtcbiAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBpbWcgZWxlbWVudCB0byBsZWFkIG91ciBuZXcgZmVhdHVyZSB2aXN1YWxzXG4gICAgICAgICAgICBjb25zdCBnaWZ0SWNvbkdpZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgLy91c2Ugc2l0ZSBmcmVlbGVlY2ggZ2lmIGljb24gZm9yIG91ciBmZWF0dXJlXG4gICAgICAgICAgICBnaWZ0SWNvbkdpZi5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgJ3NyYycsXG4gICAgICAgICAgICAgICAgJ2h0dHBzOi8vY2RuLm15YW5vbmFtb3VzZS5uZXQvaW1hZ2VidWNrZXQvMTA4MzAzL3RoYW5rLmdpZidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvL21ha2UgdGhlIGdpZiBpY29uIHRoZSBmaXJzdCBjaGlsZCBvZiBlbGVtZW50XG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChnaWZ0SWNvbkdpZik7XG4gICAgICAgICAgICAvL2FkZCB0aGUgZmVhdHVyZSBlbGVtZW50IGluIGxpbmUgd2l0aCB0aGUgY3Vyc29yIG9iamVjdCB3aGljaCBpcyB0aGUgcXVvdGUgYW5kIHJlcG9ydCBidXR0b25zIGF0IGJvdHRvbVxuICAgICAgICAgICAgYm90dG9tUm93LmFwcGVuZENoaWxkKGdpZnRFbGVtZW50KTtcblxuICAgICAgICAgICAgLy9tYWtlIGl0IGEgYnV0dG9uIHZpYSBjbGljayBsaXN0ZW5lclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy90byBhdm9pZCBidXR0b24gdHJpZ2dlcmluZyBtb3JlIHRoYW4gb25jZSBwZXIgcGFnZSBsb2FkLCBjaGVjayBpZiBhbHJlYWR5IGhhdmUganNvbiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZHVlIHRvIGxhY2sgb2YgSURzIGFuZCBjb25mbGljdGluZyBxdWVyeSBzZWxlY3RhYmxlIGVsZW1lbnRzLCBuZWVkIHRvIGp1bXAgdXAgYSBmZXcgcGFyZW50IGxldmVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFBhcmVudE5vZGUgPSBnaWZ0RWxlbWVudC5wYXJlbnRFbGVtZW50IS5wYXJlbnRFbGVtZW50IVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnRFbGVtZW50ITtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vb25jZSBhdCBwYXJlbnQgbm9kZSBvZiB0aGUgcG9zdCwgZmluZCB0aGUgcG9zdGVyJ3MgdXNlciBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlckVsZW0gPSBwb3N0UGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKGBhW2hyZWZePVwiL3UvXCJdYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgVVJMIG9mIHRoZSBwb3N0IHRvIGFkZCB0byBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3N0VVJMID0gKDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi9mL3QvXCJdYCkhXG4gICAgICAgICAgICAgICAgICAgICAgICApKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IE1BTSB1c2VyIHNlbmRpbmcgZ2lmdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbmRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTWVudScpIS5pbm5lclRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NsZWFuIHVwIHRleHQgb2Ygc2VuZGVyIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyID0gc2VuZGVyLnN1YnN0cmluZygwLCBzZW5kZXIuaW5kZXhPZignICcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB0aXRsZSBvZiB0aGUgcGFnZSBzbyB3ZSBjYW4gd3JpdGUgaW4gbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvcnVtVGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3V0IGRvd24gZmx1ZmYgZnJvbSBwYWdlIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlID0gZm9ydW1UaXRsZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ydW1UaXRsZS5pbmRleE9mKCd8JykgLSAxXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gKDxIVE1MRWxlbWVudD51c2VyRWxlbSEpLmlubmVyVGV4dDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIGEgZ2lmdCByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9c2VuZFdlZGdlJmdpZnRUbz0ke3VzZXJOYW1lfSZtZXNzYWdlPSR7c2VuZGVyfSB3YW50cyB0byB0aGFuayB5b3UgZm9yIHlvdXIgY29udHJpYnV0aW9uIHRvIHRoZSBmb3J1bSB0b3BpYyBbdXJsPWh0dHBzOi8vbXlhbm9uYW1vdXNlLm5ldCR7cG9zdFVSTH1dJHtmb3J1bVRpdGxlfVsvdXJsXWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL21ha2UgIyBVUkkgY29tcGF0aWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJyMnLCAnJTIzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3VzZSBNQU0rIGpzb24gZ2V0IHV0aWxpdHkgdG8gcHJvY2VzcyBVUkwgYW5kIHJldHVybiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIGdpZnQgd2FzIHN1Y2Nlc3NmdWxseSBzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgdGV4dCB0byBzaG93IHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgU3VjY2Vzc2Z1bCEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9iYXNlZCBvbiBmYWlsdXJlLCBhZGQgZmVhdHVyZSB0ZXh0IHRvIHNob3cgZmFpbHVyZSByZWFzb24gb3IgZ2VuZXJpY1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGpzb25SZXN1bHQpLmVycm9yID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdZb3UgY2FuIG9ubHkgc2VuZCBhIHVzZXIgb25lIHdlZGdlIHBlciBkYXkuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZDogQWxyZWFkeSBHaWZ0ZWQgVGhpcyBVc2VyIFRvZGF5ISdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ludmFsaWQgdXNlciwgdGhpcyB1c2VyIGlzIG5vdCBjdXJyZW50bHkgYWNjZXB0aW5nIHdlZGdlcydcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IFRoaXMgVXNlciBEb2VzIE5vdCBBY2NlcHQgR2lmdHMhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmx5IGtub3duIGV4YW1wbGUgb2YgdGhpcyAnb3RoZXInIGlzIHdoZW4gZ2lmdGluZyB5b3Vyc2VsZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRkwgR2lmdCBGYWlsZWQhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG4iLCIvKipcbiAqICMjIyBBZGRzIGFiaWxpdHkgdG8gZ2lmdCBuZXdlc3QgMTAgbWVtYmVycyB0byBNQU0gb24gSG9tZXBhZ2Ugb3Igb3BlbiB0aGVpciB1c2VyIHBhZ2VzXG4gKi9cbmNsYXNzIEdpZnROZXdlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICAvKiBUT0RPOiBSZWZhY3RvciBjb2RlIHRvIHJlZHVjZSBkdXBsaWNhdGlvbi4gKi9cbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkhvbWUsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZ2lmdE5ld2VzdCcsXG4gICAgICAgIGRlc2M6IGBBZGQgYnV0dG9ucyB0byBHaWZ0L09wZW4gYWxsIG5ld2VzdCBtZW1iZXJzYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluVGFibGUnO1xuICAgIHByaXZhdGUgX2dpZnRlZFN0b3JlS2V5OiBzdHJpbmcgPSAnbXBfbGFzdE5ld0dpZnRlZCc7XG4gICAgcHJpdmF0ZSBfZ2lmdGVkU3RvcmVMaW1pdDogbnVtYmVyID0gNTAwO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZScsICduZXcgdXNlcnMnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogRGVjaWRlIHdoaWNoIHBhZ2UgdG8gcnVuIG9uXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgQ2hlY2sucGFnZSgpLnRoZW4oKHBhZ2U6VmFsaWRQYWdlKSA9PiB7XG4gICAgICAgICAgICBpZihNUC5ERUJVRykgY29uc29sZS5sb2coJ1VzZXIgZ2lmdGluZyBpbml0IG9uJyxwYWdlKTtcblxuICAgICAgICAgICAgaWYocGFnZSA9PT0gJ2hvbWUnKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9ob21lUGFnZUdpZnRpbmcoKTtcbiAgICAgICAgICAgIH1lbHNlIGlmKHBhZ2UgPT09ICduZXcgdXNlcnMnKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZXdVc2Vyc1BhZ2VHaWZ0aW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBGdW5jdGlvbiB0aGF0IHJ1bnMgb24gdGhlIEhvbWUgcGFnZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2hvbWVQYWdlR2lmdGluZygpIHtcbiAgICAgICAgLy9lbnN1cmUgZ2lmdGVkIGxpc3QgaXMgdW5kZXIgNTAwIG1lbWJlciBuYW1lcyBsb25nXG4gICAgICAgIHRoaXMuX3RyaW1HaWZ0TGlzdCgpO1xuICAgICAgICBVdGlsLmdldFJlY2VudFBvaW50R2lmdHMoKTtcbiAgICAgICAgLy9nZXQgdGhlIEZyb250UGFnZSBOZXdNZW1iZXJzIGVsZW1lbnQgY29udGFpbmluZyBuZXdlc3QgMTAgbWVtYmVyc1xuICAgICAgICBjb25zdCBmcE5NID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmcE5NJyk7XG4gICAgICAgIGNvbnN0IG1lbWJlcnM6IEhUTUxBbmNob3JFbGVtZW50W10gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgICAgICAgIGZwTk0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBsYXN0TWVtID0gbWVtYmVyc1ttZW1iZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICBtZW1iZXJzLmZvckVhY2goKG1lbWJlcikgPT4ge1xuICAgICAgICAgICAgLy9hZGQgYSBjbGFzcyB0byB0aGUgZXhpc3RpbmcgZWxlbWVudCBmb3IgdXNlIGluIHJlZmVyZW5jZSBpbiBjcmVhdGluZyBidXR0b25zXG4gICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZChgbXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfWApO1xuICAgICAgICAgICAgdGhpcy5fbWFya0tub3duR2lmdFN0YXR1cyhtZW1iZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcbiAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XG4gICAgICAgIC8vbWFrZSBzdXJlIHRoZSB2YWx1ZSBmYWxscyB3aXRoaW4gdGhlIGFjY2VwdGFibGUgcmFuZ2VcbiAgICAgICAgLy8gVE9ETzogTWFrZSB0aGUgZ2lmdCB2YWx1ZSBjaGVjayBpbnRvIGEgVXRpbFxuICAgICAgICBpZiAoIWdpZnRWYWx1ZVNldHRpbmcpIHtcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcbiAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAgfHwgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKSkge1xuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XG4gICAgICAgIH1cbiAgICAgICAgLy9jcmVhdGUgdGhlIHRleHQgaW5wdXQgZm9yIGhvdyBtYW55IHBvaW50cyB0byBnaXZlXG4gICAgICAgIGNvbnN0IGdpZnRBbW91bnRzOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgVXRpbC5zZXRBdHRyKGdpZnRBbW91bnRzLCB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICBzaXplOiAnMycsXG4gICAgICAgICAgICBpZDogJ21wX2dpZnRBbW91bnRzJyxcbiAgICAgICAgICAgIHRpdGxlOiAnVmFsdWUgYmV0d2VlbiA1IGFuZCAxMDAnLFxuICAgICAgICAgICAgdmFsdWU6IGdpZnRWYWx1ZVNldHRpbmcsXG4gICAgICAgIH0pO1xuICAgICAgICAvL2luc2VydCB0aGUgdGV4dCBib3ggYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lXG4gICAgICAgIGxhc3RNZW0uaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGdpZnRBbW91bnRzKTtcblxuICAgICAgICAvL21ha2UgdGhlIGJ1dHRvbiBhbmQgaW5zZXJ0IGFmdGVyIHRoZSBsYXN0IG1lbWJlcnMgbmFtZSAoYmVmb3JlIHRoZSBpbnB1dCB0ZXh0KVxuICAgICAgICBjb25zdCBnaWZ0QWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnZ2lmdEFsbCcsXG4gICAgICAgICAgICAnR2lmdCBBbGw6ICcsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgIGAubXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihsYXN0TWVtKX1gLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIC8vYWRkIGEgc3BhY2UgYmV0d2VlbiBidXR0b24gYW5kIHRleHRcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5SaWdodCA9ICc1cHgnO1xuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblRvcCA9ICc1cHgnO1xuXG4gICAgICAgIGdpZnRBbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0Q2FsbDogYm9vbGVhbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGV0IHNraXBwZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgdGV4dCB0byBzaG93IHByb2Nlc3NpbmdcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICdTZW5kaW5nIEdpZnRzLi4uIFBsZWFzZSBXYWl0JztcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB1c2VyIGhhcyBub3QgYmVlbiBnaWZ0ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gbWVtYmVyLmlubmVyVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBwb2ludHMgYW1vdW50IGZyb20gdGhlIGlucHV0IGJveFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICkpIS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJJRCA9IFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikhO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nQWxsb3dhbmNlID0gVXRpbC5nZXRSZW1haW5pbmdQb2ludEdpZnRBbGxvd2FuY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVySURcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1haW5pbmdBbGxvd2FuY2UgPCBnaWZ0RmluYWxBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lwcGVkQ291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBbTStdIFNraXBwaW5nICR7dXNlck5hbWV9OyAke3JlbWFpbmluZ0FsbG93YW5jZX0gcG9pbnRzIHJlbWFpbmluZyB0b2RheS5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nQWxsb3dhbmNlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTWF4aW11bSBkYWlseSBwb2ludHMgYWxyZWFkeSBzZW50IHRvZGF5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2dpZnRGaW5hbEFtb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vd2FpdCAzIHNlY29uZHMgYmV0d2VlbiBKU09OIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RDYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RDYWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcXVlc3Qgc2VuZGluZyBwb2ludHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGpzb25SZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBnaWZ0IHdhcyBzdWNjZXNzZnVsbHkgc2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY29yZFN1Y2Nlc3NmdWxHaWZ0KG1lbWJlciwgZ2lmdEZpbmFsQW1vdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWpzb24uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihqc29uLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b24gYWZ0ZXIgc2VuZFxuICAgICAgICAgICAgICAgIChnaWZ0QWxsQnRuIGFzIEhUTUxJbnB1dEVsZW1lbnQpLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxuICAgICAgICAgICAgICAgICAgICBza2lwcGVkQ291bnQgPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGBHaWZ0cyBjb21wbGV0ZWQuIFNraXBwZWQgJHtza2lwcGVkQ291bnR9IG92ZXIgZGFpbHkgbGltaXQuYFxuICAgICAgICAgICAgICAgICAgICAgICAgOiAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIC8vbmV3bGluZSBiZXR3ZWVuIGVsZW1lbnRzXG4gICAgICAgIG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXS5hZnRlcihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcbiAgICAgICAgLy9saXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGlucHV0IGJveCBhbmQgZW5zdXJlIGl0cyBiZXR3ZWVuIDUgYW5kIDEwMDAsIGlmIG5vdCBkaXNhYmxlIGJ1dHRvblxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpXG4gICAgICAgICAgICApKSEudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGwnKTtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA+IDEwMDAgfHxcbiAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPCA1IHx8XG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgJ0Rpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdpZnRBbGwuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBgR2lmdCBBbGwgJHt2YWx1ZVRvTnVtYmVyfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9hZGQgYSBidXR0b24gdG8gb3BlbiBhbGwgdW5naWZ0ZWQgbWVtYmVycyBpbiBuZXcgdGFic1xuICAgICAgICBjb25zdCBvcGVuQWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnb3BlblRhYnMnLFxuICAgICAgICAgICAgJ09wZW4gVW5naWZ0ZWQgSW4gVGFicycsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgICdbaWQ9bXBfZ2lmdEFtb3VudHNdJyxcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAnbXBfYnRuJ1xuICAgICAgICApO1xuXG4gICAgICAgIG9wZW5BbGxCdG4uc2V0QXR0cmlidXRlKCd0aXRsZScsICdPcGVuIG5ldyB0YWIgZm9yIGVhY2gnKTtcbiAgICAgICAgb3BlbkFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKG1lbWJlci5ocmVmLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICAgICAgLy9nZXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIGJvbnVzIHBvaW50cyBhdmFpbGFibGUgdG8gc3BlbmRcbiAgICAgICAgbGV0IGJvbnVzUG9pbnRzQXZhaWw6IHN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0bUJQJykhLmlubmVyVGV4dDtcbiAgICAgICAgLy9nZXQgcmlkIG9mIHRoZSBkZWx0YSBkaXNwbGF5XG4gICAgICAgIGlmIChib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKSA+PSAwKSB7XG4gICAgICAgICAgICBib251c1BvaW50c0F2YWlsID0gYm9udXNQb2ludHNBdmFpbC5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3JlY3JlYXRlIHRoZSBib251cyBwb2ludHMgaW4gbmV3IHNwYW4gYW5kIGluc2VydCBpbnRvIGZwTk1cbiAgICAgICAgY29uc3QgbWVzc2FnZVNwYW46IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBtZXNzYWdlU3Bhbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2dpZnRBbGxNc2cnKTtcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gJ0F2YWlsYWJsZSAnICsgYm9udXNQb2ludHNBdmFpbDtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFmdGVyKG1lc3NhZ2VTcGFuKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuYWZ0ZXIoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSFcbiAgICAgICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgJzxicj4nKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIGdpZnQgbmV3IG1lbWJlcnMgYnV0dG9uIHRvIEhvbWUgcGFnZS4uLmApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogRnVuY3Rpb24gdGhhdCBydW5zIG9uIHRoZSBOZXcgVXNlcnMgcGFnZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX25ld1VzZXJzUGFnZUdpZnRpbmcoKSB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGUgZ2lmdGVkIGxpc3QgaXMgdW5kZXIgNTAwIG1lbWJlcnNcbiAgICAgICAgdGhpcy5fdHJpbUdpZnRMaXN0KCk7XG4gICAgICAgIFV0aWwuZ2V0UmVjZW50UG9pbnRHaWZ0cygpO1xuXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgY29udGFpbmVyIGhvbGRpbmcgdGhlIG5ld2VzdCBtZW1iZXJzXG4gICAgICAgIGNvbnN0IGZwTk0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmxvY2tDb24nKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgY29uc3QgZm9vdGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJsb2NrRm9vdCcpIGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICBjb25zdCBtZW1iZXJMYWJlbHMgPSB0aGlzLl9nZXROZXdVc2Vyc01lbWJlcnMoZnBOTSk7XG4gICAgICAgIGNvbnN0IGdldEF2YWlsYWJsZVBvaW50cyA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm9udXNQb2ludFRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG1CUCcpIS5pbm5lclRleHQuc3BsaXQoJzonKVsxXTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gYm9udXNQb2ludFRleHQubWF0Y2goL1tcXGQsXSsvKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChtYXRjaFswXS5yZXBsYWNlKC8sL2csICcnKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggbWVtYmVyIGFuZCBjaGVjayBpZiB0aGV5IHdlcmUgcHJldmlvdXNseSBnaWZ0ZWRcbiAgICAgICAgbWVtYmVyTGFiZWxzLmZvckVhY2goKHsgbWVtYmVyIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlclJlZiA9IGBtcF9yZWZQb2ludF8ke1V0aWwuZW5kT2ZIcmVmKG1lbWJlcil9YDtcbiAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKG1lbWJlclJlZik7XG4gICAgICAgICAgICB0aGlzLl9tYXJrS25vd25HaWZ0U3RhdHVzKG1lbWJlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJldHJpZXZlIG9yIGRlZmF1bHQgdGhlIGdpZnQgdmFsdWUgc2V0dGluZ1xuICAgICAgICBsZXQgZ2lmdFZhbHVlU2V0dGluZyA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJykgfHwgJzEwMCc7XG4gICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDUsIE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSkpIHx8IDEwMDtcblxuICAgICAgICAvLyBDcmVhdGUgaW5wdXQgYm94IGZvciBnaWZ0IGFtb3VudFxuICAgICAgICBjb25zdCBnaWZ0QW1vdW50cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIFV0aWwuc2V0QXR0cihnaWZ0QW1vdW50cywge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgc2l6ZTogJzMnLFxuICAgICAgICAgICAgaWQ6ICdtcF9naWZ0QW1vdW50cycsXG4gICAgICAgICAgICB0aXRsZTogJ1ZhbHVlIGJldHdlZW4gNSBhbmQgMTAwJyxcbiAgICAgICAgICAgIHZhbHVlOiBTdHJpbmcoZ2lmdFZhbHVlU2V0dGluZyksXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgYnBUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBicFRleHQuaW5uZXJUZXh0ID0gJ3BvaW50cyAnO1xuXG4gICAgICAgIC8vIENyZWF0ZSBcIkdpZnQgQWxsIENoZWNrZWQgVXNlcnNcIiBidXR0b25cbiAgICAgICAgY29uc3QgZ2lmdEFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ21wX2dpZnRBbGwnLFxuICAgICAgICAgICAgJ0dpZnQgQWxsIFNlbGVjdGVkJyxcbiAgICAgICAgICAgICdidXR0b24nLFxuICAgICAgICAgICAgZm9vdGVyLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5Ub3AgPSAnNXB4JztcblxuICAgICAgICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgZ2lmdGluZyBhY3Rpb25cbiAgICAgICAgZ2lmdEFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmlubmVyVGV4dCA9ICdTZW5kaW5nIEdpZnRzLi4uIFBsZWFzZSBXYWl0JztcbiAgICAgICAgICAgIGxldCBmaXJzdENhbGwgPSB0cnVlO1xuICAgICAgICAgICAgbGV0IHNraXBwZWRDb3VudCA9IDA7XG4gICAgICAgICAgICBjb25zdCBnaWZ0QW1vdW50ID0gTnVtYmVyKFxuICAgICAgICAgICAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCB7IG1lbWJlciwgY2hlY2tib3ggfSBvZiBtZW1iZXJMYWJlbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tib3guY2hlY2tlZCAmJiAhbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSBtZW1iZXIuaW5uZXJUZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXJJRCA9IFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikhO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdBbGxvd2FuY2UgPSBVdGlsLmdldFJlbWFpbmluZ1BvaW50R2lmdEFsbG93YW5jZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcklEXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0FsbG93YW5jZSA8IGdpZnRBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraXBwZWRDb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBbTStdIFNraXBwaW5nICR7dXNlck5hbWV9OyAke3JlbWFpbmluZ0FsbG93YW5jZX0gcG9pbnRzIHJlbWFpbmluZyB0b2RheS5gXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0FsbG93YW5jZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ01heGltdW0gZGFpbHkgcG9pbnRzIGFscmVhZHkgc2VudCB0b2RheSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0QW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX1gO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlyc3RDYWxsKSBhd2FpdCBVdGlsLnNsZWVwKDMwMDApO1xuICAgICAgICAgICAgICAgICAgICBmaXJzdENhbGwgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0ID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGpzb25SZXN1bHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY29yZFN1Y2Nlc3NmdWxHaWZ0KG1lbWJlciwgZ2lmdEFtb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oanNvbi5lcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIChnaWZ0QWxsQnRuIGFzIEhUTUxCdXR0b25FbGVtZW50KS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxuICAgICAgICAgICAgICAgIHNraXBwZWRDb3VudCA+IDBcbiAgICAgICAgICAgICAgICAgICAgPyBgR2lmdHMgY29tcGxldGVkLiBTa2lwcGVkICR7c2tpcHBlZENvdW50fSBvdmVyIGRhaWx5IGxpbWl0LmBcbiAgICAgICAgICAgICAgICAgICAgOiAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSW5wdXQgdmFsaWRhdGlvbiBmb3IgZ2lmdCBhbW91bnRcbiAgICAgICAgZ2lmdEFtb3VudHMuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGwnKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gTnVtYmVyKGdpZnRBbW91bnRzLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgNSB8fCB2YWx1ZSA+IDEwMCB8fCBpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsQnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBnaWZ0QWxsQnRuLnRpdGxlID0gJ0Rpc2FibGVkJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2lmdEFsbEJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGdpZnRBbGxCdG4udGl0bGUgPSBgR2lmdCBBbGwgJHt2YWx1ZX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgXCJPcGVuIFVuZ2lmdGVkIGluIFRhYnNcIiBidXR0b25cbiAgICAgICAgY29uc3Qgb3BlbkFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgJ21wX29wZW5UYWJzJyxcbiAgICAgICAgICAgICdPcGVuIFVuZ2lmdGVkIGluIFRhYnMnLFxuICAgICAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgICAgICBmb290ZXIsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ21wX2J0bidcbiAgICAgICAgKTtcbiAgICAgICAgb3BlbkFsbEJ0bi50aXRsZSA9ICdPcGVuIGEgbmV3IHRhYiBmb3IgZWFjaCB1bmdpZnRlZCBtZW1iZXInO1xuICAgICAgICBvcGVuQWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IG1lbWJlciwgY2hlY2tib3ggfSBvZiBtZW1iZXJMYWJlbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tib3guY2hlY2tlZCAmJiAhbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4obWVtYmVyLmhyZWYsICdfYmxhbmsnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERpc3BsYXkgYXZhaWxhYmxlIGJvbnVzIHBvaW50cyBpbiB0aGUgZm9vdGVyXG4gICAgICAgIGxldCBib251c1BvaW50c0F2YWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RtQlAnKSEuaW5uZXJUZXh0LnNwbGl0KCc6JylbMV07XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBtZXNzYWdlU3Bhbi5pZCA9ICdtcF9naWZ0QWxsTXNnJztcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gYCBBdmFpbGFibGUgUG9pbnRzOiAke2JvbnVzUG9pbnRzQXZhaWx9YDtcblxuICAgICAgICAvLyBBZGQgXCJEZXNlbGVjdCBBbGxcIiBidXR0b25cbiAgICAgICAgY29uc3QgZGVzZWxlY3RCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdtcF9kZXNlbGVjdEFsbCcsXG4gICAgICAgICAgICAnVW5zZWxlY3QgYWxsJyxcbiAgICAgICAgICAgICdidXR0b24nLFxuICAgICAgICAgICAgZm9vdGVyLFxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICdtcF9idG4nXG4gICAgICAgICk7XG4gICAgICAgIGRlc2VsZWN0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYm94TGlzdDogTm9kZUxpc3RPZjxIVE1MSW5wdXRFbGVtZW50PiB8IHZvaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpXG5cbiAgICAgICAgICAgIGJveExpc3QuZm9yRWFjaCgoYm94OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgXCJTZWxlY3QgMTAwIFVuZ2lmdGVkXCIgYnV0dG9uXG4gICAgICAgIGNvbnN0IHNlbGVjdFVuZ2lmdGVkQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAnbXBfc2VsZWN0VW5naWZ0ZWQnLFxuICAgICAgICAgICAgJ1NlbGVjdCAxMDAgVW5naWZ0ZWQnLFxuICAgICAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgICAgICBmb290ZXIsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ21wX2J0bidcbiAgICAgICAgKTtcbiAgICAgICAgc2VsZWN0VW5naWZ0ZWRCdG4udGl0bGUgPSAnU2VsZWN0IHRoZSBmaXJzdCAxMDAgdW5naWZ0ZWQgdXNlcnMnO1xuICAgICAgICBzZWxlY3RVbmdpZnRlZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgbWVtYmVyLCBjaGVja2JveCB9IG9mIG1lbWJlckxhYmVscykge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBtZW1iZXIgaXMgbm90IGdpZnRlZCBhbmQgaWYgdGhlIGNoZWNrYm94IGlzIG5vdCB5ZXQgc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpICYmICFjaGVja2JveC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSB0cnVlOyAgLy8gU2VsZWN0IHRoZSBjaGVja2JveFxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAvLyBTdG9wIGFmdGVyIHNlbGVjdGluZyAxMDAgdXNlcnNcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID49IDEwMCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2VsZWN0ZWQgJHtjb3VudH0gdW5naWZ0ZWQgdXNlcnMuYCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBcIlNlbGVjdCBNYXggVW5naWZ0ZWRcIiBidXR0b25cbiAgICAgICAgY29uc3Qgc2VsZWN0TWF4VW5naWZ0ZWRCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdtcF9zZWxlY3RNYXhVbmdpZnRlZCcsXG4gICAgICAgICAgICAnU2VsZWN0IE1heCBVbmdpZnRlZCcsXG4gICAgICAgICAgICAnYnV0dG9uJyxcbiAgICAgICAgICAgIGZvb3RlcixcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAnbXBfYnRuJ1xuICAgICAgICApO1xuICAgICAgICBzZWxlY3RNYXhVbmdpZnRlZEJ0bi50aXRsZSA9XG4gICAgICAgICAgICAnU2VsZWN0IHRoZSBtYXhpbXVtIG51bWJlciBvZiB1bmdpZnRlZCB1c2VycyB5b3UgY2FuIGFmZm9yZCBhdCB0aGUgY3VycmVudCBnaWZ0IHNpemUnO1xuICAgICAgICBzZWxlY3RNYXhVbmdpZnRlZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdpZnRBbW91bnQgPSBOdW1iZXIoZ2lmdEFtb3VudHMudmFsdWUpO1xuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlUG9pbnRzID0gZ2V0QXZhaWxhYmxlUG9pbnRzKCk7XG5cbiAgICAgICAgICAgIGlmIChnaWZ0QW1vdW50IDwgNSB8fCBnaWZ0QW1vdW50ID4gMTAwIHx8IGlzTmFOKGdpZnRBbW91bnQpIHx8IGdpZnRBbW91bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tNK10gQ2Fubm90IHNlbGVjdCBtYXggdW5naWZ0ZWQgdXNlcnM7IGdpZnQgYW1vdW50IGlzIGludmFsaWQuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtYXhTZWxlY3RhYmxlID0gTWF0aC5mbG9vcihhdmFpbGFibGVQb2ludHMgLyBnaWZ0QW1vdW50KTtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjaGVja2JveCB9IG9mIG1lbWJlckxhYmVscykge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCB7IG1lbWJlciwgY2hlY2tib3ggfSBvZiBtZW1iZXJMYWJlbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpICYmIGNvdW50IDwgbWF4U2VsZWN0YWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja2JveC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGBbTStdIFNlbGVjdGVkICR7Y291bnR9IHVuZ2lmdGVkIHVzZXJzIHVzaW5nICR7YXZhaWxhYmxlUG9pbnRzfSBhdmFpbGFibGUgcG9pbnRzIGF0ICR7Z2lmdEFtb3VudH0gcG9pbnRzIGVhY2guYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGFsbCBlbGVtZW50cyB0byB0aGUgZm9vdGVyXG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChzZWxlY3RNYXhVbmdpZnRlZEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChzZWxlY3RVbmdpZnRlZEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChkZXNlbGVjdEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChnaWZ0QW1vdW50cyk7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChicFRleHQpO1xuICAgICAgICBmb290ZXIuYXBwZW5kQ2hpbGQoZ2lmdEFsbEJ0bik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChvcGVuQWxsQnRuKTtcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKG1lc3NhZ2VTcGFuKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCBnaWZ0aW5nIG9wdGlvbnMgdG8gdGhlIGZvb3RlciBvZiB0aGUgcGFnZS4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIFRyaW1zIHRoZSBnaWZ0ZWQgbGlzdCB0byBsYXN0IDUwMCBuYW1lcyB0byBhdm9pZCBnZXR0aW5nIHRvbyBsYXJnZSBvdmVyIHRpbWUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdHJpbUdpZnRMaXN0KCkge1xuICAgICAgICB0aGlzLl9zZXRHaWZ0ZWRVc2Vycyh0aGlzLl9nZXRHaWZ0ZWRVc2VycygpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRHaWZ0ZWRVc2VycygpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZEdpZnRlZFVzZXJzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl9naWZ0ZWRTdG9yZUtleSk7XG5cbiAgICAgICAgaWYgKHN0b3JlZEdpZnRlZFVzZXJzID09PSB1bmRlZmluZWQgfHwgc3RvcmVkR2lmdGVkVXNlcnMgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RvcmVkR2lmdGVkVXNlcnNcbiAgICAgICAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAgICAgICAubWFwKChnaWZ0ZWRVc2VyKSA9PiBnaWZ0ZWRVc2VyLnRyaW0oKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGdpZnRlZFVzZXIsIGluZGV4LCBhbGxHaWZ0ZWRVc2VycykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBnaWZ0ZWRVc2VyICE9PSAnJyAmJiBhbGxHaWZ0ZWRVc2Vycy5pbmRleE9mKGdpZnRlZFVzZXIpID09PSBpbmRleDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldEdpZnRlZFVzZXJzKGdpZnRlZFVzZXJzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgICAgICBHTV9zZXRWYWx1ZShcbiAgICAgICAgICAgIHRoaXMuX2dpZnRlZFN0b3JlS2V5LFxuICAgICAgICAgICAgZ2lmdGVkVXNlcnMuc2xpY2UoMCwgdGhpcy5fZ2lmdGVkU3RvcmVMaW1pdCkuam9pbignLCcpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc3RvcmVHaWZ0ZWRNZW1iZXIobWVtYmVySUQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBnaWZ0ZWRVc2VycyA9IHRoaXMuX2dldEdpZnRlZFVzZXJzKCkuZmlsdGVyKFxuICAgICAgICAgICAgKGdpZnRlZFVzZXIpID0+IGdpZnRlZFVzZXIgIT09IG1lbWJlcklEXG4gICAgICAgICk7XG4gICAgICAgIGdpZnRlZFVzZXJzLnVuc2hpZnQobWVtYmVySUQpO1xuICAgICAgICB0aGlzLl9zZXRHaWZ0ZWRVc2VycyhnaWZ0ZWRVc2Vycyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbWFya01lbWJlckdpZnRlZChtZW1iZXI6IEhUTUxBbmNob3JFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSDinIVgO1xuICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0TmV3VXNlcnNNZW1iZXJzKFxuICAgICAgICBjb250YWluZXI6IEhUTUxEaXZFbGVtZW50XG4gICAgKTogQXJyYXk8eyBsYWJlbDogSFRNTExhYmVsRWxlbWVudDsgbWVtYmVyOiBIVE1MQW5jaG9yRWxlbWVudDsgY2hlY2tib3g6IEhUTUxJbnB1dEVsZW1lbnQgfT4ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnbGFiZWwnKSkucmVkdWNlKFxuICAgICAgICAgICAgKG1lbWJlclJvd3MsIGxhYmVsKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbGFiZWwucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrYm94ID0gbGFiZWwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlciBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50ICYmXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJSb3dzLnB1c2goeyBsYWJlbCwgbWVtYmVyLCBjaGVja2JveCB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbWVtYmVyUm93cztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbXSBhcyBBcnJheTx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IEhUTUxMYWJlbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgbWVtYmVyOiBIVE1MQW5jaG9yRWxlbWVudDtcbiAgICAgICAgICAgICAgICBjaGVja2JveDogSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgIH0+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBBZGQgdGhlIGdpZnRlZCBzdHlsaW5nIG9uY2Ugd2l0aG91dCBkdXBsaWNhdGluZyB0aGUgY2hlY2ttYXJrIHRleHRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tYXJrR2lmdGVkTWVtYmVyKG1lbWJlcjogSFRNTEFuY2hvckVsZW1lbnQsIHRpdGxlPzogc3RyaW5nKSB7XG4gICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcbiAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSDinIVgO1xuICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICBtZW1iZXIudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICogTWFyayB1c2VycyBhbHJlYWR5IGtub3duIGFzIGdpZnRlZCwgZWl0aGVyIGZyb20gdGhlIGxlZ2FjeSBsaXN0IG9yIHRvZGF5J3MgY2FjaGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tYXJrS25vd25HaWZ0U3RhdHVzKG1lbWJlcjogSFRNTEFuY2hvckVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgbWVtYmVySUQgPSBVdGlsLmVuZE9mSHJlZihtZW1iZXIpO1xuICAgICAgICBpZiAoIW1lbWJlcklEKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZ2V0R2lmdGVkVXNlcnMoKS5pbmNsdWRlcyhtZW1iZXJJRCkpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIobWVtYmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChVdGlsLmdldFJlbWFpbmluZ1BvaW50R2lmdEFsbG93YW5jZShtZW1iZXJJRCkgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX21hcmtHaWZ0ZWRNZW1iZXIobWVtYmVyLCAnTWF4aW11bSBkYWlseSBwb2ludHMgYWxyZWFkeSBzZW50IHRvZGF5Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAqIEtlZXAgbGVnYWN5IHRyYWNraW5nIGFuZCB0aGUgbmV3IGRhaWx5IGNhY2hlIGluIHN5bmMgYWZ0ZXIgYSBzdWNjZXNzZnVsIGdpZnRcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWNvcmRTdWNjZXNzZnVsR2lmdChtZW1iZXI6IEhUTUxBbmNob3JFbGVtZW50LCBhbW91bnQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9tYXJrR2lmdGVkTWVtYmVyKG1lbWJlcik7XG4gICAgICAgIHRoaXMuX3N0b3JlR2lmdGVkTWVtYmVyKFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikhKTtcbiAgICAgICAgVXRpbC5yZWNvcmRQb2ludEdpZnQoVXRpbC5lbmRPZkhyZWYobWVtYmVyKSEsIGFtb3VudCk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBoaWRlIG5ld3MgaXRlbXMgb24gdGhlIHBhZ2VcbiAqL1xuY2xhc3MgSGlkZU5ld3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkhvbWUsXG4gICAgICAgIHRpdGxlOiAnaGlkZU5ld3MnLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBkZXNjOiAnVGlkeSB0aGUgaG9tZXBhZ2UgYW5kIGFsbG93IE5ld3MgdG8gYmUgaGlkZGVuJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5tYWluUGFnZU5ld3NIZWFkJztcbiAgICBwcml2YXRlIF92YWx1ZVRpdGxlOiBzdHJpbmcgPSBgbXBfJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1fdmFsYDtcbiAgICBwcml2YXRlIF9pY29uID0gJ1xcdTI3NGUnO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIC8vIE5PVEU6IGZvciBkZXZlbG9wbWVudFxuICAgICAgICAvLyBHTV9kZWxldGVWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtjb25zb2xlLndhcm4oYFZhbHVlIG9mICR7dGhpcy5fdmFsdWVUaXRsZX0gd2lsbCBiZSBkZWxldGVkIWApO1xuXG4gICAgICAgIHRoaXMuX3JlbW92ZUNsb2NrKCk7XG4gICAgICAgIHRoaXMuX3JlbW92ZURpc2NsYWltZXIoKTtcbiAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIpO1xuICAgICAgICBhd2FpdCB0aGlzLl9jaGVja0ZvclNlZW4oKTtcbiAgICAgICAgdGhpcy5fYWRkSGlkZXJCdXR0b24oKTtcbiAgICAgICAgLy8gdGhpcy5fY2xlYW5WYWx1ZXMoKTsgLy8gRklYOiBOb3Qgd29ya2luZyBhcyBpbnRlbmRlZFxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENsZWFuZWQgdXAgdGhlIGhvbWUgcGFnZSEnKTtcbiAgICB9XG5cbiAgICBfY2hlY2tGb3JTZWVuID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBwcmV2VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGhpcy5fdmFsdWVUaXRsZSwgJzpcXG4nLCBwcmV2VmFsdWUpO1xuXG4gICAgICAgIGlmIChwcmV2VmFsdWUgJiYgbmV3cykge1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBpY29uIHRvIHNwbGl0IG91dCB0aGUga25vd24gaGlkZGVuIG1lc3NhZ2VzXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5BcnJheSA9IHByZXZWYWx1ZS5zcGxpdCh0aGlzLl9pY29uKTtcbiAgICAgICAgICAgIC8qIElmIGFueSBvZiB0aGUgaGlkZGVuIG1lc3NhZ2VzIG1hdGNoIGEgY3VycmVudCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgcmVtb3ZlIHRoZSBjdXJyZW50IG1lc3NhZ2UgZnJvbSB0aGUgRE9NICovXG4gICAgICAgICAgICBoaWRkZW5BcnJheS5mb3JFYWNoKChoaWRkZW4pID0+IHtcbiAgICAgICAgICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS50ZXh0Q29udGVudCA9PT0gaGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gY3VycmVudCBtZXNzYWdlcywgaGlkZSB0aGUgaGVhZGVyXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluUGFnZU5ld3NTdWInKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3JlbW92ZUNsb2NrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjbG9jazogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IC5mcFRpbWUnKTtcbiAgICAgICAgaWYgKGNsb2NrKSBjbG9jay5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgX3JlbW92ZURpc2NsYWltZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc2NsYWltZXJIZWFkZXIgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21haW5Cb2R5IC5ibG9ja0hlYWRDb24gaDQnKVxuICAgICAgICApLmZpbmQoKGhlYWRlcikgPT4gaGVhZGVyLnRleHRDb250ZW50Py50cmltKCkgPT09ICdEaXNjbGFpbWVyJyk7XG4gICAgICAgIGNvbnN0IGRpc2NsYWltZXJCbG9jayA9IGRpc2NsYWltZXJIZWFkZXI/LmNsb3Nlc3QoJy5ibG9ja0NvbicpIGFzIEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcblxuICAgICAgICBpZiAoZGlzY2xhaW1lckJsb2NrKSBkaXNjbGFpbWVyQmxvY2sucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIF9hZGp1c3RIZWFkZXJTaXplID0gKHNlbGVjdG9yOiBzdHJpbmcsIHZpc2libGU/OiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld3NIZWFkZXI6IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKG5ld3NIZWFkZXIpIHtcbiAgICAgICAgICAgIGlmICh2aXNpYmxlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG5ld3NIZWFkZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3c0hlYWRlci5zdHlsZS5mb250U2l6ZSA9ICcyZW0nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9hZGRIaWRlckJ1dHRvbiA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xuICAgICAgICBpZiAoIW5ld3MpIHJldHVybjtcblxuICAgICAgICAvLyBMb29wIG92ZXIgZWFjaCBuZXdzIGVudHJ5XG4gICAgICAgIG5ld3MuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgeGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgeGJ1dHRvbi50ZXh0Q29udGVudCA9IHRoaXMuX2ljb247XG4gICAgICAgICAgICBVdGlsLnNldEF0dHIoeGJ1dHRvbiwge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTppbmxpbmUtYmxvY2s7bWFyZ2luLXJpZ2h0OjAuN2VtO2N1cnNvcjpwb2ludGVyOycsXG4gICAgICAgICAgICAgICAgY2xhc3M6ICdtcF9jbGVhckJ0bicsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2tzXG4gICAgICAgICAgICB4YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gY2xpY2tlZCwgYXBwZW5kIHRoZSBjb250ZW50IG9mIHRoZSBjdXJyZW50IG5ld3MgcG9zdCB0byB0aGVcbiAgICAgICAgICAgICAgICAvLyBsaXN0IG9mIHJlbWVtYmVyZWQgbmV3cyBpdGVtc1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpXG4gICAgICAgICAgICAgICAgICAgID8gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcbiAgICAgICAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBIaWRpbmcuLi4gJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XG5cbiAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCBgJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XG4gICAgICAgICAgICAgICAgZW50cnkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG1vcmUgbmV3cyBpdGVtcywgcmVtb3ZlIHRoZSBoZWFkZXJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkTmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWROZXdzICYmIHVwZGF0ZWROZXdzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBidXR0b24gYXMgdGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBlbnRyeVxuICAgICAgICAgICAgaWYgKGVudHJ5LmZpcnN0Q2hpbGQpIGVudHJ5LmZpcnN0Q2hpbGQuYmVmb3JlKHhidXR0b24pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX2NsZWFuVmFsdWVzID0gKG51bSA9IDMpID0+IHtcbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgR01fZ2V0VmFsdWUoJHt0aGlzLl92YWx1ZVRpdGxlfSlgLCB2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBsYXN0IDMgc3RvcmVkIGl0ZW1zIGFmdGVyIHNwbGl0dGluZyB0aGVtIGF0IHRoZSBpY29uXG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuYXJyYXlUb1N0cmluZyh2YWx1ZS5zcGxpdCh0aGlzLl9pY29uKS5zbGljZSgwIC0gbnVtKSk7XG4gICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZhbHVlXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2dldE5ld3NJdGVtcyA9ICgpOiBOb2RlTGlzdE9mPEhUTUxEaXZFbGVtZW50PiB8IG51bGwgPT4ge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2W2NsYXNzXj1cIm1haW5QYWdlTmV3c1wiXScpO1xuICAgIH07XG5cbiAgICAvLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHR5cGUgc2VsZWN0ZWQgZm9yIGB0aGlzLl9zZXR0aW5nc2BcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxuLyoqXG4gKiAjIFJFUVVFU1QgUEFHRSBGRUFUVVJFU1xuICovXG4vKipcbiAqICogSGlkZSByZXF1ZXN0ZXJzIHdobyBhcmUgc2V0IHRvIFwiaGlkZGVuXCJcbiAqL1xuY2xhc3MgVG9nZ2xlSGlkZGVuUmVxdWVzdGVycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlSGlkZGVuUmVxdWVzdGVycycsXG4gICAgICAgIGRlc2M6IGBIaWRlIGhpZGRlbiByZXF1ZXN0ZXJzYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JSb3dzJztcbiAgICBwcml2YXRlIF9zZWFyY2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX2hpZGUgPSB0cnVlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5fYWRkVG9nZ2xlU3dpdGNoKCk7XG4gICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xuICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHRoaXMuX3NlYXJjaExpc3QpO1xuXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcih0aGlzLl90YXIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xuICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkVG9nZ2xlU3dpdGNoKCkge1xuICAgICAgICAvLyBNYWtlIGEgbmV3IGJ1dHRvbiBhbmQgaW5zZXJ0IGJlc2lkZSB0aGUgU2VhcmNoIGJ1dHRvblxuICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbihcbiAgICAgICAgICAgICdzaG93SGlkZGVuJyxcbiAgICAgICAgICAgICdTaG93IEhpZGRlbicsXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICcjcmVxdWVzdFNlYXJjaCAudG9ycmVudFNlYXJjaCcsXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxuICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXG4gICAgICAgICk7XG4gICAgICAgIC8vIFNlbGVjdCB0aGUgbmV3IGJ1dHRvbiBhbmQgYWRkIGEgY2xpY2sgbGlzdGVuZXJcbiAgICAgICAgY29uc3QgdG9nZ2xlU3dpdGNoOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc2hvd0hpZGRlbicpXG4gICAgICAgICk7XG4gICAgICAgIHRvZ2dsZVN3aXRjaC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICcjdG9yUm93cyA+IC5tcF9oaWRkZW4nXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ0hpZGUgSGlkZGVuJztcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ2xpc3QtaXRlbSc7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ1Nob3cgSGlkZGVuJztcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFJlcXVlc3RMaXN0KCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3RzIHRvIGV4aXN0XG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyAudG9yUmlnaHQnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBHcmFiIGFsbCByZXF1ZXN0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcUxpc3Q6XG4gICAgICAgICAgICAgICAgICAgIHwgTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PlxuICAgICAgICAgICAgICAgICAgICB8IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfCB1bmRlZmluZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAnI3RvclJvd3MgLnRvclJvdydcbiAgICAgICAgICAgICAgICApIGFzIE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD47XG5cbiAgICAgICAgICAgICAgICBpZiAocmVxTGlzdCA9PT0gbnVsbCB8fCByZXFMaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGByZXFMaXN0IGlzICR7cmVxTGlzdH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcUxpc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4pIHtcbiAgICAgICAgbGlzdC5mb3JFYWNoKChyZXF1ZXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ZXI6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IHJlcXVlc3QucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAnLnRvclJpZ2h0IGEnXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Quc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGRlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2YgcmVxdWVzdCByZXN1bHRzXG4gKi9cbmNsYXNzIFBsYWludGV4dFJlcXVlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlJlcXVlc3RzLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFJlcXVlc3QnLFxuICAgICAgICBkZXNjOiBgSW5zZXJ0IHBsYWludGV4dCByZXF1ZXN0IHJlc3VsdHMgYXQgdG9wIG9mIHJlcXVlc3QgcGFnZWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcbiAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXG4gICAgKTtcbiAgICBwcml2YXRlIF9wbGFpblRleHQ6IHN0cmluZyA9ICcnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj47XG5cbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxuICAgICAgICAgICAgICAgICdwbGFpblRvZ2dsZScsXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAnI3NzcicsXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCkpLFxuICAgICAgICBdKTtcblxuICAgICAgICAvLyBQcm9jZXNzIHRoZSByZXN1bHRzIGludG8gcGxhaW50ZXh0XG4gICAgICAgIHJlc3VsdExpc3RcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgY29weSBidXR0b25cbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXG4gICAgICAgICAgICAgICAgICAgICdwbGFpbkNvcHknLFxuICAgICAgICAgICAgICAgICAgICAnQ29weSBQbGFpbnRleHQnLFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgJyNtcF9wbGFpblRvZ2dsZScsXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXG4gICAgICAgICAgICAgICAgICAgICdtcF9jb3B5IG1wX3BsYWluQnRuJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcbiAgICAgICAgICAgICAgICBjb3B5QnRuLmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGEgY2xpY2sgbGlzdGVuZXJcbiAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9wbGFpblRleHQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3BsYWludGV4dFNlYXJjaCcpIS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodGhpcy5faXNPcGVuKTtcblxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XG4gICAgICAgIHRvZ2dsZUJ0blxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dGJveDogSFRNTFRleHRBcmVhRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Ym94ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgndHJ1ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdTaG93IFBsYWludGV4dCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyEnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxuICAgICAqIEBwYXJhbSB2YWwgc3RyaW5naWZpZWQgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcbiAgICAgICAgR01fc2V0VmFsdWUoJ3RvZ2dsZVNuYXRjaGVkU3RhdGUnLCB2YWwpO1xuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMocmVzdWx0czogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBsZXQgc2VyaWVzVGl0bGU6IHN0cmluZyA9ICcnO1xuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcbiAgICAgICAgICAgIC8vIEJyZWFrIG91dCB0aGUgaW1wb3J0YW50IGRhdGEgZnJvbSBlYWNoIG5vZGVcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgJy5hdXRob3InXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAnLm5hcnJhdG9yJ1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHJhd1RpdGxlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LmZvckVhY2goKHNlcmllcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSBsYXN0IHNlcmllcywgdGhlbiBzdHlsZVxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSAnQlkgJztcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSAnRlQgJztcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG91dHA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0UmVxdWVzdExpc3QgPSAoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PiA9PiB7XG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5nZXRTZWFyY2hMaXN0KCApYCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdCByZXN1bHRzIHRvIGV4aXN0XG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyBhJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCByZXF1ZXN0IHJlc3VsdHNcbiAgICAgICAgICAgICAgICBjb25zdCBzbmF0Y2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+ID0gPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yUm93cyAudG9yUm93JylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChzbmF0Y2hMaXN0ID09PSBudWxsIHx8IHNuYXRjaExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHNuYXRjaExpc3QgaXMgJHtzbmF0Y2hMaXN0fWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc25hdGNoTGlzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cblxuICAgIGdldCBpc09wZW4oKTogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XG4gICAgfVxuXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHZhbCk7XG4gICAgfVxufVxuXG5jbGFzcyBHb29kcmVhZHNCdXR0b25SZXEgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvblJlcScsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXG4gICAgICAgIGRlc2M6ICdFbmFibGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zIGZvciByZXF1ZXN0cycsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZmlsbFRvcnJlbnQnO1xuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QgZGV0YWlscyddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIC8vIENvbnZlcnQgcm93IHN0cnVjdHVyZSBpbnRvIHNlYXJjaGFibGUgb2JqZWN0XG4gICAgICAgIGNvbnN0IHJlcVJvd3MgPSBVdGlsLnJvd3NUb09iaihkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiA+IGRpdicpKTtcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IHJlcVJvd3NbJ1RpdGxlOiddLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKTtcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1tcbiAgICAgICAgICAgICdBdXRob3Iocyk6J1xuICAgICAgICBdLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKTtcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1snU2VyaWVzOiddXG4gICAgICAgICAgICA/IHJlcVJvd3NbJ1NlcmllczonXS5xdWVyeVNlbGVjdG9yQWxsKCdhJylcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByZXFSb3dzWydSZWxlYXNlIERhdGUnXTtcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xuICAgICAgICB0aGlzLl9zaGFyZS5nb29kcmVhZHNCdXR0b25zKGJvb2tEYXRhLCBhdXRob3JEYXRhLCBzZXJpZXNEYXRhLCB0YXJnZXQpO1xuICAgIH1cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogUHJvY2VzcyAmIHJldHVybiBpbmZvcm1hdGlvbiBmcm9tIHRoZSBzaG91dGJveFxuICovXG5jbGFzcyBQcm9jZXNzU2hvdXRzIHtcbiAgICAvKipcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxuICAgICAqIEBwYXJhbSBuYW1lcyAoT3B0aW9uYWwpIExpc3Qgb2YgdXNlcm5hbWVzL0lEcyB0byBmaWx0ZXIgZm9yXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIChPcHRpb25hbCkgV2hhdCBmaWx0ZXIgdGhlIG5hbWVzIGFyZSBmb3IuIFJlcXVpcmVkIGlmIGBuYW1lc2AgaXMgcHJvdmlkZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHdhdGNoU2hvdXRib3goXG4gICAgICAgIHRhcjogc3RyaW5nLFxuICAgICAgICBuYW1lcz86IHN0cmluZ1tdLFxuICAgICAgICB1c2VydHlwZT86IFNob3V0Ym94VXNlclR5cGVcbiAgICApOiB2b2lkIHtcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKFxuICAgICAgICAgICAgdGFyLFxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzaG91dGJveCB1cGRhdGVzLCBwcm9jZXNzIHRoZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgIG11dExpc3QuZm9yRWFjaCgobXV0UmVjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xuICAgICAgICAgICAgICAgICAgICBtdXRSZWMuYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlOiBOb2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShub2RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYWRkZWQgYnkgTUFNKyBmb3IgZ2lmdCBidXR0b24sIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBpZ25vcmUgaWYgdGhlIG5vZGUgaXMgYSBkYXRlIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL15tcF8vLnRlc3Qobm9kZURhdGEuZ2V0QXR0cmlidXRlKCdpZCcpISkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGF0YS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBsb29raW5nIGZvciBzcGVjaWZpYyB1c2Vycy4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWVzICE9PSB1bmRlZmluZWQgJiYgbmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VydHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdVc2VydHlwZSBtdXN0IGJlIGRlZmluZWQgaWYgZmlsdGVyaW5nIG5hbWVzISdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJRDogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmXj1cIi91L1wiXScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdocmVmJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAvdS8ke25hbWV9YCA9PT0gdXNlcklEIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNhc2VsZXNzU3RyaW5nTWF0Y2gobmFtZSwgdXNlck5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZVNob3V0KG5vZGUsIHVzZXJ0eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IGNoaWxkTGlzdDogdHJ1ZSB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdCBpbmZvcm1hdGlvbiBmcm9tIHNob3V0c1xuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHNlbGVjdG9yIHN0cmluZ1xuICAgICAqIEBwYXJhbSBnZXQgVGhlIHJlcXVlc3RlZCBpbmZvIChocmVmIG9yIHRleHQpXG4gICAgICogQHJldHVybnMgVGhlIHN0cmluZyB0aGF0IHdhcyBzcGVjaWZpZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGcm9tU2hvdXQoXG4gICAgICAgIHNob3V0OiBOb2RlLFxuICAgICAgICB0YXI6IHN0cmluZyxcbiAgICAgICAgZ2V0OiAnaHJlZicgfCAndGV4dCdcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKTtcblxuICAgICAgICBpZiAoc2hvdXQgIT09IG51bGwgJiYgIW5vZGVEYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICB0YXJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoc2hvdXRFbGVtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGV4dHJhY3RlZDogc3RyaW5nIHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0ICE9PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLmdldEF0dHJpYnV0ZShnZXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZCA9IHNob3V0RWxlbS50ZXh0Q29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhY3RlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIEF0dHJpYnV0ZSB3YXMgbnVsbCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgRWxlbWVudCB3YXMgbnVsbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgTm9kZSB3YXMgbnVsbCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRoZSBzdHlsZSBvZiBhIHNob3V0IGJhc2VkIG9uIGZpbHRlciBsaXN0c1xuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cbiAgICAgKiBAcGFyYW0gdXNlcnR5cGUgVGhlIHR5cGUgb2YgdXNlcnMgdGhhdCBoYXZlIGJlZW4gZmlsdGVyZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0eWxlU2hvdXQoc2hvdXQ6IE5vZGUsIHVzZXJ0eXBlOiBTaG91dGJveFVzZXJUeXBlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNob3V0RWxlbTogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpO1xuICAgICAgICBpZiAodXNlcnR5cGUgPT09ICdwcmlvcml0eScpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVN0eWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgncHJpb3JpdHlTdHlsZV92YWwnKTtcbiAgICAgICAgICAgIGlmIChjdXN0b21TdHlsZSkge1xuICAgICAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gYGhzbGEoJHtjdXN0b21TdHlsZX0pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvdXRFbGVtLnN0eWxlLmJhY2tncm91bmQgPSAnaHNsYSgwLDAlLDUwJSwwLjMpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh1c2VydHlwZSA9PT0gJ211dGUnKSB7XG4gICAgICAgICAgICBzaG91dEVsZW0uY2xhc3NMaXN0LmFkZCgnbXBfbXV0ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgUHJpb3JpdHlVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5VXNlcnMnLFxuICAgICAgICB0YWc6ICdFbXBoYXNpemUgVXNlcnMnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiBzeXN0ZW0sIDI1NDIwLCA3NzYxOCcsXG4gICAgICAgIGRlc2M6XG4gICAgICAgICAgICAnRW1waGFzaXplcyBtZXNzYWdlcyBmcm9tIHRoZSBsaXN0ZWQgdXNlcnMgaW4gdGhlIHNob3V0Ym94LiAoPGVtPlRoaXMgYWNjZXB0cyB1c2VyIElEcyBhbmQgdXNlcm5hbWVzLiBJdCBpcyBub3QgY2FzZSBzZW5zaXRpdmUuPC9lbT4pJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcbiAgICBwcml2YXRlIF9wcmlvcml0eVVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmlvcml0eVVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9wcmlvcml0eVVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEhpZ2hsaWdodGluZyB1c2VycyBpbiB0aGUgc2hvdXRib3guLi5gKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gcHJpb3JpdHkgdXNlcnNcbiAqL1xuY2xhc3MgUHJpb3JpdHlTdHlsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5U3R5bGUnLFxuICAgICAgICB0YWc6ICdFbXBoYXNpcyBTdHlsZScsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMCwgMCUsIDUwJSwgMC4zJyxcbiAgICAgICAgZGVzYzogYENoYW5nZSB0aGUgY29sb3Ivb3BhY2l0eSBvZiB0aGUgaGlnaGxpZ2h0aW5nIHJ1bGUgZm9yIGVtcGhhc2l6ZWQgdXNlcnMnIHBvc3RzLiAoPGVtPlRoaXMgaXMgZm9ybWF0dGVkIGFzIEh1ZSAoMC0zNjApLCBTYXR1cmF0aW9uICgwLTEwMCUpLCBMaWdodG5lc3MgKDAtMTAwJSksIE9wYWNpdHkgKDAtMSk8L2VtPilgLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0dGluZyBjdXN0b20gaGlnaGxpZ2h0IGZvciBwcmlvcml0eSB1c2Vycy4uLmApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBkZXNpcmVkIG11dGVkIHVzZXJzXG4gKi9cbmNsYXNzIE11dGVkVXNlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdtdXRlZFVzZXJzJyxcbiAgICAgICAgdGFnOiAnTXV0ZSB1c2VycycsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEyMzQsIGdhcmRlbnNoYWRlJyxcbiAgICAgICAgZGVzYzogYE9ic2N1cmVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3ggdW50aWwgaG92ZXJlZC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KWAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XG4gICAgcHJpdmF0ZSBfbXV0ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcbiAgICBwcml2YXRlIF91c2VyVHlwZTogU2hvdXRib3hVc2VyVHlwZSA9ICdtdXRlJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9tdXRlZFVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9tdXRlZFVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE9ic2N1cmluZyBtdXRlZCB1c2Vycy4uLmApO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogQWxsb3dzIEdpZnQgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0IFRyaXBsZSBkb3QgbWVudVxuICovXG5jbGFzcyBHaWZ0QnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdnaWZ0QnV0dG9uJyxcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIEdpZnQgYnV0dG9uIGluIFNob3V0Ym94IGRvdC1tZW51YCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSW5pdGlhbGl6ZWQgR2lmdCBCdXR0b24uYCk7XG4gICAgICAgIGNvbnN0IHNiZkRpdiA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JmJykhO1xuICAgICAgICBjb25zdCBzYmZEaXZDaGlsZCA9IHNiZkRpdiEuZmlyc3RDaGlsZDtcblxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbmV2ZXIgc29tZXRoaW5nIGlzIGNsaWNrZWQgaW4gdGhlIHNiZiBkaXZcbiAgICAgICAgc2JmRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIC8vcHVsbCB0aGUgZXZlbnQgdGFyZ2V0IGludG8gYW4gSFRNTCBFbGVtZW50XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIC8vYWRkIHRoZSBUcmlwbGUgRG90IE1lbnUgYXMgYW4gZWxlbWVudFxuICAgICAgICAgICAgY29uc3Qgc2JNZW51RWxlbSA9IHRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKTtcbiAgICAgICAgICAgIC8vZmluZCB0aGUgbWVzc2FnZSBkaXZcbiAgICAgICAgICAgIGNvbnN0IHNiTWVudVBhcmVudCA9IHRhcmdldCEuY2xvc2VzdChgZGl2YCk7XG4gICAgICAgICAgICAvL2dldCB0aGUgZnVsbCB0ZXh0IG9mIHRoZSBtZXNzYWdlIGRpdlxuICAgICAgICAgICAgbGV0IGdpZnRNZXNzYWdlID0gc2JNZW51UGFyZW50IS5pbm5lclRleHQ7XG4gICAgICAgICAgICAvL2Zvcm1hdCBtZXNzYWdlIHdpdGggc3RhbmRhcmQgdGV4dCArIG1lc3NhZ2UgY29udGVudHMgKyBzZXJ2ZXIgdGltZSBvZiB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgZ2lmdE1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBTZW50IG9uIFNob3V0Ym94IG1lc3NhZ2U6IFwiYCArXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKGdpZnRNZXNzYWdlLmluZGV4T2YoJzogJykgKyAyKSArXG4gICAgICAgICAgICAgICAgYFwiIGF0IGAgK1xuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZygwLCA4KTtcbiAgICAgICAgICAgIC8vaWYgdGhlIHRhcmdldCBvZiB0aGUgY2xpY2sgaXMgbm90IHRoZSBUcmlwbGUgRG90IE1lbnUgT1JcbiAgICAgICAgICAgIC8vaWYgbWVudSBpcyBvbmUgb2YgeW91ciBvd24gY29tbWVudHMgKG9ubHkgd29ya3MgZm9yIGZpcnN0IDEwIG1pbnV0ZXMgb2YgY29tbWVudCBiZWluZyBzZW50KVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0YXJnZXQhLmNsb3Nlc3QoJy5zYl9tZW51JykgfHxcbiAgICAgICAgICAgICAgICBzYk1lbnVFbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZWUnKSEgPT09ICcxJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9nZXQgdGhlIE1lbnUgYWZ0ZXIgaXQgcG9wcyB1cFxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIEdpZnQgQnV0dG9uLi4uYCk7XG4gICAgICAgICAgICBjb25zdCBwb3B1cE1lbnU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJyk7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCg1KTtcbiAgICAgICAgICAgIH0gd2hpbGUgKCFwb3B1cE1lbnUhLmhhc0NoaWxkTm9kZXMoKSk7XG4gICAgICAgICAgICAvL2dldCB0aGUgdXNlciBkZXRhaWxzIGZyb20gdGhlIHBvcHVwIG1lbnUgZGV0YWlsc1xuICAgICAgICAgICAgY29uc3QgcG9wdXBVc2VyOiBIVE1MRWxlbWVudCA9IFV0aWwubm9kZVRvRWxlbShwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgLy9tYWtlIHVzZXJuYW1lIGVxdWFsIHRoZSBkYXRhLXVpZCwgZm9yY2Ugbm90IG51bGxcbiAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBzdHJpbmcgPSBwb3B1cFVzZXIhLmdldEF0dHJpYnV0ZSgnZGF0YS11aWQnKSE7XG4gICAgICAgICAgICAvL2dldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBnaWZ0cyBzZXQgaW4gcHJlZmVyZW5jZXMgZm9yIHVzZXIgcGFnZVxuICAgICAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XG4gICAgICAgICAgICAvL2lmIHRoZXkgZGlkIG5vdCBzZXQgYSB2YWx1ZSBpbiBwcmVmZXJlbmNlcywgc2V0IHRvIDEwMFxuICAgICAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAwIHx8XG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAwJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgSFRNTCBkb2N1bWVudCB0aGF0IGhvbGRzIHRoZSBidXR0b24gYW5kIHZhbHVlIHRleHRcbiAgICAgICAgICAgIGNvbnN0IGdpZnRCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGdpZnRCdXR0b24uc2V0QXR0cmlidXRlKCdpZCcsICdnaWZ0QnV0dG9uJyk7XG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgYXMgd2VsbCBhcyBhIHRleHQgZWxlbWVudCBmb3IgdmFsdWUgb2YgZ2lmdC4gUG9wdWxhdGUgd2l0aCB2YWx1ZSBmcm9tIHNldHRpbmdzXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLmlubmVySFRNTCA9IGA8YnV0dG9uPkdpZnQ6IDwvYnV0dG9uPjxzcGFuPiZuYnNwOzwvc3Bhbj48aW5wdXQgdHlwZT1cInRleHRcIiBzaXplPVwiM1wiIGlkPVwibXBfZ2lmdFZhbHVlXCIgdGl0bGU9XCJWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDBcIiB2YWx1ZT1cIiR7Z2lmdFZhbHVlU2V0dGluZ31cIj5gO1xuICAgICAgICAgICAgLy9hZGQgZ2lmdCBlbGVtZW50IHdpdGggYnV0dG9uIGFuZCB0ZXh0IHRvIHRoZSBtZW51XG4gICAgICAgICAgICBwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0uYXBwZW5kQ2hpbGQoZ2lmdEJ1dHRvbik7XG4gICAgICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbiBnaWZ0IGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0ZWRBbW91bnQgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRWYWx1ZScpXG4gICAgICAgICAgICAgICAgKSkhLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA9IFV0aWwuZ2V0UmVtYWluaW5nUG9pbnRHaWZ0QWxsb3dhbmNlKFxuICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbGV0IGdpZnRGaW5hbEFtb3VudCA9IHJlcXVlc3RlZEFtb3VudDtcbiAgICAgICAgICAgICAgICBsZXQgYWRqdXN0ZWRGcm9tQW1vdW50OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGtub3duUmVtYWluaW5nQWxsb3dhbmNlID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA8IHJlcXVlc3RlZEFtb3VudFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBnaWZ0RmluYWxBbW91bnQgPSBrbm93blJlbWFpbmluZ0FsbG93YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgYWRqdXN0ZWRGcm9tQW1vdW50ID0gcmVxdWVzdGVkQW1vdW50O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa25vd25SZW1haW5pbmdBbGxvd2FuY2UgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2hvd0dpZnRTdGF0dXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXZDaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBGYWlsZWQ6IEVycm9yOiBNYXhpbXVtIGRhaWx5IHBvaW50cyBhbHJlYWR5IHNlbnQgdG9kYXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xvc2VHaWZ0TWVudShzYmZEaXYpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGpzb24gPSBhd2FpdCB0aGlzLl9zZW5kUG9pbnRHaWZ0KHVzZXJOYW1lLCBnaWZ0RmluYWxBbW91bnQsIGdpZnRNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIGlmICghanNvbi5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldHJ5QW1vdW50ID0gdGhpcy5fZ2V0UmV0cnlHaWZ0QW1vdW50KFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRGaW5hbEFtb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtub3duUmVtYWluaW5nQWxsb3dhbmNlXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJ5QW1vdW50ICE9PSBudWxsICYmIHJldHJ5QW1vdW50ICE9PSBnaWZ0RmluYWxBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkanVzdGVkRnJvbUFtb3VudCA9IHJlcXVlc3RlZEFtb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRGaW5hbEFtb3VudCA9IHJldHJ5QW1vdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAganNvbiA9IGF3YWl0IHRoaXMuX3NlbmRQb2ludEdpZnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEZpbmFsQW1vdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGpzb24uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBVdGlsLnJlY29yZFBvaW50R2lmdCh1c2VyTmFtZSwgZ2lmdEZpbmFsQW1vdW50KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc01lc3NhZ2UgPVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRqdXN0ZWRGcm9tQW1vdW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkanVzdGVkRnJvbUFtb3VudCAhPT0gZ2lmdEZpbmFsQW1vdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgUG9pbnRzIEdpZnQgU3VjY2Vzc2Z1bDogVmFsdWU6ICR7Z2lmdEZpbmFsQW1vdW50fSAoYWRqdXN0ZWQgZnJvbSAke2FkanVzdGVkRnJvbUFtb3VudH0pYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYFBvaW50cyBHaWZ0IFN1Y2Nlc3NmdWw6IFZhbHVlOiAke2dpZnRGaW5hbEFtb3VudH1gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaG93R2lmdFN0YXR1cyhzYmZEaXYsIHNiZkRpdkNoaWxkLCBzdWNjZXNzTWVzc2FnZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2hvd0dpZnRTdGF0dXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXZDaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBGYWlsZWQ6IEVycm9yOiAnICsganNvbi5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gdG8gbWFpbiBTQiB3aW5kb3cgYWZ0ZXIgZ2lmdCBpcyBjbGlja2VkIC0gdGhlc2UgYXJlIHR3byBzdGVwcyB0YWtlbiBieSBNQU0gd2hlbiBjbGlja2luZyBvdXQgb2YgTWVudVxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb3NlR2lmdE1lbnUoc2JmRGl2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpIS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XG4gICAgICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcbiAgICAgICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEdpZnQgQnV0dG9uIGFkZGVkIWApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9zZW5kUG9pbnRHaWZ0KFxuICAgICAgICB1c2VyTmFtZTogbnVtYmVyIHwgc3RyaW5nLFxuICAgICAgICBhbW91bnQ6IG51bWJlcixcbiAgICAgICAgZ2lmdE1lc3NhZ2U6IHN0cmluZ1xuICAgICk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2Ftb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICBnaWZ0TWVzc2FnZVxuICAgICAgICApfWA7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRSZXRyeUdpZnRBbW91bnQoXG4gICAgICAgIGVycm9yOiBzdHJpbmcsXG4gICAgICAgIGF0dGVtcHRlZEFtb3VudDogbnVtYmVyLFxuICAgICAgICBrbm93blJlbWFpbmluZ0FsbG93YW5jZTogbnVtYmVyXG4gICAgKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IChlcnJvci5tYXRjaCgvXFxkW1xcZCxdKi9nKSB8fCBbXSlcbiAgICAgICAgICAgIC5tYXAoKHZhbHVlKSA9PiBwYXJzZUludCh2YWx1ZS5yZXBsYWNlKC8sL2csICcnKSkpXG4gICAgICAgICAgICAuZmlsdGVyKCh2YWx1ZSkgPT4gIWlzTmFOKHZhbHVlKSAmJiB2YWx1ZSA+PSA1KTtcbiAgICAgICAgbGV0IHJldHJ5QW1vdW50ID0gY2FuZGlkYXRlc1xuICAgICAgICAgICAgLmZpbHRlcigodmFsdWUpID0+IHZhbHVlIDwgYXR0ZW1wdGVkQW1vdW50KVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIgLSBhKVswXTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA+IDAgJiZcbiAgICAgICAgICAgIGtub3duUmVtYWluaW5nQWxsb3dhbmNlIDwgYXR0ZW1wdGVkQW1vdW50ICYmXG4gICAgICAgICAgICAocmV0cnlBbW91bnQgPT09IHVuZGVmaW5lZCB8fCBrbm93blJlbWFpbmluZ0FsbG93YW5jZSA8IHJldHJ5QW1vdW50KVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHJ5QW1vdW50ID0ga25vd25SZW1haW5pbmdBbGxvd2FuY2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0cnlBbW91bnQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiByZXRyeUFtb3VudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zaG93R2lmdFN0YXR1cyhcbiAgICAgICAgc2JmRGl2OiBIVE1MRGl2RWxlbWVudCxcbiAgICAgICAgc2JmRGl2Q2hpbGQ6IENoaWxkTm9kZSB8IG51bGwsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgc3VjY2VzczogYm9vbGVhblxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXNiZkRpdkNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbmV3RGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfZ2lmdFN0YXR1c0VsZW0nKTtcbiAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKTtcbiAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoc3VjY2VzcyA/ICdtcF9zdWNjZXNzJyA6ICdtcF9mYWlsJyk7XG4gICAgICAgIHNiZkRpdkNoaWxkLmFwcGVuZENoaWxkKG5ld0Rpdik7XG4gICAgICAgIHNiZkRpdi5zY3JvbGxUb3AgPSBzYmZEaXYuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2Nsb3NlR2lmdE1lbnUoc2JmRGl2OiBIVE1MRGl2RWxlbWVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBjbGlja2VkUm93ID0gc2JmRGl2LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NiX2NsaWNrZWRfcm93JylbMF07XG4gICAgICAgIGlmIChjbGlja2VkUm93KSB7XG4gICAgICAgICAgICBjbGlja2VkUm93LnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiTWVudU1haW4nKTtcbiAgICAgICAgaWYgKG1lbnUpIHtcbiAgICAgICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCdjbGFzcycsICdzYkJvdHRvbSBoaWRlTWUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgZmVhdHVyZSBmb3IgYnVpbGRpbmcgYSBsaWJyYXJ5IG9mIHF1aWNrIHNob3V0IGl0ZW1zIHRoYXQgY2FuIGFjdCBhcyBhIGNvcHkvcGFzdGUgcmVwbGFjZW1lbnQuXG4gKi9cbmNsYXNzIFF1aWNrU2hvdXQgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3F1aWNrU2hvdXQnLFxuICAgICAgICBkZXNjOiBgQ3JlYXRlIGZlYXR1cmUgYmVsb3cgc2hvdXRib3ggdG8gc3RvcmUgcHJlLXNldCBtZXNzYWdlcy5gLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFF1aWNrIFNob3V0IEJ1dHRvbnMuLi5gKTtcbiAgICAgICAgLy9nZXQgdGhlIG1haW4gc2hvdXRib3ggaW5wdXQgZmllbGRcbiAgICAgICAgY29uc3QgcmVwbHlCb3ggPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hib3hfdGV4dCcpO1xuICAgICAgICAvL2VtcHR5IEpTT04gd2FzIGdpdmluZyBtZSBpc3N1ZXMsIHNvIGRlY2lkZWQgdG8ganVzdCBtYWtlIGFuIGludHJvIGZvciB3aGVuIHRoZSBHTSB2YXJpYWJsZSBpcyBlbXB0eVxuICAgICAgICBsZXQganNvbkxpc3QgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgYHsgXCJJbnRyb1wiOlwiV2VsY29tZSB0byBRdWlja1Nob3V0IE1BTStlciEgSGVyZSB5b3UgY2FuIGNyZWF0ZSBwcmVzZXQgU2hvdXQgbWVzc2FnZXMgZm9yIHF1aWNrIHJlc3BvbnNlcyBhbmQga25vd2xlZGdlIHNoYXJpbmcuICdDbGVhcicgY2xlYXJzIHRoZSBlbnRyeSB0byBzdGFydCBzZWxlY3Rpb24gcHJvY2VzcyBvdmVyLiAnU2VsZWN0JyB0YWtlcyB3aGF0ZXZlciBRdWlja1Nob3V0IGlzIGluIHRoZSBUZXh0QXJlYSBhbmQgcHV0cyBpbiB5b3VyIFNob3V0IHJlc3BvbnNlIGFyZWEuICdTYXZlJyB3aWxsIHN0b3JlIHRoZSBTZWxlY3Rpb24gTmFtZSBhbmQgVGV4dCBBcmVhIENvbWJvIGZvciBmdXR1cmUgdXNlIGFzIGEgUXVpY2tTaG91dCwgYW5kIGhhcyBjb2xvciBpbmRpY2F0b3JzLiBHcmVlbiA9IHNhdmVkIGFzLWlzLiBZZWxsb3cgPSBRdWlja1Nob3V0IE5hbWUgZXhpc3RzIGFuZCBpcyBzYXZlZCwgYnV0IGNvbnRlbnQgZG9lcyBub3QgbWF0Y2ggd2hhdCBpcyBzdG9yZWQuIE9yYW5nZSA9IG5vIGVudHJ5IG1hdGNoaW5nIHRoYXQgbmFtZSwgbm90IHNhdmVkLiAnRGVsZXRlJyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGF0IGVudHJ5IGZyb20geW91ciBzdG9yZWQgUXVpY2tTaG91dHMgKGJ1dHRvbiBvbmx5IHNob3dzIHdoZW4gZXhpc3RzIGluIHN0b3JhZ2UpLiBGb3IgbmV3IGVudHJpZXMgaGF2ZSB5b3VyIFF1aWNrU2hvdXQgTmFtZSB0eXBlZCBpbiBCRUZPUkUgeW91IGNyYWZ0IHlvdXIgdGV4dCBvciByaXNrIGl0IGJlaW5nIG92ZXJ3cml0dGVuIGJ5IHNvbWV0aGluZyB0aGF0IGV4aXN0cyBhcyB5b3UgdHlwZSBpdC4gVGhhbmtzIGZvciB1c2luZyBNQU0rIVwiIH1gXG4gICAgICAgICk7XG4gICAgICAgIC8vZ2V0IFNob3V0Ym94IERJVlxuICAgICAgICBjb25zdCBzaG91dEJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcFNob3V0Jyk7XG4gICAgICAgIC8vZ2V0IHRoZSBmb290ZXIgd2hlcmUgd2Ugd2lsbCBpbnNlcnQgb3VyIGZlYXR1cmVcbiAgICAgICAgY29uc3Qgc2hvdXRGb290ID0gPEhUTUxFbGVtZW50PnNob3V0Qm94IS5xdWVyeVNlbGVjdG9yKCcuYmxvY2tGb290Jyk7XG4gICAgICAgIC8vZ2l2ZSBpdCBhbiBJRCBhbmQgc2V0IHRoZSBzaXplXG4gICAgICAgIHNob3V0Rm9vdCEuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9ibG9ja0Zvb3QnKTtcbiAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMi41ZW0nO1xuICAgICAgICAvL2NyZWF0ZSBhIG5ldyBkaXZlIHRvIGhvbGQgb3VyIGNvbWJvQm94IGFuZCBidXR0b25zIGFuZCBzZXQgdGhlIHN0eWxlIGZvciBmb3JtYXR0aW5nXG4gICAgICAgIGNvbnN0IGNvbWJvQm94RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLmZsb2F0ID0gJ2xlZnQnO1xuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcuNWVtJztcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luVG9wID0gJy41ZW0nO1xuICAgICAgICAvL2NyZWF0ZSB0aGUgbGFiZWwgdGV4dCBlbGVtZW50IGFuZCBhZGQgdGhlIHRleHQgYW5kIGF0dHJpYnV0ZXMgZm9yIElEXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICBjb21ib0JveExhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgJ3F1aWNrU2hvdXREYXRhJyk7XG4gICAgICAgIGNvbWJvQm94TGFiZWwuaW5uZXJUZXh0ID0gJ0Nob29zZSBhIFF1aWNrU2hvdXQnO1xuICAgICAgICBjb21ib0JveExhYmVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMYWJlbCcpO1xuICAgICAgICAvL2NyZWF0ZSB0aGUgaW5wdXQgZmllbGQgdG8gbGluayB0byBkYXRhbGlzdCBhbmQgZm9ybWF0IHN0eWxlXG4gICAgICAgIGNvbnN0IGNvbWJvQm94SW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBjb21ib0JveElucHV0LnN0eWxlLm1hcmdpbkxlZnQgPSAnLjVlbSc7XG4gICAgICAgIGNvbWJvQm94SW5wdXQuc2V0QXR0cmlidXRlKCdsaXN0JywgJ21wX2NvbWJvQm94TGlzdCcpO1xuICAgICAgICBjb21ib0JveElucHV0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hJbnB1dCcpO1xuICAgICAgICAvL2NyZWF0ZSBhIGRhdGFsaXN0IHRvIHN0b3JlIG91ciBxdWlja3Nob3V0c1xuICAgICAgICBjb25zdCBjb21ib0JveExpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRhbGlzdCcpO1xuICAgICAgICBjb21ib0JveExpc3Quc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveExpc3QnKTtcbiAgICAgICAgLy9pZiB0aGUgR00gdmFyaWFibGUgZXhpc3RzXG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcpKSB7XG4gICAgICAgICAgICAvL292ZXJ3cml0ZSBqc29uTGlzdCB2YXJpYWJsZSB3aXRoIHBhcnNlZCBkYXRhXG4gICAgICAgICAgICBqc29uTGlzdCA9IEpTT04ucGFyc2UoR01fZ2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnKSk7XG4gICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpdGVtXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgT3B0aW9uIGVsZW1lbnQgYW5kIGFkZCBvdXIgZGF0YSBmb3IgZGlzcGxheSB0byB1c2VyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcbiAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL2lmIG5vIEdNIHZhcmlhYmxlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NyZWF0ZSB2YXJpYWJsZSB3aXRoIG91dCBJbnRybyBkYXRhXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XG4gICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpdGVtXG4gICAgICAgICAgICAvLyBUT0RPOiBwcm9iYWJseSBjYW4gZ2V0IHJpZCBvZiB0aGUgZm9yRWFjaCBhbmQganVzdCBkbyBzaW5nbGUgZXhlY3V0aW9uIHNpbmNlIHdlIGtub3cgdGhpcyBpcyBJbnRybyBvbmx5XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcbiAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2FwcGVuZCB0aGUgYWJvdmUgZWxlbWVudHMgdG8gb3VyIERJViBmb3IgdGhlIGNvbWJvIGJveFxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveExhYmVsKTtcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hJbnB1dCk7XG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGlzdCk7XG4gICAgICAgIC8vY3JlYXRlIHRoZSBjbGVhciBidXR0b24gYW5kIGFkZCBzdHlsZVxuICAgICAgICBjb25zdCBjbGVhckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjbGVhckJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XG4gICAgICAgIGNsZWFyQnV0dG9uLmlubmVySFRNTCA9ICdDbGVhcic7XG4gICAgICAgIC8vY3JlYXRlIGRlbGV0ZSBidXR0b24sIGFkZCBzdHlsZSwgYW5kIHRoZW4gaGlkZSBpdCBmb3IgbGF0ZXIgdXNlXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICc2ZW0nO1xuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xuICAgICAgICBkZWxldGVCdXR0b24uaW5uZXJIVE1MID0gJ0RFTEVURSc7XG4gICAgICAgIC8vY3JlYXRlIHNlbGVjdCBidXR0b24gYW5kIHN0eWxlIGl0XG4gICAgICAgIGNvbnN0IHNlbGVjdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBzZWxlY3RCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xuICAgICAgICBzZWxlY3RCdXR0b24uaW5uZXJIVE1MID0gJ1xcdTIxOTEgU2VsZWN0JztcbiAgICAgICAgLy9jcmVhdGUgc2F2ZSBidXR0b24gYW5kIHN0eWxlIGl0XG4gICAgICAgIGNvbnN0IHNhdmVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XG4gICAgICAgIHNhdmVCdXR0b24uaW5uZXJIVE1MID0gJ1NhdmUnO1xuICAgICAgICAvL2FkZCBhbGwgNCBidXR0b25zIHRvIHRoZSBjb21ib0JveCBESVZcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY2xlYXJCdXR0b24pO1xuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChzZWxlY3RCdXR0b24pO1xuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChzYXZlQnV0dG9uKTtcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoZGVsZXRlQnV0dG9uKTtcbiAgICAgICAgLy9jcmVhdGUgb3VyIHRleHQgYXJlYSBhbmQgc3R5bGUgaXQsIHRoZW4gaGlkZSBpdFxuICAgICAgICBjb25zdCBxdWlja1Nob3V0VGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmhlaWdodCA9ICc1MCUnO1xuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5tYXJnaW4gPSAnMWVtJztcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUud2lkdGggPSAnOTclJztcbiAgICAgICAgcXVpY2tTaG91dFRleHQuaWQgPSAnbXBfcXVpY2tTaG91dFRleHQnO1xuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICAgIC8vZXhlY3V0ZXMgd2hlbiBjbGlja2luZyBzZWxlY3QgYnV0dG9uXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIHNvbWV0aGluZyBpbnNpZGUgb2YgdGhlIHF1aWNrc2hvdXQgYXJlYVxuICAgICAgICAgICAgICAgIGlmIChxdWlja1Nob3V0VGV4dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvL3B1dCB0aGUgdGV4dCBpbiB0aGUgbWFpbiBzaXRlIHJlcGx5IGZpZWxkIGFuZCBmb2N1cyBvbiBpdFxuICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IHF1aWNrU2hvdXRUZXh0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXBseUJveC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIC8vY3JlYXRlIGEgcXVpY2tTaG91dCBkZWxldGUgYnV0dG9uXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgbm90IHRoZSBsYXN0IHF1aWNrU2hvdXRcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoanNvbkxpc3QpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVudHJ5IGZyb20gdGhlIEpTT04gYW5kIHVwZGF0ZSB0aGUgR00gdmFyaWFibGUgd2l0aCBuZXcganNvbiBsaXN0XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBqc29uTGlzdFtjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpXTtcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiBmb3IgbmV3IHVuc2F2ZWQgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgbm90IGEgc2F2ZWQgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBvcHRpb25zIGZyb20gZGF0YWxpc3QgdG8gcmVzZXQgd2l0aCBuZXdseSBjcmVhdGVkIGpzb25MaXN0XG4gICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBpdGVtIGluIG5ldyBqc29uTGlzdFxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL25ldyBvcHRpb24gZWxlbWVudCB0byBhZGQgdG8gbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjdXJyZW50IGtleSB2YWx1ZSB0byB0aGUgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBlbGVtZW50IHRvIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgbGFzdCBpdGVtIGluIHRoZSBqc29ubGlzdFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGl0ZW0gZnJvbSBqc29uTGlzdFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC/gsqAvZywgJ+CyoCcpXTtcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZW50aXJlIHZhcmlhYmxlIHNvIGl0cyBub3QgZW1wdHkgR00gdmFyaWFibGVcbiAgICAgICAgICAgICAgICAgICAgR01fZGVsZXRlVmFsdWUoJ21wX3F1aWNrU2hvdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gZm9yIG5ldyB1bnNhdmVkIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIG5vdCBhIHNhdmVkIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBpbnB1dCBldmVudCBvbiBpbnB1dCB0byBmb3JjZSBzb21lIHVwZGF0ZXMgYW5kIGRpc3BhdGNoIGl0XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgY29tYm9Cb3hJbnB1dC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIC8vY3JlYXRlIGV2ZW50IG9uIHNhdmUgYnV0dG9uIHRvIHNhdmUgcXVpY2tzaG91dFxuICAgICAgICBzYXZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgZGF0YSBpbiB0aGUga2V5IGFuZCB2YWx1ZSBHVUkgZmllbGRzLCBwcm9jZWVkXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlICYmIGNvbWJvQm94SW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy93YXMgaGF2aW5nIGlzc3VlIHdpdGggZXZhbCBwcm9jZXNzaW5nIHRoZSAucmVwbGFjZSBkYXRhIHNvIG1hZGUgYSB2YXJpYWJsZSB0byBpbnRha2UgaXRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZWRUZXh0ID0gY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKTtcbiAgICAgICAgICAgICAgICAgICAgLy9mdW4gd2F5IHRvIGR5bmFtaWNhbGx5IGNyZWF0ZSBzdGF0ZW1lbnRzIC0gdGhpcyB0YWtlcyB3aGF0ZXZlciBpcyBpbiBsaXN0IGZpZWxkIHRvIGNyZWF0ZSBhIGtleSB3aXRoIHRoYXQgdGV4dCBhbmQgdGhlIHZhbHVlIGZyb20gdGhlIHRleHRhcmVhXG4gICAgICAgICAgICAgICAgICAgIGV2YWwoXG4gICAgICAgICAgICAgICAgICAgICAgICBganNvbkxpc3QuYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZWRUZXh0ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgPSBcImAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChxdWlja1Nob3V0VGV4dC52YWx1ZSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcIjtgXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIC8vb3ZlcndyaXRlIG9yIGNyZWF0ZSB0aGUgR00gdmFyaWFibGUgd2l0aCBuZXcganNvbkxpc3RcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHNhdmUgYnV0dG9uIHRvIGdyZWVuIG5vdyB0aGF0IGl0cyBzYXZlZCBhcy1pc1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIGEgc2F2ZWQgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZXhpc3RpbmcgZGF0YWxpc3QgZWxlbWVudHMgdG8gcmVidWlsZCB3aXRoIG5ldyBqc29ubGlzdFxuICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGluIHRoZSBqc29ubGlzdFxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBuZXcgb3B0aW9uIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBrZXkgbmFtZSB0byB0aGUgb3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVE9ETzogdGhpcyBtYXkgb3IgbWF5IG5vdCBiZSBuZWNlc3NhcnksIGJ1dCB3YXMgaGF2aW5nIGlzc3VlcyB3aXRoIHRoZSB1bmlxdWUgc3ltYm9sIHN0aWxsIHJhbmRvbWx5IHNob3dpbmcgdXAgYWZ0ZXIgc2F2ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0gY29tYm9Cb3hPcHRpb24udmFsdWUucmVwbGFjZSgv4LKgL2csICcgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY29tYm9Cb3hPcHRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICAvL2FkZCBldmVudCBmb3IgY2xlYXIgYnV0dG9uIHRvIHJlc2V0IHRoZSBkYXRhbGlzdFxuICAgICAgICBjbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NsZWFyIHRoZSBpbnB1dCBmaWVsZCBhbmQgdGV4dGFyZWEgZmllbGRcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBpbnB1dCBldmVudCBvbiBpbnB1dCB0byBmb3JjZSBzb21lIHVwZGF0ZXMgYW5kIGRpc3BhdGNoIGl0XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgY29tYm9Cb3hJbnB1dC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuXG4gICAgICAgIC8vTmV4dCB0d28gaW5wdXQgZnVuY3Rpb25zIGFyZSBtZWF0IGFuZCBwb3RhdG9lcyBvZiB0aGUgbG9naWMgZm9yIHVzZXIgZnVuY3Rpb25hbGl0eVxuXG4gICAgICAgIC8vd2hlbmV2ZXIgc29tZXRoaW5nIGlzIHR5cGVkIG9yIGNoYW5nZWQgd2hpdGhpbiB0aGUgaW5wdXQgZmllbGRcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2lucHV0JyxcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2lmIGlucHV0IGlzIGJsYW5rXG4gICAgICAgICAgICAgICAgaWYgKCFjb21ib0JveElucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIHRleHRhcmVhIGlzIGFsc28gYmxhbmsgbWluaW1pemUgcmVhbCBlc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFxdWlja1Nob3V0VGV4dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9oaWRlIHRoZSB0ZXh0IGFyZWFcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NocmluayB0aGUgZm9vdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91dEZvb3QhLnN0eWxlLmhlaWdodCA9ICcyLjVlbSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBzb21ldGhpbmcgaXMgc3RpbGwgaW4gdGhlIHRleHRhcmVhIHdlIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCB1bnNhdmVkIGFuZCB1bm5hbWVkIGRhdGEgaXMgdGhlcmVcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3R5bGUgZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWQgaXMgb3JnYW5nZSBzYXZlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vZWl0aGVyIHdheSwgaGlkZSB0aGUgZGVsZXRlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaGFzIGFueSB0ZXh0IGluIGl0XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsID0gY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKTtcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IHRoZSB0ZXh0IGFyZWEgZm9yIGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9leHBhbmQgdGhlIGZvb3RlciB0byBhY2NvbW9kYXRlIGFsbCBmZWF0dXJlIGFzcGVjdHNcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMTFlbSc7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgd2hhdCBpcyBpbiB0aGUgaW5wdXQgZmllbGQgaXMgYSBzYXZlZCBlbnRyeSBrZXlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25MaXN0W2lucHV0VmFsXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGNhbiBiZSBhIHN1Y2t5IGxpbmUgb2YgY29kZSBiZWNhdXNlIGl0IGNhbiB3aXBlIG91dCB1bnNhdmVkIGRhdGEsIGJ1dCBpIGNhbm5vdCB0aGluayBvZiBiZXR0ZXIgd2F5XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcGxhY2UgdGhlIHRleHQgYXJlYSBjb250ZW50cyB3aXRoIHdoYXQgdGhlIHZhbHVlIGlzIGluIHRoZSBtYXRjaGVkIHBhaXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0ganNvbkxpc3RbSlNPTi5wYXJzZShpbnB1dFZhbCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zaG93IHRoZSBkZWxldGUgYnV0dG9uIHNpbmNlIHRoaXMgaXMgbm93IGV4YWN0IG1hdGNoIHRvIHNhdmVkIGVudHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIHRvIHNob3cgaXRzIGEgc2F2ZWQgY29tYm9cbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBub3QgYSByZWdpc3RlcmVkIGtleSBuYW1lXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgdGhlIHNhdmUgYnV0dG9uIHRvIGJlIGFuIHVuc2F2ZWQgZW50cnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGNhbm5vdCBiZSBzYXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICAvL3doZW5ldmVyIHNvbWV0aGluZyBpcyB0eXBlZCBvciBkZWxldGVkIG91dCBvZiB0ZXh0YXJlYVxuICAgICAgICBxdWlja1Nob3V0VGV4dC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2lucHV0JyxcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XG5cbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBpbnB1dCBmaWVsZCBpcyBibGFua1xuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWRcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2lmIGlucHV0IGZpZWxkIGhhcyB0ZXh0IGluIGl0XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2lucHV0VmFsXSAmJlxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSAhPT0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIGFzIHllbGxvdyBmb3IgZWRpdHRlZFxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdZZWxsb3cnO1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUga2V5IGlzIGEgbWF0Y2ggYW5kIHRoZSBkYXRhIGlzIGEgbWF0Y2ggdGhlbiB3ZSBoYXZlIGEgMTAwJSBzYXZlZCBlbnRyeSBhbmQgY2FuIHB1dCBldmVyeXRoaW5nIGJhY2sgdG8gc2F2ZWRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBqc29uTGlzdFtpbnB1dFZhbF0gJiZcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPT09IGRlY29kZVVSSUNvbXBvbmVudChqc29uTGlzdFtpbnB1dFZhbF0pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiB0byBncmVlbiBmb3Igc2F2ZWRcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBub3QgZm91bmQgaW4gdGhlIHNhdmVkIGxpc3QsIG9yYW5nZSBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWpzb25MaXN0W2lucHV0VmFsXSkge1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG4gICAgICAgIC8vYWRkIHRoZSBjb21ib2JveCBhbmQgdGV4dCBhcmVhIGVsZW1lbnRzIHRvIHRoZSBmb290ZXJcbiAgICAgICAgc2hvdXRGb290LmFwcGVuZENoaWxkKGNvbWJvQm94RGl2KTtcbiAgICAgICAgc2hvdXRGb290LmFwcGVuZENoaWxkKHF1aWNrU2hvdXRUZXh0KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxuXG4vKipcbiAqICogQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuXG4gKi9cbmNsYXNzIFRvckdpZnREZWZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3RvckdpZnREZWZhdWx0JyxcbiAgICAgICAgdGFnOiAnRGVmYXVsdCBHaWZ0JyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gNTAwMCwgbWF4JyxcbiAgICAgICAgZGVzYzpcbiAgICAgICAgICAgICdBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy4gKDxlbT5PciB0aGUgbWF4IGFsbG93YWJsZSB2YWx1ZSwgd2hpY2hldmVyIGlzIGxvd2VyPC9lbT4pJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0aGFua3NBcmVhIGlucHV0W25hbWU9cG9pbnRzXSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBuZXcgU2hhcmVkKClcbiAgICAgICAgICAgIC5maWxsR2lmdEJveCh0aGlzLl90YXIsIHRoaXMuX3NldHRpbmdzLnRpdGxlKVxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXQgdGhlIGRlZmF1bHQgZ2lmdCBhbW91bnQgdG8gJHtwb2ludHN9YClcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBHb29kcmVhZHNcbiAqL1xuY2xhc3MgR29vZHJlYWRzQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnZ29vZHJlYWRzQnV0dG9uJyxcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzdWJtaXRJbmZvJztcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmVhdHVyZSBzaG91bGQgb25seSBydW4gb24gYm9vayBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xuICAgICAgICAgICAgICAgIGlmIChjYXQgJiYgQ2hlY2suaXNCb29rQ2F0KHBhcnNlSW50KGNhdC5jbGFzc05hbWUuc3Vic3RyaW5nKDMpKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vdCBhIGJvb2sgY2F0ZWdvcnk7IHNraXBwaW5nIEdvb2RyZWFkcyBidXR0b25zJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnKTtcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNTZXJpZXMgYScpO1xuICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xuICAgICAgICB0aGlzLl9zaGFyZS5nb29kcmVhZHNCdXR0b25zKGJvb2tEYXRhLCBhdXRob3JEYXRhLCBzZXJpZXNEYXRhLCB0YXJnZXQpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG4vKipcbiAqICogQWRkcyB2YXJpb3VzIGxpbmtzIHRvIEF1ZGlibGVcbiAqL1xuY2xhc3MgQXVkaWJsZUJ1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2F1ZGlibGVCdXR0b24nLFxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tQXVkaWJsZSBidXR0b25zJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzdWJtaXRJbmZvJztcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmVhdHVyZSBzaG91bGQgb25seSBydW4gb24gYm9vayBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xuICAgICAgICAgICAgICAgIGlmIChjYXQgJiYgQ2hlY2suaXNCb29rQ2F0KHBhcnNlSW50KGNhdC5jbGFzc05hbWUuc3Vic3RyaW5nKDMpKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vdCBhIGJvb2sgY2F0ZWdvcnk7IHNraXBwaW5nIEF1ZGlibGUgYnV0dG9ucycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJyk7XG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjU2VyaWVzIGEnKTtcblxuICAgICAgICBsZXQgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9zZ1JvdycpKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3NnUm93Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93JykpIHtcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcbiAgICAgICAgdGhpcy5fc2hhcmUuYXVkaWJsZUJ1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gU3RvcnlHcmFwaFxuICovXG5jbGFzcyBTdG9yeUdyYXBoQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnc3RvcnlHcmFwaEJ1dHRvbicsXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTS10by1TdG9yeUdyYXBoIGJ1dHRvbnMnLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBmZWF0dXJlIHNob3VsZCBvbmx5IHJ1biBvbiBib29rIGNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICBjb25zdCBjYXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8gW2NsYXNzXj1jYXRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgU3Ryb3lHcmFwaCBidXR0b25zJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnKTtcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8XG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNTZXJpZXMgYScpO1xuXG4gICAgICAgIGxldCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcblxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93JykpIHtcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcbiAgICAgICAgdGhpcy5fc2hhcmUuc3RvcnlHcmFwaEJ1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBHZW5lcmF0ZXMgYSBmaWVsZCBmb3IgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGJiY29kZVxuICovXG5jbGFzcyBDdXJyZW50bHlSZWFkaW5nIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXG4gICAgICAgIHRpdGxlOiAnY3VycmVudGx5UmVhZGluZycsXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gZ2VuZXJhdGUgYSBcIkN1cnJlbnRseSBSZWFkaW5nXCIgZm9ydW0gc25pcHBldGAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgQ3VycmVudGx5IFJlYWRpbmcgc2VjdGlvbi4uLicpO1xuICAgICAgICAvLyBHZXQgdGhlIHJlcXVpcmVkIGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IHRpdGxlOiBzdHJpbmcgPSBkb2N1bWVudCEucXVlcnlTZWxlY3RvcignI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZScpIVxuICAgICAgICAgICAgLnRleHRDb250ZW50ITtcbiAgICAgICAgY29uc3QgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHRvcklEOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsyXTtcbiAgICAgICAgY29uc3Qgcm93VGFyOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8nKTtcblxuICAgICAgICAvLyBUaXRsZSBjYW4ndCBiZSBudWxsXG4gICAgICAgIGlmICh0aXRsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaXRsZSBmaWVsZCB3YXMgbnVsbGApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgYSBuZXcgdGFibGUgcm93XG4gICAgICAgIGNvbnN0IGNyUm93OiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IFV0aWwuYWRkVG9yRGV0YWlsc1JvdyhcbiAgICAgICAgICAgIHJvd1RhcixcbiAgICAgICAgICAgICdDdXJyZW50bHkgUmVhZGluZycsXG4gICAgICAgICAgICAnbXBfY3JSb3cnXG4gICAgICAgICk7XG4gICAgICAgIC8vIFByb2Nlc3MgZGF0YSBpbnRvIHN0cmluZ1xuICAgICAgICBjb25zdCBibHVyYjogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2VuZXJhdGVTbmlwcGV0KHRvcklELCB0aXRsZSwgYXV0aG9ycyk7XG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxuICAgICAgICBjb25zdCBidG46IEhUTUxEaXZFbGVtZW50ID0gYXdhaXQgdGhpcy5fYnVpbGRCdXR0b24oY3JSb3csIGJsdXJiKTtcbiAgICAgICAgLy8gSW5pdCBidXR0b25cbiAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oYnRuLCBibHVyYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBCdWlsZCBhIEJCIENvZGUgdGV4dCBzbmlwcGV0IHVzaW5nIHRoZSBib29rIGluZm8sIHRoZW4gcmV0dXJuIGl0XG4gICAgICogQHBhcmFtIGlkIFRoZSBzdHJpbmcgSUQgb2YgdGhlIGJvb2tcbiAgICAgKiBAcGFyYW0gdGl0bGUgVGhlIHN0cmluZyB0aXRsZSBvZiB0aGUgYm9va1xuICAgICAqIEBwYXJhbSBhdXRob3JzIEEgbm9kZSBsaXN0IG9mIGF1dGhvciBsaW5rc1xuICAgICAqL1xuICAgIHByaXZhdGUgX2dlbmVyYXRlU25pcHBldChcbiAgICAgICAgaWQ6IHN0cmluZyxcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcbiAgICAgICAgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD5cbiAgICApOiBzdHJpbmcge1xuICAgICAgICAvKipcbiAgICAgICAgICogKiBBZGQgQXV0aG9yIExpbmtcbiAgICAgICAgICogQHBhcmFtIGF1dGhvckVsZW0gQSBsaW5rIGNvbnRhaW5pbmcgYXV0aG9yIGluZm9ybWF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBhZGRBdXRob3JMaW5rID0gKGF1dGhvckVsZW06IEhUTUxBbmNob3JFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYFt1cmw9JHthdXRob3JFbGVtLmhyZWYucmVwbGFjZSgnaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldCcsICcnKX1dJHtcbiAgICAgICAgICAgICAgICBhdXRob3JFbGVtLnRleHRDb250ZW50XG4gICAgICAgICAgICB9Wy91cmxdYDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb252ZXJ0IHRoZSBOb2RlTGlzdCBpbnRvIGFuIEFycmF5IHdoaWNoIGlzIGVhc2llciB0byB3b3JrIHdpdGhcbiAgICAgICAgbGV0IGF1dGhvckFycmF5OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBhdXRob3JzLmZvckVhY2goKGF1dGhvckVsZW0pID0+IGF1dGhvckFycmF5LnB1c2goYWRkQXV0aG9yTGluayhhdXRob3JFbGVtKSkpO1xuICAgICAgICAvLyBEcm9wIGV4dHJhIGl0ZW1zXG4gICAgICAgIGlmIChhdXRob3JBcnJheS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICBhdXRob3JBcnJheSA9IFsuLi5hdXRob3JBcnJheS5zbGljZSgwLCAzKSwgJ2V0Yy4nXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW3VybD0vdC8ke2lkfV0ke3RpdGxlfVsvdXJsXSBieSBbaV0ke2F1dGhvckFycmF5LmpvaW4oJywgJyl9Wy9pXWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKiBCdWlsZCBhIGJ1dHRvbiBvbiB0aGUgdG9yIGRldGFpbHMgcGFnZVxuICAgICAqIEBwYXJhbSB0YXIgQXJlYSB3aGVyZSB0aGUgYnV0dG9uIHdpbGwgYmUgYWRkZWQgaW50b1xuICAgICAqIEBwYXJhbSBjb250ZW50IENvbnRlbnQgdGhhdCB3aWxsIGJlIGFkZGVkIGludG8gdGhlIHRleHRhcmVhXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYnVpbGRCdXR0b24odGFyOiBIVE1MRGl2RWxlbWVudCwgY29udGVudDogc3RyaW5nKTogSFRNTERpdkVsZW1lbnQge1xuICAgICAgICAvLyBCdWlsZCB0ZXh0IGRpc3BsYXlcbiAgICAgICAgdGFyLmlubmVySFRNTCA9IGA8dGV4dGFyZWEgY2xhc3M9XCJtY2VOb0VkaXRvclwiIHJvd3M9XCIxXCIgY29scz1cIjgwXCIgc3R5bGU9J21hcmdpbi1yaWdodDo1cHgnPiR7Y29udGVudH08L3RleHRhcmVhPmA7XG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxuICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24odGFyLCAnbm9uZScsICdDb3B5JywgMik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9jclJvdyAubXBfYnV0dG9uX2Nsb25lJykhLmNsYXNzTGlzdC5hZGQoJ21wX3JlYWRpbmcnKTtcbiAgICAgICAgLy8gUmV0dXJuIGJ1dHRvblxuICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9yZWFkaW5nJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBQcm90ZWN0cyB0aGUgdXNlciBmcm9tIHJhdGlvIHRyb3VibGVzIGJ5IGFkZGluZyB3YXJuaW5ncyBhbmQgZGlzcGxheWluZyByYXRpbyBkZWx0YVxuICovXG5jbGFzcyBSYXRpb1Byb3RlY3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3QnLFxuICAgICAgICBkZXNjOiBgUHJvdGVjdCB5b3VyIHJhdGlvIHdpdGggd2FybmluZ3MgJmFtcDsgcmF0aW8gY2FsY3VsYXRpb25zYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNyYXRpbyc7XG4gICAgcHJpdmF0ZSBfcmNSb3c6IHN0cmluZyA9ICdtcF9yYXRpb0Nvc3RSb3cnO1xuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIHJhdGlvIHByb3RlY3Rpb24uLi4nKTtcbiAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIGJsb2NrIHRvIHNoYXJlZFxuICAgICAgICAvLyBUaGUgZG93bmxvYWQgdGV4dCBhcmVhXG4gICAgICAgIGNvbnN0IGRsQnRuOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGRkbCcpO1xuICAgICAgICAvLyBUaGUgY3VycmVudGx5IHVudXNlZCBsYWJlbCBhcmVhIGFib3ZlIHRoZSBkb3dubG9hZCB0ZXh0XG4gICAgICAgIGNvbnN0IGRsTGFiZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI2Rvd25sb2FkIC50b3JEZXRJbm5lclRvcCdcbiAgICAgICAgKTtcbiAgICAgICAgLy8gSW5zZXJ0aW9uIHRhcmdldCBmb3IgbWVzc2FnZXNcbiAgICAgICAgY29uc3QgZGVzY0Jsb2NrID0gYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy50b3JEZXRCb3R0b20nKTtcbiAgICAgICAgLy8gV291bGQgYmVjb21lIHJhdGlvXG4gICAgICAgIGNvbnN0IHJOZXc6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgLy8gQ3VycmVudCByYXRpb1xuICAgICAgICBjb25zdCByQ3VyOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpO1xuICAgICAgICAvLyBTZWVkaW5nIG9yIGRvd25sb2FkaW5nXG4gICAgICAgIGNvbnN0IHNlZWRpbmc6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjRExoaXN0b3J5Jyk7XG4gICAgICAgIC8vIFVzZXIgaGFzIGEgcmF0aW9cbiAgICAgICAgY29uc3QgdXNlckhhc1JhdGlvID0gckN1ci50ZXh0Q29udGVudC5pbmRleE9mKCdJbmYnKSA8IDAgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBjdXN0b20gcmF0aW8gYW1vdW50cyAod2lsbCByZXR1cm4gZGVmYXVsdCB2YWx1ZXMgb3RoZXJ3aXNlKVxuICAgICAgICBjb25zdCBbcjEsIHIyLCByM10gPSBhd2FpdCB0aGlzLl9zaGFyZS5nZXRSYXRpb1Byb3RlY3RMZXZlbHMoKTtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgUmF0aW8gcHJvdGVjdGlvbiBsZXZlbHMgc2V0IHRvOiAke3IxfSwgJHtyMn0sICR7cjN9YCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBib3ggd2Ugd2lsbCBkaXNwbGF5IHRleHQgaW5cbiAgICAgICAgaWYgKGRlc2NCbG9jaykge1xuICAgICAgICAgICAgLy8gQWRkIGxpbmUgdW5kZXIgVG9ycmVudDogZGV0YWlsIGZvciBDb3N0IGRhdGEgXCJDb3N0IHRvIFJlc3RvcmUgUmF0aW9cIlxuICAgICAgICAgICAgZGVzY0Jsb2NrLmluc2VydEFkamFjZW50SFRNTChcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCIgaWQ9XCJtcF9yb3dcIj48ZGl2IGNsYXNzPVwidG9yRGV0TGVmdFwiPkNvc3QgdG8gUmVzdG9yZSBSYXRpbzwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3RoaXMuX3JjUm93fVwiIHN0eWxlPVwiZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7XCI+PHNwYW4gaWQ9XCJtcF9mb29iYXJcIj48L3NwYW4+PC9kaXY+PC9kaXY+YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJy50b3JEZXRSb3cgaXMgJHtkZXNjQmxvY2t9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmx5IHJ1biB0aGUgY29kZSBpZiB0aGUgcmF0aW8gZXhpc3RzXG4gICAgICAgIGlmIChyTmV3ICYmIHJDdXIgJiYgIXNlZWRpbmcgJiYgdXNlckhhc1JhdGlvKSB7XG4gICAgICAgICAgICBjb25zdCByRGlmZiA9IFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdIC0gVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF07XG5cbiAgICAgICAgICAgIGlmIChNUC5ERUJVRylcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYEN1cnJlbnQgJHtVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXX0gfCBOZXcgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdXG4gICAgICAgICAgICAgICAgICAgIH0gfCBEaWYgJHtyRGlmZn1gXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gT25seSBhY3RpdmF0ZSBpZiBhIHJhdGlvIGNoYW5nZSBpcyBleHBlY3RlZFxuICAgICAgICAgICAgaWYgKCFpc05hTihyRGlmZikgJiYgckRpZmYgPiAwLjAwOSkge1xuICAgICAgICAgICAgICAgIGlmIChkbExhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuaW5uZXJIVE1MID0gYFJhdGlvIGxvc3MgJHtyRGlmZi50b0ZpeGVkKDIpfWA7XG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuc3R5bGUuZm9udFdlaWdodCA9ICdub3JtYWwnOyAvL1RvIGRpc3Rpbmd1aXNoIGZyb20gQk9MRCBUaXRsZXNcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgJiBEaXNwbGF5IGNvc3Qgb2YgZG93bmxvYWQgdy9vIEZMXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIHNob3cgY2FsY3VsYXRpb25zIHdoZW4gdGhlcmUgaXMgYSByYXRpbyBsb3NzXG4gICAgICAgICAgICAgICAgY29uc3Qgc2l6ZUVsZW06IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAnI3NpemUgc3BhbidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChzaXplRWxlbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaXplID0gc2l6ZUVsZW0udGV4dENvbnRlbnQhLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpemVNYXAgPSBbJ0J5dGVzJywgJ0tpQicsICdNaUInLCAnR2lCJywgJ1RpQiddO1xuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IGh1bWFuIHJlYWRhYmxlIHNpemUgdG8gYnl0ZXNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnl0ZVNpemVkID1cbiAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlcihzaXplWzBdKSAqIE1hdGgucG93KDEwMjQsIHNpemVNYXAuaW5kZXhPZihzaXplWzFdKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY292ZXJ5ID0gYnl0ZVNpemVkICogVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50QW1udCA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAoMTI1ICogcmVjb3ZlcnkpIC8gMjY4NDM1NDU2XG4gICAgICAgICAgICAgICAgICAgICkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF5QW1vdW50ID0gTWF0aC5mbG9vcigoNSAqIHJlY292ZXJ5KSAvIDIxNDc0ODM2NDgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3ZWRnZVN0b3JlQ29zdCA9IFV0aWwuZm9ybWF0Qnl0ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAoMjY4NDM1NDU2ICogNTAwMDApIC8gKFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdICogMTI1KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3ZWRnZVZhdWx0Q29zdCA9IFV0aWwuZm9ybWF0Qnl0ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAoMjY4NDM1NDU2ICogMjAwKSAvIChVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAqIDEyNSlcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJhdGlvIGNvc3Qgcm93XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7dGhpcy5fcmNSb3d9YFxuICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSBgPHNwYW4+PGI+JHtVdGlsLmZvcm1hdEJ5dGVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlcbiAgICAgICAgICAgICAgICAgICAgKX08L2I+Jm5ic3A7dXBsb2FkICgke3BvaW50QW1udH0gQlA7IG9yIG9uZSBGTCB3ZWRnZSBwZXIgZGF5IGZvciAke2RheUFtb3VudH0gZGF5cykuJm5ic3A7PGFiYnIgdGl0bGU9J0NvbnRyaWJ1dGluZyAyLDAwMCBCUCB0byBlYWNoIHZhdWx0IGN5Y2xlIGdpdmVzIHlvdSBhbG1vc3Qgb25lIEZMIHdlZGdlIHBlciBkYXkgb24gYXZlcmFnZS4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPldlZGdlIHN0b3JlIHByaWNlOiA8aT4ke3dlZGdlU3RvcmVDb3N0fTwvaT4mbmJzcDs8YWJiciB0aXRsZT0nSWYgeW91IGJ1eSB3ZWRnZXMgZnJvbSB0aGUgc3RvcmUsIHRoaXMgaXMgaG93IGxhcmdlIGEgdG9ycmVudCBtdXN0IGJlIHRvIGJyZWFrIGV2ZW4gb24gdGhlIGNvc3QgKDUwLDAwMCBCUCkgb2YgYSBzaW5nbGUgd2VkZ2UuJyBzdHlsZT0ndGV4dC1kZWNvcmF0aW9uOm5vbmU7Y3Vyc29yOmhlbHA7Jz4mIzEyODcxMjs8L2FiYnI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5XZWRnZSB2YXVsdCBwcmljZTogPGk+JHt3ZWRnZVZhdWx0Q29zdH08L2k+Jm5ic3A7PGFiYnIgdGl0bGU9J0lmIHlvdSBjb250cmlidXRlIHRvIHRoZSB2YXVsdCwgdGhpcyBpcyBob3cgbGFyZ2UgYSB0b3JyZW50IG11c3QgYmUgdG8gYnJlYWsgZXZlbiBvbiB0aGUgY29zdCAoMjAwIEJQKSBvZiAxMCB3ZWRnZXMgZm9yIHRoZSBtYXhpbXVtIGNvbnRyaWJ1dGlvbiBvZiAyLDAwMCBCUC4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+YDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTdHlsZSB0aGUgZG93bmxvYWQgYnV0dG9uIGJhc2VkIG9uIFJhdGlvIFByb3RlY3QgbGV2ZWwgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBpZiAoZGxCdG4gJiYgZGxMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyAqIFRoaXMgaXMgdGhlIFwidHJpdmlhbCByYXRpbyBsb3NzXCIgdGhyZXNob2xkXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIGNoYW5nZXMgd2lsbCBhbHdheXMgaGFwcGVuIGlmIHRoZSByYXRpbyBjb25kaXRpb25zIGFyZSBtZXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJEaWZmID4gcjEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEJ1dHRvblN0YXRlKGRsQnRuLCAnMV9ub3RpZnknKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vICogVGhpcyBpcyB0aGUgXCJJIG5ldmVyIHdhbnQgdG8gZGwgdy9vIEZMXCIgdGhyZXNob2xkXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxzbyB1c2VzIHRoZSBNaW5pbXVtIFJhdGlvLCBpZiBlbmFibGVkXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxzbyBwcmV2ZW50cyBnb2luZyBiZWxvdyAyIHJhdGlvIChQVSByZXF1aXJlbWVudClcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVwbGFjZSBkaXNhYmxlIGJ1dHRvbiB3aXRoIGJ1eSBGTCBidXR0b25cblxuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICByRGlmZiA+IHIzIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RNaW5fdmFsJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgMlxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEJ1dHRvblN0YXRlKGRsQnRuLCAnM19hbGVydCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gKiBUaGlzIGlzIHRoZSBcIkkgbmVlZCB0byB0aGluayBhYm91dCB1c2luZyBhIEZMXCIgdGhyZXNob2xkXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAockRpZmYgPiByMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0QnV0dG9uU3RhdGUoZGxCdG4sICcyX3dhcm4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHRoZSB1c2VyIGRvZXMgbm90IGhhdmUgYSByYXRpbywgZGlzcGxheSBhIHNob3J0IG1lc3NhZ2VcbiAgICAgICAgfSBlbHNlIGlmICghdXNlckhhc1JhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRCdXR0b25TdGF0ZShkbEJ0biwgJzFfbm90aWZ5Jyk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgIGAuJHt0aGlzLl9yY1Jvd31gXG4gICAgICAgICAgICApIS5pbm5lckhUTUwgPSBgPHNwYW4+UmF0aW8gcG9pbnRzIGFuZCBjb3N0IHRvIHJlc3RvcmUgcmF0aW8gd2lsbCBhcHBlYXIgaGVyZSBhZnRlciB5b3VyIHJhdGlvIGlzIGEgcmVhbCBudW1iZXIuPC9zcGFuPmA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRCdXR0b25TdGF0ZShcbiAgICAgICAgdGFyOiBIVE1MQW5jaG9yRWxlbWVudCxcbiAgICAgICAgc3RhdGU6ICcxX25vdGlmeScgfCAnMl93YXJuJyB8ICczX2FsZXJ0JyxcbiAgICAgICAgbGFiZWw/OiBIVE1MRGl2RWxlbWVudFxuICAgICkge1xuICAgICAgICBpZiAoc3RhdGUgPT09ICcxX25vdGlmeScpIHtcbiAgICAgICAgICAgIHRhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnU3ByaW5nR3JlZW4nO1xuICAgICAgICAgICAgdGFyLnN0eWxlLmNvbG9yID0gJ2JsYWNrJztcbiAgICAgICAgICAgIHRhci5pbm5lckhUTUwgPSAnRG93bmxvYWQ/JztcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJzJfd2FybicpIHtcbiAgICAgICAgICAgIHRhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcbiAgICAgICAgICAgIHRhci5pbm5lckhUTUwgPSAnU3VnZ2VzdCBGTCc7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICczX2FsZXJ0Jykge1xuICAgICAgICAgICAgaWYgKCFsYWJlbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm8gbGFiZWwgcHJvdmlkZWQgaW4gX3NldEJ1dHRvblN0YXRlKCkhYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1JlZCc7XG4gICAgICAgICAgICB0YXIuc3R5bGUuY3Vyc29yID0gJ25vLWRyb3AnO1xuICAgICAgICAgICAgdGFyLmlubmVySFRNTCA9ICdGTCBOZWVkZWQnO1xuICAgICAgICAgICAgbGFiZWwuc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3RhdGUgXCIke3N0YXRlfVwiIGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBMb3cgcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcbiAqL1xuY2xhc3MgUmF0aW9Qcm90ZWN0TDEgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDEnLFxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwxJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjUnLFxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBzbWFsbGVzdCB0aHJlc2hob2xkIHRvIGluZGljYXRlIHJhdGlvIGNoYW5nZXMuICg8ZW0+VGhpcyBpcyBhIHNsaWdodCBjb2xvciBjaGFuZ2U8L2VtPikuYCxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIEwxIScpO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbi8qKlxuICogKiBNZWRpdW0gcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcbiAqL1xuY2xhc3MgUmF0aW9Qcm90ZWN0TDIgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDInLFxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwyJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAxJyxcbiAgICAgICAgZGVzYzogYFNldCB0aGUgbWVkaWFuIHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBub3RpY2VhYmxlIGNvbG9yIGNoYW5nZTwvZW0+KS5gLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gTDIhJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAqIEhpZ2ggcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcbiAqL1xuY2xhc3MgUmF0aW9Qcm90ZWN0TDMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDMnLFxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwzJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAyJyxcbiAgICAgICAgZGVzYzogYFNldCB0aGUgaGlnaGVzdCB0aHJlc2hob2xkIHRvIHByZXZlbnQgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGRpc2FibGVzIGRvd25sb2FkIHdpdGhvdXQgRkwgdXNlPC9lbT4pLmAsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxlZCBjdXN0b20gUmF0aW8gUHJvdGVjdGlvbiBMMyEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG5jbGFzcyBSYXRpb1Byb3RlY3RNaW4gaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RNaW4nLFxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcbiAgICAgICAgdGFnOiAnTWluaW11bSBSYXRpbycsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMCcsXG4gICAgICAgIGRlc2M6ICdUcmlnZ2VyIFJhdGlvIFdhcm4gTDMgaWYgeW91ciByYXRpbyB3b3VsZCBkcm9wIGJlbG93IHRoaXMgbnVtYmVyLicsXG4gICAgfTtcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIG1pbmltdW0hJyk7XG4gICAgfVxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIFJhdGlvUHJvdGVjdEljb25zIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RJY29ucycsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxuICAgICAgICBkZXNjOiAnRW5hYmxlIGN1c3RvbSBicm93c2VyIGZhdmljb25zIGJhc2VkIG9uIFJhdGlvIFByb3RlY3QgY29uZGl0aW9ucz8nLFxuICAgIH07XG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNyYXRpbyc7XG4gICAgcHJpdmF0ZSBfdXNlcklEOiBudW1iZXIgPSAxNjQxMDk7XG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBgW00rXSBFbmFibGluZyBjdXN0b20gUmF0aW8gUHJvdGVjdCBmYXZpY29ucyBmcm9tIHVzZXIgJHt0aGlzLl91c2VySUR9Li4uYFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEdldCB0aGUgY3VzdG9tIHJhdGlvIGFtb3VudHMgKHdpbGwgcmV0dXJuIGRlZmF1bHQgdmFsdWVzIG90aGVyd2lzZSlcbiAgICAgICAgY29uc3QgW3IxLCByMiwgcjNdID0gYXdhaXQgdGhpcy5fc2hhcmUuZ2V0UmF0aW9Qcm90ZWN0TGV2ZWxzKCk7XG4gICAgICAgIC8vIFdvdWxkIGJlY29tZSByYXRpb1xuICAgICAgICBjb25zdCByTmV3OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XG4gICAgICAgIC8vIEN1cnJlbnQgcmF0aW9cbiAgICAgICAgY29uc3QgckN1cjogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVInKTtcbiAgICAgICAgLy8gRGlmZmVyZW5jZSBiZXR3ZWVuIG5ldyBhbmQgb2xkIHJhdGlvXG4gICAgICAgIGNvbnN0IHJEaWZmID0gVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gLSBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXTtcbiAgICAgICAgLy8gU2VlZGluZyBvciBkb3dubG9hZGluZ1xuICAgICAgICBjb25zdCBzZWVkaW5nOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0RMaGlzdG9yeScpO1xuICAgICAgICAvLyBWSVAgc3RhdHVzXG4gICAgICAgIGNvbnN0IHZpcHN0YXQ6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgJyNyYXRpbyAudG9yRGV0SW5uZXJCb3R0b21TcGFuJ1xuICAgICAgICApXG4gICAgICAgICAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyYXRpbyAudG9yRGV0SW5uZXJCb3R0b21TcGFuJykudGV4dENvbnRlbnRcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgLy8gQm9va2NsdWIgc3RhdHVzXG4gICAgICAgIGNvbnN0IGJvb2tjbHViOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgIFwiZGl2W2lkPSdiY2ZsJ10gc3BhblwiXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gRmluZCBmYXZpY29uIGxpbmtzIGFuZCBsb2FkIGEgc2ltcGxlIGRlZmF1bHQuXG4gICAgICAgIGNvbnN0IHNpdGVGYXZpY29ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rW3JlbCQ9J2ljb24nXVwiKSBhcyBOb2RlTGlzdE9mPFxuICAgICAgICAgICAgSFRNTExpbmtFbGVtZW50XG4gICAgICAgID47XG4gICAgICAgIGlmIChzaXRlRmF2aWNvbnMpIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ3RtXzMyeDMyJyk7XG5cbiAgICAgICAgLy8gVGVzdCBpZiBWSVBcbiAgICAgICAgaWYgKHZpcHN0YXQpIHtcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFZJUCA9ICR7dmlwc3RhdH1gKTtcblxuICAgICAgICAgICAgaWYgKHZpcHN0YXQuc2VhcmNoKCdWSVAgZXhwaXJlcycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdtb3VzZWNsb2NrJyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAnIHwgTXkgQW5vbmFtb3VzZScsXG4gICAgICAgICAgICAgICAgICAgIGAgfCBFeHBpcmVzICR7dmlwc3RhdC5zdWJzdHJpbmcoMjYpfWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2aXBzdGF0LnNlYXJjaCgnVklQIG5vdCBzZXQgdG8gZXhwaXJlJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzBjaXInKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcbiAgICAgICAgICAgICAgICAgICAgJyB8IE5vdCBzZXQgdG8gZXhwaXJlJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdUaGlzIHRvcnJlbnQgaXMgZnJlZWxlZWNoIScpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdtb3VzZWNsb2NrJyk7XG4gICAgICAgICAgICAgICAgLy8gVGVzdCBpZiBib29rY2x1YlxuICAgICAgICAgICAgICAgIGlmIChib29rY2x1YiAmJiBib29rY2x1Yi50ZXh0Q29udGVudC5zZWFyY2goJ0Jvb2tjbHViIEZyZWVsZWVjaCcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYCB8IENsdWIgZXhwaXJlcyAke2Jvb2tjbHViLnRleHRDb250ZW50LnN1YnN0cmluZygyNSl9YFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIHwgJ3RpbGwgbmV4dCBTaXRlIEZMXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSB3aGVuIEZMIGVuZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGAgfCAndGlsbCAke3RoaXMuX25leHRGTERhdGUoKX1gXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBzZWVkaW5nL2Rvd25sb2FkaW5nXG4gICAgICAgIGlmIChzZWVkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICcxM2VnZycpO1xuICAgICAgICAgICAgLy8gKiBTaW1pbGFyIGljb25zOiAxM3NlZWQ4LCAxM3NlZWQ3LCAxM2VnZywgMTMsIDEzY2lyLCAxM1doaXRlQ2lyXG4gICAgICAgIH0gZWxzZSBpZiAodmlwc3RhdC5zZWFyY2goJ1RoaXMgdG9ycmVudCBpcyBwZXJzb25hbCBmcmVlbGVlY2gnKSA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICc1Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIHRoZXJlIHdpbGwgYmUgcmF0aW8gbG9zc1xuICAgICAgICBpZiAock5ldyAmJiByQ3VyICYmICFzZWVkaW5nKSB7XG4gICAgICAgICAgICAvLyBDaGFuZ2UgaWNvbiBiYXNlZCBvbiBSYXRpbyBQcm90ZWN0IHN0YXRlc1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHJEaWZmID4gcjMgfHxcbiAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RNaW5fdmFsJykgfHxcbiAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IDJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzEyJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICczUW1vdXNlJyk7XG4gICAgICAgICAgICAgICAgLy8gQWxzbyB0cnkgT3JhbmdlLCBPcmFuZ2VSZWQsIEdvbGQsIG9yIDE0XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdTcHJpbmdHcmVlbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBmdXR1cmUgVklQXG4gICAgICAgICAgICBpZiAodmlwc3RhdC5zZWFyY2goJ09uIGxpc3QgZm9yIG5leHQgRkwgcGljaycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdNaXJyb3JHcmVlbkNsb2NrJyk7IC8vIEFsc28gdHJ5IGdyZWVuY2xvY2tcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcbiAgICAgICAgICAgICAgICAgICAgJyB8IE5leHQgRkwgcGljaydcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ3VzdG9tIFJhdGlvIFByb3RlY3QgZmF2aWNvbnMgZW5hYmxlZCEnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBGdW5jdGlvbiBmb3IgY2FsY3VsYXRpbmcgd2hlbiBGTCBlbmRzXG4gICAgLy8gPyBIb3cgYXJlIHdlIGFibGUgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIGN1cnJlbnQgRkwgcGVyaW9kIHN0YXJ0ZWQ/XG4gICAgLyogcHJpdmF0ZSBhc3luYyBfbmV4dEZMRGF0ZSgpIHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCdKdW4gMTQsIDIwMjIgMDA6MDA6MDAgVVRDJyk7IC8vIHNlZWQgZGF0ZSBvdmVyIHR3byB3ZWVrcyBhZ29cbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTsgLy9QbGFjZSB0ZXN0IGRhdGVzIGhlcmUgbGlrZSBEYXRlKFwiSnVsIDE0LCAyMDIyIDAwOjAwOjAwIFVUQ1wiKVxuICAgICAgICBsZXQgbXNzaW5jZSA9IG5vdy5nZXRUaW1lKCkgLSBkLmdldFRpbWUoKTsgLy90aW1lIHNpbmNlIEZMIHN0YXJ0IHNlZWQgZGF0ZVxuICAgICAgICBsZXQgZGF5c3NpbmNlID0gbXNzaW5jZSAvIDg2NDAwMDAwO1xuICAgICAgICBsZXQgcSA9IE1hdGguZmxvb3IoZGF5c3NpbmNlIC8gMTQpOyAvLyBGTCBwZXJpb2RzIHNpbmNlIHNlZWQgZGF0ZVxuXG4gICAgICAgIGNvbnN0IGFkZERheXMgPSAoZGF0ZSwgZGF5cykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IG5ldyBEYXRlKGRhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQuc2V0RGF0ZShjdXJyZW50LmdldERhdGUoKSArIGRheXMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBkXG4gICAgICAgICAgICAuYWRkRGF5cyhxICogMTQgKyAxNClcbiAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAuc3Vic3RyKDAsIDEwKTtcbiAgICB9ICovXG5cbiAgICBwcml2YXRlIGFzeW5jIF9idWlsZEljb25MaW5rcyhlbGVtczogTm9kZUxpc3RPZjxIVE1MTGlua0VsZW1lbnQ+LCBmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGVsZW1zLmZvckVhY2goKGVsZW0pID0+IHtcbiAgICAgICAgICAgIGVsZW0uaHJlZiA9IGBodHRwczovL2Nkbi5teWFub25hbW91c2UubmV0L2ltYWdlYnVja2V0LyR7dGhpcy5fdXNlcklEfS8ke2ZpbGVuYW1lfS5wbmdgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cblxuICAgIHNldCB1c2VySUQobmV3SUQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLl91c2VySUQgPSBuZXdJRDtcbiAgICB9XG59XG5cbi8vIFRPRE86IEFkZCBmZWF0dXJlIHRvIHNldCBSYXRpb1Byb3RlY3RJY29uJ3MgYF91c2VySURgIHZhbHVlLiBPbmx5IG5lY2Vzc2FyeSBvbmNlIG90aGVyIGljb24gc2V0cyBleGlzdC5cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cblxuLyoqXG4gKiAjVVBMT0FEIFBBR0UgRkVBVFVSRVNcbiAqL1xuXG4vKipcbiAqIEFsbG93cyBlYXNpZXIgY2hlY2tpbmcgZm9yIGR1cGxpY2F0ZSB1cGxvYWRzXG4gKi9cblxuY2xhc3MgU2VhcmNoRm9yRHVwbGljYXRlcyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAnc2VhcmNoRm9yRHVwbGljYXRlcycsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VwbG9hZCBQYWdlJ10sXG4gICAgICAgIGRlc2M6ICdFYXNpZXIgc2VhcmNoaW5nIGZvciBkdXBsaWNhdGVzIHdoZW4gdXBsb2FkaW5nIGNvbnRlbnQnLFxuICAgIH07XG5cbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdXBsb2FkRm9ybSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3VwbG9hZCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xuXG4gICAgICAgIGlmIChwYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gdGl0bGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICd0aXRsZScsXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0W25hbWU9XCJ0b3JbdGl0bGVdXCJdJyxcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogNyxcbiAgICAgICAgICAgICAgICB1c2VXaWxkY2FyZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gYXV0aG9yKHMpJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXV0aG9yJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfYXV0aG9yJyxcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTAsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIHNlcmllcycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlcmllcycsXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX3NlcmllcycsXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDExLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBuYXJyYXRvcihzKScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ25hcnJhdG9yJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfbmFycmF0b3InLFxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBzZWFyY2ggdG8gdXBsb2FkcyFgKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTZWFyY2goe1xuICAgICAgICBwYXJlbnRFbGVtZW50LFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgaW5wdXRTZWxlY3RvcixcbiAgICAgICAgcm93UG9zaXRpb24sXG4gICAgICAgIHVzZVdpbGRjYXJkID0gZmFsc2UsXG4gICAgfToge1xuICAgICAgICBwYXJlbnRFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICAgICAgdGl0bGU6IHN0cmluZztcbiAgICAgICAgdHlwZTogc3RyaW5nO1xuICAgICAgICBpbnB1dFNlbGVjdG9yOiBzdHJpbmc7XG4gICAgICAgIHJvd1Bvc2l0aW9uOiBudW1iZXI7XG4gICAgICAgIHVzZVdpbGRjYXJkPzogYm9vbGVhbjtcbiAgICB9KSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaEVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBVdGlsLnNldEF0dHIoc2VhcmNoRWxlbWVudCwge1xuICAgICAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJyxcbiAgICAgICAgICAgIHN0eWxlOiAndGV4dC1kZWNvcmF0aW9uOiBub25lOyBjdXJzb3I6IHBvaW50ZXI7JyxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICB9KTtcbiAgICAgICAgc2VhcmNoRWxlbWVudC50ZXh0Q29udGVudCA9ICcg8J+UjSc7XG5cbiAgICAgICAgY29uc3QgbGlua0Jhc2UgPSBgL3Rvci9icm93c2UucGhwP3RvciU1QnNlYXJjaFR5cGUlNUQ9YWxsJnRvciU1QnNlYXJjaEluJTVEPXRvcnJlbnRzJnRvciU1QmNhdCU1RCU1QiU1RD0wJnRvciU1QmJyb3dzZUZsYWdzSGlkZVZzU2hvdyU1RD0wJnRvciU1QnNvcnRUeXBlJTVEPWRhdGVEZXNjJnRvciU1QnNyY2hJbiU1RCU1QiR7dHlwZX0lNUQ9dHJ1ZSZ0b3IlNUJ0ZXh0JTVEPWA7XG5cbiAgICAgICAgcGFyZW50RWxlbWVudFxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgYCN1cGxvYWRGb3JtID4gdGJvZHkgPiB0cjpudGgtY2hpbGQoJHtyb3dQb3NpdGlvbn0pID4gdGQ6bnRoLWNoaWxkKDEpYFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgPy5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIHNlYXJjaEVsZW1lbnQpO1xuXG4gICAgICAgIHNlYXJjaEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0czogTm9kZUxpc3RPZjxcbiAgICAgICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50XG4gICAgICAgICAgICA+IHwgbnVsbCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChpbnB1dFNlbGVjdG9yKTtcblxuICAgICAgICAgICAgaWYgKGlucHV0cyAmJiBpbnB1dHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRzTGlzdDogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgICAgIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0xpc3QucHVzaChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gaW5wdXRzTGlzdC5qb2luKCcgJykudHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaFN0cmluZyA9IHVzZVdpbGRjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAqJHtlbmNvZGVVUklDb21wb25lbnQoaW5wdXRzTGlzdC5qb2luKCcgJykpfSpgXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVuY29kZVVSSUNvbXBvbmVudChpbnB1dHNMaXN0LmpvaW4oJyAnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBsaW5rQmFzZSArIHNlYXJjaFN0cmluZyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cblxuLyoqXG4gKiAjIFVTRVIgUEFHRSBGRUFUVVJFU1xuICovXG5cbi8qKlxuICogIyMjIyBEZWZhdWx0IFVzZXIgR2lmdCBBbW91bnRcbiAqL1xuY2xhc3MgVXNlckdpZnREZWZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdERlZmF1bHQnLFxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMDAwLCBtYXgnLFxuICAgICAgICBkZXNjOlxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2JvbnVzZ2lmdCc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBuZXcgU2hhcmVkKClcbiAgICAgICAgICAgIC5maWxsR2lmdEJveCh0aGlzLl90YXIsIHRoaXMuX3NldHRpbmdzLnRpdGxlKVxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXQgdGhlIGRlZmF1bHQgZ2lmdCBhbW91bnQgdG8gJHtwb2ludHN9YClcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cblxuLyoqXG4gKiAjIyMjIFVzZXIgR2lmdCBIaXN0b3J5XG4gKi9cbmNsYXNzIFVzZXJHaWZ0SGlzdG9yeSBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgIHRpdGxlOiAndXNlckdpZnRIaXN0b3J5JyxcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXNlciBQYWdlcyddLFxuICAgICAgICBkZXNjOiAnRGlzcGxheSBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB5b3UgYW5kIGFub3RoZXIgdXNlcicsXG4gICAgfTtcbiAgICBwcml2YXRlIF9zZW5kU3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjpvcmFuZ2UnIHRpdGxlPSdzZW50Jz5cXHUyN0YwPC9zcGFuPmA7XG4gICAgcHJpdmF0ZSBfZ2V0U3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjp0ZWFsJyB0aXRsZT0ncmVjZWl2ZWQnPlxcdTI3RjE8L3NwYW4+YDtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICd0Ym9keSc7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluaXRpYWxsaXppbmcgdXNlciBnaWZ0IGhpc3RvcnkuLi4nKTtcblxuICAgICAgICAvLyBOYW1lIG9mIHRoZSBvdGhlciB1c2VyXG4gICAgICAgIGNvbnN0IG90aGVyVXNlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSA+IGgxJykhLnRleHRDb250ZW50IS50cmltKCk7XG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IHJvd1xuICAgICAgICBjb25zdCBoaXN0b3J5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICAgICAgY29uc3QgaW5zZXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IHRib2R5IHRyOmxhc3Qtb2YtdHlwZScpO1xuICAgICAgICBpZiAoaW5zZXJ0KSBpbnNlcnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIGhpc3RvcnlDb250YWluZXIpO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSB0aXRsZSBmaWVsZFxuICAgICAgICBjb25zdCBoaXN0b3J5VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBoaXN0b3J5VGl0bGUuY2xhc3NMaXN0LmFkZCgncm93aGVhZCcpO1xuICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnR2lmdCBoaXN0b3J5JztcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5VGl0bGUpO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSBjb250ZW50IGZpZWxkXG4gICAgICAgIGNvbnN0IGhpc3RvcnlCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBoaXN0b3J5Qm94LmNsYXNzTGlzdC5hZGQoJ3JvdzEnKTtcbiAgICAgICAgaGlzdG9yeUJveC50ZXh0Q29udGVudCA9IGBZb3UgaGF2ZSBub3QgZXhjaGFuZ2VkIGdpZnRzIHdpdGggJHtvdGhlclVzZXJ9LmA7XG4gICAgICAgIGhpc3RvcnlCb3guYWxpZ24gPSAnbGVmdCc7XG4gICAgICAgIGhpc3RvcnlDb250YWluZXIuYXBwZW5kQ2hpbGQoaGlzdG9yeUJveCk7XG4gICAgICAgIC8vIEdldCB0aGUgVXNlciBJRFxuICAgICAgICBjb25zdCB1c2VySUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5wb3AoKTtcblxuICAgICAgICBjb25zdCBjdXJyZW50VXNlcklEID0gVXRpbC5nZXRDdXJyZW50VXNlcklEKCk7XG5cbiAgICAgICAgLy8gVE9ETzogdXNlIGBjZG4uYCBpbnN0ZWFkIG9mIGB3d3cuYDsgY3VycmVudGx5IGNhdXNlcyBhIDQwMyBlcnJvclxuICAgICAgICBpZiAodXNlcklEKSB7XG4gICAgICAgICAgICBpZiAodXNlcklEID09PSBjdXJyZW50VXNlcklEKSB7XG4gICAgICAgICAgICAgICAgaGlzdG9yeVRpdGxlLnRleHRDb250ZW50ID0gJ1JlY2VudCBHaWZ0IEhpc3RvcnknO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9oaXN0b3J5V2l0aEFsbChoaXN0b3J5Qm94KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oaXN0b3J5V2l0aFVzZXJJRCh1c2VySUQsIGhpc3RvcnlCb3gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVc2VyIElEIG5vdCBmb3VuZDogJHt1c2VySUR9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIEZpbGwgb3V0IGhpc3RvcnkgYm94XG4gICAgICogQHBhcmFtIHVzZXJJRCB0aGUgdXNlciB0byBnZXQgaGlzdG9yeSBmcm9tXG4gICAgICogQHBhcmFtIGhpc3RvcnlCb3ggdGhlIGJveCB0byBwdXQgaXQgaW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIF9oaXN0b3J5V2l0aFVzZXJJRCh1c2VySUQ6IHN0cmluZywgaGlzdG9yeUJveDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBnaWZ0IGhpc3RvcnlcbiAgICAgICAgY29uc3QgZ2lmdEhpc3RvcnkgPSBhd2FpdCBVdGlsLmdldFVzZXJHaWZ0SGlzdG9yeSh1c2VySUQpO1xuICAgICAgICAvLyBPbmx5IGRpc3BsYXkgYSBsaXN0IGlmIHRoZXJlIGlzIGEgaGlzdG9yeVxuICAgICAgICBpZiAoZ2lmdEhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgUG9pbnQgJiBGTCB0b3RhbCB2YWx1ZXNcbiAgICAgICAgICAgIGNvbnN0IFtwb2ludHNJbiwgcG9pbnRzT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFBvaW50cycpO1xuICAgICAgICAgICAgY29uc3QgW3dlZGdlSW4sIHdlZGdlT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFdlZGdlJyk7XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUG9pbnRzIEluL091dDogJHtwb2ludHNJbn0vJHtwb2ludHNPdXR9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFdlZGdlcyBJbi9PdXQ6ICR7d2VkZ2VJbn0vJHt3ZWRnZU91dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG90aGVyVXNlciA9IGdpZnRIaXN0b3J5WzBdLm90aGVyX25hbWU7XG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGhpc3RvcnlCb3guaW5uZXJIVE1MID0gYFlvdSBoYXZlIHNlbnQgJHt0aGlzLl9zZW5kU3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzT3V0fSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlT3V0fSBGTCB3ZWRnZXM8L3N0cm9uZz4gdG8gJHtvdGhlclVzZXJ9IGFuZCByZWNlaXZlZCAke3RoaXMuX2dldFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c0lufSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlSW59IEZMIHdlZGdlczwvc3Ryb25nPi48aHI+YDtcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbWVzc2FnZSB0byB0aGUgYm94XG4gICAgICAgICAgICBoaXN0b3J5Qm94LmFwcGVuZENoaWxkKHRoaXMuX3Nob3dHaWZ0cyhnaWZ0SGlzdG9yeSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gVXNlciBnaWZ0IGhpc3RvcnkgYWRkZWQhJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBObyB1c2VyIGdpZnQgaGlzdG9yeSBmb3VuZCB3aXRoICR7dXNlcklEfS5gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICMjIyMgRmlsbCBvdXQgaGlzdG9yeSBib3hcbiAgICAgKiBAcGFyYW0gaGlzdG9yeUJveCB0aGUgYm94IHRvIHB1dCBpdCBpblxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2hpc3RvcnlXaXRoQWxsKGhpc3RvcnlCb3g6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIC8vIEdldCB0aGUgZ2lmdCBoaXN0b3J5XG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5ID0gYXdhaXQgVXRpbC5nZXRBbGxVc2VyR2lmdEhpc3RvcnkoKTtcbiAgICAgICAgLy8gT25seSBkaXNwbGF5IGEgbGlzdCBpZiB0aGVyZSBpcyBhIGhpc3RvcnlcbiAgICAgICAgaWYgKGdpZnRIaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIFBvaW50ICYgRkwgdG90YWwgdmFsdWVzXG4gICAgICAgICAgICBjb25zdCBbcG9pbnRzSW4sIHBvaW50c091dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRQb2ludHMnKTtcbiAgICAgICAgICAgIGNvbnN0IFt3ZWRnZUluLCB3ZWRnZU91dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRXZWRnZScpO1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBvaW50cyBJbi9PdXQ6ICR7cG9pbnRzSW59LyR7cG9pbnRzT3V0fWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBXZWRnZXMgSW4vT3V0OiAke3dlZGdlSW59LyR7d2VkZ2VPdXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGhpc3RvcnlCb3guaW5uZXJIVE1MID0gYFlvdSBoYXZlIHNlbnQgJHt0aGlzLl9zZW5kU3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzT3V0fSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlT3V0fSBGTCB3ZWRnZXM8L3N0cm9uZz4gYW5kIHJlY2VpdmVkICR7dGhpcy5fZ2V0U3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzSW59IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VJbn0gRkwgd2VkZ2VzPC9zdHJvbmc+Ljxocj5gO1xuICAgICAgICAgICAgLy8gQWRkIHRoZSBtZXNzYWdlIHRvIHRoZSBib3hcbiAgICAgICAgICAgIGhpc3RvcnlCb3guYXBwZW5kQ2hpbGQodGhpcy5fc2hvd0dpZnRzKGdpZnRIaXN0b3J5KSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBVc2VyIGdpZnQgaGlzdG9yeSBhZGRlZCEnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE5vIHVzZXIgZ2lmdCBoaXN0b3J5IGZvdW5kIGZvciBjdXJyZW50IHVzZXIuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIFN1bSB0aGUgdmFsdWVzIG9mIGEgZ2l2ZW4gZ2lmdCB0eXBlIGFzIEluZmxvdyAmIE91dGZsb3cgc3Vtc1xuICAgICAqIEBwYXJhbSBoaXN0b3J5IHRoZSB1c2VyIGdpZnQgaGlzdG9yeVxuICAgICAqIEBwYXJhbSB0eXBlIHBvaW50cyBvciB3ZWRnZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zdW1HaWZ0cyhcbiAgICAgICAgaGlzdG9yeTogVXNlckdpZnRIaXN0b3J5W10sXG4gICAgICAgIHR5cGU6ICdnaWZ0UG9pbnRzJyB8ICdnaWZ0V2VkZ2UnXG4gICAgKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgICAgIGNvbnN0IG91dGZsb3cgPSBbMF07XG4gICAgICAgIGNvbnN0IGluZmxvdyA9IFswXTtcbiAgICAgICAgLy8gT25seSByZXRyaWV2ZSBhbW91bnRzIG9mIGEgc3BlY2lmaWVkIGdpZnQgdHlwZVxuICAgICAgICBoaXN0b3J5Lm1hcCgoZ2lmdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGdpZnQudHlwZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIFNwbGl0IGludG8gSW5mbG93L091dGZsb3dcbiAgICAgICAgICAgICAgICBpZiAoZ2lmdC5hbW91bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdXRmbG93LnB1c2goZ2lmdC5hbW91bnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFN1bSBhbGwgaXRlbXMgaW4gdGhlIGZpbHRlcmVkIGFycmF5XG4gICAgICAgIGNvbnN0IHN1bU91dCA9IG91dGZsb3cucmVkdWNlKChhY2N1bXVsYXRlLCBjdXJyZW50KSA9PiBhY2N1bXVsYXRlICsgY3VycmVudCk7XG4gICAgICAgIGNvbnN0IHN1bUluID0gaW5mbG93LnJlZHVjZSgoYWNjdW11bGF0ZSwgY3VycmVudCkgPT4gYWNjdW11bGF0ZSArIGN1cnJlbnQpO1xuICAgICAgICByZXR1cm4gW3N1bUluLCBNYXRoLmFicyhzdW1PdXQpXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAjIyMjIENyZWF0ZXMgYSBsaXN0IG9mIHRoZSBtb3N0IHJlY2VudCBnaWZ0c1xuICAgICAqIEBwYXJhbSBoaXN0b3J5IFRoZSBmdWxsIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHR3byB1c2Vyc1xuICAgICAqL1xuICAgIHByaXZhdGUgX3Nob3dHaWZ0cyhoaXN0b3J5OiBVc2VyR2lmdEhpc3RvcnlbXSkge1xuICAgICAgICAvLyBJZiB0aGUgZ2lmdCB3YXMgYSB3ZWRnZSwgcmV0dXJuIGN1c3RvbSB0ZXh0XG4gICAgICAgIGNvbnN0IF93ZWRnZU9yUG9pbnRzID0gKGdpZnQ6IFVzZXJHaWZ0SGlzdG9yeSk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICBpZiAoZ2lmdC50eXBlID09PSAnZ2lmdFBvaW50cycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7TWF0aC5hYnMoZ2lmdC5hbW91bnQpfWA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyhGTCknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVycm9yOiB1bmtub3duIGdpZnQgdHlwZS4uLiAke2dpZnQudHlwZX06ICR7Z2lmdC5hbW91bnR9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBhIGxpc3QgZm9yIHRoZSBoaXN0b3J5XG4gICAgICAgIGNvbnN0IGhpc3RvcnlMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihoaXN0b3J5TGlzdC5zdHlsZSwge1xuICAgICAgICAgICAgbGlzdFN0eWxlOiAnbm9uZScsXG4gICAgICAgICAgICBwYWRkaW5nOiAnaW5pdGlhbCcsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMGVtJyxcbiAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bycsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBMb29wIG92ZXIgaGlzdG9yeSBpdGVtcyBhbmQgYWRkIHRvIGFuIGFycmF5XG4gICAgICAgIGNvbnN0IGdpZnRzOiBzdHJpbmdbXSA9IGhpc3RvcnlcbiAgICAgICAgICAgIC5maWx0ZXIoKGdpZnQpID0+IGdpZnQudHlwZSA9PT0gJ2dpZnRQb2ludHMnIHx8IGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpXG4gICAgICAgICAgICAubWFwKChnaWZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHNvbWUgc3R5bGluZyBkZXBlbmRpbmcgb24gcG9zL25lZyBudW1iZXJzXG4gICAgICAgICAgICAgICAgbGV0IGZhbmN5R2lmdEFtb3VudDogc3RyaW5nID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGZyb21Ubzogc3RyaW5nID0gJyc7XG5cbiAgICAgICAgICAgICAgICBpZiAoZ2lmdC5hbW91bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhbmN5R2lmdEFtb3VudCA9IGAke3RoaXMuX2dldFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xuICAgICAgICAgICAgICAgICAgICBmcm9tVG8gPSAnZnJvbSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fc2VuZFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xuICAgICAgICAgICAgICAgICAgICBmcm9tVG8gPSAndG8nO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE1ha2UgdGhlIGRhdGUgcmVhZGFibGVcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gVXRpbC5wcmV0dHlTaXRlVGltZShnaWZ0LnRpbWVzdGFtcCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8bGkgY2xhc3M9J21wX2dpZnRJdGVtJz4ke2RhdGV9IHlvdSAke2ZhbmN5R2lmdEFtb3VudH0gJHtmcm9tVG99IDxhIGhyZWY9Jy91LyR7Z2lmdC5vdGhlcl91c2VyaWR9Jz4ke2dpZnQub3RoZXJfbmFtZX08L2E+PC9saT5gO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIEFkZCBoaXN0b3J5IGl0ZW1zIHRvIHRoZSBsaXN0XG4gICAgICAgIGhpc3RvcnlMaXN0LmlubmVySFRNTCA9IGdpZnRzLmpvaW4oJycpO1xuICAgICAgICByZXR1cm4gaGlzdG9yeUxpc3Q7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIE5vdGVzIGltcGxlbWVudHMgRmVhdHVyZSB7XG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6ICdOb3RlcycsXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcbiAgICAgICAgZGVzYzogJ0FkZHMgYSBub3RlcyB0ZXh0Ym94JyxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAndGJvZHknO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgLy8gTG9jYXRlIHRoZSB0YWJsZSB3aXRoIHRoZSBjbGFzcyBcImNvbHRhYmxlXCJcbiAgICAgICAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29sdGFibGUnKSBhcyBIVE1MVGFibGVFbGVtZW50O1xuXG4gICAgICAgIGlmICh0YWJsZSkge1xuICAgICAgICAgICAgbGV0IHRib2R5ID0gdGFibGUucXVlcnlTZWxlY3RvcigndGJvZHknKTtcblxuICAgICAgICAgICAgY29uc3QgdXNlcklEID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9cXC91XFwvKFxcZCspLyk/LlsxXTtcbiAgICAgICAgICAgIGlmICghdXNlcklEKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVzZXIgSUQgbm90IGZvdW5kIGluIFVSTC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBuZXdSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgICAgICAgICAgY29uc3QgbmV3Q2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgICAgICBuZXdDZWxsLnNldEF0dHJpYnV0ZSgnY29sc3BhbicsICcyJyk7XG4gICAgICAgICAgICBuZXdDZWxsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAncm93MScpO1xuXG4gICAgICAgICAgICBjb25zdCBpbnB1dEZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgICAgIGlucHV0RmllbGQucm93cyA9IDQ7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLmNvbHMgPSAxMDA7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLnBsYWNlaG9sZGVyID0gJ0VudGVyIHlvdXIgbm90ZXMgaGVyZSc7XG4gICAgICAgICAgICBpbnB1dEZpZWxkLnZhbHVlID0gR01fZ2V0VmFsdWUoYHVzZXJfbm90ZXNfJHt1c2VySUR9X3ZhbGAsICcnKTtcblxuICAgICAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdTYXZlIE5vdGUnO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIFwiU2F2ZWQhXCIgbWVzc2FnZSBzcGFuXG4gICAgICAgICAgICBjb25zdCBzYXZlZE1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBzYXZlZE1lc3NhZ2UuY2xhc3NOYW1lID0gJ21wX3NhdmVzdGF0ZSc7IC8vIEFwcGx5IHRoZSBzdHlsZSBzaW1pbGFyIHRvIHRoZSBleGFtcGxlXG4gICAgICAgICAgICBzYXZlZE1lc3NhZ2UudGV4dENvbnRlbnQgPSAnU2F2ZWQhJztcbiAgICAgICAgICAgIHNhdmVkTWVzc2FnZS5zdHlsZS5vcGFjaXR5ID0gJzAnOyAvLyBTdGFydCBoaWRkZW5cblxuICAgICAgICAgICAgLy8gQWRkIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgdG8gc2F2ZSB0aGUgbm90ZSBhbmQgZGlzcGxheSBcIlNhdmVkIVwiIG1lc3NhZ2VcbiAgICAgICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90ZVZhbHVlID0gaW5wdXRGaWVsZC52YWx1ZS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAobm90ZVZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBHTV9kZWxldGVWYWx1ZShgdXNlcl9ub3Rlc18ke3VzZXJJRH1fdmFsYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBOb3RlIGZvciB1c2VyICR7dXNlcklEfSBoYXMgYmVlbiBjbGVhcmVkLmApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGB1c2VyX25vdGVzXyR7dXNlcklEfV92YWxgLCBub3RlVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTm90ZSBmb3IgdXNlciAke3VzZXJJRH0gc2F2ZWQ6ICR7bm90ZVZhbHVlfWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNob3cgdGhlIFwiU2F2ZWQhXCIgbWVzc2FnZSBicmllZmx5XG4gICAgICAgICAgICAgICAgc2F2ZWRNZXNzYWdlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNhdmVkTWVzc2FnZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgICAgICAgICAgICAgIH0sIDIwMDApOyAvLyBIaWRlIGFmdGVyIDIgc2Vjb25kc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG5ld0NlbGwuYXBwZW5kQ2hpbGQoaW5wdXRGaWVsZCk7XG4gICAgICAgICAgICBuZXdDZWxsLmFwcGVuZENoaWxkKHNhdmVCdXR0b24pO1xuICAgICAgICAgICAgbmV3Q2VsbC5hcHBlbmRDaGlsZChzYXZlZE1lc3NhZ2UpOyAvLyBBZGQgdGhlIFwiU2F2ZWQhXCIgbWVzc2FnZSBzcGFuIHRvIHRoZSBjZWxsXG4gICAgICAgICAgICBuZXdSb3cuYXBwZW5kQ2hpbGQobmV3Q2VsbCk7XG4gICAgICAgICAgICB0Ym9keS5hcHBlbmRDaGlsZChuZXdSb3cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGFibGUgd2l0aCBjbGFzcyBcImNvbHRhYmxlXCIgbm90IGZvdW5kLicpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn0iLCIvKipcbiAqIFZBVUxUIEZFQVRVUkVTXG4gKi9cblxuY2xhc3MgU2ltcGxlVmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlZhdWx0LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3NpbXBsZVZhdWx0JyxcbiAgICAgICAgZGVzYzpcbiAgICAgICAgICAgICdTaW1wbGlmeSB0aGUgVmF1bHQgcGFnZXMuICg8ZW0+VGhpcyByZW1vdmVzIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBkb25hdGUgYnV0dG9uICZhbXA7IGxpc3Qgb2YgcmVjZW50IGRvbmF0aW9uczwvZW0+KScsXG4gICAgfTtcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWFpbkJvZHknO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndmF1bHQnXSkudGhlbigodCkgPT4ge1xuICAgICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XG4gICAgICAgIGNvbnN0IHN1YlBhZ2U6IHN0cmluZyA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xuICAgICAgICBjb25zdCBwYWdlID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcbiAgICAgICAgY29uc29sZS5ncm91cChgQXBwbHlpbmcgVmF1bHQgKCR7c3ViUGFnZX0pIHNldHRpbmdzLi4uYCk7XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIGltcG9ydGFudCBwYXJ0cyBhbmQgcmVzZXQgdGhlIHBhZ2VcbiAgICAgICAgY29uc3QgZG9uYXRlQnRuOiBIVE1MRm9ybUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XG4gICAgICAgIGNvbnN0IGRvbmF0ZVRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAndGFibGU6bGFzdC1vZi10eXBlJ1xuICAgICAgICApO1xuICAgICAgICBwYWdlLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIGJ1dHRvbiBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKGRvbmF0ZUJ0biAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbmV3RG9uYXRlOiBIVE1MRm9ybUVsZW1lbnQgPSA8SFRNTEZvcm1FbGVtZW50PmRvbmF0ZUJ0bi5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld0RvbmF0ZSk7XG4gICAgICAgICAgICBuZXdEb25hdGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFnZS5pbm5lckhUTUwgPSAnPGgxPkNvbWUgYmFjayB0b21vcnJvdyE8L2gxPic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSB0YWJsZSBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKGRvbmF0ZVRibCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgZG9uYXRlVGJsLmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xuICAgICAgICAgICAgbmV3VGFibGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFnZS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzI1cHgnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNpbXBsaWZpZWQgdGhlIHZhdWx0IHBhZ2UhJyk7XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgICB9XG59XG5cbmNsYXNzIFBvdEhpc3RvcnkgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlZhdWx0LFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ3BvdEhpc3RvcnknLFxuICAgICAgICBkZXNjOiAnQWRkIHRoZSBsaXN0IG9mIHJlY2VudCBkb25hdGlvbnMgdG8gdGhlIGRvbmF0aW9uIHBhZ2UuJyxcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd2YXVsdCddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcbiAgICAgICAgY29uc3Qgc3ViUGFnZTogc3RyaW5nID0gR01fZ2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xuICAgICAgICBjb25zdCBmb3JtID0gPEhUTUxFbGVtZW50PihcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyICsgJyBmb3JtW21ldGhvZD1cInBvc3RcIl0nKVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHBvdFBhZ2VSZXNwID0gYXdhaXQgZmV0Y2goJy9taWxsaW9uYWlyZXMvcG90LnBocCcpO1xuICAgICAgICBpZiAoIXBvdFBhZ2VSZXNwLm9rKSB7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKFxuICAgICAgICAgICAgICAgIGBmYWlsZWQgdG8gZ2V0IC9taWxsaW9uYWlyZXMvcG90LnBocDogJHtwb3RQYWdlUmVzcC5zdGF0dXN9LyR7cG90UGFnZVJlc3Auc3RhdHVzVGV4dH1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFwcGx5aW5nIFZhdWx0ICgke3N1YlBhZ2V9KSBzZXR0aW5ncy4uLmApO1xuICAgICAgICBjb25zdCBwb3RQYWdlVGV4dDogc3RyaW5nID0gYXdhaXQgcG90UGFnZVJlc3AudGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgICAgIGNvbnN0IHBvdFBhZ2U6IERvY3VtZW50ID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhwb3RQYWdlVGV4dCwgJ3RleHQvaHRtbCcpO1xuXG4gICAgICAgIC8vIENsb25lIHRoZSBpbXBvcnRhbnQgcGFydHMgYW5kIHJlc2V0IHRoZSBwYWdlXG4gICAgICAgIGNvbnN0IGRvbmF0ZVRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwb3RQYWdlLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnI21haW5UYWJsZSB0YWJsZTpsYXN0LW9mLXR5cGUnXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUYmw6IEhUTUxUYWJsZUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKCd0YWJsZTpsYXN0LW9mLXR5cGUnKTtcblxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSB0YWJsZSBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKGRvbmF0ZVRibCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXG4gICAgICAgICAgICAgICAgZG9uYXRlVGJsLmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG5ld1RhYmxlLmNsYXNzTGlzdC5hZGQoJ21wX3ZhdWx0Q2xvbmUnKTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRUYmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VGJsLnJlcGxhY2VXaXRoKG5ld1RhYmxlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZm9ybSAhPT0gbnVsbCAmJiBmb3JtLnBhcmVudEVsZW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBmb3JtLnBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld1RhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgZG9uYXRpb24gaGlzdG9yeSB0byB0aGUgZG9uYXRpb24gcGFnZSEnKTtcbiAgICB9XG5cbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogU1RPUkUgRkVBVFVSRVNcbiAqL1xuXG5jbGFzcyBHcmF5T3V0U3RvcmVQdXJjaGFzZXMgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlN0b3JlLFxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogJ2dyYXlPdXRTdG9yZVB1cmNoYXNlcycsXG4gICAgICAgIGRlc2M6IFwiR3JheSBvdXQgc3RvcmUgcHVyY2hhc2VzIHlvdSBjYW4ndCBhZmZvcmQsIGFuZCBkaXNhYmxlIHRob3NlIGJ1dHRvbnNcIixcbiAgICB9O1xuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNjdXJyZW50Qm9udXNQb2ludHMnO1xuICAgIHByaXZhdGUgX21heFZpcERheXM6IG51bWJlciA9IDkwO1xuICAgIHByaXZhdGUgX3BvaW50c1BlckdiVXBsb2FkOiBudW1iZXIgPSA1MDA7XG4gICAgcHJpdmF0ZSBfcG9pbnRzUGVyVmlwQmxvY2s6IG51bWJlciA9IDUwMDA7XG4gICAgcHJpdmF0ZSBfdmlwQmxvY2tXZWVrczogbnVtYmVyID0gNDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3N0b3JlJ10pLnRoZW4oKHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0KCkge1xuICAgICAgICBjb25zdCBwb2ludHMgPSB0aGlzLl9nZXRDdXJyZW5jeSgnI2N1cnJlbnRCb251c1BvaW50cycpO1xuICAgICAgICBjb25zdCBjaGVlc2UgPSB0aGlzLl9nZXRDdXJyZW5jeSgnI2N1cnJlbnRDaGVlc2UnKTtcbiAgICAgICAgY29uc3QgdmlwUmVtYWluaW5nRGF5cyA9IHRoaXMuX2dldFZpcFJlbWFpbmluZ0RheXMoKTtcbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnI21haW5Cb2R5IC5ib251c1JvdyBidXR0b24nXG4gICAgICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MQnV0dG9uRWxlbWVudD47XG5cbiAgICAgICAgYnV0dG9ucy5mb3JFYWNoKChidXR0b24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlYXNvbiA9IHRoaXMuX2dldERpc2FibGVSZWFzb24oXG4gICAgICAgICAgICAgICAgYnV0dG9uLFxuICAgICAgICAgICAgICAgIHBvaW50cyxcbiAgICAgICAgICAgICAgICBjaGVlc2UsXG4gICAgICAgICAgICAgICAgdmlwUmVtYWluaW5nRGF5c1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHJlYXNvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVQdXJjaGFzZShidXR0b24sIHJlYXNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21hcmtEaXNhYmxlZFNlY3Rpb25zKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW00rXSBEaXNhYmxlZCBzdG9yZSBwdXJjaGFzZXMgeW91IGNhbid0IGFmZm9yZCFcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0Q3VycmVuY3koc2VsZWN0b3I6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsZW0gPT09IG51bGwgfHwgZWxlbS50ZXh0Q29udGVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoZWxlbS50ZXh0Q29udGVudC5yZXBsYWNlKC9bXlxcZF0vZywgJycpLCAxMCkgfHwgMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRWaXBSZW1haW5pbmdEYXlzKCk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBjb25zdCB1c2VyTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN1c2VyTWVudSArIHVsJyk7XG4gICAgICAgIGNvbnN0IG1lbnVUZXh0ID0gdXNlck1lbnUgJiYgdXNlck1lbnUudGV4dENvbnRlbnQgPyB1c2VyTWVudS50ZXh0Q29udGVudCA6ICcnO1xuXG4gICAgICAgIGlmICgvRS1WSVB8VklQIG5vdCBzZXQgdG8gZXhwaXJlfGV0ZXJuYWwvaS50ZXN0KG1lbnVUZXh0KSkge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRhdGVNYXRjaCA9IG1lbnVUZXh0Lm1hdGNoKFxuICAgICAgICAgICAgL1ZJUCBleHBpcmVzKD86XFxzK29uKT9cXHMrKFtBLVphLXpdezMsOX1cXHMrXFxkezEsMn0sP1xccytcXGR7NH18XFxkezR9LVxcZHsyfS1cXGR7Mn0pL2lcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoZGF0ZU1hdGNoID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4cGlyeSA9IG5ldyBEYXRlKGRhdGVNYXRjaFsxXSk7XG4gICAgICAgIGlmIChpc05hTihleHBpcnkuZ2V0VGltZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgTWF0aC5jZWlsKChleHBpcnkuZ2V0VGltZSgpIC0gRGF0ZS5ub3coKSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0RGlzYWJsZVJlYXNvbihcbiAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICAgICAgcG9pbnRzOiBudW1iZXIsXG4gICAgICAgIGNoZWVzZTogbnVtYmVyLFxuICAgICAgICB2aXBSZW1haW5pbmdEYXlzOiBudW1iZXIgfCBudWxsXG4gICAgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0aGlzLl9nZXRTdG9yZVNlY3Rpb24oYnV0dG9uKTtcbiAgICAgICAgY29uc3QgZml4ZWRDb3N0ID0gdGhpcy5fZ2V0Rml4ZWRDb3N0KGJ1dHRvbik7XG5cbiAgICAgICAgaWYgKGZpeGVkQ29zdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGZpeGVkQ29zdC5raW5kID09PSAncG9pbnRzJyAmJiBmaXhlZENvc3QuYW1vdW50ID4gcG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdOb3QgZW5vdWdoIGJvbnVzIHBvaW50cyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaXhlZENvc3Qua2luZCA9PT0gJ2NoZWVzZScgJiYgZml4ZWRDb3N0LmFtb3VudCA+IGNoZWVzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnTm90IGVub3VnaCBjaGVlc2UnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlY3Rpb24gPT09ICd1cGxvYWRDcmVkaXRDb250ZW50JyAmJiB0aGlzLl9pc1VwbG9hZE1heEJ1dHRvbihidXR0b24pKSB7XG4gICAgICAgICAgICBpZiAocG9pbnRzIDwgdGhpcy5fcG9pbnRzUGVyR2JVcGxvYWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ05lZWQgYXQgbGVhc3QgNTAwIGJvbnVzIHBvaW50cyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VjdGlvbiA9PT0gJ3ZpcFN0YXR1c0NvbnRlbnQnKSB7XG4gICAgICAgICAgICBpZiAodmlwUmVtYWluaW5nRGF5cyA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdFdGVybmFsIFZJUCBjYW5ub3QgYnV5IG1vcmUgVklQJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHRoaXMuX3dvdWxkRXhjZWVkVmlwTGltaXQoYnV0dG9uLCB2aXBSZW1haW5pbmdEYXlzKSAmJlxuICAgICAgICAgICAgICAgIHZpcFJlbWFpbmluZ0RheXMgIT09IG51bGxcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnV291bGQgZXhjZWVkIHRoZSA5MCBkYXkgVklQIGxpbWl0JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlwTWF4QnV0dG9uKGJ1dHRvbikgJiYgcG9pbnRzIDwgdGhpcy5fcG9pbnRzUGVyVmlwQmxvY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ05lZWQgYXQgbGVhc3QgNTAwMCBib251cyBwb2ludHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0U3RvcmVTZWN0aW9uKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBzZWN0aW9uID0gYnV0dG9uLmNsb3Nlc3QoJ2Rpdi5ib251c1JvdycpO1xuXG4gICAgICAgIGlmIChzZWN0aW9uID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gQXJyYXkuZnJvbShzZWN0aW9uLmNsYXNzTGlzdCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRDbGFzcyA9IGNsYXNzZXMuZmluZCgoaXRlbSkgPT4gaXRlbS5lbmRzV2l0aCgnQ29udGVudCcpKTtcblxuICAgICAgICByZXR1cm4gY29udGVudENsYXNzICE9PSB1bmRlZmluZWQgPyBjb250ZW50Q2xhc3MgOiAnJztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRGaXhlZENvc3QoXG4gICAgICAgIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnRcbiAgICApOiB7IGtpbmQ6ICdwb2ludHMnIHwgJ2NoZWVzZSc7IGFtb3VudDogbnVtYmVyIH0gfCBudWxsIHtcbiAgICAgICAgY29uc3QgdGl0bGUgPSBidXR0b24uZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuXG4gICAgICAgIGlmICh0aXRsZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwb2ludHMgPSB0aXRsZS5tYXRjaCgvKFtcXGQsXSspXFxzK3BvaW50cy9pKTtcbiAgICAgICAgaWYgKHBvaW50cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBraW5kOiAncG9pbnRzJyxcbiAgICAgICAgICAgICAgICBhbW91bnQ6IHBhcnNlSW50KHBvaW50c1sxXS5yZXBsYWNlKC8sL2csICcnKSwgMTApLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoZWVzZSA9IHRpdGxlLm1hdGNoKC8oW1xcZCxdKylcXHMrY2hlZXNlL2kpO1xuICAgICAgICBpZiAoY2hlZXNlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdjaGVlc2UnLFxuICAgICAgICAgICAgICAgIGFtb3VudDogcGFyc2VJbnQoY2hlZXNlWzFdLnJlcGxhY2UoLywvZywgJycpLCAxMCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaXNVcGxvYWRNYXhCdXR0b24oYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gYnV0dG9uLnRleHRDb250ZW50ICE9PSBudWxsICYmIGJ1dHRvbi50ZXh0Q29udGVudC5pbmRleE9mKCdNYXgnKSA+IC0xO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2lzVmlwTWF4QnV0dG9uKGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbi52YWx1ZSA9PT0gJ21heCc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfd291bGRFeGNlZWRWaXBMaW1pdChcbiAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICAgICAgdmlwUmVtYWluaW5nRGF5czogbnVtYmVyIHwgbnVsbFxuICAgICk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodmlwUmVtYWluaW5nRGF5cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzVmlwTWF4QnV0dG9uKGJ1dHRvbikpIHtcbiAgICAgICAgICAgIHJldHVybiB2aXBSZW1haW5pbmdEYXlzID49IHRoaXMuX21heFZpcERheXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3ZWVrc1RvQnV5ID0gcGFyc2VJbnQoYnV0dG9uLnZhbHVlLCAxMCk7XG4gICAgICAgIGlmIChpc05hTih3ZWVrc1RvQnV5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF5c1RvQnV5ID0gd2Vla3NUb0J1eSAqIDc7XG4gICAgICAgIHJldHVybiB2aXBSZW1haW5pbmdEYXlzICsgZGF5c1RvQnV5ID4gdGhpcy5fbWF4VmlwRGF5cztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9kaXNhYmxlUHVyY2hhc2UoYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudCwgcmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgYnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ21wX3N0b3JlX2Rpc2FibGVkJyk7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICBidXR0b24uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcblxuICAgICAgICBjb25zdCBjdXJyZW50VGl0bGUgPSBidXR0b24uZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuICAgICAgICBpZiAoY3VycmVudFRpdGxlICE9PSBudWxsICYmIGN1cnJlbnRUaXRsZS5pbmRleE9mKHJlYXNvbikgPT09IC0xKSB7XG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0aXRsZScsIGAke2N1cnJlbnRUaXRsZX0gfCAke3JlYXNvbn1gKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VGl0bGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgcmVhc29uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX21hcmtEaXNhYmxlZFNlY3Rpb25zKCkge1xuICAgICAgICBjb25zdCBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnI21haW5Cb2R5IGRpdi5ib251c1Jvd1tjbGFzcyo9XCJDb250ZW50XCJdJ1xuICAgICAgICApIGFzIE5vZGVMaXN0T2Y8SFRNTERpdkVsZW1lbnQ+O1xuXG4gICAgICAgIHNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBzZWN0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xuICAgICAgICAgICAgaWYgKGJ1dHRvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBlbmFibGVkID0gQXJyYXkuZnJvbShidXR0b25zKS5zb21lKChidXR0b24pID0+ICFidXR0b24uZGlzYWJsZWQpO1xuICAgICAgICAgICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdtcF9zdG9yZV9kaXNhYmxlZF9zZWN0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XG4gICAgfVxufVxuXG5jbGFzcyBDb3N0VG9TZXRSYXRpbyBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TdG9yZSxcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICB0aXRsZTogJ3N0b3JlVGFyZ2V0UmF0aW8nLFxuICAgICAgICB0YWc6ICdUYXJnZXQgUmF0aW8nLFxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiA1JyxcbiAgICAgICAgZGVzYzogJ0Rpc3BsYXkgaG93IG11Y2ggdXBsb2FkIGNyZWRpdCB5b3UgbmVlZCB0byBidXkgdG8gcmVhY2ggYSB0YXJnZXQgcmF0aW8nLFxuICAgIH07XG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnVwbG9hZENyZWRpdENvbnRlbnQnO1xuICAgIHByaXZhdGUgX291dHB1dElEOiBzdHJpbmcgPSAnbXBfc3RvcmVUYXJnZXRSYXRpbyc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzdG9yZSddKS50aGVuKCh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgICAgIHRoaXMuX3dhdGNoRm9yQ2hhbmdlcygpO1xuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCBjb3N0IHRvIHNldCByYXRpbyB0byB0aGUgc3RvcmUgcGFnZSEnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldFJhdGlvID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1fdmFsYCkpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpIGFzIEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcblxuICAgICAgICBpZiAoY29udGVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG91dHB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuX291dHB1dElEKSBhcyBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG4gICAgICAgIGlmIChvdXRwdXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgb3V0cHV0LmlkID0gdGhpcy5fb3V0cHV0SUQ7XG4gICAgICAgICAgICBvdXRwdXQuY2xhc3NOYW1lID0gJ21wX3N0b3JlX3JhdGlvVGFyZ2V0JztcbiAgICAgICAgICAgIGNvbnRlbnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmJlZ2luJywgb3V0cHV0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc05hTih0YXJnZXRSYXRpbykgfHwgdGFyZ2V0UmF0aW8gPD0gMCkge1xuICAgICAgICAgICAgb3V0cHV0LnRleHRDb250ZW50ID0gJ0VudGVyIGEgdmFsaWQgdGFyZ2V0IHJhdGlvIGluIE1BTSsgc2V0dGluZ3MgdG8gc2VlIHRoZSB1cGxvYWQgY3JlZGl0IGNvc3QuJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSYXRpbyA9IHRoaXMuX2dldFJhdGlvKCk7XG4gICAgICAgIGNvbnN0IHVwbG9hZGVkQnl0ZXMgPSB0aGlzLl9nZXRCeXRlcygnI3VwbG9hZGVkVEQnKTtcbiAgICAgICAgY29uc3QgZG93bmxvYWRlZEJ5dGVzID0gdGhpcy5fZ2V0Qnl0ZXMoJyNkb3dubG9hZGVkVEQnKTtcblxuICAgICAgICBpZiAoY3VycmVudFJhdGlvID09PSBudWxsIHx8IHVwbG9hZGVkQnl0ZXMgPT09IG51bGwgfHwgZG93bmxvYWRlZEJ5dGVzID09PSBudWxsKSB7XG4gICAgICAgICAgICBvdXRwdXQudGV4dENvbnRlbnQgPVxuICAgICAgICAgICAgICAgICdDb3VsZCBub3QgZGV0ZXJtaW5lIHlvdXIgY3VycmVudCByYXRpbyBhbmQgdG90YWxzIGZvciB0aGUgdGFyZ2V0LXJhdGlvIGNhbGN1bGF0aW9uLic7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1cGxvYWROZWVkZWRCeXRlcyA9IFV0aWwudXBsb2FkTmVlZGVkRm9yVGFyZ2V0UmF0aW8oXG4gICAgICAgICAgICB1cGxvYWRlZEJ5dGVzLFxuICAgICAgICAgICAgZG93bmxvYWRlZEJ5dGVzLFxuICAgICAgICAgICAgdGFyZ2V0UmF0aW9cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodXBsb2FkTmVlZGVkQnl0ZXMgPD0gMCkge1xuICAgICAgICAgICAgb3V0cHV0LmlubmVySFRNTCA9IGA8c3Ryb25nPlRhcmdldCBSYXRpbzo8L3N0cm9uZz4gWW91ciBjdXJyZW50IHJhdGlvIG9mICR7Y3VycmVudFJhdGlvLnRvRml4ZWQoXG4gICAgICAgICAgICAgICAgMlxuICAgICAgICAgICAgKX0gYWxyZWFkeSBtZWV0cyBvciBleGNlZWRzICR7dGFyZ2V0UmF0aW8udG9GaXhlZCgyKX0uYDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvaW50c05lZWRlZCA9IE1hdGguY2VpbCgodXBsb2FkTmVlZGVkQnl0ZXMgLyBNYXRoLnBvdygxMDI0LCAzKSkgKiA1MDApO1xuICAgICAgICBvdXRwdXQuaW5uZXJIVE1MID0gYDxzdHJvbmc+VGFyZ2V0IFJhdGlvOjwvc3Ryb25nPiBCdXkgPHN0cm9uZz4ke1V0aWwuZm9ybWF0Qnl0ZXMoXG4gICAgICAgICAgICB1cGxvYWROZWVkZWRCeXRlc1xuICAgICAgICApfTwvc3Ryb25nPiBvZiB1cGxvYWQgY3JlZGl0ICgke3BvaW50c05lZWRlZC50b0xvY2FsZVN0cmluZygpfSBCUCkgdG8gcmVhY2ggcmF0aW8gPHN0cm9uZz4ke3RhcmdldFJhdGlvLnRvRml4ZWQoXG4gICAgICAgICAgICAyXG4gICAgICAgICl9PC9zdHJvbmc+LmA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfd2F0Y2hGb3JDaGFuZ2VzKCkge1xuICAgICAgICBjb25zdCB3YXRjaFRhcmdldHMgPSBbJyN0bVInLCAnI3VwbG9hZGVkVEQnLCAnI2Rvd25sb2FkZWRURCcsICcjY3VycmVudEJvbnVzUG9pbnRzJ11cbiAgICAgICAgICAgIC5tYXAoKHNlbGVjdG9yKSA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGVsZW0pOiBlbGVtIGlzIEhUTUxFbGVtZW50ID0+IGVsZW0gIT09IG51bGwpO1xuXG4gICAgICAgIGlmICh3YXRjaFRhcmdldHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3YXRjaFRhcmdldHMuZm9yRWFjaCgodGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldCwge1xuICAgICAgICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdXBsb2FkQnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnLnVwbG9hZENyZWRpdENvbnRlbnQgYnV0dG9uJ1xuICAgICAgICApIGFzIE5vZGVMaXN0T2Y8SFRNTEJ1dHRvbkVsZW1lbnQ+O1xuICAgICAgICB1cGxvYWRCdXR0b25zLmZvckVhY2goKGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHRoaXMuX3JlbmRlcigpLCAyNTApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldFJhdGlvKCk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBjb25zdCByYXRpb0VsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SLCAjUmF0aW9URCcpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgaWYgKHJhdGlvRWxlbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByYXRpbyA9IFV0aWwuZXh0cmFjdEZsb2F0KHJhdGlvRWxlbSlbMF07XG4gICAgICAgIHJldHVybiBpc05hTihyYXRpbykgPyBudWxsIDogcmF0aW87XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0Qnl0ZXMoc2VsZWN0b3I6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgICBpZiAoZWxlbSA9PT0gbnVsbCB8fCBlbGVtLnRleHRDb250ZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gVXRpbC5wYXJzZVNpemVUb0J5dGVzKGVsZW0udGV4dENvbnRlbnQpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICAgIH1cbn1cbiIsIi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBQTEFDRSBBTEwgTSsgRkVBVFVSRVMgSEVSRVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKlxuICogTmVhcmx5IGFsbCBmZWF0dXJlcyBiZWxvbmcgaGVyZSwgYXMgdGhleSBzaG91bGQgaGF2ZSBpbnRlcm5hbCBjaGVja3NcbiAqIGZvciBET00gZWxlbWVudHMgYXMgbmVlZGVkLiBPbmx5IGNvcmUgZmVhdHVyZXMgc2hvdWxkIGJlIHBsYWNlZCBpbiBgYXBwLnRzYFxuICpcbiAqIFRoaXMgZGV0ZXJtaW5lcyB0aGUgb3JkZXIgaW4gd2hpY2ggc2V0dGluZ3Mgd2lsbCBiZSBnZW5lcmF0ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2UuXG4gKiBTZXR0aW5ncyB3aWxsIGJlIGdyb3VwZWQgYnkgdHlwZSBhbmQgRmVhdHVyZXMgb2Ygb25lIHR5cGUgdGhhdCBhcmUgY2FsbGVkIGJlZm9yZVxuICogb3RoZXIgRmVhdHVyZXMgb2YgdGhlIHNhbWUgdHlwZSB3aWxsIGFwcGVhciBmaXJzdC5cbiAqXG4gKiBUaGUgb3JkZXIgb2YgdGhlIGZlYXR1cmUgZ3JvdXBzIGlzIG5vdCBkZXRlcm1pbmVkIGhlcmUuXG4gKi9cbmNsYXNzIEluaXRGZWF0dXJlcyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIEluaXRpYWxpemUgR2xvYmFsIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgSGlkZUhvbWUoKTtcbiAgICAgICAgbmV3IEJvb2ttYXJrSWNvbnMoKTtcbiAgICAgICAgbmV3IEhpZGVTZWVkYm94KCk7XG4gICAgICAgIG5ldyBIaWRlRG9uYXRpb25Cb3goKTtcbiAgICAgICAgbmV3IEJsdXJyZWRIZWFkZXIoKTtcbiAgICAgICAgbmV3IFZhdWx0TGluaygpO1xuICAgICAgICBuZXcgTWluaVZhdWx0SW5mbygpO1xuICAgICAgICBuZXcgQm9udXNQb2ludERlbHRhKCk7XG4gICAgICAgIG5ldyBGaXhlZE5hdigpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgSG9tZSBQYWdlIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgSGlkZU5ld3MoKTtcbiAgICAgICAgbmV3IEdpZnROZXdlc3QoKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFNlYXJjaCBQYWdlIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgVG9nZ2xlU25hdGNoZWQoKTtcbiAgICAgICAgbmV3IFN0aWNreVNuYXRjaGVkVG9nZ2xlKCk7XG4gICAgICAgIG5ldyBUb2dnbGVCb29rbWFya2VkKCk7XG4gICAgICAgIG5ldyBTdGlja3lCb29rbWFya2VkVG9nZ2xlKCk7XG4gICAgICAgIG5ldyBQbGFpbnRleHRTZWFyY2goKTtcbiAgICAgICAgbmV3IFRvZ2dsZVNlYXJjaGJveCgpO1xuICAgICAgICBuZXcgRmlsZXR5cGVTZWFyY2hGaWx0ZXIoKTtcbiAgICAgICAgbmV3IEJ1aWxkVGFncygpO1xuICAgICAgICBuZXcgTXVsdGlTZWxlY3RCcm93c2UoKTtcbiAgICAgICAgbmV3IFJhbmRvbUJvb2soKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIEZyZWVsZWVjaCBQYWdlIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgQ29sbGFwc2VGcmVlbGVlY2hTZWN0aW9ucygpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgUmVxdWVzdCBQYWdlIGZ1bmN0aW9uc1xuICAgICAgICBuZXcgR29vZHJlYWRzQnV0dG9uUmVxKCk7XG4gICAgICAgIG5ldyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzKCk7XG4gICAgICAgIG5ldyBQbGFpbnRleHRSZXF1ZXN0KCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUb3JyZW50IFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBHb29kcmVhZHNCdXR0b24oKTtcbiAgICAgICAgbmV3IFN0b3J5R3JhcGhCdXR0b24oKTtcbiAgICAgICAgbmV3IEF1ZGlibGVCdXR0b24oKTtcbiAgICAgICAgbmV3IEN1cnJlbnRseVJlYWRpbmcoKTtcbiAgICAgICAgbmV3IFRvckdpZnREZWZhdWx0KCk7XG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3QoKTtcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEljb25zKCk7XG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMSgpO1xuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDIoKTtcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEwzKCk7XG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RNaW4oKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIFNob3V0Ym94IGZ1bmN0aW9uc1xuICAgICAgICBuZXcgUHJpb3JpdHlVc2VycygpO1xuICAgICAgICBuZXcgUHJpb3JpdHlTdHlsZSgpO1xuICAgICAgICBuZXcgTXV0ZWRVc2VycygpO1xuICAgICAgICBuZXcgR2lmdEJ1dHRvbigpO1xuICAgICAgICBuZXcgUXVpY2tTaG91dCgpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgVmF1bHQgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBTaW1wbGVWYXVsdCgpO1xuICAgICAgICBuZXcgUG90SGlzdG9yeSgpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgU3RvcmUgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBHcmF5T3V0U3RvcmVQdXJjaGFzZXMoKTtcbiAgICAgICAgbmV3IENvc3RUb1NldFJhdGlvKCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVc2VyIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBVc2VyR2lmdERlZmF1bHQoKTtcbiAgICAgICAgbmV3IFVzZXJHaWZ0SGlzdG9yeSgpO1xuICAgICAgICBuZXcgTm90ZXMoKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIEZvcnVtIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBGb3J1bUZMR2lmdCgpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgVXBsb2FkIFBhZ2UgZnVuY3Rpb25zXG4gICAgICAgIG5ldyBTZWFyY2hGb3JEdXBsaWNhdGVzKCk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNoZWNrLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XG5cbi8qKlxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHNldHRpbmdzIGFuZCB0aGUgUHJlZmVyZW5jZXMgcGFnZVxuICogQG1ldGhvZCBpbml0OiB0dXJucyBmZWF0dXJlcycgc2V0dGluZ3MgaW5mbyBpbnRvIGEgdXNlYWJsZSB0YWJsZVxuICovXG5jbGFzcyBTZXR0aW5ncyB7XG4gICAgLy8gRnVuY3Rpb24gZm9yIGdhdGhlcmluZyB0aGUgbmVlZGVkIHNjb3Blc1xuICAgIHByaXZhdGUgc3RhdGljIF9nZXRTY29wZXMoc2V0dGluZ3M6IEFueUZlYXR1cmVbXSk6IFByb21pc2U8U2V0dGluZ0dsb2JPYmplY3Q+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnX2dldFNjb3BlcygnLCBzZXR0aW5ncywgJyknKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjb3BlTGlzdDogU2V0dGluZ0dsb2JPYmplY3QgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2V0dGluZyBvZiBzZXR0aW5ncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBOdW1iZXIoc2V0dGluZy5zY29wZSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIFNjb3BlIGV4aXN0cywgcHVzaCB0aGUgc2V0dGluZ3MgaW50byB0aGUgYXJyYXlcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGVMaXN0W2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZUxpc3RbaW5kZXhdLnB1c2goc2V0dGluZyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgY3JlYXRlIHRoZSBhcnJheVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0gPSBbc2V0dGluZ107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZShzY29wZUxpc3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiBmb3IgY29uc3RydWN0aW5nIHRoZSB0YWJsZSBmcm9tIGFuIG9iamVjdFxuICAgIHByaXZhdGUgc3RhdGljIF9idWlsZFRhYmxlKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnX2J1aWxkVGFibGUoJywgcGFnZSwgJyknKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cCA9IGA8dGJvZHk+PHRyPjx0ZCBjbGFzcz1cInJvdzFcIiBjb2xzcGFuPVwiMlwiPjxicj48c3Ryb25nPk1BTSsgdiR7XG4gICAgICAgICAgICAgICAgTVAuVkVSU0lPTlxuICAgICAgICAgICAgfTwvc3Ryb25nPiAtIEhlcmUgeW91IGNhbiBlbmFibGUgJmFtcDsgZGlzYWJsZSBhbnkgZmVhdHVyZSBmcm9tIHRoZSA8YSBocmVmPVwiL2YvdC80MTg2M1wiPk1BTSsgdXNlcnNjcmlwdDwvYT4hIEhvd2V2ZXIsIHRoZXNlIHNldHRpbmdzIGFyZSA8c3Ryb25nPk5PVDwvc3Ryb25nPiBzdG9yZWQgb24gTUFNOyB0aGV5IGFyZSBzdG9yZWQgd2l0aGluIHRoZSBUYW1wZXJtb25rZXkvR3JlYXNlbW9ua2V5IGV4dGVuc2lvbiBpbiB5b3VyIGJyb3dzZXIsIGFuZCBtdXN0IGJlIGN1c3RvbWl6ZWQgb24gZWFjaCBvZiB5b3VyIGJyb3dzZXJzL2RldmljZXMgc2VwYXJhdGVseS48YnI+PGJyPkZvciBhIGRldGFpbGVkIGxvb2sgYXQgdGhlIGF2YWlsYWJsZSBmZWF0dXJlcywgPGEgaHJlZj1cIiR7VXRpbC5kZXJlZmVyKFxuICAgICAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvd2lraS9GZWF0dXJlLU92ZXJ2aWV3J1xuICAgICAgICAgICAgKX1cIj5jaGVjayB0aGUgV2lraSE8L2E+PGJyPjxicj48L3RkPjwvdHI+YDtcblxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzY29wZU51bTogbnVtYmVyID0gTnVtYmVyKHNjb3BlKTtcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGhlIHNlY3Rpb24gdGl0bGVcbiAgICAgICAgICAgICAgICBvdXRwICs9IGA8dHI+PHRkIGNsYXNzPSdyb3cyJz4ke1NldHRpbmdHcm91cFtzY29wZU51bV19PC90ZD48dGQgY2xhc3M9J3JvdzEnPmA7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSByZXF1aXJlZCBpbnB1dCBmaWVsZCBiYXNlZCBvbiB0aGUgc2V0dGluZ1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2Vbc2NvcGVOdW1dKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOdW1iZXI6IG51bWJlciA9IE51bWJlcihzZXR0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTogQW55RmVhdHVyZSA9IHBhZ2Vbc2NvcGVOdW1dW3NldHRpbmdOdW1iZXJdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8aW5wdXQgdHlwZT0nY2hlY2tib3gnIGlkPScke2l0ZW0udGl0bGV9JyB2YWx1ZT0ndHJ1ZSc+JHtpdGVtLmRlc2N9PGJyPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxzcGFuIGNsYXNzPSdtcF9zZXRUYWcnPiR7aXRlbS50YWd9Ojwvc3Bhbj4gPGlucHV0IHR5cGU9J3RleHQnIGlkPScke2l0ZW0udGl0bGV9JyBwbGFjZWhvbGRlcj0nJHtpdGVtLnBsYWNlaG9sZGVyfScgY2xhc3M9J21wX3RleHRJbnB1dCcgc2l6ZT0nMjUnPiR7aXRlbS5kZXNjfTxicj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8c2VsZWN0IGlkPScke2l0ZW0udGl0bGV9JyBjbGFzcz0nbXBfZHJvcElucHV0Jz5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaXRlbS5vcHRpb25zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxvcHRpb24gdmFsdWU9JyR7a2V5fSc+JHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9wdGlvbnMhW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L29wdGlvbj5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPC9zZWxlY3Q+JHtpdGVtLmRlc2N9PGJyPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlKSBjYXNlc1tpdGVtLnR5cGVdKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIHJvd1xuICAgICAgICAgICAgICAgIG91dHAgKz0gJzwvdGQ+PC90cj4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNhdmUgYnV0dG9uICYgbGFzdCBwYXJ0IG9mIHRoZSB0YWJsZVxuICAgICAgICAgICAgb3V0cCArPVxuICAgICAgICAgICAgICAgICc8dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGRpdiBpZD1cIm1wX3N1Ym1pdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlNhdmUgTSsgU2V0dGluZ3M/PzwvZGl2PjxkaXYgaWQ9XCJtcF9jb3B5XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+Q29weSBTZXR0aW5nczwvZGl2PjxkaXYgaWQ9XCJtcF9pbmplY3RcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5QYXN0ZSBTZXR0aW5nczwvZGl2PjxzcGFuIGNsYXNzPVwibXBfc2F2ZXN0YXRlXCIgc3R5bGU9XCJvcGFjaXR5OjBcIj5TYXZlZCE8L3NwYW4+PC90ZD48L3RyPjwvdGJvZHk+JztcblxuICAgICAgICAgICAgcmVzb2x2ZShvdXRwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgc2V0dGluZ3MgdmFsdWVzXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2dldFNldHRpbmdzKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KSB7XG4gICAgICAgIC8vIFV0aWwucHVyZ2VTZXR0aW5ncygpO1xuICAgICAgICBjb25zdCBhbGxWYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xuICAgICAgICBpZiAoTVAuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdfZ2V0U2V0dGluZ3MoJywgcGFnZSwgJylcXG5TdG9yZWQgR00ga2V5czonLCBhbGxWYWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5rZXlzKHBhZ2UpLmZvckVhY2goKHNjb3BlKSA9PiB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IHBhZ2VbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcblxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICdQcmVmOicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgU2V0OicsXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgVmFsdWU6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKHByZWYudGl0bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0gJiYgR01fZ2V0VmFsdWUocHJlZi50aXRsZSkpIGNhc2VzW3ByZWYudHlwZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NldFNldHRpbmdzKG9iajogU2V0dGluZ0dsb2JPYmplY3QpIHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgX3NldFNldHRpbmdzKGAsIG9iaiwgJyknKTtcbiAgICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChzY29wZSkgPT4ge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IG9ialtOdW1iZXIoc2NvcGUpXVtOdW1iZXIoc2V0dGluZyldO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0uY2hlY2tlZCkgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucDogc3RyaW5nID0gZWxlbS52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnAgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgLCBpbnApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIGVsZW0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0pIGNhc2VzW3ByZWYudHlwZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNhdmVkIScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIF9jb3B5U2V0dGluZ3MoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZ21MaXN0ID0gR01fbGlzdFZhbHVlcygpO1xuICAgICAgICBjb25zdCBvdXRwOiBbc3RyaW5nLCBzdHJpbmddW10gPSBbXTtcblxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHN0b3JlZCBzZXR0aW5ncyBhbmQgcHVzaCB0byBvdXRwdXQgYXJyYXlcbiAgICAgICAgZ21MaXN0Lm1hcCgoc2V0dGluZykgPT4ge1xuICAgICAgICAgICAgLy8gRG9uJ3QgZXhwb3J0IG1wXyBzZXR0aW5ncyBhcyB0aGV5IHNob3VsZCBvbmx5IGJlIHNldCBhdCBydW50aW1lXG4gICAgICAgICAgICBpZiAoc2V0dGluZy5pbmRleE9mKCdtcF8nKSA8IDApIHtcbiAgICAgICAgICAgICAgICBvdXRwLnB1c2goW3NldHRpbmcsIEdNX2dldFZhbHVlKHNldHRpbmcpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvdXRwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBfcGFzdGVTZXR0aW5ncyhwYXlsb2FkOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKGBfcGFzdGVTZXR0aW5ncyggKWApO1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IEpTT04ucGFyc2UocGF5bG9hZCk7XG4gICAgICAgIHNldHRpbmdzLmZvckVhY2goKHR1cGxlOiBbc3RyaW5nLCBzdHJpbmddW10pID0+IHtcbiAgICAgICAgICAgIGlmICh0dXBsZVsxXSkge1xuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGAke3R1cGxlWzBdfWAsIGAke3R1cGxlWzFdfWApO1xuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codHVwbGVbMF0sICc6ICcsIHR1cGxlWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdGhhdCBzYXZlcyB0aGUgdmFsdWVzIG9mIHRoZSBzZXR0aW5ncyB0YWJsZVxuICAgIHByaXZhdGUgc3RhdGljIF9zYXZlU2V0dGluZ3ModGltZXI6IG51bWJlciwgb2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9zYXZlU2V0dGluZ3MoKWApO1xuXG4gICAgICAgIGNvbnN0IHNhdmVzdGF0ZTogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLm1wX3NhdmVzdGF0ZScpIVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBnbVZhbHVlczogc3RyaW5nW10gPSBHTV9saXN0VmFsdWVzKCk7XG5cbiAgICAgICAgLy8gUmVzZXQgdGltZXIgJiBtZXNzYWdlXG4gICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTYXZpbmcuLi4nKTtcblxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHZhbHVlcyBzdG9yZWQgaW4gR00gYW5kIHJlc2V0IGV2ZXJ5dGhpbmdcbiAgICAgICAgZm9yIChjb25zdCBmZWF0dXJlIGluIGdtVmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGdtVmFsdWVzW2ZlYXR1cmVdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgLy8gT25seSBsb29wIG92ZXIgdmFsdWVzIHRoYXQgYXJlIGZlYXR1cmUgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBpZiAoIVsnbXBfdmVyc2lvbicsICdzdHlsZV90aGVtZSddLmluY2x1ZGVzKGdtVmFsdWVzW2ZlYXR1cmVdKSkge1xuICAgICAgICAgICAgICAgICAgICAvL2lmIG5vdCBwYXJ0IG9mIHByZWZlcmVuY2VzIHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdtVmFsdWVzW2ZlYXR1cmVdLmluZGV4T2YoJ21wXycpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShnbVZhbHVlc1tmZWF0dXJlXSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgc2V0dGluZ3MgdG8gR00gdmFsdWVzXG4gICAgICAgIHRoaXMuX3NldFNldHRpbmdzKG9iaik7XG5cbiAgICAgICAgLy8gRGlzcGxheSB0aGUgY29uZmlybWF0aW9uIG1lc3NhZ2VcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICAgICAgICAgIH0sIDIzNDUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhlIHNldHRpbmdzIHBhZ2UuXG4gICAgICogQHBhcmFtIHJlc3VsdCBWYWx1ZSB0aGF0IG11c3QgYmUgcGFzc2VkIGRvd24gZnJvbSBgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKWBcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgVGhlIGFycmF5IG9mIGZlYXR1cmVzIHRvIHByb3ZpZGUgc2V0dGluZ3MgZm9yXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBpbml0KHJlc3VsdDogYm9vbGVhbiwgc2V0dGluZ3M6IEFueUZlYXR1cmVbXSkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgb25seSBydW4gaWYgYENoZWNrLnBhZ2UoJ3NldHRpbmdzKWAgcmV0dXJucyB0cnVlICYgaXMgcGFzc2VkIGhlcmVcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cChgbmV3IFNldHRpbmdzKClgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyB0YWJsZSBoYXMgbG9hZGVkXG4gICAgICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnI21haW5Cb2R5ID4gdGFibGUnKS50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgW00rXSBTdGFydGluZyB0byBidWlsZCBTZXR0aW5ncyB0YWJsZS4uLmApO1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgdGFibGUgZWxlbWVudHNcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nTmF2OiBFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gdGFibGUnKSE7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1RpdGxlOiBIVE1MSGVhZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XG4gICAgICAgICAgICAgICAgbGV0IHBhZ2VTY29wZTogU2V0dGluZ0dsb2JPYmplY3Q7XG5cbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGFibGUgZWxlbWVudHMgYWZ0ZXIgdGhlIFByZWYgbmF2YmFyXG4gICAgICAgICAgICAgICAgc2V0dGluZ05hdi5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgc2V0dGluZ1RpdGxlKTtcbiAgICAgICAgICAgICAgICBzZXR0aW5nVGl0bGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHNldHRpbmdUYWJsZSk7XG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNldHRpbmdUYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogJ2NvbHRhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgY2VsbHNwYWNpbmc6ICcxJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICd3aWR0aDoxMDAlO21pbi13aWR0aDoxMDAlO21heC13aWR0aDoxMDAlOycsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2V0dGluZ1RpdGxlLmlubmVySFRNTCA9ICdNQU0rIFNldHRpbmdzJztcbiAgICAgICAgICAgICAgICAvLyBHcm91cCBzZXR0aW5ncyBieSBwYWdlXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2NvcGVzKHNldHRpbmdzKVxuICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0YWJsZSBIVE1MIGZyb20gZmVhdHVyZSBzZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlU2NvcGUgPSBzY29wZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYnVpbGRUYWJsZShzY29wZXMpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgY29udGVudCBpbnRvIHRoZSBuZXcgdGFibGUgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ1RhYmxlLmlubmVySFRNTCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBNQU0rIFNldHRpbmdzIHRhYmxlIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VTY29wZTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2V0dGluZ3Moc2NvcGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZXM7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2V0dGluZ3MgYXJlIGRvbmUgbG9hZGluZ1xuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc3VibWl0JykhXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29weUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9jb3B5JykhXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzdGVCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfaW5qZWN0JykhXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNzVGltZXI6IG51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVTZXR0aW5ncyhzc1RpbWVyLCBzY29wZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4ocGFzdGVCdG4sIHRoaXMuX3Bhc3RlU2V0dGluZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9jb3B5U2V0dGluZ3MoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInR5cGVzLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzdHlsZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2NvcmUudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9nbG9iYWwudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9icm93c2UudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9mcmVlbGVlY2gudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9mb3J1bS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2hvbWUudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9yZXF1ZXN0LnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvc2hvdXQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy90b3IudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy91cGxvYWQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy91c2VyLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdmF1bHQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9zdG9yZS50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZmVhdHVyZXMudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNldHRpbmdzLnRzXCIgLz5cblxuLyoqXG4gKiAqIFVzZXJzY3JpcHQgbmFtZXNwYWNlXG4gKiBAY29uc3RhbnQgQ0hBTkdFTE9HOiBPYmplY3QgY29udGFpbmluZyBhIGxpc3Qgb2YgY2hhbmdlcyBhbmQga25vd24gYnVnc1xuICogQGNvbnN0YW50IFRJTUVTVEFNUDogUGxhY2Vob2xkZXIgaG9vayBmb3IgdGhlIGN1cnJlbnQgYnVpbGQgdGltZVxuICogQGNvbnN0YW50IFZFUlNJT046IFRoZSBjdXJyZW50IHVzZXJzY3JpcHQgdmVyc2lvblxuICogQGNvbnN0YW50IFBSRVZfVkVSOiBUaGUgbGFzdCBpbnN0YWxsZWQgdXNlcnNjcmlwdCB2ZXJzaW9uXG4gKiBAY29uc3RhbnQgRVJST1JMT0c6IFRoZSB0YXJnZXQgYXJyYXkgZm9yIGxvZ2dpbmcgZXJyb3JzXG4gKiBAY29uc3RhbnQgUEFHRV9QQVRIOiBUaGUgY3VycmVudCBwYWdlIFVSTCB3aXRob3V0IHRoZSBzaXRlIGFkZHJlc3NcbiAqIEBjb25zdGFudCBNUF9DU1M6IFRoZSBNQU0rIHN0eWxlc2hlZXRcbiAqIEBjb25zdGFudCBydW4oKTogU3RhcnRzIHRoZSB1c2Vyc2NyaXB0XG4gKi9cbm5hbWVzcGFjZSBNUCB7XG4gICAgZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ2RlYnVnJykgPyB0cnVlIDogZmFsc2U7XG4gICAgZXhwb3J0IGNvbnN0IENIQU5HRUxPRzogQXJyYXlPYmplY3QgPSB7XG4gICAgICAgIC8qIPCfhpXimbvvuI/wn5CeICovXG4gICAgICAgIFVQREFURV9MSVNUOiBbXG4gICAgICAgICAgICAn8J+GlTogQWRkZWQgR2lmdCBBbGwgYnV0dG9uIHRvIHRoZSBOZXcgVXNlcnMgcGFnZS4gVGhhbmtzIEBzaGVybWFuNzY0MDAhISEnLFxuICAgICAgICAgICAgJ/CfhpU6IEFkZGVkIGEgc3BvdCB0byBzYXZlIG5vdGVzIG9uIHVzZXIgcGFnZXMuIEFsc28gdGhhbmtzIEBzaGVybWFuNzY0MDAhJyxcbiAgICAgICAgXSBhcyBzdHJpbmdbXSxcbiAgICAgICAgQlVHX0xJU1Q6IFtdIGFzIHN0cmluZ1tdLFxuICAgIH07XG4gICAgZXhwb3J0IGNvbnN0IFRJTUVTVEFNUDogc3RyaW5nID0gJyMjbWV0YV90aW1lc3RhbXAjIyc7XG4gICAgZXhwb3J0IGNvbnN0IFZFUlNJT046IHN0cmluZyA9IENoZWNrLm5ld1ZlcjtcbiAgICBleHBvcnQgY29uc3QgUFJFVl9WRVI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IENoZWNrLnByZXZWZXI7XG4gICAgZXhwb3J0IGNvbnN0IEVSUk9STE9HOiBzdHJpbmdbXSA9IFtdO1xuICAgIGV4cG9ydCBjb25zdCBQQUdFX1BBVEg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICBleHBvcnQgY29uc3QgTVBfQ1NTOiBTdHlsZSA9IG5ldyBTdHlsZSgpO1xuICAgIGV4cG9ydCBjb25zdCBzZXR0aW5nc0dsb2I6IEFueUZlYXR1cmVbXSA9IFtdO1xuXG4gICAgZXhwb3J0IGNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqICogUFJFIFNDUklQVFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc29sZS5ncm91cChgV2VsY29tZSB0byBNQU0rIHYke1ZFUlNJT059IWApO1xuXG4gICAgICAgIC8vIFRoZSBjdXJyZW50IHBhZ2UgaXMgbm90IHlldCBrbm93blxuICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcbiAgICAgICAgQ2hlY2sucGFnZSgpO1xuICAgICAgICAvLyBBZGQgYSBzaW1wbGUgY29va2llIHRvIGFubm91bmNlIHRoZSBzY3JpcHQgaXMgYmVpbmcgdXNlZFxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSAnbXBfZW5hYmxlZD0xO2RvbWFpbj1teWFub25hbW91c2UubmV0O3BhdGg9LztzYW1lc2l0ZT1sYXgnO1xuICAgICAgICAvLyBJbml0aWFsaXplIGNvcmUgZnVuY3Rpb25zXG4gICAgICAgIGNvbnN0IGFsZXJ0czogQWxlcnRzID0gbmV3IEFsZXJ0cygpO1xuICAgICAgICBuZXcgRGVidWcoKTtcbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIGlmIHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcbiAgICAgICAgQ2hlY2sudXBkYXRlZCgpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkgYWxlcnRzLm5vdGlmeShyZXN1bHQsIENIQU5HRUxPRyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBmZWF0dXJlc1xuICAgICAgICBuZXcgSW5pdEZlYXR1cmVzKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICogU0VUVElOR1NcbiAgICAgICAgICovXG4gICAgICAgIENoZWNrLnBhZ2UoJ3NldHRpbmdzJykudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJQZzogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgJiYgKHN1YlBnID09PSAnJyB8fCBzdWJQZyA9PT0gJz92aWV3PWdlbmVyYWwnKSkge1xuICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIHNldHRpbmdzIHBhZ2VcbiAgICAgICAgICAgICAgICBTZXR0aW5ncy5pbml0KHJlc3VsdCwgc2V0dGluZ3NHbG9iKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICogU1RZTEVTXG4gICAgICAgICAqIEluamVjdHMgQ1NTXG4gICAgICAgICAqL1xuICAgICAgICBDaGVjay5lbGVtTG9hZCgnaGVhZCBsaW5rW2hyZWYqPVwiSUNHc3RhdGlvblwiXScpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQWRkIGN1c3RvbSBDU1Mgc2hlZXRcbiAgICAgICAgICAgIE1QX0NTUy5pbmplY3RMaW5rKCk7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgc2l0ZSB0aGVtZVxuICAgICAgICAgICAgTVBfQ1NTLmFsaWduVG9TaXRlVGhlbWUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH07XG59XG5cbi8vICogU3RhcnQgdGhlIHVzZXJzY3JpcHRcbk1QLnJ1bigpO1xuIl19
