const fs = require('fs')


let localSesameMaster = []

try {
    const data = fs.readFileSync('../_resources/build-data/sesameMaster.json', 'utf8')
    localSesameMaster = JSON.parse(data)
} catch (err) {
    console.error(err);
}

    let sesameArr = []

    for (let i in localSesameMaster) {
        sesameArr.push (localSesameMaster[i].sesame)
    }

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

sesameArr = uniq(sesameArr)

let sortedSesameArr = []

 for (let i in sesameArr) {
    let obj = new Object();
    for (let k in localSesameMaster) {
        if (sesameArr[i] == localSesameMaster[k].sesame) {
            obj.sesame = localSesameMaster[k].sesame
            obj.key = localSesameMaster[k].key
            sortedSesameArr.push(obj)
        }
    }
}

const localJSON = JSON.stringify(sortedSesameArr, null, 2)

fs.writeFileSync(('../_resources/build-data/sesameMaster.json'), localJSON, 'utf8')

console.log('finished sorting');
