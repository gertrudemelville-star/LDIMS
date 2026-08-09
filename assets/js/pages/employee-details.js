/* ==========================================================
   LDIMS - Employee Details
   Module: Employee Profile (Read Only)
========================================================== */

"use strict";

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        // Check session
        if (typeof checkSession === "function") {
            await checkSession();
        }

        // Load employee information
        loadEmployee();

    } catch (error) {

        console.error(error);

        alert("Unable to load employee details.");

    }

});


/* ==========================================================
   Load Employee
========================================================== */

function loadEmployee() {

    const employee = getTemporaryEmployee();

    populateEmployee(employee);

}


/* ==========================================================
   Populate Screen
========================================================== */

function populateEmployee(employee) {

    setValue("fullName", employee.fullName);
    setValue("employeePosition", employee.position);

    setValue("employmentStatus", employee.status);

    setValue("employeeID", employee.employeeID);
    setValue("email", employee.email);
    setValue("contactNumber", employee.contactNumber);
    setValue("civilStatus", employee.civilStatus);

    setValue("position", employee.position);
    setValue("division", employee.division);
    setValue("section", employee.section);
    setValue("supervisor", employee.supervisor);

    setValue("appointmentDate", employee.appointmentDate);
    setValue("yearsInService", employee.yearsInService);

}


/* ==========================================================
   Helper
========================================================== */

function setValue(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value || "-";

}


/* ==========================================================
   Temporary Data
   REMOVE AFTER API INTEGRATION
========================================================== */

function getTemporaryEmployee() {

    return {

        employeeID: "EMP-000001",

        fullName: "Juan Dela Cruz",

        email: "juan.delacruz@nbi.gov.ph",

        contactNumber: "09171234567",

        civilStatus: "Single",

        position: "Information Technology Officer I",

        division: "Learning & Development Division",

        section: "Systems Development Section",

        supervisor: "Maria Santos",

        appointmentDate: "January 15, 2022",

        yearsInService: "4 Years",

        status: "Active"

    };

}


/* ==========================================================
   Buttons
========================================================== */

document
.getElementById("btnBack")
?.addEventListener("click", () => {

    window.location.href = "employee.html";

});


document
.getElementById("btnEdit")
?.addEventListener("click", () => {

    alert("Employee Edit page will be implemented in the next phase.");

});