export class CartItem {
    constructor(
        readonly cartId: string,
        readonly productId: string,
        private quantity: number
    ) {
        if (!cartId || cartId.trim().length === 0) {
            throw new Error("Cart ID cannot be empty");
        }
        if (!productId || productId.trim().length === 0) {
            throw new Error("Product ID cannot be empty");
        }
        this.validateQuantity(quantity);
    }

    private validateQuantity(quantity: number): void {
        if (typeof quantity !== "number" || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
            throw new Error("Quantity must be a positive integer");
        }
    }

    getQuantity(): number {
        return this.quantity;
    }

    setQuantity(quantity: number): void {
        this.validateQuantity(quantity);
        this.quantity = quantity;
    }
}