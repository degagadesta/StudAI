import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  History,
  Plus,
  ChevronLeft,
  Trash2,
  MessageSquare,
} from "lucide-react";

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

interface AIChatPanelProps {
  courseName?: string;
  activePdfName?: string;
  onClose?: () => void;
  onSendMessage?: (message: string) => Promise<string> | Promise<void>;
  isEmbedded?: boolean;
}

const DEFAULT_PROMPTS = [
  "Summarize key points from this material",
  "Explain difficult concepts step-by-step",
  "Generate 5 quiz questions for revision",
];

const INITIAL_HISTORY: ChatSession[] = [
  {
    id: "session-1",
    title: "Key concepts in Chapter 2",
    timestamp: new Date(Date.now() - 3600000 * 24),
    messages: [
      {
        id: "m1",
        sender: "user",
        text: "Can you explain key concepts in Chapter 2?",
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        id: "m2",
        sender: "ai",
        text: "Chapter 2 covers core system architecture principles, including separation of concerns, modularity, and layered design patterns.",
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
    ],
  },
];

export default function AIChatPanel({
  courseName,
  activePdfName,
  onClose,
  onSendMessage,
  isEmbedded = false,
}: AIChatPanelProps) {
  const [activeView, setActiveView] = useState<"chat" | "history">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_HISTORY);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeView === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeView, messages, isGenerating]);

  const saveCurrentSession = (updatedMessages: Message[]) => {
    if (updatedMessages.length === 0) return;

    const sessionTitle =
      updatedMessages[0]?.text.slice(0, 32) +
      (updatedMessages[0]?.text.length > 32 ? "..." : "");

    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: updatedMessages, timestamp: new Date() }
            : s,
        ),
      );
    } else {
      const newId = `session-${Date.now()}`;
      const newSession: ChatSession = {
        id: newId,
        title: sessionTitle || "Study Session",
        timestamp: new Date(),
        messages: updatedMessages,
      };
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newId);
    }
  };

  const handleStartNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setActiveView("chat");
  };

  const handleSelectSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setActiveView("chat");
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setIsGenerating(true);

    try {
      let aiText = "";
      if (onSendMessage) {
        const responseText = await onSendMessage(query);
        if (responseText) aiText = responseText;
      } else {
        await new Promise((res) => setTimeout(res, 1200));
        aiText = `Here are insights on **"${query}"** regarding ${
          activePdfName || courseName || "your workspace material"
        }.`;
      }

      if (aiText) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: aiText,
          timestamp: new Date(),
        };
        const updatedWithAi = [...newMessages, aiMessage];
        setMessages(updatedWithAi);
        saveCurrentSession(updatedWithAi);
      }
    } catch (err) {
      console.error("Failed to generate response:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#DCD2B4]/70 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {activeView === "history" ? (
            <button
              type="button"
              onClick={() => setActiveView("chat")}
              className="p-1 hover:bg-[#F3EFE0] rounded-lg text-[#5B6156] hover:text-[#253D31] transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-[#253D31]/10 text-[#253D31] flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
          )}
          <div className="truncate">
            <h4 className="text-xs font-semibold text-[#253D31] truncate leading-tight">
              {activeView === "history" ? "Chat History" : "StudAI Assistant"}
            </h4>
            <p className="text-[10px] text-[#5B6156] truncate mt-0.5">
              {activeView === "history"
                ? `${sessions.length} saved session${sessions.length === 1 ? "" : "s"}`
                : activePdfName
                  ? `📄 ${activePdfName}`
                  : courseName || "Workspace Mode"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() =>
              setActiveView((prev) => (prev === "chat" ? "history" : "chat"))
            }
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === "history"
                ? "bg-[#253D31]/10 text-[#253D31] font-semibold"
                : "text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0]"
            }`}
            title="View History"
          >
            <History size={15} />
          </button>

          {activeView === "chat" && (
            <button
              type="button"
              onClick={handleStartNewChat}
              className="p-1.5 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-lg transition-colors cursor-pointer"
              title="New Chat"
            >
              <Plus size={15} />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-lg transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* History View */}
      {activeView === "history" ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
          <button
            type="button"
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#253D31] text-white font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer mb-3"
          >
            <Plus size={15} />
            <span>Start New Chat</span>
          </button>

          {sessions.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <History size={24} className="text-[#5B6156]/60 mb-2" />
              <p className="text-xs font-medium text-[#253D31]">
                No chat history yet
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`group relative flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  currentSessionId === session.id
                    ? "bg-[#253D31]/10 border-[#253D31]/40 text-[#253D31]"
                    : "bg-white hover:bg-[#FDFBF7] border-[#DCD2B4]/60"
                }`}
              >
                <div className="p-2 rounded-xl bg-[#F3EFE0] border border-[#DCD2B4]/60 text-[#253D31] shrink-0 mt-0.5">
                  <MessageSquare size={14} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h5 className="font-medium text-xs text-[#253D31] truncate leading-snug">
                    {session.title}
                  </h5>
                  <span className="text-[10px] text-[#5B6156] block mt-1">
                    {session.timestamp.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    • {session.messages.length} messages
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="absolute right-2.5 top-2.5 p-1 text-[#5B6156]/60 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Delete Session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Active Chat View */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-3 select-none">
                <div className="w-11 h-11 rounded-2xl bg-[#253D31]/10 text-[#253D31] flex items-center justify-center mb-3">
                  <Bot size={22} />
                </div>
                <h5 className="text-xs font-semibold text-[#253D31]">
                  How can I assist your study session?
                </h5>
                <p className="text-[11px] text-[#5B6156] mt-1 max-w-[240px]">
                  Ask questions or request explanations directly from your
                  active course materials.
                </p>

                <div className="mt-5 w-full space-y-1.5 text-left">
                  <p className="text-[10px] font-medium text-[#5B6156] uppercase tracking-wider pl-1">
                    Suggested prompts
                  </p>
                  {DEFAULT_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left text-[11px] p-2.5 rounded-xl border border-[#DCD2B4]/60 bg-white hover:bg-[#F3EFE0] text-[#253D31] transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{prompt}</span>
                      <Sparkles
                        size={12}
                        className="text-[#5B6156] group-hover:text-[#253D31] shrink-0 transition-colors"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.sender === "user"
                        ? "bg-[#253D31] text-white"
                        : "bg-[#F3EFE0] border border-[#DCD2B4] text-[#253D31]"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User size={13} />
                    ) : (
                      <Bot size={13} />
                    )}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#253D31] text-white rounded-tr-xs"
                        : "bg-[#F3EFE0] border border-[#DCD2B4]/60 text-[#253D31] rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] block mt-1 ${
                        msg.sender === "user"
                          ? "text-white/70 text-right"
                          : "text-[#5B6156] text-left"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#F3EFE0] border border-[#DCD2B4] text-[#253D31] flex items-center justify-center shrink-0">
                  <Bot size={13} />
                </div>
                <div className="bg-[#F3EFE0] border border-[#DCD2B4]/60 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B6156] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B6156] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B6156] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#FFFDF7] border-t border-[#DCD2B4]/70">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-end gap-2 bg-[#F3EFE0]/60 border border-[#DCD2B4] rounded-2xl p-2 focus-within:border-[#253D31] transition-colors"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI about this workspace..."
                rows={1}
                className="w-full bg-transparent text-xs text-[#253D31] placeholder:text-[#5B6156] outline-none resize-none max-h-24 py-1 px-1"
              />
              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="p-2 rounded-xl bg-[#253D31] text-white hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isGenerating ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
