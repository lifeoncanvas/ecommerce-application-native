Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("d:\httn-app\assets\images\LitchtMarketing_logo.jpg")
$w = $src.Width
$h = $src.Height

# Find overall bounding box of non-white pixels
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $src.GetPixel($x, $y)
        # Check if non-white (e.g. R < 240 or G < 240 or B < 240)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Overall content bounds: X=[$minX, $maxX] Y=[$minY, $maxY]"

# Let's also find the bounds for the top icon mark only (the green triangle/arrow)
# The text 'LICHT MARKETING' starts around Y where there is a horizontal gap or color shift
$emblemMaxY = $minY
for ($y = $minY; $y -lt $maxY; $y++) {
    $hasNonWhite = $false
    for ($x = $minX; $x -le $maxX; $x++) {
        $c = $src.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            $hasNonWhite = $true
            break
        }
    }
    # Look for horizontal space before 'LICHT MARKETING' text
    if ($y -gt ($minY + 100) -and -not $hasNonWhite) {
        $emblemMaxY = $y
        break
    }
}
Write-Host "Emblem maxY:" $emblemMaxY

$src.Dispose()
