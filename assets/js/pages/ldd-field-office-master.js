document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadFieldOfficeValidationQueue();

        document
            .getElementById("validateBtn")
            .addEventListener(
                "click",
                function () {

                    processFieldOffice(
                        "Validate"
                    );

                }
            );


        document
            .getElementById("revisionBtn")
            .addEventListener(
                "click",
                function () {

                    processFieldOffice(
                        "Needs Revision"
                    );

                }
            );

    }
);


let fieldOfficeRecords = [];

let selectedFieldOffice = null;


/**
 * ============================================================
 * LOAD VALIDATION QUEUE
 * ============================================================
 */

async function loadFieldOfficeValidationQueue() {

    showLoading();


    try {

        const response =
            await API.post({

                action:
                    "getFieldOfficeValidationQueue"

            });


        console.log(
            "Field Office Validation Queue:",
            response
        );


        if (
            !response ||
            !response.success
        ) {

            throw new Error(
                response?.message ||
                "Unable to load field offices."
            );

        }


        fieldOfficeRecords =
            response.records || [];


        updateSummary(
            fieldOfficeRecords
        );


        renderFieldOfficeTable(
            fieldOfficeRecords
        );


    } catch (error) {

        console.error(
            "Field Office loading error:",
            error
        );


        showError(
            error.message ||
            "Unable to load field offices."
        );

    }

}


/**
 * ============================================================
 * SUMMARY
 * ============================================================
 */

function updateSummary(records) {

    const regional =
        records.filter(
            function (record) {

                return record.officeType ===
                    "Regional Office";

            }
        ).length;


    const district =
        records.filter(
            function (record) {

                return record.officeType ===
                    "District Office";

            }
        ).length;


    document
        .getElementById("pendingCount")
        .textContent =
        records.length;


    document
        .getElementById("regionalCount")
        .textContent =
        regional;


    document
        .getElementById("districtCount")
        .textContent =
        district;

}


/**
 * ============================================================
 * RENDER TABLE
 * ============================================================
 */

function renderFieldOfficeTable(records) {

    const tbody =
        document.getElementById(
            "fieldOfficeTableBody"
        );


    tbody.innerHTML = "";


    hideLoading();


    if (
        records.length === 0
    ) {

        document
            .getElementById("emptyState")
            .classList
            .remove("d-none");


        document
            .getElementById("tableContainer")
            .classList
            .add("d-none");


        return;

    }


    document
        .getElementById("emptyState")
        .classList
        .add("d-none");


    document
        .getElementById("tableContainer")
        .classList
        .remove("d-none");


    records.forEach(
        function (record, index) {

            const tr =
                document.createElement("tr");


            tr.className =
                "record-row";


            tr.dataset.index =
                index;


            tr.innerHTML = `

                <td>

                    <div class="fw-semibold">
                        ${escapeHtml(
                            record.officeName
                        )}
                    </div>

                    <div class="small text-muted">
                        ${escapeHtml(
                            record.acronym
                        )}
                    </div>

                </td>

                <td>
                    ${escapeHtml(
                        record.officeType
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        record.regionCode
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        record.provinceCity || "-"
                    )}
                </td>

                <td>

                    <span
                        class="badge bg-warning text-dark status-badge"
                    >
                        For Validation
                    </span>

                </td>

            `;


            tr.addEventListener(
                "click",
                function () {

                    selectFieldOffice(
                        index
                    );

                }
            );


            tbody.appendChild(
                tr
            );

        }
    );

}


/**
 * ============================================================
 * SELECT RECORD
 * ============================================================
 */

function selectFieldOffice(index) {

    selectedFieldOffice =
        fieldOfficeRecords[index];


    if (
        !selectedFieldOffice
    ) {

        return;

    }


    document
        .querySelectorAll(
            ".record-row"
        )
        .forEach(
            function (row) {

                row.classList.remove(
                    "selected"
                );

            }
        );


    const selectedRow =
        document.querySelector(
            `.record-row[data-index="${index}"]`
        );


    if (selectedRow) {

        selectedRow.classList.add(
            "selected"
        );

    }


    document
        .getElementById("noSelection")
        .classList
        .add("d-none");


    document
        .getElementById("recordDetails")
        .classList
        .remove("d-none");


    document
        .getElementById("detailFieldOfficeID")
        .textContent =
        selectedFieldOffice.fieldOfficeID;


    document
        .getElementById("detailOfficeName")
        .textContent =
        selectedFieldOffice.officeName;


    document
        .getElementById("detailAcronym")
        .textContent =
        selectedFieldOffice.acronym || "-";


    document
        .getElementById("detailOfficeType")
        .textContent =
        selectedFieldOffice.officeType;


    document
        .getElementById("detailRegion")
        .textContent =
        `${selectedFieldOffice.regionCode} - ${selectedFieldOffice.regionName}`;


    document
        .getElementById("detailLocation")
        .textContent =
        selectedFieldOffice.provinceCity || "-";


    document
        .getElementById("detailParentOrg")
        .textContent =
        selectedFieldOffice.parentOrgID;


    document
        .getElementById("detailValidationStatus")
        .textContent =
        selectedFieldOffice.validationStatus;


    document
        .getElementById("remarksInput")
        .value =
        selectedFieldOffice.remarks || "";

}


/**
 * ============================================================
 * PROCESS VALIDATION
 * ============================================================
 */

async function processFieldOffice(action) {

    if (
        !selectedFieldOffice
    ) {

        alert(
            "Please select a field-office record first."
        );

        return;

    }


    let remarks =
        document
            .getElementById("remarksInput")
            .value
            .trim();


    if (
        action === "Needs Revision" &&
        !remarks
    ) {

        alert(
            "Please provide remarks explaining what needs revision."
        );

        return;

    }


    const confirmation =
        action === "Validate"
            ? "Validate this field-office record?"
            : "Mark this field-office record as Needs Revision?";


    if (
        !confirm(
            confirmation
        )
    ) {

        return;

    }


    const validateBtn =
        document.getElementById(
            "validateBtn"
        );


    const revisionBtn =
        document.getElementById(
            "revisionBtn"
        );


    validateBtn.disabled =
        true;


    revisionBtn.disabled =
        true;


    try {

        const response =
            await API.post({

                action:
                    "validateFieldOfficeRecord",

                fieldOfficeID:
                    selectedFieldOffice.fieldOfficeID,

                validationAction:
                    action,

                remarks:
                    remarks

            });


        console.log(
            "Validation response:",
            response
        );


        if (
            !response ||
            !response.success
        ) {

            throw new Error(
                response?.message ||
                "Unable to update field-office record."
            );

        }


        alert(
            response.message ||
            "Field-office record updated successfully."
        );


        selectedFieldOffice =
            null;


        document
            .getElementById("noSelection")
            .classList
            .remove("d-none");


        document
            .getElementById("recordDetails")
            .classList
            .add("d-none");


        document
            .getElementById("remarksInput")
            .value = "";


        await loadFieldOfficeValidationQueue();


    } catch (error) {

        console.error(
            "Validation error:",
            error
        );


        alert(
            error.message ||
            "Unable to update record."
        );

    } finally {

        validateBtn.disabled =
            false;

        revisionBtn.disabled =
            false;

    }

}


/**
 * ============================================================
 * UI HELPERS
 * ============================================================
 */

function showLoading() {

    document
        .getElementById("loadingState")
        .classList
        .remove("d-none");


    document
        .getElementById("tableContainer")
        .classList
        .add("d-none");


    document
        .getElementById("emptyState")
        .classList
        .add("d-none");

}


function hideLoading() {

    document
        .getElementById("loadingState")
        .classList
        .add("d-none");

}


function showError(message) {

    hideLoading();


    const container =
        document.getElementById(
            "tableContainer"
        );


    container.classList.remove(
        "d-none"
    );


    container.innerHTML = `

        <div class="alert alert-danger">

            ${escapeHtml(message)}

        </div>

    `;

}


/**
 * ============================================================
 * HTML ESCAPE
 * ============================================================
 */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}