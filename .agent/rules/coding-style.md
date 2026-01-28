# iMery Coding Style

## React & Frontend (CRITICAL)

- **React 19**: Use modern hooks and concurrent features.
- **Tailwind CSS**: Use utility classes for all styling. Maintain "premium" look (glassmorphism, soft gradients).
- **Framer Motion**: ALWAYS use for transitions and micro-interactions.
- **State**: Prefer `useLocalStorage` for values that should persist across sessions.

## Backend & API

- **Express.js**: Keep `index.js` organized. Group related endpoints.
- **MySQL/TiDB**: Use prepared statements (standard in `mysql2`) to prevent injection.
- **Error Handling**: Return clear error messages to the frontend.
- **Security**: NEVER commit `.env` files. Hash passwords with `bcryptjs`.

## File Organization

- **Frontend**: `src/pages` (View), `src/features` (Complex UI), `src/widgets` (Nav/Layout).
- **Backend**: `server/index.js` for routes, `server/db.js` for schema.

## Code Quality Checklist

- [ ] Code uses Tailwind CSS for all styling (no custom CSS files if possible).
- [ ] Framer Motion is used for new UI transitions.
- [ ] API calls are handled via `src/api/client.js`.
- [ ] No direct mutations of state or objects.
- [ ] Error boundary or try/catch around async operations.
- [ ] console.log removed (use custom logger if available).
- [ ] Semantic HTML and unique IDs for automated tests.
