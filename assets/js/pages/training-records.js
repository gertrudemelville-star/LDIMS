/* ==========================================================
   LDIMS - Training Records
   Module: Employee Training History
========================================================== */

"use strict";


/* ==========================================================
   Configuration
========================================================== */

/*
 * Official Training Attendance Google Form
 */
const TRAINING_FORM_BASE_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeklDxryzBHKhB_MrifcDNaayqyVi5ivZ2Q3H-5HJuAsOg32w/viewform";


/*
 * Google Forms pre-fill parameter for EMPLOYEE ID
 */
const TRAINING_EMPLOYEE_ID_ENTRY =
    "entry.1311465607";


/* ==========================================================
   Elements
========================================================== */

const employeeIDElement =
    document.getElementById("employeeID");

const totalTrainingsElement =
    document.getElementById("totalTrainings");

const totalHoursElement =
    document.getElementById("totalHours");

const totalCertificatesElement =
    document.getElementById("totalCertificates");

const loadingState =
    document.getElementById("loadingState");

const emptyState =
    document.getElementById("emptyState");

const errorState =
    document.getElementById("errorState");

const recordsContainer =
    document.getElementById("recordsContainer");

const recordsTableBody =
    document.getElementById("recordsTableBody");

const addTrainingButton =
    document.getElementById("addTrainingButton");

const emptyAddTrainingButton =
    document.getElementById("emptyAddTrainingButton");

const refreshButton =
    document.getElementById("refreshButton");


/* ==========================================================
   Get Logged-in Employee
========================================================== */

function getLoggedInEmployee() {

    try {

        /* ----------------------------------------------
           LDIMS Session object
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
            "Unable to retrieve session:",
            error
        );

        return null;

    }

}


/* ==========================================================
   Extract Employee ID
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
   Open Training Form
========================================================== */

function openTrainingForm() {

    /*
     * Get the currently logged-in employee.
     */
    const employeeID =
        getEmployeeIDFromSession();


    /*
     * Make sure an employee is logged in.
     */
    if (!employeeID) {

        alert(
            "Employee session not found. Please log in again."
        );

        return;

    }


    /*
     * Build Google Form URL with
     * Employee ID pre-filled.
     */
    const formURL =
        TRAINING_FORM_BASE_URL +
        "?usp=pp_url&" +
        TRAINING_EMPLOYEE_ID_ENTRY +
        "=" +
        encodeURIComponent(employeeID);


    console.log(
        "Opening Training Attendance Form:",
        formURL
    );


    /*
     * Open the Google Form in a new tab.
     */
    window.open(
        formURL,
        "_blank"
    );

}


/* ==========================================================
   Loading State
========================================================== */

function showLoading() {

    if (loadingState) {

        loadingState.classList.remove("d-none");

    }


    if (emptyState) {

        emptyState.classList.add("d-none");

    }


    if (errorState) {

        errorState.classList.add("d-none");

    }


    if (recordsContainer) {

        recordsContainer.classList.add("d-none");

    }

}


/* ==========================================================
   Empty State
========================================================== */

function showEmpty() {

    if (loadingState) {

        loadingState.classList.add("d-none");

    }


    if (emptyState) {

        emptyState.classList.remove("d-none");

    }


    if (errorState) {

        errorState.classList.add("d-none");

    }


    if (recordsContainer) {

        recordsContainer.classList.add("d-none");

    }

}


/* ==========================================================
   Error State
========================================================== */

function showError(message) {

    if (loadingState) {

        loadingState.classList.add("d-none");

    }


    if (emptyState) {

        emptyState.classList.add("d-none");

    }


    if (recordsContainer) {

        recordsContainer.classList.add("d-none");

    }


    if (errorState) {

        errorState.classList.remove("d-none");

        errorState.textContent =
            message ||
            "Unable to load training records.";

    }

}


/* ==========================================================
   Format Date
========================================================== */

function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* ==========================================================
   Escape HTML
========================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   Render Records
========================================================== */

function renderRecords(records) {

    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {

        if (totalTrainingsElement) {

            totalTrainingsElement.textContent = "0";

        }


        if (totalHoursElement) {

            totalHoursElement.textContent = "0";

        }


        if (totalCertificatesElement) {

            totalCertificatesElement.textContent = "0";

        }


        showEmpty();

        return;

    }


    let totalHours = 0;

    let totalCertificates = 0;


    if (recordsTableBody) {

        recordsTableBody.innerHTML = "";

    }


    records.forEach(
        (record, index) => {

            const trainingTitle =
                record.trainingTitle ||
                record.TrainingTitle ||
                record["TRAINING TITLE"] ||
                "Untitled Training";


            const startDate =
                record.startDate ||
                record.StartDate ||
                record["START DATE"] ||
                "";


            const endDate =
                record.endDate ||
                record.EndDate ||
                record["END DATE"] ||
                "";


            const hoursValue =
                record.totalHours ||
                record.TotalHours ||
                record["TOTAL HOURS"] ||
                0;


            const certificate =
                record.certificate ||
                record.Certificate ||
                record["CERTIFICATE / PROOF OF TRAINING"] ||
                "";


            const hours =
                Number(
                    String(hoursValue)
                        .replace(/[^\d.]/g, "")
                ) || 0;


            totalHours += hours;


            if (certificate) {

                totalCertificates++;

            }


            let certificateHTML =
                '<span class="text-muted">None</span>';


            if (certificate) {

                certificateHTML = `
                    <span class="text-success">
                        <i class="bi bi-check-circle me-1"></i>
                        Available
                    </span>
                `;

            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(trainingTitle)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        formatDate(startDate)
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        formatDate(endDate)
                    )}
                </td>

                <td>
                    ${hours}
                </td>

                <td>
                    ${certificateHTML}
                </td>

            `;


            if (recordsTableBody) {

                recordsTableBody.appendChild(row);

            }

        }
    );


    if (totalTrainingsElement) {

        totalTrainingsElement.textContent =
            records.length;

    }


    if (totalHoursElement) {

        totalHoursElement.textContent =
            totalHours;

    }


    if (totalCertificatesElement) {

        totalCertificatesElement.textContent =
            totalCertificates;

    }


    if (loadingState) {

        loadingState.classList.add("d-none");

    }


    if (emptyState) {

        emptyState.classList.add("d-none");

    }


    if (errorState) {

        errorState.classList.add("d-none");

    }


    if (recordsContainer) {

        recordsContainer.classList.remove("d-none");

    }

}


/* ==========================================================
   Load Training Records
========================================================== */

async function loadTrainingRecords() {

    showLoading();


    const employeeID =
        getEmployeeIDFromSession();


    if (!employeeID) {

        showError(
            "Employee session not found. Please log in again."
        );

        return;

    }


    if (employeeIDElement) {

        employeeIDElement.textContent =
            employeeID;

    }


    try {

        /*
         * Connect to Apps Script API
         * once getTrainingRecords() is available.
         */

        if (
            typeof API === "undefined" ||
            typeof API.getTrainingRecords !== "function"
        ) {

            showEmpty();

            console.warn(
                "API.getTrainingRecords() is not available yet."
            );

            return;

        }


        const result =
            await API.getTrainingRecords(
                employeeID
            );


        if (
            result &&
            result.success === false
        ) {

            showError(
                result.message ||
                "Unable to load training records."
            );

            return;

        }


        const records =
            result.records ||
            result.data ||
            result ||
            [];


        renderRecords(records);


    } catch (error) {

        console.error(
            "Training records failed:",
            error
        );


        showError(
            "Unable to load training records."
        );

    }

}


/* ==========================================================
   Events
========================================================== */

if (addTrainingButton) {

    addTrainingButton.addEventListener(
        "click",
        openTrainingForm
    );

}


if (emptyAddTrainingButton) {

    emptyAddTrainingButton.addEventListener(
        "click",
        openTrainingForm
    );

}


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadTrainingRecords
    );

}


/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTrainingRecords();

    }
);