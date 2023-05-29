import { XataClient } from "@/xata";

const xata = new XataClient();

const handler = async (req, res) => {
  try {
    const { userId } = req.body;
    const record = await xata.db.nextauth_accounts
      .select(["access_token"])
      .filter({ provider: "discord", "user.id": userId })
      .getMany();

    // Check if the access_token is null before proceeding
    if (!record[0] || !record[0].access_token) {
      throw new Error("Access token is null");
    }

    const url = "https://discord.com/api/users/@me";
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${record[0].access_token}`,
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
