import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const diamonds = await prisma.diamond.findMany({
            where: { isActive: true },
        })
        return NextResponse.json(diamonds)
    } catch (error) {
        console.error('Error fetching diamonds:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
    }
}
