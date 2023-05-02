import elasticlunr from 'elasticlunr';
import fs from 'fs';
import AdmZip from 'adm-zip';
import stemmer from './lunr.stemmer.support.js';
stemmer(elasticlunr);
import lunr_ja from './lunr.ja.js';
lunr_ja(elasticlunr);
import lunr_multi from './lunr.multi.js';
lunr_multi(elasticlunr);

const index = elasticlunr(function () {
  //  this.use(elasticlunr.ja);
    this.use(elasticlunr.multiLanguage('en', 'ja'));
  
    this.addField('title');
    this.addField('body');
    this.setRef('id');
    this.saveDocument(false);
  });
  
  const doc1 = {
  "id": 1,
  "title": "Oracle released its latest database Oracle 12g",
  "body": "Yestaday Oracle has released its new database Oracle 12g, this would make more money for this company and lead to a nice profit report of annual year."
}

const doc2 = {
  "id": 2,
  "title": "Oracle released its profit report of 2015",
  "body": "As expected, Oracle released its profit report of 2015, during the good sales of database and hardware, Oracle's profit of 2015 reached 12.5 Billion."
}

index.addDoc(doc1);
index.addDoc(doc2);

// 文書追加
index.addDoc({
  "id": 3,
  "body": "カメラ　犬"
});
index.addDoc({
  "id": 4,
  "body": "本棚　猫"
});
index.addDoc({
  "id": 5,
  "body": "水　刺身　本マグロ"
});


const result = index.search("Oracle database", {
  fields: {
      body: {boost: 2},
  }
});
console.log(result);
// 日本語で検索
const result2 = index.search("本", {
  fields: {
      body: {boost: 1},
  },
  expand: true,
});

console.log(result2);

fs.writeFile('lunr-index.json', JSON.stringify(index), (err)=>{
  if(err){
    console.log('write file error')
    throw err
  }else{
    console.log('success')
  }
});

// creating archives
var zip = new AdmZip();

// add file directly
var content = "inner content of the file";
zip.addFile("index.txt", Buffer.from(JSON.stringify(index), "utf8"), "index of lunr");
// write everything to disk
zip.writeZip("lunr-index.zip");


// reading archives
var zip = new AdmZip("lunr-index.zip");
var zipEntries = zip.getEntries(); // an array of ZipEntry records

let newIndex;
zipEntries.forEach(function (zipEntry) {
    if (zipEntry.entryName == "index.txt") {
        newIndex = zipEntry.getData().toString("utf8");
        console.log(newIndex);
    }
});


const index2 = elasticlunr.Index.load(JSON.parse(newIndex));
// index2.use(elasticlunr.multiLanguage('en', 'ja'));
// index2.saveDocument(false);

// 日本語で検索
const result3 = index2.search("本", {
  fields: {
      body: {boost: 1},
  },
  expand: true,
});

console.log(result3);
