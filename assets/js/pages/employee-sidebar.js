/* ==========================================================
   LDIMS — COMMON EMPLOYEE SIDEBAR
   ----------------------------------------------------------
   One standard navigation for all Employee pages.
   The active page is detected automatically.
========================================================== */

(function () {

    "use strict";


    /* ======================================================
       DETECT CURRENT PAGE
    ====================================================== */

    function getCurrentPage() {

        const path = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

        return path || "dashboard.html";
    }


    /* ======================================================
       DETECT PAGE DEPTH
       ------------------------------------------------------
       Normal Employee pages:
       /employee/dashboard.html

       Nested Employee pages:
       /employee/requests/request-status.html
    ====================================================== */

    function getEmployeeBasePath() {

        const pathname =
            window.location.pathname.toLowerCase();

        if (
            pathname.includes("/employee/requests/")
        ) {

            return "../";

        }

        return "";
    }


    /* ======================================================
       BUILD SIDEBAR
    ====================================================== */

    function buildEmployeeSidebar() {

        const sidebar =
            document.querySelector(".sidebar");

        if (!sidebar) {
            return;
        }


        const currentPage =
            getCurrentPage();


        const basePath =
            getEmployeeBasePath();


        const menu = [

            {
                href: "dashboard.html",
                icon: "bi-speedometer2",
                label: "Dashboard",
                pages: [
                    "dashboard.html"
                ]
            },

            {
                href: "profile.html",
                icon: "bi-person",
                label: "My Profile",
                pages: [
                    "profile.html"
                ]
            },

            {
                href: "training-records.html",
                icon: "bi-mortarboard",
                label: "Training Records",
                pages: [
                    "training-records.html"
                ]
            },

            {
                href: "certificates.html",
                icon: "bi-folder-check",
                label: "Certificates",
                pages: [
                    "certificates.html"
                ]
            },

            {
                href: "learning-history.html",
                icon: "bi-book",
                label: "Learning Passport",
                pages: [
                    "learning-history.html",
                    "learning-passport.html"
                ]
            },

            {
                href: "lna.html",
                icon: "bi-clipboard2-check",
                label: "Learning Needs Assessment",
                pages: [
                    "lna.html"
                ]
            },

            {
                href: "idp.html",
                icon: "bi-journal-text",
                label: "My IDP",
                pages: [
                    "idp.html"
                ]
            },

            {
                href: "notifications.html",
                icon: "bi-bell",
                label: "Notifications",
                pages: [
                    "notifications.html"
                ]
            },

            {
                href: "requests/request-status.html",
                icon: "bi-file-earmark-text",
                label: "Request Status",
                pages: [
                    "request-status.html"
                ]
            },

            {
                href: "edit-profile.html",
                icon: "bi-gear",
                label: "Edit Profile",
                pages: [
                    "edit-profile.html"
                ]
            }

        ];


        let html =
            '<div class="sidebar-menu">';


        menu.forEach(function (item) {

            const isActive =
                item.pages.indexOf(
                    currentPage
                ) !== -1;


            html += `
                <a
                    href="${basePath}${item.href}"
                    class="sidebar-link${isActive ? " active" : ""}"
                >
                    <i class="bi ${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            `;

        });


        html += `
            <a
                href="#"
                id="logoutLink"
                class="sidebar-link"
            >
                <i class="bi bi-box-arrow-right"></i>
                <span>Logout</span>
            </a>
        `;


        html += "</div>";


        sidebar.innerHTML =
            html;


        initializeEmployeeLogout();

    }


    /* ======================================================
       LOGOUT
    ====================================================== */

    function initializeEmployeeLogout() {

        const logoutLink =
            document.getElementById(
                "logoutLink"
            );


        if (!logoutLink) {
            return;
        }


        logoutLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                if (
                    typeof Session !== "undefined" &&
                    typeof Session.logout === "function"
                ) {

                    Session.logout();

                    return;
                }


                window.location.href =
                    "../index.html";

            }
        );

    }


    /* ======================================================
       INITIALIZE
    ====================================================== */

    function initialize() {

        buildEmployeeSidebar();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();