"use client";

import React from "react";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import Image from "next/image";

export function ParallaxFullScreenHero() {
  return (
    <ParallaxProvider>
      <div className="h-screen relative overflow-hidden bg-gradient-to-br from-orange-200 via-yellow-100 to-pink-100">
        {/* พื้นหลังฟ้าและเมฆ */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 via-blue-200 to-orange-200"></div>

        {/* ก้อนเมฆด้านบน */}
        <Parallax
          translateX={[-100, 150]}
          translateY={[-20, 20]}
          className="absolute top-10 left-20 z-10"
        >
          <Image
            src="/cloud1.png"
            alt="Cloud"
            width={120}
            height={80}
            className="opacity-90"
          />
        </Parallax>

        <Parallax
          translateX={[80, -120]}
          translateY={[10, -10]}
          className="absolute top-16 right-24 z-10"
        >
          <Image
            src="/cloud1.png"
            alt="Cloud"
            width={100}
            height={70}
            className="opacity-80"
          />
        </Parallax>

        {/* ต้นไม้ด้านซ้าย - ชั้นหลัง */}
        <Parallax
          translateY={[-30, 50]}
          translateX={[-20, 30]}
          className="absolute bottom-0 left-8 z-15"
        >
          <Image
            src="/tree2.png"
            alt="Tree"
            width={200}
            height={300}
            className="object-bottom"
          />
        </Parallax>

        {/* ต้นไม้ด้านขวา - ชั้นหน้า */}
        <Parallax
          translateY={[-40, 60]}
          translateX={[20, -40]}
          className="absolute bottom-0 right-12 z-20"
        >
          <Image
            src="/tree1.png"
            alt="Tree"
            width={180}
            height={280}
            className="object-bottom"
          />
        </Parallax>

        {/* ผีเสื้อตัวที่ 1 - บินรอบๆ */}
        <Parallax
          translateX={[-150, 200]}
          translateY={[50, -80]}
          className="absolute top-1/3 left-1/4 z-25"
        >
          <Image
            src="/butterfly1.png"
            alt="Butterfly"
            width={40}
            height={35}
            className="animate-bounce"
          />
        </Parallax>

        {/* ผีเสื้อตัวที่ 2 - บินในทิศทางตรงข้าม */}
        <Parallax
          translateX={[100, -150]}
          translateY={[-30, 70]}
          className="absolute top-1/2 right-1/3 z-25"
        >
          <Image
            src="/butterfly2.png"
            alt="Butterfly"
            width={35}
            height={30}
            className="animate-pulse"
          />
        </Parallax>

        {/* เนื้อหาตรงกลาง */}
        <Parallax
          translateY={[-60, 60]}
          opacity={[1, 0.4]}
          scale={[1, 0.95]}
          className="absolute inset-0 flex items-center justify-center z-30"
        >
          <div className="text-center">
            <div className="text-7xl mb-6">🌸</div>
            <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-4">
              Autumn Romance
            </h1>
            <p className="text-2xl text-white/95 drop-shadow-lg">
              Where love blooms eternal
            </p>
          </div>
        </Parallax>

        {/* ใบไม้ร่วงหล่น */}
        <Parallax
          translateY={[100, -200]}
          translateX={[-30, 50]}
          className="absolute top-20 left-1/3 z-12"
        >
          <div className="text-4xl animate-bounce">🍂</div>
        </Parallax>

        <Parallax
          translateY={[80, -180]}
          translateX={[40, -30]}
          className="absolute top-32 right-1/4 z-12"
        >
          <div className="text-3xl animate-pulse">🍁</div>
        </Parallax>
      </div>

      {/* section ต่อไป */}
      <div className="h-screen flex items-center justify-center bg-white relative">
        <Parallax translateY={[50, -50]} opacity={[0, 1]}>
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome to the next section
          </h1>
        </Parallax>

        {/* เพิ่มเนื้อหาสำหรับทดสอบ scroll */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <Parallax translateY={[20, -20]}>
            <p className="text-gray-600 text-lg animate-pulse">
              ↓ Keep scrolling ↓
            </p>
          </Parallax>
        </div>
      </div>

      {/* section เพิ่มเติมเพื่อให้มี scroll distance มากขึ้น */}
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Parallax translateY={[-80, 80]}>
          <div className="text-6xl animate-spin">✨</div>
        </Parallax>
      </div>
    </ParallaxProvider>
  );
}
