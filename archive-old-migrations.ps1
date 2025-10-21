# Archive old migrations (before August 22, 2025)
$archiveDir = "supabase\migrations\_archive_old"

# Move migrations from 2024
Move-Item "supabase\migrations\202407*" $archiveDir -Force -ErrorAction SilentlyContinue

# Move migrations from early 2025 (Jan-July)
Move-Item "supabase\migrations\202501*" $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item "supabase\migrations\202502*" $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item "supabase\migrations\202503*" $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item "supabase\migrations\202504*" $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item "supabase\migrations\202505*" $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item "supabase\migrations\202506*" $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item "supabase\migrations\202507*" $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item "supabase\migrations\202508[01]*" $archiveDir -Force -ErrorAction SilentlyContinue

Write-Host "Old migrations archived. Recent migrations (past 60 days) remain in migrations folder."
