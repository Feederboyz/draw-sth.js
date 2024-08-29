import CanvasDraw from "@/CanvasDraw/index";
import ColorPalette from "@/ColorPalette";
import { forwardRef, useImperativeHandle } from "react";
import { useRef, useState } from "react";

export default forwardRef((props, ref) => {
  const canvasDrawRef = useRef(null);
  const [brushColor, setBrushColor] = useState("#444");

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
  }));

  const handleUndo = (event) => {
    canvasDrawRef.current.undo();
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

  return (
    <>
      <CanvasDraw
        hideGrid={true}
        lazyRadius={2}
        brushColor={brushColor}
        ref={canvasDrawRef}
      />
      <ColorPalette colorList={colorList} />
      <button onClick={handleUndo}>Undo</button>
    </>
  );
});
