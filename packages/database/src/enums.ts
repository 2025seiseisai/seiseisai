export * from "./generated/prisma/enums";

export enum UpdateResult {
    Success,
    Invalid,
    NoChange,
    NotFound,
    Overwrite,
    NameExists,
}
