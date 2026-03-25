import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const metals = await prisma.metal.findMany({
            where: { isActive: true },
        })
        return NextResponse.json(metals)
    } catch (error) {
        console.error('Error fetching metals:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
    }
}
