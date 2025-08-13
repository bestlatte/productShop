


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

// ====== 所有網站LOGO通用 JS ======
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

    // 購物車空狀態初始化
    const cartBody = document.querySelector("#cart tbody");
    const theadRow = document.querySelector("#cart thead tr");

    function ensureEmptyRow() {
        if (!cartBody || !theadRow) return;

        const productRows = cartBody.querySelectorAll("tr[data-product-id]");
        const emptyExists = !!document.getElementById("empty-row");

        if (productRows.length === 0) {
            if (!emptyExists) {
                const emptyMessage = document.createElement("tr");
                emptyMessage.innerHTML = `<td colspan="7" id="empty-row" style="text-align:center; padding:40px;">購物車內無商品</td>`;
                cartBody.appendChild(emptyMessage);
            }
            const removeHeader = theadRow.querySelector("td");
            if (removeHeader && removeHeader.textContent.includes("移除")) {
                removeHeader.style.visibility = "hidden";
            }
        } else {
            const empty = document.getElementById("empty-row");
            if (empty) empty.remove();
            const removeHeader = theadRow.querySelector("td");
            if (removeHeader && removeHeader.style.visibility === "hidden") {
                removeHeader.style.visibility = "visible";
            }
        }
    }

    ensureEmptyRow();

    // 優惠券按鈕
    const applyBtn = document.getElementById("applyBtn");
    if (applyBtn) {
        applyBtn.addEventListener("click", function () {
            alert("對不起，現在尚無優惠可用");
        });
    }

    // 把全域空狀態檢查函式掛到 window，給其他地方呼叫（可選）
    window.__ensureEmptyRow = ensureEmptyRow;
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
        slidesWrap.style.transform = `translateX(-${slideIndex * 100}%)`;

        for (let d = 0; d < dots.length; d++) dots[d].classList.remove("active");
        if (dots[slideIndex]) dots[slideIndex].classList.add("active");

        const pn = slides[slideIndex].querySelector(".slide__pagenumber");
        if (pn) pn.textContent = `${slideIndex + 1} / ${total}`;
    }

    function nextSlide() { goTo(slideIndex + 1); }
    function prevSlide() { goTo(slideIndex - 1); }

    if (prev) prev.addEventListener("click", prevSlide);
    if (next) next.addEventListener("click", nextSlide);

    for (let i = 0; i < dots.length; i++) {
        dots[i].addEventListener("click", () => goTo(i));
    }

    goTo(0);

    let timer = setInterval(nextSlide, 4000);

    ["click", "touchstart", "mouseenter"].forEach(evt => {
        slidesWrap.addEventListener(evt, () => {
            clearInterval(timer);
            timer = setInterval(nextSlide, 3000);
        }, { passive: true });
    });
};

// ====== 購物車頁面功能 ======

// === 配置：後端 API（同源最穩） ===
const onBackend = location.port === "8080";
const API_BASE  = onBackend ? "" : "http://localhost:8080";
const FIXED_USER_ID = 1;
const API_ADD_TO_CART = `${API_BASE}/api/cart/add`;
const API_CART_REMOVE = `${API_BASE}/api/cart/remove`;

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
    const rows = document.querySelectorAll("#cart tbody tr[data-product-id]");
    let sum = 0;
    rows.forEach((row) => {
        sum += recalcRowSubtotal(row);
    });

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

// 綁定刪除（×）按鈕：打後端 -> 成功才前端移除＋重算

function bindRemoveRows() {
    const tbody = document.querySelector("#cart tbody");
    if (!tbody) return;

    tbody.addEventListener("click", async (e) => {
        const icon = e.target.closest(".fa-times-circle");
        if (!icon) return;
        e.preventDefault();

        const row = icon.closest("tr");
        if (!row) return;

        const cartId = row.dataset.cartItemId;
        const name = row.querySelector("td:nth-child(3)")?.textContent?.trim() || "此商品";

        if (!cartId) {
            alert("缺少 cartItemId，請在 <tr> 上加 data-cart-item-id。");
            return;
        }
        if (!confirm(`要從購物車移除「${name}」嗎？`)) return;

        icon.style.pointerEvents = "none";

        try {
            let res = await fetch(`${API_CART_REMOVE}?cartItemId=${encodeURIComponent(cartId)}`, {
                method: "DELETE",
            });

            if (res.status === 405) {
                res = await fetch(`${API_CART_REMOVE}?cartItemId=${encodeURIComponent(cartId)}`, {
                    method: "POST",
                });
            }

            const text = await res.text();
            let data = {}; try { data = JSON.parse(text); } catch {}
            if (!res.ok) throw new Error(data.message || text || res.statusText);

            row.remove();
            recalcTotals();
            if (window.__ensureEmptyRow) window.__ensureEmptyRow();
        } catch (err) {
            console.error("Remove cart item error:", err);
            alert("移除失敗：" + (err.message || "請稍後再試"));
        } finally {
            icon.style.pointerEvents = "";
        }
    });
}


// === 單一商品頁：加入購物車（做法 A：<body data-product-id="...">）===
(function bindQtyControlsForSingle() {
    const box = document.querySelector(".single-pro-details");
    if (!box) return; // 不在單品頁就跳過

    box.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;

        const wrap  = btn.closest(".qty");
        const input = wrap.querySelector(".qty-input");
        const min   = Number(wrap.dataset.min || 1);
        const max   = Number(wrap.dataset.max || 99);

        let val = Number(input.value || 1);
        const action = btn.dataset.action;

        if (action === "inc") val = Math.min(max, val + 1);
        if (action === "dec") val = Math.max(min, val - 1);

        input.value = String(val);
    });
})();

(function initSingleProductAddToCart() {
    const btn = document.getElementById("btnAddSingle");
    const qtyInput = document.getElementById("sp-qty");
    if (!btn || !qtyInput) return; // 不是單一商品頁就略過

    function getProductIdFromBody() {
        const pid = document.body?.dataset?.productId;
        return pid ? Number(pid) : NaN;
    }

    btn.addEventListener("click", async () => {
        const productId = getProductIdFromBody();
        const qty = Math.max(1, Number(qtyInput.value || 1));

        if (!productId || Number.isNaN(productId)) {
            alert('找不到商品編號，請檢查 <body data-product-id="..."> 是否正確。');
            return;
        }

        btn.disabled = true;
        const oldText = btn.textContent;
        btn.textContent = "加入中…";

        try {
            const res = await fetch(API_ADD_TO_CART, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // credentials: "include", // 若用 Cookie 驗證再打開
                body: JSON.stringify({
                    userId: FIXED_USER_ID,
                    productId: productId,
                    quantity: qty
                })
            });

            const text = await res.text();
            let data = {}; try { data = JSON.parse(text); } catch {}

            if (!res.ok) throw new Error(data.message || text || res.statusText);

            alert(data.message || "已加入購物車");
        } catch (err) {
            console.error("AddToCart(single) error:", err);
            alert("加入失敗：" + (err.message || "請稍後再試"));
        } finally {
            btn.disabled = false;
            btn.textContent = oldText;
        }
    });
})();

// 頁面載入時初始化
document.addEventListener("DOMContentLoaded", () => {
    recalcTotals();       // 進頁就先把小計/總計算一次
    bindQtyControls();    // 綁定 + / - 數量按鈕
    bindRemoveRows();     // 綁定左側 XX（會打 /api/cart/remove，且成功後重算）
});

function resetCartRowNumbers() {
    const rows = document.querySelectorAll("#cart tbody tr[data-cart-item-id]");
    let index = 1;
    rows.forEach(row => {
        row.dataset.displayId = index; // 顯示用
        // 如果有序號欄位
        const numberCell = row.querySelector(".cart-index");
        if (numberCell) numberCell.textContent = index;
        index++;
    });
}

resetCartRowNumbers();



