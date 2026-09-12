import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You need to be signed in to delete a report." }, { status: 401 });
  }

  const { id } = await params;

  // RLS also restricts deletes to the owning user - this check is just to
  // return a clean error rather than a silent no-op if the id isn't theirs.
  const { error, count } = await supabase
    .from("reports")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete report:", error);
    return NextResponse.json({ error: "Couldn't delete that report." }, { status: 500 });
  }

  if (!count) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
