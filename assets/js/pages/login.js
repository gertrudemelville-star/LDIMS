/* ==========================================================
   LDIMS - LOGIN PAGE
   Module: User Authentication

   AUTHORIZATION MODEL
   ----------------------------------------------------------
   LDIMS Access          = Module access
   System Assignment     = Functional assignment
   LDD Monitoring Role   = LDD authority

   IMPORTANT:
   - Employee access is default.
   - Supervisor access is explicit.
   - LDD access is explicit.
   - Administrator access is explicit.
   - Legacy Role is retained for compatibility only.
========================================================== */

"use strict";


/* ==========================================================
   DOM ELEMENTS
========================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const buttonText =
    document.getElementById(
        "buttonText"
    );


const loadingSpinner =
    document.getElementById(
        "loadingSpinner"
    );


const alertMessage =
    document.getElementById(
        "alertMessage"
    );


/* ==========================================================
   ALERT
========================================================== */

function showAlert(
    message,
    type = "danger"
) {

    if (!alertMessage) {
        return;
    }


    alertMessage.innerHTML =
        "";


    const alert =
        document.createElement(
            "div"
        );


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
        document.createElement(
            "button"
        );


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
   GET LDIMS ACCESS VALUES
========================================================== */

function getLDIMSAccessValues(
    user
) {

    if (!user) {
        return [];
    }


    const access =
        user.ldimAccess ||
        user.ldimsAccess ||
        user.LDIMSAccess ||
        user["LDIMS Access"] ||
        "";


    return String(
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

}


/* ==========================================================
   CHECK LDIMS ACCESS
========================================================== */

function hasLDIMSAccess(
    user,
    accessName
) {

    const accessValues =
        getLDIMSAccessValues(
            user
        );


    return accessValues.includes(
        String(
            accessName || ""
        )
            .trim()
            .toLowerCase()
    );

}


/* ==========================================================
   GET LDD MONITORING ROLE
========================================================== */

function getLDDMonitoringRole(
    user
) {

    if (!user) {
        return "";
    }


    return String(
        user.lddMonitoringRole ||
        user.LDDMonitoringRole ||
        user["LDD Monitoring Role"] ||
        ""
    )
        .trim();

}


/* ==========================================================
   NORMALIZE LDD MONITORING ROLE
========================================================== */

function normalizeLDDMonitoringRole(
    role
) {

    const value =
        String(
            role || ""
        )
            .trim()
            .toLowerCase();


    const roles = {

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
        roles[value] ||
        ""
    );

}


/* ==========================================================
   DETERMINE DASHBOARD BY LDIMS ACCESS
========================================================== */

function getDashboardByAccess(
    user
) {

    if (!user) {

        return "dashboard.html";

    }


    console.log(
        "LOGIN USER:",
        user
    );


    const accessValues =
        getLDIMSAccessValues(
            user
        );


    console.log(
        "LDIMS ACCESS:",
        accessValues
    );


    /* ======================================================
       LDD MONITORING
       Highest functional priority for landing page.
    ====================================================== */

    if (
        accessValues.includes(
            "ldd monitoring"
        )
    ) {

        const lddRole =
            normalizeLDDMonitoringRole(
                getLDDMonitoringRole(
                    user
                )
            );


        console.log(
            "LDD MONITORING ROLE:",
            lddRole
        );


        return "ldd/dashboard.html";

    }


    /* ======================================================
       SUPERVISOR
    ====================================================== */

    if (
        accessValues.includes(
            "supervisor"
        )
    ) {

        return "supervisor/dashboard.html";

    }


    /* ======================================================
       ADMINISTRATOR
    ====================================================== */

    if (
        accessValues.includes(
            "administrator"
        )
    ) {

        return "dashboard.html";

    }


    /* ======================================================
       EMPLOYEE
    ====================================================== */

    if (
        accessValues.includes(
            "employee"
        )
    ) {

        return "employee/dashboard.html";

    }


    /* ======================================================
       FALLBACK
    ====================================================== */

    console.warn(
        "No recognized LDIMS Access found.",
        user
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


            /* ------------------------------------------------
               VALIDATE EMPLOYEE ID
            ------------------------------------------------ */

            if (!employeeID) {

                showAlert(
                    "Please enter your Employee ID."
                );

                return;

            }


            /* ------------------------------------------------
               VALIDATE PASSWORD
            ------------------------------------------------ */

            if (!password) {

                showAlert(
                    "Please enter your password."
                );

                return;

            }


            /* ------------------------------------------------
               LOADING STATE
            ------------------------------------------------ */

            if (loginButton) {

                loginButton.disabled =
                    true;

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

                /* --------------------------------------------
                   API LOGIN
                -------------------------------------------- */

                const result =
                    await API.login(
                        employeeID,
                        password
                    );


                console.log(
                    "LOGIN RESPONSE:",
                    result
                );


                /* --------------------------------------------
                   SUCCESS
                -------------------------------------------- */

                if (
                    result &&
                    result.success
                ) {

                    /*
                       Save complete authenticated
                       user/session response first.
                    */

                    Session.save(
                        result
                    );


                    const user =
                        result.user ||
                        result;


                    console.log(
                        "LOGGED-IN USER:",
                        user
                    );


                    /*
                       Determine destination strictly
                       from LDIMS Access.
                    */

                    const destination =
                        getDashboardByAccess(
                            user
                        );


                    console.log(
                        "LOGIN DESTINATION:",
                        destination
                    );


                    window.location.href =
                        destination;


                    return;

                }


                /* --------------------------------------------
                   LOGIN FAILED
                -------------------------------------------- */

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
   TOGGLE PASSWORD VISIBILITY
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
                this.querySelector(
                    "i"
                );


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