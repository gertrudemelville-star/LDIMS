/* ==========================================================
   LDIMS
   Employee Individual Development Plan
   Module: My IDP
========================================================== */

"use strict";


const IDP = {

    user: null,

    employeeID: "",

    lna: null,

    profile: null,

    storageKey: "",

    lnaValidated: false

};


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            Session.requireLogin();

            const user = Session.get();

            if (!user) {

                Session.logout();

                return;

            }

            IDP.user = user;

            IDP.employeeID =
                String(
                    user.employeeID ||
                    user.EmployeeID ||
                    user.employeeId ||
                    ""
                ).trim();

            if (!IDP.employeeID) {

                throw new Error(
                    "Employee ID is not available."
                );

            }

            IDP.storageKey =
                "LDIMS_IDP_DRAFT_" +
                IDP.employeeID;

            setText(
                "headerRole",
                user.role || "Employee"
            );

            setText(
                "employeeID",
                IDP.employeeID
            );

            await loadEmployeeProfile();

            await loadValidatedLNA();

            loadDraft();

            initializeActionPlan();

            initializeEvents();

            initializeLogout();

        }
        catch (error) {

            console.error(
                "IDP initialization error:",
                error
            );

            alert(
                error.message ||
                "Unable to load My IDP."
            );

        }

    }
);


/* ==========================================================
   EMPLOYEE PROFILE
========================================================== */

async function loadEmployeeProfile() {

    try {

        const response =
            await API.post({

                action:
                    "getEmployeeProfile",

                employeeID:
                    IDP.employeeID

            });


        console.log(
            "IDP Employee Profile:",
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
                    : "Unable to load employee profile."
            );

        }


        const profile =
            response.employee ||
            response.profile ||
            response.data ||
            response;


        IDP.profile =
            profile || {};


        const name =
            profile.fullname ||
            profile.fullName ||
            profile.name ||
            profile.Fullname ||
            profile["Full Name"] ||
            IDP.user.fullname ||
            "-";


        const position =
            profile.position ||
            profile.Position ||
            "-";


        const assignment =
            profile.placeOfAssignment ||
            profile.PlaceOfAssignment ||
            profile["Place of Assignment"] ||
            profile.division ||
            profile.Division ||
            "-";


        const section =
            profile.section ||
            profile.Section ||
            profile.unit ||
            profile.Unit ||
            "";


        const supervisor =
            profile.immediateSupervisor ||
            profile.ImmediateSupervisor ||
            profile.supervisor ||
            profile.Supervisor ||
            "-";


        setText(
            "employeeName",
            name
        );


        setText(
            "employeePosition",
            position
        );


        setText(
            "employeeAssignment",
            section
                ? assignment + " / " + section
                : assignment
        );


        setText(
            "supervisorName",
            supervisor
        );

    }
    catch (error) {

        console.error(
            "loadEmployeeProfile error:",
            error
        );


        setText(
            "employeeName",
            IDP.user.fullname ||
            "-"
        );


        setText(
            "employeePosition",
            "-"
        );


        setText(
            "employeeAssignment",
            "-"
        );


        setText(
            "supervisorName",
            "-"
        );

    }

}


/* ==========================================================
   LOAD LNA
========================================================== */

async function loadValidatedLNA() {

    const loading =
        document.getElementById(
            "lnaLoading"
        );

    const reference =
        document.getElementById(
            "lnaReference"
        );

    const unavailable =
        document.getElementById(
            "lnaNotAvailable"
        );


    try {

        const response =
            await API.post({

                action:
                    "getLNAByEmployeeID",

                employeeID:
                    IDP.employeeID

            });


        console.log(
            "IDP LNA:",
            response
        );


        if (
            !response ||
            response.success !== true ||
            response.submitted !== true ||
            !response.record
        ) {

            showLNAUnavailable(
                "No completed LNA submission was found."
            );

            return;

        }


        const record =
            response.record;


        const status =
            String(
                record.status ||
                ""
            ).trim();


        if (
            status.toLowerCase() !==
            "validated"
        ) {

            showLNAUnavailable(
                "Your LNA is not yet validated by your supervisor."
            );

            return;

        }


        IDP.lna =
            record;

        IDP.lnaValidated =
            true;


        if (loading) {

            loading.classList.add(
                "d-none"
            );

        }


        if (unavailable) {

            unavailable.classList.add(
                "d-none"
            );

        }


        if (reference) {

            reference.classList.remove(
                "d-none"
            );

        }


        setText(
            "lnaCurrentNeeds",
            record.currentCompetencies ||
            "-"
        );


        setText(
            "lnaFutureNeeds",
            record.futureNeeds ||
            "-"
        );


        setText(
            "lnaEmergingSkills",
            record.emergingSkills ||
            "-"
        );


        setText(
            "lnaProposedLearning",
            record.proposedLearning ||
            "-"
        );


        setStatus(
            "Validated"
        );

    }
    catch (error) {

        console.error(
            "loadValidatedLNA error:",
            error
        );


        showLNAUnavailable(
            "Unable to retrieve your LNA."
        );

    }

}


/* ==========================================================
   LNA UNAVAILABLE
========================================================== */

function showLNAUnavailable(
    message
) {

    const loading =
        document.getElementById(
            "lnaLoading"
        );

    const reference =
        document.getElementById(
            "lnaReference"
        );

    const unavailable =
        document.getElementById(
            "lnaNotAvailable"
        );


    if (loading) {

        loading.classList.add(
            "d-none"
        );

    }


    if (reference) {

        reference.classList.add(
            "d-none"
        );

    }


    if (unavailable) {

        unavailable.classList.remove(
            "d-none"
        );


        unavailable.innerHTML = `

            <i class="bi bi-exclamation-triangle me-2"></i>

            ${escapeHTML(message)}

        `;

    }


    IDP.lnaValidated =
        false;


    setStatus(
        "LNA Pending"
    );

}


/* ==========================================================
   STATUS
========================================================== */

function setStatus(
    status
) {

    const element =
        document.getElementById(
            "idpStatus"
        );


    if (!element) {

        return;

    }


    element.textContent =
        status;


    element.className =
        "badge status-badge";


    switch (
        String(status).toLowerCase()
    ) {

        case "validated":

            element.classList.add(
                "bg-success"
            );

            break;


        case "lna pending":

            element.classList.add(
                "bg-warning",
                "text-dark"
            );

            break;


        default:

            element.classList.add(
                "bg-secondary"
            );

    }

}


/* ==========================================================
   ACTION PLAN
========================================================== */

function initializeActionPlan() {

    const body =
        document.getElementById(
            "actionPlanBody"
        );


    if (!body) {

        return;

    }


    if (
        body.children.length === 0
    ) {

        addActionPlanRow();

    }

}


function addActionPlanRow(
    data = {}
) {

    const body =
        document.getElementById(
            "actionPlanBody"
        );


    if (!body) {

        return;

    }


    const row =
        document.createElement(
            "tr"
        );


    row.innerHTML = `

        <td>

            <textarea
                class="form-control form-control-sm action-skill"
                rows="3"
                placeholder="Knowledge or skill">${escapeHTML(
                    data.skill || ""
                )}</textarea>

        </td>


        <td>

            <textarea
                class="form-control form-control-sm action-description"
                rows="3"
                placeholder="Development activity">${escapeHTML(
                    data.description || ""
                )}</textarea>

        </td>


        <td>

            <textarea
                class="form-control form-control-sm action-supervisor"
                rows="3"
                placeholder="Supervisor support / role">${escapeHTML(
                    data.supervisorRole || ""
                )}</textarea>

        </td>


        <td>

            <input
                type="text"
                class="form-control form-control-sm action-timeframe"
                placeholder="e.g. Q2 2026"
                value="${escapeAttribute(
                    data.timeFrame || ""
                )}">

        </td>


        <td>

            <textarea
                class="form-control form-control-sm action-outcome"
                rows="3"
                placeholder="Expected result">${escapeHTML(
                    data.outcome || ""
                )}</textarea>

        </td>


        <td class="text-center">

            <button
                type="button"
                class="btn btn-sm btn-outline-danger remove-action"
                title="Remove">

                <i class="bi bi-trash"></i>

            </button>

        </td>

    `;


    body.appendChild(
        row
    );


    const removeButton =
        row.querySelector(
            ".remove-action"
        );


    removeButton.addEventListener(
        "click",
        function () {

            row.remove();

            if (
                body.children.length === 0
            ) {

                addActionPlanRow();

            }

        }
    );

}


/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    document
        .getElementById(
            "addActionPlan"
        )
        ?.addEventListener(
            "click",
            function () {

                addActionPlanRow();

            }
        );


    document
        .getElementById(
            "saveDraftButton"
        )
        ?.addEventListener(
            "click",
            saveDraft
        );


    document
        .getElementById(
            "idpForm"
        )
        ?.addEventListener(
            "submit",
            submitIDP
        );

}


/* ==========================================================
   COLLECT FORM
========================================================== */

function collectIDPData() {

    const data = {

        employeeID:
            IDP.employeeID,

        employeeName:
            getInputValue(
                "employeeName"
            ),

        supervisorName:
            getInputValue(
                "supervisorName"
            ),

        position:
            getInputValue(
                "employeePosition"
            ),

        assignment:
            getInputValue(
                "employeeAssignment"
            ),


        strengths:
            getValue(
                "strengths"
            ),

        improvementAreas:
            getValue(
                "improvementAreas"
            ),

        shortTermGoals:
            getValue(
                "shortTermGoals"
            ),

        longTermGoals:
            getValue(
                "longTermGoals"
            ),

        additionalComments:
            getValue(
                "additionalComments"
            ),


        quarterlyReview: {

            q1Employee:
                getValue("q1Employee"),

            q1EmployeeDate:
                getValue("q1EmployeeDate"),

            q1Supervisor:
                getValue("q1Supervisor"),

            q1SupervisorDate:
                getValue("q1SupervisorDate"),


            q2Employee:
                getValue("q2Employee"),

            q2EmployeeDate:
                getValue("q2EmployeeDate"),

            q2Supervisor:
                getValue("q2Supervisor"),

            q2SupervisorDate:
                getValue("q2SupervisorDate"),


            q3Employee:
                getValue("q3Employee"),

            q3EmployeeDate:
                getValue("q3EmployeeDate"),

            q3Supervisor:
                getValue("q3Supervisor"),

            q3SupervisorDate:
                getValue("q3SupervisorDate"),


            q4Employee:
                getValue("q4Employee"),

            q4EmployeeDate:
                getValue("q4EmployeeDate"),

            q4Supervisor:
                getValue("q4Supervisor"),

            q4SupervisorDate:
                getValue("q4SupervisorDate")

        },


        actionPlan:
            collectActionPlan(),


        lnaReference:
            IDP.lna
                ? {

                    currentNeeds:
                        IDP.lna.currentCompetencies || "",

                    futureNeeds:
                        IDP.lna.futureNeeds || "",

                    emergingSkills:
                        IDP.lna.emergingSkills || "",

                    proposedLearning:
                        IDP.lna.proposedLearning || ""

                }
                : null

    };


    return data;

}


/* ==========================================================
   ACTION PLAN DATA
========================================================== */

function collectActionPlan() {

    const rows =
        document.querySelectorAll(
            "#actionPlanBody tr"
        );


    return Array.from(
        rows
    ).map(
        function (row) {

            return {

                skill:
                    row.querySelector(
                        ".action-skill"
                    )?.value || "",

                description:
                    row.querySelector(
                        ".action-description"
                    )?.value || "",

                supervisorRole:
                    row.querySelector(
                        ".action-supervisor"
                    )?.value || "",

                timeFrame:
                    row.querySelector(
                        ".action-timeframe"
                    )?.value || "",

                outcome:
                    row.querySelector(
                        ".action-outcome"
                    )?.value || ""

            };

        }
    );

}


/* ==========================================================
   SAVE DRAFT
========================================================== */

function saveDraft() {

    try {

        const data =
            collectIDPData();


        localStorage.setItem(
            IDP.storageKey,
            JSON.stringify(data)
        );


        alert(
            "IDP draft saved on this device."
        );


        setStatus(
            "Draft Saved"
        );

    }
    catch (error) {

        console.error(
            "Save IDP draft error:",
            error
        );


        alert(
            "Unable to save IDP draft."
        );

    }

}


/* ==========================================================
   LOAD DRAFT
========================================================== */

function loadDraft() {

    try {

        const saved =
            localStorage.getItem(
                IDP.storageKey
            );


        if (!saved) {

            return;

        }


        const data =
            JSON.parse(
                saved
            );


        setInput(
            "strengths",
            data.strengths
        );


        setInput(
            "improvementAreas",
            data.improvementAreas
        );


        setInput(
            "shortTermGoals",
            data.shortTermGoals
        );


        setInput(
            "longTermGoals",
            data.longTermGoals
        );


        setInput(
            "additionalComments",
            data.additionalComments
        );


        const quarterly =
            data.quarterlyReview ||
            {};


        Object.keys(
            quarterly
        ).forEach(
            function (key) {

                setInput(
                    key,
                    quarterly[key]
                );

            }
        );


        const body =
            document.getElementById(
                "actionPlanBody"
            );


        if (body) {

            body.innerHTML = "";

        }


        if (
            Array.isArray(
                data.actionPlan
            ) &&
            data.actionPlan.length
        ) {

            data.actionPlan.forEach(
                function (item) {

                    addActionPlanRow(
                        item
                    );

                }
            );

        }
        else {

            addActionPlanRow();

        }


        setStatus(
            "Draft"
        );

    }
    catch (error) {

        console.error(
            "loadDraft error:",
            error
        );

    }

}


/* ==========================================================
   SUBMIT
========================================================== */

async function submitIDP(
    event
) {

    event.preventDefault();


    if (
        !IDP.lnaValidated
    ) {

        alert(
            "Your LNA must be validated by your supervisor before submitting an IDP."
        );

        return;

    }


    const data =
        collectIDPData();


    const confirmed =
        confirm(
            "Submit your Individual Development Plan for supervisor discussion and review?"
        );


    if (!confirmed) {

        return;

    }


    /*
     * Backend save/submit endpoint
     * will be connected in the next backend step.
     *
     * For now, preserve the completed IDP
     * locally so no work is lost.
     */

    localStorage.setItem(
        IDP.storageKey,
        JSON.stringify(data)
    );


    alert(
        "Your IDP has been prepared for submission. Backend submission will be connected next."
    );


    setStatus(
        "Ready for Submission"
    );

}


/* ==========================================================
   LOGOUT
========================================================== */

function initializeLogout() {

    const logout =
        document.getElementById(
            "logoutLink"
        );


    if (!logout) {

        return;

    }


    logout.addEventListener(
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


/* ==========================================================
   HELPERS
========================================================== */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value
        : "";

}


function getInputValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.textContent.trim()
        : "";

}


function setInput(
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


    element.value =
        value || "";

}


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
        value || "-";

}


function escapeHTML(
    value
) {

    return String(
        value || ""
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


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}