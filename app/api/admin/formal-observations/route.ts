import { NextResponse } from "next/server";
import { fetchObservationRecords } from "../../../../lib/observations";

export async function GET() {
  try {
    const records = await fetchObservationRecords();
    return NextResponse.json(
      { records },
      { headers: { "Cache-Control": "no-store, private" } }
    );
  } catch (error) {
    console.error("Formal observations admin API error", error);
    return NextResponse.json(
      { error: "Unable to load formal observation data." },
      { status: 502 }
    );
  }
}
