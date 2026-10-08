import { randomUUID } from "node:crypto";

export class Wallet {
    readonly id: string;

    constructor(
        id: string = randomUUID(),
        readonly userId: string,
        private balance: number
    ) {
        this.id = (!id || id.trim().length === 0) ? randomUUID() : id;
        if (!userId || userId.trim().length === 0) {
            throw new Error("User ID cannot be empty");
        }
        this.validateBalance(balance);
    }

    private validateBalance(balance: number): void {
        if (typeof balance !== "number" || isNaN(balance) || balance < 0) {
            throw new Error("Wallet balance cannot be negative");
        }
    }

    getBalance(): number {
        return this.balance;
    }

    setBalance(balance: number): void {
        this.validateBalance(balance);
        this.balance = balance;
    }

    deposit(amount: number): void {
        if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
            throw new Error("Deposit amount must be positive");
        }
        this.balance += amount;
    }

    withdraw(amount: number): void {
        if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
            throw new Error("Withdraw amount must be positive");
        }
        if (this.balance < amount) {
            throw new Error("Insufficient funds");
        }
        this.balance -= amount;
    }
}