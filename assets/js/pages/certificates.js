/* ==========================================================
   LDIMS - Certificates
   Module: Employee Certificates
========================================================== */

"use strict";


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            Session.requireLogin();

            const user =
                Session.get();

            if (!user) {

                Session.logout();

                return;

            }


            loadEmployeeInformation(user);

            await loadCertificates();

            initializeLogout();


        } catch (error) {

            console.error(
                "Certificates initialization failed:",
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
        "headerRole",
        user.role ||
        "Employee"
    );

}


/* ==========================================================
   LOAD CERTIFICATES
========================================================== */

async function loadCertificates() {

    const container =
        document.getElementById(
            "certificatesContainer"
        );


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

        if (container) {

            container.innerHTML =
                '<p class="text-muted">Employee ID not found.</p>';

        }

        return;

    }


    try {

        const response =
            await API.post({

                action:
                    "getTrainingRecords",

                employeeID:
                    employeeID

            });


        console.log(
            "Certificates Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            if (container) {

                container.innerHTML =
                    '<p class="text-muted">Unable to load certificates.</p>';

            }

            return;

        }


        renderCertificates(
            response.records || []
        );


    } catch (error) {

        console.error(
            "Certificates loading error:",
            error
        );


        if (container) {

            container.innerHTML =
                '<p class="text-muted">Unable to load certificates.</p>';

        }

    }

}


/* ==========================================================
   RENDER CERTIFICATES
========================================================== */

function renderCertificates(
    records
) {

    const container =
        document.getElementById(
            "certificatesContainer"
        );


    if (!container) {
        return;
    }


    const certificates =
        records.filter(
            function (record) {

                return (
                    record.certificate &&
                    String(
                        record.certificate
                    ).trim() !== ""
                );

            }
        );


    if (certificates.length === 0) {

        container.innerHTML =
            '<p class="text-muted">No certificates found.</p>';

        return;

    }


    container.innerHTML = "";


    certificates
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
        .forEach(
            function (record) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "border rounded p-3 mb-3";


                const title =
                    document.createElement(
                        "h5"
                    );


                title.textContent =
                    record.trainingTitle ||
                    "Training Certificate";


                const date =
                    document.createElement(
                        "p"
                    );


                date.className =
                    "text-muted mb-1";


                date.textContent =
                    formatDate(
                        record.startDate
                    ) +
                    " – " +
                    formatDate(
                        record.endDate
                    );


                const hours =
                    document.createElement(
                        "p"
                    );


                hours.className =
                    "mb-3";


                hours.textContent =
                    "Learning Hours: " +
                    (
                        record.totalHours ||
                        0
                    );


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

                link.className =
                    "btn btn-sm btn-primary";

                link.textContent =
                    "View Certificate";


                card.appendChild(
                    title
                );

                card.appendChild(
                    date
                );

                card.appendChild(
                    hours
                );

                card.appendChild(
                    link
                );


                container.appendChild(
                    card
                );

            }
        );

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
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.textContent =
        value ||
        "-";

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