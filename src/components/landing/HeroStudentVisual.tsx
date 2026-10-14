import React from 'react';
import { Check, Compass, CheckCircle2 } from 'lucide-react';

export const HeroStudentVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      {/* Background Soft Glow & Ambient Framing */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#F2F4EC] to-[#E5E9DD] border border-[#DCE2D3] shadow-md">
        
        {/* Authentic SVG Composition of Student Desk */}
        <div className="relative w-full aspect-[4/3.2] overflow-hidden">
          <svg
            viewBox="0 0 600 480"
            className="w-full h-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Student studying computer science at a desk with books, laptop, and notebook"
          >
            <defs>
              {/* Window Morning Light Gradient */}
              <linearGradient id="morningLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#F9FAF5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E9ECE2" stopOpacity="0.1" />
              </linearGradient>

              {/* Wooden Desk Surface Gradient */}
              <linearGradient id="woodDesk" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DFD8C8" />
                <stop offset="15%" stopColor="#D5CBB8" />
                <stop offset="70%" stopColor="#C9BFA8" />
                <stop offset="100%" stopColor="#B8AC93" />
              </linearGradient>

              {/* Wall Backdrop */}
              <linearGradient id="wallBackdrop" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F6F7F0" />
                <stop offset="60%" stopColor="#ECEFE6" />
                <stop offset="100%" stopColor="#E2E7DB" />
              </linearGradient>

              {/* Dark Green Hoodie Gradient */}
              <linearGradient id="hoodieGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#233D29" />
                <stop offset="60%" stopColor="#1B3120" />
                <stop offset="100%" stopColor="#142418" />
              </linearGradient>

              {/* Hair Texture */}
              <radialGradient id="curlyHair" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#2B2019" />
                <stop offset="70%" stopColor="#1C1410" />
                <stop offset="100%" stopColor="#110C0A" />
              </radialGradient>

              {/* Laptop Screen Glow */}
              <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Window Frame Shadow */}
              <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* Back Wall - Neutral, Clean, No Posters, No Gimmicks */}
            <rect width="600" height="480" fill="url(#wallBackdrop)" />

            {/* Window Light Slanted Beam from Upper Left */}
            <polygon
              points="0,0 260,0 380,310 0,310"
              fill="url(#morningLight)"
              opacity="0.65"
            />

            {/* Subtle Minimalist Window Frame Silhouette in upper left background */}
            <g opacity="0.35">
              <line x1="120" y1="0" x2="120" y2="190" stroke="#CBD5C0" strokeWidth="3" />
              <line x1="0" y1="90" x2="210" y2="90" stroke="#CBD5C0" strokeWidth="3" />
              <rect x="0" y="0" width="210" height="190" fill="none" stroke="#CBD5C0" strokeWidth="4" />
            </g>

            {/* Wooden Desk Surface */}
            <polygon points="0,305 600,305 600,480 0,480" fill="url(#woodDesk)" />
            {/* Desk Chamfered Edge Line */}
            <line x1="0" y1="305" x2="600" y2="305" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
            <line x1="0" y1="311" x2="600" y2="311" stroke="#A89C83" strokeWidth="1.2" opacity="0.5" />

            {/* === LEFT DESK: STACK OF THREE BOOKS === */}
            {/* Book Stack Shadow */}
            <ellipse cx="95" cy="425" rx="75" ry="14" fill="#000000" opacity="0.12" />

            {/* Bottom Book: Computer Networks */}
            <g transform="translate(30, 385)">
              <rect x="0" y="0" width="130" height="24" rx="3" fill="#3D5066" />
              <rect x="3" y="2" width="124" height="20" rx="2" fill="#2E3F54" />
              <rect x="127" y="3" width="16" height="18" fill="#F4EEDF" rx="1" /> {/* Page edges */}
              <text x="14" y="15" fill="#E2E8F0" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="0.4">
                COMPUTER NETWORKS
              </text>
            </g>

            {/* Middle Book: Algorithms */}
            <g transform="translate(36, 360)">
              <rect x="0" y="0" width="122" height="23" rx="3" fill="#753C2D" />
              <rect x="3" y="2" width="116" height="19" rx="2" fill="#5F2E21" />
              <rect x="119" y="3" width="15" height="17" fill="#F4EEDF" rx="1" />
              <text x="14" y="14" fill="#FED7AA" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="0.4">
                ALGORITHMS (CLRS)
              </text>
            </g>

            {/* Top Book: Data Structures (Forest Green) */}
            <g transform="translate(42, 336)">
              <rect x="0" y="0" width="112" height="22" rx="3" fill="#24442A" />
              <rect x="3" y="2" width="106" height="18" rx="2" fill="#1C3822" />
              <rect x="109" y="3" width="14" height="16" fill="#F4EEDF" rx="1" />
              <text x="12" y="14" fill="#D2E8D4" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="0.4">
                DATA STRUCTURES
              </text>
            </g>

            {/* Stainless Steel / Frosted Minimalist Water Bottle */}
            <g transform="translate(162, 312)">
              <ellipse cx="14" cy="98" rx="14" ry="4" fill="#000000" opacity="0.1" />
              {/* Bottle Body */}
              <rect x="2" y="22" width="24" height="74" rx="6" fill="#E2E7DE" stroke="#B8C4B2" strokeWidth="1" />
              <path d="M4 22 Q4 10 14 10 Q24 10 24 22" fill="#D0DDD0" />
              {/* Silver Cap */}
              <rect x="8" y="2" width="12" height="9" rx="2" fill="#8B9B88" />
              <rect x="10" y="0" width="8" height="3" rx="1" fill="#697866" />
              {/* Water Level subtle shine */}
              <line x1="6" y1="26" x2="6" y2="90" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
            </g>

            {/* === LAPTOP (Beside the Student) === */}
            <g transform="translate(195, 320)">
              {/* Laptop Base Shadow */}
              <ellipse cx="65" cy="95" rx="65" ry="8" fill="#000000" opacity="0.14" />
              
              {/* Laptop Screen (Slightly Angled Profile) */}
              <g transform="translate(0, 0)">
                {/* Back Screen Aluminum Shell */}
                <polygon points="12,10 115,10 120,78 8,78" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
                {/* Screen Bezel & Display */}
                <polygon points="15,13 112,13 117,75 11,75" fill="url(#laptopScreen)" />
                {/* Code Lines on Screen (Data structures / recursive tree demo) */}
                <line x1="20" y1="22" x2="55" y2="22" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="29" x2="75" y2="29" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="28" y1="36" x2="90" y2="36" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="32" y1="43" x2="68" y2="43" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="28" y1="50" x2="82" y2="50" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="24" y1="57" x2="60" y2="57" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="20" y1="64" x2="48" y2="64" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
                {/* Tiny tree diagram preview */}
                <circle cx="96" cy="35" r="3" fill="#10B981" />
                <circle cx="88" cy="48" r="2.5" fill="#3B82F6" />
                <circle cx="104" cy="48" r="2.5" fill="#3B82F6" />
                <line x1="96" y1="35" x2="88" y2="48" stroke="#64748B" strokeWidth="1" />
                <line x1="96" y1="35" x2="104" y2="48" stroke="#64748B" strokeWidth="1" />
              </g>

              {/* Laptop Keyboard Base (Laying flat on desk) */}
              <polygon points="4,78 124,78 136,92 -8,92" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
              {/* Keyboard Well */}
              <polygon points="12,80 116,80 125,87 4,87" fill="#64748B" opacity="0.6" />
              {/* Trackpad */}
              <polygon points="50,88 78,88 80,91 48,91" fill="#CBD5E1" />
            </g>

            {/* === NOTEBOOK (Open in front of student) === */}
            <g transform="translate(330, 360)">
              {/* Notebook Shadow */}
              <polygon points="5,55 175,55 165,85 -5,85" fill="#000000" opacity="0.1" />
              {/* Open Notebook Spread */}
              <polygon points="10,0 165,0 155,55 0,55" fill="#FDFBF7" stroke="#D1C7B7" strokeWidth="1.5" />
              {/* Center Binding Crease */}
              <line x1="82" y1="0" x2="77" y2="55" stroke="#BFB3A0" strokeWidth="1.5" />
              {/* Ruled Lines & Hand-drawn Graph & Recursion Tree Sketches */}
              <line x1="18" y1="10" x2="72" y2="10" stroke="#D4D9C8" strokeWidth="1" />
              <line x1="18" y1="18" x2="72" y2="18" stroke="#D4D9C8" strokeWidth="1" />
              <line x1="18" y1="26" x2="72" y2="26" stroke="#D4D9C8" strokeWidth="1" />
              <line x1="18" y1="34" x2="72" y2="34" stroke="#D4D9C8" strokeWidth="1" />
              {/* Student's neat graph notes */}
              <circle cx="32" cy="18" r="3" fill="#233D29" />
              <circle cx="50" cy="18" r="3" fill="#233D29" />
              <circle cx="41" cy="30" r="3" fill="#233D29" />
              <line x1="32" y1="18" x2="50" y2="18" stroke="#233D29" strokeWidth="1" />
              <line x1="32" y1="18" x2="41" y2="30" stroke="#233D29" strokeWidth="1" />
              <line x1="50" y1="18" x2="41" y2="30" stroke="#233D29" strokeWidth="1" />

              {/* Right Page: Equations / Base Case conditions */}
              <line x1="90" y1="10" x2="148" y2="10" stroke="#D4D9C8" strokeWidth="1" />
              <line x1="90" y1="18" x2="148" y2="18" stroke="#D4D9C8" strokeWidth="1" />
              <line x1="90" y1="26" x2="148" y2="26" stroke="#D4D9C8" strokeWidth="1" />
              <line x1="90" y1="34" x2="148" y2="34" stroke="#D4D9C8" strokeWidth="1" />
              <text x="92" y="20" fill="#263F2B" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
                if (node == null)
              </text>
              <text x="96" y="28" fill="#263F2B" fontSize="7" fontFamily="'JetBrains Mono', monospace">
                return 0; // base
              </text>
            </g>

            {/* === STUDENT FIGURE (Young man with curly hair, glasses, dark green hoodie) === */}
            <g id="studentFigure">
              {/* Torso & Shoulders - Dark Green Hoodie */}
              <path
                d="M 320 480 
                   L 325 365 
                   C 335 300, 360 250, 420 240 
                   C 480 250, 520 295, 545 360 
                   L 555 480 Z"
                fill="url(#hoodieGreen)"
              />

              {/* Hoodie Wrinkles & Seams */}
              <path
                d="M 405 255 Q 430 280 455 255"
                fill="none"
                stroke="#17281B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 430 270 L 430 330"
                fill="none"
                stroke="#17281B"
                strokeWidth="1.5"
                opacity="0.6"
              />
              {/* Drawstrings */}
              <path d="M 422 268 Q 420 295 418 318" fill="none" stroke="#DCE7D6" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <path d="M 438 268 Q 440 295 442 322" fill="none" stroke="#DCE7D6" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

              {/* Left Arm & Forearm resting on desk */}
              <path
                d="M 335 340 
                   C 330 370, 320 410, 315 440 
                   L 375 440 
                   C 375 410, 370 380, 365 350 Z"
                fill="#1E3523"
              />

              {/* Right Arm angled forward, writing with pen */}
              <path
                d="M 490 320 
                   C 500 370, 480 410, 440 435 
                   L 420 420 
                   C 450 390, 465 360, 460 315 Z"
                fill="#1A2F1E"
              />

              {/* Right Hand holding pen writing in notebook */}
              <ellipse cx="418" cy="426" rx="10" ry="8" fill="#E8BFA2" transform="rotate(-20 418 426)" />
              {/* Pen (Fine point black ink) */}
              <line x1="410" y1="432" x2="428" y2="414" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="409" y1="433" x2="413" y2="429" stroke="#94A3B8" strokeWidth="1.5" />

              {/* Left Hand resting flat beside notebook */}
              <ellipse cx="325" cy="436" rx="12" ry="7" fill="#E5BDA0" />

              {/* Neck */}
              <rect x="418" y="215" width="26" height="35" rx="5" fill="#DCB093" />
              {/* Neck Shadow */}
              <path d="M 418 238 C 424 246, 438 246, 444 238 Z" fill="#C2977C" />

              {/* Head / Face (Angled down slightly toward notebook) */}
              <ellipse cx="431" cy="180" rx="34" ry="42" fill="#E8BFA2" />
              {/* Cheek & Jaw Structure */}
              <path
                d="M 402 180 
                   C 405 208, 420 226, 433 226 
                   C 446 226, 458 208, 460 180 Z"
                fill="#E5BBA0"
              />

              {/* Ear */}
              <ellipse cx="396" cy="182" rx="6" ry="10" fill="#DCB297" />
              <ellipse cx="466" cy="182" rx="6" ry="10" fill="#DCB297" />

              {/* Over-Ear Headphones (Black & Charcoal) */}
              {/* Headphone Band across top */}
              <path
                d="M 390 185 C 385 105, 475 105, 472 185"
                fill="none"
                stroke="#171C22"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 395 180 C 392 115, 468 115, 467 180"
                fill="none"
                stroke="#334155"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Left Ear Cushion */}
              <rect x="388" y="165" width="10" height="28" rx="5" fill="#0F172A" stroke="#334155" strokeWidth="1" />
              {/* Right Ear Cushion */}
              <rect x="464" y="165" width="10" height="28" rx="5" fill="#0F172A" stroke="#334155" strokeWidth="1" />

              {/* Face Features: Focused down at notes */}
              {/* Eyebrows */}
              <path d="M 412 166 Q 422 163 427 167" fill="none" stroke="#2B1F17" strokeWidth="2" strokeLinecap="round" />
              <path d="M 437 167 Q 442 163 451 166" fill="none" stroke="#2B1F17" strokeWidth="2" strokeLinecap="round" />

              {/* Eyes Looking Down */}
              <path d="M 414 174 Q 420 178 426 174" fill="none" stroke="#38291F" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 437 174 Q 443 178 449 174" fill="none" stroke="#38291F" strokeWidth="1.8" strokeLinecap="round" />

              {/* Glasses (Modern Dark Wireframes) */}
              {/* Left Lens Frame */}
              <rect x="410" y="168" width="18" height="13" rx="4" fill="none" stroke="#1F2937" strokeWidth="1.8" />
              {/* Right Lens Frame */}
              <rect x="435" y="168" width="18" height="13" rx="4" fill="none" stroke="#1F2937" strokeWidth="1.8" />
              {/* Bridge */}
              <line x1="428" y1="172" x2="435" y2="172" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
              {/* Temples to ears */}
              <line x1="410" y1="171" x2="397" y2="176" stroke="#1F2937" strokeWidth="1.5" />
              <line x1="453" y1="171" x2="465" y2="176" stroke="#1F2937" strokeWidth="1.5" />
              {/* Subtle Lens Glare */}
              <line x1="413" y1="170" x2="422" y2="179" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
              <line x1="438" y1="170" x2="447" y2="179" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />

              {/* Nose & Mouth */}
              <path d="M 431 176 L 431 187 L 436 189" fill="none" stroke="#C29277" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 425 201 Q 432 203 438 201" fill="none" stroke="#B87B65" strokeWidth="1.8" strokeLinecap="round" />

              {/* Authentic Curly Hair (Textured Curls) */}
              <g fill="url(#curlyHair)">
                {/* Hair Mass */}
                <ellipse cx="431" cy="144" rx="42" ry="34" />
                <ellipse cx="410" cy="145" rx="28" ry="24" />
                <ellipse cx="452" cy="145" rx="28" ry="24" />
                <ellipse cx="431" cy="130" rx="36" ry="22" />

                {/* Individual Curly Clusters */}
                <circle cx="396" cy="148" r="11" />
                <circle cx="405" cy="134" r="12" />
                <circle cx="420" cy="124" r="13" />
                <circle cx="440" cy="123" r="13" />
                <circle cx="456" cy="132" r="12" />
                <circle cx="468" cy="146" r="11" />
                
                {/* Forehead curl fringe */}
                <circle cx="416" cy="154" r="7" />
                <circle cx="428" cy="151" r="8" />
                <circle cx="440" cy="152" r="7" />
                <circle cx="449" cy="157" r="6" />
                <circle cx="406" cy="160" r="6" />
              </g>

              {/* Natural Highlights on Top Curls */}
              <path
                d="M 412 126 Q 425 118 444 124"
                fill="none"
                stroke="#4E3B2F"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 400 138 Q 410 130 422 135"
                fill="none"
                stroke="#4E3B2F"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </svg>
        </div>

        {/* Ambient Bottom Gradient to blend into container */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#263F2B]/10 to-transparent pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* ONLY ONE STREAMLINED FLOATING UI OVERLAY:                   */}
      {/* "Your Study Path" card with subtle 1px border and shadow     */}
      {/* (Intro to Algorithms [v], Data Structures [v], DP [78%])     */}
      {/* ============================================================ */}
      <div className="absolute -bottom-6 right-2 sm:-right-4 w-[280px] sm:w-[310px] bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E1E4D8] shadow-xl text-xs space-y-3.5 z-20 transition-all hover:shadow-2xl">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#EAEFE5] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EAF2E7] text-[#233D29] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-[#17241B] tracking-tight">
              Your Study Path
            </span>
          </div>
          <span className="text-[10px] font-mono-code bg-[#F1F2E6] text-[#4F6048] px-2 py-0.5 rounded-md font-medium border border-[#E1E4D8]/70">
            CS 204
          </span>
        </div>

        {/* Study Path Progress Items */}
        <div className="space-y-2.5">
          {/* Item 1: Intro to Algorithms (Checked) */}
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#FAFBF8] border border-[#EFF2EA]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#233D29] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-[#17241B]">
                Intro to Algorithms
              </span>
            </div>
            <span className="text-[10px] text-[#233D29] font-semibold">
              Completed
            </span>
          </div>

          {/* Item 2: Data Structures (Checked) */}
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#FAFBF8] border border-[#EFF2EA]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#233D29] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-[#17241B]">
                Data Structures
              </span>
            </div>
            <span className="text-[10px] text-[#233D29] font-semibold">
              Completed
            </span>
          </div>

          {/* Item 3: Dynamic Programming (78% completed progress bar) */}
          <div className="py-1.5 px-2.5 rounded-lg bg-[#F3F7F0] border border-[#DCE7D6] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#17241B]">
                Dynamic Programming
              </span>
              <span className="text-[11px] font-mono-code font-bold text-[#233D29]">
                78% completed
              </span>
            </div>
            {/* Subtle Green Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#DEE8D9] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2B4B32] to-[#233D29] rounded-full transition-all duration-500"
                style={{ width: '78%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
