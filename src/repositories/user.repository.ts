import { User } from "../model/user.class";
import { IRepository } from "../interfaces/repository.interface";
import { writeFile, readFile } from "node:fs/promises";

export class UserRepository implements IRepository<User> {
    private readonly filePath = "./data/users.json";

    private toInstance(raw: any): User {
        return new User(raw.id, raw.name, raw.email, raw.password, raw.role);
    }

    private toRaw(user: User): any {
        return {
            id: user.id,
            name: user.getName(),
            email: user.getEmail(),
            password: user.getPassword(),
            role: user.getRole()
        };
    }

    private async readRawData(): Promise<any[]> {
        try {
            const content = await readFile(this.filePath, "utf-8");
            return JSON.parse(content);
        } catch {
            return [];
        }
    }

    private async writeRawData(data: any[]): Promise<void> {
        await writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }

    async create(data: User): Promise<User> {
        const users = await this.readRawData();
        users.push(this.toRaw(data));
        await this.writeRawData(users);
        return data;
    }

    async delete(id: string): Promise<void> {
        const users = await this.readRawData();
        const usersFilter = users.filter((u: any) => u.id !== id);
        await this.writeRawData(usersFilter);
    }

    async read(id: string): Promise<User | null> {
        const users = await this.readRawData();
        const user = users.find((u: any) => u.id === id);
        return user ? this.toInstance(user) : null;
    }

    async readAll(): Promise<User[]> {
        const users = await this.readRawData();
        return users.map((u: any) => this.toInstance(u));
    }

    async update(id: string, data: User): Promise<User> {
        const users = await this.readRawData();
        const usersFilter = users.map((u: any) => (u.id === id ? this.toRaw(data) : u));
        await this.writeRawData(usersFilter);
        return data;
    }
}