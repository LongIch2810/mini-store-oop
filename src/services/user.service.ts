import { IRepository } from "../interfaces/repository.interface";
import { IService } from "../interfaces/service.interface";
import { Role, User } from "../model/user.class";
import { UserRepository } from "../repositories/user.repository";

export class UserService implements IService<User> {
    constructor(private userRepository: UserRepository) { }
    async create(data: User, role: Role): Promise<User | null> {
        if (role == "user") {
            console.log("403 Forbidden");
            return null;
        }
        return await this.userRepository.create(data);
    }
    async delete(id: string, role: Role): Promise<void> {
        if (role == "user") {
            console.log("403 Forbidden");
            return;
        }
        return await this.userRepository.delete(id);
    }
    async read(id: string): Promise<User | null> {
        return await this.userRepository.read(id);
    }
    async readAll(): Promise<User[]> {
        return await this.userRepository.readAll();
    }
    async update(id: string, data: User, role: Role): Promise<User | null> {
        if (role == "user") {
            console.log("403 Forbidden");
            return null;
        }
        return await this.userRepository.update(id, data);
    }
}