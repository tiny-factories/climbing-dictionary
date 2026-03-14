## Climbing Terms + Experience Mapping

This is a [Next.js](https://nextjs.org/) App Router project backed by the Notion API.

It now includes an **experience-level mapping** section that uses the current term list
from your Notion database and groups each climbing term by the level where it is most
frequently encountered (beginner, intermediate, advanced).

## Getting Started

1. Create `.env.local`:

```bash
NOTION_TOKEN=
NOTION_DATABASE_ID=
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes

- Routes use the App Router (`app/`).
- If Notion env vars are not set, the app will still run with empty data so local builds do not fail.
