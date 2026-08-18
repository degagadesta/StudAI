import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSection from "./components/ProblemSection";
import AITutorSection from "./components/AITutorSection";
import BentoFeatures from "./components/BentoFeatures";
import ExamIntelligence from "./components/ExamIntelligence";
import StudyLoop from "./components/StudyLoop";
import CourseWorkspace from "./components/CourseWorkspace";
import PersonalizedSection from "./components/PersonalizedSection";
import EthiopianUniSection from "./components/EthiopianUniSection";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

function App() {
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

export default App;
