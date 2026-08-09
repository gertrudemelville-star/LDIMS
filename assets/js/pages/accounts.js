/* ==========================================================
   LDIMS - Employee Account Approval
   Module: Administrator
========================================================== */

"use strict";


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Session.requireLogin();

        initializePage();

    }
);


/* ==========================================================
   INITIALIZE PAGE
========================================================== */

function initializePage() {

    const user =
        Session.get();


    if (!user) {

        return;

    }


    /* ------------------------------------------------------
       Administrator access only
    ------------------------------------------------------ */

    const role =
        String(
            user.role || ""
        )
        .trim()
        .toUpperCase();


    if (
        role !== "ADMIN" &&
        role !== "ADMINISTRATOR"
    ) {

        alert(
            "Administrator access required."
        );

        window.location.href =
            "dashboard.html";

        return;

    }


    loadPendingAccounts();


    document
        .getElementById(
            "refreshButton"
        )
        ?.addEventListener(
            "click",
            loadPendingAccounts
        );


    document
        .getElementById(
            "logoutLink"
        )
        ?.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                Session.logout();

            }
        );

}


/* ==========================================================
   LOAD PENDING ACCOUNTS
========================================================== */

async function loadPendingAccounts() {

    showLoading();


    try {

        const result =
            await API.getPendingEmployees();


        if (
            !result ||
            !result.success
        ) {

            showAlert(
                result?.message ||
                "Unable to load pending accounts.",
                "danger"
            );

            showEmpty();

            return;

        }


        const employees =
            result.employees || [];


        updatePendingBadge(
            employees.length
        );


        if (
            employees.length === 0
        ) {

            showEmpty();

            return;

        }


        renderAccounts(
            employees
        );


    } catch (error) {

        console.error(
            "Account loading error:",
            error
        );


        showAlert(
            "Unable to connect to the LDIMS server.",
            "danger"
        );

        showEmpty();

    }

}


/* ==========================================================
   RENDER ACCOUNTS
========================================================== */

function renderAccounts(
    employees
) {

    const tbody =
        document.getElementById(
            "accountsTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    employees.forEach(
        employee => {

            const tr =
                document.createElement(
                    "tr"
                );


            /* ------------------------------------------------
               Employee ID
            ------------------------------------------------ */

            const idCell =
                document.createElement(
                    "td"
                );

            idCell.textContent =
                employee.employeeID || "-";


            /* ------------------------------------------------
               Name
            ------------------------------------------------ */

            const nameCell =
                document.createElement(
                    "td"
                );


            const fullname =
                [
                    employee.firstName,
                    employee.middleName,
                    employee.lastName
                ]
                .filter(
                    value =>
                        String(
                            value || ""
                        ).trim() !== ""
                )
                .join(" ");


            nameCell.textContent =
                fullname || "-";


            /* ------------------------------------------------
               Position
            ------------------------------------------------ */

            const positionCell =
                document.createElement(
                    "td"
                );

            positionCell.textContent =
                employee.position || "-";


            /* ------------------------------------------------
               Assignment
            ------------------------------------------------ */

            const assignmentCell =
                document.createElement(
                    "td"
                );

            assignmentCell.textContent =
                employee.placeOfAssignment || "-";


            /* ------------------------------------------------
               Email
            ------------------------------------------------ */

            const emailCell =
                document.createElement(
                    "td"
                );

            emailCell.textContent =
                employee.email || "-";


            /* ------------------------------------------------
               Action
            ------------------------------------------------ */

            const actionCell =
                document.createElement(
                    "td"
                );


            const approveButton =
                document.createElement(
                    "button"
                );


            approveButton.type =
                "button";


            approveButton.className =
                "btn btn-sm btn-primary";


            approveButton.innerHTML =
                '<i class="bi bi-check-circle me-1"></i>' +
                "Approve";


            approveButton.addEventListener(
                "click",
                () => {

                    approveAccount(
                        employee,
                        approveButton
                    );

                }
            );


            actionCell.appendChild(
                approveButton
            );


            /* ------------------------------------------------
               Add row
            ------------------------------------------------ */

            tr.appendChild(
                idCell
            );

            tr.appendChild(
                nameCell
            );

            tr.appendChild(
                positionCell
            );

            tr.appendChild(
                assignmentCell
            );

            tr.appendChild(
                emailCell
            );

            tr.appendChild(
                actionCell
            );


            tbody.appendChild(
                tr
            );

        }
    );


    hideLoading();


    document
        .getElementById(
            "tableContainer"
        )
        ?.classList.remove(
            "d-none"
        );


    document
        .getElementById(
            "emptyState"
        )
        ?.classList.add(
            "d-none"
        );

}


/* ==========================================================
   APPROVE ACCOUNT
========================================================== */

async function approveAccount(
    employee,
    button
) {

    const employeeID =
        employee.employeeID;


    const fullname =
        [
            employee.firstName,
            employee.middleName,
            employee.lastName
        ]
        .filter(
            value =>
                String(
                    value || ""
                ).trim() !== ""
        )
        .join(" ");


    const confirmed =
        confirm(

            "Approve this employee account?\n\n" +

            "Employee ID: " +
            employeeID +
            "\n" +

            "Name: " +
            fullname +
            "\n\n" +

            "A temporary password will be generated " +
            "and sent to the employee's email."

        );


    if (!confirmed) {

        return;

    }


    button.disabled =
        true;


    button.innerHTML =
        '<span class="spinner-border spinner-border-sm me-1"></span>' +
        "Approving...";


    try {

        const result =
            await API.activateEmployee(
                employeeID
            );


        if (
            result &&
            result.success
        ) {

            showAlert(

                result.message ||
                "Employee account successfully activated.",

                "success"

            );


            /*
             * Reload the table.
             */

            setTimeout(
                loadPendingAccounts,
                1000
            );


        } else {

            showAlert(

                result?.message ||
                "Unable to activate employee account.",

                "danger"

            );


            button.disabled =
                false;


            button.innerHTML =
                '<i class="bi bi-check-circle me-1"></i>' +
                "Approve";

        }


    } catch (error) {

        console.error(
            "Activation error:",
            error
        );


        showAlert(
            "Unable to connect to the LDIMS server.",
            "danger"
        );


        button.disabled =
            false;


        button.innerHTML =
            '<i class="bi bi-check-circle me-1"></i>' +
            "Approve";

    }

}


/* ==========================================================
   UI HELPERS
========================================================== */

function showLoading() {

    document
        .getElementById(
            "loadingState"
        )
        ?.classList.remove(
            "d-none"
        );


    document
        .getElementById(
            "tableContainer"
        )
        ?.classList.add(
            "d-none"
        );


    document
        .getElementById(
            "emptyState"
        )
        ?.classList.add(
            "d-none"
        );

}


function hideLoading() {

    document
        .getElementById(
            "loadingState"
        )
        ?.classList.add(
            "d-none"
        );

}


function showEmpty() {

    hideLoading();


    document
        .getElementById(
            "tableContainer"
        )
        ?.classList.add(
            "d-none"
        );


    document
        .getElementById(
            "emptyState"
        )
        ?.classList.remove(
            "d-none"
        );

}


function updatePendingBadge(
    count
) {

    const badge =
        document.getElementById(
            "pendingBadge"
        );


    if (!badge) {

        return;

    }


    badge.textContent =
        count;


    badge.classList.toggle(
        "d-none",
        count === 0
    );

}


function showAlert(
    message,
    type = "danger"
) {

    const container =
        document.getElementById(
            "alertMessage"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div
            class="alert alert-${type} alert-dismissible fade show"
            role="alert">

            ${message}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>

    `;

}