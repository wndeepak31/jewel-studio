import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.adminUser.upsert({
    where: { email: 'admin@ringstudio.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@ringstudio.com',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  })

  // 2. Ring Styles (slug = exact folder name in /public/studio/rings/)
  const ringStyles = [
    { name: 'Channel Ascent', slug: 'channel-ascent', imageUrl: '/studio/shank/channel-ascent.png', basePrice: 25000 },
    { name: 'Graduated Prong Ascent - Melee', slug: 'graduated-prong-ascent-melee', imageUrl: '/studio/shank/graduated-prong-ascent-melee.png', basePrice: 35000 },
    { name: 'Graduated Prong Ascent - Star', slug: 'graduated-prong-ascent-star', imageUrl: '/studio/shank/graduated-prong-ascent-star.png', basePrice: 40000 },
    { name: 'Split Shank', slug: 'split-shank', imageUrl: '/studio/shank/split-shank.png', basePrice: 30000 },
    { name: 'Tapered Baguette', slug: 'tapered-baguette', imageUrl: '/studio/shank/tapered-baguette.png', basePrice: 45000 },
    { name: 'Traditional Solitaire', slug: 'traditional-solitaire', imageUrl: '/studio/shank/traditional-solitaire.png', basePrice: 15000 },
    { name: 'Traditional Band Solitaire', slug: 'traditional-band-solitaire', imageUrl: '/studio/shank/traditional-band-solitaire.png', basePrice: 18000 },
  ]

  for (const style of ringStyles) {
    await prisma.ringStyle.create({ data: style })
  }

  // 3. Shapes (slug = exact folder name in /public/studio/rings/{style}/{shape}/)
  const shapes = [
    { name: 'Round', slug: 'round', imageUrl: '/studio/shapes/round.png' },
    { name: 'Oval', slug: 'oval', imageUrl: '/studio/shapes/oval.png' },
    { name: 'Princess', slug: 'princess', imageUrl: '/studio/shapes/princess.png' },
    { name: 'Emerald', slug: 'emerald', imageUrl: '/studio/shapes/emerald.png' },
  ]

  for (const shape of shapes) {
    await prisma.shape.create({ data: shape })
  }

  // 4. Settings (slug = exact H-code folder name)
  const settings = [
    { name: 'Classic 4 Prong – Classic', slug: 'H1', imageUrl: '/studio/setting/classic-4prong-classic.png', priceMultiplier: 1.1 },
    { name: 'Classic 4 Prong', slug: 'H2', imageUrl: '/studio/setting/classic-4prong.png', priceMultiplier: 1.0 },
    { name: 'Classic 4 Prong – Variant', slug: 'H3', imageUrl: '/studio/setting/classic-4prong-2.png', priceMultiplier: 1.2 },
    { name: 'Classic 4 Prong – Cathedral', slug: 'H4', imageUrl: '/studio/setting/classic-4prong-cathedral.png', priceMultiplier: 1.15 },
    { name: 'Classic 4 Prong – Royal Club', slug: 'H5', imageUrl: '/studio/setting/classic-4prong-royal-club.png', priceMultiplier: 1.25 },
    { name: 'Classic 6 Prong – Hidden Halo', slug: 'H6', imageUrl: '/studio/setting/classic-6prong-hidden-halo.png', priceMultiplier: 1.3 },
  ]

  for (const setting of settings) {
    await prisma.setting.create({ data: setting })
  }

  // 5. Metals
  const metals = [
    { name: '14K White Gold', purity: '14K', color: 'White', pricePerGram: 4500, makingCharges: 500 },
    { name: '14K Yellow Gold', purity: '14K', color: 'Yellow', pricePerGram: 4500, makingCharges: 500 },
    { name: '14K Rose Gold', purity: '14K', color: 'Rose', pricePerGram: 4500, makingCharges: 500 },
    { name: '18K White Gold', purity: '18K', color: 'White', pricePerGram: 5800, makingCharges: 600 },
    { name: '18K Yellow Gold', purity: '18K', color: 'Yellow', pricePerGram: 5800, makingCharges: 600 },
    { name: '18K Rose Gold', purity: '18K', color: 'Rose', pricePerGram: 5800, makingCharges: 600 },
  ]

  for (const metal of metals) {
    await prisma.metal.create({ data: metal })
  }

  // 6. Diamonds
  const diamonds = [
    { clarity: 'VVS1', color: 'D', pricePerCarat: 120000 },
    { clarity: 'VVS2', color: 'E', pricePerCarat: 110000 },
    { clarity: 'VS1', color: 'F', pricePerCarat: 95000 },
  ]

  for (const diamond of diamonds) {
    await prisma.diamond.create({ data: diamond })
  }

  // 7. Carat Options
  const caratOptions = [
    { value: 1.0, multiplier: 1.0 },
    { value: 1.5, multiplier: 1.05 },
    { value: 2.0, multiplier: 1.1 },
  ]

  for (const option of caratOptions) {
    await prisma.caratOption.create({ data: option })
  }

  // 8. Global Settings
  await prisma.globalSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      goldRate: 7500,
      taxPercent: 3,
      profitMargin: 15,
      discountPercent: 0,
    },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
