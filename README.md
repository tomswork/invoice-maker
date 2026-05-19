# Invoice Maker

A Next.js app for creating professional invoices like your PDF template — with reusable **business settings**, **clients**, and auto-incrementing invoice numbers.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind
- **Convex** for clients, invoices, and business settings

## Setup

1. Install dependencies (already done if you cloned):

   ```bash
   npm install
   ```

2. Start Convex (creates `.env.local` on first run):

   ```bash
   npm run dev:convex
   ```

   If this is a fresh clone, run `npx convex dev` once to link or create a deployment.

3. In another terminal, start Next.js:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

On first load, your business details are seeded from your sample invoice (Tom Hubble / BSB / account, etc.). You can change them anytime under **Settings**.

## Usage

1. **Settings** — confirm your name, ABN, bank details, default hourly rate ($120), and thank-you message.
2. **Clients** — add clients (e.g. Diana Williams @ Fernwood Fitness).
3. **New invoice** — pick a client, set dates, add line items (description + hours + rate).
4. **Print / PDF** — open an invoice and use **Print / PDF** (browser → Save as PDF).

Optional: on an empty dashboard, **Import sample (Invoice 00002)** recreates your Fernwood Fitness invoice for reference.

## Project structure

- `convex/` — database schema and API
- `src/components/invoice-document.tsx` — printable invoice layout
- `src/app/` — dashboard, clients, invoices, settings
