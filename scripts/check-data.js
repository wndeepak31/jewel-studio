const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const shapes = await prisma.shape.findMany();
    const caratOptions = await prisma.caratOption.findMany();
    const diamonds = await prisma.diamond.findMany();

    console.log('Shapes:');
    console.table(shapes.map(s => ({ id: s.id, name: s.name, slug: s.slug })));

    console.log('\nCarat Options:');
    console.table(caratOptions.map(c => ({ id: c.id, value: c.value, multiplier: c.multiplier })));

    console.log('\nDiamonds (Qualities):');
    console.table(diamonds.map(d => ({ id: d.id, clarity: d.clarity, color: d.color, pricePerCarat: d.pricePerCarat })));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
