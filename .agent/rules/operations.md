# Operations Guidelines

## Package Manager: npm

This project uses **npm** as the sole package manager. Do not use yarn or pnpm or bun unless explicitly instructed for a specific task.

### Standard Commands

| Action               | Command                      |
| -------------------- | ---------------------------- |
| Install Dependencies | `npm install`                |
| Start Dev Server     | `npm run dev`                |
| Start Backend        | `cd server && node index.js` |
| Run Tests            | `npm test`                   |
| Build for Production | `npm run build`              |
| Lint Code            | `npm run lint`               |

## Environment Variables

- **Frontend**: `.env` (Vite)
- **Backend**: `server/.env` (Express/AWS/DB)

NEVER commit these files. Always use `.env.example` for templates.

## Mission Control

- **Component Design**: Break down complex UIs into smaller components in `src/widgets` or `src/features`.
- **Unit Tests**: Write tests for utilities in `src/utils` and complex logic in `src/entities`.
