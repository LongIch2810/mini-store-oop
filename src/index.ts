import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { UserRepository } from "./repositories/user.repository";
import { ProductRepository } from "./repositories/product.repository";
import { WalletRepository } from "./repositories/wallet.repository";
import { CartRepository } from "./repositories/cart.repository";
import { CartItemRepository } from "./repositories/cartItem.repository";

import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { ProductService } from "./services/product.service";
import { WalletService } from "./services/wallet.service";
import { CartService } from "./services/cart.service";

import { User } from "./model/user.class";
import { Product } from "./model/product.class";

// Khởi tạo các Repository và Service
const userRepo = new UserRepository();
const walletRepo = new WalletRepository();
const prodRepo = new ProductRepository();
const cartItemRepo = new CartItemRepository();
const cartRepo = new CartRepository(cartItemRepo);

const authService = new AuthService(userRepo);
const userService = new UserService(userRepo, walletRepo, cartRepo);
const prodService = new ProductService(prodRepo);
const walletService = new WalletService(walletRepo);
const cartService = new CartService(cartRepo, cartItemRepo);

const rl = readline.createInterface({ input, output });

// Tiện ích hiển thị
function formatVND(amount: number): string {
    return amount.toLocaleString("vi-VN") + " VNĐ";
}

async function pressEnterToContinue(): Promise<void> {
    await rl.question("\n[Nhấn Enter để tiếp tục...]");
}

// ==========================================
// 1. MENU QUẢN TRỊ VIÊN (ADMIN)
// ==========================================
async function adminMenu(admin: User): Promise<void> {
    while (true) {
        console.clear();
        console.log("============================================================");
        console.log("                MENU QUẢN TRỊ VIÊN (ADMIN)                 ");
        console.log(` Quản trị viên: ${admin.getName()} | Email: ${admin.getEmail()}`);
        console.log("============================================================");
        console.log(" [1] Xem danh sách tất cả sản phẩm");
        console.log(" [2] Thêm sản phẩm mới");
        console.log(" [3] Cập nhật giá & số lượng tồn kho sản phẩm");
        console.log(" [4] Xóa sản phẩm");
        console.log(" [5] Xem danh sách người dùng");
        console.log(" [6] Tạo tài khoản người dùng mới (Tự động cấp Ví & Giỏ)");
        console.log(" [7] Xem tất cả giỏ hàng trong hệ thống");
        console.log(" [8] Nạp tiền vào ví của người dùng");
        console.log(" [0] Đăng xuất (Logout)");
        console.log("============================================================");

        const choice = (await rl.question(" Nhập lựa chọn của bạn: ")).trim();

        if (choice === "0") {
            console.log("\n-> Đang đăng xuất khỏi quyền quản trị...");
            break;
        }

        switch (choice) {
            case "1": {
                console.log("\n--- DANH SÁCH TẤT CẢ SẢN PHẨM ---");
                const products = await prodService.readAll();
                if (products.length === 0) {
                    console.log("Hiện chưa có sản phẩm nào trong hệ thống.");
                } else {
                    console.log(`Tìm thấy ${products.length} sản phẩm:\n`);
                    products.forEach((p, index) => {
                        console.log(
                            ` ${index + 1}. [${p.id}] ${p.getName()} | Giá: ${formatVND(p.getPrice())} | Tồn kho: ${p.getStock()}`
                        );
                    });
                }
                await pressEnterToContinue();
                break;
            }

            case "2": {
                console.log("\n--- THÊM SẢN PHẨM MỚI ---");
                try {
                    const name = (await rl.question(" Nhập tên sản phẩm: ")).trim();
                    const priceStr = (await rl.question(" Nhập giá bán (VNĐ): ")).trim();
                    const stockStr = (await rl.question(" Nhập số lượng tồn kho: ")).trim();

                    const price = Number(priceStr);
                    const stock = Number(stockStr);

                    const newProduct = new Product(undefined, name, price, stock);
                    const created = await prodService.create(newProduct, "admin");
                    if (created) {
                        console.log(`\n-> Thêm sản phẩm thành công!`);
                        console.log(`   ID: ${created.id} | Tên: ${created.getName()} | Giá: ${formatVND(created.getPrice())}`);
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "3": {
                console.log("\n--- CẬP NHẬT SẢN PHẨM ---");
                try {
                    const id = (await rl.question(" Nhập ID sản phẩm cần cập nhật: ")).trim();
                    const product = await prodService.read(id);
                    if (!product) {
                        console.log("Không tìm thấy sản phẩm với ID trên.");
                    } else {
                        console.log(`Sản phẩm hiện tại: ${product.getName()} | Giá: ${formatVND(product.getPrice())} | Kho: ${product.getStock()}`);
                        const newPriceStr = (await rl.question(" Nhập giá mới (Bỏ trống để giữ nguyên): ")).trim();
                        const newStockStr = (await rl.question(" Nhập tồn kho mới (Bỏ trống để giữ nguyên): ")).trim();

                        if (newPriceStr) {
                            product.setPrice(Number(newPriceStr));
                        }
                        if (newStockStr) {
                            product.setStock(Number(newStockStr));
                        }

                        await prodService.update(id, product, "admin");
                        console.log("\n-> Cập nhật sản phẩm thành công!");
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "4": {
                console.log("\n--- XÓA SẢN PHẨM ---");
                try {
                    const id = (await rl.question(" Nhập ID sản phẩm cần xóa: ")).trim();
                    const product = await prodService.read(id);
                    if (!product) {
                        console.log("Không tìm thấy sản phẩm.");
                    } else {
                        const confirm = (await rl.question(`Bạn có chắc chắn muốn xóa sản phẩm "${product.getName()}"? (y/n): `)).trim().toLowerCase();
                        if (confirm === "y") {
                            await prodService.delete(id, "admin");
                            console.log("\n-> Xóa sản phẩm thành công!");
                        } else {
                            console.log("Đã hủy thao tác xóa.");
                        }
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "5": {
                console.log("\n--- DANH SÁCH NGƯỜI DÙNG TRONG HỆ THỐNG ---");
                const users = await userService.readAll();
                console.log(`Tổng cộng: ${users.length} tài khoản:\n`);
                users.forEach((u, idx) => {
                    console.log(` ${idx + 1}. [${u.id}] ${u.getName()} (${u.getEmail()}) - Vai trò: ${u.getRole()}`);
                });
                await pressEnterToContinue();
                break;
            }

            case "6": {
                console.log("\n--- TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI ---");
                try {
                    const name = (await rl.question(" Nhập họ và tên: ")).trim();
                    const email = (await rl.question(" Nhập email: ")).trim();
                    const password = (await rl.question(" Nhập mật khẩu (tối thiểu 6 ký tự): ")).trim();
                    const roleInput = (await rl.question(" Nhập vai trò (admin/user): ")).trim().toLowerCase();
                    const role = roleInput === "admin" ? "admin" : "user";

                    const newUser = new User(undefined, name, email, password, role);
                    const created = await userService.create(newUser, "admin");
                    if (created) {
                        console.log(`\n-> Tạo tài khoản thành công!`);
                        console.log(`   ID: ${created.id} | Email: ${created.getEmail()} | Role: ${created.getRole()}`);
                        console.log(`   (Hệ thống đã tự động cấp Ví số dư 0đ và Giỏ hàng cá nhân)`);
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "7": {
                console.log("\n--- DANH SÁCH GIỎ HÀNG HỆ THỐNG ---");
                const carts = await cartService.readAll();
                console.log(`Tổng số giỏ hàng: ${carts.length}\n`);
                for (const c of carts) {
                    const user = await userRepo.read(c.userId);
                    const userName = user ? user.getName() : "Không rõ";
                    console.log(` • Giỏ hàng [${c.id}] của người dùng: ${userName} (${c.userId}) - Số mục hàng: ${c.items.length}`);
                    if (c.items.length > 0) {
                        for (const item of c.items) {
                            const p = await prodRepo.read(item.productId);
                            const pName = p ? p.getName() : item.productId;
                            console.log(`     - [${item.productId}] ${pName} x ${item.getQuantity()}`);
                        }
                    }
                }
                await pressEnterToContinue();
                break;
            }

            case "8": {
                console.log("\n--- NẠP TIỀN VÀO VÍ NGƯỜI DÙNG ---");
                try {
                    const userId = (await rl.question(" Nhập User ID của người dùng: ")).trim();
                    const wallet = await walletService.getWalletByUserId(userId);
                    if (!wallet) {
                        console.log("Không tìm thấy ví của người dùng này!");
                    } else {
                        console.log(`Ví hiện tại [${wallet.id}] có số dư: ${formatVND(wallet.getBalance())}`);
                        const amountStr = (await rl.question(" Nhập số tiền muốn nạp (VNĐ): ")).trim();
                        const amount = Number(amountStr);
                        const updated = await walletService.deposit(wallet.id, amount);
                        if (updated) {
                            console.log(`\n-> Nạp tiền thành công! Số dư mới: ${formatVND(updated.getBalance())}`);
                        }
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            default:
                console.log("\nLựa chọn không hợp lệ. Vui lòng thử lại!");
                await pressEnterToContinue();
        }
    }
}

// ==========================================
// 2. MENU KHÁCH HÀNG (USER)
// ==========================================
async function userMenu(currentUser: User): Promise<void> {
    while (true) {
        console.clear();
        console.log("============================================================");
        console.log("                   MENU KHÁCH HÀNG (USER)                   ");
        console.log(` Khách hàng: ${currentUser.getName()} | Email: ${currentUser.getEmail()}`);
        console.log("============================================================");
        console.log(" [1] Xem danh mục sản phẩm (còn hàng)");
        console.log(" [2] Xem giỏ hàng của tôi");
        console.log(" [3] Thêm sản phẩm vào giỏ hàng");
        console.log(" [4] Xóa sản phẩm khỏi giỏ hàng");
        console.log(" [5] Xem số dư ví tiền");
        console.log(" [6] Nạp tiền vào ví");
        console.log(" [7] Rút tiền từ ví");
        console.log(" [8] Thanh toán giỏ hàng (Checkout)");
        console.log(" [9] Xem thông tin tài khoản");
        console.log(" [0] Đăng xuất (Logout)");
        console.log("============================================================");

        const choice = (await rl.question(" Nhập lựa chọn của bạn: ")).trim();

        if (choice === "0") {
            console.log("\n-> Đang đăng xuất khỏi tài khoản...");
            break;
        }

        switch (choice) {
            case "1": {
                console.log("\n--- DANH MỤC SẢN PHẨM CÒN HÀNG ---");
                const products = await prodService.readAll();
                const available = products.filter((p) => p.getStock() > 0);
                if (available.length === 0) {
                    console.log("Hiện tại tất cả sản phẩm đều đã hết hàng.");
                } else {
                    available.forEach((p, idx) => {
                        console.log(
                            ` ${idx + 1}. [${p.id}] ${p.getName()} | Giá: ${formatVND(p.getPrice())} | Tồn kho: ${p.getStock()}`
                        );
                    });
                }
                await pressEnterToContinue();
                break;
            }

            case "2": {
                console.log("\n--- GIỎ HÀNG CỦA BẠN ---");
                const cart = await cartService.getCartByUserId(currentUser.id);
                if (!cart || cart.items.length === 0) {
                    console.log("Giỏ hàng của bạn đang trống.");
                } else {
                    let totalAmount = 0;
                    console.log(`Giỏ hàng ID: ${cart.id}\n`);
                    for (let i = 0; i < cart.items.length; i++) {
                        const item = cart.items[i];
                        const prod = await prodService.read(item.productId);
                        const pName = prod ? prod.getName() : "Không tìm thấy";
                        const pPrice = prod ? prod.getPrice() : 0;
                        const subTotal = pPrice * item.getQuantity();
                        totalAmount += subTotal;

                        console.log(
                            ` ${i + 1}. [${item.productId}] ${pName}\n    Số lượng: ${item.getQuantity()} x ${formatVND(pPrice)} = ${formatVND(subTotal)}`
                        );
                    }
                    console.log("------------------------------------------------------------");
                    console.log(` TỔNG TIỀN TẠM TÍNH: ${formatVND(totalAmount)}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "3": {
                console.log("\n--- THÊM SẢN PHẨM VÀO GIỎ HÀNG ---");
                try {
                    const cart = await cartService.getCartByUserId(currentUser.id);
                    if (!cart) {
                        console.log("Không tìm thấy giỏ hàng của bạn!");
                    } else {
                        const productId = (await rl.question(" Nhập ID sản phẩm muốn mua: ")).trim();
                        const product = await prodService.read(productId);
                        if (!product) {
                            console.log("Sản phẩm không tồn tại!");
                        } else if (product.getStock() <= 0) {
                            console.log(`Sản phẩm "${product.getName()}" hiện đã hết hàng!`);
                        } else {
                            console.log(`Sản phẩm: ${product.getName()} | Giá: ${formatVND(product.getPrice())} | Tồn kho: ${product.getStock()}`);
                            const qtyStr = (await rl.question(" Nhập số lượng muốn thêm: ")).trim();
                            const quantity = Number(qtyStr);

                            if (isNaN(quantity) || quantity <= 0) {
                                console.log("Số lượng phải là số nguyên dương!");
                            } else if (quantity > product.getStock()) {
                                console.log(`Số lượng yêu cầu (${quantity}) vượt quá số tồn kho hiện có (${product.getStock()})!`);
                            } else {
                                await cartService.addItem(cart.id, productId, quantity);
                                console.log(`\n-> Đã thêm thành công ${quantity} "${product.getName()}" vào giỏ hàng!`);
                            }
                        }
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "4": {
                console.log("\n--- XÓA SẢN PHẨM KHỎI GIỎ HÀNG ---");
                try {
                    const cart = await cartService.getCartByUserId(currentUser.id);
                    if (!cart || cart.items.length === 0) {
                        console.log("Giỏ hàng của bạn đang trống!");
                    } else {
                        const productId = (await rl.question(" Nhập ID sản phẩm cần xóa khỏi giỏ: ")).trim();
                        await cartService.removeItem(cart.id, productId);
                        console.log("\n-> Đã xóa sản phẩm khỏi giỏ hàng!");
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "5": {
                console.log("\n--- VÍ TIỀN CỦA TÔI ---");
                const wallet = await walletService.getWalletByUserId(currentUser.id);
                if (!wallet) {
                    console.log("Không tìm thấy ví tiền của bạn!");
                } else {
                    console.log(`ID Ví: ${wallet.id}`);
                    console.log(`Số dư khả dụng: ${formatVND(wallet.getBalance())}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "6": {
                console.log("\n--- NẠP TIỀN VÀO VÍ ---");
                try {
                    const wallet = await walletService.getWalletByUserId(currentUser.id);
                    if (!wallet) {
                        console.log("Không tìm thấy ví của bạn!");
                    } else {
                        const amountStr = (await rl.question(" Nhập số tiền muốn nạp (VNĐ): ")).trim();
                        const amount = Number(amountStr);
                        const updated = await walletService.deposit(wallet.id, amount);
                        if (updated) {
                            console.log(`\n-> Nạp tiền thành công! Số dư mới: ${formatVND(updated.getBalance())}`);
                        }
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "7": {
                console.log("\n--- RÚT TIỀN TỪ VÍ ---");
                try {
                    const wallet = await walletService.getWalletByUserId(currentUser.id);
                    if (!wallet) {
                        console.log("Không tìm thấy ví của bạn!");
                    } else {
                        console.log(`Số dư hiện tại: ${formatVND(wallet.getBalance())}`);
                        const amountStr = (await rl.question(" Nhập số tiền muốn rút (VNĐ): ")).trim();
                        const amount = Number(amountStr);
                        const updated = await walletService.withdraw(wallet.id, amount);
                        if (updated) {
                            console.log(`\n-> Rút tiền thành công! Số dư còn lại: ${formatVND(updated.getBalance())}`);
                        }
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "8": {
                console.log("\n--- THANH TOÁN GIỎ HÀNG (CHECKOUT) ---");
                try {
                    const cart = await cartService.getCartByUserId(currentUser.id);
                    if (!cart || cart.items.length === 0) {
                        console.log("Giỏ hàng của bạn đang trống, không có gì để thanh toán!");
                    } else {
                        let totalBill = 0;
                        const checkoutItems: { product: Product; quantity: number; subTotal: number }[] = [];
                        let canCheckout = true;

                        // Kiểm tra tính khả dụng của từng sản phẩm trong giỏ
                        for (const item of cart.items) {
                            const product = await prodService.read(item.productId);
                            if (!product) {
                                console.log(`Sản phẩm ID "${item.productId}" không còn tồn tại trong hệ thống.`);
                                canCheckout = false;
                                break;
                            }
                            if (product.getStock() < item.getQuantity()) {
                                console.log(
                                    `Sản phẩm "${product.getName()}" không đủ số lượng tồn kho (Yêu cầu: ${item.getQuantity()}, Còn lại: ${product.getStock()}).`
                                );
                                canCheckout = false;
                                break;
                            }
                            const subTotal = product.getPrice() * item.getQuantity();
                            totalBill += subTotal;
                            checkoutItems.push({ product, quantity: item.getQuantity(), subTotal });
                        }

                        if (!canCheckout) {
                            console.log("\n-> Không thể thanh toán do có sản phẩm không hợp lệ trong giỏ hàng.");
                        } else {
                            console.log("\nDANH SÁCH MẶT HÀNG THANH TOÁN:");
                            checkoutItems.forEach((it, i) => {
                                console.log(` ${i + 1}. ${it.product.getName()} x ${it.quantity} = ${formatVND(it.subTotal)}`);
                            });
                            console.log("------------------------------------------------------------");
                            console.log(` TỔNG TIỀN CẦN THANH TOÁN: ${formatVND(totalBill)}`);

                            const wallet = await walletService.getWalletByUserId(currentUser.id);
                            if (!wallet) {
                                console.log("Không tìm thấy ví của bạn!");
                            } else {
                                console.log(` Số dư ví hiện có: ${formatVND(wallet.getBalance())}`);
                                if (wallet.getBalance() < totalBill) {
                                    console.log(`\n-> Số dư ví không đủ! Cần nạp thêm: ${formatVND(totalBill - wallet.getBalance())}`);
                                } else {
                                    const confirm = (await rl.question("\n Xác nhận thanh toán đơn hàng này? (y/n): ")).trim().toLowerCase();
                                    if (confirm === "y") {
                                        // 1. Trừ tiền ví
                                        await walletService.withdraw(wallet.id, totalBill);

                                        // 2. Trừ tồn kho sản phẩm
                                        for (const it of checkoutItems) {
                                            it.product.decreaseStock(it.quantity);
                                            await prodService.update(it.product.id, it.product, "admin");
                                        }

                                        // 3. Làm rỗng giỏ hàng
                                        for (const it of checkoutItems) {
                                            await cartService.removeItem(cart.id, it.product.id);
                                        }

                                        const updatedWallet = await walletService.getWalletByUserId(currentUser.id);
                                        console.log("\n============================================================");
                                        console.log("              THANH TOÁN THÀNH CÔNG!                       ");
                                        console.log(` Đã thanh toán: ${formatVND(totalBill)}`);
                                        console.log(` Số dư ví còn lại: ${formatVND(updatedWallet ? updatedWallet.getBalance() : 0)}`);
                                        console.log(" Cảm ơn quý khách đã mua sắm tại Mini Store!");
                                        console.log("============================================================");
                                    } else {
                                        console.log("Đã hủy thanh toán.");
                                    }
                                }
                            }
                        }
                    }
                } catch (err: any) {
                    console.log(`\nLỗi: ${err.message}`);
                }
                await pressEnterToContinue();
                break;
            }

            case "9": {
                console.log("\n--- THÔNG TIN TÀI KHOẢN ---");
                console.log(` Mã người dùng (ID): ${currentUser.id}`);
                console.log(` Họ và tên:         ${currentUser.getName()}`);
                console.log(` Email:             ${currentUser.getEmail()}`);
                console.log(` Vai trò hệ thống:  ${currentUser.getRole()}`);
                await pressEnterToContinue();
                break;
            }

            default:
                console.log("\nLựa chọn không hợp lệ. Vui lòng thử lại!");
                await pressEnterToContinue();
        }
    }
}

// ==========================================
// 3. VÒNG LẶP CHÍNH (MAIN LOGIN LOOP)
// ==========================================
async function main(): Promise<void> {
    while (true) {
        console.clear();
        console.log("============================================================");
        console.log("             HỆ THỐNG QUẢN LÝ BÁN HÀNG MINI STORE           ");
        console.log("               (Lập trình Hướng Đối Tượng - OOP)            ");
        console.log("============================================================");
        console.log(" Tài khoản mẫu để kiểm thử nhanh:");
        console.log("   • Admin: user1@ministore.com | Mật khẩu: password1");
        console.log("   • User:  user6@ministore.com | Mật khẩu: password6");
        console.log("------------------------------------------------------------");
        console.log(" [1] Đăng nhập");
        console.log(" [0] Thoát chương trình");
        console.log("============================================================");

        const choice = (await rl.question(" Nhập lựa chọn: ")).trim();

        if (choice === "0") {
            console.log("\nCảm ơn bạn đã sử dụng Mini Store OOP. Tạm biệt!");
            rl.close();
            break;
        }

        if (choice === "1") {
            console.log("\n--- ĐĂNG NHẬP VÀO HỆ THỐNG ---");
            const email = (await rl.question(" Email: ")).trim();
            const password = (await rl.question(" Mật khẩu: ")).trim();

            const user = await authService.authenticate({ email, password });
            if (!user) {
                console.log("\n-> Đăng nhập thất bại: Sai email hoặc mật khẩu!");
                await pressEnterToContinue();
                continue;
            }

            console.log(`\n-> Đăng nhập thành công! Chào mừng ${user.getName()} (Vai trò: ${user.getRole()})`);
            await pressEnterToContinue();

            // Phân quyền điều hướng theo vai trò Role
            if (user.getRole() === "admin") {
                await adminMenu(user);
            } else {
                await userMenu(user);
            }

            console.log("\n[Thông báo]: Bạn đã đăng xuất. Có thể đăng nhập lại bằng tài khoản khác!");
            await pressEnterToContinue();
        } else {
            console.log("\nLựa chọn không hợp lệ, vui lòng chọn lại!");
            await pressEnterToContinue();
        }
    }
}

// Khởi chạy ứng dụng
main().catch((err) => {
    console.error("Lỗi chương trình:", err);
    rl.close();
    process.exit(1);
});
