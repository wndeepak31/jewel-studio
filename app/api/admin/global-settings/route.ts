import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const data = await request.json()
        const item = await prisma.globalSettings.update({
            where: { id: 'global' },
            data,
        })
        return NextResponse.json(item)
    } catch (error) {
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
    }
}
