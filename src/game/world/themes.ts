/**
 * Sector themes. Each sector reads as one bright, signature-coloured stage
 * (the way every Robot-Master stage had its own palette), with enough contrast
 * between floor, wall body and trim that the toon ramp keeps rooms legible on
 * a small phone screen.
 */
export interface Theme {
  id: SectorId
  floor: string
  floorAlt: string
  corridor: string
  wall: string
  wallLow: string
  trim: string
  pilaster: string
  accent: string // light strips / glowing details
  hazard: string // floor stripes near doors
  skyTop: string
  skyBottom: string
  fog: string
  fogNear: number
  fogFar: number
  hemiSky: string
  hemiGround: string
  sun: string
  sunIntensity: number
  pipe: string
  crate: string
  crateTrim: string
}

export type SectorId = 'scrapyard' | 'blaze' | 'cryo' | 'volt' | 'gale' | 'magnet' | 'drill' | 'tide' | 'fortress'

export const THEMES: Record<SectorId, Theme> = {
  scrapyard: {
    id: 'scrapyard',
    floor: '#a39a8a', floorAlt: '#8e8676', corridor: '#7f7a70',
    wall: '#6f8a5a', wallLow: '#4e6340', trim: '#e8b73c', pilaster: '#8e9aa3',
    accent: '#ffcf5a', hazard: '#f2b21b',
    skyTop: '#4aa6ff', skyBottom: '#bfe6ff', fog: '#bcdcf2', fogNear: 20, fogFar: 70,
    hemiSky: '#e6f3ff', hemiGround: '#6b5f4f', sun: '#fff4dc', sunIntensity: 1.25,
    pipe: '#c9763a', crate: '#c68a3e', crateTrim: '#5f4630'
  },
  blaze: {
    id: 'blaze',
    floor: '#7a4a3a', floorAlt: '#5e3a2e', corridor: '#56362b',
    wall: '#c8502c', wallLow: '#7e2e1c', trim: '#ffcc33', pilaster: '#4a3a38',
    accent: '#ff9a2e', hazard: '#ffcc33',
    skyTop: '#ff6a3d', skyBottom: '#ffd08a', fog: '#f7b37a', fogNear: 18, fogFar: 64,
    hemiSky: '#ffe2c4', hemiGround: '#5a2a1a', sun: '#fff0d0', sunIntensity: 1.2,
    pipe: '#8c8f99', crate: '#8a5b3a', crateTrim: '#2f2622'
  },
  cryo: {
    id: 'cryo',
    floor: '#d6e8f2', floorAlt: '#bcd6e6', corridor: '#a9c6d9',
    wall: '#4fa8d8', wallLow: '#2f78ad', trim: '#ffffff', pilaster: '#9fb8cc',
    accent: '#8ff2ff', hazard: '#3fd0ff',
    skyTop: '#6fc4ff', skyBottom: '#eaf8ff', fog: '#dff2ff', fogNear: 18, fogFar: 62,
    hemiSky: '#ffffff', hemiGround: '#7da3bf', sun: '#ffffff', sunIntensity: 1.15,
    pipe: '#6c7f99', crate: '#8fb6d0', crateTrim: '#2e4a66'
  },
  volt: {
    id: 'volt',
    floor: '#3a3f6e', floorAlt: '#2d3159', corridor: '#282b4d',
    wall: '#7a4fd6', wallLow: '#4a2f8f', trim: '#ffe13d', pilaster: '#2b2e4a',
    accent: '#ffe13d', hazard: '#ffe13d',
    skyTop: '#1a1450', skyBottom: '#6a4fc0', fog: '#4e3f96', fogNear: 16, fogFar: 58,
    hemiSky: '#c8c0ff', hemiGround: '#221c3f', sun: '#e6e0ff', sunIntensity: 1.1,
    pipe: '#3aa0ff', crate: '#5a5f8a', crateTrim: '#1c1e33'
  },
  gale: {
    id: 'gale',
    floor: '#e8eef2', floorAlt: '#cfdbe3', corridor: '#bfcdd8',
    wall: '#3fc0b0', wallLow: '#23867c', trim: '#ffffff', pilaster: '#dfe7ee',
    accent: '#bffff2', hazard: '#ff7f5f',
    skyTop: '#2f8cff', skyBottom: '#d8f0ff', fog: '#d0ecff', fogNear: 22, fogFar: 76,
    hemiSky: '#ffffff', hemiGround: '#8aa3b5', sun: '#fffbe8', sunIntensity: 1.25,
    pipe: '#ff9f5a', crate: '#d9c28a', crateTrim: '#6a5a3a'
  },
  // Polarity Works: a steel foundry under a red-and-blue sky of induction
  // coils; the poles are its accent (red north, blue south).
  magnet: {
    id: 'magnet',
    floor: '#8d93a3', floorAlt: '#777d8e', corridor: '#6a7080',
    wall: '#c23a4a', wallLow: '#7e2230', trim: '#3f7bff', pilaster: '#5a6072',
    accent: '#ff4a5e', hazard: '#3f7bff',
    skyTop: '#3a2c6e', skyBottom: '#ff9a8a', fog: '#c89aa8', fogNear: 18, fogFar: 64,
    hemiSky: '#ffe6ea', hemiGround: '#3a3448', sun: '#fff0e6', sunIntensity: 1.15,
    pipe: '#3f7bff', crate: '#9a8a7a', crateTrim: '#3a3036'
  },
  // Deep Mine: timbered rock under amber work lamps, hazard yellow trim, a
  // dusk-orange shaft of sky far above.
  drill: {
    id: 'drill',
    floor: '#8a7560', floorAlt: '#75624f', corridor: '#6a5848',
    wall: '#7a5a3e', wallLow: '#4a3d32', trim: '#ffc21a', pilaster: '#3f4654',
    accent: '#ffb12a', hazard: '#ffd23a',
    skyTop: '#2b2236', skyBottom: '#c98a52', fog: '#8a6a52', fogNear: 14, fogFar: 54,
    hemiSky: '#ffe2b8', hemiGround: '#3a2c22', sun: '#ffe6c2', sunIntensity: 1.05,
    pipe: '#8c8f99', crate: '#9a7a52', crateTrim: '#3a2a1e'
  },
  // Tidewater Locks: harbour concrete, teal lock walls, buoy-yellow trim,
  // a bright sea sky.
  tide: {
    id: 'tide',
    floor: '#7f95a3', floorAlt: '#6c8290', corridor: '#5f7482',
    wall: '#2f7f8f', wallLow: '#1f5966', trim: '#ffd23a', pilaster: '#3a4a5a',
    accent: '#5fd2ff', hazard: '#ff7a3a',
    skyTop: '#3f8fd8', skyBottom: '#cfeeff', fog: '#bfe0f0', fogNear: 20, fogFar: 70,
    hemiSky: '#eaf6ff', hemiGround: '#4a5e6a', sun: '#fff6e8', sunIntensity: 1.2,
    pipe: '#ff7a3a', crate: '#a8946a', crateTrim: '#3a4048'
  },
  fortress: {
    id: 'fortress',
    floor: '#4a4e5c', floorAlt: '#3a3d49', corridor: '#33363f',
    wall: '#3c4050', wallLow: '#24262f', trim: '#ff3f5f', pilaster: '#5a5f70',
    accent: '#ff3f5f', hazard: '#ff3f5f',
    skyTop: '#2a0f1f', skyBottom: '#8a2f3f', fog: '#5a2530', fogNear: 16, fogFar: 56,
    hemiSky: '#ffd0d8', hemiGround: '#1a1418', sun: '#ffe8e8', sunIntensity: 1.05,
    pipe: '#8a8f99', crate: '#5a5f70', crateTrim: '#1a1c22'
  }
}
