import { ISpecialService } from "../interfaces/service.interface";
import { User } from "../model/user.class";
import { UserRepository } from "../repositories/user.repository";

export type LoginRequest = {
    email: string;
    password: string;
};

export class AuthService implements ISpecialService<LoginRequest> {
    constructor(private userRepo: UserRepository) { }

    async login(data: LoginRequest): Promise<boolean> {
        const user = await this.authenticate(data);
        return user !== null;
    }

    async authenticate(data: LoginRequest): Promise<User | null> {
        const { email, password } = data;
        const users = await this.userRepo.readAll();
        const user = users.find(
            (u: User) => u.getEmail() === email && u.getPassword() === password
        );
        if (user) {
            return user;
        }
        console.log("401 Unauthorized");
        return null;
    }
}