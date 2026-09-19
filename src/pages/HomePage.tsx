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
import { InstagramFeed } from '../components/home/InstagramFeed';
import { TrustBanner } from '../components/home/TrustBanner';
import { useInventory } from '../context/InventoryContext';

export const HomePage: React.FC = () => {
  const { products } = useInventory();

  return (
    <div className="animate-fadeIn">
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

      {/* 10. Instagram Feed */}
      <InstagramFeed />

      {/* 11. Trust & Authenticity Banner */}
      <TrustBanner />
    </div>
  );
};
