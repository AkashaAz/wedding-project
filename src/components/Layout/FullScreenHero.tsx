"use client";

import React from "react";
import Image from "next/image";

interface FullScreenHeroProps {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  overlayOpacity?: number;
  textPosition?: "center" | "left" | "right";
  titleSize?: "small" | "medium" | "large" | "xl";
}

export function FullScreenHero({
  backgroundImage = "/placeholder-hero.jpg",
  title = "Welcome to Our Wedding",
  subtitle = "Join us in celebrating our special day",
  buttonText = "View Details",
  buttonLink = "#",
  overlayOpacity = 50,
  textPosition = "center",
  titleSize = "large",
}: FullScreenHeroProps) {
  const textPositionClasses = {
    center: "items-center justify-center text-center",
    left: "items-center justify-start text-left pl-8 md:pl-16",
    right: "items-center justify-end text-right pr-8 md:pr-16",
  };

  const titleSizeClasses = {
    small: "text-3xl md:text-4xl lg:text-5xl",
    medium: "text-4xl md:text-5xl lg:text-6xl",
    large: "text-5xl md:text-6xl lg:text-7xl",
    xl: "text-6xl md:text-7xl lg:text-8xl",
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Hero Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div
        className={`relative z-10 min-h-screen flex ${textPositionClasses[textPosition]}`}
      >
        <div className="max-w-4xl px-4 py-8">
          {/* Title */}
          <h1
            className={`font-bold text-white mb-6 leading-tight ${titleSizeClasses[titleSize]}`}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl">
              {subtitle}
            </p>
          )}

          {/* Call to Action Button */}
          {buttonText && (
            <a
              href={buttonLink}
              className="inline-block bg-white text-gray-900 font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors duration-300 text-lg shadow-lg"
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
}
