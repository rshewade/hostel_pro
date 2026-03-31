"use client";

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';

const images = [
  '/hostel-gate.png',
  '/hostel-building.png',
  '/hostel-room.png',
  '/hostel-temple.png',
  '/hostel-playground.jpg',
];

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const PageHero = ({ title, subtitle, children }: PageHeroProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Background Images with Crossfade */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Background ${index + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/85 to-primary/95" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          {children}
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-primary-foreground/80">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentImage ? 'bg-accent w-4' : 'bg-primary-foreground/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default PageHero;
