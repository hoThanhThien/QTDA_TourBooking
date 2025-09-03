// Admin • Discounts – CRUD full + bắt lỗi rõ ràng
(function () {
  const $ = (q, p = document) => p.querySelector(q);

  let q = "";
  let editId = null;

  const els = {
    rows: $("#rows"),
    btnNew: $("#btnNew"),
    btnFilter: $("#btnFilter"),
    q: $("#q"),
    dlgWrap: $("#dlgWrap"),
    dlgTitle: $("#dlgTitle"),
    fCode: $("#fCode"),
    fIsPercent: $("#fIsPercent"),
    fAmount: $("#fAmount"),
    fStart: $("#fStart"),
    fEnd: $("#fEnd"),
    fDesc: $("#fDesc"),
    dlgClose: $("#dlgClose"),
    dlgSave: $("#dlgSave"),
  };

  function showErr(e) {
    const m = e?.message || e?.toString?.() || "Có lỗi xảy ra";
    console.error("[discounts] error:", e);
    alert("Lỗi: " + m);
  }
  function showOk(msg = "Thành công") {
    console.info("[discounts]", msg);
  }

  function openDlg(title, data) {
    els.dlgTitle.textContent = title;
    els.fCode.value = data?.code || "";
    els.fIsPercent.value = data?.is_percent ? "1" : "0";
    els.fAmount.value = data?.discount_amount ?? "";
    els.fStart.value = (data?.start_date || "").slice(0, 10);
    els.fEnd.value = (data?.end_date || "").slice(0, 10);
    els.fDesc.value = data?.description || "";
    els.dlgWrap.classList.add("show");
  }
  function closeDlg() {
    els.dlgWrap.classList.remove("show");
    editId = null;
  }

  async function load() {
    try {
      const qs = new URLSearchParams({ page: 1, page_size: 100, q });
      // dùng auth:true vì phía admin thường bảo vệ endpoint
      const res = await api(`/discounts?${qs}`, { auth: true });
      const items = res?.data?.items || [];

      if (!items.length) {
        els.rows.innerHTML =
          `<tr><td colspan="6" class="muted">Không có mã</td></tr>`;
        return;
      }

      els.rows.innerHTML = items
        .map((d) => {
          const val = d.is_percent
            ? `${d.discount_amount}%`
            : `${Number(d.discount_amount || 0).toLocaleString("vi-VN")}đ`;
          const period = `${(d.start_date || "").slice(0, 10)} → ${(d.end_date || "").slice(0, 10)}`;
          return `
            <tr data-id="${d.id}">
              <td>${d.id}</td>
              <td>${d.code}</td>
              <td>${d.is_percent ? "Percent" : "Amount"}</td>
              <td>${val}</td>
              <td>${period}</td>
              <td>
                <button class="btn small light" data-edit="${d.id}">Sửa</button>
                <button class="btn small danger" data-del="${d.id}">Xoá</button>
              </td>
            </tr>
          `;
        })
        .join("");
    } catch (e) {
      showErr(e);
      // để không treo ở "Đang tải…"
      els.rows.innerHTML =
        `<tr><td colspan="6" class="muted">Tải dữ liệu thất bại</td></tr>`;
    }
  }

  async function save() {
    try {
      const body = {
        code: els.fCode.value.trim(),
        is_percent: els.fIsPercent.value === "1" ? 1 : 0,
        discount_amount: Number(els.fAmount.value || 0),
        start_date: els.fStart.value || null,
        end_date: els.fEnd.value || null,
        description: els.fDesc.value.trim(),
      };
      if (!body.code) return alert("Nhập code!");

      if (editId) {
        await api(`/discounts/${editId}`, { method: "PUT", auth: true, body });
        showOk("Đã cập nhật mã giảm giá");
      } else {
        await api(`/discounts`, { method: "POST", auth: true, body });
        showOk("Đã tạo mã giảm giá");
      }
      closeDlg();
      load();
    } catch (e) {
      showErr(e);
    }
  }

  async function remove(id) {
    try {
      await api(`/discounts/${id}`, { method: "DELETE", auth: true });
      showOk("Đã xoá");
      load();
    } catch (e) {
      showErr(e);
    }
  }

  // ====== EVENTS ======
  els.btnNew?.addEventListener("click", () => openDlg("Thêm mã"));
  els.dlgClose?.addEventListener("click", closeDlg);
  els.dlgSave?.addEventListener("click", save);

  els.btnFilter?.addEventListener("click", () => {
    q = els.q.value.trim();
    load();
  });

  document.addEventListener("click", (e) => {
    const idE = e.target?.getAttribute?.("data-edit");
    const idD = e.target?.getAttribute?.("data-del");
    if (idE) {
      // Lấy dữ liệu trực tiếp từ dòng
      const tr = e.target.closest("tr");
      editId = Number(idE);
      openDlg("Sửa mã", {
        code: tr.children[1].textContent.trim(),
        is_percent: tr.children[2].textContent.trim() === "Percent",
        discount_amount: Number(
          tr.children[3].textContent.replace(/[^\d]/g, "") || 0
        ),
        // Hiệu lực hiển thị dạng "YYYY-MM-DD → YYYY-MM-DD"
        start_date: tr.children[4].textContent.split("→")[0].trim(),
        end_date: tr.children[4].textContent.split("→")[1]?.trim() || "",
        description: "", // nếu muốn chuẩn hơn: gọi GET /discounts/{id} để lấy description
      });
    }
    if (idD) {
      if (confirm("Xoá mã giảm giá này?")) remove(Number(idD));
    }
  });

  function boot() {
    updateNavAuth();
    setBaseUrlHint();
    guardAdmin(); // chặn nếu không phải admin
    load();
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
