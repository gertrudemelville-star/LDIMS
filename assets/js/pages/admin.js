/* ==========================================================
   LDIMS ADMIN
   Employee Account Management
========================================================== */

"use strict";


/* ==========================================================
   STATE
========================================================== */

let pendingEmployees = [];
let allEmployees = [];

let adminSummary = {
    totalEmployees: 0,
    activeAccounts: 0,
    inactiveAccounts: 0
};


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeAdmin();

});


/* ==========================================================
   INITIALIZE ADMIN
========================================================== */

async function initializeAdmin() {

    setupEventListeners();

    await loadAdminData();

}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

function setupEventListeners() {

    const refreshButton =
        document.getElementById(
            "refreshPendingButton"
        );


    const searchInput =
        document.getElementById(
            "employeeSearch"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadAdminData
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            handleSearch
        );

    }

}


/* ==========================================================
   LOAD ADMIN DATA
========================================================== */

async function loadAdminData() {

    showLoading();

    hideError();

    try {

        /* --------------------------------------------------
           Load employee records
        -------------------------------------------------- */

        const employeeResult =
            await API.getEmployees();


        /*
         * getEmployees() currently returns
         * the employee array directly.
         */

        if (
            Array.isArray(employeeResult)
        ) {

            allEmployees =
                employeeResult;

        } else if (
            employeeResult &&
            Array.isArray(
                employeeResult.employees
            )
        ) {

            /*
             * Compatibility if backend later
             * returns { success, employees }.
             */

            allEmployees =
                employeeResult.employees;

        } else {

            allEmployees = [];

        }


        /* --------------------------------------------------
           Load Admin Account Summary
        -------------------------------------------------- */

        const summaryResult =
            await API.post({

                action:
                    "getAdminAccountSummary"

            });


        if (
            !summaryResult ||
            !summaryResult.success
        ) {

            throw new Error(
                summaryResult?.message ||
                "Unable to load account summary."
            );

        }


        adminSummary = {

            totalEmployees:
                Number(
                    summaryResult.totalEmployees || 0
                ),

            activeAccounts:
                Number(
                    summaryResult.activeAccounts || 0
                ),

            inactiveAccounts:
                Number(
                    summaryResult.inactiveAccounts || 0
                )

        };


        /* --------------------------------------------------
           Load Pending Employee Registrations
        -------------------------------------------------- */

        const pendingResult =
            await API.post({

                action:
                    "getPendingEmployees"

            });


        if (
            !pendingResult ||
            !pendingResult.success
        ) {

            throw new Error(
                pendingResult?.message ||
                "Unable to load pending accounts."
            );

        }


        pendingEmployees =
            Array.isArray(
                pendingResult.employees
            )
                ? pendingResult.employees
                : [];


        /* --------------------------------------------------
           Update Dashboard Summary
        -------------------------------------------------- */

        updateSummary();


        /* --------------------------------------------------
           Render Pending Employees
        -------------------------------------------------- */

        renderPendingEmployees(
            pendingEmployees
        );


    } catch (error) {

        console.error(
            "ADMIN LOAD ERROR:",
            error
        );


        allEmployees = [];

        pendingEmployees = [];


        adminSummary = {

            totalEmployees: 0,

            activeAccounts: 0,

            inactiveAccounts: 0

        };


        showError(
            error.message ||
            "Unable to load admin data."
        );

    }

}


/* ==========================================================
   UPDATE SUMMARY
========================================================== */

function updateSummary() {

    const totalEmployees =
        Number(
            adminSummary.totalEmployees || 0
        );


    const activeCount =
        Number(
            adminSummary.activeAccounts || 0
        );


    const inactiveCount =
        Number(
            adminSummary.inactiveAccounts || 0
        );


    const pendingCount =
        pendingEmployees.length;


    setText(
        "totalEmployees",
        totalEmployees
    );


    setText(
        "pendingAccounts",
        pendingCount
    );


    setText(
        "activeAccounts",
        activeCount
    );


    setText(
        "inactiveAccounts",
        inactiveCount
    );

}


/* ==========================================================
   RENDER PENDING EMPLOYEES
========================================================== */

function renderPendingEmployees(
    employees
) {

    const loadingState =
        document.getElementById(
            "adminLoadingState"
        );


    const emptyState =
        document.getElementById(
            "adminEmptyState"
        );


    const tableContainer =
        document.getElementById(
            "pendingTableContainer"
        );


    const tableBody =
        document.getElementById(
            "pendingEmployeesBody"
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
        !employees ||
        employees.length === 0
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


    employees.forEach(
        employee => {

            const row =
                document.createElement(
                    "tr"
                );


            const employeeID =
                escapeHTML(
                    employee.employeeID || ""
                );


            const fullname =
                buildFullName(
                    employee
                );


            const position =
                escapeHTML(
                    employee.position || ""
                );


            const assignment =
                escapeHTML(
                    employee.placeOfAssignment || ""
                );


            const email =
                escapeHTML(
                    employee.email || ""
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
                    ${position || "—"}
                </td>

                <td>
                    ${assignment || "—"}
                </td>

                <td>
                    ${email || "—"}
                </td>

                <td>
                    <span
                        class="badge text-bg-warning status-badge">
                        Pending
                    </span>
                </td>

                <td class="text-end">

                    <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        data-action="activate"
                        data-employee-id="${employeeID}">

                        <i class="bi bi-person-check me-1"></i>

                        Activate

                    </button>

                </td>

            `;


            const activateButton =
                row.querySelector(
                    '[data-action="activate"]'
                );


            if (activateButton) {

                activateButton.addEventListener(
                    "click",
                    () => {

                        activateEmployeeAccount(
                            employee.employeeID
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
   ACTIVATE EMPLOYEE
========================================================== */

async function activateEmployeeAccount(
    employeeID
) {

    if (!employeeID) {

        showError(
            "Employee ID is missing."
        );

        return;

    }


    const employee =
        pendingEmployees.find(
            item =>
                String(
                    item.employeeID
                ) ===
                String(employeeID)
        );


    const fullname =
        employee
            ? buildFullName(
                employee,
                false
            )
            : employeeID;


    const confirmed =
        window.confirm(

            "Activate the LDIMS account for " +
            fullname +
            "?\n\n" +

            "A temporary password will be generated " +
            "and sent to the employee's registered email."

        );


    if (!confirmed) {

        return;

    }


    const buttons =
        document.querySelectorAll(
            '[data-action="activate"]'
        );


    buttons.forEach(
        button => {

            button.disabled = true;

        }
    );


    try {

        const result =
            await API.post({

                action:
                    "activateEmployee",

                employeeID:
                    employeeID

            });


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to activate employee account."
            );

        }


        alert(
            result.message ||
            "Employee account activated successfully."
        );


        await loadAdminData();


    } catch (error) {

        console.error(
            "ACTIVATE EMPLOYEE ERROR:",
            error
        );


        showError(
            error.message ||
            "Unable to activate employee account."
        );


        buttons.forEach(
            button => {

                button.disabled = false;

            }
        );

    }

}


/* ==========================================================
   SEARCH
========================================================== */

function handleSearch(
    event
) {

    const searchTerm =
        String(
            event.target.value || ""
        )
        .trim()
        .toLowerCase();


    if (!searchTerm) {

        renderPendingEmployees(
            pendingEmployees
        );

        return;

    }


    const filtered =
        pendingEmployees.filter(
            employee => {

                const searchableText = [

                    employee.employeeID,

                    employee.firstName,

                    employee.middleName,

                    employee.lastName,

                    employee.position,

                    employee.placeOfAssignment,

                    employee.email

                ]
                .join(" ")
                .toLowerCase();


                return searchableText.includes(
                    searchTerm
                );

            }
        );


    renderPendingEmployees(
        filtered
    );

}


/* ==========================================================
   BUILD FULL NAME
========================================================== */

function buildFullName(
    employee,
    escape = true
) {

    const parts = [

        employee.firstName,

        employee.middleName,

        employee.lastName

    ]
    .map(
        value =>
            String(
                value || ""
            ).trim()
    )
    .filter(
        value =>
            value !== ""
    );


    const fullname =
        parts.join(" ") ||
        "—";


    return escape
        ? escapeHTML(fullname)
        : fullname;

}


/* ==========================================================
   UI HELPERS
========================================================== */

function showLoading() {

    const loading =
        document.getElementById(
            "adminLoadingState"
        );


    const empty =
        document.getElementById(
            "adminEmptyState"
        );


    const table =
        document.getElementById(
            "pendingTableContainer"
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


function hideError() {

    const error =
        document.getElementById(
            "adminErrorState"
        );


    if (error) {

        error.classList.add(
            "d-none"
        );

    }

}


function showError(
    message
) {

    const error =
        document.getElementById(
            "adminErrorState"
        );


    const messageElement =
        document.getElementById(
            "adminErrorMessage"
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
            "adminLoadingState"
        );


    if (loading) {

        loading.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   SET TEXT
========================================================== */

function setText(
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