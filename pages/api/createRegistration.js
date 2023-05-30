import { getDiscordTag } from "@/util/DiscordUtils";
import { BadgeFilter, BwsRankCalc } from "@/util/OsuUtils";
import { XataClient } from "@/xata";
import { GoogleSpreadsheet } from "google-spreadsheet";

const xata = new XataClient();

let doc;

let sheet;

(async () => {
  doc = new GoogleSpreadsheet("1H5rsFXvGaL6BAL5RT5gRhfGf5Oqnespf6G-6OxRuZ7I");
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  });
  await doc.loadInfo();
  sheet = doc.sheetsByTitle["_import"];
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

const removeRole = async (guildId, userId, roleId, botToken) => {
  const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "DELETE",
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

const getGuildMember = async (guildId, userId, botToken) => {
  const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch guild member data. Status: ${response.status}`);
  }

  const memberData = await response.json();

  return memberData;
};

const deleteUserFromDatabase = async (userId) => {
  await xata.db.registered.delete(String(userId));
};

const handler = async (req, res) => {
  const { userId, title, stats, timezone } = req.body;
  const guildId = "1089693219383676948"; // production
  //const guildId = "931145825155944458"; // test
  const roleId = "1100250097008246876"; //production
  //const roleId = "1058675231755083796"; // test
  const discordBotToken = process.env.DISCORD_BOT_TOKEN;

  let osuUser;

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
        res.status(400).json({ message: "Failed to fetch osu user data" });
        return;
      }

      osuUser = await osuResponse.json();

      const bwsRank = BwsRankCalc(osuUser.statistics.global_rank, BadgeFilter(osuUser));
      if (bwsRank < 1000 || bwsRank > 30000) {
        res.status(400).json({ message: "Rank is not between 1000 and 30000" });
        return;
      }

      // Fetch user data from Discord
      const discordResponse = await fetch(process.env.NEXTAUTH_URL + "/api/db/getDiscordUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (!discordResponse.ok) {
        res.status(400).json({ message: "Failed to fetch osu user data" });
        return;
      }

      const discordUser = await discordResponse.json();

      let isInGuild = false;
      try {
        isInGuild = await isUserInGuild(guildId, discordUser.id, discordBotToken);
      } catch (err) {
        console.log(err);
      }

      try {
        let isUserRegistered = await xata.db.registered.filter({ id: `${osuUser.id}` }).getFirst();
        if (isUserRegistered) {
          if (isInGuild) {
            try {
              const member = await getGuildMember(guildId, discordUser.id, discordBotToken);
              const correctNickname = osuUser.username;
              const correctRoleId = roleId;
              let nicknameAdded = true;
              let roleAdded = true;

              if (
                (member.nick !== correctNickname && member.nick !== null) ||
                member.user.username !== correctNickname
              ) {
                nicknameAdded = false;
                try {
                  nicknameAdded = await addNickname(guildId, discordUser.id, osuUser, discordBotToken);
                } catch (err) {
                  console.log(err);
                }
              }
              if (!member.roles.includes(correctRoleId)) {
                roleAdded = false;
                try {
                  roleAdded = await addRole(guildId, discordUser.id, correctRoleId, discordBotToken);
                } catch (err) {
                  console.log(err);
                }
              }

              if (!nicknameAdded || !roleAdded) {
                res.status(400).json({
                  message: `User [${discordUser.id}] is already registered, however failed to apply role and/or nickname.`,
                });
                return;
              } else {
                res.status(400).json({
                  message: `User [${osuUser.id}] is already registered!! If you would like to request any changes, modifications or removal of registration please contact Squink.`,
                });
                return;
              }
            } catch (err) {
              console.log(err);
              res.status(400).json({
                message: `User [${discordUser.id}] is already registered, however a discord related error occured, please contact Squink.`,
              });
              return;
            }
          } else {
            res.status(400).json({
              message: `User [${discordUser.id}] is already registered, however is not in the Discord server.`,
            });
          }
        }
      } catch (err) {
        console.log(err);
      }

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

      // TODO: add better errror handling and /fail endpoint
      // TODO: error handling for when user cannot be added to guild
      // TODO: error handling for when user cannot be added to role
      // TODO: error handling for when user cannot be added to nickname

      if (!isInGuild) {
        const wasAddedToGuild = await addMemberToGuild(guildId, discordUser.id, userAccessToken, discordBotToken);
        console.log("wasAddedToGuild", wasAddedToGuild);

        if (!wasAddedToGuild) {
          throw new Error(`Failed to add user with ID ${discordUser.id} to guild`);
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

      // Add a row to the Google Sheet
      const newRow = {
        Timestamp: registered.created_at,
        ID: osu_profile.id,
        Username: osu_profile.username,
        Flag: osu_profile.country_code,
        Rank: osu_profile.rank,
        Badges: osu_profile.badges,
        Discord: getDiscordTag(discord_profile.username, discord_profile.discriminator),
        Timezone: registered.tz,
        Title: registered.title,
        Aim: registered.aim,
        Control: registered.control,
        Speed: registered.speed,
        Reading: registered.reading,
        Stamina: registered.stamina,
        Tech: registered.tech,
      };
      try {
        await sheet.addRow(newRow);
      } catch (err) {
        throw new Error("Failed to add row to Google Sheet: " + err.message);
      }

      // Send the successful response back
      console.log("registered", registered);
      res.status(200).json({ message: "Registered successfully!" });
    } catch (err) {
      console.error(err);

      /* try {
        // If the user entry already exists delete the registration
        let isUserRegistered = await xata.db.registered.filter({ id: `${osuUser.id}` }).getFirst();
        if (isUserRegistered) {
          try {
            deleteUserFromDatabase(osuUser.id);
          } catch (error) {
            console.error("Error deleting user from database", error);
          }

          // User will be removed from sheet when cron job is run

          try {
            removeRole(guildId, discordUser.id, roleId, discordBotToken);
          } catch (error) {
            console.error("Error removing Discord role", error);
          }
        }
      } catch (error) {
        console.error("Error in cleanup process", error);
      }
 */
      res.status(500).json({
        message:
          "A critical error occurred while processing your request. Please contact Squink on discord as soon as possible.",
      });
    }
  }
};

export default handler;
