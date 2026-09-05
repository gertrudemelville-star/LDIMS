/* ==========================================================
   LDIMS ADMIN
   LNA MANAGEMENT
   Learning Needs Assessment Administration
========================================================== */

"use strict";


/* ==========================================================
   STATE
========================================================== */

let lnaSubmissions = [];

let filteredLNASubmissions = [];


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeLNAManagement();

    }
);


/* ==========================================================
   INITIALIZE LNA MANAGEMENT
========================================================== */

async function initializeLNAManagement() {

    setupLNAEventListeners();

    await loadLNASubmissions();

}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

function setupLNAEventListeners() {

    const refreshButton =
        document.getElementById(
            "refreshLNAButton"
        );


    const searchInput =
        document.getElementById(
            "lnaSearch"
        );


    const priorityFilter =
        document.getElementById(
            "lnaPriorityFilter"
        );


    const functionalAreaFilter =
        document.getElementById(
            "lnaFunctionalAreaFilter"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadLNASubmissions
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyLNAFilters
        );

    }


    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            applyLNAFilters
        );

    }


    if (functionalAreaFilter) {

        functionalAreaFilter.addEventListener(
            "change",
            applyLNAFilters
        );

    }

}


/* ==========================================================
   LOAD LNA SUBMISSIONS
========================================================== */

async function loadLNASubmissions() {

    showLNALoading();

    hideLNAError();

    try {

        /*
         * LNA Management needs ALL submissions.
         *
         * We first try the dedicated admin action.
         */

        const result =
            await API.post({

                action:
                    "getAllLNASubmissions"

            });


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to load LNA submissions."
            );

        }


        lnaSubmissions =
            result.submissions || [];


        filteredLNASubmissions =
            [...lnaSubmissions];


        populateLNAFilters(
            lnaSubmissions
        );


        updateLNASummary(
            lnaSubmissions
        );


        renderLNASubmissions(
            filteredLNASubmissions
        );


    } catch (error) {

        console.error(
            "LNA MANAGEMENT LOAD ERROR:",
            error
        );


        showLNAError(
            error.message ||
            "Unable to load LNA submissions."
        );

    }

}


/* ==========================================================
   FILTERS
========================================================== */

function applyLNAFilters() {

    const searchInput =
        document.getElementById(
            "lnaSearch"
        );


    const priorityFilter =
        document.getElementById(
            "lnaPriorityFilter"
        );


    const functionalAreaFilter =
        document.getElementById(
            "lnaFunctionalAreaFilter"
        );


    const searchTerm =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const priority =
        String(
            priorityFilter?.value || ""
        )
        .trim()
        .toLowerCase();


    const functionalArea =
        String(
            functionalAreaFilter?.value || ""
        )
        .trim()
        .toLowerCase();


    filteredLNASubmissions =
        lnaSubmissions.filter(
            submission => {

                const searchableText = [

                    submission["EMPLOYEE ID"],

                    submission["NAME"],

                    submission["POSITION"],

                    submission["PLACE OF ASSIGNMENT"],

                    submission[
                        "Which competencies do you consider your top development priorities?"
                    ],

                    submission[
                        "Which competency or competencies do you most urgently need to develop to improve your current performance"
                    ],

                    submission[
                        "What specific learning, training, seminar, workshop, certification, or other development intervention would best support these future needs?"
                    ]

                ]
                .join(" ")
                .toLowerCase();


                const submissionPriority =
                    String(
                        submission[
                            "Which competencies do you consider your top development priorities?"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const submissionFunctionalArea =
                    String(
                        submission[
                            "Select your functional area."
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const matchesSearch =
                    !searchTerm ||
                    searchableText.includes(
                        searchTerm
                    );


                const matchesPriority =
                    !priority ||
                    submissionPriority ===
                    priority;


                const matchesFunctionalArea =
                    !functionalArea ||
                    submissionFunctionalArea ===
                    functionalArea;


                return (
                    matchesSearch &&
                    matchesPriority &&
                    matchesFunctionalArea
                );

            }
        );


    renderLNASubmissions(
        filteredLNASubmissions
    );

}


/* ==========================================================
   POPULATE FILTERS
========================================================== */

function populateLNAFilters(
    submissions
) {

    const priorityFilter =
        document.getElementById(
            "lnaPriorityFilter"
        );


    const functionalAreaFilter =
        document.getElementById(
            "lnaFunctionalAreaFilter"
        );


    if (priorityFilter) {

        const priorities =
            uniqueValues(
                submissions,
                "Which competencies do you consider your top development priorities?"
            );


        const currentValue =
            priorityFilter.value;


        priorityFilter.innerHTML =
            '<option value="">All Priorities</option>';


        priorities.forEach(
            priority => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    priority;


                option.textContent =
                    priority;


                priorityFilter.appendChild(
                    option
                );

            }
        );


        priorityFilter.value =
            currentValue;

    }


    if (functionalAreaFilter) {

        const areas =
            uniqueValues(
                submissions,
                "Select your functional area."
            );


        const currentValue =
            functionalAreaFilter.value;


        functionalAreaFilter.innerHTML =
            '<option value="">All Functional Areas</option>';


        areas.forEach(
            area => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    area;


                option.textContent =
                    area;


                functionalAreaFilter.appendChild(
                    option
                );

            }
        );


        functionalAreaFilter.value =
            currentValue;

    }

}


/* ==========================================================
   UNIQUE VALUES
========================================================== */

function uniqueValues(
    submissions,
    field
) {

    const values =
        submissions
            .map(
                submission =>
                    String(
                        submission[field] || ""
                    ).trim()
            )
            .filter(
                value =>
                    value !== ""
            );


    return [
        ...new Set(values)
    ]
    .sort();

}


/* ==========================================================
   UPDATE SUMMARY
========================================================== */

function updateLNASummary(
    submissions
) {

    const total =
        submissions.length;


    let highPriority = 0;

    let mediumPriority = 0;

    let lowPriority = 0;


    submissions.forEach(
        submission => {

            const priority =
                String(
                    submission[
                        "Which competencies do you consider your top development priorities?"
                    ] || ""
                )
                .trim()
                .toLowerCase();


            if (
                priority === "high"
            ) {

                highPriority++;

            } else if (
                priority === "medium"
            ) {

                mediumPriority++;

            } else if (
                priority === "low"
            ) {

                lowPriority++;

            }

        }
    );


    setLNAValue(
        "totalLNASubmissions",
        total
    );


    setLNAValue(
        "highPriorityLNA",
        highPriority
    );


    setLNAValue(
        "mediumPriorityLNA",
        mediumPriority
    );


    setLNAValue(
        "lowPriorityLNA",
        lowPriority
    );

}


/* ==========================================================
   RENDER LNA SUBMISSIONS
========================================================== */

function renderLNASubmissions(
    submissions
) {

    const loadingState =
        document.getElementById(
            "lnaLoadingState"
        );


    const emptyState =
        document.getElementById(
            "lnaEmptyState"
        );


    const tableContainer =
        document.getElementById(
            "lnaTableContainer"
        );


    const tableBody =
        document.getElementById(
            "lnaTableBody"
        );


    if (loadingState) {

        loadingState.classList.add(
            "d-none"
        );

    }


    if (tableBody) {

        tableBody.innerHTML = "";

    }


    if (
        !submissions ||
        submissions.length === 0
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "d-none"
            );

        }


        if (tableContainer) {

            tableContainer.classList.add(
                "d-none"
            );

        }


        return;

    }


    if (emptyState) {

        emptyState.classList.add(
            "d-none"
        );

    }


    if (tableContainer) {

        tableContainer.classList.remove(
            "d-none"
        );

    }


    submissions.forEach(
        (submission, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            const timestamp =
                formatLNAValue(
                    submission.Timestamp
                );


            const employeeID =
                formatLNAValue(
                    submission["EMPLOYEE ID"]
                );


            const name =
                formatLNAValue(
                    submission.NAME
                );


            const position =
                formatLNAValue(
                    submission.POSITION
                );


            const assignment =
                formatLNAValue(
                    submission[
                        "PLACE OF ASSIGNMENT"
                    ]
                );


            const priority =
                formatLNAValue(
                    submission[
                        "Which competencies do you consider your top development priorities?"
                    ]
                );


            const functionalArea =
                formatLNAValue(
                    submission[
                        "Select your functional area."
                    ]
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(employeeID)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(name)}
                </td>

                <td>
                    ${escapeHTML(position)}
                </td>

                <td>
                    ${escapeHTML(assignment)}
                </td>

                <td>
                    ${renderPriorityBadge(priority)}
                </td>

                <td>
                    ${escapeHTML(functionalArea)}
                </td>

                <td class="text-end">

                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        data-action="view-lna">

                        <i class="bi bi-eye me-1"></i>
                        View

                    </button>

                </td>

            `;


            const viewButton =
                row.querySelector(
                    '[data-action="view-lna"]'
                );


            if (viewButton) {

                viewButton.addEventListener(
                    "click",
                    () => {

                        showLNADetails(
                            submission
                        );

                    }
                );

            }


            if (tableBody) {

                tableBody.appendChild(
                    row
                );

            }

        }
    );

}


/* ==========================================================
   VIEW LNA DETAILS
========================================================== */

function showLNADetails(
    submission
) {

    const modalElement =
        document.getElementById(
            "lnaDetailsModal"
        );


    const modalBody =
        document.getElementById(
            "lnaDetailsBody"
        );


    if (!modalElement || !modalBody) {

        console.warn(
            "LNA details modal not found."
        );

        return;

    }


    modalBody.innerHTML = "";


    Object.keys(submission).forEach(
        key => {

            const value =
                submission[key];


            /*
             * Hide completely empty fields
             * to keep the modal readable.
             */

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {

                return;

            }


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "mb-3";


            const label =
                document.createElement(
                    "div"
                );


            label.className =
                "fw-semibold text-muted small";


            label.textContent =
                key;


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "mt-1";


            content.textContent =
                value;


            wrapper.appendChild(
                label
            );


            wrapper.appendChild(
                content
            );


            modalBody.appendChild(
                wrapper
            );

        }
    );


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


/* ==========================================================
   PRIORITY BADGE
========================================================== */

function renderPriorityBadge(
    priority
) {

    const value =
        String(
            priority || ""
        )
        .trim();


    const normalized =
        value.toLowerCase();


    if (
        normalized === "high"
    ) {

        return `
            <span class="badge text-bg-danger">
                High
            </span>
        `;

    }


    if (
        normalized === "medium"
    ) {

        return `
            <span class="badge text-bg-warning">
                Medium
            </span>
        `;

    }


    if (
        normalized === "low"
    ) {

        return `
            <span class="badge text-bg-success">
                Low
            </span>
        `;

    }


    return `
        <span class="badge text-bg-secondary">
            ${escapeHTML(value || "—")}
        </span>
    `;

}


/* ==========================================================
   FORMAT VALUE
========================================================== */

function formatLNAValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";

    }


    const text =
        String(value).trim();


    return text || "—";

}


/* ==========================================================
   LOADING
========================================================== */

function showLNALoading() {

    const loading =
        document.getElementById(
            "lnaLoadingState"
        );


    const empty =
        document.getElementById(
            "lnaEmptyState"
        );


    const table =
        document.getElementById(
            "lnaTableContainer"
        );


    if (loading) {

        loading.classList.remove(
            "d-none"
        );

    }


    if (empty) {

        empty.classList.add(
            "d-none"
        );

    }


    if (table) {

        table.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   ERROR
========================================================== */

function hideLNAError() {

    const error =
        document.getElementById(
            "lnaErrorState"
        );


    if (error) {

        error.classList.add(
            "d-none"
        );

    }

}


function showLNAError(
    message
) {

    const error =
        document.getElementById(
            "lnaErrorState"
        );


    const messageElement =
        document.getElementById(
            "lnaErrorMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    if (error) {

        error.classList.remove(
            "d-none"
        );

    }


    const loading =
        document.getElementById(
            "lnaLoadingState"
        );


    if (loading) {

        loading.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   SET TEXT
========================================================== */

function setLNAValue(
    elementID,
    value
) {

    const element =
        document.getElementById(
            elementID
        );


    if (element) {

        element.textContent =
            value ?? 0;

    }

}


/* ==========================================================
   HTML ESCAPE
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