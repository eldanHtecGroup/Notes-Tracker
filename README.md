# Notes-Tracker

A full-stack app for managing personal notes: write a note with a title and content, view all saved notes, update them, and delete the ones you no longer need. Each note tracks when it was last modified.

- `backend/` — Node.js + Express API (layered: routes → controllers → services → repositories)
- `frontend/` — React app (coming next)

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev     # auto-reloads on change; or `npm start`
```

Notes are kept in an in-memory database, so they are cleared whenever the server restarts.

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
