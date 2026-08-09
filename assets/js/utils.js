/**
 * ============================================================
 * LDIMS UTILITY LIBRARY
 * ------------------------------------------------------------
 * Common reusable helper functions
 * ============================================================
 */

const Utils = {

    /**
     * Format Date
     * @param {String|Date} date
     * @returns {String}
     */
    formatDate(date) {

        if (!date) return "";

        return new Date(date).toLocaleDateString(
            CONFIG.DATE.LOCALE,
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    },



    /**
     * Show Alert
     * @param {String} message
     */
    alert(message) {

        window.alert(message);

    },



    /**
     * Show Confirm Dialog
     * @param {String} message
     * @returns {Boolean}
     */
    confirm(message) {

        return window.confirm(message);

    },



    /**
     * Generate Random ID
     * @returns {String}
     */
    generateId() {

        return Date.now().toString(36) +
               Math.random().toString(36).substring(2, 8);

    },



    /**
     * Check Empty Value
     * @param {*} value
     * @returns {Boolean}
     */
    isEmpty(value) {

        return (
            value === null ||
            value === undefined ||
            value === ""
        );

    },



    /**
     * Trim String
     * @param {String} value
     * @returns {String}
     */
    clean(value) {

        return value ? value.trim() : "";

    },



    /**
     * Console Logger
     */
    log(...args) {

        console.log("[LDIMS]", ...args);

    }

};