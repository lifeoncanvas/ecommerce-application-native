Add-Type -AssemblyName System.Drawing

$p = "C:\Users\Upasana\.gemini\antigravity\brain\242e5a55-a7be-4b05-aad1-134fe79eef8e\.user_uploaded\media_1786425957945.png"
if (Test-Path $p) {
    Write-Host "media_1786425957945.png exists"
}
