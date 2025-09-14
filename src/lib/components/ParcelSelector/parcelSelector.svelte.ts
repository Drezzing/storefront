import type { MondialRelayPointRelay } from "$lib/mondial-relay/types";
import { SvelteMap } from "svelte/reactivity";

export type LongLat = {
    lon: number;
    lat: number;
};

export class ParcelSelector {
    currPos: LongLat = $state({ lat: 45.7590854638952, lon: 3.11063876048111 });
    parcels = new SvelteMap<string, MondialRelayPointRelay>();

    addParcels(newParcels: MondialRelayPointRelay[]) {
        for (const newParcel of newParcels) {
            if (!this.parcels.has(newParcel.Num)) {
                this.parcels.set(newParcel.Num, newParcel);
            }
        }
    }

    static formatOpeningTime(openingTimeArray: string[]) {
        const timeFormat = (time: string) => {
            if (time === "") return "";
            return time.slice(0, 2) + "h" + time.slice(2);
        };
        if (openingTimeArray.length === 0) {
            return ["-", "-"];
        }
        const openingTimes: string[] = [];
        for (let i = 0; i < openingTimeArray.length; i += 2) {
            openingTimes.push(`${timeFormat(openingTimeArray[i])}-${timeFormat(openingTimeArray[i + 1])}`);
        }

        return openingTimes;
    }
}
