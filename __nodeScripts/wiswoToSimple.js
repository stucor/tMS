const path = require('path')
const fs = require('fs')
const { exec } = require('child_process'); 
const { parse } = require('node-html-parser');

let bookID = process.argv.slice(2)[0];

let bookRoot = ``;
try {
    const data = fs.readFileSync('../'+bookID+'/'+'index.html', 'utf8');
    bookRoot = parse(data);
} catch (err) {
    console.error(err);
}

//Get Title and author

let newTitle = ``
let newSubtitle =``
let newAuthor =``

let allTitlePage = bookRoot.querySelectorAll('.titlepage')
for (i in allTitlePage) {
    if (i == 0) {
        newTitle = allTitlePage[i].text
    } else 
    if (i == 1)  {
        if (allTitlePage.length > 1) {
            newSubtitle = allTitlePage[i].text
        } else {
            newAuthor = allTitlePage[i].text
        }
    } else 
    if (i == 2) {
        newAuthor = allTitlePage[i].text
    }
}

//HTML
let newHeaderHTML = `<header id="title-block-header">\n<h1 class="title">${newTitle}</h1>\n<p class="subtitle">${newSubtitle}</p>\n<p class="author">${newAuthor}</p>\n</header>`


/* let allDivs = bookRoot.querySelectorAll('div')
for (i in allDivs) {
    if ((allDivs[i].id == 'topbar') || (allDivs[i].id == 'SearchBar') || (allDivs[i].id == 'tocbtn2')) {
        allDivs[i].remove()
    }
}  
 */

let allLis = bookRoot.getElementsByTagName ('li')

let newTOCHTML = `<nav id="TOC" role="doc-toc">\n<ul>\n`

for (i in allLis ) {
    if (allLis[i].classList.contains('noshow')) {
        allLis[i].remove()
    } else {
        if (allLis[i].id.substring(0,3) == 'TOC') {
            let tempTarget = allLis[i].id.substring(3, allLis[i].id.length)
            let tempText = allLis[i].text
            newTOCHTML += `<li><a href="#TOCTarget${tempTarget}" id="TOC${tempTarget}">${tempText}</a></li>\n`
        }
    }
}

//HTML
newTOCHTML += `</ul>\n</nav>`



let allSups = bookRoot.querySelectorAll('sup')
 for (i in allSups) {
    let tempText = allSups[i].text
    allSups[i].replaceWith(`href="#fn${tempText}" class="footnote-ref" id="fnref${tempText}" role="doc-noteref"><sup>${tempText}</sup></a>`)
}  


function makeNotes () {
    let allNotes = bookRoot.querySelectorAll('.booknote')
    let newNotesHTML = `<section id="footnotes" class="footnotes footnotes-end-of-document" role="doc-endnotes">\n<hr />\n<ol>\n`
    for (i in allNotes) {
        let tempInnerHTML = allNotes[i].innerHTML
        let tempNoteNumber = allNotes[i].getAttribute('data-note')
        newNotesHTML += `<li id="fn${tempNoteNumber}"><p>${tempInnerHTML}<a href="#fnref${tempNoteNumber}" class="footnote-back" role="doc-backlink">↩︎</a></p></li>\n`
    }  
    return newNotesHTML
}


//console.log(makeNotes().substring(0,2000))


let allSpans = bookRoot.querySelectorAll('span')
for (i in allSpans) {
    if (allSpans[i].classList.contains('sesame')) {
        if (allSpans[i].classList.contains('ref')) {
        } else {
            console.log ('XXX')
        }

    }
}











/* let html = bookRoot.querySelectorAll('div')
for (i in html) {
    if (i < 20) {
        console.log (html[i].outerHTML)
    } 
}
 */



//console.log(bookRoot.querySelector('#tocnav').innerHTML)