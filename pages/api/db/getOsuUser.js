import { XataClient } from "@/xata";
import { Client } from "osu-web.js";

const xata = new XataClient();

const handler = async (req, res) => {
  try {
    const { userId } = req.body;
    const record = await xata.db.nextauth_accounts
      .select(["access_token", "refresh_token", "expires_at"])
      .filter({ provider: "osu", "user.id": userId })
      .getFirst();

    // Check if the access_token is null before proceeding
    if (!record || !record.access_token) {
      throw new Error("Access token is null");
    }

    let accessToken = record.access_token;

    //refresh token if expired
    if (Date.now() > record.expires_at * 1000) {
      console.log("Refreshing token");
      const response = await fetch("https://osu.ppy.sh/oauth/token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.OSU_CLIENT_ID,
          client_secret: process.env.OSU_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: record.refresh_token,
        }),
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Fetch Error: ${response.status}`, errorData);
        throw new Error("Failed to fetch refresh token - status: " + response.status);
      }

      await xata.db.nextauth_accounts.update(record.id, {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      });

      accessToken = data.access_token;
    }

    const client = new Client(accessToken);
    const user = await client.users.getSelf({
      urlParams: {
        mode: "osu",
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default handler;
