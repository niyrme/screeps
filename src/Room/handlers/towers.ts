const getTowers = (room: Room): Array<StructureTower> => room.find(FIND_MY_STRUCTURES, {
	filter: s => s.structureType === STRUCTURE_TOWER,
});

function towersDefend(room: Room): boolean {
	if (room.memory.attackTargets.length !== 0) {
		let idx = 0;
		for (; idx < room.memory.attackTargets.length; idx++) {
			const creep = Game.getObjectById(room.memory.attackTargets[idx]);
			if (creep?.pos.roomName === room.name) {
				break;
			}
		}

		if (idx !== 0) {
			room.memory.attackTargets.splice(0, idx);
		}

		if (room.memory.attackTargets.length === 0) { return false; }

		const creep = Game.getObjectById(room.memory.attackTargets[0])!;

		getTowers(room).forEach(tower => tower.attack(creep));
		return true;
	} else {
		return false;
	}
}

function towersHeal(room: Room): boolean {
	const creeps = room.find(FIND_MY_CREEPS, {
		filter: c => c.hits < c.hitsMax,
	});

	let creep: Creep;
	if (creeps.length === 0) {
		return false;
	} else if (creeps.length === 1) {
		[creep] = creeps;
	} else {
		creep = creeps.reduce((weakest, current) => current.hits < weakest.hits ? current : weakest);
	}

	getTowers(room).forEach(tower => tower.heal(creep));
	return true;
}

function towersRepair(room: Room): boolean {
	const { ramparts, rest } = room.getDamagedStructures({
		walls: false,
		ramparts: true,
		rest: true,
	});

	let target: null | Exclude<AnyStructure, StructureWall> = null;
	if (rest.length !== 0) {
		target = rest.reduce(function (weakest, current) {
			if ((current.hitsMax - current.hits) < (weakest.hitsMax - weakest.hits)) {
				return current;
			} else {
				return weakest;
			}
		});
	} else if (ramparts.length !== 0) {
		const r = ramparts.filter(rampart => rampart.hits < 300000 && ((rampart.hits / rampart.hitsMax) < 0.4));
		if (r.length !== 0) {
			target = r.reduce((weakest, current) => current.hits < weakest.hits ? current : weakest);
		}
	}

	if (target) {
		getTowers(room).forEach(tower => tower.repair(target!));
		return true;
	} else {
		return false;
	}
}

export function roomHandlerTowers(room: Room) {
	towersDefend(room)
	|| towersHeal(room)
	|| towersRepair(room);
}