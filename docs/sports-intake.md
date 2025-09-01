# Sports Intake System

## Overview
The Sports Intake system captures user preferences and demographics for personalized sports training experiences.

## Database Schema

### Table: `sports_intake`

```sql
CREATE TABLE sports_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  age TEXT, -- '8-18' or '19+'
  gender TEXT, -- 'M', 'F', 'Nonbinary', 'Prefer not'
  sport TEXT, -- 'Basketball', 'Baseball', 'Soccer', 'Football', 'Tennis', 'Volleyball', 'Other'
  sport_other TEXT, -- Free text when sport='Other'
  source TEXT DEFAULT 'sports_page'
);

-- Indexes
CREATE INDEX idx_sports_intake_user_id ON sports_intake(user_id);
CREATE INDEX idx_sports_intake_created_at ON sports_intake(created_at);
```

## API Endpoint

### POST `/api/sports/intake`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", // optional
  "age": "8-18", // or "19+"
  "gender": "M", // M/F/Nonbinary/Prefer not
  "sport": "Basketball", // or "Other"
  "sport_other": "Lacrosse" // required if sport="Other"
}
```

**Response (Success):**
```json
{
  "saved": true,
  "intakeId": "uuid-string",
  "message": "Profile saved successfully"
}
```

**Response (Local-only fallback):**
```json
{
  "saved": false,
  "localOnly": true,
  "message": "Profile saved locally"
}
```

## Usage Notes

1. **Graceful Degradation**: If Supabase is unavailable, the system falls back to localStorage storage
2. **Authentication**: Links user_id if user is authenticated, otherwise stores as anonymous
3. **U13 Mode**: When age is '8-18', enables youth-friendly UI messaging
4. **Metadata**: IntakeId is stored in sessionStorage for checkout metadata passthrough
5. **Privacy**: IP address is captured for analytics but not required

## Integration Points

- **Frontend**: `components/sports/IntakeSheet.tsx`
- **API**: `app/api/sports/intake/route.ts`
- **Storage**: localStorage fallback with key `sports_intake`
- **Checkout**: IntakeId passed via sessionStorage to checkout flow
- **UI**: U13 mode affects `EncouragementFooter.tsx` messaging