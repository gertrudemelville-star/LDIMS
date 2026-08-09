/* ==========================================================
   LDIMS API SERVICE
   Handles all communication between Frontend
   and Google Apps Script Backend.
========================================================== */

const API = {

    /* ======================================================
       Send POST Request
    ====================================================== */

    async post(data = {}) {

        try {

            const formData = new FormData();

            Object.keys(data).forEach(key => {

                formData.append(
                    key,
                    data[key] ?? ""
                );

            });


            const response = await fetch(
                CONFIG.API.BASE_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Server returned HTTP " +
                    response.status
                );

            }


            const result =
                await response.json();


            console.log(
                "LDIMS API RESPONSE:",
                result
            );


            return result;


        } catch (error) {

            console.error(
                "LDIMS API POST ERROR:",
                error
            );

            throw error;

        }

    },


    /* ======================================================
       Login
    ====================================================== */

    async login(employeeID, password) {

        return await this.post({

            action: "login",

            employeeID: employeeID,

            password: password

        });

    },


    /* ======================================================
       Logout
    ====================================================== */

    async logout(sessionId) {

        return await this.post({

            action: "logout",

            sessionId: sessionId

        });

    },


    /* ======================================================
       Get User
    ====================================================== */

    async getUser(sessionId) {

        return await this.post({

            action: "getUser",

            sessionId: sessionId

        });

    },


    /* ======================================================
       Save New Employee
    ====================================================== */

    async saveEmployee(employee) {

        return await this.post({

            action: "saveEmployee",

            ...employee

        });

    },


    /* ======================================================
       Get Employees
    ====================================================== */

    async getEmployees() {

        return await this.post({

            action: "getEmployees"

        });

    },


    /* ======================================================
       Get Employee By ID
    ====================================================== */

    async getEmployeeById(employeeID) {

        return await this.post({

            action: "getEmployeeById",

            employeeID: employeeID

        });

    },


    /* ======================================================
       Update Employee Profile
    ====================================================== */

    async updateEmployeeProfile(employee) {

        console.log(
            "Updating employee profile:",
            employee
        );


        return await this.post({

            action: "updateEmployeeProfile",

            ...employee

        });

    }

};