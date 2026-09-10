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

    const maxAttempts = 2;

    let lastError = null;


    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            const formData =
                new FormData();


            Object.keys(data).forEach(
                key => {

                    formData.append(
                        key,
                        data[key] ?? ""
                    );

                }
            );


            /*
             * Always create a fresh Apps Script request URL.
             */

            const requestUrl =
                CONFIG.API.BASE_URL +
                "?_=" +
                Date.now() +
                "_" +
                attempt;


            console.log(
                "LDIMS API REQUEST:",
                {
                    action: data.action,
                    attempt: attempt
                }
            );


            const response =
                await fetch(
                    requestUrl,
                    {
                        method: "POST",

                        body: formData,

                        redirect: "follow",

                        cache: "no-store"
                    }
                );


            console.log(
                "LDIMS API HTTP STATUS:",
                response.status
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

            lastError =
                error;


            console.error(
                "LDIMS API POST ERROR:",
                {
                    action: data.action,
                    attempt: attempt,
                    error: error
                }
            );


            /*
             * Retry once for transient Apps Script
             * redirect / 404 errors.
             */

            if (
                attempt <
                    maxAttempts
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            1000
                        )
                );


                continue;

            }

        }

    }


    throw lastError;

},


    /* ======================================================
       LOGIN
    ====================================================== */

    async login(
        employeeID,
        password
    ) {

        return await this.post({

            action:
                "login",

            employeeID:
                employeeID,

            password:
                password

        });

    },


    /* ======================================================
       LOGOUT
    ====================================================== */

    async logout(
        sessionId
    ) {

        return await this.post({

            action:
                "logout",

            sessionId:
                sessionId

        });

    },


    /* ======================================================
       GET USER
    ====================================================== */

    async getUser(
        sessionId
    ) {

        return await this.post({

            action:
                "getUser",

            sessionId:
                sessionId

        });

    },


    /* ======================================================
       SAVE EMPLOYEE
    ====================================================== */

    async saveEmployee(
        employee
    ) {

        return await this.post({

            action:
                "saveEmployee",

            ...employee

        });

    },


    /* ======================================================
       GET ALL EMPLOYEES
    ====================================================== */

    async getEmployees() {

        return await this.post({

            action:
                "getEmployees"

        });

    },


    /* ======================================================
       GET EMPLOYEE BY ID
    ====================================================== */

    async getEmployeeById(
        employeeID
    ) {

        return await this.post({

            action:
                "getEmployeeById",

            employeeID:
                employeeID

        });

    },


    /* ======================================================
       GET COMPLETE EMPLOYEE PROFILE
    ====================================================== */

    async getEmployeeProfile(
        employeeID
    ) {

        return await this.post({

            action:
                "getEmployeeProfile",

            employeeID:
                employeeID

        });

    },


    /* ======================================================
       GET TRAINING RECORDS
       Employee-specific
    ====================================================== */

    async getTrainingRecords(
        employeeID
    ) {

        return await this.post({

            action:
                "getTrainingRecords",

            employeeID:
                employeeID

        });

    },


    /* ======================================================
       GET ALL TRAINING RECORDS FOR LDD
       LDD TRAINING MONITORING
    ====================================================== */

    async getAllTrainingRecordsForLDD() {

        return await this.post({

            action:
                "getAllTrainingRecordsForLDD"

        });

    },


    /* ======================================================
       UPDATE EMPLOYEE PROFILE
    ====================================================== */

    async updateEmployeeProfile(
        employee
    ) {

        console.log(
            "Updating employee profile:",
            employee
        );


        return await this.post({

            action:
                "updateEmployeeProfile",

            ...employee

        });

    },


    /* ======================================================
       GET PENDING EMPLOYEE ACCOUNTS
    ====================================================== */

    async getPendingEmployees() {

        return await this.post({

            action:
                "getPendingEmployees"

        });

    },


    /* ======================================================
       ACTIVATE EMPLOYEE ACCOUNT
    ====================================================== */

    async activateEmployee(
        employeeID
    ) {

        return await this.post({

            action:
                "activateEmployee",

            employeeID:
                employeeID

        });

    },


    /* ======================================================
       NEW USER REGISTRATION
       GET PENDING REGISTRATIONS
    ====================================================== */

    async getPendingRegistrations(
        approverID
    ) {

        return await this.post({

            action:
                "getPendingRegistrations",

            approverID:
                approverID

        });

    },


    /* ======================================================
       NEW USER REGISTRATION
       APPROVE & ACTIVATE
    ====================================================== */

    async approveRegistration(
        employeeID,
        approverID
    ) {

        return await this.post({

            action:
                "approveRegistration",

            employeeID:
                employeeID,

            approverID:
                approverID

        });

    },


    /* ======================================================
       CHANGE PASSWORD
    ====================================================== */

    async changePassword(
        employeeID,
        currentPassword,
        newPassword
    ) {

        return await this.post({

            action:
                "changePassword",

            employeeID:
                employeeID,

            currentPassword:
                currentPassword,

            newPassword:
                newPassword

        });

    }

};