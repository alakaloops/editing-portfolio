import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();
    const correctPasscode = process.env.ADMIN_PASSCODE || 'Alaka098dash';

    if (passcode === correctPasscode) {
      return NextResponse.json({
        authenticated: true,
        message: 'Access granted',
      });
    }

    return NextResponse.json(
      { authenticated: false, message: 'Invalid passcode. Please try again.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
