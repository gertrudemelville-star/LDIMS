"use strict";


/* ==========================================================
   LDIMS
   ORGANIZATIONAL MASTER VALIDATION
========================================================== */


let organizationalRecords = [];

let selectedRecord = null;

let organizationModal = null;


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        organizationModal =
            new bootstrap.Modal(
                document.getElementById(
                    "organizationModal"
                )
            );


        bindEvents();

        loadOrganizationalValidationQueue();

    }
);


/* ==========================================================
   EVENTS
========================================================== */

function bindEvents() {

    document
        .getElementById(
            "refreshButton"
        )
        .addEventListener(
            "click",
            loadOrganizationalValidationQueue
        );


    document
        .getElementById(
            "modalValidateButton"
        )
        .addEventListener(
            "click",
            function () {

                processValidation(
                    "Validate"
                );

            }
        );


    document
        .getElementById(
            "modalRevisionButton"
        )
        .addEventListener(
            "click",
            function () {

                processValidation(
                    "Needs Revision"
                );

            }
        );

}


/* ==========================================================
   LOAD QUEUE
========================================================== */

async function loadOrganizationalValidationQueue() {

    showLoading();

    clearError();


    try {

        const response =
            await API.post({

                action:
                    "getOrganizationalMasterValidationQueue"

            });


        console.log(
            "Organizational Master response:",
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
                    : "Unable to load organizational records."
            );

        }


        organizationalRecords =
            Array.isArray(
                response.records
            )
                ? response.records
                : [];


        updateSummary();

        renderTable();


    } catch (error) {

        console.error(
            "Organizational Master loading error:",
            error
        );


        showError(
            error.message ||
            "Unable to load organizational records."
        );

    }

}


/* ==========================================================
   SUMMARY
========================================================== */

function updateSummary() {

    const total =
        organizationalRecords.length;


    const offices =
        organizationalRecords.filter(
            record =>
                record.organizationalLevel ===
                "Office"
        ).length;


    const otherUnits =
        total -
        offices;


    document
        .getElementById(
            "totalForValidation"
        )
        .textContent =
        total;


    document
        .getElementById(
            "totalOffices"
        )
        .textContent =
        offices;


    document
        .getElementById(
            "totalSubUnits"
        )
        .textContent =
        otherUnits;

}


/* ==========================================================
   RENDER TABLE
========================================================== */

function renderTable() {

    const tbody =
        document.getElementById(
            "organizationTableBody"
        );


    tbody.innerHTML = "";


    if (
        organizationalRecords.length === 0
    ) {

        document
            .getElementById(
                "tableContainer"
            )
            .classList
            .add("d-none");


        document
            .getElementById(
                "emptyMessage"
            )
            .classList
            .remove("d-none");


        hideLoading();

        return;

    }


    organizationalRecords.forEach(
        function (record) {

            const row =
                document.createElement(
                    "tr"
                );


            row.style.cursor =
                "pointer";


            row.innerHTML = `

                <td>

                    <div class="fw-semibold">
                        ${escapeHtml(
                            record.organizationalName
                        )}
                    </div>

                    <div class="small text-muted">
                        ${escapeHtml(
                            record.orgID
                        )}
                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        record.organizationalLevel
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        record.acronym || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        record.parentOrgID || "—"
                    )}
                </td>


                <td>

                    <span class="badge text-bg-warning">
                        For Validation
                    </span>

                </td>

            `;


            row.addEventListener(
                "click",
                function () {

                    openOrganizationModal(
                        record
                    );

                }
            );


            tbody.appendChild(
                row
            );

        }
    );


    document
        .getElementById(
            "tableContainer"
        )
        .classList
        .remove("d-none");


    document
        .getElementById(
            "emptyMessage"
        )
        .classList
        .add("d-none");


    hideLoading();

}


/* ==========================================================
   OPEN MODAL
========================================================== */

function openOrganizationModal(
    record
) {

    selectedRecord =
        record;


    setText(
        "modalOrgID",
        record.orgID
    );


    setText(
        "modalName",
        record.organizationalName
    );


    setText(
        "modalLevel",
        record.organizationalLevel
    );


    setText(
        "modalAcronym",
        record.acronym || "—"
    );


    setText(
        "modalParent",
        record.parentOrgID || "—"
    );


    setText(
        "modalService",
        record.serviceOffice || "—"
    );


    setText(
        "modalDivision",
        record.divisionUnit || "—"
    );


    setText(
        "modalRegional",
        record.regionalOffice || "—"
    );


    setText(
        "modalDistrict",
        record.districtOffice || "—"
    );


    setText(
        "modalSource",
        record.source || "—"
    );


    document
        .getElementById(
            "modalRemarks"
        )
        .value =
        record.remarks || "";


    organizationModal.show();

}


/* ==========================================================
   VALIDATE / REVISION
========================================================== */

async function processValidation(
    action
) {

    if (
        !selectedRecord
    ) {

        return;

    }


    const message =
        action === "Validate"

            ? "Validate this organizational record?"

            : "Mark this organizational record as Needs Revision?";


    if (
        !confirm(message)
    ) {

        return;

    }


    const remarks =
        document
            .getElementById(
                "modalRemarks"
            )
            .value
            .trim();


    setButtonsDisabled(
        true
    );


    try {

        const response =
            await API.post({

                action:
                    "validateOrganizationalMasterRecord",

                orgID:
                    selectedRecord.orgID,

                validationAction:
                    action,

                remarks:
                    remarks

            });


        console.log(
            "Organizational validation response:",
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
                    : "Unable to update organizational record."
            );

        }


        organizationModal.hide();


        selectedRecord =
            null;


        await loadOrganizationalValidationQueue();


    } catch (error) {

        console.error(
            "Organizational validation error:",
            error
        );


        alert(
            error.message ||
            "Unable to update organizational record."
        );

    } finally {

        setButtonsDisabled(
            false
        );

    }

}


/* ==========================================================
   UI HELPERS
========================================================== */

function showLoading() {

    document
        .getElementById(
            "loadingMessage"
        )
        .classList
        .remove("d-none");

}


function hideLoading() {

    document
        .getElementById(
            "loadingMessage"
        )
        .classList
        .add("d-none");

}


function showError(
    message
) {

    hideLoading();


    const element =
        document.getElementById(
            "errorMessage"
        );


    element.textContent =
        message;


    element.classList.remove(
        "d-none"
    );


    document
        .getElementById(
            "tableContainer"
        )
        .classList
        .add("d-none");

}


function clearError() {

    document
        .getElementById(
            "errorMessage"
        )
        .classList
        .add("d-none");

}


function setButtonsDisabled(
    disabled
) {

    document
        .getElementById(
            "modalValidateButton"
        )
        .disabled =
        disabled;


    document
        .getElementById(
            "modalRevisionButton"
        )
        .disabled =
        disabled;


    document
        .getElementById(
            "refreshButton"
        )
        .disabled =
        disabled;

}


function setText(
    elementID,
    value
) {

    document
        .getElementById(
            elementID
        )
        .textContent =
        value || "—";

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(
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