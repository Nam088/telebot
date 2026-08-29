import { BusinessEphemeralMethods } from "./ephemeral.js";

export * from "./queries.js";
export * from "./games-passport.js";
export * from "./stories-boosts.js";
export * from "./gifts.js";
export * from "./ephemeral.js";

/**
 * Full domain mixin containing games, passport, stories, and business operations.
 */
export abstract class BusinessAndEcosystemMethods extends BusinessEphemeralMethods {}
