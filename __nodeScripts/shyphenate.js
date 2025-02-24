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
            paliWords.push (allPalis[i].innerText.replaceAll('­',''))
        }
    }
}

let paliWords = []

for (let i in allBookIds) {
    pushPali(allBookIds[i])
}

uniquePaliWords = uniq(paliWords)
for (let i in uniquePaliWords) {
    console.log(JSON.stringify(uniquePaliWords[i]))
}
console.log(uniquePaliWords.length)













/* function uniqx(a) {
    return Array.from(new Set(a));
    } */