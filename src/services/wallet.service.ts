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

    async deposit(walletId: string, amount: number): Promise<Wallet | null> {
        if (amount <= 0) {
            console.log("Deposit amount must be positive");
            return null;
        }
        const wallet = await this.walletRepository.read(walletId);
        if (!wallet) {
            console.log("Wallet not found");
            return null;
        }
        wallet.setBalance(wallet.getBalance() + amount);
        return await this.walletRepository.update(walletId, wallet);
    }

    async withdraw(walletId: string, amount: number): Promise<Wallet | null> {
        if (amount <= 0) {
            console.log("Withdraw amount must be positive");
            return null;
        }
        const wallet = await this.walletRepository.read(walletId);
        if (!wallet) {
            console.log("Wallet not found");
            return null;
        }
        if (wallet.getBalance() < amount) {
            console.log("Insufficient funds");
            return null;
        }
        wallet.setBalance(wallet.getBalance() - amount);
        return await this.walletRepository.update(walletId, wallet);
    }
}
