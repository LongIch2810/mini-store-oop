import { Product } from "../model/product.class";
import { IRepository } from "../interfaces/repository.interface";
import { writeFile, readFile } from "node:fs/promises";

export class ProductRepository implements IRepository<Product> {
    private readonly filePath = "./data/products.json";

    private toInstance(raw: any): Product {
        return new Product(raw.id, raw.name, raw.price, raw.stock);
    }

    private toRaw(product: Product): any {
        return {
            id: product.id,
            name: product.getName(),
            price: product.getPrice(),
            stock: product.getStock()
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

    async create(data: Product): Promise<Product> {
        const products = await this.readRawData();
        products.push(this.toRaw(data));
        await this.writeRawData(products);
        return data;
    }

    async delete(id: string): Promise<void> {
        const products = await this.readRawData();
        const filtered = products.filter((p: any) => p.id !== id);
        await this.writeRawData(filtered);
    }

    async read(id: string): Promise<Product | null> {
        const products = await this.readRawData();
        const found = products.find((p: any) => p.id === id);
        return found ? this.toInstance(found) : null;
    }

    async readAll(): Promise<Product[]> {
        const products = await this.readRawData();
        return products.map((p: any) => this.toInstance(p));
    }

    async update(id: string, data: Product): Promise<Product> {
        const products = await this.readRawData();
        const updated = products.map((p: any) => (p.id === id ? this.toRaw(data) : p));
        await this.writeRawData(updated);
        return data;
    }
}
