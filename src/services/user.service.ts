import { IRepository } from "../interfaces/repository.interface";
import { IService } from "../interfaces/service.interface";
import { Cart } from "../model/cart.class";
import { Role, User } from "../model/user.class";
import { Wallet } from "../model/wallet.class";
import { CartRepository } from "../repositories/cart.repository";
import { UserRepository } from "../repositories/user.repository";
import { WalletRepository } from "../repositories/wallet.repository";

export class UserService implements IService<User> {
    constructor(
        private userRepository: UserRepository,
        private walletRepository: WalletRepository,
        private cartRepository: CartRepository
    ) { }

    async create(data: User, role: Role): Promise<User | null> {
        if (role === "user") {
            console.log("403 Forbidden");
            return null;
        }
        const createdUser = await this.userRepository.create(data);
        if (createdUser) {
            // Tự động khởi tạo Wallet (số dư ban đầu 0) cho User vừa tạo
            const newWallet = new Wallet(undefined, createdUser.id, 0);
            await this.walletRepository.create(newWallet);

            // Tự động khởi tạo Cart (rỗng) cho User vừa tạo
            const newCart = new Cart(undefined, createdUser.id, []);
            await this.cartRepository.create(newCart);
        }
        return createdUser;
    }

    async delete(id: string, role: Role): Promise<void> {
        if (role === "user") {
            console.log("403 Forbidden");
            return;
        }
        // Xóa các dữ liệu phụ thuộc của user để đảm bảo toàn vẹn quan hệ
        const wallet = await this.walletRepository.findByUserId(id);
        if (wallet) {
            await this.walletRepository.delete(wallet.id);
        }
        const cart = await this.cartRepository.findByUserId(id);
        if (cart) {
            await this.cartRepository.delete(cart.id);
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
        if (role === "user") {
            console.log("403 Forbidden");
            return null;
        }
        return await this.userRepository.update(id, data);
    }
}