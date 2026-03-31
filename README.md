# 🎣 Tackle Tracker – Personal Fishing Gear Inventory

A modern web app for managing your personal fishing tackle collection. Track rods, reels, lures, lines, hooks, and accessories with live quantity controls, search, and category filtering.

![Tackle Tracker screenshot](https://github.com/user-attachments/assets/72099b75-daa5-45b2-803b-15d5840cc524)

## Features

- 📦 **Browse** all your gear in a responsive card grid
- ➕ **Add** new items with name, category, SKU, price, quantity, and description
- ✏️ **Edit** any existing item's details
- 🔢 **Update quantity** inline with +/− buttons or direct input
- 🗑️ **Delete** items with a confirmation prompt
- 🔍 **Search** by name, SKU or description
- 🏷️ **Filter** by category (Rods, Reels, Lures, Lines & Leaders, Hooks & Terminal Tackle, Accessories)
- 📊 **Dashboard stats**: total items, in-stock count, low-stock warnings, total inventory value
- 🗃️ **SQLite database** pre-seeded with 20 realistic fishing gear items

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express 5 |
| Database | SQLite via `better-sqlite3` |

## Getting Started

### Prerequisites
- Node.js 18+

### Install dependencies

```bash
# Install root dev tools
npm install

# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### Run in development

```bash
npm run dev
```

This starts both the Express API server (port **3001**) and the Vite dev server (port **5173**) concurrently, with the Vite proxy forwarding `/api` requests to the Express server.

### Build for production

```bash
npm run build   # builds the React app into client/dist/
npm start       # serves API + built frontend from port 3001
```

## Project Structure

```
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx        # Main application
│   │   └── components/
│   │       ├── GearCard.jsx      # Individual gear item card
│   │       ├── GearModal.jsx     # Add/edit modal form
│   │       └── ConfirmDialog.jsx # Delete confirmation dialog
│   └── vite.config.js
├── server/               # Express backend
│   ├── index.js          # REST API routes
│   └── database.js       # SQLite setup & seed data (20 items)
└── package.json          # Root scripts (dev / build / start)
```
