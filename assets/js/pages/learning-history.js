/* ==========================================================
   LDIMS - Learning Passport
   Module: Employee Learning History
========================================================== */

"use strict";


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            /* ------------------------------------------------
               Check Login Session
            ------------------------------------------------ */

            Session.requireLogin();


            const user =
                Session.get();


            if (!user) {

                Session.logout();

                return;

            }


            /* ------------------------------------------------
               Display Employee Information
            ------------------------------------------------ */

            loadEmployeeInformation(user);


            /* ------------------------------------------------
               Load Learning Data
            ------------------------------------------------ */

            await loadLearningPassport();


            /* ------------------------------------------------
               Logout
            ------------------------------------------------ */

            initializeLogout();


        } catch (error) {

            console.error(
                "Learning Passport initialization failed:",
                error
            );

        }

    }
);


/* ==========================================================
   LOAD EMPLOYEE INFORMATION
========================================================== */

function loadEmployeeInformation(user) {

    setValue(
        "employeeName",
        user.fullname ||
        user.fullName ||
        "-"
    );


    setValue(
        "employeeID",
        user.employeeID ||
        user.EmployeeID ||
        user.employeeId ||
        "-"
    );


    setValue(
        "employeePosition",
        user.position ||
        "-"
    );


    setValue(
        "headerRole",
        user.role ||
        "Employee"
    );

}


/* ==========================================================
   LOAD LEARNING PASSPORT
========================================================== */

async function loadLearningPassport() {

    const user =
        Session.get();


    if (!user) {
        return;
    }


    const employeeID =
        String(
            user.employeeID ||
            user.EmployeeID ||
            user.employeeId ||
            ""
        ).trim();


    if (!employeeID) {

        console.error(
            "Employee ID not found in session."
        );

        return;

    }


    /* --------------------------------------------------------
       Load Training Records
    -------------------------------------------------------- */

    await loadTrainingHistory(
        employeeID
    );


    /* --------------------------------------------------------
       Load LNA Status
    -------------------------------------------------------- */

    await loadLNAStatus(
        employeeID
    );

}


/* ==========================================================
   LOAD TRAINING HISTORY
========================================================== */

async function loadTrainingHistory(
    employeeID
) {

    const container =
        document.getElementById(
            "learningHistory"
        );


    try {

        const response =
            await API.post({

                action:
                    "getTrainingRecords",

                employeeID:
                    employeeID

            });


        console.log(
            "Learning Passport Training Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            console.error(
                "Training records could not be loaded:",
                response
            );


            if (container) {

                container.innerHTML =
                    '<p class="text-muted">Unable to load learning history.</p>';

            }

            return;

        }


        /* ----------------------------------------------------
           Summary Cards
        ---------------------------------------------------- */

        setValue(
            "totalTrainings",
            response.totalTrainings ?? 0
        );


        setValue(
            "learningHours",
            response.totalHours ?? 0
        );


        setValue(
            "totalCertificates",
            response.totalCertificates ?? 0
        );


        /* ----------------------------------------------------
           Learning History
        ---------------------------------------------------- */

        renderLearningHistory(
            response.records || []
        );


    } catch (error) {

        console.error(
            "Learning Passport Training Error:",
            error
        );


        if (container) {

            container.innerHTML =
                '<p class="text-muted">Unable to load learning history.</p>';

        }

    }

}


/* ==========================================================
   RENDER LEARNING HISTORY
========================================================== */

function renderLearningHistory(
    records
) {

    const container =
        document.getElementById(
            "learningHistory"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {

        container.innerHTML =
            '<p class="text-muted">No learning records found.</p>';

        return;

    }


    container.innerHTML = "";


    records
        .slice()
        .sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.endDate ||
                        a.startDate ||
                        0
                    );

                const dateB =
                    new Date(
                        b.endDate ||
                        b.startDate ||
                        0
                    );


                return dateB - dateA;

            }
        )
        .forEach(
            function (record) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "border-bottom pb-3 mb-3";


                /* --------------------------------------------
                   Training Title
                -------------------------------------------- */

                const title =
                    document.createElement(
                        "h6"
                    );


                title.textContent =
                    record.trainingTitle ||
                    "Training";


                /* --------------------------------------------
                   Training Dates
                -------------------------------------------- */

                const date =
                    document.createElement(
                        "div"
                    );


                date.className =
                    "text-muted small";


                date.textContent =
                    formatDate(
                        record.startDate
                    ) +
                    " – " +
                    formatDate(
                        record.endDate
                    );


                /* --------------------------------------------
                   Learning Hours
                -------------------------------------------- */

                const hours =
                    document.createElement(
                        "div"
                    );


                hours.className =
                    "small mt-1";


                hours.textContent =
                    "Learning Hours: " +
                    (
                        record.totalHours ||
                        0
                    );


                /* --------------------------------------------
                   Certificate
                -------------------------------------------- */

                const certificate =
                    document.createElement(
                        "div"
                    );


                certificate.className =
                    "small mt-1";


                if (record.certificate) {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        record.certificate;

                    link.target =
                        "_blank";

                    link.rel =
                        "noopener noreferrer";

                    link.textContent =
                        "View Certificate";


                    certificate.appendChild(
                        link
                    );

                }


                /* --------------------------------------------
                   Assemble Record
                -------------------------------------------- */

                item.appendChild(
                    title
                );

                item.appendChild(
                    date
                );

                item.appendChild(
                    hours
                );

                item.appendChild(
                    certificate
                );


                container.appendChild(
                    item
                );

            }
        );

}


/* ==========================================================
   LOAD LNA STATUS
========================================================== */

async function loadLNAStatus(
    employeeID
) {

    const statusElement =
        document.getElementById(
            "lnaStatus"
        );


    const dateElement =
        document.getElementById(
            "lnaDate"
        );


    try {

        const response =
            await API.post({

                action:
                    "getLNAByEmployeeID",

                employeeID:
                    employeeID

            });


        console.log(
            "Learning Passport LNA Response:",
            response
        );


        /* ----------------------------------------------------
           LNA RECORD FOUND
        ---------------------------------------------------- */

        if (
            response &&
            response.success === true &&
            response.submitted === true &&
            response.record
        ) {

            const record =
                response.record;


            const status =
                String(
                    record.status ||
                    "Submitted"
                )
                .trim()
                .toLowerCase();


            /* --------------------------------------------
               FOR REVISION
            -------------------------------------------- */

            if (
                status === "for revision" ||
                status === "revision" ||
                status === "returned" ||
                status === "for completion"
            ) {

                if (statusElement) {

                    statusElement.textContent =
                        "For Revision";

                    statusElement.className =
                        "badge bg-danger";

                }


                if (dateElement) {

                    dateElement.textContent =
                        record.timestamp
                            ? "Submitted: " +
                              formatDate(
                                  record.timestamp
                              )
                            : "LNA returned for revision.";

                }


                return;

            }


            /* --------------------------------------------
               VALIDATED
            -------------------------------------------- */

            if (
                status === "validated" ||
                status === "approved"
            ) {

                if (statusElement) {

                    statusElement.textContent =
                        "Validated";

                    statusElement.className =
                        "badge bg-success";

                }


                if (dateElement) {

                    dateElement.textContent =
                        record.timestamp
                            ? "Submitted: " +
                              formatDate(
                                  record.timestamp
                              )
                            : "";

                }


                return;

            }


            /* --------------------------------------------
               FOR REVIEW
            -------------------------------------------- */

            if (
                status === "for review" ||
                status === "submitted"
            ) {

                if (statusElement) {

                    statusElement.textContent =
                        "Submitted";

                    statusElement.className =
                        "badge bg-success";

                }


                if (dateElement) {

                    dateElement.textContent =
                        record.timestamp
                            ? "Submitted: " +
                              formatDate(
                                  record.timestamp
                              )
                            : "";

                }


                return;

            }


            /* --------------------------------------------
               OTHER / UNKNOWN STATUS
            -------------------------------------------- */

            if (statusElement) {

                statusElement.textContent =
                    record.status ||
                    "Submitted";

                statusElement.className =
                    "badge bg-secondary";

            }


            if (dateElement) {

                dateElement.textContent =
                    record.timestamp
                        ? "Submitted: " +
                          formatDate(
                              record.timestamp
                          )
                        : "";

            }


            return;

        }


        /* ----------------------------------------------------
           NOT YET SUBMITTED
        ---------------------------------------------------- */

        if (statusElement) {

            statusElement.textContent =
                "Not Yet Submitted";

            statusElement.className =
                "badge bg-warning text-dark";

        }


        if (dateElement) {

            dateElement.textContent =
                "Please complete your Learning Needs Assessment.";

        }


    } catch (error) {

        console.error(
            "Learning Passport LNA Error:",
            error
        );


        if (statusElement) {

            statusElement.textContent =
                "Unable to Load";

            statusElement.className =
                "badge bg-secondary";

        }


        if (dateElement) {

            dateElement.textContent =
                "Please refresh the page and try again.";

        }

    }

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* ==========================================================
   SET VALUE
========================================================== */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        element.textContent =
            "-";

        return;

    }


    element.textContent =
        String(value);

}


/* ==========================================================
   LOGOUT
========================================================== */

function initializeLogout() {

    const logoutLink =
        document.getElementById(
            "logoutLink"
        );


    if (!logoutLink) {
        return;
    }


    logoutLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


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

        }
    );

}