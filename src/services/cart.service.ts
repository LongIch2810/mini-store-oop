import { IService } from "../interfaces/service.interface";
import { Cart } from "../model/cart.class";
import { CartItem } from "../model/cartItem.class";
import { Role } from "../model/user.class";
import { CartRepository } from "../repositories/cart.repository";
import { CartItemRepository } from "../repositories/cartItem.repository";

export class CartService implements IService<Cart> {
    constructor(
        private cartRepository: CartRepository,
        private cartItemRepository: CartItemRepository
    ) { }

    async create(data: Cart, role: Role): Promise<Cart | null> {
        return await this.cartRepository.create(data);
    }

    async update(id: string, data: Cart, role: Role): Promise<Cart | null> {
        return await this.cartRepository.update(id, data);
    }

    async delete(id: string, role: Role): Promise<void> {
        return await this.cartRepository.delete(id);
    }

    async read(id: string): Promise<Cart | null> {
        return await this.cartRepository.read(id);
    }

    async readAll(): Promise<Cart[]> {
        return await this.cartRepository.readAll();
    }

    async getCartByUserId(userId: string): Promise<Cart | null> {
        return await this.cartRepository.findByUserId(userId);
    }

    async addItem(cartId: string, productId: string, quantity: number): Promise<Cart | null> {
        if (quantity <= 0) {
            console.log("Quantity must be greater than 0");
            return null;
        }
        const cart = await this.cartRepository.read(cartId);
        if (!cart) {
            console.log("Cart not found");
            return null;
        }

        const newItem = new CartItem(cartId, productId, quantity);
        await this.cartItemRepository.create(newItem);

        return await this.cartRepository.read(cartId);
    }

    async removeItem(cartId: string, productId: string): Promise<Cart | null> {
        const cart = await this.cartRepository.read(cartId);
        if (!cart) {
            console.log("Cart not found");
            return null;
        }

        await this.cartItemRepository.delete(cartId, productId);
        return await this.cartRepository.read(cartId);
    }
}
