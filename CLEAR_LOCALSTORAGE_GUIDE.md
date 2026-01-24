# Clear Browser localStorage Guide

## Why Clear localStorage?

Your browser has cached old game data (username, gender, completed levels, settings) that conflicts with the new database-driven system. We need to clear this to ensure the database is the single source of truth.

## How to Clear localStorage

### Method 1: Using Browser DevTools (Recommended)

1. **Open your game in the browser** (http://localhost:5173)

2. **Open Developer Tools**:
   - Press `F12` or
   - Right-click → "Inspect" or
   - Press `Ctrl + Shift + I`

3. **Go to the Application/Storage tab**:
   - In Chrome/Edge: Click "Application" tab
   - In Firefox: Click "Storage" tab

4. **Clear localStorage**:
   - In the left sidebar, expand "Local Storage"
   - Click on `http://localhost:5173`
   - You'll see entries like:
     - `qpr_player_name`
     - `qpr_player_gender`
     - `qpr_completed_missions_v5`
     - `qpr_settings`
     - etc.
   - **Right-click on "Local Storage" → "Clear"** to remove all entries
   - OR delete each entry individually by right-clicking and selecting "Delete"

5. **Refresh the page** (`Ctrl + R` or `F5`)

### Method 2: Using Browser Console (Quick)

1. **Open Developer Tools** (`F12`)
2. **Go to Console tab**
3. **Paste this command and press Enter**:
   ```javascript
   localStorage.clear(); location.reload();
   ```

This will clear all localStorage and reload the page.

## What Changed?

### Before (Old System)
- Data was stored in **localStorage only**
- Every time you opened the app, it read from localStorage
- Problem: localStorage data could get out of sync or stale

### After (New System)
- Data is stored in **Supabase database only**
- localStorage is **NOT used** for user data anymore
- When you log in, data is loaded from the database
- When you make changes, they're saved to the database
- This ensures:
  - ✅ Data persists across devices
  - ✅ No conflicts between old and new data
  - ✅ Proper session management

## Expected Behavior After Clearing

### For New Users:
1. Open app → See Splash Screen
2. Click "Get Started" → Sign Up page
3. Sign up → Email verification notice
4. Verify email → Sign in
5. Enter username → Select gender → Level selection

### For Returning Users (Already Signed Up):
1. Open app → See Splash Screen
2. Click "Get Started" → Sign In page
3. Sign in with your email/password
4. **Automatically redirected to Level Selection** (if you've completed profile setup before)
5. Your username, gender, completed levels, and settings are loaded from the database

### Session Persistence:
- Once logged in, you can **close the tab and reopen** → You'll stay logged in
- You can **switch tabs and come back** → You'll stay on the same screen (no reset to username page)
- Your progress is saved automatically

## Testing Checklist

After clearing localStorage, test these scenarios:

1. **Sign up a new user**:
   - [ ] Sign up with a new email
   - [ ] Verify email
   - [ ] Sign in
   - [ ] Enter username and gender
   - [ ] Verify data is saved in Supabase `profiles` table

2. **Complete a mission**:
   - [ ] Play through a mission
   - [ ] Complete it
   - [ ] Verify it's saved in Supabase `game_progress` table

3. **Change settings**:
   - [ ] Adjust volume, TTS, or text speed
   - [ ] Verify changes are saved in Supabase `user_settings` table

4. **Test session persistence**:
   - [ ] Close the browser tab
   - [ ] Reopen the game URL
   - [ ] Verify you're still logged in
   - [ ] Verify you're on the Level Selection screen (not username page)

5. **Test tab switching**:
   - [ ] While logged in and on Level Selection
   - [ ] Switch to another tab
   - [ ] Come back to the game tab
   - [ ] Verify you're still on Level Selection (not reset to username page)

6. **Test logout and login**:
   - [ ] Log out
   - [ ] Log back in
   - [ ] Verify all your data (username, gender, progress, settings) is restored

## Troubleshooting

### Issue: Still seeing old username
- **Solution**: Make sure you cleared localStorage completely
- Try Method 2 (console command) to be sure

### Issue: App still resets to username page
- **Solution**: Check browser console for errors
- Make sure you're logged in (check Supabase Authentication tab)
- Verify your profile exists in the `profiles` table

### Issue: Data not saving
- **Solution**: Check browser console for database errors
- Verify you ran the `supabase_schema.sql` in Supabase SQL Editor
- Check that RLS policies are enabled

## Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12 → Console tab)
2. Check the Supabase dashboard:
   - Authentication → Users (verify your user exists)
   - Table Editor → profiles (verify your profile exists)
   - Table Editor → game_progress (verify missions are saved)
3. Share any error messages you see
