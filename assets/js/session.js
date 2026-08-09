/**
 * ============================================================
 * LDIMS SESSION MANAGER
 * ------------------------------------------------------------
 * Handles user session storage and authentication.
 * ============================================================
 */

const Session = {

    /**
     * Save session data
     * @param {Object} userData
     */
    save(userData) {
        localStorage.setItem(
            CONFIG.SESSION.STORAGE_KEY,
            JSON.stringify(userData)
        );
    },

    /**
     * Get session data
     * @returns {Object|null}
     */
    get() {

        const session = localStorage.getItem(
            CONFIG.SESSION.STORAGE_KEY
        );

        return session ? JSON.parse(session) : null;

    },

    /**
     * Check if user is logged in
     * @returns {Boolean}
     */
    isLoggedIn() {

        return this.get() !== null;

    },

    /**
     * Remove session
     */
    clear() {

        localStorage.removeItem(
            CONFIG.SESSION.STORAGE_KEY
        );

    },

    /**
     * Logout user
     */
    logout() {

        this.clear();

        window.location.href = "../index.html";

    },

    /**
     * Protect pages from unauthorized access
     */
    requireLogin() {

        if (!this.isLoggedIn()) {

            window.location.href = "../index.html";

        }

    }

};