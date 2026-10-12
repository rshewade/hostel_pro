"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

// width/height carry each photo's true aspect ratio (landscape 4:3, portrait 3:4)
// so the masonry grid lays out without shifting.
const L = { width: 600, height: 450 };
const P = { width: 600, height: 800 };

export default function GalleryPage() {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'boys-hostel',
      title: t("Boys' Hostel", 'बालक छात्रावास'),
      subtitle: t('Sheth Hirachand Gumanji Jain Boarding School Trust', 'सेठ हीराचंद गुमानजी जैन बोर्डिंग स्कूल ट्रस्ट'),
      images: [
        { src: "/gallery/boys-hostel/boys-hostel-01.jpg", ...P, alt: t('Entrance Arch with the Trust Name', 'ट्रस्ट के नाम वाला प्रवेश द्वार') },
        { src: "/hostel5.jpeg", ...L, alt: t('Main Building and Courtyard', 'मुख्य भवन और प्रांगण') },
        { src: "/gallery/boys-hostel/boys-hostel-07.jpg", ...P, alt: t('Hostel Building from the Courtyard', 'प्रांगण से छात्रावास भवन') },
        { src: "/gallery/boys-hostel/boys-hostel-06.jpg", ...L, alt: t('Main Hostel Building', 'मुख्य छात्रावास भवन') },
        { src: "/gallery/boys-hostel/boys-hostel-09.jpg", ...P, alt: t('Courtyard and Temple', 'प्रांगण और मंदिर') },
        { src: "/gallery/boys-hostel/boys-hostel-08.jpg", ...L, alt: t('Four-Storey Hostel Block', 'चार मंज़िला छात्रावास भवन') },
        { src: "/gallery/boys-hostel/boys-hostel-02.jpg", ...P, alt: t('Courtyard', 'प्रांगण') },
        { src: "/gallery/boys-hostel/boys-hostel-14.jpg", ...L, alt: t('Courtyard with Temple', 'मंदिर के साथ प्रांगण') },
        { src: "/hostel2.jpeg", ...P, alt: t('Wooden Staircase', 'लकड़ी की सीढ़ियाँ') },
        { src: "/gallery/boys-hostel/boys-hostel-04.jpg", ...L, alt: t('Hostel Building and Courtyard', 'छात्रावास भवन और प्रांगण') },
        { src: "/gallery/boys-hostel/boys-hostel-11.jpg", ...P, alt: t('Pillared Corridor', 'स्तंभों वाला गलियारा') },
        { src: "/hostel6.jpeg", ...L, alt: t('Puja at the Jain Temple', 'जैन मंदिर में पूजा') },
        { src: "/hostel3.jpeg", ...P, alt: t('Hostel Corridor', 'छात्रावास का गलियारा') },
        { src: "/gallery/boys-hostel/boys-hostel-05.jpg", ...L, alt: t('Table Tennis Area', 'टेबल टेनिस क्षेत्र') },
        { src: "/gallery/boys-hostel/boys-hostel-13.jpg", ...P, alt: t('Student Room', 'छात्र कक्ष') },
        { src: "/gallery/boys-hostel/boys-hostel-03.jpg", ...L, alt: t('Covered Recreation Area', 'छायादार मनोरंजन क्षेत्र') },
        { src: "/hostel7.jpeg", ...P, alt: t('Arched Colonnade', 'मेहराबदार स्तंभ-पंक्ति') },
        { src: "/hostel9.jpeg", ...L, alt: t('Courtyard with Jain Flag', 'जैन ध्वज के साथ प्रांगण') },
        { src: "/gallery/boys-hostel/boys-hostel-10.jpg", ...P, alt: t('Staircase', 'सीढ़ियाँ') },
        { src: "/hostel8.jpeg", ...L, alt: t('Courtyard View', 'प्रांगण का दृश्य') },
        { src: "/hostel4.jpeg", ...P, alt: t('Marble-Floored Verandah', 'संगमरमर फर्श वाला बरामदा') },
        { src: "/gallery/boys-hostel/boys-hostel-12.jpg", ...P, alt: t('Staircase to the Upper Floor', 'ऊपरी मंज़िल की सीढ़ियाँ') },
        { src: "/gallery/boys-hostel/boys-hostel-15.jpg", ...P, alt: t('Residential Wing', 'आवासीय भाग') },
      ],
    },
    {
      id: 'girls-hostel',
      title: t("Girls' Hostel", 'बालिका छात्रावास'),
      subtitle: t('R. R. Shravika Ashram', 'आर. आर. श्राविका आश्रम'),
      images: [
        { src: "/gallery/girls-hostel/girls-hostel-01.jpg", ...P, alt: t('Ashram Main Gate', 'आश्रम का मुख्य द्वार') },
        { src: "/gallery/girls-hostel/girls-hostel-06.jpg", ...L, alt: t('Hostel Building', 'छात्रावास भवन') },
        { src: "/gallery/girls-hostel/girls-hostel-02.jpg", ...P, alt: t('Entrance Pathway', 'प्रवेश मार्ग') },
        { src: "/gallery/girls-hostel/girls-hostel-05.jpg", ...L, alt: t('Common Hall', 'सामान्य सभागार') },
        { src: "/gallery/girls-hostel/girls-hostel-03.jpg", ...P, alt: t('Garden Pathway', 'बगीचे का रास्ता') },
        { src: "/gallery/girls-hostel/girls-hostel-07.jpg", ...P, alt: t('Building Entrance', 'भवन का प्रवेश द्वार') },
        { src: "/gallery/girls-hostel/girls-hostel-04.jpg", ...P, alt: t('Common Hall Interior', 'सामान्य सभागार का भीतरी दृश्य') },
        { src: "/gallery/girls-hostel/girls-hostel-09.jpg", ...P, alt: t('Inner Courtyard', 'भीतरी प्रांगण') },
        { src: "/gallery/girls-hostel/girls-hostel-08.jpg", ...P, alt: t('Staircase', 'सीढ़ियाँ') },
        { src: "/gallery/girls-hostel/girls-hostel-11.jpg", ...P, alt: t('Corridor', 'गलियारा') },
        { src: "/gallery/girls-hostel/girls-hostel-10.jpg", ...P, alt: t('Staircase to the Upper Floors', 'ऊपरी मंज़िलों की सीढ़ियाँ') },
        { src: "/gallery/girls-hostel/girls-hostel-12.jpg", ...P, alt: t('Upper-Floor Corridor', 'ऊपरी मंज़िल का गलियारा') },
        { src: "/gallery/girls-hostel/girls-hostel-13.jpg", ...P, alt: t('Solar Panels on the Terrace', 'छत पर सौर पैनल') },
      ],
    },
  ];

  return (
    <PublicLayout>
      <PageHero
        title={t('Photo Gallery', 'फोटो गैलरी')}
        subtitle={t('Glimpses of our institutions and events', 'हमारी संस्थाओं और कार्यक्रमों की झलकियां')}
      />

      {sections.map((section, sectionIndex) => (
        <section
          key={section.id}
          id={section.id}
          className={`py-16 ${sectionIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-heading font-bold text-foreground">{section.title}</h2>
                <p className="text-muted-foreground mt-2">{section.subtitle}</p>
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {section.images.map((image) => (
                  <div
                    key={image.src}
                    className="mb-4 break-inside-avoid overflow-hidden rounded-lg group"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </PublicLayout>
  );
}
