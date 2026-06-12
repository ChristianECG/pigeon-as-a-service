"use client";

const ROUTES = [
  { from: { lat: 60.391263, lon: 5.322054,   label: "BRG" },
    to:   { lat: 19.432608, lon: -99.133209,  label: "MEX" },
    dur: "30s", begin: "0s" },
  { from: { lat: 34.052235, lon: -118.243683, label: "LAX" },
    to:   { lat: 60.391263, lon: 5.322054,    label: "BRG" },
    dur: "36s", begin: "12s" },
  { from: { lat: -34.603722, lon: -58.381592, label: "EZE" },
    to:   { lat: 38.716773,  lon: -9.142080,  label: "LIS" },
    dur: "26s", begin: "22s" },
  { from: { lat: 6.244203,  lon: -75.581215,  label: "MDE" },
    to:   { lat: 61.218056, lon: -149.900278,  label: "ANC" },
    dur: "32s", begin: "33s" },
  { from: { lat: -33.459229, lon: -70.645348,  label: "SCL" },
    to:   { lat: -12.046374, lon: -77.042793,  label: "LIM" },
    dur: "18s", begin: "7s" },
  { from: { lat: 14.693425,  lon: -17.447938,  label: "DKR" },
    to:   { lat: -8.054508,  lon: -34.880904,  label: "REC" },
    dur: "20s", begin: "16s" },
  { from: { lat: 23.113592,  lon: -82.366592,  label: "HAV" },
    to:   { lat: 25.774137,  lon: -80.190421,  label: "MIA" },
    dur: "8s",  begin: "43s" },
  { from: { lat: 34.052235,  lon: -118.243683, label: "LAX" },
    to:   { lat: 37.741449,  lon: -25.669368,  label: "PDL" },
    dur: "28s", begin: "25s" },
  { from: { lat: 37.741449,  lon: -25.669368,  label: "PDL" },
    to:   { lat: 38.716773,  lon: -9.142080,   label: "LIS" },
    dur: "10s", begin: "65s" },
] as const;

const C_LAT = 28, C_LON = -42;
const R = 172, CX = 200, CY = 200;

function rad(d: number) { return (d * Math.PI) / 180; }

function project(lat: number, lon: number): [number, number] | null {
  const λ = rad(lon - C_LON), φ = rad(lat), φ0 = rad(C_LAT);
  const vis = Math.sin(φ)*Math.sin(φ0) + Math.cos(φ)*Math.cos(φ0)*Math.cos(λ);
  if (vis < 0.04) return null;
  return [
    CX + R * Math.cos(φ) * Math.sin(λ),
    CY - R * (Math.sin(φ)*Math.cos(φ0) - Math.cos(φ)*Math.sin(φ0)*Math.cos(λ)),
  ];
}

function slerp(la1: number, lo1: number, la2: number, lo2: number, t: number): [number, number] {
  const [φ1,λ1,φ2,λ2] = [rad(la1),rad(lo1),rad(la2),rad(lo2)];
  const v1 = [Math.cos(φ1)*Math.cos(λ1),Math.cos(φ1)*Math.sin(λ1),Math.sin(φ1)];
  const v2 = [Math.cos(φ2)*Math.cos(λ2),Math.cos(φ2)*Math.sin(λ2),Math.sin(φ2)];
  const dot = v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2];
  const Ω = Math.acos(Math.max(-1,Math.min(1,dot)));
  if (Ω < 1e-4) return [la1,lo1];
  const s = Math.sin(Ω);
  const [a,b] = [Math.sin((1-t)*Ω)/s, Math.sin(t*Ω)/s];
  const v = [a*v1[0]+b*v2[0],a*v1[1]+b*v2[1],a*v1[2]+b*v2[2]];
  return [Math.atan2(v[2],Math.sqrt(v[0]**2+v[1]**2))*180/Math.PI, Math.atan2(v[1],v[0])*180/Math.PI];
}

function arcPath(la1: number, lo1: number, la2: number, lo2: number, n = 90): string {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const [la,lo] = slerp(la1,lo1,la2,lo2,i/n);
    const p = project(la,lo);
    if (p) pts.push(`${pts.length===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`);
  }
  return pts.join("");
}

function buildGrid(): string[] {
  const segs: string[] = [];
  const flush = (pts: [number,number][]) => {
    if (pts.length > 1) segs.push(pts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(""));
  };
  for (const lat of [-60,-30,0,30,60]) {
    let pts: [number,number][] = [];
    for (let lon=-180;lon<=180;lon+=2){const p=project(lat,lon);if(p)pts.push(p);else{flush(pts);pts=[];}}
    flush(pts);
  }
  for (const lon of [-150,-120,-90,-60,-30,0,30,60,90,120,150,180]) {
    let pts: [number,number][] = [];
    for (let lat=-90;lat<=90;lat+=2){const p=project(lat,lon);if(p)pts.push(p);else{flush(pts);pts=[];}}
    flush(pts);
  }
  return segs;
}

// Continent coastlines — traced clockwise with enough points to be recognizable
const CONTINENTS: Array<[number,number][]> = [
  // ── North America ──
  [
    [47,-53],[46,-60],[44,-64],[43,-66],[42,-70],[41,-71],[40,-74],
    [38,-75],[36,-76],[34,-77],[32,-80],[30,-81],[27,-80],[25,-80],
    [24,-82],[26,-82],[28,-83],[29,-85],[30,-88],[29,-90],[28,-93],
    [26,-97],[24,-97],[22,-97],[20,-97],[19,-96],[17,-94],[16,-92],
    [18,-91],[19,-90],[21,-87],[20,-87],[16,-88],[14,-87],[12,-83],
    [10,-84],[9,-79],
    [10,-77],[8,-77],[4,-78],[1,-79],[0,-80],[2,-80],
    [4,-77],[8,-77],[9,-79],
    [10,-84],[12,-83],[14,-91],[16,-98],[19,-105],[22,-106],[26,-110],
    [24,-110],[30,-116],[32,-117],[34,-120],[38,-123],[40,-124],
    [43,-124],[46,-124],[48,-124],[49,-123],[52,-128],[55,-130],
    [58,-136],[60,-143],[57,-151],[55,-162],[58,-157],[63,-162],
    [65,-168],[66,-165],[70,-160],[71,-157],[70,-140],
    [68,-135],[62,-120],[59,-95],[63,-92],[65,-86],[70,-78],
    [73,-65],[68,-62],[60,-64],[56,-62],[52,-55],[50,-56],[47,-53],
  ],
  // ── Greenland ──
  [
    [60,-44],[63,-51],[67,-53],[72,-56],[75,-67],[78,-72],
    [83,-40],[80,-18],[76,-18],[72,-22],[68,-31],[63,-42],[60,-44],
  ],
  // ── South America ──
  [
    [12,-72],[11,-63],[10,-62],[8,-60],[5,-52],[3,-51],[1,-50],
    [0,-50],[-3,-44],[-5,-35],[-8,-35],[-12,-37],[-16,-39],
    [-20,-40],[-23,-43],[-28,-49],[-33,-52],[-35,-57],[-38,-57],
    [-40,-62],[-46,-66],[-50,-68],[-54,-65],[-55,-67],[-54,-70],
    [-50,-75],[-45,-74],[-38,-72],[-30,-71],[-24,-70],[-18,-70],
    [-15,-75],[-12,-77],[-8,-80],[-4,-81],[-2,-80],[0,-80],
    [1,-78],[4,-77],[8,-77],[9,-77],[10,-75],[12,-72],
  ],
  // ── Europe (outer coastline, clockwise) ──
  [
    [71,25],[70,18],[65,14],[62,6],[58,5],[56,4],[53,8],
    [52,4],[51,2],[50,2],[48,-5],[47,-2],[45,-2],[43,-2],
    [43,-9],[38,-9],[37,-9],[36,-6],[36,-5],
    [37,0],[38,0],[40,0],[42,3],[36,5],[37,8],[38,10],
    [41,9],[44,8],[43,5],[43,6],[44,8],[44,13],[45,13],
    [44,15],[39,20],[37,23],[36,28],[40,26],[41,29],
    [43,28],[46,30],[47,38],[43,43],[47,38],[50,30],
    [55,38],[60,30],[60,24],[63,20],[65,18],[68,18],[71,25],
  ],
  // ── Africa ──
  [
    [36,-6],[34,-3],[30,-10],[27,-13],[21,-17],[15,-17],
    [13,-16],[10,-15],[8,-13],[5,-5],[4,2],[4,7],[3,8],
    [4,10],[0,9],[-2,10],[-5,12],[-8,12],[-15,12],
    [-22,14],[-27,15],[-33,18],[-34,26],[-30,32],
    [-25,33],[-15,37],[-10,40],[-5,40],[0,41],[5,45],
    [11,51],[12,50],[12,43],[16,40],[22,37],[28,33],
    [30,32],[31,30],[31,25],[33,13],[36,10],[37,9],
    [38,5],[36,-6],
  ],
  // ── Iceland ──
  [[63,-24],[66,-22],[66,-14],[64,-13],[63,-20],[63,-24]],
  // ── Great Britain (rough outline) ──
  [[51,-5],[51,-3],[53,0],[55,0],[57,-2],[58,-3],[60,-1],[58,0],[53,0],[51,-2],[51,-5]],
];

function buildLand(): string[] {
  return CONTINENTS.map(pts => {
    const proj: [number,number][] = [];
    for (const [la,lo] of pts) { const p=project(la,lo); if(p)proj.push(p); }
    if (proj.length < 3) return "";
    return proj.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("")+"Z";
  }).filter(Boolean);
}

function generateStars(count: number): [number,number,number,number][] {
  let s = 42;
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  return Array.from({ length: count }, (): [number,number,number,number] => [
    rng() * 420 - 10,
    rng() * 420 - 10,
    0.2 + rng() * 0.9,
    0.06 + rng() * 0.32,
  ]);
}
const STARS = generateStars(220);

const ARCS  = ROUTES.map(r => arcPath(r.from.lat, r.from.lon, r.to.lat, r.to.lon));
const GRID  = buildGrid();
const LAND  = buildLand();
const LOFTS = ROUTES.flatMap(r => [
  { ...r.from, pt: project(r.from.lat, r.from.lon) },
  { ...r.to,   pt: project(r.to.lat,   r.to.lon)   },
]).filter((l,i,arr) => l.pt !== null && arr.findIndex(x=>x.label===l.label)===i);

export default function GlobeHero() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full select-none" aria-hidden="true" style={{overflow:"visible"}}>
      <defs>
        <clipPath id="globe-clip"><circle cx={CX} cy={CY} r={R} /></clipPath>
        <radialGradient id="ocean-grad" cx="34%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#0f1d35" />
          <stop offset="55%"  stopColor="#0a1220" />
          <stop offset="100%" stopColor="#05080f" />
        </radialGradient>
        <radialGradient id="atmo-grad" cx="50%" cy="50%" r="50%">
          <stop offset="82%"  stopColor="transparent" />
          <stop offset="92%"  stopColor="#1a3a6e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="specular" cx="30%" cy="24%" r="38%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.07" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="limb" cx="50%" cy="50%" r="50%">
          <stop offset="70%"  stopColor="transparent" />
          <stop offset="100%" stopColor="#000008" stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id="nebula-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#2d1b69" stopOpacity="0.18" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nebula-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0f2d4a" stopOpacity="0.14" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="dot-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Nebulae */}
      <ellipse cx={60}  cy={70}  rx={110} ry={90}  fill="url(#nebula-a)" />
      <ellipse cx={355} cy={330} rx={90}  ry={110} fill="url(#nebula-b)" />
      {/* Stars */}
      {STARS.map(([x,y,r,op],i) => <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op} />)}

      {/* Atmosphere halo */}
      <circle cx={CX} cy={CY} r={R+10} fill="url(#atmo-grad)" />
      {/* Ocean */}
      <circle cx={CX} cy={CY} r={R} fill="url(#ocean-grad)" />

      <g clipPath="url(#globe-clip)">
        {/* Land */}
        {LAND.map((d,i) => <path key={i} d={d} fill="#14201a" stroke="#1c2e22" strokeWidth="0.7" />)}
        {/* Graticule */}
        {GRID.map((d,i) => <path key={i} d={d} stroke="#ffffff" strokeWidth="0.3" fill="none" opacity="0.06" />)}
        {/* Flight arcs */}
        {ARCS.map((d,i) => (
          <path key={i} d={d} stroke="#8b5cf6" strokeWidth="1.1" strokeDasharray="5 4" fill="none" opacity="0.55" />
        ))}
        {/* Specular highlight */}
        <circle cx={CX} cy={CY} r={R} fill="url(#specular)" />
      </g>

      {/* Limb darkening */}
      <circle cx={CX} cy={CY} r={R} fill="url(#limb)" />
      {/* Edge highlight */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e3a5e" strokeWidth="1.2" />

      {/* Loft dots */}
      {LOFTS.map(({ label, pt }) => pt && (
        <g key={label} filter="url(#dot-glow)">
          <circle cx={pt[0]} cy={pt[1]} r={5} fill="#8b5cf6" opacity="0.2" />
          <circle cx={pt[0]} cy={pt[1]} r={2} fill="#8b5cf6" />
          <text x={pt[0]+6} y={pt[1]+4} fontSize="7" fontFamily="monospace" fill="#8b5cf6" opacity="0.8">{label}</text>
        </g>
      ))}

      {/* Pigeons — emoji 🕊️, hidden until their animation begins */}
      {ROUTES.map((route, i) => (
        <g key={i}>
          {/* hide before begin to avoid rendering at SVG origin */}
          <set attributeName="visibility" to="hidden" />
          <set attributeName="visibility" to="visible" begin={route.begin} />
          <text fontSize="14" textAnchor="middle" dominantBaseline="central" style={{userSelect:"none"}}>
            🕊️
          </text>
          <animateMotion dur={route.dur} begin={route.begin} repeatCount="indefinite" rotate="0">
            <mpath href={`#arc-ref-${i}`} />
          </animateMotion>
        </g>
      ))}

      {/* Arc references for animateMotion */}
      {ARCS.map((d,i) => <path key={i} id={`arc-ref-${i}`} d={d} fill="none" stroke="none" />)}
    </svg>
  );
}
