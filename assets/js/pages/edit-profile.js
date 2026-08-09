/* ==========================================================
   LDIMS - Edit Profile Page
   Module: Employee Profile
========================================================== */

"use strict";


/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            Session.requireLogin();


            const session =
                Session.get();


            if (!session) {
                return;
            }


            const employeeID =
                session.employeeID ||
                session.EmployeeID ||
                session.employeeId;


            if (!employeeID) {

                showAlert(
                    "Employee ID is not available in your session.",
                    "danger"
                );

                disableForm();

                return;

            }


            const employeeIDField =
                document.getElementById(
                    "employeeID"
                );


            if (employeeIDField) {

                employeeIDField.value =
                    String(
                        employeeID
                    ).trim();

            }


            await loadEmployeeProfile(
                String(
                    employeeID
                ).trim()
            );


            bindForm();


        } catch (error) {

            console.error(
                "Edit Profile initialization failed:",
                error
            );


            showAlert(
                "Unable to initialize the Edit Profile page.",
                "danger"
            );

        }

    }
);


/* ==========================================================
   Load Employee Profile
========================================================== */

async function loadEmployeeProfile(
    employeeID
) {

    try {

        showLoadingState();


        const result =
            await API.getEmployeeById(
                employeeID
            );


        if (!result) {

            showAlert(
                "No response was received from the server.",
                "danger"
            );

            return;

        }


        if (result.success === false) {

            showAlert(
                result.message ||
                "Employee profile could not be loaded.",
                "danger"
            );

            return;

        }


        const employee =
            result.data ||
            result.employee ||
            result;


        if (
            !employee ||
            typeof employee !== "object"
        ) {

            showAlert(
                "Employee profile data was not found.",
                "danger"
            );

            return;

        }


        populateForm(
            employee
        );


        hideLoadingState();


    } catch (error) {

        console.error(
            "Employee profile loading failed:",
            error
        );


        showAlert(
            "Unable to load employee information.",
            "danger"
        );

    }

}


/* ==========================================================
   Populate Form
========================================================== */

function populateForm(
    employee
) {

    setFieldValue(
        "employeeID",
        employee.EmployeeID
    );


    setFieldValue(
        "lastName",
        employee.LastName
    );


    setFieldValue(
        "firstName",
        employee.FirstName
    );


    setFieldValue(
        "middleName",
        employee.MiddleName
    );


    setFieldValue(
        "nameExtension",
        employee.NameExtension
    );


    setFieldValue(
        "sex",
        normalizeSelectValue(
            employee.Sex
        )
    );


    setFieldValue(
        "dateOfBirth",
        formatDateForInput(
            employee.DateOfBirth
        )
    );


    setFieldValue(
        "civilStatus",
        employee.CivilStatus
    );


    setFieldValue(
        "contactNumber",
        employee.ContactNumber
    );


    setFieldValue(
        "email",
        employee.Email
    );


    setFieldValue(
        "currentDuties",
        employee.CurrentDutiesAndResponsibilities ||
        employee[
            "CURRENT DUTIES AND RESPONSIBILITIES"
        ] ||
        ""
    );


    setFieldValue(
        "position",
        employee.Position
    );


    setFieldValue(
        "designation",
        employee.Designation
    );


    setFieldValue(
        "placeOfAssignment",
        employee.PlaceOfAssignment
    );


    setFieldValue(
        "immediateSupervisor",
        employee.ImmediateSupervisor
    );


    setFieldValue(
        "lengthInService",
        employee.LengthInService
    );


    setFieldValue(
        "yearsInCurrentPosition",
        employee.YearsInCurrentPosition
    );

}


/* ==========================================================
   Bind Form
========================================================== */

function bindForm() {

    const form =
        document.getElementById(
            "editProfileForm"
        );


    if (!form) {

        console.error(
            "Edit Profile form was not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            await saveProfile();

        }
    );

}


/* ==========================================================
   Save Profile
========================================================== */

async function saveProfile() {

    const employeeID =
        getFieldValue(
            "employeeID"
        );


    if (!employeeID) {

        showAlert(
            "Employee ID is required.",
            "danger"
        );

        return;

    }


    /* ------------------------------------------------------
       Collect editable fields
    ------------------------------------------------------ */

    const employee = {

        EmployeeID:
            employeeID,

        LastName:
            getFieldValue(
                "lastName"
            ),

        FirstName:
            getFieldValue(
                "firstName"
            ),

        MiddleName:
            getFieldValue(
                "middleName"
            ),

        NameExtension:
            getFieldValue(
                "nameExtension"
            ),

        Sex:
            getFieldValue(
                "sex"
            ),

        DateOfBirth:
            getFieldValue(
                "dateOfBirth"
            ),

        CivilStatus:
            getFieldValue(
                "civilStatus"
            ),

        ContactNumber:
            getFieldValue(
                "contactNumber"
            ),

        Email:
            getFieldValue(
                "email"
            ),

        CurrentDutiesAndResponsibilities:
            getFieldValue(
                "currentDuties"
            )

    };


    /* ------------------------------------------------------
       Basic validation
    ------------------------------------------------------ */

    if (
        !employee.LastName ||
        !employee.FirstName
    ) {

        showAlert(
            "Last Name and First Name are required.",
            "warning"
        );

        return;

    }


    if (!employee.Email) {

        showAlert(
            "Email Address is required.",
            "warning"
        );

        return;

    }


    /* ------------------------------------------------------
       Saving state
    ------------------------------------------------------ */

    setSavingState(
        true
    );


    try {

        const result =
            await API.updateEmployeeProfile(
                employee
            );


        if (
            result &&
            result.success
        ) {

            showAlert(
                "Profile updated successfully.",
                "success"
            );


            /*
             * Give the user a moment to see
             * the success message before
             * returning to Profile.
             */

            setTimeout(
                function () {

                    window.location.href =
                        "profile.html";

                },
                1000
            );


            return;

        }


        showAlert(
            result?.message ||
            "Unable to update your profile.",
            "danger"
        );


    } catch (error) {

        console.error(
            "Profile update failed:",
            error
        );


        showAlert(
            "Unable to save your profile.",
            "danger"
        );


    } finally {

        setSavingState(
            false
        );

    }

}


/* ==========================================================
   Get Field Value
========================================================== */

function getFieldValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return String(
        element.value || ""
    ).trim();

}


/* ==========================================================
   Set Field Value
========================================================== */

function setFieldValue(
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


    if (
        value === null ||
        value === undefined
    ) {

        element.value = "";

        return;

    }


    element.value =
        String(value);

}


/* ==========================================================
   Normalize Select Value
========================================================== */

function normalizeSelectValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const normalized =
        String(value)
            .trim()
            .toUpperCase();


    if (
        normalized === "MALE"
    ) {

        return "MALE";

    }


    if (
        normalized === "FEMALE"
    ) {

        return "FEMALE";

    }


    return String(
        value
    ).trim();

}


/* ==========================================================
   Format Date For HTML Date Input
========================================================== */

function formatDateForInput(
    value
) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return "";

    }


    const stringValue =
        String(value).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(
                stringValue
            )
    ) {

        return stringValue;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


/* ==========================================================
   Set Saving State
========================================================== */

function setSavingState(
    saving
) {

    const button =
        document.getElementById(
            "btnSaveProfile"
        );


    const buttonText =
        document.getElementById(
            "saveButtonText"
        );


    const spinner =
        document.getElementById(
            "saveSpinner"
        );


    if (button) {

        button.disabled =
            saving;

    }


    if (buttonText) {

        buttonText.classList.toggle(
            "d-none",
            saving
        );

    }


    if (spinner) {

        spinner.classList.toggle(
            "d-none",
            !saving
        );

    }

}


/* ==========================================================
   Loading State
========================================================== */

function showLoadingState() {

    const button =
        document.getElementById(
            "btnSaveProfile"
        );


    if (button) {

        button.disabled =
            true;

    }


    const inputs =
        document.querySelectorAll(
            "#editProfileForm input:not([readonly]), " +
            "#editProfileForm select, " +
            "#editProfileForm textarea"
        );


    inputs.forEach(
        element => {

            element.disabled =
                true;

        }
    );

}


/* ==========================================================
   Hide Loading State
========================================================== */

function hideLoadingState() {

    const button =
        document.getElementById(
            "btnSaveProfile"
        );


    if (button) {

        button.disabled =
            false;

    }


    const inputs =
        document.querySelectorAll(
            "#editProfileForm input:not([readonly]), " +
            "#editProfileForm select, " +
            "#editProfileForm textarea"
        );


    inputs.forEach(
        element => {

            element.disabled =
                false;

        }
    );

}


/* ==========================================================
   Disable Form
========================================================== */

function disableForm() {

    const form =
        document.getElementById(
            "editProfileForm"
        );


    if (!form) {
        return;
    }


    const elements =
        form.querySelectorAll(
            "input, select, textarea, button"
        );


    elements.forEach(
        element => {

            element.disabled =
                true;

        }
    );

}


/* ==========================================================
   Alert
========================================================== */

function showAlert(
    message,
    type = "info"
) {

    const alertContainer =
        document.getElementById(
            "alertMessage"
        );


    if (!alertContainer) {
        return;
    }


    alertContainer.innerHTML =
        "";


    const alert =
        document.createElement(
            "div"
        );


    alert.className =
        `alert alert-${type}`;


    alert.setAttribute(
        "role",
        "alert"
    );


    alert.textContent =
        message;


    alertContainer.appendChild(
        alert
    );

}