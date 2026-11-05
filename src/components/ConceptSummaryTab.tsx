import React, { useState } from 'react';
import { ConceptSummary } from '../types/neet';
import { Copy, Check, Search } from 'lucide-react';

interface ConceptSummaryTabProps {
  summaries: ConceptSummary[];
  chapterTitle: string;
  subject: string;
}

export const ConceptSummaryTab: React.FC<ConceptSummaryTabProps> = ({
  summaries,
  chapterTitle,
  subject,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSummaries = summaries.filter(
    (s) =>
      s.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.ncert_section_reference && s.ncert_section_reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-200/80">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">
            NCERT Section Concept Notes
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Strictly grounded in textbook statements and key definitions
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search concepts..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition"
          />
        </div>
      </div>

      {/* Concept Summary Notes */}
      <div className="space-y-4">
        {filteredSummaries.map((item, idx) => (
          <article
            key={idx}
            className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400">
                  <span>Concept {String(idx + 1).padStart(2, '0')}</span>
                  {item.ncert_section_reference && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-600">{item.ncert_section_reference}</span>
                    </>
                  )}
                </div>
                <h4 className="font-serif text-lg sm:text-xl font-normal text-stone-900">
                  {item.topic}
                </h4>
              </div>

              <button
                onClick={() => handleCopy(`${item.topic}\n\n${item.summary}`, idx)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition"
                title="Copy note"
              >
                {copiedIndex === idx ? (
                  <Check className="w-4 h-4 text-stone-900" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Note text formatted for maximum legibility */}
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans max-w-prose whitespace-pre-line">
              {item.summary}
            </p>
          </article>
        ))}

        {filteredSummaries.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-xs">
            No concepts match "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};
