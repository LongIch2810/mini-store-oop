import { randomUUID } from "node:crypto";

export type Role = "admin" | "user";

export class User {
    readonly id: string;

    constructor(
        id: string = randomUUID(),
        private name: string,
        private email: string,
        private password: string,
        private role: Role
    ) {
        this.id = (!id || id.trim().length === 0) ? randomUUID() : id;
        this.validateName(name);
        this.validateEmail(email);
        this.validatePassword(password);
        this.validateRole(role);
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error("User name cannot be empty");
        }
    }

    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }
    }

    private validatePassword(password: string): void {
        if (!password || password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }
    }

    private validateRole(role: Role): void {
        if (role !== "admin" && role !== "user") {
            throw new Error("Role must be either 'admin' or 'user'");
        }
    }

    getName(): string {
        return this.name;
    }

    getEmail(): string {
        return this.email;
    }

    getPassword(): string {
        return this.password;
    }

    setName(name: string): void {
        this.validateName(name);
        this.name = name;
    }

    setEmail(email: string): void {
        this.validateEmail(email);
        this.email = email;
    }

    setPassword(password: string): void {
        this.validatePassword(password);
        this.password = password;
    }

    getRole(): Role {
        return this.role;
    }

    setRole(role: Role): void {
        this.validateRole(role);
        this.role = role;
    }
}