import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const movie = await prisma.movie.upsert({
        where: { id: 1 },
        update: {},
        create: {
            image: "/images/kino.jpg",
            title: "Кофе",
            genre: "Комедия",
            description: "Фильм про кофе",
            duration: 120,
            premiere: new Date(2025, 3, 27),
            year: 2021,
            actors: '["Игорь Гомжин", "Альтер эго Игоря Гомжина"]',
        },
    });

    const session1 = await prisma.session.upsert({
        where: { id: 1 },
        update: {},
        create: {
            time: "14:00",
            movieId: 1
        },
    });

    const session2 = await prisma.session.upsert({
        where: { id: 2 },
        update: {},
        create: {
            time: "15:00",
            movieId: 1
        },
    });

    const seat = await prisma.seat.upsert({
        where: { id: 1 },
        update: {},
        create: {
            sessionId: 1,
            row: 2,
            seat: 5,
            isReserved: false
        },
    });
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: '$2a$10$GQf5YhKfR6oRPZxzT.tMUObYqNNUSU0N9yTx5/TUqmEVJ.EREiCse', // "admin123" hashed
            isAdmin: true
        }
    });

    console.log({ movie, adminUser });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
