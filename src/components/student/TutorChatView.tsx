import React, { useState } from 'react';
import { TutorMessage, SourceCitation, CourseMaterial, TutorAnswerState } from '../../types';
import {
  Send,
  Sparkles,
  BookOpen,
  Video,
  Presentation,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Info,
  Sliders,
  Globe
} from 'lucide-react';

interface TutorChatViewProps {
  messages: TutorMessage[];
  onSendMessage: (text: string, explanationLevel?: string) => void;
  onInspectCitation: (citation: SourceCitation) => void;
  materials: CourseMaterial[];
}

export const TutorChatView: React.FC<TutorChatViewProps> = ({
  messages,
  onSendMessage,
  onInspectCitation,
  materials
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [explanationLevel, setExplanationLevel] = useState<'introductory' | 'rigorous' | 'exam_prep'>('rigorous');
  const [language, setLanguage] = useState('English');

  const suggestedPrompts = [
    { text: 'Why does infinite recursion cause a stack overflow in DFS?', type: 'supported' },
    { text: 'What is the three-color invariant for directed cycle detection?', type: 'supported' },
    { text: 'How do Red-Black Tree rotation invariants work?', type: 'not_found' },
    { text: 'Explain the base case identity element in recursive array sum', type: 'supported' }
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    onSendMessage(text, explanationLevel);
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: type }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Trust Promise & Parameters */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E1E4D8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#263F2B]" />
              <span>Audited Socratic Tutor · Visible Source Grounding</span>
            </div>
            <h2 className="text-xl font-bold font-serif-display text-[#263F2B]">
              Course-Grounded Socratic Tutor
            </h2>
            <p className="text-xs text-[#5D655B]">
              Every explanation is bound to Professor Henderson's courseware. If an answer is not in your materials, CourseCompass tells you.
            </p>
          </div>

          {/* Controls: Level & Language */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-1.5 bg-[#F8F7EF] border border-[#E1E4D8] px-2.5 py-1.5 rounded-lg">
              <Sliders className="w-3.5 h-3.5 text-[#697650]" />
              <select
                value={explanationLevel}
                onChange={(e) => setExplanationLevel(e.target.value as any)}
                className="bg-transparent font-medium text-[#17241B] focus:outline-none cursor-pointer"
              >
                <option value="rigorous">Rigorous (Exam-Prep)</option>
                <option value="introductory">Introductory</option>
                <option value="exam_prep">Quick Recall</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F8F7EF] border border-[#E1E4D8] px-2.5 py-1.5 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-[#697650]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-medium text-[#17241B] focus:outline-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4 Distinct Answer States Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5D655B]">
          <span className="font-semibold text-[#17241B]">Trust Guarantee:</span>
          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ● Supported by your course
          </span>
          <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            ▲ Partially supported
          </span>
          <span className="inline-flex items-center gap-1 text-[#D71935] bg-rose-50 px-2 py-0.5 rounded border border-[#F8E2E3]">
            ✕ Not found in course
          </span>
          <span className="inline-flex items-center gap-1 text-[#697650] bg-[#F1F2E6] px-2 py-0.5 rounded border border-[#E1E4D8]">
            ◆ Optional outside explanation
          </span>
        </div>
      </div>

      {/* Main Chat Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Stream (Left 8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs flex flex-col h-[650px]">
          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-2">
            {messages.map((msg) => {
              const state = msg.answerState || 'supported';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'tutor' && (
                    <div className="w-8 h-8 rounded-lg bg-[#263F2B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 sm:p-5 space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-[#263F2B] text-white rounded-br-xs'
                        : 'bg-[#F8F7EF] border border-[#E1E4D8] text-[#17241B] rounded-bl-xs'
                    }`}
                  >
                    {/* Status Badge on Tutor Answers */}
                    {msg.sender === 'tutor' && (
                      <div className="flex items-center justify-between pb-2 border-b border-[#E1E4D8]">
                        <span className="font-semibold text-[#263F2B]">CourseCompass Tutor</span>

                        {state === 'supported' && (
                          <span className="text-[10px] font-mono-code text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ● Supported by your course
                          </span>
                        )}
                        {state === 'partially_supported' && (
                          <span className="text-[10px] font-mono-code text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ▲ Partially supported
                          </span>
                        )}
                        {state === 'not_found' && (
                          <span className="text-[10px] font-mono-code text-[#D71935] bg-rose-50 px-2 py-0.5 rounded border border-[#F8E2E3]">
                            ✕ Not found in your course
                          </span>
                        )}
                        {state === 'outside_materials' && (
                          <span className="text-[10px] font-mono-code text-[#697650] bg-[#F1F2E6] px-2 py-0.5 rounded border border-[#E1E4D8]">
                            ◆ Optional outside explanation
                          </span>
                        )}
                      </div>
                    )}

                    {/* Unsupported Notice Banner if applicable */}
                    {state === 'not_found' && (
                      <div className="p-3 bg-rose-50 border border-[#F8E2E3] rounded-lg text-xs text-rose-950 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#D71935] shrink-0 mt-0.5" />
                        <div>
                          <strong>Boundary Warning: </strong>
                          This question references topics not found in your uploaded CS 204 courseware. CourseCompass will not fabricate nonexistent citations.
                        </div>
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-line text-xs font-sans-body leading-relaxed">
                      {msg.text}
                    </div>

                    {/* Verified Citations Ribbon */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-[#E1E4D8] space-y-1.5">
                        <span className="text-[10px] font-semibold text-[#697650] uppercase tracking-wider block">
                          Verified Courseware Citations:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cite) => (
                            <button
                              key={cite.id}
                              onClick={() => onInspectCitation(cite)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E1E4D8]/70 hover:bg-[#DCE5CE] border border-[#A8B594]/40 text-[#263F2B] text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              {cite.sourceType === 'video' && <Video className="w-3 h-3 text-[#D71935]" />}
                              {cite.sourceType === 'pdf' && <BookOpen className="w-3 h-3 text-[#263F2B]" />}
                              {cite.sourceType === 'slides' && <Presentation className="w-3 h-3 text-[#263F2B]" />}
                              <span>{cite.locationLabel}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-[#5D655B]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Footer Actions */}
                    <div className="pt-2 flex items-center justify-between text-[10px] text-[#777E70] border-t border-[#E1E4D8]/60">
                      <span className="font-mono-code">{msg.timestamp}</span>

                      {msg.sender === 'tutor' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1 hover:text-[#17241B] flex items-center gap-1"
                            aria-label="Copy tutor explanation"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={`p-1 hover:text-[#263F2B] ${
                              feedbackGiven[msg.id] === 'up' ? 'text-emerald-700 font-bold' : ''
                            }`}
                            aria-label="Mark helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={`p-1 hover:text-[#D71935] ${
                              feedbackGiven[msg.id] === 'down' ? 'text-[#D71935] font-bold' : ''
                            }`}
                            aria-label="Mark unhelpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Suggested Queries */}
          <div className="pt-3 border-t border-[#E1E4D8]">
            <span className="text-[10px] font-semibold text-[#697650] uppercase tracking-wider block mb-1.5">
              Suggested Inquiries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(p.text)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors truncate max-w-full ${
                    p.type === 'not_found'
                      ? 'bg-rose-50 text-rose-950 border-[#F8E2E3] hover:bg-rose-100'
                      : 'bg-[#F1F2E6] text-[#263F2B] border-[#E1E4D8] hover:bg-[#DCE5CE]'
                  }`}
                >
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="pt-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about base cases, call stacks, DFS edge types..."
                className="flex-1 px-4 py-2.5 text-xs bg-[#F8F7EF] border border-[#E1E4D8] rounded-xl focus:outline-none focus:border-[#263F2B]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Ask Tutor</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Active Course Knowledge Corpus */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E1E4D8] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E4D8]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#697650]">
                Active Course Corpus
              </h3>
              <span className="text-[11px] font-mono-code text-[#263F2B]">CS 204</span>
            </div>

            <p className="text-xs text-[#5D655B] leading-relaxed">
              Every answer is audited against the {materials.length} indexed documents below.
            </p>

            <div className="space-y-2">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] space-y-1 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[#17241B] truncate">{m.title}</span>
                    <span className="capitalize font-mono-code text-[10px] text-[#697650] bg-white px-1.5 py-0.5 rounded border border-[#E1E4D8] shrink-0">
                      {m.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5D655B] line-clamp-2">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
