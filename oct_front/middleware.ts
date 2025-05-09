import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// const secret = '2BoYHNlKnYxl4TThm+mG9anPKuuap4wD7HU/vMmeaeI=';

export async function middleware(req: NextRequest) {
  // Retrieve the token
  const token = await getToken({ req, secret : '2BoYHNlKnYxl4TThm+mG9anPKuuap4wD7HU/vMmeaeI=' });
  console.log('req:', req.cookies); // Log the token for debugging
  console.log('Token:', token); // Log the token for debugging
  // If no token exists, redirect to the login page
  if (!token) {
    console.log(token);
    console.log('Token is null or undefined. Redirecting to login.');
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/'; // Redirect to login
    //return NextResponse.redirect(loginUrl);
  }
  console.log('Token exists. Proceeding to route:', req.nextUrl.pathname);

  // Token exists, allow the request
  return NextResponse.next();
}

// Apply middleware only to the /dashboard route
export const config = {
  matcher: ['/dashboard/:path*'],
};
