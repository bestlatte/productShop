// 漢堡選單開合
const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

if (bar && nav) {
  bar.addEventListener("click", () => nav.classList.add("active"));
}
if (close && nav) {
  close.addEventListener("click", () => nav.classList.remove("active"));
}


document.addEventListener("DOMContentLoaded", function () {
  // 左上 LOGO：點擊回到頂部（平滑滾動）
  const logoLink = document.getElementById("logo-link");
  const logoImg = document.getElementById("fixed-logo");

  function scrollTopSmooth(e) {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (logoLink) logoLink.addEventListener("click", scrollTopSmooth);
  // 如果某頁沒有包 <a>，也支援直接點圖片
  if (logoImg) logoImg.addEventListener("click", scrollTopSmooth);

  // 購物車空狀態顯示與刪除
  const cartBody = document.querySelector("#cart tbody");
  const theadRow = document.querySelector("#cart thead tr");
  if (cartBody && theadRow) {
    const emptyMessage = document.createElement("tr");
    emptyMessage.innerHTML = `<td colspan="6" id="empty-row" style="text-align: center; padding: 40px; ">購物車內無商品</td>`;

    function checkCartEmpty() {
      const rows = cartBody.querySelectorAll("tr");
      if (rows.length === 0) {
        // 顯示空提示
        if (!document.getElementById("empty-row")) {
          cartBody.appendChild(emptyMessage);
        }
        // 隱藏「移除」欄位
        const removeHeader = theadRow.querySelector("td");
        if (removeHeader && removeHeader.textContent.includes("移除")) {
          removeHeader.style.visibility = "hidden";
        }
      } else {
        // 移除空提示列
        const empty = document.getElementById("empty-row");
        if (empty) empty.remove();
        // 顯示「移除」欄位
        const removeHeader = theadRow.querySelector("td");
        if (removeHeader && removeHeader.style.visibility === "hidden") {
          removeHeader.style.visibility = "visible";
        }
      }
    }

    cartBody.addEventListener("click", function (e) {
      if (e.target.classList.contains("fa-times-circle")) {
        e.preventDefault();
        const row = e.target.closest("tr");
        if (row) row.remove();
        checkCartEmpty();
      }
    });

    checkCartEmpty();
  }

  // 優惠券按鈕
  const applyBtn = document.getElementById("applyBtn");
  if (applyBtn) {
    applyBtn.addEventListener("click", function () {
      alert("對不起，現在尚無優惠可用");
    });
  }
});

// ------- 輪播 -------
window.onload = function () {
  let slideIndex = 0; // 從 0 開始比較直覺
  const slidesWrap = document.querySelector(".slides");
  const slides = document.querySelectorAll(".slides .slide__item");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const dots = document.getElementsByClassName("dot");
  const total = slides.length;

  if (!slidesWrap || !total) return;

  function goTo(i) {
    slideIndex = (i + total) % total; // 迴圈
    // 用 transform 平移一整排，避免任何顯示/隱藏造成的白畫面
    slidesWrap.style.transform = `translateX(-${slideIndex * 100}%)`;

    // 更新圓點
    for (let d = 0; d < dots.length; d++) dots[d].classList.remove("active");
    if (dots[slideIndex]) dots[slideIndex].classList.add("active");

    // 更新右下「1 / N」如果你要
    const pn = slides[slideIndex].querySelector(".slide__pagenumber");
    if (pn) pn.textContent = `${slideIndex + 1} / ${total}`;
  }

  function nextSlide() { goTo(slideIndex + 1); }
  function prevSlide() { goTo(slideIndex - 1); }

  // 綁左右箭頭
  if (prev) prev.addEventListener("click", prevSlide);
  if (next) next.addEventListener("click", nextSlide);

  // 綁圓點
  for (let i = 0; i < dots.length; i++) {
    dots[i].addEventListener("click", () => goTo(i));
  }

  // 初始化位置
  goTo(0);

  // 自動輪播（可調整時間）
  let timer = setInterval(nextSlide, 4000);

  // 使用者互動時，重置計時器（體感更好）
  ["click", "touchstart", "mouseenter"].forEach(evt => {
    slidesWrap.addEventListener(evt, () => {
      clearInterval(timer);
      timer = setInterval(nextSlide, 3000);
    }, { passive: true });
  });
};



// ===== 金額格式工具 =====
// === 配置：後端 API ===
const API_ADD_TO_CART = "http://localhost:8080/api/cart/add"; // 你的後端新增購物車 API
const FIXED_USER_ID = 1; // 開發期先固定，之後用 JWT/後端取得

// 將金額（數字）轉成 $1,234 格式
function formatCurrency(n) {
  return `$${n.toLocaleString("en-US")}`;
}

// 解析像 "$4,500" 成數字 4500
function parseCurrencyToNumber(s) {
  if (typeof s === "number") return s;
  return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

// 重新計算單列小計
function recalcRowSubtotal(row) {
  const unit = Number(row.dataset.price || 0);
  const qtyInput = row.querySelector(".qty-input");
  const qty = Number(qtyInput?.value || 1);
  const subtotalCell = row.querySelector(".line-subtotal");
  const subtotal = unit * qty;
  if (subtotalCell) subtotalCell.textContent = formatCurrency(subtotal);
  return subtotal;
}

// 重新計算整體合計
function recalcTotals() {
  const rows = document.querySelectorAll("#cart tbody tr");
  let sum = 0;
  rows.forEach((row) => {
    sum += recalcRowSubtotal(row);
  });

  // 小計/總計
  const sumEl = document.getElementById("summary-subtotal");
  const totalEl = document.getElementById("summary-total");
  const bottomBar = document.getElementById("bottom-total");

  if (sumEl) sumEl.textContent = formatCurrency(sum);
  if (totalEl) totalEl.textContent = formatCurrency(sum);
  if (bottomBar) bottomBar.textContent = `總金額：${formatCurrency(sum)}`;
}

// 綁定 ± 按鈕邏輯（事件委派）
function bindQtyControls() {
  const tbody = document.querySelector("#cart tbody");
  if (!tbody) return;

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;

    const row = btn.closest("tr");
    const box = btn.closest(".qty");
    const input = box.querySelector(".qty-input");
    const min = Number(box.dataset.min || 1);
    const max = Number(box.dataset.max || 99);

    let val = Number(input.value || 1);
    const action = btn.dataset.action;

    if (action === "inc") val = Math.min(max, val + 1);
    if (action === "dec") val = Math.max(min, val - 1);

    input.value = String(val);
    recalcRowSubtotal(row);
    recalcTotals();
  });
}

// 綁定刪除（×）按鈕（你原本也有，這裡保險再補一次，會同時更新總計）
function bindRemoveRows() {
  const tbody = document.querySelector("#cart tbody");
  if (!tbody) return;

  tbody.addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-times-circle")) {
      e.preventDefault();
      const row = e.target.closest("tr");
      if (row) row.remove();
      recalcTotals();
    }
  });
}

// 綁定「加入購物車」按鈕 => 呼叫後端
function bindAddToCart() {
  const tbody = document.querySelector("#cart tbody");
  if (!tbody) return;

  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;

    const row = btn.closest("tr");
    const productId = Number(row?.dataset.productId);
    const qty = Number(row?.querySelector(".qty-input")?.value || 1);

    if (!productId) {
      alert("找不到產品編號");
      return;
    }

    try {
      const res = await fetch(API_ADD_TO_CART, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: FIXED_USER_ID,
          productId,
          quantity: qty
        }),
        // 若後端有設定 credentials 與 allowCredentials，請視情況加上：
        // credentials: "include"
      });

      // 用 text 接，再嘗試 parse，避免後端非 JSON 錯誤訊息造成崩潰
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (_) {}

      if (!res.ok) {
        throw new Error(data.message || text || res.statusText);
      }

      alert(data.message || "加入購物車成功");
    } catch (err) {
      console.error("AddToCart error:", err);
      alert("加入失敗：" + err.message);
    }
  });
}

// 初始執行
document.addEventListener("DOMContentLoaded", () => {
  // 首次進頁就算一次小計/總計
  recalcTotals();

  bindQtyControls();
  bindRemoveRows();
  bindAddToCart();

});

// -----------------------------
// 新增：後端刪除 API
const API_DELETE_FROM_CART = "http://localhost:8080/api/cart/item";  // DELETE

function bindRemoveRows() {
  const tbody = document.querySelector("#cart tbody");
  if (!tbody) return;

  tbody.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("fa-times-circle")) return;
    e.preventDefault();

    const row = e.target.closest("tr");
    const productId = Number(row?.dataset.productId);
    if (!productId) {
      alert("找不到產品編號");
      return;
    }

    try {
      // 建議用 query 參數傳 userId/productId
      const url = `${API_DELETE_FROM_CART}?userId=${FIXED_USER_ID}&productId=${productId}`;
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || res.statusText);
      }

      // 後端刪成功 → 再移除 UI
      row.remove();
      recalcTotals();      // 你已經有的合計函式 :contentReference[oaicite:3]{index=3}
      // 若你也有空清單提示的邏輯，這裡順便呼叫（你現成的 checkCartEmpty 在這裡）:contentReference[oaicite:4]{index=4}
      if (typeof checkCartEmpty === "function") checkCartEmpty();
    } catch (err) {
      console.error("Delete cart item error:", err);
      alert("刪除失敗：" + err.message);
    }
  });
}