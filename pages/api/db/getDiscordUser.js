import { XataClient } from "@/xata";

const xata = new XataClient();

const handler = async (req, res) => {
  const { userId } = req.body;
  const record = await xata.db.nextauth_accounts
    .select(["access_token"])
    .filter({ provider: "discord", "user.id": userId })
    .getMany();

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
};

export default handler;
