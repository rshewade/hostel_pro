"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

export default function GalleryPage() {
  const { t } = useLanguage();

  const images = [
    { src: "/hostel-gate.png", alt: t('Historic Main Gate', 'ऐतिहासिक मुख्य द्वार') },
    { src: "/hostel-building.png", alt: t('Heritage Building', 'विरासत भवन') },
    { src: "/hostel-temple.png", alt: t('Temple View', 'मंदिर का दृश्य') },
    { src: "/hostel-room.png", alt: t('Traditional Interior', 'पारंपरिक आंतरिक') },
    { src: "/hostel-playground.jpg", alt: t('Sports Ground', 'खेल का मैदान') },
  ];

  return (
    <PublicLayout>
      <PageHero
        title={t('Photo Gallery', 'फोटो गैलरी')}
        subtitle={t('Glimpses of our institutions and events', 'हमारी संस्थाओं और कार्यक्रमों की झलकियां')}
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 max-w-6xl mx-auto">
            {images.map((image, index) => (
              <div
                key={index}
                className="mb-4 break-inside-avoid overflow-hidden rounded-lg group cursor-pointer"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={400}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
