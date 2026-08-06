import { useEffect } from "react";
import { socket } from "./lib/socket";
import AppRouter from "./router";

export default function App() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <AppRouter />;
}