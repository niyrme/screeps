import { NotImplementedError } from "Utils";
import type { ActionCreep } from "./types";

export namespace ActionTravel {
	interface Step {}

	export function execute(creep: ActionCreep): ScreepsReturnCode {
		const {} = creep.memory._actionSteps[0] as Step;
		throw new NotImplementedError(`ActionTravel.execute(${creep})`);
	}
}
