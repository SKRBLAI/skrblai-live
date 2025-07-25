# ---- Build Stage ----
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    RUN apk add --no-cache python3 make g++ && npm install -g npm@10
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    
    # Set environment variables directly (all your sensitive keys here)
    ENV NEXT_PUBLIC_DASHBOARD_URL=https://skrblai.io/dashboard
    ENV NEXT_PUBLIC_PRICING_URL=https://skrblai.io/pricing
    ENV NEXT_PUBLIC_BASE_URL=https://skrblai.io
    
    ENV NEXT_PUBLIC_SUPABASE_URL=https://zpqavydsinrtaxhowmnb.supabase.co
    ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
    ENV SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
    ENV SUPABASE_PASS_KEY=Jaelin&Gabe1
    
    ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51R19D9FxZMzukOVxUlLA6DPtA09YqyJCBdeSgZUrBjpK48ywbOZWW2pt1ov30H7hxhNflrgEcFxJarBAP8OcO5ey00Snfibh9x
    ENV STRIPE_SECRET_KEY=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
    
    ENV RESEND_API_KEY=re_XAHfoMBD_4NE2UH5b8iGreWLTS1DMk4db
    ENV RESEND_API_KEY_2=re_UzsMbTyc_Dwbu4H7pPLM3kz3mir5oDke9
    
    ENV OPENAI_API_KEY=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
    
    ENV HOSTINGER_API_TOKEN=YqTdfVmW0eREI5u6K1sKjdWlft6dqHywv2S7gMiO75fd533c
    
    ENV N8N_WEBHOOK_URL=https://skrblai.app.n8n.cloud/webhook/0327cb1d-50bb-445f-a4a1-9ecd6c266bbd
    ENV N8N_BASE_URL=https://skrblai.app.n8n.cloud
    ENV N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZTUxYTg0Zi0wNDY4LTRlY2QtOWYwMi01M2M4ZTgxNDc4YjQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ4OTQxNzMxfQ.Bt9CLjGopX-S1cwS-glYf_Mmo2mb3-m6pmPXtqbgkGo
    
    # (repeat for all other webhooks you have)
    ENV N8N_WEBHOOK_PERCY_ORCHESTRATION_MASTER=https://skrblai.app.n8n.cloud/webhook/percy-orchestration-master
    ENV N8N_WEBHOOK_SKILL_SMITH_AGENT=https://skrblai.app.n8n.cloud/webhook/sports-performance-master
    
    ENV CLOUDINARY_CLOUD_NAME=drkvu3y9h
    ENV CLOUDINARY_API_KEY=574277585598126
    ENV CLOUDINARY_API_SECRET=ZO_ItfNMVdrBoLGkQQsHROT4sk8
    
    ENV VIP_SMS_WHITELIST=+18444262860
    ENV TWILIO_ACCOUNT_SID=AC57435df596b42e3f5807328ed6ccf5e7
    ENV TWILIO_AUTH_TOKEN=7d16d7eec92da40e375819ebeb5334db
    ENV TWILIO_MESSAGING_SERVICE_SID=MG09e3b1b77204511a00f64cae06d7d170
    ENV TWILIO_SECRET_KEY=9YjsAxyVBvRkILCVIFC6Km6BSG6MnOoP
    ENV TWILIO_API_KEY_SID=SKad2b60aa6189fdc81173496b766d3448
    
    # Build Next.js app
    RUN npm run build
    
    # ---- Production Stage ----
    FROM node:18-alpine AS runner
    WORKDIR /app
    
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.js ./next.config.js
    COPY --from=builder /app/postcss.config.js ./postcss.config.js
    COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
    
    # Copy ENV vars to runtime container
    ENV NEXT_PUBLIC_DASHBOARD_URL=${NEXT_PUBLIC_DASHBOARD_URL}
    ENV NEXT_PUBLIC_PRICING_URL=${NEXT_PUBLIC_PRICING_URL}
    ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
    
    ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
    ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    ENV SUPABASE_PASS_KEY=${SUPABASE_PASS_KEY}
    
    ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
    ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    
    ENV RESEND_API_KEY=${RESEND_API_KEY}
    ENV RESEND_API_KEY_2=${RESEND_API_KEY_2}
    
    ENV OPENAI_API_KEY=${OPENAI_API_KEY}
    
    ENV HOSTINGER_API_TOKEN=${HOSTINGER_API_TOKEN}
    
    ENV N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
    ENV N8N_BASE_URL=${N8N_BASE_URL}
    ENV N8N_API_KEY=${N8N_API_KEY}
    
    ENV N8N_WEBHOOK_PERCY_ORCHESTRATION_MASTER=${N8N_WEBHOOK_PERCY_ORCHESTRATION_MASTER}
    ENV N8N_WEBHOOK_SKILL_SMITH_AGENT=${N8N_WEBHOOK_SKILL_SMITH_AGENT}
    
    ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
    ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
    ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    
    ENV VIP_SMS_WHITELIST=${VIP_SMS_WHITELIST}
    ENV TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
    ENV TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
    ENV TWILIO_MESSAGING_SERVICE_SID=${TWILIO_MESSAGING_SERVICE_SID}
    ENV TWILIO_SECRET_KEY=${TWILIO_SECRET_KEY}
    ENV TWILIO_API_KEY_SID=${TWILIO_API_KEY_SID}
    
    # Expose port
    EXPOSE 3000
    ENV NODE_ENV=production
    
    CMD ["npm", "start"]
    