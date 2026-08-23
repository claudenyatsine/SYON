'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WhiteWebSdk, Room, DeviceType, ApplianceNames } from 'white-web-sdk';
import { Loader2, Palette, Eraser, Trash2, Edit3, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgoraWhiteboardProps {
  appIdentifier: string; // Agora Whiteboard App Identifier
  sdkToken: string;      // Agora Whiteboard SDK Token
  roomToken: string;     // Agora Whiteboard Room Token
  uuid: string;          // Agora Whiteboard Room UUID
  uid: string;           // Current user ID
  isTutor: boolean;      // Controls write access
}

export default function AgoraWhiteboard({
  appIdentifier,
  sdkToken,
  roomToken,
  uuid,
  uid,
  isTutor,
}: AgoraWhiteboardProps) {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  // Local Whiteboard fallback state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [color, setColor] = useState('#0B0C10'); // Sleek branding color
  const [brushSize, setBrushSize] = useState(4);

  // Try initializing the actual Agora Whiteboard SDK
  useEffect(() => {
    if (useLocalFallback) {
      setIsLoading(false);
      return;
    }

    let currentRoom: Room | null = null;
    let isMounted = true;

    const initWhiteboard = async () => {
      if (!appIdentifier || !roomToken || !uuid || roomToken === 'temp_room_token') {
        // Automatically fallback to local whiteboard if credentials are placeholders/empty
        console.warn('[Whiteboard] Missing or temp credentials. Activating premium local canvas fallback.');
        if (isMounted) {
          setUseLocalFallback(true);
          setIsLoading(false);
        }
        return;
      }

      if (!whiteboardRef.current) return;

      try {
        const whiteWebSdk = new WhiteWebSdk({
          appIdentifier: appIdentifier,
          region: 'us-sv',
          deviceType: DeviceType.Desktop,
        });

        const newRoom = await whiteWebSdk.joinRoom({
          uuid: uuid,
          roomToken: roomToken,
          uid: uid,
          isWritable: isTutor,
          disableNewPencil: false,
        });

        if (isMounted) {
          newRoom.bindHtmlElement(whiteboardRef.current);
          currentRoom = newRoom;
          setRoom(newRoom);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('[Whiteboard] SDK Join Room failed. Activating local fallback.', err);
        if (isMounted) {
          // Instead of showing a critical error screen, activate local canvas fallback seamlessly
          setUseLocalFallback(true);
          setIsLoading(false);
        }
      }
    };

    initWhiteboard();

    return () => {
      isMounted = false;
      if (currentRoom) {
        currentRoom.disconnect().catch(console.error);
      }
    };
  }, [appIdentifier, roomToken, uuid, uid, isTutor, useLocalFallback]);

  // Set up local HTML5 drawing canvas when fallback is active
  useEffect(() => {
    if (!useLocalFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.scale(2, 2);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = brushSize;
      contextRef.current = context;

      // Draw white background
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, rect.width, rect.height);
    };

    setupCanvas();

    // Resize observer to handle container changes
    const resizeObserver = new ResizeObserver(() => {
      // Save current content before resizing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, rect.width, rect.height);
        // Restore saved content
        context.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
      }
    });

    resizeObserver.observe(canvas.parentElement || canvas);

    return () => resizeObserver.disconnect();
  }, [useLocalFallback]);

  // Update stroke properties on color or tool changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      contextRef.current.lineWidth = tool === 'eraser' ? 24 : brushSize;
    }
  }, [color, tool, brushSize]);

  // Handlers for local canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isTutor) return;
    e.preventDefault();

    let clientX, clientY;
    if ('touches' in e.nativeEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isTutor) return;
    e.preventDefault();

    let clientX, clientY;
    if ('touches' in e.nativeEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    const rect = canvas.getBoundingClientRect();
    contextRef.current.fillStyle = '#FFFFFF';
    contextRef.current.fillRect(0, 0, rect.width, rect.height);
  };

  return (
    <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden border border-border shadow-2xl flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07120C]/90 backdrop-blur-md z-30">
          <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
          <p className="text-foreground/ text-sm font-medium tracking-wide animate-pulse">Initializing Board...</p>
        </div>
      )}

      {/* Info indicator overlay */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border text-foreground">
        <Sparkles className="w-3.5 h-3.5 text-gold" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
          {useLocalFallback ? 'Interactive Canvas' : 'Agora Whiteboard'}
        </span>
        <span className="text-[10px] text-foreground/">|</span>
        <span className="text-[10px] text-foreground/">
          {isTutor ? 'Drawing Privileges Active' : 'Viewing Mode'}
        </span>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
        {useLocalFallback ? (
          <canvas
            ref={canvasRef}
            className={cn("w-full h-full block bg-white", isTutor ? "cursor-crosshair" : "cursor-default")}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        ) : (
          <div
            ref={whiteboardRef}
            className="w-full h-full block bg-white"
            style={{ pointerEvents: isTutor ? 'auto' : 'none' }}
          />
        )}
      </div>

      {/* PREMIUM LOCAL WHITEBOARD TOOLBAR (Tutor only) */}
      {isTutor && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3.5 bg-background/95 border border-border rounded-full shadow-2xl z-20 text-foreground backdrop-blur-md transition-transform hover:scale-105 duration-300">
          {/* Tool select */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTool('pencil')}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-muted active:scale-95",
                tool === 'pencil' ? "bg-gold text-[#0B0C10] hover:bg-gold" : "text-foreground/"
              )}
              title="Draw Pencil"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-muted active:scale-95",
                tool === 'eraser' ? "bg-gold text-[#0B0C10] hover:bg-gold" : "text-foreground/"
              )}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-muted" />

          {/* Color Palettes (Only when using pencil) */}
          {tool === 'pencil' && (
            <div className="flex items-center gap-2">
              {[
                { hex: '#0B0C10', name: 'Primary' },
                { hex: '#D4AF37', name: 'Brand Green' },
                { hex: '#F59E0B', name: 'Amber' },
                { hex: '#EF4444', name: 'Red' },
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-90",
                    color === c.hex ? "border-gold scale-105" : "border-border"
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {tool === 'pencil' && <div className="w-px h-6 bg-muted" />}

          {/* Brush sizes */}
          {tool === 'pencil' && (
            <div className="flex items-center gap-2.5">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={cn(
                    "rounded-full flex items-center justify-center hover:bg-muted text-xs transition-all",
                    brushSize === size ? "bg-muted font-bold text-gold" : "text-foreground/"
                  )}
                  style={{ width: 28, height: 28 }}
                >
                  {size === 2 ? 'S' : size === 4 ? 'M' : 'L'}
                </button>
              ))}
            </div>
          )}

          {tool === 'pencil' && <div className="w-px h-6 bg-muted" />}

          {/* Clear board */}
          <button
            onClick={useLocalFallback ? clearCanvas : () => room?.cleanCurrentScene()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-burgundy/80 hover:bg-burgundy/10 hover:text-burgundy/80 transition-all active:scale-95"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}



