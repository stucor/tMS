const path = require('path')
const fs = require('fs')
const { exec } = require('child_process'); 
const { parse } = require('node-html-parser');

let bookID = process.argv.slice(2)[0];

let sesameArr = []
let sesameRefArr = []
let footnotesExist = true;

function buildSesameStub () {
	let sortedSesames = [...new Set(sesameArr)].sort()
	let localJSON = ``

	localJSON += `[\n`
	for (let i in sortedSesames) {
		localJSON += `{\n\t"sesame": "${sortedSesames[i]}",\n\t"type": "",\n\t"directory": "",\n\t"file": "",\n\t"biblio": ""\n}`
		if (i == sortedSesames.length -1) {
			localJSON += '\n]'
		} else {
			localJSON += ',\n'
		}
	}
	fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'sesameSTUB.json'), localJSON, 'utf8')
	console.log(`* ./book-data/${bookID}/sesameSTUB.json has been created *`);
}

function buildSesameRefStub () {
	console.log(sesameRefArr)
}

function buildBook () {
	let docxPath = `../_resources/book-data/${bookID}/${bookID}.docx`
	let pandocHtmlPath = `../_resources/book-data/${bookID}/pandoc.html`
	exec(`pandoc --from docx+styles ${docxPath} -s --toc -o ${pandocHtmlPath} --wrap=none --metadata title="Pre-processed Wiswo Book"`, 
		(error, stdout, stderr) => { 
		  if (error) { 
			console.error(`Error: ${error.message}`)
			return; 
		  } 
		  if (stderr) { 
			console.error(`stderr: ${stderr}`)
			return; 
		  } 
		  console.log(`✅✅ pandoc.html created`)
		  processPandoc()
		  buildBookIndexHTML() 
		  console.log(`✅✅ ${bookID} index.html BUILD COMPLETE *`)
		  buildSesameStub()
		  //buildSesameRefStub()
		  console.log('-----------------------------------END-----------------------------------')
		}); 
}


function buildBookIndexHTML () {

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
const shareButtonURL = `${iconsFolder}share.svg`
const searchButtonURL = `${iconsFolder}search.svg`
const infoButtonURL = `${iconsFolder}info.svg`
const settingsButtonURL = `${iconsFolder}settings.svg`
const downloadButtonURL = `${iconsFolder}download.svg`

const bookURL = installationDirectory + bookID
const bookFullURL = bookURL + '/index.html'

const uiCSS = `../_resources/css/tMSUI.css`
const bookCSS = '../_resources/css/tMSBook.css'
const bookMediaQCSS = '../_resources/css/tMSBookMediaQ.css'
const suttaCSS = '../_resources/css/scsutta.css'

// Title & Subtitle
const title = metaData.BookTitle
const subtitle = metaData.BookSubtitle

const shortAbstract = metaData.ShortAbstract

const itemType = metaData.ItemType

// Images
const frontCoverRelativeURL = `${metaData.FrontCover}`
const frontCoverfullURl =  installationDirectory + frontCoverRelativeURL.slice(3)

// Build Header
html +=`<!DOCTYPE html>
<html lang=en-GB>
<head> 
	<meta name="theme-color" content="#fff">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta charset="UTF-8">
	<link rel="stylesheet" type="text/css" href="${uiCSS}">
	<link rel="stylesheet" type="text/css" href="${bookCSS}">
	<link rel="stylesheet" type="text/css" href="${bookMediaQCSS}">
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
<body id="thebody">`    
// Build TOC
html += `
<div id="tocnav" class="sidenav">
	<div id="tocbtn2" class="tocbtn, no-print" onclick="closeFromTocbtn2 ()">&#10094; Contents</div>
	<ul id="TOC">
		<li id="TOC0" class="noshow">Engrave</li>
		<li id="TOCseg-0-1">Title Page</li>\n`

let TOCData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'TOC.json'))
for (var i in TOCData){
	if (TOCData[i].pandocHTMLID.substring(0,8)=='CHAPTER-') {
		html += `\t\t<li id="TOC${TOCData[i].tocno}">${TOCData[i].heading}</li>\n`
	} else
	if (TOCData[i].pandocHTMLID.substring(0,15)=='CHAP-SECTION-01') {
		html += `\t\t<li class='sub' id="TOC${TOCData[i].tocno}">${TOCData[i].heading}</li>\n`
	}
	if (TOCData[i].pandocHTMLID.substring(0,15)=='CHAP-SECTION-02') {
		html += `\t\t<li class='subsub' id="TOC${TOCData[i].tocno}">${TOCData[i].heading}</li>\n`
	}
}
html +=
`		<li id="TOC999999999" class="noshow">TERMINATOR</li>
	</ul>	
</div>`

// TopBar
html += `
<div class="no-print" id="topbar">
	<div class="topnav" id="myTopnav">
		<div class="topnav-left">
			<a id="homebutton"><img class="bookshelfbtn" src="${homeButtonURL}" alt="The Library" title="The Library"><p>Library</p></a>
		</div>
		<div class="topnav-right">
			<a id="searchBtn"><img src="${searchButtonURL}" alt="Search"><p>Search</p></a>
			<a id="shareBtn"><img src="${shareButtonURL}" alt="Share"><p>Share</p></a>
			<a id="detailsBtn"><img src="${infoButtonURL}" alt="Info"><p>Info</p></a>
			<a id="settingsBtn"><img src="${settingsButtonURL}" alt="Settings"><p>Settings</p></a> 
			<a id="downloadBtn"><img src="${downloadButtonURL}" alt="Download"><p>Download</p></a>
		</div>
	</div>
	<div class="topnav2">
		<div id="tocBtn" class="tocbtn">&#10095; Contents</div>
		<div class="booktitle">${title}<br>${authorShortname}</div>
		<div class="topnav2buttons"><button id="tmsindexBtn">segment:<br><span id="segcount"></span><span id="lastsegcount"</button></div>
	</div>
</div>
`
//SearchBar
html += `<div id="SearchBar" class ="searchbar">
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
</div>`

// SideBar
html += `
<div id="Modal" class="modal hide">
	<div id="ModalContent" class="modal-content">
		<div id="ModalHeader" class="modal-header"><span id="modalCloseBtn" class="close">&times;</span>
			<div id="ModalHeaderText"></div>
		</div>
		<div id="ModalBody" class="modal-body">
			<div id="ModalDetails"></div>
`
// Notes
html += `			<div id="ModalNotes">
			<h2>${title}<br>—Notes—</h2>
`


function buildFootnotes () {
	let localHTML =``
	if (footnotesExist) {
		let footnotesData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'footnotes.json'))
		for (var i in footnotesData){
			localHTML += `<div class="booknote" data-note="${footnotesData[i].fnNumber}">${footnotesData[i].fnHTML}`
			localHTML += '</div>\n'
		}
		localHTML += `<div class='endBar'>End of Notes</div>`
		return localHTML;
	} else {
		return ''
	}
}

html += buildFootnotes()



// Settings
html += `				</div>
			<div id="ModalSettings"></div>
			<div id="ModalDownload">
				<div>
					<h4>Wisdom & Wonders publications:</h4>
					<div class="downloads">`

function buildDownloadInfo () {
	let tempHTML = ''
	let metaData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'meta.json'))
	const classUnavailable = `class="unavailable"`
	const downloadsFolder = `../_resources/book-downloads/${bookID}/`
	const title = metaData.BookTitle
	const downloadHTML = metaData.DownloadHTML
	let whatsAvailable = metaData.DownloadsAvailable.split(',');

	let noFormatAvaiable = true;
	for (i in whatsAvailable) {
		[doctype, available] = whatsAvailable[i].split('=')
		if (available == 'yes') {
			noFormatAvaiable = false
			tempHTML +=`<a href="${downloadsFolder}${bookID}.${doctype}" download > <img alt="${title} ${doctype} download" src="../_resources/images/icons/${doctype}_file_icon.svg" ></a>`
		} else {
			tempHTML +=`<a ${classUnavailable} href="${downloadsFolder}${bookID}.${doctype}" download > <img alt="${title} ${doctype} download" src="../_resources/images/icons/${doctype}_file_icon.svg" ></a>`
		}
	}
	if (noFormatAvaiable) { 
		tempHTML =``
	}
	if (downloadHTML) {
		tempHTML += `<hr>${downloadHTML}`
	}
	return tempHTML
}
					
html += buildDownloadInfo()

html +=					`</div>
				</div>
			</div>
			<div id="ModalSutta"><div id="sutta"></div></div><div id="ModalAlert"></div>
			<div id="ModalSelfquote"><div id="selfquotearea"></div></div>
		</div>
	</div>
</div>
<div id="spinbox"><div id="spintext"></div></div>
`
// Book
html += `<div id="bookwrap"><div></div>
<div class="content" id="thecontent">
<h1 class="engrave" id="head-0">${title}</h1>
<p class="smallEngrave">${authorShortname}</p>
<div class="book" id="thebook" data-shortcode="${bookID}">
<h1 class="titlepage" id="seg-0-1">${title}</h1>`

if (subtitle) {
	html += `<h4 class="titlepage">${subtitle}</h4>`
}			

html += `<h2 class="titlepage">${authorShortname}</h2><hr>`

function buildBook () {
	let bookRoot = ``;
	try {
		const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'book.html', 'utf8');
		bookRoot = parse(data);
	} catch (err) {
		console.error(err);
	}
	// temp head- ids
	let TOCData = JSON.parse(fs.readFileSync('../_resources/book-data/'+bookID+'/'+'toc.json', 'utf8'))
	let chapterPrefix = `Chapter`
	if (itemType == 'document') {
		chapterPrefix = ``
	}
	let headingArr = bookRoot.querySelectorAll ('h1, h2, h3')
	for (let i in headingArr) {
		if (headingArr[i].tagName == 'H1') {
			let [number, heading] = headingArr[i].innerHTML.split('. ')
			if (heading) {
				if (number.length < 3 ) { //it's a chapter (1-99)
					headingArr[i].set_content(`<span class="chapnum">${chapterPrefix} ${number}</span><br>${heading}`)
				} else { // it's something like an appendix
					headingArr[i].set_content(`<span class="chapnum">${number.toLowerCase()}</span><br>${heading}`)
				}
			}
		}
		headingArr[i].setAttribute('id',`head-${TOCData[i].tocno}`)
	}
	// superscripts and sups 
	let suffix = ['st', 'rd', 'nd', 'th']
	let allSups = bookRoot.querySelectorAll('sup')
	for (i in allSups) {
		if (suffix.includes(allSups[i].text)) {
			let tempText = allSups[i].text
			allSups[i].replaceWith(`<span class='superscript'>${tempText}</span>`)
		}
	}

	let allAnchors = bookRoot.querySelectorAll('a')
	for (i in allAnchors) {
		if (allAnchors[i].innerHTML.substring(0, 5) == `<sup>`) {
			let tempHTML = allAnchors[i].innerHTML
			allAnchors[i].replaceWith(tempHTML)
		}
	}

	let spans = bookRoot.getElementsByTagName ('span')
	for (i in spans) {
		let dataCustomStyle = spans[i].getAttribute('data-custom-style')
		switch(dataCustomStyle) {
			case 'Footnote Characters':
				spans[i].remove()
			break
			case 'Hyperlink':
				let tempHTML = spans[i].innerHTML
				spans[i].replaceWith (tempHTML)
			break
			case 'wwc-PTS-reference':
				spans[i].innerHTML=`PTS: ${spans[i].innerHTML}`
				spans[i].classList.add('ptsref')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'wwc-list-margin':
				spans[i].classList.add('list-margin')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'wwc-sesame-zot-reference':
				spans[i].classList.add('sesame')
				spans[i].classList.add('ref')
				spans[i].removeAttribute ('data-custom-style')
				sesameRefArr.push(spans[i].text)
			break
			case 'wwc-sesame':
				spans[i].classList.add('sesame')
				spans[i].removeAttribute ('data-custom-style')
				sesameArr.push(spans[i].text)
			break
			case 'wwc-pali':
				spans[i].setAttribute('lang','pi')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'wwc-sanskrit':
				spans[i].setAttribute('lang','sa')
				spans[i].removeAttribute ('data-custom-style')
			break
			default:
		}

	}


	let anchors = bookRoot.getElementsByTagName ('a') 
	for (i in anchors) {
		let firstThree = anchors[i].text.slice(0,3)
		switch(firstThree) {
			case 'MN ':
			case 'AN ':
			case 'SN ':
			case 'DN ':
			case 'Ud ':
			case 'Cp ':
				let tempTop =  anchors[i].text.slice(0, 2)
				let tempTail = anchors[i].text.slice(3,anchors[i].text.length)
				let tempText = tempTop + '&#8239;' + tempTail
				anchors[i].replaceWith(`<span class="sclinktext">${tempText}</span>`)
			break
			case 'Dhp':
			case 'Snp':
			case 'Iti':
				let temp2Top =  anchors[i].text.slice(0, 3)
				let temp2Tail = anchors[i].text.slice(4,anchors[i].text.length)
				let temp2Text = temp2Top + '&#8239;' + temp2Tail
				anchors[i].replaceWith(`<span class="sclinktext">${temp2Text}</span>`)
			break
			case 'Tha':
			case 'Thi':
				let temp3Top =  anchors[i].text.slice(0, 4)
				let temp3Tail = anchors[i].text.slice(5,anchors[i].text.length)
				let temp3Text = temp3Top + '&#8239;' + temp3Tail
				anchors[i].replaceWith(`<span class="sclinktext">${temp3Text}</span>`)
			break
			case 'Ja ':
			case 'Kd ':
			case 'Mil':
			case 'Bu ':
				anchors[i].classList.add('extlink')
				anchors[i].classList.add('tipref')
			break
			case 'Seg':
				let temp4Text =  anchors[i].text
				anchors[i].replaceWith(`<span class="bookSegment">${temp4Text}</span>`)
			break;
			default:
				if ((anchors[i].getAttribute('href').substring(0,1) == '#') && (anchors[i].text != '↩︎')) {
 					let target = anchors[i].getAttribute('href');
					let temp4Text = anchors[i].text
					anchors[i].replaceWith(`<span class="manualLink" data-target="${target}">${temp4Text}</span>`) 
				} else {
					anchors[i].classList.add('extlink')
				}
		}
	} 
	
	// All the divs
	let allDivs = bookRoot.querySelectorAll('div') 
	for (i in allDivs) {
		// SPECIAL MESSAGE
		if (allDivs[i].getAttribute('data-custom-style') == "WW-special-message") {
			if(allDivs[i].text.replaceAll('\r\n', '') == `None`) { //remove the special message box if it says: 'None'
				allDivs[i].remove()
			} else {
				allDivs[i].classList.add(`special-message`)
				allDivs[i].removeAttribute('data-custom-style')
				allDivs[i].innerHTML = allDivs[i].innerHTML.replaceAll('<p>', '').replaceAll('</p>', '')
			}
		} else 
		// SPACE
		if (allDivs[i].getAttribute('data-custom-style') == "WW-space") {
			let spaceWidth = allDivs[i].text.replaceAll('\r\n', '')
			allDivs[i].replaceWith(`<hr style='border:0; margin-top: 0; height:${spaceWidth}em'>`)
		} else 
		// PARAGRAPHS
		if (allDivs[i].getAttribute('data-custom-style') == "WW-paragraph"){
			let tempHTML = allDivs[i].innerHTML
			allDivs[i].replaceWith(tempHTML)
		} else
		// BLOCKQUOTES
		if (allDivs[i].getAttribute('data-custom-style') == "WW-blockquote") {
			allDivs[i].tagName = "blockquote"
			allDivs[i].removeAttribute('data-custom-style')
			//OAstart class
/* 			let newHTML = ''
			let blockquoteRoot = parse(allDivs[i].innerHTML);
			let allPs = blockquoteRoot.querySelectorAll('p')
			console.log(allPs.length)

			for (let apj = 0; apj < allPs.length; apj++ ) {
				console.log (apj)
				console.log(allPs[apj].outerHTML)
				if (allPs[apj].innerHTML.charAt(0)== '“') {
					if (apj > 0) {
						newHTML += allPs[apj].outerHTML = allPs[apj].outerHTML.replace(`<p`, `<p class='OAbody' `)
					} else {
						newHTML += allPs[apj].outerHTML = allPs[apj].outerHTML.replace(`<p`, `<p class='OAstart' `)
					}
				} else {
					newHTML += allPs[apj].outerHTML
				}
			}
			allDivs[i].innerHTML = newHTML */
		} else
		// CAPTIONS -- Used in conjuction with IMAGE TABLE
 		if (allDivs[i].getAttribute('data-custom-style') == "WW-caption-centered-sans"){
			let tempHTML = allDivs[i].innerHTML
			let newHTML = tempHTML.slice(0,4) + ` class='caption-centered-sans'` + tempHTML.slice(4)
			allDivs[i].replaceWith(newHTML)
		} else
 		if (allDivs[i].getAttribute('data-custom-style') == "WW-caption-centered-serif"){
			let tempHTML = allDivs[i].innerHTML
			let newHTML = tempHTML.slice(0,4) + ` class='caption-centered-serif'` + tempHTML.slice(4)
			allDivs[i].replaceWith(newHTML)
		} else
		// VERSES - 2 types one justified to the left, one centered around the longest line
		//(line-block)
		if (allDivs[i].getAttribute('data-custom-style') == "WW-line-block") {
			let tempHTML = allDivs[i].innerHTML.replaceAll('\r\n', '') 
			let newHTML = `<blockquote><div class='line-block'>${tempHTML}</div></blockquote>`
			if (tempHTML.substr(0,29) == `<p><span class="list-margin">`) {
				//find the first closed span
				let closedSpanIndex = tempHTML.indexOf('</span>')+7
				if (tempHTML.substr(closedSpanIndex,1) == '“') {
					newHTML = `<blockquote><div class='line-block'>${tempHTML.slice(0,2)} class='OAstart' ${tempHTML.slice(2)}</div></blockquote>`
				}
			} else 
			if (tempHTML.substr(0,4) == `<p>“`) {
				newHTML = `<blockquote><div class='line-block'>${tempHTML.slice(0,2)} class='OAstart' ${tempHTML.slice(2)}</div></blockquote>`
			}
			allDivs[i].replaceWith(newHTML)
		} else
		//(line-block-centered)
		if (allDivs[i].getAttribute('data-custom-style') == "WW-line-block-center") {
			if (allDivs[i].innerHTML.charAt(5) == '“') {
				let tempHTML = allDivs[i].innerHTML.replaceAll('\r\n', '') 
				let newHTML = tempHTML.slice(0,2) + ` class='OAstart'` + tempHTML.slice(2)
				allDivs[i].innerHTML = newHTML	
			}
			allDivs[i].classList.add ('line-block-center')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "WW-tight-right-cite") {
			allDivs[i].classList.add('tight-right-cite')
			allDivs[i].removeAttribute('data-custom-style')
		} 
		//IMAGES
		if (allDivs[i].getAttribute('data-custom-style') == "WW-centered-image") {
			let [source, altText, width, border] = allDivs[i].text.split("=");
			if (border == `border\r\n`) {
				allDivs[i].classList.add ('centered-img-border')
			}
			allDivs[i].classList.add ('centered-img')
			allDivs[i].innerHTML = `<img src='${source.replace('\r\n', '')}' alt='${altText.replace('\r\n', '')}' width='${width.replace('\r\n', '')}%'>`
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "WW-epigram-image") {
			let [source, altText, width] = allDivs[i].text.split("=");
			allDivs[i].classList.add ('epigram-img')
			allDivs[i].innerHTML = `<img src='${source.replace('\r\n', '')}' alt='${altText.replace('\r\n', '')}' width=${width.replace('\r\n', '')}%>`
			allDivs[i].removeAttribute('data-custom-style')
		} else 
		//EPIGRAMS
		if (allDivs[i].getAttribute('data-custom-style') == "WW-epigram") {
			allDivs[i].classList.add ('epigram')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "WW-epigram-cite") {
			allDivs[i].classList.add ('epigram-cite')
			allDivs[i].removeAttribute('data-custom-style')
		} else 
		if (allDivs[i].getAttribute('data-custom-style') == "WW-epigram-2") {
			allDivs[i].classList.add ('epigram-2')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "WW-epigram-2-cite") {
			allDivs[i].classList.add ('epigram-2-cite')
			allDivs[i].removeAttribute('data-custom-style')
		} else 
		if (allDivs[i].getAttribute('data-custom-style') == "WW-epigram-3") {
			allDivs[i].classList.add ('epigram-3')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "WW-epigram-3-cite") {
			allDivs[i].classList.add ('epigram-3-cite')
			allDivs[i].removeAttribute('data-custom-style')
		} else 
		// GLOSSARIES
		if (allDivs[i].getAttribute('data-custom-style') == "WW-gloss-term") {
			let tempHTML = allDivs[i].innerHTML
			let newHTML = tempHTML.slice(0,4) + ` class='gloss-term'` + tempHTML.slice(4)
			allDivs[i].replaceWith(newHTML)
		} else 
		if (allDivs[i].getAttribute('data-custom-style') == "WW-gloss-text") {
			let tempHTML = allDivs[i].innerHTML
			let newHTML = tempHTML.slice(0,4) + ` class='gloss-text'` + tempHTML.slice(4)
			allDivs[i].replaceWith(newHTML)
		} else 
		if (allDivs[i].getAttribute('data-custom-style') == "WW-author-biography") {
			allDivs[i].remove()
		} else 
		if (allDivs[i].getAttribute('data-custom-style') == "WW-instruction-list") { 
			let spacerHTML = ``
			let tempHTML = allDivs[i].innerHTML
			let c = tempHTML.charAt(5)

			if (c >= '0' && c <= '9') {
				spacerHTML = `<hr class='halfspacer'>`
			}
			allDivs[i].replaceWith(`${spacerHTML}${tempHTML}`)
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "WW-instruction-list-comment") {
			allDivs[i].classList.add ('list-comment')
			allDivs[i].removeAttribute('data-custom-style')
		} 
	} 

	// Lists remove any 'start at number #'
	let allOls = bookRoot.querySelectorAll(`ol`)
	for (let i in allOls) {
		if (allOls[i].getAttribute('start')) {
			allOls[i].removeAttribute('start')
		}
	}

	// table rows
	let allTableRows = bookRoot.querySelectorAll('tr') 
	for (let i in allTableRows) {
		let newHTML = ``
		allTableRows[i].classList.remove('odd')
		allTableRows[i].classList.remove('even')
		let trRoot = parse(allTableRows[i].innerHTML)
		let thisTrTdArr = trRoot.querySelectorAll('td')
		for (let j in thisTrTdArr) { 
			if (thisTrTdArr[j].innerHTML.substring(33,37) == `head`) { //table headers
				let tempHTML = thisTrTdArr[j].innerHTML.replace(`<div data-custom-style="WW-table-header">`,``).replace(`</div>`, ``).replaceAll(`\r\n`, ``)
				newHTML += `<th>${tempHTML}</th>`
			} else 
			if (thisTrTdArr[j].innerHTML.substring(33,37) == `data`) {
				let tempHTML = thisTrTdArr[j].innerHTML.replace(`<div data-custom-style="WW-table-data">`,``).replace(`</div>`, ``).replaceAll(`\r\n`, ``)
				newHTML += `<td>${tempHTML}</td>`
			}
		}
		if (newHTML) {
			allTableRows[i].innerHTML = newHTML
		} else {
			allTableRows[i].innerHTML = allTableRows[i].innerHTML.replaceAll(`<p>`,`<p class="tablepara">`)
		}
	}

	//colgroups 
	let allColGroups = bookRoot.querySelectorAll('colgroup')
	for (i in allColGroups) {
		allColGroups[i].remove()
	}


	// table captions
	let allTablesAndCaptions = bookRoot.querySelectorAll('table, div')

	for (let i in allTablesAndCaptions) {
		if (allTablesAndCaptions[i].getAttribute('data-custom-style') == 'WW-table-caption') {
			let caption = allTablesAndCaptions[i].text.replaceAll(`\r\n`,``)
			//console.log(JSON.stringify(caption))
			var tableType = caption.substring(caption.indexOf("{") + 1, caption.indexOf("}"));
			//console.log(JSON.stringify(tableType))
			let tableClassLabel = ``
			if (tableType == `Simple`) {
				tableClassLabel = ` class="simpletable"`
				caption = caption.substr(8)
			}
			let table = allTablesAndCaptions[Number(i)+1].innerHTML.replaceAll('<tr class>','<tr>')
			allTablesAndCaptions[i].replaceWith(`<div class="tablewrap">\n<table${tableClassLabel}>\n<caption >${caption}</caption>${table}\n</table>\n</div>`)
			allTablesAndCaptions[Number(i)+1].remove()
		}
	}

	let allTables = bookRoot.querySelectorAll('table')
	for (i in allTables) {
		let eachTable = parse(allTables[i].innerHTML)
		rowTextArr = eachTable.querySelectorAll('td')
		if (rowTextArr[0].text.replaceAll(`\r\n`,``) == `IMAGE TABLE`) {
			let tempHTML = `<div class='captioned-image'>`
			for (j in rowTextArr) {
				if (j > 0) {
					tempHTML += `${rowTextArr[j].innerHTML}`
				}
			}
			tempHTML += `\n</div>`
			allTables[i].replaceWith(tempHTML)
		}
	}


	let allSegments = bookRoot.querySelectorAll('p:not(.tablepara), h1, h2, h3, .tablewrap')
	let hcounter = 1
	for (let i in allSegments) {
		if (allSegments[i].id) {
			html = html.replace(`id="TOC${hcounter}"`,`id="TOCseg-${parseInt(i) + 1}"`)
			allSegments[i].setAttribute('id',`seg-${parseInt(i) + 1}`)
			hcounter++
		} else {
			if (allSegments[i].classList != `tablepara`) {
				allSegments[i].setAttribute('id',`seg-${parseInt(i) + 1}`)
			}
		}
		if (allSegments[i].id) {
			lastSegment = allSegments[i].id
		}
	}

	let returnHTML = `${html}\n${bookRoot}`.replaceAll('</blockquote>\r\n<blockquote>','')
									.replaceAll('</p>\r\n\r\n\r\n<p','</p>\r\n<p')
									.replaceAll('</p>\r\n\r\n<p','</p>\r\n<p')
									.replaceAll('\r\n\r\n\r\n','')
									.replaceAll('\r\n\r\n','\r\n')


	return returnHTML
}
html = buildBook()

function buildReferences () {
	let referenceRoot = ``
	let html =`<h2>Bibliography</h2>`
	try {
		const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'biblio.html', 'utf8')
		referenceRoot = parse(data);
	} catch (err) {
		console.error(err);
	}

	let dtArr = referenceRoot.getElementsByTagName('dt')

	if (fs.existsSync('../_resources/book-data/'+bookID+'/'+'biblioMapArr.json')) {
		console.log ('Using existing biblioMapArr.json')
		let biblioMapArr =``
		try {
			const data =  fs.readFileSync('../_resources/book-data/'+bookID+'/'+'biblioMapArr.json', 'utf8')
			biblioMapArr = JSON.parse(data);
		} catch (err) {
			console.error(err);
		}
		for (i in dtArr) {
			for (k in biblioMapArr ) {
				if (dtArr[i].innerHTML == biblioMapArr[k][0]) {
					dtArr[i].set_content(biblioMapArr[k][1])
				}
			}
		}
	  } else {
		let newBiblioMapArr = `[\n`
		for (i in dtArr) {
			newBiblioMapArr += `\t["${dtArr[i].innerHTML}", "${dtArr[i].innerHTML}"]`
			if (i == dtArr.length -1) {
				newBiblioMapArr += '\n]'
			} else {
				newBiblioMapArr += ',\n'
			}
		}
		fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'biblioMapArr.json'), newBiblioMapArr, 'utf8')
		console.log ('*** Initial biblioMapArr.json file created ***\nThis file will need to be edited to correspond with the reference entries in the book\nThe first entry is the Zotero citation reference, the second entry is as it appears in the book')
	  }



	let dtArrText = [] // An array for dt Text
	let uniqSesameRefArr = [...new Set(sesameRefArr)] // remove all duplicates
	for (i in dtArr) {
		dtArrText.push(dtArr[i].text)
	}
	
	let nonBiblioReferences = uniqSesameRefArr.filter(x => !dtArrText.includes(x)); //get the differences

	let localJSON = ``

	localJSON += `[\n`
	for (let i in nonBiblioReferences) {
		localJSON += `{\n\t"sesame": "${nonBiblioReferences[i]}",\n\t"biblio": ""\n}`
		if (i == nonBiblioReferences.length -1) {
			localJSON += '\n]'
		} else {
			localJSON += ',\n'
		}
	}
	fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'sesameRefSTUB.json'), localJSON, 'utf8')
	console.log(`*** A new file: /book-data/${bookID}/sesameRefSTUB.json has been created ***`);

	let refs = referenceRoot.querySelectorAll('dl')

	html += refs[0].outerHTML
	return html
}


if (fs.existsSync(`../_resources/book-data/${bookID}/biblio.html`)) {
	console.log(`Attempting to create Bibliography ...`)
	html += buildReferences()
	console.log (`✅ Bibliography Added from /book-data/${bookID}/biblio.html`)
} else {
	console.log (`❎—🛈 NO BIBLIOGRAPHY DATA found at /book-data/${bookID}/biblio.html`)
}



html += `<div class="endBar">End of Book</div>

<h1 id="999999999"></h1>
</div>	
</div>
<div></div></div> 

<script src="../_resources/js/jquery-3.6.0.min.js"></script>
<script src="../_resources/js/jquery.mark.min.js"></script>
<script src="../_resources/js/list.js.2.3.1/list.min.js"></script>
<script src="../_resources/js/tMS.js"></script>
<script src="../_resources/js/scsutta.js"></script>

</body>
</html>`


const newIndexDirectoryPath = `../${bookID}`

if (fs.existsSync(newIndexDirectoryPath)) {
	console.log(`✅Book directory already exists - replacing  /books/${bookID}/`)
} else {
  	console.log(`✅Creating new directory /books/${bookID}/`);
  	fs.mkdirSync(newIndexDirectoryPath);
}
fs.writeFileSync(path.join(__dirname, '..', bookID, 'index.html'), html)
}

function processPandoc() {
	let pandocRoot =``
	try {
		const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'pandoc.html', 'utf8')
		pandocRoot = parse(data)
	} catch (err) {
		console.error(err);
	}
	console.log(`Attempting to process pandoc.html ...`)

	function buildMetaJSON () {
		let localJSON = ``
		let authors = ``
		let title = ``
		let subtitle = ``
		let abstractShort = ``
		let abstract = ``
		let itemType =``
		let copyrightArr = []
		let copyright = ``
		let CCLicense = ``
		let frontCoverLocation = `../_resources/book-data/${bookID}/FrontLarge.jpg`
		let downloadsAvailable =``
		let downloadHTML =``
		let backCoverLocation = ``
		let backcoverHTML =``
	
		let tokens = pandocRoot.querySelectorAll('div, p, h1')
		for (i in tokens) {
			if (tokens[i].getAttribute('data-custom-style') == "WW-abstract-short") {
				abstractShort = tokens[i].innerHTML
					.replaceAll(`<span data-custom-style="wwc-pali">`, `<span lang='pi'>`)
					.replaceAll(/(\r\n|\n|\r)/gm, "")
			} else 
			if (tokens[i].getAttribute('data-custom-style') == "WW-abstract") {
				abstract = tokens[i].innerHTML
				.replaceAll(`<span data-custom-style="wwc-pali">`, `<span lang='pi'>`)
				.replaceAll(/(\r\n|\n|\r)/gm, "")
			} else
			if (tokens[i].getAttribute('data-custom-style') ==  ('WW-item-type')) {
				itemType += `${tokens[i].text.replaceAll(/(\r\n|\n|\r)/gm, "").toLowerCase()}`
			} else 
			if (tokens[i].getAttribute('data-custom-style') ==  ('WW-authors')) {
				authors += `"${tokens[i].text.replaceAll(/(\r\n|\n|\r)/gm, "")}",`
			} else 
			if (tokens[i].getAttribute('data-custom-style') ==  ('WW-title')) {
				title += `${tokens[i].text.replaceAll(/(\r\n|\n|\r)/gm, "")}`
			} else 
			if (tokens[i].getAttribute('data-custom-style') ==  ('WW-subtitle')) {
				subtitle += `${tokens[i].text.replaceAll(/(\r\n|\n|\r)/gm, "")}`
			} else 
			if (tokens[i].getAttribute('data-custom-style') == "WW-copyright") {
				copyrightArr = tokens[i].innerHTML
					.replace('<p>', '')
					.replaceAll('\"', '\'')
					.replaceAll('\<span data-custom-style=\"Hyperlink\"\>','')
					.replaceAll('\<\/span\>','')
					.replace('</p>','')
					.replaceAll(/(\r\n|\n|\r)/gm, "")
					.split('<br>');
				CCLicense = copyrightArr.pop();
				for (i in copyrightArr) {
					copyright += `"${copyrightArr[i]}",`
				}
				copyright = copyright.slice(0, -1)
			} else
			if (tokens[i].getAttribute('data-custom-style') == "WW-downloads-available") {
				downloadsAvailable +=  `${tokens[i].text.replaceAll('\r\n','').replaceAll('\n',',')}`
			} else
			if (tokens[i].getAttribute('data-custom-style') == "WW-download-text") {
				downloadHTML +=  tokens[i].innerHTML.replaceAll('\r\n','')
			} else
			if (tokens[i].getAttribute('data-custom-style') == "WW-download-HTML") {
				downloadHTML +=  `${tokens[i].text.replaceAll('\r\n','')}`
			} else
			if (tokens[i].getAttribute('data-custom-style') == "WW-backcover-text") {
				if (tokens[i].innerHTML.replaceAll('\r\n','') != `<p>None</p>`) {
					if (backCoverLocation == '') {
						backCoverLocation = `../_resources/book-data/${bookID}/BackLarge.jpg`
					}
					backcoverHTML +=  `${tokens[i].innerHTML.replaceAll('\r\n','')}`
				}
			} 
		}
	
	
		localJSON += `{
			"Authors" : [${authors.slice(0,-1)}],
			"BookTitle" : "${title}",
			"BookSubtitle" : "${subtitle}",
			"ShortAbstract" : "${abstractShort}",
			"Abstract" : "${abstract}",
			"ItemType" : "${itemType}",
			"AddInfo"   : [],
			"Copyright" : [${copyright}],
			"CCLicense": "${CCLicense}",
			"FrontCover": "${frontCoverLocation}",
			"BackCover": "${backCoverLocation}",
			"BackMatter": ["${backcoverHTML}"],
			"DownloadsAvailable": "${downloadsAvailable}",
			"DownloadHTML": "${downloadHTML}"
		}`
		fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'meta.json'), localJSON, 'utf8')
		console.log(`✅ meta.json created`)
	}
	
	function buildTOCJSON () {
		let localJSON = ``
		let TOChtml = pandocRoot.querySelectorAll('div')
		localJSON += `[`
		let count = 0
		for (let i in TOChtml) {
			if (TOChtml[i].getAttribute('data-custom-style') == 'WW-Chapter') {
				count += 1
				let nextTOCText = TOChtml[i].text.replace(/(\r\n|\n|\r)/gm, "")
				let nextTOCID = `CHAPTER-${nextTOCText.replaceAll(' ','-')}`
				localJSON += `{\n\t"tocno": "${count}",\n\t"pandocHTMLID": "${nextTOCID}",\n\t"heading": "${nextTOCText}"},\n`
				let newElement = `<h1 id='${nextTOCID}'\>${nextTOCText}</h1>`
				TOChtml[i].replaceWith(newElement)
			} else
			if (TOChtml[i].getAttribute('data-custom-style') == 'WW-chapter-section-1') {
				count += 1
				let nextTOCText = TOChtml[i].text.replace(/(\r\n|\n|\r)/gm, "")
				let nextTOCID = `CHAP-SECTION-01-${nextTOCText.replaceAll(' ','-')}`
				localJSON += `{\n\t"tocno": "${count}",\n\t"pandocHTMLID": "${nextTOCID}",\n\t"heading": "${nextTOCText}"},\n`
				let newElement = `<h2 id='${nextTOCID}'\>${nextTOCText}</h2>`
				TOChtml[i].replaceWith(newElement)
			} else
			if (TOChtml[i].getAttribute('data-custom-style') == 'WW-chapter-section-2') {
				count += 1
				let nextTOCText = TOChtml[i].text.replace(/(\r\n|\n|\r)/gm, "")
				let nextTOCID = `CHAP-SECTION-02-${nextTOCText.replaceAll(' ','-')}`
				localJSON += `{\n\t"tocno": "${count}",\n\t"pandocHTMLID": "${nextTOCID}",\n\t"heading": "${nextTOCText}"},\n`
				let newElement = `<h3 id='${nextTOCID}'\>${nextTOCText}</h3>`
				TOChtml[i].replaceWith(newElement)
			}
		}
		localJSON = localJSON.substring(0, localJSON.length -2)
		localJSON += `]`
		fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'TOC.json'), localJSON, 'utf8')
		console.log(`✅ TOC.json created`)
	}

	function buildFootnotesJSON () {
		if (pandocRoot.querySelector('#footnotes')) {
			let footnotesRoot = parse (pandocRoot.querySelector('#footnotes'))
			//custom-styles
			let spans = footnotesRoot.getElementsByTagName ('span')
			for (i in spans) {
				let dataCustomStyle = spans[i].getAttribute('data-custom-style')
				switch(dataCustomStyle) {
					case 'Footnote Characters':
						spans[i].remove()
					break
					case 'Hyperlink':
						let tempHTML = spans[i].innerHTML
						spans[i].replaceWith (tempHTML)
					break
					case 'wwc-PTS-reference':
						spans[i].innerHTML=`PTS: ${spans[i].innerHTML}`
						spans[i].classList.add('ptsref')
						spans[i].removeAttribute ('data-custom-style')
						
					break
					case 'wwc-sesame-zot-reference':
						spans[i].classList.add('sesame')
						spans[i].classList.add('ref')
						spans[i].removeAttribute ('data-custom-style')
						sesameRefArr.push(spans[i].text)
					break
					case 'wwc-sesame':
						spans[i].classList.add('sesame')
						spans[i].removeAttribute ('data-custom-style')
						sesameArr.push(spans[i].text)
					break
					case 'wwc-pali':
						spans[i].setAttribute('lang','pi')
						spans[i].removeAttribute ('data-custom-style')
					break
					case 'wwc-sanskrit':
						spans[i].setAttribute('lang','sa')
						spans[i].removeAttribute ('data-custom-style')
					break
					default:
				}
	
			}
			// anchors
			let anchors = footnotesRoot.getElementsByTagName ('a') 
			for (i in anchors) {
				let istMSBook = anchors[i].text.slice(0,16) == `wiswo.org/books/`
				if (istMSBook) {
					let tMSShortcode = anchors[i].text.slice(16)
					anchors[i].replaceWith(`<a class='library' href='../${tMSShortcode}'> on theMettāShelf</a>`)
					break
				}
				let firstThree = anchors[i].text.slice(0,3)
				switch(firstThree) {
					case 'MN ':
					case 'AN ':
					case 'SN ':
					case 'DN ':
					case 'Ud ':
						let tempTop =  anchors[i].text.slice(0, 2)
						let tempTail = anchors[i].text.slice(3,anchors[i].text.length)
						let tempText = tempTop + '&#8239;' + tempTail
						anchors[i].replaceWith(`<span class='sclinktext'>${tempText}</span>`)
					break
					case 'Dhp':
					case 'Snp':
					case 'Iti':
						let temp2Top =  anchors[i].text.slice(0, 3)
						let temp2Tail = anchors[i].text.slice(4,anchors[i].text.length)
						let temp2Text = temp2Top + '&#8239;' + temp2Tail
						anchors[i].replaceWith(`<span class='sclinktext'>${temp2Text}</span>`)
					break
					case 'Tha':
					case 'Thi':
						let temp3Top =  anchors[i].text.slice(0, 4)
						let temp3Tail = anchors[i].text.slice(5,anchors[i].text.length)
						let temp3Text = temp3Top + '&#8239;' + temp3Tail
						anchors[i].replaceWith(`<span class='sclinktext'>${temp3Text}</span>`)
					break
					case 'Ja ':
					case 'Kd ':
					case 'Mil':
					case 'Bu ':
						anchors[i].classList.add('extlink')
						anchors[i].classList.add('tipref')
					break
					default:
						if ((anchors[i].getAttribute('href').substring(0,1) == '#') && (anchors[i].text != '↩︎')) {
							let target = anchors[i].getAttribute('href');
							let temp4Text = anchors[i].text
							anchors[i].replaceWith(`<span class="manualLink" data-target="${target}">${temp4Text}</span>`)
						} else {
							anchors[i].classList.add('extlink')
						}
				}
			}
			let outFNLi = footnotesRoot.getElementsByTagName ('li')
			let localJSON = `[\n`
			for (let i in outFNLi) {
				if (outFNLi[i].id.substring(0,2) == 'fn' ) {
					let thisFootnoteRoot = parse(outFNLi[i].innerHTML)
					let thisFootnoteHTML = ``
					thisFootnoteParas = thisFootnoteRoot.querySelectorAll('p')
		
					for (let j in thisFootnoteParas) {
						thisFootnoteHTML += thisFootnoteParas[j].outerHTML.replaceAll('\"','\'')
						.replaceAll('<em><u>,</u></em>',',') // clean up unexpected italics
						.replaceAll('<em>,</em>',',')  // clean up unexpected italics
						.replaceAll(' | ','<br>')
						.replaceAll('<p> ', '<p>')
					}
		
					localJSON += `{\n\t"fnNumber": "${Number(i)+1}",\n\t"fnHTML": "${thisFootnoteHTML}"\n}`
		
					if (i == outFNLi.length -1) {
						localJSON += '\n'
					} else {
						localJSON += ',\n'
					}
				}
			}
			localJSON += ']'
	
			fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'footnotes.json'), localJSON, 'utf8')
			console.log(`✅ footnotes.json created`)
			} else {
				footnotesExist = false
				console.log (`❎—🛈 NO FOOTNOTES in document`)
			}
	}

	function buildBookInfoJSON () {
		let metaData = require(`../_resources/book-data/${bookID}/meta.json`)
		let authors = metaData.Authors;
		let metaDataStr = JSON.stringify(metaData, null, '\t');
		let jsonStr = `${metaDataStr.substring(0, metaDataStr.length-1)},`;
		jsonStr += `"AuthorsData": [`;
		for (i in authors) {
			let author = require(`../_resources/author-data/${authors[i]}/bio.json`);
			jsonStr += `${JSON.stringify(author, null, '\t')},`;
		}
		jsonStr = jsonStr.substring(0, jsonStr.length - 1);
		jsonStr += `]\}`; 
	
		let newjson = JSON.parse(jsonStr);
	
		if (newjson.AuthorsData.length > 1) {
			let i = 0;
			let manyAuthors = "";
			while (i < newjson.AuthorsData.length) {
				manyAuthors += newjson.AuthorsData[i].ShortName;
				i++;
				if (newjson.AuthorsData.length - i > 1) {
					manyAuthors += ', ';
				} else if ((newjson.AuthorsData.length - i == 1)){
					manyAuthors += ' and ';
				}
			}
			newjson.Authors = manyAuthors;
		} else {
			newjson.Authors = newjson.AuthorsData[0].ShortName;
		}
		let CCLongLicenses = require(`../_resources/copyright-data/cclicence.json`);
		for (let i = 0; i< Object.keys(CCLongLicenses).length; i++) {
			if (newjson.CCLicense == Object.keys(CCLongLicenses)[i]) {
				newjson.CCLicense = Object.values(CCLongLicenses)[i];
			}
		}
		jsonStr = JSON.stringify(newjson, null, '\t');
		fs.writeFileSync(`../_resources/book-data/${bookID}/info.json`, jsonStr);
		console.log(`✅ info.json created`)
	}

	function extractBookHTML () {
		let bookRoot = parse (pandocRoot.querySelector('body'))
		if (bookRoot.querySelector('#footnotes')) {
			bookRoot.querySelector('#footnotes').remove()
		}

		bookRoot.querySelector('header').remove()
		let allDivs = bookRoot.querySelectorAll('div')
		for (i in allDivs) {
			if (
				   (allDivs[i].getAttribute("data-custom-style") == "WW-title") 
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-subtitle")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-authors")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-item-type")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-abstract-short") 
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-abstract")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-copyright")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-downloads-available")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-download-text")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-download-HTML")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-backcover-text")
				|| (allDivs[i].getAttribute("data-custom-style") == "WW-meta-heading")
				) {
				allDivs[i].remove();
			}
			if ((allDivs[i].getAttribute("data-custom-style") == "WW-special-message") && (allDivs[i].text.replaceAll('\r\n', '') == 'None')) {
				allDivs[i].remove();
			}
		}
		
		let html = ``
		html += bookRoot.querySelector('body').innerHTML
		fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'book.html'), html, 'utf8')
		console.log(`✅ book.html created`)

	}

	buildMetaJSON()
	buildTOCJSON()
	buildFootnotesJSON()
	buildBookInfoJSON()
	extractBookHTML()
	console.log(`✅✅ pandoc.html PROCESSING COMPLETE`);
}

console. log('----------------------------------START----------------------------------')
buildBook();
