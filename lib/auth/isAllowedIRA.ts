export function isAllowedIRA(email?: string | null) {
  const list = (process.env.IRA_ALLOWED_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}
