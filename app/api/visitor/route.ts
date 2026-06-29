export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.countapi.xyz/hit/glyph-typing-trainer/visits",
      { cache: "no-store" }
    );
    const data = await res.json();
    return Response.json({ count: data.value ?? 0 });
  } catch {
    return Response.json({ count: 0 });
  }
}
