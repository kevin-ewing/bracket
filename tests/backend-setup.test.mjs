import test from 'node:test';
import assert from 'node:assert/strict';
import {backendReadiness} from '../scripts/check-backend.mjs';
const config = 'ALLOWED_ORIGIN = "https://kevin-ewing.github.io"\ndatabase_id = "01234567-89ab-cdef-0123-456789abcdef"';
const secrets = {CLOUDFLARE_API_TOKEN:'test-token',CLOUDFLARE_ACCOUNT_ID:'test-account'};
test('Optional backend only deploys after all required configuration is supplied',()=>{
 assert.deepEqual(backendReadiness(config,secrets),{ready:true,missing:[]});
 for(const setup of [config.replace('01234567-89ab-cdef-0123-456789abcdef','REPLACE_WITH_YOUR_D1_DATABASE_ID'),config.replace('kevin-ewing','YOUR-USERNAME'),config.replace('github.io','github.io/bracket/'),config.replace('https:','http:')])assert.equal(backendReadiness(setup,secrets).ready,false);
 const absent=backendReadiness(config,{});assert.equal(absent.ready,false);assert.equal(absent.missing.length,2);
 assert.ok(!JSON.stringify(backendReadiness(config,{CLOUDFLARE_API_TOKEN:'sensitive-value'})).includes('sensitive-value'));
});
