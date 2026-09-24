import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../assets/stainher-v1524-reliability-contract-r108.js',import.meta.url),'utf8');
const V11_DEFAULTS={confiabilidad:{contrato:'ninguno'}};
const V1523_DEFAULTS={confiabilidad:{contrato:'ver'}};
const window={state:{profile:{rol:'confiabilidad',permisos:{contrato:'ninguno'}}},addEventListener(){},applyPermissionsV11(){this.applied=true}};

vm.runInContext(source,vm.createContext({window,V11_DEFAULTS,V1523_DEFAULTS,console}));
assert.equal(V11_DEFAULTS.confiabilidad.contrato,'editar');
assert.equal(V1523_DEFAULTS.confiabilidad.contrato,'editar');
assert.equal(window.state.profile.permisos.contrato,'editar');
assert.equal(window.applied,true);

console.log('reliability-contract-access-r108: ok');
