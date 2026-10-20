import type { Joint } from './pokeTools'

/**
 * The meetings of parts that are meant (`pokeThrough.test.ts`): a part made
 * by `part` may meet a box made by `box` this way, for `why`. Builders are
 * named by function and file, not line (an edit above them must not break
 * the list); the sizes (cm, `Hit`; `*` any) pin the pair when one builder
 * makes many parts. A joint that no longer occurs fails the test too.
 */
export const JOINTS: Joint[] = [
  // ── Level props ──
  { box: 'hintStoneParts@levelProps.ts', part: 'hintStoneParts@levelProps.ts', rule: 'deep', partSize: '58x55x52', why: 'a propping stone at one end of the slab\'s foot' },
  { box: 'hintStoneParts@levelProps.ts', part: 'hintStoneParts@levelProps.ts', rule: 'deep', partSize: '51x45x49', why: 'a propping stone at the other end of the slab\'s foot' },
  { box: 'hintStoneParts@levelProps.ts', part: 'hintStoneParts@levelProps.ts', rule: 'deep', partSize: '*x14x24', why: 'the coping along the slab\'s top edge' },
  { box: 'chestGeo@levelProps.ts', part: 'chestGeo@levelProps.ts', why: 'the straps, the rim rail and the lock wrap round the chest\'s body and lid; its feet sit under the corner straps' },
  { box: 'chestGeo@levelProps.ts', part: 'LevelProps.treasureGeo@levelProps.ts', why: 'a buried chest stands in its heap of earth' },
  { box: 'LevelProps.buildBridge@levelProps.ts', part: 'LevelProps.buildBridge@levelProps.ts', rule: 'through', boxSize: '*x10x*', partSize: '16x90x15', why: 'the rail posts go down through the outer ends of the planks' },
  // ── Set pieces and scenery ──
  { box: 'cart@setPieces.ts', part: 'cart@setPieces.ts', rule: 'deep', boxSize: '102x10x132', why: 'the ore heaped on an ore cart sits down in its rim (deeper is inside the cart)' },
  { box: 'mill@setPieces.ts', part: 'mill@setPieces.ts', rule: 'deep', boxSize: '430x22x430', why: 'the mill\'s tower and its foot ring stand in the cobbled yard' },
  { box: 'Object.wheatClump@terrain.ts', part: 'Object.wheatClump@terrain.ts', rule: 'through', why: 'a wheat clump is two crossed cards' },
  { box: 'buildChest@terrain.ts', part: 'buildChest@terrain.ts', rule: 'deep', boxSize: '94x12x64', why: 'the reward chest\'s gold band round the top of its body' },
  { box: 'new@arenaCrowd.ts', part: 'new@arenaCrowd.ts', rule: 'deep', boxSize: '120x190x6', partSize: '65x65x8', why: 'a banner\'s diamond badge shows on both its faces' },
  // ── Town props ──
  { box: 'draw@townProps.ts', part: 'draw@townProps.ts', rule: 'deep', boxSize: '156x12x110', partSize: '18x146x14', why: 'a hay cart\'s shafts are fixed under its bed' },
  { box: 'draw@townProps.ts', part: 'crate@townProps.ts', rule: 'through', boxSize: '135x2x50', why: 'the stall\'s cloth over its counter of crates, the top crate standing on it' },
  { box: 'draw@townProps.ts', part: 'draw@townProps.ts', rule: 'swallowed', partSize: '3x30x3', why: 'only the audit\'s 1 m gate: its sign\'s chains fall inside the posts (a town\'s gate is 6 m wide)' },
  // ── Houses ──
  { box: 'chimney@houses.ts', part: 'chimney@houses.ts', rule: 'through', why: 'a chimney\'s brick courses and its cap ring the stack' },
  { box: 'chimney@houses.ts', part: 'gableRoof@houses.ts', rule: 'through', why: 'a chimney comes up through the roof, a course ringing it where they meet' },
  { box: 'chimney@houses.ts', part: 'hipRoof@houses.ts', rule: 'through', why: 'a chimney comes up through the roof, a course ringing it where they meet' },
  { box: 'chimney@houses.ts', part: 'roofRows@houses.ts', rule: 'through', why: 'a chimney comes up through the roof\'s tile rows' },
  { box: 'chimney@houses.ts', part: 'thatchRoof@houses.ts', rule: 'through', why: 'a chimney comes up through the thatch' },
  { box: 'stack@houses.ts', part: 'gableRoof@houses.ts', why: 'the tops of the walls run up into the roof' },
  { box: 'stack@houses.ts', part: 'thatchRoof@houses.ts', why: 'the thatch is pulled down over the tops of the walls' },
  { box: 'body@houses.ts', part: 'gableRoof@houses.ts', rule: 'through', why: 'the tops of the walls run up into the roof' },
  { box: 'body@houses.ts', part: 'thatchRoof@houses.ts', rule: 'through', why: 'the thatch is pulled down over the tops of the walls' },
  { box: 'masonry@houses.ts', part: 'gableRoof@houses.ts', rule: 'through', why: 'a stone wall\'s facing runs up into the roof with the wall' },
  { box: 'body@houses.ts', part: 'body@houses.ts', rule: 'through', boxSize: '*x5x37', why: 'a ruin\'s rubble lies over its doorstep' },
  { box: 'belfry@houses.ts', part: 'belfry@houses.ts', rule: 'through', why: 'the bell hangs half out of its dark niche' },
  { box: 'forgeMouth@houses.ts', part: 'forgeMouth@houses.ts', rule: 'through', why: 'the forge mouth\'s posts stand through the ends of its floor' },
  // ── Rooms ──
  { box: 'drawStair@interiors.ts', part: 'room@houses.ts', rule: 'through', why: 'the skirting runs on behind the stair, against the wall' },
  { box: 'drawStair@interiors.ts', part: 'drawStair@interiors.ts', rule: 'deep', why: 'the landing\'s joist rests on the top steps' },
  { box: 'washstand@interiors.ts', part: 'washstand@interiors.ts', rule: 'through', why: 'a washstand\'s legs go through its low shelf' }
]
