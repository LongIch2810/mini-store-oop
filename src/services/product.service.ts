import { IService } from "../interfaces/service.interface";
import { Product } from "../model/product.class";
import { Role } from "../model/user.class";
import { ProductRepository } from "../repositories/product.repository";

export class ProductService implements IService<Product> {
    constructor(private productRepository: ProductRepository) { }

    async create(data: Product, role: Role): Promise<Product | null> {
        if (role === "user") {
            console.log("403 Forbidden");
            return null;
        }
        return await this.productRepository.create(data);
    }

    async update(id: string, data: Product, role: Role): Promise<Product | null> {
        if (role === "user") {
            console.log("403 Forbidden");
            return null;
        }
        return await this.productRepository.update(id, data);
    }

    async delete(id: string, role: Role): Promise<void> {
        if (role === "user") {
            console.log("403 Forbidden");
            return;
        }
        return await this.productRepository.delete(id);
    }

    async read(id: string): Promise<Product | null> {
        return await this.productRepository.read(id);
    }

    async readAll(): Promise<Product[]> {
        return await this.productRepository.readAll();
    }
}
