import { XataClient } from "@/xata";

const xata = new XataClient();

const handler = async (req, res) => {
  try {
    const { userId } = req.body;
    const records = await xata.db.nextauth_accounts
      .select(["access_token", "refresh_token", "expires_at", "last_logged_in"])
      .filter({ provider: "discord", "user.id": userId })
      .getAll();

    console.log("records", records);

    let record = records.reduce((latest, current) => {
      const latestDate = new Date(latest.last_logged_in);
      const currentDate = new Date(current.last_logged_in);
      return latestDate > currentDate ? latest : current;
    });

    console.log("record", record);

    // Check if the access_token is null before proceeding
    if (!record || !record.access_token) {
      throw new Error("Access token is null");
    }

    //refresh token if expired
    if (Date.now() > record.expires_at * 1000) {
      console.log("Refreshing token");
      const response = await fetch("https://discord.com/api/oauth2/token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
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

    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${record.access_token}`,
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch from Discord API" });
      return;
    }

    const user = await response.json();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default handler;
