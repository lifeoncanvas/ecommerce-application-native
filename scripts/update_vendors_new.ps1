Add-Type -AssemblyName System.Drawing

$outDir = 'd:\httn-app\assets\images\vendors'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$base = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded'

function Save-ImageAsJpeg($srcPath, $destPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap $src
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    $src.Dispose()
}

# 1. Omnia (Phones)
Save-ImageAsJpeg "$base\media_1786427288830.png" "$outDir\vendor_1.jpg"
Write-Host "Saved 1. Omnia (vendor_1.jpg)"

# 2. Kalaya Beauty (Makeup)
Save-ImageAsJpeg "$base\media_1786426453360.png" "$outDir\vendor_2.jpg"
Write-Host "Saved 2. Kalaya Beauty (vendor_2.jpg)"

# 3. Sharers (Grocery Bag)
Save-ImageAsJpeg "$base\media_1786427389188.png" "$outDir\vendor_3.jpg"
Write-Host "Saved 3. Sharers (vendor_3.jpg)"

# 4. Home World (Pink Tulip Candle)
Save-ImageAsJpeg "$base\media_1786427638776.png" "$outDir\vendor_4.jpg"
Write-Host "Saved 4. Home world (vendor_4.jpg)"

# 5. Miniso (Cute Plush Sheep)
Save-ImageAsJpeg "$base\media_1786428442912.png" "$outDir\vendor_5.jpg"
Write-Host "Saved 5. Miniso (vendor_5.jpg)"

# 6. Puredent (Toothpaste)
Save-ImageAsJpeg "$base\media_1786428437235.png" "$outDir\vendor_6.jpg"
Write-Host "Saved 6. Puredent (vendor_6.jpg)"

# 7. Fashion Redemption (Orange Outfit)
Save-ImageAsJpeg "$base\media_1786426677963.png" "$outDir\vendor_7.jpg"
Write-Host "Saved 7. Fashion Redemption (vendor_7.jpg)"

Write-Host "All vendor images updated!"
