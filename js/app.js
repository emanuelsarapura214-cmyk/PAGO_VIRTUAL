
(() => {
    // ==========================================
    // 1. CONFIGURACIÓN INICIAL
    // ==========================================

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const role = sessionStorage.getItem("mipv_role") || "usuario";
    const name = sessionStorage.getItem("mipv_name") || "Usuario";

    const path = location.pathname.replace(/\\/g, "/");
    const parts = path.split("/").filter(Boolean);

    const folder = ["usuario", "entrenador", "administrador"]
        .find(item => parts.includes(item));

    const current = parts[parts.length - 1] || "index.html";

    const roleKey =
        role === "admin"
            ? "administrador"
            : role === "Usuarios"
                ? "usuario"
                : role;

    const base = folder ? "../" : "";

    const names = {
        usuario: "USUARIO",
        entrenador: "ENTRENADOR",
        administrador: "ADMINISTRADOR"
    };


    // ==========================================
    // 2. MENÚS SEGÚN EL ROL
    // ==========================================

    const nav = {
        usuario: [
            ["index.html", "⌂", "Inicio"],
            ["pagos.html", "$", "Realizar pagos"],
            ["inscribirse.html", "＋", "Inscripciones"],
            ["movimientos.html", "▤", "Mis movimientos"],
            ["actividades.html", "⚽", "Actividades"],
            ["calendario.html", "▦", "Calendario"]
        ],

        entrenador: [
            ["index.html", "⌂", "Panel principal"],
            ["inscriptos.html", "♟", "Usuarios inscriptos"],
            ["calendario.html", "▦", "Calendario"],
            ["pagos.html", "$", "Consultar pagos"],
            ["asistencia.html", "✓", "Tomar asistencia"],
            ["actividades.html", "⚽", "Actividades"]
        ],

        administrador: [
            ["index.html", "⌂", "Panel principal"],
            ["usuarios.html", "♟", "Usuarios"],
            ["entrenadores.html", "⚑", "Entrenadores"],
            ["actividades.html", "⚽", "Actividades"],
            ["inscripciones.html", "＋", "Inscripciones"],
            ["pagos.html", "$", "Pagos"],
            ["estadisticas.html", "▥", "Estadísticas"]
        ]
    };


    // ==========================================
    // 3. CONTROL DE ACCESO Y NAVEGACIÓN
    // ==========================================

    if (folder) {
        if (!sessionStorage.getItem("mipv_role")) {
            location.href = base + "index.html";
            return;
        }

        if (roleKey !== folder) {
            location.href = base + roleKey + "/index.html";
            return;
        }

        const items = nav[folder];

        const navLinks = items.map(([href, icon, label]) => `
            <a class="side-link ${current === href ? "active" : ""}" href="${href}">
                <span class="side-icon">${icon}</span>
                <span class="side-text">${label}</span>
            </a>
        `).join("");

        const topLinks = items.slice(0, 4).map(([href, , label]) => `
            <a class="${current === href ? "active" : ""}" href="${href}">
                ${label}
            </a>
        `).join("");

        const shell = document.createElement("div");

        shell.innerHTML = `
            <header class="app-topbar">

                <button class="menu-toggle" id="menuToggle"
                    aria-label="Abrir o cerrar menú">
                    ☰
                </button>

                <a class="brand" href="index.html">
                    <img src="${base}imagen/logo.jpeg" alt="Logo del club">

                    <span>
                        <strong>MiPagoVirtual</strong>
                        <small>CLUB DEPORTIVO • GESTIÓN ONLINE</small>
                    </span>
                </a>

                <div class="top-links">
                    ${topLinks}
                </div>

                <div class="top-search">
                    <span>⌕</span>
                    <input id="globalSearch" type="search"
                        placeholder="Buscar en el sistema...">
                </div>

                <button class="icon-btn" id="themeToggle"
                    title="Cambiar tema">
                    ☼
                </button>

                <div class="profile-chip">
                    <span class="role-dot"></span>
                    <span>${names[folder]}</span> · ${escapeHTML(name)}
                </div>

                <button class="icon-btn" id="logoutBtn"
                    title="Cerrar sesión">
                    ⇥
                </button>

            </header>

            <aside class="sidebar" id="sidebar">

                <div class="side-caption">
                    Navegación principal
                </div>

                <div class="role-label">
                    ● ROL: ${names[folder]}
                </div>

                ${navLinks}

                <div class="side-separator"></div>

                <div class="side-caption">
                    Cuenta
                </div>

                <a class="side-link" href="#" id="themeSide">
                    <span class="side-icon">◐</span>
                    <span class="side-text">Modo claro / oscuro</span>
                </a>

                <a class="side-link" href="${base}index.html" id="sideLogout">
                    <span class="side-icon">⇥</span>
                    <span class="side-text">Cerrar sesión</span>
                </a>

            </aside>

            <div class="mobile-overlay" id="mobileOverlay"></div>
        `;

        document.body.prepend(shell);

        const main = $("main");

        if (main) {
            main.classList.add("app-main");
            main.id = "appMain";
        }


        // Menú lateral

        const sidebar = $("#sidebar");
        const overlay = $("#mobileOverlay");

        $("#menuToggle").addEventListener("click", () => {
            if (innerWidth <= 760) {
                sidebar.classList.toggle("mobile-open");
                overlay.classList.toggle("show");
            } else {
                document.body.classList.toggle("sidebar-collapsed");
            }
        });

        overlay.addEventListener("click", () => {
            sidebar.classList.remove("mobile-open");
            overlay.classList.remove("show");
        });


        // Modo claro y oscuro

        const toggleTheme = () => {
            document.body.classList.toggle("light");

            localStorage.setItem(
                "mipv_theme",
                document.body.classList.contains("light") ? "light" : "dark"
            );
        };

        if (localStorage.getItem("mipv_theme") === "light") {
            document.body.classList.add("light");
        }

        $("#themeToggle").addEventListener("click", toggleTheme);

        $("#themeSide").addEventListener("click", event => {
            event.preventDefault();
            toggleTheme();
        });


        // Cerrar sesión

        const logout = () => {
            sessionStorage.removeItem("mipv_role");
            sessionStorage.removeItem("mipv_name");

            location.href = base + "index.html";
        };

        $("#logoutBtn").addEventListener("click", logout);

        $("#sideLogout").addEventListener("click", event => {
            event.preventDefault();
            logout();
        });


        // Buscador general

        const search = $("#globalSearch");

        if (search) {
            search.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    const query = search.value.toLowerCase();

                    const match = [
                        ...document.querySelectorAll(
                            "main h1, main h2, main h3, main a, main label, main td"
                        )
                    ].find(element =>
                        element.textContent.toLowerCase().includes(query)
                    );

                    if (match) {
                        match.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    } else {
                        alert("No se encontraron coincidencias en esta página.");
                    }
                }
            });
        }

    } else if (
        current !== "index.html" &&
        current !== "login.html" &&
        current !== "registro.html" &&
        !sessionStorage.getItem("mipv_role")
    ) {
        location.href = "index.html";
    }


    // ==========================================
    // 4. FUNCIONES GENERALES
    // ==========================================

    // Evita insertar texto ingresado por usuarios como HTML.

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character]));
    }

    // Leer datos guardados.

    const read = key =>
        JSON.parse(localStorage.getItem("mipv_" + key) || "[]");

    // Guardar datos.

    const write = (key, value) =>
        localStorage.setItem("mipv_" + key, JSON.stringify(value));

    // Formato de dinero argentino.

    const fmt = value =>
        Number(value || 0).toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 2
        });

    // Insertar contenido en una tabla.

    const render = (id, html) => {
        const element = document.getElementById(id);

        if (element) {
            element.innerHTML = html;
        }
    };


    // ==========================================
    // 5. FORMULARIOS DE USUARIO
    // ==========================================

    document.querySelectorAll("form[data-demo-form]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            // Formulario de inscripción.

            if (form.querySelector("#categoria")) {
                const item = {
                    nombre: $("#nombre", form)?.value.trim() || name,
                    dni: $("#dni", form)?.value.trim() || "",
                    actividad: $("#categoria", form)?.value || "",
                    contacto: $("#contacto", form)?.value.trim() || "",
                    fecha: new Date().toLocaleDateString("es-AR"),
                    estado: "Pendiente"
                };

                const inscriptions = read("inscripciones");
                inscriptions.push(item);
                write("inscripciones", inscriptions);

                const users = read("usuarios");

                if (!users.some(user => user.dni === item.dni)) {
                    users.push({
                        nombre: item.nombre,
                        dni: item.dni,
                        contacto: item.contacto,
                        actividad: item.actividad,
                        fecha: item.fecha
                    });
                }

                write("usuarios", users);

                alert("Inscripción guardada en esta demostración.");
                form.reset();
            }

            // Formulario de pagos.

            else if (form.querySelector("#concepto")) {
                const item = {
                    nombre: name,
                    concepto: $("#concepto", form).value,
                    importe: $("#importe", form).value,
                    medio: $("#metodo", form).value,
                    fecha: new Date().toLocaleDateString("es-AR"),
                    estado: "Pendiente"
                };

                const payments = read("pagos");
                payments.push(item);
                write("pagos", payments);

                alert(
                    "Solicitud de pago registrada como pendiente. " +
                    "No se realizó ningún cobro real."
                );

                form.reset();
            }

            else {
                alert("Formulario de demostración guardado.");
            }
        });
    });


    // ==========================================
    // 6. ENTRENADOR: USUARIOS INSCRIPTOS
    // ==========================================

    const tbodyIns = $("#tablaInscriptos");

    if (tbodyIns) {
        const draw = () => {
            const query = ($("#buscarInscriptos")?.value || "").toLowerCase();
            const filter = $("#filtroActividad")?.value || "";

            const rows = read("inscripciones").filter(item =>
                (!filter || item.actividad === filter) &&
                (
                    !query ||
                    `${item.nombre || ""} ${item.dni || ""}`
                        .toLowerCase()
                        .includes(query)
                )
            );

            render(
                "tablaInscriptos",
                rows.length
                    ? rows.map(item => `
                        <tr>
                            <td>${escapeHTML(item.nombre)}</td>
                            <td>${escapeHTML(item.dni)}</td>
                            <td>${escapeHTML(item.actividad)}</td>
                            <td>${escapeHTML(item.contacto)}</td>
                            <td>${escapeHTML(item.fecha)}</td>
                            <td>
                                <span class="status">
                                    ${escapeHTML(item.estado || "Pendiente")}
                                </span>
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="6">
                                No hay inscripciones que coincidan con la búsqueda.
                            </td>
                        </tr>
                    `
            );
        };

        $("#buscarInscriptos")?.addEventListener("input", draw);
        $("#filtroActividad")?.addEventListener("change", draw);

        draw();
    }


    // ==========================================
    // 7. ENTRENADOR: CONSULTAR PAGOS
    // ==========================================

    if ($("#tablaPagos")) {
        const draw = () => {
            const query = ($("#buscarPago")?.value || "").toLowerCase();
            const filter = $("#filtroPago")?.value || "";

            const rows = read("pagos").filter(item =>
                (!filter || item.estado === filter) &&
                (
                    !query ||
                    (item.nombre || "").toLowerCase().includes(query)
                )
            );

            render(
                "tablaPagos",
                rows.length
                    ? rows.map(item => `
                        <tr>
                            <td>${escapeHTML(item.nombre)}</td>
                            <td>${escapeHTML(item.concepto)}</td>
                            <td>${fmt(item.importe)}</td>
                            <td>${escapeHTML(item.fecha)}</td>
                            <td>
                                <span class="status">
                                    ${escapeHTML(item.estado)}
                                </span>
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="5">
                                No hay pagos que coincidan con la búsqueda.
                            </td>
                        </tr>
                    `
            );
        };

        $("#buscarPago")?.addEventListener("input", draw);
        $("#filtroPago")?.addEventListener("change", draw);

        draw();
    }


    // ==========================================
    // 8. ENTRENADOR: TOMAR ASISTENCIA
    // ==========================================

    if ($("#tablaAsistencia")) {
        const date = $("#fechaAsistencia");

        if (date && !date.value) {
            date.value = new Date().toISOString().slice(0, 10);
        }

        let roster = [];

        const drawRoster = () => {
            const activity = $("#actividadAsistencia").value.toLowerCase();

            roster = read("inscripciones").filter(item =>
                (item.actividad || "").toLowerCase() === activity
            );

            render(
                "tablaAsistencia",
                roster.length
                    ? roster.map((item, index) => `
                        <tr>
                            <td>${escapeHTML(item.nombre)}</td>
                            <td>${escapeHTML(item.actividad)}</td>
                            <td>
                                <select data-att="${index}">
                                    <option value="Presente">Presente</option>
                                    <option value="Ausente">Ausente</option>
                                </select>
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="3">
                                No hay jugadores inscriptos en esta actividad.
                            </td>
                        </tr>
                    `
            );
        };

        $("#actividadAsistencia").addEventListener("change", drawRoster);

        drawRoster();

        // Guardar asistencia.

        $("#guardarAsistencia").addEventListener("click", () => {
            const rows = [...document.querySelectorAll("[data-att]")];

            if (!rows.length) {
                $("#mensajeAsistencia").textContent =
                    "No hay jugadores para registrar.";

                return;
            }

            const records = read("asistencias");

            rows.forEach(select => {
                const player = roster[Number(select.dataset.att)];

                records.push({
                    fecha: date.value,
                    nombre: player.nombre,
                    actividad: player.actividad,
                    estado: select.value
                });
            });

            write("asistencias", records);

            $("#mensajeAsistencia").textContent =
                "Asistencia guardada en esta demostración.";

            drawHistory();
        });

        // Historial de asistencia.

        const drawHistory = () => {
            const rows = read("asistencias").slice(-30).reverse();

            render(
                "historialAsistencia",
                rows.length
                    ? rows.map(item => `
                        <tr>
                            <td>${escapeHTML(item.fecha)}</td>
                            <td>${escapeHTML(item.nombre)}</td>
                            <td>${escapeHTML(item.actividad)}</td>
                            <td>
                                <span class="status">
                                    ${escapeHTML(item.estado)}
                                </span>
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="4">
                                Todavía no hay asistencias guardadas.
                            </td>
                        </tr>
                    `
            );
        };

        drawHistory();
    }


    // ==========================================
    // 9. ADMINISTRADOR: USUARIOS
    // ==========================================

    if ($("#tablaUsuarios")) {
        const rows = read("usuarios");

        render(
            "tablaUsuarios",
            rows.length
                ? rows.map(item => `
                    <tr>
                        <td>${escapeHTML(item.nombre)}</td>
                        <td>${escapeHTML(item.dni)}</td>
                        <td>${escapeHTML(item.contacto || item.email || "—")}</td>
                        <td>${escapeHTML(item.actividad || "—")}</td>
                        <td>${escapeHTML(item.fecha || "—")}</td>
                    </tr>
                `).join("")
                : `
                    <tr>
                        <td colspan="5">
                            Todavía no hay usuarios registrados.
                        </td>
                    </tr>
                `
        );
    }


    // ==========================================
    // 10. ADMINISTRADOR: INSCRIPCIONES
    // ==========================================

    if ($("#tablaInscripcionesAdmin")) {
        const draw = () => {
            const rows = read("inscripciones");

            render(
                "tablaInscripcionesAdmin",
                rows.length
                    ? rows.map((item, index) => `
                        <tr>
                            <td>${escapeHTML(item.nombre)}</td>
                            <td>${escapeHTML(item.dni)}</td>
                            <td>${escapeHTML(item.actividad)}</td>
                            <td>${escapeHTML(item.contacto)}</td>
                            <td>${escapeHTML(item.fecha)}</td>
                            <td>
                                <span class="status">
                                    ${escapeHTML(item.estado || "Pendiente")}
                                </span>
                            </td>
                            <td>
                                <button class="btn"
                                    data-ins="${index}"
                                    data-state="Aprobada">
                                    Aprobar
                                </button>

                                <button class="btn secondary"
                                    data-ins="${index}"
                                    data-state="Rechazada">
                                    Rechazar
                                </button>
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="7">
                                Todavía no hay solicitudes.
                            </td>
                        </tr>
                    `
            );

            document.querySelectorAll("[data-ins]").forEach(button => {
                button.addEventListener("click", () => {
                    const inscriptions = read("inscripciones");

                    inscriptions[Number(button.dataset.ins)].estado =
                        button.dataset.state;

                    write("inscripciones", inscriptions);

                    draw();
                });
            });
        };

        draw();
    }


    // ==========================================
    // 11. ADMINISTRADOR: ACTIVIDADES
    // ==========================================

    const defaultActivities = [
        {
            nombre: "Fútbol Infantil",
            categoria: "Infantil",
            dias: "Lunes y miércoles",
            horario: "17:00 a 18:30",
            lugar: "Cancha principal"
        },
        {
            nombre: "Fútbol Juvenil",
            categoria: "Juvenil",
            dias: "Martes y jueves",
            horario: "18:30 a 20:00",
            lugar: "Cancha principal"
        }
    ];

    if ($("#tablaActividadesAdmin")) {
        if (!localStorage.getItem("mipv_actividades")) {
            write("actividades", defaultActivities);
        }

        const draw = () => {
            const rows = read("actividades");

            render(
                "tablaActividadesAdmin",
                rows.length
                    ? rows.map((item, index) => `
                        <tr>
                            <td>${escapeHTML(item.nombre)}</td>
                            <td>${escapeHTML(item.categoria)}</td>
                            <td>${escapeHTML(item.dias)}</td>
                            <td>${escapeHTML(item.horario)}</td>
                            <td>${escapeHTML(item.lugar)}</td>
                            <td>
                                <button class="btn secondary"
                                    data-del-activity="${index}">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="6">
                                No hay actividades cargadas.
                            </td>
                        </tr>
                    `
            );

            // Eliminar actividad.

            document.querySelectorAll("[data-del-activity]").forEach(button => {
                button.addEventListener("click", () => {
                    if (confirm("¿Eliminar esta actividad?")) {
                        const activities = read("actividades");

                        activities.splice(
                            Number(button.dataset.delActivity),
                            1
                        );

                        write("actividades", activities);

                        draw();
                    }
                });
            });
        };

        draw();

        // Crear actividad.

        $("#formActividad").addEventListener("submit", event => {
            event.preventDefault();

            const activities = read("actividades");

            activities.push({
                nombre: $("#nombreActividad").value.trim(),
                categoria: $("#categoriaActividad").value.trim(),
                dias: $("#diasActividad").value.trim(),
                horario: $("#horarioActividad").value.trim(),
                lugar: $("#lugarActividad").value.trim()
            });

            write("actividades", activities);

            event.target.reset();

            draw();

            alert("Actividad agregada en esta demostración.");
        });
    }


    // ==========================================
    // 12. ADMINISTRADOR: PAGOS
    // ==========================================

    if ($("#tablaPagosAdmin")) {
        const draw = () => {
            const rows = read("pagos");

            render(
                "tablaPagosAdmin",
                rows.length
                    ? rows.map((item, index) => `
                        <tr>
                            <td>${escapeHTML(item.nombre)}</td>
                            <td>${escapeHTML(item.concepto)}</td>
                            <td>${fmt(item.importe)}</td>
                            <td>${escapeHTML(item.medio)}</td>
                            <td>${escapeHTML(item.fecha)}</td>
                            <td>
                                <span class="status">
                                    ${escapeHTML(item.estado)}
                                </span>
                            </td>
                            <td>
                                <select data-payment="${index}">
                                    <option ${item.estado === "Pendiente" ? "selected" : ""}>
                                        Pendiente
                                    </option>

                                    <option ${item.estado === "Pagado" ? "selected" : ""}>
                                        Pagado
                                    </option>

                                    <option ${item.estado === "Rechazado" ? "selected" : ""}>
                                        Rechazado
                                    </option>
                                </select>
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="7">
                                Todavía no hay pagos registrados.
                            </td>
                        </tr>
                    `
            );

            document.querySelectorAll("[data-payment]").forEach(select => {
                select.addEventListener("change", () => {
                    const payments = read("pagos");

                    payments[Number(select.dataset.payment)].estado =
                        select.value;

                    write("pagos", payments);
                });
            });
        };

        draw();
    }


    // ==========================================
    // 13. CONTADORES DE LOS PANELES
    // ==========================================

    const count = key => read(key).length;

    const counters = [
        ["adminUsuarios", "usuarios"],
        ["adminInscripciones", "inscripciones"],
        ["adminPagos", "pagos"],

        ["statUsuarios", "usuarios"],
        ["statInscripciones", "inscripciones"],
        ["statPagos", "pagos"],
        ["statAsistencias", "asistencias"],

        ["countInscriptos", "inscripciones"],
        ["countAsistencias", "asistencias"]
    ];

    counters.forEach(([id, key]) => {
        const element = $("#" + id);

        if (element) {
            element.textContent = count(key);
        }
    });


    // ==========================================
    // 14. CONTADOR DE PAGOS PENDIENTES
    // ==========================================

    const pending = read("pagos")
        .filter(item => item.estado === "Pendiente")
        .length;

    if ($("#countPendientes")) {
        $("#countPendientes").textContent = pending;
    }


    // ==========================================
    // 15. ESTADÍSTICAS DE PAGOS
    // ==========================================

    if ($("#tablaEstadisticasPagos")) {
        const payments = read("pagos");

        const statuses = [
            "Pendiente",
            "Pagado",
            "Rechazado"
        ];

        render(
            "tablaEstadisticasPagos",
            statuses.map(status => `
                <tr>
                    <td>${status}</td>
                    <td>
                        ${payments.filter(item => item.estado === status).length}
                    </td>
                </tr>
            `).join("")
        );
    }


    // ==========================================
    // 16. ESTADÍSTICAS DE INSCRIPCIONES
    // ==========================================

    if ($("#tablaEstadisticasInscripciones")) {
        const inscriptions = read("inscripciones");

        const statuses = [
            "Pendiente",
            "Aprobada",
            "Rechazada"
        ];

        render(
            "tablaEstadisticasInscripciones",
            statuses.map(status => `
                <tr>
                    <td>${status}</td>
                    <td>
                        ${inscriptions.filter(
                            item => (item.estado || "Pendiente") === status
                        ).length}
                    </td>
                </tr>
            `).join("")
        );
    }

})();
