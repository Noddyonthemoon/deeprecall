import React from 'react';
import { ExternalResource, ResourceType } from '../types/neet';
import { ExternalLink } from 'lucide-react';

interface ExternalResourcesTabProps {
  resources: ExternalResource[];
  chapterTitle: string;
}

export const ExternalResourcesTab: React.FC<ExternalResourcesTabProps> = ({
  resources,
  chapterTitle,
}) => {
  const formatResourceType = (type: ResourceType) => {
    switch (type) {
      case 'open_question_bank':
        return 'Open Question Bank';
      case 'anki_export_text':
        return 'Plain-Text Anki Deck';
      case 'discussion_thread':
        return 'Aspirant Discussion';
      case 'reference_article':
      default:
        return 'NCERT Reference Portal';
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-stone-200/80">
        <h3 className="text-sm font-semibold text-stone-900">
          Open Repositories & External References
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          In adherence to licensing standards, proprietary questions are not ingested verbatim. Rather, we link directly to verified public textbooks, GitHub text banks, and discussion threads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((res, idx) => (
          <div
            key={idx}
            className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-stone-400">
                {formatResourceType(res.resource_type)}
              </span>
              <h4 className="font-serif text-base font-normal text-stone-900 leading-snug">
                {res.title}
              </h4>
              {res.note && (
                <p className="text-xs text-stone-600 leading-relaxed font-sans">{res.note}</p>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100">
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-800 hover:text-stone-950 underline transition"
              >
                <span>Visit resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
