# JSON Toolkit

A fast, local-only JSON formatter and validator. Paste JSON, beautify or minify it, and get precise, line/column-accurate error messages when it's invalid — all in the browser, nothing sent to a server.

**Live demo:** [json-toolkit-pi.vercel.app](https://json-toolkit-pi.vercel.app/)

## Features

- **Beautify / Minify** — reformat JSON with 2 or 4-space indentation, or collapse it to a single line
- **Real-time validation** — see valid/invalid status as you type
- **Precise error messages** — a custom scanner reports the exact line, column, and a code snippet with a caret pointing at the problem (unterminated strings, missing commas, unclosed brackets, etc.), instead of a generic "unexpected token"
- **Session history** — every formatting action is saved to a sidebar (persisted in `sessionStorage`) so you can revisit or restore a previous result
- **Dark / light theme** toggle
- **Line numbers and stats** — line count, character count, byte size
- **Runs entirely client-side** — no data ever leaves the tab

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and build
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vitest](https://vitest.dev/) for the formatter/scanner test suite

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # type-check and build for production
npm run test     # run the Vitest suite
npm run lint     # run ESLint
```

## Project structure

```
src/
  components/       UI components (formatter panel, header, history sidebar)
  hooks/            useHistory (session history), useTheme (dark/light)
  lib/
    jsonFormatter.ts     beautify / minify / validate
    jsonScanner.ts       hand-written scanner producing precise error locations
```
