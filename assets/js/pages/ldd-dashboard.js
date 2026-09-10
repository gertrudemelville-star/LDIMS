/* ==========================================================
   LDIMS - LDD Dashboard
   Learning & Development Division
========================================================== */

"use strict";


/* ==========================================================
   AUTHORIZED NEW USER APPROVAL ROLES
========================================================== */

const NEW_USER_APPROVAL_ROLES = [
    "LDD Supervisor",
    "LDD Assistant Chief",
    "LDD Chief"
];


function canApproveNewUsers(user) {

    if (!user) {
        return false;
    }

    const role =
        String(user.role || "")
            .trim()
            .toLowerCase();

    return NEW_USER_APPROVAL_ROLES.some(
        allowedRole =>
            role === allowedRole.toLowerCase()
    );

}


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            if (
                typeof Session !== "undefined" &&
                typeof Session.requireLogin === "function"
            ) {

                Session.requireLogin();

            }


            const user =
                typeof Session !== "undefined" &&
                typeof Session.get === "function"
                    ? Session.get()
                    : null;


            if (!user) {
                return;
            }


            /* --------------------------------------------------
               HEADER ROLE
            -------------------------------------------------- */

            const headerRole =
                document.getElementById(
                    "headerRole"
                );


            if (headerRole) {

                headerRole.textContent =
                    user.role ||
                    "LDD Personnel";

            }


            /* --------------------------------------------------
               NEW USER APPROVAL VISIBILITY
            -------------------------------------------------- */

            const approvalSection =
                document.getElementById(
                    "newUserApprovalSection"
                );


            if (approvalSection) {

                if (
                    canApproveNewUsers(user)
                ) {

                    approvalSection.hidden =
                        false;

                } else {

                    approvalSection.hidden =
                        true;

                }

            }


            /* --------------------------------------------------
               LOAD DASHBOARD
            -------------------------------------------------- */

            await loadLDDDashboard();


            /* --------------------------------------------------
               LOGOUT
            -------------------------------------------------- */

            initializeLogout();


        } catch (error) {

            console.error(
                "LDD Dashboard initialization failed:",
                error
            );

        }

    }
);


/* ==========================================================
   LOAD DASHBOARD
========================================================== */

async function loadLDDDashboard() {

    /* ======================================================
       TOTAL EMPLOYEES
       Failure here must NOT stop the rest of dashboard.
    ====================================================== */

    try {

        const employeesResponse =
            await API.getEmployees();


        console.log(
            "LDD Employees:",
            employeesResponse
        );


        if (
            employeesResponse &&
            employeesResponse.success === true
        ) {

            const employees =
                employeesResponse.data ||
                employeesResponse.employees ||
                [];


            const totalEmployees =
                document.getElementById(
                    "totalEmployees"
                );


            if (totalEmployees) {

                totalEmployees.textContent =
                    employees.length;

            }

        }

    } catch (error) {

        console.error(
            "Unable to load LDD employees:",
            error
        );

    }


    /* ======================================================
       TRAINING RECORDS
       Failure here must NOT stop New User Approval.
    ====================================================== */

    try {

        let trainingResponse;


        if (
            typeof API.getAllTrainingRecordsForLDD ===
            "function"
        ) {

            trainingResponse =
                await API.getAllTrainingRecordsForLDD();

        } else {

            trainingResponse =
                await API.getTrainingRecords();

        }


        console.log(
            "LDD Training Records:",
            trainingResponse
        );


        if (
            trainingResponse &&
            trainingResponse.success === true
        ) {

            const records =
                trainingResponse.data ||
                trainingResponse.records ||
                [];


            const totalTrainings =
                document.getElementById(
                    "totalTrainings"
                );


            if (totalTrainings) {

                totalTrainings.textContent =
                    records.length;

            }


            let totalHours = 0;


            records.forEach(
                record => {

                    const hours =
                        parseFloat(
                            record.totalHours ||
                            record.TotalHours ||
                            record["TOTAL HOURS"] ||
                            0
                        );


                    if (
                        !isNaN(hours)
                    ) {

                        totalHours +=
                            hours;

                    }

                }
            );


            const learningHours =
                document.getElementById(
                    "totalLearningHours"
                );


            if (learningHours) {

                learningHours.textContent =
                    totalHours;

            }

        }

    } catch (error) {

        console.error(
            "Unable to load LDD training records:",
            error
        );

    }


    /* ======================================================
       LNA
    ====================================================== */

    const lnaCompleted =
        document.getElementById(
            "lnaCompleted"
        );


    if (lnaCompleted) {

        lnaCompleted.textContent =
            "—";

    }


    /* ======================================================
       NEW USER APPROVAL

       This MUST run independently from Employees
       and Training APIs.
    ====================================================== */

    try {

        const currentUser =
            typeof Session !== "undefined" &&
            typeof Session.get === "function"
                ? Session.get()
                : null;


        console.log(
            "LDD CURRENT USER:",
            currentUser
        );


        if (
            canApproveNewUsers(
                currentUser
            )
        ) {

  /* ==========================================================
   LOAD PENDING NEW USER REGISTRATIONS
========================================================== */

async function loadPendingRegistrations() {

    const currentUser =
        typeof Session !== "undefined" &&
        typeof Session.get === "function"
            ? Session.get()
            : null;


    if (
        !currentUser ||
        !canApproveNewUsers(currentUser)
    ) {

        return;

    }


    const countElement =
        document.getElementById(
            "pendingNewUsers"
        );


    const tableBody =
        document.getElementById(
            "pendingNewUsersTableBody"
        );


    try {

        if (countElement) {

            countElement.textContent =
                "…";

        }


        const response =
            await API.getPendingRegistrations(
                currentUser.employeeID
            );


        console.log(
            "LDD New User Registrations:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response?.message ||
                "Unable to load pending registrations."
            );

        }


        pendingNewUsers =
            response.registrations ||
            response.data ||
            [];


        if (
            !Array.isArray(
                pendingNewUsers
            )
        ) {

            pendingNewUsers = [];

        }


        if (countElement) {

            countElement.textContent =
                pendingNewUsers.length;

        }


        renderPendingNewUsers();


    } catch (error) {

        console.error(
            "New User Registration loading failed:",
            error
        );


        pendingNewUsers = [];


        if (countElement) {

            countElement.textContent =
                "0";

        }


        if (tableBody) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center text-danger py-4">

                        Unable to load pending registrations.

                    </td>

                </tr>

            `;

        }

    }

}


    /* ======================================================
       RECENT ACTIVITY
    ====================================================== */

    renderNoRecentActivity();

}


/* ==========================================================
   EMPTY STATE - NEW USER APPROVAL
========================================================== */

function renderNoPendingRegistrations() {

    const badge =
        document.getElementById(
            "pendingNewUsers"
        );


    if (badge) {

        badge.textContent =
            "0";

    }


    const tableBody =
        document.getElementById(
            "pendingNewUsersTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `

        <tr class="ldd-empty-row">

            <td colspan="6">

                <div class="ldd-empty-state">

                    <div class="ldd-empty-icon">

                        <i class="bi bi-file-earmark-text"></i>

                    </div>

                    <strong>
                        No pending registrations.
                    </strong>

                    <span>
                        All employee registrations have been processed.
                    </span>

                </div>

            </td>

        </tr>

    `;

}


/* ==========================================================
   EMPTY STATE - RECENT ACTIVITY
========================================================== */

function renderNoRecentActivity() {

    const container =
        document.getElementById(
            "recentActivities"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="ldd-empty-state">

            <div class="ldd-empty-icon">

                <i class="bi bi-file-earmark-text"></i>

            </div>

            <strong>
                No recent activity.
            </strong>

            <span>
                Activity records will appear here once available.
            </span>

        </div>

    `;

}


/* ==========================================================
   LOGOUT
========================================================== */

function initializeLogout() {

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


            localStorage.clear();

            window.location.href =
                "../index.html";

        }
    );

}