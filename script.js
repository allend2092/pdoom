let scenarios = [];
const loadScenarios = fetch('scenarios.txt')
  .then((r) => r.text())
  .then((text) => {
    scenarios = text
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length)
      .map((line) => {
        const [kindRaw, titleRaw, descriptionRaw] = line.split('|').map((part) => part.trim());

        if (!descriptionRaw) {
          return {
            kind: 'critical',
            title: 'Scenario',
            description: line
          };
        }

        return {
          kind: kindRaw.toLowerCase() === 'utopia' ? 'utopia' : 'critical',
          title: titleRaw,
          description: descriptionRaw
        };
      });
  })
  .catch((err) => console.error('Failed to load scenarios:', err));

const fields = {
  year: document.getElementById('yearInput'),
  alignment: document.getElementById('alignmentInput'),
  governance: document.getElementById('governanceInput'),
  race: document.getElementById('raceInput'),
  robustness: document.getElementById('robustnessInput'),
  volatility: document.getElementById('volatilityInput')
};

const valueLabels = {
  alignment: document.getElementById('alignmentValue'),
  governance: document.getElementById('governanceValue'),
  race: document.getElementById('raceValue'),
  robustness: document.getElementById('robustnessValue'),
  volatility: document.getElementById('volatilityValue')
};

Object.keys(valueLabels).forEach((key) => {
  fields[key].addEventListener('input', (event) => {
    valueLabels[key].textContent = event.target.value;
  });
});

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

function quantile(values, q) {
  const idx = Math.floor((values.length - 1) * q);
  return values[idx];
}

function runSimulation(baseRisk, volatility = 0.1, runs = 1600) {
  const results = [];

  for (let i = 0; i < runs; i += 1) {
    const gaussianApprox =
      (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3;

    const baselineShock = gaussianApprox * volatility;
    const tailEvent = Math.random() < 0.07 ? Math.random() * 0.18 : 0; // rare adverse shock
    results.push(clamp(baseRisk + baselineShock + tailEvent, 0, 1));
  }

  results.sort((a, b) => a - b);
  const mean = results.reduce((sum, value) => sum + value, 0) / results.length;

  return {
    mean,
    low: quantile(results, 0.1),
    median: quantile(results, 0.5),
    high: quantile(results, 0.9)
  };
}

function chooseScenario(probability) {
  if (!scenarios.length) return null;

  const utopiaScenarios = scenarios.filter((scenario) => scenario.kind === 'utopia');
  const criticalScenarios = scenarios.filter((scenario) => scenario.kind !== 'utopia');

  const utopiaChance = probability < 0.3 ? 0.85 : 0.04;
  const chooseUtopia = Math.random() < utopiaChance;
  const preferredPool = chooseUtopia ? utopiaScenarios : criticalScenarios;
  const fallbackPool = preferredPool.length ? preferredPool : scenarios;

  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
}

function buildNarrative(probability) {
  if (probability >= 0.75) return 'Severe systemic risk';
  if (probability >= 0.55) return 'Elevated race-condition risk';
  if (probability >= 0.35) return 'Balanced but fragile trajectory';
  if (probability >= 0.3) return 'Cautiously optimistic pathway';
  return 'Utopia-favorable window';
}

function scoreDrivers(inputs) {
  const weighted = [
    ['Timeline pressure', 0.45 * inputs.timelinePressure],
    ['Race intensity', 0.3 * inputs.racePressure],
    ['Alignment gap', 0.2 * (1 - inputs.alignmentGuardrail)],
    ['Governance gap', 0.12 * (1 - inputs.governanceGuardrail)],
    ['Infrastructure fragility', 0.08 * (1 - inputs.infraResilience)]
  ];

  const total = weighted.reduce((sum, item) => sum + item[1], 0);
  return weighted
    .map(([name, value]) => ({
      name,
      share: total > 0 ? value / total : 0
    }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 3);
}

function renderResult(resultDiv, lines, drivers) {
  resultDiv.innerHTML = '';

  lines.forEach((line, index) => {
    const div = document.createElement('div');
    div.textContent = line;
    if (index === 0) div.className = 'headline';
    resultDiv.appendChild(div);
  });

  if (drivers.length) {
    const title = document.createElement('div');
    title.className = 'drivers-title';
    title.textContent = 'Top risk drivers';
    resultDiv.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'drivers-list';
    drivers.forEach((driver) => {
      const li = document.createElement('li');
      li.textContent = `${driver.name}: ${(driver.share * 100).toFixed(1)}%`;
      list.appendChild(li);
    });
    resultDiv.appendChild(list);
  }
}

document.getElementById('calcBtn').addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  const currentYear = new Date().getFullYear();
  const year = Number(fields.year.value);

  if (!Number.isInteger(year) || year < currentYear) {
    resultDiv.textContent = 'Please enter a valid future year.';
    return;
  }

  const yearsAhead = year - currentYear;
  const timelinePressure = sigmoid((12 - yearsAhead) / 4);

  const alignmentGuardrail = Number(fields.alignment.value) / 100;
  const governanceGuardrail = Number(fields.governance.value) / 100;
  const racePressure = Number(fields.race.value) / 100;
  const infraResilience = Number(fields.robustness.value) / 100;
  const volatility = Number(fields.volatility.value) / 100;

  const rawRisk =
    0.45 * timelinePressure +
    0.3 * racePressure +
    0.2 * (1 - alignmentGuardrail) +
    0.12 * (1 - governanceGuardrail) +
    0.08 * (1 - infraResilience);

  const normalizedRisk = clamp(rawRisk / 1.15, 0, 1);
  const simulation = runSimulation(normalizedRisk, clamp(volatility, 0.03, 0.25));

  await loadScenarios;
  const scenario = chooseScenario(simulation.mean);
  const category = buildNarrative(simulation.mean);
  const drivers = scoreDrivers({
    timelinePressure,
    alignmentGuardrail,
    governanceGuardrail,
    racePressure,
    infraResilience
  });

  const toPct = (v) => `${(v * 100).toFixed(1)}%`;

  const lines = [
    `Estimated P(DOOM): ${toPct(simulation.mean)}`,
    `Risk band (10th–90th percentile): ${toPct(simulation.low)} – ${toPct(simulation.high)}`,
    `Median run: ${toPct(simulation.median)}`,
    `Category: ${category}`,
    scenario ? `Scenario sample: ${scenario.title} — ${scenario.description}` : 'Scenario sample unavailable (scenarios file missing).'
  ];

  renderResult(resultDiv, lines, drivers);
});
