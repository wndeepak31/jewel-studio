// One-off script to populate shank weights for existing ring styles
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const weights = {
    'traditional-solitaire': { weight14k: 3.00, weight18k: 3.60, makingCharges: 3000 },
    'graduated-prong-ascent-star': { weight14k: 2.40, weight18k: 2.90, makingCharges: 4000 },
    'traditional-band-solitaire': { weight14k: 5.00, weight18k: 6.00, makingCharges: 3500 },
    'graduated-prong-ascent-melee': { weight14k: 2.70, weight18k: 3.20, makingCharges: 4500 },
    'tapered-baguette': { weight14k: 2.00, weight18k: 2.30, makingCharges: 5000 },
    'split-shank': { weight14k: 2.50, weight18k: 3.00, makingCharges: 3500 },
    'channel-ascent': { weight14k: 2.70, weight18k: 3.20, makingCharges: 4000 },
}

const settingWeights = {
    'H1': { weight14k: 0.80, weight18k: 1.00 },
    'H2': { weight14k: 0.70, weight18k: 0.85 },
    'H3': { weight14k: 0.90, weight18k: 1.10 },
    'H4': { weight14k: 0.85, weight18k: 1.05 },
    'H5': { weight14k: 1.00, weight18k: 1.20 },
    'H6': { weight14k: 1.10, weight18k: 1.30 },
}

async function main() {
    for (const [slug, data] of Object.entries(weights)) {
        const result = await prisma.ringStyle.updateMany({ where: { slug }, data })
        console.log(`Style ${slug}: ${result.count} updated`)
    }
    for (const [slug, data] of Object.entries(settingWeights)) {
        const result = await prisma.setting.updateMany({ where: { slug }, data })
        console.log(`Setting ${slug}: ${result.count} updated`)
    }
    console.log('Done!')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
