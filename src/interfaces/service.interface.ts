import { Role } from "../model/user.class";

export interface IService<T> extends IMustBePublic<T>, IMustAuthorization<T> { }

export interface IMustAuthorization<T> {
    create(data: T, role: Role): Promise<T | null>;
    update(id: string, data: T, role: Role): Promise<T | null>;
    delete(id: string, role: Role): Promise<void>;
}

export interface IMustBePublic<T> {
    readAll(): Promise<T[]>;
    read(id: string): Promise<T | null>;
}

export interface ISpecialService<T> {
    login(data: T): Promise<boolean>;
}