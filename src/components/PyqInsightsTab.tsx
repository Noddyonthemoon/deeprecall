import React from 'react';
import { PyqTrendInsight } from '../types/neet';
import { ExternalLink } from 'lucide-react';

interface PyqInsightsTabProps {
  insights: PyqTrendInsight[];
  chapterTitle: string;
  subject: string;
}

export const PyqInsightsTab: React.FC<PyqInsightsTabProps> = ({
  insights,
  chapterTitle,
  subject,
}) => {
  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-stone-200/80">
        <h3 className="text-sm font-semibold text-stone-900">
          Previous-Year Exam Trends & Historical Patterns
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Synthesized from historical NTA papers, premier coaching test series (PW, Allen, Aakash), and aspirant discussion logs.
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((item, idx) => (
          <article
            key={idx}
            className="bg-white border border-stone-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-mono text-stone-400">
                Finding {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-mono text-stone-400">Verified Pattern</span>
            </div>

            <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-sans">
              {item.observation}
            </p>

            {item.source_urls && item.source_urls.length > 0 && (
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
                <span className="text-[11px] font-mono text-stone-400">Referenced sources:</span>
                {item.source_urls.map((url, uIdx) => {
                  const title = item.source_titles?.[uIdx] || url;
                  return (
                    <a
                      key={uIdx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-stone-700 hover:text-stone-950 underline transition"
                    >
                      <span className="truncate max-w-xs">{title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
