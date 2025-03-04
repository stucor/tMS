const fs = require('fs')

let blurbArr = []
let localSesameMaster = []

try {
    const data = fs.readFileSync('../_resources/build-data/sesameMaster.json', 'utf8')
    localSesameMaster = JSON.parse(data)
} catch (err) {
    console.error(err);
}

let suttarefArr = []

for (let i in localSesameMaster) {
    if (localSesameMaster[i].key.includes('-blurb')) {
        suttarefArr.push (localSesameMaster[i].key.split(':')[1])
    }
}

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

suttarefArr = uniq(suttarefArr)

async function scApiCall(suttaref) {

    function doSCAPI(scData) {
        let obj = new Object();
        obj.suttaRef = suttaref
        obj.rootTitle = scData[0].original_title
        obj.transTitle = scData[0].translated_title
        obj.blurb = scData[0].blurb
        obj.type = scData[0].type
        blurbArr.push(obj)
    }

    await fetch(`https://suttacentral.net/api/suttaplex/${suttaref}`)
    .then(response => response.json())
    .then (data => doSCAPI(data))
    .catch(error => {
        console.log(`${error}ERROR: Can't fetch https://suttacentral.net/api/suttaplex/${suttaref}`);
    });	
    

 }

async function sequentialCall() {
    for (let i of suttarefArr) {
        await scApiCall(i);
    }; 

    const localJSON = JSON.stringify(blurbArr, null, 2);

    fs.writeFileSync(('../_resources/sesame-data/blurbs/scblurbs.json'), localJSON, 'utf8')

    console.log('finished');
}

sequentialCall();



