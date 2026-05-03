import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accessToken, task } = await req.json();

  if (!accessToken || !task?.title || !task?.dueDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    const { data } = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: task.title,
        description: `Task dari ShelterSync\nAssignee: ${task.assignee}`,
        start: { dateTime: task.dueDate, timeZone: "Asia/Jakarta" },
        end: {
          dateTime: new Date(
            new Date(task.dueDate).getTime() + 60 * 60 * 1000
          ).toISOString(),
          timeZone: "Asia/Jakarta",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 1440 },
            { method: "popup", minutes: 60 },
          ],
        },
      },
    });
    return NextResponse.json({ success: true, eventId: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
