/* ==========================================================
   LDIMS - Employee Management
   Module: Employee List
========================================================== */

"use strict";

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        // Check user session
        if (typeof checkSession === "function") {
            await checkSession();
        }

        // Load employee list
        loadEmployees();

    } catch (error) {

        console.error(error);

        alert("Unable to load employee records.");

    }

});


/* ==========================================================
   Temporary Employee Data
   REMOVE AFTER API INTEGRATION
========================================================== */

function getTemporaryEmployees() {

    return [

        {
            employeeID: "EMP-000001",
            fullName: "Juan Dela Cruz",
            position: "Information Technology Officer I",
            division: "Learning & Development Division",
            status: "Active"
        },

        {
            employeeID: "EMP-000002",
            fullName: "Maria Santos",
            position: "Administrative Officer IV",
            division: "Human Resource Division",
            status: "Active"
        },

        {
            employeeID: "EMP-000003",
            fullName: "Pedro Reyes",
            position: "Training Specialist II",
            division: "Learning & Development Division",
            status: "Inactive"
        }

    ];

}


/* ==========================================================
   Load Employee List
========================================================== */

function loadEmployees() {

    const employees = getTemporaryEmployees();

    renderEmployeeTable(employees);

}


/* ==========================================================
   Render Table
========================================================== */

function renderEmployeeTable(employees) {

    const tbody = document.getElementById("employeeTable");

    tbody.innerHTML = "";

    if (employees.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    No employee records found.
                </td>
            </tr>
        `;

        return;

    }

    employees.forEach(employee => {

        tbody.innerHTML += `

        <tr>

            <td>${employee.employeeID}</td>

            <td>${employee.fullName}</td>

            <td>${employee.position}</td>

            <td>${employee.division}</td>

            <td>

                <span class="badge ${
                    employee.status === "Active"
                    ? "bg-success"
                    : "bg-secondary"
                }">

                    ${employee.status}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-sm btn-outline-primary me-2">

                    <i class="bi bi-eye"></i>

                </button>

                <button
                    class="btn btn-sm btn-primary">

                    <i class="bi bi-pencil"></i>

                </button>

            </td>

        </tr>

        `;

    });

}


/* ==========================================================
   Buttons
========================================================== */

document
.getElementById("btnAddEmployee")
?.addEventListener("click", () => {

    alert("Add Employee page coming soon.");

});


document
.getElementById("btnRefresh")
?.addEventListener("click", () => {

    loadEmployees();

});