"use strict";

/* ==========================================================
   LDIMS
   LDD FUNCTION MASTER VALIDATION
========================================================== */

let functionMasterRecords = [];
let selectedFunction = null;


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initializeFunctionMaster();
});


async function initializeFunctionMaster() {

    bindEvents();

    await loadFunctionMasterQueue();

}


/* ==========================================================
   EVENTS
========================================================== */

function bindEvents() {

    const refreshButton =
        document.getElementById("refreshButton");

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadFunctionMasterQueue
        );

    }


    const validateButton =
        document.getElementById("validateButton");

    if (validateButton) {

        validateButton.addEventListener(
            "click",
            validateSelectedFunction
        );

    }


    const revisionButton =
        document.getElementById("revisionButton");

    if (revisionButton) {

        revisionButton.addEventListener(
            "click",
            returnSelectedFunctionForRevision
        );

    }


    const logoutLink =
        document.getElementById("logoutLink");

    if (logoutLink) {

        logoutLink.addEventListener(
            "click",
            function () {

                try {

                    if (
                        typeof Session !== "undefined" &&
                        typeof Session.clear === "function"
                    ) {

                        Session.clear();

                    }

                } catch (error) {

                    console.warn(
                        "Session clear warning:",
                        error
                    );

                }

            }
        );

    }

}


/* ==========================================================
   LOAD FUNCTION MASTER QUEUE
========================================================== */

async function loadFunctionMasterQueue() {

    showLoading();

    clearAlert();

    clearDetails();

    selectedFunction = null;


    try {

        const result =
            await API.post({
                action:
                    "getFunctionMasterValidationQueue"
            });


        console.log(
            "FUNCTION MASTER API RESPONSE:",
            result
        );


        if (!result) {

            throw new Error(
                "No response received from the server."
            );

        }


        if (result.success === false) {

            throw new Error(
                result.message ||
                "Unable to load Function Master records."
            );

        }


        /*
         * Backend response may expose the array
         * under different property names.
         */

        let records = [];


        if (Array.isArray(result.functions)) {

            records = result.functions;

        } else if (Array.isArray(result.records)) {

            records = result.records;

        } else if (Array.isArray(result.data)) {

            records = result.data;

        } else if (Array.isArray(result.queue)) {

            records = result.queue;

        } else if (
            result.data &&
            Array.isArray(result.data.functions)
        ) {

            records = result.data.functions;

        } else if (
            result.data &&
            Array.isArray(result.data.records)
        ) {

            records = result.data.records;

        }


        console.log(
            "FUNCTION MASTER RECORDS:",
            records
        );


        functionMasterRecords =
            records;


        updateSummary(
            functionMasterRecords
        );


        renderFunctionMaster(
            functionMasterRecords
        );


    } catch (error) {

        console.error(
            "Function Master load error:",
            error
        );


        functionMasterRecords = [];


        updateSummary([]);


        showError(
            error.message ||
            "Unable to load Function Master records."
        );


        showEmpty(
            "Unable to load Function Master records."
        );

    }

}


/* ==========================================================
   RENDER TABLE
========================================================== */

function renderFunctionMaster(records) {

    hideLoading();


    const tableBody =
        document.getElementById(
            "functionTableBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {

        showEmpty(
            "No Function Master records are currently pending validation."
        );

        return;

    }


    hideEmpty();


    records.forEach(
        function (record, index) {

            const row =
                document.createElement("tr");


            row.dataset.index =
                index;


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(
                            getValue(
                                record,
                                [
                                    "functionID",
                                    "FunctionID"
                                ]
                            )
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        getValue(
                            record,
                            [
                                "serviceOffice",
                                "ServiceOffice"
                            ]
                        ) || "—"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        getValue(
                            record,
                            [
                                "functionalArea",
                                "FunctionalArea"
                            ]
                        ) || "—"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        getValue(
                            record,
                            [
                                "functionalRole",
                                "FunctionalRole"
                            ]
                        ) || "—"
                    )}
                </td>

                <td>
                    ${getValidationBadge(
                        getValue(
                            record,
                            [
                                "validationStatus",
                                "ValidationStatus"
                            ]
                        )
                    )}
                </td>

            `;


            row.addEventListener(
                "click",
                function () {

                    selectFunction(index);

                }
            );


            tableBody.appendChild(row);

        }
    );


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (recordCount) {

        recordCount.textContent =
            records.length;

    }

}


/* ==========================================================
   SELECT FUNCTION
========================================================== */

function selectFunction(index) {

    const record =
        functionMasterRecords[index];


    if (!record) {

        return;

    }


    selectedFunction =
        record;


    const tableBody =
        document.getElementById(
            "functionTableBody"
        );


    if (tableBody) {

        const rows =
            tableBody.querySelectorAll("tr");


        rows.forEach(
            function (row, rowIndex) {

                row.classList.toggle(
                    "table-active",
                    rowIndex === index
                );

            }
        );

    }


    renderFunctionDetails(
        record
    );

}


/* ==========================================================
   FUNCTION DETAILS
========================================================== */

function renderFunctionDetails(record) {

    const detailEmptyState =
        document.getElementById(
            "detailEmptyState"
        );

    const detailContent =
        document.getElementById(
            "detailContent"
        );


    if (detailEmptyState) {

        detailEmptyState.classList.add(
            "d-none"
        );

    }


    if (detailContent) {

        detailContent.classList.remove(
            "d-none"
        );

    }


    setText(
        "detailFunctionID",
        getValue(
            record,
            [
                "functionID",
                "FunctionID"
            ]
        )
    );


    setText(
        "detailServiceOffice",
        getValue(
            record,
            [
                "serviceOffice",
                "ServiceOffice"
            ]
        )
    );


    setText(
        "detailDivisionUnit",
        getValue(
            record,
            [
                "divisionUnit",
                "DivisionUnit"
            ]
        )
    );


    setText(
        "detailSection",
        getValue(
            record,
            [
                "sectionSpecialization",
                "SectionSpecialization"
            ]
        )
    );


    setText(
        "detailFunctionalArea",
        getValue(
            record,
            [
                "functionalArea",
                "FunctionalArea"
            ]
        )
    );


    setText(
        "detailFunctionalRole",
        getValue(
            record,
            [
                "functionalRole",
                "FunctionalRole"
            ]
        )
    );


    setText(
        "detailPrimaryAdditional",
        getValue(
            record,
            [
                "primaryAdditional",
                "PrimaryAdditional"
            ]
        )
    );


    setText(
        "detailStatus",
        getValue(
            record,
            [
                "status",
                "Status"
            ]
        )
    );


    const validationStatus =
        getValue(
            record,
            [
                "validationStatus",
                "ValidationStatus"
            ]
        );


    const statusElement =
        document.getElementById(
            "detailValidationStatus"
        );


    if (statusElement) {

        statusElement.className =
            "validation-badge";


        const normalized =
            normalizeStatus(
                validationStatus
            );


        if (
            normalized === "for validation"
        ) {

            statusElement.classList.add(
                "status-for-validation"
            );

        } else if (
            normalized === "needs revision"
        ) {

            statusElement.classList.add(
                "status-needs-revision"
            );

        } else if (
            normalized === "validated"
        ) {

            statusElement.classList.add(
                "status-validated"
            );

        }


        statusElement.textContent =
            validationStatus ||
            "For Validation";

    }


    const remarks =
        getValue(
            record,
            [
                "remarks",
                "Remarks"
            ]
        );


    const remarksInput =
        document.getElementById(
            "remarksInput"
        );


    if (remarksInput) {

        remarksInput.value =
            remarks || "";

    }


    const existingRemarks =
        document.getElementById(
            "detailExistingRemarks"
        );


    if (existingRemarks) {

        if (
            remarks &&
            String(remarks).trim()
        ) {

            existingRemarks.textContent =
                "Existing Remarks: " +
                remarks;


            existingRemarks.classList.remove(
                "d-none"
            );

        } else {

            existingRemarks.textContent =
                "";


            existingRemarks.classList.add(
                "d-none"
            );

        }

    }

}


/* ==========================================================
   VALIDATE
========================================================== */

async function validateSelectedFunction() {

    if (!selectedFunction) {

        showWarning(
            "Please select a Function Master record first."
        );

        return;

    }


    const functionID =
        getValue(
            selectedFunction,
            [
                "functionID",
                "FunctionID"
            ]
        );


    if (!functionID) {

        showError(
            "Selected record has no Function ID."
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Validate Function Master record " +
            functionID +
            "?"
        );


    if (!confirmed) {

        return;

    }


    setActionLoading(true);


    try {

        const remarksInput =
            document.getElementById(
                "remarksInput"
            );


        const result =
            await API.post({

                action:
                    "validateFunctionMasterRecord",

                functionID:
                    functionID,

                validationStatus:
                    "Validated",

                remarks:
                    remarksInput
                        ? remarksInput.value.trim()
                        : ""

            });


        console.log(
            "FUNCTION MASTER VALIDATION RESPONSE:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Unable to validate the function."
            );

        }


        showSuccess(
            "Function " +
            functionID +
            " has been validated successfully."
        );


        await loadFunctionMasterQueue();


    } catch (error) {

        console.error(
            "Function validation error:",
            error
        );


        showError(
            error.message ||
            "Unable to validate the function."
        );

    } finally {

        setActionLoading(false);

    }

}


/* ==========================================================
   NEEDS REVISION
========================================================== */

async function returnSelectedFunctionForRevision() {

    if (!selectedFunction) {

        showWarning(
            "Please select a Function Master record first."
        );

        return;

    }


    const functionID =
        getValue(
            selectedFunction,
            [
                "functionID",
                "FunctionID"
            ]
        );


    const remarksInput =
        document.getElementById(
            "remarksInput"
        );


    const reason =
        remarksInput
            ? remarksInput.value.trim()
            : "";


    if (!reason) {

        showWarning(
            "Please provide validation remarks before marking the function as Needs Revision."
        );


        if (remarksInput) {

            remarksInput.focus();

        }


        return;

    }


    const confirmed =
        window.confirm(
            "Mark Function Master record " +
            functionID +
            " as Needs Revision?"
        );


    if (!confirmed) {

        return;

    }


    setActionLoading(true);


    try {

        const result =
            await API.post({

                action:
                    "validateFunctionMasterRecord",

                functionID:
                    functionID,

                validationStatus:
                    "Needs Revision",

                remarks:
                    reason

            });


        console.log(
            "FUNCTION MASTER REVISION RESPONSE:",
            result
        );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Unable to return the function for revision."
            );

        }


        showSuccess(
            "Function " +
            functionID +
            " has been marked as Needs Revision."
        );


        await loadFunctionMasterQueue();


    } catch (error) {

        console.error(
            "Function revision error:",
            error
        );


        showError(
            error.message ||
            "Unable to return the function for revision."
        );

    } finally {

        setActionLoading(false);

    }

}


/* ==========================================================
   SUMMARY
========================================================== */

function updateSummary(records) {

    const pending =
        records.filter(
            function (record) {

                return normalizeStatus(
                    getValue(
                        record,
                        [
                            "validationStatus",
                            "ValidationStatus"
                        ]
                    )
                ) === "for validation";

            }
        ).length;


    const revision =
        records.filter(
            function (record) {

                return normalizeStatus(
                    getValue(
                        record,
                        [
                            "validationStatus",
                            "ValidationStatus"
                        ]
                    )
                ) === "needs revision";

            }
        ).length;


    setText(
        "pendingCount",
        pending
    );


    setText(
        "revisionCount",
        revision
    );


    setText(
        "totalCount",
        records.length
    );


    setText(
        "recordCount",
        records.length
    );

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function getValidationBadge(status) {

    const normalized =
        normalizeStatus(status);


    let className =
        "validation-badge";


    if (
        normalized === "for validation"
    ) {

        className +=
            " status-for-validation";

    } else if (
        normalized === "needs revision"
    ) {

        className +=
            " status-needs-revision";

    } else if (
        normalized === "validated"
    ) {

        className +=
            " status-validated";

    }


    return `

        <span class="${className}">
            ${escapeHTML(
                status ||
                "For Validation"
            )}
        </span>

    `;

}

/* ==========================================================
   CLEAR DETAILS
========================================================== */

function clearDetails() {

    const detailEmptyState =
        document.getElementById(
            "detailEmptyState"
        );

    const detailContent =
        document.getElementById(
            "detailContent"
        );


    if (detailEmptyState) {

        detailEmptyState.classList.remove(
            "d-none"
        );

    }


    if (detailContent) {

        detailContent.classList.add(
            "d-none"
        );

    }


    const remarksInput =
        document.getElementById(
            "remarksInput"
        );


    if (remarksInput) {

        remarksInput.value = "";

    }


    const existingRemarks =
        document.getElementById(
            "detailExistingRemarks"
        );


    if (existingRemarks) {

        existingRemarks.textContent = "";

        existingRemarks.classList.add(
            "d-none"
        );

    }

}

/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    const loadingState =
        document.getElementById(
            "loadingState"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (loadingState) {

        loadingState.classList.remove(
            "d-none"
        );

    }


    if (emptyState) {

        emptyState.classList.add(
            "d-none"
        );

    }


    const tableBody =
        document.getElementById(
            "functionTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = "";

    }

}


function hideLoading() {

    const loadingState =
        document.getElementById(
            "loadingState"
        );


    if (loadingState) {

        loadingState.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   EMPTY
========================================================== */

function showEmpty(message) {

    hideLoading();


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (emptyState) {

        emptyState.classList.remove(
            "d-none"
        );


        const paragraph =
            emptyState.querySelector(
                "p"
            );


        if (paragraph) {

            paragraph.textContent =
                message ||
                "No records are currently pending validation.";

        }

    }

}


function hideEmpty() {

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (emptyState) {

        emptyState.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   ACTION LOADING
========================================================== */

function setActionLoading(loading) {

    const validateButton =
        document.getElementById(
            "validateButton"
        );

    const revisionButton =
        document.getElementById(
            "revisionButton"
        );

    const refreshButton =
        document.getElementById(
            "refreshButton"
        );


    if (validateButton) {

        validateButton.disabled =
            loading;


        validateButton.innerHTML =
            loading

                ? '<span class="spinner-border spinner-border-sm me-1"></span> Processing...'

                : '<i class="bi bi-check-circle me-1"></i> Validate';

    }


    if (revisionButton) {

        revisionButton.disabled =
            loading;

    }


    if (refreshButton) {

        refreshButton.disabled =
            loading;

    }

}


/* ==========================================================
   ALERTS
========================================================== */

function showAlert(message, type) {

    const container =
        document.getElementById(
            "alertMessage"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div
            class="alert alert-${type}
                   alert-dismissible
                   fade show"
            role="alert">

            ${escapeHTML(message)}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>

    `;

}


function showSuccess(message) {

    showAlert(
        message,
        "success"
    );

}


function showWarning(message) {

    showAlert(
        message,
        "warning"
    );

}


function showError(message) {

    showAlert(
        message,
        "danger"
    );

}


function clearAlert() {

    const container =
        document.getElementById(
            "alertMessage"
        );


    if (container) {

        container.innerHTML = "";

    }

}


/* ==========================================================
   VALUE HELPER
========================================================== */

function getValue(record, keys) {

    if (!record) {

        return "";

    }


    for (
        let i = 0;
        i < keys.length;
        i++
    ) {

        const key =
            keys[i];


        if (
            record[key] !== undefined &&
            record[key] !== null
        ) {

            return record[key];

        }

    }


    return "";

}


/* ==========================================================
   TEXT HELPER
========================================================== */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "—"
            : String(value);

}


/* ==========================================================
   STATUS NORMALIZATION
========================================================== */

function normalizeStatus(status) {

    return String(
        status || ""
    )
    .trim()
    .toLowerCase();

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}