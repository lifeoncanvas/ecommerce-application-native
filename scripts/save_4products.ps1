Add-Type -AssemblyName System.Drawing

$outDir = 'd:\httn-app\assets\images\products'
$base = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded'

function Save-ImageAsJpeg($srcPath, $destPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap $src
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    $src.Dispose()
}

# 1. Beautiful Woman (Kalaya Beauty) -> product_1.jpg
Save-ImageAsJpeg "$base\media_1786430186750.jpg" "$outDir\product_1.jpg"
Write-Host "Saved Product 1 (product_1.jpg)"

# 2. Coord Set (Fashion Redemption) -> product_2.jpg
Save-ImageAsJpeg "$base\media_1786430260417.png" "$outDir\product_2.jpg"
Write-Host "Saved Product 2 (product_2.jpg)"

# 3. Signature Red (Kalaya Beauty) -> product_3.jpg
Save-ImageAsJpeg "$base\media_1786430353406.png" "$outDir\product_3.jpg"
Write-Host "Saved Product 3 (product_3.jpg)"

# 4. Mens Suit (Fashion Redemption) -> product_4.jpg
Save-ImageAsJpeg "$base\media_1786430451312.png" "$outDir\product_4.jpg"
Write-Host "Saved Product 4 (product_4.jpg)"

Write-Host "Products 1 to 4 saved successfully!"
