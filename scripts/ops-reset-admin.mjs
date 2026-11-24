/**
 * Tek seferlik üretim şifre sıfırlama. Yalnızca OPS_RESET_ADMIN=1 iken çağrılır.
 * Kullanımdan sonra bu dosyayı ve env bayrağını kaldırın.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const password = process.env.OPS_RESET_PASSWORD?.trim() || "Pusula2026!";
if (password.length < 10) {
  console.error("[ops-reset] OPS_RESET_PASSWORD en az 10 karakter olmalı");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const hash = await bcrypt.hash(password, 10);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, take: 5 });

  if (users.length === 0) {
    const email = "admin@pusuladenge.com";
    await prisma.user.create({
      data: {
        email,
        name: "Yönetici",
        passwordHash: hash,
      },
    });
    console.log(`[ops-reset] Yeni yönetici oluşturuldu: ${email}`);
  } else {
    const user = users[0];
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash },
    });
    console.log(`[ops-reset] Şifre yenilendi: ${user.email}`);
    if (users.length > 1) {
      console.log(
        `[ops-reset] Not: ${users.length} yönetici var; yalnızca ilki güncellendi.`,
      );
    }
  }
} finally {
  await prisma.$disconnect();
}
