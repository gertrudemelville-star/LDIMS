/* ==========================================================
   LDIMS - Shared Sidebar Component
========================================================== */

"use strict";

/* ==========================================================
   Render Sidebar
========================================================== */

function renderSidebar(activePage = "") {

    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    sidebar.innerHTML = `

        <aside class="sidebar">

            <div class="sidebar-brand">

                <img
                    src="assets/images/Logo.png"
                    class="sidebar-logo"
                    alt="NBI Logo">

                <h4>LDIMS</h4>

            </div>

            <ul class="sidebar-menu">

                <li>

                    <a
                        href="dashboard.html"
                        class="${activePage === "dashboard" ? "active" : ""}">

                        <i class="bi bi-speedometer2"></i>

                        Dashboard

                    </a>

                </li>

                <li>

                    <a
                        href="profile.html"
                        class="${activePage === "profile" ? "active" : ""}">

                        <i class="bi bi-person-circle"></i>

                        My Profile

                    </a>

                </li>

                <li>

                    <a
                        href="employee.html"
                        class="${activePage === "employee" ? "active" : ""}">

                        <i class="bi bi-people-fill"></i>

                        Employees

                    </a>

                </li>

                <li>

                    <a
                        href="#">

                        <i class="bi bi-mortarboard-fill"></i>

                        Training

                    </a>

                </li>

                <li>

                    <a
                        href="#">

                        <i class="bi bi-award-fill"></i>

                        Certificates

                    </a>

                </li>

                <li>

                    <a
                        href="#">

                        <i class="bi bi-file-earmark-bar-graph"></i>

                        Reports

                    </a>

                </li>

                <li>

                    <a
                        href="#">

                        <i class="bi bi-gear-fill"></i>

                        Settings

                    </a>

                </li>

            </ul>

        </aside>

    `;

}