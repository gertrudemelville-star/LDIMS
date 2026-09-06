"use strict";

/* ==========================================================
   LDIMS - SUPERVISOR ASSESSMENT FRONTEND
========================================================== */

let SUPERVISOR_ASSESSMENT = {

    employeeID: "",

    employeeName: "",

    supervisorID: "",

    supervisorName: "",

    competencyRatings: {},

    loaded: false

};


/* ==========================================================
   OPEN ASSESSMENT
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


    const employee =
        findPersonnel(
            employeeID
        );


    SUPERVISOR_ASSESSMENT.employeeID =
        employeeID;


    SUPERVISOR_ASSESSMENT.employeeName =
        employee
            ? employee.name
            : "";


    SUPERVISOR_ASSESSMENT.supervisorID =
        SUPERVISOR.employeeID;


    SUPERVISOR_ASSESSMENT.supervisorName =
        SUPERVISOR.user.fullname ||
        SUPERVISOR.user.Fullname ||
        SUPERVISOR.user.name ||
        "";


    createSupervisorAssessmentModal();


    showSupervisorAssessmentModal();


    await loadSupervisorAssessment(
        employeeID
    );

}


/* ==========================================================
   CREATE MODAL
========================================================== */

function createSupervisorAssessmentModal() {

    if (
        document.getElementById(
            "supervisorAssessmentModal"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "supervisorAssessmentModal";


    modal.className =
        "supervisor-assessment-modal";


    modal.innerHTML = `

        <div class="supervisor-assessment-backdrop"
             onclick="closeSupervisorAssessment()">
        </div>


        <div class="supervisor-assessment-dialog">

            <div class="supervisor-assessment-header">

                <div>

                    <div class="assessment-eyebrow">
                        SUPERVISOR ASSESSMENT
                    </div>

                    <h2>
                        Supervisor Assessment
                    </h2>

                    <p>
                        Independent assessment of the employee's
                        demonstrated performance, development needs,
                        and applicable competencies.
                    </p>

                </div>


                <button
                    type="button"
                    class="assessment-close"
                    onclick="closeSupervisorAssessment()"
                >
                    ×
                </button>

            </div>


            <div class="supervisor-assessment-employee">

                <div>
                    <span>Employee</span>
                    <strong id="assessmentEmployeeName">
                        —
                    </strong>
                </div>

                <div>
                    <span>Employee ID</span>
                    <strong id="assessmentEmployeeID">
                        —
                    </strong>
                </div>

                <div>
                    <span>Supervisor</span>
                    <strong id="assessmentSupervisorName">
                        —
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
                    onclick="closeSupervisorAssessment()"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="assessment-btn primary"
                    onclick="saveSupervisorAssessmentForm()"
                >
                    Save Supervisor Assessment
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );

}


/* ==========================================================
   LOAD
========================================================== */

async function loadSupervisorAssessment(
    employeeID
) {

    const body =
        document.getElementById(
            "supervisorAssessmentBody"
        );


    if (!body) {
        return;
    }


    try {

        const response =
            await API.post({

                action:
                    "getSupervisorAssessment",

                employeeID:
                    employeeID,

                supervisorEmployeeID:
                    SUPERVISOR.employeeID

            });


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response &&
                response.message
                    ? response.message
                    : "Unable to load assessment."
            );

        }


        const assessment =
            response.assessment ||
            {};


        SUPERVISOR_ASSESSMENT.loaded =
            response.submitted === true;


        SUPERVISOR_ASSESSMENT.competencyRatings =
            assessment.competencyRatings ||
            {};


        setText(
            "assessmentEmployeeName",
            SUPERVISOR_ASSESSMENT.employeeName ||
            "-"
        );


        setText(
            "assessmentEmployeeID",
            employeeID
        );


        setText(
            "assessmentSupervisorName",
            SUPERVISOR_ASSESSMENT.supervisorName ||
            "-"
        );


        renderSupervisorAssessmentForm(
            assessment
        );


    } catch (error) {

        console.error(
            "loadSupervisorAssessment:",
            error
        );


        body.innerHTML = `

            <div class="assessment-error">

                ${escapeHTML(
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
                >${escapeHTML(
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
                >${escapeHTML(
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

                <select
                    id="assessmentS3"
                >

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

                <select
                    id="assessmentS6"
                >

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
                >${escapeHTML(
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
   COMPETENCIES
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

        const response =
            await API.post({

                action:
                    "getEmployeeLNACompetencyContext",

                employeeID:
                    SUPERVISOR_ASSESSMENT.employeeID

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
            response.applicableCompetencies ||
            response.competencies ||
            [];


        if (
            competencies.length === 0
        ) {

            container.innerHTML = `

                <div class="assessment-empty">
                    No applicable technical competencies were returned.
                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div class="competency-rating-table-wrap">

                <table
                    class="competency-rating-table"
                >

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
                            function (item) {

                                const code =
                                    item.code ||
                                    item.competencyCode ||
                                    item.masterCompetencyCode ||
                                    "";


                                const name =
                                    item.competencyName ||
                                    item.name ||
                                    item.competency ||
                                    "Competency";


                                const required =
                                    item.requiredLevel ||
                                    "—";


                                const current =
                                    SUPERVISOR_ASSESSMENT
                                        .competencyRatings[
                                            code
                                        ] || "";


                                return `

                                    <tr>

                                        <td>

                                            <strong>
                                                ${escapeHTML(
                                                    name
                                                )}
                                            </strong>

                                            ${
                                                code
                                                    ? `
                                                        <small>
                                                            ${escapeHTML(
                                                                code
                                                            )}
                                                        </small>
                                                      `
                                                    : ""
                                            }

                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                String(
                                                    required
                                                )
                                            )}
                                        </td>

                                        <td>

                                            <select
                                                class="supervisor-competency-rating"
                                                data-code="${escapeAttribute(
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

                ${escapeHTML(
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

        if (
            saveButton
        ) {

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
                function (select) {

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


        const response =
            await API.post({

                action:
                    "saveSupervisorAssessment",

                employeeID:
                    SUPERVISOR_ASSESSMENT.employeeID,

                supervisorEmployeeID:
                    SUPERVISOR_ASSESSMENT.supervisorID,

                supervisorName:
                    SUPERVISOR_ASSESSMENT.supervisorName,

                s1:
                    getValue(
                        "assessmentS1"
                    ),

                s2:
                    getValue(
                        "assessmentS2"
                    ),

                s3:
                    getValue(
                        "assessmentS3"
                    ),

                s4:
                    getCheckedValue(
                        "assessmentS4"
                    ),

                s5:
                    getCheckedValue(
                        "assessmentS5"
                    ),

                s6:
                    getValue(
                        "assessmentS6"
                    ),

                s7:
                    getValue(
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


        alert(
            "Supervisor Assessment saved successfully."
        );


        closeSupervisorAssessment();


        /*
         * Refresh validation/personnel views.
         */

        if (
            typeof loadSupervisorPersonnel ===
            "function"
        ) {

            await loadSupervisorPersonnel();

        }


        if (
            typeof renderPersonnelTable ===
            "function"
        ) {

            renderPersonnelTable();

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

        if (
            saveButton
        ) {

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


    if (
        modal
    ) {

        modal.remove();

    }

}


/* ==========================================================
   SHOW
========================================================== */

function showSupervisorAssessmentModal() {

    const modal =
        document.getElementById(
            "supervisorAssessmentModal"
        );


    if (
        modal
    ) {

        requestAnimationFrame(
            function () {

                modal.classList.add(
                    "is-open"
                );

            }
        );

    }

}


/* ==========================================================
   HELPERS
========================================================== */

function assessmentOption(
    value,
    selected
) {

    const isSelected =
        String(
            value
        ) ===
        String(
            selected || ""
        )
            ? "selected"
            : "";


    return `

        <option
            value="${escapeAttribute(value)}"
            ${isSelected}
        >
            ${escapeHTML(value)}
        </option>

    `;

}


function radioOption(
    value,
    name,
    selected
) {

    const checked =
        String(
            value
        ) ===
        String(
            selected || ""
        )
            ? "checked"
            : "";


    return `

        <label class="assessment-radio">

            <input
                type="radio"
                name="${escapeAttribute(name)}"
                value="${escapeAttribute(value)}"
                ${checked}
            >

            <span>
                ${escapeHTML(value)}
            </span>

        </label>

    `;

}


function ratingOption(
    value,
    selected
) {

    const selectedAttr =
        String(
            value
        ) ===
        String(
            selected || ""
        )
            ? "selected"
            : "";


    return `

        <option
            value="${escapeAttribute(value)}"
            ${selectedAttr}
        >
            ${escapeHTML(value)}
        </option>

    `;

}


function getCheckedValue(
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


function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value.trim()
        : "";

}