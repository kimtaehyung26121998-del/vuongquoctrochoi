param([Parameter(Mandatory=$true)][string]$SourcePath)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System.Drawing;
public static class WorkFrameBounds {
 public static int Bottom(Bitmap frame) {
  for(int y=frame.Height-1;y>=0;y--)
   for(int x=0;x<frame.Width;x++)
    if(frame.GetPixel(x,y).A>=32) return y;
  return frame.Height-1;
 }
}
'@
$workSource=[System.Drawing.Bitmap]::new((Resolve-Path -LiteralPath $SourcePath).Path)
$workOutput=Join-Path $PSScriptRoot '../public/assets/mascot'
Copy-Item -LiteralPath $SourcePath -Destination (Join-Path $workOutput 'robot_work_sheet.png')
$workBoxes=@(@(40,0,380,510),@(410,0,790,510),@(795,0,1155,510),@(1168,0,1536,510),@(30,512,432,1024),@(432,512,780,1024),@(782,512,1135,1024),@(1136,512,1536,1024))
for($workIndex=0;$workIndex -lt 8;$workIndex++){
 $workBox=$workBoxes[$workIndex]
 $workRect=[System.Drawing.Rectangle]::new($workBox[0],$workBox[1],($workBox[2]-$workBox[0]),($workBox[3]-$workBox[1]))
 $workFrame=$workSource.Clone($workRect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
 $workCanvas=[System.Drawing.Bitmap]::new(420,520)
 $workGraphics=[System.Drawing.Graphics]::FromImage($workCanvas)
 $workGraphics.DrawImageUnscaled($workFrame,[int]((420-$workFrame.Width)/2),(500-[WorkFrameBounds]::Bottom($workFrame)))
 $workKind=if($workIndex -lt 4){'hammer'}else{'shovel'}
 $workNumber=$workIndex%4
 $workCanvas.Save((Join-Path $workOutput "robot_${workKind}_${workNumber}.png"),[System.Drawing.Imaging.ImageFormat]::Png)
 $workGraphics.Dispose();$workCanvas.Dispose();$workFrame.Dispose()
}
$workSource.Dispose()
