/* ==========================================================
   LDIMS - Notifications
   Module: Employee Notifications
========================================================== */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        try {

            Session.requireLogin();

            const user = Session.get();

            if (!user) {

                Session.logout();

                return;

            }

            setValue(
                "headerRole",
                user.role || "Employee"
            );

            loadNotifications();

            initializeLogout();

        } catch (error) {

            console.error(
                "Notifications initialization failed:",
                error
            );

        }

    }
);


/* ==========================================================
   LOAD NOTIFICATIONS
========================================================== */

function loadNotifications() {

    const container =
        document.getElementById(
            "notificationsContainer"
        );

    if (!container) {
        return;
    }


    /*
       No notification backend yet.
       Show useful employee reminders based on
       the current LDIMS workflow.
    */

    const notifications = [

        {
            title: "Learning Needs Assessment",
            message:
                "Your Learning Needs Assessment has been submitted and recorded.",
            type: "success",
            icon: "✓"
        },

        {
            title: "Training Records",
            message:
                "Keep your training records updated whenever you complete a learning intervention.",
            type: "info",
            icon: "🎓"
        },

        {
            title: "Learning Passport",
            message:
                "Your Learning Passport contains your training history, learning hours, and certificates.",
            type: "info",
            icon: "📖"
        }

    ];


    renderNotifications(
        notifications
    );

}


/* ==========================================================
   RENDER NOTIFICATIONS
========================================================== */

function renderNotifications(
    notifications
) {

    const container =
        document.getElementById(
            "notificationsContainer"
        );

    if (!container) {
        return;
    }


    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        container.innerHTML =
            '<p class="text-muted">No notifications found.</p>';

        return;

    }


    container.innerHTML = "";


    notifications.forEach(
        function (notification) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "border rounded p-3 mb-3";


            const title =
                document.createElement(
                    "h6"
                );


            title.textContent =
                notification.icon +
                " " +
                notification.title;


            const message =
                document.createElement(
                    "p"
                );


            message.className =
                "mb-0 text-muted";


            message.textContent =
                notification.message;


            item.appendChild(
                title
            );

            item.appendChild(
                message
            );


            container.appendChild(
                item
            );

        }
    );

}


/* ==========================================================
   SET VALUE
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

    element.textContent =
        value || "-";

}


/* ==========================================================
   LOGOUT
========================================================== */

function initializeLogout() {

    document
        .getElementById("logoutLink")
        ?.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                if (
                    typeof Session !== "undefined" &&
                    typeof Session.logout === "function"
                ) {

                    Session.logout();

                    return;

                }


                localStorage.clear();

                window.location.href =
                    "../index.html";

            }
        );

}