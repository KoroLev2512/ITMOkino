![Image alt](https://github.com/KoroLev2512/ITMO-kino/blob/main/public/icons/logo_horizontal.webp)
# ITMO-Kino

A cinema booking application built with Next.js, TypeScript, and Prisma. This application allows users to browse movies, view sessions, and make seat reservations.

## Features

- Movie listings with details (actors, description, duration, etc.)
- Session management and seat reservation
- Admin panel for managing movies and sessions
- Authentication with JWT
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, SCSS
- **State Management**: Redux Toolkit
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Testing**: Jest

## Prerequisites

- Node.js (v16+)
- PostgreSQL

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ITMO-kino.git
   cd ITMO-kino
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/itmokino"
   JWT_SECRET="your-secret-key"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Seed the database with initial data:
   ```bash
   npm run seed
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ITMO-kino/
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/              # App-level utilities
│   ├── entities/         # Domain entities (Movie, User, etc.)
│   ├── features/         # Feature-based components
│   ├── lib/              # Utility libraries
│   ├── pages/            # Next.js pages
│   ├── shared/           # Shared components, types, and utilities
│   └── widgets/          # Composite UI components
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Running Tests

```bash
npm test
```

To run tests with coverage:
```bash
npm test -- --coverage
```

## Development Guidelines

- Use TypeScript for all components and utilities
- Follow the component structure for new features
- Write tests for new functionality
- Keep UI components separate from business logic

## Admin Access

To access the admin panel:
1. Go to `/login`
2. Use the admin credentials from the seed data:
   - Username: admin
   - Password: adminpassword

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Status

Today project in progress, client version via link https://itmokino.ru
Work is underway on the admin panel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
