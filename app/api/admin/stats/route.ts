import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const [ringStyleCount, metalCount, diamondCount, shapeCount, globalSettings] = await Promise.all([
            prisma.ringStyle.count({ where: { isActive: true } }),
            prisma.metal.count({ where: { isActive: true } }),
            prisma.diamond.count({ where: { isActive: true } }),
            prisma.shape.count({ where: { isActive: true } }),
            prisma.globalSettings.findUnique({ where: { id: 'global' } }),
        ])

        return NextResponse.json({
            ringStyles: ringStyleCount,
            metals: metalCount,
            diamonds: diamondCount,
            shapes: shapeCount,
            goldRate: globalSettings?.goldRate || 0,
            discountPercent: globalSettings?.discountPercent || 0,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
