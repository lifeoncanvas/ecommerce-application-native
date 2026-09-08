Add-Type -AssemblyName System.Drawing

$base = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded'
$outDir = 'd:\httn-app\assets\images\details'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

function Crop-Image($srcFile, $destFile, $x, $y, $w, $h) {
    $src = [System.Drawing.Bitmap]::FromFile("$base\$srcFile")
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = $src.Clone($rect, $src.PixelFormat)
    $cropped.Save("$outDir\$destFile", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $cropped.Dispose()
    $src.Dispose()
    Write-Host "Saved $destFile"
}

# Hero 1
Crop-Image 'media_1786444402801.png' 'hero_1.jpg' 0 54 260 350

# More tops
Crop-Image 'media_1786444432015.png' 'card_1.jpg' 12 125 140 180
Crop-Image 'media_1786444432015.png' 'card_2.jpg' 165 125 140 180

# Recommended items
Crop-Image 'media_1786444455929.png' 'card_3.jpg' 15 50 135 175
Crop-Image 'media_1786444455929.png' 'card_4.jpg' 160 50 135 175
Crop-Image 'media_1786444455929.png' 'card_5.jpg' 160 265 135 175

Write-Host "All product detail assets cropped successfully!"
