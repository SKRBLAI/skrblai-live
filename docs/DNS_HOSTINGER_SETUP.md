# DNS & Hostinger Setup Guide

## Overview
This guide covers DNS configuration for SKRBL AI platform hosted on Hostinger, including Proton Mail records and Railway deployment subdomains.

---

## 1. Proton Mail Configuration

Configure the following DNS records in Hostinger DNS management for your domain.

### MX Records (Mail Exchange)

| Type | Name | Priority | Value |
|------|------|----------|-------|
| MX   | @    | 10       | mail.protonmail.ch |
| MX   | @    | 20       | mailsec.protonmail.ch |

### SPF Record (Sender Policy Framework)

| Type | Name | Value |
|------|------|-------|
| TXT  | @    | `v=spf1 include:_spf.protonmail.ch ~all` |

### DKIM Records (DomainKeys Identified Mail)

Proton Mail provides three DKIM keys. Add each as a CNAME record:

| Type  | Name           | Value |
|-------|----------------|-------|
| CNAME | protonmail._domainkey | `protonmail.domainkey.[YOUR_PROTON_DOMAIN].domains.proton.ch` |
| CNAME | protonmail2._domainkey | `protonmail2.domainkey.[YOUR_PROTON_DOMAIN].domains.proton.ch` |
| CNAME | protonmail3._domainkey | `protonmail3.domainkey.[YOUR_PROTON_DOMAIN].domains.proton.ch` |

**Note**: Replace `[YOUR_PROTON_DOMAIN]` with your actual Proton Mail domain identifier (found in Proton Mail settings).

### DMARC Record (Domain-based Message Authentication)

| Type | Name   | Value |
|------|--------|-------|
| TXT  | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:postmaster@yourdomain.com` |

**DMARC Policy Explanation**:
- `p=quarantine`: Quarantine emails that fail DMARC checks (recommended for production)
- `p=none`: Monitor only (use during testing)
- `p=reject`: Reject emails that fail (strictest policy)
- `rua`: Email address to receive aggregate reports

---

## 2. Application Subdomains

Configure the following subdomains for Railway deployments and proxy services.

### Subdomain A Records / CNAME Records

| Subdomain | Type  | Value | Purpose |
|-----------|-------|-------|---------|
| app       | A / CNAME | `[Railway IP or Domain]` | Main application |
| api       | A / CNAME | `[Railway IP or Domain]` | API backend |
| n8n       | A / CNAME | `[Railway IP or Domain]` | n8n automation platform |
| studio    | A / CNAME | `[Railway IP or Domain]` | Supabase Studio (if self-hosted) |

**Configuration Notes**:

1. **Railway Deployments**:
   - If Railway provides a static IP, use `A` records
   - If Railway provides a domain (e.g., `yourapp.up.railway.app`), use `CNAME` records
   - Check Railway dashboard → Settings → Domains for correct values

2. **Proxy Setup**:
   - If using a reverse proxy (NGINX, Cloudflare), point subdomains to proxy server
   - Configure proxy to forward traffic to Railway services

3. **SSL Certificates**:
   - Railway provides automatic SSL for custom domains
   - Ensure DNS records are properly propagated before adding domain to Railway
   - DNS propagation can take 24-48 hours

---

## 3. DNS Configuration Steps

### In Hostinger DNS Zone Editor:

1. **Navigate to DNS Zone**:
   - Login to Hostinger → Domains → Select your domain → DNS Zone

2. **Add Mail Records**:
   - Add all MX, SPF, DKIM, and DMARC records from section 1
   - Double-check spelling and syntax

3. **Add Subdomain Records**:
   - Create A or CNAME records for each subdomain
   - Use Railway-provided values

4. **Verify Configuration**:
   - Use `dig` or online DNS checkers to verify propagation
   - Test mail sending/receiving with Proton Mail

---

## 4. Verification Commands

```bash
# Check MX records
dig MX yourdomain.com

# Check SPF record
dig TXT yourdomain.com

# Check DKIM records
dig CNAME protonmail._domainkey.yourdomain.com
dig CNAME protonmail2._domainkey.yourdomain.com
dig CNAME protonmail3._domainkey.yourdomain.com

# Check DMARC record
dig TXT _dmarc.yourdomain.com

# Check subdomain resolution
dig app.yourdomain.com
dig api.yourdomain.com
dig n8n.yourdomain.com
```

---

## 5. Troubleshooting

### Mail Not Sending/Receiving
- Verify MX records point to Proton Mail servers
- Check SPF record includes `_spf.protonmail.ch`
- Wait 24-48 hours for full DNS propagation
- Use Proton Mail's domain verification tool

### Subdomain Not Resolving
- Confirm DNS records saved correctly in Hostinger
- Check Railway domain settings match DNS configuration
- Clear local DNS cache: `sudo systemd-resolve --flush-caches` (Linux) or `ipconfig /flushdns` (Windows)
- Use `nslookup` or `dig` to check propagation

### SSL Certificate Issues
- Ensure DNS points correctly to Railway before adding custom domain
- Railway automatically provisions Let's Encrypt certificates
- Check Railway logs for certificate provisioning errors

---

## 6. Additional Resources

- **Proton Mail Documentation**: https://proton.me/support/custom-domain
- **Railway Custom Domains**: https://docs.railway.app/deploy/exposing-your-app
- **DNS Propagation Checker**: https://www.whatsmydns.net/

---

## Notes

- All DNS changes can take up to 48 hours to fully propagate globally
- Test thoroughly in staging before updating production DNS
- Keep TTL values reasonable (3600s = 1 hour is standard)
- Document all DNS changes in version control or wiki
