"use client";

import React from "react";
import Image from "next/image";

interface WeddingInvitationProps {
  backgroundImage?: string;
  weddingDate?: string;
  day?: string;
  month?: string;
  year?: string;
  brideName?: string;
  groomName?: string;
  message?: string;
  overlayOpacity?: number;
  textColor?: "white" | "black" | "cream";
  datePosition?: "top" | "bottom";
  namesPosition?: "center" | "bottom";
}

export function WeddingInvitation({
  backgroundImage = "/placeholder-hero.jpg",
  weddingDate = "Wedding Day",
  day = "28",
  month = "06",
  year = "2025",
  brideName = "Элен",
  groomName = "Стас",
  message = "Дорогие друзья! С радостью приглашаем вас разделить с нами этот волшебный и незабываемый момент образования новой семьи",
  overlayOpacity = 30,
  textColor = "white",
  datePosition = "top",
  namesPosition = "center",
}: WeddingInvitationProps) {
  const textColorClasses = {
    white: "text-white",
    black: "text-black",
    cream: "text-amber-50",
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Wedding Background"
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

      {/* Content Container */}
      <div
        className={`relative z-10 min-h-screen flex flex-col justify-between p-8 md:p-16 ${textColorClasses[textColor]}`}
      >
        {/* Top Section - Wedding Date */}
        {datePosition === "top" && (
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-light mb-4 tracking-wider">
              {weddingDate}
            </h3>
            <div className="flex justify-center items-center space-x-4 md:space-x-8">
              <div className="text-4xl md:text-6xl font-light">{day}</div>
              <div className="text-4xl md:text-6xl font-light">|</div>
              <div className="text-4xl md:text-6xl font-light">{month}</div>
              <div className="text-4xl md:text-6xl font-light">|</div>
              <div className="text-4xl md:text-6xl font-light">{year}</div>
            </div>
          </div>
        )}

        {/* Center Section - Names */}
        {namesPosition === "center" && (
          <div className="text-center flex-1 flex items-center justify-center">
            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-4 tracking-wide">
                {groomName} & {brideName}
              </h1>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="text-center space-y-6">
          {/* Names at bottom if configured */}
          {namesPosition === "bottom" && (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide">
              {groomName} & {brideName}
            </h1>
          )}

          {/* Date at bottom if configured */}
          {datePosition === "bottom" && (
            <div className="mb-6">
              <h3 className="text-xl md:text-2xl font-light mb-4 tracking-wider">
                {weddingDate}
              </h3>
              <div className="flex justify-center items-center space-x-4 md:space-x-8">
                <div className="text-3xl md:text-5xl font-light">{day}</div>
                <div className="text-3xl md:text-5xl font-light">|</div>
                <div className="text-3xl md:text-5xl font-light">{month}</div>
                <div className="text-3xl md:text-5xl font-light">|</div>
                <div className="text-3xl md:text-5xl font-light">{year}</div>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="max-w-2xl mx-auto">
            <p className="text-base md:text-lg lg:text-xl leading-relaxed font-light">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-white/30"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/30"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/30"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-white/30"></div>
    </div>
  );
}
