"use client";

import PublicLayout from '@/components/public/PublicLayout';
import Hero from '@/components/public/Hero';
import MissionSection from '@/components/public/MissionSection';
import InstitutionsOverview from '@/components/public/InstitutionsOverview';
import NewsPreview from '@/components/public/NewsPreview';
import DonationCTA from '@/components/public/DonationCTA';

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <MissionSection />
      <InstitutionsOverview />
      <NewsPreview />
      <DonationCTA />
    </PublicLayout>
  );
}
