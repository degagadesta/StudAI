import { useAuthContext } from "../contexts/AuthContext";
import { LogOut, BookOpen, FileText, MessageSquare, GraduationCap } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#F6F1E3]">
      {/* Header */}
      <header className="bg-[#253D31] text-[#F6F1E3] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-8 h-8 text-[#C7D3B9]" />
            <h1 className="text-2xl font-serif tracking-wide">
              Stud<span className="text-[#C7D3B9]">AI</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-[#C7D3B9]">Welcome back,</p>
              <p className="font-semibold">{user?.firstName || "Student"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#253D31] mb-2">Dashboard</h2>
          <p className="text-gray-600">Your AI-powered learning companion</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Courses"
            value="0"
            color="bg-blue-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Materials"
            value="0"
            color="bg-green-500"
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Chats"
            value="0"
            color="bg-purple-500"
          />
          <StatCard
            icon={<GraduationCap className="w-6 h-6" />}
            title="Exams"
            value="0"
            color="bg-orange-500"
          />
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-[#253D31]/10">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#253D31] flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-[#C7D3B9]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#253D31] mb-2">
                Welcome to StudAI! 🎓
              </h3>
              <p className="text-gray-600 mb-4">
                Your intelligent study companion is ready to help you succeed. Here's what you can do:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B4513] rounded-full"></span>
                  <span>Upload and organize your course materials</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B4513] rounded-full"></span>
                  <span>Chat with AI to understand complex topics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B4513] rounded-full"></span>
                  <span>Practice with AI-generated quizzes and exams</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#8B4513] rounded-full"></span>
                  <span>Track your progress and identify weak areas</span>
                </li>
              </ul>
              <div className="mt-6">
                <button className="bg-[#253D31] hover:bg-[#1a2b21] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Course Management"
            description="Organize your courses, materials, and study resources in one place."
            status="Coming Soon"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="AI Tutor Chat"
            description="Get instant help with your questions using our AI-powered tutor."
            status="Coming Soon"
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Smart Flashcards"
            description="AI-generated flashcards with spaced repetition learning."
            status="Coming Soon"
          />
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-[#253D31]/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-[#253D31]">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
}

function FeatureCard({ icon, title, description, status }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-[#253D31]/10 hover:shadow-lg transition-shadow">
      <div className="text-[#253D31] mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#253D31] mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <span className="inline-block bg-[#C7D3B9] text-[#253D31] px-3 py-1 rounded-full text-sm font-semibold">
        {status}
      </span>
    </div>
  );
}
