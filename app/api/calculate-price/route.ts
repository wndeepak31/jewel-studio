import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const {
            ringStyleId,
            metalId,
            diamondId, // This is the Quality ID
            settingId,
            caratOptionId,
            shapeId,
        } = await request.json()

        const [ringStyle, metal, diamond, setting, caratOption, globalSettings, diamondRate] = await Promise.all([
            prisma.ringStyle.findUnique({ where: { id: ringStyleId } }),
            prisma.metal.findUnique({ where: { id: metalId } }),
            prisma.diamond.findUnique({ where: { id: diamondId } }),
            prisma.setting.findUnique({ where: { id: settingId } }),
            prisma.caratOption.findUnique({ where: { id: caratOptionId } }),
            prisma.globalSettings.findUnique({ where: { id: 'global' } }),
            // Fetch precise shape-specific rate for this quality
            (shapeId && caratOptionId && diamondId) ? prisma.diamondRate.findUnique({
                where: {
                    shapeId_caratOptionId_diamondId: {
                        shapeId,
                        caratOptionId,
                        diamondId,
                    }
                }
            }) : null
        ])

        if (!ringStyle || !metal || !diamond || !setting || !caratOption || !globalSettings) {
            return NextResponse.json({ error: 'Missing or invalid selection data' }, { status: 400 })
        }

        // 1. Determine purity factor
        const purityKarat = parseFloat(metal.purity.replace('K', '')) || 14
        const metalPurity = purityKarat / 24

        // 2. Get correct weights based on purity
        const shankWeight = purityKarat >= 18 ? ringStyle.weight18k : ringStyle.weight14k
        const headWeight = purityKarat >= 18 ? setting.weight18k : setting.weight14k
        const totalWeight = shankWeight + headWeight

        // 3. Gold cost = (Shank Weight + Head Weight) × Gold Rate (24K) × Metal Purity
        const goldCost = totalWeight * globalSettings.goldRate * metalPurity

        // 4. Labour = (Shank Weight + Head Weight) × Labour Rate
        const labourRate = globalSettings.labourRate || 2000
        const totalLabour = totalWeight * labourRate

        // 5. Diamond Price - Use shape+quality specific rate if available, fallback to diamond.pricePerCarat * caratValue
        const diamondPrice = diamondRate ? diamondRate.rate : (diamond.pricePerCarat * caratOption.value)

        // 6. Side Stone Cost = Style Side Stone Weight × Side Stone Rate
        const sideStoneWeight = ringStyle.sideStoneWeight || 0
        const sideStoneRate = globalSettings.sideStoneRate || 45000
        const sideStoneCost = sideStoneWeight * sideStoneRate

        // 7. Ring Price = Gold Cost + Labour + Diamond Price + Side Stone Cost
        const ringPrice = goldCost + totalLabour + diamondPrice + sideStoneCost

        return NextResponse.json({
            finalPrice: Math.round(ringPrice),
            breakdown: {
                goldRate24k: globalSettings.goldRate,
                metalPurity,
                purityLabel: metal.purity,
                shankWeight,
                headWeight,
                totalWeight,
                goldCost: Math.round(goldCost),
                labourRate: globalSettings.labourRate,
                totalLabour: Math.round(totalLabour),
                diamondPrice: Math.round(diamondPrice),
                sideStoneWeight,
                sideStoneRate,
                sideStoneCost: Math.round(sideStoneCost),
                usingShapeRate: !!diamondRate,
                ringPrice: Math.round(ringPrice),
            }
        })
    } catch (error) {
        console.error('Pricing calculation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
