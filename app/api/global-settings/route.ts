import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const globalSettings = await prisma.globalSettings.findUnique({
            where: { id: 'global' },
        })
        return NextResponse.json(globalSettings)
    } catch (error) {
        console.error('Error fetching global settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
