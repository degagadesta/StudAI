import Navbar from "../landingpage/src/components/Navbar";
import Hero from "../landingpage/src/components/Hero";
import ProblemSection from "../landingpage/src/components/ProblemSection";
import AITutorSection from "../landingpage/src/components/AITutorSection";
import BentoFeatures from "../landingpage/src/components/BentoFeatures";
import ExamIntelligence from "../landingpage/src/components/ExamIntelligence";
import StudyLoop from "../landingpage/src/components/StudyLoop";
import CourseWorkspace from "../landingpage/src/components/CourseWorkspace";
import PersonalizedSection from "../landingpage/src/components/PersonalizedSection";
import EthiopianUniSection from "../landingpage/src/components/EthiopianUniSection";
import Testimonials from "../landingpage/src/components/Testimonials";
import Pricing from "../landingpage/src/components/Pricing";
import CTA from "../landingpage/src/components/CTA";
import Footer from "../landingpage/src/components/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text overflow-hidden selection:bg-brand-primary/30 selection:text-brand-text">
      {/* Universal Floating Navbar */}
      <Navbar />

      {/* Hero Header & Core Dashboard Mockups */}
      <Hero />

      {/* Problem Section (Chaotic storage vs unified StudAI) */}
      <ProblemSection />

      {/* AI Tutor Section (Citations and custom queries) */}
      <AITutorSection />

      {/* Bento Grid Features Grid */}
      <BentoFeatures />

      {/* Exam Intelligence Dashboard */}
      <ExamIntelligence />

      {/* Flow loops */}
      <StudyLoop />

      {/* Specific Course Workspace previews */}
      <CourseWorkspace />

      {/* Weakness analysis & Study Planner timers */}
      <PersonalizedSection />

      {/* Regional curriculum context & hierarchy flow */}
      <EthiopianUniSection />

      {/* Student Feedback Reviews */}
      <Testimonials />

      {/* Monthly/Annual packaging Toggle comparisons */}
      <Pricing />

      {/* Final dramatic CTA */}
      <CTA />

      {/* Footnote details */}
      <Footer />
    </div>
  );
}
