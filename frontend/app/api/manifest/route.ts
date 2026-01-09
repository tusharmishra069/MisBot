import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mis-bot.vercel.app';

    const manifest = {
        url: baseUrl,
        name: "Misbot",
        iconUrl: `${baseUrl}/spade.png`,
        termsOfUseUrl: `${baseUrl}/terms`,
        privacyPolicyUrl: `${baseUrl}/privacy`
    };

    return NextResponse.json(manifest, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
