export default function BadgeFilter(player) {
  const filteredWords = [
    "contrib",
    "nomination",
    "assessment",
    "moderation",
    "spotlight",
    "mapper",
    "mapping",
    "aspire",
    "monthly",
    "exemplary",
    "outstanding",
    "longstanding",
    "idol",
    "pending",
    "gmt",
    "global moderators",
    "trivium",
    "pickem",
    "fanart",
    "fan art",
    "skinning",
    "labour of love",
    "community choice",
    "community favourite",
  ];

  const ignoredBadges = new RegExp(filteredWords.join("|"), "i");

  let badges = 0;
  for (let badge of player.badges) {
    let awardedAt = new Date(badge.awarded_at);
    if (awardedAt.getFullYear() >= 2021 && !ignoredBadges.test(badge.description.toLowerCase())) {
      badges++;
    }
  }

  return badges;
}
