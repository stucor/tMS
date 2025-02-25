const fs = require('fs')
//const { exec } = require('child_process'); 
const { parse } = require('node-html-parser');

//let bookID = process.argv.slice(2)[0];

let allBookIds =  ["afcm","bcbl","doab","journey","milk","sitm","vasy","wosb"]

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

function pushPali (bookID) {
    let bookRoot =``
    try {
        const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'pandoc.html', 'utf8')
        bookRoot = parse(data)
    } catch (err) {
        console.error(err);
    }
    let allPalis = bookRoot.querySelectorAll("span[data-custom-style='wwc-pali']")
    for (let i in allPalis) {
        if (allPalis[i].innerText.length > 7 ) {
            paliWords.push (allPalis[i].innerText)//.replaceAll('­',''))
        }
/*         if (allPalis[i].innerText.slice(0,4) == 'brah') {
            console.log(`${allPalis[i].innerText} :: ${bookID}`)
        } */
    }
}

let paliWords = []

for (let i in allBookIds) {
    pushPali(allBookIds[i])
}

uniquePaliWords = uniq(paliWords)

let localShyphenMaster =[]
try {
    const data = fs.readFileSync('../_resources/build-data/shyphenMaster.json', 'utf8')
    localShyphenMaster = JSON.parse(data)
} catch (err) {
    console.error(err);
}

//console.log (localShyphenMaster)

for (let i in uniquePaliWords) {
    for (j in localShyphenMaster) {
        if (uniquePaliWords[i] == localShyphenMaster[j].replaceAll('-','')) {
            uniquePaliWords[i] = localShyphenMaster[j]
        }
    }

}
//console.log(uniquePaliWords.length)

let localJSON = `[\n`
for (let i in uniquePaliWords) {
    localJSON += `"${uniquePaliWords[i]}"`
    if (uniquePaliWords.length-1 == i) {
        localJSON += `\n`
    } else {
        localJSON += `, \n`
    }
}
localJSON += `]`

fs.writeFileSync(('../_resources/build-data/shyphenMaster.json'), localJSON, 'utf8')












/* function uniqx(a) {
    return Array.from(new Set(a));
    } */