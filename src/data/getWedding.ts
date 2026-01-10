import { supabase } from "@/lib/supabase";

export interface Wedding {
  id: string;
  slug: string;
  template: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  venueName: string;
  coverImageUrl?: string;
}

export async function getWedding(slug: string): Promise<Wedding | null> {
  const { data, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    template: data.template,
    brideName: data.bride_name,
    groomName: data.groom_name,
    eventDate: data.event_date,
    venueName: data.venue_name,
    coverImageUrl: data.cover_image_url,
  };
}
