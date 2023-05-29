import { BadgeFilter, BwsRankCalc } from "@/util/OsuUtils";
import * as NextUI from "@nextui-org/react";
import { Modal, Text, Input, Row, Checkbox, Button, Card, useTheme, Link } from "@nextui-org/react";
import moment from "moment-timezone";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import React from "react";
import { Rating } from "react-simple-star-rating";

export default function Register() {
  const { data: session, status } = useSession();

  const [osuData, setOsuData] = useState(null);
  const [discordData, setDiscordData] = useState(null);

  useEffect(() => {
    const fetchOsuUser = async () => {
      if (session) {
        const response = await fetch("/api/db/getOsuUser", {
          method: "POST",
          body: JSON.stringify({ userId: session.sub }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        return data;
      }
    };

    const fetchDiscordUser = async () => {
      if (session) {
        const response = await fetch("/api/db/getDiscordUser", {
          method: "POST",
          body: JSON.stringify({ userId: session.sub }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        return data;
      }
    };

    const fetchUserData = async () => {
      const osuUserData = await fetchOsuUser();
      const discordUserData = await fetchDiscordUser();

      setOsuData(osuUserData);
      setDiscordData(discordUserData);
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const { isDark } = useTheme();
  const [selected, setSelected] = useState([]);
  const [visible, setVisible] = useState(false);
  const handler = () => setVisible(true);
  const closeHandler = () => setVisible(false);
  const [timezone, setTimezone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [stats, setStats] = useState({
    Aim: 0,
    Control: 0,
    Speed: 0,
    Reading: 0,
    Stamina: 0,
    Tech: 0,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
    setTotal(totalStats);
  }, [stats]);

  const handleStatChange = (statName, value) => {
    setStats((prevStats) => ({ ...prevStats, [statName]: value }));
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  };

  const itemStyle = {
    display: "flex",
    flexDirection: "column",
  };

  const [agreements, setAgreements] = useState({
    readRules: false,
    stayInDiscord: false,
    beCaptainOrPlayer: false,
    acceptForfeitureRules: false,
    agreeToPlayTimes: false,
  });

  useEffect(() => {
    const zone = moment.tz.guess();
    let offset = moment.tz(zone).utcOffset() / 60;
    offset = Math.floor(offset);
    offset = parseInt(offset);
    setTimezone(offset);
  }, []);

  const handleAgreementChange = (agreementName) => {
    setAgreements((prevAgreements) => ({
      ...prevAgreements,
      [agreementName]: !prevAgreements[agreementName],
    }));
  };

  const leftColumnOptions = [
    "Low AR",
    "Consistency",
    "Speed",
    "Reading",
    "Low SR",
    "High SR",
    "High AR",
    "Streams",
    "Alt",
    "Finger Control",
    "NM1",
    "NM2",
    "Freemod",
    "HD2",
    "HR2",
    "Antimod",
    "Doubletime",
    "Stamina",
    "Hard Rock",
    "Hidden",
    "Nomod",
    "Gimmick",
    "HDHR",
    "Flashlight",
    "Easy",
    "Precision",
    "Technical",
    "Accuracy",
    "Slider Aim",
    "High BPM",
    "Low BPM",
    "Jumps",
    "Flow Aim",
    "Snap Aim",
    "Rhythm",
    "Squink",
    "Choke",
    "Aim",
    "Aim Control",
    "Snap Alt",
    "Flow Alt",
    "EZHD",
    "Chill",
  ].sort();

  const rightColumnOptions = [
    "Player",
    "Guy",
    "Talent",
    "Chef",
    "God",
    "Demon",
    "One-trick",
    "Slave",
    "Artist",
    "Expert",
    "Clown",
    "Master",
    "Novice",
    "Beginner",
    "Pro",
    "Rookie",
    "Veteran",
    "Genius",
    "Maestro",
    "Legend",
    "All-rounder",
    "Gamer",
    "Hater",
    "Lover",
    "Enthusiast",
    "Specialist",
    "Enjoyer",
  ].sort();

  function randomizeOptions() {
    const randomLeftOption = leftColumnOptions[Math.floor(Math.random() * leftColumnOptions.length)];
    const randomRightOption = rightColumnOptions[Math.floor(Math.random() * rightColumnOptions.length)];

    setSelectedLeftOption(randomLeftOption);
    setSelectedRightOption(randomRightOption);
  }

  const [selectedLeftOption, setSelectedLeftOption] = useState(null);
  const [selectedRightOption, setSelectedRightOption] = useState(null);

  //const [canSubmit, setCanSubmit] = useState(false);

  function checkCanSubmit() {
    if (selectedLeftOption && selectedRightOption) {
      if (
        total >= 10 &&
        total <= 24 &&
        Object.values(stats).every((value) => value >= 1) &&
        Object.values(agreements).every((value) => value)
      ) {
        return true;
      }
    }
    return false;
  }

  let errorCheck = false;

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkCanSubmit()) {
      const data = {
        userId: session.sub,
        title: selectedLeftOption + " " + selectedRightOption,
        stats: stats,
        timezone: timezone,
      };

      try {
        const response = await fetch("/api/createRegistration", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const resData = await response.json();

        if (!response.ok) {
          alert("Something went wrong. Error: " + resData.message);
          return;
        }

        console.log(resData);
        router.push("/success");
      } catch (error) {
        console.log("Error:", error);
        alert("Something went wrong. Error: " + error);
      }
    } else {
      alert("Double check that you have filled out all the fields and agreed to the rules.");
    }
  };

  return (
    <>
      <NextUI.Text
        h1
        css={{
          textGradient: "45deg, $blue600 -10%, $pink600 100%",
          textAlign: "center",
        }}
      >
        {"Registration"}
      </NextUI.Text>
      <NextUI.Spacer y={1} />

      {session && (
        <>
          {session.provider && session.provider !== "discord" ? (
            <NextUI.Button
              auto
              color={"gradient"}
              href="#"
              onPress={() => {
                signIn("discord");
              }}
              shadow
            >
              Connect your Discord account
            </NextUI.Button>
          ) : session.provider === "discord" ? (
            <div style={{ maxWidth: "600px" }}>
              {osuData && discordData && (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "600px" }}>
                  <NextUI.Input
                    label="Username"
                    type="text"
                    value={osuData.username}
                    readOnly
                    style={{ color: "grey" }}
                  />
                  <NextUI.Spacer y={1} />
                  <NextUI.Input label="ID" type="text" value={osuData.id} readOnly style={{ color: "grey" }} />
                  <NextUI.Spacer y={1} />
                  <NextUI.Input
                    label="Country"
                    type="text"
                    value={osuData.country.name}
                    readOnly
                    style={{ color: "grey" }}
                  />
                  <NextUI.Spacer y={1} />
                  <NextUI.Input
                    label="Rank"
                    type="text"
                    value={`# ${osuData.statistics.global_rank.toLocaleString()}`}
                    readOnly
                    style={{ color: "grey" }}
                  />
                  <NextUI.Spacer y={1} />
                  <NextUI.Input
                    label="Badges"
                    type="text"
                    value={BadgeFilter(osuData)}
                    readOnly
                    style={{ color: "grey" }}
                  />
                  <NextUI.Spacer y={1} />
                  <NextUI.Input
                    label="BWS Rank"
                    type="text"
                    value={`# ${BwsRankCalc(osuData.statistics.global_rank, BadgeFilter(osuData)).toLocaleString()}`}
                    readOnly
                    style={{ color: "grey" }}
                  />
                  <NextUI.Spacer y={1} />
                  <NextUI.Input
                    label="Discord"
                    type="text"
                    value={`${discordData.username}#${discordData.discriminator}`}
                    readOnly
                    style={{ color: "grey" }}
                  />
                  <NextUI.Spacer y={1} />
                  {/* TODO: add regex/slider input to allow players to change their timezone at signup.*/}
                  <NextUI.Tooltip
                    content="Contact Squink after registering if default timezone is incorrect"
                    color="primary"
                  >
                    <NextUI.Input
                      label="Timezone"
                      type="text"
                      value={`UTC${timezone >= 0 ? "+" : ""}${timezone}`}
                      readOnly
                      width="600px"
                      style={{ color: "grey" }}
                    />
                  </NextUI.Tooltip>
                  <NextUI.Spacer y={1} />
                  <Text h4>Title</Text>
                  <Text>
                    Create a title for your player card that fits your playstyle. Feel free to suggest more options in
                    the discord server!
                  </Text>
                  <NextUI.Spacer y={0.3} />
                  {!selectedLeftOption && !selectedRightOption ? (
                    <Text color="error" h6>
                      Please set a title.
                    </Text>
                  ) : null}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <NextUI.Input
                      labelLeft="Title"
                      type="text"
                      value={
                        selectedLeftOption && selectedRightOption ? `${selectedLeftOption} ${selectedRightOption}` : ""
                      }
                      readOnly
                      fullWidth
                      style={{ flex: "1" }}
                      onClick={handler}
                    />
                    <Button flat onPress={handler} auto>
                      Set Title
                    </Button>
                  </div>
                  <Modal
                    closeButton
                    blur
                    aria-labelledby="modal-title"
                    open={visible}
                    onClose={closeHandler}
                    width="500px"
                    scroll
                  >
                    <Modal.Header>
                      <Text id="modal-title" h3>
                        Create your title
                      </Text>
                    </Modal.Header>
                    <Modal.Body>
                      <Text
                        h4
                        css={{
                          textAlign: "center",
                        }}
                      >
                        {selectedLeftOption && selectedRightOption
                          ? `${selectedLeftOption} ${selectedRightOption}`
                          : "None"}
                      </Text>
                      <NextUI.Spacer y={0.5} />
                      <div style={{ display: "flex", justifyContent: "space-around" }}>
                        <div
                          style={{ overflow: "auto", maxHeight: "400px", backgroundColor: isDark ? "#333" : "#fff" }}
                        >
                          {leftColumnOptions.map((option, index) => (
                            <div
                              key={index}
                              onClick={() => setSelectedLeftOption(option)}
                              style={{
                                padding: "10px",
                                cursor: "pointer",
                                backgroundColor:
                                  selectedLeftOption === option
                                    ? isDark
                                      ? "#AEAEAE"
                                      : "#DDD"
                                    : isDark
                                    ? "#16181a"
                                    : "#FFF",
                                color: isDark ? "#fff" : "#000",
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                        <div
                          style={{ overflow: "auto", maxHeight: "400px", backgroundColor: isDark ? "#333" : "#fff" }}
                        >
                          {rightColumnOptions.map((option, index) => (
                            <div
                              key={index}
                              onClick={() => setSelectedRightOption(option)}
                              style={{
                                padding: "10px",
                                cursor: "pointer",
                                backgroundColor:
                                  selectedRightOption === option
                                    ? isDark
                                      ? "#AEAEAE"
                                      : "#DDD"
                                    : isDark
                                    ? "#16181a"
                                    : "#FFF",
                                color: isDark ? "#fff" : "#000",
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer style={{ display: "flex", justifyContent: "space-between" }}>
                      <Button shadow color={"gradient"} auto onPress={() => randomizeOptions()}>
                        Randomize
                      </Button>
                      <Button auto onPress={closeHandler}>
                        Done
                      </Button>
                    </Modal.Footer>
                  </Modal>
                  <NextUI.Spacer y={1} />
                  <Text h4>Stats</Text>
                  <Text>May be used by captains to aid in drafting decisions.</Text>
                  <NextUI.Spacer y={0.3} />
                  {total < 10 || total > 24 || !Object.values(stats).every((value) => value >= 1) ? (
                    <Text color="error" h6>
                      {total < 10 && " Please allocate at least 10 points."}
                      {total > 24 && " You may select a maximum of 24 points."}
                      {!Object.values(stats).every((value) => value >= 1) &&
                        " Each stat must have at least 1 point allocated."}
                    </Text>
                  ) : null}
                  <Card variant="flat" style={{ padding: "12px" }}>
                    <div className="app">
                      <div style={gridStyle}>
                        {Object.keys(stats).map((statName) => (
                          <div style={itemStyle} key={statName}>
                            <NextUI.Text>{statName}:</NextUI.Text>
                            <Rating
                              onClick={(value) => handleStatChange(statName, value)}
                              ratingValue={stats[statName]}
                              /* other props as needed */
                            />
                          </div>
                        ))}
                      </div>
                      <Text h5>Total Selected: {total}</Text>
                    </div>
                  </Card>
                  <NextUI.Spacer y={1} />
                  <Text h4>Terms & Conditions</Text>
                  {!Object.values(agreements).every((value) => value) ? (
                    <Text color="error" h6>
                      You must agree to all terms.
                    </Text>
                  ) : null}
                  <Card variant="flat">
                    <Card.Body>
                      <NextUI.Checkbox
                        checked={agreements.readRules}
                        onChange={() => handleAgreementChange("readRules")}
                      >
                        <NextUI.Text>
                          You have read and agreed to the rules outlined in the{" "}
                          <Link href="https://docs.google.com/document/d/13CvktUzqbDGan44fVBMwKu7wl12UV2I6qEt5Q3reo-s/view">
                            Rules Document
                          </Link>
                          .
                        </NextUI.Text>
                      </NextUI.Checkbox>
                      <NextUI.Spacer y={0.4} />
                      <NextUI.Checkbox
                        checked={agreements.stayInDiscord}
                        onChange={() => handleAgreementChange("stayInDiscord")}
                      >
                        <NextUI.Text>
                          You have joined and will remain in the discord server for the duration of the tournament.
                        </NextUI.Text>
                      </NextUI.Checkbox>
                      <NextUI.Spacer y={0.4} />
                      <NextUI.Checkbox
                        checked={agreements.beCaptainOrPlayer}
                        onChange={() => handleAgreementChange("beCaptainOrPlayer")}
                      >
                        <NextUI.Text>
                          You may be chosen as a captain or drafted as a player and shall uphold responsibilities as
                          applicable.
                        </NextUI.Text>
                      </NextUI.Checkbox>
                      <NextUI.Spacer y={0.4} />
                      <NextUI.Checkbox
                        checked={agreements.acceptForfeitureRules}
                        onChange={() => handleAgreementChange("acceptForfeitureRules")}
                      >
                        <NextUI.Text>
                          Forfeiture from the tournament in the event you are chosen as a captain or drafted as a player
                          may result in ineligibility to participate in future iterations of this and other tournaments.
                        </NextUI.Text>
                      </NextUI.Checkbox>
                      <NextUI.Spacer y={0.4} />
                      <NextUI.Checkbox
                        checked={agreements.agreeToPlayTimes}
                        onChange={() => handleAgreementChange("agreeToPlayTimes")}
                      >
                        <NextUI.Text>
                          Match times are expected to fall on weekends between 15 & 18 UTC. You are expected to be able
                          to play at those times.
                        </NextUI.Text>
                      </NextUI.Checkbox>
                    </Card.Body>
                  </Card>
                  <NextUI.Spacer y={1} />
                  <NextUI.Button auto type="submit">
                    Register
                  </NextUI.Button>
                </form>
              )}
            </div>
          ) : (
            <NextUI.Text>Something went wrong</NextUI.Text>
          )}
        </>
      )}
    </>
  );
}
