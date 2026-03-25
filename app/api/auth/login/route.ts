import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-replace-me'
)

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        const admin = await prisma.adminUser.findUnique({
            where: { email },
        })

        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const token = await new SignJWT({
            id: admin.id,
            email: admin.email,
            role: admin.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1d')
            .sign(JWT_SECRET)

        return NextResponse.json({
            token,
            user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
        })
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
