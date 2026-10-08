import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { TimelineEventItem } from '../types';
import { EvidenceInspector } from '../components/evidence/EvidenceInspector';
import { Clock, AlertTriangle } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventItem | null>(null);

  useEffect(() => {
    apiService.getTimeline().then(res => {
      setEvents(res);
      if (res.length > 0) setSelectedEvent(res[0]);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="legal-card p-5 border-l-4 border-l-[#6C2029]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
          <Clock className="w-4 h-4 text-[#6C2029]" />
          <span>CHRONOLOGICAL TIMELINE ENGINE</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Case Event Sequence & Conflict Markers
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Events extracted automatically with direct links to source evidence passages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Timeline List (7 cols) */}
        <div className="lg:col-span-7 legal-card p-5 h-[650px] overflow-y-auto space-y-4">
          <div className="relative border-l-2 border-[#6C2029]/30 pl-6 space-y-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`relative bg-white border p-4 rounded-xs cursor-pointer transition-all hover:shadow-md ${
                  selectedEvent?.id === ev.id ? 'border-[#6C2029] ring-1 ring-[#6C2029]' : 'border-[#171717]/15'
                }`}
              >
                {/* Node dot on line */}
                <div className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  ev.has_conflict ? 'bg-[#92383B]' : 'bg-[#6C2029]'
                }`} />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#6C2029]">
                    {ev.date_str}
                  </span>
                  {ev.has_conflict && (
                    <span className="text-[9px] font-mono bg-[#92383B] text-white px-2 py-0.5 font-bold rounded-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      CONFLICT DETECTED
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base font-bold text-[#171717] mt-1">{ev.title}</h3>
                <p className="text-xs text-[#171717]/80 mt-1 leading-relaxed">{ev.description}</p>

                <div className="mt-2 pt-2 border-t border-[#171717]/10 flex items-center justify-between text-[10px] font-mono text-[#171717]/60">
                  <span>Source: {ev.document_filename || ev.document_id_str}</span>
                  <span>Page {ev.page_number} ({ev.paragraph_id})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Inspector (5 cols) */}
        <div className="lg:col-span-5 h-[650px]">
          <EvidenceInspector
            selectedItem={selectedEvent ? {
              id: selectedEvent.id,
              title: selectedEvent.title,
              evidence_type: 'DOCUMENTARY',
              document_id_str: selectedEvent.document_id_str,
              document_filename: selectedEvent.document_filename || selectedEvent.document_id_str,
              page_number: selectedEvent.page_number,
              paragraph_id: selectedEvent.paragraph_id,
              source_text: selectedEvent.source_text,
              relevance_score: 0.95,
              verification_status: selectedEvent.has_conflict ? 'CONFLICTING' : 'VERIFIED',
            } : null}
          />
        </div>
      </div>
    </div>
  );
};
