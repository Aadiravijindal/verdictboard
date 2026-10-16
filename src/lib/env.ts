function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name}`);
  return v;
}

export const env = {
  get appUrl() {
    return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get secret() {
    const s = process.env.APP_SECRET ?? (process.env.NODE_ENV === "production" ? required("APP_SECRET") : "dev-insecure-secret");
    if (process.env.NODE_ENV === "production" && s.length < 32) throw new Error("APP_SECRET must be at least 32 characters");
    return s;
  },
  get adminEmails() {
    return (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  },
  get requireSecondReviewer() {
    return (process.env.REQUIRE_SECOND_REVIEWER ?? "true") !== "false";
  },
  get minSubgroupSize() {
    return Math.max(5, Number(process.env.MIN_SUBGROUP_SIZE ?? 30) || 30);
  },
  get aiEnabled() {
    return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  },
  get aiModel() {
    return process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};
