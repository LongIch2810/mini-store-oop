import { randomUUID } from "node:crypto";

export class Product {
    readonly id: string;

    constructor(
        id: string = randomUUID(),
        private name: string,
        private price: number,
        private stock: number
    ) {
        this.id = (!id || id.trim().length === 0) ? randomUUID() : id;
        this.validateName(name);
        this.validatePrice(price);
        this.validateStock(stock);
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error("Product name cannot be empty");
        }
    }

    private validatePrice(price: number): void {
        if (typeof price !== "number" || isNaN(price) || price <= 0) {
            throw new Error("Product price must be a positive number");
        }
    }

    private validateStock(stock: number): void {
        if (typeof stock !== "number" || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
            throw new Error("Product stock must be a non-negative integer");
        }
    }

    getName(): string {
        return this.name;
    }

    getPrice(): number {
        return this.price;
    }

    setName(name: string): void {
        this.validateName(name);
        this.name = name;
    }

    setPrice(price: number): void {
        this.validatePrice(price);
        this.price = price;
    }

    getStock(): number {
        return this.stock;
    }

    setStock(stock: number): void {
        this.validateStock(stock);
        this.stock = stock;
    }

    increaseStock(quantity: number): void {
        if (typeof quantity !== "number" || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
            throw new Error("Quantity to increase must be a positive integer");
        }
        this.stock += quantity;
    }

    decreaseStock(quantity: number): void {
        if (typeof quantity !== "number" || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
            throw new Error("Quantity to decrease must be a positive integer");
        }
        if (this.stock >= quantity) {
            this.stock -= quantity;
        } else {
            console.log("Insufficient stock");
            throw new Error("Insufficient stock");
        }
    }
}