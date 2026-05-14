import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

const faviconSvg = readFileSync(resolve(publicDir, 'favicon.svg'));

// 1. favicon-32.png
await sharp(faviconSvg).resize(32, 32).png().toFile(resolve(publicDir, 'favicon-32.png'));
console.log('Created favicon-32.png');

// 2. apple-touch-icon.png (180x180 with padding on white bg)
await sharp(faviconSvg)
  .resize(160, 160)
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: '#ffffff' })
  .png()
  .toFile(resolve(publicDir, 'apple-touch-icon.png'));
console.log('Created apple-touch-icon.png');

// 3. og-default.png (1200x630) — brand OG image for social sharing
const ogSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.04">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="630" stroke="white" stroke-width="1"/>`).join('\n    ')}
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="1200" y2="${i * 60}" stroke="white" stroke-width="1"/>`).join('\n    ')}
  </g>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1200" height="4" fill="#3b82f6"/>

  <!-- Red accent stripe (matching favicon) -->
  <rect x="0" y="4" width="1200" height="2" fill="#dc2626"/>

  <!-- Dollar sign icon (scaled favicon) -->
  <g transform="translate(80, 180) scale(3.5)">
    <circle cx="16" cy="16" r="15" fill="#1E40AF" opacity="0.6"/>
    <path d="M14.5 6v2.2c-2.8.4-4.5 2-4.5 4.1 0 2.4 1.8 3.6 4.5 4.3v5.2c-1.8-.3-3.2-1.2-4-2.4l-1.8 1.8c1.2 1.7 3.2 2.8 5.8 3.1V26h3v-1.8c2.9-.4 4.8-2.1 4.8-4.4 0-2.5-1.9-3.7-4.8-4.4v-4.8c1.5.3 2.7 1 3.5 2l1.8-1.8c-1.1-1.4-2.9-2.4-5.3-2.7V6h-3z" fill="white"/>
    <path d="M14.5 12.5c-1.4-.5-2.2-1-2.2-2 0-1.1.9-1.8 2.2-2v4z" fill="#1E40AF"/>
    <path d="M17.5 21.8c1.5-.2 2.4-1 2.4-2.2 0-1.1-.8-1.7-2.4-2.2v4.4z" fill="#1E40AF"/>
  </g>

  <!-- Site name -->
  <text x="210" y="245" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="600" fill="#60a5fa" letter-spacing="0.5">
    US<tspan fill="#94a3b8">paycheck</tspan>
  </text>

  <!-- Main title -->
  <text x="210" y="310" font-family="Inter, system-ui, sans-serif" font-size="52" font-weight="700" fill="white">
    Free Paycheck Calculator
  </text>
  <text x="210" y="370" font-family="Inter, system-ui, sans-serif" font-size="52" font-weight="700" fill="white">
    for All 50 US States
  </text>

  <!-- Subtitle -->
  <text x="210" y="420" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#94a3b8">
    Federal &amp; state taxes, FICA, 401(k), deductions — updated for 2026
  </text>

  <!-- Bottom feature pills -->
  <g transform="translate(210, 470)">
    <rect x="0" y="0" width="160" height="38" rx="19" fill="#1e40af" opacity="0.5"/>
    <text x="80" y="24" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#93c5fd" text-anchor="middle">All 50 States + DC</text>

    <rect x="175" y="0" width="140" height="38" rx="19" fill="#1e40af" opacity="0.5"/>
    <text x="245" y="24" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#93c5fd" text-anchor="middle">2026 Tax Rates</text>

    <rect x="330" y="0" width="110" height="38" rx="19" fill="#1e40af" opacity="0.5"/>
    <text x="385" y="24" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#93c5fd" text-anchor="middle">100% Free</text>

    <rect x="455" y="0" width="180" height="38" rx="19" fill="#1e40af" opacity="0.5"/>
    <text x="545" y="24" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#93c5fd" text-anchor="middle">369 Calculators</text>
  </g>

  <!-- URL at bottom -->
  <text x="210" y="570" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#475569">
    truetakehomepay.com
  </text>

  <!-- Right side decorative element: stacked bars representing tax brackets -->
  <g transform="translate(920, 160)">
    <rect x="0" y="0" width="200" height="45" rx="8" fill="#1e40af" opacity="0.3"/>
    <text x="15" y="29" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#60a5fa" font-weight="600">10%</text>
    <rect x="50" y="12" width="100" height="20" rx="4" fill="#3b82f6" opacity="0.4"/>
    <text x="160" y="29" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">$11,925</text>

    <rect x="0" y="55" width="200" height="45" rx="8" fill="#1e40af" opacity="0.3"/>
    <text x="15" y="84" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#60a5fa" font-weight="600">12%</text>
    <rect x="50" y="67" width="115" height="20" rx="4" fill="#3b82f6" opacity="0.5"/>
    <text x="160" y="84" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">$48,475</text>

    <rect x="0" y="110" width="200" height="45" rx="8" fill="#1e40af" opacity="0.3"/>
    <text x="15" y="139" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#60a5fa" font-weight="600">22%</text>
    <rect x="50" y="122" width="130" height="20" rx="4" fill="#3b82f6" opacity="0.6"/>
    <text x="160" y="139" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">$103,350</text>

    <rect x="0" y="165" width="200" height="45" rx="8" fill="#1e40af" opacity="0.3"/>
    <text x="15" y="194" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#60a5fa" font-weight="600">24%</text>
    <rect x="50" y="177" width="145" height="20" rx="4" fill="#3b82f6" opacity="0.7"/>
    <text x="160" y="194" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">$197,300</text>

    <rect x="0" y="220" width="200" height="45" rx="8" fill="#1e40af" opacity="0.3"/>
    <text x="15" y="249" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#60a5fa" font-weight="600">32%</text>
    <rect x="50" y="232" width="160" height="20" rx="4" fill="#3b82f6" opacity="0.8"/>
    <text x="160" y="249" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">$250,525</text>

    <rect x="0" y="275" width="200" height="45" rx="8" fill="#1e40af" opacity="0.3"/>
    <text x="15" y="304" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#dc2626" font-weight="600">37%</text>
    <rect x="50" y="287" width="175" height="20" rx="4" fill="#dc2626" opacity="0.4"/>
    <text x="160" y="304" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">$626,350+</text>
  </g>
</svg>
`;

await sharp(Buffer.from(ogSvg)).png({ quality: 90 }).toFile(resolve(publicDir, 'og-default.png'));
console.log('Created og-default.png (1200x630)');

console.log('\nAll images generated successfully!');
