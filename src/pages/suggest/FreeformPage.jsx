import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Transformer, Line, Circle, Arrow } from "react-konva";
import { nanoid } from "nanoid";
import { Plus, Undo2, Redo2, Square, StickyNote, Type, Trash2, ZoomIn, ZoomOut, Maximize2, Pencil, CircleDot, ArrowRight, Image, Palette, Lock, Unlock, Copy, Download, Layers, Grid3x3, Eye, EyeOff, Menu, Eraser, AlignCenter } from "lucide-react";

// --- History Hook (Stable) ---
function useHistoryState(initial) {
  const [state, setState] = useState(initial);
  const past = useRef([]);
  const future = useRef([]);

  const set = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Only push history if the state actually changed
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
          past.current.push(prev);
          future.current = [];
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    const prev = past.current.pop();
    future.current.push(state);
    setState(prev);
  }, [state]);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    const next = future.current.pop();
    past.current.push(state);
    setState(next);
  }, [state]);

  return { state, set, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}

// Adjusted colors for Dark Theme readability
const COLORS = {
  sticky: ["#fef3c7", "#fecaca", "#fed7aa", "#d9f99d", "#bfdbfe", "#ddd6fe", "#fbcfe8"],
  shape: ["#60a5fa", "#a78bfa", "#f472b6", "#fcd34d", "#34d399", "#22d3ee", "#818cf8"],
  text: ["#ffffff", "#f87171", "#38bdf8", "#c084fc", "#4ade80", "#2dd4bf", "#8b5cf6"]
};

// --- Main Component ---
export default function FreeformPage() {
  const { state: items, set: setItems, undo, redo, canUndo, canRedo } = useHistoryState([]);

  const stageRef = useRef();
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 400, y: 300 });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [drawMode, setDrawMode] = useState(null); // 'pen', 'line', 'circle', 'arrow', 'eraser'
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  const trRef = useRef();
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedItems = useMemo(() => items.filter(i => selectedIds.includes(i.id)), [items, selectedIds]);

  useEffect(() => {
    const stage = stageRef.current;
    const tr = trRef.current;
    if (tr && stage && selectedIds.length > 0) {
      const nodes = selectedIds.map(id => stage.findOne(`#node-${id}`)).filter(Boolean);
      if (nodes.length > 0) {
        tr.nodes(nodes.filter(n => !n.attrs.isLocked));
        tr.getLayer().batchDraw();
      }
    } else if (tr) {
      tr.nodes([]);
      tr.getLayer().batchDraw();
    }
  }, [selectedIds, items]);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.08;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clamped = Math.min(4, Math.max(0.25, newScale));

    stage.scale({ x: clamped, y: clamped });
    setScale(clamped);

    const newPos = {
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    };
    stage.position(newPos);
    setPos(newPos);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let lastDist = 0;
    function getDistance(p1, p2) { return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY); }
    function getCenter(p1, p2) { return { x: (p1.clientX + p2.clientX) / 2, y: (p1.clientY + p2.clientY) / 2 }; }
    const el = stage.content;
    function onTouchMove(e) {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const [p1, p2] = e.touches;
      const dist = getDistance(p1, p2);
      const center = getCenter(p1, p2);
      if (!lastDist) { lastDist = dist; return; }
      const stageScale = stage.scaleX();
      const pointer = { x: center.x, y: center.y };
      const mousePointTo = { x: (pointer.x - stage.x()) / stageScale, y: (pointer.y - stage.y()) / stageScale, };
      const scaleBy = dist / lastDist;
      let newScale = stageScale * scaleBy;
      newScale = Math.min(4, Math.max(0.25, newScale));
      stage.scale({ x: newScale, y: newScale });
      setScale(newScale);
      const newPos = { x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale, };
      stage.position(newPos);
      setPos(newPos);
      lastDist = dist;
    }
    function onTouchEnd() { lastDist = 0; }
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", onTouchEnd, { passive: false });
    return () => {
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  const onDragEnd = useCallback((e) => {
    setPos({ x: e.target.x(), y: e.target.y() });
  }, []);

  // --- Item Creation Logic ---
  const getCanvasCenter = () => {
    const stage = stageRef.current;
    const { width, height } = stage.getSize();
    const stageX = stage.x();
    const stageY = stage.y();
    const scale = stage.scaleX();
    return {
      x: (width / 2 - stageX) / scale,
      y: (height / 2 - stageY) / scale,
    };
  };

  const addSticky = (color) => {
    const { x, y } = getCanvasCenter();
    setItems((prev) => prev.concat({
      id: nanoid(), type: "sticky", x: x - 100, y: y - 100, width: 200, height: 200, rotation: 0,
      text: "New Note", fill: color || COLORS.sticky[0], stroke: "#f59e0b",
      locked: false, visible: true, opacity: 1, 
    }));
    setShowAddMenu(false);
  };

  const addRect = (color) => {
    const { x, y } = getCanvasCenter();
    setItems((prev) => prev.concat({
      id: nanoid(), type: "rect", x: x - 120, y: y - 80, width: 240, height: 160, rotation: 0,
      fill: color || COLORS.shape[0], stroke: "#3b82f6", 
      text: "Shape Text", // Added text property
      locked: false, visible: true, opacity: 1, cornerRadius: 16,
    }));
    setShowAddMenu(false);
  };

  const addCircle = (color) => {
    const { x, y } = getCanvasCenter();
    setItems((prev) => prev.concat({
      id: nanoid(), type: "circle", x: x - 75, y: y - 75, width: 150, height: 150, rotation: 0,
      fill: color || COLORS.shape[1], stroke: "#a78bfa", 
      text: "Circle Text", // Added text property
      locked: false, visible: true, opacity: 1,
    }));
    setShowAddMenu(false);
  };

  const addText = () => {
    const { x, y } = getCanvasCenter();
    setItems((prev) => prev.concat({
      id: nanoid(), type: "text", x: x - 150, y: y - 40, width: 300, height: 80, rotation: 0,
      text: "Double-tap to edit", fill: COLORS.text[0], 
      locked: false, visible: true, opacity: 1, 
      fontSize: 28, fontStyle: "normal", align: "center",
    }));
    setShowAddMenu(false);
  };

  const addArrow = () => {
    const { x, y } = getCanvasCenter();
    setItems((prev) => prev.concat({
      id: nanoid(), type: "arrow", points: [x - 100, y, x + 100, y], 
      stroke: COLORS.shape[0], strokeWidth: 3, 
      locked: false, visible: true, opacity: 1, x:0, y:0
    }));
    setShowAddMenu(false);
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
    setSelectedIds([]);
  };

  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const newItems = selectedItems.map(item => ({
      ...item,
      id: nanoid(),
      x: (item.x || 0) + 20,
      y: (item.y || 0) + 20,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setSelectedIds(newItems.map(i => i.id));
  };

  const toggleLock = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.map(item => 
      selectedIds.includes(item.id) ? { ...item, locked: !item.locked } : item
    ));
  };

  const toggleVisibility = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.map(item => 
      selectedIds.includes(item.id) ? { ...item, visible: !item.visible } : item
    ));
  };

  const bringToFront = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => {
      const selected = prev.filter(i => selectedIds.includes(i.id));
      const others = prev.filter(i => !selectedIds.includes(i.id));
      return [...others, ...selected];
    });
  };

  const sendToBack = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => {
      const selected = prev.filter(i => selectedIds.includes(i.id));
      const others = prev.filter(i => !selectedIds.includes(i.id));
      return [...selected, ...others];
    });
  };
  
  // STABILITY FIX: Only update the necessary properties for selected items.
  const changeColor = (color) => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.map(item => {
      if (!selectedIds.includes(item.id)) return item;

      // Determine if the item is a shape/sticky (uses fill) or text/line (uses fill/stroke as primary color)
      const isSticky = item.type === 'sticky';
      const isShape = item.type === 'rect' || item.type === 'circle';
      const isText = item.type === 'text';
      const isDrawing = item.type === 'line' || item.type === 'arrow';

      let newProps = {};
      
      if (isSticky || isShape) {
          // Change the background/fill color
          newProps.fill = color;
      } else if (isText) {
          // Change the text color (fill)
          newProps.fill = color;
      } else if (isDrawing) {
          // Change the line/arrow color (stroke)
          newProps.stroke = color; 
      }

      return { ...item, ...newProps };
    }));
  };

  const changeOpacity = (opacity) => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.map(item => 
      selectedIds.includes(item.id) ? { ...item, opacity: opacity } : item
    ));
  };

  const zoomIn = () => {
    const stage = stageRef.current;
    const newScale = Math.min(4, scale * 1.2);
    setScale(newScale);
    stage.scale({ x: newScale, y: newScale });
  };

  const zoomOut = () => {
    const stage = stageRef.current;
    const newScale = Math.max(0.25, scale / 1.2);
    setScale(newScale);
    stage.scale({ x: newScale, y: newScale });
  };

  const fitToScreen = () => {
    const stage = stageRef.current;
    if (items.length === 0) {
      const targetScale = 1;
      setScale(targetScale);
      stage.scale({ x: targetScale, y: targetScale });
      const newPos = { x: 400, y: 300 };
      setPos(newPos);
      stage.position(newPos);
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    items.forEach(item => {
      const node = stage.findOne(`#node-${item.id}`);
      if (!node) return;
      const box = node.getClientRect();
      minX = Math.min(minX, box.x);
      maxX = Math.max(maxX, box.x + box.width);
      minY = Math.min(minY, box.y);
      maxY = Math.max(maxY, box.y + box.height);
    });

    const padding = 100;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = (window.innerWidth - padding * 2) / contentWidth;
    const scaleY = (window.innerHeight - padding * 2) / contentHeight;
    const targetScale = Math.min(scaleX, scaleY, 2);

    setScale(targetScale);
    stage.scale({ x: targetScale, y: targetScale });

    const newPos = {
      x: -minX * targetScale + padding,
      y: -minY * targetScale + padding,
    };
    setPos(newPos);
    stage.position(newPos);
  };

  const exportAsImage = () => {
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png', quality: 1, fill: '#1e293b' }); // Set background fill for dark theme export
    const link = document.createElement('a');
    link.download = 'freeform-board.png';
    link.href = dataURL;
    link.click();
  };

  const onTransformEnd = (node, item) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Handle Line/Arrow scaling differently (reset scale and adjust points)
    if (item.type === 'line' || item.type === 'arrow') {
        const factor = Math.max(scaleX, scaleY); // Use max scale factor
        
        // Scale the stroke width
        const newStrokeWidth = item.strokeWidth * factor;
        
        // Scale the points (relative to the node's position)
        const newPoints = item.points.map((p, i) => {
            const isX = i % 2 === 0;
            const origin = isX ? node.x() : node.y();
            return p * factor; // Simple proportional scale works best for lines/paths
        });
        
        const next = {
            ...item,
            x: 0, // Keep x/y at 0 for lines/arrows
            y: 0,
            strokeWidth: newStrokeWidth,
            points: newPoints,
            rotation: node.rotation(),
        };
        node.scaleX(1);
        node.scaleY(1);
        node.position({ x: 0, y: 0 });

        setItems((prev) => prev.map((it) => (it.id === item.id ? next : it)));
        return;
    }

    // Default handling for shapes/text
    const next = {
      ...item,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(20, (item.width || 0) * scaleX),
      height: Math.max(20, (item.height || 0) * scaleY),
    };
    node.scaleX(1);
    node.scaleY(1);
    setItems((prev) => prev.map((it) => (it.id === item.id ? next : it)));
  };

  const onDblClickText = (item) => {
    const stage = stageRef.current;
    const node = stage.findOne(`#node-${item.id}`);
    if (!node) return;

    // Hide transformer temporarily
    trRef.current.nodes([]); 
    
    const absPos = node.getClientRect({ skipTransform: true }); // Get absolute position ignoring any item transformation for initial placement
    
    // If it's a shape, use the Group's client rect
    if (item.type === 'rect' || item.type === 'circle') {
        absPos.x = node.absolutePosition().x;
        absPos.y = node.absolutePosition().y;
    }
    
    // Scale text field based on current stage scale
    const scaleFactor = stage.scaleX();

    const textarea = document.createElement("textarea");
    textarea.value = item.text || "";
    
    // Calculate text color based on the item type/fill for contrast
    const isDarkBackground = item.type !== 'sticky' && item.type !== 'rect' && item.type !== 'circle';
    const textColor = isDarkBackground ? item.fill : "#1f2937"; // Dark text for light sticky/shape, light text for dark canvas

    Object.assign(textarea.style, {
      position: "absolute",
      top: (absPos.y * scaleFactor) + "px",
      left: (absPos.x * scaleFactor) + "px",
      width: (absPos.width * scaleFactor) + "px",
      height: (absPos.height * scaleFactor) + "px",
      zIndex: 1000,
      background: item.type === 'sticky' ? item.fill : "#1f2937",
      color: textColor,
      border: "none",
      borderRadius: "12px",
      padding: "12px 16px",
      minWidth: "240px",
      fontSize: (item.fontSize || 16) * scaleFactor + "px", // Scale font size
      fontFamily: "'SF Pro Text', system-ui, -apple-system",
      fontWeight: item.fontStyle === "bold" ? "bold" : "normal",
      fontStyle: item.fontStyle === "italic" ? "italic" : "normal",
      textAlign: item.align || "center",
      resize: "none",
      outline: "none",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.5)",
    });
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.addEventListener("blur", () => {
      const val = textarea.value;
      setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, text: val } : it));
      textarea.remove();
      // Restore transformer after edit
      setSelectedIds([item.id]); 
    }, { once: true });
  };

  const handleStageMouseDown = (e) => {
    // 1. Drawing Mode: Start drawing (pen, line, arrow, circle)
    if (drawMode && drawMode !== 'eraser' && e.target === e.target.getStage()) {
      setIsDrawing(true);
      const stage = stageRef.current;
      const pos = stage.getRelativePointerPosition();
      
      if (drawMode === 'pen') {
        setCurrentLine([pos.x, pos.y]);
      } else if (drawMode === 'line' || drawMode === 'arrow') {
        setCurrentLine([pos.x, pos.y, pos.x, pos.y]);
      } else if (drawMode === 'circle') {
        setCurrentLine([pos.x, pos.y, 0]);
      }
      setSelectedIds([]); 
      return;
    }

    // 2. Eraser Mode: Check for intersection with drawing (line type)
    if (drawMode === 'eraser' && e.target !== e.target.getStage()) {
        const targetNode = e.target;
        const targetId = targetNode.attrs.id?.replace('node-', '');
        const targetItem = items.find(i => i.id === targetId);

        if (targetItem && (targetItem.type === 'line' || targetItem.type === 'arrow')) {
            // Delete the line/arrow
            setItems(prev => prev.filter(i => i.id !== targetId));
            setSelectedIds([]);
        }
        return;
    }

    // 3. Select/Pan Mode: Handle selection or pan start
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedIds([]);
      setShowAddMenu(false);
      setShowColorPicker(false);
      setShowPropertiesPanel(false);
    }
  };

  const handleStageMouseMove = (e) => {
    if (!isDrawing || drawMode !== 'pen') return;
    
    const stage = stageRef.current;
    const pos = stage.getRelativePointerPosition();

    setCurrentLine([...currentLine, pos.x, pos.y]);
  };

  const handleStageMouseUp = () => {
    if (!isDrawing) return;
    
    if (currentLine.length > 0) {
      if (drawMode === 'pen' && currentLine.length >= 4) {
        // Make the drawing selectable, movable, and transformable
        const newDrawing = {
          id: nanoid(), type: 'line', points: currentLine, stroke: COLORS.text[0], strokeWidth: 4, 
          tension: 0.5, lineCap: 'round', lineJoin: 'round', locked: false, visible: true, opacity: 1, x:0, y:0
        };
        setItems((prev) => [...prev, newDrawing]);
        setSelectedIds([newDrawing.id]); // Select the new drawing
      } else if (drawMode === 'line' && currentLine[2] !== currentLine[0]) {
        setItems((prev) => [...prev, {
          id: nanoid(), type: 'line', points: currentLine, stroke: COLORS.shape[0], strokeWidth: 3, tension: 0, lineCap: 'square', lineJoin: 'bevel', locked: false, visible: true, opacity: 1, x:0, y:0
        }]);
      } else if (drawMode === 'arrow' && currentLine[2] !== currentLine[0]) {
        setItems((prev) => [...prev, {
          id: nanoid(), type: 'arrow', points: currentLine, stroke: COLORS.shape[0], strokeWidth: 3, locked: false, visible: true, opacity: 1, x:0, y:0
        }]);
      } else if (drawMode === 'circle' && currentLine[2] > 10) {
        setItems((prev) => [...prev, {
          id: nanoid(), type: 'circle', 
          x: currentLine[0] - currentLine[2], y: currentLine[1] - currentLine[2], 
          width: currentLine[2] * 2, height: currentLine[2] * 2, rotation: 0,
          text: "Circle Text",
          fill: COLORS.shape[1], stroke: '#a78bfa', locked: false, visible: true, opacity: 1, 
        }]);
      }
    }
    
    setIsDrawing(false);
    setCurrentLine([]);
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) { e.preventDefault(); deleteSelected(); }
      }
      if (e.key === "Escape") {
        setDrawMode(null);
        setSelectedIds([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIds, undo, redo, duplicateSelected, deleteSelected]);

  return (
    <div className="fixed inset-0 bg-gray-900">
      {/* Top Toolbar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <ToolBtn onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
            <Undo2 size={20} />
          </ToolBtn>
          <ToolBtn onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
            <Redo2 size={20} />
          </ToolBtn>
          <div className="w-px h-8 bg-gray-700 mx-2" />
          
          <ToolBtn 
            onClick={() => setDrawMode(drawMode === 'pen' ? null : 'pen')} 
            title="Draw"
            active={drawMode === 'pen'}
          >
            <Pencil size={20} />
          </ToolBtn>

            <ToolBtn 
            onClick={() => setDrawMode(drawMode === 'eraser' ? null : 'eraser')} 
            title="Eraser (Click to remove drawings)"
            active={drawMode === 'eraser'}
          >
            <Eraser size={20} />
          </ToolBtn>

          <ToolBtn 
            onClick={() => setDrawMode(drawMode === 'line' ? null : 'line')} 
            title="Line"
            active={drawMode === 'line'}
          >
            <Menu size={20} className="rotate-90" />
          </ToolBtn>
          <ToolBtn 
            onClick={() => setDrawMode(drawMode === 'arrow' ? null : 'arrow')} 
            title="Arrow"
            active={drawMode === 'arrow'}
          >
            <ArrowRight size={20} />
          </ToolBtn>
          <ToolBtn 
            onClick={() => setDrawMode(drawMode === 'circle' ? null : 'circle')} 
            title="Circle"
            active={drawMode === 'circle'}
          >
            <CircleDot size={20} />
          </ToolBtn>
        </div>
        
        <div className="text-lg font-semibold text-gray-200">Freeform Pro</div>

        <div className="flex items-center gap-2">
          <ToolBtn onClick={() => setShowLayersPanel(!showLayersPanel)} title="Layers" active={showLayersPanel}>
            <Layers size={20} />
          </ToolBtn>
          <ToolBtn onClick={() => setShowGrid(!showGrid)} title="Toggle Grid" active={showGrid}>
            <Grid3x3 size={20} />
          </ToolBtn>
          <ToolBtn onClick={exportAsImage} title="Export as Image">
            <Download size={20} />
          </ToolBtn>
          {selectedIds.length > 0 && (
            <>
              <div className="w-px h-8 bg-gray-700 mx-2" />
              <ToolBtn onClick={duplicateSelected} title="Duplicate (⌘D)">
                <Copy size={20} />
              </ToolBtn>
              <ToolBtn onClick={toggleLock} title="Lock/Unlock">
                {selectedItems.some(i => i.locked) ? <Lock size={20} /> : <Unlock size={20} />}
              </ToolBtn>
              <ToolBtn onClick={() => setShowColorPicker(!showColorPicker)} title="Colors" active={showColorPicker}>
                <Palette size={20} />
              </ToolBtn>
              <ToolBtn onClick={deleteSelected} title="Delete">
                <Trash2 size={20} />
              </ToolBtn>
            </>
          )}
        </div>
      </div>

      {/* Color Picker Panel */}
      {showColorPicker && selectedIds.length > 0 && (
        <div className="absolute top-20 right-4 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-30 border border-gray-700/50">
          <div className="text-sm font-semibold text-gray-300 mb-3">Color/Fill</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[...COLORS.sticky, ...COLORS.shape, ...COLORS.text].map(color => (
              <button
                key={color}
                onClick={() => changeColor(color)}
                className="w-10 h-10 rounded-lg border-2 border-gray-600 hover:border-blue-500 transition-all"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="text-sm font-semibold text-gray-300 mb-2">Opacity</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue={selectedItems[0]?.opacity || 1}
            onChange={(e) => changeOpacity(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm"
          />
        </div>
      )}

      {/* Layers Panel */}
      {showLayersPanel && (
        <div className="absolute top-20 right-4 w-64 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-30 border border-gray-700/50 max-h-96 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-300 mb-3">Layers ({items.length})</div>
          <div className="space-y-1">
            {[...items].reverse().map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedIds([item.id])}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  selectedIds.includes(item.id) ? 'bg-blue-800/50' : 'hover:bg-gray-700'
                } text-gray-200`}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: item.fill || '#374151' }}>
                  {item.type === 'sticky' && <StickyNote size={16} className="text-gray-900" />}
                  {item.type === 'rect' && <Square size={16} className="text-gray-100" />}
                  {item.type === 'circle' && <CircleDot size={16} className="text-gray-100" />}
                  {item.type === 'text' && <Type size={16} style={{ color: item.fill || '#fff' }} />}
                  {item.type === 'line' && <Pencil size={16} style={{ color: item.stroke || '#fff' }} />}
                  {item.type === 'arrow' && <ArrowRight size={16} style={{ color: item.stroke || '#fff' }} />}
                </div>
                <div className="flex-1 text-sm truncate">{item.text || item.type}</div>
                <ToolBtn isSmall onClick={(e) => { e.stopPropagation(); toggleLock(); }} title="Lock/Unlock">
                  {item.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </ToolBtn>
                <ToolBtn isSmall onClick={(e) => { e.stopPropagation(); toggleVisibility(); }} title="Toggle Visibility">
                  {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </ToolBtn>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <>
              <div className="h-px bg-gray-700 my-3" />
              <div className="flex gap-2">
                <button onClick={bringToFront} className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Bring Forward
                </button>
                <button onClick={sendToBack} className="flex-1 px-3 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Send Back
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={drawMode !== 'pen' && drawMode !== 'line' && drawMode !== 'arrow' && drawMode !== 'circle' && drawMode !== 'eraser'}
        x={pos.x}
        y={pos.y}
        scaleX={scale}
        scaleY={scale}
        onDragEnd={onDragEnd}
        onWheel={handleWheel}
        style={{ touchAction: "none", cursor: drawMode ? (drawMode === 'eraser' ? 'crosshair' : 'crosshair') : 'grab' }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
      >
        <Layer>
          {/* 1. Background Rect */}
          <Rect x={-5000} y={-5000} width={10000} height={10000} fill="#1e293b" listening={false} />
          
          {/* 2. Grid pattern */}
          {showGrid && (
            Array.from({ length: 100 }).map((_, i) => (
              <React.Fragment key={i}>
                <Rect x={i * 100 - 5000} y={-5000} width={1} height={10000} fill="rgba(255,255,255,0.05)" listening={false} />
                <Rect x={-5000} y={i * 100 - 5000} width={10000} height={1} fill="rgba(255,255,255,0.05)" listening={false} />
              </React.Fragment>
            ))
)
          }
          
          {/* 3. All Items */}
          {items.filter(i => i.visible).map((item) => (
            <BoardItem
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              isLocked={item.locked}
              onSelect={(e) => { 
                if (drawMode === 'eraser') {
                    // Do nothing if in eraser mode (deletion is handled in handleStageMouseDown)
                    e.cancelBubble = true;
                    return;
                }
                if (e.evt.shiftKey || e.evt.ctrlKey) {
                  setSelectedIds(prev => prev.includes(item.id) 
                    ? prev.filter(id => id !== item.id) 
                    : [...prev, item.id]
                  );
                } else {
                  setSelectedIds([item.id]);
                }
                setShowPropertiesPanel(true);
              }}
              onTransformEnd={onTransformEnd}
              onDblClickText={item.type === 'text' || item.type === 'sticky' || item.type === 'rect' || item.type === 'circle' ? onDblClickText : undefined}
              setItems={setItems}
            />
          ))}

          {/* 4. Live Drawing Element */}
          {isDrawing && currentLine.length > 0 && drawMode === 'pen' && (
            <Line points={currentLine} stroke={COLORS.text[0]} strokeWidth={4} tension={0.5} lineCap="round" lineJoin="round" listening={false} />
          )}
          {/* ... (other live drawing elements, kept for reference but shortened for brevity) ... */}
          {isDrawing && currentLine.length > 0 && drawMode === 'line' && (
            <Line points={currentLine} stroke={COLORS.shape[0]} strokeWidth={3} listening={false} />
          )}
          {isDrawing && currentLine.length > 0 && drawMode === 'arrow' && (
            <Arrow points={currentLine} stroke={COLORS.shape[0]} strokeWidth={3} fill={COLORS.shape[0]} pointerLength={10} pointerWidth={10} listening={false} />
          )}
          {isDrawing && currentLine.length > 0 && drawMode === 'circle' && (
            <Circle x={currentLine[0]} y={currentLine[1]} radius={currentLine[2]} stroke={COLORS.shape[1]} strokeWidth={3} fill="transparent" listening={false} />
          )}

          {/* 5. Transformer */}
          {selectedIds.length > 0 && selectedItems.every(i => !i.locked) && (
            <Transformer
              ref={trRef}
              rotateEnabled
              enabledAnchors={["top-left","top-right","bottom-left","bottom-right"]}
              borderStroke="#3b82f6"
              anchorStroke="#3b82f6"
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
            />
          )}
        </Layer>
      </Stage>

      {/* Floating Action Button (Add Menu) */}
      <div className="absolute bottom-8 right-8 z-20">
        {showAddMenu && (
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 mb-2 border border-gray-700/50 absolute bottom-16 right-0 w-64">
            <AddMenuItem onClick={() => addSticky(COLORS.sticky[0])} icon={<StickyNote size={24} />} label="Sticky Note" color="bg-yellow-600/50 text-gray-100" />
            <AddMenuItem onClick={addText} icon={<Type size={24} />} label="Text" color="bg-blue-600/50 text-gray-100" />
            <AddMenuItem onClick={() => addRect(COLORS.shape[0])} icon={<Square size={24} />} label="Rectangle" color="bg-purple-600/50 text-gray-100" />
            <AddMenuItem onClick={() => addCircle(COLORS.shape[1])} icon={<CircleDot size={24} />} label="Circle" color="bg-pink-600/50 text-gray-100" />
            <AddMenuItem onClick={addArrow} icon={<ArrowRight size={24} />} label="Arrow" color="bg-green-600/50 text-gray-100" />
            <AddMenuItem onClick={() => alert("Image upload functionality not implemented yet.")} icon={<Image size={24} />} label="Image" color="bg-gray-600/50 text-gray-100" />
          </div>
        )}
        <button
          onClick={() => { setShowAddMenu(!showAddMenu); }}
          className={`w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center transition-all hover:bg-blue-700 active:scale-95`}
        >
          <Plus size={28} className={`transition-transform ${showAddMenu ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 left-8 p-2 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col items-center gap-1 z-20 border border-gray-700/50">
        <ToolBtn onClick={zoomIn} title="Zoom In">
          <ZoomIn size={20} />
        </ToolBtn>
        <div className="text-sm font-medium text-gray-300">{Math.round(scale * 100)}%</div>
        <ToolBtn onClick={zoomOut} title="Zoom Out">
          <ZoomOut size={20} />
        </ToolBtn>
        <div className="w-8 h-px bg-gray-700 my-1" />
        <ToolBtn onClick={fitToScreen} title="Fit to Screen">
          <Maximize2 size={20} />
        </ToolBtn>
      </div>
    </div>
  );
}

// --- Board Item Component (Crucial for Rendering) ---

function BoardItem({ item, isSelected, isLocked, onSelect, onTransformEnd, onDblClickText, setItems }) {
  const nodeRef = useRef();
    
    // Determine the text color for contrast inside shapes
    const getShapeTextColor = (fillColor) => {
        // Simple luminance check to decide between dark and light text
        if (!fillColor) return '#1f2937';
        const hex = fillColor.startsWith('#') ? fillColor.slice(1) : fillColor;
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5 ? '#1f2937' : '#f9fafb';
        }
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5 ? '#1f2937' : '#f9fafb';
        }
        return '#1f2937'; // Default to dark text
    };
    
  // Stable drag logic
  const onItemDragMove = useCallback((e) => {
    e.cancelBubble = true;
    
    const node = e.target;
    
    setItems((prev) => prev.map((it) => 
      (it.id === item.id 
        ? { ...it, x: node.x(), y: node.y(), rotation: node.rotation() } 
        : it)
    ));
  }, [item.id, setItems]);

  const commonProps = {
    id: `node-${item.id}`,
    ref: nodeRef,
    x: item.x || 0, y: item.y || 0,
    width: item.width, height: item.height,
    rotation: item.rotation || 0,
    opacity: item.opacity || 1,
    draggable: !isLocked,
    onClick: onSelect,
    onDblClick: onDblClickText ? () => onDblClickText(item) : undefined,
    onDragStart: (e) => { e.cancelBubble = true; },
    onDragMove: onItemDragMove,
    onDragEnd: (e) => {
        e.cancelBubble = true;
        setItems((prev) => prev.map((it) => 
            (it.id === item.id 
                ? { ...it, x: e.target.x(), y: e.target.y(), rotation: e.target.rotation() } 
                : it)
        ));
    },
    onTransformEnd: (e) => onTransformEnd(e.target, item),
    shadowColor: isSelected ? "#3b82f6" : (isLocked ? "transparent" : "rgba(0,0,0,0.1)"),
    shadowBlur: isSelected ? 16 : 8,
    shadowOpacity: isSelected ? 0.8 : 0.5,
    shadowOffset: { x: 0, y: isSelected ? 4 : 2 },
    perfectDrawEnabled: false, 
    isLocked: isLocked, 
  };

  // --- Sticky Note ---
  if (item.type === "sticky") {
    return (
      <Group {...commonProps}>
        <Rect 
          cornerRadius={16} 
          fill={item.fill} 
          stroke={item.stroke || "#f59e0b"} 
          strokeWidth={2} 
          width={item.width} 
          height={item.height} 
        />
        <Text 
          text={item.text} 
          padding={20} 
          fontSize={16} 
          fill="#1f2937" 
          wrap="word" 
          width={item.width} 
          height={item.height} 
          align="left" 
          verticalAlign="top"
          listening={false}
        />
      </Group>
    );
  }

  // --- Rectangle (with text) ---
  if (item.type === "rect") {
    return (
        <Group {...commonProps}>
            <Rect 
                fill={item.fill} 
                stroke={item.stroke || "#3b82f6"} 
                strokeWidth={3} 
                cornerRadius={item.cornerRadius || 16} 
                width={item.width}
                height={item.height}
            />
            <Text 
                text={item.text} 
                padding={10} 
                fontSize={16} 
                fill={getShapeTextColor(item.fill)} 
                wrap="word" 
                align="center" 
                verticalAlign="middle"
                width={item.width} 
                height={item.height} 
                listening={false}
            />
        </Group>
    );
  }

  // --- Circle (with text) ---
  if (item.type === "circle") {
    return (
      <Group 
        {...commonProps} 
        width={item.width} 
        height={item.height}
      >
        <Circle 
          x={item.width / 2} 
          y={item.height / 2} 
          radius={Math.min(item.width, item.height) / 2}
          fill={item.fill} 
          stroke={item.stroke || "#a78bfa"} 
          strokeWidth={3} 
        />
        <Text 
            text={item.text} 
            padding={10} 
            fontSize={16} 
            fill={getShapeTextColor(item.fill)}
            wrap="word" 
            align="center" 
            verticalAlign="middle"
            width={item.width} 
            height={item.height} 
            listening={false}
        />
      </Group>
    );
  }
  
  // --- Plain Text ---
  if (item.type === "text") {
    return (
      <Group {...commonProps}>
        <Rect fill="transparent" />
        <Text 
          text={item.text} 
          fontSize={item.fontSize || 28} 
          fontStyle={item.fontStyle || "normal"} 
          fill={item.fill || COLORS.text[0]} 
          align={item.align || "center"} 
          verticalAlign="middle" 
          width={item.width} 
          height={item.height}
        />
      </Group>
    );
  }

  // --- Line/Drawing (Selectable) ---
  if (item.type === "line" || item.type === "arrow") {
    const LineComponent = item.type === 'arrow' ? Arrow : Line;
    
    const lineProps = {
      id: `node-${item.id}`,
      ref: nodeRef,
      draggable: !isLocked,
      onClick: onSelect,
      onDragStart: (e) => { e.cancelBubble = true; }, // Prevent stage pan
      onDragMove: onItemDragMove,
      points: item.points,
      stroke: item.stroke || COLORS.shape[0],
      strokeWidth: item.strokeWidth,
      tension: item.type === 'line' ? item.tension || 0 : 0,
      lineCap: 'round',
      lineJoin: 'round',
      pointerLength: item.type === 'arrow' ? 10 : undefined,
      pointerWidth: item.type === 'arrow' ? 10 : undefined,
      fill: item.type === 'arrow' ? (item.stroke || COLORS.shape[0]) : undefined,
      x: item.x || 0, 
      y: item.y || 0,
      opacity: item.opacity || 1,
      hitStrokeWidth: 15, // Increase hit area for easier selection/drag on lines
      onTransformEnd: (e) => onTransformEnd(e.target, item), // Allows resizing
      onDragEnd: (e) => {
        e.cancelBubble = true;
        const node = e.target;
        const deltaX = node.x() - (item.x || 0);
        const deltaY = node.y() - (item.y || 0);
         
        setItems((prev) => prev.map((it) => {
          if (it.id === item.id) {
            return {
              ...it,
              points: it.points.map((p, i) => p + (i % 2 === 0 ? deltaX : deltaY)),
              x: 0, 
              y: 0,
            };
          }
          return it;
        }));
        node.position({ x: 0, y: 0 }); 
      },
    };
    
    return <LineComponent {...lineProps} />;
  }

  return null;
}

// --- Utility Components (Keep the same) ---

function ToolBtn({ children, disabled, onClick, title, active, isSmall }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${isSmall ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center transition-all text-gray-300 ${
        disabled 
          ? "opacity-30 cursor-not-allowed" 
          : active 
            ? "bg-blue-800/50 text-blue-400" 
            : "hover:bg-gray-700 active:scale-95"
      }`}
    >
      {children}
    </button>
  );
}

function AddMenuItem({ onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-700 transition-all active:scale-95 text-gray-200"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}