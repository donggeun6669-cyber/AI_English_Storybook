import React from 'react';

interface StoryIllustrationProps {
  sceneId: string;
  className?: string;
  highlightClue?: boolean;
}

export const StoryIllustration: React.FC<StoryIllustrationProps> = ({
  sceneId,
  className = '',
  highlightClue = false
}) => {
  // Stitch illustrations (Google Stitch, 2026-10-11). Falls back to the SVG scene if a picture is missing.
  const imageSrc =
    sceneId === 'cover'
      ? '/images/cover.jpg'
      : /^scene-(\d+)$/.test(sceneId)
      ? `/images/p${sceneId.replace('scene-', '').padStart(2, '0')}.jpg`
      : null;

  if (imageSrc) {
    return (
      <div
        className={`relative w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-[#FCE9DA] shadow-sm ${
          highlightClue ? 'ring-4 ring-[#FFD13B] ring-offset-2 animate-pulse' : ''
        } ${className}`}
      >
        <img
          src={imageSrc}
          alt=""
          className={`w-full h-full object-cover select-none ${sceneId === 'cover' ? 'object-top' : 'object-center'}`}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-[16/10] sm:aspect-[16/11] bg-sky-100 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm ${
        highlightClue ? 'ring-4 ring-amber-400 ring-offset-2 animate-pulse' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 400 250"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
          <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ================= COVER SCENE ================= */}
        {sceneId === 'cover' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            {/* School building background */}
            <rect x="30" y="50" width="340" height="150" rx="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            <polygon points="20,55 200,15 380,55" fill="#f87171" stroke="#dc2626" strokeWidth="2" />
            <text x="200" y="42" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">CLASS 5-1</text>
            
            {/* Sports Day Banner */}
            <path d="M 60 70 Q 200 90 340 70" stroke="#f59e0b" strokeWidth="3" fill="none" />
            <rect x="130" y="72" width="140" height="24" rx="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <text x="200" y="88" textAnchor="middle" fontSize="12" fontWeight="800" fill="#78350f">🚩 SPORTS DAY 🚩</text>

            {/* Ground */}
            <rect x="0" y="180" width="400" height="70" fill="url(#grassGrad)" />

            {/* Tree */}
            <rect x="310" y="90" width="24" height="110" fill="#92400e" rx="4" />
            <circle cx="322" cy="80" r="45" fill="#22c55e" />
            <circle cx="350" cy="95" r="30" fill="#16a34a" />
            <circle cx="295" cy="95" r="30" fill="#15803d" />

            {/* Minji (Girl Detective) */}
            <g transform="translate(90, 130)">
              {/* Body */}
              <rect x="12" y="32" width="26" height="34" rx="6" fill="#ec4899" />
              {/* Skirt */}
              <polygon points="8,66 42,66 36,80 14,80" fill="#be185d" />
              {/* Face */}
              <circle cx="25" cy="18" r="16" fill="#fed7aa" />
              {/* Hair */}
              <path d="M 10 18 Q 25 2 40 18 Q 42 30 40 32 Q 25 22 10 32 Z" fill="#475569" />
              <circle cx="9" cy="22" r="5" fill="#475569" />
              <circle cx="41" cy="22" r="5" fill="#475569" />
              {/* Detective Hat */}
              <ellipse cx="25" cy="5" rx="16" ry="4" fill="#a16207" />
              <path d="M 12 5 Q 25 -4 38 5 Z" fill="#854d0e" />
              {/* Eyes & Smile */}
              <circle cx="21" cy="18" r="2" fill="#1e293b" />
              <circle cx="29" cy="18" r="2" fill="#1e293b" />
              <path d="M 23 23 Q 25 26 27 23" stroke="#1e293b" strokeWidth="1.5" fill="none" />
            </g>

            {/* Jun (Boy Detective) */}
            <g transform="translate(160, 130)">
              {/* Body */}
              <rect x="12" y="32" width="28" height="36" rx="6" fill="#3b82f6" />
              {/* Pants */}
              <rect x="14" y="68" width="10" height="15" fill="#1e3a8a" />
              <rect x="28" y="68" width="10" height="15" fill="#1e3a8a" />
              {/* Face */}
              <circle cx="26" cy="18" r="16" fill="#fed7aa" />
              {/* Hair */}
              <path d="M 10 16 Q 26 2 42 16 Q 38 8 26 6 Q 14 8 10 16 Z" fill="#334155" />
              {/* Eyes & smile */}
              <circle cx="22" cy="18" r="2" fill="#1e293b" />
              <circle cx="30" cy="18" r="2" fill="#1e293b" />
              <path d="M 24 23 Q 26 26 28 23" stroke="#1e293b" strokeWidth="1.5" fill="none" />
              {/* Magnifying Glass */}
              <g transform="translate(36, 32)">
                <circle cx="12" cy="12" r="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                <line x1="19" y1="19" x2="28" y2="28" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            </g>

            {/* The Mystery Box with Golden Glow & Question Mark */}
            <g transform="translate(235, 145)">
              <rect x="0" y="15" width="55" height="40" rx="4" fill="#d97706" stroke="#92400e" strokeWidth="2" />
              <polygon points="0,15 15,0 70,0 55,15" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" />
              <polygon points="55,15 70,0 70,38 55,55" fill="#b45309" stroke="#92400e" strokeWidth="1.5" />
              {/* Question mark floating */}
              <circle cx="27" cy="0" r="14" fill="#ef4444" />
              <text x="27" y="6" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffffff">?</text>
            </g>

            {/* Suspect Clue Icons Banner */}
            <g transform="translate(10, 205)">
              <rect x="15" y="0" width="340" height="36" rx="10" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" opacity="0.95" />
              <text x="35" y="22" fontSize="12" fontWeight="bold" fill="#78350f">Suspects:</text>
              <text x="110" y="24" fontSize="14">👦 Boy</text>
              <text x="180" y="24" fontSize="14">🐶 Dog</text>
              <text x="250" y="24" fontSize="14">🐦 Bird</text>
            </g>
          </g>
        )}

        {/* ================= SCENE 1: CLASSROOM & MISSING TIGI ================= */}
        {sceneId === 'scene-1' && (
          <g>
            {/* Classroom Wall */}
            <rect width="400" height="180" fill="url(#wallGrad)" />
            {/* Blackboard */}
            <rect x="40" y="25" width="220" height="90" rx="6" fill="#14532d" stroke="#166534" strokeWidth="3" />
            <text x="150" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ffffff">Class 5-1 Sports Day!</text>
            <text x="150" y="80" textAnchor="middle" fontSize="12" fill="#fef08a">Where is Tigi the Tiger?</text>
            <text x="150" y="100" textAnchor="middle" fontSize="11" fill="#86efac">Tomorrow: 9:00 AM</text>
            {/* Clock */}
            <circle cx="310" cy="50" r="18" fill="#ffffff" stroke="#475569" strokeWidth="2.5" />
            <line x1="310" y1="50" x2="310" y2="40" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            <line x1="310" y1="50" x2="318" y2="50" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            {/* Wooden Floor */}
            <rect x="0" y="180" width="400" height="70" fill="url(#floorGrad)" />
            {/* Classroom Desk */}
            <rect x="120" y="150" width="160" height="40" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="135" y="190" width="12" height="50" fill="#78350f" />
            <rect x="250" y="190" width="12" height="50" fill="#78350f" />
            {/* Empty Mascot Spot */}
            <ellipse cx="200" cy="155" rx="35" ry="12" fill="#fed7aa" stroke="#f97316" strokeDasharray="4 3" strokeWidth="2" />
            <text x="200" y="140" textAnchor="middle" fontSize="24">❓</text>
            <text x="200" y="175" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#c2410c">No Tigi!</text>
            {/* Surprised Minji */}
            <g transform="translate(40, 120)">
              <circle cx="25" cy="20" r="16" fill="#fed7aa" />
              <path d="M 12 18 Q 25 4 38 18 Z" fill="#334155" />
              <rect x="14" y="36" width="22" height="40" rx="4" fill="#ec4899" />
              <circle cx="20" cy="20" r="2" fill="#1e293b" />
              <circle cx="30" cy="20" r="2" fill="#1e293b" />
              <ellipse cx="25" cy="26" rx="3" ry="4" fill="#1e293b" />
            </g>
            {/* Searching Jun */}
            <g transform="translate(320, 120)">
              <circle cx="25" cy="20" r="16" fill="#fed7aa" />
              <path d="M 10 16 Q 25 4 40 16 Z" fill="#1e293b" />
              <rect x="14" y="36" width="22" height="40" rx="4" fill="#3b82f6" />
              <circle cx="20" cy="20" r="2" fill="#1e293b" />
              <circle cx="30" cy="20" r="2" fill="#1e293b" />
              <path d="M 22 26 Q 25 24 28 26" stroke="#1e293b" strokeWidth="1.5" fill="none" />
            </g>
          </g>
        )}

        {/* ================= SCENE 2: EMPTY BOX ON DESK ================= */}
        {sceneId === 'scene-2' && (
          <g>
            <rect width="400" height="250" fill="#fffbeb" />
            {/* Wooden Table surface closeup */}
            <rect x="0" y="130" width="400" height="120" fill="#d97706" />
            <line x1="0" y1="130" x2="400" y2="130" stroke="#b45309" strokeWidth="4" />
            
            {/* Classroom background window */}
            <rect x="40" y="20" width="100" height="90" rx="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="3" />
            <line x1="90" y1="20" x2="90" y2="110" stroke="#38bdf8" strokeWidth="2" />
            <line x1="40" y1="65" x2="140" y2="65" stroke="#38bdf8" strokeWidth="2" />

            {/* Big Open Cardboard Box */}
            <g transform="translate(140, 70)">
              {/* Back interior */}
              <polygon points="15,40 105,40 120,65 0,65" fill="#78350f" />
              {/* Box flaps open */}
              <polygon points="0,65 -25,35 15,40" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              <polygon points="120,65 145,35 105,40" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              {/* Box front body */}
              <rect x="0" y="65" width="120" height="85" fill="#d97706" stroke="#78350f" strokeWidth="2.5" rx="3" />
              {/* Tiger label */}
              <rect x="25" y="85" width="70" height="45" rx="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
              <text x="60" y="105" textAnchor="middle" fontSize="16">🐯</text>
              <text x="60" y="122" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#854d0e">TIGI BED</text>
              {/* Inside text: EMPTY */}
              <text x="60" y="58" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fef3c7">EMPTY</text>
            </g>

            {/* Minji looking with magnifying glass */}
            <g transform="translate(280, 50)">
              <circle cx="35" cy="40" r="28" fill="#fed7aa" />
              <path d="M 12 35 Q 35 10 58 35 Z" fill="#be185d" />
              {/* Focused eye */}
              <circle cx="30" cy="42" r="3.5" fill="#1e293b" />
              <circle cx="44" cy="42" r="3.5" fill="#1e293b" />
              <path d="M 33 52 Q 37 48 41 52" stroke="#1e293b" strokeWidth="2" fill="none" />
              {/* Magnifying Glass */}
              <g transform="translate(-15, 55)">
                <circle cx="20" cy="20" r="22" fill="#bae6fd" opacity="0.6" stroke="#0284c7" strokeWidth="3.5" />
                <line x1="36" y1="36" x2="52" y2="52" stroke="#b45309" strokeWidth="5" strokeLinecap="round" />
              </g>
            </g>
          </g>
        )}

        {/* ================= SCENE 3: FEATHERS ON WINDOW SILL ================= */}
        {sceneId === 'scene-3' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            {/* Tree outside window */}
            <circle cx="100" cy="80" r="50" fill="#86efac" opacity="0.7" />
            <circle cx="140" cy="60" r="40" fill="#4ade80" opacity="0.7" />
            
            {/* Big Classroom Window Frame */}
            <rect x="50" y="20" width="300" height="170" fill="none" stroke="#64748b" strokeWidth="12" rx="4" />
            <line x1="200" y1="20" x2="200" y2="190" stroke="#64748b" strokeWidth="8" />
            {/* Open sash tilted */}
            <polygon points="200,20 270,30 270,185 200,190" fill="#e2e8f0" opacity="0.4" stroke="#94a3b8" strokeWidth="3" />

            {/* Window Sill */}
            <rect x="30" y="185" width="340" height="30" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" rx="3" />

            {/* Black-and-White Feathers with Clue Sparkle */}
            <g transform="translate(180, 172)">
              {/* Glow circle */}
              <circle cx="30" cy="15" r="25" fill="#fef08a" opacity="0.6" filter="url(#softGlow)" />
              {/* Feather 1 */}
              <path d="M 10 25 C 20 10 40 8 50 14 C 45 22 25 32 10 25 Z" fill="#1e293b" />
              <path d="M 22 17 C 28 13 38 12 44 15 C 38 21 28 24 22 17 Z" fill="#ffffff" />
              <line x1="8" y1="26" x2="52" y2="13" stroke="#94a3b8" strokeWidth="1" />
              {/* Feather 2 */}
              <path d="M 25 30 C 35 18 55 16 62 22 C 55 28 38 36 25 30 Z" fill="#0f172a" />
              <path d="M 35 23 C 42 19 50 18 55 22 C 48 27 40 29 35 23 Z" fill="#f8fafc" />
              {/* Sparkle */}
              <text x="50" y="8" fontSize="14">✨</text>
            </g>

            {/* Jun pointing at the sill */}
            <g transform="translate(60, 130)">
              <circle cx="20" cy="20" r="16" fill="#fed7aa" />
              <path d="M 8 16 Q 20 4 32 16 Z" fill="#334155" />
              <rect x="10" y="34" width="22" height="45" rx="4" fill="#3b82f6" />
              <line x1="30" y1="44" x2="65" y2="46" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
              <text x="22" y="10" fontSize="12">💡</text>
            </g>
          </g>
        )}

        {/* ================= SCENE 4: TEACHER KIM & BREEZE ================= */}
        {sceneId === 'scene-4' && (
          <g>
            <rect width="400" height="250" fill="#fffbeb" />
            <rect x="0" y="190" width="400" height="60" fill="url(#floorGrad)" />

            {/* Large Window with fluttering curtains */}
            <rect x="220" y="20" width="150" height="160" rx="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="4" />
            {/* Breeze wind trails */}
            <path d="M 240 50 Q 280 40 320 55 Q 350 70 330 90" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 220 90 Q 260 80 300 95 Q 330 110 310 130" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 230 130 Q 270 120 310 135" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
            <text x="270" y="80" fontSize="16">🍃</text>
            <text x="310" y="120" fontSize="14">💨</text>

            {/* Left side: Teacher Kim */}
            <g transform="translate(70, 70)">
              {/* Teacher Kim Hair & Face */}
              <circle cx="35" cy="30" r="22" fill="#fed7aa" />
              <path d="M 12 30 C 12 8 58 8 58 30 C 60 50 50 52 48 40 C 40 34 20 34 18 42 Z" fill="#451a03" />
              {/* Glasses */}
              <rect x="23" y="26" width="10" height="8" rx="2" fill="none" stroke="#b45309" strokeWidth="1.5" />
              <rect x="37" y="26" width="10" height="8" rx="2" fill="none" stroke="#b45309" strokeWidth="1.5" />
              <line x1="33" y1="30" x2="37" y2="30" stroke="#b45309" strokeWidth="1.5" />
              <circle cx="28" cy="30" r="1.5" fill="#1e293b" />
              <circle cx="42" cy="30" r="1.5" fill="#1e293b" />
              <path d="M 31 38 Q 35 42 39 38" stroke="#1e293b" strokeWidth="1.5" fill="none" />
              {/* Smart Cardigan Outfit */}
              <rect x="18" y="52" width="34" height="65" rx="6" fill="#10b981" stroke="#047857" strokeWidth="2" />
              <polygon points="30,52 35,68 40,52" fill="#ffffff" />
              <text x="2" y="20" fontSize="18">👩‍🏫</text>
            </g>

            {/* Notice Board */}
            <rect x="10" y="40" width="45" height="60" rx="3" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <line x1="16" y1="52" x2="48" y2="52" stroke="#92400e" strokeWidth="1.5" />
            <line x1="16" y1="62" x2="44" y2="62" stroke="#92400e" strokeWidth="1.5" />
          </g>
        )}

        {/* ================= SCENE 5: MAX THE DOG ================= */}
        {sceneId === 'scene-5' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            <rect x="0" y="160" width="400" height="90" fill="url(#grassGrad)" />

            {/* Red Doghouse */}
            <g transform="translate(60, 80)">
              <polygon points="10,40 55,5 100,40" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
              <rect x="15" y="40" width="80" height="75" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
              {/* Doghouse door */}
              <path d="M 35 115 L 35 70 Q 55 50 75 70 L 75 115 Z" fill="#78350f" />
              <rect x="35" y="25" width="40" height="16" rx="4" fill="#ffffff" stroke="#94a3b8" />
              <text x="55" y="37" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#dc2626">MAX</text>
            </g>

            {/* Max the Fluffy Dog */}
            <g transform="translate(190, 120)">
              {/* Dog Body */}
              <ellipse cx="60" cy="50" rx="35" ry="24" fill="#d97706" />
              <ellipse cx="60" cy="54" rx="20" ry="14" fill="#fef3c7" />
              {/* Wagging Tail */}
              <path d="M 92 45 Q 110 30 100 20" stroke="#b45309" strokeWidth="7" strokeLinecap="round" fill="none" />
              {/* Head */}
              <circle cx="30" cy="30" r="22" fill="#d97706" />
              {/* Floppy ears */}
              <path d="M 12 25 Q 5 45 15 50" fill="#92400e" />
              <path d="M 42 20 Q 55 35 48 45" fill="#92400e" />
              {/* Eyes & Snout */}
              <circle cx="22" cy="28" r="2.5" fill="#1e293b" />
              <circle cx="36" cy="28" r="2.5" fill="#1e293b" />
              <ellipse cx="28" cy="36" rx="6" ry="4" fill="#1e293b" />
              {/* Brown Wooden Stick in mouth (NOT Tiger mascot!) */}
              <rect x="8" y="38" width="50" height="8" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" transform="rotate(-5 8 38)" />
            </g>

            {/* Minji inspecting */}
            <g transform="translate(320, 100)">
              <circle cx="25" cy="25" r="18" fill="#fed7aa" />
              <path d="M 10 22 Q 25 8 40 22 Z" fill="#be185d" />
              <rect x="14" y="43" width="22" height="42" rx="4" fill="#ec4899" />
              <text x="25" y="10" textAnchor="middle" fontSize="16">🤔</text>
            </g>
          </g>
        )}

        {/* ================= SCENE 6: FOOTPRINTS IN THE MUD ================= */}
        {sceneId === 'scene-6' && (
          <g>
            <rect width="400" height="250" fill="#fef3c7" />
            {/* Garden soil patch */}
            <ellipse cx="200" cy="140" rx="180" ry="85" fill="#a16207" opacity="0.3" />
            <path d="M 40 160 Q 200 120 360 170 Q 240 230 40 160" fill="#78350f" opacity="0.4" />

            {/* Huge Comparison Note */}
            <rect x="25" y="15" width="350" height="36" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
            <text x="200" y="38" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350f">
              Mud Clues: Dog paws vs Tiny bird feet!
            </text>

            {/* Dog paw prints (crossed out gently or small) */}
            <g transform="translate(60, 80)">
              <text x="30" y="20" fontSize="11" fontWeight="bold" fill="#92400e">Dog Paws 🐾</text>
              <ellipse cx="25" cy="45" rx="10" ry="8" fill="#451a03" opacity="0.7" />
              <circle cx="16" cy="30" r="3" fill="#451a03" opacity="0.7" />
              <circle cx="25" cy="27" r="3" fill="#451a03" opacity="0.7" />
              <circle cx="34" cy="30" r="3" fill="#451a03" opacity="0.7" />
            </g>

            {/* Bird Footprints leading toward the tree */}
            <g transform="translate(170, 75)">
              <text x="50" y="15" fontSize="12" fontWeight="bold" fill="#0284c7">Tiny Bird Tracks! 🐦</text>
              {/* Bird claw 1 */}
              <g transform="translate(50, 40) rotate(-20)">
                <line x1="0" y1="0" x2="0" y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="12" x2="-8" y2="4" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="12" x2="8" y2="4" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              </g>
              {/* Bird claw 2 */}
              <g transform="translate(85, 65) rotate(-15)">
                <line x1="0" y1="0" x2="0" y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="12" x2="-8" y2="4" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="12" x2="8" y2="4" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              </g>
              {/* Bird claw 3 */}
              <g transform="translate(125, 90) rotate(-10)">
                <line x1="0" y1="0" x2="0" y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="12" x2="-8" y2="4" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="12" x2="8" y2="4" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>

            {/* Jun crouching to inspect */}
            <g transform="translate(290, 110)">
              <circle cx="25" cy="22" r="16" fill="#fed7aa" />
              <path d="M 12 18 Q 25 6 38 18 Z" fill="#1e293b" />
              <rect x="14" y="38" width="22" height="36" rx="4" fill="#3b82f6" />
              <text x="25" y="10" textAnchor="middle" fontSize="16">🔎</text>
            </g>
          </g>
        )}

        {/* ================= SCENE 7: SHINY BUTTON UNDER TREE ================= */}
        {sceneId === 'scene-7' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            <rect x="0" y="140" width="400" height="110" fill="url(#grassGrad)" />

            {/* Big Tree Trunk */}
            <path d="M 60 0 L 100 250 L 20 250 Z" fill="#78350f" />
            <path d="M 50 140 Q 110 180 150 250" stroke="#78350f" strokeWidth="18" fill="none" />
            <circle cx="80" cy="15" r="90" fill="#22c55e" opacity="0.9" />

            {/* The Shiny Yellow Button in Grass */}
            <g transform="translate(200, 160)">
              {/* Glow pulses */}
              <circle cx="25" cy="25" r="32" fill="#fde047" opacity="0.5" filter="url(#softGlow)" />
              <circle cx="25" cy="25" r="20" fill="#eab308" stroke="#ca8a04" strokeWidth="3" />
              {/* Inner rim */}
              <circle cx="25" cy="25" r="14" fill="#fef08a" />
              {/* 4 button thread holes */}
              <circle cx="21" cy="21" r="2.2" fill="#713f12" />
              <circle cx="29" cy="21" r="2.2" fill="#713f12" />
              <circle cx="21" cy="29" r="2.2" fill="#713f12" />
              <circle cx="29" cy="29" r="2.2" fill="#713f12" />
              {/* Thread cross */}
              <line x1="21" y1="21" x2="29" y2="29" stroke="#713f12" strokeWidth="1.2" />
              <line x1="29" y1="21" x2="21" y2="29" stroke="#713f12" strokeWidth="1.2" />
              {/* Big Star Sparkle */}
              <text x="35" y="8" fontSize="20">✨</text>
              <text x="-5" y="12" fontSize="16">⭐</text>
            </g>

            {/* Minji walking and discovering it */}
            <g transform="translate(280, 80)">
              <circle cx="25" cy="25" r="18" fill="#fed7aa" />
              <path d="M 10 22 Q 25 8 40 22 Z" fill="#be185d" />
              <rect x="14" y="43" width="22" height="45" rx="4" fill="#ec4899" />
              <text x="25" y="10" textAnchor="middle" fontSize="16">✨</text>
              <text x="25" y="110" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350f">Tigi's Button!</text>
            </g>
          </g>
        )}

        {/* ================= SCENE 8: CAW CAW SOUND IN TREE ================= */}
        {sceneId === 'scene-8' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            {/* Big Tree with lush leaves */}
            <rect x="180" y="60" width="40" height="190" fill="#78350f" />
            <circle cx="200" cy="50" r="85" fill="#15803d" />
            <circle cx="140" cy="80" r="65" fill="#16a34a" />
            <circle cx="260" cy="80" r="65" fill="#22c55e" />

            {/* Sound bubbles */}
            <g transform="translate(60, 30)">
              <rect x="0" y="0" width="90" height="36" rx="8" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
              <text x="45" y="24" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0369a1">"CAW!"</text>
            </g>
            <g transform="translate(250, 20)">
              <rect x="0" y="0" width="90" height="36" rx="8" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
              <text x="45" y="24" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0369a1">"CAW!"</text>
            </g>

            {/* Sound Wave arcs */}
            <path d="M 170 50 A 25 25 0 0 0 170 80" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 160 40 A 38 38 0 0 0 160 90" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Jun pointing up */}
            <g transform="translate(70, 130)">
              <circle cx="25" cy="22" r="16" fill="#fed7aa" />
              <path d="M 12 18 Q 25 6 38 18 Z" fill="#1e293b" />
              <rect x="14" y="38" width="22" height="42" rx="4" fill="#3b82f6" />
              <line x1="30" y1="42" x2="65" y2="15" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round" />
              <text x="25" y="10" textAnchor="middle" fontSize="14">👀</text>
            </g>

            {/* Minji looking up */}
            <g transform="translate(300, 130)">
              <circle cx="25" cy="22" r="16" fill="#fed7aa" />
              <path d="M 10 20 Q 25 6 40 20 Z" fill="#be185d" />
              <rect x="14" y="38" width="22" height="42" rx="4" fill="#ec4899" />
              <line x1="20" y1="42" x2="-15" y2="20" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* ================= SCENE 9: THE MAGPIE PERCHED HIGH ================= */}
        {sceneId === 'scene-9' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            {/* Tree Branch across screen */}
            <path d="M 0 160 Q 180 140 400 130" stroke="#78350f" strokeWidth="18" fill="none" strokeLinecap="round" />
            {/* Green leaves on branch */}
            <circle cx="80" cy="140" r="22" fill="#22c55e" />
            <circle cx="110" cy="150" r="18" fill="#16a34a" />
            <circle cx="320" cy="120" r="24" fill="#15803d" />
            <circle cx="350" cy="115" r="20" fill="#22c55e" />

            {/* Beautiful Magpie illustration */}
            <g transform="translate(180, 50)">
              {/* Tail feathers long black with blue gradient */}
              <polygon points="10,65 -45,105 -25,120 15,80" fill="#0f172a" />
              <polygon points="12,70 -35,115 -20,125 18,82" fill="#1e3a8a" opacity="0.6" />
              
              {/* Magpie Body - White belly */}
              <ellipse cx="40" cy="60" rx="22" ry="16" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              {/* Black back and wing */}
              <path d="M 22 50 C 22 40 50 40 60 55 C 55 70 30 75 22 50 Z" fill="#0f172a" />
              {/* Blue wing patch */}
              <ellipse cx="38" cy="54" rx="8" ry="4" fill="#2563eb" />

              {/* Head */}
              <circle cx="62" cy="42" r="14" fill="#0f172a" />
              {/* Sharp Beak */}
              <polygon points="74,40 92,44 74,48" fill="#334155" />
              {/* Sharp eye */}
              <circle cx="66" cy="40" r="3" fill="#ffffff" />
              <circle cx="67" cy="40" r="1.5" fill="#0f172a" />

              {/* Claws gripping branch */}
              <line x1="38" y1="75" x2="38" y2="88" stroke="#334155" strokeWidth="3" />
              <line x1="48" y1="75" x2="48" y2="88" stroke="#334155" strokeWidth="3" />

              {/* Magpie holding shiny silver wrapper or key */}
              <circle cx="86" cy="50" r="7" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="80" y="32" fontSize="16">✨</text>
            </g>

            {/* Label */}
            <rect x="130" y="195" width="140" height="30" rx="8" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <text x="200" y="215" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0369a1">Magpie · 까치 🐦</text>
          </g>
        )}

        {/* ================= SCENE 10: TIGI IN THE NEST ================= */}
        {sceneId === 'scene-10' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            {/* Tree branches fork */}
            <path d="M 120 250 L 170 150 L 100 30" stroke="#78350f" strokeWidth="22" fill="none" />
            <path d="M 170 150 L 290 40" stroke="#78350f" strokeWidth="18" fill="none" />

            {/* The Big Twig Nest */}
            <g transform="translate(130, 80)">
              {/* Outer nest twigs */}
              <ellipse cx="70" cy="60" rx="65" ry="32" fill="#78350f" />
              <path d="M 10 50 Q 70 85 130 50" stroke="#451a03" strokeWidth="6" fill="none" />
              <path d="M 5 65 Q 70 95 135 65" stroke="#92400e" strokeWidth="5" fill="none" />
              <path d="M 20 40 Q 70 75 120 40" stroke="#a16207" strokeWidth="4" fill="none" />

              {/* TIGI THE TIGER DOLL PEEKING OUT! */}
              <g transform="translate(45, 10)">
                {/* Round Tiger Head */}
                <circle cx="25" cy="25" r="22" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
                {/* Tiger Ears */}
                <circle cx="8" cy="8" r="8" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="4" fill="#fef08a" />
                <circle cx="42" cy="8" r="8" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
                <circle cx="42" cy="8" r="4" fill="#fef08a" />
                {/* Tiger Stripes */}
                <polygon points="25,4 23,12 27,12" fill="#1e293b" />
                <polygon points="12,18 18,20 13,24" fill="#1e293b" />
                <polygon points="38,18 32,20 37,24" fill="#1e293b" />
                {/* Cute tiger snout & smile */}
                <ellipse cx="25" cy="30" rx="10" ry="7" fill="#ffedd5" />
                <ellipse cx="25" cy="27" rx="3" ry="2" fill="#1e293b" />
                <circle cx="18" cy="22" r="2.5" fill="#1e293b" />
                <circle cx="32" cy="22" r="2.5" fill="#1e293b" />
                <path d="M 22 32 Q 25 35 28 32" stroke="#1e293b" strokeWidth="1.5" fill="none" />
                {/* Paw peeking over nest */}
                <ellipse cx="10" cy="44" rx="6" ry="4" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                <ellipse cx="40" cy="44" rx="6" ry="4" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
              </g>

              {/* Shiny buttons & trinkets in nest */}
              <circle cx="35" cy="55" r="5" fill="#facc15" />
              <circle cx="105" cy="52" r="6" fill="#38bdf8" />
              <text x="65" y="0" textAnchor="middle" fontSize="16">✨</text>
            </g>

            {/* Minji & Jun below calling out */}
            <g transform="translate(40, 190)">
              <text x="0" y="20" fontSize="14" fontWeight="bold" fill="#047857">"We found Tigi!" 🎉</text>
            </g>
          </g>
        )}

        {/* ================= SCENE 11: RESCUE WITH TEACHER KIM ================= */}
        {sceneId === 'scene-11' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            {/* Tree top */}
            <circle cx="280" cy="40" r="70" fill="#22c55e" opacity="0.8" />
            <path d="M 280 80 L 320 250" stroke="#78350f" strokeWidth="24" />

            {/* Teacher Kim holding long pole */}
            <g transform="translate(60, 100)">
              {/* Teacher Kim */}
              <circle cx="35" cy="30" r="20" fill="#fed7aa" />
              <path d="M 16 28 C 16 10 54 10 54 28 Z" fill="#451a03" />
              <rect x="20" y="50" width="30" height="70" rx="5" fill="#10b981" />
              {/* Glasses & Smile */}
              <circle cx="30" cy="30" r="2" fill="#1e293b" />
              <circle cx="40" cy="30" r="2" fill="#1e293b" />
              <path d="M 32 38 Q 35 42 38 38" stroke="#1e293b" strokeWidth="1.5" fill="none" />
              {/* Arms reaching */}
              <line x1="45" y1="65" x2="85" y2="35" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* The Long Rescue Pole */}
            <line x1="140" y1="135" x2="270" y2="40" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            {/* Soft basket net on end */}
            <ellipse cx="270" cy="40" rx="20" ry="12" fill="#fed7aa" stroke="#d97706" strokeWidth="2" opacity="0.9" />

            {/* Tigi being gently carried down */}
            <g transform="translate(255, 15)">
              <circle cx="15" cy="15" r="14" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="4" cy="5" r="5" fill="#f97316" />
              <circle cx="26" cy="5" r="5" fill="#f97316" />
              <circle cx="11" cy="13" r="1.5" fill="#1e293b" />
              <circle cx="19" cy="13" r="1.5" fill="#1e293b" />
              <text x="15" y="-5" textAnchor="middle" fontSize="12">✨</text>
            </g>

            {/* Kids cheering below */}
            <g transform="translate(160, 160)">
              <text x="0" y="30" fontSize="24">👧 👦</text>
              <text x="50" y="25" fontSize="12" fontWeight="bold" fill="#0369a1">"Hooray! Safe!"</text>
            </g>
          </g>
        )}

        {/* ================= SCENE 12: SPORTS DAY HEROES ================= */}
        {sceneId === 'scene-12' && (
          <g>
            <rect width="400" height="250" fill="url(#skyGrad)" />
            {/* Colorful sports banners */}
            <path d="M 0 35 Q 200 65 400 35" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            <polygon points="40,40 60,70 80,40" fill="#ef4444" />
            <polygon points="100,43 120,73 140,43" fill="#3b82f6" />
            <polygon points="160,45 180,75 200,45" fill="#facc15" />
            <polygon points="220,45 240,75 260,45" fill="#10b981" />
            <polygon points="280,43 300,73 320,43" fill="#ec4899" />
            <polygon points="340,40 360,70 380,40" fill="#8b5cf6" />

            {/* Running track green grass */}
            <rect x="0" y="150" width="400" height="100" fill="url(#grassGrad)" />
            <path d="M 0 200 Q 200 180 400 200" stroke="#ffffff" strokeWidth="4" strokeDasharray="12 8" fill="none" />

            {/* Central Celebration: Minji, Jun holding Tigi */}
            <g transform="translate(130, 95)">
              {/* Jun */}
              <rect x="15" y="45" width="24" height="45" rx="5" fill="#3b82f6" />
              <circle cx="27" cy="28" r="16" fill="#fed7aa" />
              {/* Minji */}
              <rect x="85" y="45" width="24" height="45" rx="5" fill="#ec4899" />
              <circle cx="97" cy="28" r="16" fill="#fed7aa" />

              {/* Tigi in the middle with Champion Ribbon */}
              <g transform="translate(44, 20)">
                <circle cx="18" cy="22" r="18" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
                <circle cx="5" cy="10" r="6" fill="#f97316" />
                <circle cx="31" cy="10" r="6" fill="#f97316" />
                <ellipse cx="18" cy="26" rx="8" ry="5" fill="#ffedd5" />
                {/* Gold Medal */}
                <circle cx="18" cy="46" r="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                <text x="18" y="50" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350f">1</text>
                {/* Ribbon */}
                <path d="M 12 40 L 4 58 M 24 40 L 32 58" stroke="#ef4444" strokeWidth="3" />
              </g>
            </g>

            {/* Magpie sitting politely on top banner post with a silver ribbon */}
            <g transform="translate(325, 75)">
              <polygon points="10,25 0,45 10,40" fill="#0f172a" />
              <ellipse cx="22" cy="26" rx="12" ry="8" fill="#f8fafc" />
              <circle cx="32" cy="18" r="8" fill="#0f172a" />
              <polygon points="38,16 46,18 38,20" fill="#334155" />
              {/* Shiny Silver Ribbon gift */}
              <text x="25" y="10" fontSize="16">🎀</text>
            </g>

            {/* Max the dog cheering */}
            <g transform="translate(30, 150)">
              <ellipse cx="25" cy="25" rx="20" ry="14" fill="#d97706" />
              <circle cx="15" cy="15" r="12" fill="#d97706" />
              <text x="25" y="4" textAnchor="middle" fontSize="14">🐶</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
