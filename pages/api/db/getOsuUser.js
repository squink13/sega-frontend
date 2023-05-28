import { XataClient } from "@/xata";
import { Client } from "osu-web.js";

const xata = new XataClient();

const handler = async (req, res) => {
  const { userId } = req.body;
  const record = await xata.db.nextauth_accounts
    .select(["access_token"])
    .filter({ provider: "osu", "user.id": userId })
    .getMany();

  const client = new Client(record[0].access_token);
  const user = await client.users.getSelf({
    urlParams: {
      mode: "osu",
    },
  });

  res.status(200).json(user);
};

export default handler;
