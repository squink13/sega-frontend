import BadgeFilter from "@/util/BadgeFilter";
import { XataClient } from "@/xata";
import { GoogleSpreadsheet } from "google-spreadsheet";

const xata = new XataClient();

let doc;

(async () => {
  doc = new GoogleSpreadsheet("1H5rsFXvGaL6BAL5RT5gRhfGf5Oqnespf6G-6OxRuZ7I");
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  });
  await doc.loadInfo();
})();

const isUserInGuild = async (guildId, userId, token) => {
  const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.ok;
};

const addMemberToGuild = async (guildId, userId, userAccessToken, botToken) => {
  const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
    method: "PUT",
    body: JSON.stringify({
      access_token: userAccessToken,
    }),
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.ok;
};

const addRole = async (guildId, userId, roleId, botToken) => {
  const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.ok;
};

const addNickname = async (guildId, userId, osu_profile, botToken) => {
  const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nick: osu_profile.username,
    }),
  });
  return response.ok;
};

const handler = async (req, res) => {
  const { userId, title, stats, timezone } = req.body;

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
  } else {
    try {
      // Fetch user data from OSU
      const osuResponse = await fetch(process.env.NEXTAUTH_URL + "/api/db/getOsuUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (!osuResponse.ok) {
        throw new Error("Failed to fetch osu user data");
      }

      const osuUser = await osuResponse.json();

      // Fetch user data from Discord
      const discordResponse = await fetch(process.env.NEXTAUTH_URL + "/api/db/getDiscordUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (!discordResponse.ok) {
        throw new Error("Failed to fetch discord user data");
      }

      const discordUser = await discordResponse.json();

      const discordAccount = await xata.db.nextauth_accounts
        .select(["id", "access_token"])
        .filter({ provider: "discord", "user.id": userId })
        .getMany();

      const osuAccount = await xata.db.nextauth_accounts
        .select(["id"])
        .filter({ provider: "osu", "user.id": userId })
        .getMany();

      console.log("discordAccount", discordAccount);
      console.log("osuAccount", osuAccount);

      const userAccessToken = discordAccount[0].access_token;
      // Check if user is in the discord guild
      const discordBotToken = process.env.DISCORD_BOT_TOKEN;

      let osu_profile = await xata.db.osu_profile.filter({ id: `${osuUser.id}` }).getMany();

      if (osu_profile.length === 0) {
        osu_profile = await xata.db.osu_profile.create(`${osuUser.id}`, {
          account: osuAccount[0].id,
          username: osuUser.username,
          rank: osuUser.statistics.global_rank,
          country_code: osuUser.country_code,
          badges: BadgeFilter(osuUser),
          avatar_url: osuUser.avatar_url,
        });
      } else {
        osu_profile = await xata.db.osu_profile.update(`${osuUser.id}`, {
          account: osuAccount[0].id,
          username: osuUser.username,
          rank: osuUser.statistics.global_rank,
          country_code: osuUser.country_code,
          badges: BadgeFilter(osuUser),
          avatar_url: osuUser.avatar_url,
        });
      }

      const format = discordUser.avatar && discordUser.avatar.startsWith("a_") ? "gif" : "png";
      let discord_profile = await xata.db.discord_profile.filter({ id: discordUser.id }).getMany();

      if (discord_profile.length === 0) {
        discord_profile = await xata.db.discord_profile.create(discordUser.id, {
          account: discordAccount[0].id,
          username: discordUser.username,
          discriminator: parseInt(discordUser.discriminator, 10),
          avatar: discordUser.avatar,
          avatar_url: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${format}`,
        });
      } else {
        discord_profile = await xata.db.discord_profile.update(discordUser.id, {
          account: discordAccount[0].id,
          username: discordUser.username,
          discriminator: parseInt(discordUser.discriminator, 10),
          avatar: discordUser.avatar,
          avatar_url: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${format}`,
        });
      }

      const guildId = "1089693219383676948"; // production
      //const guildId = "931145825155944458"; // test

      const roleId = "1100250097008246876"; //production
      //const roleId = "1058675231755083796"; // test

      const isInGuild = await isUserInGuild(guildId, discordUser.id, discordBotToken);
      if (!isInGuild) {
        const wasAddedToGuild = await addMemberToGuild(guildId, discordUser.id, userAccessToken, discordBotToken);
        console.log("wasAddedToGuild", wasAddedToGuild);

        if (!wasAddedToGuild) {
          throw new Error("Failed to add user to guild");
        }
      } else {
        console.log("User is already in guild");
      }

      const roleAdded = await addRole(guildId, discordUser.id, roleId, discordBotToken);
      console.log("roleAdded", roleAdded);

      const nicknameAdded = await addNickname(guildId, discordUser.id, osu_profile, discordBotToken);
      console.log("nicknameAdded", nicknameAdded);

      const registered = await xata.db.registered.create(osu_profile.id, {
        osu: osu_profile.id,
        discord: discord_profile.id,
        tz: timezone,
        title: title,
        aim: stats.Aim,
        control: stats.Control,
        speed: stats.Speed,
        reading: stats.Reading,
        stamina: stats.Stamina,
        tech: stats.Tech,
      });

      console.log("registered", registered);
      // Add a row to the Google Sheet
      const sheet = doc.sheetsByTitle["_import"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
      const newRow = {
        Timestamp: registered.created_at,
        ID: osu_profile.id,
        Username: osu_profile.username,
        Flag: osu_profile.country_code,
        Rank: osu_profile.rank,
        Badges: osu_profile.badges,
        Discord: `${discord_profile.username}#${discord_profile.discriminator}`,
        Timezone: registered.tz,
        Title: registered.title,
        Aim: registered.aim,
        Control: registered.control,
        Speed: registered.speed,
        Reading: registered.reading,
        Stamina: registered.stamina,
        Tech: registered.tech,
      };
      await sheet.addRow(newRow);

      // Send the successful response back
      res.status(200).json({ message: "Registered successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export default handler;
