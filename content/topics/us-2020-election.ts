import type { TopicSeed } from "../types";

const topic: TopicSeed = {
  slug: "us-2020-election",
  code: "TOP-004",
  title: "US 2020 election",
  category: "Elections & democracy",
  region: "North America",
  kicker: "Election integrity",
  summary: "Courts, audits, recounts and a defamation case: what was investigated after claims that the 2020 presidential election was stolen.",
  overview:
    "After the 2020 US presidential election, Donald Trump and allies alleged widespread fraud. Those claims were tested in dozens of lawsuits, state recounts and audits, and in defamation litigation brought by a voting-machine company. This investigation sets out what those processes examined and found.",
  scope: "The 2020 presidential election and claims that fraud changed its outcome.",
  sortOrder: 4,
  lastReviewed: "2026-10-16",
  sources: [
    { slug: "cisa-2020-statement", title: "Joint Statement from Elections Infrastructure Government Coordinating Council & the Election Infrastructure Sector Coordinating Executive Committees", publisher: "CISA", url: "https://www.cisa.gov/news-events/news/joint-statement-elections-infrastructure-government-coordinating-council-election", publishedAt: "2020-11-12", sourceType: "OFFICIAL_STATEMENT", isPrimary: true, description: "Federal and state election officials state there is no evidence that any voting system deleted, lost or changed votes." },
    { slug: "ap-barr-2020", title: "Disputing Trump, Barr says no widespread election fraud", publisher: "Associated Press", url: "https://apnews.com/article/barr-no-widespread-election-fraud-b1f1488796c9a98c4b1a9061a6c7f49d", publishedAt: "2020-12-01", sourceType: "NEWS_REPORT", isPrimary: false, description: "Attorney General William Barr says the Justice Department had not seen fraud on a scale that could have produced a different outcome." },
    { slug: "lost-not-stolen", title: "Lost, Not Stolen: The Conservative Case that Trump Lost and Biden Won the 2020 Presidential Election", publisher: "Lost Not Stolen (report by Republican lawyers and former officials)", url: "https://lostnotstolen.org/", publishedAt: "2022-07", sourceType: "INDEPENDENT_INVESTIGATION", isPrimary: false, description: "Review of the 64 court cases brought in six contested states, concluding that the claims failed for lack of evidence." },
    { slug: "npr-fox-dominion", title: "Fox News settles Dominion defamation case for $787.5 million", publisher: "NPR", url: "https://www.npr.org/2023/04/18/1170339114/fox-news-dominion-defamation-trial-settlement", publishedAt: "2023-04-18", sourceType: "NEWS_REPORT", isPrimary: false, description: "Reports the settlement and the judge's earlier ruling that Fox's statements about Dominion were false." },
    { slug: "ga-audit-2020", title: "Georgia statewide risk-limiting audit (hand count) of the 2020 presidential race", publisher: "Georgia Secretary of State", url: "https://sos.ga.gov/news/historic-first-statewide-audit-paper-ballots-upholds-result-presidential-race", publishedAt: "2020-11-19", sourceType: "OFFICIAL_RECORD", isPrimary: true, description: "A full hand count of about 5 million paper ballots confirmed the machine count result." },
  ],
  events: [
    { slug: "us-2020-vote", date: "2020-11-03", title: "Election day", description: "Joe Biden wins 306 electoral votes to Donald Trump's 232.", sources: [], keyEvent: true },
    { slug: "us-2020-cisa", date: "2020-11-12", title: "Election officials' joint statement", description: "Officials call the election 'the most secure in American history'.", sources: ["cisa-2020-statement"] },
    { slug: "us-2020-ga", date: "2020-11-19", title: "Georgia hand-count audit confirms result", description: "A full hand recount upholds Biden's narrow win in Georgia.", sources: ["ga-audit-2020"] },
    { slug: "us-2020-barr", date: "2020-12-01", title: "Attorney General says no outcome-changing fraud found", description: "William Barr tells AP the Justice Department has not seen fraud on that scale.", sources: ["ap-barr-2020"] },
    { slug: "us-2021-jan6", date: "2021-01-06", title: "Attack on the US Capitol", description: "Supporters of Trump storm the Capitol during the certification of electoral votes.", sources: [], keyEvent: true },
    { slug: "us-2023-dominion", date: "2023-04-18", title: "Fox settles with Dominion", description: "Fox pays $787.5 million after a Delaware judge ruled its broadcast claims about Dominion were false.", sources: ["npr-fox-dominion"] },
  ],
  claims: [
    {
      slug: "us-2020-fraud-outcome",
      code: "CLM-030", headline: "Did fraud change the 2020 US election result?",
      proposition: "No court, recount or official audit found fraud on a scale capable of changing the outcome of the 2020 US presidential election.",
      kind: "FACTUAL", status: "WIDELY_AGREED", reason: "CORROBORATED_INDEPENDENT",
      statusRationale: "Dozens of court cases, state recounts and audits — including some led by Republican officials — reached this conclusion. Isolated cases of fraud were found and prosecuted, but none at that scale.",
      scope: "Fraud capable of changing the national outcome. Isolated fraud cases and procedural disputes are acknowledged.",
      summary: "The claim was tested more thoroughly than almost any election claim in US history. No process found outcome-changing fraud.",
      decomposition: ["Which lawsuits were filed and what did they find?", "What did recounts and audits show?", "What did the Justice Department and CISA say?", "How many individual fraud cases were prosecuted?"],
      established: ["Trump campaign and allies lost or withdrew more than 60 lawsuits.", "Georgia's hand count confirmed the result.", "Arizona's partisan Maricopa County review in 2021 found a slightly larger Biden margin.", "The Attorney General said no outcome-changing fraud had been found."],
      contested: ["Whether pandemic-era rule changes on mail voting were lawful — a procedural, not a fraud, dispute."],
      counterevidence: ["Supporters of the fraud claim cite affidavits, statistical anomalies and videos; courts and officials who examined them found they did not show fraud at scale."],
      missingEvidence: [],
      variants: [{ text: "The 2020 election was stolen.", assessment: "CONTRADICTED", explanation: "Contradicted by the outcomes of recounts, audits and litigation." }],
      evidence: [
        { source: "lost-not-stolen", relation: "SUPPORTS", establishes: "Case-by-case review of the litigation." },
        { source: "cisa-2020-statement", relation: "SUPPORTS", establishes: "Officials found no evidence voting systems changed votes." },
        { source: "ap-barr-2020", relation: "SUPPORTS", establishes: "The Justice Department's assessment at the time." },
        { source: "ga-audit-2020", relation: "SUPPORTS", establishes: "Hand count confirmed Georgia's result." },
      ],
    },
    {
      slug: "dominion-switched-votes",
      code: "CLM-031", headline: "Did Dominion machines switch votes?",
      proposition: "Dominion voting machines were used to switch votes from Trump to Biden in 2020.",
      kind: "FACTUAL", status: "WIDELY_AGREED", reason: "CONTRADICTED",
      statusRationale: "Contradicted by hand counts of paper ballots and by a court ruling in Dominion v. Fox that the broadcast claims were false.",
      scope: "Vote-switching by Dominion equipment in 2020.",
      summary: "The proposition is contradicted: paper-ballot hand counts matched machine counts, and a Delaware judge ruled the claims false before Fox settled.",
      decomposition: ["Were paper ballots hand-counted and compared?", "What did courts find in defamation litigation?"],
      established: ["Georgia hand-counted paper ballots from Dominion machines; the result held.", "A Delaware judge ruled in March 2023 that it was 'CRYSTAL clear' that Fox's statements about Dominion were false."],
      contested: [],
      counterevidence: [],
      missingEvidence: [],
      evidence: [
        { source: "npr-fox-dominion", relation: "CONTRADICTS", establishes: "The court ruling that the claims were false and the settlement." },
        { source: "ga-audit-2020", relation: "CONTRADICTS", establishes: "Hand count of paper ballots matched machine count." },
      ],
    },
  ],
  perspectives: [
    { slug: "us-fraud-claim", title: "Election was compromised", heldBy: "Donald Trump and allies", summary: "Rule changes, mail voting and alleged irregularities produced an illegitimate result.", arguments: ["Late rule changes expanded mail voting without legislative approval in some states.", "Affidavits alleged irregularities."], counterarguments: ["Courts and audits did not find fraud at scale.", "Many rule changes were approved by courts or legislatures."], sources: [] },
    { slug: "us-officials", title: "Election was secure", heldBy: "State election officials of both parties; CISA; courts", summary: "Recounts, audits and litigation confirmed the result.", arguments: ["Paper-ballot audits matched counts.", "Isolated fraud was detected and prosecuted."], counterarguments: ["Public trust remained low among many voters regardless of audit outcomes."], sources: ["cisa-2020-statement", "ga-audit-2020"] },
  ],
};

export default topic;
