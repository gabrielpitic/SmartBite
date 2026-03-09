"use client";

import { useState, useRef, useEffect } from "react";
import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import type { ChatMessage, ChatOption, Language, MenuItem, UserProfile } from "@/types";
import { getWelcomeMessage, getOptions } from "@/lib/i18n";

interface Props {
  restaurantSlug: string;
  initialMenu: MenuItem[];
  lang: Language;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  options?: ChatOption[];
}

export default function ChatScreen({ restaurantSlug, initialMenu, lang }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ lang });
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Show welcome message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setTyping(false);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: getWelcomeMessage(lang),
          options: getOptions(lang),
        },
      ]);
    }, 1200);
    return () => clearTimeout(timer);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const appendUserMessage = (content: string): Message[] => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    // Clear options from all previous messages when user replies
    const updated = messages.map((m) => ({ ...m, options: undefined }));
    const next = [...updated, userMsg];
    setMessages(next);
    return next;
  };

  const streamAssistantReply = async (history: Message[], updatedProfile: UserProfile) => {
    setStreaming(true);
    setTyping(false);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          userProfile: updatedProfile,
          menu: initialMenu,
          restaurantSlug,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    lang === "ro"
                      ? "Îmi pare rău, a apărut o eroare. Te rog încearcă din nou."
                      : "Sorry, something went wrong. Please try again.",
                }
              : m
          )
        );
      }
    } finally {
      setStreaming(false);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || streaming) return;
    const history = appendUserMessage(text);
    setTyping(true);
    setTimeout(() => setTyping(false), 0); // let state flush before stream starts
    await streamAssistantReply(history, userProfile);
  };

  const handleOptionSelect = async (opt: ChatOption) => {
    if (streaming) return;

    // Update userProfile based on which option was picked
    const updatedProfile: UserProfile = { ...userProfile };
    if (opt.id === "vegan") updatedProfile.isVegan = true;
    if (opt.id === "vegetarian") updatedProfile.isVegetarian = true;

    setUserProfile(updatedProfile);

    const label = `${opt.icon} ${opt.label}`;
    const history = appendUserMessage(label);
    await streamAssistantReply(history, updatedProfile);
  };

  return (
    <div className="flex flex-col h-dvh" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fff 50%, #fff1f2 100%)" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="bg-gradient-to-r from-orange-400 to-rose-500 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg border border-white/30">
            🍽️
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight">SmartBite</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              <span className="text-xs text-white/80 font-medium">
                {lang === "ro" ? "Asistent activ" : "Assistant active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <AIMessage
              key={msg.id}
              content={msg.content}
              options={msg.options}
              onOptionSelect={handleOptionSelect}
              isStreaming={streaming && msg.id === messages[messages.length - 1]?.id}
            />
          ) : (
            <UserMessage key={msg.id} content={msg.content} />
          )
        )}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={streaming || typing} lang={lang} />
    </div>
  );
}