Add-Type -AssemblyName System.Drawing

$outDir = 'd:\httn-app\assets\images\vendors'
$base = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded'

function Save-ImageAsJpeg($srcPath, $destPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap $src
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    $src.Dispose()
}

# 1. Puredent (vendor_6.jpg)
Save-ImageAsJpeg "$base\media_1786429758681.png" "$outDir\vendor_6.jpg"
Write-Host "Saved Puredent (vendor_6.jpg)"

# 2. Miniso (vendor_5.jpg)
Save-ImageAsJpeg "$base\media_1786429761903.jpg" "$outDir\vendor_5.jpg"
Write-Host "Saved Miniso (vendor_5.jpg)"

# 3. Sharers (vendor_3.jpg)
Save-ImageAsJpeg "$base\media_1786429763907.jpg" "$outDir\vendor_3.jpg"
Write-Host "Saved Sharers (vendor_3.jpg)"

# 4. Kings Carwash (vendor_8.jpg)
Save-ImageAsJpeg "$base\media_1786429766351.jpg" "$outDir\vendor_8.jpg"
Write-Host "Saved Kings Carwash (vendor_8.jpg)"

Write-Host "All 4 brand images updated successfully!"
