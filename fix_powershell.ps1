# Run this script in PowerShell as Administrator
# Right-click on PowerShell -> Run as Administrator

Write-Host "Fixing PowerShell Execution Policy..." -ForegroundColor Yellow
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Write-Host "✅ Done! PowerShell is now configured." -ForegroundColor Green
Write-Host "Close this window and reopen a normal terminal." -ForegroundColor Cyan
