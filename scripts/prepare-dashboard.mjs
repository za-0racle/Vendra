import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
fs.mkdirSync('supabase/dashboard',{recursive:true});
const shared=['supabase/functions/_shared/orders.js','supabase/functions/_shared/http.ts'].map(path=>fs.readFileSync(path,'utf8').replace(/^\uFEFF/,'')).join('\n\n');
for(const name of ['place-order','admin-orders']){
 const entry=fs.readFileSync(`supabase/functions/${name}/index.ts`,'utf8').replace(/^\uFEFF/,'').replace(/^import .*;\r?\n/gm,'');
 const code='// Generated dashboard copy. Paste the entire file into Supabase index.ts.\n// Regenerate with: npm run prepare:dashboard\n'+(shared+'\n\n'+entry).replace(/^export /gm,'');
 new vm.Script(stripTypeScriptTypes(code));
 fs.writeFileSync(`supabase/dashboard/${name}.ts`,code);
 console.log(`Prepared supabase/dashboard/${name}.ts (standalone; syntax checked)`);
}
