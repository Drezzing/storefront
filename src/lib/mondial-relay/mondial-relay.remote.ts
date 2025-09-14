import type { SearchZipCodesValues } from "@frontboi/mondial-relay";
import { executeApiCall } from "@frontboi/mondial-relay/node";

import { query } from "$app/server";
import env from "$lib/env/private";
import type { SearchParcelResults, SearchZipCodeResults } from "$lib/mondial-relay/types";
import { mondialRelayParcelSearchSchema, mondialRelayPositionSearchSchema } from "$lib/schemas/mondial-relay";

const normalizeText = (str: string) => {
    return str
        .normalize("NFD") // split accented chars into base + diacritic
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/[-_]+/g, " ") // replace - and _ with spaces
        .replace(/\s+/g, " ") // collapse multiple spaces
        .trim() // remove leading/trailing spaces
        .toUpperCase(); // uppercase
};

const dedupCities = (values: SearchZipCodesValues) => {
    return Array.from(
        new Map(
            values.map((item) => [
                normalizeText(item.Ville) + item.CP,
                {
                    Ville: normalizeText(item.Ville),
                    CP: item.CP,
                    Pays: item.Pays,
                },
            ]),
        ).values(),
    );
};

export const getCityFromName = query(mondialRelayParcelSearchSchema, async ({ ville, cp }) => {
    if (ville.length === 0) return [];

    const args = {
        Enseigne: env.get("MONDIAL_RELAY_ENSEIGNE"),
        Pays: "FR",
        Ville: normalizeText(ville),
        CP: cp,
        NbResult: "15",
        PrivateKey: env.get("MONDIAN_RELAY_API1_PRIVATE_KEY"),
    };
    const results = (await executeApiCall(args, "WSI2_RechercheCP")) as SearchZipCodeResults;

    if (results.Liste === null) {
        return [];
    }

    return dedupCities(results.Liste.Commune);
});

export const getParcelFromCity = query(mondialRelayParcelSearchSchema, async ({ ville, cp }) => {
    const args = {
        Enseigne: env.get("MONDIAL_RELAY_ENSEIGNE"),
        Pays: "FR",
        Ville: normalizeText(ville),
        CP: cp,
        NombreResultats: "15",
        PrivateKey: env.get("MONDIAN_RELAY_API1_PRIVATE_KEY"),
    };

    const results = (await executeApiCall(args, "WSI4_PointRelais_Recherche")) as SearchParcelResults;
    if (results.PointsRelais === undefined) {
        return [];
    }

    return results.PointsRelais.PointRelais_Details;
});

export const getParcelFromPos = query(mondialRelayPositionSearchSchema, async ({ lat, lon }) => {
    const formatNumber = (num: number) => {
        const isNegative = num < 0;
        if (isNegative) {
            return `-${num.toFixed(7).slice(1).padStart(10, "0")}`;
        } else {
            return num.toFixed(7).padStart(10, "0");
        }
    };

    const args = {
        Enseigne: env.get("MONDIAL_RELAY_ENSEIGNE"),
        Pays: "FR",
        Latitude: formatNumber(lat),
        Longitude: formatNumber(lon),
        NombreResultats: "5",
        PrivateKey: env.get("MONDIAN_RELAY_API1_PRIVATE_KEY"),
    };

    // @ts-expect-error missing lat/lon type in lib
    const results = (await executeApiCall(args, "WSI4_PointRelais_Recherche")) as SearchParcelResults;
    if (results.PointsRelais === undefined) {
        return [];
    }

    console.log(results);

    return results.PointsRelais.PointRelais_Details;
});
