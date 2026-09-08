Add-Type -AssemblyName System.Drawing

$p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786428488666.png"
if (-not (Test-Path $p)) {
    $p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786428623917.png"
}

$dest = "d:\httn-app\assets\images\vendors\vendor_8.jpg"

$src = [System.Drawing.Image]::FromFile($p)
$bmp = New-Object System.Drawing.Bitmap $src
$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
$src.Dispose()
Write-Host "Saved Kings CarWash to vendor_8.jpg from $p!"
