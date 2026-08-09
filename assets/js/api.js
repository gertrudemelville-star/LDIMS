/* ==========================================================
   LDIMS API SERVICE
   Learning & Development Information Management System

   Handles communication between the Frontend
   and Google Apps Script Backend.
========================================================== */

"use strict";

const API = {

    /* ======================================================
       POST REQUEST
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

            const result = await response.json();

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
       LOGIN
    ====================================================== */

    async login(employeeID, password) {

        return await this.post({

            action: "login",

            employeeID: employeeID,

            password: password

        });

    },


    /* ======================================================
       LOGOUT
    ====================================================== */

    async logout(sessionId) {

        return await this.post({

            action: "logout",

            sessionId: sessionId

        });

    },


    /* ======================================================
       GET USER
    ====================================================== */

    async getUser(sessionId) {

        return await this.post({

            action: "getUser",

            sessionId: sessionId

        });

    },


    /* ======================================================
       SAVE EMPLOYEE
    ====================================================== */

    async saveEmployee(employee) {

        return await this.post({

            action: "saveEmployee",

            ...employee

        });

    },


    /* ======================================================
       GET ALL EMPLOYEES
    ====================================================== */

    async getEmployees() {

        return await this.post({

            action: "getEmployees"

        });

    },


    /* ======================================================
       GET EMPLOYEE BY ID
    ====================================================== */

    async getEmployeeById(employeeID) {

        return await this.post({

            action: "getEmployeeById",

            employeeID: employeeID

        });

    },


    /* ======================================================
       UPDATE EMPLOYEE PROFILE
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