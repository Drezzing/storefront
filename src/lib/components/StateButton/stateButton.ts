export enum ButtonState {
    Idle = "Idle",
    Updating = "Updating",
    Success = "Success",
    Fail = "Fail",
}

export type StateButtonContent = Record<keyof typeof ButtonState, string>;
