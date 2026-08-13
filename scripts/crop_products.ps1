Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786362100958.png'
$outDir = 'd:\httn-app\assets\images\products'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
$w = $src.Width
$h = $src.Height
Write-Host "Source image: ${w}x${h}"

# In media_1786362100958.png, we have 6 product cards arranged in 3 rows x 2 columns.
# Let's calculate the bounding boxes for the 6 images:
# Col 1: left ~ 2.5% to 48.5%, Col 2: left ~ 51.5% to 97.5%
# Row 1 photo: top ~ 6.5% to 29.5%
# Row 2 photo: top ~ 38.5% to 61.5%
# Row 3 photo: top ~ 70.5% to 93.5%

# Let's inspect exact pixel dimensions
# We can create 6 cropped bitmaps for the 6 photos

# 2 columns x 3 rows
# Col 1: x from 0.03 * w to 0.49 * w
# Col 2: x from 0.51 * w to 0.97 * w

$col1_x = [int]($w * 0.03)
$col1_w = [int]($w * 0.46)

$col2_x = [int]($w * 0.51)
$col2_w = [int]($w * 0.46)

$row1_y = [int]($h * 0.066)
$row1_h = [int]($h * 0.230)

$row2_y = [int]($h * 0.384)
$row2_h = [int]($h * 0.230)

$row3_y = [int]($h * 0.702)
$row3_h = [int]($h * 0.230)

$crops = @(
    @{ name = 'product_1.jpg'; rect = [System.Drawing.Rectangle]::new($col1_x, $row1_y, $col1_w, $row1_h) },
    @{ name = 'product_2.jpg'; rect = [System.Drawing.Rectangle]::new($col2_x, $row1_y, $col2_w, $row1_h) },
    @{ name = 'product_3.jpg'; rect = [System.Drawing.Rectangle]::new($col1_x, $row2_y, $col1_w, $row2_h) },
    @{ name = 'product_4.jpg'; rect = [System.Drawing.Rectangle]::new($col2_x, $row2_y, $col2_w, $row2_h) },
    @{ name = 'product_5.jpg'; rect = [System.Drawing.Rectangle]::new($col1_x, $row3_y, $col1_w, $row3_h) },
    @{ name = 'product_6.jpg'; rect = [System.Drawing.Rectangle]::new($col2_x, $row3_y, $col2_w, $row3_h) }
)

foreach ($c in $crops) {
    $bmp = New-Object System.Drawing.Bitmap $c.rect.Width, $c.rect.Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $c.rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $dest = Join-Path $outDir $c.name
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    Write-Host "Saved $($c.name)"
}

$src.Dispose()
Write-Host "Cropping finished successfully!"
