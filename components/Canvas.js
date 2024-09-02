import CanvasDraw from "@/CanvasDraw/index";
import ColorPalette from "@/ColorPalette";
import { forwardRef, useImperativeHandle } from "react";
import { useRef, useState } from "react";

export default forwardRef((props, ref) => {
  const canvasDrawRef = useRef(null);
  const [brushColor, setBrushColor] = useState("#444");
  const [brushRadius, setBrushRadius] = useState(8);

  useImperativeHandle(ref, () => ({
    saveLine: ({ points, brushColor, brushRadius }, triggerEmit) => {
      canvasDrawRef.current.saveLine(
        { points, brushColor, brushRadius },
        triggerEmit
      );
    },
    drawPoints: ({ points, brushColor, brushRadius }, triggerEmit) => {
      canvasDrawRef.current.drawPoints(
        { points, brushColor, brushRadius },
        triggerEmit
      );
    },
    undo: (triggerEmit) => {
      canvasDrawRef.current.undo(triggerEmit);
    },
    socketOn: () => {
      canvasDrawRef.current.socketOn();
    },
    socketOff: () => {
      canvasDrawRef.current.socketOff();
    },
    eraseAll: () => {
      canvasDrawRef.current.eraseAll();
    },
  }));

  const handleUndo = (event) => {
    canvasDrawRef.current.undo();
  };

  const handleClear = (event) => {
    canvasDrawRef.current.eraseAll();
  };

  const colorList = [
    { color: "#444", handler: () => setBrushColor("#444") },
    { color: "#f00", handler: () => setBrushColor("#f00") },
    { color: "#0f0", handler: () => setBrushColor("#0f0") },
    { color: "#00f", handler: () => setBrushColor("#00f") },
    { color: "#ff0", handler: () => setBrushColor("#ff0") },
    { color: "#f0f", handler: () => setBrushColor("#f0f") },
    { color: "#0ff", handler: () => setBrushColor("#0ff") },
  ];

  const brushRadiusList = [4, 8, 12];
  const handleBrushRadius = (event) => {
    const brushRadius = event.target.value;
    setBrushRadius(brushRadius);
  };

  return (
    <>
      <CanvasDraw
        hideGrid={true}
        lazyRadius={2}
        brushRadius={brushRadius}
        brushColor={brushColor}
        ref={canvasDrawRef}
      />
      <ColorPalette colorList={colorList} />
      <br />
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleClear}>Erase all</button>
      <br />
      {brushRadiusList.map((brushRadius) => (
        <button
          key={brushRadius}
          onClick={handleBrushRadius}
          value={brushRadius}
        >
          {brushRadius}px
        </button>
      ))}
    </>
  );
});
