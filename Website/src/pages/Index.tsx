import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import InstitutionsOverview from '@/components/InstitutionsOverview';
import MissionSection from '@/components/MissionSection';
import NewsPreview from '@/components/NewsPreview';
import DonationCTA from '@/components/DonationCTA';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <MissionSection />
        <InstitutionsOverview />
        <NewsPreview />
        <DonationCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
