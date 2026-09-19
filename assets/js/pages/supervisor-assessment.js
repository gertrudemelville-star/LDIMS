"use strict";

/* ==========================================================
   LDIMS - SUPERVISOR ASSESSMENT
   ----------------------------------------------------------
   Supervisor Assessment linked by Employee ID.

   S1 - Development Priorities
   S2 - Observed Development Need
   S3 - Recommended Learning Intervention
   S4 - Broader / Complex Responsibilities
   S5 - Expertise / Knowledge Sharing
   S6 - Knowledge Sharing Role
   S7 - Supervisor Comments

   Competency Rating:
   1 - Awareness
   2 - Developing
   3 - Proficient
   4 - Advanced
   5 - Expert
   N/A
========================================================== */


/* ==========================================================
   STATE
========================================================== */

window.SUPERVISOR_ASSESSMENT = {

    employeeID: "",
    supervisorID: "",
    supervisorName: "",

    assessment: null,

    competencyRatings: {}

};


/* ==========================================================
   OPEN SUPERVISOR ASSESSMENT
========================================================== */

async function openSupervisorAssessment(
    employeeID
) {

    if (!employeeID) {

        alert(
            "Employee ID is required."
        );

        return;

    }


    const sessionUser =
        typeof Session !== "undefined" &&
        typeof Session.get === "function"
            ? Session.get()
            : null;


    let supervisorID = "";

    let supervisorName = "";


    /*
     * Prefer existing Supervisor module state.
     */

    if (
        typeof SUPERVISOR !== "undefined" &&
        SUPERVISOR
    ) {

        supervisorID =
            SUPERVISOR.employeeID ||
            "";

        supervisorName =
            SUPERVISOR.name ||
            SUPERVISOR.fullname ||
            SUPERVISOR.fullName ||
            "";

    }


    /*
     * Session fallback.
     */

    if (!supervisorID && sessionUser) {

        supervisorID =
            sessionUser.employeeID ||
            sessionUser.EmployeeID ||
            "";

    }


    if (!supervisorName && sessionUser) {

        supervisorName =
            sessionUser.fullname ||
            sessionUser.fullName ||
            sessionUser.name ||
            "";

    }


    if (!supervisorID) {

        alert(
            "Supervisor Employee ID could not be determined."
        );

        return;

    }


    window.SUPERVISOR_ASSESSMENT = {

        employeeID:
            String(employeeID).trim(),

        supervisorID:
            String(supervisorID).trim(),

        supervisorName:
            String(supervisorName).trim(),

        assessment: null,

        competencyRatings: {}

    };


    createSupervisorAssessmentModal();


    showSupervisorAssessmentModal();


    await loadSupervisorAssessment();

}


/* ==========================================================
   CREATE MODAL
========================================================== */

function createSupervisorAssessmentModal() {

    const existing =
        document.getElementById(
            "supervisorAssessmentModal"
        );


    if (existing) {

        existing.remove();

    }


    const modal =
        document.createElement("div");


    modal.id =
        "supervisorAssessmentModal";


    modal.className =
        "supervisor-assessment-modal";


    modal.innerHTML = `

        <div
            class="supervisor-assessment-backdrop"
            onclick="closeSupervisorAssessment();"
        ></div>


        <div
            class="supervisor-assessment-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="supervisorAssessmentTitle"
        >

            <div class="supervisor-assessment-header">

                <div>

                    <div class="assessment-eyebrow">
                        SUPERVISOR WORKSPACE
                    </div>

                    <h2 id="supervisorAssessmentTitle">
                        Supervisor Assessment
                    </h2>

                    <p>
                        Assess the employee's competency,
                        development needs, and recommended
                        learning intervention.
                    </p>

                </div>


                <button
                    type="button"
                    class="assessment-close"
                    onclick="closeSupervisorAssessment();"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <div class="supervisor-assessment-meta">

                <div>
                    <span>EMPLOYEE ID</span>
                    <strong id="assessmentEmployeeID">
                        —
                    </strong>
                </div>

                <div>
                    <span>SUPERVISOR</span>
                    <strong id="assessmentSupervisorName">
                        —
                    </strong>
                </div>

                <div>
                    <span>STATUS</span>
                    <strong id="assessmentStatus">
                        Loading...
                    </strong>
                </div>

            </div>


            <div
                id="supervisorAssessmentBody"
                class="supervisor-assessment-body"
            >

                <div class="assessment-loading">
                    Loading Supervisor Assessment...
                </div>

            </div>


            <div class="supervisor-assessment-footer">

                <button
                    type="button"
                    class="assessment-btn secondary"
                    onclick="closeSupervisorAssessment();"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="assessment-btn primary"
                    onclick="saveSupervisorAssessmentForm();"
                >
                    Save Supervisor Assessment
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    setAssessmentMeta();


    injectSupervisorAssessmentStyles();


    document.body.classList.add(
        "modal-open"
    );


    document.addEventListener(
        "keydown",
        supervisorAssessmentEscapeHandler
    );

}


/* ==========================================================
   META
========================================================== */

function setAssessmentMeta() {

    const state =
        window.SUPERVISOR_ASSESSMENT;


    setAssessmentText(
        "assessmentEmployeeID",
        state.employeeID || "—"
    );


    setAssessmentText(
        "assessmentSupervisorName",
        state.supervisorName || state.supervisorID || "—"
    );

}


/* ==========================================================
   LOAD EXISTING ASSESSMENT
========================================================== */

async function loadSupervisorAssessment() {

    const body =
        document.getElementById(
            "supervisorAssessmentBody"
        );


    if (!body) {

        return;

    }


    try {

        const state =
            window.SUPERVISOR_ASSESSMENT;


        const response =
            await API.post({

                action:
                    "getSupervisorAssessment",

                employeeID:
                    state.employeeID,

                supervisorEmployeeID:
                    state.supervisorID

            });


        console.log(
            "Supervisor Assessment:",
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
                    : "Unable to load Supervisor Assessment."
            );

        }


        const assessment =
            response.assessment ||
            null;


        state.assessment =
            assessment;


        state.competencyRatings =
            assessment &&
            assessment.competencyRatings
                ? assessment.competencyRatings
                : {};


        setAssessmentText(
            "assessmentStatus",
            response.submitted === true
                ? "Completed"
                : "For Completion"
        );


        renderSupervisorAssessmentForm(
            assessment || {}
        );


    } catch (error) {

        console.error(
            "loadSupervisorAssessment:",
            error
        );


        body.innerHTML = `

            <div class="assessment-error">

                ${assessmentEscapeHTML(
                    error.message ||
                    "Unable to load Supervisor Assessment."
                )}

            </div>

        `;

    }

}


/* ==========================================================
   FORM
========================================================== */

function renderSupervisorAssessmentForm(
    assessment
) {

    const body =
        document.getElementById(
            "supervisorAssessmentBody"
        );


    if (!body) {

        return;

    }


    body.innerHTML = `

        <form
            id="supervisorAssessmentForm"
            onsubmit="return false;"
        >

            <div class="assessment-intro">

                <strong>
                    Supervisor Assessment
                </strong>

                <span>
                    Complete the assessment based on your
                    observation of the employee's actual
                    work performance and development needs.
                </span>

            </div>


            <section class="assessment-section">

                <div class="assessment-section-title">
                    S1. Development Priorities
                </div>

                <label>
                    Which THREE competencies would most benefit
                    from further development?
                </label>

                <textarea
                    id="assessmentS1"
                    rows="3"
                    placeholder="Identify up to three competencies."
                >${assessmentEscapeHTML(
                    assessment.s1 || ""
                )}</textarea>

            </section>


            <section class="assessment-section">

                <div class="assessment-section-title">
                    S2. Observed Development Need
                </div>

                <label>
                    What specific development need have you observed?
                </label>

                <textarea
                    id="assessmentS2"
                    rows="4"
                    placeholder="Describe the observed development need."
                >${assessmentEscapeHTML(
                    assessment.s2 || ""
                )}</textarea>

            </section>


            <section class="assessment-section">

                <div class="assessment-section-title">
                    S3. Recommended Learning Intervention
                </div>

                <label>
                    What learning intervention would best support
                    the employee?
                </label>

                <select id="assessmentS3">

                    ${assessmentOption(
                        "",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Formal Training",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Workshop",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Hands-On Learning",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Coaching",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Mentoring",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "OJT",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Job Shadowing",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Online Learning",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Blended Learning",
                        assessment.s3
                    )}

                    ${assessmentOption(
                        "Other",
                        assessment.s3
                    )}

                </select>

            </section>


            <section class="assessment-section">

                <div class="assessment-section-title">
                    S4. Potential for Broader Responsibilities
                </div>

                <label>
                    Does the employee demonstrate potential to assume
                    broader or more complex responsibilities?
                </label>

                <div class="assessment-options">

                    ${radioOption(
                        "Yes",
                        "assessmentS4",
                        assessment.s4
                    )}

                    ${radioOption(
                        "To some extent",
                        "assessmentS4",
                        assessment.s4
                    )}

                    ${radioOption(
                        "Not yet",
                        "assessmentS4",
                        assessment.s4
                    )}

                    ${radioOption(
                        "Not applicable",
                        "assessmentS4",
                        assessment.s4
                    )}

                </div>

            </section>


            <section class="assessment-section">

                <div class="assessment-section-title">
                    S5. Expertise / Knowledge Sharing
                </div>

                <label>
                    Does the employee demonstrate expertise that
                    could potentially be shared with others?
                </label>

                <div class="assessment-options">

                    ${radioOption(
                        "Yes",
                        "assessmentS5",
                        assessment.s5
                    )}

                    ${radioOption(
                        "To some extent",
                        "assessmentS5",
                        assessment.s5
                    )}

                    ${radioOption(
                        "Not yet",
                        "assessmentS5",
                        assessment.s5
                    )}

                    ${radioOption(
                        "Unable to assess",
                        "assessmentS5",
                        assessment.s5
                    )}

                </div>

            </section>


            <section class="assessment-section">

                <div class="assessment-section-title">
                    S6. Recommended Knowledge-Sharing Role
                </div>

                <label>
                    Recommended knowledge-sharing role, if applicable.
                </label>

                <select id="assessmentS6">

                    ${assessmentOption(
                        "",
                        assessment.s6
                    )}

                    ${assessmentOption(
                        "Mentor",
                        assessment.s6
                    )}

                    ${assessmentOption(
                        "SME",
                        assessment.s6
                    )}

                    ${assessmentOption(
                        "Instructor/Trainer",
                        assessment.s6
                    )}

                    ${assessmentOption(
                        "Resource Speaker",
                        assessment.s6
                    )}

                    ${assessmentOption(
                        "Coach",
                        assessment.s6
                    )}

                    ${assessmentOption(
                        "None at present",
                        assessment.s6
                    )}

                </select>

            </section>


            <section class="assessment-section">

                <div class="assessment-section-title">
                    S7. Supervisor Comments / Recommendations
                </div>

                <label>
                    Additional supervisor comments/recommendations.
                </label>

                <textarea
                    id="assessmentS7"
                    rows="4"
                    placeholder="Optional comments or recommendations."
                >${assessmentEscapeHTML(
                    assessment.s7 || ""
                )}</textarea>

            </section>


            <section class="assessment-section competency-assessment">

                <div class="assessment-section-title">
                    Supervisor Competency Assessment
                </div>

                <p class="assessment-help">
                    Rate the employee independently using the
                    applicable competency scale.
                </p>


                <div class="rating-legend">

                    <span>1 Awareness</span>
                    <span>2 Developing</span>
                    <span>3 Proficient</span>
                    <span>4 Advanced</span>
                    <span>5 Expert</span>
                    <span>N/A</span>

                </div>


                <div id="supervisorCompetencyRatings">

                    <div class="assessment-loading">
                        Loading applicable competencies...
                    </div>

                </div>

            </section>

        </form>

    `;


    loadSupervisorAssessmentCompetencies();

}


/* ==========================================================
   LOAD COMPETENCIES
========================================================== */

async function loadSupervisorAssessmentCompetencies() {

    const container =
        document.getElementById(
            "supervisorCompetencyRatings"
        );


    if (!container) {

        return;

    }


    try {

        const state =
            window.SUPERVISOR_ASSESSMENT;


        const response =
            await API.post({

                action:
                    "getEmployeeLNACompetencyContext",

                employeeID:
                    state.employeeID

            });


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to load competencies."
            );

        }


            const competencies =
                Array.isArray(response.competencies)
                    ? response.competencies
                    : Array.isArray(response.applicableCompetencies)
                        ? response.applicableCompetencies
            : [];


        if (
            competencies.length === 0
        ) {

            container.innerHTML = `

                <div class="assessment-empty">

                    No applicable competencies were returned.

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div class="competency-rating-table-wrap">

                <table class="competency-rating-table">

                    <thead>

                        <tr>

                            <th>
                                Competency
                            </th>

                            <th>
                                Required
                            </th>

                            <th>
                                Supervisor Rating
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${competencies.map(
                            function(item) {

                                const code =
                                    item.lnaCompetencyCode ||
                                    item.masterCompetencyCode ||
                                    item.code ||
                                    item.competencyCode ||
                                    "";

                                const name =
                                    item.competencyName ||
                                    item.name ||
                                    item.competency ||
                                    item.functionalRole ||
                                    item.functionalArea ||
                                    item.masterCompetencyCode ||
                                    "Competency";

                                const required =
                                    item.requiredLevel ||
                                    "—";


                                const current =
                                    window
                                        .SUPERVISOR_ASSESSMENT
                                        .competencyRatings[
                                            code
                                        ] || "";


                                return `

                                    <tr>

                                        <td>

                                            <strong>
                                                ${assessmentEscapeHTML(
                                                    name
                                                )}
                                            </strong>

                                            ${
                                                code
                                                    ? `
                                                        <small>
                                                            ${assessmentEscapeHTML(
                                                                code
                                                            )}
                                                        </small>
                                                      `
                                                    : ""
                                            }

                                        </td>


                                        <td>
                                            ${assessmentEscapeHTML(
                                                String(required)
                                            )}
                                        </td>


                                        <td>

                                            <select
                                                class="supervisor-competency-rating"
                                                data-code="${assessmentEscapeAttribute(
                                                    code
                                                )}"
                                            >

                                                ${ratingOption(
                                                    "",
                                                    current
                                                )}

                                                ${ratingOption(
                                                    "1 - Awareness",
                                                    current
                                                )}

                                                ${ratingOption(
                                                    "2 - Developing",
                                                    current
                                                )}

                                                ${ratingOption(
                                                    "3 - Proficient",
                                                    current
                                                )}

                                                ${ratingOption(
                                                    "4 - Advanced",
                                                    current
                                                )}

                                                ${ratingOption(
                                                    "5 - Expert",
                                                    current
                                                )}

                                                ${ratingOption(
                                                    "N/A",
                                                    current
                                                )}

                                            </select>

                                        </td>

                                    </tr>

                                `;

                            }
                        ).join("")}

                    </tbody>

                </table>

            </div>

        `;


    } catch (error) {

        console.error(
            "loadSupervisorAssessmentCompetencies:",
            error
        );


        container.innerHTML = `

            <div class="assessment-error">

                ${assessmentEscapeHTML(
                    error.message ||
                    "Unable to load applicable competencies."
                )}

            </div>

        `;

    }

}


/* ==========================================================
   SAVE
========================================================== */

async function saveSupervisorAssessmentForm() {

    const saveButton =
        document.querySelector(
            "#supervisorAssessmentModal .assessment-btn.primary"
        );


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "Saving...";

        }


        const competencyRatings =
            {};


        document
            .querySelectorAll(
                ".supervisor-competency-rating"
            )
            .forEach(
                function(select) {

                    const code =
                        select.dataset.code;


                    const value =
                        select.value;


                    if (
                        code &&
                        value
                    ) {

                        competencyRatings[
                            code
                        ] =
                            value;

                    }

                }
            );


        const state =
            window.SUPERVISOR_ASSESSMENT;


        const response =
            await API.post({

                action:
                    "saveSupervisorAssessment",

                employeeID:
                    state.employeeID,

                supervisorEmployeeID:
                    state.supervisorID,

                supervisorName:
                    state.supervisorName,

                s1:
                    getAssessmentValue(
                        "assessmentS1"
                    ),

                s2:
                    getAssessmentValue(
                        "assessmentS2"
                    ),

                s3:
                    getAssessmentValue(
                        "assessmentS3"
                    ),

                s4:
                    getAssessmentCheckedValue(
                        "assessmentS4"
                    ),

                s5:
                    getAssessmentCheckedValue(
                        "assessmentS5"
                    ),

                s6:
                    getAssessmentValue(
                        "assessmentS6"
                    ),

                s7:
                    getAssessmentValue(
                        "assessmentS7"
                    ),

                competencyRatings:
                    JSON.stringify(
                        competencyRatings
                    )

            });


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to save Supervisor Assessment."
            );

        }


        state.assessment = {

            employeeID:
                state.employeeID,

            supervisorEmployeeID:
                state.supervisorID,

            supervisorName:
                state.supervisorName,

            s1:
                getAssessmentValue(
                    "assessmentS1"
                ),

            s2:
                getAssessmentValue(
                    "assessmentS2"
                ),

            s3:
                getAssessmentValue(
                    "assessmentS3"
                ),

            s4:
                getAssessmentCheckedValue(
                    "assessmentS4"
                ),

            s5:
                getAssessmentCheckedValue(
                    "assessmentS5"
                ),

            s6:
                getAssessmentValue(
                    "assessmentS6"
                ),

            s7:
                getAssessmentValue(
                    "assessmentS7"
                ),

            competencyRatings:
                competencyRatings,

            status:
                "Completed"

        };


        state.competencyRatings =
            competencyRatings;


        setAssessmentText(
            "assessmentStatus",
            "Completed"
        );


        alert(
            "Supervisor Assessment saved successfully."
        );


        /*
         * Refresh supervisor views.
         */

        if (
            typeof loadSupervisorPersonnel ===
            "function"
        ) {

            await loadSupervisorPersonnel();

        }


        if (
            typeof renderValidationView ===
            "function"
        ) {

            renderValidationView();

        }


    } catch (error) {

        console.error(
            "saveSupervisorAssessmentForm:",
            error
        );


        alert(
            error.message ||
            "Unable to save Supervisor Assessment."
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Supervisor Assessment";

        }

    }

}


/* ==========================================================
   CLOSE
========================================================== */

function closeSupervisorAssessment() {

    const modal =
        document.getElementById(
            "supervisorAssessmentModal"
        );


    if (modal) {

        modal.remove();

    }


    document.body.classList.remove(
        "modal-open"
    );


    document.removeEventListener(
        "keydown",
        supervisorAssessmentEscapeHandler
    );

}


/* ==========================================================
   SHOW
========================================================== */

function showSupervisorAssessmentModal() {

    const modal =
        document.getElementById(
            "supervisorAssessmentModal"
        );


    if (!modal) {

        return;

    }


    requestAnimationFrame(
        function() {

            modal.classList.add(
                "is-open"
            );

        }
    );

}


/* ==========================================================
   ESCAPE
========================================================== */

function supervisorAssessmentEscapeHandler(
    event
) {

    if (
        event.key === "Escape"
    ) {

        closeSupervisorAssessment();

    }

}


/* ==========================================================
   OPTIONS
========================================================== */

function assessmentOption(
    value,
    selected
) {

    const selectedAttr =
        String(value) ===
        String(selected || "")
            ? "selected"
            : "";


    return `

        <option
            value="${assessmentEscapeAttribute(value)}"
            ${selectedAttr}
        >
            ${assessmentEscapeHTML(value || "Select")}
        </option>

    `;

}


function radioOption(
    value,
    name,
    selected
) {

    const checked =
        String(value) ===
        String(selected || "")
            ? "checked"
            : "";


    return `

        <label class="assessment-radio">

            <input
                type="radio"
                name="${assessmentEscapeAttribute(name)}"
                value="${assessmentEscapeAttribute(value)}"
                ${checked}
            >

            <span>
                ${assessmentEscapeHTML(value)}
            </span>

        </label>

    `;

}


function ratingOption(
    value,
    selected
) {

    const selectedAttr =
        String(value) ===
        String(selected || "")
            ? "selected"
            : "";


    return `

        <option
            value="${assessmentEscapeAttribute(value)}"
            ${selectedAttr}
        >
            ${assessmentEscapeHTML(value || "Select rating")}
        </option>

    `;

}


/* ==========================================================
   VALUE HELPERS
========================================================== */

function getAssessmentValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? String(
            element.value || ""
        ).trim()
        : "";

}


function getAssessmentCheckedValue(
    name
) {

    const element =
        document.querySelector(
            `input[name="${name}"]:checked`
        );


    return element
        ? element.value
        : "";

}


function setAssessmentText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value || "—";

    }

}


/* ==========================================================
   ESCAPE HELPERS
========================================================== */

function assessmentEscapeHTML(
    value
) {

    return String(
        value === null ||
        value === undefined
            ? ""
            : value
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


function assessmentEscapeAttribute(
    value
) {

    return assessmentEscapeHTML(
        value
    );

}


/* ==========================================================
   STYLES
========================================================== */

function injectSupervisorAssessmentStyles() {

    if (
        document.getElementById(
            "supervisorAssessmentStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "supervisorAssessmentStyles";


    style.textContent = `

        .supervisor-assessment-modal {

            position:fixed;

            inset:0;

            z-index:99999;

            display:flex;

            align-items:center;

            justify-content:center;

            padding:24px;

            opacity:0;

            visibility:hidden;

            transition:.18s ease;

            font-family:
                "Bookman Old Style",
                Bookman,
                serif;

        }


        .supervisor-assessment-modal.is-open {

            opacity:1;

            visibility:visible;

        }


        .supervisor-assessment-backdrop {

            position:absolute;

            inset:0;

            background:
                rgba(35,8,56,.58);

            backdrop-filter:
                blur(2px);

        }


        .supervisor-assessment-dialog {

            position:relative;

            z-index:2;

            width:min(
                1050px,
                96vw
            );

            max-height:92vh;

            display:flex;

            flex-direction:column;

            overflow:hidden;

            background:#fff;

            border-radius:14px;

            box-shadow:
                0 24px 70px
                rgba(0,0,0,.25);

        }


        .supervisor-assessment-header {

            display:flex;

            justify-content:space-between;

            gap:20px;

            padding:20px 24px;

            background:
                linear-gradient(
                    135deg,
                    #4b1d72,
                    #6a1b9a
                );

            color:#fff;

        }


        .assessment-eyebrow {

            font-size:10px;

            font-weight:700;

            letter-spacing:1px;

            opacity:.8;

        }


        .supervisor-assessment-header h2 {

            margin:4px 0 4px;

            font-size:21px;

        }


        .supervisor-assessment-header p {

            margin:0;

            font-size:12px;

            opacity:.88;

        }


        .assessment-close {

            width:34px;

            height:34px;

            border:0;

            border-radius:8px;

            background:
                rgba(255,255,255,.14);

            color:#fff;

            font-size:25px;

            cursor:pointer;

        }


        .supervisor-assessment-meta {

            display:grid;

            grid-template-columns:
                repeat(3,1fr);

            gap:12px;

            padding:14px 24px;

            background:#f8f5fb;

            border-bottom:
                1px solid #e7dfec;

        }


        .supervisor-assessment-meta div {

            display:flex;

            flex-direction:column;

            gap:3px;

        }


        .supervisor-assessment-meta span {

            font-size:9px;

            font-weight:700;

            color:#7b1fa2;

            letter-spacing:.7px;

        }


        .supervisor-assessment-meta strong {

            font-size:12px;

            color:#302436;

        }


        .supervisor-assessment-body {

            overflow:auto;

            padding:20px 24px;

            font-size:12px;

        }


        .assessment-intro {

            display:flex;

            flex-direction:column;

            gap:4px;

            padding:12px 14px;

            margin-bottom:16px;

            background:#faf7fc;

            border-left:
                4px solid #6a1b9a;

            border-radius:6px;

        }


        .assessment-intro strong {

            color:#4b1d72;

            font-size:13px;

        }


        .assessment-intro span {

            color:#6f6674;

            line-height:1.5;

        }


        .assessment-section {

            margin-bottom:18px;

            padding-bottom:16px;

            border-bottom:
                1px solid #eee8f1;

        }


        .assessment-section-title {

            margin-bottom:8px;

            color:#4b1d72;

            font-weight:700;

            font-size:13px;

        }


        .assessment-section label {

            display:block;

            margin-bottom:7px;

            color:#403847;

            font-size:12px;

            font-weight:600;

        }


        .assessment-section textarea,

        .assessment-section select {

            width:100%;

            box-sizing:border-box;

            padding:9px 10px;

            border:
                1px solid #dcd3e2;

            border-radius:6px;

            background:#fff;

            color:#302436;

            font-family:inherit;

            font-size:12px;

        }


        .assessment-section textarea {

            resize:vertical;

            line-height:1.45;

        }


        .assessment-section textarea:focus,

        .assessment-section select:focus {

            outline:none;

            border-color:#6a1b9a;

            box-shadow:
                0 0 0 2px
                rgba(106,27,154,.10);

        }


        .assessment-options {

            display:flex;

            flex-wrap:wrap;

            gap:8px;

        }


        .assessment-radio {

            display:flex !important;

            align-items:center;

            gap:6px;

            padding:7px 10px;

            margin:0 !important;

            border:
                1px solid #e1d9e7;

            border-radius:6px;

            background:#faf9fb;

            cursor:pointer;

            font-weight:400 !important;

        }


        .assessment-radio input {

            margin:0;

        }


        .rating-legend {

            display:flex;

            flex-wrap:wrap;

            gap:6px;

            margin-bottom:10px;

        }


        .rating-legend span {

            padding:5px 8px;

            border-radius:5px;

            background:#f3ebfc;

            color:#4b1d72;

            font-size:10px;

            font-weight:700;

        }


        .competency-rating-table-wrap {

            overflow:auto;

            border:
                1px solid #e4dce9;

            border-radius:8px;

        }


        .competency-rating-table {

            width:100%;

            border-collapse:collapse;

            min-width:700px;

        }


        .competency-rating-table th,

        .competency-rating-table td {

            padding:9px 10px;

            border-bottom:
                1px solid #eee8f1;

            text-align:left;

            font-size:11px;

        }


        .competency-rating-table th {

            background:#f6f1f8;

            color:#4b1d72;

            font-size:10px;

            text-transform:uppercase;

            letter-spacing:.4px;

        }


        .competency-rating-table td strong {

            display:block;

            color:#302436;

        }


        .competency-rating-table td small {

            display:block;

            margin-top:2px;

            color:#8c8491;

            font-size:9px;

        }


        .competency-rating-table select {

            min-width:155px;

            padding:7px;

        }


        .assessment-help {

            margin:0 0 10px;

            color:#77707e;

            font-size:11px;

        }


        .assessment-loading,

        .assessment-empty,

        .assessment-error {

            padding:20px;

            text-align:center;

            border-radius:8px;

            background:#faf8fc;

            color:#766d7c;

        }


        .assessment-error {

            color:#a33a3a;

            background:#fff5f5;

        }


        .supervisor-assessment-footer {

            display:flex;

            justify-content:flex-end;

            gap:8px;

            padding:14px 24px;

            border-top:
                1px solid #e5dfe8;

            background:#fff;

        }


        .assessment-btn {

            border:0;

            border-radius:6px;

            padding:9px 15px;

            font-family:inherit;

            font-size:11px;

            font-weight:700;

            cursor:pointer;

        }


        .assessment-btn.primary {

            background:#6a1b9a;

            color:#fff;

        }


        .assessment-btn.primary:hover {

            background:#4b1d72;

        }


        .assessment-btn.secondary {

            background:#eee9f1;

            color:#4b1d72;

        }


        .assessment-btn:disabled {

            opacity:.6;

            cursor:not-allowed;

        }


        @media(max-width:700px) {

            .supervisor-assessment-modal {

                padding:8px;

            }

            .supervisor-assessment-meta {

                grid-template-columns:1fr;

            }

            .supervisor-assessment-header {

                padding:16px;

            }

            .supervisor-assessment-body {

                padding:16px;

            }

            .supervisor-assessment-footer {

                padding:12px 16px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* ==========================================================
   GLOBAL
========================================================== */

window.openSupervisorAssessment =
    openSupervisorAssessment;

window.closeSupervisorAssessment =
    closeSupervisorAssessment;

window.saveSupervisorAssessmentForm =
    saveSupervisorAssessmentForm;