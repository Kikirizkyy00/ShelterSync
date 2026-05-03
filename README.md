# ShelterSync

A team task management app with decentralized file storage powered by **[Shelby Protocol](https://shelby.xyz)** on the **Aptos blockchain**.

> Built with Next.js 15 · TypeScript · Shelby SDK · Aptos Wallet Adapter · Google Calendar

---

## Live Demo

🌐 [ShelterSync.vercel.app](https://ShelterSync.vercel.app)

---

## Features

- **Kanban Board** — manage tasks across three columns: To Do, In Progress, Done
- **Shelby Storage** — attach and download files stored on the decentralized Shelby network
- **Aptos Wallet** — connect Petra Wallet for on-chain transactions
- **3-Step Upload** — on-chain registration → RPC upload → wallet confirmation
- **Storage Panel** — view all files with blob IDs, sizes, and download links
- **Notification Bell** — in-app notification indicator for task updates
- **Google Calendar** — sync task due dates to Google Calendar with reminders

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | React framework with App Router |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [@shelby-protocol/sdk](https://docs.shelby.xyz) | Upload & download files on Shelby |
| [@aptos-labs/ts-sdk](https://aptos.dev) | Interact with Aptos blockchain |
| [@aptos-labs/wallet-adapter-react](https://aptos.dev/build/sdks/wallet-adapter/dapp) | Aptos wallet connection |
| [googleapis](https://www.npmjs.com/package/googleapis) | Google Calendar API integration |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout + providers
│   ├── page.tsx                          # Home page
│   ├── globals.css                       # Global styles
│   └── api/
│       ├── auth/google/route.ts          # Google OAuth initiation
│       ├── auth/google/callback/route.ts # Google OAuth callback
│       └── calendar/add-event/route.ts   # Add event to Google Calendar
├── components/
│   ├── TaskApp.tsx         # Main app shell + tab navigation
│   ├── StatusBar.tsx       # Shelby & wallet connection status
│   ├── TaskBoard.tsx       # Kanban board
│   ├── TaskCard.tsx        # Individual task card
│   ├── AddTaskModal.tsx    # Add task modal
│   ├── CreateTask.jsx      # Create task with notification support
│   ├── NotificationBell.tsx # In-app notification bell
│   ├── UploadModal.tsx     # Upload to Shelby modal (3-step)
│   └── StoragePanel.tsx    # Shelby file list panel
├── providers/
│   ├── WalletProvider.tsx  # Aptos Wallet Adapter
│   └── ShelbyProvider.tsx  # Upload/download/list context
├── hooks/
│   └── useTasks.ts         # Task state management
└── lib/
    ├── shelby.ts           # Core Shelby integration
    └── types.ts            # TypeScript types
```

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Kikirizkyy00/ShelterSync.git
cd ShelterSync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SHELBY_API_KEY=aptoslabs_your_key_here
NEXT_PUBLIC_APTOS_API_KEY=your_aptos_api_key_here
NEXT_PUBLIC_NETWORK=testnet
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

| Key | How to get it |
|---|---|
| `NEXT_PUBLIC_SHELBY_API_KEY` | [docs.shelby.xyz/sdks/typescript/acquire-api-keys](https://docs.shelby.xyz/sdks/typescript/acquire-api-keys) |
| `NEXT_PUBLIC_APTOS_API_KEY` | [developers.aptoslabs.com](https://developers.aptoslabs.com) |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |

### 4. Get testnet tokens

To upload files you need:
- **APT** (gas fees): [Aptos Testnet Faucet](https://aptos.dev/network/faucet)
- **ShelbyUSD** (storage fee): Join [Shelby Discord](https://discord.gg/shelbyprotocol) for early access

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How Shelby Upload Works

### Step 1 — On-Chain Registration
```ts
const payload = ShelbyBlobClient.createRegisterBlobPayload({
  account: account.address,
  blobName: file.name,
  blobSize: fileBuffer.byteLength,
  ...
});
const tx = await signAndSubmitTransaction({ data: payload });
await aptosClient.waitForTransaction({ transactionHash: tx.hash });
```

### Step 2 — RPC Upload
```ts
await shelbyClient.rpc.putBlob({
  account: account.address,
  blobName: file.name,
  blobData: new Uint8Array(fileBuffer),
});
```

### Step 3 — Wallet Confirmation
Petra Wallet prompts the user to approve the on-chain transaction before the file is stored.

---

## Google Calendar Integration

Connect your Google account to sync task due dates:

```
http://localhost:3000/api/auth/google
```

Once authenticated, task due dates are automatically added to your Google Calendar with:
- Email reminder 24 hours before
- Popup reminder 1 hour before

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import `Kikirizkyy00/ShelterSync`
4. Add all environment variables from `.env.example`
5. Click **Deploy**

> No need to set Root Directory — `package.json` is at the root.

---

## References

- [Shelby Protocol](https://shelby.xyz)
- [Shelby Docs](https://docs.shelby.xyz)
- [Shelby GitHub](https://github.com/shelby)
- [Aptos Developer Docs](https://aptos.dev)
- [Discord Shelby](https://discord.gg/shelbyprotocol)
- [Google Calendar API](https://developers.google.com/calendar)