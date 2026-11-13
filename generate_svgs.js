import fs from 'fs';

const colorMap = {
  'w': '#f4f4f5',
  'r': '#df3636',
  'd': '#7f1d1d',
  'g': '#71717a',
  'b': '#18181b',
  'o': '#000000',
  'y': '#fbbf24',
};

const templates = [
  // 1. Skull
  [
    "      wwww      ",
    "    wwwwwwww    ",
    "   wwwwwwwwww   ",
    "  wwwwwwwwwwww  ",
    "  wwwbbwwbbwww  ",
    "  wwwbbwwbbwww  ",
    "  wwwwwwwwwwww  ",
    "   wwwwwwwwww   ",
    "    wwbbbbww    ",
    "    wwwwwwww    ",
    "     w w w w    ",
    "     w w w w    ",
  ],
  // 2. Ghost
  [
    "      wwww      ",
    "    wwwwwwww    ",
    "   wwwwwwwwww   ",
    "   wwbbwwwwbb   ",
    "   wwbbwwwwbb   ",
    "   wwwwwwwwww   ",
    "   wwwwwwwwww   ",
    "   wwwwwwwwww   ",
    "   wwwwwwwwww   ",
    "   wwwwwwwwww   ",
    "   w w ww w w   ",
    "   w   ww   w   ",
  ],
  // 3. Tombstone
  [
    "      gggg      ",
    "    gggggggg    ",
    "   gggggggggg   ",
    "   ggbggggbgg   ",
    "   ggbggggbgg   ",
    "   ggbggggbgg   ",
    "   gggggggggg   ",
    "   ggbbbbbbgg   ",
    "   ggbbbbbbgg   ",
    "   gggggggggg   ",
    "   gggggggggg   ",
    "  gggggggggggg  ",
  ],
  // 4. Bat
  [
    "                ",
    "  oo        oo  ",
    "  ooo      ooo  ",
    " ooooo    ooooo ",
    " oooooo  oooooo ",
    " oorroooooorroo ",
    " oooooooooooooo ",
    "  oooooooooooo  ",
    "   ooo    ooo   ",
    "   oo      oo   ",
    "                ",
    "                ",
  ],
  // 5. Reaper
  [
    "     oooooo     ",
    "   oooooooooo   ",
    "  oooooooooooo  ",
    "  oooorrrooooo  ",
    "  oooorrrooooo  ",
    "  oooooooooooo  ",
    "  oooooooooooo  ",
    "      oooo      ",
    "  ww  oooo      ",
    " wwww oooo      ",
    "  ww            ",
    "  ww            ",
  ],
  // 6. Candle
  [
    "       yy       ",
    "      yyyy      ",
    "      yyyy      ",
    "       yy       ",
    "       ww       ",
    "      wwww      ",
    "      wwww      ",
    "      wwww      ",
    "      wwww      ",
    "      wgwg      ",
    "      wgwg      ",
    "      wwww      ",
  ],
  // 7. Potion
  [
    "       ww       ",
    "       ww       ",
    "       ww       ",
    "      wwww      ",
    "     wrrrrw     ",
    "    wrrrrrrw    ",
    "   wrrrrrrrrw   ",
    "   wrrrrrrrrw   ",
    "   wrrrrrrrrw   ",
    "    wrrrrrrw    ",
    "     wrrrrw     ",
    "      wwww      ",
  ],
  // 8. Spider
  [
    "                ",
    "   o        o   ",
    "  ooo      ooo  ",
    "   ooo    ooo   ",
    "     oooooo     ",
    " o  oooooooo  o ",
    " oooooooooooooo ",
    "  ooo rroo ooo  ",
    "    o oooo o    ",
    "   o   oo   o   ",
    "                ",
    "                ",
  ],
  // 9. Moon
  [
    "      ww        ",
    "    wwww        ",
    "   wwwww        ",
    "  wwwwww        ",
    "  wwwwwww       ",
    "  wwwwwwww      ",
    "  wwwwwwww      ",
    "  wwwwwww       ",
    "  wwwwww        ",
    "   wwwww        ",
    "    wwww        ",
    "      ww        ",
  ],
  // 10. Demon
  [
    "   r        r   ",
    "   rr      rr   ",
    "  rrrr    rrrr  ",
    " rrrrrr  rrrrrr ",
    " rroorr  rroorr ",
    " rroorr  rroorr ",
    " rrrrrrrrrrrrrr ",
    " rrrrrrrrrrrrrr ",
    "  rrrrrbbrrrrr  ",
    "  rrrrrrrrrrrr  ",
    "   rrrrrrrrrr   ",
    "    rrrrrrrr    ",
  ],
];

const names = ['skull', 'ghost', 'tombstone', 'bat', 'reaper', 'candle', 'potion', 'spider', 'moon', 'demon'];

fs.mkdirSync('public/avatars', { recursive: true });

templates.forEach((pixels, i) => {
  const width = pixels[0].length;
  const height = pixels.length;
  let rects = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = pixels[y][x];
      if (char !== ' ' && colorMap[char]) {
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colorMap[char]}" />`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${rects}</svg>`;
  fs.writeFileSync(`public/avatars/${names[i]}.svg`, svg);
});
console.log('SVGs generated successfully in public/avatars');
