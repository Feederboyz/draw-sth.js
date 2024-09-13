import CanvasDraw from "@/CanvasDraw/index";
import { forwardRef, useImperativeHandle } from "react";
import { useRef, useState } from "react";
import styles from "./Canvas.module.css";
import StatusBar from "@/StatusBar";

export default forwardRef((props, ref) => {
  const canvasDrawRef = useRef(null);
  const statusBarRef = useRef(null);
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
      statusBarRef.current && statusBarRef.current.socketOn();
    },
    socketOff: () => {
      canvasDrawRef.current.socketOff();
      statusBarRef.current && statusBarRef.current.socketOff();
    },
    eraseAll: () => {
      canvasDrawRef.current.eraseAll();
    },
    clear: () => {
      canvasDrawRef.current.clear();
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
    { color: "#fff", handler: () => setBrushColor("#fff") },
    { color: "#000", handler: () => setBrushColor("#000") },
    { color: "#888", handler: () => setBrushColor("#888") },
    { color: "#f88", handler: () => setBrushColor("#f88") },
    { color: "#8f8", handler: () => setBrushColor("#8f8") },
    { color: "#88f", handler: () => setBrushColor("#88f") },
    { color: "#ff8", handler: () => setBrushColor("#ff8") },
    { color: "#f8f", handler: () => setBrushColor("#f8f") },
    { color: "#8ff", handler: () => setBrushColor("#8ff") },
  ];

  const brushRadiusList = [4, 8, 12, 16];
  const handleBrushRadius = (event) => {
    const brushRadius = event.target.value;
    setBrushRadius(brushRadius);
  };

  return (
    <div id={styles.wrapper}>
      <StatusBar ref={statusBarRef} />
      <div className={styles.flexRow}>
        <div id={styles.toolbar}>
          <div id={styles.colorPalette}>
            {colorList.map(({ color, handler }) => (
              <button
                key={color}
                className={styles.colorButton}
                style={{
                  backgroundColor: color,
                }}
                onClick={handler}
              />
            ))}
          </div>
          <div id={styles.funcController}>
            <button className={styles.button} onClick={handleUndo}>
              ↺
            </button>
            <button className={styles.button} onClick={handleClear}>
              🗑️
            </button>
          </div>
          <div id={styles.brushController}>
            {brushRadiusList.map((brushRadius) => (
              <button
                className={styles.brushButton}
                key={brushRadius}
                onClick={(e) => {
                  handleBrushRadius(e);
                }}
                value={brushRadius}
              >
                {brushRadius} px
              </button>
            ))}
          </div>
        </div>

        <CanvasDraw
          hideGrid={true}
          lazyRadius={2}
          canvasWidth={600}
          canvasHeight={600}
          brushRadius={brushRadius}
          brushColor={brushColor}
          ref={canvasDrawRef}
        />
      </div>
    </div>
  );
});
