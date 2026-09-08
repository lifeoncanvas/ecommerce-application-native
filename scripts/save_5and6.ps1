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

# Product 5: Kids Dresses (Fashion Redemption) -> product_5.jpg
Save-ImageAsJpeg "$base\media_1786430508952.png" "$outDir\product_5.jpg"
Write-Host "Saved Product 5 (product_5.jpg)"

# Product 6: Complexion 05 (Kalaya Beauty) -> product_6.jpg
Save-ImageAsJpeg "$base\media_1786430613232.jpg" "$outDir\product_6.jpg"
Write-Host "Saved Product 6 (product_6.jpg)"

Write-Host "Products 5 and 6 saved successfully!"
