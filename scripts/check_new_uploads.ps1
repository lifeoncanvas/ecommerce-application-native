Add-Type -AssemblyName System.Drawing
$files = @(
    'media_1786425551612.png',
    'media_1786425707874.jpg',
    'media_1786425743632.png',
    'media_1786425827172.jpg',
    'media_1786425855490.png',
    'media_1786425957945.png'
)
foreach ($f in $files) {
    $p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\$f"
    if (Test-Path $p) {
        $img = [System.Drawing.Image]::FromFile($p)
        Write-Host "$f : $($img.Width)x$($img.Height) ($($img.RawFormat))"
        $img.Dispose()
    }
}
