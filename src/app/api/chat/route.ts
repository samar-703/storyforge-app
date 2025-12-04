export async function POST() {
  return new Response(
    JSON.stringify({
      error: "This project is disabled and no longer available.",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}

