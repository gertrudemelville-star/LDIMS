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


    /*
     * Pending users is kept for compatibility
     * if the element exists in the page.
     */

    setUserText(
        "pendingUsers",
        pending
    );


    /*
     * Administrator count.
     */

    setUserText(
        "administratorUsers",
        administrators
    );

}


/* ==========================================================
   RENDER USERS
========================================================== */

function renderUsers(
    users
) {

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
                    user.employeeID
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


            const role =
                getRoleBadge(
                    user.role
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
                    ${role}
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


    setInputValue(
        "manageRole",
        normalizeRoleValue(
            user.role
        )
    );


    setInputValue(
        "manageStatus",
        normalizeStatusValue(
            user.status
        )
    );

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


    const roleElement =
        document.getElementById(
            "manageRole"
        );


    const statusElement =
        document.getElementById(
            "manageStatus"
        );


    const newRole =
        roleElement
            ? roleElement.value
            : selectedUser.role;


    const newStatus =
        statusElement
            ? statusElement.value
            : selectedUser.status;


    const oldRole =
        normalizeRoleValue(
            selectedUser.role
        );


    const oldStatus =
        normalizeStatusValue(
            selectedUser.status
        );


    /*
     * Nothing changed.
     */

    if (
        newRole === oldRole &&
        newStatus === oldStatus
    ) {

        closeManageUserModal();

        return;

    }


    showManageUserSaving();


    try {

        /*
         * Update role first when changed.
         */

        if (
            newRole !== oldRole
        ) {

            const roleResult =
                await API.post({

                    action:
                        "updateUserRole",

                    employeeID:
                        employeeID,

                    role:
                        newRole

                });


            console.log(
                "UPDATE ROLE RESPONSE:",
                roleResult
            );


            if (
                !roleResult ||
                !roleResult.success
            ) {

                throw new Error(
                    roleResult?.message ||
                    "Unable to update user role."
                );

            }

        }


        /*
         * Update status when changed.
         */

        if (
            newStatus !== oldStatus
        ) {

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
         * Close modal.
         */

        closeManageUserModal();


        /*
         * Reload from Google Sheets.
         */

        await loadUsers();


    } catch (error) {

        console.error(
            "USER MANAGEMENT SAVE ERROR:",
            error
        );


        showManageUserError(
            error.message ||
            "Unable to save user changes."
        );

    } finally {

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
   ERROR
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
   OPEN MODAL - LOAD EMPLOYEES
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


    select.disabled = true;


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


        /*
         * Accept the different response
         * structures used by LDIMS.
         */

        if (
            !result
        ) {

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
         * Remove employees who already
         * have an LDIMS account.
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


        /*
         * Reset dropdown.
         */

        select.innerHTML = `

            <option value="">
                Select an employee...
            </option>

        `;


        /*
         * Populate dropdown.
         */

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
                    `${employeeID} — ${fullName || "Unnamed Employee"}`;


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


        select.disabled = false;


        /*
         * No employees available.
         */

        if (
            availableEmployees.length === 0
        ) {

            select.innerHTML = `

                <option value="">
                    No available employees
                </option>

            `;


            select.disabled = true;

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


        select.disabled = true;

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


    document.getElementById(
        "addUserEmployeeID"
    ).value =
        employeeID;


    document.getElementById(
        "addUserFullName"
    ).value =
        fullName;


    document.getElementById(
        "addUserPosition"
    ).value =
        position;


    document.getElementById(
        "addUserAssignment"
    ).value =
        assignment;


    document.getElementById(
        "addUserEmail"
    ).value =
        email;


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

                field.value = "";

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

        /*
         * Hide existing employee selection.
         */

        if (addUserExistingSection) {

            addUserExistingSection.classList.add(
                "d-none"
            );

        }


        /*
         * Show authorized management account notice.
         */

        if (addUserManualSection) {

            addUserManualSection.classList.remove(
                "d-none"
            );

        }


        /*
         * No manual employee fields.
         */

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

        /*
         * Show existing employee selection.
         */

        if (addUserExistingSection) {

            addUserExistingSection.classList.remove(
                "d-none"
            );

        }


        /*
         * Hide management account notice.
         */

        if (addUserManualSection) {

            addUserManualSection.classList.add(
                "d-none"
            );

        }


        /*
         * Hide employee details
         * until an employee is selected.
         */

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
