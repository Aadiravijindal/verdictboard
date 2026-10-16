import type { TopicSeed } from "../types";

const topic: TopicSeed = {
  slug: "covid-origins",
  code: "TOP-006",
  title: "COVID-19 origins",
  category: "Science & policy",
  region: "Global",
  kicker: "Unresolved question",
  summary: "Natural spillover or a laboratory incident? What intelligence agencies, WHO advisers and scientists have concluded — and what data is still missing.",
  overview:
    "Where and how SARS-CoV-2 first infected humans has not been established. Two hypotheses dominate: zoonotic spillover, possibly at the Huanan market in Wuhan, and a research-related incident. Assessments differ in direction and are mostly held at low confidence. Key early data from China has not been shared.",
  scope: "The origin of SARS-CoV-2. Pandemic response and vaccine questions are out of scope.",
  sortOrder: 6,
  lastReviewed: "2026-10-16",
  sources: [
    { slug: "who-sago-2025", title: "WHO Scientific Advisory Group issues report on origins of COVID-19", publisher: "World Health Organization", url: "https://www.who.int/news/item/27-06-2025-who-scientific-advisory-group-issues-report-on-origins-of-covid-19", publishedAt: "2025-06-27", sourceType: "INTERGOVERNMENTAL", isPrimary: true, description: "SAGO concludes that the weight of available evidence suggests zoonotic spillover, but that a lab leak cannot be ruled out because requested data was not provided.", limitations: "SAGO said it could not reach a definitive conclusion." },
    { slug: "odni-covid-2023", title: "Declassified Assessment on COVID-19 Origins", publisher: "Office of the Director of National Intelligence", url: "https://www.dni.gov/files/ODNI/documents/assessments/Declassified-Assessment-on-COVID-19-Origins.pdf", publishedAt: "2021-10", sourceType: "OFFICIAL_RECORD", isPrimary: true, description: "US intelligence community assessment: agencies divided between natural and lab-associated origin, all at low or moderate confidence.", limitations: "Underlying intelligence is classified. Some agencies (DOE, CIA) later updated their assessments toward a lab-related origin at low confidence." },
    { slug: "worobey-2022", title: "The Huanan Seafood Wholesale Market in Wuhan was the early epicenter of the COVID-19 pandemic", publisher: "Science", author: "Worobey M. et al.", url: "https://doi.org/10.1126/science.abp8715", publishedAt: "2022-07-26", sourceType: "ACADEMIC", isPrimary: false, description: "Spatial analysis finding early cases clustered around the Huanan market.", limitations: "Critics argue early case ascertainment was biased toward the market." },
  ],
  events: [
    { slug: "co-2019-12", date: "2019-12", title: "Cluster of pneumonia cases in Wuhan", description: "Chinese authorities report cases of pneumonia of unknown cause, many linked to the Huanan market.", sources: [], keyEvent: true },
    { slug: "co-2021-who-china", date: "2021-03-30", title: "WHO–China joint study report", description: "The joint study calls a lab leak 'extremely unlikely'; WHO's Director-General says the lab hypothesis requires further investigation.", certainty: "DETAILS_DISPUTED", disputeNote: "The study was criticised for limited access and data; WHO later said all hypotheses remain open.", sources: [] },
    { slug: "co-2021-odni", date: "2021-10", title: "US intelligence community assessment declassified", description: "Agencies are divided; none has high confidence.", sources: ["odni-covid-2023"] },
    { slug: "co-2025-sago", date: "2025-06-27", title: "WHO SAGO report", description: "Weight of evidence favours spillover; lab leak cannot be ruled out without data from China.", sources: ["who-sago-2025"], keyEvent: true },
  ],
  claims: [
    {
      slug: "covid-lab-leak",
      code: "CLM-050", headline: "Did COVID-19 come from a lab?",
      proposition: "SARS-CoV-2 first infected humans as a result of a research-related incident in Wuhan.",
      kind: "FACTUAL", status: "UNVERIFIED", reason: "INSUFFICIENT_EVIDENCE",
      statusRationale: "No direct evidence establishes either a lab origin or a natural one. US intelligence agencies are split and mostly at low confidence; WHO's advisory group leans toward spillover while saying a lab leak cannot be excluded.",
      scope: "The origin of the virus, not gain-of-function policy in general.",
      summary: "This is genuinely unresolved. A fair presentation shows that the leading bodies disagree in direction and that most assessments are made at low confidence.",
      decomposition: ["What direct evidence exists for each hypothesis?", "What data has not been shared?", "Which agencies favour which hypothesis, and with what confidence?"],
      established: ["The Wuhan Institute of Virology conducted coronavirus research.", "Many early known cases were associated with the Huanan market.", "No intermediate animal host infected before the outbreak has been identified.", "China has not provided some data requested by WHO."],
      contested: ["Whether market clustering reflects the true origin or detection bias.", "Whether genomic features of the virus favour either hypothesis."],
      counterevidence: ["WHO SAGO found the weight of available evidence favoured zoonotic spillover."],
      missingEvidence: ["Early patient samples and lab records from Wuhan.", "Identification of an infected intermediate host."],
      variants: [
        { text: "It has been proven that COVID came from a lab.", assessment: "UNSUPPORTED", explanation: "No body has established this with high confidence." },
        { text: "The lab-leak theory has been debunked.", assessment: "OVERSTATED", explanation: "WHO's advisers and several intelligence agencies say it cannot be ruled out." },
      ],
      evidence: [
        { source: "who-sago-2025", relation: "CONTRADICTS", establishes: "WHO advisers lean toward spillover while not excluding a lab leak." },
        { source: "odni-covid-2023", relation: "CONTEXT", establishes: "Intelligence agencies are divided." },
        { source: "worobey-2022", relation: "CONTRADICTS", establishes: "Spatial clustering of early cases at the market." },
      ],
    },
  ],
  perspectives: [
    { slug: "co-zoonotic", title: "Zoonotic spillover", heldBy: "Many virologists; WHO SAGO (leaning)", summary: "The virus spilled over from animals, likely at or near the Huanan market.", arguments: ["Early cases clustered at the market.", "Previous coronaviruses emerged zoonotically."], counterarguments: ["No infected intermediate host has been found."], sources: ["worobey-2022", "who-sago-2025"] },
    { slug: "co-lab", title: "Research-related incident", heldBy: "FBI (moderate confidence), DOE and CIA (low confidence); some scientists", summary: "The virus emerged from research activity in Wuhan.", arguments: ["The outbreak began in a city with a major coronavirus lab.", "Lab records have not been released."], counterarguments: ["No direct evidence of the virus in a lab before the outbreak has been produced."], sources: ["odni-covid-2023"] },
  ],
};

export default topic;
