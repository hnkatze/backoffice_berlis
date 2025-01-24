import { cookies } from "next/headers";
import { NextResponse } from "next/server";



  export  async function GET( ) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    return new NextResponse(JSON.stringify({ token: accessToken }), { status: 200 });
  }

  export async function DELETE() {
    const cookieStore = cookies();
    cookieStore.set('accessToken', '', { maxAge: -1 });
    return new NextResponse(null, { status: 204 });
  }