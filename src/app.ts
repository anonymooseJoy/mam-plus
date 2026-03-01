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
namespace MP {
    export const DEBUG: boolean | undefined = GM_getValue('debug') ? true : false;
    const NATIVE_CONSOLE = globalThis.console;
    export const CHANGELOG: ArrayObject = {
        /* 🆕♻️🐞 */
        UPDATE_LIST: [
            '🆕: Added Gift All button to the New Users page. Thanks @sherman76400!!!',
            '🆕: Added a spot to save notes on user pages. Also thanks @sherman76400!',
        ] as string[],
        BUG_LIST: [] as string[],
    };
    export const TIMESTAMP: string = '##meta_timestamp##';
    export const VERSION: string = Check.newVer;
    export const PREV_VER: string | undefined = Check.prevVer;
    export const ERRORLOG: string[] = [];
    export const PAGE_PATH: string = window.location.pathname;
    export const MP_CSS: Style = new Style();
    export const settingsGlob: AnyFeature[] = [];

    const writeLog = (level: 'log' | 'info' | 'warn' | 'error' | 'debug', ...args: unknown[]) => {
        if (level === 'debug' && !DEBUG) return;
        NATIVE_CONSOLE[level](...args);
    };

    export const log = (...args: unknown[]) => writeLog('log', ...args);
    export const info = (...args: unknown[]) => writeLog('info', ...args);
    export const warn = (...args: unknown[]) => writeLog('warn', ...args);
    export const error = (...args: unknown[]) => writeLog('error', ...args);
    export const debug = (...args: unknown[]) => writeLog('debug', ...args);
    export const group = (...args: unknown[]) => NATIVE_CONSOLE.group(...args);
    export const groupEnd = () => NATIVE_CONSOLE.groupEnd();
    export const featureLog = (message: string) => log(`[M+] ${message}`);

    export const run = async () => {
        /**
         * * PRE SCRIPT
         */
        group(`Welcome to MAM+ v${VERSION}!`);

        // The current page is not yet known
        GM_deleteValue('mp_currentPage');
        Check.page();
        // Add a simple cookie to announce the script is being used
        document.cookie = 'mp_enabled=1;domain=myanonamouse.net;path=/;samesite=lax';
        // Initialize core functions
        const alerts: Alerts = new Alerts();
        new Debug();
        // Notify the user if the script was updated
        Check.updated().then((result) => {
            if (result) alerts.notify(result, CHANGELOG);
        });
        // Initialize the features
        new InitFeatures();

        /**
         * * SETTINGS
         */
        Check.page('settings').then((result) => {
            if (result === true) {
                // Initialize the settings page
                Settings.init(result, settingsGlob);
            }
        });

        /**
         * * STYLES
         * Injects CSS
         */
        Check.elemLoad('head link[href*="ICGstation"]').then(() => {
            // Add custom CSS sheet
            MP_CSS.injectLink();
            // Get the current site theme
            MP_CSS.alignToSiteTheme();
        });

        groupEnd();
    };
}

// * Start the userscript
MP.run();
