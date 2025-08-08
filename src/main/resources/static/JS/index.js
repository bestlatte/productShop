// ========================================
// 導航欄響應式功能
// ========================================
function myMenuFunction() {
  var i = document.getElementById("navMenu");

  if (i.className === "nav-menu") {
    i.className += " responsive";
  } else {
    i.className = "nav-menu";
  }
}

// ========================================
// 表單切換功能
// ========================================
// 獲取DOM元素
var a = document.getElementById("loginBtn");
var b = document.getElementById("registerBtn");
var x = document.getElementById("login");
var y = document.getElementById("register");

// 切換到登入表單
function login() {
  // 移動表單位置
  x.style.left = "4px";
  y.style.right = "-520px";

  // 更新按鈕樣式
  a.className += " white-btn";
  b.className = "btn";

  // 設置透明度
  x.style.opacity = 1;
  y.style.opacity = 0;

  // Google按鈕動畫 - 登入表單顯示時
  document.querySelector(".login-google-btn").style.left = "0";
  document.querySelector(".register-google-btn").style.right = "-100%";
  document.querySelector(".register-google-btn").style.left = "auto";
  document.querySelector(".login-google-btn").style.opacity = "1";
  document.querySelector(".register-google-btn").style.opacity = "0";
}

// 切換到註冊表單
function register() {
  // 移動表單位置
  x.style.left = "-510px";
  y.style.right = "5px";

  // 更新按鈕樣式
  a.className = "btn";
  b.className += " white-btn";

  // 設置透明度
  x.style.opacity = 0;
  y.style.opacity = 1;

  // Google按鈕動畫 - 註冊表單顯示時
  document.querySelector(".login-google-btn").style.left = "-100%";
  document.querySelector(".register-google-btn").style.right = "0";
  document.querySelector(".register-google-btn").style.left = "auto";
  document.querySelector(".register-google-btn").style.opacity = "1";
  document.querySelector(".login-google-btn").style.opacity = "0";
}

// ========================================
// 註冊表單驗證功能
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector("#register");
  if (!registerForm) return;

  const submitBtn = registerForm.querySelector('input[type="submit"]');

  // 定義需要驗證的欄位
  const fields = [
    { id: "register-firstname", placeholder: "Name" },
    { id: "register-phone", placeholder: "Phone" },
    { id: "register-email", placeholder: "Email" },
    { id: "register-password", placeholder: "Password" },
  ];

  // 為每個欄位設置事件監聽器
  fields.forEach(function (f) {
    const input = document.getElementById(f.id);
    if (input) {
      // 保存原始提示文字
      input.dataset.placeholder = f.placeholder;

      // 輸入時恢復原始提示文字
      input.addEventListener("input", function () {
        input.placeholder = input.dataset.placeholder;
        input.style.border = "";
      });
    }
  });

  // 註冊按鈕點擊事件
  submitBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let valid = true;

    // 驗證姓名
    const name = document.getElementById("register-firstname");
    if (!name.value.trim()) {
      name.value = "";
      name.placeholder = "Name required";
      valid = false;
    }

    // 驗證電話
    const phone = document.getElementById("register-phone");
    if (!phone.value.trim()) {
      phone.value = "";
      phone.placeholder = "Phone required";
      valid = false;
    }

    // 驗證電子郵件
    const email = document.getElementById("register-email");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      email.value = "";
      email.placeholder = "Email is required";
      valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      email.value = "";
      email.placeholder = "Invalid email";
      valid = false;
    }

    // 驗證密碼
    const password = document.getElementById("register-password");
    if (!password.value.trim()) {
      password.value = "";
      password.placeholder = "Password is required";
      valid = false;
    } else if (password.value.length < 6) {
      password.value = "";
      password.placeholder = "At least 6 characters";
      valid = false;
    }

    // 如果驗證通過，發送註冊請求
    if (valid) {
      // 準備註冊數據 - 對應 Member 實體的欄位
      const memberData = {
        email: email.value.trim(),
        password: password.value,
        name: name.value.trim(),
        phone: phone.value.trim(),
      };

      // 發送註冊請求到 RegisterController
      fetch("/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((result) => {
          console.log("註冊成功:", result);

          // 清空表單
          name.value = "";
          phone.value = "";
          email.value = "";
          password.value = "";

          // 顯示成功訊息
          showSuccessMessage("註冊成功！請檢查您的郵箱進行驗證。");

          // 創建並顯示重寄驗證信模態視窗
          showResendVerificationModal(result || "註冊成功！");
        })
        .catch((error) => {
          console.error("註冊失敗:", error);

          // 顯示錯誤訊息
          showErrorMessage("註冊失敗：" + error.message);
        });
    }
  });

  // ========================================
  // 重寄驗證信功能
  // ========================================
  function resendVerification() {
    const email = document.getElementById("resendEmail");
    if (!email || !email.value.trim()) {
      alert("請輸入 email 地址");
      return;
    }

    fetch("/users/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value.trim() }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((msg) => {
        console.log("重寄驗證信成功:", msg);
        showSuccessMessage(msg);
      })
      .catch((err) => {
        console.error("重寄驗證信失敗:", err);
        showErrorMessage("重寄驗證信失敗：" + err.message);
      });
  }

  // 將重寄驗證信函數設為全域函數，以便在 HTML 中調用
  window.resendVerification = resendVerification;

  // ========================================
  // 訊息顯示功能
  // ========================================
  function showSuccessMessage(message) {
    const successMsg = document.createElement("div");
    successMsg.textContent = message;
    successMsg.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(80deg, #28a745, #20c997);
      color: white;
      padding: 12px 25px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10001;
      animation: slideDown 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(successMsg);

    // 3秒後移除訊息
    setTimeout(() => {
      successMsg.style.animation = "slideUp 0.3s ease";
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 300);
    }, 3000);
  }

  function showErrorMessage(message) {
    const errorMsg = document.createElement("div");
    errorMsg.textContent = message;
    errorMsg.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(80deg, #dc3545, #c82333);
      color: white;
      padding: 12px 25px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10001;
      animation: slideDown 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(errorMsg);

    // 3秒後移除訊息
    setTimeout(() => {
      errorMsg.style.animation = "slideUp 0.3s ease";
      setTimeout(() => {
        if (errorMsg.parentNode) {
          errorMsg.parentNode.removeChild(errorMsg);
        }
      }, 300);
    }, 3000);
  }

  // ========================================
  // 重寄驗證信模態視窗功能
  // ========================================
  function showResendVerificationModal(message) {
    // 創建模態視窗背景
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "verificationModalOverlay";
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;

    // 創建模態視窗內容
    const modalContent = document.createElement("div");
    modalContent.id = "verificationModalContent";
    modalContent.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
      position: relative;
    `;

    // 添加關閉按鈕
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    `;
    closeBtn.onmouseover = () => (closeBtn.style.backgroundColor = "#f0f0f0");
    closeBtn.onmouseout = () =>
      (closeBtn.style.backgroundColor = "transparent");
    closeBtn.onclick = () => closeModal();

    // 創建標題
    const title = document.createElement("h2");
    title.textContent = "註冊成功！";
    title.style.cssText = `
      color: #333;
      margin-bottom: 20px;
      font-size: 24px;
      font-weight: 600;
    `;

    // 創建訊息
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      color: #666;
      margin-bottom: 25px;
      font-size: 16px;
      line-height: 1.5;
    `;

    // 創建重寄驗證信區塊
    const resendSection = document.createElement("div");
    resendSection.style.cssText = `
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 15px;
      padding: 25px;
      margin: 20px 0;
      border: 2px solid #dee2e6;
    `;

    const resendTitle = document.createElement("h3");
    resendTitle.textContent = "重寄驗證信功能區塊";
    resendTitle.style.cssText = `
      color: #495057;
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 600;
    `;

    const resendDescription = document.createElement("p");
    resendDescription.textContent =
      "如果您沒有收到驗證信，請輸入您的 email 地址重新發送驗證信。";
    resendDescription.style.cssText = `
      color: #6c757d;
      margin-bottom: 20px;
      font-size: 14px;
      line-height: 1.4;
    `;

    // 創建 email 輸入框
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "modalResendEmail";
    emailInput.placeholder = "請輸入您的 email 地址";
    emailInput.style.cssText = `
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 15px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    `;
    emailInput.onfocus = () => (emailInput.style.borderColor = "#007bff");
    emailInput.onblur = () => (emailInput.style.borderColor = "#dee2e6");

    // 創建重寄按鈕
    const resendButton = document.createElement("button");
    resendButton.textContent = "重寄驗證信";
    resendButton.style.cssText = `
      background: linear-gradient(80deg, #886153d8, #fd1d1dca, #436727d0);
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-right: 10px;
    `;
    resendButton.onmouseover = () => {
      resendButton.style.transform = "translateY(-2px)";
      resendButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    };
    resendButton.onmouseout = () => {
      resendButton.style.transform = "translateY(0)";
      resendButton.style.boxShadow = "none";
    };
    resendButton.onclick = () => {
      const email = emailInput.value.trim();
      if (!email) {
        alert("請輸入 email 地址");
        return;
      }
      resendVerificationFromModal(email);
    };

    // 創建關閉模態視窗按鈕
    const closeModalBtn = document.createElement("button");
    closeModalBtn.textContent = "關閉";
    closeModalBtn.style.cssText = `
      background: #6c757d;
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    `;
    closeModalBtn.onmouseover = () =>
      (closeModalBtn.style.backgroundColor = "#5a6268");
    closeModalBtn.onmouseout = () =>
      (closeModalBtn.style.backgroundColor = "#6c757d");
    closeModalBtn.onclick = () => closeModal();

    // 組裝模態視窗
    resendSection.appendChild(resendTitle);
    resendSection.appendChild(resendDescription);
    resendSection.appendChild(emailInput);
    resendSection.appendChild(resendButton);
    resendSection.appendChild(closeModalBtn);

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(messageDiv);
    modalContent.appendChild(resendSection);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // 點擊背景關閉模態視窗
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    };

    // 添加 CSS 動畫
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // 關閉模態視窗函數
  function closeModal() {
    const modal = document.getElementById("verificationModalOverlay");
    if (modal) {
      modal.style.animation = "fadeOut 0.3s ease";
      modal.querySelector("#verificationModalContent").style.animation =
        "slideOut 0.3s ease";

      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        // 切換到登入表單
        login();
      }, 300);
    }
  }

  // 從模態視窗重寄驗證信
  function resendVerificationFromModal(email) {
    fetch("/users/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((msg) => {
        console.log("模態視窗重寄驗證信成功:", msg);
        showSuccessMessage(msg);
      })
      .catch((err) => {
        console.error("模態視窗重寄驗證信失敗:", err);
        showErrorMessage("重寄驗證信失敗：" + err.message);
      });
  }

  // 添加額外的 CSS 動畫
  const additionalStyle = document.createElement("style");
  additionalStyle.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideOut {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-50px); opacity: 0; }
    }
    @keyframes slideDown {
      from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(0); opacity: 1; }
      to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
  `;
  document.head.appendChild(additionalStyle);

  // ========================================
  // Google OAuth2 功能
  // ========================================
  // 等待 DOM 完全載入後再綁定事件
  setTimeout(function () {
    const loginGoogleBtn = document.querySelector(
      ".login-google-btn .google-login-btn"
    );
    const registerGoogleBtn = document.querySelector(
      ".register-google-btn .google-login-btn"
    );

    if (loginGoogleBtn) {
      loginGoogleBtn.addEventListener("click", function () {
        console.log("🔵 Login Google button clicked");
        const clientId =
          "113684018481-lv3ri7eio39b8ckk6pjlov5rjfooeqiu.apps.googleusercontent.com";
        const redirectUri = "http://localhost:8080/oauth2/callback";
        const scope = "openid profile email";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=${encodeURIComponent(
          scope
        )}&access_type=offline&prompt=consent`;

        console.log("🔵 Redirecting to Google OAuth");
        window.location.href = authUrl;
      });
    }

    if (registerGoogleBtn) {
      registerGoogleBtn.addEventListener("click", function () {
        console.log("🟢 Register Google button clicked");
        const clientId =
          "113684018481-lv3ri7eio39b8ckk6pjlov5rjfooeqiu.apps.googleusercontent.com";
        const redirectUri = "http://localhost:8080/oauth2/callback";
        const scope = "openid profile email";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=code&scope=${encodeURIComponent(
          scope
        )}&access_type=offline&prompt=consent`;

        console.log("🟢 Redirecting to Google OAuth");
        window.location.href = authUrl;
      });
    }
  }, 100);
});
