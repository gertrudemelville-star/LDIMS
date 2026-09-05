/* ==========================================================
   LDIMS - Dashboard
   Module: Main Employee Dashboard
========================================================== */

"use strict";


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        Session.requireLogin();

        const user = Session.get();

        if (!user) {

            Session.logout();

            return;

        }


        loadUserInformation(user);

        await loadDashboardData();

        initializeLogout();

    }
);


/* ==========================================================
   LOAD USER INFORMATION
========================================================== */

function loadUserInformation(user) {

    setValue(
        "employeeName",
        user.fullname ||
        user.fullName ||
        "Employee"
    );


    setValue(
        "headerRole",
        user.role ||
        "Employee"
    );

}


/* ==========================================================
   LOAD DASHBOARD DATA
========================================================== */

async function loadDashboardData() {

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

        console.warn(
            "Dashboard: Employee ID not available."
        );

        return;

    }


    await loadTrainingData(
        employeeID
    );


    await loadLNAData(
        employeeID
    );


    /*
     * Pending Assessment will remain 0
     * until the Assessment backend is connected.
     */

    setValue(
        "pendingAssessment",
        0
    );

}


/* ==========================================================
   LOAD TRAINING DATA
========================================================== */

async function loadTrainingData(
    employeeID
) {

    try {

        const response =
            await API.post({

                action:
                    "getTrainingRecords",

                employeeID:
                    employeeID

            });


        console.log(
            "Dashboard Training Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            return;

        }


        setValue(
            "totalTrainings",
            response.totalTrainings ??
            response.totalRecords ??
            0
        );


        setValue(
            "learningHours",
            response.totalHours ??
            0
        );


        setValue(
            "totalCertificates",
            response.totalCertificates ??
            0
        );


        loadRecentActivities(
            response.records || []
        );


    } catch (error) {

        console.error(
            "Dashboard Training Error:",
            error
        );

    }

}


/* ==========================================================
   LOAD LNA DATA
========================================================== */

async function loadLNAData(
    employeeID
) {

    try {

        const response =
            await API.post({

                action:
                    "getLNAByEmployeeID",

                employeeID:
                    employeeID

            });


        console.log(
            "Dashboard LNA Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            return;

        }


        /*
         * LNA is already displayed on the
         * dedicated LNA page.
         *
         * We only use the result here to
         * create a recent activity when
         * appropriate.
         */

        if (
            response.submitted === true &&
            response.record
        ) {

            addLNAActivity(
                response.record
            );

        }

    } catch (error) {

        console.error(
            "Dashboard LNA Error:",
            error
        );

    }

}


/* ==========================================================
   RECENT ACTIVITIES
========================================================== */

function loadRecentActivities(
    records
) {

    const container =
        document.getElementById(
            "recentActivities"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {

        container.textContent =
            "No activities found.";

        return;

    }


    container.innerHTML = "";


    const recentRecords =
        records
            .slice()
            .sort(
                function (a, b) {

                    return (
                        new Date(
                            b.endDate ||
                            b.startDate ||
                            0
                        ) -
                        new Date(
                            a.endDate ||
                            a.startDate ||
                            0
                        )
                    );

                }
            )
            .slice(0, 5);


    recentRecords.forEach(
        function (record) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "mb-3";


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                record.trainingTitle ||
                "Training Activity";


            const date =
                document.createElement(
                    "div"
                );


            date.className =
                "text-muted small";


            date.textContent =
                formatActivityDate(
                    record.endDate ||
                    record.startDate
                );


            item.appendChild(
                title
            );


            item.appendChild(
                date
            );


            container.appendChild(
                item
            );

        }
    );

}


/* ==========================================================
   ADD LNA ACTIVITY
========================================================== */

function addLNAActivity(
    record
) {

    const container =
        document.getElementById(
            "recentActivities"
        );


    if (!container) {
        return;
    }


    /*
     * Do not replace existing training
     * activities. Add LNA submission
     * only when appropriate.
     */

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "mb-3";


    const title =
        document.createElement(
            "strong"
        );


    title.textContent =
        "Learning Needs Assessment";


    const date =
        document.createElement(
            "div"
        );


    date.className =
        "text-muted small";


    date.textContent =
        record.timestamp
            ? "Submitted: " +
              formatActivityDate(
                  record.timestamp
              )
            : "Submitted";


    item.appendChild(
        title
    );


    item.appendChild(
        date
    );


    /*
     * If the container still says
     * "No activities found", remove it.
     */

    if (
        container.textContent.trim() ===
        "No activities found."
    ) {

        container.innerHTML = "";

    }


    container.appendChild(
        item
    );

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatActivityDate(
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
   HELPER
========================================================== */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.textContent =
        value === null ||
        value === undefined ||
        String(value).trim() === ""
            ? "-"
            : String(value);

}


/* ==========================================================
   LOGOUT
========================================================== */

function initializeLogout() {

    document
        .getElementById(
            "logoutLink"
        )
        ?.addEventListener(
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


                localStorage.clear();

                window.location.href =
                    "../index.html";

            }
        );

}