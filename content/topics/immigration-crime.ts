import type { TopicSeed } from "../types";

const topic: TopicSeed = {
  slug: "immigration-crime",
  code: "TOP-010",
  title: "Immigration & crime (US)",
  category: "Migration",
  region: "North America",
  kicker: "Data under pressure",
  summary: "Do immigrants commit more crime? What incarceration and arrest data show, and the limits of that data.",
  overview:
    "Claims that immigrants drive crime are central to migration debates. In the US, research using census incarceration data and state arrest records has examined the question directly. This investigation shows what that research finds and where data is limited.",
  scope: "United States. Data for other countries differs and is not covered.",
  sortOrder: 10,
  lastReviewed: "2026-10-16",
  sources: [
    { slug: "abramitzky-2023", title: "Law-Abiding Immigrants: The Incarceration Gap Between Immigrants and the US-Born, 1870–2020", publisher: "National Bureau of Economic Research", author: "Abramitzky R., Boustan L., Jácome E., Pérez S., Torres J.D.", url: "https://www.nber.org/papers/w31440", publishedAt: "2023-07", sourceType: "ACADEMIC", isPrimary: false, description: "Finds immigrants have had lower incarceration rates than the US-born for 150 years, with the gap widening since 1960.", limitations: "Incarceration is a proxy for crime and can be affected by deportation." },
    { slug: "light-pnas-2020", title: "Comparing crime rates between undocumented immigrants, legal immigrants, and native-born US citizens in Texas", publisher: "PNAS", author: "Light M.T., He J., Robey J.P.", url: "https://doi.org/10.1073/pnas.2014704117", publishedAt: "2020-12", sourceType: "ACADEMIC", isPrimary: false, description: "Using Texas arrest data that records immigration status, finds undocumented immigrants had substantially lower felony arrest rates than native-born citizens." },
  ],
  events: [],
  claims: [
    {
      slug: "immigrants-lower-incarceration",
      code: "CLM-090", headline: "Do immigrants commit more crime in the US?",
      proposition: "In the United States, immigrants — including undocumented immigrants — are incarcerated and arrested at lower rates than US-born citizens.",
      kind: "FACTUAL", status: "WIDELY_AGREED", reason: "CORROBORATED_INDEPENDENT",
      statusRationale: "Consistent findings from national census incarceration data and from Texas, where arrest records include immigration status.",
      scope: "Population-level rates in the US. Individual crimes and local variation are not addressed.",
      summary: "Research consistently finds lower rates among immigrants. Critics note data gaps, especially on undocumented status outside Texas.",
      decomposition: ["What data records immigration status?", "What do incarceration rates show?", "What do arrest rates show?", "What are the data limitations?"],
      established: ["National incarceration data show lower rates for immigrants since at least 1960.", "Texas data show lower felony arrest rates for undocumented immigrants than for native-born citizens."],
      contested: ["Whether deportation of offenders biases incarceration comparisons (studies attempt to adjust)."],
      counterevidence: ["Some advocacy groups favouring lower immigration argue data on immigration status is incomplete outside Texas."],
      missingEvidence: ["National arrest data with reliable immigration status."],
      evidence: [
        { source: "abramitzky-2023", relation: "SUPPORTS", establishes: "Long-run incarceration gap." },
        { source: "light-pnas-2020", relation: "SUPPORTS", establishes: "Arrest-rate comparison using status-coded data." },
      ],
    },
  ],
  perspectives: [
    { slug: "imm-restrict", title: "Restrictionist view", heldBy: "Advocates of lower immigration", summary: "Uncontrolled immigration creates public-safety risks, and individual crimes by people who entered illegally were preventable.", arguments: ["Every crime by someone who should have been removed was avoidable."], counterarguments: ["Aggregate data shows lower rates among immigrants."], sources: [] },
    { slug: "imm-data", title: "Data-led view", heldBy: "Most criminologists and economists who study the question", summary: "Population data does not support the claim that immigrants increase crime rates.", arguments: ["Consistent findings across data sources."], counterarguments: ["Data limitations outside Texas."], sources: ["abramitzky-2023", "light-pnas-2020"] },
  ],
};

export default topic;
