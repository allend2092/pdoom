// Load scenarios once at startup and keep a promise
let scenarios = [];
const loadScenarios = fetch('scenarios.txt')
  .then(r => r.text())
  .then(text => {
    scenarios = text.trim().split('\n').map(s => s.trim()).filter(s => s.length);
  })
  .catch(err => console.error('Failed to load scenarios:', err));

document.getElementById('calcBtn').addEventListener('click', async () => {
  const yearInput = document.getElementById('yearInput').value;
  const currentYear = new Date().getFullYear();
  const yearsAhead = yearInput - currentYear;
  const resultDiv = document.getElementById('result');

  if (isNaN(yearsAhead) || yearsAhead < 0) {
    resultDiv.textContent = 'Please enter a future year.';
    return;
  }

  // For testing: generate a random probability between 25% and 100%
  const probability = Math.floor(Math.random() * 76) + 25; // 25‑100 inclusive
  let output = `Estimated P(DOOM): ${probability}%`;

  // Ensure scenarios are loaded before possibly using them
  await loadScenarios;

  // If probability > 50, show a random scenario
  if (probability > 50 && scenarios.length) {
    const rand = Math.floor(Math.random() * scenarios.length);
    output += '\nScenario: ' + scenarios[rand];
  }

  resultDiv.textContent = output;
});
