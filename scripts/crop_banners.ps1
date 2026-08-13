Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786358592963.png'
$outDir = 'd:\httn-app\assets\images\banners'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
$w = $src.Width
$h = $src.Height
Write-Host "Source image: ${w}x${h}"

# media_1786358592963.png has 3 banners stacked vertically:
# Top banner: OMNIA phone (from ~ 0.5% to 35.5%)
# Middle banner: Fashion Redemption (from ~ 36.0% to 66.5%)
# Bottom banner: Akara Fries (from ~ 67.0% to 99.5%)

$b1_y = [int]($h * 0.005)
$b1_h = [int]($h * 0.350)

$b2_y = [int]($h * 0.360)
$b2_h = [int]($h * 0.305)

$b3_y = [int]($h * 0.670)
$b3_h = [int]($h * 0.325)

$crops = @(
    @{ name = 'banner1.jpg'; rect = [System.Drawing.Rectangle]::new(0, $b1_y, $w, $b1_h) },
    @{ name = 'banner2.jpg'; rect = [System.Drawing.Rectangle]::new(0, $b2_y, $w, $b2_h) },
    @{ name = 'banner3.jpg'; rect = [System.Drawing.Rectangle]::new(0, $b3_y, $w, $b3_h) }
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
    Write-Host "Saved banner $($c.name)"
}

$src.Dispose()
Write-Host "Banner cropping finished successfully!"
