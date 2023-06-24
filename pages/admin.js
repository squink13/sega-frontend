import styles from "../styles/draft.module.css";
import { Logo } from "@/components/Icons/Logo";
import PlayerCard from "@/components/PlayerCard";
import { configureAbly } from "@ably-labs/react-hooks";
import { Text } from "@nextui-org/react";
import * as Ably from "ably/promises";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Admin() {
  const [channel, setChannel] = useState(null);
  const [draftState, setDraftState] = useState("paused");

  function toggleDraft() {
    const newState = draftState === "running" ? "paused" : "running";

    channel.publish("update", { state: newState }, (err) => {
      if (err) {
        console.log("Unable to publish message; err = " + err.message);
      } else {
        setDraftState(newState);
      }
    });
  }

  useEffect(() => {
    const ably = configureAbly({ authUrl: "/api/authentication/token-auth" });

    ably.connection.on((stateChange) => {
      console.log(stateChange);
    });

    const _channel = ably.channels.get("draft");
    _channel.subscribe((message) => {
      console.log(message);
      //setLogs((prev) => [...prev, new LogEntry(`✉️ event name: ${message.name} text: ${message.data.text}`)]);
    });
    setChannel(_channel);

    return () => {
      _channel.unsubscribe();
    };
  }, []); // Only run the client

  return (
    <div>
      <button onClick={toggleDraft}>{draftState === "running" ? "Pause Draft" : "Start Draft"}</button>
    </div>
  );
}
