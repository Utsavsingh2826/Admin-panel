# Jewelry Admin Frontend (TypeScript)

A modern TypeScript React admin dashboard for jewelry management, built with Vite, Tailwind CSS, and Redux.

## Features

- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling (teal color scheme)
- ✅ Redux for state management
- ✅ Login bypass (no backend required)
- ✅ Responsive design
- ✅ Modern UI matching the jewelry website aesthetic

## Color Scheme

The application uses a teal color palette:
- Primary: `#14b8a6` (Teal 500)
- Light: `#2dd4bf` (Teal 400)
- Dark: `#0d9488` (Teal 600)
- Darker: `#0f766e` (Teal 700)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "admin frontend new"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Login

The login is currently bypassed - any email and password combination will work. The system will automatically authenticate you after a brief delay.

Demo credentials (for reference):
- Email: `admin@jewelry.com`
- Password: `admin123`

## Project Structure

```
src/
├── components/          # Reusable components
│   └── NonAuthLayout.tsx
├── pages/              # Page components
│   ├── Authentication/
│   │   └── Login.tsx
│   └── Dashboard/
│       └── Dashboard.tsx
├── store/              # Redux store
│   ├── auth/          # Authentication state
│   └── index.ts       # Store configuration
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles with Tailwind
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Redux** - State management
- **React Router** - Routing
- **Redux Persist** - State persistence

## Notes

- Backend calls are currently bypassed - all authentication is handled client-side
- The register page is not implemented yet (as requested)
- The login page uses a bypass mechanism that always succeeds

