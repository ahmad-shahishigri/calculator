let currentInput = '';
let previousInput = '';
let operator = null;
let shouldResetScreen = false;
let justCalculated = false;

const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');

function updateDisplay(value) {
  const str = String(value);
  resultEl.textContent = formatNumber(str);
  resultEl.classList.toggle('small', str.length > 10);
}

function formatNumber(str) {
  if (str === '' || str === '-' || str.endsWith('.')) return str;
  const num = parseFloat(str);
  if (isNaN(num)) return str;
  if (Math.abs(num) >= 1e15) return num.toExponential(6);
  // Format with commas but preserve decimals
  const parts = str.split('.');
  parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
  return parts.join('.');
}

function appendNum(num) {
  if (shouldResetScreen) {
    currentInput = '';
    shouldResetScreen = false;
  }
  if (justCalculated) {
    currentInput = '';
    justCalculated = false;
    expressionEl.textContent = '';
  }
  if (currentInput.replace('-', '').length >= 15) return;
  currentInput += num;
  updateDisplay(currentInput);
}

function appendDot() {
  if (shouldResetScreen) {
    currentInput = '0';
    shouldResetScreen = false;
  }
  if (justCalculated) {
    currentInput = '0';
    justCalculated = false;
  }
  if (currentInput.includes('.')) return;
  if (currentInput === '' || currentInput === '-') currentInput += '0';
  currentInput += '.';
  updateDisplay(currentInput);
}

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
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
}

function compute() {
  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(curr)) return null;
  let result;
  switch (operator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':      if (curr === 0) {
        expressionEl.textContent = '';
        resultEl.textContent = 'Error';
        currentInput = '';
        previousInput = '';
        operator = null;
        return null;
      }
      result = prev / curr;
      break;
    default: return null;
  }
  // Floating point fix
  result = parseFloat(result.toPrecision(14));
  return result;
}

function calculate() {
  if (currentInput === '' || previousInput === '' || operator === null) return;
  const result = compute();
  if (result === null) return;
  expressionEl.textContent = formatNumber(previousInput) + '  ' + displayOp(operator) + '  ' + formatNumber(currentInput) + '  =';
  currentInput = String(result);
  previousInput = '';
  operator = null;
  updateDisplay(currentInput);
  justCalculated = true;
  shouldResetScreen = false;
}

function clearAll() {
  currentInput = '';
  previousInput = '';
  operator = null;
  justCalculated = false;
  shouldResetScreen = false;
  expressionEl.textContent = '';
  resultEl.textContent = '0';
  resultEl.classList.remove('small');
}

function toggleSign() {
  if (currentInput === '' || currentInput === '0') return;
  currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
  updateDisplay(currentInput);
}

function percent() {
  if (currentInput === '') return;
  const val = parseFloat(currentInput);
  if (isNaN(val)) return;
  currentInput = String(val / 100);
  updateDisplay(currentInput);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendNum(e.key);
  else if (e.key === '.') appendDot();
  else if (e.key === '+') appendOp('+');
  else if (e.key === '-') appendOp('-');
  else if (e.key === '*') appendOp('*');
  else if (e.key === '/') { e.preventDefault(); appendOp('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || '0');
  }
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') percent();
});
