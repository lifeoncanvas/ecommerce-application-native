Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("d:\httn-app\assets\images\LitchtMarketing_logo.jpg")
$w = $src.Width
$h = $src.Height

# Function to make white background transparent with smooth edge blending
function Convert-ToTransparent {
    param([System.Drawing.Bitmap]$bmp)
    
    $out = New-Object System.Drawing.Bitmap $bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $c = $bmp.GetPixel($x, $y)
            $r = $c.R; $g = $c.G; $b = $c.B
            
            # Check white threshold
            $minVal = [Math]::Min($r, [Math]::Min($g, $b))
            $maxVal = [Math]::Max($r, [Math]::Max($g, $b))
            $avg = ($r + $g + $b) / 3
            
            if ($minVal -gt 245 -and $avg -gt 248) {
                # Completely transparent
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($minVal -gt 210 -and $avg -gt 220) {
                # Semi-transparent edge smoothing
                $alpha = [int](255 * (255 - $avg) / (255 - 220))
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                
                # Darken RGB slightly towards text/mark color so edge doesn't look white
                $nr = [int]($r * (1 - (255 - $avg)/100))
                $ng = [int]($g * (1 - (255 - $avg)/100))
                $nb = [int]($b * (1 - (255 - $avg)/100))
                if ($nr -lt 0) { $nr = 0 }; if ($ng -lt 0) { $ng = 0 }; if ($nb -lt 0) { $nb = 0 }
                
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            } else {
                # Fully opaque content
                $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
            }
        }
    }
    return $out
}

# 1. Generate transparent full image
$transparentFull = Convert-ToTransparent -bmp $src
$transparentFull.Save("d:\httn-app\assets\images\LitchtMarketing_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Crop Full Logo Content (X: 250 to 770, Y: 200 to 630)
$cropFullW = 770 - 250
$cropFullH = 630 - 200
$rectFull = New-Object System.Drawing.Rectangle 250, 200, $cropFullW, $cropFullH
$croppedFull = $transparentFull.Clone($rectFull, $transparentFull.PixelFormat)
$croppedFull.Save("d:\httn-app\assets\images\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$croppedFull.Save("d:\httn-app\assets\images\logo-full.png", [System.Drawing.Imaging.ImageFormat]::Png)
$croppedFull.Save("d:\httn-app\assets\images\splash_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 3. Crop Emblem Mark (X: 330 to 740, Y: 205 to 495)
# Find exact X range for top mark (Y 205 to 495)
$markMinX = 1000; $markMaxX = 0
for ($y = 205; $y -le 495; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $src.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $markMinX) { $markMinX = $x }
            if ($x -gt $markMaxX) { $markMaxX = $x }
        }
    }
}

Write-Host "Mark exact X bounds: $markMinX to $markMaxX"
$markW = $markMaxX - $markMinX + 10
$markH = 495 - 205 + 10
$rectMark = New-Object System.Drawing.Rectangle ($markMinX - 5), 200, $markW, $markH
$croppedMark = $transparentFull.Clone($rectMark, $transparentFull.PixelFormat)
$croppedMark.Save("d:\httn-app\assets\images\crown_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Generated transparent logo PNG assets successfully!"

$src.Dispose()
$transparentFull.Dispose()
$croppedFull.Dispose()
$croppedMark.Dispose()
