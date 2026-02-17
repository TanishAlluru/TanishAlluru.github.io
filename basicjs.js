// basicjs.js

// ---------- helpers ----------
function getCounterValue() {
  const counterEl = document.getElementById("counter");
  const n = parseInt(counterEl.textContent, 10);
  return Number.isFinite(n) ? n : 0;
}

function setCounterValue(n) {
  document.getElementById("counter").textContent = String(n);
}

// ---------- 1pt: Simple Functions ----------
function tickUp() {
  const n = getCounterValue();
  setCounterValue(n + 1);
}

function tickDown() {
  const n = getCounterValue();
  setCounterValue(n - 1);
}

// ---------- 1pt: Simple For Loop ----------
function runForLoop() {
  const n = getCounterValue();
  const out = [];

  // Every number from 0 up to and including the counter
  for (let i = 0; i <= n; i++) out.push(i);

  document.getElementById("forLoopResult").textContent = out.join(" ");
}

// ---------- 1pt: Repetition with Condition ----------
function showOddNumbers() {
  const n = getCounterValue();
  const out = [];

  // All odd numbers from 1 to the counter
  for (let i = 1; i <= n; i += 1) {
    if (i % 2 !== 0) out.push(i);
  }

  document.getElementById("oddNumberResult").textContent = out.join(" ");
}

// ---------- 1pt: Arrays ----------
function addMultiplesToArray() {
  const n = getCounterValue();
  const arr = [];

  // If number < 5, print empty array
  if (n < 5) {
    console.log(arr);
    return;
  }

  // Add every multiple of 5 up to n, in reverse order
  for (let i = n; i >= 5; i--) {
    if (i % 5 === 0) arr.push(i);
  }

  // Print the array itself
  console.log(arr);
}

// ---------- 2pts: Objects and Form Fields ----------
function printCarObject() {
  const type = document.getElementById("carType").value.trim();
  const mpg = document.getElementById("carMPG").value.trim();
  const color = document.getElementById("carColor").value.trim();

  // Match the object keys shown in the assignment footer objects (cType/cMPG/cColor)
  const carObj = { cType: type, cMPG: mpg, cColor: color };
  console.log(carObj);
}

// ---------- 2pts: Objects and Form Fields pt. 2 ----------
function loadCar(which) {
  let srcObj = null;

  // carObject1/2/3 are defined in the HTML footer script
  if (which === 1) srcObj = carObject1;
  else if (which === 2) srcObj = carObject2;
  else if (which === 3) srcObj = carObject3;

  if (!srcObj) return;

  document.getElementById("carType").value = srcObj.cType ?? "";
  document.getElementById("carMPG").value = srcObj.cMPG ?? "";
  document.getElementById("carColor").value = srcObj.cColor ?? "";
}

// ---------- 2pt: Changing Styles ----------
function changeColor(which) {
  const p = document.getElementById("styleParagraph");

  if (which === 1) p.style.color = "red";
  else if (which === 2) p.style.color = "green";
  else if (which === 3) p.style.color = "blue";
}
