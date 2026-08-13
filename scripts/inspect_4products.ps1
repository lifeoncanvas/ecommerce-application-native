Add-Type -AssemblyName System.Drawing
$files = @(
    'media_1786430186750.jpg',
    'media_1786430260417.png',
    'media_1786430353406.png',
    'media_1786430451312.png'
)
foreach ($f in $files) {
    $p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\$f"
    if (Test-Path $p) {
        $img = [System.Drawing.Image]::FromFile($p)
        Write-Host "$f : $($img.Width)x$($img.Height)"
        $img.Dispose()
    }
}
