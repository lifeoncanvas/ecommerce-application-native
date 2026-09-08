Add-Type -AssemblyName System.Drawing
$files = @(
    'media_1786427288830.png',
    'media_1786427389188.png',
    'media_1786427638776.png',
    'media_1786428437235.png',
    'media_1786428442912.png'
)
foreach ($f in $files) {
    $p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\$f"
    if (Test-Path $p) {
        $img = [System.Drawing.Image]::FromFile($p)
        Write-Host "$f : $($img.Width)x$($img.Height)"
        $img.Dispose()
    }
}
