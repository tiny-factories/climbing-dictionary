## Climbing Terms + Experience Mapping

This is a [Next.js](https://nextjs.org/) App Router project backed by a lightweight
**repo-local JSON database**.

It now includes an **experience-level mapping** section that uses the current term list
from your local data file and groups each climbing term by the level where it is most
frequently encountered (beginner, intermediate, advanced).

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data

The local "DB" lives at:

- `data/climbing-posts.json`

Each entry is a term post with:

- `id`
- `title`
- `lastEdited`
- `content` block array

Edit this file directly to add, remove, or update climbing terms.

## Notes

- Routes use the App Router (`app/`).
- No external database service is required.
