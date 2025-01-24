// import { NextApiRequest, NextApiResponse } from "next/"
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";



  export  async function POST(
    req: NextRequest,
  ) {
    const data = await req.json();
    const cookieStore = cookies();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    const result = await response.json();
    if(response.ok){
        (await cookieStore).set('accessToken', result.accessToken);
        (await cookieStore).set('refreshToken', result.refreshToken);
        return new NextResponse(JSON.stringify({ message: result.message }), { status: 200 });
    }else{
        return new NextResponse(JSON.stringify({ message: result.message }), { status: 404 });
    }
  }


  export async function GET(
  ) {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('accessToken')?.value;
    if(accessToken){
        const decodedToken: { id: string, name: string, role: string, sucursalId: string } = jwtDecode(accessToken);
        return new NextResponse(JSON.stringify({ name: decodedToken.name, id: decodedToken.id, sucursalId:decodedToken.sucursalId, role:decodedToken.role  }), { status: 200 });
    }
    return new NextResponse(JSON.stringify({ name: '', id: '', role: '', sucursalId:"" }), { status: 401 });
  }