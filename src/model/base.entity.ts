import { randomUUID } from "node:crypto";

export abstract class BaseEntity {
    readonly id: string;

    constructor(id: string = randomUUID()) {
        this.id = (!id || id.trim().length === 0) ? randomUUID() : id;
    }
}
