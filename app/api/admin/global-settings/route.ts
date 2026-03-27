import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const data = await request.json()
        const { goldRate } = data

        // Update global settings
        const item = await prisma.globalSettings.update({
            where: { id: 'global' },
            data,
        })

        // If goldRate is updated, also update all metal prices based on purity
        if (goldRate !== undefined) {
            const metals = await prisma.metal.findMany()
            
            for (const metal of metals) {
                // Extract numeric purity (e.g. "14K" -> 14, "18K" -> 18)
                const purityMatch = metal.purity.match(/(\d+)/)
                if (purityMatch) {
                    const purityValue = parseInt(purityMatch[1])
                    if (!isNaN(purityValue) && purityValue <= 24) {
                        const calculatedPrice = Math.round((goldRate / 24) * purityValue)
                        
                        await prisma.metal.update({
                            where: { id: metal.id },
                            data: { pricePerGram: calculatedPrice }
                        })
                    }
                }
            }
        }

        return NextResponse.json(item)
    } catch (error) {
        console.error("Error updating settings:", error)
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
    }
}
