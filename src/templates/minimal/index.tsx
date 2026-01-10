import { Wedding } from "@/data/getWedding";
import { PreparedWeddingSchedule } from "@/data/getWeddingSchedules";
import Image from "next/image";
import Calendar from "./Calendar";
import Schedule from "./Schedule";

interface MinimalTemplateProps {
  wedding: Wedding;
  schedules: PreparedWeddingSchedule[];
}

export default function MinimalTemplate({
  wedding,
  schedules,
}: MinimalTemplateProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#74735b" }}
    >
      {/* Hero Section - White Card */}
      <div className="relative w-full min-h-screen bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-130 h-140 lg:w-[50rem] lg:h-[50rem]">
          <Image
            src="https://res.cloudinary.com/dbxaojmo6/image/upload/v1766995472/ChatGPT_Image_Dec_29_2025_03_04_07_PM_jxkzli.png"
            alt="Top right botanical decoration"
            width={384}
            height={320}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Bottom-left botanical decoration */}
        <div className="absolute bottom-0 left-0 w-130 h-140 lg:w-[50rem] lg:h-[50rem]">
          <Image
            src="https://res.cloudinary.com/dbxaojmo6/image/upload/v1766995472/ChatGPT_Image_Dec_29_2025_02_58_31_PM_fs6ims.png"
            alt="Bottom left botanical decoration"
            width={384}
            height={320}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8 pb-17 lg:pb-21">
          <div className="text-center space-y-6 mb-8 lg:mb-12">
            {/* Monogram */}
            <div className="text-8xl font-serif text-gray-200 leading-none mb-4">
              &
            </div>

            {/* Names */}
            <div className="space-y-1">
              <h1
                className="text-3xl font-serif tracking-widest uppercase"
                style={{ color: "#74735b" }}
              >
                {wedding.brideName}
              </h1>
              <div className="text-xl font-light" style={{ color: "#74735b" }}>
                &
              </div>
              <h1
                className="text-3xl font-serif tracking-widest uppercase"
                style={{ color: "#74735b" }}
              >
                {wedding.groomName}
              </h1>
            </div>

            {/* Date */}
            <div className="pt-4">
              <p
                className="text-sm tracking-wider"
                style={{ color: "#74735b" }}
              >
                {new Date(wedding.eventDate).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Section - Outside white card */}
      <div className="w-full py-16 px-8 bg-white">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm leading-relaxed text-gray-900">
            We joyfully invite you to celebrate
            <br />
            our wedding day with us.
            <br />
            Your presence would mean the world to us
            <br />
            as we begin this new chapter together.
          </p>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="w-full py-16 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row gap-6 items-center justify-center">
            {/* Photo 1 */}
            <div className="w-48 h-60 bg-gray-200 overflow-hidden">
              {wedding.coverImageUrl ? (
                <Image
                  src={wedding.coverImageUrl}
                  alt="Wedding photo 1"
                  width={192}
                  height={240}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Photo 1
                </div>
              )}
            </div>

            {/* Photo 2 */}
            <div className="w-48 h-60 bg-gray-200 overflow-hidden">
              {wedding.coverImageUrl ? (
                <Image
                  src={wedding.coverImageUrl}
                  alt="Wedding photo 2"
                  width={192}
                  height={240}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Photo 2
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <Schedule schedules={schedules} />

      {/* Calendar Section */}
      <Calendar eventDate={wedding.eventDate} />
    </div>
  );
}
