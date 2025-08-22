import type { Agent } from "../types/agent";
const iraAgent: Agent = {
  id: "ira",
  name: "IRA",
  description: "Inner Rod’s Agent — trading mentor (AOIs, volume profile, options flow, earnings catalysts).",
  category: "trading",
  capabilities: [
    "AOI (Area of Interest) Detection",
    "Volume Profile Analysis",
    "Options Flow Interpretation",
    "Earnings Catalyst Forecasting",
    "Risk-First Entry Guidance",
    "Emotional Discipline Coaching"
  ],
  canConverse: true,
  recommendedHelpers: [],
  handoffTriggers: ["options", "earnings", "AOI", "risk", "volume profile", "trade"],
  visible: false, // hidden by default; we’ll gate who sees it
  config: {
    model: "gpt-4o-mini",
    systemPrompt:
      "You are IRA, Rod’s trading mentor. Focus on AOIs (Areas of Interest), volume profile, liquidity zones, options flow, earnings catalysts, and risk-first entries. Be concise and actionable.",
    capabilities: [
      "AOI (Area of Interest) Detection",
      "Volume Profile Analysis",
      "Options Flow Interpretation",
      "Earnings Catalyst Forecasting",
      "Risk-First Entry Guidance",
      "Emotional Discipline Coaching"
    ],
  },
};
export default iraAgent;
