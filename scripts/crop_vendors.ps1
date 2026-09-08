Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786355823543.png'
$outDir = 'd:\httn-app\assets\images\vendors'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
$w = $src.Width
$h = $src.Height
Write-Host "Full screen source: ${w}x${h}"

# In media_1786355823543.png, the mobile screen is centered in the image.
# Phone width in screenshot is roughly the center column.
# Let's crop from the brand section directly.
# Alternatively, media_1786359202205.png is 744x534 and has the Curated Brands section directly!

$brandSrc = [System.Drawing.Bitmap]::FromFile('C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786359202205.png')
$bw = $brandSrc.Width
$bh = $brandSrc.Height
Write-Host "Brand section image: ${bw}x${bh}"

# 4 columns, 2 rows in media_1786359202205.png
# Row 1: y ~ 16% to 46%
# Row 2: y ~ 58% to 88%
# Col 1: x ~ 2% to 24%
# Col 2: x ~ 27% to 49%
# Col 3: x ~ 52% to 74%
# Col 4: x ~ 77% to 98%

$tileW = [int]($bw * 0.22)
$tileH = [int]($bh * 0.31)

$c1 = [int]($bw * 0.02)
$c2 = [int]($bw * 0.27)
$c3 = [int]($bw * 0.52)
$c4 = [int]($bw * 0.76)

$r1 = [int]($bh * 0.165)
$r2 = [int]($bh * 0.585)

$vendorCrops = @(
    @{ name = 'vendor_1.jpg'; rect = [System.Drawing.Rectangle]::new($c1, $r1, $tileW, $tileH) },
    @{ name = 'vendor_2.jpg'; rect = [System.Drawing.Rectangle]::new($c2, $r1, $tileW, $tileH) },
    @{ name = 'vendor_3.jpg'; rect = [System.Drawing.Rectangle]::new($c3, $r1, $tileW, $tileH) },
    @{ name = 'vendor_4.jpg'; rect = [System.Drawing.Rectangle]::new($c4, $r1, $tileW, $tileH) },
    @{ name = 'vendor_5.jpg'; rect = [System.Drawing.Rectangle]::new($c1, $r2, $tileW, $tileH) },
    @{ name = 'vendor_6.jpg'; rect = [System.Drawing.Rectangle]::new($c2, $r2, $tileW, $tileH) },
    @{ name = 'vendor_7.jpg'; rect = [System.Drawing.Rectangle]::new($c3, $r2, $tileW, $tileH) },
    @{ name = 'vendor_8.jpg'; rect = [System.Drawing.Rectangle]::new($c4, $r2, $tileW, $tileH) }
)

foreach ($c in $vendorCrops) {
    $bmp = New-Object System.Drawing.Bitmap $c.rect.Width, $c.rect.Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($brandSrc, 0, 0, $c.rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $dest = Join-Path $outDir $c.name
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    Write-Host "Saved $($c.name)"
}

$brandSrc.Dispose()
$src.Dispose()
Write-Host "Vendors cropped successfully!"
