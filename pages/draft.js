import Logger, { LogEntry } from "../components/logger";
import styles from "../styles/draft.module.css";
import { Logo } from "@/components/Icons/Logo";
import PlayerCard from "@/components/PlayerCard";
import { configureAbly } from "@ably-labs/react-hooks";
import { Spacer, Text, Button, Modal } from "@nextui-org/react";
import * as Ably from "ably/promises";
import { motion } from "framer-motion";
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
  const [timeouts, setTimeouts] = useState([]);
  const [countdownEnded, setCountdownEnded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [draftedPlayer, setDraftedPlayer] = useState(null);
  const [round, setRound] = useState(null);

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
          setDeadline(null);
          setTimerKey((prevKey) => prevKey + 1);
          setClickedCards([]);
          setTimeouts([]);
          setCountdownEnded(false);
          setDraftedPlayer(null);

          // Automatically 'click' each card one by one
          message.data.drawnPlayers.forEach((player, index) => {
            const timeoutId = setTimeout(() => {
              setClickedCards((prevCards) => [...prevCards, player.id]);
            }, 3500 * (index + 1));

            setTimeouts((prevTimeouts) => [...prevTimeouts, timeoutId]);
          });
        } /* else {
          setPlayerData([]);
          setCaptainId(message.data.captainId);
          setCaptainName(message.data.captainName);
          setDeadline(null);
          setTimerKey((prevKey) => prevKey + 1);
          setClickedCards([]);
          setTimeouts([]);
          setCountdownEnded(false);
        } */
      }

      /* if (message.name == "response_event") {
        setCaptainId(message.data.captainId);
        setCaptainName(message.data.captainName);
        setDraftedPlayer(message.data.chosenPlayer.id); // or whichever property the username is under
      } */

      if (message.name === "current_round") {
        setRound(message.data.round);
      }
    });
    setChannel(_channel);
    return () => {
      _channel.unsubscribe();
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [osuId, timeouts]);

  useEffect(() => {
    if (channel === null) return;
    if (status === "authenticated" && session.osu_id) {
      channel.publish("USER CONNECTED", { id: `${session.osu_id}` });
      setOsuId(session.osu_id);
    }
  }, [channel, session?.osu_id, status]);

  useEffect(() => {
    // Begin countdown when all cards have been clicked
    if (playerData.length === 0) return;
    if (clickedCards.length === playerData.length) {
      setDeadline(Date.now() + 60 * 1000); // Start the countdown
      setTimerKey((prevKey) => prevKey + 1);
    }
  }, [clickedCards, playerData]);

  /* const onCardClick = (playerId) => {
    setClickedCards((prevCards) => {
      if (!prevCards.includes(playerId)) {
        return [...prevCards, playerId];
      }
      return prevCards;
    });
  }; */

  const onDraftClick = (playerId) => {
    if (captainId == session.osu_id || session.osu_id == "12058601") {
      // find the player in the playerData array
      const chosenPlayer = playerData.find((player) => player.id === playerId);

      // Publish the response
      channel.publish("response_event", {
        captainId: session.osu_id,
        chosenPlayer: chosenPlayer,
        captainName: captainName,
      });
    }

    //setSelectedCard(null);
  };

  // Renderer callback with condition to render only minute and seconds
  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      setCountdownEnded(true); // update countdown status
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
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {clickedCards.length === playerData.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className={styles.timesPulledTitle}
              >
                <Text h4>{"Times Pulled: " + player.timesPulled}</Text>
              </motion.div>
            )}

            <PlayerCard width={340} id={`${player.id}`} flipped={clickedCards.includes(player.id)} tier={player.tier} />

            {clickedCards.length === playerData.length && (
              <motion.div
                className={styles["button-placeholder"]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {countdownEnded && osuId == "12058601" ? (
                  <Button flat color="error" style={{ marginTop: "10px" }} onClick={() => onDraftClick(player.id)}>
                    Draft
                  </Button>
                ) : countdownEnded ? (
                  <Button flat disabled color="error" style={{ marginTop: "10px" }}>
                    Draft
                  </Button>
                ) : (
                  <Button flat style={{ marginTop: "10px" }} onClick={() => onDraftClick(player.id)}>
                    Draft
                  </Button>
                )}
              </motion.div>
            )}
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
