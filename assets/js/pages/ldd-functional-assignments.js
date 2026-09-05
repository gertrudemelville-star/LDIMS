"use strict";


/* ==========================================================
   LDIMS
   LDD FUNCTIONAL ASSIGNMENT
========================================================== */


const LDD_FUNCTIONAL_ASSIGNMENT = {

    employeeID: "",

    employee: null,

    assignment: null,

    functionOptions: []

};



/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "LDIMS LDD Functional Assignment JS loaded."
        );

        bindEvents();

    }
);



/* ==========================================================
   EVENT BINDINGS
========================================================== */

function bindEvents() {

    const loadButton =
        document.getElementById(
            "loadEmployeeButton"
        );


    const assignmentForm =
        document.getElementById(
            "assignmentForm"
        );


    const validateButton =
        document.getElementById(
            "validateButton"
        );


    const revisionButton =
        document.getElementById(
            "revisionButton"
        );


    const clearButton =
        document.getElementById(
            "clearButton"
        );


    const backButton =
        document.getElementById(
            "backButton"
        );


    const functionalArea =
        document.getElementById(
            "functionalArea"
        );


    const divisionUnit =
        document.getElementById(
            "divisionUnit"
        );


    const sectionSpecialization =
        document.getElementById(
            "sectionSpecialization"
        );


    if (loadButton) {

        loadButton.addEventListener(
            "click",
            loadAssignment
        );

    }


    if (assignmentForm) {

        assignmentForm.addEventListener(
            "submit",
            saveAssignment
        );

    }


    if (validateButton) {

        validateButton.addEventListener(
            "click",
            validateAssignment
        );

    }


    if (revisionButton) {

        revisionButton.addEventListener(
            "click",
            returnForRevision
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearForm
        );

    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";

            }
        );

    }


    /*
     * When Division or Section changes,
     * reload validated function options.
     */

    if (divisionUnit) {

        divisionUnit.addEventListener(
            "change",
            loadFunctionOptions
        );

    }


    if (sectionSpecialization) {

        sectionSpecialization.addEventListener(
            "change",
            loadFunctionOptions
        );

    }


    /*
     * Functional Area controls the Functional Role.
     */

    if (functionalArea) {

        functionalArea.addEventListener(
            "change",
            handleFunctionalAreaChange
        );

    }

}



/* ==========================================================
   LOAD EMPLOYEE + ASSIGNMENT
========================================================== */

async function loadAssignment() {

    console.log(
        "Load Assignment button clicked."
    );


    const employeeIDElement =
        document.getElementById(
            "employeeID"
        );


    const employeeID =
        employeeIDElement
            ? employeeIDElement.value.trim()
            : "";


    if (!employeeID) {

        showAlert(
            "Please enter an Employee ID.",
            "warning"
        );

        return;

    }


    setLoadState(true);


    try {

        /*
         * --------------------------------------------------
         * EMPLOYEE
         * --------------------------------------------------
         */

        const employeeResult =
            await API.post({

                action:
                    "getEmployeeById",

                employeeID:
                    employeeID

            });


        console.log(
            "Employee result:",
            employeeResult
        );


        if (
            !employeeResult ||
            employeeResult.success === false
        ) {

            showAlert(
                employeeResult &&
                employeeResult.message
                    ? employeeResult.message
                    : "Employee record not found.",
                "danger"
            );

            hideAssignment();

            return;

        }


        /*
         * --------------------------------------------------
         * FUNCTIONAL ASSIGNMENT
         * --------------------------------------------------
         */

        const assignmentResult =
            await API.post({

                action:
                    "getEmployeeFunctionalAssignment",

                employeeID:
                    employeeID

            });


        console.log(
            "Functional assignment result:",
            assignmentResult
        );


        if (
            !assignmentResult ||
            assignmentResult.success === false
        ) {

            showAlert(
                assignmentResult &&
                assignmentResult.message
                    ? assignmentResult.message
                    : "Unable to load functional assignment.",
                "danger"
            );

            return;

        }


        LDD_FUNCTIONAL_ASSIGNMENT.employeeID =
            employeeID;


        LDD_FUNCTIONAL_ASSIGNMENT.employee =
            employeeResult;


        LDD_FUNCTIONAL_ASSIGNMENT.assignment =
            assignmentResult.assignment ||
            null;


        renderEmployee(
            employeeResult
        );


        renderAssignment(
            assignmentResult.assignment
        );


        showAssignment();


        /*
         * --------------------------------------------------
         * LOAD CONTROLLED FUNCTION OPTIONS
         * --------------------------------------------------
         */

        await loadFunctionOptions();


        showAlert(
            "Functional assignment loaded successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Load functional assignment error:",
            error
        );


        showAlert(
            error.message ||
            "Unable to load functional assignment.",
            "danger"
        );


    } finally {

        setLoadState(false);

    }

}



/* ==========================================================
   LOAD VALIDATED FUNCTION MASTER OPTIONS
========================================================== */

async function loadFunctionOptions() {

    const serviceOffice =
        getValue(
            "serviceOffice"
        );


    const divisionUnit =
        getValue(
            "divisionUnit"
        );


    const sectionSpecialization =
        getValue(
            "sectionSpecialization"
        );


    const areaSelect =
        document.getElementById(
            "functionalArea"
        );


    const roleSelect =
        document.getElementById(
            "functionalRole"
        );


    const areaHelp =
        document.getElementById(
            "functionalAreaHelp"
        );


    const roleHelp =
        document.getElementById(
            "functionalRoleHelp"
        );


    if (!areaSelect || !roleSelect) {

        return;

    }


    /*
     * Reset dropdowns.
     */

    areaSelect.innerHTML =
        "";


    areaSelect.appendChild(
        createOption(
            "",
            "Select Functional Area"
        )
    );


    roleSelect.innerHTML =
        "";


    roleSelect.appendChild(
        createOption(
            "",
            "Select Functional Role / Duties"
        )
    );


    roleSelect.disabled =
        true;


    LDD_FUNCTIONAL_ASSIGNMENT.functionOptions =
        [];


    if (!serviceOffice) {

        if (areaHelp) {

            areaHelp.textContent =
                "Service / Office is required.";

        }

        return;

    }


    if (areaHelp) {

        areaHelp.textContent =
            "Loading validated functional areas...";

    }


    try {

        console.log(
            "Loading validated FUNCTION_MASTER options:",
            {
                serviceOffice:
                    serviceOffice,

                divisionUnit:
                    divisionUnit,

                sectionSpecialization:
                    sectionSpecialization
            }
        );


        const result =
            await API.post({

                action:
                    "getValidatedFunctionMasterOptions",

                serviceOffice:
                    serviceOffice,

                divisionUnit:
                    divisionUnit,

                sectionSpecialization:
                    sectionSpecialization

            });


        console.log(
            "FUNCTION_MASTER options result:",
            result
        );


        if (
            !result ||
            result.success === false
        ) {

            if (areaHelp) {

                areaHelp.textContent =
                    result &&
                    result.message
                        ? result.message
                        : "Unable to load functional options.";

            }

            return;

        }


        const functions =
            Array.isArray(
                result.functions
            )
                ? result.functions
                : [];


        LDD_FUNCTIONAL_ASSIGNMENT.functionOptions =
            functions;


        /*
         * No validated master records yet.
         */

        if (
            functions.length === 0
        ) {

            if (areaHelp) {

                areaHelp.textContent =
                    "No validated functional areas available for this assignment.";

            }


            if (roleHelp) {

                roleHelp.textContent =
                    "No validated functional roles available.";

            }


            return;

        }


        /*
         * Build unique Functional Area list.
         */

        const areas = [];


        functions.forEach(
            function (item) {

                const area =
                    String(
                        item.functionalArea ||
                        ""
                    ).trim();


                if (
                    area &&
                    areas.indexOf(area) === -1
                ) {

                    areas.push(
                        area
                    );

                }

            }
        );


        areas.sort();


        areas.forEach(
            function (area) {

                areaSelect.appendChild(

                    createOption(
                        area,
                        area
                    )

                );

            }
        );


        if (areaHelp) {

            areaHelp.textContent =
                areas.length +
                " validated functional area(s) available.";

        }


    } catch (error) {

        console.error(
            "FUNCTION_MASTER loading error:",
            error
        );


        if (areaHelp) {

            areaHelp.textContent =
                "Unable to load validated functional areas.";

        }

    }

}



/* ==========================================================
   FUNCTIONAL AREA CHANGE
========================================================== */

function handleFunctionalAreaChange() {

    const selectedArea =
        getValue(
            "functionalArea"
        );


    const roleSelect =
        document.getElementById(
            "functionalRole"
        );


    const roleHelp =
        document.getElementById(
            "functionalRoleHelp"
        );


    if (!roleSelect) {

        return;

    }


    roleSelect.innerHTML =
        "";


    roleSelect.appendChild(
        createOption(
            "",
            "Select Functional Role / Duties"
        )
    );


    roleSelect.disabled =
        true;


    if (!selectedArea) {

        if (roleHelp) {

            roleHelp.textContent =
                "Select a Functional Area first.";

        }

        return;

    }


    const matchingFunctions =
        LDD_FUNCTIONAL_ASSIGNMENT
            .functionOptions
            .filter(
                function (item) {

                    return String(
                        item.functionalArea ||
                        ""
                    )
                    .trim()
                    .toLowerCase() ===
                    selectedArea
                        .trim()
                        .toLowerCase();

                }
            );


    const roles = [];


    matchingFunctions.forEach(
        function (item) {

            const role =
                String(
                    item.functionalRole ||
                    ""
                ).trim();


            if (
                role &&
                roles.indexOf(role) === -1
            ) {

                roles.push(
                    role
                );

            }

        }
    );


    roles.sort();


    roles.forEach(
        function (role) {

            roleSelect.appendChild(

                createOption(
                    role,
                    role
                )

            );

        }
    );


    roleSelect.disabled =
        roles.length === 0;


    if (roleHelp) {

        roleHelp.textContent =
            roles.length +
            " validated functional role(s) available.";

    }

}



/* ==========================================================
   RENDER EMPLOYEE
========================================================== */

function renderEmployee(employee) {

    employee =
        employee || {};


    const employeeID =
        employee.employeeID ||
        employee.EmployeeID ||
        "—";


    const name =
        employee.fullname ||
        employee.fullName ||
        employee.FullName ||
        employee.name ||
        "—";


    const position =
        employee.position ||
        employee.Position ||
        "—";


    setText(
        "displayEmployeeID",
        employeeID
    );


    setText(
        "displayEmployeeName",
        name
    );


    setText(
        "displayEmployeePosition",
        position
    );

}



/* ==========================================================
   RENDER ASSIGNMENT
========================================================== */

function renderAssignment(assignment) {

    assignment =
        assignment || {};


    setValue(
        "serviceOffice",
        assignment.serviceOffice ||
        ""
    );


    setValue(
        "divisionUnit",
        assignment.divisionUnit ||
        ""
    );


    setValue(
        "sectionSpecialization",
        assignment.sectionSpecialization ||
        ""
    );


    setValue(
        "primaryAdditional",
        normalizePrimaryAdditional(
            assignment.primaryAdditional
        )
    );


    /*
     * Functional Area / Role are rendered after
     * validated FUNCTION_MASTER options load.
     */

    setValue(
        "functionalArea",
        assignment.functionalArea ||
        ""
    );


    setValue(
        "functionalRole",
        assignment.functionalRole ||
        ""
    );


    const status =
        assignment.validationStatus ||
        "For Validation";


    renderValidationStatus(
        status
    );


    const revisionRemarks =
        assignment.remarks ||
        assignment.revisionReason ||
        "";


    const revisionRemarksElement =
        document.getElementById(
            "revisionRemarks"
        );


    if (revisionRemarksElement) {

        revisionRemarksElement.textContent =
            revisionRemarks ||
            "No revision remarks provided.";

    }

}



/* ==========================================================
   SAVE ASSIGNMENT
========================================================== */

async function saveAssignment(event) {

    event.preventDefault();


    const employeeID =
        LDD_FUNCTIONAL_ASSIGNMENT.employeeID;


    if (!employeeID) {

        showAlert(
            "Please load an employee first.",
            "warning"
        );

        return;

    }


    const data = {

        action:
            "saveEmployeeFunctionalAssignment",

        employeeID:
            employeeID,

        serviceOffice:
            getValue(
                "serviceOffice"
            ),

        divisionUnit:
            getValue(
                "divisionUnit"
            ),

        sectionSpecialization:
            getValue(
                "sectionSpecialization"
            ),

        functionalArea:
            getValue(
                "functionalArea"
            ),

        functionalRole:
            getValue(
                "functionalRole"
            ),

        primaryAdditional:
            getValue(
                "primaryAdditional"
            )

    };


    if (!data.serviceOffice) {

        showAlert(
            "Service / Office is required.",
            "warning"
        );

        return;

    }


    if (!data.functionalArea) {

        showAlert(
            "Please select a Functional Area.",
            "warning"
        );

        return;

    }


    if (!data.functionalRole) {

        showAlert(
            "Please select a Functional Role / Duties.",
            "warning"
        );

        return;

    }


    setSaveState(true);


    try {

        const result =
            await API.post(
                data
            );


        console.log(
            "Save result:",
            result
        );


        if (
            !result ||
            result.success === false
        ) {

            showAlert(
                result &&
                result.message
                    ? result.message
                    : "Unable to save functional assignment.",
                "danger"
            );

            return;

        }


        showAlert(
            result.message ||
            "Functional assignment saved and submitted for validation.",
            "success"
        );


        await loadAssignment();


    } catch (error) {

        console.error(
            "Save functional assignment error:",
            error
        );


        showAlert(
            error.message ||
            "Unable to save functional assignment.",
            "danger"
        );


    } finally {

        setSaveState(false);

    }

}



/* ==========================================================
   VALIDATE ASSIGNMENT
========================================================== */

async function validateAssignment() {

    const employeeID =
        LDD_FUNCTIONAL_ASSIGNMENT.employeeID;


    if (!employeeID) {

        return;

    }


    const confirmed =
        window.confirm(
            "Validate this employee's functional assignment?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const result =
            await API.post({

                action:
                    "validateEmployeeFunctionalAssignment",

                employeeID:
                    employeeID,

                validationStatus:
                    "Validated",

                remarks:
                    getValue(
                        "validationRemarks"
                    )

            });


        console.log(
            "Validation result:",
            result
        );


        if (
            !result ||
            result.success === false
        ) {

            showAlert(
                result &&
                result.message
                    ? result.message
                    : "Unable to validate assignment.",
                "danger"
            );

            return;

        }


        showAlert(
            "Functional assignment has been validated.",
            "success"
        );


        await loadAssignment();


    } catch (error) {

        console.error(
            "Validate assignment error:",
            error
        );


        showAlert(
            error.message ||
            "Unable to validate assignment.",
            "danger"
        );

    }

}



/* ==========================================================
   RETURN FOR REVISION
========================================================== */

async function returnForRevision() {

    const employeeID =
        LDD_FUNCTIONAL_ASSIGNMENT.employeeID;


    if (!employeeID) {

        return;

    }


    const remarks =
        getValue(
            "validationRemarks"
        );


    if (!remarks) {

        showAlert(
            "Please provide remarks/revision reason.",
            "warning"
        );

        return;

    }


    try {

        const result =
            await API.post({

                action:
                    "validateEmployeeFunctionalAssignment",

                employeeID:
                    employeeID,

                validationStatus:
                    "Needs Revision",

                remarks:
                    remarks

            });


        console.log(
            "Revision result:",
            result
        );


        if (
            !result ||
            result.success === false
        ) {

            showAlert(
                result &&
                result.message
                    ? result.message
                    : "Unable to return assignment for revision.",
                "danger"
            );

            return;

        }


        showAlert(
            "Functional assignment returned for revision.",
            "success"
        );


        await loadAssignment();


    } catch (error) {

        console.error(
            "Return assignment error:",
            error
        );


        showAlert(
            error.message ||
            "Unable to return assignment for revision.",
            "danger"
        );

    }

}



/* ==========================================================
   VALIDATION STATUS
========================================================== */

function renderValidationStatus(status) {

    status =
        status ||
        "For Validation";


    const badge =
        document.getElementById(
            "validationBadge"
        );


    const revisionBox =
        document.getElementById(
            "revisionBox"
        );


    const validationCard =
        document.getElementById(
            "validationCard"
        );


    if (badge) {

        badge.textContent =
            status;


        badge.className =
            "badge " +
            getStatusClass(
                status
            );

    }


    if (
        status ===
        "Needs Revision"
    ) {

        if (revisionBox) {

            revisionBox.classList.remove(
                "d-none"
            );

        }


        if (validationCard) {

            validationCard.classList.remove(
                "d-none"
            );

        }


        return;

    }


    if (revisionBox) {

        revisionBox.classList.add(
            "d-none"
        );

    }


    if (validationCard) {

        if (
            status ===
            "Validated"
        ) {

            validationCard.classList.add(
                "d-none"
            );

        } else {

            validationCard.classList.remove(
                "d-none"
            );

        }

    }

}



/* ==========================================================
   OPTION HELPER
========================================================== */

function createOption(
    value,
    text
) {

    const option =
        document.createElement(
            "option"
        );


    option.value =
        value;


    option.textContent =
        text;


    return option;

}



/* ==========================================================
   NORMALIZE PRIMARY / ADDITIONAL
========================================================== */

function normalizePrimaryAdditional(value) {

    const normalized =
        String(
            value || ""
        )
        .trim()
        .toLowerCase();


    if (
        normalized ===
        "additional"
    ) {

        return "Additional";

    }


    return "Primary";

}



/* ==========================================================
   STATUS CLASS
========================================================== */

function getStatusClass(status) {

    switch (status) {

        case "Validated":

            return "bg-success";


        case "Needs Revision":

            return "bg-warning text-dark";


        case "For Validation":

            return "bg-secondary";


        default:

            return "bg-secondary";

    }

}



/* ==========================================================
   GET VALUE
========================================================== */

function getValue(id) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value.trim()
        : "";

}



/* ==========================================================
   SET VALUE
========================================================== */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value || "";

    }

}



/* ==========================================================
   SET TEXT
========================================================== */

function setText(
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
   SHOW ASSIGNMENT
========================================================== */

function showAssignment() {

    const employeeCard =
        document.getElementById(
            "employeeCard"
        );


    const assignmentCard =
        document.getElementById(
            "assignmentCard"
        );


    if (employeeCard) {

        employeeCard.classList.remove(
            "d-none"
        );

    }


    if (assignmentCard) {

        assignmentCard.classList.remove(
            "d-none"
        );

    }

}



/* ==========================================================
   HIDE ASSIGNMENT
========================================================== */

function hideAssignment() {

    const employeeCard =
        document.getElementById(
            "employeeCard"
        );


    const assignmentCard =
        document.getElementById(
            "assignmentCard"
        );


    const validationCard =
        document.getElementById(
            "validationCard"
        );


    if (employeeCard) {

        employeeCard.classList.add(
            "d-none"
        );

    }


    if (assignmentCard) {

        assignmentCard.classList.add(
            "d-none"
        );

    }


    if (validationCard) {

        validationCard.classList.add(
            "d-none"
        );

    }

}



/* ==========================================================
   CLEAR
========================================================== */

function clearForm() {

    const employeeID =
        document.getElementById(
            "employeeID"
        );


    const assignmentForm =
        document.getElementById(
            "assignmentForm"
        );


    if (employeeID) {

        employeeID.value =
            "";

    }


    if (assignmentForm) {

        assignmentForm.reset();

    }


    hideAssignment();


    LDD_FUNCTIONAL_ASSIGNMENT.employeeID =
        "";


    LDD_FUNCTIONAL_ASSIGNMENT.employee =
        null;


    LDD_FUNCTIONAL_ASSIGNMENT.assignment =
        null;


    LDD_FUNCTIONAL_ASSIGNMENT.functionOptions =
        [];

}



/* ==========================================================
   LOAD STATE
========================================================== */

function setLoadState(
    loading
) {

    const button =
        document.getElementById(
            "loadEmployeeButton"
        );


    const text =
        document.getElementById(
            "loadButtonText"
        );


    const spinner =
        document.getElementById(
            "loadSpinner"
        );


    if (button) {

        button.disabled =
            loading;

    }


    if (text) {

        text.classList.toggle(
            "d-none",
            loading
        );

    }


    if (spinner) {

        spinner.classList.toggle(
            "d-none",
            !loading
        );

    }

}



/* ==========================================================
   SAVE STATE
========================================================== */

function setSaveState(
    loading
) {

    const button =
        document.getElementById(
            "saveButton"
        );


    const text =
        document.getElementById(
            "saveButtonText"
        );


    const spinner =
        document.getElementById(
            "saveSpinner"
        );


    if (button) {

        button.disabled =
            loading;

    }


    if (text) {

        text.classList.toggle(
            "d-none",
            loading
        );

    }


    if (spinner) {

        spinner.classList.toggle(
            "d-none",
            !loading
        );

    }

}



/* ==========================================================
   ALERT
========================================================== */

function showAlert(
    message,
    type = "info"
) {

    const container =
        document.getElementById(
            "alertContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const alert =
        document.createElement(
            "div"
        );


    alert.className =
        "alert alert-" +
        type;


    alert.setAttribute(
        "role",
        "alert"
    );


    alert.textContent =
        message;


    container.appendChild(
        alert
    );

}