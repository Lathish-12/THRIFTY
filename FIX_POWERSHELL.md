# Fix PowerShell Execution Policy Error

## Problem
You're getting this error when running npm commands:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

## Solution

### Option 1: Quick Fix (Recommended for Development)

Open PowerShell **as Administrator** and run:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then restart your terminal and try again.

### Option 2: Alternative Command

If Option 1 doesn't work, use:

```powershell
Set-ExecutionPolicy Unrestricted -Scope CurrentUser
```

### Option 3: One-Time Bypass

For a single session, run this before any npm commands:

```powershell
Set-ExecutionPolicy Bypass -Scope Process
```

### Option 4: Use CMD Instead

Instead of PowerShell, use Command Prompt (CMD):
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project: `cd C:\Users\ELCOT\THRIFTY`
4. Run your npm commands normally

## Verify the Fix

After applying any solution, test with:

```bash
npm --version
npm run dev
```

## Security Note

- `RemoteSigned` is safe for development - it allows local scripts but requires remote scripts to be signed
- Only use `Unrestricted` if `RemoteSigned` doesn't work
- Always be cautious when changing execution policies

## What This Does

Windows PowerShell has security policies that prevent scripts from running. Since npm uses PowerShell scripts (`.ps1` files), you need to allow them to execute.
