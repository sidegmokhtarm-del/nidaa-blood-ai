import { NextResponse } from "next/server";

type Result = {
  hospital: string;
  bloodGroup: string;
  donorsNeeded: number;
  deadline: string;
  area: string;
  privacyNote: string;
  missingInformation: string[];
  mode: "gpt-5.6" | "demo";
};

function demoResult(appeal: string): Result {
  const group = appeal.match(/(?:AB|A|B|O)[+-]/i)?.[0].toUpperCase() || "A+";
  const donorsNeeded = /(?:three|3|ثلاث)/i.test(appeal) ? 3 : /(?:one|1|واحد)/i.test(appeal) ? 1 : 2;
  const isArabic = /[\u0600-\u06ff]/.test(appeal);
  return {
    hospital: isArabic ? "مستشفى الرياض المركزي" : "Riyadh Central Hospital",
    bloodGroup: group,
    donorsNeeded,
    deadline: isArabic ? "اليوم · 9:00 مساءً" : "Today · 9:00 PM",
    area: isArabic ? "الرياض" : "Riyadh",
    privacyNote: isArabic
      ? "تم حذف هوية المريض من التنبيه العام."
      : "Patient identity removed from the public alert.",
    missingInformation: [
      isArabic
        ? "يرجى تأكيد مدخل المتبرعين لبنك الدم."
        : "Confirm the hospital entrance for blood-bank donors.",
    ],
    mode: "demo",
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { appeal?: unknown } | null;
  const appeal = typeof body?.appeal === "string" ? body.appeal.trim().slice(0, 800) : "";
  if (!appeal) return NextResponse.json({ error: "Appeal text is required." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json(demoResult(appeal));

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.6",
        reasoning: { effort: "low" },
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You structure community blood-donation appeals. Extract only what the user states. Never infer medical eligibility or blood compatibility. Remove patient names, IDs, diagnoses, phone numbers, and room numbers. Keep the user's language. Return concise JSON matching the schema.",
              },
            ],
          },
          { role: "user", content: [{ type: "input_text", text: appeal }] },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "blood_appeal",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                hospital: { type: "string" },
                bloodGroup: { type: "string", enum: ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−", "Unknown"] },
                donorsNeeded: { type: "integer", minimum: 1, maximum: 20 },
                deadline: { type: "string" },
                area: { type: "string" },
                privacyNote: { type: "string" },
                missingInformation: { type: "array", items: { type: "string" }, maxItems: 3 },
              },
              required: ["hospital", "bloodGroup", "donorsNeeded", "deadline", "area", "privacyNote", "missingInformation"],
            },
          },
        },
        max_output_tokens: 900,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const raw =
      data.output_text ||
      data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
    if (!raw) throw new Error("No structured output returned");
    const parsed = JSON.parse(raw) as Omit<Result, "mode">;
    return NextResponse.json({ ...parsed, mode: "gpt-5.6" });
  } catch (error) {
    console.error("GPT-5.6 appeal analysis failed", error);
    return NextResponse.json(demoResult(appeal));
  }
}
