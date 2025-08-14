// ============================
//  共用：取得購物車的 <tbody>（支援 #cart tbody 與 #cart-tbody）
// ============================
function getCartTbody() {
    return document.querySelector('#cart tbody, #cart-tbody');
}

// ============================
//  漢堡選單開合
// ============================
const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

if (bar && nav) {
    bar.addEventListener("click", () => nav.classList.add("active"));
}
if (close && nav) {
    close.addEventListener("click", () => nav.classList.remove("active"));
}

// ============================
//  所有網站 LOGO 通用 JS + 空狀態
// ============================
document.addEventListener("DOMContentLoaded", function () {
    // 左上 LOGO：點擊回到頂部（平滑滾動）
    const logoLink = document.getElementById("logo-link");
    const logoImg = document.getElementById("fixed-logo");

    function scrollTopSmooth(e) {
        if (e) e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (logoLink) logoLink.addEventListener("click", scrollTopSmooth);
    if (logoImg) logoImg.addEventListener("click", scrollTopSmooth);

    // 購物車空狀態初始化
    const theadRow = document.querySelector("#cart thead tr");

    function ensureEmptyRow() {
        const cartBody = getCartTbody();
        if (!cartBody || !theadRow) return;

        const productRows = cartBody.querySelectorAll("tr[data-product-id]");
        const emptyExists = !!document.getElementById("empty-row");

        if (productRows.length === 0) {
            if (!emptyExists) {
                const emptyMessage = document.createElement("tr");
                emptyMessage.innerHTML = `<td colspan="7" id="empty-row" style="text-align:center; padding:40px;">購物車內無商品</td>`;
                cartBody.appendChild(emptyMessage);
            }
            const removeHeader = theadRow.querySelector("th, td");
            if (removeHeader && removeHeader.textContent.includes("移除")) {
                removeHeader.style.visibility = "hidden";
            }
        } else {
            const empty = document.getElementById("empty-row");
            if (empty) empty.remove();
            const removeHeader = theadRow.querySelector("th, td");
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

    // 讓其他地方可呼叫
    window.__ensureEmptyRow = ensureEmptyRow;
});

// ============================
//  輪播
// ============================
window.onload = function () {
    let slideIndex = 0;
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
        slidesWrap.addEventListener(
            evt,
            () => {
                clearInterval(timer);
                timer = setInterval(nextSlide, 3000);
            },
            { passive: true }
        );
    });
};

// ============================
//  購物車頁面功能
// ============================

// === 配置：後端 API（同源最穩） ===
const onBackend = location.port === "8080";
const API_BASE = onBackend ? "" : "http://localhost:8080";
const FIXED_USER_ID = 1;

const API_ADD_TO_CART     = `${API_BASE}/api/cart/add`;
const API_CART_REMOVE     = `${API_BASE}/api/cart/remove`;
const API_CART_GET        = `${API_BASE}/api/cart/${FIXED_USER_ID}`;
const API_CART_UPDATE_QTY = `${API_BASE}/api/cart/update`; // PUT with JSON body

// ============================
//  工具：金額格式
// ============================
function formatCurrency(n) {
    return `$${n.toLocaleString("en-US")}`;
}
function parseCurrencyToNumber(s) {
    if (typeof s === "number") return s;
    return Number(String(s).replace(/[^0-9.-]/g, "")) || 0;
}

// ============================
//  小計 / 合計
// ============================
function recalcRowSubtotal(row) {
    const unit = Number(row.dataset.price || 0);
    const qtyInput = row.querySelector(".qty-input");
    const qty = Number(qtyInput?.value || 1);
    const subtotalCell = row.querySelector(".line-subtotal");
    const subtotal = unit * qty;
    if (subtotalCell) subtotalCell.textContent = formatCurrency(subtotal);
    return subtotal;
}

function recalcTotals() {
    const tbody = getCartTbody();
    if (!tbody) return;

    const rows = tbody.querySelectorAll("tr[data-product-id]");
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

// ============================
//  同步數量到後端（PUT + JSON Body，含 DEBUG）
// ============================
async function syncQty(row, newQty) {
    const cartItemId = row.dataset.cartItemId;
    const userId = row.dataset.userId || FIXED_USER_ID;

    console.log('[DEBUG] syncQty() start => cartItemId:', cartItemId, 'userId:', userId, 'newQty:', newQty);

    try {
        const res = await fetch(`${API_CART_UPDATE_QTY}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cartItemId: Number(cartItemId),
                quantity: Number(newQty)
            }),
        });

        let data = {};
        try {
            data = await res.json();
        } catch {
            // 若後端沒回 JSON，也不要炸
            data = {};
        }

        console.log('[DEBUG] syncQty() response:', res.status, data);

        if (!res.ok) {
            throw new Error(data.message || '更新失敗');
        }

        // 成功就不 reload，UI 已經先樂觀更新
        // 如需嚴格一致，可改成：await loadCart();

    } catch (err) {
        console.error('[DEBUG] syncQty() error:', err);
        alert(err.message || '更新數量時發生錯誤，將還原畫面');
        // 以重新載入確保與後端一致
        await loadCart();
    }
}

// ============================
//  綁定 ± 按鈕（事件委派）：綁在 #cart + DEBUG，只綁一次
// ============================
window.__qtyBound = false;
function bindQtyControls() {
    const cart = document.getElementById('cart');
    if (!cart) return;
    if (window.__qtyBound) return;
    window.__qtyBound = true;

    cart.addEventListener('click', (e) => {
        const btn = e.target.closest('.qty-btn');
        if (!btn) return;
        e.preventDefault();

        console.log('[DEBUG] 點擊的按鈕:', btn.dataset.action);

        const row = btn.closest('tr');
        const box = btn.closest('.qty');
        const input = box?.querySelector('.qty-input');
        if (!row || !box || !input) {
            console.warn('[DEBUG] 找不到 row/box/input，事件沒有綁到正確元素');
            return;
        }

        const min = Number(box.dataset.min || 1);
        const max = Number(box.dataset.max || 99);

        let val = Number(input.value || 1);
        const action = btn.dataset.action;

        console.log('[DEBUG] 原本數量:', val, 'min:', min, 'max:', max);

        if (action === 'inc') val = Math.min(max, val + 1);
        if (action === 'dec') val = Math.max(min, val - 1);

        console.log('[DEBUG] 更新後數量:', val);

        input.value = String(val);
        recalcRowSubtotal(row);
        recalcTotals();

        // 同步到後端
        console.log('[DEBUG] 呼叫 syncQty()', row.dataset.cartItemId, val);
        syncQty(row, val);
    });
}

// ============================
//  綁定刪除（×）按鈕：只綁一次
// ============================
window.__removeBound = false;
function bindRemoveRows() {
    const cart = document.getElementById('cart');
    if (!cart) return;
    if (window.__removeBound) return;
    window.__removeBound = true;

    cart.addEventListener("click", async (e) => {
        const icon = e.target.closest(".fa-times-circle");
        if (!icon) return;
        e.preventDefault();

        const row = icon.closest("tr");
        if (!row) return;

        const cartId = row.dataset.cartItemId;
        const userId = row.dataset.userId || FIXED_USER_ID;
        const name = row.querySelector("td:nth-child(3)")?.textContent?.trim() || "此商品";

        if (!cartId) {
            alert("缺少 cartItemId，請在 <tr> 上加 data-cart-item-id。");
            return;
        }
        if (!confirm(`要從購物車移除「${name}」嗎？`)) return;

        icon.style.pointerEvents = "none";

        try {
            const res = await fetch(
                `${API_CART_REMOVE}?cartItemId=${encodeURIComponent(cartId)}&userId=${encodeURIComponent(userId)}`,
                { method: "GET" }
            );
            const text = await res.text();
            let data = {}; try { data = JSON.parse(text); } catch {}
            if (!res.ok) throw new Error(data.message || text || res.statusText);

            row.remove();
            recalcTotals();
            window.__ensureEmptyRow?.();
        } catch (err) {
            console.error("Remove cart item error:", err);
            alert("移除失敗：" + (err.message || "請稍後再試"));
        } finally {
            icon.style.pointerEvents = "";
        }
    });
}

// ============================
//  根據後端資料渲染一列（兩顆按鈕加 type="button"）
// ============================
function renderCartRow(item) {
    const tr = document.createElement("tr");
    tr.dataset.cartItemId = item.cartItemId;
    tr.dataset.userId = (typeof item.userId !== 'undefined' ? item.userId : FIXED_USER_ID);
    tr.dataset.productId = item.productId;
    tr.dataset.price = item.price; // 單價數字

    tr.innerHTML = `
    <td><a href="#" class="btn-remove"><i class="far fa-times-circle"></i></a></td>
    <td><a href="sproduct.html"><img src="${item.imageUrl || "img/FruitsImg/null/G2_0.jpg"}" alt="${item.name}"/></a></td>
    <td>${item.name}</td>
    <td class="unit-price">${formatCurrency(Number(item.price || 0))}</td>
    <td>
      <div class="qty" data-min="1" data-max="99">
        <button type="button" class="qty-btn" data-action="dec" aria-label="減少一個">−</button>
        <input class="qty-input" type="text" inputmode="numeric" aria-label="數量" readonly value="${Number(item.quantity || 1)}">
        <button type="button" class="qty-btn" data-action="inc" aria-label="增加一個">＋</button>
      </div>
    </td>
    <td class="line-subtotal">${formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</td>
  `;
    return tr;
}

// ============================
//  載入購物車（打後端 GET）
// ============================
async function loadCart() {
    const tbody = getCartTbody();
    if (!tbody) return;

    tbody.innerHTML = ""; // 先清空
    console.log('[DEBUG] loadCart() start =>', API_CART_GET);

    try {
        const res = await fetch(API_CART_GET, { method: "GET" });
        const text = await res.text();
        let data = {};
        try { data = JSON.parse(text); } catch {}

        console.log('[DEBUG] loadCart() response:', res.status, data);

        if (!res.ok) throw new Error(data.message || text || res.statusText);

        (data.items || []).forEach((item) => {
            tbody.appendChild(renderCartRow(item));
        });

        recalcTotals();
        bindQtyControls();   // 只綁一次（有旗標）
        bindRemoveRows();    // 只綁一次（有旗標）
        window.__ensureEmptyRow?.();
    } catch (err) {
        console.error("loadCart error:", err);
        window.__ensureEmptyRow?.();
        alert("載入購物車失敗，請稍後再試");
    }
}

// ============================
//  單一商品頁：數量 + / - 與加入購物車（含 DEBUG）
// ============================
(function bindQtyControlsForSingle() {
    const box = document.querySelector(".single-pro-details");
    if (!box) return; // 不在單品頁就跳過

    box.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;

        const wrap = btn.closest(".qty");
        const input = wrap.querySelector(".qty-input");
        const min = Number(wrap.dataset.min || 1);
        const max = Number(wrap.dataset.max || 99);

        let val = Number(input.value || 1);
        const action = btn.dataset.action;

        if (action === "inc") val = Math.min(max, val + 1);
        if (action === "dec") val = Math.max(min, val - 1);

        input.value = String(val);
        console.log('[DEBUG][single] action:', action, 'qty:', val);
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
            alert("找不到商品編號，請檢查 <body data-product-id=\"...\"> 是否正確。");
            return;
        }

        btn.disabled = true;
        const oldText = btn.textContent;
        btn.textContent = "加入中…";

        try {
            console.log('[DEBUG] addToCart =>', { userId: FIXED_USER_ID, productId, quantity: qty });

            const res = await fetch(API_ADD_TO_CART, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // credentials: "include",
                body: JSON.stringify({
                    userId: FIXED_USER_ID,
                    productId: productId,
                    quantity: qty,
                }),
            });

            const text = await res.text();
            let data = {};
            try { data = JSON.parse(text); } catch {}

            console.log('[DEBUG] addToCart response:', res.status, data);

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

// ============================
//  頁面載入時初始化（含重編號）
// ============================
document.addEventListener("DOMContentLoaded", () => {
    loadCart(); // 先向後端拉購物車並渲染（含數量）

    const tbody = getCartTbody();
    if (tbody) {
        resetCartRowNumbers();
    }
});

function resetCartRowNumbers() {
    const tbody = getCartTbody();
    if (!tbody) return;

    const rows = tbody.querySelectorAll("tr[data-cart-item-id]");
    let index = 1;
    rows.forEach((row) => {
        row.dataset.displayId = index; // 顯示用
        const numberCell = row.querySelector(".cart-index");
        if (numberCell) numberCell.textContent = index;
        index++;
    });
}
