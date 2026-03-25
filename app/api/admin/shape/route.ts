import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: Request) {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const data = await request.json()
        const item = await prisma.shape.create({ data })
        return NextResponse.json(item)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating item' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id, ...data } = await request.json()
        const item = await prisma.shape.update({
            where: { id },
            data,
        })
        return NextResponse.json(item)
    } catch (error) {
        return NextResponse.json({ error: 'Error updating item' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await request.json()
        await prisma.shape.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting item' }, { status: 500 })
    }
}
