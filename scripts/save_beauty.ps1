Add-Type -AssemblyName System.Drawing

$p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786425957945.png"
$dest = "d:\httn-app\assets\images\categories\cat_5.jpg"

$src = [System.Drawing.Image]::FromFile($p)
$bmp = New-Object System.Drawing.Bitmap $src
$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
$src.Dispose()
Write-Host "Saved high-res Beauty image to cat_5.jpg!"
