export interface IRepository<T> {
    create(data: T): Promise<T>;
    readAll(): Promise<T[]>;
    read(id: string): Promise<T | null>;
    update(id: string, data: T): Promise<T>;
    delete(id: string): Promise<void>;
}