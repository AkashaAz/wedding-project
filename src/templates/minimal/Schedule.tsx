import {
  PreparedWeddingSchedule,
  WeddingScheduleSlot,
} from "@/data/getWeddingSchedules";
import Image from "next/image";

interface ScheduleProps {
  schedules: PreparedWeddingSchedule[];
}

// Mapping slot keys to human-readable labels
const SLOT_LABELS: Record<WeddingScheduleSlot, string> = {
  ceremony_1: "Wedding Ceremony",
  ceremony_2: "Blessing Ceremony",
  dinner: "Reception Dinner",
  after_party: "After Party",
};

// Mapping slot keys to images
const SLOT_IMAGES: Record<WeddingScheduleSlot, string> = {
  ceremony_1:
    "https://res.cloudinary.com/dbxaojmo6/image/upload/v1767802258/ChatGPT_Image_Jan_7_2026_10_37_13_PM_gfudsn.png",
  ceremony_2:
    "https://res.cloudinary.com/dbxaojmo6/image/upload/v1767802598/1_lgypjw.png",
  dinner:
    "https://res.cloudinary.com/dbxaojmo6/image/upload/v1767802567/2_umxcco.png",
  after_party:
    "https://res.cloudinary.com/dbxaojmo6/image/upload/v1767802489/3_aged0f.png",
};

// Default fallback image
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dbxaojmo6/image/upload/v1767802258/ChatGPT_Image_Jan_7_2026_10_37_13_PM_gfudsn.png";

export default function Schedule({ schedules }: ScheduleProps) {
  if (schedules.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-16 px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-serif tracking-wider uppercase"
            style={{ color: "#74735b" }}
          >
            Schedule
          </h2>
          <div className="w-16 h-0.5 bg-gray-300 mx-auto mt-4"></div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className="flex flex-col md:flex-row gap-6 items-start md:items-center"
            >
              {/* Time */}
              <div className="flex-shrink-0 w-24">
                <div
                  className="text-2xl font-serif font-semibold"
                  style={{ color: "#74735b" }}
                >
                  {schedule.displayTime}
                </div>
              </div>

              {/* Timeline Dot and Line */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="w-4 h-4 rounded-full border-4"
                  style={{ borderColor: "#74735b", backgroundColor: "white" }}
                ></div>
                {index < schedules.length - 1 && (
                  <div
                    className="w-0.5 h-16"
                    style={{ backgroundColor: "#d1d0c2" }}
                  ></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col md:flex-row gap-6 items-start">
                {/* Image */}
                <div className="w-full md:w-48 h-32 overflow-hidden rounded">
                  <Image
                    src={SLOT_IMAGES[schedule.slotKey] || DEFAULT_IMAGE}
                    alt={SLOT_LABELS[schedule.slotKey] || schedule.slotKey}
                    width={192}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Label and Description */}
                <div className="flex-1">
                  <h3
                    className="text-xl font-serif mb-2"
                    style={{ color: "#74735b" }}
                  >
                    {SLOT_LABELS[schedule.slotKey] || schedule.slotKey}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Join us for this special moment as we celebrate together.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
