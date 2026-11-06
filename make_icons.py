#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Background: dark navy rounded rectangle or circle
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255)) # #0f172a
    draw = ImageDraw.Draw(img)
    
    # Outer circle border / ring
    pad = int(size * 0.08)
    draw.ellipse([pad, pad, size - pad, size - pad], outline=(59, 130, 246, 255), width=int(size * 0.03))
    
    # Shield shape points
    # Top center, top right, mid right, bottom center, mid left, top left
    cx = size // 2
    top = int(size * 0.22)
    bot = int(size * 0.82)
    w = int(size * 0.3)
    
    shield_pts = [
        (cx - w, top),
        (cx + w, top),
        (cx + w, int(size * 0.52)),
        (cx, bot),
        (cx - w, int(size * 0.52))
    ]
    draw.polygon(shield_pts, fill=(30, 58, 138, 255), outline=(96, 165, 250, 255))
    
    # Draw a stylized checkmark or star inside the shield
    # Checkmark points:
    chk_start = (int(cx - w * 0.45), int(size * 0.48))
    chk_mid = (int(cx - w * 0.1), int(size * 0.60))
    chk_end = (int(cx + w * 0.5), int(size * 0.38))
    
    draw.line([chk_start, chk_mid, chk_end], fill=(52, 211, 153, 255), width=int(size * 0.05), joint="curve")
    
    img.save(filename)
    print(f"Generated {filename} ({size}x{size})")

output_dir = "/home/marco/Transferências/Antigravity/guia-policial-app"
create_icon(192, os.path.join(output_dir, "icon-192.png"))
create_icon(512, os.path.join(output_dir, "icon-512.png"))
