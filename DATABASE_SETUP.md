# Database Setup Guide

## Overview

This guide will help you set up the Supabase database tables to store user profiles, game progress, minigame scores, and settings.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (`juajkyjgqmwxowslpslh`)
3. In the left sidebar, click on **SQL Editor** (icon looks like `</>`)

## Step 2: Run the Schema SQL

1. Click **+ New Query** button
2. Open the file `supabase_schema.sql` in your project root
3. Copy ALL the contents of that file
4. Paste it into the SQL Editor
5. Click **Run** button (or press Ctrl+Enter / Cmd+Enter)

You should see a success message indicating all tables, policies, and triggers were created.

## Step 3: Verify Tables Were Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'game_progress', 'minigame_scores', 'user_settings');
```

You should see all 4 tables listed.

## Database Schema Overview

### Tables Created

#### 1. `profiles`
Stores user profile information:
- `id` - User UUID (references auth.users)
- `email` - User's email
- `username` - Player's chosen name
- `player_gender` - Voice type ('guy' or 'girl')
- `created_at`, `updated_at` - Timestamps

#### 2. `game_progress`
Stores completed missions:
- `id` - Unique ID
- `user_id` - References profiles
- `mission_id` - Mission identifier
- `trust_score` - Final trust score achieved
- `completed_at` - When mission was completed

#### 3. `minigame_scores`
Stores minigame performance:
- `id` - Unique ID
- `user_id` - References profiles
- `game_type` - Type of minigame (quiz, signal_scout, etc.)
- `score` - Points scored
- `total_questions` - Total questions
- `correct_answers` - Number correct
- `time_taken` - Time in seconds
- `best_streak` - Best streak achieved
- `played_at` - When played

#### 4. `user_settings`
Stores user preferences:
- `user_id` - References profiles (Primary Key)
- `audio_volume` - Volume level (0-1)
- `tts_enabled` - Text-to-speech on/off
- `text_speed` - Text display speed
- `created_at`, `updated_at` - Timestamps

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only view their own data
- Users can only insert/update their own data
- No user can access another user's information

### Automatic Triggers

1. **Auto-create profile**: When a user signs up, a profile and settings record are automatically created
2. **Auto-update timestamps**: `updated_at` fields are automatically updated on changes

## How It Works in the App

### On User Sign In/Sign Up

1. User authenticates via Supabase Auth
2. Profile is automatically created (if new user)
3. App loads:
   - Username and gender from `profiles`
   - Completed missions from `game_progress`
   - Settings from `user_settings`

### During Gameplay

1. **Name Selection**: Saved to `profiles.username`
2. **Gender Selection**: Saved to `profiles.player_gender`
3. **Mission Completion**: Saved to `game_progress`
4. **Settings Changes**: Saved to `user_settings`
5. **Minigame Scores**: Saved to `minigame_scores`

### On Return Visit

1. User signs in
2. App automatically loads all saved data
3. User continues from where they left off
4. No need to re-enter name or gender
5. All completed missions remain unlocked

## Testing the Database

### Test 1: Check Profile Creation

After signing up a new user, run:

```sql
SELECT * FROM profiles WHERE email = 'your-test-email@example.com';
```

You should see a profile record with that email.

### Test 2: Check Game Progress

After completing a mission, run:

```sql
SELECT * FROM game_progress WHERE user_id = 'your-user-id';
```

You should see the completed mission listed.

### Test 3: Check Settings

After changing settings, run:

```sql
SELECT * FROM user_settings WHERE user_id = 'your-user-id';
```

You should see your updated settings.

## Troubleshooting

### Issue: Tables not created

**Solution**: Make sure you copied the ENTIRE `supabase_schema.sql` file content and ran it all at once.

### Issue: Permission denied errors

**Solution**: 
1. Make sure RLS policies were created
2. Verify you're signed in as the correct user
3. Check that the user's UUID matches the profile ID

### Issue: Profile not auto-creating

**Solution**:
1. Check if the trigger `on_auth_user_created` exists:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
2. If missing, re-run the trigger creation part of the schema

### Issue: Data not saving

**Solution**:
1. Check browser console for errors
2. Verify user is authenticated (`currentUser` is not null)
3. Check Supabase logs in Dashboard → Logs

## Viewing Your Data

### View All Your Profiles
```sql
SELECT * FROM profiles ORDER BY created_at DESC;
```

### View All Game Progress
```sql
SELECT p.username, gp.mission_id, gp.trust_score, gp.completed_at
FROM game_progress gp
JOIN profiles p ON p.id = gp.user_id
ORDER BY gp.completed_at DESC;
```

### View Minigame Leaderboard
```sql
SELECT p.username, ms.game_type, ms.score, ms.best_streak
FROM minigame_scores ms
JOIN profiles p ON p.id = ms.user_id
ORDER BY ms.score DESC
LIMIT 10;
```

## Data Migration (Optional)

If you have existing users with localStorage data, you can migrate it:

1. Users sign in
2. App automatically saves their localStorage data to database
3. On next login, data is loaded from database

The app handles this automatically - no manual migration needed!

## Backup and Export

To backup your data:

1. Go to Supabase Dashboard → Database → Backups
2. Enable automatic backups (recommended)
3. Or manually export tables using the SQL Editor

## Next Steps

After setting up the database:

1. ✅ Test user signup and profile creation
2. ✅ Play a mission and verify it saves
3. ✅ Change settings and verify they persist
4. ✅ Sign out and sign back in to verify data loads
5. ✅ Test on different devices with same account

## Support

If you encounter issues:
- Check Supabase Dashboard → Logs for errors
- Verify RLS policies are enabled
- Check browser console for JavaScript errors
- Ensure you're using the latest version of the app

---

**Congratulations!** Your database is now set up and ready to store user progress! 🎉
