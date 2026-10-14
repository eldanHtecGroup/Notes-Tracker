# Notes-Tracker

A full-stack app for managing personal notes: write a note with a title and content, view all saved notes, update them, and delete the ones you no longer need. Each note tracks when it was last modified.

## Features

- Add a note with a title and content
- View all saved notes, most recently modified first
- Edit existing notes
- Delete notes you no longer want
- See when each note was last modified
- Every user action is logged by the backend
- Every feature is covered by unit tests, in both the backend and the frontend

Notes are kept in an in-memory database, so they are cleared whenever the backend restarts.

## Tech stack

| Part       | Stack                                                           |
| ---------- | --------------------------------------------------------------- |
| `backend/`  | Node.js, Express 5, in-memory store, Node's built-in test runner |
| `frontend/` | React 19, Vite, plain JavaScript, Vitest + React Testing Library |

## Project structure

```
Notes-Tracker/
├── backend/                  Express API
│   ├── docs/                 OpenAPI spec and Postman collection
│   ├── src/
│   │   ├── routes/           URL → controller mapping
│   │   ├── controllers/      HTTP in/out
│   │   ├── services/         business logic and action logging
│   │   ├── repositories/     in-memory data store
│   │   ├── models/           note shape and limits
│   │   ├── validators/       request body validation
│   │   ├── middlewares/      validation, 404 and error handling
│   │   └── utils/            logger, ApiError, asyncHandler
│   └── tests/                unit and integration tests
└── frontend/                 React app
    ├── src/
    │   ├── api/              fetch wrapper for the notes endpoints
    │   ├── hooks/            useNotes: notes state and API calls
    │   ├── components/       NoteForm, NoteList, NoteItem
    │   └── utils/            date formatting and sorting
    └── tests/unit/           one test file per module
```

## Getting started

Requires Node.js 20 or newer.

Start the backend in one terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173). The backend runs on port 5000. The frontend's dev server forwards `/api` requests to it, so start the backend first.

To run every test, from the project root:

```bash
(cd backend && npm test) && (cd frontend && npm test)
```

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev     # auto-reloads on change; or `npm start`
```

### Logging

Every user action is logged: listing, viewing, creating, updating and deleting notes. Rejected requests (validation errors, missing notes) are logged as warnings, and server errors as errors with a stack trace. Note content is never logged.

```
2026-10-14T09:39:36.600Z INFO  Note created {"noteId":"c1f42bbf-…","title":"Diary"}
2026-10-14T09:39:37.168Z INFO  Note updated {"noteId":"c1f42bbf-…","fields":["content"]}
2026-10-14T09:39:37.652Z WARN  Request rejected: Note c1f42bbf-… not found {"method":"DELETE",…,"status":404}
```

Set `LOG_LEVEL` to `debug`, `info`, `warn`, `error` or `silent`. The default is `debug` in development (also logs each HTTP request), `info` in production and `silent` in tests.

### Tests

Uses Node's built-in test runner, so there's nothing extra to install.

```bash
npm test                  # everything
npm run test:unit         # unit tests: one file per module under tests/unit/
npm run test:integration  # HTTP tests against the running app
npm run test:coverage     # everything, plus a coverage report
```

### API

Base URL: `http://localhost:5000/api`. This is a prefix for the paths below; `/api` on its own returns 404.

- Swagger UI: start the backend and open [http://localhost:5000/api/docs](http://localhost:5000/api/docs) to browse every endpoint and call it from the browser with "Try it out". The page is built from the OpenAPI spec when the server starts, so restart the server after editing the spec.
- OpenAPI spec: [backend/docs/openapi.yaml](backend/docs/openapi.yaml)
- Postman collection: [backend/docs/postman/notes-tracker.postman_collection.json](backend/docs/postman/notes-tracker.postman_collection.json). Import it into Postman, start the backend, and run the whole collection in order. It covers the full note lifecycle, every validation error, not-found cases, malformed or oversized requests, unknown routes and CORS, and it deletes the notes it creates.

| Method | Path         | Body                   | Result                                      |
| ------ | ------------ | ---------------------- | ------------------------------------------- |
| GET    | `/health`    |                        | `200` server status                         |
| GET    | `/notes`     |                        | `200` all notes, most recently modified first |
| GET    | `/notes/:id` |                        | `200` one note, `404` if missing            |
| POST   | `/notes`     | `{ title, content? }`  | `201` created note                          |
| PATCH  | `/notes/:id` | `{ title?, content? }` | `200` updated note (only sent fields change) |
| DELETE | `/notes/:id` |                        | `204` no content                            |

A note looks like:

```json
{
  "id": "7154a343-ddee-4b56-b81f-6045dfa58c87",
  "title": "Groceries",
  "content": "milk, eggs",
  "createdAt": "2026-10-14T09:22:14.392Z",
  "updatedAt": "2026-10-14T09:25:01.110Z"
}
```

`updatedAt` is the last-modified time; it changes on every update.

Successful responses are wrapped as `{ "data": ... }`. Errors return `{ "error": { "message", "details"? } }` with a 400 (validation), 404, or 500 status. Titles are required (max 200 characters); content is optional (max 50,000 characters).

## Frontend

React 19 + Vite, plain JavaScript.

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

The dev server proxies `/api` to the backend at `http://localhost:5000`, so start the backend first.

To use a different backend, copy `.env.example` to `.env` and set one of:

| Variable           | Used by          | Purpose                                                                 |
| ------------------ | ---------------- | ----------------------------------------------------------------------- |
| `API_PROXY_TARGET` | `npm run dev`    | Where the dev server proxies `/api` to (default `http://localhost:5000`) |
| `VITE_API_URL`     | the built app    | Full API base URL, e.g. `https://notes.example.com/api`. Read at build time, so rebuild after changing it. If it points to another origin, add that origin to the backend's `CORS_ORIGIN`. |

### Using the app

- **Add:** fill in the title (required, max 200 characters) and optional content in the **New note** form, then click **Add note**.
- **View:** notes are listed under **Your notes**, most recently modified first. Each shows when it was last modified.
- **Edit:** click **Edit** on a note, change it, then click **Save changes** (or **Cancel**). Only changed fields are sent, so saving an untouched note doesn't change its last-modified time.
- **Delete:** click **Delete** and confirm.

Errors from the backend (validation, missing notes, server unreachable) appear next to the form or note they relate to. If the notes can't be loaded, a **Try again** button reloads them.

### Code structure

- `src/api/notesApi.js` — fetch wrapper for the notes endpoints; unwraps `{ data }` and throws `ApiError` on `{ error }`
- `src/hooks/useNotes.js` — loads the notes and keeps the list in sync after each create, update or delete
- `src/components/` — `NoteForm` (shared by add and edit), `NoteList`, `NoteItem`
- `src/utils/` — date formatting and sorting
- `src/constants.js` — title and content length limits, matching the backend's

### Tests

Vitest + React Testing Library, with one test file per module under `tests/unit/`. The API is mocked, so the backend doesn't need to be running.

```bash
npm test               # run once
npm run test:watch     # re-run on change
npm run test:coverage  # with a coverage report
```
