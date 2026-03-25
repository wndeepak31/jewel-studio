import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const diamondId = searchParams.get('diamondId')

    try {
        const rates = await prisma.diamondRate.findMany({
            where: diamondId ? { diamondId } : {},
            include: {
                shape: true,
                caratOption: true,
                diamond: true,
            }
        })
        return NextResponse.json(rates)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching rates' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { shapeId, caratOptionId, diamondId, rate } = await request.json()
        const item = await prisma.diamondRate.upsert({
            where: {
                shapeId_caratOptionId_diamondId: {
                    shapeId,
                    caratOptionId,
                    diamondId,
                }
            },
            update: { rate },
            create: { shapeId, caratOptionId, diamondId, rate },
        })
        return NextResponse.json(item)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Error updating rate' }, { status: 500 })
    }
}
