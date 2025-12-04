export async function POST() {
  return new Response(
    JSON.stringify({
      error: "This AI feature is disabled.",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
