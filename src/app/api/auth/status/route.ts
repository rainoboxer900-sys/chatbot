import { getAuth0, isAuth0Configured } from "@/lib/auth0";

export async function GET() {
  if (!isAuth0Configured()) {
    return Response.json({ configured: false, authenticated: false });
  }

  const session = await getAuth0().getSession();

  if (!session?.user) {
    return Response.json({ configured: true, authenticated: false });
  }

  return Response.json({
    configured: true,
    authenticated: true,
    user: {
      name: session.user.name ?? session.user.email ?? "Account",
      email: session.user.email ?? "",
      picture: session.user.picture ?? null,
    },
  });
}
