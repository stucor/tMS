const path = require('path')
const fs = require('fs')

let outputHTML =``


function buildBook (bookID) {

let html =``
let metaData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'meta.json'))


// Authors
const authors = metaData.Authors;
let authorShortname = ``;
for (i in authors) {
    let author = require(path.join(__dirname, '..', '_resources', 'author-data', authors[i], 'bio.json'));
    authorShortname += author.ShortName ;
    if (authors.length > 1) {
        if ((authors.length >= 2) && (authors.length - 1 != i)) {
            authorShortname += ', '
        }
        if (authors.length -2 == i) {
            authorShortname = authorShortname.substring(0, authorShortname.length - 2)
            authorShortname += ' and '

        }
    }
}

// Site-wide
const siteName = 'Wisdom & Wonders Books'
const installationDirectory = 'https://wiswo.org/books/'

// Site-wide Icons
const iconsFolder = '../_resources/images/icons/'
const siteLogoURL = `${iconsFolder}logo.png`
const homeButtonURL = `${iconsFolder}bookshelf-colour.svg`
const searchButtonURL = `${iconsFolder}search.svg`
const infoButtonURL = `${iconsFolder}info.svg`
const settingsButtonURL = `${iconsFolder}settings.svg`
const downloadButtonURL = `${iconsFolder}download.svg`


const bookURL = installationDirectory + bookID
const bookFullURL = bookURL + '/index.html'

const mainCSS = '../css/reader.css'
const suttaCSS = '../css/scsutta.css'

// Title & Subtitle
const title = metaData.BookTitle
const subtitle = metaData.BookSubtitle

const shortAbstract = metaData.ShortAbstract

// Images
const frontCoverRelativeURL = `${metaData.FrontCover}`
const frontCoverfullURl =  installationDirectory + frontCoverRelativeURL.slice(3)

// Build Header
html +=`
    <!DOCTYPE html>
    <html lang=en-GB>
    <head> 
        <meta name="theme-color" content="#fff">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="${mainCSS}">
        <link rel="stylesheet" type="text/css" href="${suttaCSS}">
        <link rel="shortcut icon" type="image/x-icon"  href="${siteLogoURL}">
        <title>${title} - ${authorShortname}</title>
        <meta property="og:title" content="${title} by ${authorShortname}">
        <meta property="og:description" content="${shortAbstract}">
        <meta property="og:image" content="${frontCoverfullURl}">
        <meta property="og:url" content="${bookFullURL}">
        <meta name="twitter:card" content="${frontCoverfullURl}">
        <meta property="og:site_name" content="${siteName}">
        <meta name="twitter:image:alt" content="Book Cover">
    </head>
    <body id="thebody">

`    
// Build TOC
html += `\n\t<div id="tocnav" class="sidenav"  >
		<div id="tocbtn2" class="tocbtn, no-print" onclick="closeFromTocbtn2 ()">&#10094; Contents</div>
		<ul  id="TOC">
			<li id="TOC0" class="noshow">Engrave</li>
			<li id="TOC0-1">Title Page</li>\n`

let TOCData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'toc.json'))
for (var i in TOCData){
    html += `\t\t\t<li id="TOC${TOCData[i].tocno}">${TOCData[i].heading}</li>\n`
}
html +=
`			<li id="TOC999999999" class="noshow">TERMINATOR</li>
		</ul>	
	</div>
    `

// TopBar
html += `
	<div class="no-print" id="topbar">
		<div class="topnav" id="myTopnav">
			<div class="topnav-left">
				<a id="homebutton"><img class="bookshelfbtn" src="${homeButtonURL}" alt="The Library" title="The Library"><p>Library</p></a>
			</div>
			<div class="topnav-right">
				<a id="searchBtn"><img src="${searchButtonURL}" alt="Search"><p>Search</p></a>
				<a id="detailsBtn"><img src="${infoButtonURL}" alt="Info"><p>Info</p></a>
				<a id="settingsBtn"><img src="${settingsButtonURL}" alt="Settings"><p>Settings</p></a> 
				<a id="downloadBtn"><img src="${downloadButtonURL}" alt="Download"><p>Download</p></a>
			</div>
		</div>
		<div class="topnav2">
			<div id="tocBtn" class="tocbtn">&#10095; Contents</div>
			<div class="booktitle">${title}<br>${authorShortname}</div>
		</div>
	</div>
`
//SearchBar
html += `
	<div id="SearchBar" class ="searchbar">
		<input type="search" id="SearchInput" placeholder="Search in book ...">
		<button class="sbbutton closesearch" data-search="clear">&#10006;</button>
		<span class="resultcounter">
			<span id="searchcount"></span>
			<span id="currentresult"></span> 
			<span id="totalresults"></span>
		</span>
		<button class="sbbutton" data-search="next">&#9660;</button>
		<button class="sbbutton" data-search="prev">&#9650;</button>
		<button class="sbbutton" data-search="revert">&#8634;</button>
	</div>
`

html += `	
	<div id="Modal" class="modal hide">
		<div id="ModalContent" class="modal-content">
			<div id="ModalHeader" class="modal-header"><span id="modalCloseBtn" class="close">&times;</span>
				<div id="ModalHeaderText">
				</div>
			</div>
			<div id="ModalBody" class="modal-body">
				<div id="ModalDetails"></div>
`









    outputHTML = html
}

buildBook('milk')

fs.writeFileSync(path.join(__dirname, '.', 'newbook.html'), outputHTML)