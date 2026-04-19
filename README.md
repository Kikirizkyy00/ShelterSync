# ShelterSync

A team task management app with decentralized file storage powered by **[Shelby Protocol](https://shelby.xyz)** on the **Aptos blockchain**.

> Built with Next.js 15 · TypeScript · Shelby SDK · Aptos Wallet Adapter

---

## Live Demo

🌐 [ShelterSync.vercel.app](https://ShelterSync.vercel.app)

---

## Features

- **Kanban Board** — manage tasks across three columns: To Do, In Progress, Done
- **Shelby Storage** — attach and download files stored on the decentralized Shelby network
- **Aptos Wallet** — connect Petra Wallet for on-chain transactions
- **3-Step Upload** — erasure coding → on-chain registration → RPC upload
- **Storage Panel** — view all files with blob IDs, sizes, and download links

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | React framework with App Router |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [@shelby-protocol/sdk](https://docs.shelby.xyz) | Upload & download files on Shelby |
| [@aptos-labs/ts-sdk](https://aptos.dev) | Interact with Aptos blockchain |
| [@aptos-labs/wallet-adapter-react](https://aptos.dev/build/sdks/wallet-adapter/dapp) | Aptos wallet connection |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + providers
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── TaskApp.tsx         # Main app shell + tab navigation
│   ├── StatusBar.tsx       # Shelby & wallet connection status
│   ├── TaskBoard.tsx       # Kanban board
│   ├── TaskCard.tsx        # Individual task card
│   ├── AddTaskModal.tsx    # Add task modal
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
cd SheltersSync
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
```

| Key | How to get it |
|---|---|
| `NEXT_PUBLIC_SHELBY_API_KEY` | [docs.shelby.xyz/sdks/typescript/acquire-api-keys](https://docs.shelby.xyz/sdks/typescript/acquire-api-keys) |
| `NEXT_PUBLIC_APTOS_API_KEY` | [developers.aptoslabs.com](https://developers.aptoslabs.com) |

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

Per the [official Shelby docs](https://docs.shelby.xyz/sdks/typescript/browser/guides/upload):

### Step 1 — File Encoding
```ts
const provider = await createDefaultErasureCodingProvider();
const commitments = await generateCommitments(provider, fileBuffer);
```

### Step 2 — On-Chain Registration
```ts
const payload = ShelbyBlobClient.createRegisterBlobPayload({ ... });
const tx = await signAndSubmitTransaction({ data: payload });
await aptosClient.waitForTransaction({ transactionHash: tx.hash });
```

### Step 3 — RPC Upload
```ts
await shelbyClient.rpc.putBlob({
  account: account.address,
  blobName: file.name,
  blobData: new Uint8Array(fileBuffer),
});
```

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import `Kikirizkyy00/ShelterSync`
4. Add environment variables
5. Click **Deploy**

> No need to set Root Directory — `package.json` is at the root.

---

## References

- [Shelby Protocol](https://shelby.xyz)
- [Shelby Docs](https://docs.shelby.xyz)
- [Shelby GitHub](https://github.com/shelby)
- [Aptos Developer Docs](https://aptos.dev)
- [Discord Shelby](https://discord.gg/shelbyprotocol)
