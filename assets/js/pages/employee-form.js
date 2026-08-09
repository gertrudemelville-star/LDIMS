/* ==========================================================
   LDIMS
   Employee Form
========================================================== */

"use strict";

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeForm();

});

/* ==========================================================
   Initialize Form
========================================================== */

function initializeForm() {

    document.getElementById("employeeID").focus();

}

/* ==========================================================
   Save Employee
========================================================== */

document
    .getElementById("employeeForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const employee = {

            EmployeeID: document.getElementById("employeeID").value.trim(),

            FirstName: document.getElementById("firstName").value.trim(),

            MiddleName: document.getElementById("middleName").value.trim(),

            LastName: document.getElementById("lastName").value.trim(),

            Email: document.getElementById("email").value.trim(),

            ContactNumber: document.getElementById("contactNumber").value.trim(),

            Sex: document.getElementById("sex").value,

            CivilStatus: document.getElementById("civilStatus").value,

            Position: document.getElementById("position").value,

            Division: document.getElementById("division").value,

            Section: document.getElementById("section").value,

            EmploymentStatus: document.getElementById("status").value

        };

        /* ==============================================
           Basic Validation
        ============================================== */

        if (
            employee.EmployeeID === "" ||
            employee.FirstName === "" ||
            employee.LastName === "" ||
            employee.Email === ""
        ) {

            alert("Please complete all required fields.");

            return;

        }

        /* ==============================================
           Save to Google Apps Script
        ============================================== */

        const result = await API.saveEmployee(employee);

        console.log(result);

        if (result.success) {

            alert(result.message);

            window.location.href = "employee.html";

        } else {

            alert(result.message);

        }

    });

/* ==========================================================
   Cancel
========================================================== */

document
    .getElementById("btnCancel")
    .addEventListener("click", function () {

        if (confirm("Discard changes?")) {

            window.location.href = "employee.html";

        }

    });