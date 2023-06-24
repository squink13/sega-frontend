/* eslint-disable @next/next/no-img-element */
import styles from "../styles/PlayerCard.module.css";
import axios from "axios";
import { useEffect, useState, useRef } from "react";

export default function PlayerCard({ width = 400, id }) {
  const [cardUrl, setCardUrl] = useState(); // Default value
  const cardRef = useRef();

  useEffect(() => {
    const fetchCardUrl = async () => {
      try {
        const response = await axios.post("/api/db/getCardURL", { id });
        setCardUrl(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCardUrl();
  }, [id]);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.load();
    }
  }, [cardUrl]);

  let fileType;

  if (cardUrl) {
    fileType = cardUrl.split(".").pop();
  } else {
    fileType = "png";
  }

  return (
    <>
      {fileType === "webm" ? (
        <>
          <video ref={cardRef} autoPlay loop muted width={`${width}px`} className={styles["video"]}>
            <source src={cardUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <svg className={styles["svg"]}>
            <defs>
              <clipPath id="clip-shape" clipPathUnits="objectBoundingBox">
                <path d="M0,0.117 V0.964 C0,0.984,0.022,1,0.05,1 H0.837 C0.849,1,0.862,0.996,0.871,0.99 L0.984,0.913 C0.994,0.906,1,0.897,1,0.887 V0.036 C1,0.016,0.978,0,0.95,0 H0.164 C0.151,0,0.138,0.004,0.129,0.01 L0.015,0.092 C0.005,0.099,0,0.108,0,0.117" />
              </clipPath>
            </defs>
          </svg>
        </>
      ) : (
        <img src={cardUrl} width={width} height={width * 1.4} className={styles["image"]} alt="Card" />
      )}
    </>
  );
}
