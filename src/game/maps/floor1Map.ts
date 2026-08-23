export type MapDimensions = {
  width: number;
  height: number;
};

export type MapRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MapPoint = {
  id: string;
  x: number;
  y: number;
};

export type MapWallSegment = {
  id: string;
  from: MapPoint;
  to: MapPoint;
};

export type GameMapDefinition = {
  id: string;
  displayName: string;
  assetKey: string;
  dimensions: MapDimensions;
  playerStart: MapPoint;
  collisionRects: MapRect[];
  wallSegments: MapWallSegment[];
  spawnZones: MapRect[];
  ticketPoints: MapPoint[];
  reference: string;
};

export const FLOOR1_MAP: GameMapDefinition = {
  id: 'floor1',
  displayName: 'Floor 1 Blueprint',
  assetKey: 'map.floor1',
  dimensions: {
    width: 1672,
    height: 941,
  },
  playerStart: {
    id: 'player-start',
    x: 838,
    y: 585,
  },
  collisionRects: [],
  wallSegments: [
    {
      id: 'outer-wall-001',
      from: { id: 'outer-wall-001-a', x: 44, y: 38 },
      to: { id: 'outer-wall-001-b', x: 858, y: 117 },
    },
    {
      id: 'outer-wall-002',
      from: { id: 'outer-wall-002-a', x: 858, y: 117 },
      to: { id: 'outer-wall-002-b', x: 1620, y: 170 },
    },
    {
      id: 'outer-wall-003',
      from: { id: 'outer-wall-003-a', x: 1620, y: 170 },
      to: { id: 'outer-wall-003-b', x: 1601, y: 802 },
    },
    {
      id: 'outer-wall-004',
      from: { id: 'outer-wall-004-a', x: 1601, y: 802 },
      to: { id: 'outer-wall-004-b', x: 175, y: 802 },
    },
    {
      id: 'outer-wall-005',
      from: { id: 'outer-wall-005-a', x: 175, y: 802 },
      to: { id: 'outer-wall-005-b', x: 44, y: 38 },
    },
    {
      id: 'wall-017',
      from: { id: 'wall-017-a', x: 694, y: 117 },
      to: { id: 'wall-017-b', x: 694, y: 252 },
    },
    {
      id: 'wall-018',
      from: { id: 'wall-018-a', x: 779, y: 126 },
      to: { id: 'wall-018-b', x: 779, y: 258 },
    },
    {
      id: 'wall-019',
      from: { id: 'wall-019-a', x: 856, y: 134 },
      to: { id: 'wall-019-b', x: 856, y: 263 },
    },
    {
      id: 'wall-020',
      from: { id: 'wall-020-a', x: 856, y: 263 },
      to: { id: 'wall-020-b', x: 941, y: 263 },
    },
    {
      id: 'wall-021',
      from: { id: 'wall-021-a', x: 941, y: 196 },
      to: { id: 'wall-021-b', x: 853, y: 196 },
    },
    {
      id: 'wall-022',
      from: { id: 'wall-022-a', x: 378, y: 375 },
      to: { id: 'wall-022-b', x: 378, y: 308 },
    },
    {
      id: 'wall-023',
      from: { id: 'wall-023-a', x: 378, y: 308 },
      to: { id: 'wall-023-b', x: 640, y: 308 },
    },
    {
      id: 'wall-024',
      from: { id: 'wall-024-a', x: 640, y: 308 },
      to: { id: 'wall-024-b', x: 640, y: 547 },
    },
    {
      id: 'wall-025',
      from: { id: 'wall-025-a', x: 640, y: 547 },
      to: { id: 'wall-025-b', x: 375, y: 547 },
    },
    {
      id: 'wall-026',
      from: { id: 'wall-026-a', x: 375, y: 547 },
      to: { id: 'wall-026-b', x: 377, y: 475 },
    },
    {
      id: 'wall-027',
      from: { id: 'wall-027-a', x: 377, y: 475 },
      to: { id: 'wall-027-b', x: 538, y: 475 },
    },
    {
      id: 'wall-028',
      from: { id: 'wall-028-a', x: 538, y: 475 },
      to: { id: 'wall-028-b', x: 538, y: 314 },
    },
    {
      id: 'wall-029',
      from: { id: 'wall-029-a', x: 538, y: 314 },
      to: { id: 'wall-029-b', x: 491, y: 314 },
    },
    {
      id: 'wall-030',
      from: { id: 'wall-030-a', x: 491, y: 314 },
      to: { id: 'wall-030-b', x: 491, y: 374 },
    },
    {
      id: 'wall-031',
      from: { id: 'wall-031-a', x: 491, y: 374 },
      to: { id: 'wall-031-b', x: 431, y: 374 },
    },
    {
      id: 'wall-032',
      from: { id: 'wall-032-a', x: 431, y: 374 },
      to: { id: 'wall-032-b', x: 431, y: 311 },
    },
    {
      id: 'wall-033',
      from: { id: 'wall-033-a', x: 679, y: 317 },
      to: { id: 'wall-033-b', x: 1020, y: 317 },
    },
    {
      id: 'wall-034-a',
      from: { id: 'wall-034-a-start', x: 1020, y: 317 },
      to: { id: 'wall-034-a-end', x: 1020, y: 332 },
    },
    {
      id: 'wall-034-c',
      from: { id: 'wall-034-c-start', x: 1020, y: 475 },
      to: { id: 'wall-034-c-end', x: 1020, y: 546 },
    },
    {
      id: 'wall-035',
      from: { id: 'wall-035-a', x: 1020, y: 546 },
      to: { id: 'wall-035-b', x: 679, y: 546 },
    },
    {
      id: 'wall-036',
      from: { id: 'wall-036-a', x: 679, y: 546 },
      to: { id: 'wall-036-b', x: 679, y: 317 },
    },
    {
      id: 'wall-037',
      from: { id: 'wall-037-a', x: 1186, y: 325 },
      to: { id: 'wall-037-b', x: 1427, y: 325 },
    },
    {
      id: 'wall-038',
      from: { id: 'wall-038-a', x: 1427, y: 325 },
      to: { id: 'wall-038-b', x: 1427, y: 548 },
    },
    {
      id: 'wall-039',
      from: { id: 'wall-039-a', x: 1427, y: 548 },
      to: { id: 'wall-039-b', x: 1186, y: 548 },
    },
    {
      id: 'wall-040',
      from: { id: 'wall-040-a', x: 1186, y: 548 },
      to: { id: 'wall-040-b', x: 1186, y: 325 },
    },
    {
      id: 'wall-041',
      from: { id: 'wall-041-a', x: 262, y: 123 },
      to: { id: 'wall-041-b', x: 262, y: 214 },
    },
    {
      id: 'wall-042',
      from: { id: 'wall-042-a', x: 344, y: 129 },
      to: { id: 'wall-042-b', x: 344, y: 215 },
    },
    {
      id: 'wall-043',
      from: { id: 'wall-043-a', x: 436, y: 129 },
      to: { id: 'wall-043-b', x: 436, y: 217 },
    },
    {
      id: 'wall-044',
      from: { id: 'wall-044-a', x: 506, y: 145 },
      to: { id: 'wall-044-b', x: 506, y: 224 },
    },
    {
      id: 'wall-045',
      from: { id: 'wall-045-a', x: 591, y: 151 },
      to: { id: 'wall-045-b', x: 591, y: 227 },
    },
    {
      id: 'wall-046',
      from: { id: 'wall-046-a', x: 654, y: 151 },
      to: { id: 'wall-046-b', x: 654, y: 232 },
    },
    {
      id: 'wall-047',
      from: { id: 'wall-047-a', x: 1022, y: 188 },
      to: { id: 'wall-047-b', x: 1022, y: 257 },
    },
    {
      id: 'wall-048',
      from: { id: 'wall-048-a', x: 1063, y: 238 },
      to: { id: 'wall-048-b', x: 1135, y: 238 },
    },
    {
      id: 'wall-049',
      from: { id: 'wall-049-a', x: 1062, y: 324 },
      to: { id: 'wall-049-b', x: 1141, y: 324 },
    },
    {
      id: 'wall-050',
      from: { id: 'wall-050-a', x: 1065, y: 362 },
      to: { id: 'wall-050-b', x: 1065, y: 438 },
    },
    {
      id: 'wall-051',
      from: { id: 'wall-051-a', x: 1065, y: 438 },
      to: { id: 'wall-051-b', x: 1144, y: 438 },
    },
    {
      id: 'wall-052',
      from: { id: 'wall-052-a', x: 1061, y: 510 },
      to: { id: 'wall-052-b', x: 1146, y: 510 },
    },
    {
      id: 'wall-053',
      from: { id: 'wall-053-a', x: 1191, y: 156 },
      to: { id: 'wall-053-b', x: 1191, y: 266 },
    },
    {
      id: 'wall-054',
      from: { id: 'wall-054-a', x: 79, y: 140 },
      to: { id: 'wall-054-b', x: 161, y: 140 },
    },
    {
      id: 'wall-055',
      from: { id: 'wall-055-a', x: 95, y: 243 },
      to: { id: 'wall-055-b', x: 167, y: 243 },
    },
    {
      id: 'wall-056',
      from: { id: 'wall-056-a', x: 1259, y: 161 },
      to: { id: 'wall-056-b', x: 1259, y: 262 },
    },
    {
      id: 'wall-057',
      from: { id: 'wall-057-a', x: 1338, y: 167 },
      to: { id: 'wall-057-b', x: 1338, y: 264 },
    },
    {
      id: 'wall-058',
      from: { id: 'wall-058-a', x: 1385, y: 198 },
      to: { id: 'wall-058-b', x: 1385, y: 264 },
    },
    {
      id: 'wall-059',
      from: { id: 'wall-059-a', x: 1471, y: 201 },
      to: { id: 'wall-059-b', x: 1471, y: 264 },
    },
    {
      id: 'wall-060',
      from: { id: 'wall-060-a', x: 1524, y: 181 },
      to: { id: 'wall-060-b', x: 1524, y: 263 },
    },
    {
      id: 'wall-061',
      from: { id: 'wall-061-a', x: 174, y: 503 },
      to: { id: 'wall-061-b', x: 300, y: 503 },
    },
    {
      id: 'wall-062',
      from: { id: 'wall-062-a', x: 255, y: 679 },
      to: { id: 'wall-062-b', x: 255, y: 790 },
    },
    {
      id: 'wall-063',
      from: { id: 'wall-063-a', x: 331, y: 678 },
      to: { id: 'wall-063-b', x: 331, y: 790 },
    },
    {
      id: 'wall-064',
      from: { id: 'wall-064-a', x: 382, y: 650 },
      to: { id: 'wall-064-b', x: 382, y: 581 },
    },
    {
      id: 'wall-065',
      from: { id: 'wall-065-a', x: 382, y: 581 },
      to: { id: 'wall-065-b', x: 517, y: 581 },
    },
    {
      id: 'wall-066',
      from: { id: 'wall-066-a', x: 517, y: 647 },
      to: { id: 'wall-066-b', x: 470, y: 647 },
    },
    {
      id: 'wall-067',
      from: { id: 'wall-067-a', x: 470, y: 647 },
      to: { id: 'wall-067-b', x: 470, y: 581 },
    },
    {
      id: 'wall-068',
      from: { id: 'wall-068-a', x: 666, y: 584 },
      to: { id: 'wall-068-b', x: 823, y: 584 },
    },
    {
      id: 'wall-069',
      from: { id: 'wall-069-a', x: 823, y: 584 },
      to: { id: 'wall-069-b', x: 823, y: 647 },
    },
    {
      id: 'wall-070',
      from: { id: 'wall-070-a', x: 823, y: 647 },
      to: { id: 'wall-070-b', x: 666, y: 647 },
    },
    {
      id: 'wall-071',
      from: { id: 'wall-071-a', x: 666, y: 647 },
      to: { id: 'wall-071-b', x: 666, y: 584 },
    },
    {
      id: 'wall-072',
      from: { id: 'wall-072-a', x: 1022, y: 584 },
      to: { id: 'wall-072-b', x: 1104, y: 584 },
    },
    {
      id: 'wall-073',
      from: { id: 'wall-073-a', x: 1022, y: 650 },
      to: { id: 'wall-073-b', x: 1104, y: 650 },
    },
    {
      id: 'wall-074',
      from: { id: 'wall-074-a', x: 1217, y: 583 },
      to: { id: 'wall-074-b', x: 1396, y: 583 },
    },
    {
      id: 'wall-075',
      from: { id: 'wall-075-a', x: 1214, y: 650 },
      to: { id: 'wall-075-b', x: 1397, y: 650 },
    },
    {
      id: 'wall-076',
      from: { id: 'wall-076-a', x: 1305, y: 583 },
      to: { id: 'wall-076-b', x: 1308, y: 649 },
    },
    {
      id: 'wall-077',
      from: { id: 'wall-077-a', x: 512, y: 686 },
      to: { id: 'wall-077-b', x: 512, y: 790 },
    },
    {
      id: 'wall-078',
      from: { id: 'wall-078-a', x: 667, y: 686 },
      to: { id: 'wall-078-b', x: 667, y: 790 },
    },
    {
      id: 'wall-079',
      from: { id: 'wall-079-a', x: 827, y: 686 },
      to: { id: 'wall-079-b', x: 827, y: 790 },
    },
    {
      id: 'wall-080',
      from: { id: 'wall-080-a', x: 1142, y: 686 },
      to: { id: 'wall-080-b', x: 1142, y: 790 },
    },
    {
      id: 'wall-081',
      from: { id: 'wall-081-a', x: 1302, y: 686 },
      to: { id: 'wall-081-b', x: 1302, y: 790 },
    },
    {
      id: 'wall-082',
      from: { id: 'wall-082-a', x: 1463, y: 686 },
      to: { id: 'wall-082-b', x: 1463, y: 790 },
    },
    {
      id: 'wall-083',
      from: { id: 'wall-083-a', x: 1516, y: 644 },
      to: { id: 'wall-083-b', x: 1592, y: 644 },
    },
    {
      id: 'wall-084',
      from: { id: 'wall-084-a', x: 1515, y: 375 },
      to: { id: 'wall-084-b', x: 1600, y: 375 },
    },
    {
      id: 'wall-085',
      from: { id: 'wall-085-a', x: 1515, y: 460 },
      to: { id: 'wall-085-b', x: 1600, y: 460 },
    },
    {
      id: 'wall-086',
      from: { id: 'wall-086-a', x: 1515, y: 606 },
      to: { id: 'wall-086-b', x: 1600, y: 606 },
    },
    {
      id: 'wall-087',
      from: { id: 'wall-087-a', x: 1515, y: 692 },
      to: { id: 'wall-087-b', x: 1600, y: 692 },
    },
    {
      id: 'wall-088',
      from: { id: 'wall-088-a', x: 1515, y: 754 },
      to: { id: 'wall-088-b', x: 1600, y: 754 },
    },
    {
      id: 'wall-089',
      from: { id: 'wall-089-a', x: 1413, y: 691 },
      to: { id: 'wall-089-b', x: 1413, y: 760 },
    },
    {
      id: 'wall-090',
      from: { id: 'wall-090-a', x: 1347, y: 713 },
      to: { id: 'wall-090-b', x: 1347, y: 760 },
    },
    {
      id: 'wall-091',
      from: { id: 'wall-091-a', x: 1255, y: 691 },
      to: { id: 'wall-091-b', x: 1255, y: 760 },
    },
    {
      id: 'wall-092',
      from: { id: 'wall-092-a', x: 1189, y: 713 },
      to: { id: 'wall-092-b', x: 1189, y: 760 },
    },
    {
      id: 'wall-093',
      from: { id: 'wall-093-a', x: 1097, y: 732 },
      to: { id: 'wall-093-b', x: 1097, y: 760 },
    },
    {
      id: 'wall-094',
      from: { id: 'wall-094-a', x: 1031, y: 732 },
      to: { id: 'wall-094-b', x: 1031, y: 760 },
    },
    {
      id: 'wall-095',
      from: { id: 'wall-095-a', x: 939, y: 713 },
      to: { id: 'wall-095-b', x: 939, y: 760 },
    },
    {
      id: 'wall-096',
      from: { id: 'wall-096-a', x: 873, y: 691 },
      to: { id: 'wall-096-b', x: 873, y: 760 },
    },
    {
      id: 'wall-097',
      from: { id: 'wall-097-a', x: 782, y: 691 },
      to: { id: 'wall-097-b', x: 782, y: 760 },
    },
    {
      id: 'wall-098',
      from: { id: 'wall-098-a', x: 713, y: 691 },
      to: { id: 'wall-098-b', x: 713, y: 760 },
    },
    {
      id: 'wall-099',
      from: { id: 'wall-099-a', x: 622, y: 691 },
      to: { id: 'wall-099-b', x: 622, y: 790 },
    },
    {
      id: 'wall-100',
      from: { id: 'wall-100-a', x: 559, y: 707 },
      to: { id: 'wall-100-b', x: 559, y: 790 },
    },
    {
      id: 'wall-101',
      from: { id: 'wall-101-a', x: 460, y: 691 },
      to: { id: 'wall-101-b', x: 460, y: 790 },
    },
    {
      id: 'wall-102',
      from: { id: 'wall-102-a', x: 391, y: 707 },
      to: { id: 'wall-102-b', x: 391, y: 790 },
    },
    {
      id: 'wall-103',
      from: { id: 'wall-103-a', x: 188, y: 622 },
      to: { id: 'wall-103-b', x: 295, y: 622 },
    },
    {
      id: 'wall-104',
      from: { id: 'wall-104-a', x: 180, y: 551 },
      to: { id: 'wall-104-b', x: 297, y: 551 },
    },
    {
      id: 'wall-105',
      from: { id: 'wall-105-a', x: 158, y: 459 },
      to: { id: 'wall-105-b', x: 269, y: 459 },
    },
    {
      id: 'wall-106',
      from: { id: 'wall-106-a', x: 159, y: 370 },
      to: { id: 'wall-106-b', x: 269, y: 370 },
    },
    {
      id: 'wall-107',
      from: { id: 'wall-107-a', x: 159, y: 295 },
      to: { id: 'wall-107-b', x: 269, y: 295 },
    },
    {
      id: 'toilet-upper-top',
      from: { id: 'toilet-upper-top-a', x: 968, y: 332 },
      to: { id: 'toilet-upper-top-b', x: 1020, y: 332 },
    },
    {
      id: 'toilet-left',
      from: { id: 'toilet-left-a', x: 968, y: 332 },
      to: { id: 'toilet-left-b', x: 968, y: 475 },
    },
    {
      id: 'toilet-divider',
      from: { id: 'toilet-divider-a', x: 968, y: 400 },
      to: { id: 'toilet-divider-b', x: 1010, y: 400 },
    },
    {
      id: 'toilet-lower-bottom',
      from: { id: 'toilet-lower-bottom-a', x: 968, y: 475 },
      to: { id: 'toilet-lower-bottom-b', x: 1020, y: 475 },
    },
  ],
  spawnZones: [
    { id: 'spawn-blue-left-a', x: 58, y: 56, width: 154, height: 86 },
    { id: 'spawn-blue-left-b', x: 58, y: 154, width: 154, height: 104 },
    { id: 'spawn-blue-center', x: 690, y: 314, width: 108, height: 228 },
    { id: 'spawn-blue-right', x: 1200, y: 338, width: 260, height: 230 },
  ],
  ticketPoints: [
    { id: 'ticket-01', x: 260, y: 300 },
    { id: 'ticket-02', x: 335, y: 300 },
    { id: 'ticket-03', x: 470, y: 300 },
    { id: 'ticket-04', x: 610, y: 310 },
    { id: 'ticket-05', x: 660, y: 585 },
    { id: 'ticket-06', x: 860, y: 585 },
    { id: 'ticket-07', x: 970, y: 585 },
    { id: 'ticket-08', x: 1160, y: 585 },
    { id: 'ticket-09', x: 1480, y: 575 },
    { id: 'ticket-10', x: 210, y: 610 },
    { id: 'ticket-11', x: 450, y: 650 },
    { id: 'ticket-12', x: 555, y: 735 },
    { id: 'ticket-13', x: 905, y: 760 },
    { id: 'ticket-14', x: 1180, y: 760 },
    { id: 'ticket-15', x: 1470, y: 760 },
    { id: 'ticket-16', x: 1090, y: 250 },
  ],
  reference: 'portfolio-safe neon office layout',
};
