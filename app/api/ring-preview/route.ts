import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const style = searchParams.get('style')
        const shape = searchParams.get('shape')
        const carat = searchParams.get('carat')
        const metal = searchParams.get('metal')
        const setting = searchParams.get('setting')

        if (!style || !shape || !carat || !metal || !setting) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        const combo = await prisma.ringCombinationImage.findUnique({
            where: {
                styleSlug_shapeSlug_carat_metal_settingSlug: {
                    styleSlug: style,
                    shapeSlug: shape,
                    carat,
                    metal,
                    settingSlug: setting,
                }
            }
        })

        if (!combo) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json({
            view1Url: combo.view1Url,
            view2Url: combo.view2Url,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
