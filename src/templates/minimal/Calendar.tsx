import { useCalendar } from "./useCalendar";

interface CalendarProps {
  eventDate: string;
}

export default function Calendar({ eventDate }: CalendarProps) {
  const calendar = useCalendar(eventDate);

  return (
    <div className="w-full py-16 px-8 bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Watercolor Floral Decorations */}
          <img
            src="https://res.cloudinary.com/dbxaojmo6/image/upload/v1766995472/ChatGPT_Image_Dec_29_2025_03_04_07_PM_jxkzli.png"
            alt=""
            className="absolute -top-8 -left-8 w-40 h-40 object-contain opacity-60 pointer-events-none"
          />
          <img
            src="https://res.cloudinary.com/dbxaojmo6/image/upload/v1766995472/ChatGPT_Image_Dec_29_2025_02_58_31_PM_fs6ims.png"
            alt=""
            className="absolute -bottom-8 -right-8 w-40 h-40 object-contain opacity-60 pointer-events-none rotate-180"
          />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-px w-8 bg-gradient-to-r from-transparent"
                  style={{ backgroundColor: "rgba(116, 115, 91, 0.3)" }}
                ></div>
                <svg
                  className="w-6 h-6"
                  style={{ color: "#74735b" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <div
                  className="h-px w-8 bg-gradient-to-l from-transparent"
                  style={{ backgroundColor: "rgba(116, 115, 91, 0.3)" }}
                ></div>
              </div>
              <h2
                className="text-4xl mb-1"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: "#74735b",
                }}
              >
                Save the Date
              </h2>
              <p
                className="text-sm"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(116, 115, 91, 0.6)",
                }}
              >
                Our Special Day
              </p>
            </div>
          </div>

          {/* Month and Year */}
          <div className="flex items-center justify-between mb-6 px-2">
            <h3
              className="text-2xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#74735b",
              }}
            >
              {calendar.monthName}
            </h3>
            <p
              className="text-sm"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "rgba(116, 115, 91, 0.7)",
              }}
            >
              {calendar.year}
            </p>
          </div>

          {/* Calendar */}
          <div
            className="rounded-2xl p-6 shadow-inner"
            style={{
              background:
                "linear-gradient(to bottom right, rgba(116, 115, 91, 0.08), rgba(116, 115, 91, 0.12))",
            }}
          >
            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {calendar.dayNames.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-medium"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "rgba(116, 115, 91, 0.7)",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendar.days.map((day, index) => (
                <div
                  key={index}
                  className="aspect-square flex items-center justify-center"
                >
                  {day && (
                    <>
                      {day === calendar.weddingDay ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            className="absolute inset-0 w-full h-full drop-shadow-lg scale-125"
                            style={{ color: "#74735b" }}
                          >
                            <path
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            />
                          </svg>
                          <span
                            className="relative z-10 drop-shadow-md font-semibold"
                            style={{ color: "#74735b" }}
                          >
                            {day}
                          </span>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center rounded-xl transition-all duration-300 hover:bg-white/50 hover:scale-105"
                          style={{ color: "rgba(116, 115, 91, 0.6)" }}
                        >
                          <span>{day}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div
              className="inline-block px-6 py-3 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, rgba(116, 115, 91, 0.15), rgba(116, 115, 91, 0.2))",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#74735b",
                }}
              >
                {calendar.weddingDay} {calendar.monthName} {calendar.year}
              </p>
            </div>
            <p
              className="text-xs mt-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "rgba(116, 115, 91, 0.5)",
              }}
            >
              You are cordially invited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
