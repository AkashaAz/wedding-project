import Image from "next/image";

interface GalleryCardProps {
  images?: string[];
  title?: string;
  subtitle?: string;
  columns?: number;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export default function GalleryCard({
  images = [
    "/placeholder-1.jpg",
    "/placeholder-2.jpg",
    "/placeholder-3.jpg",
    "/placeholder-4.jpg",
  ],
  title = "Gallery Title",
  subtitle = "Beautiful collection",
  columns = 2,
  backgroundColor = "bg-white",
  titleColor = "text-gray-800",
  subtitleColor = "text-gray-600",
}: GalleryCardProps) {
  return (
    <div className={`${backgroundColor} rounded-lg shadow-md overflow-hidden`}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b">
        <h3 className={`text-xl md:text-2xl font-bold ${titleColor}`}>
          {title}
        </h3>
        <p className={`${subtitleColor} mt-2`}>{subtitle}</p>
      </div>

      {/* Gallery Grid */}
      <div
        className={`p-4 md:p-6 grid grid-cols-2 md:grid-cols-${columns} gap-3 md:gap-4`}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg overflow-hidden relative"
          >
            <Image
              src={image}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
