// components/analytics/MaterialsProgressTable.tsx
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MaterialProgressRow } from "../../api/AnalyticsApi";

export default function MaterialsProgressTable({
  rows,
  page,
  totalPages,
  onPageChange,
}: {
  rows: MaterialProgressRow[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-default rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-serif text-lg text-primary">
            Uploaded materials
          </p>
          <p className="text-xs text-secondary mt-0.5">
            Progress across every PDF you've uploaded
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-secondary">No materials uploaded yet.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide">
                <th className="pb-2.5 font-medium w-10">#</th>
                <th className="pb-2.5 font-medium">File name</th>
                <th className="pb-2.5 font-medium">Uploaded</th>
                <th className="pb-2.5 font-medium">Progress</th>
                <th className="pb-2.5 font-medium text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-t border-[#EFE8D4]">
                  <td className="py-2.5 text-muted font-mono text-xs">
                    {(page - 1) * rows.length + i + 1}
                  </td>
                  <td className="py-2.5 text-primary font-medium truncate max-w-[220px]">
                    {row.fileName}
                  </td>
                  <td className="py-2.5 text-secondary">
                    {new Date(row.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-[#DCD2B4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-secondary"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-secondary">
                        {row.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(row.workspacePath)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-accent-light text-accent transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-1.5 mt-5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono transition-colors ${
                    p === page
                      ? "bg-accent text-inverse"
                      : "text-secondary hover:bg-surface-hover"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
