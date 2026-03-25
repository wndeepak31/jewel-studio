import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const shop = searchParams.get('shop')

    if (!code || !shop) {
        return new Response('Missing code or shop. Please click "Open app" from your Shopify dashboard.', { status: 400 })
    }

    try {
        const client_id = process.env.SHOPIFY_CLIENT_ID
        const client_secret = process.env.SHOPIFY_CLIENT_SECRET

        const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id,
                client_secret,
                code
            })
        })

        const data = await response.json()

        if (data.access_token) {
            return new Response(`
                <h1>SUCCESS! Your Token is Ready</h1>
                <p>Copy this token and add it to your .env file as SHOPIFY_ACCESS_TOKEN:</p>
                <code style="background: #eee; padding: 10px; display: block;">${data.access_token}</code>
                <br/>
                <p>Also add this to your .env:</p>
                <code style="background: #eee; padding: 10px; display: block;">SHOPIFY_STORE_DOMAIN="${shop}"</code>
            `, {
                headers: { 'Content-Type': 'text/html' }
            })
        } else {
            return NextResponse.json({ error: 'Failed to get access token', details: data }, { status: 500 })
        }
    } catch (error) {
        console.error('Auth error:', error)
        return new Response('Error exchanging code for token.', { status: 500 })
    }
}
