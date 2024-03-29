import { UnhandledError } from "../../util/errors.ts";

export function roomConstruction(room: Room) {
	const findPathOpts: FindPathOpts = {
		ignoreCreeps: true,
		ignoreRoads: false,
		plainCost: 1,
		swampCost: 1,
		costCallback(roomName) {
			const r = Game.rooms[roomName];
			const matrix = new PathFinder.CostMatrix();
			for (const s of r.find(FIND_STRUCTURES)) {
				if (s.structureType === STRUCTURE_ROAD) {
					matrix.set(s.pos.x, s.pos.y, 1);
				} else if (s.structureType !== STRUCTURE_CONTAINER && (s.structureType !== STRUCTURE_RAMPART || !s.my)) {
					matrix.set(s.pos.x, s.pos.y, 0xff);
				}
			}

			for (const { pos: { x, y } } of r.find(FIND_CONSTRUCTION_SITES, { filter: s => s.structureType === STRUCTURE_ROAD })) {
				matrix.set(x, y, 1);
			}

			return matrix;
		},
	};

	// const handleConstructionSiteError = (err: ScreepsReturnCode) => {
	// 	switch (err) {
	// 		case OK:
	// 			break;
	// 		default:
	// 			throw new UnhandledError(err);
	// 	}
	// };

	// const stepToPos = (step: PathStep): null | RoomPosition => room.getPositionAt(step.x, step.y);

	// const placeRoads = (positions: Array<null | RoomPosition>) => _.forEach(positions, step => {
	// 	if (step) {
	// 		for (const look of step.look()) {
	// 			if (!(
	// 				look.constructionSite !== undefined
	// 				|| look.structure !== undefined
	// 				|| look.terrain === "wall"
	// 			)) {
	// 				handleConstructionSiteError(step.createConstructionSite(STRUCTURE_ROAD));
	// 			}
	// 		}
	// 	}
	// });

	// const buildRoad = (from: RoomPosition, to: RoomPosition, trim: number = 1) => {
	// 	const path = room.findPath(from, to, findPathOpts).slice(0, trim * -1);
	// 	if (path.length !== 0) {
	// 		placeRoads(path.map(stepToPos));
	// 	}
	// 	return path;
	// };

	// if (room.controller?.my) {
	// 	for (const spawn of room.find(FIND_MY_SPAWNS)) {
	// 		// placeRoads([
	// 		// 	room.getPositionAt(spawn.pos.x + 1, spawn.pos.y),
	// 		// 	room.getPositionAt(spawn.pos.x, spawn.pos.y + 1),
	// 		// 	room.getPositionAt(spawn.pos.x - 1, spawn.pos.y),
	// 		// 	room.getPositionAt(spawn.pos.x, spawn.pos.y - 1),
	// 		// ]);
	//
	// 		// buildRoad(spawn.pos, room.controller.pos, 3);
	//
	// 		// if (room.storage) {
	// 		// 	buildRoad(spawn.pos, room.storage.pos);
	// 		// }
	//
	// 		spawn.room.find(FIND_MY_CONSTRUCTION_SITES).forEach(s => {
	// 			s.remove();
	// 		});
	//
	// 		const hasRecycleContainer =
	// 			spawn.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length !== 0
	// 			|| spawn.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length !== 0;
	// 		if (!hasRecycleContainer) {
	// 			const corners: Array<null | RoomPosition> = [
	// 				room.getPositionAt(spawn.pos.x + 1, spawn.pos.y + 1),
	// 				room.getPositionAt(spawn.pos.x - 1, spawn.pos.y + 1),
	// 				room.getPositionAt(spawn.pos.x + 1, spawn.pos.y - 1),
	// 				room.getPositionAt(spawn.pos.x - 1, spawn.pos.y - 1),
	// 			];
	//
	// 			for (const corner of corners) {
	// 				if (!corner) {
	// 					continue;
	// 				}
	//
	// 				if (corner.lookFor(LOOK_STRUCTURES).length === 0 && corner.lookFor(LOOK_CONSTRUCTION_SITES).length === 0) {
	// 					handleConstructionSiteError(corner.createConstructionSite(STRUCTURE_CONTAINER));
	// 					break;
	// 				}
	// 			}
	// 		}
	//
	// 		for (const sourceId of Object.keys(room.memory.resources.energy)) {
	// 			const source = Game.getObjectById(sourceId)!;
	//
	// 			// const path = buildRoad(spawn.pos, source.pos);
	// 			const path = room.findPath(spawn.pos, source.pos, findPathOpts).slice(0, -1);
	//
	// 			const hasContainer =
	// 				source.pos.findInRange(FIND_STRUCTURES, 1, {
	// 					filter: s => s.structureType === STRUCTURE_CONTAINER,
	// 				}).length !== 0
	// 				|| source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
	// 					filter: s => s.structureType === STRUCTURE_CONTAINER,
	// 				}).length !== 0;
	//
	// 			if (!hasContainer) {
	// 				const containerPos = path[path.length - 1];
	//
	// 				handleConstructionSiteError(room.createConstructionSite(
	// 					room.getPositionAt(containerPos.x, containerPos.y)!,
	// 					STRUCTURE_CONTAINER,
	// 				));
	// 			}
	// 		}
	// 	}
	// }

	for (const sourceId of Object.keys(room.memory.resources.energy)) {
		const source = Game.getObjectById(sourceId)!;
		const hasContainer =
			source.pos.findInRange(FIND_STRUCTURES, 1, {
				filter: s => s.structureType === STRUCTURE_CONTAINER,
			}).length !== 0
			|| source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
				filter: s => s.structureType === STRUCTURE_CONTAINER,
			}).length !== 0;

		if (!hasContainer) {
			const sourcePos = room.storage || room.find(FIND_MY_SPAWNS).pop();
			if (sourcePos) {
				const containerPos = room.findPath(source.pos, sourcePos.pos, {
					ignoreCreeps: true,
					ignoreRoads: false,
				})[0];

				const err = room.createConstructionSite(
					room.getPositionAt(containerPos.x, containerPos.y)!,
					STRUCTURE_CONTAINER,
				);

				switch (err) {
					case OK:
						break;
					default:
						throw new UnhandledError(err);
				}
			}
		}
	}
}

export default roomConstruction;
