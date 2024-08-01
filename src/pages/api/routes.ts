import { NextResponse } from 'next/server';

export async function GET() {
    const data = { 
        pokemon: {
            name: '꼬부기'
        }
    }
    return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const requestBody = await req.json();
  const {uid, agentId} = requestBody;
  
  return new Response;
}