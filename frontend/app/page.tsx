import { Hero } from "@/components/home/Hero";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { PlacementPartners } from "@/components/sections/PlacementPartners";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      <Hero />
      <WhyChooseSection />
      <PricingSection />
      <CTASection />
      <Testimonials />
      <PlacementPartners />
    </div>
  );
}
