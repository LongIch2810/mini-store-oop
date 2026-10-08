import { Cart } from "../model/cart.class";
import { IRepository } from "../interfaces/repository.interface";
import { CartItemRepository } from "./cartItem.repository";
import { writeFile, readFile } from "node:fs/promises";

export class CartRepository implements IRepository<Cart> {
    private readonly filePath = "./data/carts.json";

    constructor(private cartItemRepo: CartItemRepository) { }

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

    async create(data: Cart): Promise<Cart> {
        const carts = await this.readRawData();
        carts.push({ id: data.id, userId: data.userId });
        await this.writeRawData(carts);

        if (data.items && data.items.length > 0) {
            for (const item of data.items) {
                await this.cartItemRepo.create(item);
            }
        }
        return data;
    }

    async delete(id: string): Promise<void> {
        const carts = await this.readRawData();
        const filtered = carts.filter((c: any) => c.id !== id);
        await this.writeRawData(filtered);
        await this.cartItemRepo.deleteByCartId(id);
    }

    async read(id: string): Promise<Cart | null> {
        const carts = await this.readRawData();
        const found = carts.find((c: any) => c.id === id);
        if (!found) return null;

        const items = await this.cartItemRepo.findByCartId(found.id);
        return new Cart(found.id, found.userId, items);
    }

    async readAll(): Promise<Cart[]> {
        const carts = await this.readRawData();
        const allItems = await this.cartItemRepo.readAll();

        return carts.map((c: any) => {
            const items = allItems.filter((i) => i.cartId === c.id);
            return new Cart(c.id, c.userId, items);
        });
    }

    async update(id: string, data: Cart): Promise<Cart> {
        const carts = await this.readRawData();
        const updated = carts.map((c: any) =>
            c.id === id ? { id: data.id, userId: data.userId } : c
        );
        await this.writeRawData(updated);
        return data;
    }

    async findByUserId(userId: string): Promise<Cart | null> {
        const carts = await this.readRawData();
        const found = carts.find((c: any) => c.userId === userId);
        if (!found) return null;

        const items = await this.cartItemRepo.findByCartId(found.id);
        return new Cart(found.id, found.userId, items);
    }
}
