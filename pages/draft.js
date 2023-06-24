import Logger, { LogEntry } from "../components/logger";
import styles from "../styles/draft.module.css";
import { Logo } from "@/components/Icons/Logo";
import PlayerCard from "@/components/PlayerCard";
import { configureAbly } from "@ably-labs/react-hooks";
import { Text } from "@nextui-org/react";
import * as Ably from "ably/promises";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Draft() {
  const [logs, setLogs] = useState([]);
  const [channel, setChannel] = useState(null);
  const [timer, setTimer] = useState(60); // Add this state
  const [playerData, setPlayerData] = useState([]); // state for the player data

  const startCountdown = () => {
    setTimer(60);
    const intervalId = setInterval(() => {
      setTimer((timer) => {
        if (timer === 1) clearInterval(intervalId);
        return timer - 1;
      });
    }, 1000);
  };

  const { data: session, status } = useSession();

  useEffect(() => {
    const ably = configureAbly({ authUrl: "/api/authentication/token-auth" });

    ably.connection.on((stateChange) => {
      console.log(stateChange);
    });

    const _channel = ably.channels.get("draft");
    _channel.subscribe((message) => {
      console.log(message);

      if (message.name === "choose_event") {
        // store the player data in state
        setPlayerData(message.data.drawnPlayers);
        console.log(playerData);
      }
    });
    setChannel(_channel);

    return () => {
      _channel.unsubscribe();
    };
  }, []); // Only run the client

  useEffect(() => {
    if (channel === null) return;

    if (status === "authenticated" && session.osu_id) {
      channel.publish("USER CONNECTED", { text: `User ${session.osu_id} connected to the draft` });
    }
  }, [channel, session?.osu_id, status]);

  const publicFromServerHandler = (_event) => {
    fetch("/api/pub-sub/publish", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ text: `test message @ ${new Date().toISOString()}` }),
    });
  };

  const onCardClick = (playerId) => {
    // find the player in the playerData array
    const chosenPlayer = playerData.find((player) => player.id === playerId);

    // Publish the response
    channel.publish("response_event", {
      captainId: chosenPlayer.captainId,
      chosenPlayer: chosenPlayer,
    });
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.logo}>
        <Logo width={120} height={40} />
      </Link>
      <Text
        h1
        className={styles.title}
        css={{
          textGradient: "45deg, $blue600 -10%, $pink600 100%",
          textAlign: "center",
        }}
      >
        SEGA Draft
      </Text>
      <div className={styles["card-grid"]}>
        {playerData.map((player, index) => (
          <div onClick={() => onCardClick(player.id)} key={index}>
            <PlayerCard width={250} id={player.id} />
          </div>
        ))}
      </div>
      <div className={styles.timer}></div>
      <div className={styles["left-side"]}></div>
      <div className={styles["right-side"]}></div>
    </div>
  );
}
