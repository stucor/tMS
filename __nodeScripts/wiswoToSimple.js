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
        allTitlePage[i].replaceWith(`<h1 class='noshow'>Title Page</h1><div class=titlepage-title>${newTitle}</div>`)
    } else 
    if (i == 1)  {
        if (allTitlePage.length > 1) {
            newSubtitle = allTitlePage[i].text
            allTitlePage[i].replaceWith(`<div class=titlepage-subtitle>${newSubtitle}</div>`)
        } else {
            newAuthor = allTitlePage[i].text
            allTitlePage[i].replaceWith(`<div class=titlepage-author>${newAuthor}</div>`)
        }
    } else 
    if (i == 2) {
        newAuthor = allTitlePage[i].text
        allTitlePage[i].replaceWith(`<div class=titlepage-author>${newAuthor}</div>`)
    }
}
//HTML
let newHeaderHTML = `<header id="title-block-header">\n<h1 class="title">${newTitle}</h1>\n<p class="subtitle">${newSubtitle}</p>\n<p class="author">${newAuthor}</p>\n</header>\n`

//Get TOC
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

//Get Notes
let allNotes = bookRoot.querySelectorAll('.booknote')
let newNotesHTML = `<section id="footnotes" class="footnotes footnotes-end-of-document" role="doc-endnotes">\n<h1>Notes</h1>\n`
for (i in allNotes) {
    let tempInnerHTML = allNotes[i].innerHTML
    let tempNoteNumber = allNotes[i].getAttribute('data-note')
    newNotesHTML += `<div id="fn${tempNoteNumber}"><a href="#fnref${tempNoteNumber}" class="footnote-back" role="doc-backlink"><sup>${tempNoteNumber}</sup></a>${tempInnerHTML}</div>\n`
}  
//HTML
newNotesHTML += `\n</section>`

// Reformat sups
let allSups = bookRoot.querySelectorAll('sup')
 for (i in allSups) {
    let tempText = allSups[i].text
    allSups[i].replaceWith(`<a href="#fn${tempText}" class="footnote-ref" id="fnref${tempText}" role="doc-noteref"><sup>${tempText}</sup></a>`)
}  

//Remove end-of-book
let eobDiv = bookRoot.querySelectorAll('.eob')
eobDiv[0].remove()

let terminator = bookRoot.querySelector('#TOCTarget999999999')
terminator.remove()

//Make anchors explicit
let allAnchors = bookRoot.querySelectorAll('a')
for (i in allAnchors) {
    if ((allAnchors[i].getAttribute('href')) && (!(allAnchors[i].classList.contains('refpdf'))) ) {
        if (allAnchors[i].getAttribute('href').substring(0,3) == '../') {
            if (allAnchors[i].classList.contains('library')) {
                allAnchors[i].innerHTML = ' on theMettāShelf'
            }
            let tempHref = allAnchors[i].getAttribute('href').substring(3, allAnchors[i].getAttribute('href').length)
            allAnchors[i].setAttribute('href',`https://wiswo.org/books/${tempHref}`)
        } else
        if (allAnchors[i].getAttribute('href').substring(0,2) == './') {
            if (allAnchors[i].getAttribute('href').slice(-3) == 'jpg') {
                let newImageHTML = allAnchors[i].innerHTML.replace(`./`,`../../../${bookID}/`)
                allAnchors[i].replaceWith(newImageHTML);
            }
        }
    }
}

let allNoShows = bookRoot.querySelectorAll('.noshow')
for (i in allNoShows) {
    if (allNoShows[i].tagName == 'CAPTION') {
        allNoShows[i].remove()
    }
}

//Change the bibliography and other references to divs and add ids
let allDls = bookRoot.querySelectorAll('.references')
for (i in allDls) {
    tempRefInner = allDls[i].innerHTML
    refRoot = parse(tempRefInner)
    let allDts = refRoot.querySelectorAll('dt')
    let allDds = refRoot.querySelectorAll('dd')
    for (j in allDts) {
        let tempDt = allDts[j].text
        allDts[j].remove();
        if (tempDt) {
            allDds[j].innerHTML += ` [${tempDt}]`
            allDds[j].setAttribute('id', `bibref-${tempDt}`)

        }
        allDds[j].tagName = 'div';
    }

    allDls[i].innerHTML = refRoot.innerHTML;
    allDls[i].tagName = 'div'

}

//make sesame refs hrefs



// Now build the HTML
let html = `<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta name="author" content="${newAuthor}" />

<title>${newTitle}</title>
</head>
<body>`

//html += newHeaderHTML
//html += newTOCHTML

html += bookRoot.querySelector('#thebook').innerHTML

html += newNotesHTML
html += `\n</body>\n</html>`

fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'simple.html'), html, 'utf8')
















/* let allDivs = bookRoot.querySelectorAll('div')
for (i in allDivs) {
    if ((allDivs[i].id == 'topbar') || (allDivs[i].id == 'SearchBar') || (allDivs[i].id == 'tocbtn2')) {
        allDivs[i].remove()
    }
}  
 */


/* let html2 = bookRoot.querySelectorAll('p')
for (i in html2) {
    if (i < 2000) {
        console.log (html2[i].outerHTML)
    } 
} */



/* 
    let allDivs = bookRoot.querySelectorAll('div')
    for (i in allDivs) {
        if (allDivs[i].id == 'thebook') {
            console.log(allDivs[i].innerHTML)
        }
    }   */

       // console.log(bookRoot.querySelector('#thebook').innerHTML)

