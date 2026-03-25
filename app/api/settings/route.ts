import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const settings = await prisma.setting.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
        })
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
    }
}
