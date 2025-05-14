"use client";

import axios from "axios";
import Alert from "@mui/material/Alert";
import { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Map from "./components/Map";
import useMap from "./hooks/useMap";
import Image from "next/image";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

export default function Home() {
  const { showBusinesses, clearBusinesses, highlightBusiness } = useMap();
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    createSession();
  }, []);

  const onAction = (action: string, args: any) => {
    switch (action) {
      case "showBusinesses":
        showBusinesses({ businesses: args, reset: true });
        break;
      case "showInterestedBusinesses":
        showBusinesses({
          businesses: args,
          reset: true,
          interested: true,
          color: "green",
        });
        break;
      case "showPromisingBusinesses":
        showBusinesses({ businesses: args, reset: true, promising: true });
        break;
      case "highlightBusiness":
        highlightBusiness(args);
        break;
      case "clearBusinesses":
        clearBusinesses();
        break;
      case "showError":
        setError(`${args}`);
        break;
    }
  };

  const createSession = async () => {
    try {
      setInitializing(true);
      const response = await axios.get("/api/chat");
      setSessionId(response.data.sessionId);
    } catch (e) {
      setError(`${e}`);
    } finally {
      setInitializing(false);
    }
  };

  const deleteSession = async () => {
    try {
      await axios.delete("/api/chat", { data: { sessionId: sessionId } });
      setSessionId("");
    } catch (e) {
      setError(`${e}`);
    }
  };

  const clearChat = async () => {
    setError("");
    setInitializing(true);
    try {
      await deleteSession();
      clearBusinesses();
      await createSession();
    } catch (e) {
      setError(`${e}`);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <main>
      <header className="h-[50px] flex justify-center items-center gap-2">
        <Image
          alt="QuantumCoupon AI"
          src="https://res.cloudinary.com/dlfqo15qy/image/upload/v1704256067/quantum-coupon/QuantumCoupon_AI_1_lsxj7z.png"
          width={250}
          height={50}
        />
        <button
          className="group bg-slate-100 h-[32px] rounded flex items-center justify-center text-sm text-slate-500 hover:bg-slate-200 transition-all ease-in-out px-4 absolute right-4"
          onClick={clearChat}
        >
          New Chat
        </button>
      </header>
      <div className="flex h-[calc(100vh-50px)]">
        <div className="relative flex-shrink-0 w-1/2 px-6 pb-6">
          <Map />
        </div>
        {!initializing && (
          <Chat className="w-1/2" onAction={onAction} sessionId={sessionId} />
        )}
        {initializing && (
          <div className="flex flex-1 justify-center items-center">
            <CircularProgress />
          </div>
        )}
      </div>
      <Snackbar open={error.length > 0}>
        <Alert
          action={
            <Button color="error" size="small" onClick={clearChat}>
              TRY AGAIN
            </Button>
          }
          severity="error"
          sx={{ width: "100%" }}
        >
          Server communication error - {error}
        </Alert>
      </Snackbar>
    </main>
  );
}
