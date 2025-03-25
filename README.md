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
# ITMO-kino

ITMO Kino is a full-stack movie theater booking application built with Next.js, where users can browse films, select sessions, and book tickets. The application also includes an admin panel for managing movies, sessions, and seats.

## Features

- **User Features:**
  - Browse available movies
  - View movie details and session times
  - Book seats for movie sessions
  - Authentication system for user accounts

- **Admin Features:**
  - Manage movies (add, edit, delete)
  - Manage movie sessions (scheduling)
  - View and manage seat reservations
  - User administration

## Tech Stack

- **Frontend:** Next.js 15, React 19, SCSS Modules
- **State Management:** Redux Toolkit, React Redux
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Jest

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/itmokino?schema=public"
JWT_SECRET="your-secret-key"
```

Replace the database connection string with your own PostgreSQL credentials.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ITMO-kino.git
cd ITMO-kino
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database and generate Prisma client:

```bash
npx prisma migrate dev
```

4. Seed the database with initial data:

```bash
npm run seed
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000).

For production build:

```bash
npm run build
npm start
```

## Database Schema

The application uses the following data models:

- **Movie:** Films available for booking
- **Session:** Showtimes for movies
- **Seat:** Individual seats for each session
- **Ticket:** Reserved seats with customer information
- **User:** User accounts (including admin users)

## Testing

The project uses Jest for testing. Run the tests with:

```bash
npm test
```

For running tests in watch mode:

```bash
npm test -- --watch
```

## Project Structure

```
ITMO-kino/
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── src/
│   ├── entities/         # Domain entities
│   ├── lib/              # Utility functions and API clients
│   ├── pages/            # Next.js pages and API routes
│   ├── shared/           # Shared components and utilities
│   │   ├── store/        # Redux store configuration
│   │   ├── ui/           # Reusable UI components
│   │   └── utils/        # Helper utilities
│   └── widgets/          # Complex UI blocks (header, footer, etc.)
├── .env                  # Environment variables
├── jest.config.js        # Jest configuration
└── package.json          # Project dependencies and scripts
```

## Authentication

The application uses JWT for authentication. Admin users have additional privileges for managing content. Default admin credentials are provided during database seeding.

## Deployment

The application can be deployed to any hosting platform that supports Next.js applications, such as Vercel or Netlify.

## License

This project is licensed under the MIT License.
