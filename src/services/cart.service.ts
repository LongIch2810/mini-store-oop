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

    async save(cart: Cart): Promise<Cart> {
        return await this.cartRepository.update(cart.id, cart);
    }

    async addItem(arg1: string | CartItem, arg2?: string, arg3?: number): Promise<Cart | null> {
        let cartId: string;
        let item: CartItem;

        if (arg1 instanceof CartItem) {
            item = arg1;
            cartId = item.cartId;
        } else {
            cartId = arg1;
            const productId = arg2!;
            const quantity = arg3!;
            item = new CartItem(cartId, productId, quantity);
        }

        const cart = await this.cartRepository.read(cartId);
        if (!cart) {
            console.log("Cart not found");
            return null;
        }

        // 1. Thao tác thêm vào chính đối tượng Cart
        cart.addItem(item);

        // 2. Lưu đối tượng CartItem và Cart thông qua repository
        await this.cartItemRepository.create(item);
        await this.cartRepository.update(cart.id, cart);

        return cart;
    }

    async removeItem(cartId: string, productId: string): Promise<Cart | null> {
        const cart = await this.cartRepository.read(cartId);
        if (!cart) {
            console.log("Cart not found");
            return null;
        }

        // 1. Thao tác xóa trên chính đối tượng Cart
        cart.removeItem(productId);

        // 2. Lưu trạng thái cập nhật xuống repository
        await this.cartItemRepository.delete(cartId, productId);
        await this.cartRepository.update(cart.id, cart);

        return cart;
    }
}
