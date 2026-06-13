# Heritage — Australian Invoice Maker

An AI-powered invoice generator that guides **first-time Australian contractors**
through creating legally compliant invoices. Describe the job in plain English,
and the wizard drafts an ATO-compliant invoice with educational guidance at every
step — then export a polished PDF in one click.

> Design theme: **Heritage Wealth** — emerald & sage greens, soft beige
> backgrounds, deep-brown serif typography, and brass accents.

---

## Features

- **AI wizard** — type "I did 100 hours of dev work at $20/hr for MLAI" and the
  invoice auto-fills. Powered by OpenAI via a secure serverless route, with a
  local fallback parser so it still works offline.
- **Educational guardrails** — non-intrusive tooltips explain *why* each field
  matters (what an ABN is, the $75,000 GST threshold, the $1,000 buyer-identity
  rule, no-ABN withholding, and more).
- **Live compliance** — the document title switches between **"Invoice"** and
  **"Tax Invoice"** based on your GST registration; validation surfaces missing
  ATO-required fields before you export.
- **One-click PDF** — crisp, print-ready PDF via `@react-pdf/renderer`, plus a
  browser print/save option.
- **Live preview** — a true-to-PDF preview updates as you type.
- **Private** — invoice data is kept in your browser (localStorage); only the
  short natural-language prompt is sent to the AI route.

## Australian compliance (ATO)

The rules encoded in [`src/lib/compliance.js`](src/lib/compliance.js) follow
current ATO and business.gov.au guidance:

| Rule | Behaviour |
| --- | --- |
| **Tax Invoice vs Invoice** | "Tax Invoice" only when registered for GST; otherwise "Invoice" (and never the words "tax invoice"). |
| **GST** | Flat 10%, added on top of GST-exclusive rates (so GST = 1/11 of the total). |
| **$75,000 threshold** | Explained in the GST toggle tooltip; mandatory registration at/above it. |
| **$1,000 rule** | Buyer's name or ABN becomes required at/above $1,000. |
| **ABN** | 11-digit modulus-89 checksum validation; warns about 47% no-ABN withholding. |
| **Footer declaration** | States clearly whether GST has/​hasn't been charged. |

> This tool helps produce a compliant document but is **not** a substitute for
> professional tax advice.

## Tech stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** (Heritage Wealth design tokens in `tailwind.config.js`)
- **@react-pdf/renderer** for PDF generation (built-in fonts → reliable output)
- **openai** SDK (Structured Outputs) in a **Vercel serverless function** (`api/parse.js`)
- Deploy-ready for **Vercel**

## Project structure

```
.
├── api/
│   └── parse.js                # Serverless route: NL prompt -> structured invoice (OpenAI)
├── src/
│   ├── components/
│   │   ├── ui/                 # Field, Tooltip, Toggle, Icons
│   │   ├── wizard/             # AiPrompt, Stepper, step screens, ValidationSummary
│   │   ├── invoice/            # InvoicePreview, InvoiceDocument (PDF), DownloadButton
│   │   └── Header.jsx
│   ├── context/
│   │   └── InvoiceContext.jsx  # useReducer state + derived totals/validation + persistence
│   ├── lib/
│   │   ├── compliance.js       # ATO rules — single source of truth
│   │   ├── calculations.js     # GST + totals math
│   │   ├── abn.js              # ABN checksum validation
│   │   ├── format.js           # AUD currency, en-AU dates
│   │   ├── api.js              # Client for /api/parse (+ fallback)
│   │   └── localParse.js       # Offline heuristic parser
│   ├── data/tooltips.js        # Educational helper text
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

## Getting started

```bash
npm install
cp .env.example .env        # add your OPENAI_API_KEY
npm run dev                 # http://localhost:5173
```

`npm run dev` serves both the app **and** the `/api/parse` AI route locally
(reading `OPENAI_API_KEY` from `.env` via a dev-only Vite middleware). Without a
key, the wizard automatically falls back to a built-in offline parser, so the
app still runs.

Get an API key at <https://platform.openai.com/api-keys>. The key is **server-side
only** — never prefix it with `VITE_`.

> Prefer the real Vercel runtime locally? `npm i -g vercel && vercel dev` works too.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at <https://vercel.com/new> (framework auto-detected as Vite).
3. Add the **`OPENAI_API_KEY`** environment variable in project settings.
4. Deploy. `api/parse.js` is automatically hosted as a serverless function.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the source |
