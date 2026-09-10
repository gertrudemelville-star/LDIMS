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
   PENDING NEW USER REGISTRATIONS
========================================================== */

let pendingNewUsers = [];


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


/* ==========================================================
   RENDER PENDING NEW USER REGISTRATIONS
========================================================== */

function renderPendingNewUsers() {

    const tableBody =
        document.getElementById(
            "pendingNewUsersTableBody"
        );


    const countElement =
        document.getElementById(
            "pendingNewUsers"
        );


    if (countElement) {

        countElement.textContent =
            pendingNewUsers.length;

    }


    if (!tableBody) {
        return;
    }


    if (
        !pendingNewUsers ||
        pendingNewUsers.length === 0
    ) {

        renderNoPendingRegistrations();

        return;

    }


    tableBody.innerHTML =
        pendingNewUsers
            .map(
                registration => {

                    const employeeID =
                        registration.employeeID ||
                        registration.EmployeeID ||
                        "";


                    const lastName =
                        registration.lastName ||
                        registration.LastName ||
                        "";


                    const firstName =
                        registration.firstName ||
                        registration.FirstName ||
                        "";


                    const middleName =
                        registration.middleName ||
                        registration.MiddleName ||
                        "";


                    const nameExtension =
                        registration.nameExtension ||
                        registration.NameExtension ||
                        "";


                    const fullName =
                        [
                            lastName,
                            firstName,
                            middleName
                        ]
                            .filter(Boolean)
                            .join(", ")
                            .replace(
                                ", " +
                                middleName,
                                " " +
                                middleName
                            ) +
                        (
                            nameExtension
                                ? " " +
                                  nameExtension
                                : ""
                        );


                    const position =
                        registration.position ||
                        registration.Position ||
                        "—";


                    const assignment =
                        registration.placeOfAssignment ||
                        registration.PlaceOfAssignment ||
                        "—";


                    const email =
                        registration.email ||
                        registration.Email ||
                        "—";


                    const registrationDate =
                        registration.registrationDate ||
                        registration.RegistrationDate ||
                        "—";


                    return `

                        <tr>

                            <td>
                                ${escapeHTML(employeeID)}
                            </td>

                            <td>
                                ${escapeHTML(
                                    fullName ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(position)}
                            </td>

                            <td>
                                ${escapeHTML(assignment)}
                            </td>

                            <td>
                                ${escapeHTML(email)}
                            </td>

                            <td>
                                ${escapeHTML(
                                    registrationDate
                                )}
                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-primary"
                                    onclick="reviewPendingRegistration('${escapeAttribute(employeeID)}')">

                                    <i class="bi bi-eye"></i>
                                    Review

                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* ==========================================================
   REVIEW PENDING REGISTRATION
========================================================== */

function reviewPendingRegistration(
    employeeID
) {

    const registration =
        pendingNewUsers.find(
            item =>
                String(
                    item.employeeID ||
                    item.EmployeeID ||
                    ""
                ) ===
                String(employeeID)
        );


    if (!registration) {

        alert(
            "Registration record not found."
        );

        return;

    }


    const fullName =
        [
            registration.lastName ||
                registration.LastName ||
                "",
            registration.firstName ||
                registration.FirstName ||
                "",
            registration.middleName ||
                registration.MiddleName ||
                ""
        ]
            .filter(Boolean)
            .join(", ");


    const designation =
        registration.designation ||
        registration.Designation ||
        "—";


    const position =
        registration.position ||
        registration.Position ||
        "—";


    const assignment =
        registration.placeOfAssignment ||
        registration.PlaceOfAssignment ||
        "—";


    const email =
        registration.email ||
        registration.Email ||
        "—";


    const contactNumber =
        registration.contactNumber ||
        registration.ContactNumber ||
        "—";


    const employmentStatus =
        registration.employmentStatus ||
        registration.EmploymentStatus ||
        "Not provided";


    const registrationDate =
        registration.registrationDate ||
        registration.RegistrationDate ||
        "—";


    const modalElement =
        document.getElementById(
            "pendingRegistrationModal"
        );


    if (modalElement) {

        const modalBody =
            modalElement.querySelector(
                ".modal-body"
            );


        if (modalBody) {

            modalBody.innerHTML = `

                <div class="row g-3">

                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Employee ID
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(
                                registration.employeeID ||
                                registration.EmployeeID ||
                                "—"
                            )}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Full Name
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(
                                fullName ||
                                "—"
                            )}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Position
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(position)}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Designation
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(designation)}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Place of Assignment
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(assignment)}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Email
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(email)}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Contact Number
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(contactNumber)}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Employment Status
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(
                                employmentStatus
                            )}
                        </div>

                    </div>


                    <div class="col-12">

                        <label class="form-label fw-semibold">
                            Registration Date
                        </label>

                        <div class="form-control bg-light">
                            ${escapeHTML(
                                registrationDate
                            )}
                        </div>

                    </div>

                </div>

            `;

        }


        const approveButton =
            modalElement.querySelector(
                "#approveRegistrationButton"
            );


        if (approveButton) {

            approveButton.onclick =
                function () {

                    approvePendingRegistration(
                        employeeID
                    );

                };

        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

        return;

    }


    /*
     * Fallback for dashboards that do not yet
     * contain the Bootstrap modal markup.
     */

    const message =
        [
            "Employee ID: " +
                (
                    registration.employeeID ||
                    registration.EmployeeID ||
                    "—"
                ),

            "Full Name: " +
                (fullName || "—"),

            "Position: " +
                position,

            "Designation: " +
                designation,

            "Place of Assignment: " +
                assignment,

            "Email: " +
                email,

            "Contact Number: " +
                contactNumber,

            "Employment Status: " +
                employmentStatus,

            "Registration Date: " +
                registrationDate
        ]
            .join("\n");


    alert(message);

}


/* ==========================================================
   APPROVE & ACTIVATE REGISTRATION
========================================================== */

async function approvePendingRegistration(
    employeeID
) {

    const currentUser =
        typeof Session !== "undefined" &&
        typeof Session.get === "function"
            ? Session.get()
            : null;


    if (
        !currentUser ||
        !canApproveNewUsers(currentUser)
    ) {

        alert(
            "You are not authorized to approve new user registrations."
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Approve and activate this employee account?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await API.approveRegistration(
                employeeID,
                currentUser.employeeID
            );


        console.log(
            "LDD Registration Approval:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response?.message ||
                "Unable to approve registration."
            );

        }


        alert(
            response.message ||
            "Registration approved and account activated successfully."
        );


        const modalElement =
            document.getElementById(
                "pendingRegistrationModal"
            );


        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                );


            if (modal) {
                modal.hide();
            }

        }


        await loadPendingRegistrations();


    } catch (error) {

        console.error(
            "Registration approval failed:",
            error
        );


        alert(
            error.message ||
            "Unable to approve registration."
        );

    }

}


/* ==========================================================
   HTML ESCAPING
========================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
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

            await loadPendingRegistrations();

        } else {

            renderNoPendingRegistrations();

        }

    } catch (error) {

        console.error(
            "New User Approval loading failed:",
            error
        );


        renderNoPendingRegistrations();

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

            <td colspan="7">

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