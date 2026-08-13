Add-Type -AssemblyName System.Drawing

$outDir = 'd:\httn-app\assets\images\vendors'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$base = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded'
$origSrc = [System.Drawing.Bitmap]::FromFile("$base\media_1786355823543.png")
$ow = $origSrc.Width
$oh = $origSrc.Height

Write-Host "Original mockup size: ${ow}x${oh}"

# In media_1786355823543.png (957x1024), the brand tiles are in the center phone:
# Phone x: ~352 to 606 (width ~254)
# Brand row 1: y ~ 34.5% to 39.5%
# Brand row 2: y ~ 40.5% to 45.5%

# Col 1: Omnia / Miniso -> x ~ 37.0%
# Col 2: Kalaya / Prudent -> x ~ 43.5%
# Col 3: Sharers / Fashion Red -> x ~ 50.0%
# Col 4: Home world / Kings Carwash -> x ~ 56.5%

$tileW = [int]($ow * 0.056)
$tileH = [int]($oh * 0.048)

$c1_x = [int]($ow * 0.370)
$c2_x = [int]($ow * 0.434)
$c3_x = [int]($ow * 0.498)
$c4_x = [int]($ow * 0.562)

$r1_y = [int]($oh * 0.350)
$r2_y = [int]($oh * 0.407)

# 1. Omnia (Phone)
$bmp1 = New-Object System.Drawing.Bitmap $tileW, $tileH
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.DrawImage($origSrc, 0, 0, [System.Drawing.Rectangle]::new($c1_x, $r1_y, $tileW, $tileH), [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()
$bmp1.Save("$outDir\vendor_1.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp1.Dispose()
Write-Host "Saved 1. Omnia (vendor_1.jpg)"

# 2. Kalaya Beauty (Makeup - from uploaded media_1786426453360.png)
$kalayaImg = [System.Drawing.Image]::FromFile("$base\media_1786426453360.png")
$kalayaBmp = New-Object System.Drawing.Bitmap $kalayaImg
$kalayaBmp.Save("$outDir\vendor_2.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$kalayaBmp.Dispose()
$kalayaImg.Dispose()
Write-Host "Saved 2. Kalaya Beauty (vendor_2.jpg)"

# 3. Sharers (Grocery Shop)
$bmp3 = New-Object System.Drawing.Bitmap $tileW, $tileH
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g3.DrawImage($origSrc, 0, 0, [System.Drawing.Rectangle]::new($c3_x, $r1_y, $tileW, $tileH), [System.Drawing.GraphicsUnit]::Pixel)
$g3.Dispose()
$bmp3.Save("$outDir\vendor_3.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp3.Dispose()
Write-Host "Saved 3. Sharers (vendor_3.jpg)"

# 4. Home world (Home Decor)
$bmp4 = New-Object System.Drawing.Bitmap $tileW, $tileH
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g4.DrawImage($origSrc, 0, 0, [System.Drawing.Rectangle]::new($c4_x, $r1_y, $tileW, $tileH), [System.Drawing.GraphicsUnit]::Pixel)
$g4.Dispose()
$bmp4.Save("$outDir\vendor_4.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp4.Dispose()
Write-Host "Saved 4. Home world (vendor_4.jpg)"

# 5. Miniso (Cute Soft Toys / Pink Pig)
$bmp5 = New-Object System.Drawing.Bitmap $tileW, $tileH
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g5.DrawImage($origSrc, 0, 0, [System.Drawing.Rectangle]::new($c1_x, $r2_y, $tileW, $tileH), [System.Drawing.GraphicsUnit]::Pixel)
$g5.Dispose()
$bmp5.Save("$outDir\vendor_5.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp5.Dispose()
Write-Host "Saved 5. Miniso (vendor_5.jpg)"

# 6. Prudent (Toothpaste)
$bmp6 = New-Object System.Drawing.Bitmap $tileW, $tileH
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g6.DrawImage($origSrc, 0, 0, [System.Drawing.Rectangle]::new($c2_x, $r2_y, $tileW, $tileH), [System.Drawing.GraphicsUnit]::Pixel)
$g6.Dispose()
$bmp6.Save("$outDir\vendor_6.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp6.Dispose()
Write-Host "Saved 6. Prudent (vendor_6.jpg)"

# 7. Fashion Redemption (from uploaded media_1786426677963.png)
$fashImg = [System.Drawing.Image]::FromFile("$base\media_1786426677963.png")
$fashBmp = New-Object System.Drawing.Bitmap $fashImg
$fashBmp.Save("$outDir\vendor_7.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$fashBmp.Dispose()
$fashImg.Dispose()
Write-Host "Saved 7. Fashion Redemption (vendor_7.jpg)"

# 8. Kings Carwash (Car Wash Services)
$bmp8 = New-Object System.Drawing.Bitmap $tileW, $tileH
$g8 = [System.Drawing.Graphics]::FromImage($bmp8)
$g8.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g8.DrawImage($origSrc, 0, 0, [System.Drawing.Rectangle]::new($c4_x, $r2_y, $tileW, $tileH), [System.Drawing.GraphicsUnit]::Pixel)
$g8.Dispose()
$bmp8.Save("$outDir\vendor_8.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp8.Dispose()
Write-Host "Saved 8. Kings Carwash (vendor_8.jpg)"

$origSrc.Dispose()
Write-Host "All 8 brand tiles updated successfully!"
