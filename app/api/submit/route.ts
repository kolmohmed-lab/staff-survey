import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const powerAutomateUrl = process.env.POWER_AUTOMATE_URL;
  if (!powerAutomateUrl) {
    return NextResponse.json({ error: "Server is not configured yet." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const monthAhead = body?.answers?.monthAhead ?? "";

    const payload = {
      team: body.team,
      surveyMonth: body.surveyMonth,
      wellbeingScore: 0,
      comment: JSON.stringify({ answers: body.answers, otherText: body.otherText, monthAhead }),
      submittedAt: body.submittedAt,
    };

    const response = await fetch(powerAutomateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Microsoft storage request failed." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
}
