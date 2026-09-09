Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("d:\httn-app\assets\images\LitchtMarketing_logo.jpg")
$c = $b.GetPixel(50, 50)
$hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
Write-Host "LOGO_BG_HEX=$hex"
$b.Dispose()
