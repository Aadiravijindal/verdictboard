import type { TopicSeed } from "../types";

const topic: TopicSeed = {
  slug: "xinjiang",
  code: "TOP-009",
  title: "China / Xinjiang",
  category: "Human rights",
  region: "East Asia",
  kicker: "Human rights",
  summary: "Mass detention, surveillance and the legal labels applied to China's policies toward Uyghurs and other Muslim minorities.",
  overview:
    "Since 2017 China has detained large numbers of Uyghurs and other mostly Muslim minorities in Xinjiang in facilities it describes as vocational education and training centres. The UN human rights office assessed in 2022 that serious violations had occurred. Whether these amount to genocide is a disputed legal characterisation.",
  scope: "Policies in Xinjiang since 2017.",
  sortOrder: 9,
  lastReviewed: "2026-10-16",
  sources: [
    { slug: "ohchr-xinjiang-2022", title: "OHCHR Assessment of human rights concerns in the Xinjiang Uyghur Autonomous Region, People's Republic of China", publisher: "UN Office of the High Commissioner for Human Rights", url: "https://www.ohchr.org/en/documents/country-reports/ohchr-assessment-human-rights-concerns-xinjiang-uyghur-autonomous-region", publishedAt: "2022-08-31", sourceType: "INTERGOVERNMENTAL", isPrimary: false, description: "Finds serious human rights violations that may constitute international crimes, in particular crimes against humanity. China's response is annexed.", limitations: "OHCHR did not have unrestricted access. China rejects the assessment." },
    { slug: "state-xinjiang-2021", title: "Determination of the Secretary of State on Atrocities in Xinjiang", publisher: "US Department of State", url: "https://2017-2021.state.gov/determination-of-the-secretary-of-state-on-atrocities-in-xinjiang/", publishedAt: "2021-01-19", sourceType: "OFFICIAL_STATEMENT", isPrimary: true, description: "The US government determines that China is committing genocide and crimes against humanity in Xinjiang.", limitations: "A political determination by a government, not a judicial finding." },
    { slug: "aspi-xjdp", title: "Xinjiang Data Project", publisher: "Australian Strategic Policy Institute", url: "https://xjdp.aspi.org.au/", sourceType: "INDEPENDENT_INVESTIGATION", isPrimary: false, description: "Satellite-imagery mapping of detention facilities and destroyed religious sites.", limitations: "ASPI receives funding from governments including Australia and the US; China disputes its findings." },
  ],
  events: [
    { slug: "xj-2017", date: "2017", title: "Mass detention campaign expands", description: "Large numbers of Uyghurs and other minorities are detained in facilities China calls vocational training centres.", sources: ["ohchr-xinjiang-2022"], keyEvent: true },
    { slug: "xj-2021-us", date: "2021-01-19", title: "US declares genocide", description: "The US State Department determines that China is committing genocide.", sources: ["state-xinjiang-2021"] },
    { slug: "xj-2022-ohchr", date: "2022-08-31", title: "UN human rights office assessment", description: "OHCHR finds serious violations that may constitute crimes against humanity.", sources: ["ohchr-xinjiang-2022"], keyEvent: true },
  ],
  claims: [
    {
      slug: "xinjiang-mass-detention",
      code: "CLM-080", headline: "Has China detained Uyghurs on a mass scale?",
      proposition: "Since 2017, Chinese authorities have detained large numbers of Uyghurs and other predominantly Muslim minorities in Xinjiang in facilities without due process.",
      kind: "FACTUAL", status: "WIDELY_AGREED", reason: "CORROBORATED_INDEPENDENT",
      statusRationale: "Corroborated by the UN human rights office, leaked government documents, satellite imagery and survivor testimony. China acknowledges the facilities but describes them as voluntary training centres.",
      scope: "The existence and character of detention. Exact numbers are uncertain.",
      summary: "The existence of a large detention system is well established; the number detained (estimates range up to about a million or more at the peak) is uncertain.",
      decomposition: ["What facilities exist?", "Were people held without due process?", "How many people?"],
      established: ["OHCHR found arbitrary and discriminatory detention on a large scale."],
      contested: ["Total numbers detained.", "The extent to which facilities have been closed or converted to prisons."],
      counterevidence: ["China says the centres were voluntary, counter-terrorism education and that all 'trainees' graduated by 2019."],
      missingEvidence: ["Unrestricted independent access."],
      evidence: [
        { source: "ohchr-xinjiang-2022", relation: "SUPPORTS", establishes: "UN assessment of arbitrary detention." },
        { source: "aspi-xjdp", relation: "SUPPORTS", establishes: "Satellite mapping of facilities." },
      ],
    },
    {
      slug: "xinjiang-genocide",
      code: "CLM-081", headline: "Is it genocide?",
      proposition: "China's policies in Xinjiang constitute genocide under the 1948 Genocide Convention.",
      kind: "LEGAL", status: "DISPUTED", reason: "LEGAL_UNRESOLVED",
      statusRationale: "No court has ruled. The US government and several parliaments have used the term; the UN human rights office found possible crimes against humanity without making a genocide finding. China rejects all such characterisations.",
      scope: "The legal label. The underlying facts are covered in the detention dossier.",
      summary: "The disagreement is mostly about whether evidence of birth-prevention measures and destruction of cultural identity meets the Convention's specific-intent standard.",
      decomposition: ["Which Convention acts are alleged?", "What evidence of intent exists?", "Which bodies have reached which conclusions?"],
      established: ["The US government made a genocide determination in January 2021.", "OHCHR found possible crimes against humanity."],
      contested: ["Whether intent to destroy the group, in whole or in part, is established."],
      counterevidence: ["China points to Uyghur population growth over recent decades."],
      missingEvidence: ["A judicial proceeding with jurisdiction."],
      evidence: [
        { source: "state-xinjiang-2021", relation: "SUPPORTS", establishes: "A government determination of genocide." },
        { source: "ohchr-xinjiang-2022", relation: "PARTIALLY_SUPPORTS", establishes: "Possible crimes against humanity; no genocide finding." },
      ],
    },
  ],
  perspectives: [
    { slug: "xj-china", title: "Chinese government position", heldBy: "Government of China", summary: "Policies are counter-terrorism and poverty-alleviation measures that have restored stability.", arguments: ["Xinjiang experienced terrorist attacks before 2017.", "Economic development has raised living standards."], counterarguments: ["UN findings of arbitrary detention and family separation."], sources: ["ohchr-xinjiang-2022"] },
    { slug: "xj-critics", title: "Human-rights critics", heldBy: "UN human rights office, many governments and NGOs", summary: "The policies involve mass arbitrary detention and repression that may amount to international crimes.", arguments: ["Leaked documents and satellite imagery.", "Survivor testimony."], counterarguments: ["Access restrictions limit verification of numbers."], sources: ["ohchr-xinjiang-2022", "aspi-xjdp"] },
  ],
};

export default topic;
