/* ==========================================================
   LDIMS
   User Management
   Administrator Module
========================================================== */

"use strict";


/* ==========================================================
   STATE
========================================================== */

let allUsers = [];
let filteredUsers = [];

let selectedUser = null;

let manageUserModal = null;


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeUserManagement();

    }
);


/* ==========================================================
   INITIALIZE USER MANAGEMENT
========================================================== */

async function initializeUserManagement() {

    setupUserManagementEvents();

    initializeManageUserModal();

    await loadUsers();

}


/* ==========================================================
   BOOTSTRAP MODAL
========================================================== */

function initializeManageUserModal() {

    const modalElement =
        document.getElementById(
            "manageUserModal"
        );


    if (
        modalElement &&
        typeof bootstrap !== "undefined"
    ) {

        manageUserModal =
            new bootstrap.Modal(
                modalElement
            );

    }

}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

function setupUserManagementEvents() {

    const refreshButton =
        document.getElementById(
            "refreshUsersButton"
        );


    const searchInput =
        document.getElementById(
            "userSearch"
        );


    const saveButton =
        document.getElementById(
            "saveUserChangesButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadUsers
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            handleUserSearch
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveUserChanges
        );

    }

}


/* ==========================================================
   ADD USER BUTTON
========================================================== */

const addUserButton =
    document.getElementById(
        "addUserButton"
    );


if (addUserButton) {

    addUserButton.addEventListener(
        "click",
        openAddUserModal
    );

}


/* ==========================================================
   OPEN ADD USER MODAL
========================================================== */

function openAddUserModal() {

    const modalElement =
        document.getElementById(
            "addUserModal"
        );


    if (!modalElement) {

        console.error(
            "ADD USER MODAL NOT FOUND."
        );

        return;

    }


    if (
        typeof bootstrap === "undefined"
    ) {

        console.error(
            "Bootstrap is not available."
        );

        return;

    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


/* ==========================================================
   LOAD USERS
========================================================== */

async function loadUsers() {

    showUserLoading();

    hideUserError();


    try {

        const result =
            await API.post({

                action:
                    "getUsers"

            });


        console.log(
            "LDIMS USERS RESPONSE:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to load users."
            );

        }


        allUsers =
            Array.isArray(
                result.users
            )
                ? result.users
                : [];


        filteredUsers =
            [...allUsers];


        updateUserSummary();


        renderUsers(
            filteredUsers
        );


    } catch (error) {

        console.error(
            "USER MANAGEMENT LOAD ERROR:",
            error
        );


        allUsers = [];

        filteredUsers = [];


        updateUserSummary();


        renderUsers([]);


        showUserError(
            error.message ||
            "Unable to load users."
        );

    }

}


/* ==========================================================
   UPDATE SUMMARY
========================================================== */

function updateUserSummary() {

    const total =
        allUsers.length;


    let active = 0;

    let inactive = 0;

    let pending = 0;

    let administrators = 0;


    allUsers.forEach(
        user => {

            const status =
                String(
                    user.status || ""
                )
                .trim()
                .toLowerCase();


            const role =
                String(
                    user.role || ""
                )
                .trim()
                .toLowerCase();


            if (
                status === "active"
            ) {

                active++;

            }
            else if (
                status === "inactive"
            ) {

                inactive++;

            }
            else if (
                status === "pending"
            ) {

                pending++;

            }


            if (
                role === "administrator" ||
                role === "admin"
            ) {

                administrators++;

            }

        }
    );


    setUserText(
        "totalUsers",
        total
    );


    setUserText(
        "activeUsers",
        active
    );


    setUserText(
        "inactiveUsers",
        inactive
    );


    setUserText(
        "pendingUsers",
        pending
    );


    setUserText(
        "administratorUsers",
        administrators
    );

}


/* ==========================================================
   RENDER USERS
========================================================== */

function renderUsers(users) {

    const loadingState =
        document.getElementById(
            "userLoadingState"
        );


    const emptyState =
        document.getElementById(
            "userEmptyState"
        );


    const tableContainer =
        document.getElementById(
            "userTableContainer"
        );


    const tableBody =
        document.getElementById(
            "usersTableBody"
        );


    if (loadingState) {

        loadingState.classList.add(
            "d-none"
        );

    }


    if (tableBody) {

        tableBody.innerHTML = "";

    }


    if (
        !users ||
        users.length === 0
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "d-none"
            );

        }


        if (tableContainer) {

            tableContainer.classList.add(
                "d-none"
            );

        }


        return;

    }


    if (emptyState) {

        emptyState.classList.add(
            "d-none"
        );

    }


    if (tableContainer) {

        tableContainer.classList.remove(
            "d-none"
        );

    }


    users.forEach(
        user => {

            const row =
                document.createElement(
                    "tr"
                );


            const employeeID =
                escapeUserHTML(
                    user.employeeID ||
                    ""
                );


            const fullname =
                escapeUserHTML(
                    user.fullname ||
                    "—"
                );


            const position =
                escapeUserHTML(
                    user.position ||
                    "—"
                );


            const assignment =
                escapeUserHTML(
                    user.placeOfAssignment ||
                    "—"
                );


            const access =
                escapeUserHTML(
                    user.ldimAccess ||
                    user.ldimsAccess ||
                    "Employee"
                );


            const systemAssignment =
                escapeUserHTML(
                    user.systemAssignment ||
                    "—"
                );


            const lddMonitoringRole =
                escapeUserHTML(
                    user.lddMonitoringRole ||
                    "—"
                );


            const status =
                String(
                    user.status ||
                    ""
                ).trim();


            const statusBadge =
                getStatusBadge(
                    status
                );


            const email =
                escapeUserHTML(
                    user.email ||
                    "—"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${employeeID}
                    </strong>
                </td>

                <td>
                    ${fullname}
                </td>

                <td>
                    ${position}
                </td>

                <td>
                    ${assignment}
                </td>

                <td>
                    ${access}
                </td>

                <td>
                    ${systemAssignment}
                </td>

                <td>
                    ${lddMonitoringRole}
                </td>

                <td>
                    ${statusBadge}
                </td>

                <td>
                    ${email}
                </td>

                <td class="text-end">

                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        data-action="manage"
                        data-employee-id="${employeeID}"
                    >

                        <i class="bi bi-three-dots me-1"></i>

                        Manage

                    </button>

                </td>

            `;


            const manageButton =
                row.querySelector(
                    '[data-action="manage"]'
                );


            if (manageButton) {

                manageButton.addEventListener(
                    "click",
                    () => {

                        manageUser(
                            user.employeeID
                        );

                    }
                );

            }


            if (tableBody) {

                tableBody.appendChild(
                    row
                );

            }

        }
    );

}


/* ==========================================================
   SEARCH
========================================================== */

function handleUserSearch(
    event
) {

    const searchTerm =
        String(
            event.target.value ||
            ""
        )
        .trim()
        .toLowerCase();


    if (!searchTerm) {

        filteredUsers =
            [...allUsers];


        renderUsers(
            filteredUsers
        );

        return;

    }


    filteredUsers =
        allUsers.filter(
            user => {

                const searchableText = [

                    user.employeeID,

                    user.fullname,

                    user.position,

                    user.placeOfAssignment,

                    user.role,

                    user.ldimAccess,

                    user.systemAssignment,

                    user.lddMonitoringRole,

                    user.status,

                    user.email

                ]
                .join(" ")
                .toLowerCase();


                return searchableText.includes(
                    searchTerm
                );

            }
        );


    renderUsers(
        filteredUsers
    );

}
/* ==========================================================
   MANAGE USER
========================================================== */

function manageUser(
    employeeID
) {

    if (!employeeID) {

        return;

    }


    const user =
        allUsers.find(
            item =>
                String(
                    item.employeeID
                ).trim() ===
                String(
                    employeeID
                ).trim()
        );


    if (!user) {

        showUserError(
            "User record not found."
        );

        return;

    }


    selectedUser =
        user;


    populateManageUserModal(
        user
    );


    hideManageUserError();


    if (!manageUserModal) {

        initializeManageUserModal();

    }


    if (manageUserModal) {

        manageUserModal.show();

    }

}


/* ==========================================================
   POPULATE MANAGE USER MODAL
========================================================== */

function populateManageUserModal(
    user
) {

    setInputValue(
        "manageEmployeeID",
        user.employeeID
    );


    setInputValue(
        "manageFullName",
        user.fullname
    );


    setInputValue(
        "manageEmail",
        user.email
    );


    setInputValue(
        "managePosition",
        user.position
    );


    setInputValue(
        "manageAssignment",
        user.placeOfAssignment
    );


    /*
     * Legacy Role is displayed for
     * backward compatibility.
     *
     * It is no longer the basis for
     * LDIMS module access.
     */

    setInputValue(
        "manageRole",
        normalizeRoleValue(
            user.role
        )
    );


    /*
     * Employee access is mandatory.
     */

    setCheckboxChecked(
        "manageAccessEmployee",
        true
    );


    setCheckboxChecked(
        "manageAccessSupervisor",
        hasLdimsAccess(
            user.ldimAccess ||
            user.ldimsAccess,
            "Supervisor"
        )
    );


    setCheckboxChecked(
        "manageAccessLddMonitoring",
        hasLdimsAccess(
            user.ldimAccess ||
            user.ldimsAccess,
            "LDD Monitoring"
        )
    );


    setCheckboxChecked(
        "manageAccessAdministrator",
        hasLdimsAccess(
            user.ldimAccess ||
            user.ldimsAccess,
            "Administrator"
        )
    );


    setInputValue(
        "manageSystemAssignment",
        user.systemAssignment ||
        ""
    );


    setInputValue(
        "manageLddMonitoringRole",
        normalizeLddMonitoringRoleValue(
            user.lddMonitoringRole
        )
    );


    setInputValue(
        "manageStatus",
        normalizeStatusValue(
            user.status
        )
    );


    /*
     * Employee access cannot be removed.
     */

    const employeeAccess =
        document.getElementById(
            "manageAccessEmployee"
        );


    if (employeeAccess) {

        employeeAccess.checked =
            true;

        employeeAccess.disabled =
            true;

    }

}


/* ==========================================================
   SAVE USER CHANGES
========================================================== */

async function saveUserChanges() {

    if (!selectedUser) {

        showManageUserError(
            "No user selected."
        );

        return;

    }


    const employeeID =
        selectedUser.employeeID;


    const statusElement =
        document.getElementById(
            "manageStatus"
        );


    const newStatus =
        statusElement
            ? statusElement.value
            : selectedUser.status;


    const oldStatus =
        normalizeStatusValue(
            selectedUser.status
        );


    /*
     * Build explicit LDIMS access.
     *
     * Employee is ALWAYS included.
     */

    const accessValues = [
        "Employee"
    ];


    if (
        document.getElementById(
            "manageAccessSupervisor"
        )?.checked
    ) {

        accessValues.push(
            "Supervisor"
        );

    }


    if (
        document.getElementById(
            "manageAccessLddMonitoring"
        )?.checked
    ) {

        accessValues.push(
            "LDD Monitoring"
        );

    }


    if (
        document.getElementById(
            "manageAccessAdministrator"
        )?.checked
    ) {

        accessValues.push(
            "Administrator"
        );

    }


    const newLdimAccess =
        normalizeLdimsAccessValue(
            accessValues.join(",")
        );


    const oldLdimAccess =
        normalizeLdimsAccessValue(
            selectedUser.ldimAccess ||
            selectedUser.ldimsAccess ||
            "Employee"
        );


    /*
     * System Assignment is separate from
     * organizational Place of Assignment.
     */

    const systemAssignmentElement =
        document.getElementById(
            "manageSystemAssignment"
        );


    const newSystemAssignment =
        systemAssignmentElement
            ? systemAssignmentElement.value.trim()
            : String(
                selectedUser.systemAssignment ||
                ""
            ).trim();


    const oldSystemAssignment =
        String(
            selectedUser.systemAssignment ||
            ""
        ).trim();


    /*
     * LDD Monitoring Role is explicit.
     */

    const lddRoleElement =
        document.getElementById(
            "manageLddMonitoringRole"
        );


    const newLddMonitoringRole =
        lddRoleElement
            ? normalizeLddMonitoringRoleValue(
                lddRoleElement.value
            )
            : "";


    const oldLddMonitoringRole =
        normalizeLddMonitoringRoleValue(
            selectedUser.lddMonitoringRole
        );


    /*
     * Determine exactly what changed.
     */

    const accessChanged =
        newLdimAccess !==
        oldLdimAccess;


    const systemAssignmentChanged =
        newSystemAssignment !==
        oldSystemAssignment;


    const lddMonitoringRoleChanged =
        newLddMonitoringRole !==
        oldLddMonitoringRole;


    const statusChanged =
        newStatus !==
        oldStatus;


    /*
     * Nothing changed.
     */

    if (
        !accessChanged &&
        !systemAssignmentChanged &&
        !lddMonitoringRoleChanged &&
        !statusChanged
    ) {

        closeManageUserModal();

        return;

    }


    showManageUserSaving();


    try {

        /*
         * Update access-related fields.
         */

        if (
            accessChanged ||
            systemAssignmentChanged ||
            lddMonitoringRoleChanged
        ) {

            const accessResult =
                await API.post({

                    action:
                        "updateUserAccess",

                    employeeID:
                        employeeID,

                    ldimAccess:
                        newLdimAccess,

                    systemAssignment:
                        newSystemAssignment,

                    lddMonitoringRole:
                        newLddMonitoringRole

                });


            console.log(
                "UPDATE USER ACCESS RESPONSE:",
                accessResult
            );


            if (
                !accessResult ||
                !accessResult.success
            ) {

                throw new Error(
                    accessResult?.message ||
                    "Unable to update user access."
                );

            }

        }


        /*
         * Update account status.
         *
         * Existing status functionality
         * remains intact.
         */

        if (statusChanged) {

            const statusResult =
                await API.post({

                    action:
                        "updateUserStatus",

                    employeeID:
                        employeeID,

                    status:
                        newStatus

                });


            console.log(
                "UPDATE STATUS RESPONSE:",
                statusResult
            );


            if (
                !statusResult ||
                !statusResult.success
            ) {

                throw new Error(
                    statusResult?.message ||
                    "Unable to update account status."
                );

            }

        }


        /*
         * Close modal only after all
         * requested updates succeed.
         */

        closeManageUserModal();


        /*
         * Reload from Google Sheets so
         * the displayed data is authoritative.
         */

        await loadUsers();


    }
    catch (error) {

        console.error(
            "USER MANAGEMENT SAVE ERROR:",
            error
        );


        showManageUserError(
            error.message ||
            "Unable to save user changes."
        );

    }
    finally {

        hideManageUserSaving();

    }

}


/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeManageUserModal() {

    if (manageUserModal) {

        manageUserModal.hide();

    }


    selectedUser =
        null;

}


/* ==========================================================
   NORMALIZE ROLE
========================================================== */

function normalizeRoleValue(
    role
) {

    const value =
        String(
            role || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "admin"
    ) {

        return "Administrator";

    }


    if (
        value === "administrator"
    ) {

        return "Administrator";

    }


    if (
        value === "supervisor"
    ) {

        return "Supervisor";

    }


    if (
        value === "l&d officer" ||
        value === "l&d" ||
        value === "ld officer"
    ) {

        return "L&D Officer";

    }


    return "Employee";

}


/* ==========================================================
   NORMALIZE STATUS
========================================================== */

function normalizeStatusValue(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "inactive"
    ) {

        return "Inactive";

    }


    if (
        value === "pending"
    ) {

        return "Pending";

    }


    return "Active";

}


/* ==========================================================
   NORMALIZE LDIMS ACCESS
========================================================== */

function normalizeLdimsAccessValue(
    access
) {

    const DEFAULT_ACCESS =
        "Employee";


    if (!access) {

        return DEFAULT_ACCESS;

    }


    const allowedAccess = {

        employee:
            "Employee",

        supervisor:
            "Supervisor",

        "ldd monitoring":
            "LDD Monitoring",

        administrator:
            "Administrator"

    };


    const values =
        String(
            access
        )
        .split(",")
        .map(
            value =>
                value
                    .trim()
                    .toLowerCase()
        )
        .filter(Boolean);


    const normalized = [];


    values.forEach(
        value => {

            const canonical =
                allowedAccess[value];


            if (
                canonical &&
                !normalized.includes(
                    canonical
                )
            ) {

                normalized.push(
                    canonical
                );

            }

        }
    );


    /*
     * Employee access is mandatory.
     */

    if (
        !normalized.includes(
            "Employee"
        )
    ) {

        normalized.unshift(
            "Employee"
        );

    }


    return normalized.join(
        ","
    );

}


/* ==========================================================
   CHECK LDIMS ACCESS
========================================================== */

function hasLdimsAccess(
    access,
    requestedAccess
) {

    const normalized =
        normalizeLdimsAccessValue(
            access
        );


    return normalized
        .split(",")
        .map(
            value =>
                value.trim()
        )
        .includes(
            requestedAccess
        );

}


/* ==========================================================
   NORMALIZE LDD MONITORING ROLE
========================================================== */

function normalizeLddMonitoringRoleValue(
    role
) {

    const value =
        String(
            role || ""
        )
        .trim()
        .toLowerCase();


    const allowedRoles = {

        "ldd personnel":
            "LDD Personnel",

        "ldd supervisor":
            "LDD Supervisor",

        "ldd assistant chief":
            "LDD Assistant Chief",

        "ldd chief":
            "LDD Chief"

    };


    return (
        allowedRoles[value] ||
        ""
    );

}


/* ==========================================================
   SET INPUT VALUE
========================================================== */

function setInputValue(
    elementID,
    value
) {

    const element =
        document.getElementById(
            elementID
        );


    if (element) {

        element.value =
            value ?? "";

    }

}


/* ==========================================================
   SET CHECKBOX
========================================================== */

function setCheckboxChecked(
    elementID,
    checked
) {

    const element =
        document.getElementById(
            elementID
        );


    if (element) {

        element.checked =
            Boolean(
                checked
            );

    }

}


/* ==========================================================
   MANAGE USER ERROR
========================================================== */

function hideManageUserError() {

    const error =
        document.getElementById(
            "manageUserError"
        );


    if (error) {

        error.classList.add(
            "d-none"
        );


        error.textContent =
            "";

    }

}


function showManageUserError(
    message
) {

    const error =
        document.getElementById(
            "manageUserError"
        );


    if (error) {

        error.textContent =
            message;


        error.classList.remove(
            "d-none"
        );

    }

}


/* ==========================================================
   MANAGE USER SAVING STATE
========================================================== */

function showManageUserSaving() {

    const button =
        document.getElementById(
            "saveUserChangesButton"
        );


    const saving =
        document.getElementById(
            "manageUserSaving"
        );


    if (button) {

        button.disabled =
            true;

    }


    if (saving) {

        saving.classList.remove(
            "d-none"
        );

    }

}


function hideManageUserSaving() {

    const button =
        document.getElementById(
            "saveUserChangesButton"
        );


    const saving =
        document.getElementById(
            "manageUserSaving"
        );


    if (button) {

        button.disabled =
            false;

    }


    if (saving) {

        saving.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function getStatusBadge(
    status
) {

    const normalized =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        normalized === "active"
    ) {

        return `

            <span class="badge text-bg-success">
                Active
            </span>

        `;

    }


    if (
        normalized === "inactive"
    ) {

        return `

            <span class="badge text-bg-secondary">
                Inactive
            </span>

        `;

    }


    if (
        normalized === "pending"
    ) {

        return `

            <span class="badge text-bg-warning">
                Pending
            </span>

        `;

    }


    return `

        <span class="badge text-bg-light">
            ${escapeUserHTML(status || "Unknown")}
        </span>

    `;

}


/* ==========================================================
   ROLE BADGE
========================================================== */

function getRoleBadge(
    role
) {

    const normalized =
        String(
            role || ""
        )
        .trim();


    const lower =
        normalized.toLowerCase();


    if (
        lower === "admin" ||
        lower === "administrator"
    ) {

        return `

            <span class="badge text-bg-primary">
                Administrator
            </span>

        `;

    }


    if (
        lower === "supervisor"
    ) {

        return `

            <span class="badge text-bg-info">
                Supervisor
            </span>

        `;

    }


    if (
        lower === "l&d officer"
    ) {

        return `

            <span class="badge text-bg-warning">
                L&D Officer
            </span>

        `;

    }


    return `

        <span class="badge text-bg-light">
            ${escapeUserHTML(normalized || "Employee")}
        </span>

    `;

}
/* ==========================================================
   LOADING STATE
========================================================== */

function showUserLoading() {

    const loading =
        document.getElementById(
            "userLoadingState"
        );


    const empty =
        document.getElementById(
            "userEmptyState"
        );


    const table =
        document.getElementById(
            "userTableContainer"
        );


    if (loading) {

        loading.classList.remove(
            "d-none"
        );

    }


    if (empty) {

        empty.classList.add(
            "d-none"
        );

    }


    if (table) {

        table.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   USER ERROR
========================================================== */

function hideUserError() {

    const error =
        document.getElementById(
            "userErrorState"
        );


    if (error) {

        error.classList.add(
            "d-none"
        );

    }

}


function showUserError(
    message
) {

    const error =
        document.getElementById(
            "userErrorState"
        );


    const messageElement =
        document.getElementById(
            "userErrorMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    if (error) {

        error.classList.remove(
            "d-none"
        );

    }


    const loading =
        document.getElementById(
            "userLoadingState"
        );


    if (loading) {

        loading.classList.add(
            "d-none"
        );

    }


    const table =
        document.getElementById(
            "userTableContainer"
        );


    if (table) {

        table.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   SET TEXT
========================================================== */

function setUserText(
    elementID,
    value
) {

    const element =
        document.getElementById(
            elementID
        );


    if (element) {

        element.textContent =
            value ?? 0;

    }

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeUserHTML(
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
   ADD USER
   EMPLOYEE SELECTION
========================================================== */

const addUserEmployeeSelect =
    document.getElementById(
        "addUserEmployee"
    );


if (addUserEmployeeSelect) {

    addUserEmployeeSelect.addEventListener(
        "change",
        handleAddUserEmployeeChange
    );

}


/* ==========================================================
   OPEN ADD USER MODAL
========================================================== */

const addUserModalElement =
    document.getElementById(
        "addUserModal"
    );


if (addUserModalElement) {

    addUserModalElement.addEventListener(
        "shown.bs.modal",
        loadEmployeesForAddUser
    );

}


/* ==========================================================
   LOAD EMPLOYEES FOR ADD USER
========================================================== */

async function loadEmployeesForAddUser() {

    const select =
        document.getElementById(
            "addUserEmployee"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            Loading employees...
        </option>

    `;


    select.disabled =
        true;


    try {

        console.log(
            "ADD USER: Loading employees..."
        );


        const result =
            await API.post({

                action:
                    "getEmployees"

            });


        console.log(
            "ADD USER EMPLOYEES RESPONSE:",
            result
        );


        if (!result) {

            throw new Error(
                "No response received from LDIMS API."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Unable to load employees."
            );

        }


        let employees = [];


        if (
            Array.isArray(
                result.employees
            )
        ) {

            employees =
                result.employees;

        }
        else if (
            Array.isArray(
                result.data
            )
        ) {

            employees =
                result.data;

        }
        else if (
            Array.isArray(
                result
            )
        ) {

            employees =
                result;

        }


        console.log(
            "ADD USER: Employees found:",
            employees.length
        );


        /*
         * Existing LDIMS accounts.
         */

        const existingUserIDs =
            new Set(

                allUsers.map(
                    user =>

                        String(
                            user.employeeID ??
                            user.EmployeeID ??
                            ""
                        )
                        .trim()

                )

            );


        /*
         * Only employees without
         * an existing account.
         */

        const availableEmployees =
            employees.filter(
                employee => {

                    const employeeID =
                        String(

                            employee.employeeID ??
                            employee.EmployeeID ??
                            employee.employeeId ??
                            employee.EMPLOYEE_ID ??
                            ""

                        )
                        .trim();


                    return (

                        employeeID !== "" &&

                        !existingUserIDs.has(
                            employeeID
                        )

                    );

                }
            );


        console.log(
            "ADD USER: Available employees:",
            availableEmployees.length
        );


        select.innerHTML = `

            <option value="">
                Select an employee...
            </option>

        `;


        availableEmployees.forEach(
            employee => {

                const employeeID =
                    String(

                        employee.employeeID ??
                        employee.EmployeeID ??
                        employee.employeeId ??
                        employee.EMPLOYEE_ID ??
                        ""

                    )
                    .trim();


                const fullName =
                    String(

                        employee.fullname ??
                        employee.fullName ??
                        employee.FullName ??
                        employee.full_name ??

                        [

                            employee.LastName ??
                            employee.lastName ??
                            "",

                            employee.FirstName ??
                            employee.firstName ??
                            "",

                            employee.MiddleName ??
                            employee.middleName ??
                            ""

                        ]

                        .filter(
                            value =>
                                String(
                                    value
                                ).trim() !== ""
                        )

                        .join(" ")

                    )
                    .trim();


                const position =
                    String(

                        employee.position ??
                        employee.Position ??
                        ""

                    )
                    .trim();


                const assignment =
                    String(

                        employee.placeOfAssignment ??
                        employee.PlaceOfAssignment ??
                        employee.place_of_assignment ??
                        employee.designation ??
                        employee.Designation ??
                        ""

                    )
                    .trim();


                const email =
                    String(

                        employee.email ??
                        employee.Email ??
                        employee.emailAddress ??
                        employee.EmailAddress ??
                        ""

                    )
                    .trim();


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    employeeID;


                option.textContent =
                    `${employeeID} — ${
                        fullName ||
                        "Unnamed Employee"
                    }`;


                option.dataset.fullname =
                    fullName;


                option.dataset.position =
                    position;


                option.dataset.assignment =
                    assignment;


                option.dataset.email =
                    email;


                select.appendChild(
                    option
                );

            }
        );


        select.disabled =
            false;


        if (
            availableEmployees.length ===
            0
        ) {

            select.innerHTML = `

                <option value="">
                    No available employees
                </option>

            `;


            select.disabled =
                true;

        }

    }
    catch (error) {

        console.error(
            "ADD USER EMPLOYEE LOAD ERROR:",
            error
        );


        select.innerHTML = `

            <option value="">
                Unable to load employees
            </option>

        `;


        select.disabled =
            true;

    }

}


/* ==========================================================
   HANDLE EMPLOYEE SELECTION
========================================================== */

function handleAddUserEmployeeChange(
    event
) {

    const select =
        event.target;


    const selectedOption =
        select.options[
            select.selectedIndex
        ];


    const details =
        document.getElementById(
            "addUserEmployeeDetails"
        );


    const createButton =
        document.getElementById(
            "createUserButton"
        );


    if (
        !selectedOption ||
        !selectedOption.value
    ) {

        clearAddUserEmployeeDetails();


        if (details) {

            details.classList.add(
                "d-none"
            );

        }


        if (createButton) {

            createButton.disabled =
                true;

        }


        return;

    }


    const employeeID =
        selectedOption.value;


    const fullName =
        selectedOption.dataset.fullname ||
        "";


    const position =
        selectedOption.dataset.position ||
        "";


    const assignment =
        selectedOption.dataset.assignment ||
        "";


    const email =
        selectedOption.dataset.email ||
        "";


    const employeeIDField =
        document.getElementById(
            "addUserEmployeeID"
        );


    const fullNameField =
        document.getElementById(
            "addUserFullName"
        );


    const positionField =
        document.getElementById(
            "addUserPosition"
        );


    const assignmentField =
        document.getElementById(
            "addUserAssignment"
        );


    const emailField =
        document.getElementById(
            "addUserEmail"
        );


    if (employeeIDField) {

        employeeIDField.value =
            employeeID;

    }


    if (fullNameField) {

        fullNameField.value =
            fullName;

    }


    if (positionField) {

        positionField.value =
            position;

    }


    if (assignmentField) {

        assignmentField.value =
            assignment;

    }


    if (emailField) {

        emailField.value =
            email;

    }


    if (details) {

        details.classList.remove(
            "d-none"
        );

    }


    if (createButton) {

        createButton.disabled =
            false;

    }

}


/* ==========================================================
   CLEAR EMPLOYEE DETAILS
========================================================== */

function clearAddUserEmployeeDetails() {

    const fields = [

        "addUserEmployeeID",

        "addUserFullName",

        "addUserPosition",

        "addUserAssignment",

        "addUserEmail"

    ];


    fields.forEach(
        fieldID => {

            const field =
                document.getElementById(
                    fieldID
                );


            if (field) {

                field.value =
                    "";

            }

        }
    );

}


/* ==========================================================
   ADD USER TYPE
   MANAGEMENT ACCOUNT ONLY
========================================================== */

const addUserExistingRadio =
    document.getElementById(
        "addUserExisting"
    );


const addUserManualRadio =
    document.getElementById(
        "addUserManual"
    );


const addUserExistingSection =
    document.getElementById(
        "addUserExistingSection"
    );


const addUserManualSection =
    document.getElementById(
        "addUserManualSection"
    );


const addUserCreateButton =
    document.getElementById(
        "createUserButton"
    );


/* ==========================================================
   SWITCH ACCOUNT TYPE
========================================================== */

function handleAddUserTypeChange() {

    const isManual =
        addUserManualRadio &&
        addUserManualRadio.checked;


    const details =
        document.getElementById(
            "addUserEmployeeDetails"
        );


    if (isManual) {

        if (addUserExistingSection) {

            addUserExistingSection.classList.add(
                "d-none"
            );

        }


        if (addUserManualSection) {

            addUserManualSection.classList.remove(
                "d-none"
            );

        }


        if (details) {

            details.classList.add(
                "d-none"
            );

        }


        if (addUserCreateButton) {

            addUserCreateButton.disabled =
                true;

        }

    }
    else {

        if (addUserExistingSection) {

            addUserExistingSection.classList.remove(
                "d-none"
            );

        }


        if (addUserManualSection) {

            addUserManualSection.classList.add(
                "d-none"
            );

        }


        if (details) {

            details.classList.add(
                "d-none"
            );

        }


        if (addUserCreateButton) {

            addUserCreateButton.disabled =
                true;

        }

    }

}


/* ==========================================================
   ACCOUNT TYPE EVENTS
========================================================== */

if (addUserExistingRadio) {

    addUserExistingRadio.addEventListener(
        "change",
        handleAddUserTypeChange
    );

}


if (addUserManualRadio) {

    addUserManualRadio.addEventListener(
        "change",
        handleAddUserTypeChange
    );

}


/* ==========================================================
   RESET ADD USER MODAL
========================================================== */

if (addUserModalElement) {

    addUserModalElement.addEventListener(
        "hidden.bs.modal",
        () => {

            if (addUserExistingRadio) {

                addUserExistingRadio.checked =
                    true;

            }


            handleAddUserTypeChange();


            clearAddUserEmployeeDetails();

        }
    );

}
/* ==========================================================
   FINAL ADD USER MODAL RESET
========================================================== */

if (addUserModalElement) {

    addUserModalElement.addEventListener(
        "hidden.bs.modal",
        () => {

            /*
             * Always return to
             * Existing Employee mode.
             */

            if (addUserExistingRadio) {

                addUserExistingRadio.checked =
                    true;

            }


            if (addUserManualRadio) {

                addUserManualRadio.checked =
                    false;

            }


            handleAddUserTypeChange();


            /*
             * Clear selected employee.
             */

            const employeeSelect =
                document.getElementById(
                    "addUserEmployee"
                );


            if (employeeSelect) {

                employeeSelect.value =
                    "";

            }


            clearAddUserEmployeeDetails();


            /*
             * Hide employee details.
             */

            const details =
                document.getElementById(
                    "addUserEmployeeDetails"
                );


            if (details) {

                details.classList.add(
                    "d-none"
                );

            }


            /*
             * Reset authorization fields.
             *
             * Employee access is always enabled.
             */

            const employeeAccess =
                document.getElementById(
                    "addAccessEmployee"
                );


            const supervisorAccess =
                document.getElementById(
                    "addAccessSupervisor"
                );


            const lddAccess =
                document.getElementById(
                    "addAccessLddMonitoring"
                );


            const administratorAccess =
                document.getElementById(
                    "addAccessAdministrator"
                );


            if (employeeAccess) {

                employeeAccess.checked =
                    true;

            }


            if (supervisorAccess) {

                supervisorAccess.checked =
                    false;

            }


            if (lddAccess) {

                lddAccess.checked =
                    false;

            }


            if (administratorAccess) {

                administratorAccess.checked =
                    false;

            }


            /*
             * Reset System Assignment.
             */

            const systemAssignment =
                document.getElementById(
                    "addSystemAssignment"
                );


            if (systemAssignment) {

                systemAssignment.value =
                    "";

            }


            /*
             * Reset LDD Monitoring Role.
             */

            const lddRole =
                document.getElementById(
                    "addLddMonitoringRole"
                );


            if (lddRole) {

                lddRole.value =
                    "";

            }


            /*
             * Reset account status.
             */

            const status =
                document.getElementById(
                    "addUserStatus"
                );


            if (status) {

                status.value =
                    "Active";

            }


            /*
             * Disable Create button
             * until an employee is selected.
             */

            if (addUserCreateButton) {

                addUserCreateButton.disabled =
                    true;

            }

        }
    );

}

/* ==========================================================
   CREATE USER ACCOUNT
   ----------------------------------------------------------
   Uses existing backend createUser(employeeID, role, status)
   Then applies the explicit LDIMS authorization fields.
========================================================== */

async function createUserAccount() {

    const employeeIDElement =
        document.getElementById(
            "addUserEmployee"
        );

    const statusElement =
        document.getElementById(
            "addUserStatus"
        );

    const employeeID =
        employeeIDElement
            ? String(
                employeeIDElement.value || ""
            ).trim()
            : "";

    const status =
        statusElement
            ? statusElement.value
            : "Active";


    if (!employeeID) {

        alert(
            "Please select an employee."
        );

        return;

    }


    /*
     * Build explicit LDIMS Access.
     *
     * Employee is always included.
     */

    const accessValues = [
        "Employee"
    ];


    if (
        document.getElementById(
            "addAccessSupervisor"
        )?.checked
    ) {

        accessValues.push(
            "Supervisor"
        );

    }


    if (
        document.getElementById(
            "addAccessLddMonitoring"
        )?.checked
    ) {

        accessValues.push(
            "LDD Monitoring"
        );

    }


    if (
        document.getElementById(
            "addAccessAdministrator"
        )?.checked
    ) {

        accessValues.push(
            "Administrator"
        );

    }


    /*
     * Legacy Role is retained only for
     * backward compatibility.
     *
     * Authorization is controlled by
     * LDIMS Access.
     */

    let legacyRole =
        "Employee";


    if (
        document.getElementById(
            "addAccessAdministrator"
        )?.checked
    ) {

        legacyRole =
            "Administrator";

    }
    else if (
        document.getElementById(
            "addAccessSupervisor"
        )?.checked
    ) {

        legacyRole =
            "Supervisor";

    }


    const ldimAccess =
        accessValues.join(",");


    /*
     * System Assignment is separate from
     * organizational Place of Assignment.
     */

    const systemAssignmentElement =
        document.getElementById(
            "addSystemAssignment"
        );

    const systemAssignment =
        systemAssignmentElement
            ? String(
                systemAssignmentElement.value || ""
            ).trim()
            : "";


    /*
     * LDD Monitoring Role is explicit.
     */

    const lddRoleElement =
        document.getElementById(
            "addLddMonitoringRole"
        );

    const lddMonitoringRole =
        lddRoleElement
            ? normalizeLddMonitoringRoleValue(
                lddRoleElement.value
            )
            : "";


    /*
     * Prevent double submission.
     */

    const createButton =
        document.getElementById(
            "createUserButton"
        );


    if (createButton) {

        createButton.disabled =
            true;

    }


    try {

        /*
         * STEP 1
         * Create the actual LDIMS account.
         *
         * Existing backend signature is preserved:
         * createUser(employeeID, role, status)
         */

        console.log(
            "CREATE USER REQUEST:",
            {
                employeeID:
                    employeeID,

                role:
                    legacyRole,

                status:
                    status
            }
        );


        const createResult =
            await API.post({

                action:
                    "createUser",

                employeeID:
                    employeeID,

                role:
                    legacyRole,

                status:
                    status

            });


        console.log(
            "CREATE USER RESPONSE:",
            createResult
        );


        if (
            !createResult ||
            !createResult.success
        ) {

            throw new Error(
                createResult?.message ||
                "Unable to create user account."
            );

        }


        /*
         * STEP 2
         * Apply explicit authorization fields.
         */

        const accessResult =
            await API.post({

                action:
                    "updateUserAccess",

                employeeID:
                    employeeID,

                ldimAccess:
                    ldimAccess,

                systemAssignment:
                    systemAssignment,

                lddMonitoringRole:
                    lddMonitoringRole

            });


        console.log(
            "CREATE USER ACCESS RESPONSE:",
            accessResult
        );


        if (
            !accessResult ||
            !accessResult.success
        ) {

            throw new Error(
                accessResult?.message ||
                "Account was created, but authorization settings could not be saved."
            );

        }


        /*
         * Account successfully created
         * and authorization successfully applied.
         */

        let successMessage =
            "LDIMS account created successfully.";


        if (
            createResult.temporaryPassword
        ) {

            successMessage +=
                "\n\nTemporary Password:\n" +
                createResult.temporaryPassword;

        }


        alert(
            successMessage
        );


        /*
         * Close modal.
         */

        const modalElement =
            document.getElementById(
                "addUserModal"
            );


        if (
            modalElement &&
            typeof bootstrap !== "undefined"
        ) {

            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                ) ||
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.hide();

        }


        /*
         * Reload authoritative USERS data.
         */

        await loadUsers();


    }
    catch (error) {

        console.error(
            "CREATE USER ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to create user account."
        );

    }
    finally {

        if (createButton) {

            createButton.disabled =
                false;

        }

    }

}


/* ==========================================================
   CREATE USER BUTTON EVENT
========================================================== */

if (
    addUserCreateButton
) {

    addUserCreateButton.addEventListener(
        "click",
        createUserAccount
    );

}