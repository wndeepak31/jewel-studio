import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const carats = await prisma.caratOption.findMany({
            where: { isActive: true },
            orderBy: { value: 'asc' },
        })
        return NextResponse.json(carats)
    } catch (error) {
        console.error('Error fetching carats:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
    }
}
