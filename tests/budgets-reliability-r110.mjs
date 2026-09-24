import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../assets/stainher-presupuestos-r80.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../assets/stainher-v1524-hp-loader-r72.js',import.meta.url),'utf8');
const router=fs.readFileSync(new URL('../assets/stainher-presupuestos-router-r82.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../supabase/migrations/20260924144258_share_budgets_with_reliability.sql',import.meta.url),'utf8');
const hardening=fs.readFileSync(new URL('../supabase/migrations/20260924145330_harden_budget_signature_r110.sql',import.meta.url),'utf8');

assert.match(app,/R110 · Presupuestos técnico comerciales/);
assert.match(app,/\['administrador','confiabilidad'\]\.includes\(role\(\)\)/);
assert.match(app,/role\(\)==='administrador'\|\|String\(row\?\.created_by/);
assert.match(app,/Solo el Administrador puede eliminar presupuestos/);
assert.match(app,/rpc\('presupuesto_firma_administrador_v110'\)/);
assert.match(app,/const sig=String\(signer\.imagen_png/);
assert.doesNotMatch(app,/__STAINHER_SAVED_SIGNATURE__\|\|await signature/);
assert.match(app,/window\.renderContractTab\.__r110/);
assert.match(loader,/stainher-presupuestos-runtime-r110/);
assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R112'/);
assert.match(loader,/StainherHPR110/);
assert.match(router,/R110 · Integración nativa de Presupuestos/);
assert.match(router,/\['administrador','confiabilidad'\]\.includes\(role\(\)\)/);
assert.match(router,/current\.__presupuestosR110/);

assert.match(migration,/lower\(p\.rol\) in \('administrador', 'confiabilidad'\)/);
assert.match(migration,/lower\(p\.rol\) = 'confiabilidad' and created_by = \(select auth\.uid\(\)\)/);
assert.match(migration,/security definer/);
assert.match(migration,/set search_path = ''/);
assert.match(migration,/revoke all on function public\.presupuesto_firma_administrador_v110\(\) from public/);
assert.match(migration,/grant execute on function public\.presupuesto_firma_administrador_v110\(\) to authenticated/);
assert.match(hardening,/stainher_private\.presupuesto_firma_administrador_v110/);
assert.match(hardening,/security invoker/);
assert.match(hardening,/where p\.id = \(select auth\.uid\(\)\)/);

console.log('budgets-reliability-r110: ok');
