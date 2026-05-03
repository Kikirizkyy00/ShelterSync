import { supabase } from "../lib/supabase";

export async function sendNotification(payload: {
  userId: string;
  title: string;
  message: string;
}) {
  if (!payload.userId || !payload.title || !payload.message) {
    throw new Error("sendNotification: missing required fields");
  }

  const { error } = await supabase
    .from("notifications")
    .insert(payload);

  if (error) throw new Error(`sendNotification: ${error.message}`);
}