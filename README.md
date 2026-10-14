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
npm test
```

Notes are kept in an in-memory database, so they are cleared whenever the server restarts.

### API

Base URL: `http://localhost:5000/api`

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
