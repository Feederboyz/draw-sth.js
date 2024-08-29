import CanvasDraw from "@/CanvasDraw/index";
import { forwardRef, useImperativeHandle } from "react";
import { useRef } from "react";

export default forwardRef((props, ref) => {
  const canvasDrawRef = useRef(null);
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

  return (
    <>
      <CanvasDraw hideGrid={true} lazyRadius={2} ref={canvasDrawRef} />
      <button onClick={handleUndo}>Undo</button>
    </>
  );
});
