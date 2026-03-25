import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const style = searchParams.get('style')
        const shape = searchParams.get('shape')

        const where: any = {}
        if (style) where.styleSlug = style
        if (shape) where.shapeSlug = shape

        const combos = await prisma.ringCombinationImage.findMany({
            where,
            orderBy: [{ styleSlug: 'asc' }, { shapeSlug: 'asc' }, { metal: 'asc' }, { settingSlug: 'asc' }],
        })

        return NextResponse.json(combos)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const { styleSlug, shapeSlug, carat, metal, settingSlug, view1Url, view2Url, view3Url, view4Url } = body

        if (!styleSlug || !shapeSlug || !carat || !metal || !settingSlug || !view1Url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const combo = await prisma.ringCombinationImage.upsert({
            where: {
                styleSlug_shapeSlug_carat_metal_settingSlug: {
                    styleSlug, shapeSlug, carat, metal, settingSlug,
                }
            },
            update: { view1Url, view2Url: view2Url || '', view3Url: view3Url || '', view4Url: view4Url || '' },
            create: { styleSlug, shapeSlug, carat, metal, settingSlug, view1Url, view2Url: view2Url || '', view3Url: view3Url || '', view4Url: view4Url || '' },
        })

        return NextResponse.json(combo)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const auth = await verifyAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const { id, ...updateData } = body

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        const combo = await prisma.ringCombinationImage.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(combo)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

        await prisma.ringCombinationImage.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
