/* ==========================================================
   LDIMS - Profile Page
   Module: Employee Profile
========================================================== */

"use strict";


/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

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

                showProfileError(
                    "Employee ID is not available in your session."
                );

                return;

            }


            await loadProfile(
                String(employeeID).trim()
            );


            bindProfileActions();


        } catch (error) {

            console.error(
                "Profile initialization failed:",
                error
            );


            showProfileError(
                "Unable to load your profile."
            );

        }

    }
);


/* ==========================================================
   Load Profile
========================================================== */

async function loadProfile(employeeID) {

    try {

        setLoadingState();


        const result =
            await API.getEmployeeProfile(
                employeeID
            );


        console.log(
            "PROFILE RESPONSE:",
            result
        );


        if (!result) {

            showProfileError(
                "No response was received from the server."
            );

            return;

        }


        if (
            result.success !== true
        ) {

            showProfileError(
                result.message ||
                "Employee profile could not be loaded."
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

            showProfileError(
                "Employee profile data was not found."
            );

            return;

        }


        populateProfile(
            employee
        );


    } catch (error) {

        console.error(
            "Profile loading failed:",
            error
        );


        showProfileError(
            "Unable to load employee information."
        );

    }

}


/* ==========================================================
   Populate Profile
========================================================== */

function populateProfile(employee) {

    /* ------------------------------------------------------
       Basic Information
    ------------------------------------------------------ */

    setValue(
        "fullName",
        employee.fullName
    );


    setValue(
        "employeeID",
        employee.employeeID
    );


    setValue(
        "email",
        employee.email
    );


    setValue(
        "contactNumber",
        employee.contactNumber
    );


    setValue(
        "civilStatus",
        employee.civilStatus
    );


    /* ------------------------------------------------------
       Organizational Information
    ------------------------------------------------------ */

    setValue(
        "position",
        employee.position
    );


    setValue(
        "employeePosition",
        employee.position
    );


    setValue(
        "designation",
        employee.designation
    );


    setValue(
        "division",
        employee.division
    );


    setValue(
        "supervisor",
        employee.supervisor
    );


    /* ------------------------------------------------------
       Employment Information
    ------------------------------------------------------ */

    setValue(
        "yearsInService",
        employee.yearsInService
    );


    setValue(
        "yearsInCurrentPosition",
        employee.yearsInCurrentPosition
    );


    setValue(
        "employmentStatus",
        employee.employmentStatus
    );


    /* ------------------------------------------------------
       Fields not currently available in database
       -------------------------------------------------- */

    setValue(
        "section",
        "Not available"
    );


    setValue(
        "salaryGrade",
        "Not available"
    );


    setValue(
        "appointmentDate",
        "Not available"
    );


    /* ------------------------------------------------------
       Profile Photo
    ------------------------------------------------------ */

    setProfilePhoto(
        employee.profilePhoto
    );


    /* ------------------------------------------------------
       Learning Information
    ------------------------------------------------------ */

    setValue(
        "latestTraining",
        employee.latestTraining
    );


    setValue(
        "learningHours",
        employee.learningHours
    );


    setValue(
        "certificateCount",
        employee.certificates
    );

}


/* ==========================================================
   Set Profile Value
========================================================== */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        element.textContent =
            "Not available";

        return;

    }


    element.textContent =
        String(value);

}


/* ==========================================================
   Set Profile Photo
========================================================== */

function setProfilePhoto(photo) {

    const element =
        document.getElementById(
            "profilePhoto"
        );


    if (!element) {
        return;
    }


    if (
        !photo ||
        String(photo).trim() === ""
    ) {

        element.src =
            "../assets/images/profile-default.png";

        return;

    }


    element.src =
        String(photo);

}


/* ==========================================================
   Loading State
========================================================== */

function setLoadingState() {

    const fields = [

        "employeeID",
        "email",
        "contactNumber",
        "civilStatus",
        "position",
        "employeePosition",
        "designation",
        "division",
        "section",
        "salaryGrade",
        "supervisor",
        "appointmentDate",
        "yearsInService",
        "yearsInCurrentPosition",
        "employmentStatus",
        "latestTraining",
        "learningHours",
        "certificateCount"

    ];


    fields.forEach(
        function (id) {

            setValue(
                id,
                "Loading..."
            );

        }
    );


    setValue(
        "fullName",
        "Loading..."
    );

}


/* ==========================================================
   Profile Error State
========================================================== */

function showProfileError(message) {

    setValue(
        "fullName",
        "Unable to load profile"
    );


    setValue(
        "employeePosition",
        message ||
        "Please try again."
    );


    const fields = [

        "employeeID",
        "email",
        "contactNumber",
        "civilStatus",
        "position",
        "designation",
        "division",
        "section",
        "salaryGrade",
        "supervisor",
        "appointmentDate",
        "yearsInService",
        "yearsInCurrentPosition",
        "employmentStatus",
        "latestTraining",
        "learningHours",
        "certificateCount"

    ];


    fields.forEach(
        function (id) {

            setValue(
                id,
                "Not available"
            );

        }
    );

}


/* ==========================================================
   Profile Buttons
========================================================== */

function bindProfileActions() {

    const editButton =
        document.getElementById(
            "btnEditProfile"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "edit-profile.html";

            }
        );

    }


    const requestButton =
        document.getElementById(
            "btnRequestUpdate"
        );


    if (requestButton) {

        requestButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "requests/organizational-update.html";

            }
        );

    }

}