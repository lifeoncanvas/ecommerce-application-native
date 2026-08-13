Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786359122441.png'
$outDir = 'd:\httn-app\assets\images\banners'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
$w = $src.Width
$h = $src.Height
Write-Host "Source banner image: ${w}x${h}"

# 3 banners in media_1786359122441.png
# Banner 1: Top (Omnia Phone) ~ 0% to 35%
# Banner 2: Middle (Fashion Redemption) ~ 36% to 66%
# Banner 3: Bottom (Akara Fries) ~ 67% to 100%

$b1_y = [int]($h * 0.005)
$b1_h = [int]($h * 0.345)

$b2_y = [int]($h * 0.360)
$b2_h = [int]($h * 0.300)

$b3_y = [int]($h * 0.670)
$b3_h = [int]($h * 0.320)

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
    Write-Host "Saved high-res banner $($c.name)"
}

$src.Dispose()
Write-Host "High-res banners saved!"
