import Image from "next/image";

interface HeroCardProps {
  image?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  buttonColor?: string;
}

export default function HeroCard({
  image = "/placeholder-hero.jpg",
  title = "Hero Title",
  subtitle = "Your subtitle here",
  buttonText = "Learn More",
  backgroundColor = "bg-gray-100",
  titleColor = "text-gray-800",
  subtitleColor = "text-gray-600",
  buttonColor = "bg-blue-600",
}: HeroCardProps) {
  return (
    <div
      className={`w-full ${backgroundColor} rounded-lg overflow-hidden shadow-lg`}
    >
      {/* Mobile: Stacked layout, Desktop: Horizontal */}
      <div className="flex flex-col md:flex-row md:items-center">
        {/* Image section */}
        <div className="w-full md:w-1/2 aspect-video md:aspect-square relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Content section */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <h2 className={`text-2xl md:text-3xl font-bold ${titleColor} mb-4`}>
            {title}
          </h2>
          <p className={`${subtitleColor} mb-6 text-sm md:text-base`}>
            {subtitle}
          </p>
          <button
            className={`${buttonColor} hover:opacity-90 text-white px-6 py-3 rounded-lg transition-all`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
