/* ==========================================================
   LDIMS - Learning Needs Assessment
   Module: Employee LNA
========================================================== */

"use strict";


/* ==========================================================
   Configuration
========================================================== */

/*
 * Official LNA Google Form
 */
const LNA_FORM_BASE_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSd5KZL2OxNRmk7OyUtNtJdiKQiKs0aBQA4YhSgbI0ezI5IUTg/viewform";


/*
 * Google Forms pre-fill parameter
 * for EMPLOYEE ID
 */
const LNA_EMPLOYEE_ID_ENTRY =
    "entry.62958493";


/* ==========================================================
   Get Logged-in Employee
========================================================== */

function getLoggedInEmployee() {

    try {

        /* ----------------------------------------------
           LDIMS Session
        ---------------------------------------------- */

        if (
            typeof Session !== "undefined" &&
            typeof Session.get === "function"
        ) {

            return Session.get();

        }


        if (
            typeof Session !== "undefined" &&
            typeof Session.getUser === "function"
        ) {

            return Session.getUser();

        }


        if (
            typeof Session !== "undefined" &&
            typeof Session.getSession === "function"
        ) {

            return Session.getSession();

        }


        /* ----------------------------------------------
           Local Storage fallback
        ---------------------------------------------- */

        const storedSession =
            localStorage.getItem("ldimsSession");

        if (storedSession) {

            return JSON.parse(storedSession);

        }


        const storedUser =
            localStorage.getItem("ldimsUser");

        if (storedUser) {

            return JSON.parse(storedUser);

        }


        return null;

    } catch (error) {

        console.error(
            "Unable to retrieve employee session:",
            error
        );

        return null;

    }

}


/* ==========================================================
   Get Employee ID
========================================================== */

function getEmployeeIDFromSession() {

    const user =
        getLoggedInEmployee();


    if (!user) {

        return "";

    }


    return String(
        user.employeeID ||
        user.EmployeeID ||
        user.employeeId ||
        user.id ||
        ""
    ).trim();

}


/* ==========================================================
   Display Employee ID
========================================================== */

function displayEmployeeID() {

    const employeeID =
        getEmployeeIDFromSession();


    const employeeIDElement =
        document.getElementById("employeeID");


    if (!employeeIDElement) {

        return;

    }


    if (!employeeID) {

        employeeIDElement.textContent =
            "Session not found";

        return;

    }


    employeeIDElement.textContent =
        employeeID;

}


/* ==========================================================
   Open LNA Google Form
========================================================== */

function openLNAForm() {

    const employeeID =
        getEmployeeIDFromSession();


    /* ----------------------------------------------
       Validate session
    ---------------------------------------------- */

    if (!employeeID) {

        alert(
            "Employee session not found. Please log in again."
        );

        return;

    }


    /* ----------------------------------------------
       Build pre-filled Google Form URL
    ---------------------------------------------- */

    const formURL =
        LNA_FORM_BASE_URL +
        "?usp=pp_url&" +
        LNA_EMPLOYEE_ID_ENTRY +
        "=" +
        encodeURIComponent(employeeID);


    console.log(
        "Opening LNA Form:",
        formURL
    );


    /* ----------------------------------------------
       Open Google Form
    ---------------------------------------------- */

    window.open(
        formURL,
        "_blank"
    );

}


/* ==========================================================
   Logout
========================================================== */

function handleLogout(event) {

    event.preventDefault();


    try {

        if (
            typeof Session !== "undefined" &&
            typeof Session.logout === "function"
        ) {

            Session.logout();

            return;

        }


        localStorage.removeItem(
            "ldimsSession"
        );

        localStorage.removeItem(
            "ldimsUser"
        );


        window.location.href =
            "../index.html";

    } catch (error) {

        console.error(
            "Logout failed:",
            error
        );


        window.location.href =
            "../index.html";

    }

}


/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ----------------------------------------------
           Display Employee ID
        ---------------------------------------------- */

        displayEmployeeID();


        /* ----------------------------------------------
           Start LNA button
        ---------------------------------------------- */

        const startLnaButton =
            document.getElementById(
                "startLnaButton"
            );


        if (startLnaButton) {

            startLnaButton.addEventListener(
                "click",
                openLNAForm
            );

        }


        /* ----------------------------------------------
           Logout
        ---------------------------------------------- */

        const logoutLink =
            document.getElementById(
                "logoutLink"
            );


        if (logoutLink) {

            logoutLink.addEventListener(
                "click",
                handleLogout
            );

        }

    }
);