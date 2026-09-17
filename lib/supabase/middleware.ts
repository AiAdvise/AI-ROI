import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
  const isApiPath = request.nextUrl.pathname.startsWith("/api/");

  if (!user && !isPublicPath && !isApiPath) {
    const url = request.nextUrl.clone();
    // Cold traffic landing on the bare domain should hit the persuasive
    // signup page, not a context-less login form. Its magic-link form works
    // identically for returning users, so this costs existing users nothing.
    url.pathname = request.nextUrl.pathname === "/" ? "/signup" : "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
