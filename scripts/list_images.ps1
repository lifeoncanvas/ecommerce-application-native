Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem 'C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\*.png'
foreach ($f in $files) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    Write-Host "$($f.Name) : $($img.Width)x$($img.Height) ($($f.Length) bytes)"
    $img.Dispose()
}
