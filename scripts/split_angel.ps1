param([Parameter(Mandatory=$true)][string]$SourcePath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
# Extract connected silhouettes, including their existing alpha edges. This
# avoids cutting off hands where adjacent robots overlap horizontally.
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
public static class AngelSprites {
  public static void Split(string source, string output) {
    using (var image = new Bitmap(source)) {
      var names = new[] { "neutral", "guide", "cheer", "thinking" };
      var seeds = new[] { 180, 550, 890, 1280 };
      int w = image.Width, h = image.Height;
      var seen = new bool[w*h];
      for (int i=0; i<names.Length; i++) {
        var queue = new Queue<int>();
        var pixels = new List<int>();
        int seed = 550*w+seeds[i];
        queue.Enqueue(seed); seen[seed] = true;
        int left=w, top=h, right=0, bottom=0;
        while (queue.Count>0) {
          int p=queue.Dequeue(), x=p%w, y=p/w;
          pixels.Add(p);
          left=Math.Min(left,x); right=Math.Max(right,x);
          top=Math.Min(top,y); bottom=Math.Max(bottom,y);
          for (int dy=-1; dy<=1; dy++) for (int dx=-1; dx<=1; dx++) {
            int nx=x+dx, ny=y+dy;
            if(nx<0 || nx>=w || ny<0 || ny>=h) continue;
            int n=ny*w+nx;
            // Keep neighboring silhouettes separate across the narrow gaps.
            int minX=i==0?0:i==1?369:i==2?735:1101;
            int maxX=i==0?368:i==1?734:i==2?1100:w-1;
            if(nx<minX || nx>maxX || seen[n] || image.GetPixel(nx,ny).A<8) continue;
            seen[n]=true; queue.Enqueue(n);
          }
        }
        if(pixels.Count<10000) throw new Exception("Incomplete robot: "+names[i]);
        // Equal canvases and a shared baseline prevent jumps between expressions.
        using(var sprite=new Bitmap(420,750,PixelFormat.Format32bppArgb)) {
          int offsetX=(420-(right-left+1))/2-left;
          int offsetY=740-bottom;
          foreach(int p in pixels) sprite.SetPixel(p%w+offsetX,p/w+offsetY,image.GetPixel(p%w,p/w));
          sprite.Save(System.IO.Path.Combine(output,"angel_"+names[i]+".png"),ImageFormat.Png);
        }
        Console.WriteLine(names[i]+": "+pixels.Count+" pixels, bounds "+left+","+top+","+right+","+bottom);
      }
    }
  }
}
'@
$robotOutput = Join-Path $PSScriptRoot '../public/assets/mascot'
[AngelSprites]::Split((Resolve-Path -LiteralPath $SourcePath).Path, $robotOutput)
