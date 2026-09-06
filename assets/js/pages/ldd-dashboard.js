/* ==========================================================
   LDIMS - LDD Dashboard
   Module: Learning & Development Division
========================================================== */

"use strict";


/* ==========================================================
   STATE
========================================================== */

let pendingNewUsers = [];

let selectedPendingUser = null;


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            Session.requireLogin();


            const user =
                Session.get();


            if (!user) {

                return;

            }


            const headerRole =
                document.getElementById(
                    "headerRole"
                );


            if (headerRole) {

                headerRole.textContent =
                    user.role ||
                    "LDD Personnel";

            }


            /*
             * Build approval section dynamically.
             * This prevents the section from being
             * inserted outside the dashboard content.
             */

            buildNewUserApprovalSection();


            await loadLDDDashboard();


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
   LOAD LDD DASHBOARD
========================================================== */

async function loadLDDDashboard() {

    try {

        /* --------------------------------------------------
           EMPLOYEES
        -------------------------------------------------- */

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


        /* --------------------------------------------------
           TRAINING
        -------------------------------------------------- */

        const trainingResponse =
            await API.getTrainingRecords();


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


                    if (!isNaN(hours)) {

                        totalHours += hours;

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


        /* --------------------------------------------------
           LNA
        -------------------------------------------------- */

        const lnaCompleted =
            document.getElementById(
                "lnaCompleted"
            );


        if (lnaCompleted) {

            lnaCompleted.textContent =
                "—";

        }


        /* --------------------------------------------------
           PENDING NEW USERS
        -------------------------------------------------- */

        await loadPendingNewUsers();


    } catch (error) {

        console.error(
            "Unable to load LDD dashboard:",
            error
        );

    }

}


/* ==========================================================
   BUILD NEW USER APPROVAL SECTION
========================================================== */

function buildNewUserApprovalSection() {

    const content =
        document.querySelector(
            ".content"
        );


    if (!content) {

        console.error(
            "LDD dashboard content container not found."
        );

        return;

    }


    /*
     * Remove any previously inserted approval section.
     */

    const oldSection =
        document.getElementById(
            "newUserApprovalSection"
        );


    if (oldSection) {

        oldSection.remove();

    }


    /*
     * Remove the old malformed approval table
     * if it exists in the HTML.
     */

    const oldTableBody =
        document.getElementById(
            "pendingNewUsersTableBody"
        );


    if (oldTableBody) {

        const oldContainer =
            oldTableBody.closest(
                ".card"
            );


        if (oldContainer) {

            oldContainer.remove();

        }

    }


    /*
     * Remove old modal if it exists.
     */

    const oldModal =
        document.getElementById(
            "newUserApprovalModal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    /* ======================================================
       APPROVAL SECTION
    ====================================================== */

    const section =
        document.createElement(
            "div"
        );


    section.id =
        "newUserApprovalSection";


    section.className =
        "card shadow-sm mb-4";


    section.innerHTML = `

        <div class="card-body p-4">

            <div class="
                d-flex
                justify-content-between
                align-items-center
                mb-3
            ">

                <div>

                    <h5
                        class="mb-1"
                        style="color:#4B2E83; font-weight:700;">

                        New User Approval

                    </h5>

                    <p
                        class="text-muted small mb-0">

                        Review and activate new employee
                        registrations.

                    </p>

                </div>


                <span
                    id="pendingNewUsers"
                    class="badge bg-warning text-dark"
                    style="font-size:14px;">

                    0

                </span>

            </div>


            <div
                class="table-responsive"
                style="overflow-x:auto;">

                <table
                    class="table table-hover align-middle mb-0">

                    <thead>

                        <tr>

                            <th>
                                Employee ID
                            </th>

                            <th>
                                Employee
                            </th>

                            <th>
                                Position
                            </th>

                            <th>
                                Place of Assignment
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody
                        id="pendingNewUsersTableBody">

                        <tr>

                            <td
                                colspan="7"
                                class="text-center text-muted py-4">

                                Loading pending registrations...

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    `;


    /*
     * Put approval section BEFORE the existing
     * LDD Monitoring section.
     */

    const monitoringSection =
        findSectionByHeading(
            content,
            "L&D Monitoring"
        );


    if (monitoringSection) {

        monitoringSection.parentNode.insertBefore(
            section,
            monitoringSection
        );

    } else {

        content.insertBefore(
            section,
            content.firstChild
        );

    }


    /* ======================================================
       MODAL
    ====================================================== */

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "newUserApprovalModal";


    modal.className =
        "modal fade";


    modal.tabIndex =
        -1;


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modal.innerHTML = `

        <div
            class="modal-dialog modal-lg modal-dialog-centered">

            <div
                class="modal-content">

                <div
                    class="modal-header">

                    <h5
                        class="modal-title">

                        Review New User Registration

                    </h5>


                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal">

                    </button>

                </div>


                <div
                    class="modal-body">

                    <div
                        class="row g-3">

                        <div class="col-md-4">

                            <label
                                class="form-label text-muted">

                                Employee ID

                            </label>

                            <div
                                id="approvalEmployeeID"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-8">

                            <label
                                class="form-label text-muted">

                                Full Name

                            </label>

                            <div
                                id="approvalFullName"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-6">

                            <label
                                class="form-label text-muted">

                                Position

                            </label>

                            <div
                                id="approvalPosition"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-6">

                            <label
                                class="form-label text-muted">

                                Designation

                            </label>

                            <div
                                id="approvalDesignation"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-6">

                            <label
                                class="form-label text-muted">

                                Place of Assignment

                            </label>

                            <div
                                id="approvalAssignment"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-6">

                            <label
                                class="form-label text-muted">

                                Employment Status

                            </label>

                            <div
                                id="approvalEmploymentStatus"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-6">

                            <label
                                class="form-label text-muted">

                                Email

                            </label>

                            <div
                                id="approvalEmail"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-6">

                            <label
                                class="form-label text-muted">

                                Contact Number

                            </label>

                            <div
                                id="approvalContact"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>


                        <div class="col-md-6">

                            <label
                                class="form-label text-muted">

                                Registration Date

                            </label>

                            <div
                                id="approvalRegistrationDate"
                                class="form-control bg-light">

                                -

                            </div>

                        </div>

                    </div>


                    <div
                        class="alert alert-warning mt-4 mb-0">

                        <strong>
                            Approval Action
                        </strong>

                        <br>

                        Approving this registration will
                        activate the employee's LDIMS account.

                    </div>

                </div>


                <div
                    class="modal-footer">

                    <button
                        type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal">

                        Close

                    </button>


                    <button
                        type="button"
                        id="approveNewUserButton"
                        class="btn btn-success">

                        ✓ Approve & Activate

                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const approveButton =
        document.getElementById(
            "approveNewUserButton"
        );


    if (approveButton) {

        approveButton.addEventListener(
            "click",
            approvePendingNewUser
        );

    }

}


/* ==========================================================
   FIND SECTION BY HEADING
========================================================== */

function findSectionByHeading(
    container,
    text
) {

    const elements =
        container.querySelectorAll(
            "h1, h2, h3, h4, h5, h6"
        );


    for (
        const element of elements
    ) {

        if (
            element.textContent
                .trim()
                .toLowerCase() ===
            text
                .trim()
                .toLowerCase()
        ) {

            return (
                element.closest(
                    ".card"
                ) ||
                element.parentElement
            );

        }

    }


    return null;

}


/* ==========================================================
   LOAD PENDING NEW USERS
========================================================== */

async function loadPendingNewUsers() {

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
            await API.post({

                action:
                    "getPendingEmployees"

            });


        console.log(
            "LDD Pending New Users:",
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
            response.employees ||
            response.data ||
            response.pendingEmployees ||
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
            "Pending user loading error:",
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
   RENDER PENDING NEW USERS
========================================================== */

function renderPendingNewUsers() {

    const tableBody =
        document.getElementById(
            "pendingNewUsersTableBody"
        );


    if (!tableBody) {

        return;

    }


    if (
        pendingNewUsers.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted py-4">

                    No pending new user registrations.

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        pendingNewUsers
            .map(
                user => {

                    const employeeID =
                        getValue(
                            user,
                            [
                                "employeeID",
                                "EmployeeID",
                                "employeeId"
                            ]
                        );


                    const name =
                        getFullName(
                            user
                        );


                    const position =
                        getValue(
                            user,
                            [
                                "position",
                                "Position"
                            ]
                        );


                    const assignment =
                        getValue(
                            user,
                            [
                                "placeOfAssignment",
                                "PlaceOfAssignment",
                                "assignment"
                            ]
                        );


                    const email =
                        getValue(
                            user,
                            [
                                "email",
                                "Email"
                            ]
                        );


                    return `

                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        employeeID
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    name
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    position
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    assignment
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    email
                                )}
                            </td>

                            <td>

                                <span
                                    class="badge bg-warning text-dark">

                                    Pending

                                </span>

                            </td>

                            <td>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-primary review-new-user"
                                    data-employee-id="${escapeHTML(employeeID)}">

                                    Review

                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    tableBody
        .querySelectorAll(
            ".review-new-user"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        reviewPendingNewUser(
                            this.dataset.employeeId
                        );

                    }
                );

            }
        );

}


/* ==========================================================
   REVIEW PENDING USER
========================================================== */

function reviewPendingNewUser(
    employeeID
) {

    selectedPendingUser =
        pendingNewUsers.find(
            user =>
                String(
                    getValue(
                        user,
                        [
                            "employeeID",
                            "EmployeeID",
                            "employeeId"
                        ]
                    )
                ).trim() ===
                String(
                    employeeID
                ).trim()
        );


    if (
        !selectedPendingUser
    ) {

        alert(
            "Pending registration not found."
        );

        return;

    }


    const user =
        selectedPendingUser;


    setText(
        "approvalEmployeeID",
        getValue(
            user,
            [
                "employeeID",
                "EmployeeID",
                "employeeId"
            ]
        )
    );


    setText(
        "approvalFullName",
        getFullName(
            user
        )
    );


    setText(
        "approvalPosition",
        getValue(
            user,
            [
                "position",
                "Position"
            ]
        )
    );


    setText(
        "approvalDesignation",
        getValue(
            user,
            [
                "designation",
                "Designation"
            ]
        )
    );


    setText(
        "approvalAssignment",
        getValue(
            user,
            [
                "placeOfAssignment",
                "PlaceOfAssignment",
                "assignment"
            ]
        )
    );


    setText(
        "approvalEmploymentStatus",
        getValue(
            user,
            [
                "employmentStatus",
                "EmploymentStatus"
            ]
        )
    );


    setText(
        "approvalEmail",
        getValue(
            user,
            [
                "email",
                "Email"
            ]
        )
    );


    setText(
        "approvalContact",
        getValue(
            user,
            [
                "contactNumber",
                "ContactNumber"
            ]
        )
    );


    setText(
        "approvalRegistrationDate",
        formatDate(
            getValue(
                user,
                [
                    "createdDate",
                    "CreatedDate",
                    "timestamp",
                    "Timestamp"
                ]
            )
        )
    );


    const modalElement =
        document.getElementById(
            "newUserApprovalModal"
        );


    if (
        modalElement &&
        typeof bootstrap !== "undefined"
    ) {

        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            )
            .show();

    }

}


/* ==========================================================
   APPROVE & ACTIVATE
========================================================== */

async function approvePendingNewUser() {

    if (
        !selectedPendingUser
    ) {

        return;

    }


    const employeeID =
        getValue(
            selectedPendingUser,
            [
                "employeeID",
                "EmployeeID",
                "employeeId"
            ]
        );


    const name =
        getFullName(
            selectedPendingUser
        );


    const confirmed =
        window.confirm(
            "Approve and activate the account for " +
            name +
            " (" +
            employeeID +
            ")?"
        );


    if (!confirmed) {

        return;

    }


    const button =
        document.getElementById(
            "approveNewUserButton"
        );


    try {

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Activating...";

        }


        const response =
            await API.post({

                action:
                    "activateEmployee",

                employeeID:
                    employeeID

            });


        console.log(
            "Activate Employee Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response?.message ||
                "Unable to activate employee account."
            );

        }


        alert(
            "New user approved and activated successfully."
        );


        const modalElement =
            document.getElementById(
                "newUserApprovalModal"
            );


        if (
            modalElement &&
            typeof bootstrap !== "undefined"
        ) {

            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );


            if (modal) {

                modal.hide();

            }

        }


        selectedPendingUser =
            null;


        await loadPendingNewUsers();


    } catch (error) {

        console.error(
            "Approve & Activate Error:",
            error
        );


        alert(
            error.message ||
            "Unable to activate account."
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "✓ Approve & Activate";

        }

    }

}


/* ==========================================================
   HELPERS
========================================================== */

function getValue(
    object,
    fields
) {

    if (!object) {

        return "";

    }


    for (
        const field of fields
    ) {

        if (
            object[field] !== undefined &&
            object[field] !== null &&
            String(
                object[field]
            ).trim() !== ""
        ) {

            return String(
                object[field]
            ).trim();

        }

    }


    return "";

}


function getFullName(
    user
) {

    const existing =
        getValue(
            user,
            [
                "fullname",
                "fullName",
                "FullName"
            ]
        );


    if (existing) {

        return existing;

    }


    const first =
        getValue(
            user,
            [
                "firstName",
                "FirstName"
            ]
        );


    const middle =
        getValue(
            user,
            [
                "middleName",
                "MiddleName"
            ]
        );


    const last =
        getValue(
            user,
            [
                "lastName",
                "LastName"
            ]
        );


    const extension =
        getValue(
            user,
            [
                "nameExtension",
                "NameExtension"
            ]
        );


    let name =
        [
            first,
            middle,
            last
        ]
        .filter(Boolean)
        .join(" ");


    if (extension) {

        name +=
            " " +
            extension;

    }


    return name || "-";

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value || "-";

    }

}


function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


function escapeHTML(
    value
) {

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