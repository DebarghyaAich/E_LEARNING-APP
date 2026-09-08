import React, { useRef, useState, useEffect } from 'react';
import { IconPenTool, IconEraser, IconTrash, IconSparkles } from './Icons';

export default function Whiteboard({ lessonTitle }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [color, setColor] = useState('#4F46E5');
  const [lineWidth, setLineWidth] = useState(3);
  const [notesText, setNotesText] = useState('');

  const colors = [
    { name: 'Electric Indigo', hex: '#4F46E5' },
    { name: 'Dark Slate', hex: '#0F172A' },
    { name: 'Emerald Sage', hex: '#10B981' },
    { name: 'Warm Amber', hex: '#F59E0B' },
    { name: 'Coral Rose', hex: '#F43F5E' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Set display size matching container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio || 800;
    canvas.height = 360 * window.devicePixelRatio || 360;
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw grid dots
    drawDotGrid(ctx, rect.width || 800, 360);
  }, []);

  const drawDotGrid = (ctx, w, h) => {
    ctx.fillStyle = '#E2E8F0';
    const spacing = 24;
    for (let x = 12; x < w; x += spacing) {
      for (let y = 12; y < h; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = lineWidth * 5;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDotGrid(ctx, rect.width || 800, 360);
  };

  return (
    <div className="eduwerks-whiteboard-card">
      <div className="whiteboard-toolbar">
        <div className="toolbar-group">
          <div className="toolbar-label">
            <IconSparkles size={16} className="text-primary" />
            <span>Eduwerks Interactive Board</span>
          </div>

          <button
            className={`toolbar-btn ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Drawing Pen"
          >
            <IconPenTool size={16} />
            <span>Pen</span>
          </button>

          <button
            className={`toolbar-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <IconEraser size={16} />
            <span>Eraser</span>
          </button>
        </div>

        {tool === 'pen' && (
          <div className="toolbar-colors">
            {colors.map((c) => (
              <button
                key={c.hex}
                className={`color-dot ${color === c.hex ? 'selected' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColor(c.hex)}
                title={c.name}
              />
            ))}
          </div>
        )}

        <div className="toolbar-group right">
          <button className="toolbar-btn text-rose" onClick={handleClear} title="Clear board">
            <IconTrash size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="whiteboard-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Sticky quick notes */}
      <div className="whiteboard-notes-tray">
        <textarea
          className="whiteboard-notes-input"
          placeholder={`Add personal study notes or questions for "${lessonTitle || 'this lesson'}"...`}
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
