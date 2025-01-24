import { jwtDecode } from 'jwt-decode'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside

const path = ['/dashboard', '/dashboard/ordenes', '/dashboard/cocina', '/dashboard/bebidas']
const rolePaths: { [key: string]: string[] } = {
  admin: ['/dashboard', '/dashboard/ordenes', '/dashboard/cocina', '/dashboard/bebidas','/dashboard/back'],
  gerent: ['/dashboard', '/dashboard/ordenes', '/dashboard/cocina', '/dashboard/bebidas','/dashboard/back'],
  cashier: ['/dashboard', '/dashboard/ordenes'],
  kitchen: ['/dashboard', '/dashboard/cocina'],
  drinks: ['/dashboard', '/dashboard/bebidas']
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const refresh = request.cookies.get('refreshToken')?.value

  if (path.includes(request.nextUrl.pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/validateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': token
      }
    })

    if (response.status === 401 && refresh) {
      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token': refresh
        }
      })

      if (refreshResponse.ok) {
        const newToken = await refreshResponse.json()
        const newResponse = NextResponse.next()
        newResponse.cookies.set('accessToken', newToken.accessToken)
        return newResponse
      } else {
        const newResponse = NextResponse.redirect(new URL('/', request.url))
        newResponse.cookies.delete('accessToken')
        newResponse.cookies.delete('refreshToken')
        return newResponse
      }
    } else if (response.status !== 201) {
      const newResponse = NextResponse.redirect(new URL('/', request.url))
      newResponse.cookies.delete('accessToken')
      newResponse.cookies.delete('refreshToken')
      return newResponse
    }
    let decodedToken: { id: string, name: string, role: string, sucursalId: string } | null = null;
    if (token) {
        decodedToken = jwtDecode<{ id: string, name: string, role: string, sucursalId: string }>(token);
    }
    const userRole: string | undefined = decodedToken?.role;

    if (!userRole || !rolePaths[userRole]?.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
// export const config = {
//   matcher: '/about/:path*',
// }