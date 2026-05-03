import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, taskTitle, assigneeName } = await req.json();

  if (!email || !taskTitle) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "ShelterSync <noreply@yourdomain.com>",
    to: email,
    subject: `Task baru untukmu: ${taskTitle}`,
    html: `
      <p>Halo ${assigneeName ?? ""},</p>
      <p>Kamu mendapat task baru: <strong>${taskTitle}</strong></p>
      <p>Buka ShelterSync untuk melihat detailnya.</p>
    `,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}
