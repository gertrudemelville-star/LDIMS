/* ==========================================================
   LDIMS - Profile Page
   Module: Employee Profile
========================================================== */

"use strict";


/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        /* --------------------------------------------------
           Require authenticated session
        -------------------------------------------------- */

        Session.requireLogin();


        /* --------------------------------------------------
           Get current session
        -------------------------------------------------- */

        const session = Session.get();


        if (!session) {
            return;
        }


        /* --------------------------------------------------
           Get Employee ID
        -------------------------------------------------- */

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


        /* --------------------------------------------------
           Load employee profile
        -------------------------------------------------- */

        await loadProfile(
            String(employeeID).trim()
        );


        /* --------------------------------------------------
           Bind buttons
        -------------------------------------------------- */

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

});


/* ==========================================================
   Load Profile
========================================================== */

async function loadProfile(employeeID) {

    try {

        setLoadingState();


        /* --------------------------------------------------
           Request employee information from backend
        -------------------------------------------------- */

        const result =
            await API.getEmployeeById(
                employeeID
            );


        /* --------------------------------------------------
           Validate response
        -------------------------------------------------- */

        if (!result) {

            showProfileError(
                "No response was received from the server."
            );

            return;

        }


        if (result.success === false) {

            showProfileError(
                result.message ||
                "Employee profile could not be loaded."
            );

            return;

        }


        /*
         * Employee.gs currently returns the employee
         * object directly:
         *
         * {
         *     EmployeeID: "...",
         *     LastName: "...",
         *     FirstName: "...",
         *     ...
         * }
         *
         * This also supports a future wrapped response.
         */

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


        /* --------------------------------------------------
           Populate profile
        -------------------------------------------------- */

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
       Employee name
    ------------------------------------------------------ */

    const fullName =
        buildFullName(employee);


    setValue(
        "fullName",
        fullName
    );


    /* ------------------------------------------------------
       Basic employee information
    ------------------------------------------------------ */

    setValue(
        "employeeID",
        employee.EmployeeID
    );


    setValue(
        "email",
        employee.Email
    );


    setValue(
        "contactNumber",
        employee.ContactNumber
    );


    setValue(
        "civilStatus",
        employee.CivilStatus
    );


    /* ------------------------------------------------------
       Organizational information
    ------------------------------------------------------ */

    setValue(
        "position",
        employee.Position
    );


    setValue(
        "employeePosition",
        employee.Position
    );


    /*
     * The current Employees sheet contains
     * PlaceOfAssignment.
     *
     * The existing profile HTML calls this field
     * "Division", so we display PlaceOfAssignment there
     * without inventing a separate Division value.
     */

    setValue(
        "division",
        employee.PlaceOfAssignment
    );


    /*
     * Section is not currently part of the confirmed
     * Employees database structure.
     */

    setValue(
        "section",
        "Not available"
    );


    /*
     * Salary Grade is not currently part of the
     * confirmed Employees database structure.
     */

    setValue(
        "salaryGrade",
        "Not available"
    );


    setValue(
        "supervisor",
        employee.ImmediateSupervisor
    );


    /* ------------------------------------------------------
       Employment information
    ------------------------------------------------------ */

    /*
     * Appointment Date is not currently part of the
     * confirmed Employees database structure.
     */

    setValue(
        "appointmentDate",
        "Not available"
    );


    setValue(
        "yearsInService",
        employee.LengthInService
    );


    setValue(
        "employmentStatus",
        employee.EmploymentStatus
    );


    /* ------------------------------------------------------
       Profile photo
    ------------------------------------------------------ */

    setProfilePhoto(
        employee.ProfilePhoto
    );


    /* ------------------------------------------------------
       Learning information
    ------------------------------------------------------ */

    /*
     * Training information will be connected through
     * the Training module after the current Training
     * Records structure is reconciled.
     */

    setValue(
        "latestTraining",
        "Not available"
    );


    setValue(
        "learningHours",
        "Not available"
    );


    setValue(
        "certificateCount",
        "Not available"
    );

}


/* ==========================================================
   Build Full Name
========================================================== */

function buildFullName(employee) {

    const parts = [];


    if (employee.FirstName) {

        parts.push(
            String(
                employee.FirstName
            ).trim()
        );

    }


    if (employee.MiddleName) {

        const middleName =
            String(
                employee.MiddleName
            ).trim();


        if (middleName) {

            parts.push(
                middleName.charAt(0) + "."
            );

        }

    }


    if (employee.LastName) {

        parts.push(
            String(
                employee.LastName
            ).trim()
        );

    }


    if (employee.NameExtension) {

        parts.push(
            String(
                employee.NameExtension
            ).trim()
        );

    }


    if (parts.length === 0) {

        return "Not available";

    }


    return parts.join(" ");

}


/* ==========================================================
   Set Profile Value
========================================================== */

function setValue(id, value) {

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
        "division",
        "section",
        "salaryGrade",
        "supervisor",
        "appointmentDate",
        "yearsInService",
        "latestTraining",
        "learningHours",
        "certificateCount"

    ];


    fields.forEach(
        function(id) {

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


    setValue(
        "employeePosition",
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
        "division",
        "section",
        "salaryGrade",
        "supervisor",
        "appointmentDate",
        "yearsInService",
        "latestTraining",
        "learningHours",
        "certificateCount"

    ];


    fields.forEach(
        function(id) {

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

    /* ------------------------------------------------------
       Edit Profile
    ------------------------------------------------------ */

    const editButton =
        document.getElementById(
            "btnEditProfile"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            function() {

                window.location.href =
                    "edit-profile.html";

            }
        );

    }


    /* ------------------------------------------------------
       Organizational Update Request
    ------------------------------------------------------ */

    const requestButton =
        document.getElementById(
            "btnRequestUpdate"
        );


    if (requestButton) {

        requestButton.addEventListener(
            "click",
            function() {

                window.location.href =
                    "requests/organizational-update.html";

            }
        );

    }

}