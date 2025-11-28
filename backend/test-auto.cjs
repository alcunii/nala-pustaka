require('dotenv').config({ path: './.env' });
const advancedResearchService = require('./src/services/advancedResearchService');
const fs = require('fs');

const TESTS = [
  {ms:[{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'},{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'}],q:'Bagaimana kepemimpinan yang bijaksana dijelaskan?',cat:'Kepemimpinan'},
  {ms:[{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'},{id:'87f71fad-9643-4094-a940-4e98fe60ffb9',title:'Babad Pajang',author:'Anonim'}],q:'Apa kriteria pemimpin ideal?',cat:'Kepemimpinan'},
  {ms:[{id:'18a93590-a700-4c75-ba6a-8ed9a4f3f76f',title:'Babad Mataram',author:'Dirjaatmaja'},{id:'8610d5e7-e986-42ca-a7be-e83a726688ed',title:'Babad Kraton',author:'British Library'}],q:'Bagaimana hubungan pemimpin dengan rakyat?',cat:'Kepemimpinan'},
  {ms:[{id:'be2d6244-d1f6-481f-a988-57f468a1ef35',title:'Babad Sultanan',author:'British Library'},{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'}],q:'Bagaimana legitimasi kekuasaan dijelaskan?',cat:'Kepemimpinan'},
  {ms:[{id:'f648b65c-ceed-4427-8d01-0b9667a7d805',title:'Babad Pakualaman',author:'Leiden Uni'},{id:'1b405c84-2e90-466e-a9e8-30d612d6f1db',title:'Babad Mangir',author:'Suradipura'}],q:'Apa prinsip pengambilan keputusan pemimpin?',cat:'Kepemimpinan'},
  {ms:[{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'},{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'R.M. Candranagara'}],q:'Bagaimana kejujuran diajarkan?',cat:'Moral'},
  {ms:[{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'},{id:'8e3fc5b9-8ec3-44b2-879a-752fc29c9bf2',title:'Jaka Nastapa',author:'Banyak Penulis'}],q:'Apa ajaran tentang kesetiaan?',cat:'Moral'},
  {ms:[{id:'18a93590-a700-4c75-ba6a-8ed9a4f3f76f',title:'Babad Mataram',author:'Dirjaatmaja'},{id:'87f71fad-9643-4094-a940-4e98fe60ffb9',title:'Babad Pajang',author:'Anonim'}],q:'Bagaimana kesabaran dijelaskan?',cat:'Moral'},
  {ms:[{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'},{id:'8e3fc5b9-8ec3-44b2-879a-752fc29c9bf2',title:'Jaka Nastapa',author:'Banyak Penulis'}],q:'Nilai-nilai utama apa yang ditekankan?',cat:'Moral'},
  {ms:[{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'},{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'}],q:'Bagaimana kebajikan diajarkan?',cat:'Moral'},
  {ms:[{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'},{id:'18a93590-a700-4c75-ba6a-8ed9a4f3f76f',title:'Babad Mataram',author:'Dirjaatmaja'}],q:'Bagaimana hubungan guru-murid dijelaskan?',cat:'Sosial'},
  {ms:[{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'},{id:'8e3fc5b9-8ec3-44b2-879a-752fc29c9bf2',title:'Jaka Nastapa',author:'Banyak Penulis'}],q:'Ajaran menghormati orang tua?',cat:'Sosial'},
  {ms:[{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'},{id:'be2d6244-d1f6-481f-a988-57f468a1ef35',title:'Babad Sultanan',author:'British Library'}],q:'Bagaimana konsep persahabatan?',cat:'Sosial'},
  {ms:[{id:'18a93590-a700-4c75-ba6a-8ed9a4f3f76f',title:'Babad Mataram',author:'Dirjaatmaja'},{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'}],q:'Apa peran keluarga?',cat:'Sosial'},
  {ms:[{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'},{id:'87f71fad-9643-4094-a940-4e98fe60ffb9',title:'Babad Pajang',author:'Anonim'}],q:'Bagaimana etika pergaulan sosial?',cat:'Sosial'},
  {ms:[{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'},{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'}],q:'Bagaimana kebijaksanaan menghadapi kesulitan?',cat:'Kebijaksanaan'},
  {ms:[{id:'18a93590-a700-4c75-ba6a-8ed9a4f3f76f',title:'Babad Mataram',author:'Dirjaatmaja'},{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'}],q:'Ajaran kesederhanaan hidup?',cat:'Kebijaksanaan'},
  {ms:[{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'},{id:'8e3fc5b9-8ec3-44b2-879a-752fc29c9bf2',title:'Jaka Nastapa',author:'Banyak Penulis'}],q:'Bagaimana kerendahan hati diajarkan?',cat:'Kebijaksanaan'},
  {ms:[{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'},{id:'87f71fad-9643-4094-a940-4e98fe60ffb9',title:'Babad Pajang',author:'Anonim'}],q:'Konsep keseimbangan hidup?',cat:'Kebijaksanaan'},
  {ms:[{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'},{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'}],q:'Cara mencapai ketenangan batin?',cat:'Kebijaksanaan'},
  {ms:[{id:'be2d6244-d1f6-481f-a988-57f468a1ef35',title:'Babad Sultanan',author:'British Library'},{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'}],q:'Bagaimana perang dijelaskan?',cat:'Kepemimpinan'},
  {ms:[{id:'18a93590-a700-4c75-ba6a-8ed9a4f3f76f',title:'Babad Mataram',author:'Dirjaatmaja'},{id:'8610d5e7-e986-42ca-a7be-e83a726688ed',title:'Babad Kraton',author:'British Library'}],q:'Tanggung jawab pemimpin?',cat:'Kepemimpinan'},
  {ms:[{id:'361f7e39-8179-469b-8704-cc6133ff7b8f',title:'Cariyos Purwalelana',author:'Candranagara'},{id:'67c4c7dc-71d5-48ef-b932-6b9953a552b5',title:'Babad Dêmak',author:'Dewabrata'}],q:'Bagaimana keadilan dijelaskan?',cat:'Moral'},
  {ms:[{id:'9fa31f6f-2c84-44fb-bbd5-340f157ccc8f',title:'Babad Jawi',author:'British Library'},{id:'be2d6244-d1f6-481f-a988-57f468a1ef35',title:'Babad Sultanan',author:'British Library'}],q:'Konsep kerajaan dan pemerintahan?',cat:'Kepemimpinan'},
  {ms:[{id:'8e3fc5b9-8ec3-44b2-879a-752fc29c9bf2',title:'Jaka Nastapa',author:'Banyak Penulis'},{id:'207f5691-d031-4a54-87d1-5e53309b7660',title:'Jayalêngkara Wulang',author:'Trunawisêstra'}],q:'Ajaran pendidikan moral?',cat:'Moral'}
];

const check=(r)=>r?.results?.executiveSummary?.length>100&&r.results.similarities?.length>0&&r.results.differences?.length>0&&!r.results.executiveSummary.toLowerCase().includes('tidak ada informasi');

(async()=>{
const ok=[];let n=0;
console.log('🔬 Auto-Testing 20 Cases\n');
for(const t of TESTS){
if(ok.length>=20)break;n++;
console.log(`[${n}] ${t.cat}: ${t.q.substr(0,50)}...`);
try{
const r=await advancedResearchService.conductMultiManuscriptResearch(t.ms,t.q);
if(check(r)){console.log('✅ OK');ok.push({t,r});}else{console.log('❌ NO');}
await new Promise(r=>setTimeout(r,2000));
}catch(e){console.log(`❌ ERR: ${e.message}`);}
console.log(`Progress: ${ok.length}/20\n`);
}
let md=`# ${ok.length} Successful Cases\n\n`;
ok.forEach((x,i)=>{
md+=`## Test ${i+1}: ${x.t.cat}\n**Q:** ${x.t.q}\n**M:** ${x.t.ms[0].title} + ${x.t.ms[1].title}\n\n### Summary:\n${x.r.results.executiveSummary}\n\n### Similarities (${x.r.results.similarities.length}):\n`;
x.r.results.similarities.forEach((s,j)=>md+=`${j+1}. ${s.description||s}\n`);
md+=`\n### Differences (${x.r.results.differences.length}):\n`;
x.r.results.differences.forEach((d,j)=>md+=`${j+1}. ${d.description||d}\n`);
md+=`\n---\n\n`;
});
fs.writeFileSync('../SUCCESSFUL_TEST_CASES.md',md);
console.log(`\n✅ Found ${ok.length}/20 successful`);
console.log('📄 Saved to: SUCCESSFUL_TEST_CASES.md');
})();

