"use strict";

/* ==========================================================
   LDIMS - LDD DASHBOARD
   Learning & Development Division
========================================================== */

const LDD_ACCESS_NAME = "LDD Monitoring";

const LDD_MONITORING_ROLES = [
    "LDD Personnel",
    "LDD Supervisor",
    "LDD Assistant Chief",
    "LDD Chief"
];

const NEW_USER_APPROVAL_ROLES = [
    "LDD Supervisor",
    "LDD Assistant Chief",
    "LDD Chief"
];

let pendingNewUsers = [];


/* ==========================================================
   SESSION
========================================================== */

function getCurrentLDDUser() {

    if (
        typeof Session !== "undefined" &&
        typeof Session.get === "function"
    ) {
        return Session.get();
    }

    return null;
}


/* ==========================================================
   ACCESS
========================================================== */

function normalizeLDDAccess(access) {

    return String(access || "")
        .split(",")
        .map(value =>
            String(value)
                .trim()
                .toLowerCase()
        )
        .filter(Boolean);

}


function hasLDDMonitoringAccess(user) {

    if (!user) {
        return false;
    }

    const accessValues =
        normalizeLDDAccess(
            user.ldimAccess ||
            user.ldimsAccess ||
            user.LDIMSAccess ||
            user["LDIMS Access"] ||
            ""
        );

    return accessValues.includes(
        "ldd monitoring"
    );
}


function getLDDMonitoringRole(user) {

    if (!user) {
        return "";
    }

    return String(
        user.lddMonitoringRole ||
        user.LDDMonitoringRole ||
        user["LDD Monitoring Role"] ||
        ""
    ).trim();

}


function normalizeLDDMonitoringRole(role) {

    const value =
        String(role || "")
            .trim()
            .toLowerCase();

    const roles = {

        "ldd personnel":
            "LDD Personnel",

        "ldd supervisor":
            "LDD Supervisor",

        "ldd assistant chief":
            "LDD Assistant Chief",

        "ldd chief":
            "LDD Chief"

    };

    return roles[value] || "";
}


function canApproveNewUsers(user) {

    if (!user) {
        return false;
    }

    if (!hasLDDMonitoringAccess(user)) {
        return false;
    }

    const role =
        normalizeLDDMonitoringRole(
            getLDDMonitoringRole(user)
        );

    return NEW_USER_APPROVAL_ROLES.includes(
        role
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
                getCurrentLDDUser();

            if (!user) {
                console.warn(
                    "LDD Dashboard: No active session."
                );
                return;
            }

            console.log(
                "LDD CURRENT USER:",
                user
            );

            if (!hasLDDMonitoringAccess(user)) {
                console.warn(
                    "User does not have LDD Monitoring access."
                );
                return;
            }

            const headerRole =
                document.getElementById(
                    "headerRole"
                );

            const monitoringRole =
                normalizeLDDMonitoringRole(
                    getLDDMonitoringRole(user)
                );

            if (headerRole) {
                headerRole.textContent =
                    monitoringRole ||
                    "LDD Monitoring";
            }

            const approvalSection =
                document.getElementById(
                    "newUserApprovalSection"
                );

            if (approvalSection) {
                approvalSection.hidden =
                    !canApproveNewUsers(user);
            }

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
   LOAD DASHBOARD
========================================================== */

async function loadLDDDashboard() {

    await loadLDDEmployeeCount();

    await loadLDDTrainingRecords();

    loadLNAPlaceholder();

    await loadLDDHierarchy();

    try {

        const currentUser =
            getCurrentLDDUser();

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

    renderNoRecentActivity();
}


/* ==========================================================
   TOTAL EMPLOYEES
========================================================== */

async function loadLDDEmployeeCount() {

    try {

        const response =
            await API.getEmployees();

        console.log(
            "LDD Employees:",
            response
        );

        if (
            response &&
            response.success === true
        ) {

            const employees =
                response.data ||
                response.employees ||
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

}


/* ==========================================================
   TRAINING RECORDS
========================================================== */

async function loadLDDTrainingRecords() {

    try {

        let response;

        if (
            typeof API.getAllTrainingRecordsForLDD ===
            "function"
        ) {

            response =
                await API.getAllTrainingRecordsForLDD();

        } else {

            response =
                await API.getTrainingRecords();

        }

        console.log(
            "LDD Training Records:",
            response
        );

        if (
            response &&
            response.success === true
        ) {

            const records =
                response.data ||
                response.records ||
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

    } catch (error) {

        console.error(
            "Unable to load LDD training records:",
            error
        );

    }

}


/* ==========================================================
   LNA PLACEHOLDER
========================================================== */

function loadLNAPlaceholder() {

    const lnaCompleted =
        document.getElementById(
            "lnaCompleted"
        );

    if (lnaCompleted) {

        lnaCompleted.textContent =
            "—";

    }

}


/* ==========================================================
   LDD ORGANIZATIONAL HIERARCHY
========================================================== */

async function loadLDDHierarchy() {

    const currentUser =
        getCurrentLDDUser();

    if (!currentUser) {
        return;
    }

    const employeeID =
        currentUser.employeeID ||
        currentUser.EmployeeID ||
        "";

    if (!employeeID) {

        console.error(
            "LDD hierarchy: Employee ID not found."
        );

        return;
    }

    try {

        console.log(
            "Loading LDD hierarchy for:",
            employeeID
        );

        const response =
            await API.getLDDPersonnelHierarchy(
                employeeID
            );

        console.log(
            "LDD hierarchy response:",
            response
        );

        if (
            !response ||
            response.success !== true
        ) {

            console.error(
                "Unable to load LDD hierarchy:",
                response?.message
            );

            renderLDDHierarchyEmpty(
                response?.message ||
                "Unable to load LDD hierarchy."
            );

            return;
        }

        renderLDDHierarchy(
            response.hierarchy
        );

    } catch (error) {

        console.error(
            "LDD hierarchy loading failed:",
            error
        );

        renderLDDHierarchyEmpty(
            error.message ||
            "Unable to load LDD hierarchy."
        );

    }

}


/* ==========================================================
   FIND HIERARCHY CONTAINER
========================================================== */

function getLDDHierarchyContainer() {

    const possibleIDs = [

        "lddPersonnelHierarchy",

        "lddHierarchy",

        "organizationalHierarchy",

        "lddPersonnelContainer",

        "hierarchyContainer"

    ];

    for (
        const id of possibleIDs
    ) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }

    }

    return null;
}


/* ==========================================================
   RENDER HIERARCHY
========================================================== */

function renderLDDHierarchy(
    hierarchy
) {

    const container =
        getLDDHierarchyContainer();

    if (!container) {

        console.warn(
            "LDD hierarchy container not found in HTML."
        );

        return;

    }

    if (!hierarchy) {

        renderLDDHierarchyEmpty(
            "No hierarchy data available."
        );

        return;

    }

    container.innerHTML =
        renderLDDHierarchyNode(
            hierarchy,
            true
        );

}


/* ==========================================================
   RENDER HIERARCHY NODE
========================================================== */

function renderLDDHierarchyNode(
    node,
    isRoot = false
) {

    if (!node) {
        return "";
    }

    const name =
        node.name ||
        "Unnamed Employee";

    const position =
        node.position ||
        "";

    const role =
        node.lddMonitoringRole ||
        "";

    const assignment =
        node.assignment ||
        "";

    const children =
        Array.isArray(node.children)
            ? node.children
            : [];

    let roleLabel =
        role;

    if (!roleLabel) {

        if (
            position
                .toLowerCase()
                .includes("chief")
        ) {
            roleLabel = "LDD Chief";
        }

    }

    const rootClass =
        isRoot
            ? " ldd-hierarchy-root"
            : "";

    let html = `

        <div class="ldd-hierarchy-node${rootClass}">

            <div class="ldd-hierarchy-person">

                <div class="ldd-hierarchy-icon">

                    <i class="bi bi-person-badge"></i>

                </div>

                <div class="ldd-hierarchy-info">

                    <div class="ldd-hierarchy-name">

                        ${escapeHTML(name)}

                    </div>

                    <div class="ldd-hierarchy-position">

                        ${escapeHTML(position)}

                    </div>

                    ${
                        roleLabel
                            ? `
                                <span class="badge bg-primary mt-1">
                                    ${escapeHTML(roleLabel)}
                                </span>
                              `
                            : ""
                    }

                    ${
                        assignment
                            ? `
                                <div class="ldd-hierarchy-assignment">

                                    ${escapeHTML(assignment)}

                                </div>
                              `
                            : ""
                    }

                </div>

            </div>
    `;


    if (
        children.length > 0
    ) {

        html += `

            <div class="ldd-hierarchy-children">

        `;

        children.forEach(
            child => {

                html +=
                    renderLDDHierarchyNode(
                        child,
                        false
                    );

            }
        );

        html += `

            </div>

        `;

    }


    html += `

        </div>

    `;

    return html;
}


/* ==========================================================
   EMPTY HIERARCHY
========================================================== */

function renderLDDHierarchyEmpty(
    message
) {

    const container =
        getLDDHierarchyContainer();

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="ldd-empty-state">

            <div class="ldd-empty-icon">

                <i class="bi bi-diagram-3"></i>

            </div>

            <strong>
                No hierarchy data
            </strong>

            <span>
                ${escapeHTML(
                    message ||
                    "No personnel found."
                )}
            </span>

        </div>

    `;

}


/* ==========================================================
   NEW USER APPROVAL
========================================================== */

async function loadPendingRegistrations() {

    const currentUser =
        getCurrentLDDUser();

    if (
        !currentUser ||
        !canApproveNewUsers(currentUser)
    ) {

        renderNoPendingRegistrations();

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
            countElement.textContent = "…";
        }

        if (tableBody) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center py-4">

                        Loading registrations...

                    </td>

                </tr>

            `;

        }

        const approverID =
            currentUser.employeeID ||
            currentUser.EmployeeID ||
            "";

        if (!approverID) {

            throw new Error(
                "Approving user Employee ID was not found."
            );

        }

        const response =
            await API.getPendingRegistrations(
                approverID
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
            countElement.textContent = "0";
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
   RENDER PENDING USERS
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

    tableBody.innerHTML = "";

    pendingNewUsers.forEach(
        registration => {

            const row =
                document.createElement(
                    "tr"
                );

            const employeeID =
                getRegistrationValue(
                    registration,
                    [
                        "employeeID",
                        "EmployeeID",
                        "EMPLOYEE ID"
                    ]
                );

            const fullName =
                getRegistrationFullName(
                    registration
                );

            const position =
                getRegistrationValue(
                    registration,
                    [
                        "position",
                        "Position",
                        "POSITION"
                    ]
                ) || "—";

            const assignment =
                getRegistrationValue(
                    registration,
                    [
                        "placeOfAssignment",
                        "PlaceOfAssignment",
                        "Place of Assignment",
                        "PLACE OF ASSIGNMENT"
                    ]
                ) || "—";

            const email =
                getRegistrationValue(
                    registration,
                    [
                        "email",
                        "Email",
                        "Email Address"
                    ]
                ) || "—";

            row.innerHTML = `

                <td>

                    <div class="fw-semibold">

                        ${escapeHTML(
                            employeeID
                        )}

                    </div>

                    <div class="text-muted small">

                        ${escapeHTML(
                            fullName || "—"
                        )}

                    </div>

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

                    <span class="badge bg-warning text-dark">

                        Pending

                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-primary"
                        data-registration-review="true">

                        <i class="bi bi-eye"></i>

                        Review

                    </button>

                </td>

            `;

            tableBody.appendChild(
                row
            );

            const reviewButton =
                row.querySelector(
                    "[data-registration-review]"
                );

            if (reviewButton) {

                reviewButton.addEventListener(
                    "click",
                    function () {

                        showRegistrationReview(
                            registration
                        );

                    }
                );

            }

        }
    );

}


/* ==========================================================
   REGISTRATION HELPERS
========================================================== */

function getRegistrationValue(
    registration,
    keys
) {

    for (
        const key of keys
    ) {

        if (
            registration &&
            registration[key] !== undefined &&
            registration[key] !== null
        ) {

            const value =
                String(
                    registration[key]
                ).trim();

            if (value !== "") {
                return value;
            }

        }

    }

    return "";
}


function getRegistrationFullName(
    registration
) {

    const lastName =
        getRegistrationValue(
            registration,
            [
                "lastName",
                "LastName",
                "LASTNAME"
            ]
        );

    const firstName =
        getRegistrationValue(
            registration,
            [
                "firstName",
                "FirstName",
                "FIRST NAME"
            ]
        );

    const middleName =
        getRegistrationValue(
            registration,
            [
                "middleName",
                "MiddleName",
                "MIDDLE NAME"
            ]
        );

    const extension =
        getRegistrationValue(
            registration,
            [
                "nameExtension",
                "NameExtension",
                "NAME EXTENTION",
                "Name Extention"
            ]
        );

    let name = "";

    if (lastName) {
        name += lastName;
    }

    if (firstName) {

        name +=
            name
                ? ", " + firstName
                : firstName;

    }

    if (middleName) {
        name += " " + middleName;
    }

    if (extension) {
        name += " " + extension;
    }

    return name.trim();
}


/* ==========================================================
   REGISTRATION REVIEW
========================================================== */

function showRegistrationReview(
    registration
) {

    const existing =
        document.getElementById(
            "lddRegistrationReviewModal"
        );

    if (existing) {
        existing.remove();
    }

    const employeeID =
        getRegistrationValue(
            registration,
            [
                "employeeID",
                "EmployeeID",
                "EMPLOYEE ID"
            ]
        );

    const fullName =
        getRegistrationFullName(
            registration
        );

    const position =
        getRegistrationValue(
            registration,
            [
                "position",
                "Position",
                "POSITION"
            ]
        );

    const designation =
        getRegistrationValue(
            registration,
            [
                "designation",
                "Designation",
                "DESIGNATION"
            ]
        );

    const assignment =
        getRegistrationValue(
            registration,
            [
                "placeOfAssignment",
                "PlaceOfAssignment",
                "Place of Assignment",
                "PLACE OF ASSIGNMENT"
            ]
        );

    const email =
        getRegistrationValue(
            registration,
            [
                "email",
                "Email",
                "Email Address"
            ]
        );

    const contact =
        getRegistrationValue(
            registration,
            [
                "contactNumber",
                "ContactNumber",
                "CONTACT NUMBER"
            ]
        );

    const employmentStatus =
        getRegistrationValue(
            registration,
            [
                "employmentStatus",
                "EmploymentStatus",
                "EMPLOYMENT STATUS"
            ]
        ) || "Not provided";

    const registrationDate =
        getRegistrationValue(
            registration,
            [
                "registrationDate",
                "RegistrationDate",
                "Timestamp"
            ]
        );

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "lddRegistrationReviewModal";

    modal.innerHTML = `

        <div
            style="
                position:fixed;
                inset:0;
                background:rgba(0,0,0,.55);
                z-index:9999;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:20px;
            "
        >

            <div
                style="
                    background:#fff;
                    width:min(700px,100%);
                    max-height:90vh;
                    overflow:auto;
                    border-radius:10px;
                    box-shadow:0 15px 40px rgba(0,0,0,.25);
                "
            >

                <div
                    style="
                        background:#6A1B9A;
                        color:#fff;
                        padding:18px 22px;
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    "
                >

                    <div>

                        <div
                            style="
                                font-size:18px;
                                font-weight:700;
                            "
                        >
                            Review New User Registration
                        </div>

                        <div
                            style="
                                font-size:12px;
                                opacity:.9;
                                margin-top:3px;
                            "
                        >
                            Employee ID:
                            ${escapeHTML(employeeID)}
                        </div>

                    </div>

                    <button
                        type="button"
                        id="closeRegistrationModal"
                        style="
                            border:0;
                            background:transparent;
                            color:#fff;
                            font-size:24px;
                            line-height:1;
                        "
                    >
                        &times;
                    </button>

                </div>

                <div style="padding:22px;">

                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr 1fr;
                            gap:14px;
                        "
                    >

                        ${registrationField(
                            "Full Name",
                            fullName
                        )}

                        ${registrationField(
                            "Employee ID",
                            employeeID
                        )}

                        ${registrationField(
                            "Position",
                            position
                        )}

                        ${registrationField(
                            "Designation",
                            designation
                        )}

                        ${registrationField(
                            "Place of Assignment",
                            assignment
                        )}

                        ${registrationField(
                            "Email",
                            email
                        )}

                        ${registrationField(
                            "Contact Number",
                            contact
                        )}

                        ${registrationField(
                            "Employment Status",
                            employmentStatus
                        )}

                        ${registrationField(
                            "Registration Date",
                            registrationDate
                        )}

                    </div>

                    <div
                        style="
                            margin-top:24px;
                            padding-top:18px;
                            border-top:1px solid #dee2e6;
                            display:flex;
                            justify-content:flex-end;
                            gap:10px;
                        "
                    >

                        <button
                            type="button"
                            class="btn btn-secondary"
                            id="closeRegistrationModalButton"
                        >
                            Close
                        </button>

                        <button
                            type="button"
                            class="btn btn-success"
                            id="approveRegistrationButton"
                        >

                            <i class="bi bi-check-circle"></i>

                            Approve & Activate

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;

    document.body.appendChild(
        modal
    );

    const closeModal =
        function () {
            modal.remove();
        };

    document
        .getElementById(
            "closeRegistrationModal"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById(
            "closeRegistrationModalButton"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById(
            "approveRegistrationButton"
        )
        ?.addEventListener(
            "click",
            async function () {

                await approveRegistration(
                    registration,
                    this
                );

            }
        );

}


function registrationField(
    label,
    value
) {

    return `

        <div>

            <div
                style="
                    font-size:11px;
                    color:#6c757d;
                    font-weight:600;
                    margin-bottom:3px;
                    text-transform:uppercase;
                "
            >
                ${escapeHTML(label)}
            </div>

            <div
                style="
                    font-size:14px;
                    font-weight:600;
                    color:#212529;
                    word-break:break-word;
                "
            >
                ${escapeHTML(
                    value || "Not provided"
                )}
            </div>

        </div>

    `;

}


/* ==========================================================
   APPROVE REGISTRATION
========================================================== */

async function approveRegistration(
    registration,
    button
) {

    const currentUser =
        getCurrentLDDUser();

    if (
        !currentUser ||
        !canApproveNewUsers(currentUser)
    ) {

        alert(
            "You are not authorized to approve new user registrations."
        );

        return;

    }

    const approverID =
        currentUser.employeeID ||
        currentUser.EmployeeID ||
        "";

    const employeeID =
        getRegistrationValue(
            registration,
            [
                "employeeID",
                "EmployeeID",
                "EMPLOYEE ID"
            ]
        );

    if (!approverID) {

        alert(
            "Unable to identify the approving LDD user."
        );

        return;

    }

    if (!employeeID) {

        alert(
            "Employee ID is missing from this registration."
        );

        return;

    }

    const confirmed =
        window.confirm(
            "Approve and activate this new user registration?\n\n" +
            "Employee ID: " +
            employeeID +
            "\n\n" +
            "A temporary password will be generated and sent to the registered email address."
        );

    if (!confirmed) {
        return;
    }

    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-2"
                ></span>
                Processing...
            `;

        }

        const response =
            await API.approveRegistration(
                employeeID,
                approverID
            );

        console.log(
            "Approve registration response:",
            response
        );

        if (
            response &&
            response.success === true
        ) {

            alert(
                response.message ||
                "Registration approved and activated successfully."
            );

            document
                .getElementById(
                    "lddRegistrationReviewModal"
                )
                ?.remove();

            await loadPendingRegistrations();

            return;

        }

        alert(
            response?.message ||
            "Unable to approve registration."
        );

        if (button) {

            button.disabled =
                false;

            button.innerHTML = `
                <i class="bi bi-check-circle"></i>
                Approve & Activate
            `;

        }

    } catch (error) {

        console.error(
            "Approve registration error:",
            error
        );

        alert(
            error.message ||
            "Unable to complete the approval."
        );

        if (button) {

            button.disabled =
                false;

            button.innerHTML = `
                <i class="bi bi-check-circle"></i>
                Approve & Activate
            `;

        }

    }

}


/* ==========================================================
   EMPTY STATES
========================================================== */

function renderNoPendingRegistrations() {

    const badge =
        document.getElementById(
            "pendingNewUsers"
        );

    if (badge) {
        badge.textContent = "0";
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
   HTML ESCAPING
========================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

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

    if (
        logoutLink.dataset.initialized ===
        "true"
    ) {
        return;
    }

    logoutLink.dataset.initialized =
        "true";

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