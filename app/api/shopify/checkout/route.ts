import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { price, properties, image } = await request.json()

        const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
        const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

        if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
            return NextResponse.json({ error: 'Shopify credentials not configured' }, { status: 500 })
        }

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/draft_orders.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': ACCESS_TOKEN,
            },
            body: JSON.stringify({
                draft_order: {
                    line_items: [
                        {
                            title: "Custom Lab Grown Diamond Ring",
                            price: price,
                            quantity: 1,
                            properties: Object.entries(properties).map(([name, value]) => ({ name, value })),
                        }
                    ],
                    applied_discount: null,
                    notes: "Created via Ring Studio Builder"
                }
            })
        })

        const data = await response.json()
        
        if (!response.ok) {
            console.error('Shopify API Error:', data)
            return NextResponse.json({ error: 'Failed to create Shopify order' }, { status: 500 })
        }

        return NextResponse.json({ checkout_url: data.draft_order.invoice_url })
    } catch (error) {
        console.error('Checkout API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
