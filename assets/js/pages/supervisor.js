/* ==========================================================
   LDIMS - SUPERVISOR DASHBOARD
   SUPERVISOR = EMPLOYEE + SUPERVISOR

   FINAL LOCKED VERSION
   ----------------------------------------------------------
   - Single-shell Supervisor portal
   - Employee modules preserved
   - Supervisor personnel
   - Read-only employee LNA
   - Answered LNA sections only
   - Competency gap analysis
   - Validate / Return LNA
   - Training history
   - Logout
========================================================== */

"use strict";


/* ==========================================================
   STATE
========================================================== */

const SUPERVISOR = {
    user: null,
    employeeID: null,
    personnel: [],
    selectedEmployeeID: null,
    selectedLNARecord: null,
    currentView: "dashboard",
    employeeFrameObserver: null
};


/* ==========================================================
   EMPLOYEE MODULES
========================================================== */

const EMPLOYEE_MODULES = {
    profile: "../employee/profile.html",
    lna: "../employee/lna.html",
    training: "../employee/training-records.html",
    history: "../employee/learning-history.html",
    certificates: "../employee/certificates.html"
};


/* ==========================================================
   LNA COMPETENCY FIELDS
========================================================== */

const LNA_COMPETENCY_FIELDS = [
    "Integrity and Ethical Conduct",
    "Service Orientation",
    "Accountability and Results Orientation",
    "Communication and Collaboration",
    "Adaptability and Continuous Learning",
    "Organizational Awareness",
    "Compliance and Policy Adherence",
    "Coordination and Stakeholder Management",
    "Leadership and People Development",
    "Change and Innovation",
    "Research and Analysis",
    "Data Analysis and Interpretation",
    "Information Management",
    "Digital Information Management",
    "Information Security",
    "Risk Assessment",
    "Legal and Regulatory Compliance",
    "Project / Activity Management",
    "Presentation and Briefing",
    "Stakeholder Coordination"
];


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", initializeSupervisor);


async function initializeSupervisor() {

    try {

        const session = Session.get();

        if (!session) {
            window.location.href = "../index.html";
            return;
        }

        SUPERVISOR.user = session;

        SUPERVISOR.employeeID =
            session.employeeID ||
            session.EmployeeID ||
            session.id ||
            "";

        if (!SUPERVISOR.employeeID) {
            showSupervisorMessage(
                "Unable to identify your Employee ID.",
                "error"
            );
            return;
        }

        loadSupervisorIdentity();
        initializeNavigation();
        applySupervisorTypography();
        initializeLNAModal();

        await loadSupervisorPersonnel();
        await loadOwnEmployeeSummary();

        navigateToView(
            getViewFromHash() || "dashboard",
            false
        );

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
   IDENTITY
========================================================== */

function loadSupervisorIdentity() {

    const user = SUPERVISOR.user || {};

    const fullName =
        user.fullname ||
        user.Fullname ||
        user.name ||
        "Supervisor";

    const position =
        user.position ||
        user.Position ||
        "";

    const assignment =
        user.placeOfAssignment ||
        user.PlaceOfAssignment ||
        user.assignment ||
        "—";

    const role =
        user.role ||
        user.Role ||
        "Supervisor";

    setText("supervisorName", fullName);
    setText("supervisorPosition", position);
    setText("supervisorAssignment", assignment);
    setText("supervisorRole", role);
    setText("welcomeName", fullName);
    setText("assignmentName", assignment);

    const avatar =
        document.getElementById("supervisorAvatar");

    if (avatar) {
        avatar.textContent =
            String(fullName).trim().charAt(0).toUpperCase() || "S";
    }
}


/* ==========================================================
   TYPOGRAPHY
   ----------------------------------------------------------
   Labels/text = 12px
   Dashboard values remain larger.
   Employee iframe values are preserved.
========================================================== */

function applySupervisorTypography() {

    if (document.getElementById("supervisorTypographyOverride")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "supervisorTypographyOverride";

    style.textContent = `

        /* ==================================================
           GENERAL SUPERVISOR TEXT
        ================================================== */

        body {
            font-size: 12px !important;
        }

        .sidebar,
        .sidebar *,
        .nav-item,
        .nav-item *,
        .supervisor-view,
        .supervisor-view * {
            font-size: 12px !important;
        }


        /* ==================================================
           DASHBOARD NUMBERS
           DO NOT SHRINK THESE
        ================================================== */

        .summary-card-value {
            font-size: 20px !important;
            line-height: 1 !important;
            font-weight: 750 !important;
        }

        .summary-card-label {
            font-size: 12px !important;
        }

        .summary-card-description {
            font-size: 12px !important;
        }


        /* ==================================================
           DASHBOARD HEADINGS
        ================================================== */

        .dashboard-welcome h2 {
            font-size: 20px !important;
        }


        /* ==================================================
           TABLES
        ================================================== */

        .data-table,
        .data-table th,
        .data-table td {
            font-size: 12px !important;
        }


        /* ==================================================
           LNA MODAL
        ================================================== */

        #lnaModal {
            font-size: 12px !important;
        }

        #lnaModal .lna-readonly-section {
            margin-bottom: 18px !important;
            border: 1px solid #e8e1ec !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            background: #fff !important;
        }

        #lnaModal .lna-readonly-section-header {
            padding: 12px 14px !important;
            background: #f8f5fa !important;
            border-bottom: 1px solid #e8e1ec !important;
        }

        #lnaModal .lna-readonly-section-title {
            font-size: 15px !important;
            font-weight: 700 !important;
            line-height: 1.35 !important;
        }

        #lnaModal .lna-readonly-section-subtitle {
            font-size: 11px !important;
            line-height: 1.4 !important;
        }

        #lnaModal .lna-question-row {
            display: grid !important;
            grid-template-columns: minmax(280px, 42%) minmax(0, 58%) !important;
            gap: 16px !important;
            padding: 12px 14px !important;
            border-bottom: 1px solid #eeeaf1 !important;
        }

        #lnaModal .lna-question-row:last-child {
            border-bottom: 0 !important;
        }

        #lnaModal .lna-question {
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 1.5 !important;
            color: #4a3b52 !important;
        }

        #lnaModal .lna-answer {
            font-size: 12px !important;
            line-height: 1.55 !important;
            color: #29232e !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
        }


        /* ==================================================
           COMPETENCY GAP ANALYSIS
        ================================================== */

        #lnaModal .gap-analysis-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 20px !important;
            padding: 14px 16px !important;
            margin-bottom: 14px !important;
            border: 1px solid #e5dce9 !important;
            border-radius: 8px !important;
            background: #faf8fb !important;
        }

        #lnaModal .gap-analysis-title {
            font-size: 16px !important;
            font-weight: 700 !important;
            color: #4a148c !important;
            margin-bottom: 4px !important;
        }

        #lnaModal .gap-analysis-subtitle {
            font-size: 12px !important;
            line-height: 1.5 !important;
            color: #6f6674 !important;
        }


        /* Summary cards */

        #lnaModal .gap-analysis-card {
            display: grid !important;
            grid-template-columns: 220px minmax(0, 1fr) !important;
            gap: 16px !important;
            align-items: start !important;
            padding: 12px 14px !important;
            margin-bottom: 8px !important;
            border: 1px solid #e8e1ec !important;
            border-radius: 7px !important;
            background: #fff !important;
        }

        #lnaModal .gap-analysis-label {
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: .25px !important;
            color: #766d7d !important;
        }

        #lnaModal .gap-analysis-value {
            font-size: 12px !important;
            line-height: 1.55 !important;
            color: #2f2834 !important;
            overflow-wrap: anywhere !important;
        }


        /* Competency table */

        #lnaModal .gap-analysis-table-section {
            margin-top: 18px !important;
            border: 1px solid #e4dce8 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            background: #fff !important;
        }

        #lnaModal .gap-analysis-section-title {
            padding: 12px 14px !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            color: #4a148c !important;
            background: #f8f5fa !important;
            border-bottom: 1px solid #e4dce8 !important;
        }

        #lnaModal .gap-analysis-table-wrap {
            width: 100% !important;
            overflow-x: auto !important;
        }

        #lnaModal .gap-analysis-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
        }

        #lnaModal .gap-analysis-table th {
            padding: 10px 11px !important;
            background: #f3eef6 !important;
            border-bottom: 1px solid #ddd3e2 !important;
            color: #514556 !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            line-height: 1.35 !important;
            text-align: left !important;
        }

        #lnaModal .gap-analysis-table td {
            padding: 11px !important;
            border-bottom: 1px solid #eeeaf1 !important;
            color: #302a35 !important;
            font-size: 12px !important;
            line-height: 1.45 !important;
            vertical-align: top !important;
            overflow-wrap: anywhere !important;
        }

        #lnaModal .gap-analysis-table tr:last-child td {
            border-bottom: 0 !important;
        }

        #lnaModal .gap-analysis-table th:nth-child(1),
        #lnaModal .gap-analysis-table td:nth-child(1) {
            width: 31% !important;
        }

        #lnaModal .gap-analysis-table th:nth-child(2),
        #lnaModal .gap-analysis-table td:nth-child(2) {
            width: 23% !important;
        }

        #lnaModal .gap-analysis-table th:nth-child(3),
        #lnaModal .gap-analysis-table td:nth-child(3) {
            width: 17% !important;
        }

        #lnaModal .gap-analysis-table th:nth-child(4),
        #lnaModal .gap-analysis-table td:nth-child(4) {
            width: 13% !important;
        }

        #lnaModal .gap-analysis-table th:nth-child(5),
        #lnaModal .gap-analysis-table td:nth-child(5) {
            width: 16% !important;
        }


        /* Rating badge */

        #lnaModal .competency-rating-badge {
            display: inline-block !important;
            padding: 4px 8px !important;
            border-radius: 5px !important;
            background: #f1edf4 !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            white-space: nowrap !important;
        }

        #lnaModal .pending-rating {
            display: inline-block !important;
            padding: 4px 7px !important;
            border-radius: 5px !important;
            background: #f4f1f5 !important;
            color: #6f6674 !important;
            font-size: 11px !important;
            font-style: italic !important;
        }


        /* Supervisor action */

        #lnaModal .gap-analysis-note {
            display: flex !important;
            flex-direction: column !important;
            gap: 5px !important;
            margin-top: 16px !important;
            padding: 13px 15px !important;
            border-left: 4px solid #6a1b9a !important;
            background: #faf8fb !important;
            border-radius: 5px !important;
            font-size: 12px !important;
            line-height: 1.5 !important;
        }


        /* ==================================================
           RESPONSIVE
        ================================================== */

        @media (max-width: 800px) {

            #lnaModal .lna-question-row {
                grid-template-columns: 1fr !important;
                gap: 6px !important;
            }

            #lnaModal .gap-analysis-card {
                grid-template-columns: 1fr !important;
                gap: 5px !important;
            }

        }

    `;

    document.head.appendChild(style);
}

/* ==========================================================
   NAVIGATION
========================================================== */

function initializeNavigation() {

    document
        .querySelectorAll(".nav-item[data-view]")
        .forEach(function(item) {

            item.addEventListener("click", function(event) {

                event.preventDefault();

                const view =
                    item.getAttribute("data-view");

                if (view) {
                    navigateToView(view, true);
                }
            });
        });

    window.addEventListener(
        "hashchange",
        function() {
            navigateToView(
                getViewFromHash(),
                false
            );
        }
    );
}


function getViewFromHash() {

    return window.location.hash
        .replace("#", "")
        .trim()
        .toLowerCase() || "dashboard";
}


function navigateToView(view, updateHash) {

    const allowedViews = [
        "dashboard",
        "profile",
        "lna",
        "training",
        "history",
        "certificates",
        "personnel",
        "validation",
        "interventions"
    ];

    if (!allowedViews.includes(view)) {
        view = "dashboard";
    }

    SUPERVISOR.currentView = view;

    updateActiveNavigation(view);
    hideAllViews();

    /*
     * Intentionally no dynamic page title.
     * Header remains:
     * EMPLOYEE & SUPERVISOR PORTAL + employee name.
     */

    updateViewTitle(view);

    if (view === "dashboard") {

        showView("view-dashboard");

    } else if (view === "personnel") {

        showView("view-personnel");
        renderPersonnelTable();

    } else if (view === "validation") {

        showView("view-validation");
        renderValidationView();

    } else if (view === "interventions") {

        showView("view-interventions");
        renderInterventionsView();

    } else {

        showView("view-employee");
        loadEmployeeModule(view);

    }

    if (
        updateHash &&
        window.location.hash !== "#" + view
    ) {

        window.history.pushState(
            null,
            "",
            "#" + view
        );
    }
}


function updateActiveNavigation(currentView) {

    document
        .querySelectorAll(".nav-item[data-view]")
        .forEach(function(item) {

            item.classList.toggle(
                "active",
                item.getAttribute("data-view") === currentView
            );
        });
}


function hideAllViews() {

    document
        .querySelectorAll(".supervisor-view")
        .forEach(function(view) {

            view.style.display = "none";

        });
}


function showView(id) {

    const view =
        document.getElementById(id);

    if (view) {
        view.style.display = "";
    }
}


function updateViewTitle() {

    const element =
        document.getElementById("viewTitle");

    if (element) {
        element.textContent = "";
    }
}


/* ==========================================================
   EMPLOYEE MODULE
========================================================== */

function loadEmployeeModule(view) {

    const frame =
        document.getElementById("employeeModuleFrame");

    if (!frame) {
        return;
    }

    const moduleURL =
        EMPLOYEE_MODULES[view];

    if (!moduleURL) {
        return;
    }

    if (SUPERVISOR.employeeFrameObserver) {

        try {
            SUPERVISOR.employeeFrameObserver.disconnect();
        } catch (error) {}

        SUPERVISOR.employeeFrameObserver = null;
    }

    frame.onload = normalizeEmployeeFrame;
    frame.src = moduleURL;
}


function normalizeEmployeeFrame() {

    const frame =
        document.getElementById("employeeModuleFrame");

    if (!frame) {
        return;
    }

    try {

        const doc =
            frame.contentDocument ||
            frame.contentWindow.document;

        if (!doc) {
            return;
        }

        const hideNavigation = function() {

            [
                ".sidebar",
                "#sidebar",
                "#navbar",
                ".navbar",
                ".topbar",
                ".employee-sidebar",
                ".employee-navbar",
                ".ldims-sidebar",
                ".sidebar-container",
                ".navigation",
                ".side-navigation"
            ].forEach(function(selector) {

                doc
                    .querySelectorAll(selector)
                    .forEach(function(element) {

                        element.style.setProperty(
                            "display",
                            "none",
                            "important"
                        );

                        element.style.setProperty(
                            "visibility",
                            "hidden",
                            "important"
                        );
                    });
            });

            [
                ".main-content",
                ".ldims-content",
                ".content",
                ".page-content",
                ".main",
                "main"
            ].forEach(function(selector) {

                doc
                    .querySelectorAll(selector)
                    .forEach(function(element) {

                        element.style.setProperty(
                            "margin-left",
                            "0",
                            "important"
                        );

                        element.style.setProperty(
                            "padding-left",
                            "20px",
                            "important"
                        );

                        element.style.setProperty(
                            "width",
                            "100%",
                            "important"
                        );

                        element.style.setProperty(
                            "max-width",
                            "100%",
                            "important"
                        );
                    });
            });

            /*
             * IMPORTANT:
             * We do NOT resize employee module cards.
             * Existing employee layouts remain intact.
             */
        };

        hideNavigation();

        if (SUPERVISOR.employeeFrameObserver) {
            try {
                SUPERVISOR.employeeFrameObserver.disconnect();
            } catch (error) {}
        }

        if (doc.body) {

            SUPERVISOR.employeeFrameObserver =
                new MutationObserver(hideNavigation);

            SUPERVISOR.employeeFrameObserver.observe(
                doc.body,
                {
                    childList: true,
                    subtree: true
                }
            );
        }

    } catch (error) {

        console.warn(
            "Unable to normalize employee module:",
            error
        );
    }
}


/* ==========================================================
   SUPERVISOR PERSONNEL
========================================================== */

async function loadSupervisorPersonnel() {

    try {

        showSupervisorLoading(true);

        const response =
            await API.post({
                action: "getSupervisorPersonnel",
                employeeID: SUPERVISOR.employeeID
            });

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Unable to load personnel."
            );
        }

        SUPERVISOR.personnel =
            Array.isArray(response.personnel)
                ? response.personnel
                : [];

        renderPersonnelTable();
        updatePersonnelSummary();

    } catch (error) {

        console.error(
            "loadSupervisorPersonnel:",
            error
        );

        SUPERVISOR.personnel = [];

        renderPersonnelTable();

        showSupervisorMessage(
            error.message ||
            "Unable to load personnel.",
            "error"
        );

    } finally {

        showSupervisorLoading(false);

    }
}


function renderPersonnelTable() {

    const tableBody =
        document.getElementById("personnelTableBody");

    if (!tableBody) {
        return;
    }

    if (!SUPERVISOR.personnel.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No personnel found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML =
        SUPERVISOR.personnel
            .map(function(employee) {

                return `
                    <tr>
                        <td>
                            ${escapeHTML(employee.employeeID || "-")}
                        </td>

                        <td>
                            ${escapeHTML(employee.name || "-")}
                        </td>

                        <td>
                            ${escapeHTML(employee.position || "-")}
                        </td>

                        <td>
                            ${escapeHTML(employee.assignment || "-")}
                        </td>

                        <td>
                            ${getStatusBadge(employee.lnaStatus)}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                onclick="openLNA('${escapeAttribute(employee.employeeID)}')"
                            >
                                View LNA
                            </button>
                        </td>
                    </tr>
                `;

            })
            .join("");
}


function updatePersonnelSummary() {

    const personnel =
        SUPERVISOR.personnel;

    const statusCount =
        function(status) {

            return personnel.filter(function(employee) {

                return normalizeStatus(
                    employee.lnaStatus
                ) === status;

            }).length;
        };

    setText(
        "totalPersonnel",
        personnel.length
    );

    setText(
        "pendingLNA",
        statusCount("for review") +
        statusCount("for revision")
    );

    setText(
        "forCompletion",
        statusCount("for completion")
    );

    setText(
        "validatedLNA",
        personnel.filter(function(employee) {

            return [
                "validated",
                "approved"
            ].includes(
                normalizeStatus(employee.lnaStatus)
            );

        }).length
    );
}


/* ==========================================================
   OPEN LNA
========================================================== */

async function openLNA(employeeID) {

    if (!employeeID) {

        showSupervisorMessage(
            "Invalid Employee ID.",
            "error"
        );

        return;
    }

    SUPERVISOR.selectedEmployeeID =
        employeeID;

    openLNAModal();

    setText("lnaEmployeeID", employeeID);
    setText("lnaEmployeeName", "Loading...");
    setText("lnaEmployeePosition", "—");
    setText("lnaEmployeeAssignment", "—");

    setHTML(
        "lnaStatus",
        getStatusBadge("Loading")
    );

    setHTML(
        "lnaDetails",
        `<div class="empty-state">
            Loading LNA information...
        </div>`
    );

    setHTML(
        "trainingHistory",
        `<div class="empty-state">
            Loading training history...
        </div>`
    );

    setHTML(
        "supervisorLNAActions",
        ""
    );

    try {

        const response =
            await API.post({
                action: "getLNAByEmployeeID",
                employeeID: employeeID
            });

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Unable to retrieve LNA."
            );
        }

        if (
            response.submitted !== true ||
            !response.record
        ) {

            showLNAEmptyState(employeeID);

            await loadSupervisorTrainingHistory(
                employeeID
            );

            return;
        }

        SUPERVISOR.selectedLNARecord =
            response.record;

        renderSupervisorLNA(
            response.record
        );

        await loadSupervisorTrainingHistory(
            employeeID
        );

    } catch (error) {

        console.error(
            "openLNA:",
            error
        );

        setHTML(
            "lnaDetails",
            `<div class="empty-state">
                Unable to load LNA information.
                <br><br>
                <small>
                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}
                </small>
            </div>`
        );

        setHTML(
            "lnaStatus",
            getStatusBadge("Unavailable")
        );
    }
}


/* ==========================================================
   LNA MODAL
========================================================== */

function initializeLNAModal() {

    const modal =
        document.getElementById("lnaModal");

    if (!modal) {
        return;
    }

    const backdrop =
        modal.querySelector(".lna-modal-backdrop");

    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeLNAModal
        );
    }

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains("is-open")
            ) {
                closeLNAModal();
            }
        }
    );
}


function openLNAModal() {

    const modal =
        document.getElementById("lnaModal");

    if (!modal) {
        return;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}


function closeLNAModal() {

    const modal =
        document.getElementById("lnaModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    SUPERVISOR.selectedEmployeeID = null;
    SUPERVISOR.selectedLNARecord = null;
}


/* ==========================================================
   RENDER SUPERVISOR LNA
========================================================== */

function renderSupervisorLNA(record) {

    const employee =
        findPersonnel(record.employeeID);

    setText(
        "lnaEmployeeID",
        record.employeeID || "-"
    );

    setText(
        "lnaEmployeeName",
        record.name ||
        employee?.name ||
        "-"
    );

    setText(
        "lnaEmployeePosition",
        record.position ||
        employee?.position ||
        "-"
    );

    setText(
        "lnaEmployeeAssignment",
        record.placeOfAssignment ||
        record.assignment ||
        employee?.assignment ||
        "-"
    );

    setHTML(
        "lnaStatus",
        getStatusBadge(record.status)
    );

    if (SUPERVISOR.currentView === "validation") {

        renderCompetencyGapAnalysis(record);

        renderSupervisorActions(
            record,
            true
        );

        return;
    }

    renderCompleteEmployeeLNA(record);

    renderSupervisorActions(
        record,
        false
    );
}


/* ==========================================================
   FINAL LOCKED LNA RENDERER
   ----------------------------------------------------------
   The employee submission is the source of truth.

   IMPORTANT:
   We do NOT invent missing answers.
   We render mapped sections from actual backend fields
   and then render any remaining answered questions from
   record.raw.

   Empty sections are omitted.
========================================================== */

function renderCompleteEmployeeLNA(record) {

    const container =
        document.getElementById("lnaDetails");

    if (!container) {
        return;
    }

    const raw =
        record?.raw &&
        typeof record.raw === "object"
            ? record.raw
            : {};

    let html = "";

    /*
     * Track raw questions already rendered so that
     * remaining answers can still be shown.
     */

    const usedKeys = new Set();

    function addSection(title, rows) {

        const validRows =
            rows.filter(function(row) {

                return hasValue(row[1]);

            });

        if (!validRows.length) {
            return;
        }

        validRows.forEach(function(row) {

            const matchedKey =
                findRawKey(raw, row[0]);

            if (matchedKey) {
                usedKeys.add(matchedKey);
            }
        });

        html += renderLNAQuestionSection(
            title,
            validRows
        );
    }


    /* ======================================================
       PART 1
    ====================================================== */

    addSection(
        "1. Employee Information",
        [
            ["Employee ID", record.employeeID],
            ["Name", record.name],
            ["Position", record.position],
            ["Place of Assignment", record.placeOfAssignment]
        ]
    );


    /* ======================================================
       PART 2
    ====================================================== */

    addSection(
        "2. Current Work and Responsibilities",
        [
            [
                "Three (3) most important current responsibilities",
                firstAvailable(
                    record.currentResponsibilities,
                    getRawFieldValue(
                        raw,
                        "Give three (3) most important current responsibilities"
                    )
                )
            ],
            [
                "Responsibility requiring the greatest knowledge, skill, or technical expertise",
                firstAvailable(
                    record.technicalResponsibility,
                    getRawFieldValue(
                        raw,
                        "What responsibility requiring greatest knowledge/skill/technical expertise?"
                    )
                )
            ],
            [
                "Changes in duties or responsibilities within the past two years",
                firstAvailable(
                    record.dutyChanges,
                    getRawFieldValue(
                        raw,
                        "Do you have duties significantly changes"
                    )
                )
            ]
        ]
    );


    /* ======================================================
       PART 3
    ====================================================== */

    const competencyRows = [];

    LNA_COMPETENCY_FIELDS.forEach(function(field) {

        const key =
            findRawKey(raw, field);

        const value =
            key
                ? raw[key]
                : "";

        if (hasValue(value)) {

            usedKeys.add(key);

            competencyRows.push([
                field,
                value
            ]);
        }
    });

    addSection(
        "3. Core / Organizational / Cross-Functional Competencies",
        competencyRows
    );


    /* ======================================================
       PART 4
    ====================================================== */

    const technicalRows = [];

    Object.keys(raw).forEach(function(key) {

        const value = raw[key];

        if (!hasValue(value)) {
            return;
        }

        if (isMetadataKey(key)) {
            return;
        }

        if (
            LNA_COMPETENCY_FIELDS.some(function(field) {

                return normalizeHeader(field) ===
                    normalizeHeader(key);

            })
        ) {
            return;
        }

        if (isCompetencyRating(value)) {

            usedKeys.add(key);

            technicalRows.push([
                key,
                value
            ]);
        }
    });

    if (technicalRows.length) {

        html += renderTechnicalRowsSection(
            "4. Technical / Functional / Specialized Competencies",
            technicalRows
        );
    }


    /* ======================================================
       PART 5
    ====================================================== */

    addSection(
        "5. Competency Development Priorities",
        [
            [
                "Top competency development priorities",
                firstAvailable(
                    record.developmentPriority,
                    getRawFieldValue(
                        raw,
                        "Which competencies do you consider your top development priorities?"
                    )
                )
            ],
            [
                "Competency or competencies most urgently needed to improve current performance",
                firstAvailable(
                    record.currentCompetencies,
                    getRawFieldValue(
                        raw,
                        "Which competency or competencies do you most urgently need to develop"
                    )
                )
            ]
        ]
    );


    /* ======================================================
       PART 6
    ====================================================== */

    addSection(
        "6. Future Learning Needs",
        [
            [
                "Competencies or areas of knowledge anticipated in the next 1–3 years",
                firstAvailable(
                    record.futureNeeds,
                    getRawFieldValue(
                        raw,
                        "What competencies or areas of knowledge do you anticipate needing in the next 1–3 years"
                    )
                )
            ],
            [
                "Emerging skills, technologies, tools, or practices",
                firstAvailable(
                    record.emergingSkills,
                    getRawFieldValue(
                        raw,
                        "What emerging skills, technologies, tools, or practices do you think will become important"
                    )
                )
            ]
        ]
    );


    /* ======================================================
       PART 7
    ====================================================== */

    addSection(
        "7. Learning and Development Intervention",
        [
            [
                "Specific learning, training, seminar, workshop, certification, or other development intervention",
                firstAvailable(
                    record.proposedLearning,
                    getRawFieldValue(
                        raw,
                        "What specific learning, training, seminar, workshop, certification"
                    )
                )
            ],
            [
                "Preferred learning methods",
                firstAvailable(
                    record.learningMethod,
                    getRawFieldValue(
                        raw,
                        "Which learning methods do you prefer"
                    )
                )
            ]
        ]
    );


    /* ======================================================
       PART 8
    ====================================================== */

    addSection(
        "8. Barriers to Learning",
        [
            [
                "Factors that may prevent or make participation difficult",
                firstAvailable(
                    record.participationBarriers,
                    getRawFieldValue(
                        raw,
                        "What factors may prevent"
                    )
                )
            ],
            [
                "Other barriers or challenges",
                firstAvailable(
                    record.otherBarriers,
                    getRawFieldValue(
                        raw,
                        "Please specify any other barriers"
                    )
                )
            ]
        ]
    );


    /* ======================================================
       PART 9
    ====================================================== */

    addSection(
        "9. Application of Learning",
        [
            [
                "Expected application of knowledge, skills, or competencies",
                firstAvailable(
                    record.expectedApplication,
                    getRawFieldValue(
                        raw,
                        "How do you expect to apply"
                    )
                )
            ],
            [
                "Expected improvements in work performance or outputs",
                firstAvailable(
                    record.expectedImprovement,
                    getRawFieldValue(
                        raw,
                        "What improvements in your work performance"
                    )
                )
            ],
            [
                "Organizational support needed to apply learning",
                firstAvailable(
                    record.organizationalSupport,
                    getRawFieldValue(
                        raw,
                        "What organizational support"
                    )
                )
            ]
        ]
    );


    /* ======================================================
       PART 10
    ====================================================== */

    addSection(
        "10. Expertise and Knowledge Sharing",
        [
            [
                "Knowledge, skills, or expertise that can be shared",
                firstAvailable(
                    record.knowledgeToShare,
                    getRawFieldValue(
                        raw,
                        "knowledge to share"
                    )
                )
            ],
            [
                "Willingness to serve as resource person, mentor, coach, or facilitator",
                firstAvailable(
                    record.willingToFacilitate,
                    getRawFieldValue(
                        raw,
                        "Would you be willing to serve"
                    )
                )
            ],
            [
                "Topics or areas where expertise can be shared",
                firstAvailable(
                    record.facilitationTopics,
                    getRawFieldValue(
                        raw,
                        "If yes, please indicate the topic"
                    )
                )
            ]
        ]
    );


    /* ======================================================
       PART 11
    ====================================================== */

    addSection(
        "11. L&D Priorities and Comments",
        [
            [
                "Recommended Learning and Development Programs",
                firstAvailable(
                    record.recommendedPrograms,
                    getRawFieldValue(
                        raw,
                        "What specific learning and development programs"
                    )
                )
            ],
            [
                "Organization Comments / Recommendations",
                record.organizationComments
            ],
            [
                "Employee L&D Needs Comments",
                record.needsComments
            ]
        ]
    );


    /* ======================================================
       PARTS 12–14
       ------------------------------------------------------
       Do NOT invent questions.

       Remaining answered raw fields are grouped into
       the remaining current LNA portions. This ensures
       no employee answer disappears simply because a
       question header was not included in an earlier
       mapping.
    ====================================================== */

    const remainingRows =
        Object.keys(raw)
            .filter(function(key) {

                if (usedKeys.has(key)) {
                    return false;
                }

                if (isMetadataKey(key)) {
                    return false;
                }

                if (!hasValue(raw[key])) {
                    return false;
                }

                if (
                    normalizeHeader(key)
                        .includes("DATA PRIVACY") ||
                    normalizeHeader(key)
                        .includes("DATA RIVACY")
                ) {
                    return false;
                }

                return true;

            })
            .map(function(key) {

                return [
                    key,
                    raw[key]
                ];

            });

    /*
     * The remaining questions are still actual employee
     * responses. We do not rename the question itself.
     *
     * Split into up to three sections so the current
     * 14-section LNA remains represented without
     * inventing answers.
     */

        if (!html.trim()) {

        html = `
            <div class="empty-state">
                No LNA responses available.
            </div>
        `;
    }

    container.innerHTML = html;
}


/* ==========================================================
   LNA SECTION RENDERER
========================================================== */

function renderLNAQuestionSection(title, rows) {

    const validRows =
        (rows || []).filter(function(row) {

            return (
                row &&
                row.length >= 2 &&
                hasValue(row[1])
            );

        });

    if (!validRows.length) {
        return "";
    }

    return `
        <div class="lna-readonly-section">

            <div class="lna-readonly-section-header">

                <div>
                    <div class="lna-readonly-section-title">
                        ${escapeHTML(title)}
                    </div>
                </div>

                <span class="lna-readonly-badge">
                    READ-ONLY
                </span>

            </div>

            <div class="lna-question-list">

                ${validRows.map(function(row) {

                    return `
                        <div class="lna-question-row">

                            <div class="lna-question">
                                ${escapeHTML(row[0])}
                            </div>

                            <div class="lna-answer">
                                ${formatLNAValue(row[1])}
                            </div>

                        </div>
                    `;

                }).join("")}

            </div>

        </div>
    `;
}


/* ==========================================================
   TECHNICAL COMPETENCY SECTION
========================================================== */

function renderTechnicalRowsSection(title, rows) {

    if (!rows.length) {
        return "";
    }

    return `
        <div class="lna-readonly-section">

            <div class="lna-readonly-section-header">

                <div>
                    <div class="lna-readonly-section-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="lna-readonly-section-subtitle">
                        Employee-submitted competency ratings
                    </div>
                </div>

                <span class="lna-readonly-badge">
                    READ-ONLY
                </span>

            </div>

            <div class="lna-question-list">

                ${rows.map(function(row) {

                    return `
                        <div class="lna-question-row">

                            <div class="lna-question">
                                ${escapeHTML(row[0])}
                            </div>

                            <div class="lna-answer">
                                ${getCompetencyRatingBadge(row[1])}
                            </div>

                        </div>
                    `;

                }).join("")}

            </div>

        </div>
    `;
}


/* ==========================================================
   COMPETENCY GAP ANALYSIS
========================================================== */

function renderCompetencyGapAnalysis(record) {

    const container =
        document.getElementById("lnaDetails");

    if (!container) {
        return;
    }

    const raw =
        record?.raw || {};

    const rows = [];

    LNA_COMPETENCY_FIELDS.forEach(function(field) {

        const value =
            getRawFieldValue(raw, field);

        if (hasValue(value)) {

            rows.push({
                competency: field,
                employee: value
            });
        }
    });


    Object.keys(raw).forEach(function(key) {

        const value = raw[key];

        if (
            !hasValue(value) ||
            !isCompetencyRating(value) ||
            isMetadataKey(key)
        ) {
            return;
        }

        if (
            LNA_COMPETENCY_FIELDS.some(function(field) {

                return normalizeHeader(field) ===
                    normalizeHeader(key);

            })
        ) {
            return;
        }

        rows.push({
            competency: key,
            employee: value
        });
    });


    const summary = [

        [
            "Development Priority",
            firstAvailable(
                record.developmentPriority,
                getRawFieldValue(
                    raw,
                    "Which competencies do you consider your top development priorities?"
                )
            )
        ],

        [
            "Current Competency / Development Need",
            firstAvailable(
                record.currentCompetencies,
                getRawFieldValue(
                    raw,
                    "Which competency or competencies do you most urgently need to develop"
                )
            )
        ],

        [
            "Future Competency Need",
            firstAvailable(
                record.futureNeeds,
                getRawFieldValue(
                    raw,
                    "What competencies or areas of knowledge do you anticipate needing in the next 1–3 years"
                )
            )
        ],

        [
            "Emerging Skills / Technologies",
            firstAvailable(
                record.emergingSkills,
                getRawFieldValue(
                    raw,
                    "What emerging skills, technologies, tools, or practices do you think will become important"
                )
            )
        ],

        [
            "Functional Area",
            firstAvailable(
                record.functionalArea,
                getRawFieldValue(
                    raw,
                    "Select your functional area."
                )
            )
        ],

        [
            "Proposed Learning Intervention",
            firstAvailable(
                record.proposedLearning,
                getRawFieldValue(
                    raw,
                    "What specific learning, training, seminar, workshop, certification"
                )
            )
        ]

    ].filter(function(row) {

        return hasValue(row[1]);

    });


    let html = `
        <div class="gap-analysis-header">

            <div>
                <div class="gap-analysis-title">
                    Competency Gap Analysis
                </div>

                <div class="gap-analysis-subtitle">
                    Employee-submitted competency information
                    for Supervisor Assessment and validation.
                </div>
            </div>

            <span class="lna-readonly-badge">
                FOR VALIDATION
            </span>

        </div>
    `;


    summary.forEach(function(row) {

        html += `
            <div class="gap-analysis-card">

                <div class="gap-analysis-label">
                    ${escapeHTML(row[0])}
                </div>

                <div class="gap-analysis-value">
                    ${formatLNAValue(row[1])}
                </div>

            </div>
        `;

    });


    if (rows.length) {

        html += `
            <div class="gap-analysis-table-section">

                <div class="gap-analysis-section-title">
                    Employee Competency Ratings
                </div>

                <div class="gap-analysis-table-wrap">

                    <table class="gap-analysis-table">

                        <thead>
                            <tr>
                                <th>Competency</th>
                                <th>Employee Self-Rating</th>
                                <th>Supervisor Rating</th>
                                <th>Required</th>
                                <th>Gap / Priority</th>
                            </tr>
                        </thead>

                        <tbody>

                            ${rows.map(function(row) {

                                return `
                                    <tr>

                                        <td>
                                            <strong>
                                                ${escapeHTML(row.competency)}
                                            </strong>
                                        </td>

                                        <td>
                                            ${getCompetencyRatingBadge(
                                                row.employee
                                            )}
                                        </td>

                                        <td>
                                            <span class="pending-rating">
                                                To be assessed
                                            </span>
                                        </td>

                                        <td>
                                            Master Matrix
                                        </td>

                                        <td>
                                            ${getGapPriorityBadge(
                                                row.employee
                                            )}
                                        </td>

                                    </tr>
                                `;

                            }).join("")}

                        </tbody>

                    </table>

                </div>

            </div>
        `;
    }


    html += `
        <div class="gap-analysis-note">

            <strong>
                Supervisor Action
            </strong>

            <span>
                Complete the Supervisor Assessment and
                competency ratings before making the
                final LNA validation decision.
            </span>

        </div>
    `;


    container.innerHTML = html;
}


/* ==========================================================
   SUPERVISOR ACTIONS
========================================================== */

function renderSupervisorActions(
    record,
    showDecisionButtons
) {

    const container =
        document.getElementById(
            "supervisorLNAActions"
        );

    if (!container) {
        return;
    }


    if (!showDecisionButtons) {

        container.innerHTML = `
            <div class="supervisor-readonly-panel">

                <div class="supervisor-readonly-icon">
                    👁
                </div>

                <div class="supervisor-readonly-content">

                    <strong>
                        Read-Only Personnel LNA
                    </strong>

                    <span>
                        This is the employee's submitted LNA.
                        No editing is permitted in this view.
                    </span>

                </div>

            </div>
        `;

        return;
    }


    const status =
        normalizeStatus(record.status);


    if (status === "for completion") {

        container.innerHTML = `
            <div class="supervisor-readonly-panel warning">

                <div class="supervisor-readonly-icon">
                    ⚠
                </div>

                <div class="supervisor-readonly-content">

                    <strong>
                        LNA For Completion
                    </strong>

                    <span>
                        The employee has not completed the
                        required LNA information.
                    </span>

                </div>

            </div>
        `;

        return;
    }


    if (
        status === "validated" ||
        status === "approved"
    ) {

        container.innerHTML = `
            <div class="supervisor-readonly-panel success">

                <div class="supervisor-readonly-icon">
                    ✓
                </div>

                <div class="supervisor-readonly-content">

                    <strong>
                        LNA Validated
                    </strong>

                    <span>
                        This LNA has already been validated
                        by the supervisor.
                    </span>

                </div>

            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="supervisor-review-panel">

            <div class="supervisor-review-heading">

                <strong>
                    Supervisor Decision
                </strong>

                <span>
                    Review the competency information and
                    complete the required Supervisor Assessment.
                </span>

            </div>

            <div class="supervisor-lna-actions">

                <button
                    type="button"
                    class="btn btn-success supervisor-action-btn"
                    onclick="supervisorValidateLNA('${escapeAttribute(record.employeeID)}')"
                >
                    ✓ Validate LNA
                </button>

                <button
                    type="button"
                    class="btn btn-warning supervisor-action-btn"
                    onclick="supervisorReturnLNA('${escapeAttribute(record.employeeID)}')"
                >
                    ↩ Return for Completion / Revision
                </button>

            </div>

        </div>
    `;
}


/* ==========================================================
   VALIDATE LNA
========================================================== */

async function supervisorValidateLNA(employeeID) {

    if (!employeeID) {
        return;
    }

    if (
        !window.confirm(
            "Are you sure you want to validate this LNA?"
        )
    ) {
        return;
    }

    try {

        showSupervisorLoading(true);

        const response =
            await API.post({
                action: "supervisorValidateLNA",
                employeeID: employeeID
            });

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Unable to validate LNA."
            );
        }

        showSupervisorMessage(
            "LNA successfully validated.",
            "success"
        );

        await loadSupervisorPersonnel();

        if (
            SUPERVISOR.currentView ===
            "validation"
        ) {
            renderValidationView();
        }

        await openLNA(employeeID);

    } catch (error) {

        console.error(
            "supervisorValidateLNA:",
            error
        );

        showSupervisorMessage(
            error.message ||
            "Unable to validate LNA.",
            "error"
        );

    } finally {

        showSupervisorLoading(false);
    }
}


/* ==========================================================
   RETURN LNA
========================================================== */

async function supervisorReturnLNA(employeeID) {

    if (!employeeID) {
        return;
    }

    const reason =
        window.prompt(
            "Please provide the reason for returning this LNA for completion/revision:"
        );

    if (reason === null) {
        return;
    }

    if (!String(reason).trim()) {

        alert(
            "Revision reason is required."
        );

        return;
    }

    try {

        showSupervisorLoading(true);

        const response =
            await API.post({
                action: "supervisorReturnLNA",
                employeeID: employeeID,
                reason: String(reason).trim()
            });

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Unable to return LNA."
            );
        }

        showSupervisorMessage(
            "LNA returned for completion/revision.",
            "success"
        );

        await loadSupervisorPersonnel();

        if (
            SUPERVISOR.currentView ===
            "validation"
        ) {
            renderValidationView();
        }

        await openLNA(employeeID);

    } catch (error) {

        console.error(
            "supervisorReturnLNA:",
            error
        );

        showSupervisorMessage(
            error.message ||
            "Unable to return LNA.",
            "error"
        );

    } finally {

        showSupervisorLoading(false);
    }
}


/* ==========================================================
   TRAINING HISTORY
========================================================== */

async function loadSupervisorTrainingHistory(employeeID) {

    const container =
        document.getElementById(
            "trainingHistory"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await API.post({
                action: "getTrainingRecords",
                employeeID: employeeID
            });

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Unable to load training history."
            );
        }

        const records =
            Array.isArray(response.records)
                ? response.records
                : [];

        if (!records.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No training records found.
                </div>
            `;

            return;
        }

        container.innerHTML = `
            <div class="training-history-table-wrap">

                <table class="data-table">

                    <thead>
                        <tr>
                            <th>Training</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Hours</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${records.map(function(record) {

                            return `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            record.trainingTitle ||
                                            record.title ||
                                            record.TRAINING_TITLE ||
                                            "-"
                                        )}
                                    </td>

                                    <td>
                                        ${formatDate(
                                            record.startDate ||
                                            record.START_DATE
                                        )}
                                    </td>

                                    <td>
                                        ${formatDate(
                                            record.endDate ||
                                            record.END_DATE
                                        )}
                                    </td>

                                    <td>
                                        ${formatNumber(
                                            record.totalHours ||
                                            record.hours ||
                                            record.TOTAL_HOURS ||
                                            0
                                        )}
                                    </td>

                                </tr>
                            `;

                        }).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        console.error(
            "loadSupervisorTrainingHistory:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">

                Unable to load training history.

                <br>

                <small>
                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}
                </small>

            </div>
        `;
    }
}


/* ==========================================================
   EMPTY LNA
========================================================== */

function showLNAEmptyState(employeeID) {

    setHTML(
        "lnaDetails",
        `
            <div class="empty-state">

                No completed LNA submission was found
                for Employee ID

                <strong>
                    ${escapeHTML(employeeID)}
                </strong>.

                <br><br>

                The employee still needs to complete
                and submit the LNA.

            </div>
        `
    );

    setHTML(
        "supervisorLNAActions",
        `
            <div class="supervisor-lna-action-panel">

                <div class="supervisor-readonly-notice">

                    <strong>
                        For Completion
                    </strong>

                    <span>
                        No LNA submission is currently available
                        for supervisor validation.
                    </span>

                </div>

            </div>
        `
    );
}


/* ==========================================================
   VALIDATION LIST
========================================================== */

function renderValidationView() {

    const container =
        document.getElementById(
            "validationPersonnelContainer"
        );

    if (!container) {
        return;
    }

    const records =
        SUPERVISOR.personnel.filter(function(employee) {

            const status =
                normalizeStatus(
                    employee.lnaStatus
                );

            return (
                status === "for review" ||
                status === "for revision"
            );
        });

    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                No personnel LNA submissions are
                currently awaiting validation.
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <table class="data-table">

            <thead>
                <tr>
                    <th>Employee ID</th>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>LNA Status</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>

                ${records.map(function(employee) {

                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    employee.employeeID || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    employee.name || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    employee.position || "-"
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
                                    onclick="openValidationReview('${escapeAttribute(employee.employeeID)}')"
                                >
                                    Review LNA
                                </button>

                            </td>

                        </tr>
                    `;

                }).join("")}

            </tbody>

        </table>
    `;
}


async function openValidationReview(employeeID) {

    if (!employeeID) {
        return;
    }

    SUPERVISOR.currentView =
        "validation";

    await openLNA(employeeID);
}


/* ==========================================================
   INTERVENTIONS
========================================================== */

function renderInterventionsView() {

    const container =
        document.getElementById(
            "interventionsContent"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">

            <h3>
                Learning Interventions
            </h3>

            <p>
                Validated competency gaps and recommended
                learning interventions will appear here.
            </p>

        </div>
    `;
}


/* ==========================================================
   OWN EMPLOYEE SUMMARY
========================================================== */

async function loadOwnEmployeeSummary() {

    try {

        const trainingResponse =
            await API.post({
                action: "getTrainingRecords",
                employeeID: SUPERVISOR.employeeID
            });

        const records =
            trainingResponse?.success === true &&
            Array.isArray(trainingResponse.records)
                ? trainingResponse.records
                : [];

        const totalHours =
            records.reduce(function(total, record) {

                return total +
                    Number(
                        record.totalHours ||
                        record.hours ||
                        record.TOTAL_HOURS ||
                        0
                    );

            }, 0);

        setText(
            "myTrainingCount",
            records.length
        );

        setText(
            "myLearningHours",
            formatNumber(totalHours)
        );

        const certificateCount =
            records.filter(function(record) {

                return hasValue(
                    record.certificate ||
                    record.certificateProof ||
                    record.certificateFile ||
                    record.CERTIFICATE ||
                    record.CERTIFICATE_PROOF ||
                    record["CERTIFICATE / PROOF OF TRAINING"]
                );

            }).length;

        setText(
            "myCertificateCount",
            certificateCount
        );


        const lnaResponse =
            await API.post({
                action: "getLNAByEmployeeID",
                employeeID: SUPERVISOR.employeeID
            });

        setHTML(
            "myLNAStatus",
            getStatusBadge(
                lnaResponse?.success === true &&
                lnaResponse?.submitted === true &&
                lnaResponse?.record
                    ? lnaResponse.record.status
                    : "Not Submitted"
            )
        );

    } catch (error) {

        console.warn(
            "loadOwnEmployeeSummary:",
            error
        );

        setText("myTrainingCount", "0");
        setText("myLearningHours", "0");
        setText("myCertificateCount", "0");

        setHTML(
            "myLNAStatus",
            getStatusBadge("Unavailable")
        );
    }
}


/* ==========================================================
   HELPERS
========================================================== */

function findPersonnel(employeeID) {

    return SUPERVISOR.personnel.find(
        function(employee) {

            return String(employee.employeeID) ===
                String(employeeID);

        }
    );
}


function findRawKey(raw, target) {

    if (!raw || typeof raw !== "object") {
        return "";
    }

    const targetNormalized =
        normalizeHeader(target);

    const keys =
        Object.keys(raw);

    const exact =
        keys.find(function(key) {

            return normalizeHeader(key) ===
                targetNormalized;

        });

    if (exact) {
        return exact;
    }

    const partial =
        keys.find(function(key) {

            const current =
                normalizeHeader(key);

            return (
                current.includes(targetNormalized) ||
                targetNormalized.includes(current)
            );

        });

    return partial || "";
}


function getRawFieldValue(raw, target) {

    const key =
        findRawKey(raw, target);

    return key
        ? raw[key]
        : "";
}


function firstAvailable() {

    for (
        let i = 0;
        i < arguments.length;
        i++
    ) {

        if (hasValue(arguments[i])) {
            return arguments[i];
        }
    }

    return "";
}


function isMetadataKey(key) {

    const normalized =
        normalizeHeader(key);

    return [
        "TIMESTAMP",
        "EMAIL ADDRESS",
        "EMPLOYEE ID",
        "NAME",
        "POSITION",
        "PLACE OF ASSIGNMENT"
    ].includes(normalized);
}


function isCompetencyRating(value) {

    return /^\s*[1-5]\s*-\s*(Awareness|Developing|Proficient|Advanced|Expert)\s*$/i
        .test(String(value || ""));
}


function getCompetencyRatingBadge(value) {

    if (!hasValue(value)) {
        return "-";
    }

    const rating =
        getRatingNumber(value);

    let className =
        "competency-rating-badge";

    if (rating === 1) {
        className += " rating-awareness";
    } else if (rating === 2) {
        className += " rating-developing";
    } else if (rating === 3) {
        className += " rating-proficient";
    } else if (rating === 4) {
        className += " rating-advanced";
    } else if (rating === 5) {
        className += " rating-expert";
    }

    return `
        <span class="${className}">
            ${escapeHTML(value)}
        </span>
    `;
}


function getRatingNumber(value) {

    if (!hasValue(value)) {
        return null;
    }

    const match =
        String(value).match(
            /^\s*([1-5])\s*-/
        );

    return match
        ? Number(match[1])
        : null;
}


function getGapPriorityBadge(value) {

    const rating =
        getRatingNumber(value);

    if (rating === null) {

        return `
            <span class="gap-priority priority-review">
                Review
            </span>
        `;
    }

    if (rating <= 2) {

        return `
            <span class="gap-priority priority-high">
                High Priority
            </span>
        `;
    }

    if (rating === 3) {

        return `
            <span class="gap-priority priority-development">
                Development
            </span>
        `;
    }

    return `
        <span class="gap-priority priority-monitor">
            Monitor
        </span>
    `;
}


function splitIntoThreeParts(rows) {

    if (!rows.length) {
        return [[], [], []];
    }

    const size =
        Math.ceil(rows.length / 3);

    return [
        rows.slice(0, size),
        rows.slice(size, size * 2),
        rows.slice(size * 2)
    ];
}


function normalizeHeader(value) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[\u2013\u2014]/g, "-")
        .toUpperCase();
}


function normalizeStatus(status) {

    return String(status || "")
        .trim()
        .toLowerCase();
}


function getStatusBadge(status) {

    const normalized =
        normalizeStatus(status);

    let className =
        "status-badge";

    if (normalized === "for completion") {

        className +=
            " status-warning";

    } else if (normalized === "for review") {

        className +=
            " status-info";

    } else if (normalized === "for revision") {

        className +=
            " status-danger";

    } else if (
        normalized === "validated" ||
        normalized === "approved"
    ) {

        className +=
            " status-success";

    } else {

        className +=
            " status-muted";
    }

    return `
        <span class="${className}">
            ${escapeHTML(status || "No LNA")}
        </span>
    `;
}


function formatLNAValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    if (Array.isArray(value)) {

        return value
            .map(function(item) {

                return escapeHTML(
                    String(item)
                );

            })
            .join(", ");
    }

    if (typeof value === "object") {

        try {

            return escapeHTML(
                JSON.stringify(value)
            );

        } catch (error) {

            return "-";
        }
    }

    return escapeHTML(
        String(value)
    ).replace(
        /\r?\n/g,
        "<br>"
    );
}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {

        return escapeHTML(
            String(value)
        );
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


function formatNumber(value) {

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return "0";
    }

    return number.toLocaleString(
        "en-PH",
        {
            maximumFractionDigits: 2
        }
    );
}


function hasValue(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return false;
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return String(value).trim() !== "";
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);
}


function setHTML(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.innerHTML =
        value || "";
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* ==========================================================
   LOADING / MESSAGE
========================================================== */

function showSupervisorLoading(visible) {

    const element =
        document.getElementById(
            "supervisorLoading"
        );

    if (!element) {
        return;
    }

    element.style.display =
        visible ? "" : "none";
}


function showSupervisorMessage(message, type) {

    const element =
        document.getElementById(
            "supervisorMessage"
        );

    if (!element) {

        if (type === "error") {
            console.error(message);
        } else {
            console.log(message);
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
        message ? "" : "none";

    if (message) {

        setTimeout(function() {

            element.style.display =
                "none";

        }, 5000);
    }
}


/* ==========================================================
   LOGOUT
========================================================== */

function logoutSupervisor() {

    try {

        if (
            typeof Session !== "undefined" &&
            typeof Session.clear === "function"
        ) {
            Session.clear();
        }

    } catch (error) {

        console.warn(
            "Session clear error:",
            error
        );
    }

    try {
        localStorage.removeItem("ldimsUser");
    } catch (error) {}

    window.location.href =
        "../index.html";
}


/* ==========================================================
   GLOBAL FUNCTIONS
========================================================== */

window.openLNA =
    openLNA;

window.openValidationReview =
    openValidationReview;

window.openLNAModal =
    openLNAModal;

window.closeLNAModal =
    closeLNAModal;

window.supervisorValidateLNA =
    supervisorValidateLNA;

window.supervisorReturnLNA =
    supervisorReturnLNA;

window.logoutSupervisor =
    logoutSupervisor;

window.navigateToView =
    navigateToView;