import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const ringStyles = await prisma.ringStyle.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(ringStyles)
    } catch (error) {
        console.error('Error fetching ring styles:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
