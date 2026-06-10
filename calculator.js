/* ─────────────────────────────────────────────
   Calculator — v2.0
   Features: basic ops, %, +/−, chained calc,
   memory (MC/MR/M+/M−), history panel,
   scientific (√x, x², 1/x, xʸ), keyboard
───────────────────────────────────────────── */

let currentInput      = '';
let previousInput     = '';
let operator          = null;
let shouldResetScreen = false;
let justCalculated    = false;
let memory            = null;
let history           = [];

const resultEl      = document.getElementById('result');
const expressionEl  = document.getElementById('expression');
const historyList   = document.getElementById('historyList');
const historyPanel  = document.getElementById('historyPanel');
const memIndicator  = document.getElementById('memIndicator');

/* ── Display ── */
function updateDisplay(value) {
  const str = String(value);
  resultEl.textContent = formatNumber(str);
  resultEl.classList.toggle('small', str.replace(/[^0-9.]/g, '').length > 10);
}

function formatNumber(str) {
  if (!str || str === '-' || str.endsWith('.') || str === 'Error') return str;
  const num = parseFloat(str);
  if (isNaN(num)) return str;
  if (Math.abs(num) >= 1e15) return num.toExponential(6);
  const parts = str.split('.');
  parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
  return parts.join('.');
}

/* ── Number input ── */
function appendNum(num) {
  if (shouldResetScreen)  { currentInput = ''; shouldResetScreen = false; }
  if (justCalculated)     { currentInput = ''; justCalculated = false; expressionEl.textContent = ''; }
  if (currentInput.replace('-', '').length >= 15) return;
  currentInput += num;
  updateDisplay(currentInput);
}

function appendDot() {
  if (shouldResetScreen) { currentInput = '0'; shouldResetScreen = false; }
  if (justCalculated)    { currentInput = '0'; justCalculated = false; }
  if (currentInput.includes('.')) return;
  if (!currentInput || currentInput === '-') currentInput += '0';
  currentInput += '.';
  updateDisplay(currentInput);
}

/* ── Operator ── */
function appendOp(op) {
  justCalculated = false;
  if (currentInput === '' && previousInput !== '') {
    operator = op;
    expressionEl.textContent = formatNumber(previousInput) + '  ' + displayOp(op);
    return;
  }
  if (currentInput !== '' && previousInput !== '' && operator) {
    const result = compute();
    if (result === null) return;
    previousInput = String(result);
    updateDisplay(previousInput);
    expressionEl.textContent = formatNumber(previousInput) + '  ' + displayOp(op);
    currentInput = '';
    operator = op;
    shouldResetScreen = false;
    return;
  }
  if (currentInput === '') return;
  previousInput = currentInput;
  operator = op;
  expressionEl.textContent = formatNumber(previousInput) + '  ' + displayOp(op);
  shouldResetScreen = true;
}

function displayOp(op) {
  return { '+': '+', '-': '−', '*': '×', '/': '÷', '^': '^' }[op] || op;
}

/* ── Compute ── */
function compute() {
  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(curr)) return null;
  let result;
  switch (operator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '^': result = Math.pow(prev, curr); break;
    case '/':
      if (curr === 0) {
        expressionEl.textContent = '';
        resultEl.textContent = 'Error';
        currentInput = ''; previousInput = ''; operator = null;
        return null;
      }
      result = prev / curr; break;
    default: return null;
  }
  return parseFloat(result.toPrecision(14));
}

/* ── Calculate ── */
function calculate() {
  if (currentInput === '' || previousInput === '' || operator === null) return;
  const result = compute();
  if (result === null) return;
  const expr = formatNumber(previousInput) + '  ' + displayOp(operator) + '  ' + formatNumber(currentInput) + '  =';
  addHistory(expr, result);
  expressionEl.textContent = expr;
  currentInput = String(result);
  previousInput = ''; operator = null;
  updateDisplay(currentInput);
  justCalculated = true;
}

/* ── Utility ── */
function clearAll() {
  currentInput = ''; previousInput = ''; operator = null;
  justCalculated = false; shouldResetScreen = false;
  expressionEl.textContent = '';
  resultEl.textContent = '0';
  resultEl.classList.remove('small');
}

function toggleSign() {
  if (!currentInput || currentInput === '0') return;
  currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
  updateDisplay(currentInput);
}

function percent() {
  if (!currentInput) return;
  const val = parseFloat(currentInput);
  if (isNaN(val)) return;
  currentInput = String(val / 100);
  updateDisplay(currentInput);
}

/* ── Scientific ── */
function squareRoot() {
  const val = parseFloat(currentInput || '0');
  if (val < 0) { resultEl.textContent = 'Error'; return; }
  const result = parseFloat(Math.sqrt(val).toPrecision(14));
  addHistory('√(' + formatNumber(String(val)) + ')  =', result);
  currentInput = String(result);
  updateDisplay(currentInput);
  justCalculated = true;
}

function square() {
  const val = parseFloat(currentInput || '0');
  const result = parseFloat(Math.pow(val, 2).toPrecision(14));
  addHistory(formatNumber(String(val)) + '²  =', result);
  currentInput = String(result);
  updateDisplay(currentInput);
  justCalculated = true;
}

function reciprocal() {
  const val = parseFloat(currentInput || '0');
  if (val === 0) { resultEl.textContent = 'Error'; return; }
  const result = parseFloat((1 / val).toPrecision(14));
  addHistory('1/' + formatNumber(String(val)) + '  =', result);
  currentInput = String(result);
  updateDisplay(currentInput);
  justCalculated = true;
}

/* ── Memory ── */
function memClear() {
  memory = null;
  memIndicator.textContent = '';
}

function memRecall() {
  if (memory === null) return;
  currentInput = String(memory);
  shouldResetScreen = false;
  justCalculated = false;
  updateDisplay(currentInput);
}

function memAdd() {
  const val = parseFloat(currentInput || '0');
  if (isNaN(val)) return;
  memory = (memory || 0) + val;
  memIndicator.textContent = 'M';
  flashMem();
}

function memSub() {
  const val = parseFloat(currentInput || '0');
  if (isNaN(val)) return;
  memory = (memory || 0) - val;
  memIndicator.textContent = 'M';
  flashMem();
}

function flashMem() {
  memIndicator.style.opacity = '1';
  setTimeout(() => { memIndicator.style.opacity = '0.7'; }, 300);
}

/* ── History ── */
function addHistory(expr, result) {
  history.unshift({ expr, result });
  if (history.length > 50) history.pop();
  renderHistory();
}

function renderHistory() {
  if (!history.length) {
    historyList.innerHTML = '<li class="history-empty">No calculations yet</li>';
    return;
  }
  historyList.innerHTML = history.map((h, i) => `
    <li class="history-item" onclick="recallHistory(${i})">
      <div class="h-expr">${h.expr}</div>
      <div class="h-result">${formatNumber(String(h.result))}</div>
    </li>`).join('');
}

function recallHistory(index) {
  currentInput = String(history[index].result);
  justCalculated = true;
  shouldResetScreen = false;
  updateDisplay(currentInput);
}

function clearHistory() {
  history = [];
  renderHistory();
}

function toggleHistory() {
  historyPanel.classList.toggle('open');
}

/* ── Keyboard ── */
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9')        appendNum(e.key);
  else if (e.key === '.')                   appendDot();
  else if (e.key === '+')                   appendOp('+');
  else if (e.key === '-')                   appendOp('-');
  else if (e.key === '*')                   appendOp('*');
  else if (e.key === '/')                   { e.preventDefault(); appendOp('/'); }
  else if (e.key === '^')                   appendOp('^');
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') {
    if (shouldResetScreen || justCalculated) return;
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || '0');
  }
  else if (e.key === 'Escape')              clearAll();
  else if (e.key === '%')                   percent();
  else if (e.key === 'h' || e.key === 'H') toggleHistory();
});
