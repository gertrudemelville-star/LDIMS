/* ==========================================================
   LDIMS Component Loader
   Version: 1.0
========================================================== */

"use strict";

/* ==========================================================
   Get Base Path
========================================================== */

function getBasePath() {

    const path = window.location.pathname.toLowerCase();

    // Root
    if (
        path.endsWith("/index.html") ||
        path.endsWith("/dashboard.html")
    ) {
        return "";
    }

    // employee/
    if (path.includes("/employee/")) {

        if (path.includes("/employee/requests/")) {
            return "../../";
        }

        return "../";
    }

    // supervisor/
    if (path.includes("/supervisor/")) {
        return "../";
    }

    // ldd/
    if (path.includes("/ldd/")) {
        return "../";
    }

    return "";
}

/* ==========================================================
   Load Component
========================================================== */

async function loadComponent(id, file) {

    try {

        const base = getBasePath();

        const response = await fetch(base + "components/" + file);

        if (!response.ok) {

            throw new Error("Unable to load " + file);

        }

        const html = await response.text();

        const target = document.getElementById(id);

        if (target) {

            target.innerHTML = html;

        }

    } catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   Initialize Layout
========================================================== */

async function initializeLayout() {

    await Promise.all([

        loadComponent("navbar", "navbar.html"),

        loadComponent("sidebar", "sidebar.html"),

        loadComponent("footer", "footer.html")

    ]);

    initializeNavigation();

}

/* ==========================================================
   Navigation
========================================================== */

function initializeNavigation() {

    const base = getBasePath();

    const routes = {

        dashboard: base + "employee/dashboard.html",

        profile: base + "employee/profile.html",

        editProfile: base + "employee/edit-profile.html",

        training: base + "employee/training-records.html",

        history: base + "employee/learning-history.html",

        certificates: base + "employee/certificates.html",

        lna: base + "employee/lna.html",

        notifications: base + "employee/notifications.html",

        requestStatus: base + "employee/requests/request-status.html"

    };

    bind("navDashboard", routes.dashboard);

    bind("menuDashboard", routes.dashboard);

    bind("menuProfile", routes.profile);

    bind("menuEditProfile", routes.editProfile);

    bind("menuTraining", routes.training);

    bind("menuHistory", routes.history);

    bind("menuCertificates", routes.certificates);

    bind("menuLNA", routes.lna);

    bind("menuNotifications", routes.notifications);

    bind("menuRequestStatus", routes.requestStatus);

}

/* ==========================================================
   Bind Link
========================================================== */

function bind(id, url) {

    const element = document.getElementById(id);

    if (!element) return;

    element.addEventListener("click", function (e) {

        e.preventDefault();

        window.location.href = url;

    });

}

/* ==========================================================
   Start
========================================================== */

document.addEventListener("DOMContentLoaded", initializeLayout);