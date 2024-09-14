import { Suspense } from "react";
import RoomContent from "@//RoomContent";

export default function RoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomContent />
    </Suspense>
  );
}
