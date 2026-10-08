import { CartItem } from "../model/cartItem.class";
import { writeFile, readFile } from "node:fs/promises";

export class CartItemRepository {
    private readonly filePath = "./data/cartitem.json";

    private toInstance(raw: any): CartItem {
        return new CartItem(raw.cartId, raw.productId, raw.quantity);
    }

    private toRaw(item: CartItem): any {
        return {
            cartId: item.cartId,
            productId: item.productId,
            quantity: item.getQuantity()
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

    async readAll(): Promise<CartItem[]> {
        const items = await this.readRawData();
        return items.map((i: any) => this.toInstance(i));
    }

    async findByCartId(cartId: string): Promise<CartItem[]> {
        const items = await this.readRawData();
        return items
            .filter((i: any) => i.cartId === cartId)
            .map((i: any) => this.toInstance(i));
    }

    async create(data: CartItem): Promise<CartItem> {
        const items = await this.readRawData();
        const existingIndex = items.findIndex(
            (i: any) => i.cartId === data.cartId && i.productId === data.productId
        );
        if (existingIndex >= 0) {
            items[existingIndex].quantity += data.getQuantity();
        } else {
            items.push(this.toRaw(data));
        }
        await this.writeRawData(items);
        return data;
    }

    async update(data: CartItem): Promise<CartItem> {
        const items = await this.readRawData();
        const updated = items.map((i: any) =>
            i.cartId === data.cartId && i.productId === data.productId ? this.toRaw(data) : i
        );
        await this.writeRawData(updated);
        return data;
    }

    async delete(cartId: string, productId: string): Promise<void> {
        const items = await this.readRawData();
        const filtered = items.filter(
            (i: any) => !(i.cartId === cartId && i.productId === productId)
        );
        await this.writeRawData(filtered);
    }

    async deleteByCartId(cartId: string): Promise<void> {
        const items = await this.readRawData();
        const filtered = items.filter((i: any) => i.cartId !== cartId);
        await this.writeRawData(filtered);
    }
}
