const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const metalsCount = await prisma.metal.count();
    const stylesCount = await prisma.ringStyle.count();
    const shapesCount = await prisma.shape.count();

    console.log('Metals count:', metalsCount);
    console.log('Ring Styles count:', stylesCount);
    console.log('Shapes count:', shapesCount);

    if (metalsCount > 0) {
        const metals = await prisma.metal.findMany({ take: 5 });
        console.log('Sample Metals:', JSON.stringify(metals, null, 2));
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
