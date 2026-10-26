import { useEffect, useState } from "react";
import { BookOpen, FileText, LoaderCircle, Plus, X } from "lucide-react";
import { getApiErrorMessage } from "../../api/authApi";
import {
  getMyStudyNotes,
  getSharedStudyNotes,
  shareStudyNote,
  type MyStudyNote,
  type SharedStudyNote,
} from "../../api/studyGroupApi";

export default function SharedNotesPanel({ groupId }: { groupId: string }) {
  const [sharedNotes, setSharedNotes] = useState<SharedStudyNote[]>([]);
  const [myNotes, setMyNotes] = useState<MyStudyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    setError(null);
    try {
      const notes = await getSharedStudyNotes(groupId);
      setSharedNotes(notes);
    } catch (loadError: unknown) {
      setError(
        getApiErrorMessage(loadError, "Could not load notes shared with this group."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setIsLoading(true);
      void getSharedStudyNotes(groupId)
        .then((notes) => {
          if (!cancelled) setSharedNotes(notes);
        })
        .catch((loadError: unknown) => {
          if (!cancelled) {
            setError(
              getApiErrorMessage(
                loadError,
                "Could not load notes shared with this group.",
              ),
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const openShareDialog = async () => {
    console.log('[SharedNotesPanel] Opening share dialog...');
    setError(null);
    setSearch("");
    setIsShareDialogOpen(true);
    try {
      console.log('[SharedNotesPanel] Fetching my study notes...');
      const notes = await getMyStudyNotes();
      console.log('[SharedNotesPanel] Received notes:', notes);
      console.log('[SharedNotesPanel] Notes count:', notes.length);
      setMyNotes(notes);
    } catch (loadError: unknown) {
      console.error('[SharedNotesPanel] Error loading notes:', loadError);
      setError(getApiErrorMessage(loadError, "Could not load your notes."));
    }
  };

  const handleShare = async (noteId: string) => {
    setIsSharing(true);
    setError(null);
    try {
      await shareStudyNote(groupId, noteId);
      setIsShareDialogOpen(false);
      await loadNotes();
    } catch (shareError: unknown) {
      setError(getApiErrorMessage(shareError, "Could not share this note."));
    } finally {
      setIsSharing(false);
    }
  };

  const filteredNotes = myNotes.filter((note) => {
    const text =
      `${note.curriculumCourse.course.title} ${note.curriculumCourse.courseCode} ${note.content}`.toLowerCase();
    return text.includes(search.trim().toLowerCase());
  });
  const sharedNoteIds = new Set(sharedNotes.map((item) => item.note.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-default px-4 py-3 sm:px-5">
        <div>
          <h3 className="font-medium text-primary">Shared notes</h3>
          <p className="text-xs text-secondary">
            Study notes shared by group members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void openShareDialog()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-inverse transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          Share a note
        </button>
      </header>

      {error && (
        <p role="alert" className="mx-4 mt-3 text-sm text-error sm:mx-5">
          {error}
        </p>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-secondary">
            <LoaderCircle size={19} className="mr-2 animate-spin" />
            Loading shared notes…
          </div>
        ) : sharedNotes.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <BookOpen size={25} className="mb-3 text-muted" />
            <p className="font-medium text-primary">No shared notes yet</p>
            <p className="mt-1 text-sm text-secondary">
              Share a note so everyone in the group can study from it.
            </p>
          </div>
        ) : (
          sharedNotes.map((shared) => {
            const title =
              shared.note.curriculumCourse?.course?.title ?? "Study note";
            const author =
              `${shared.sharedBy.firstName} ${shared.sharedBy.lastName}`.trim();
            return (
              <article
                key={shared.id}
                className="rounded-2xl border border-default bg-page p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elevated text-accent">
                      <FileText size={17} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="truncate font-medium text-primary">
                        {title}
                      </h4>
                      <p className="mt-0.5 text-xs text-secondary">
                        Shared by {author || "a group member"} ·{" "}
                        {new Date(shared.sharedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-elevated px-2 py-1 text-xs text-secondary">
                    {shared.note.curriculumCourse?.course?.title ?? "Note"}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-secondary">
                  {shared.note.content?.slice(0, 500) || "This note is empty."}
                  {(shared.note.content?.length ?? 0) > 500 ? "…" : ""}
                </p>
              </article>
            );
          })
        )}
      </div>

      {isShareDialogOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsShareDialogOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-group-note-title"
            className="flex max-h-[min(80vh,680px)] w-full max-w-lg flex-col rounded-3xl border border-default bg-surface p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="share-group-note-title"
                  className="font-serif text-xl text-primary"
                >
                  Share one of your notes
                </h3>
                <p className="mt-1 text-sm text-secondary">
                  Choose a note from one of your courses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareDialogOpen(false)}
                aria-label="Close note sharing"
                className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>
            <label htmlFor="group-note-search" className="sr-only">
              Search notes
            </label>
            <input
              id="group-note-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by course or note content"
              className="mt-4 w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
            />
            <div className="mt-4 min-h-32 flex-1 space-y-2 overflow-y-auto">
              {myNotes.length === 0 ? (
                <p className="py-8 text-center text-sm text-secondary">
                  No saved course notes are available to share.
                </p>
              ) : filteredNotes.length === 0 ? (
                <p className="py-8 text-center text-sm text-secondary">
                  No notes match your search.
                </p>
              ) : (
                filteredNotes.map((note) => {
                  const alreadyShared = sharedNoteIds.has(note.id);
                  return (
                    <article
                      key={note.id}
                      className="rounded-xl border border-default bg-page p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-medium text-primary">
                            {note.curriculumCourse.course.title}
                          </h4>
                          <p className="mt-0.5 text-xs text-secondary">
                            {note.curriculumCourse.courseCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleShare(note.id)}
                          disabled={alreadyShared || isSharing}
                          className="shrink-0 rounded-lg border border-default px-3 py-2 text-xs font-medium text-primary hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {alreadyShared
                            ? "Already shared"
                            : isSharing
                              ? "Sharing…"
                              : "Share"}
                        </button>
                      </div>
                      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-secondary">
                        {note.content}
                      </p>
                    </article>
                  );
                })
              )}
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-error">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
