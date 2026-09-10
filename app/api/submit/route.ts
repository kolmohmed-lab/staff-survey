import { NextResponse } from "next/server";

function asText(value: unknown) {
  if (Array.isArray(value)) return value.join("; ");
  if (typeof value === "string") return value;
  return "";
}

export async function POST(request: Request) {
  const powerAutomateUrl = process.env.POWER_AUTOMATE_URL;
  if (!powerAutomateUrl) {
    return NextResponse.json({ error: "Server is not configured yet." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const answers = body?.answers ?? {};
    const otherText = body?.otherText ?? {};
    const submittedAt = body?.submittedAt || new Date().toISOString();
    const submittedDate = new Date(submittedAt);
    const year = Number.isNaN(submittedDate.getTime()) ? new Date().getFullYear() : submittedDate.getFullYear();

    const submissionId = `WS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const payload = {
      submissionId,
      submittedAt,
      surveyMonth: body?.surveyMonth ?? "",
      year,
      language: body?.language ?? "",
      team: body?.team ?? "",
      schoolDivision: asText(answers.schoolDivision),
      department: asText(answers.department),
      monthAhead: asText(answers.monthAhead),
      lookingForward: asText(answers.lookingForward),
      notLookingForward: asText(answers.notLookingForward),
      focusAreas: asText(answers.focus),
      leadershipFeeling: asText(answers.leadershipFeeling),
      monthAheadDetail: asText(otherText.monthAhead),
      lookingForwardDetail: asText(otherText.lookingForward),
      notLookingForwardDetail: asText(otherText.notLookingForward),
      focusDetail: asText(otherText.focus),
      leadershipDetail: asText(otherText.leadershipFeeling),
      rawResponse: JSON.stringify({
        language: body?.language ?? "",
        team: body?.team ?? "",
        surveyMonth: body?.surveyMonth ?? "",
        answers,
        otherText,
        submittedAt,
      }),
    };

    const response = await fetch(powerAutomateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error("Power Automate request failed", response.status, details);
      return NextResponse.json({ error: "Microsoft storage request failed." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, submissionId });
  } catch (error) {
    console.error("Survey submission error", error);
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
}
