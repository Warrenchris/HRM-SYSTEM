# Sigma HRM — Human Capital Suite

A modern HR management suite covering employees, attendance, leave, payroll, performance, assets, tasks, tickets, announcements, and more.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, DB, Storage)

## Prerequisites

- Node.js 18+ and npm
- Supabase CLI (for local dev): `https://supabase.com/docs/guides/cli`

## Environment Variables

Create a `.env` (or `.env.local`) in the project root:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

Use your hosted Supabase project URL and anon key in production.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Supabase locally [[memory:5971290]]:
   ```bash
   supabase start
   ```
   - If your database schema is out of date, run: `supabase db reset`
3. Start the dev server [[memory:5971290]]:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Start the Vite dev server
- `npm run build`: Create a production build
- `npm run preview`: Preview the production build locally

## Project Structure

- `src/pages`: Top-level routes (e.g., `Dashboard`, `Employees`, `Payroll`)
- `src/components`: Feature components (attendance, leave, payroll, etc.)
- `src/contexts`: App-wide providers (auth, company)
- `src/integrations/supabase`: Supabase client and types

## Contributing

1. Create a feature branch
2. Make changes with clear commit messages
3. Open a PR

