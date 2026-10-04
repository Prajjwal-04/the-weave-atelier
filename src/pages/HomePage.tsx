import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { BrandStatement } from '../components/home/BrandStatement';
import { FeaturedCollection } from '../components/home/FeaturedCollection';
import { ShopByCollection } from '../components/home/ShopByCollection';
import { CraftsmanshipSection } from '../components/home/CraftsmanshipSection';
import { BhadohiNarrative } from '../components/home/BhadohiNarrative';
import { MaterialsSection } from '../components/home/MaterialsSection';
import { CustomRugsPreview } from '../components/home/CustomRugsPreview';
import { EditorialJournalPreview } from '../components/home/EditorialJournalPreview';
import { TrustBanner } from '../components/home/TrustBanner';
import { useInventory } from '../context/InventoryContext';
import { SEO } from '../components/common/SEO';

export const HomePage: React.FC = () => {
  const { products } = useInventory();

  return (
    <div className="animate-fadeIn">
      <SEO
        title="PRASRI RUGS — Contemporary Handmade Rugs from Bhadohi, India"
        description="Contemporary rugs, rooted in Indian craftsmanship. Handcrafted slowly in Bhadohi, India for discerning architectural spaces worldwide. Ready-to-ship collections and bespoke custom sizing."
        canonicalPath="/"
      />
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Brand Statement */}
      <BrandStatement />

      {/* 3. Featured Collection */}
      <FeaturedCollection products={products} />

      {/* 4. Shop by Collection */}
      <ShopByCollection />

      {/* 5. Craftsmanship Section */}
      <CraftsmanshipSection />

      {/* 6. From Bhadohi Story */}
      <BhadohiNarrative />

      {/* 7. Materials Section */}
      <MaterialsSection />

      {/* 8. Custom Rugs Section */}
      <CustomRugsPreview />

      {/* 9. Editorial / Journal */}
      <EditorialJournalPreview />

      {/* 10. Trust & Authenticity Banner */}
      <TrustBanner />
    </div>
  );
};
