import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import SearchResultsModal from "../components/common/SearchResultsModal";
import StudySessionWidget from "../components/StudySessionWidget";
import { StudySessionProvider } from "../hooks/StudySessionProvider";

export default function DashboardLayout() {
  return (
    <StudySessionProvider>
      <DashboardContent />
    </StudySessionProvider>
  );
}

function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.trim().length > 0);
  };

  const handleCloseSearch = () => {
    setShowSearchResults(false);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex bg-page">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onSearch={handleSearch} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Search Results Modal */}
      {showSearchResults && (
        <SearchResultsModal query={searchQuery} onClose={handleCloseSearch} />
      )}
      <StudySessionWidget />
    </div>
  );
}
