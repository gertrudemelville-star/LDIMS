/* ==========================================================
   LDIMS - LDD Dashboard
   Module: Learning & Development Division
========================================================== */

"use strict";


/* ==========================================================
   Load LDD Dashboard
========================================================== */

async function loadLDDDashboard() {

    try {

        const employeesResponse =
            await API.getEmployees();

        console.log(
            "LDD Employees:",
            employeesResponse
        );


        if (
            employeesResponse &&
            employeesResponse.success === true
        ) {

            const employees =
                employeesResponse.data ||
                employeesResponse.employees ||
                [];

            document.getElementById(
                "totalEmployees"
            ).textContent =
                employees.length;

        }


        const trainingResponse =
            await API.getTrainingRecords();

        console.log(
            "LDD Training Records:",
            trainingResponse
        );


        if (
            trainingResponse &&
            trainingResponse.success === true
        ) {

            const records =
                trainingResponse.data ||
                trainingResponse.records ||
                [];

            document.getElementById(
                "totalTrainings"
            ).textContent =
                records.length;


            let totalHours = 0;

            records.forEach(
                record => {

                    const hours =
                        parseFloat(
                            record.totalHours ||
                            record.TotalHours ||
                            record["TOTAL HOURS"] ||
                            0
                        );

                    if (!isNaN(hours)) {

                        totalHours += hours;

                    }

                }
            );


            document.getElementById(
                "totalLearningHours"
            ).textContent =
                totalHours;

        }


        /*
         * LNA count
         *
         * We will connect this to the
         * LNA monitoring API once the
         * LDD monitoring module is created.
         */

        document.getElementById(
            "lnaCompleted"
        ).textContent = "—";


    } catch (error) {

        console.error(
            "Unable to load LDD dashboard:",
            error
        );

    }

}


/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        try {

            if (
                typeof Session !== "undefined"
            ) {

                Session.requireLogin();

            }


            const user =
                Session.get();


            if (!user) {

                return;

            }


            const headerRole =
                document.getElementById(
                    "headerRole"
                );


            if (headerRole) {

                headerRole.textContent =
                    user.role ||
                    "LDD Personnel";

            }


            loadLDDDashboard();


        } catch (error) {

            console.error(
                "LDD Dashboard initialization failed:",
                error
            );

        }

    }
);


/* ==========================================================
   Logout
========================================================== */

document
    .getElementById("logoutLink")
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