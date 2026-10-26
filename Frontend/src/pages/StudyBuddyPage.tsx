import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Plus,
  Settings,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { getCourses, type Course } from "../api/Coursesapi";
import { getApiErrorMessage } from "../api/authApi";
import { useAuthContext } from "../contexts/AuthContext";
import { useSocketContext } from "../contexts/SocketContext";
import { socketService } from "../services/socketService";
import GroupSettingsModal from "../components/StudyGroups/GroupSettingsModal";
import SharedNotesPanel from "../components/StudyGroups/SharedNotesPanel";
import {
  createStudyGroup,
  deleteStudyGroup,
  getMyStudyGroups,
  getStudyGroup,
  getStudyGroupMessages,
  joinStudyGroup,
  leaveStudyGroup,
  removeStudyGroupMember,
  updateStudyGroupMemberRole,
  type StudyGroup,
  type StudyGroupMessage,
} from "../api/studyGroupApi";

type DialogMode = "create" | "join" | null;
type GroupTab = "chat" | "notes";

interface TypingEvent {
  groupId: string;
  studentId: string;
  name: string;
  isTyping: boolean;
}

function isStudyGroupMessage(value: unknown): value is StudyGroupMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<StudyGroupMessage>;
  return (
    typeof message.id === "string" &&
    typeof message.studyGroupId === "string" &&
    typeof message.content === "string" &&
    typeof message.senderId === "string" &&
    typeof message.createdAt === "string" &&
    Boolean(message.sender)
  );
}

function formatMessageTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function StudyBuddyPage() {
  const { user } = useAuthContext();
  const { isConnected } = useSocketContext();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<StudyGroup | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<StudyGroupMessage[]>([]);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeGroupTab, setActiveGroupTab] = useState<GroupTab>("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshGroups = useCallback(async (selectGroupId?: string) => {
    setIsLoadingGroups(true);
    setIsLoadingGroup(true);
    setIsLoadingMessages(true);
    setError(null);
    try {
      const nextGroups = await getMyStudyGroups();
      setGroups(nextGroups);
      setActiveGroupId((currentGroupId) => {
        return (
          selectGroupId ??
          (currentGroupId &&
          nextGroups.some((group) => group.id === currentGroupId)
            ? currentGroupId
            : nextGroups[0]?.id ?? null)
        );
      });
    } catch (loadError: unknown) {
      setError(getApiErrorMessage(loadError, "Could not load your study groups."));
      setIsLoadingGroup(false);
      setIsLoadingMessages(false);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  const handleGroupUpdated = (updatedGroup: StudyGroup) => {
    setActiveGroup(updatedGroup);
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === updatedGroup.id ? { ...group, ...updatedGroup } : group,
      ),
    );
  };

  useEffect(() => {
    void Promise.resolve().then(() => refreshGroups());
  }, [refreshGroups]);

  useEffect(() => {
    if (dialogMode !== "create") return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setIsLoadingCourses(true);
      setCoursesError(null);

      return getCourses()
        .then((coursesData) => {
          if (!cancelled) setCourses(coursesData);
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setCoursesError(
              getApiErrorMessage(error, "Could not load your courses."),
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingCourses(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [dialogMode]);

  useEffect(() => {
    if (!activeGroupId) return;

    let cancelled = false;

    Promise.all([
      getStudyGroup(activeGroupId),
      getStudyGroupMessages(activeGroupId),
    ])
      .then(([group, groupMessages]) => {
        if (cancelled) return;
        setActiveGroup(group);
        setMessages((currentMessages) => {
          const merged = new Map(
            groupMessages.map((message) => [message.id, message]),
          );
          currentMessages
            .filter((message) => message.studyGroupId === activeGroupId)
            .forEach((message) => merged.set(message.id, message));
          return Array.from(merged.values()).sort(
            (first, second) =>
              new Date(first.createdAt).getTime() -
              new Date(second.createdAt).getTime(),
          );
        });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "Could not open this study group."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingGroup(false);
          setIsLoadingMessages(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeGroupId]);

  useEffect(() => {
    if (!isConnected || !activeGroupId) return;

    const handleNewMessage = (...args: unknown[]) => {
      const [payload] = args;
      if (
        !isStudyGroupMessage(payload) ||
        payload.studyGroupId !== activeGroupId
      ) {
        return;
      }
      setMessages((current) =>
        current.some((message) => message.id === payload.id)
          ? current
          : [...current, payload],
      );
    };

    const handleTyping = (...args: unknown[]) => {
      const [payload] = args;
      if (
        !payload ||
        typeof payload !== "object" ||
        (payload as TypingEvent).groupId !== activeGroupId
      ) {
        return;
      }
      const typingEvent = payload as TypingEvent;
      setTypingNames((current) =>
        typingEvent.isTyping
          ? current.includes(typingEvent.name)
            ? current
            : [...current, typingEvent.name]
          : current.filter((name) => name !== typingEvent.name),
      );
    };

    const handleMemberChange = (...args: unknown[]) => {
      const [payload] = args;
      if (
        payload &&
        typeof payload === "object" &&
        (payload as { groupId?: string }).groupId === activeGroupId
      ) {
        void getStudyGroup(activeGroupId)
          .then(setActiveGroup)
          .catch((loadError: unknown) => {
            setError(
              getApiErrorMessage(loadError, "Could not refresh group members."),
            );
          });
      }
    };

    const handleSocketError = (...args: unknown[]) => {
      const [payload] = args;
      if (payload && typeof payload === "object") {
        const message = (payload as { message?: unknown }).message;
        if (typeof message === "string") setError(message);
      }
    };

    socketService.on("group:new-message", handleNewMessage);
    socketService.on("group:member-typing", handleTyping);
    socketService.on("group:member-joined", handleMemberChange);
    socketService.on("group:member-left", handleMemberChange);
    socketService.on("error", handleSocketError);
    socketService.emit("join:group", activeGroupId);

    return () => {
      socketService.emit("leave:group", activeGroupId);
      socketService.off("group:new-message", handleNewMessage);
      socketService.off("group:member-typing", handleTyping);
      socketService.off("group:member-joined", handleMemberChange);
      socketService.off("group:member-left", handleMemberChange);
      socketService.off("error", handleSocketError);
    };
  }, [activeGroupId, isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    },
    [],
  );

  const closeDialog = () => {
    setDialogMode(null);
    setDialogError(null);
    setCopyError(null);
    setIsCodeCopied(false);
  };

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("groupName") ?? "").trim();
    const subject = String(formData.get("groupSubject") ?? "").trim();
    const courseId = String(formData.get("courseId") ?? "").trim();
    
    console.log('=== CREATE GROUP DEBUG ===');
    console.log('Raw courseId from form:', courseId);
    console.log('courseId type:', typeof courseId);
    console.log('courseId length:', courseId.length);
    console.log('Is empty:', courseId === "");
    
    // Only include curriculumCourseId if a valid course was selected (not empty string)
    const curriculumCourseId = courseId && courseId !== "" ? courseId : null;
    
    console.log('Processed curriculumCourseId:', curriculumCourseId);
    console.log('curriculumCourseId type:', typeof curriculumCourseId);
    
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const payload: { name: string; subject?: string; curriculumCourseId?: string | null } = {
        name,
      };
      
      if (subject) {
        payload.subject = subject;
      }
      
      if (curriculumCourseId) {
        payload.curriculumCourseId = curriculumCourseId;
      }
      
      console.log('Final payload:', JSON.stringify(payload, null, 2));
      
      const newGroup = await createStudyGroup(payload);
      await refreshGroups(newGroup.id);
      closeDialog();
      setIsDetailsOpen(true);
    } catch (submitError: unknown) {
      console.error('Create group error:', submitError);
      setDialogError(
        getApiErrorMessage(submitError, "Could not create the study group."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inviteCode = String(formData.get("inviteCode") ?? "")
      .trim()
      .toUpperCase();
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const joinedGroup = await joinStudyGroup(inviteCode);
      await refreshGroups(joinedGroup.id);
      closeDialog();
      setIsDetailsOpen(true);
    } catch (submitError: unknown) {
      setDialogError(
        getApiErrorMessage(submitError, "Could not join with that invite code."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectGroup = (groupId: string) => {
    if (groupId === activeGroupId) {
      setIsDetailsOpen(false);
      return;
    }
    setError(null);
    setIsLoadingGroup(true);
    setIsLoadingMessages(true);
    setIsCodeCopied(false);
    setCopyError(null);
    setTypingNames([]);
    setActiveGroupTab("chat");
    setActiveGroupId(groupId);
    setIsDetailsOpen(false);
  };

  const handleCopyCode = async (inviteCode: string) => {
    setCopyError(null);
    setIsCodeCopied(false);
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCodeCopied(true);
    } catch {
      setCopyError("Could not copy the code. Please copy it manually.");
    }
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !activeGroupId) return;
    if (!socketService.isConnected()) {
      setError("You are offline. Reconnect to send a message.");
      return;
    }
    socketService.emit("group:message", {
      groupId: activeGroupId,
      content,
      type: "TEXT",
    });
    socketService.emit("group:typing", {
      groupId: activeGroupId,
      isTyping: false,
    });
    setDraft("");
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!activeGroupId || !socketService.isConnected()) return;
    socketService.emit("group:typing", {
      groupId: activeGroupId,
      isTyping: true,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit("group:typing", {
        groupId: activeGroupId,
        isTyping: false,
      });
    }, 3000);
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup || activeGroup.createdById === user?.id) {
      setError("The group creator must delete the group instead of leaving.");
      return;
    }
    if (!window.confirm(`Leave "${activeGroup.name}"?`)) return;
    setError(null);
    try {
      await leaveStudyGroup(activeGroup.id);
      setActiveGroupId(null);
      await refreshGroups();
    } catch (leaveError: unknown) {
      setError(getApiErrorMessage(leaveError, "Could not leave this group."));
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup || activeGroup.createdById !== user?.id) return;
    if (!window.confirm(`Delete "${activeGroup.name}" and its messages?`)) return;
    setError(null);
    try {
      await deleteStudyGroup(activeGroup.id);
      setActiveGroupId(null);
      await refreshGroups();
    } catch (deleteError: unknown) {
      setError(getApiErrorMessage(deleteError, "Could not delete this group."));
    }
  };

  const handleUpdateRole = async (
    memberId: string,
    role: "ADMIN" | "MEMBER",
  ) => {
    if (!activeGroup) return;
    setError(null);
    try {
      await updateStudyGroupMemberRole(activeGroup.id, memberId, role);
      setActiveGroup(await getStudyGroup(activeGroup.id));
    } catch (roleError: unknown) {
      setError(getApiErrorMessage(roleError, "Could not update member role."));
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!activeGroup || !window.confirm(`Remove ${memberName} from this group?`))
      return;
    setError(null);
    try {
      await removeStudyGroupMember(activeGroup.id, memberId);
      setActiveGroup(await getStudyGroup(activeGroup.id));
    } catch (removeError: unknown) {
      setError(getApiErrorMessage(removeError, "Could not remove this member."));
    }
  };

  const currentMember = activeGroup?.members?.find(
    (member) => member.studentId === user?.id,
  );
  const isAdmin =
    currentMember?.role === "ADMIN" || activeGroup?.createdById === user?.id;

  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-accent">Study together</p>
          <h1 className="mt-1 font-serif text-3xl text-primary">Study Buddy</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">
            Create a group, invite classmates, and study together in real time.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setDialogError(null);
              setDialogMode("join");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-elevated"
          >
            <UserPlus size={17} />
            Join a group
          </button>
          <button
            type="button"
            onClick={() => {
              setDialogError(null);
              setDialogMode("create");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-inverse transition-colors hover:opacity-90"
          >
            <Plus size={17} />
            Create a group
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
        >
          <span>{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError(null)}
            className="shrink-0 rounded p-0.5 hover:bg-error/10"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isLoadingGroups ? (
        <div className="flex min-h-64 items-center justify-center text-secondary">
          <LoaderCircle size={22} className="mr-2 animate-spin" />
          Loading your study groups…
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-3xl border border-default bg-surface p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated text-accent">
            <UsersRound size={26} strokeWidth={1.8} />
          </div>
          <h2 className="font-serif text-xl text-primary">
            Find your study partners
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
            Create a group for your next study session or join one with an invite
            code from a classmate.
          </p>
        </div>
      ) : (
        <div className="grid min-h-[560px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-default bg-surface p-3">
            <h2 className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Your groups ({groups.length})
            </h2>
            <div className="space-y-1">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    selectGroup(group.id);
                  }}
                  className={`w-full rounded-xl p-3 text-left transition-colors ${
                    activeGroupId === group.id
                      ? "bg-elevated"
                      : "hover:bg-elevated/60"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium text-primary">
                    <UsersRound size={17} className="shrink-0 text-accent" />
                    <span className="truncate">{group.name}</span>
                  </span>
                  <span className="mt-1 block truncate pl-6 text-xs text-secondary">
                    {group.subject || "Study group"}
                  </span>
                  <span className="mt-1 block pl-6 text-xs text-muted">
                    {group._count?.members ?? 1}{" "}
                    {(group._count?.members ?? 1) === 1 ? "member" : "members"}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-default bg-surface">
            {activeGroup && activeGroup.id === activeGroupId ? (
              <>
                <header className="flex items-center justify-between gap-3 border-b border-default px-4 py-3 sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDetailsOpen((open) => !open)}
                      className="rounded-lg p-2 text-secondary transition-colors hover:bg-elevated hover:text-primary lg:hidden"
                      aria-label="Toggle group details"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-lg text-primary">
                        {activeGroup.name}
                      </h2>
                      <p className="truncate text-xs text-secondary">
                        {activeGroup.subject || "Study group"} ·{" "}
                        {activeGroup._count?.members ??
                          activeGroup.members?.length ??
                          1}{" "}
                        members
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`hidden items-center gap-1.5 text-xs sm:inline-flex ${
                        isConnected ? "text-accent" : "text-muted"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isConnected ? "bg-accent" : "bg-muted"
                        }`}
                      />
                      {isConnected ? "Live" : "Offline"}
                    </span>
                    {activeGroup.createdById === user?.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsSettingsOpen(true)}
                          className="rounded-lg p-2 text-secondary transition-colors hover:bg-elevated hover:text-primary"
                          aria-label="Group settings"
                          title="Group settings"
                        >
                          <Settings size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteGroup()}
                          className="rounded-lg p-2 text-secondary transition-colors hover:bg-error/10 hover:text-error"
                          aria-label="Delete group"
                          title="Delete group"
                        >
                          <Trash2 size={17} />
                        </button>
                      </>
                    ) : isAdmin ? (
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(true)}
                        className="rounded-lg p-2 text-secondary transition-colors hover:bg-elevated hover:text-primary"
                        aria-label="Group settings"
                        title="Group settings"
                      >
                        <Settings size={17} />
                      </button>
                    ) : isLoadingGroup ? (
                      <div className="flex flex-1 items-center justify-center text-sm text-secondary">
                        <LoaderCircle size={19} className="mr-2 animate-spin" />
                        Opening study group…
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleLeaveGroup()}
                        className="rounded-lg p-2 text-secondary transition-colors hover:bg-error/10 hover:text-error"
                        aria-label="Leave group"
                        title="Leave group"
                      >
                        <LogOut size={17} />
                      </button>
                    )}
                  </div>
                </header>

                <div className="flex flex-1 flex-col">
                  {isDetailsOpen ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:hidden">
                      <div className="mb-5 rounded-xl border border-default bg-page p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Invite code
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <code className="font-mono text-xl font-semibold tracking-[0.2em] text-primary">
                            {activeGroup.inviteCode}
                          </code>
                          <button
                            type="button"
                            onClick={() =>
                              void handleCopyCode(activeGroup.inviteCode)
                            }
                            aria-label="Copy invite code"
                            className="rounded-lg p-2 text-secondary transition-colors hover:bg-elevated hover:text-primary"
                          >
                            {isCodeCopied ? (
                              <Check size={17} />
                            ) : (
                              <Copy size={17} />
                            )}
                          </button>
                        </div>
                        {copyError && (
                          <p role="alert" className="mt-2 text-xs text-error">
                            {copyError}
                          </p>
                        )}
                      </div>
                      <MembersPanel
                        group={activeGroup}
                        currentUserId={user?.id}
                        isAdmin={isAdmin}
                        canUpdateRoles={activeGroup.createdById === user?.id}
                        onUpdateRole={handleUpdateRole}
                        onRemoveMember={handleRemoveMember}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-default px-4 py-2 sm:px-5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveGroupTab("chat")}
                            aria-pressed={activeGroupTab === "chat"}
                            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium ${
                              activeGroupTab === "chat"
                                ? "bg-elevated text-primary"
                                : "text-secondary hover:text-primary"
                            }`}
                          >
                            <MessageCircle size={16} className="text-accent" />
                            Chat
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveGroupTab("notes")}
                            aria-pressed={activeGroupTab === "notes"}
                            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium ${
                              activeGroupTab === "notes"
                                ? "bg-elevated text-primary"
                                : "text-secondary hover:text-primary"
                            }`}
                          >
                            <BookOpen size={16} className="text-accent" />
                            Shared notes
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsDetailsOpen(true)}
                          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-elevated hover:text-primary"
                        >
                          <UsersRound size={15} />
                          Members and invite
                        </button>
                      </div>
                      {activeGroupTab === "chat" ? (
                        <>
                      <div
                        className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5"
                        aria-live="polite"
                        aria-label="Group messages"
                      >
                        {isLoadingMessages ? (
                          <div className="flex h-full min-h-48 items-center justify-center text-sm text-secondary">
                            <LoaderCircle
                              size={19}
                              className="mr-2 animate-spin"
                            />
                            Loading messages…
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                            <MessageCircle
                              size={25}
                              className="mb-3 text-muted"
                            />
                            <p className="font-medium text-primary">
                              Start the conversation
                            </p>
                            <p className="mt-1 text-sm text-secondary">
                              Send a message to your study group.
                            </p>
                          </div>
                        ) : (
                          messages.map((message) => {
                            const isOwnMessage = message.senderId === user?.id;
                            const senderName =
                              `${message.sender.firstName} ${message.sender.lastName}`.trim();
                            return (
                              <div
                                key={message.id}
                                className={`flex ${
                                  isOwnMessage ? "justify-end" : "justify-start"
                                }`}
                              >
                                <article
                                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                                    isOwnMessage
                                      ? "rounded-br-md bg-accent text-inverse"
                                      : "rounded-bl-md bg-elevated text-primary"
                                  }`}
                                >
                                  {!isOwnMessage && (
                                    <p className="mb-1 text-xs font-semibold text-accent">
                                      {senderName || "Group member"}
                                    </p>
                                  )}
                                  <p className="whitespace-pre-wrap break-words text-sm leading-5">
                                    {message.content}
                                  </p>
                                  <time
                                    dateTime={message.createdAt}
                                    className={`mt-1 block text-right text-[10px] ${
                                      isOwnMessage
                                        ? "text-inverse/70"
                                        : "text-muted"
                                    }`}
                                  >
                                    {formatMessageTime(message.createdAt)}
                                  </time>
                                </article>
                              </div>
                            );
                          })
                        )}
                        {typingNames.length > 0 && (
                          <p className="text-xs italic text-secondary">
                            {typingNames.join(", ")}{" "}
                            {typingNames.length === 1 ? "is" : "are"} typing…
                          </p>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      <form
                        onSubmit={handleSendMessage}
                        className="flex items-end gap-2 border-t border-default p-3 sm:p-4"
                      >
                        <label className="sr-only" htmlFor="group-message">
                          Message
                        </label>
                        <textarea
                          id="group-message"
                          value={draft}
                          onChange={(event) =>
                            handleDraftChange(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              event.currentTarget.form?.requestSubmit();
                            }
                          }}
                          maxLength={2000}
                          rows={1}
                          placeholder="Message your group…"
                          className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
                        />
                        <button
                          type="submit"
                          disabled={!draft.trim() || !isConnected}
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Send message"
                          title={
                            isConnected
                              ? "Send message"
                              : "Connect to send messages"
                          }
                        >
                          <Send size={17} />
                        </button>
                      </form>
                        </>
                      ) : (
                        <SharedNotesPanel
                          key={activeGroup.id}
                          groupId={activeGroup.id}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <BookOpen size={28} className="mb-3 text-muted" />
                <h2 className="font-serif text-lg text-primary">
                  Select a study group
                </h2>
                <p className="mt-1 text-sm text-secondary">
                  Choose a group from the list to open its chat.
                </p>
              </div>
            )}
          </main>
          {activeGroup && activeGroup.id === activeGroupId && (
            <aside className="hidden rounded-2xl border border-default bg-surface p-4 lg:block">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-primary">
                  Invite classmates
                </h3>
                <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-default bg-page px-3 py-2.5">
                  <code className="truncate font-mono text-sm font-semibold tracking-[0.15em] text-primary">
                    {activeGroup.inviteCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => void handleCopyCode(activeGroup.inviteCode)}
                    className="shrink-0 rounded-lg p-1.5 text-secondary transition-colors hover:bg-elevated hover:text-primary"
                    aria-label="Copy invite code"
                  >
                    {isCodeCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Share this code to invite others.
                </p>
                {copyError && (
                  <p role="alert" className="mt-2 text-xs text-error">
                    {copyError}
                  </p>
                )}
              </div>
              <MembersPanel
                group={activeGroup}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                canUpdateRoles={activeGroup.createdById === user?.id}
                onUpdateRole={handleUpdateRole}
                onRemoveMember={handleRemoveMember}
              />
            </aside>
          )}
        </div>
      )}

      {dialogMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="study-group-dialog-title"
            className="w-full max-w-md rounded-3xl border border-default bg-surface p-6 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="study-group-dialog-title"
                  className="font-serif text-2xl text-primary"
                >
                  {dialogMode === "create"
                    ? "Create a study group"
                    : "Join a study group"}
                </h2>
                <p className="mt-1 text-sm text-secondary">
                  {dialogMode === "create"
                    ? "Choose a name and invite classmates to join."
                    : "Enter the invite code shared by a classmate."}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={closeDialog}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-elevated hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {dialogMode === "create" ? (
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label
                    htmlFor="groupName"
                    className="mb-1.5 block text-sm font-medium text-primary"
                  >
                    Group name
                  </label>
                  <input
                    id="groupName"
                    name="groupName"
                    type="text"
                    required
                    minLength={3}
                    maxLength={100}
                    autoFocus
                    placeholder="e.g. Biology study group"
                    className="w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="groupSubject"
                    className="mb-1.5 block text-sm font-medium text-primary"
                  >
                    Subject
                    <span className="ml-1 font-normal text-muted">Optional</span>
                  </label>
                  <input
                    id="groupSubject"
                    name="groupSubject"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Biology"
                    className="w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="groupCourse"
                    className="mb-1.5 block text-sm font-medium text-primary"
                  >
                    Associated course
                    <span className="ml-1 font-normal text-muted">Optional</span>
                  </label>
                  <select
                    id="groupCourse"
                    name="courseId"
                    disabled={isLoadingCourses}
                    defaultValue=""
                    className="w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {isLoadingCourses
                        ? "Loading courses…"
                        : courses.length > 0
                          ? "No associated course"
                          : "No courses available"}
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code ? `${course.code} — ` : ""}
                        {course.name}
                      </option>
                    ))}
                  </select>
                  {coursesError && (
                    <p role="alert" className="mt-2 text-sm text-error">
                      {coursesError}
                    </p>
                  )}
                </div>
                {dialogError && (
                  <p role="alert" className="text-sm text-error">
                    {dialogError}
                  </p>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-elevated"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingCourses}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-inverse transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && (
                      <LoaderCircle size={16} className="animate-spin" />
                    )}
                    Create group
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label
                    htmlFor="inviteCode"
                    className="mb-1.5 block text-sm font-medium text-primary"
                  >
                    Invite code
                  </label>
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    required
                    minLength={8}
                    maxLength={8}
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoFocus
                    placeholder="8-character code"
                    className="w-full rounded-xl border border-default bg-page px-3.5 py-3 font-mono text-sm uppercase tracking-[0.15em] text-primary outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-muted focus:border-accent"
                  />
                </div>
                {dialogError && (
                  <p role="alert" className="text-sm text-error">
                    {dialogError}
                  </p>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-elevated"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-inverse transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && (
                      <LoaderCircle size={16} className="animate-spin" />
                    )}
                    Join group
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
      {isSettingsOpen && activeGroup && (
        <GroupSettingsModal
          group={activeGroup}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleGroupUpdated}
        />
      )}
    </section>
  );
}

function MembersPanel({
  group,
  currentUserId,
  isAdmin,
  canUpdateRoles,
  onUpdateRole,
  onRemoveMember,
}: {
  group: StudyGroup;
  currentUserId?: string;
  isAdmin: boolean;
  canUpdateRoles: boolean;
  onUpdateRole: (memberId: string, role: "ADMIN" | "MEMBER") => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <UsersRound size={16} className="text-accent" />
        Members ({group.members?.length ?? group._count?.members ?? 0})
      </h3>
      {group.members?.length ? (
        <ul className="space-y-2">
          {group.members.map((member) => {
            const memberName =
              `${member.student.firstName} ${member.student.lastName}`.trim();
            const isCreator = member.studentId === group.createdById;
            const isCurrentUser = member.studentId === currentUserId;
            return (
              <li
                key={member.id}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-elevated/60"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-accent">
                    {member.student.firstName.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-primary">
                      {memberName || "Group member"}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs font-normal text-muted">
                          (you)
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-secondary">
                      {member.role === "ADMIN" && (
                        <ShieldCheck size={12} className="text-accent" />
                      )}
                      {member.role === "ADMIN" ? "Admin" : "Member"}
                    </span>
                  </span>
                </div>
                {isAdmin && !isCurrentUser && !isCreator && (
                  <div className="flex shrink-0 items-center">
                    {canUpdateRoles && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateRole(
                            member.studentId,
                            member.role === "ADMIN" ? "MEMBER" : "ADMIN",
                          )
                        }
                        className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-page hover:text-primary"
                        title={
                          member.role === "ADMIN"
                            ? "Remove admin role"
                            : "Make admin"
                        }
                        aria-label={
                          member.role === "ADMIN"
                            ? `Remove admin role from ${memberName}`
                            : `Make ${memberName} an admin`
                        }
                      >
                        <ShieldCheck size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveMember(member.studentId, memberName)
                      }
                      className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-error/10 hover:text-error"
                      title="Remove member"
                      aria-label={`Remove ${memberName}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-secondary">
          Member details are unavailable right now.
        </p>
      )}
    </section>
  );
}
