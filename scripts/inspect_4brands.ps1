Add-Type -AssemblyName System.Drawing
$files = @(
    'media_1786429758681.png',
    'media_1786429761903.jpg',
    'media_1786429763907.jpg',
    'media_1786429766351.jpg'
)
foreach ($f in $files) {
    $p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\$f"
    if (Test-Path $p) {
        $img = [System.Drawing.Image]::FromFile($p)
        Write-Host "$f : $($img.Width)x$($img.Height)"
        $img.Dispose()
    }
}
