# 🎮 Pinger!

**Round up your squad and game on!** Pinger is the ultimate friend-gathering app designed to get your gaming crew together. Ping one friend, ping them all, and organize your next epic game session—all in one place.

## 🎯 Features

- **Ping Your Friends**: Instantly notify single friends or broadcast to your entire squad
- **Game Session Organization**: Plan, coordinate, and manage gaming sessions with ease
- **Real-time Updates**: See who's available and ready to play
- **User Authentication**: Secure login to keep your gaming squad private
- **Responsive Design**: Works perfectly on desktop and mobile

## 🚀 Quick Start

Get gaming faster:

```bash
pnpm install
pnpm start
```

Fire it up and start pinging your crew!

## 🛠️ Tech Stack

- **Frontend**: React + TanStack Router for blazing-fast navigation
- **Backend**: TypeScript API routes for secure communication
- **Database**: PostgreSQL with Drizzle ORM for reliable data management
- **Styling**: Tailwind CSS for a polished gaming experience
- **Authentication**: Built-in secure auth system
- **Docker**: Local PostgreSQL for easy development setup

## 📦 Building For Production

```bash
pnpm build
```

## 🧪 Testing

Run tests with [Vitest](https://vitest.dev/):

```bash
pnpm test
```

## 📝 Code Quality

Keep your code clean with [Biome](https://biomejs.dev/):

```bash
pnpm lint      # Catch issues
pnpm format    # Auto-format
pnpm check     # Run all checks
```

## 🗂️ Project Structure

```
src/
├── routes/          # File-based routing for pages and API endpoints
├── components/      # Reusable React components
├── database/        # Drizzle schema and database client
├── lib/            # Authentication and utility functions
└── styles/         # Tailwind CSS and custom styles
```

## 🔐 Authentication

Pinger uses a secure authentication system built into the app. Check out `src/lib/auth.ts` for implementation details.

## 🗄️ Database

The app uses PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) for type-safe queries. Database schema is defined in `src/database/schema.ts`.

Migration files are managed with Drizzle and live in the `drizzle/` directory.

## 🚢 Docker Setup

Get PostgreSQL running locally with Docker:

```bash
docker-compose up -d
```

## 📚 Learn More

- [TanStack Router](https://tanstack.com/router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Biome](https://biomejs.dev/)

---

**Ready to ping? Let's go! 🎮**
