This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local development with Firebase Emulators (no costs)

This app is configured to work with the Firebase Emulator Suite for Firestore and Storage so you can upload images and create records locally without incurring costs.

### 1) Install dependencies

```bash
npm install
# plus required runtime deps
npm install firebase
```

Optional (if you want to use the `npm run emulators` script):

```bash
npm i -g firebase-tools
```

Alternatively, you can run the CLI via `npx firebase-tools` without a global install.

### 2) Set up env vars

Copy `env.local.example` to `.env.local` at the project root.

```bash
# PowerShell (Windows)
Copy-Item env.local.example .env.local

# macOS/Linux
cp env.local.example .env.local
```

These defaults will point the Firebase Web SDK to the local emulators. You can leave API key and app IDs blank for local-only testing.

### 3) Start emulators

In one terminal:

```bash
# requires firebase-tools (globally or use npx)
npm run emulators
# or
npx firebase-tools emulators:start
```

### 4) Start Next.js with emulator flags

In another terminal:

```bash
# Windows
npm run dev:emu:win

# macOS/Linux
npm run dev:emu:nix
```

Then open http://localhost:3000 and go to /upload. Uploading creates a Firestore document in the emulator and uploads the file to the Storage emulator. The image page lives at `/i/{id}`.

### Notes

- Do not deploy the permissive `firestore.rules` and `storage.rules` to production — they are for local emulators only.
- To point to your real Firebase project in production, set the `NEXT_PUBLIC_FIREBASE_*` values in `.env` or your hosting provider and do NOT set `NEXT_PUBLIC_USE_EMULATORS`.
