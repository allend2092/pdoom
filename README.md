*This repo, all files and the directory structure was created agentically by GPT-OSS 120B via OpenCode [ https://opencode.ai/ ]

# P(DOOM) Calculator

A tongue-in-cheek web app that lets you “forecast” AI doom risk using a configurable toy model.

## What changed
The app now goes beyond a single random output and includes:
- A **multi-factor input model** (year, alignment maturity, governance coordination, race intensity, infrastructure robustness).
- A **volatility control** that changes how noisy / uncertain simulated outcomes are.
- A **Monte Carlo style simulation** producing mean, median, and 10th–90th percentile risk bands.
- A **risk-driver breakdown** showing which assumptions contribute the most to the estimate.
- A scenario picker that skews toward optimistic vs critical scenarios depending on modeled risk.
- A richer scenario library including plausible AI takeover pathways (including an AI 2027-style recursive takeover), national infrastructure lock-in, foreign AI dominance arcs, and playful endings.
- A low-risk behavior rule: when modeled P(DOOM) falls below 30%, the engine strongly favors utopia scenarios.

## How it works
1. The year input is transformed into timeline pressure using a sigmoid curve.
2. Contextual sliders are weighted into a normalized baseline risk score.
3. A simulation runs many stochastic draws, adding both normal fluctuations and rare tail shocks.
4. Scenario selection logic:
   - if P(DOOM) < 30%, utopia scenarios are selected with high probability,
   - otherwise critical scenarios dominate with a small utopia tail.
5. The UI reports:
   - estimated P(DOOM),
   - uncertainty band,
   - median run,
   - qualitative risk category,
   - sample scenario,
   - top three modeled drivers.

> This is a playful educational model, not a scientific prediction engine.

## Running locally
1. Open `index.html` in any modern web browser.
2. Optional: serve the repo directory (`python3 -m http.server 4173`) to avoid local-file fetch restrictions in some browsers.

## Development roadmap
- **Phase 1** – Baseline UI + random-ish output ✅
- **Phase 2** – Multi-factor toy forecast + uncertainty bands ✅
- **Phase 3** – Add interactive charts for simulated distribution and factor sensitivity
- **Phase 4** – Game-like scenarios, sharing, and leaderboard mechanics

## Contributing
Pull requests are welcome—especially improvements to model explainability, scenario quality, and visualizations.
