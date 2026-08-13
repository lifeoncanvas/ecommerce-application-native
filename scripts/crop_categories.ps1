Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786355823543.png'
$outDir = 'd:\httn-app\assets\images\categories'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
$w = $src.Width
$h = $src.Height

# Phone in media_1786355823543.png (957x1024) is centered:
# Phone left ~ 352, width ~ 254 (roughly x: 36.8% to 63.3%)
# Category row is at y: ~10.5% to 15.5%
# Let's crop the 5 categories (Food, Fashion, Groceries, Services, +1)

$phoneX = [int]($w * 0.368)
$phoneW = [int]($w * 0.265)
$catY = [int]($h * 0.106)
$catH = [int]($h * 0.052)

# Category tiles inside phone width:
# Tile width ~ 45px, gap ~ 6px
$t1_x = [int]($w * 0.375)
$t2_x = [int]($w * 0.442)
$t3_x = [int]($w * 0.505)
$t4_x = [int]($w * 0.564)
$t5_x = [int]($w * 0.633)
$tile_w = [int]($w * 0.057)
$tile_h = [int]($h * 0.046)

$catCrops = @(
    @{ name = 'cat_1.jpg'; rect = [System.Drawing.Rectangle]::new($t1_x, $catY, $tile_w, $tile_h) },
    @{ name = 'cat_2.jpg'; rect = [System.Drawing.Rectangle]::new($t2_x, $catY, $tile_w, $tile_h) },
    @{ name = 'cat_3.jpg'; rect = [System.Drawing.Rectangle]::new($t3_x, $catY, $tile_w, $tile_h) },
    @{ name = 'cat_4.jpg'; rect = [System.Drawing.Rectangle]::new($t4_x, $catY, $tile_w, $tile_h) },
    @{ name = 'cat_5.jpg'; rect = [System.Drawing.Rectangle]::new($t5_x, $catY, $tile_w, $tile_h) }
)

foreach ($c in $catCrops) {
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
Write-Host "Categories cropped successfully!"
