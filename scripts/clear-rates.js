const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.diamondRate.deleteMany();
    console.log('Diamond rates cleared.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
