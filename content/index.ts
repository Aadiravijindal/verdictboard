import type { TopicSeed } from "./types";
import israelPalestine from "./topics/israel-palestine";
import indiaElections from "./topics/india-election-integrity";
import russiaUkraine from "./topics/russia-ukraine";
import us2020 from "./topics/us-2020-election";
import climate from "./topics/climate-change";
import covid from "./topics/covid-origins";
import indiaGovernance from "./topics/india-governance";
import economy from "./topics/economy-trade-inflation";
import xinjiang from "./topics/xinjiang";
import immigration from "./topics/immigration-crime";

export const topics: TopicSeed[] = [
  israelPalestine,
  indiaElections,
  russiaUkraine,
  us2020,
  climate,
  covid,
  indiaGovernance,
  economy,
  xinjiang,
  immigration,
];

export * from "./types";
