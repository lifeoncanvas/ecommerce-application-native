Add-Type -AssemblyName System.Drawing

$outDir = 'd:\httn-app\assets\images\categories'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$base = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded'

# 1. Food
$foodImg = [System.Drawing.Image]::FromFile("$base\media_1786425707874.jpg")
$foodBmp = New-Object System.Drawing.Bitmap $foodImg
$foodBmp.Save("$outDir\cat_1.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$foodBmp.Dispose()
$foodImg.Dispose()
Write-Host "Saved Food (cat_1.jpg)"

# 2. Fashion
$fashImg = [System.Drawing.Image]::FromFile("$base\media_1786425743632.png")
$fashBmp = New-Object System.Drawing.Bitmap $fashImg
$fashBmp.Save("$outDir\cat_2.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$fashBmp.Dispose()
$fashImg.Dispose()
Write-Host "Saved Fashion (cat_2.jpg)"

# 3. Groceries
$grocImg = [System.Drawing.Image]::FromFile("$base\media_1786425827172.jpg")
$grocBmp = New-Object System.Drawing.Bitmap $grocImg
$grocBmp.Save("$outDir\cat_3.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$grocBmp.Dispose()
$grocImg.Dispose()
Write-Host "Saved Groceries (cat_3.jpg)"

# 4. Services
$servImg = [System.Drawing.Image]::FromFile("$base\media_1786425855490.png")
$servBmp = New-Object System.Drawing.Bitmap $servImg
$servBmp.Save("$outDir\cat_4.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$servBmp.Dispose()
$servImg.Dispose()
Write-Host "Saved Services (cat_4.jpg)"

# 5. Beauty (from media_1786425551612.png tile 5 or media_1786425957945.png)
$stripImg = [System.Drawing.Bitmap]::FromFile("$base\media_1786425551612.png")
$sw = $stripImg.Width
$sh = $stripImg.Height

# Tile 5 is on the right side of the strip (from ~78% to 95%)
$bX = [int]($sw * 0.78)
$bY = [int]($sh * 0.05)
$bW = [int]($sw * 0.17)
$bH = [int]($sh * 0.80)

$beautyBmp = New-Object System.Drawing.Bitmap $bW, $bH
$g = [System.Drawing.Graphics]::FromImage($beautyBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($stripImg, 0, 0, [System.Drawing.Rectangle]::new($bX, $bY, $bW, $bH), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$beautyBmp.Save("$outDir\cat_5.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$beautyBmp.Dispose()
$stripImg.Dispose()
Write-Host "Saved Beauty (cat_5.jpg)"

Write-Host "All 5 category images successfully updated from user uploads!"
