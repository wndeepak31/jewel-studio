const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Ensure "VVS EF" Quality exists
    const vvsEf = await prisma.diamond.upsert({
        where: { id: 'vvs-ef-placeholder' }, // Using a fixed ID for easier seeding or just create one
        update: {},
        create: {
            id: 'vvs-ef-placeholder',
            clarity: 'VVS',
            color: 'EF',
            pricePerCarat: 22000,
        },
    });

    console.log(`Using Diamond Quality: ${vvsEf.clarity} ${vvsEf.color}`);

    const shapes = await prisma.shape.findMany();
    const caratOptions = await prisma.caratOption.findMany();

    console.log(`Found ${shapes.length} shapes and ${caratOptions.length} carat options.`);

    for (const shape of shapes) {
        for (const carat of caratOptions) {
            // Default rate: 22000 for 1ct, scale for others
            const rate = carat.value === 1 ? 22000 : 22000 * carat.value;

            await prisma.diamondRate.upsert({
                where: {
                    shapeId_caratOptionId_diamondId: {
                        shapeId: shape.id,
                        caratOptionId: carat.id,
                        diamondId: vvsEf.id,
                    },
                },
                update: { rate },
                create: {
                    shapeId: shape.id,
                    caratOptionId: carat.id,
                    diamondId: vvsEf.id,
                    rate: rate,
                },
            });
        }
    }

    console.log('Diamond rates seeded for VVS EF quality.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
