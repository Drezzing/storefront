import type { SearchPointRelayValues, SearchZipCodesValues } from "@frontboi/mondial-relay";

export type SearchZipCodeResults = {
    STAT: string;
    Liste: {
        Commune: SearchZipCodesValues;
    } | null;
};

export type SearchParcelResults = {
    STAT: string;
    PointsRelais:
        | {
              PointRelais_Details: MondialRelayPointRelay[];
          }
        | undefined;
};

export type MondialRelayPointRelay = Omit<
    SearchPointRelayValues[0],
    | "Horaires_Lundi"
    | "Horaires_Mardi"
    | "Horaires_Mercredi"
    | "Horaires_Jeudi"
    | "Horaires_Vendredi"
    | "Horaires_Samedi"
    | "Horaires_Dimanche"
> & {
    Horaires_Lundi: { string: string[] };
    Horaires_Mardi: { string: string[] };
    Horaires_Mercredi: { string: string[] };
    Horaires_Jeudi: { string: string[] };
    Horaires_Vendredi: { string: string[] };
    Horaires_Samedi: { string: string[] };
    Horaires_Dimanche: { string: string[] };
};
