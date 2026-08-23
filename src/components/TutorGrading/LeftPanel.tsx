import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Info } from 'lucide-react';

export interface MarkingData {
  contentMark: number; contentMax: number;
  commMark: number; commMax: number;
  orgMark: number; orgMax: number;
  langMark: number; langMax: number;
  totalMark: number; totalMax: number;
  grade: string;
}

interface LeftPanelProps {
  onMarksChange?: (data: MarkingData) => void;
  initialMarks?: MarkingData;
  isReadOnly?: boolean;
}

export default function LeftPanel({ onMarksChange, initialMarks, isReadOnly = false }: LeftPanelProps = {}) {
  const [contentMark, setContentMark] = useState<number>(initialMarks?.contentMark ?? 7);
  const [contentMax, setContentMax] = useState<number>(initialMarks?.contentMax ?? 10);
  const [commMark, setCommMark] = useState<number>(initialMarks?.commMark ?? 6);
  const [commMax, setCommMax] = useState<number>(initialMarks?.commMax ?? 7);
  const [orgMark, setOrgMark] = useState<number>(initialMarks?.orgMark ?? 5);
  const [orgMax, setOrgMax] = useState<number>(initialMarks?.orgMax ?? 7);
  const [langMark, setLangMark] = useState<number>(initialMarks?.langMark ?? 4);
  const [langMax, setLangMax] = useState<number>(initialMarks?.langMax ?? 6);

  const totalMark = contentMark + commMark + orgMark + langMark;
  const totalMax = contentMax + commMax + orgMax + langMax;
  
  const calculateGrade = (total: number) => {
    if (total >= 26) return 'A*';
    if (total >= 24) return 'A';
    if (total >= 21) return 'B';
    if (total >= 18) return 'C';
    if (total >= 15) return 'D';
    if (total >= 12) return 'E';
    return 'U';
  };

  const getMarkColor = (mark: number, max: number) => {
    const ratio = mark / max;
    if (ratio >= 0.8) return 'bg-gold';
    if (ratio >= 0.5) return 'bg-gold';
    return 'bg-burgundy';
  };

  const getTextColor = (mark: number, max: number) => {
    const ratio = mark / max;
    if (ratio >= 0.8) return 'text-gold';
    if (ratio >= 0.5) return 'text-gold';
    return 'text-burgundy';
  };

  const grade = calculateGrade(totalMark);

  useEffect(() => {
    if (onMarksChange && !isReadOnly) {
      onMarksChange({
        contentMark, contentMax,
        commMark, commMax,
        orgMark, orgMax,
        langMark, langMax,
        totalMark, totalMax,
        grade
      });
    }
  }, [contentMark, contentMax, commMark, commMax, orgMark, orgMax, langMark, langMax, totalMark, totalMax, grade, isReadOnly]);

  return (
    <div className="w-[260px] bg-background border-r border-border h-full flex flex-col flex-shrink-0 overflow-y-auto hide-scrollbar">
      <div className="p-4 space-y-8">
        
        {/* Marking Overview */}
        <section>
          <h2 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-3">Marking Overview</h2>
          <div className="bg-muted border border-border rounded-xl p-5 transition-all">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs text-foreground/ font-medium mb-1">Total Mark</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold transition-colors ${getTextColor(totalMark, totalMax)}`}>{totalMark}</span>
                  <span className="text-lg text-foreground/ font-medium">/ {totalMax}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/ font-medium mb-1">Grade</p>
                <span className={`text-4xl font-extrabold transition-colors ${getTextColor(totalMark, totalMax)}`}>{grade}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-foreground/ font-medium">According to Cambridge Marking Scheme</span>
              <Info className="w-4 h-4 text-foreground/" />
            </div>
          </div>
        </section>

        {/* Mark Scheme Breakdown */}
        <section>
          <h2 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-3">Mark Scheme Breakdown</h2>
          <div className="bg-muted border border-border rounded-xl divide-y divide-white/5">
            
            <div className="p-4 flex items-center justify-between group">
              <span className="text-sm font-semibold text-foreground/">Content</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent transition-all">
                  <input 
                    type="number" 
                    min={0} max={contentMax} 
                    value={contentMark} 
                    disabled={isReadOnly}
                    onChange={(e) => setContentMark(Math.max(0, Math.min(contentMax, Number(e.target.value))))} 
                    className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                  />
                  <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                    / <input type="number" min={1} value={contentMax} disabled={isReadOnly} onChange={(e) => {
                      const newMax = Math.max(1, Number(e.target.value));
                      setContentMax(newMax);
                      if (contentMark > newMax) setContentMark(newMax);
                    }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(contentMark, contentMax)}`} />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between group">
              <span className="text-sm font-semibold text-foreground/">Communicative Achievement</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent transition-all">
                  <input 
                    type="number" 
                    min={0} max={commMax} 
                    value={commMark} 
                    disabled={isReadOnly}
                    onChange={(e) => setCommMark(Math.max(0, Math.min(commMax, Number(e.target.value))))} 
                    className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                  />
                  <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                    / <input type="number" min={1} value={commMax} disabled={isReadOnly} onChange={(e) => {
                      const newMax = Math.max(1, Number(e.target.value));
                      setCommMax(newMax);
                      if (commMark > newMax) setCommMark(newMax);
                    }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(commMark, commMax)}`} />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between group">
              <span className="text-sm font-semibold text-foreground/">Organisation</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
                  <input 
                    type="number" 
                    min={0} max={orgMax} 
                    value={orgMark} 
                    disabled={isReadOnly}
                    onChange={(e) => setOrgMark(Math.max(0, Math.min(orgMax, Number(e.target.value))))} 
                    className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                  />
                  <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                    / <input type="number" min={1} value={orgMax} disabled={isReadOnly} onChange={(e) => {
                      const newMax = Math.max(1, Number(e.target.value));
                      setOrgMax(newMax);
                      if (orgMark > newMax) setOrgMark(newMax);
                    }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(orgMark, orgMax)}`} />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between group">
              <span className="text-sm font-semibold text-foreground/">Language</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-background/20 border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
                  <input 
                    type="number" 
                    min={0} max={langMax} 
                    value={langMark} 
                    disabled={isReadOnly}
                    onChange={(e) => setLangMark(Math.max(0, Math.min(langMax, Number(e.target.value))))} 
                    className="w-10 text-center text-sm font-bold bg-transparent border-none focus:outline-none p-1 text-foreground/ disabled:opacity-100 disabled:bg-transparent" 
                  />
                  <div className="flex items-center text-xs font-medium text-foreground/ pr-2 border-l border-border pl-2 py-1 bg-muted">
                    / <input type="number" min={1} value={langMax} disabled={isReadOnly} onChange={(e) => {
                      const newMax = Math.max(1, Number(e.target.value));
                      setLangMax(newMax);
                      if (langMark > newMax) setLangMark(newMax);
                    }} className="w-8 ml-1 bg-transparent border-none focus:outline-none text-foreground/ disabled:opacity-100 disabled:bg-transparent" />
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full transition-colors ${getMarkColor(langMark, langMax)}`} />
              </div>
            </div>

          </div>
        </section>

        {/* Cambridge Marking Scheme Details */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider">Cambridge Marking Scheme</h2>
            <button className="text-xs text-gold font-medium hover:underline">Show descriptors</button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-foreground/">Content (0 – {contentMax})</h3>
                <span className={`text-sm font-bold ${getTextColor(contentMark, contentMax)}`}>{contentMark} / {contentMax}</span>
              </div>
              <p className="text-xs text-foreground/">The candidate has fulfilled the task.</p>
            </div>

            <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-foreground/">Communicative Achievement (0 – {commMax})</h3>
                <span className={`text-sm font-bold ${getTextColor(commMark, commMax)}`}>{commMark} / {commMax}</span>
              </div>
              <p className="text-xs text-foreground/">The candidate has used the tone and style of the specified format appropriately.</p>
            </div>

            <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-foreground/">Organisation (0 – {orgMax})</h3>
                <span className={`text-sm font-bold ${getTextColor(orgMark, orgMax)}`}>{orgMark} / {orgMax}</span>
              </div>
              <p className="text-xs text-foreground/">The candidate has organised the information and ideas.</p>
            </div>

            <div className="bg-muted border border-border rounded-xl p-4 transition-all hover:bg-muted cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-foreground/">Language (0 – {langMax})</h3>
                <span className={`text-sm font-bold ${getTextColor(langMark, langMax)}`}>{langMark} / {langMax}</span>
              </div>
              <p className="text-xs text-foreground/">The candidate has used a range of vocabulary and grammatical structures.</p>
            </div>
          </div>
        </section>

      </div>
      
      <div className="mt-auto p-4 bg-background border-t border-border sticky bottom-0">
        <Button variant="outline" className="w-full h-10 border-border bg-muted hover:bg-muted text-foreground font-bold transition-all">
          <Download className="w-4 h-4 mr-2 text-gold" />
          Download Mark Sheet
        </Button>
      </div>
    </div>
  );
}


