# Rin Ledger

A home loan amortization calculator that runs entirely in your browser. No install, no server — everything runs in this page.

## Features

- **Loan terms**: Principal, interest rate, tenure, processing fee (flat or percentage)
- **Interest methods**: Reducing balance (standard for home loans) or Flat/Simple interest
- **Prepayments**: Add one-time or recurring extra payments; see impact instantly
- **Rent vs Buy comparison**: Compare cumulative rent paid vs loan payments over the tenure
- **Amortization schedule**: Full month-by-month table with editable "Extra" column for per-month prepayments
- **Visual charts**: Mountain/line charts for outstanding balance and rent vs loan comparison

## Usage

Open `index.html` in any modern browser. All data stays in your browser — nothing is uploaded or stored remotely.

## Technical

- Self-contained HTML file (no build step, no dependencies)
- Uses CSS custom properties from `/assets/theme.css`
- Navigation via `/assets/nav.js`
- Responsive design, works at 375px and up