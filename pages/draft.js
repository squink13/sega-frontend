import Logger, { LogEntry } from "../components/logger";
import styles from "../styles/draft.module.css";
import { Logo } from "@/components/Icons/Logo";
import PlayerCard from "@/components/PlayerCard";
import { configureAbly } from "@ably-labs/react-hooks";
import { Spacer, Text, Button } from "@nextui-org/react";
import * as Ably from "ably/promises";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";

export default function Draft() {
  const [channel, setChannel] = useState(null);
  const [playerData, setPlayerData] = useState([]);
  const [captainId, setCaptainId] = useState([]);
  const [captainName, setCaptainName] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [clickedCards, setClickedCards] = useState([]);

  const { data: session, status } = useSession();

  const [osuId, setOsuId] = useState(null);

  useEffect(() => {
    const ably = configureAbly({ authUrl: "/api/authentication/token-auth" });
    ably.connection.on((stateChange) => {
      console.log(stateChange);
    });
    const _channel = ably.channels.get("draft");
    _channel.subscribe((message) => {
      console.log(message);
      // HANDLE INCOMING MESSAGES HERE

      if (message.name === "choose_event") {
        // store the player data in state
        console.log(osuId);
        if (message.data.captainId == osuId || osuId == "12058601") {
          setPlayerData(message.data.drawnPlayers);
          setCaptainId(message.data.captainId);
          setCaptainName(message.data.captainName);
          setDeadline(Date.now() + 70 * 1000);
          setTimerKey((prevKey) => prevKey + 1);
          setClickedCards([]);
        } else {
          setPlayerData([]);
          setCaptainId(message.data.captainId);
          setCaptainName(message.data.captainName);
          setDeadline(null);
          setTimerKey((prevKey) => prevKey + 1);
          setClickedCards([]);
        }
      }
    });
    setChannel(_channel);
    return () => {
      _channel.unsubscribe();
    };
  }, [osuId]);

  useEffect(() => {
    if (channel === null) return;
    if (status === "authenticated" && session.osu_id) {
      channel.publish("USER CONNECTED", { id: `${session.osu_id}` });
      setOsuId(session.osu_id);
    }
  }, [channel, session?.osu_id, status]);

  const onCardClick = (playerId) => {
    setClickedCards((prevCards) => [...prevCards, playerId]);
  };

  const onDraftClick = (playerId) => {
    if (captainId == session.osu_id || session.osu_id == "12058601") {
      // find the player in the playerData array
      const chosenPlayer = playerData.find((player) => player.id === playerId);

      // Publish the response
      channel.publish("response_event", {
        captainId: session.osu_id,
        chosenPlayer: chosenPlayer,
      });
    }

    //setSelectedCard(null);
  };

  // Renderer callback with condition to render only minute and seconds
  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      return <div>Out of time!</div>;
    } else {
      return (
        <span>
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </span>
      );
    }
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
      <Spacer y={1} />
      {captainName && (
        <Text h2 className={styles.captainTitle}>
          {captainName + " is currently drafting"}
        </Text>
      )}
      <div className={styles["card-grid"]}>
        {playerData.map((player, index) => (
          <div
            onClick={() => onCardClick(player.id)}
            key={index}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlayerCard width={340} id={`${player.id}`} />
            <div className={styles["button-placeholder"]}>
              {clickedCards.includes(player.id) && (
                <Button flat auto style={{ marginTop: "10px" }} onClick={() => onDraftClick(player.id)}>
                  Draft
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.timer}>
        <Text h2>{deadline && <Countdown key={timerKey} date={deadline} renderer={renderer} />}</Text>
      </div>
      <div className={styles["left-side"]}></div>
      <div className={styles["right-side"]}></div>
    </div>
  );
}
