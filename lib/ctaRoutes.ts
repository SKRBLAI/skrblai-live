export const cta = {
  launchPercy: (authed: boolean) => authed ? "/dashboard" : "/sign-up?next=/dashboard",
  launchSkillSmith: "/sports#scan",
  signup: "/sign-up?next=/dashboard/user",
  signin: "/sign-in?next=/dashboard/user",
  demo: "/features#demo",
  quickScan: "/sports#scan",
  pricing: "/pricing",
  agentLeague: "/agents",
} as const;
