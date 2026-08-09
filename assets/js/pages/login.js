/* ==========================================================
   LDIMS - Login Page
   Module: User Authentication
========================================================== */

"use strict";


/* ==========================================================
   Elements
========================================================== */

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("buttonText");

const loadingSpinner =
    document.getElementById("loadingSpinner");

const alertMessage =
    document.getElementById("alertMessage");


/* ==========================================================
   Show Alert
========================================================== */

function showAlert(message, type = "danger") {

    if (!alertMessage) {
        return;
    }


    alertMessage.innerHTML = "";


    const alert = document.createElement("div");

    alert.className =
        `alert alert-${type} alert-dismissible fade show`;


    alert.setAttribute(
        "role",
        "alert"
    );


    alert.appendChild(
        document.createTextNode(
            message || "An unexpected error occurred."
        )
    );


    const closeButton =
        document.createElement("button");


    closeButton.type =
        "button";


    closeButton.className =
        "btn-close";


    closeButton.setAttribute(
        "data-bs-dismiss",
        "alert"
    );


    closeButton.setAttribute(
        "aria-label",
        "Close"
    );


    alert.appendChild(
        closeButton
    );


    alertMessage.appendChild(
        alert
    );

}


/* ==========================================================
   Determine Dashboard By Role
========================================================== */

function getDashboardByRole(role) {

    const normalizedRole =
        String(role || "")
            .trim()
            .toUpperCase();


    /* ------------------------------------------------------
       Administrator
    ------------------------------------------------------ */

    if (
        normalizedRole === "ADMIN" ||
        normalizedRole === "ADMINISTRATOR"
    ) {

        return "dashboard.html";

    }


    /* ------------------------------------------------------
       Employee
    ------------------------------------------------------ */

    if (
        normalizedRole === "EMPLOYEE"
    ) {

        return "employee/dashboard.html";

    }


    /* ------------------------------------------------------
       Supervisor
    ------------------------------------------------------ */

    if (
        normalizedRole === "SUPERVISOR"
    ) {

        return "supervisor/dashboard.html";

    }


    /* ------------------------------------------------------
       Unknown role
       Keep the user on the existing root dashboard
       rather than sending them to a non-existent page.
    ------------------------------------------------------ */

    return "dashboard.html";

}


/* ==========================================================
   Login
========================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const employeeID =
                document
                    .getElementById("employeeID")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value
                    .trim();


            /* --------------------------------------------------
               Basic Validation
            -------------------------------------------------- */

            if (!employeeID) {

                showAlert(
                    "Please enter your Employee ID."
                );

                return;

            }


            if (!password) {

                showAlert(
                    "Please enter your password."
                );

                return;

            }


            /* --------------------------------------------------
               Loading State
            -------------------------------------------------- */

            loginButton.disabled = true;

            buttonText.classList.add(
                "d-none"
            );

            loadingSpinner.classList.remove(
                "d-none"
            );


            try {

                /* ----------------------------------------------
                   Authenticate
                ---------------------------------------------- */

                const result =
                    await API.login(
                        employeeID,
                        password
                    );


                /* ----------------------------------------------
                   Successful Login
                ---------------------------------------------- */

                if (result && result.success) {


                    /*
                     * Save the complete authenticated response.
                     *
                     * This now includes:
                     *
                     * employeeID
                     * fullname
                     * position
                     * assignment
                     * role
                     * email
                     */

                    Session.save(
                        result
                    );


                    /* ------------------------------------------
                       Determine destination by role
                    ------------------------------------------ */

                    const destination =
                        getDashboardByRole(
                            result.role
                        );


                    /*
                     * Redirect according to authenticated role.
                     */

                    window.location.href =
                        destination;


                    return;

                }


                /* ----------------------------------------------
                   Failed Login
                ---------------------------------------------- */

                showAlert(
                    result?.message ||
                    "Invalid Employee ID or password."
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showAlert(
                    "Unable to connect to the server."
                );


            } finally {

                /* ----------------------------------------------
                   Restore Login Button
                ---------------------------------------------- */

                loginButton.disabled =
                    false;


                buttonText.classList.remove(
                    "d-none"
                );


                loadingSpinner.classList.add(
                    "d-none"
                );

            }

        }
    );

}


/* ==========================================================
   Toggle Password
========================================================== */

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            const password =
                document.getElementById(
                    "password"
                );


            const icon =
                this.querySelector("i");


            if (
                password.type === "password"
            ) {

                password.type =
                    "text";


                if (icon) {

                    icon.className =
                        "bi bi-eye-slash";

                }


            } else {

                password.type =
                    "password";


                if (icon) {

                    icon.className =
                        "bi bi-eye";

                }

            }

        }
    );

}