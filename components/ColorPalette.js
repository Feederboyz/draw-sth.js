export default function ColorPalette({ colorList }) {
  return (
    <>
      {colorList.map(({ color, handler }) => (
        <button
          key={color}
          style={{
            backgroundColor: color,
            width: "20px",
            height: "20px",
            margin: "5px",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handler}
        />
      ))}
    </>
  );
}
