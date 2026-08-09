/**
 * ============================================================
 * LDIMS - Learning & Development Information Management System
 * National Bureau of Investigation
 * Learning and Development Division
 * ------------------------------------------------------------
 * Global Configuration File
 * Version: 1.0.0
 * ============================================================
 */

const CONFIG = {

    // =========================================================
    // APPLICATION
    // =========================================================

    APP_NAME: "Learning & Development Information Management System",

    SHORT_NAME: "LDIMS",

    VERSION: "1.0.0",

    AGENCY: "National Bureau of Investigation",

    DIVISION: "Learning and Development Division",

    COPYRIGHT_YEAR: new Date().getFullYear(),



    // =========================================================
    // GOOGLE APPS SCRIPT WEB APP
    // =========================================================

API: {

    BASE_URL: "https://script.google.com/macros/s/AKfycbwNgxfll1bMXosYU_QjLv5WyiHwek8gSFJWY1EhZtr94q8G_Alqyth1DocbzPjSAW3_9A/exec",

    TIMEOUT: 30000

},



    // =========================================================
    // SESSION
    // =========================================================

    SESSION: {

        STORAGE_KEY: "LDIMS_SESSION",

        TIMEOUT_MINUTES: 30

    },



    // =========================================================
    // THEME
    // =========================================================

    THEME: {

        PRIMARY: "#6A1B9A",

        SECONDARY: "#8E24AA",

        SUCCESS: "#2E7D32",

        WARNING: "#F9A825",

        DANGER: "#C62828",

        INFO: "#1565C0"

    },



    // =========================================================
    // DATE FORMAT
    // =========================================================

    DATE: {

        LOCALE: "en-PH",

        TIMEZONE: "Asia/Manila"

    },



    // =========================================================
    // USER ROLES
    // =========================================================

    ROLES: {

        EMPLOYEE: "EMPLOYEE",

        SUPERVISOR: "SUPERVISOR",

        ADMIN: "ADMIN"

    }

};

Object.freeze(CONFIG);