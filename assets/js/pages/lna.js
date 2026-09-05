/* ==========================================================
   LDIMS - Learning Needs Assessment
   Module: Employee LNA
========================================================== */

"use strict";


/* ==========================================================
   Configuration
========================================================== */

const LNA_FORM_BASE_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSd5KZL2OxNRmk7OyUtNtJdiKQiKs0aBQA4YhSgbI0ezI5IUTg/viewform";


const LNA_EMPLOYEE_ID_ENTRY =
    "entry.62958493";

const LNA_NAME_ENTRY =
    "entry.1981000554";

const LNA_POSITION_ENTRY =
    "entry.162142913";

const LNA_ASSIGNMENT_ENTRY =
    "entry.1968621349";


/* ==========================================================
   GET LOGGED-IN USER
========================================================== */

function getLoggedInEmployee() {

    try {

        let user = null;


        /* --------------------------------------------------
           LDIMS Session
        -------------------------------------------------- */

        if (
            typeof Session !== "undefined" &&
            typeof Session.get === "function"
        ) {

            user = Session.get();

            if (
                user &&
                typeof user === "object"
            ) {

                return user;

            }

        }


        /* --------------------------------------------------
           Session.getUser()
        -------------------------------------------------- */

        if (
            typeof Session !== "undefined" &&
            typeof Session.getUser === "function"
        ) {

            user = Session.getUser();

            if (
                user &&
                typeof user === "object"
            ) {

                return user;

            }

        }


        /* --------------------------------------------------
           Configured storage key
        -------------------------------------------------- */

        let storageKey =
            "ldimsSession";


        if (
            typeof CONFIG !== "undefined" &&
            CONFIG.SESSION &&
            CONFIG.SESSION.STORAGE_KEY
        ) {

            storageKey =
                CONFIG.SESSION.STORAGE_KEY;

        }


        const configuredSession =
            localStorage.getItem(
                storageKey
            );


        if (configuredSession) {

            try {

                user =
                    JSON.parse(
                        configuredSession
                    );


                if (
                    user &&
                    typeof user === "object"
                ) {

                    return user;

                }

            } catch (error) {

                console.warn(
                    "Unable to parse configured session:",
                    error
                );

            }

        }


        /* --------------------------------------------------
           Legacy session
        -------------------------------------------------- */

        const storedSession =
            localStorage.getItem(
                "ldimsSession"
            );


        if (storedSession) {

            try {

                user =
                    JSON.parse(
                        storedSession
                    );


                if (
                    user &&
                    typeof user === "object"
                ) {

                    return user;

                }

            } catch (error) {

                console.warn(
                    "Unable to parse ldimsSession:",
                    error
                );

            }

        }


        /* --------------------------------------------------
           Legacy user
        -------------------------------------------------- */

        const storedUser =
            localStorage.getItem(
                "ldimsUser"
            );


        if (storedUser) {

            try {

                user =
                    JSON.parse(
                        storedUser
                    );


                if (
                    user &&
                    typeof user === "object"
                ) {

                    return user;

                }

            } catch (error) {

                console.warn(
                    "Unable to parse ldimsUser:",
                    error
                );

            }

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
   GET EMPLOYEE ID
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
   DISPLAY USER ROLE
========================================================== */

function displayUserRole() {

    const user =
        getLoggedInEmployee();


    const roleElement =
        document.getElementById(
            "userRole"
        );


    if (!roleElement) {

        return;

    }


    roleElement.textContent =
        user &&
        (
            user.role ||
            user.Role
        )
            ? (
                user.role ||
                user.Role
            )
            : "Employee";

}


/* ==========================================================
   DISPLAY EMPLOYEE ID
========================================================== */

function displayEmployeeID() {

    const employeeID =
        getEmployeeIDFromSession();


    const employeeIDElement =
        document.getElementById(
            "employeeID"
        );


    if (!employeeIDElement) {

        return;

    }


    employeeIDElement.textContent =
        employeeID ||
        "Session not found";

}


/* ==========================================================
   LOAD LNA STATUS
========================================================== */

async function loadLNAStatus() {

    const employeeID =
        getEmployeeIDFromSession();


    if (!employeeID) {

        updateLNAStatus(
            "error",
            "Employee session not found."
        );

        console.error(
            "LNA: No Employee ID found in session."
        );

        return;

    }


    try {

        const response =
            await API.post({

                action:
                    "getLNAByEmployeeID",

                employeeID:
                    employeeID

            });


        console.log(
            "LNA Status Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            updateLNAStatus(
                "error",
                response?.message ||
                "Unable to retrieve LNA status."
            );

            return;

        }


        if (
            response.submitted === true &&
            response.record
        ) {

            const record =
                response.record;


            const status =
                String(
                    record.status ||
                    "For Review"
                ).trim();


            updateLNAStatus(
                status,
                record.timestamp || "",
                record
            );


            return;

        }


        updateLNAStatus(
            "Not Yet Submitted",
            ""
        );


    } catch (error) {

        console.error(
            "Unable to load LNA status:",
            error
        );


        updateLNAStatus(
            "error",
            "Unable to retrieve LNA status."
        );

    }

}


/* ==========================================================
   UPDATE LNA STATUS UI
========================================================== */

function updateLNAStatus(
    status,
    value,
    record
) {

    const statusElement =
        document.getElementById(
            "lnaStatus"
        );


    const dateElement =
        document.getElementById(
            "lnaSubmittedDate"
        );


    if (!statusElement) {

        return;

    }


    const normalizedStatus =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    /* ------------------------------------------------------
       Reset workflow UI
    ------------------------------------------------------ */

    hideWorkflowCard();

    hideCompletionReason();

    hideRevisionReason();


    /* ======================================================
       FOR COMPLETION
    ====================================================== */

    if (
        normalizedStatus ===
        "for completion"
    ) {

        statusElement.textContent =
            "For Completion";

        statusElement.className =
            "badge bg-warning text-dark";


        if (dateElement) {

            dateElement.textContent =
                value
                    ? "Submitted: " +
                      formatLNADate(value)
                    : "LNA requires completion.";

        }


        showCompletionWorkflow(
            record
        );


        return;

    }


    /* ======================================================
       FOR REVISION
    ====================================================== */

    if (
        normalizedStatus ===
        "for revision"
    ) {

        statusElement.textContent =
            "For Revision";

        statusElement.className =
            "badge bg-danger";


        if (dateElement) {

            dateElement.textContent =
                value
                    ? "Submitted: " +
                      formatLNADate(value)
                    : "LNA returned for revision.";

        }


        showRevisionWorkflow(
            record
        );


        return;

    }


    /* ======================================================
       FOR REVIEW
    ====================================================== */

    if (
        normalizedStatus ===
        "for review"
    ) {

        statusElement.textContent =
            "For Review";

        statusElement.className =
            "badge bg-primary";


        if (dateElement) {

            dateElement.textContent =
                value
                    ? "Submitted: " +
                      formatLNADate(value)
                    : "Submitted and awaiting supervisor review.";

        }


        showForReviewWorkflow();


        return;

    }


    /* ======================================================
       VALIDATED
    ====================================================== */

    if (
        normalizedStatus ===
        "validated"
    ) {

        statusElement.textContent =
            "Validated";

        statusElement.className =
            "badge bg-success";


        if (dateElement) {

            dateElement.textContent =
                value
                    ? "Validated • Submitted: " +
                      formatLNADate(value)
                    : "LNA validated by supervisor.";

        }


        showValidatedWorkflow();


        return;

    }


    /* ======================================================
       LEGACY SUBMITTED
    ====================================================== */

    if (
        normalizedStatus ===
        "submitted"
    ) {

        statusElement.textContent =
            "Submitted";

        statusElement.className =
            "badge bg-success";


        if (dateElement) {

            dateElement.textContent =
                value
                    ? "Submitted: " +
                      formatLNADate(value)
                    : "Submitted";

        }


        showForReviewWorkflow();


        return;

    }


    /* ======================================================
       NOT YET SUBMITTED
    ====================================================== */

    if (
        normalizedStatus ===
            "not yet submitted" ||
        normalizedStatus ===
            "not-submitted"
    ) {

        statusElement.textContent =
            "Not Yet Submitted";

        statusElement.className =
            "badge bg-warning text-dark";


        if (dateElement) {

            dateElement.textContent =
                "Please complete your Learning Needs Assessment.";

        }


        showNewLNAWorkflow();


        return;

    }


    /* ======================================================
       ERROR
    ====================================================== */

    statusElement.textContent =
        "Unable to Load";

    statusElement.className =
        "badge bg-secondary";


    if (dateElement) {

        dateElement.textContent =
            value ||
            "Please refresh the page and try again.";

    }

}


/* ==========================================================
   SHOW WORKFLOW CARD
========================================================== */

function showWorkflowCard(
    title,
    message,
    icon
) {

    const card =
        document.getElementById(
            "lnaWorkflowCard"
        );


    const titleElement =
        document.getElementById(
            "lnaWorkflowTitle"
        );


    const messageElement =
        document.getElementById(
            "lnaWorkflowMessage"
        );


    const iconElement =
        document.getElementById(
            "lnaWorkflowIcon"
        );


    if (!card) {

        return;

    }


    card.classList.remove(
        "d-none"
    );


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    if (iconElement) {

        iconElement.innerHTML =
            `<i class="bi ${icon || "bi-info-circle"} fs-4"></i>`;

    }

}


/* ==========================================================
   HIDE WORKFLOW CARD
========================================================== */

function hideWorkflowCard() {

    const card =
        document.getElementById(
            "lnaWorkflowCard"
        );


    if (card) {

        card.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   SHOW COMPLETION WORKFLOW
========================================================== */

function showCompletionWorkflow(
    record
) {

    showWorkflowCard(

        "LNA Requires Completion",

        "Your Learning Needs Assessment is incomplete. Please provide a reason for the incomplete LNA and continue the required encoding.",

        "bi-exclamation-circle"

    );


    const section =
        document.getElementById(
            "completionReasonSection"
        );


    if (!section) {

        return;

    }


    section.classList.remove(
        "d-none"
    );


    const reasonField =
        document.getElementById(
            "completionReason"
        );


    if (
        reasonField &&
        record &&
        record.completionReason
    ) {

        reasonField.value =
            record.completionReason;

    }


    /*
     * Save button is intentionally not connected yet.
     * Backend save action will be added in the next step.
     */

}


/* ==========================================================
   HIDE COMPLETION REASON
========================================================== */

function hideCompletionReason() {

    const section =
        document.getElementById(
            "completionReasonSection"
        );


    if (section) {

        section.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   SHOW REVISION WORKFLOW
========================================================== */

function showRevisionWorkflow(
    record
) {

    showWorkflowCard(

        "LNA Returned for Revision",

        "Your supervisor has returned your Learning Needs Assessment for revision. Please review the reason below and revise the required information.",

        "bi-arrow-repeat"

    );


    const section =
        document.getElementById(
            "revisionReasonSection"
        );


    if (!section) {

        return;

    }


    section.classList.remove(
        "d-none"
    );


    const reasonElement =
        document.getElementById(
            "revisionReason"
        );


    if (!reasonElement) {

        return;

    }


    const reason =
        record &&
        record.revisionReason
            ? String(
                record.revisionReason
            ).trim()
            : "";


    reasonElement.textContent =
        reason ||
        "No revision reason was provided by the supervisor.";

}


/* ==========================================================
   HIDE REVISION REASON
========================================================== */

function hideRevisionReason() {

    const section =
        document.getElementById(
            "revisionReasonSection"
        );


    if (section) {

        section.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   SHOW FOR REVIEW
========================================================== */

function showForReviewWorkflow() {

    showWorkflowCard(

        "LNA Submitted for Supervisor Review",

        "Your Learning Needs Assessment has been submitted and is currently awaiting review by your immediate supervisor.",

        "bi-hourglass-split"

    );


    disableLNAAction();

}


/* ==========================================================
   SHOW VALIDATED
========================================================== */

function showValidatedWorkflow() {

    showWorkflowCard(

        "LNA Validated",

        "Your Learning Needs Assessment has been reviewed and validated by your immediate supervisor.",

        "bi-check-circle"

    );


    disableLNAAction();

}


/* ==========================================================
   SHOW NEW LNA
========================================================== */

function showNewLNAWorkflow() {

    enableLNAAction(

        "Complete Your Learning Needs Assessment",

        "Click the button below to open the official Learning Needs Assessment form. Your Employee ID will automatically be included in the form.",

        "Start Learning Needs Assessment"

    );

}


/* ==========================================================
   ENABLE LNA ACTION
========================================================== */

function enableLNAAction(
    title,
    description,
    buttonText
) {

    const actionCard =
        document.getElementById(
            "lnaActionCard"
        );


    const titleElement =
        document.getElementById(
            "lnaActionTitle"
        );


    const descriptionElement =
        document.getElementById(
            "lnaActionDescription"
        );


    const button =
        document.getElementById(
            "startLnaButton"
        );


    if (actionCard) {

        actionCard.classList.remove(
            "d-none"
        );

    }


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            description;

    }


    if (button) {

        button.disabled =
            false;

        button.innerHTML =
            `<i class="bi bi-box-arrow-up-right me-2"></i>${buttonText}`;

    }

}


/* ==========================================================
   DISABLE LNA ACTION
========================================================== */

function disableLNAAction() {

    const actionCard =
        document.getElementById(
            "lnaActionCard"
        );


    const titleElement =
        document.getElementById(
            "lnaActionTitle"
        );


    const descriptionElement =
        document.getElementById(
            "lnaActionDescription"
        );


    const button =
        document.getElementById(
            "startLnaButton"
        );


    if (actionCard) {

        actionCard.classList.remove(
            "d-none"
        );

    }


    if (titleElement) {

        titleElement.textContent =
            "Learning Needs Assessment";

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            "No new submission is required at this stage.";

    }


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            `<i class="bi bi-lock me-2"></i>Action Not Available`;

    }

}


/* ==========================================================
   OPEN LNA GOOGLE FORM
========================================================== */

function openLNAForm() {

    const user =
        getLoggedInEmployee();


    if (!user) {

        alert(
            "Employee session not found. Please log in again."
        );

        return;

    }


    const employeeID =
        String(
            user.employeeID ||
            user.EmployeeID ||
            user.employeeId ||
            user.id ||
            ""
        ).trim();


    const name =
        String(
            user.fullname ||
            user.fullName ||
            user.Fullname ||
            user.FullName ||
            ""
        ).trim();


    const position =
        String(
            user.position ||
            user.Position ||
            ""
        ).trim();


    const assignment =
        String(
            user.assignment ||
            user.placeOfAssignment ||
            user.PlaceOfAssignment ||
            user.division ||
            user.Division ||
            ""
        ).trim();


    if (!employeeID) {

        alert(
            "Employee ID not found. Please log in again."
        );

        return;

    }


    const formURL =
        LNA_FORM_BASE_URL +
        "?usp=pp_url&" +

        LNA_EMPLOYEE_ID_ENTRY +
        "=" +
        encodeURIComponent(
            employeeID
        ) +

        "&" +
        LNA_NAME_ENTRY +
        "=" +
        encodeURIComponent(
            name
        ) +

        "&" +
        LNA_POSITION_ENTRY +
        "=" +
        encodeURIComponent(
            position
        ) +

        "&" +
        LNA_ASSIGNMENT_ENTRY +
        "=" +
        encodeURIComponent(
            assignment
        );


    console.log(
        "Opening LNA Form:",
        formURL
    );


    window.open(
        formURL,
        "_blank"
    );

}


/* ==========================================================
   FORMAT LNA DATE
========================================================== */

function formatLNADate(
    value
) {

    try {

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleString(
            "en-PH",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return String(value);

    }

}


/* ==========================================================
   LOGOUT
========================================================== */

function handleLogout(
    event
) {

    event.preventDefault();


    try {

        if (
            typeof Session !== "undefined" &&
            typeof Session.logout === "function"
        ) {

            Session.logout();

            return;

        }


        const storageKey =
            typeof CONFIG !== "undefined" &&
            CONFIG.SESSION &&
            CONFIG.SESSION.STORAGE_KEY
                ? CONFIG.SESSION.STORAGE_KEY
                : "ldimsSession";


        localStorage.removeItem(
            storageKey
        );


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
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayUserRole();

        displayEmployeeID();

        loadLNAStatus();


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