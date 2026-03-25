import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const showAll = searchParams.get('all') === 'true'

        const shapes = await prisma.shape.findMany({
            where: showAll ? {} : { isActive: true },
            orderBy: { createdAt: 'asc' },
        })
        return NextResponse.json(shapes)
    } catch (error) {
        console.error('Error fetching shapes:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
    }
}
