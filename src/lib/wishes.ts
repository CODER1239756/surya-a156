import { supabase } from "@/integrations/supabase/client";

export interface WishRow {
  id: string;
  sender_name: string;
  profile_image_url: string | null;
  note_image_url: string | null;
  transcription: string | null;
  status: "pending" | "approved" | "rejected" | "hidden";
  paper_tint: string | null;
  pin_color: string | null;
  rotation: number | null;
  created_at: string;
  approved_at: string | null;
}

const BUCKET = "wish-images";

/** Get a signed URL for an object in the private wish-images bucket. */
export async function signedWishImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  // If it looks like a full URL (or a data: URI), just return it.
  if (/^(https?:|data:)/i.test(path)) return path;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function uploadWishFile(file: File, folder: "notes" | "avatars"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function fetchApprovedWishes(): Promise<WishRow[]> {
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as WishRow[]) ?? [];
}

export async function fetchAllWishes(): Promise<WishRow[]> {
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as WishRow[]) ?? [];
}

export interface NewWish {
  senderName: string;
  transcription?: string;
  noteImagePath?: string;
  profileImagePath?: string;
}

export async function submitWish(w: NewWish) {
  const payload = {
    sender_name: w.senderName.trim().slice(0, 100),
    transcription: w.transcription?.trim().slice(0, 1000) || null,
    note_image_url: w.noteImagePath || null,
    profile_image_url: w.profileImagePath || null,
    status: "pending" as const,
  };
  if (!payload.transcription && !payload.note_image_url) {
    throw new Error("Please add a written wish or upload a handwritten note.");
  }
  const { error } = await supabase.from("wishes").insert(payload);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function setWishStatus(id: string, status: WishRow["status"]) {
  const patch: { status: WishRow["status"]; approved_at?: string } = { status };
  if (status === "approved") patch.approved_at = new Date().toISOString();
  const { error } = await supabase.from("wishes").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function editWish(id: string, patch: Partial<Pick<WishRow, "sender_name" | "transcription">>) {
  const { error } = await supabase.from("wishes").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteWish(id: string) {
  const { error } = await supabase.from("wishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
