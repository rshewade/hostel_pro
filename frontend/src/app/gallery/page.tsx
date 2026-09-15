"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

export default function GalleryPage() {
  const { t } = useLanguage();

  // width/height carry each photo's true aspect ratio (landscape 4:3, portrait 3:4)
  // so the masonry grid lays out without shifting; Next.js serves resized copies.
  const images = [
    { src: "/hostel1.jpeg", width: 600, height: 450, alt: t('Heritage Hostel Building', 'विरासत छात्रावास भवन') },
    { src: "/hostel2.jpeg", width: 600, height: 800, alt: t('Wooden Staircase', 'लकड़ी की सीढ़ियाँ') },
    { src: "/hostel6.jpeg", width: 600, height: 450, alt: t('Puja at the Jain Temple', 'जैन मंदिर में पूजा') },
    { src: "/hostel3.jpeg", width: 600, height: 800, alt: t('Hostel Corridor', 'छात्रावास का गलियारा') },
    { src: "/hostel5.jpeg", width: 600, height: 450, alt: t('Main Building and Courtyard', 'मुख्य भवन और प्रांगण') },
    { src: "/hostel7.jpeg", width: 600, height: 800, alt: t('Arched Colonnade', 'मेहराबदार स्तंभ-पंक्ति') },
    { src: "/hostel9.jpeg", width: 600, height: 450, alt: t('Courtyard with Jain Flag', 'जैन ध्वज के साथ प्रांगण') },
    { src: "/hostel4.jpeg", width: 600, height: 800, alt: t('Marble-Floored Verandah', 'संगमरमर फर्श वाला बरामदा') },
    { src: "/hostel8.jpeg", width: 600, height: 450, alt: t('Courtyard View', 'प्रांगण का दृश्य') },
    { src: "/hostel-gate.png", width: 600, height: 400, alt: t('Historic Main Gate', 'ऐतिहासिक मुख्य द्वार') },
    { src: "/hostel-building.png", width: 600, height: 400, alt: t('Heritage Building', 'विरासत भवन') },
    { src: "/hostel-temple.png", width: 600, height: 400, alt: t('Temple View', 'मंदिर का दृश्य') },
    { src: "/hostel-room.png", width: 600, height: 400, alt: t('Traditional Interior', 'पारंपरिक आंतरिक') },
    { src: "/hostel-playground.jpg", width: 600, height: 400, alt: t('Sports Ground', 'खेल का मैदान') },
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
                  width={image.width}
                  height={image.height}
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
