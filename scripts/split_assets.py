"""Tách sprite gốc thành PNG riêng để React dùng trực tiếp. Chạy lại bằng python scripts/split_assets.py."""
from pathlib import Path
from PIL import Image
import json

ROOT=Path(__file__).resolve().parents[1]
SHEET=ROOT/'public/assets/master_spritesheet.png'
OUT=ROOT/'public/assets'
img=Image.open(SHEET).convert('RGBA')

# Toạ độ crop được kiểm tra bằng mắt trên master sprite 1055 × 1491.
# Những asset nằm kề nhau nên ưu tiên cắt an toàn; có thể tinh chỉnh trong master sau.
regions = {
'characters/pose_a.png':(0,0,213,490),
'characters/pose_b.png':(213,0,423,490),
'characters/pose_c.png':(423,0,629,490),
'characters/pose_d.png':(629,0,831,490),
'characters/pose_neutral.png':(831,0,1055,490),
'mascot/owl_happy.png':(0,560,202,750),
'mascot/owl_cheer.png':(202,560,405,750),
'mascot/owl_thinking.png':(405,560,590,750),
'ui/correct.png':(605,563,726,665),
'ui/wrong.png':(728,563,833,665),
'ui/star.png':(832,563,939,665),
'ui/coin.png':(941,563,1050,665),
'ui/timer.png':(612,667,719,776),
'ui/webcam.png':(723,664,826,776),
'ui/progress_empty.png':(832,669,1039,717),
'ui/progress_full.png':(832,721,1039,772),
'ui/button_start.png':(25,817,225,897),
'ui/button_continue.png':(236,817,420,897),
'ui/button_replay.png':(431,817,631,897),
'ui/badge_correct.png':(646,810,852,899),
'ui/badge_retry.png':(869,808,1041,901),
'items/crystals.png':(17,956,335,1090),
'items/crystal_blue.png':(20,959,105,1083),
'items/crystal_pink.png':(104,959,181,1083),
'items/crystal_yellow.png':(183,959,262,1083),
'items/crystal_green.png':(264,959,335,1083),
'items/chest_closed.png':(342,947,479,1090),
'items/chest_open.png':(479,938,617,1090),
'items/boss.png':(614,936,801,1090),
'items/trophy.png':(800,946,956,1090),
'items/magic_wand.png':(954,936,1055,1090),
'backgrounds/01_forest.png':(26,1137,264,1281),
'backgrounds/02_rainbow.png':(281,1137,520,1281),
'backgrounds/03_island.png':(540,1137,775,1281),
'backgrounds/04_castle.png':(794,1137,1032,1281),
'camera/frame.png':(354,1324,712,1476),
}
manifest={}
for name,bounds in regions.items():
    crop=img.crop(bounds)
    # Loại bỏ pixel gần như vô hình (hào quang alpha thấp từ xuất ảnh), để giữ sự trong suốt.
    alpha=crop.getchannel('A')
    alpha=alpha.point(lambda x: 0 if x < 12 else x)
    crop.putalpha(alpha)
    # Trim vùng trống nhưng bảo toàn viền 3px.
    visible=alpha.point(lambda x: 255 if x > 24 else 0)
    bbox=visible.getbbox()
    if bbox:
        left,top,right,bottom=bbox
        margin=3
        crop=crop.crop((max(0,left-margin),max(0,top-margin),min(crop.width,right+margin),min(crop.height,bottom+margin)))
    dest=OUT/name
    dest.parent.mkdir(parents=True,exist_ok=True)
    crop.save(dest,optimize=True)
    manifest[name]={'path':'/assets/'+name,'width':crop.width,'height':crop.height,'sourceBox':bounds}
(OUT/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Đã tách {len(manifest)} asset vào {OUT}')
