import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, BookOpen, FileText, Loader2, Search as SearchIcon } from "lucide-react";
import { getCourses, type Course } from "../../api/Coursesapi";
import { getMaterials, type Material } from "../../api/Materialsapi";

interface SearchResultsModalProps {
  query: string;
  onClose: () => void;
}

export default function SearchResultsModal({ query, onClose }: SearchResultsModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setCourses([]);
      setMaterials([]);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Search courses
        const coursesData = await getCourses(query);
        setCourses(coursesData);

        // Search materials
        const materialsData = await getMaterials();
        const filteredMaterials = materialsData.filter(
          (m) =>
            m.fileName.toLowerCase().includes(query.toLowerCase()) ||
            m.courseName.toLowerCase().includes(query.toLowerCase())
        );
        setMaterials(filteredMaterials);
      } catch (err: any) {
        console.error("Search error:", err);
        setError(err?.response?.data?.message || "Search failed");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchData, 300); // Debounce
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = courses.length > 0 || materials.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-default rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-default">
          <div className="flex items-center gap-2">
            <SearchIcon size={18} className="text-accent" />
            <h3 className="font-serif text-lg text-primary">
              Search Results for "{query}"
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-primary hover:bg-elevated rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-secondary gap-2">
              <Loader2 size={24} className="animate-spin text-accent" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-[#FDF2F2] border border-[#E5C3C3] rounded-xl text-xs text-[#8A3A3A]">
              {error}
            </div>
          ) : !hasResults ? (
            <div className="text-center py-12">
              <SearchIcon size={32} className="mx-auto text-muted mb-2" />
              <p className="text-sm font-medium text-primary">No results found</p>
              <p className="text-xs text-secondary mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Courses */}
              {courses.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-secondary mb-3 uppercase tracking-wide">
                    Courses ({courses.length})
                  </h4>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <Link
                        key={course.id}
                        to="/app/courses"
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 bg-surface-hover border border-default rounded-xl hover:border-accent transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-elevated group-hover:bg-accent/10 flex items-center justify-center shrink-0 transition-colors">
                          <BookOpen size={18} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate group-hover:text-accent transition-colors">
                            {course.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted font-mono">{course.code}</p>
                            {course.pdfCount > 0 && (
                              <span className="text-xs text-secondary">
                                • {course.pdfCount} PDF{course.pdfCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {materials.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-secondary mb-3 uppercase tracking-wide">
                    Materials ({materials.length})
                  </h4>
                  <div className="space-y-2">
                    {materials.slice(0, 10).map((material) => (
                      <Link
                        key={material.id}
                        to={`/app/workspace/${material.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 bg-surface-hover border border-default rounded-xl hover:border-accent transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-elevated group-hover:bg-accent/10 flex items-center justify-center shrink-0 transition-colors">
                          <FileText size={18} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate group-hover:text-accent transition-colors">
                            {material.fileName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-secondary truncate">{material.courseName}</p>
                            <span className="text-xs text-muted">• {material.progress}%</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {materials.length > 10 && (
                      <p className="text-xs text-center text-secondary py-2">
                        + {materials.length - 10} more materials
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
