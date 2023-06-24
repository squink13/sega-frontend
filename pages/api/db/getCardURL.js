import { XataClient } from "@/xata";

const xata = new XataClient();

const handler = async (req, res) => {
  try {
    const { id } = req.body;

    const record = await xata.db.registered.read(id);

    res.status(200).json(record.card_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default handler;
