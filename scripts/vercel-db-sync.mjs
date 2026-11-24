// Vercel ÜRETİM derlemesinde veritabanı şemasını eşitler (prisma db push).
//
// - Vercel dışında (yerel, VPS) hiçbir şey yapmaz: orada `npm run db:setup` elle çalıştırılır.
// - Önizleme (preview) derlemelerinde atlanır; böylece bir dal yanlışlıkla canlı şemayı değiştirmez.
// - Veri kaybettirecek bir şema değişikliği varsa `db push` hata verir ve derleme durur (güvenli taraf).
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

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
process.exit(result.status ?? 1);
