let display = document.getElementById("display");
let lastAnswer = "";

// Hàm render display luôn kèm cursor
function updateDisplay(value) {
    display.innerHTML = value + `<span id="cursor"></span>`;
}

// Khởi tạo
updateDisplay("");

// Lấy text thật (không tính cursor)
function getDisplayValue() {
    return display.textContent.replace("|", "");
}

// Thêm số / ký tự
function append(value) {
    let current = getDisplayValue();

    if (current === "Error") current = "";

    updateDisplay(current + value);
}

// Xóa toàn bộ
function clearDisplay() {
    updateDisplay("");
}

// Xóa ký tự cuối
function deleteLast() {
    let current = getDisplayValue();

    if (current === "Error") {
        updateDisplay("");
        return;
    }

    current = current.slice(0, -1);
    updateDisplay(current);
}

// Tính toán
function calculate() {
    let expr = getDisplayValue();

    if (!expr) return;

    // Kiểm tra ký tự hợp lệ
    if (!/^[0-9+\-*/%().\s]+$/.test(expr)) {
        updateDisplay("Error");
        lastAnswer = "";
        return;
    }

    try {
        // Tính toán
        const result = eval(expr);

        if (result === undefined || result === null || Number.isNaN(result)) {
            updateDisplay("Error");
            lastAnswer = "";
        } else {
            lastAnswer = String(result);
            updateDisplay(lastAnswer);
        }
    } catch {
        updateDisplay("Error");
        lastAnswer = "";
    }
}

// Kiểm tra có phải toán tử không
function isOperator(ch) {
    return /^[+\-*/%]$/.test(ch);
}

// Nút Ans
function useAnswer() {
    if (!lastAnswer) return;

    let current = getDisplayValue();

    if (current === "Error" || current.trim() === "") {
        
        updateDisplay(lastAnswer);
        return;
    }

    const lastChar = current.slice(-1);

    if (isOperator(lastChar)) {
        // nếu ký tự cuối là toán tử → append Ans
        updateDisplay(current + lastAnswer);
    } else {
        // nếu đang nhập số → thay thế bằng Ans
        updateDisplay(lastAnswer);
    }
}
