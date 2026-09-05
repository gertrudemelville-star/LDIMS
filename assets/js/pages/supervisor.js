/* ==========================================================
   LDIMS - Supervisor Dashboard Module
========================================================== */

"use strict";


/* ==========================================================
   STATE
========================================================== */

const SUPERVISOR = {

    user: null,

    employeeID: null,

    personnel: [],

    selectedEmployeeID: null

};


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeSupervisor();

    }
);


/* ==========================================================
   INITIALIZE SUPERVISOR
========================================================== */

async function initializeSupervisor() {

    try {

        const session =
            Session.get();

        if (!session) {

            window.location.href =
                "../index.html";

            return;

        }


        SUPERVISOR.user =
            session;


        SUPERVISOR.employeeID =
            session.employeeID ||
            session.EmployeeID ||
            session.id ||
            "";


        if (
            !SUPERVISOR.employeeID
        ) {

            showSupervisorMessage(
                "Unable to identify your Employee ID.",
                "error"
            );

            return;

        }


        loadSupervisorIdentity();

        await loadSupervisorPersonnel();


    } catch (error) {

        console.error(
            "Supervisor initialization error:",
            error
        );

        showSupervisorMessage(
            error.message ||
            "Unable to load Supervisor Dashboard.",
            "error"
        );

    }

}


/* ==========================================================
   LOAD SUPERVISOR IDENTITY
========================================================== */

function loadSupervisorIdentity() {

    const user =
        SUPERVISOR.user || {};


    setText(
        "supervisorName",
        user.fullname ||
        user.Fullname ||
        user.name ||
        "Supervisor"
    );


    setText(
        "supervisorPosition",
        user.position ||
        user.Position ||
        ""
    );


    setText(
        "supervisorAssignment",
        user.placeOfAssignment ||
        user.PlaceOfAssignment ||
        user.assignment ||
        ""
    );


    setText(
        "supervisorRole",
        user.role ||
        user.Role ||
        "Supervisor"
    );

}


/* ==========================================================
   LOAD SUPERVISOR PERSONNEL
========================================================== */

async function loadSupervisorPersonnel() {

    try {

        showSupervisorLoading(
            true
        );


        const response =
            await API.post({

                action:
                    "getSupervisorPersonnel",

                employeeID:
                    SUPERVISOR.employeeID

            });


        console.log(
            "Supervisor personnel:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to load personnel."
            );

        }


        SUPERVISOR.personnel =
            Array.isArray(
                response.personnel
            )
                ? response.personnel
                : [];


        renderPersonnelTable();

        updatePersonnelSummary();


    } catch (error) {

        console.error(
            "loadSupervisorPersonnel error:",
            error
        );


        SUPERVISOR.personnel =
            [];


        renderPersonnelTable();

        showSupervisorMessage(
            error.message ||
            "Unable to load personnel.",
            "error"
        );


    } finally {

        showSupervisorLoading(
            false
        );

    }

}


/* ==========================================================
   RENDER PERSONNEL TABLE
========================================================== */

function renderPersonnelTable() {

    const tableBody =
        document.getElementById(
            "personnelTableBody"
        );


    if (!tableBody) {

        console.warn(
            "personnelTableBody not found."
        );

        return;

    }


    tableBody.innerHTML =
        "";


    if (
        SUPERVISOR.personnel.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center"
                >
                    No personnel found.
                </td>

            </tr>

        `;

        return;

    }


    SUPERVISOR.personnel.forEach(
        function (employee) {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                normalizeStatus(
                    employee.lnaStatus
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        employee.employeeID
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee.name ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee.position ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee.assignment ||
                        "-"
                    )}
                </td>

                <td>
                    ${getStatusBadge(
                        employee.lnaStatus
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-primary"
                        onclick="openLNA('${escapeAttribute(
                            employee.employeeID
                        )}')"
                    >
                        View LNA
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================================
   SUMMARY
========================================================== */

function updatePersonnelSummary() {

    const personnel =
        SUPERVISOR.personnel;


    const total =
        personnel.length;


    const forCompletion =
        personnel.filter(
            employee =>
                normalizeStatus(
                    employee.lnaStatus
                ) === "for completion"
        ).length;


    const forReview =
        personnel.filter(
            employee =>
                normalizeStatus(
                    employee.lnaStatus
                ) === "for review"
        ).length;


    const forRevision =
        personnel.filter(
            employee =>
                normalizeStatus(
                    employee.lnaStatus
                ) === "for revision"
        ).length;


    const validated =
        personnel.filter(
            employee =>
                [
                    "validated",
                    "approved"
                ].includes(
                    normalizeStatus(
                        employee.lnaStatus
                    )
                )
        ).length;


    setText(
        "totalPersonnel",
        total
    );


    setText(
        "pendingLNA",
        forReview +
        forRevision
    );


    setText(
        "forCompletion",
        forCompletion
    );


    setText(
        "validatedLNA",
        validated
    );

}


/* ==========================================================
   OPEN LNA
========================================================== */

async function openLNA(
    employeeID
) {

    try {

        SUPERVISOR.selectedEmployeeID =
            employeeID;


        showSupervisorLoading(
            true
        );


        const response =
            await API.post({

                action:
                    "getLNAByEmployeeID",

                employeeID:
                    employeeID

            });


        console.log(
            "Supervisor LNA:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to retrieve LNA."
            );

        }


        if (
            response.submitted !== true ||
            !response.record
        ) {

            showLNAEmptyState(
                employeeID
            );

            return;

        }


        renderSupervisorLNA(
            response.record
        );


        await loadSupervisorTrainingHistory(
            employeeID
        );


        showLNASection();


    } catch (error) {

        console.error(
            "openLNA error:",
            error
        );


        showSupervisorMessage(
            error.message ||
            "Unable to open LNA.",
            "error"
        );


    } finally {

        showSupervisorLoading(
            false
        );

    }

}


/* ==========================================================
   RENDER SUPERVISOR LNA
========================================================== */

function renderSupervisorLNA(
    record
) {

    const employee =
        findPersonnel(
            record.employeeID
        );


    setText(
        "lnaEmployeeID",
        record.employeeID
    );


    setText(
        "lnaEmployeeName",
        record.name ||
        (employee && employee.name) ||
        "-"
    );


    setText(
        "lnaEmployeePosition",
        record.position ||
        (employee && employee.position) ||
        "-"
    );


    setText(
        "lnaEmployeeAssignment",
        record.placeOfAssignment ||
        (employee && employee.assignment) ||
        "-"
    );


    setHTML(
        "lnaStatus",
        getStatusBadge(
            record.status
        )
    );


    renderLNASections(
        record
    );


    renderSupervisorActions(
        record
    );

}


/* ==========================================================
   CONTROLLED LNA DISPLAY
   ----------------------------------------------------------
   Do NOT dump raw object fields.
========================================================== */

function renderLNASections(
    record
) {

    const container =
        document.getElementById(
            "lnaDetails"
        );


    if (!container) {

        console.warn(
            "lnaDetails not found."
        );

        return;

    }


    const sections = [

        {
            title:
                "Development Priority",

            value:
                record.developmentPriority

        },

        {
            title:
                "Current Competencies / Development Needs",

            value:
                record.currentCompetencies

        },

        {
            title:
                "Future Competency Needs",

            value:
                record.futureNeeds

        },

        {
            title:
                "Emerging Skills / Technologies",

            value:
                record.emergingSkills

        },

        {
            title:
                "Proposed Learning / Intervention",

            value:
                record.proposedLearning

        },

        {
            title:
                "Preferred Learning Method",

            value:
                record.learningMethod

        },

        {
            title:
                "Current Responsibilities",

            value:
                record.currentResponsibilities

        },

        {
            title:
                "Technical Responsibility",

            value:
                record.technicalResponsibility

        },

        {
            title:
                "Changes in Duties",

            value:
                record.dutyChanges

        },

        {
            title:
                "Functional Area",

            value:
                record.functionalArea

        },

        {
            title:
                "Participation Barriers",

            value:
                record.participationBarriers

        },

        {
            title:
                "Other Barriers",

            value:
                record.otherBarriers

        },

        {
            title:
                "Expected Application",

            value:
                record.expectedApplication

        },

        {
            title:
                "Expected Improvement",

            value:
                record.expectedImprovement

        },

        {
            title:
                "Organizational Support",

            value:
                record.organizationalSupport

        },

        {
            title:
                "Knowledge / Skills to Share",

            value:
                record.knowledgeToShare

        },

        {
            title:
                "Willing to Facilitate",

            value:
                record.willingToFacilitate

        },

        {
            title:
                "Facilitation Topics",

            value:
                record.facilitationTopics

        },

        {
            title:
                "Recommended Programs",

            value:
                record.recommendedPrograms

        },

        {
            title:
                "Organization Comments",

            value:
                record.organizationComments

        },

        {
            title:
                "L&D Needs Comments",

            value:
                record.needsComments

        },

        {
            title:
                "Revision Reason",

            value:
                record.revisionReason

        }

    ];


    const availableSections =
        sections.filter(
            section =>
                hasValue(
                    section.value
                )
        );


    if (
        availableSections.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                No LNA details available.

            </div>

        `;

        return;

    }


    container.innerHTML =
        availableSections
            .map(
                function (section) {

                    return `

                        <div
                            class="lna-detail-section"
                        >

                            <div
                                class="lna-detail-title"
                            >
                                ${escapeHTML(
                                    section.title
                                )}
                            </div>

                            <div
                                class="lna-detail-value"
                            >
                                ${formatLNAValue(
                                    section.value
                                )}
                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ==========================================================
   SUPERVISOR ACTIONS
========================================================== */

function renderSupervisorActions(
    record
) {

    const container =
        document.getElementById(
            "supervisorLNAActions"
        );


    if (!container) {

        return;

    }


    const status =
        normalizeStatus(
            record.status
        );


    /* ======================================================
       FOR COMPLETION
       ------------------------------------------------------
       Employee still needs to complete LNA.
       Supervisor does not validate yet.
    ====================================================== */

    if (
        status ===
        "for completion"
    ) {

        container.innerHTML = `

            <div class="alert alert-warning">

                <strong>For Completion</strong>

                <div>
                    The employee has not yet completed
                    the required LNA information.
                </div>

            </div>

        `;

        return;

    }


    /* ======================================================
       VALIDATED
    ====================================================== */

    if (
        status ===
            "validated" ||
        status ===
            "approved"
    ) {

        container.innerHTML = `

            <div class="alert alert-success">

                <strong>LNA Validated</strong>

                <div>
                    This LNA has already been validated
                    by the supervisor.
                </div>

            </div>

        `;

        return;

    }


    /* ======================================================
       FOR REVIEW / FOR REVISION
    ====================================================== */

    container.innerHTML = `

        <div class="supervisor-lna-actions">

            <button
                type="button"
                class="btn btn-success"
                onclick="supervisorValidateLNA('${escapeAttribute(
                    record.employeeID
                )}')"
            >
                Validate LNA
            </button>

            <button
                type="button"
                class="btn btn-warning"
                onclick="supervisorReturnLNA('${escapeAttribute(
                    record.employeeID
                )}')"
            >
                Return for Revision
            </button>

        </div>

    `;

}


/* ==========================================================
   VALIDATE LNA
========================================================== */

async function supervisorValidateLNA(
    employeeID
) {

    if (!employeeID) {

        return;

    }


    const confirmed =
        window.confirm(
            "Are you sure you want to validate this LNA?"
        );


    if (!confirmed) {

        return;

    }


    try {

        showSupervisorLoading(
            true
        );


        const response =
            await API.post({

                action:
                    "supervisorValidateLNA",

                employeeID:
                    employeeID

            });


        console.log(
            "Validate LNA response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to validate LNA."
            );

        }


        showSupervisorMessage(
            "LNA successfully validated.",
            "success"
        );


        await loadSupervisorPersonnel();


        await openLNA(
            employeeID
        );


    } catch (error) {

        console.error(
            "supervisorValidateLNA error:",
            error
        );


        showSupervisorMessage(
            error.message ||
            "Unable to validate LNA.",
            "error"
        );


    } finally {

        showSupervisorLoading(
            false
        );

    }

}


/* ==========================================================
   RETURN LNA FOR REVISION
========================================================== */

async function supervisorReturnLNA(
    employeeID
) {

    if (!employeeID) {

        return;

    }


    const reason =
        window.prompt(
            "Please enter the reason for returning this LNA for revision:"
        );


    if (
        reason === null
    ) {

        return;

    }


    if (
        !reason.trim()
    ) {

        showSupervisorMessage(
            "Revision reason is required.",
            "error"
        );

        return;

    }


    try {

        showSupervisorLoading(
            true
        );


        const response =
            await API.post({

                action:
                    "supervisorReturnLNA",

                employeeID:
                    employeeID,

                reason:
                    reason.trim()

            });


        console.log(
            "Return LNA response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to return LNA for revision."
            );

        }


        showSupervisorMessage(
            "LNA returned for revision.",
            "success"
        );


        await loadSupervisorPersonnel();


        await openLNA(
            employeeID
        );


    } catch (error) {

        console.error(
            "supervisorReturnLNA error:",
            error
        );


        showSupervisorMessage(
            error.message ||
            "Unable to return LNA for revision.",
            "error"
        );


    } finally {

        showSupervisorLoading(
            false
        );

    }

}


/* ==========================================================
   TRAINING HISTORY
========================================================== */

async function loadSupervisorTrainingHistory(
    employeeID
) {

    const container =
        document.getElementById(
            "trainingHistory"
        );


    if (!container) {

        return;

    }


    try {

        container.innerHTML =
            `<div>Loading training history...</div>`;


        const response =
            await API.post({

                action:
                    "getTrainingRecords",

                employeeID:
                    employeeID

            });


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to load training history."
            );

        }


        const records =
            Array.isArray(
                response.records
            )
                ? response.records
                : [];


        if (
            records.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    No training records found.

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div class="table-responsive">

                <table class="table">

                    <thead>

                        <tr>

                            <th>Training</th>

                            <th>Start Date</th>

                            <th>End Date</th>

                            <th>Hours</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${records
                            .map(
                                function (record) {

                                    return `

                                        <tr>

                                            <td>
                                                ${escapeHTML(
                                                    record.trainingTitle ||
                                                    record.title ||
                                                    "-"
                                                )}
                                            </td>

                                            <td>
                                                ${formatDate(
                                                    record.startDate
                                                )}
                                            </td>

                                            <td>
                                                ${formatDate(
                                                    record.endDate
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    record.totalHours ||
                                                    "-"
                                                )}
                                            </td>

                                        </tr>

                                    `;

                                }
                            )
                            .join("")}

                    </tbody>

                </table>

            </div>

        `;


    } catch (error) {

        console.error(
            "loadSupervisorTrainingHistory error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                Unable to load training history.

            </div>

        `;

    }

}


/* ==========================================================
   SHOW LNA SECTION
========================================================== */

function showLNASection() {

    const section =
        document.getElementById(
            "lnaSection"
        );


    if (section) {

        section.style.display =
            "";

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* ==========================================================
   SHOW EMPTY LNA
========================================================== */

function showLNAEmptyState(
    employeeID
) {

    const container =
        document.getElementById(
            "lnaDetails"
        );


    if (container) {

        container.innerHTML = `

            <div class="empty-state">

                No LNA submission found for Employee ID
                ${escapeHTML(employeeID)}.

            </div>

        `;

    }


    setText(
        "lnaEmployeeID",
        employeeID
    );


    setHTML(
        "lnaStatus",
        getStatusBadge(
            "No LNA"
        )
    );


    showLNASection();

}


/* ==========================================================
   FIND PERSONNEL
========================================================== */

function findPersonnel(
    employeeID
) {

    return SUPERVISOR.personnel.find(
        employee =>
            String(
                employee.employeeID
            ) ===
            String(
                employeeID
            )
    );

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function getStatusBadge(
    status
) {

    const normalized =
        normalizeStatus(
            status
        );


    let className =
        "status-badge";


    switch (normalized) {

        case "for completion":

            className +=
                " status-warning";

            break;


        case "for review":

            className +=
                " status-info";

            break;


        case "for revision":

            className +=
                " status-danger";

            break;


        case "validated":

            className +=
                " status-success";

            break;


        case "approved":

            className +=
                " status-success";

            break;


        case "no lna":

            className +=
                " status-muted";

            break;


        default:

            className +=
                " status-muted";

            break;

    }


    return `

        <span class="${className}">

            ${escapeHTML(
                status ||
                "No LNA"
            )}

        </span>

    `;

}


/* ==========================================================
   NORMALIZE STATUS
========================================================== */

function normalizeStatus(
    status
) {

    return String(
        status || ""
    )
    .trim()
    .toLowerCase();

}


/* ==========================================================
   FORMAT LNA VALUE
========================================================== */

function formatLNAValue(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }


    if (
        Array.isArray(
            value
        )
    ) {

        return value
            .map(
                item =>
                    escapeHTML(
                        String(
                            item
                        )
                    )
            )
            .join(", ");

    }


    return escapeHTML(
        String(
            value
        )
    )
    .replace(
        /\r?\n/g,
        "<br>"
    );

}


/* ==========================================================
   DATE FORMAT
========================================================== */

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
            String(
                value
            )
        );

    }


    return date.toLocaleDateString(
        "en-PH",
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    );

}


/* ==========================================================
   VALUE CHECK
========================================================== */

function hasValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return false;

    }


    if (
        Array.isArray(
            value
        )
    ) {

        return value.length > 0;

    }


    return String(
        value
    ).trim() !== "";

}


/* ==========================================================
   TEXT HELPER
========================================================== */

function setText(
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


    element.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(
                value
            );

}


/* ==========================================================
   HTML HELPER
========================================================== */

function setHTML(
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


    element.innerHTML =
        value || "";

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* ==========================================================
   ESCAPE ATTRIBUTE
========================================================== */

function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    );

}


/* ==========================================================
   LOADING
========================================================== */

function showSupervisorLoading(
    visible
) {

    const element =
        document.getElementById(
            "supervisorLoading"
        );


    if (!element) {

        return;

    }


    element.style.display =
        visible
            ? ""
            : "none";

}


/* ==========================================================
   MESSAGE
========================================================== */

function showSupervisorMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "supervisorMessage"
        );


    if (!element) {

        /*
         * Fallback for existing pages
         * without the message container.
         */

        if (
            type === "error"
        ) {

            console.error(
                message
            );

        } else {

            console.log(
                message
            );

        }

        return;

    }


    element.textContent =
        message || "";


    element.className =
        "supervisor-message " +
        (
            type === "error"
                ? "error"
                : "success"
        );


    element.style.display =
        message
            ? ""
            : "none";


    if (message) {

        setTimeout(
            function () {

                element.style.display =
                    "none";

            },
            5000
        );

    }

}


/* ==========================================================
   LOGOUT
========================================================== */

function logoutSupervisor() {

    try {

        if (
            typeof Session.logout ===
            "function"
        ) {

            Session.logout();

        }

    } catch (error) {

        console.warn(
            "Session logout error:",
            error
        );

    }


    try {

        localStorage.removeItem(
            CONFIG.SESSION.STORAGE_KEY
        );

    } catch (error) {

        console.warn(
            "Unable to clear session:",
            error
        );

    }


    localStorage.removeItem(
        "ldimsUser"
    );


    window.location.href =
        "../index.html";

}