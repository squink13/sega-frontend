import { XataClient } from "@/xata";
import { Client } from "osu-web.js";

const xata = new XataClient();

const handler = async (req, res) => {
  try {
    const { userId } = req.body;
    const record = await xata.db.nextauth_accounts
      .select(["access_token"])
      .filter({ provider: "osu", "user.id": userId })
      .getMany();

    // Check if the access_token is null before proceeding
    if (!record[0] || !record[0].access_token) {
      throw new Error("Access token is null");
    }

    const client = new Client(record[0].access_token);
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
