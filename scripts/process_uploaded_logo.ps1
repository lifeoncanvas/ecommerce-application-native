Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Upasana\.gemini\antigravity\brain\b8198176-c5bb-40e3-8dfb-1e77a67cd7cc\media__1788865086736.jpg"
$destJpg = "d:\httn-app\assets\images\LitchtMarketing_logo.jpg"

Copy-Item -Path $srcPath -Destination $destJpg -Force

$img = [System.Drawing.Bitmap]::FromFile($destJpg)
Write-Host "Uploaded image size:" $img.Width "x" $img.Height

$img.Dispose()
