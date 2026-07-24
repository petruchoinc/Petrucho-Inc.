import Hero from '@/components/sections/Hero';
import Manifesto from '@/components/sections/Manifesto';
import PortfolioGallery from '@/components/sections/PortfolioGallery';
import Marketplace from '@/components/sections/Marketplace';
import Pricing from '@/components/sections/Pricing';
import ResourceCoordinates from '@/components/sections/ResourceCoordinates';

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <PortfolioGallery />
      <Marketplace />
      <Pricing />
      <ResourceCoordinates />
    </main>
  );
}