import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import hostelBuilding from '@/assets/hostel-building.png';
import hostelRoom from '@/assets/hostel-room.png';
import hostelTemple from '@/assets/hostel-temple.png';
import hostelGate from '@/assets/hostel-gate.png';
import hostelPlayground from '@/assets/hostel-playground.jpg';

const Gallery = () => {
  const { t } = useLanguage();

  const images = [
    { src: hostelGate, alt: t('Historic Main Gate', 'ऐतिहासिक मुख्य द्वार') },
    { src: hostelBuilding, alt: t('Heritage Building', 'विरासत भवन') },
    { src: hostelTemple, alt: t('Temple View', 'मंदिर का दृश्य') },
    { src: hostelRoom, alt: t('Traditional Interior', 'पारंपरिक आंतरिक') },
    { src: hostelPlayground, alt: t('Sports Ground', 'खेल का मैदान') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
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
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
