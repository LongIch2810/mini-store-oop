import { randomUUID } from "node:crypto";
import { BaseEntity } from "./base.entity";
import { CartItem } from "./cartItem.class";

export class Cart extends BaseEntity {
    constructor(
        id: string = randomUUID(),
        readonly userId: string,
        public items: CartItem[] = []
    ) {
        super(id);
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID cannot be empty");
        }
        if (!Array.isArray(items)) {
            throw new Error("Cart items must be an array");
        }
    }

    getItems(): CartItem[] {
        return this.items;
    }

    addItem(item: CartItem): void {
        if (item.cartId !== this.id) {
            throw new Error("CartItem does not belong to this cart");
        }
        const existing = this.items.find((i) => i.productId === item.productId);
        if (existing) {
            existing.setQuantity(existing.getQuantity() + item.getQuantity());
        } else {
            this.items.push(item);
        }
    }

    removeItem(productId: string): void {
        this.items = this.items.filter((i) => i.productId !== productId);
    }

    getTotalQuantity(): number {
        return this.items.reduce((total, item) => total + item.getQuantity(), 0);
    }
}
