import assert from 'node:assert/strict';
import fs from 'node:fs';

const feature=fs.readFileSync(new URL('../assets/stainher-vehicle-expiry-alerts-r18.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../assets/stainher-v1524-hp-loader-r72.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(feature,/__STAINHER_VEHICLE_EXPIRY_VERSION__==='R109'/);
assert.match(feature,/function wrapStandaloneVehicleRenderer\(\)/);
assert.match(feature,/window\.renderStandaloneVehiculos=wrapped/);
assert.match(feature,/const byPlate=new Map/);
assert.match(feature,/function wrapVehicleModal\(\)/);
assert.match(feature,/name="control_gases_vence"/);
assert.match(feature,/v1520CanEdit\?\.\('vehiculos'\)/);
assert.match(feature,/\['control_gases_vence','Control de gases','💨'\]/);
assert.match(feature,/StainherVehicleExpiryR109/);

assert.match(loader,/__STAINHER_HP_LOADER_VERSION__==='R110'/);
assert.match(loader,/function refreshVehicleExpiryR109\(\)/);
assert.match(loader,/__STAINHER_VEHICLE_EXPIRY_VERSION__!=='R109'/);
assert.match(loader,/stainher-vehicle-expiry-alerts-r18\.js/);
assert.match(loader,/StainherVehicleExpiryR109\?\.install\?\.\(\)/);
assert.match(loader,/stainher:vehicle-expiry-r109-ready/);
assert.match(index,/file==='stainher-vehicle-expiry-alerts-r18\.js'\?'20260924-r109-vehicle-control-gases'/);

console.log('vehicle-control-gases-r109: ok');
