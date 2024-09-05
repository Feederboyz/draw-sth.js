export default function Overlay({ children, width, height }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: width,
        height: height,
        backgroundColor: "rgba(100, 100, 100, 0.65)",
        zIndex: 100,
      }}
    >
      {children}
    </div>
  );
}
