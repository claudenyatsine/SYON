'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Highlighter, Link, Strikethrough } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface TextToolSelectorProps {
  onAction?: (actionType: string) => void;
  manualMode?: boolean;
  isVisible?: boolean;
  coords?: Position;
  onClose?: () => void;
}

export default function TextToolSelector({ onAction, manualMode, isVisible: externalVisible, coords: externalCoords, onClose }: TextToolSelectorProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const [internalCoords, setInternalCoords] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isVisible = manualMode ? externalVisible : internalVisible;
  const coords = manualMode && externalCoords ? externalCoords : internalCoords;

  useEffect(() => {
    if (manualMode) return;

    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 0) {
        setInternalCoords({ x: e.clientX, y: e.clientY });
        setInternalVisible(true);
      } else {
        if (containerRef.current && containerRef.current.contains(e.target as Node)) return;
        setInternalVisible(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) return;
      setInternalVisible(false);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [manualMode]);

  const handleAction = (actionType: string) => {
    if (onAction) onAction(actionType);
    if (!manualMode) {
      setInternalVisible(false);
    } else if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  // Arc configuration geometry
  const radius = 50; // Distance from cursor in pixels
  const buttons = [
    { icon: <Highlighter className="w-4 h-4 text-amber-400" />, label: 'Highlight', action: 'highlight', angle: -135 },
    { icon: <Link className="w-4 h-4 text-sky-400" />, label: 'Cite Resource', action: 'resource', angle: -90 },
    { icon: <Strikethrough className="w-4 h-4 text-rose-400" />, label: 'Strikethrough', action: 'strikethrough', angle: -45 },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed z-50 pointer-events-none"
      style={{ left: coords.x, top: coords.y }}
    >
      {buttons.map((btn, index) => {
        // Convert polar angles to Cartesian coordinates (X, Y offset)
        const radian = (btn.angle * Math.PI) / 180;
        const offsetX = radius * Math.cos(radian);
        const offsetY = radius * Math.sin(radian);

        return (
          <button
            key={index}
            onClick={() => handleAction(btn.action)}
            className="absolute pointer-events-auto flex items-center justify-center w-10 h-10 
                       bg-zinc-950 border border-zinc-800 rounded-full shadow-xl 
                       hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 ease-out
                       transform -translate-x-1/12 -translate-y-1/2 group"
            style={{
              left: `${offsetX}px`,
              top: `${offsetY}px`,
              // Smooth entry animation pulling outward from the cursor center
              animation: `arcSpawn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
            }}
            title={btn.label}
          >
            {btn.icon}
          </button>
        );
      })}
      
      {/* Global Inline Animation Styles */}
      <style jsx global>{`
        @keyframes arcSpawn {
          from {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
