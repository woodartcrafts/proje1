// Vercel ÜRETİM derlemesinde veritabanı şemasını eşitler (prisma db push).
//
// - Vercel dışında (yerel, VPS) hiçbir şey yapmaz: orada `npm run db:setup` elle çalıştırılır.
// - Önizleme (preview) derlemelerinde atlanır; böylece bir dal yanlışlıkla canlı şemayı değiştirmez.
// - Veri kaybettirecek bir şema değişikliği varsa `db push` hata verir ve derleme durur (güvenli taraf).
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

if (!process.env.VERCEL) process.exit(0);

if (process.env.VERCEL_ENV !== "production") {
  console.log("[db-sync] Önizleme derlemesi: şema eşitleme atlandı.");
  process.exit(0);
}

// Havuzlu bağlantılar (pgbouncer) şema işlemlerinde sorun çıkarabildiği için varsa doğrudan
// adres kullanılır; uygulamanın kendisi DATABASE_URL'yi kullanmaya devam eder.
const url =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!url) {
  console.error(
    "[db-sync] DATABASE_URL tanımlı değil. Vercel > Settings > Environment Variables bölümüne PostgreSQL bağlantı adresini ekleyin.",
  );
  process.exit(1);
}

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");

console.log("[db-sync] Şema eşitleniyor (prisma db push)...");
const result = spawnSync(
  process.execPath,
  [prismaCli, "db", "push", "--skip-generate"],
  { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } },
);
if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);

// Tek seferlik: OPS_RESET_ADMIN=1 iken ilk yönetici şifresini yeniler (sonra kaldır).
const opsResetRaw = process.env.OPS_RESET_ADMIN ?? "";
const opsReset = opsResetRaw.trim();
console.log(
  `[db-sync] OPS_RESET_ADMIN=${JSON.stringify(opsResetRaw)} (trim=${JSON.stringify(opsReset)})`,
);
if (opsReset === "1" || opsReset.toLowerCase() === "true" || opsReset === "yes") {
  console.log("[db-sync] OPS_RESET_ADMIN aktif — yönetici şifresi yenileniyor...");
  const resetScript = fileURLToPath(new URL("./ops-reset-admin.mjs", import.meta.url));
  const reset = spawnSync(
    process.execPath,
    [resetScript],
    { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } },
  );
  if ((reset.status ?? 1) !== 0) process.exit(reset.status ?? 1);
}

process.exit(0);
