/* ==========================================================
   LDIMS - Login Page
   Module: User Authentication
========================================================== */

"use strict";


/* ==========================================================
   ELEMENTS
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
   SHOW ALERT
========================================================== */

function showAlert(
    message,
    type = "danger"
) {

    if (!alertMessage) {
        return;
    }

    alertMessage.innerHTML = "";

    const alert =
        document.createElement("div");

    alert.className =
        `alert alert-${type} alert-dismissible fade show`;

    alert.setAttribute(
        "role",
        "alert"
    );

    alert.appendChild(
        document.createTextNode(
            message ||
            "An unexpected error occurred."
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
   GET DASHBOARD BY ROLE
========================================================== */

function getDashboardByRole(
    role
) {

    const normalizedRole =
        String(
            role || ""
        )
        .trim()
        .toUpperCase();


    console.log(
        "LOGIN ROLE:",
        role
    );


    console.log(
        "NORMALIZED ROLE:",
        normalizedRole
    );


    /* ======================================================
       IMMEDIATE SUPERVISOR
    ====================================================== */

    if (
        normalizedRole ===
            "IMMEDIATE SUPERVISOR" ||

        normalizedRole ===
            "SUPERVISOR"
    ) {

        return "supervisor/dashboard.html";

    }


    /* ======================================================
       ADMINISTRATOR
    ====================================================== */

    if (
        normalizedRole ===
            "ADMIN" ||

        normalizedRole ===
            "ADMINISTRATOR"
    ) {

        return "dashboard.html";

    }


    /* ======================================================
       LDD PERSONNEL
    ====================================================== */

    if (
    normalizedRole === "LDD PERSONNEL" ||
    normalizedRole === "LDD" ||
    normalizedRole === "L&D OFFICER" ||
    normalizedRole === "L&D PERSONNEL" ||
    normalizedRole === "LDD ASST CHIEF" ||
    normalizedRole === "LDD ASSISTANT CHIEF" ||
    normalizedRole === "LDD CHIEF" ||
    normalizedRole === "LDD SUPERVISOR"
) {

    return "ldd/dashboard.html";

}


    /* ======================================================
       EMPLOYEE
    ====================================================== */

    if (
        normalizedRole ===
            "EMPLOYEE"
    ) {

        return "employee/dashboard.html";

    }


    /* ======================================================
       DEFAULT
    ====================================================== */

    console.warn(
        "Unknown role. Using default dashboard:",
        role
    );

    return "dashboard.html";

}


/* ==========================================================
   LOGIN
========================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const employeeIDElement =
                document.getElementById(
                    "employeeID"
                );


            const passwordElement =
                document.getElementById(
                    "password"
                );


            const employeeID =
                employeeIDElement
                    ? employeeIDElement.value.trim()
                    : "";


            const password =
                passwordElement
                    ? passwordElement.value.trim()
                    : "";


            /* ==================================================
               VALIDATION
            ================================================== */

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


            /* ==================================================
               LOADING
            ================================================== */

            if (loginButton) {

                loginButton.disabled = true;

            }


            if (buttonText) {

                buttonText.classList.add(
                    "d-none"
                );

            }


            if (loadingSpinner) {

                loadingSpinner.classList.remove(
                    "d-none"
                );

            }


            try {

                /* =================================================
                   AUTHENTICATE
                ================================================= */

                const result =
                    await API.login(
                        employeeID,
                        password
                    );


                console.log(
                    "LOGIN RESPONSE:",
                    result
                );


                /* =================================================
                   LOGIN SUCCESS
                ================================================= */

                if (
                    result &&
                    result.success
                ) {

                    /* ---------------------------------------------
                       SAVE SESSION
                    --------------------------------------------- */

                    Session.save(
                        result
                    );


                    /* ---------------------------------------------
                       GET ROLE
                    --------------------------------------------- */

                    const role =
                        result.role ||
                        result.Role ||
                        (
                            result.user
                                ? (
                                    result.user.role ||
                                    result.user.Role
                                )
                                : ""
                        );


                    console.log(
                        "USER ROLE:",
                        role
                    );


                    /* ---------------------------------------------
                       GET DESTINATION
                    --------------------------------------------- */

                    const destination =
                        getDashboardByRole(
                            role
                        );


                    console.log(
                        "LOGIN DESTINATION:",
                        destination
                    );


                    /* ---------------------------------------------
                       REDIRECT
                    --------------------------------------------- */

                    window.location.href =
                        destination;


                    return;

                }


                /* =================================================
                   LOGIN FAILED
                ================================================== */

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

                if (loginButton) {

                    loginButton.disabled =
                        false;

                }


                if (buttonText) {

                    buttonText.classList.remove(
                        "d-none"
                    );

                }


                if (loadingSpinner) {

                    loadingSpinner.classList.add(
                        "d-none"
                    );

                }

            }

        }
    );

}


/* ==========================================================
   TOGGLE PASSWORD
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


            if (!password) {

                return;

            }


            if (
                password.type ===
                "password"
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