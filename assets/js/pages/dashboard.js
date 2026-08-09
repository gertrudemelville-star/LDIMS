/* ==========================================================
   LDIMS - Dashboard
   Module: Dashboard
========================================================== */

"use strict";

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    Session.requireLogin();

    loadDashboard();

    initializeLogout();

});


/* ==========================================================
   Load User Information
========================================================== */

function loadDashboard() {

    const user = Session.get();

    if (!user) {

        Session.logout();

        return;

    }

    setValue("fullname", user.fullname);
    setValue("position", user.position);
    setValue("assignment", user.assignment);
    setValue("role", user.role);
    setValue("email", user.email);

}


/* ==========================================================
   Helper
========================================================== */

function setValue(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value || "-";

}


/* ==========================================================
   Logout
========================================================== */

function initializeLogout() {

    document
        .getElementById("logoutBtn")
        ?.addEventListener("click", () => {

            if (confirm("Are you sure you want to logout?")) {

                Session.logout();

            }

        });

}