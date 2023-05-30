export function getDiscordTag(username, discriminator) {
  // Convert discriminator to string in case it's a number
  const discString = String(discriminator);

  // Pad with leading zeroes to ensure 4 digits
  const paddedDiscriminator = discString.padStart(4, "0");

  // Combine username and padded discriminator with '#'
  return `${username}#${paddedDiscriminator}`;
}
