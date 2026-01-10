import { supabase } from "@/lib/supabase";
import cloudinary from "@/lib/cloudinary";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !wedding) {
    return Response.json({ error: "Wedding not found" }, { status: 404 });
  }

  return Response.json({
    slug: wedding.slug,
    brideName: wedding.bride_name,
    groomName: wedding.groom_name,
    eventDate: wedding.event_date,
    venueName: wedding.venue_name,
    coverImageUrl: wedding.cover_image_url,
    coverImagePublicId: wedding.cover_image_public_id,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const body = await request.json();

  // Fetch existing wedding to get old publicId
  const { data: existingWedding } = await supabase
    .from("weddings")
    .select("cover_image_public_id")
    .eq("slug", slug)
    .single();

  const oldPublicId = existingWedding?.cover_image_public_id;

  // Update DB with new data
  const { error: updateError } = await supabase
    .from("weddings")
    .update({
      bride_name: body.brideName,
      groom_name: body.groomName,
      event_date: body.eventDate,
      venue_name: body.venueName,
      cover_image_url: body.coverImageUrl,
      cover_image_public_id: body.coverImagePublicId,
    })
    .eq("slug", slug);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  // Delete old image from Cloudinary if it exists and changed
  if (oldPublicId && oldPublicId !== body.coverImagePublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      // Log but don't fail the request
      console.error("Failed to delete old image from Cloudinary:", error);
    }
  }

  return Response.json({ success: true });
}
