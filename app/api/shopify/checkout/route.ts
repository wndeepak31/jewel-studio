import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { price, properties, image } = await request.json()

        const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
        const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

        if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
            return NextResponse.json({ error: 'Shopify credentials not configured' }, { status: 500 })
        }

        // 1. Create a temporary product with the ring rendering
        const productResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': ACCESS_TOKEN,
            },
            body: JSON.stringify({
                product: {
                    title: `Custom Ring Ordered - ${new Date().getTime()}`,
                    body_html: `Customer selected ring configuration.`,
                    vendor: "Ring Studio",
                    product_type: "Custom Ring",
                    status: "active",
                    tags: "ring-builder-temp",
                    images: image ? [{ src: image }] : [],
                    variants: [
                        {
                            price: price,
                            sku: `CUSTOM-${Date.now()}`,
                            inventory_policy: 'continue',
                            fulfillment_service: 'manual',
                            inventory_management: null,
                            option1: "Default Title"
                        }
                    ]
                }
            })
        })

        const productData = await productResponse.json()
        if (!productResponse.ok) {
            console.error('Shopify Product Creation Error:', productData)
            throw new Error('Failed to create ring product')
        }

        const variantId = productData.product.variants[0].id

        // 2. Create the Draft Order using that product's variant
        // This ensures the IMAGE shows up in the checkout!
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
                            variant_id: variantId,
                            quantity: 1,
                            properties: [
                                ...Object.entries(properties).map(([name, value]) => ({ name, value })),
                                { name: "Ring Preview", value: image || "" }
                            ]
                        }
                    ],
                    applied_discount: null,
                    notes: `Order for custom ring. Product ID: ${productData.product.id}`
                }
            })
        })

        const data = await response.json()
        
        if (!response.ok) {
            console.error('Shopify Draft Order Error:', data)
            return NextResponse.json({ error: 'Failed to create Shopify order' }, { status: 500 })
        }

        return NextResponse.json({ checkout_url: data.draft_order.invoice_url })
    } catch (error) {
        console.error('Checkout API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
