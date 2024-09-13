export default function Overlay({ children, width, height }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column", // Added this line
        justifyContent: "center",
        alignItems: "center",
        width: width,
        height: height,
        backgroundColor: "rgba(100, 100, 100, 0.65)",
        zIndex: 100,
        padding: "20px", // Added padding for better spacing
        boxSizing: "border-box", // Ensures padding is included in width/height
        gap: "10px", // Adds space between child elements
      }}
    >
      {children}
    </div>
  );
}
