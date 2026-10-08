import { Wallet } from "../model/wallet.class";
import { IRepository } from "../interfaces/repository.interface";
import { writeFile, readFile } from "node:fs/promises";

export class WalletRepository implements IRepository<Wallet> {
    private readonly filePath = "./data/wallets.json";

    private toInstance(raw: any): Wallet {
        return new Wallet(raw.id, raw.userId, raw.balance);
    }

    private toRaw(wallet: Wallet): any {
        return {
            id: wallet.id,
            userId: wallet.userId,
            balance: wallet.getBalance()
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

    async create(data: Wallet): Promise<Wallet> {
        const wallets = await this.readRawData();
        wallets.push(this.toRaw(data));
        await this.writeRawData(wallets);
        return data;
    }

    async delete(id: string): Promise<void> {
        const wallets = await this.readRawData();
        const filtered = wallets.filter((w: any) => w.id !== id);
        await this.writeRawData(filtered);
    }

    async read(id: string): Promise<Wallet | null> {
        const wallets = await this.readRawData();
        const found = wallets.find((w: any) => w.id === id);
        return found ? this.toInstance(found) : null;
    }

    async readAll(): Promise<Wallet[]> {
        const wallets = await this.readRawData();
        return wallets.map((w: any) => this.toInstance(w));
    }

    async update(id: string, data: Wallet): Promise<Wallet> {
        const wallets = await this.readRawData();
        const updated = wallets.map((w: any) => (w.id === id ? this.toRaw(data) : w));
        await this.writeRawData(updated);
        return data;
    }

    async findByUserId(userId: string): Promise<Wallet | null> {
        const wallets = await this.readRawData();
        const found = wallets.find((w: any) => w.userId === userId);
        return found ? this.toInstance(found) : null;
    }
}
