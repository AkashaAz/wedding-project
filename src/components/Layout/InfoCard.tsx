import Image from "next/image";

interface InfoCardProps {
  image?: string;
  title?: string;
  description?: string;
  iconColor?: string;
  backgroundColor?: string;
  titleColor?: string;
  descriptionColor?: string;
}

export default function InfoCard({
  image = "/placeholder-info.jpg",
  title = "Info Card Title",
  description = "Card description goes here",
  iconColor = "text-blue-600",
  backgroundColor = "bg-white",
  titleColor = "text-gray-800",
  descriptionColor = "text-gray-600",
}: InfoCardProps) {
  return (
    <div
      className={`${backgroundColor} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow`}
    >
      {/* Image */}
      <div className="w-full aspect-video relative">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className={`w-8 h-8 ${iconColor} mb-3`}>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h3 className={`text-lg md:text-xl font-semibold ${titleColor} mb-2`}>
          {title}
        </h3>
        <p className={`${descriptionColor} text-sm md:text-base`}>
          {description}
        </p>
      </div>
    </div>
  );
}
