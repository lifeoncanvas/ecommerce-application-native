$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class LogoProcessor
{
    public static void ProcessLogo(string inputJpg, string outputDir)
    {
        using (Bitmap src = new Bitmap(inputJpg))
        {
            int w = src.Width;
            int h = src.Height;
            
            // Create full transparent bitmap
            using (Bitmap trans = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        Color c = src.GetPixel(x, y);
                        int avg = (c.R + c.G + c.B) / 3;
                        int min = Math.Min(c.R, Math.Min(c.G, c.B));
                        
                        if (min > 240 && avg > 242)
                        {
                            trans.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        }
                        else if (min > 200 && avg > 215)
                        {
                            int alpha = 255 - (avg - 215) * 255 / (255 - 215);
                            if (alpha < 0) alpha = 0;
                            if (alpha > 255) alpha = 255;
                            trans.SetPixel(x, y, Color.FromArgb(alpha, c.R, c.G, c.B));
                        }
                        else
                        {
                            trans.SetPixel(x, y, Color.FromArgb(255, c.R, c.G, c.B));
                        }
                    }
                }
                
                // Save full transparent png
                trans.Save(outputDir + "\\LitchtMarketing_logo.png", ImageFormat.Png);
                
                // Crop full logo (X: 250..770, Y: 200..630)
                Rectangle rectFull = new Rectangle(250, 200, 520, 430);
                using (Bitmap fullCrop = trans.Clone(rectFull, trans.PixelFormat))
                {
                    fullCrop.Save(outputDir + "\\logo.png", ImageFormat.Png);
                    fullCrop.Save(outputDir + "\\logo-full.png", ImageFormat.Png);
                    fullCrop.Save(outputDir + "\\splash_logo.png", ImageFormat.Png);
                }
                
                // Crop emblem mark only (X: 330..740, Y: 200..500 -> center of mark: X:340..730, Y: 200..500)
                Rectangle rectMark = new Rectangle(340, 200, 400, 300);
                using (Bitmap markCrop = trans.Clone(rectMark, trans.PixelFormat))
                {
                    markCrop.Save(outputDir + "\\crown_logo.png", ImageFormat.Png);
                }
            }
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

[LogoProcessor]::ProcessLogo("d:\httn-app\assets\images\LitchtMarketing_logo.jpg", "d:\httn-app\assets\images")
Write-Host "Processed logo assets instantly!"
