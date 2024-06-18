const path = require('path')
const fs = require('fs')
const { parse } = require('node-html-parser');

let bookID = process.argv.slice(2)[0];

let pandocRoot =``
try {
	const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'pandoc.html', 'utf8')
	pandocRoot = parse(data)
} catch (err) {
	console.error(err);
}


function buildReferences () {
	let referenceRoot = ``
	let html =`<h2>Bibliography</h2>`
	try {
		const data = fs.readFileSync('newbiblio.html', 'utf8');
		referenceRoot = parse(data);
	} catch (err) {
		console.error(err);
	}

	let refs = referenceRoot.querySelectorAll('dl')

	html += refs[0].outerHTML
	return html
}


let outputHTML =``


function buildMetaJSON () {
	let localJSON = ``
	let authors = ``
	let title = ``
	let subtitle = ``
	let abstractShort = ``
	let abstract = ``
	let copyrightArr = []
	let copyright = ``
	let CCLicense = ``
	let frontCoverLocation = `../_resources/book-data/${bookID}/FrontLarge.jpg`
	let downloadsAvailable =``
	let downloadHTML =``

	let tokens = pandocRoot.querySelectorAll('div, p, h1')
	for (i in tokens) {
		if (tokens[i].getAttribute('data-custom-style') == "AbstractShort") {
			abstractShort = tokens[i].innerHTML
				.replaceAll(`<span data-custom-style="pali">`, `<span lang='pli'>`)
				.replaceAll(/(\r\n|\n|\r)/gm, "")
		} else 
		if (tokens[i].getAttribute('data-custom-style') == "Abstract") {
			abstract = tokens[i].innerHTML
			.replaceAll(`<span data-custom-style="pali">`, `<span lang='pli'>`)
			.replaceAll(/(\r\n|\n|\r)/gm, "")
		} else
		if (tokens[i].classList.contains ('author')) {
			authors += `"${tokens[i].innerHTML}",`
		} else 
		if (tokens[i].classList.contains ('title')) {
			title += `${tokens[i].innerHTML}`
		} else 
		if (tokens[i].classList.contains ('subtitle')) {
			subtitle += `${tokens[i].innerHTML}`
		} else 
		if (tokens[i].getAttribute('data-custom-style') == "Copyright") {
			copyrightArr = tokens[i].innerHTML.replace('<p>', '').replace('</p>','').replaceAll(/(\r\n|\n|\r)/gm, "").split('<br>');
			CCLicense = copyrightArr.pop();
			for (i in copyrightArr) {
				copyright += `"${copyrightArr[i]}",`
			}
			copyright = copyright.slice(0, -1)
		} else
		if (tokens[i].getAttribute('data-custom-style') == "DownloadsAvailable") {
			downloadsAvailable +=  `${tokens[i].text.replaceAll('\r\n','').replaceAll('\n',',')}`
		} else
		if (tokens[i].getAttribute('data-custom-style') == "DownloadText") {
			downloadHTML +=  tokens[i].innerHTML.replaceAll('\r\n','')
		} else
		if (tokens[i].getAttribute('data-custom-style') == "DownloadHTML") {
			downloadHTML +=  `${tokens[i].text.replaceAll('\r\n','')}`
		} 

	}

	authors = authors.slice(0,-1)

	localJSON += `{
		"Authors" : [${authors}],
		"BookTitle" : "${title}",
		"BookSubtitle" : "${subtitle}",
		"ShortAbstract" : "${abstractShort}",
		"Abstract" : "${abstract}",
		"AddInfo"   : [],
		"Copyright" : [${copyright}],
		"CCLicense": "${CCLicense}",
		"FrontCover": "${frontCoverLocation}",
		"BackCover": "",
		"BackMatter": [],
		"DownloadsAvailable": "${downloadsAvailable}",
		"DownloadHTML": "${downloadHTML}"
	}`
	fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'meta.json'), localJSON, 'utf8')

}

function buildTOCJSON () {
	let localJSON = ``
	let TOChtml = pandocRoot.querySelectorAll('#TOC > ul > li > a ')

	localJSON += `[`
	for (let i in TOChtml) {
		localJSON += `{\n\t"tocno": "${Number(i)+1}",\n\t"html-id": "${TOChtml[i].getAttribute('href').substring(1)}",\n\t"heading": "${TOChtml[i].innerHTML.replace(/(\r\n|\n|\r)/gm, "").replace('<br>','—')}"}`
		if (i == TOChtml.length -1) {
			localJSON += '\n]'
		} else {
			localJSON += ',\n'
		}
	}

	fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'TOC.json'), localJSON, 'utf8')
}


function extractBookHTML () {
	let bookRoot = parse (pandocRoot.querySelector('body'))
	bookRoot.querySelector('#TOC').remove()
	bookRoot.querySelector('#footnotes').remove()
	bookRoot.querySelector('header').remove()
	bookRoot.querySelector('#short-abstract').remove()
	bookRoot.querySelector('#abstract').remove()
	bookRoot.querySelector('#copyright').remove()
	bookRoot.querySelector('#downloads').remove()

	let allDivs = bookRoot.querySelectorAll('div')

	for (i in allDivs) {
		if ((allDivs[i].getAttribute("data-custom-style") == "AbstractShort") 
			|| (allDivs[i].getAttribute("data-custom-style") == "Abstract")
			|| (allDivs[i].getAttribute("data-custom-style") == "Copyright")
			|| (allDivs[i].getAttribute("data-custom-style") == "DownloadsAvailable")
			|| (allDivs[i].getAttribute("data-custom-style") == "DownloadText")
			|| (allDivs[i].getAttribute("data-custom-style") == "DownloadHTML")
			) {
			allDivs[i].remove();
		}
	}
	
	let html = ``
	html += bookRoot.querySelector('body').innerHTML
	fs.writeFileSync(('../_resources/book-data/'+bookID+'/'+'book.html'), html, 'utf8')
}


function buildFootnotes () {
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
			case 'pts-reference':
				spans[i].classList.add('ptsref')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'zot-cite':
				spans[i].classList.add('sesame')
				spans[i].classList.add('ref')
				spans[i].removeAttribute ('data-custom-style')
				
			break
			case 'sesame':
				spans[i].classList.add('sesame')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'pali':
				spans[i].setAttribute('lang','pli')
				spans[i].removeAttribute ('data-custom-style')
			break
			default:
		}

	}


	// anchors
	let anchors = footnotesRoot.getElementsByTagName ('a') 
	for (i in anchors) {
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

	let localHTML =``
	let outFNPara = footnotesRoot.getElementsByTagName ('p');
	for (let i in outFNPara) {
		localHTML +=`\t\t\t\t<div class="booknote" data-note="${Number(i)+1}">`
		localHTML += outFNPara[i].innerHTML
		.replaceAll('<em><u>,</u></em>',',') // clean up unexpected italics
		.replaceAll('<em>,</em>',',') // clean up unexpected italics
		.replaceAll(' | ','<br>')
		localHTML += '</div>\n'
	}
	localHTML += `<div style='margin-top: 2em; background: #7f7f7f50; text-align:center; font-variant:small-caps; margin-bottom: 50%'>End of Notes</div>`
	return localHTML;
}

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
	tempHTML += downloadHTML
	return tempHTML
}


function buildBook () {
	let bookRoot = ``;
	try {
		const data = fs.readFileSync('../_resources/book-data/'+bookID+'/'+'book.html', 'utf8');
		bookRoot = parse(data);
	} catch (err) {
		console.error(err);
	}
	// TOCTarget ids
	let TOCData = JSON.parse(fs.readFileSync('../_resources/book-data/'+bookID+'/'+'toc.json', 'utf8'));

	let headingArr = bookRoot.querySelectorAll ('h1, h2, h3')
	for (let i in headingArr) {
		if (headingArr[i].tagName == 'H1') {
			let [number, heading] = headingArr[i].innerHTML.split('. ')
			if (heading) {
				if (number.length < 3 ) { //it's a chapter (1-99)
					headingArr[i].set_content(`<span class="chapnum">chapter ${number}</span><br>${heading}`)
				} else { // it's something like an appendix
					headingArr[i].set_content(`<span class="chapnum">${number.toLowerCase()}</span><br>${heading}`)
				}
			}
		}
		headingArr[i].setAttribute('id',`TOCTarget${TOCData[i].tocno}`)
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
		if (spans[i].classList.contains('anchor')) { // remove any in book link targets
			spans[i].remove()
		}
		let dataCustomStyle = spans[i].getAttribute('data-custom-style')
		switch(dataCustomStyle) {
			case 'Footnote Characters':
				spans[i].remove()
			break
			case 'Hyperlink':
				let tempHTML = spans[i].innerHTML
				spans[i].replaceWith (tempHTML)
			break
			case 'pts-reference':
				spans[i].classList.add('ptsref')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'zot-cite':
				spans[i].classList.add('sesame')
				spans[i].classList.add('ref')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'sesame':
				spans[i].classList.add('sesame')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'bob-cite':
				spans[i].classList.add('bob-cite')
				spans[i].removeAttribute ('data-custom-style')
			break
			case 'pali':
				spans[i].setAttribute('lang','pli')
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
	

	let suttaVerseHTML = ``
 	let allDivs = bookRoot.querySelectorAll('div') 
	for (i in allDivs) {
		if (allDivs[i].getAttribute('data-custom-style') == "Quote-Block") {
			allDivs[i].tagName = "blockquote"
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "BOB-Text") {
			allDivs[i].classList.add ('bob-text')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "sublist-comment") {
			allDivs[i].classList.add ('sublist-comment')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "List-Comment") {
			allDivs[i].classList.add ('list-comment')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if ((allDivs[i].getAttribute('data-custom-style') == "Normal") 
			|| (allDivs[i].getAttribute('data-custom-style') == "Sutta-Text") ){
			let tempHTML = allDivs[i].innerHTML
			allDivs[i].replaceWith(tempHTML)
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "List Paragraph") {
			let tempHTML = allDivs[i].innerHTML
			allDivs[i].replaceWith(tempHTML)
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "Sutta-Verse") {
			suttaVerseHTML += allDivs[i].innerHTML
			allDivs[i].remove()
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "Sutta-Cite") {
			if (suttaVerseHTML != '') {
				allDivs[i].insertAdjacentHTML('beforebegin', `<div class="line-block-center">${suttaVerseHTML}</div>\n`)
				suttaVerseHTML = ``;
			}
			allDivs[i].classList.add('list-cite')
			allDivs[i].removeAttribute('data-custom-style')
		} else
		if (allDivs[i].getAttribute('data-custom-style') == "List-Instructions") {
			//allDivs[i].insertAdjacentHTML('afterbegin', `<hr class='halfspacer'>`)
			let spacerHTML = ``
			let tempHTML = allDivs[i].innerHTML
			let c = tempHTML.charAt(5)

			if (c >= '0' && c <= '9') {
				spacerHTML = `<hr class='halfspacer'>`
			}
			allDivs[i].replaceWith(`${spacerHTML}${tempHTML}`)
		} 
	} 

	// table rows
	let allTableRows = bookRoot.querySelectorAll('tr') 
	for (i in allTableRows) {
		allTableRows[i].classList.remove('odd')
		allTableRows[i].classList.remove('even')
	}

	//colgroups 
	let allColGroups = bookRoot.querySelectorAll('colgroup')
	for (i in allColGroups) {
		allColGroups[i].remove()
	}


	// table captions
	let allTablesAndCaptions = bookRoot.querySelectorAll('table, div')

	for (let i in allTablesAndCaptions) {
		//console.log(allTablesAndCaptions[i].innerHTML)
		if (allTablesAndCaptions[i].getAttribute('data-custom-style') == 'Table') {
			let caption = allTablesAndCaptions[i].text
			let table = allTablesAndCaptions[Number(i)+1].innerHTML.replaceAll('<tr class>','<tr>')
			allTablesAndCaptions[i].replaceWith(`<div class="tablewrap">
<table>
<caption >${caption}</caption>${table}
</table>
</div>`)
			allTablesAndCaptions[Number(i)+1].remove()

		}
	}


	let allSegments = bookRoot.querySelectorAll('p')
	for (i in allSegments) {
		allSegments[i].setAttribute('id',`seg-${i}`)
	}


	let returnHTML = `\n${bookRoot}`.replaceAll('</blockquote>\r\n<blockquote>','')
									.replaceAll('</p>\r\n\r\n\r\n<p','</p>\r\n<p')
									.replaceAll('</p>\r\n\r\n<p','</p>\r\n<p')

	return returnHTML
}

function buildCompleteBook () {

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
html +=`<!DOCTYPE html>
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
<body id="thebody">`    
// Build TOC
html += `
<div id="tocnav" class="sidenav">
	<div id="tocbtn2" class="tocbtn, no-print" onclick="closeFromTocbtn2 ()">&#10094; Contents</div>
	<ul id="TOC">
		<li id="TOC0" class="noshow">Engrave</li>
		<li id="TOC0-1">Title Page</li>\n`

let TOCData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'toc.json'))
for (var i in TOCData){
    html += `\t\t<li id="TOC${TOCData[i].tocno}">${TOCData[i].heading}</li>\n`
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
			<h2>Notes for ${title}</h2>
`

html += buildFootnotes()


// Settings
html += `				</div>
			<div id="ModalSettings"></div>
			<div id="ModalDownload">
				<div>
					<div class="downloads">`

html += buildDownloadInfo()

html +=					`</div>
				</div>
			</div>
			<div id="ModalSutta"><div id="sutta"></div></div><div id="ModalDownloadAlert"></div>
			<div id="ModalSelfquote"><div id="selfquotearea"></div></div>
		</div>
	</div>
</div>
<div id="spinbox"><div id="spintext"></div></div>
`
// Book
html += `<div class="wrapper" id="bookwrap"><div></div>
	<div class="content" id="thecontent">
		<h1 class="engrave center" id="TOCTarget0">${title}</h1>
		<p class="center smallEngrave">${authorShortname}</p>
		<div class="book" id="thebook" data-shortcode="${bookID}">
			<h1 class="titlepage" id="TOCTarget0-1">${title}</h1>
			<h4 class="titlepage">${subtitle}</h4>
			<h2 class="titlepage">${authorShortname}</h2>`

html += buildBook().replaceAll('\r\n\r\n','')

html += buildReferences()

html += `
<div class="eob">-- END OF BOOK --<br>
<a href="../..">
<img src="../_resources/images/icons/logo.png" alt="Wiswo Logo"> 
<span>Wisdom & Wonders</span>
</a>
</div>
<h1 id="TOCTarget999999999"></h1>
</div>	
</div>
<div></div></div> 

<script src="../js/jquery-3.6.0.min.js"></script>
<script src="../js/jquery.mark.min.js"></script>
<script src="../js/list.js.2.3.1/list.min.js"></script>
<script src="../js/reader.js"></script>
<script src="../js/scsutta.js"></script>
<script src="../js/fslightbox.js"></script>

</body>
</html>`

outputHTML = html
fs.writeFileSync(path.join(__dirname, '.', 'newbook.html'), outputHTML)
}


function buildBookInfoJSON () {
	//let metaData = JSON.parse(fs.readFileSync('../_resources/book-data/'+bookID+'/'+'meta.json', 'utf8'));
    let metaData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'meta.json'));
    let authors = metaData.Authors;
    let metaDataStr = JSON.stringify(metaData, null, '\t');
    let jsonStr = `${metaDataStr.substring(0, metaDataStr.length-1)},`;
    
    jsonStr += `"AuthorsData": [`;
    for (i in authors) {
        let author = require(path.join(__dirname, '..', '_resources', 'author-data', authors[i], 'bio.json'));
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
    let CCLongLicenses = require(path.join(__dirname, '..', '_resources', 'copyright-data', 'cclicence.json'));
	for (let i = 0; i< Object.keys(CCLongLicenses).length; i++) {
		if (newjson.CCLicense == Object.keys(CCLongLicenses)[i]) {
			newjson.CCLicense = Object.values(CCLongLicenses)[i];
		}
	}
    jsonStr = JSON.stringify(newjson, null, '\t');
    fs.mkdirSync(path.join(__dirname, '..', '_resources', 'built-info-data', bookID), { recursive: true }, (err) => {
        if (err) throw err;
      });
    fs.writeFileSync(path.join(__dirname, '..', '_resources', 'built-info-data', bookID, 'info.json'), jsonStr);
}

buildMetaJSON();
buildTOCJSON()
extractBookHTML()
buildCompleteBook()
buildBookInfoJSON ()
