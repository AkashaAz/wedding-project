import { notFound } from "next/navigation";
import { getWedding } from "@/data/getWedding";
import { templates, TemplateName } from "@/templates";
import {
  getWeddingSchedules,
  prepareWeddingSchedule,
} from "@/data/getWeddingSchedules";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WeddingPage({ params }: PageProps) {
  const { slug } = await params;
  const wedding = await getWedding(slug);

  if (!wedding) {
    notFound();
  }

  const Template = templates[wedding.template as TemplateName];

  if (!Template) {
    notFound();
  }

  // Fetch and prepare wedding schedules
  const rawSchedules = await getWeddingSchedules(wedding.id);
  const schedules = prepareWeddingSchedule(rawSchedules, {
    locale: "th-TH",
    timeZone: "Asia/Bangkok",
  });

  return <Template wedding={wedding} schedules={schedules} />;
}
