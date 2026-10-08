import { IService } from "../interfaces/service.interface";
import { Role } from "../model/user.class";
import { Wallet } from "../model/wallet.class";
import { WalletRepository } from "../repositories/wallet.repository";

export class WalletService implements IService<Wallet> {
    constructor(private walletRepository: WalletRepository) { }

    async create(data: Wallet, role: Role): Promise<Wallet | null> {
        if (role === "user") {
            console.log("403 Forbidden");
            return null;
        }
        return await this.walletRepository.create(data);
    }

    async update(id: string, data: Wallet, role: Role): Promise<Wallet | null> {
        if (role === "user") {
            console.log("403 Forbidden");
            return null;
        }
        return await this.walletRepository.update(id, data);
    }

    async delete(id: string, role: Role): Promise<void> {
        if (role === "user") {
            console.log("403 Forbidden");
            return;
        }
        return await this.walletRepository.delete(id);
    }

    async read(id: string): Promise<Wallet | null> {
        return await this.walletRepository.read(id);
    }

    async readAll(): Promise<Wallet[]> {
        return await this.walletRepository.readAll();
    }

    async getWalletByUserId(userId: string): Promise<Wallet | null> {
        return await this.walletRepository.findByUserId(userId);
    }

    async save(wallet: Wallet): Promise<Wallet> {
        return await this.walletRepository.update(wallet.id, wallet);
    }

    async deposit(target: string | Wallet, amount: number): Promise<Wallet | null> {
        const wallet = target instanceof Wallet ? target : await this.walletRepository.read(target);
        if (!wallet) {
            console.log("Wallet not found");
            return null;
        }
        // Thao tác trực tiếp trên domain method của đối tượng Wallet
        wallet.deposit(amount);
        // Lưu đối tượng Wallet đã thay đổi trạng thái
        return await this.walletRepository.update(wallet.id, wallet);
    }

    async withdraw(target: string | Wallet, amount: number): Promise<Wallet | null> {
        const wallet = target instanceof Wallet ? target : await this.walletRepository.read(target);
        if (!wallet) {
            console.log("Wallet not found");
            return null;
        }
        // Thao tác trực tiếp trên domain method của đối tượng Wallet
        wallet.withdraw(amount);
        // Lưu đối tượng Wallet đã thay đổi trạng thái
        return await this.walletRepository.update(wallet.id, wallet);
    }
}
