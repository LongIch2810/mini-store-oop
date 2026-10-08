import { ISpecialService } from "../interfaces/service.interface";
import { User } from "../model/user.class";
import { UserRepository } from "../repositories/user.repository";
export type LoginRequest = {
    email: string;
    password: string;
}
export class AuthService implements ISpecialService<LoginRequest> {
    constructor(private userRepo: UserRepository) { }
    async login(data: LoginRequest): Promise<boolean> {
        const { email, password } = data;
        const users = await this.userRepo.readAll();
        const user = users.find((user: User) => user.getEmail() === email && user.getPassword() === password);
        if (user) {
            return true;
        }
        console.log("401 Unauthorized")
        return false;
    }
}