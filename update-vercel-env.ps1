# PowerShell script to update Vercel environment variables
# Run this script to automatically add Grok API key to Vercel

Write-Host "🔧 Updating Vercel Environment Variables..." -ForegroundColor Cyan

# Read the .env file to get the Grok API key
$envFile = Get-Content .env
$grokKey = ($envFile | Select-String "REACT_APP_GROK_API_KEY=").ToString().Split("=")[1]

if ($grokKey -eq "YOUR_GROK_API_KEY_HERE" -or [string]::IsNullOrWhiteSpace($grokKey)) {
    Write-Host "❌ Error: Grok API key not found in .env file" -ForegroundColor Red
    Write-Host "Please add your Grok API key to .env file first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found Grok API key in .env: $($grokKey.Substring(0, 10))..." -ForegroundColor Green

# Add to Vercel (production)
Write-Host "📤 Adding REACT_APP_GROK_API_KEY to Vercel (Production)..." -ForegroundColor Cyan
vercel env add REACT_APP_GROK_API_KEY production

# Add to Vercel (preview)
Write-Host "📤 Adding REACT_APP_GROK_API_KEY to Vercel (Preview)..." -ForegroundColor Cyan
vercel env add REACT_APP_GROK_API_KEY preview

# Add to Vercel (development)
Write-Host "📤 Adding REACT_APP_GROK_API_KEY to Vercel (Development)..." -ForegroundColor Cyan
vercel env add REACT_APP_GROK_API_KEY development

Write-Host ""
Write-Host "✅ Environment variables updated!" -ForegroundColor Green
Write-Host "🚀 Now deploying to production..." -ForegroundColor Cyan
Write-Host ""

# Deploy to production
vercel --prod

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Your website builder is now using Grok Code Fast 1!" -ForegroundColor Cyan
