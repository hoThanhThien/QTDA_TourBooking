// admin-shell.js → load layout + partials + content

(async function () {
  const base = "../../pages/admin";

  // Load partials
  async function load(id, file) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = await (await fetch(`${base}/partials/${file}`)).text();
  }
  await load("admin-header", "header.html");
  await load("admin-sidebar", "sidebar.html");
  await load("admin-footer", "footer.html");

  // Load nội dung theo query ?view=
  const params = new URLSearchParams(location.search);
  const view = params.get("view") || "dashboard";
  document.getElementById("admin-content").innerHTML =
    await (await fetch(`${base}/${view}.content.html`)).text();

  // Sidebar toggle + active
  const sb = document.getElementById("sidebar");
  document.getElementById("sbToggle")?.addEventListener("click", () => sb.classList.toggle("open"));

  const cur = location.pathname.toLowerCase();
  document.querySelectorAll(".sb-link").forEach(a => {
    if (cur.endsWith(a.getAttribute("href").toLowerCase())) a.classList.add("active");
  });
})();
