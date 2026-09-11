import { NextRequest, NextResponse } from "next/server";
import { buildWellbeingDashboard, fetchWellbeingRecords } from "../../../../lib/wellbeing";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const filters = {
      surveyMonth: params.get("month") || undefined,
      year: params.get("year") ? Number(params.get("year")) : undefined,
      team: params.get("team") || undefined,
      schoolDivision: params.get("division") || undefined,
      department: params.get("department") || undefined,
      language: params.get("language") || undefined,
    };

    const records = await fetchWellbeingRecords();
    return NextResponse.json(buildWellbeingDashboard(records, filters), {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch (error) {
    console.error("Wellbeing admin API error", error);
    return NextResponse.json({ error: "Unable to load wellbeing data." }, { status: 502 });
  }
}
