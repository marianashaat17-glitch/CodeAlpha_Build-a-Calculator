const display = document.getElementById('display');
const previousOperand = document.getElementById('previousOperand');
const historyList = document.getElementById('historyList');
const themeToggle = document.getElementById('themeToggle');

let currentOperand = '';
let previousOperandValue = '';
let operator = '';
let waitingForOperand = false;
let memory = 0;
let history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');

let isDarkTheme = localStorage.getItem('calculatorTheme') === 'dark';
document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
themeToggle.classList.toggle('active', isDarkTheme);

function init() {
    display.value = '0';
    updateHistory();
    setupEventListeners();
}

function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        });
    });
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeToggle.classList.toggle('active', isDarkTheme);
    localStorage.setItem('calculatorTheme', isDarkTheme ? 'dark' : 'light');
}

function updateDisplay() {
    display.value = currentOperand || '0';
    
    if (operator && previousOperandValue && !waitingForOperand) {
        previousOperand.textContent = `${previousOperandValue} ${getOperatorSymbol(operator)}`;
    } else if (operator && previousOperandValue) {
        previousOperand.textContent = `${previousOperandValue} ${getOperatorSymbol(operator)} ${currentOperand} =`;
    } else {
        previousOperand.textContent = '';
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷'
    };
    return symbols[op] || op;
}

// Input Functions
function appendToDisplay(value) {
    if (waitingForOperand) {
        currentOperand = value;
        waitingForOperand = false;
    } else {
        if (value === '.' && currentOperand.includes('.')) return;
        
        currentOperand = currentOperand === '0' ? value : currentOperand + value;
    }
    
    updateDisplay();
    animateButton(event.target);
}

function clearAll() {
    currentOperand = '';
    previousOperandValue = '';
    operator = '';
    waitingForOperand = false;
    updateDisplay();
    animateButton(event.target);
}

function clearEntry() {
    currentOperand = '';
    updateDisplay();
    animateButton(event.target);
}

function backspace() {
    if (currentOperand.length > 1) {
        currentOperand = currentOperand.slice(0, -1);
    } else {
        currentOperand = '';
    }
    updateDisplay();
    animateButton(event.target);
}

function setOperator(nextOperator) {
    const inputValue = parseFloat(currentOperand);

    if (previousOperandValue === '' || waitingForOperand) {
        previousOperandValue = inputValue;
    } else if (operator) {
        const currentValue = previousOperandValue || 0;
        const result = performCalculation(currentValue, inputValue, operator);

        currentOperand = `${parseFloat(result.toFixed(7))}`;
        previousOperandValue = result;
    }

    waitingForOperand = true;
    operator = nextOperator;
    updateDisplay();
}

function performCalculation(firstOperand, secondOperand, operator) {
    switch (operator) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '*':
            return firstOperand * secondOperand;
        case '/':
            return secondOperand !== 0 ? firstOperand / secondOperand : 0;
        default:
            return secondOperand;
    }
}

function calculate() {
    try {
        const inputValue = parseFloat(currentOperand);
        
        if (previousOperandValue !== '' && operator && !waitingForOperand) {
            const result = performCalculation(previousOperandValue, inputValue, operator);
            
            const calculation = `${previousOperandValue} ${getOperatorSymbol(operator)} ${inputValue}`;
            addToHistory(calculation, result);
            
            currentOperand = `${parseFloat(result.toFixed(7))}`;
            previousOperandValue = '';
            operator = '';
            waitingForOperand = true;
            
            updateDisplay();
            animateSuccess();
        }
    } catch (error) {
        handleError();
    }
    
    animateButton(event.target);
}

function squareRoot() {
    try {
        const value = parseFloat(currentOperand || '0');
        if (value < 0) {
            handleError();
            return;
        }
        
        const result = Math.sqrt(value);
        const calculation = `√${value}`;
        
        addToHistory(calculation, result);
        currentOperand = `${parseFloat(result.toFixed(7))}`;
        updateDisplay();
        animateSuccess();
    } catch (error) {
        handleError();
    }
    
    animateButton(event.target);
}

function square() {
    try {
        const value = parseFloat(currentOperand || '0');
        const result = value * value;
        const calculation = `${value}²`;
        
        addToHistory(calculation, result);
        currentOperand = `${parseFloat(result.toFixed(7))}`;
        updateDisplay();
        animateSuccess();
    } catch (error) {
        handleError();
    }
    
    animateButton(event.target);
}

function percentage() {
    try {
        const value = parseFloat(currentOperand || '0');
        const result = value / 100;
        
        currentOperand = `${parseFloat(result.toFixed(7))}`;
        updateDisplay();
    } catch (error) {
        handleError();
    }
    
    animateButton(event.target);
}

function toggleSign() {
    if (currentOperand) {
        currentOperand = currentOperand.startsWith('-') 
            ? currentOperand.slice(1) 
            : '-' + currentOperand;
        updateDisplay();
    }
    
    animateButton(event.target);
}

function memoryStore() {
    memory = parseFloat(currentOperand || '0');
    showNotification('Stored in memory');
    animateButton(event.target);
}

function memoryRecall() {
    currentOperand = memory.toString();
    updateDisplay();
    showNotification('Memory recalled');
    animateButton(event.target);
}

function memoryClear() {
    memory = 0;
    showNotification('Memory cleared');
    animateButton(event.target);
}

function memoryAdd() {
    memory += parseFloat(currentOperand || '0');
    showNotification('Added to memory');
    animateButton(event.target);
}

function addToHistory(calculation, result) {
    const historyItem = {
        calculation,
        result: parseFloat(result.toFixed(7)),
        timestamp: new Date().toLocaleTimeString()
    };
    
    history.unshift(historyItem);
    
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    updateHistory();
}

function updateHistory() {
    historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="calculation">
                <span>${item.calculation}</span>
                <span class="result">${item.result}</span>
            </div>
        `;
        
        historyItem.addEventListener('click', () => {
            currentOperand = item.result.toString();
            updateDisplay();
            animateSuccess();
        });
        
        historyList.appendChild(historyItem);
    });
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calculatorHistory');
    updateHistory();
    showNotification('History cleared');
}

function handleError() {
    currentOperand = '';
    display.value = 'Error';
    previousOperand.textContent = '';
    
    display.classList.add('error-animation');
    setTimeout(() => {
        display.classList.remove('error-animation');
        clearAll();
    }, 1500);
}

function animateSuccess() {
    display.classList.add('success-animation');
    setTimeout(() => {
        display.classList.remove('success-animation');
    }, 300);
}

function animateButton(button) {
    if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--operator-bg);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

document.addEventListener('keydown', (event) => {
    event.preventDefault();
    const key = event.key;
    
    if (/[0-9]/.test(key)) {
        appendToDisplay(key);
    }
    else if (key === '+') {
        setOperator('+');
    }
    else if (key === '-') {
        setOperator('-');
    }
    else if (key === '*') {
        setOperator('*');
    }
    else if (key === '/') {
        setOperator('/');
    }
    else if (key === '.') {
        appendToDisplay('.');
    }
    else if (key === 'Enter' || key === '=') {
        calculate();
    }
    else if (key === 'Escape') {
        clearAll();
    }
    else if (key === 'Backspace') {
        backspace();
    }
    else if (key === 'Delete') {
        clearEntry();
    }
    else if (key === '%') {
        percentage();
    }
    else if (event.ctrlKey && key === 'm') {
        memoryStore();
    }
    else if (event.ctrlKey && key === 'r') {
        memoryRecall();
    }
    else if (event.ctrlKey && key === 'l') {
        memoryClear();
    }
    else if (event.ctrlKey && key === 'p') {
        memoryAdd();
    }
    else if (event.ctrlKey && key === 't') {
        toggleTheme();
    }
    else if (event.ctrlKey && key === 's') {
        squareRoot();
    }
    else if (event.ctrlKey && key === 'q') {
        square();
    }
});

let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeLength = touchEndY - touchStartY;
    
    if (swipeLength < -swipeThreshold) {
        clearAll();
    }
    else if (swipeLength > swipeThreshold) {
        toggleHistoryVisibility();
    }
}

function toggleHistoryVisibility() {
    const historySection = document.querySelector('.history-section');
    const isVisible = historySection.style.display !== 'none';
    
    historySection.style.display = isVisible ? 'none' : 'block';
    historySection.style.animation = isVisible ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out';
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(20px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


window.appendToDisplay = appendToDisplay;
window.clearAll = clearAll;
window.clearEntry = clearEntry;
window.backspace = backspace;
window.calculate = calculate;
window.squareRoot = squareRoot;
window.square = square;
window.percentage = percentage;
window.toggleSign = toggleSign;
window.memoryStore = memoryStore;
window.memoryRecall = memoryRecall;
window.memoryClear = memoryClear;
window.memoryAdd = memoryAdd;
window.clearHistory = clearHistory;

window.setOperator = setOperator;

const originalAppendToDisplay = window.appendToDisplay;
window.appendToDisplay = function(value) {
    if (['+', '-', '*', '/'].includes(value)) {
        setOperator(value);
    } else {
        originalAppendToDisplay(value);
    }
};

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        localStorage.setItem('calculatorState', JSON.stringify({
            currentOperand,
            previousOperandValue,
            operator,
            waitingForOperand,
            memory
        }));
    } else if (document.visibilityState === 'visible') {
        const savedState = localStorage.getItem('calculatorState');
        if (savedState) {
            const state = JSON.parse(savedState);
            currentOperand = state.currentOperand || '';
            previousOperandValue = state.previousOperandValue || '';
            operator = state.operator || '';
            waitingForOperand = state.waitingForOperand || false;
            memory = state.memory || 0;
            updateDisplay();
        }
    }
});

function addTooltips() {
    const tooltips = {
        'MS': 'Memory Store (Ctrl+M)',
        'MR': 'Memory Recall (Ctrl+R)', 
        'MC': 'Memory Clear (Ctrl+L)',
        'M+': 'Memory Add (Ctrl+P)',
        'AC': 'All Clear (Escape)',
        'CE': 'Clear Entry (Delete)',
        '⌫': 'Backspace',
        '√': 'Square Root (Ctrl+S)',
        'x²': 'Square (Ctrl+Q)',
        '%': 'Percentage (%)',
        '±': 'Toggle Sign'
    };
    
    document.querySelectorAll('button').forEach(button => {
        const text = button.textContent.trim();
        if (tooltips[text]) {
            button.title = tooltips[text];
        }
    });
}

setTimeout(addTooltips, 100);