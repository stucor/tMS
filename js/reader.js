var nuclearOption = false;
// SETTINGS VARIABLES
var sidebarIsOpen = false;
var forceMobileUI;
var themeName = "Simple";
var marginName = "";

var prevScrollpos = window.pageYOffset;

/* COOKIES */

// generic cookie functions

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/" + ";samesite=strict";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function hasClass(elementtocheck, className) {
	element = document.getElementById(elementtocheck);
    return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}

function isAudioBook () {
	return hasClass("thebody", "audiobook");
}

function isBookShelf () {
	return hasClass("thebody", "shelf");
}

function shortcode() {
	var thebook = document.getElementById("thebook");
	return thebook.getAttribute("data-shortcode");
}

function startup () {

/*
	console.log("local storage:");
	for (var i = 0; i < localStorage.length; i++)   {
		console.log(localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]");
	}
*/
document.getElementById('topbar').style.display='block';
document.getElementById('thebook').style.display='block';

	hideAllLibNotes();
	initialiseCommonSettings();

	if (!isAudioBook()) {
		initialiseBookSettings ();
	} 
	formatbooknotes();

	var scroller = Math.floor(window.scrollY);
	history.replaceState({scrollState: scroller},'',''); 
	history.scrollRestoration = 'manual';

	if (isAudioBook()) { 
		initialiseAudioBookSettings();
		initplayer();
		document.getElementById('coverengraving').style.display='none';
	}

	if (isBookShelf()) {
		initialiseBookShelfSettings ();
		document.getElementById('coverengraving').style.display='none';
	}

	if (!(isBookShelf()) && !(isAudioBook())) { // normal book
		buildInfo();
	}

}

function buildInfo () {

	/* Adds the element id= referencelist to the details modal */

	let parentDiv = document.getElementById('ModalDetails');
	let shortCode = shortcode();


// Suttalist
	function suttalist () {
		let suttarefArr = document.getElementsByClassName('sclinktext');
		let html = "";
		if (suttarefArr.length  > 0) {
			html = `<section class="infocontainer">`;
			html += `<h3>Sutta References in this book:</h3>`;
			html += `<div id="reflist">	`
			for (let i = 0; i < suttarefArr.length; i++) {
				suttarefArr[i].setAttribute("id", "slt_"+ i);
				let linktext = `<span class='sclinkref' id='screflinkfrom_${i}'>${suttarefArr[i].innerHTML}</span>`;
				html += `<div class='reflistitem'>${linktext}</div>`;
			}
			html += `</div></section>`;
			return html;
		}
	}


	const bookinfo = fetch(`../_resources/book-data/book-info.json`)
		.then(response => response.json())
		.catch(error => {
		  console.log('something went wrong');
		});

		Promise.all([bookinfo]).then(responses => {
			var bookTitle, bookauthorID, bookauthorFullName, bookTitleAuthor;

			const [bookinfoData] = responses;

			Object.keys(bookinfoData).forEach(segment => {
				if (shortCode == segment) {
					[bookTitle, bookauthorID] = bookinfoData[segment].split(':');
				}
			});

			const bookauthorBio = fetch(`../_resources/author-data/bios/${bookauthorID}-bio.json`)
			.then(response => response.json())
			.catch(error => {
			  console.log('something went wrong');
			});

			Promise.all([bookauthorBio]). then (responses => {
				const [bookauthorBioData] = responses;
				//console.log(bookauthorBioData);
			
				Object.keys(bookauthorBioData).forEach(segment => {
					//console.log(segment);
					[left, right] = segment.split(':');
					if (segment == '0:0') {
						bookauthorFullName = bookauthorBioData[segment];
						bookTitleAuthor = bookTitle + ' by ' + bookauthorFullName
						//console.log(bookauthorFullName);
						html = '';
						html += `<h1>${bookTitleAuthor}</h1>`;
						html += suttalist();
						html += `
							<div class="detail-grid">
								<div>
									<img src="../_resources/images/bookcovers/${shortCode}.jpg" alt="${bookTitle} Cover" >
								</div>
								<div>
									<figure>
									<img src="../_resources/author-data/images/${bookauthorID}.jpg" alt="${bookauthorFullName}">
									<figcaption><strong>${bookauthorFullName}: </strong>`
					}

					if (left == 1) {
						html += `<span>${bookauthorBioData[segment]}</span>`
					}
					if (segment == "shortbio:end") {
					html += `</figcaption>
					</figure></div></div>`
					
					}
					//console.log(html);
					parentDiv.innerHTML = html;

					
				});
			});


		});





/*	
	let parentdiv = document.getElementById('ModalDetails');
	let detailgrid = document.getElementsByClassName('detail-grid')[0];

	let refListHead = document.createElement("h3");
	parentdiv.insertBefore(refListHead,detailgrid);
	refListHead.innerHTML=`Sutta References in this book:`;

	let referencelist = document.createElement("div");
	referencelist.setAttribute("id", "reflist");
	parentdiv.insertBefore(referencelist,detailgrid);
	let suttarefArr = document.getElementsByClassName('sclinktext');
	for (let i = 0; i < suttarefArr.length; i++) {
		suttarefArr[i].setAttribute("id", "slt_"+ i);
		let linktext = `<span class='sclinkref' id='screflinkfrom_${i}'>${suttarefArr[i].innerHTML}</span>`;
		referencelist.innerHTML += `<div class='reflistitem'>${linktext} </div>`;
	}
	if (!referencelist.innerHTML) {
		refListHead.innerHTML = 'There are no Suttas referenced in this book';
	}

	let authordetails = document.createElement("section");
	parentdiv.insertBefore(authordetails,detailgrid);
	authorHTML = `<hr><h3>Author:<h3>`;
	authordetails.innerHTML=authorHTML;
*/
}

//ONLOAD
window.onload = function () {
    showSpinner(); // show spinner
    promiseToRunAsync(startup) // execute anync
    .then(() => {
        hideSpinner();
		getPlaceInBook();
	});
};

var savedBookElements = thebook.querySelectorAll("*");
var savedTOCElements = tocnav.querySelectorAll('li, button');
var savedDetailsElements = ModalDetails.querySelectorAll('p, figcaption, h1, h2, li, table');
var savedNotesElements = ModalNotes.querySelectorAll('h2, div');

var theTopBar = document.getElementById("topbar");

function hideAllLibNotes () {
	var elems = document.getElementsByClassName('libcont');
	for (var i = 0; i < elems.length; i++) {
		hideElement(elems[i]);
	}		
}

function initialiseCommonSettings () {
	//FORCE-FULL-SCREEN
	var local_wiswobooks_ffs = getCookie("wiswobooks_ffs");
	switch (local_wiswobooks_ffs) {
		case 'true' :
			document.getElementById("mobileUIAlwaysOnCheck").checked = true;
			break;
		case 'false' :
			document.getElementById("mobileUIAlwaysOnCheck").checked = false;
			break;	
		default :
		if (window.innerWidth > 666) {
			local_wiswobooks_ffs = false;
			document.getElementById("mobileUIAlwaysOnCheck").checked = false;
		} else {
			local_wiswobooks_ffs = true;
			document.getElementById("mobileUIAlwaysOnCheck").checked = true;
		}
		setCookie('wiswobooks_ffs',local_wiswobooks_ffs,365);
	}
	setFFS();
	//SIDEBAR (TOCOPEN)
	var local_wiswobooks_tocopen = getCookie("wiswobooks_tocopen");
	if (local_wiswobooks_tocopen == '') {
		local_wiswobooks_tocopen = 'false';
		setCookie ("wiswobooks_tocopen", local_wiswobooks_tocopen,365);
	} else {
		if (local_wiswobooks_tocopen == 'true') {
			showSideNav();
		} else {
			hideSideNav();
		}
	}
	//THEME
	var local_wiswobooks_theme = getCookie("wiswobooks_theme");
	switch (local_wiswobooks_theme) {
		case 'simple' :
			document.getElementById("radioSimple").checked = true;
			break;
		case 'simpledark' :
			document.getElementById("radioSimpleDark").checked = true;
			break;
		case 'sepia' :
			document.getElementById("radioSepia").checked = true;
			break;
		default :
			document.getElementById("radioSimple").checked = true;
			local_wiswobooks_theme = 'simple';
			setCookie('wiswobooks_theme', local_wiswobooks_theme,365);
	}
	setTheme ();
	//FONT-SIZE
	var local_wiswobooks_font_size = getCookie("wiswobooks_font_size");
	document.getElementById("flvalue").innerHTML = 16; //default font-size
	if (local_wiswobooks_font_size == '') { // if there isn't a cookie, create one at the default value
		local_wiswobooks_font_size = '16' 
		setCookie ('wiswobooks_font_size', local_wiswobooks_font_size,365);
	} else { 
		document.getElementById("flvalue").innerHTML = local_wiswobooks_font_size;
		setFontLevel(local_wiswobooks_font_size, 0, savedBookElements.length);
		setTOCLevel(local_wiswobooks_font_size);
		setDetailsLevel(local_wiswobooks_font_size);
		setNotesLevel(local_wiswobooks_font_size);
	}	
}

function initialiseBookSettings () {
	//LINE-SPACING
	var local_wiswobooks_line_spacing = getCookie("wiswobooks_line_spacing");
	document.getElementById("lhvalue").innerHTML = 1.3;
	if (local_wiswobooks_line_spacing == '') {
		local_wiswobooks_line_spacing = '1.3';
		setCookie ('wiswobooks_line_spacing',local_wiswobooks_line_spacing,365);
	} else {
		document.getElementById("lhvalue").innerHTML = local_wiswobooks_line_spacing;
		setLH (local_wiswobooks_line_spacing, 0, savedBookElements.length);
	}	
	//MARGINS
	var local_wiswobooks_margins = getCookie("wiswobooks_margins");
	if (local_wiswobooks_margins == '') {
		document.getElementById("radioMargMid").checked = true;
		local_wiswobooks_margins = 'midmargin';
		setCookie ('wiswobooks_margins',local_wiswobooks_margins,365);
	} else {
		switch (local_wiswobooks_margins) {
			case 'narrowmargin':
				document.getElementById("radioMargNarrow").checked = true;
				break;
			case 'midmargin' :
				document.getElementById("radioMargMid").checked = true;
				break;
			case 'widemargin' :
				document.getElementById("radioMargWide").checked = true;
				break;
		}
	}
	setMargin();
	//SERIF-FONT
	var local_wiswobooks_serif = getCookie("wiswobooks_serif");
	switch (local_wiswobooks_serif) {
		case 'true' :
			document.getElementById("serifFont").checked = true;
			break;
		case 'false' :
			document.getElementById("serifFont").checked = false;
			break;	
		default :
			document.getElementById("serifFont").checked = false;
			local_wiswobooks_serif = 'false';
			setCookie('wiswobooks_serif',local_wiswobooks_serif,365);
	}
	setSerif(0, savedBookElements.length);
	//SHOW-PAGES
	var local_wiswobooks_showpages = getCookie("wiswobooks_showpages");
	switch (local_wiswobooks_showpages) {
		case 'true' :
			document.getElementById("showPageCheck").checked = true;
			break;
		case 'false' :
			document.getElementById("showPageCheck").checked = false;
			break;	
		default :
			document.getElementById("showPageCheck").checked = false;
			local_wiswobooks_showpages = 'false';
			setCookie('wiswobooks_showpages',local_wiswobooks_showpages,365);
	}
	setPageBreak(false);
	setPageBreakSize();
	//JUSTIFICATION
	var local_wiswobooks_justification = getCookie("wiswobooks_justification");
	switch (local_wiswobooks_justification) {
		case 'true' :
			document.getElementById("justifyCheck").checked = true;
			break;
		case 'false' :
			document.getElementById("justifyCheck").checked = false;
			break;	
		default :
			document.getElementById("justifyCheck").checked = true;
			local_wiswobooks_justification = 'true';
			setCookie('wiswobooks_justification',local_wiswobooks_justification,365);
	}
	setJustify();
	//HYPHENATION
	var local_wiswobooks_hyphenation = getCookie("wiswobooks_hyphenation");
	switch (local_wiswobooks_hyphenation) {
		case 'true' :
			document.getElementById("hyphenCheck").checked = true;
			break;
		case 'false' :
			document.getElementById("hyphenCheck").checked = false;
			break;	
		default :
			document.getElementById("hyphenCheck").checked = true;
			local_wiswobooks_hyphenation = 'true';
			setCookie('wiswobooks_hyphenation',local_wiswobooks_hyphenation,365);
	}
	setHyphenation();
	//SHOW-PARAGRAPH-NUMBERS
	var local_wiswobooks_paranos_state = parseInt(getCookie("wiswobooks_paranos_state"));
	if (local_wiswobooks_paranos_state == '') {
		document.getElementById("showParaNosList").selectedIndex = 0;
		setCookie('wiswobooks_paranos_state', local_wiswobooks_paranos_state,365);
	} else {
		document.getElementById("showParaNosList").selectedIndex = local_wiswobooks_paranos_state;
	}
	if (!isBookShelf()) {
		setParaNumbers();
	}

	//PLACE-IN-BOOK is done after the settings are complete in onload function;

}

function initialiseAudioBookSettings () {
	//PLACE-IN-AUDIO-BOOK - sets currentaudiosourceindex and currentdetailindex (effectivly file to load and paragraph in file)
	var cookieSourceIndexName = "wiswobooks_pib_"+ document.title.toLowerCase().replace(/\s+/g, '');
	var cookieDetailIndexName = cookieSourceIndexName+'_Para';
	var local_source_index = getCookie(cookieSourceIndexName);

	if (local_source_index == '') {
		setCookie (cookieSourceIndexName,0,365);
		setCookie (cookieDetailIndexName,0,365);
	} else {
		currentaudiosourceindex = parseInt(local_source_index);
		if (isNaN (getCookie(cookieDetailIndexName))) {
			currentdetailindex = 0;
			setCookie (cookieDetailIndexName,0,365);
		} else {
			currentdetailindex = parseInt(getCookie(cookieDetailIndexName));
		}
		initplayer();
	}
	//SPEED
	var local_wiswoaudiobooks_speed = getCookie("wiswoaudiobooks_speed");
	if (local_wiswoaudiobooks_speed == '') {
		setCookie('wiswoaudiobooks_speed', 1,365);
	} else {
		currentAudio.playbackRate = local_wiswoaudiobooks_speed;
	}
	//VOLUME
	var local_wiswoaudiobooks_volume = getCookie("wiswoaudiobooks_volume");
	if (local_wiswoaudiobooks_volume == '') {
		setCookie('wiswoaudiobooks_volume', 0.5,365);
		local_wiswoaudiobooks_volume = 0.5;
	} 
	volslider.value = local_wiswoaudiobooks_volume *100;
	$(slide).trigger("change");

	document.getElementById('audiobookcover').classList.add('noshow');
}

function initialiseBookShelfSettings () {
	// SORT
	var lsssfSortBy = 'msssfSortBy';
	var lsssfSortOrder = 'msssfSortOrder';
	if (localStorage.getItem(lsssfSortBy) === null) {
		localStorage.setItem(lsssfSortBy, "A");
		localStorage.setItem(lsssfSortOrder, "asc");
		doSort ("A","asc");
	} else {
		doSort (localStorage.getItem(lsssfSortBy), localStorage.getItem(lsssfSortOrder));
	}

	//SEARCH ON
	
	var lsSearchOn = localStorage.getItem('msssfSearchOn');
	if  (lsSearchOn === null) {
		localStorage.setItem('msssfSearchOn','TA');
	} else { 
		if (lsSearchOn =='TA') {
			searchbyTitleAuthor.click();
		} else {
			searchbySuttaNumber.click();
		}
	}

	//SEARCH INPUT
	var lsSearchInput = localStorage.getItem('msssfSearchInput');
	if (lsSearchInput  === null) {
		localStorage.setItem('msssfSearchInput', '');
	} else {
		bookSearchInput.value = lsSearchInput;
	}

	//FILTERS

	var lsFilterOn = localStorage.getItem('msssfFilterOn');
	if  (lsFilterOn === null) {
		localStorage.setItem('msssfFilterOn','CCCCC');
	} else { 
		const foArray = lsFilterOn.split("");
		if (foArray[0] == 'X') {
			BrahmCheck.click();
		}
		if (foArray[1] == 'X') {
			BrahmaliCheck.click();
		}
		if (foArray[2] == 'X') {
			ChatchaiCheck.click();
		}
		if (foArray[3] == 'X') {
			SDhammikaCheck.click();
		}
		if (foArray[4] == 'X') {
			SujatoCheck.click();
		}
		if (foArray[5] == 'X') {
			SunyoCheck.click();
		}
	}

	filterBookSearch();

	//GRID or LIST
	if (localStorage.getItem('msgridlist') === null) {
		localStorage.setItem('msgridlist', 'list');
	} else {
		if (localStorage.getItem('msgridlist') === 'grid') {gridlistbtn.click();}
	}

	document.getElementById('bookshelf').classList.remove('noshow');
	document.getElementById('shelffooter').classList.remove('noshow');
}


// Debug function for writing info in name of in first line of TOC
function poptoc0 (xtext) {
	var x = document.getElementById('TOC0');
	x.innerHTML= xtext;
}

function getPlaceInBook () {
		//PLACE-IN-BOOK - gets the top element and it's top edge
		var lsTEname, lsTETEname;
		lsTEname= 'ms' + shortcode() + 'TE';
		lsTETEname = 'ms' + shortcode() + 'TETE';
		if ((localStorage.getItem(lsTEname) === null) && (localStorage.getItem(lsTETEname) === null)) {
			localStorage.setItem(lsTEname, "0");
			localStorage.setItem(lsTETEname, "0");
			theTopElement = 0;
			theTopElementTopEdge = 0;
		} else {
			theTopElement = parseInt(localStorage.getItem(lsTEname));
			theTopElementTopEdge = parseInt(localStorage.getItem(lsTETEname));
			scrollToNavTarget();
		}
		setTimeout(() => {
			scrollToNavTarget();
			fillProgressBar();
		}, 600); 

	}

function savePlaceInBook () {
	//PLACE-IN-BOOK - saves the top element and it's top edge
	var lsTEname, lsTETEname;
	lsTEname= 'ms' + shortcode() + 'TE';
	lsTETEname = 'ms' + shortcode() + 'TETE';
	localStorage.setItem(lsTEname, String(theTopElement));
	localStorage.setItem(lsTETEname, String(theTopElementTopEdge));
}

document.addEventListener('visibilitychange', function () {
	if (document.visibilityState === 'hidden') {
	  saveCookies();
	}
	hideSpinner();
  });

function finalExit() {
	showSpinner();
	saveCookies();
}

window.onunload = window.onbeforeunload = finalExit;


function saveCookies () {
if (!nuclearOption) {

	//Common Cookies
	//THEME
	var local_wiswobooks_theme = document.querySelector('input[name="themeRadio"]:checked').value;
	setCookie ('wiswobooks_theme', local_wiswobooks_theme,365);
	// is TOC open
	var local_wiswobooks_tocopen = sidebarIsOpen;
	setCookie("wiswobooks_tocopen", local_wiswobooks_tocopen,365);
	//FORCE-FULL-SCREEN
	var local_wiswobooks_ffs = document.getElementById("mobileUIAlwaysOnCheck").checked;
	setCookie('wiswobooks_ffs',local_wiswobooks_ffs,365);
	//FONT-SIZE
	var local_wiswobooks_font_size = document.getElementById("flvalue").innerHTML;
	setCookie("wiswobooks_font_size", local_wiswobooks_font_size,365);

	if (!isAudioBook()) {
		//Book-only Cookies
		//LINE-SPACING
		var local_wiswobooks_line_spacing = document.getElementById("lhvalue").innerHTML;
		setCookie('wiswobooks_line_spacing',local_wiswobooks_line_spacing,365);
		//MARGINS
		var local_wiswobooks_margins = document.querySelector('input[name="marginRadio"]:checked').value;
		setCookie ('wiswobooks_margins',local_wiswobooks_margins,365);
		//SERIF-FONT
		var local_wiswobooks_serif = document.getElementById("serifFont").checked;
		setCookie('wiswobooks_serif',local_wiswobooks_serif,365);
		//SHOW-PAGES
		var local_wiswobooks_showpages = document.getElementById("showPageCheck").checked;
		setCookie('wiswobooks_showpages',local_wiswobooks_showpages,365);
		//JUSTIFICATION
		var local_wiswobooks_justification = document.getElementById("justifyCheck").checked;
		setCookie('wiswobooks_justification',local_wiswobooks_justification,365);
		//HYPHENATION
		var local_wiswobooks_hyphenation = document.getElementById("hyphenCheck").checked;
		setCookie('wiswobooks_hyphenation',local_wiswobooks_hyphenation,365);
		//SHOW-PARAGRAPH-NUMBERS
		var local_wiswobooks_paranos_state = document.getElementById("showParaNosList").selectedIndex;
		setCookie ('wiswobooks_paranos_state',local_wiswobooks_paranos_state,365);
		//Place In Book
		savePlaceInBook();

	} else {
		//Audiobook-only Cookies
		// PLACE-IN-BOOK
		var cookieSourceIndexName = "wiswobooks_pib_"+ document.title.toLowerCase().replace(/\s+/g, '');
		var cookieDetailIndexName = cookieSourceIndexName+'_Para';
		setCookie(cookieSourceIndexName,currentaudiosourceindex,365);
		setCookie(cookieDetailIndexName,currentdetailindex,365);
		//SPEED
		setCookie('wiswoaudiobooks_speed', currentAudio.playbackRate,365);
		//VOLUME
		setCookie('wiswoaudiobooks_volume', currentAudio.volume, 365);
	}

	if (isBookShelf()) {
		//SORT
		var sort = getSort();
		var sortby = sort.sortby;
		var sortorder = sort.sortorder;
		localStorage.setItem('msssfSortBy', sortby);
		localStorage.setItem('msssfSortOrder', sortorder);

		//SEARCH ON
		if (document.getElementById('searchbyTitleAuthor').classList.contains('selected')) {
			localStorage.setItem('msssfSearchOn','TA');
		} else {
			localStorage.setItem('msssfSearchOn','SN');
		}

		//SEARCH INPUT
		if (bookSearchInput.value === undefined) {
			localStorage.setItem('msssfSearchInput', '');
		} else {
			localStorage.setItem('msssfSearchInput', bookSearchInput.value);
		}
		
		//FILTER ON
		var lsFilterOn = '';
		if (brahm == '') {
			lsFilterOn = lsFilterOn + 'X';
		} else {
			lsFilterOn = lsFilterOn + 'C';
		}
		if (brahmali == '') {
			lsFilterOn = lsFilterOn + 'X';
		} else {
			lsFilterOn = lsFilterOn + 'C';
		}
		if (chatchai == '') {
			lsFilterOn = lsFilterOn + 'X';
		} else {
			lsFilterOn = lsFilterOn + 'C';
		}
		if (sdhammika == '') {
			lsFilterOn = lsFilterOn + 'X';
		} else {
			lsFilterOn = lsFilterOn + 'C';
		}
		if (sujato == '') {
			lsFilterOn = lsFilterOn + 'X';
		} else {
			lsFilterOn = lsFilterOn + 'C';
		}

		if (sunyo == '') {
			lsFilterOn = lsFilterOn + 'X';
		} else {
			lsFilterOn = lsFilterOn + 'C';
		}

		localStorage.setItem('msssfFilterOn', lsFilterOn);


		//GRID or LIST
		if (listOrGrid == 'list') {
			localStorage.setItem('msgridlist', 'list');
		} else {
			localStorage.setItem('msgridlist', 'grid');
		} 
	}
}


}




// SETTINGS FUNCTIONS

mobileUIAlwaysOnCheck.onclick = function () {
	var wasSidebarOpen = sidebarIsOpen; //check if the sidebar was open as we have to close it and reopen it in mobile mode
	setFFS();
	hideSideNav();
	if (wasSidebarOpen){
		showElement(theTopBar);
		theTopBar.style.top = "0";
		showSideNav();
	}
	shadowSearchBar ();
}

function setFFS () {
	var ffsCheck = document.getElementById("mobileUIAlwaysOnCheck");
	if (ffsCheck.checked){
		forceMobileUI = true;
    } else {
        forceMobileUI = false;
    }	
}

showPageCheck.onclick = function () {
	settingTouched = true;
	setPageBreak(true);
	setPageBreakSize(true);
	restorePlaceInBook();
	//fillProgressBar();
}

function buildpageBreak(e) {
	var thepagenumber = e.getAttribute("data-page");
	var affect = '–';
	if (thepagenumber == '') { affect ='';}
	var wordcut = e.getAttribute("data-wordcut"); // is a word cut into two because of the page break, if so add a -
	if (wordcut === null) {wordcut ='';} else {wordcut ='&#x02014;';}
	e.innerHTML = wordcut + "<div class=pagenumber>"+affect+" " + thepagenumber + " "+affect+"</div><hr class='pagebreak'>";
}

function setPageBreak (islocal) {
		var elems = document.getElementsByClassName("pageno");
		var pageCheck = document.getElementById("showPageCheck");
		if (pageCheck.checked){
			if (islocal) {
				for (var i = 0; i < elems.length; i++) {
					if (isElementInViewport (elems[i])) {
						buildpageBreak(elems[i]);
					}
				}
				settingTouched = true;
			} else {
				for (var i = 0; i < elems.length; i++) {
					buildpageBreak(elems[i]);
				}
			}

		} else {
			if (islocal) {
				for (var i = 0; i < elems.length; i++) {
					if (isElementInViewport (elems[i])) {
						elems[i].innerHTML = "";
					}
				}
			} else {
				for (var i = 0; i < elems.length; i++) {
					elems[i].innerHTML = "";
				}
			}
		}	
}

function setPageBreakSize(islocal = false) {
	var pageCheck = document.getElementById("showPageCheck");
	if (pageCheck.checked) {
		var pagebreaks = document.getElementsByClassName("pagebreak");
		var book = document.getElementById("thebook");
		var bookleft = book.getBoundingClientRect().left;
		var bookright = book.getBoundingClientRect().right;
		if (islocal) {
			for(i=0;i<pagebreaks.length;i++){
				if (isElementInViewport (pagebreaks[i])) {
					var newleftmargin = parseInt(bookleft - pagebreaks[i].getBoundingClientRect().left);
					var newrightmargin = parseInt(pagebreaks[i].getBoundingClientRect().right - bookright);
					pagebreaks[i].style.marginLeft = newleftmargin + 'px';
					pagebreaks[i].style.marginRight = newrightmargin + 'px';
					var pagenumbershunt = newrightmargin - newleftmargin;
					if (pagenumbershunt !== 0) {
						pagebreaks[i].previousElementSibling.style.paddingRight = pagenumbershunt + 'px';
					}
				}
			}
		} else {
			for(i=0;i<pagebreaks.length;i++){
				var newleftmargin = parseInt(bookleft - pagebreaks[i].getBoundingClientRect().left);
				var newrightmargin = parseInt(pagebreaks[i].getBoundingClientRect().right - bookright);
				pagebreaks[i].style.marginLeft = newleftmargin + 'px';
				pagebreaks[i].style.marginRight = newrightmargin + 'px';
				var pagenumbershunt = newrightmargin - newleftmargin;
				if (pagenumbershunt !== 0) {
					pagebreaks[i].previousElementSibling.style.paddingRight = pagenumbershunt + 'px';
				}
			}
		}
	}
}



// JUSTIFICATION

function setJustify () {
	var bookPages = document.getElementById("thebook");
	var justificationCheck = document.getElementById("justifyCheck")
	if (justificationCheck.checked){
		bookPages.style.textAlign = "justify";
		document.querySelector(':root').style.setProperty('--textalign', 'justify');
    } else {
		bookPages.style.textAlign = "left";
		document.querySelector(':root').style.setProperty('--textalign', 'left');
    }	
}

function doJustifyCheck () {
	setJustify();
	//restorePlaceInBook();
	//fillProgressBar();
}

justifyCheck.onclick = function () {
	showSpinner(); // show spinner
	promiseToRunAsync(doJustifyCheck) // execute anync
	.then(() => {
		hideSpinner();
	});
}

// HYPHENATION

function doHyphenCheck () {
	setHyphenation();
	//restorePlaceInBook();
	//fillProgressBar();
}	

function setHyphenation () {
	var bookPages = document.getElementById("thebook");
	var hyphenationCheck = document.getElementById("hyphenCheck")
	if (hyphenationCheck.checked){
		bookPages.style.hyphens = "auto";
    } else {
		bookPages.style.hyphens = "none";
    }	
}

hyphenCheck.onclick = function () {
	showSpinner(); // show spinner
	promiseToRunAsync(doHyphenCheck) // execute anync
	.then(() => {
		hideSpinner();
	});
}



// FONT SIZE

function setFontLevel (level, start, end) {
	if (start < 0) {start = 0}
	if (end > savedBookElements.length) { end = savedBookElements.length }
	//if (start < 0) { start = 0}
	for (var i = start; i < end; i++) {
		switch (savedBookElements[i].tagName) {
			case 'P':
			case 'DIV':
			case 'H3':
			case 'H4':
			case 'H5':
			case 'LI':
			case 'DT':
			case 'DD':
				if (!isAudioBook()) {
					savedBookElements[i].style.fontSize = level+'px';
					document.querySelector(':root').style.setProperty('--fontsize', level+'px');
			};
				break;
			case 'SPAN':
				if (savedBookElements[i].className == 'pageno') {savedBookElements[i].style.fontSize = (level)+'px';}
				if (savedBookElements[i].className == 'chapnum') {savedBookElements[i].style.fontSize = (level*1.3)+'px';}
				break;
			case 'H1' :
				savedBookElements[i].style.fontSize = (level*2)+'px';
				break;
			case 'H2' :
				savedBookElements[i].style.fontSize = (level*1.2)+'px';
				break;
			case 'IMG':
				if (savedBookElements[i].className == 'emojify') {
					savedBookElements[i].style.width = (parseInt(level)+parseInt(level/3))+'px';
				}
				break;	
			}
	}	
}

function setTOCLevel (level) { // if level is between 16 and 24 set it to that otherwise set it to either 16 or 24
	if (level > 16)  {
		if (level <= 24) {
			for (var i = 0; i < savedTOCElements.length; i++) { 
				savedTOCElements[i].style.fontSize = level+'px';
			} 
		} else {
			for (var i = 0; i < savedTOCElements.length; i++) { 
				savedTOCElements[i].style.fontSize = '24px';
			}	
		}			
	} else {
		for (var i = 0; i < savedTOCElements.length; i++) { 
			savedTOCElements[i].style.fontSize = '16px';
		}
	}	
}

function setDetailsLevel (level) {
	for (var i = 0; i < savedDetailsElements.length; i++) {
		switch (savedDetailsElements[i].tagName) {
			case 'P':
			case 'FIGCAPTION':
			case 'LI':
			case 'TABLE':
				savedDetailsElements[i].style.fontSize = level+'px';
				break;
			case 'H1' :
				savedDetailsElements[i].style.fontSize = (level*2)+'px';
				break;
			case 'H2' :
				savedDetailsElements[i].style.fontSize = (level*1.2)+'px';
				break;
			}
	}
}	

function setNotesLevel (level) {
	for (var i = 0; i < savedNotesElements.length; i++) {
		savedNotesElements[i].style.fontSize = level+'px';
	}
}	

document.getElementById("decfont").onclick = function () { // minus button
	var fontlevel = parseInt(document.getElementById("flvalue").innerHTML);
	if (fontlevel > 9) {
		fontlevel = fontlevel -1;
		settingTouched = true;
		document.getElementById("flvalue").innerHTML = fontlevel;
		setFontLevel(fontlevel, theTopElement-5, theTopElement+150);
		setTOCLevel (fontlevel);
		restorePlaceInBook();
	}
}

document.getElementById("incfont").onclick = function () { //plus button
	var fontlevel = parseInt(document.getElementById("flvalue").innerHTML);
	if (fontlevel < 32) {
		fontlevel = fontlevel +1;
		settingTouched = true;
		document.getElementById("flvalue").innerHTML = fontlevel;
		setTOCLevel (fontlevel);
		setFontLevel(fontlevel, theTopElement-5, theTopElement+150);
		restorePlaceInBook();
	}
}

// LINE SPACING

function setLH (level, start, end) {
	if (start < 0) {start = 0}
	if (end > savedBookElements.length) { end = savedBookElements.length }
	for (var i = start; i < end; i++) {
		switch (savedBookElements[i].tagName) {
			case 'P':
			case 'DIV':
			case 'LI':
			case 'DT':
			case 'DD':				
				savedBookElements[i].style.lineHeight = level;
				break;
			}
	}	
}

declh.onclick = function () {
	var lhlevel = parseFloat(document.getElementById("lhvalue").innerHTML);
	if (lhlevel > 1) {
		lhlevel = lhlevel -0.1;
		settingTouched = true;
		document.getElementById("lhvalue").innerHTML = Math.round(lhlevel * 100)/100;
		setLH (lhlevel, theTopElement-5, theTopElement+150);
		restorePlaceInBook();
	}	
}

inclh.onclick = function () {
	var lhlevel = parseFloat(document.getElementById("lhvalue").innerHTML);
	if (lhlevel < 3) {
		lhlevel = lhlevel + 0.1;
		settingTouched = true;
		document.getElementById("lhvalue").innerHTML = Math.round(lhlevel * 100)/100;
		setLH (lhlevel, theTopElement-5, theTopElement+150);
		restorePlaceInBook();
	}
} 

  

//THEMES

radioSimple.onclick = function () {
	setTheme ();
}
radioSimpleDark.onclick = function () {
	setTheme ();
}
radioSepia.onclick = function () {
	setTheme ();
}
function setTheme(){

	var whatIsPressed = document.querySelector('input[name="themeRadio"]:checked').value;

	var theBody = document.getElementById("thebody");
	var bookPages = document.getElementById("thecontent"); 

	//var theProgCont = document.getElementById("prog-cont"); 
	//var theProgBar = document.getElementById("progressBar");

	var theTocBtn = document.getElementById("tocBtn");	
	var theTocBtn2 = document.getElementById("tocbtn2");
	var theTocNav = document.getElementById("tocnav");

	var imgs = document.querySelectorAll("img");
	var righticons = document.querySelectorAll(".topnav-right > a > img ");
	var righticonstext = document.querySelectorAll(".topnav-right > a > p");
	var lefticons = document.querySelectorAll(".topnav-left > a > img");

	var shbuttons = document.querySelectorAll(".settingsheadersright > button");

	var searchbuttons = document.querySelectorAll(".sbbutton");

	var margicons = document.getElementsByClassName("marginicons");

	var fleurons = document.getElementsByClassName("fleuron");

	var searchBar = document.getElementById("SearchBar");
	var searchInput = document.getElementById("SearchInput");

	var r = document.querySelector(':root');

	switch (whatIsPressed) {

		case "simple":

			for( var i = 0; i < imgs.length; i++ ) {
				imgs[i].style.filter="brightness(1) contrast(1) ";
			}

			for( var i = 0; i < righticons.length; i++ ) {
				righticons[i].style.filter="invert(0)";
			}
			for( var i = 0; i < righticonstext.length; i++ ) {
				righticonstext[i].style.color = '#000';
			}
			
			//lefticons[1].style.filter="invert(0)";
			lefticons[0].style.filter="invert(0) hue-rotate(0) saturate(1) brightness(1) contrast(1) grayscale(0) sepia(0) ";

			theBody.style.background = '#f7f7f7';
			bookPages.style.background = '#fff';
			bookPages.style.color = '#000'; 

			theTopBar.style.background = '#fff';
			theTopBar.style.boxShadow = '0 2px 6px 0 #777';
			//theProgCont.style.background = '#eee';
			//theProgCont.style.filter = 'brightness(1)';

			theTocBtn.style.color = '#000';
			theTocBtn2.style.color = '#000';
			theTocBtn2.style.background = '#fff';	

			theTocNav.style.background = '#fff';
			theTocNav.style.color = '#000';

			theTocNav.classList.add('bright-scroll');
			theTocNav.classList.add('bright-scroll-track');
			theTocNav.classList.add('bright-scroll-thumb');
			theTocNav.classList.remove('dark-scroll'); 
			theTocNav.classList.remove('dark-scroll-track');
			theTocNav.classList.remove('dark-scroll-thumb');
			theTocNav.classList.remove('mellow-scroll'); 
			theTocNav.classList.remove('mellow-scroll-track');
			theTocNav.classList.remove('mellow-scroll-thumb');

			theTocNav.style.boxShadow = '6px 0 6px -3px #888';

			document.getElementsByTagName('meta')["theme-color"].content = "#fff";

			setModalTheme ("Simple");

			for(i=0;i<shbuttons.length;i++){
				if ((shbuttons[i].id == 'decfont') || (shbuttons[i].id == 'declh')) {
					shbuttons[i].style.backgroundImage  = "url('../_resources/images/icons/minus.svg')";
				} else {
					shbuttons[i].style.backgroundImage  = "url('../_resources/images/icons/add.svg')";
				}
			}

			for(i=0;i<margicons.length;i++){
				margicons[i].style.filter = "invert(0)";
			}

			for(i=0;i<fleurons.length;i++){
				fleurons[i].style.filter = "invert(0)";
			}

			searchBar.style.background = "#fff";
			searchBar.style.color = "#000";
//			searchBar.style.borderColor = "#000";

			searchInput.style.background = "#fff";
			searchInput.style.color = "#000";
			searchInput.style.setProperty ("--c", "#6d6d6d");
			searchInput.style.setProperty ("--f", "invert(0)");
			
			for(i=0;i<searchbuttons.length;i++){
				searchbuttons[i].style.color = "#000";
			}


			if (isAudioBook()) {
				r.style.setProperty('--audioplayercont', 'unset');
				r.style.setProperty('--audiobuttoncontcolor', '#ffffff');
				r.style.setProperty('--audiobuttoncontcontcolor', '#ffffffc1');
				r.style.setProperty('--audiobuttoncolor', '#c9d5fc');
				r.style.setProperty('--audioborders', '#c9d5fc');
				r.style.setProperty('--canvasbackground', '#ffffff');
				r.style.setProperty('--audiobuttonhovercolor', '#c9d5fc');
				r.style.setProperty('--audiosliderhovercolor', '#c9d5fc');
				var audiobookcover = document.getElementById("bookimage");
				audiobookcover.style.filter = "grayscale(0) sepia(0)  opacity(1)";
				var buttontext = document.querySelectorAll("#button-cont button");
				for (var i = 0; i < buttontext.length; i++) {
					buttontext[i].style.color = "#000";
				}
				var vd = document.getElementById('vol-down');
				var vu = document.getElementById('vol-up');
				vd.style.filter="invert(0)";
				vu.style.filter="invert(0)";
				playerVisualisationColor ="#c9d5fc";
			}

			if (isBookShelf()) {
				var glb = document.getElementById('gridlistBtn');
				glb.style.filter="invert(0)";
				r.style.setProperty('--ascdescfilter', 'none');
				var sni = document.getElementById('suttanumberinfo');
				sni.style.filter="invert(0)";
			}

			r.style.setProperty('--TOCprogress', '#0000001f'); //'#f0f2fd80');
			r.style.setProperty('--TOChighlighter', '#00000037'); //'#e3e7fdc0');
			r.style.setProperty('--primarytextcolor', '#000');
			r.style.setProperty('--secondarytextcolor', '#5a5a81');//'#577096');
			r.style.setProperty('--primarybackground', '#fff');

			r.style.setProperty('--pickedtext', '#1c222b');
			r.style.setProperty('--buttontext', '#000');
			r.style.setProperty('--buttonbackground', '#f0f2fd');
			r.style.setProperty('--sliderbackground', '#c9d5fc');
			r.style.setProperty('--primarycolor', '#06036ea0');
			r.style.setProperty('--listlinkhover', '#d5dcfd60');
			r.style.setProperty('--bdtexthighlighter', '#e0f4fb');//'#eef0fb');

			r.style.setProperty('--tablecaption', '#dadada');
			r.style.setProperty('--tablehead', '#c9c9c9');
			r.style.setProperty('--tableodd', '#f2f2f2');
			r.style.setProperty('--tableeven', '#e1e1e1');
			r.style.setProperty('--tablefoot', '#ececec');

			r.style.setProperty('--scsegmentnumbercolor', '#9e2815');

			var engrave = document.getElementById('coverengraving');
			engrave.style.color ='#bdbdbd';
			engrave.style.textShadow ='0px 1px 0px #000000';

			themeName = "Simple";
			break;

		case "simpledark":
			for( var i = 0; i < imgs.length; i++ ) {
				imgs[i].style.filter="brightness(.8) contrast(1.2) grayscale(60%)";
			}
			for( var i = 0; i < righticons.length; i++ ) {
				righticons[i].style.filter="invert(75%)";
			}
			for( var i = 0; i < righticonstext.length; i++ ) {
				righticonstext[i].style.color = '#d7d7d7';
			}
			//lefticons[1].style.filter="invert(35%)";
			lefticons[0].style.filter="invert(75%)";

			theBody.style.background = '#000';
			bookPages.style.background = '#121212';
			bookPages.style.color = '#d7d7d7';

			theTopBar.style.background = '#121212';
			theTopBar.style.boxShadow = '0 1px 0 1px #595959';
			//theProgCont.style.background = '#414141';
			//theProgCont.style.filter = 'brightness(.8)';

			theTocBtn.style.color = '#cfcfcf';
			theTocBtn2.style.color = '#cfcfcf';
			theTocBtn2.style.background = '#121212';	

			theTocNav.style.background = '#121212';
			theTocNav.style.color = '#cfcfcf';
			theTocNav.classList.remove('mellow-scroll'); 
			theTocNav.classList.remove('mellow-scroll-track');
			theTocNav.classList.remove('mellow-scroll-thumb');
			theTocNav.classList.remove('bright-scroll'); 
			theTocNav.classList.remove('bright-scroll-track');
			theTocNav.classList.remove('bright-scroll-thumb');
			theTocNav.classList.add('dark-scroll'); // the test
			theTocNav.classList.add('dark-scroll-track'); // the test
			theTocNav.classList.add('dark-scroll-thumb'); // the test
			theTocNav.style.boxShadow = '2px 0 2px 1px #595959';
			
			document.getElementsByTagName('meta')["theme-color"].content = "#121212";

			setModalTheme ("SimpleDark") 

			for(i=0;i<shbuttons.length;i++){
				if ((shbuttons[i].id == 'decfont') || (shbuttons[i].id == 'declh')) {
					shbuttons[i].style.backgroundImage  = "url('../_resources/images/icons/minus-gray.svg')";
				} else {
					shbuttons[i].style.backgroundImage  = "url('../_resources/images/icons/add-gray.svg')";
				}
			}

			for(i=0;i<margicons.length;i++){
				margicons[i].style.filter = "invert(100%)";
			}
			for(i=0;i<fleurons.length;i++){
				fleurons[i].style.filter = "invert(1)";
			}

			searchBar.style.background = "#121212";
			searchBar.style.color = "#cfcfcf";
//			searchBar.style.borderColor = "#cfcfcf";

			searchInput.style.background = "#121212";
			searchInput.style.color = "#cfcfcf";
			searchInput.style.setProperty ("--c", "#cfcfcf");
			searchInput.style.setProperty ("--f", "invert(1)");

			for(i=0;i<searchbuttons.length;i++){
				searchbuttons[i].style.color = "#cfcfcf";
			}

			if (isAudioBook()) {
				r.style.setProperty('--audioplayercont', '#000');
				r.style.setProperty('--audiobuttoncontcolor', '#121212');
				r.style.setProperty('--audiobuttoncontcontcolor', '#12121251');
				r.style.setProperty('--audiobuttoncolor', '#475f7a');
				r.style.setProperty('--audioborders', '#475f7a');
				r.style.setProperty('--canvasbackground', '#121212');
				r.style.setProperty('--audiobuttonhovercolor', '#475f7a');
				r.style.setProperty('--audiosliderhovercolor', '#475f7a');
				var audiobookcover = document.getElementById("bookimage");
				audiobookcover.style.filter = "grayscale(0.7) sepia(0) opacity(0.5)";
				var buttontext = document.querySelectorAll("#button-cont button");
				for (var i = 0; i < buttontext.length; i++) {
					buttontext[i].style.color = "#cfcfcf";
				}
				var vd = document.getElementById('vol-down');
				var vu = document.getElementById('vol-up');
				vd.style.filter="invert(0)";
				vu.style.filter="invert(0)";
				playerVisualisationColor ='#475f7a';
			}

			if (isBookShelf()) {
				var glb = document.getElementById('gridlistBtn');
				glb.style.filter="invert(75%)";
				var sni = document.getElementById('suttanumberinfo');
				sni.style.filter="invert(75%)";
			}

			r.style.setProperty('--primarytextcolor', 'darkblue');
			r.style.setProperty('--secondarytextcolor', '#c4cdda');
			r.style.setProperty('--primarybackground', '#121212');

			r.style.setProperty('--TOCprogress', '#475f7a');
			r.style.setProperty('--TOChighlighter', '#667b9ea0');
			r.style.setProperty('--pickedtext', '#cfcfcf');
			r.style.setProperty('--buttontext', '#cfcfcf');
			r.style.setProperty('--buttonbackground', '#475f7a');
			r.style.setProperty('--sliderbackground', '#475f7a');
			r.style.setProperty('--primarycolor', '#667b9e');
			r.style.setProperty('--listlinkhover', '#9db4ff40');
			r.style.setProperty('--bdtexthighlighter', '#484c5e');

			r.style.setProperty('--tablecaption', '#252525');
			r.style.setProperty('--tablehead', '#363636');
			r.style.setProperty('--tableodd', '#0d0d0d');
			r.style.setProperty('--tableeven', '#1e1e1e');
			r.style.setProperty('--tablefoot', '#131313');

			r.style.setProperty('--scsegmentnumbercolor', '#d39990');

			var engrave = document.getElementById('coverengraving');
			engrave.style.color ='#7c7c7c';
			engrave.style.textShadow ='0px 1px 0px #ffffff';

			themeName = "SimpleDark";
		  	break;

		case "sepia":


			for( var i = 0; i < imgs.length; i++ ) {
				imgs[i].style.filter="brightness(1) contrast(1) sepia(40%) grayscale(10%)";
			}

			for( var i = 0; i < righticons.length; i++ ) {
				righticons[i].style.filter="invert(5%) sepia(94%) saturate(6660%) hue-rotate(231deg) brightness(108%) contrast(144%)";
			}
			for( var i = 0; i < righticonstext.length; i++ ) {
				righticonstext[i].style.color = '#191892';
			}

			//lefticons[1].style.filter="invert(0)";
			lefticons[0].style.filter="invert(5%) sepia(94%) saturate(6660%) hue-rotate(231deg) brightness(108%) contrast(144%)";
			
			theBody.style.background = '#f1e8bb';
			bookPages.style.backgroundImage = 'url("../_resources/images/themes/paper1.jpg")';
			bookPages.style.color = '#382500'; 

			theTopBar.style.background = '#f5efd0';
			theTopBar.style.boxShadow = '0 2px 6px 0 #777';
			//theProgCont.style.background = '#ccc';
			//theProgCont.style.filter = 'brightness(1)';

			theTocBtn.style.color = '#00008b';

			theTocBtn2.style.color = '#00008b';
			theTocBtn2.style.background =  '#f5efd0';	
	
			theTocNav.style.background = '#f5efd0';
			theTocNav.style.color = '#382500'; //'#5e4102';

			theTocNav.classList.remove('bright-scroll');
			theTocNav.classList.remove('bright-scroll-track');
			theTocNav.classList.remove('bright-scroll-thumb');
			theTocNav.classList.remove('dark-scroll'); 
			theTocNav.classList.remove('dark-scroll-track');
			theTocNav.classList.remove('dark-scroll-thumb'); 
			theTocNav.classList.add('mellow-scroll'); 
			theTocNav.classList.add('mellow-scroll-track');
			theTocNav.classList.add('mellow-scroll-thumb');
			theTocNav.style.boxShadow = '6px 0 6px -3px #888';

			document.getElementsByTagName('meta')["theme-color"].content = "#f5efd0";

			setModalTheme ("Sepia");

			for(i=0;i<shbuttons.length;i++){
				if ((shbuttons[i].id == 'decfont') || (shbuttons[i].id == 'declh')) {
					shbuttons[i].style.backgroundImage  = "url('../_resources/images/icons/minus-blue.svg')";
				} else {
					shbuttons[i].style.backgroundImage  = "url('../_resources/images/icons/add-blue.svg')";
				}
			}

			for(i=0;i<margicons.length;i++){
				margicons[i].style.filter = "invert(5%) sepia(94%) saturate(6660%) hue-rotate(231deg) brightness(108%) contrast(144%)";
			}

			for(i=0;i<fleurons.length;i++){
				fleurons[i].style.filter = "invert(0)";
			}

			searchBar.style.background = "#f5efd0";
			searchBar.style.color = "#00008b";
//			searchBar.style.borderColor = "#00008b";

			searchInput.style.background = "#f5efd0";
			searchInput.style.color = "#00008b";
			searchInput.style.setProperty ("--c", "#00008b");
			searchInput.style.setProperty ("--f", "#000089");

			for(i=0;i<searchbuttons.length;i++){
				searchbuttons[i].style.color = "#00008b";
			}			

			/*
			for( var i = 0; i < tables.length; i++ ) {
				tables[i].style.filter = "sepia(55%) contrast(95%)";
			}	
*/

			if (isAudioBook ()) {
				r.style.setProperty('--audioplayercont', 'unset');
				r.style.setProperty('--audiobuttoncontcolor', '#f4edc9');
				r.style.setProperty('--audiobuttoncontcontcolor', '#f5efd0b1');
				r.style.setProperty('--audiobuttoncolor', '#cea140');
				r.style.setProperty('--audioborders', '#cea140');
				r.style.setProperty('--canvasbackground', '#f6f1d6');
				r.style.setProperty('--audiobuttonhovercolor', '#d3aa52b1');
				r.style.setProperty('--audiosliderhovercolor', '#d3aa52');
				var audiobookcover = document.getElementById("bookimage");
				audiobookcover.style.filter = "grayscale(0) sepia(60%) opacity(0.8)";
				var buttontext = document.querySelectorAll("#button-cont button");
				for (var i = 0; i < buttontext.length; i++) {
					buttontext[i].style.color = "#382500";
				}
				var vd = document.getElementById('vol-down');
				var vu = document.getElementById('vol-up');
				vd.style.filter="invert(100%)";
				vu.style.filter="invert(100%)";
				playerVisualisationColor ="#cea147";
			}

			if (isBookShelf()) {
				var glb = document.getElementById('gridlistBtn');
				glb.style.filter="invert(5%) sepia(94%) saturate(6660%) hue-rotate(231deg) brightness(108%) contrast(144%)";
				var sni = document.getElementById('suttanumberinfo');
				sni.style.filter="invert(0)";
			}

			r.style.setProperty('--TOCprogress', '#eadbbf');
			r.style.setProperty('--TOChighlighter', '#eadbbf');
			r.style.setProperty('--primarytextcolor', '#000');
			r.style.setProperty('--secondarytextcolor', '#5c0909');
			r.style.setProperty('--primarybackground', '#f8f4da');

			r.style.setProperty('--pickedtext', '#5c0909');
			r.style.setProperty('--buttontext', '#382500');
			r.style.setProperty('--buttonbackground', '#ecd38d');
			r.style.setProperty('--sliderbackground', '#ecd38d');
			r.style.setProperty('--primarycolor', '#cea140');
			r.style.setProperty('--listlinkhover', '#cea14030');
			r.style.setProperty('--bdtexthighlighter', '#ffed79') //'#eee5c2');

			r.style.setProperty('--tablecaption', '#f9edce');
			r.style.setProperty('--tablehead', '#eadbbf');
			r.style.setProperty('--tableodd', '#f9f9e4');
			r.style.setProperty('--tableeven', '#f9f4d5');
			r.style.setProperty('--tablefoot', '#f9f9df');

			r.style.setProperty('--scsegmentnumbercolor', '#9e2815');

			var engrave = document.getElementById('coverengraving');
			engrave.style.color ='#bdbdbd';
			engrave.style.textShadow ='0px 1px 0px #000000';
			
			themeName = "Sepia";
		  	break;

		case  "bookdark":
		  themeName = "BookDark";
	  }

}

//MARGINS

function doSetMargin () {
	setMargin();
	restorePlaceInBook();
	setPageBreak(true);
	setPageBreakSize(true);
}	

radioMargNarrow.onclick = function () {
    showSpinner(); // show spinner
    promiseToRunAsync(doSetMargin) // execute anync
    .then(() => {
        hideSpinner();
	});
}
radioMargMid.onclick = function () {
    showSpinner(); // show spinner
    promiseToRunAsync(doSetMargin) // execute anync
    .then(() => {
        hideSpinner();
	});
}
radioMargWide.onclick = function () {
    showSpinner(); // show spinner
    promiseToRunAsync(doSetMargin) // execute anync
    .then(() => {
        hideSpinner();
	});
}

function setMargin() {
	var whatIsPressed = document.querySelector('input[name="marginRadio"]:checked').value;
	var thebook = document.getElementById("thebook");
	switch (whatIsPressed) {

		case "narrowmargin":	
			thebook.style.paddingLeft = '2%';
			thebook.style.paddingRight = '2%';
			marginName = "narrowmargin";
			break;
		case "midmargin":
			thebook.style.paddingLeft = '10%';
			thebook.style.paddingRight = '10%';
			marginName = "midmargin";
			break;
		case "widemargin":
			thebook.style.paddingLeft = '20%';
			thebook.style.paddingRight = '20%';
			marginName = "widemargin";
		}
}

serifFont.onclick = function () {
	settingTouched = true;
	setSerif(theTopElement-2, theTopElement+150);
	//restorePlaceInBook ();
}

function setSerif (start, end) {
	if (start < 0) {start = 0}
	if (end > savedBookElements.length) { end = savedBookElements.length }

	if (document.getElementById('serifFont').checked) {
			for (var i = start; i < end; i++) {	
				if ((savedBookElements[i].tagName == 'P') || (savedBookElements[i].tagName == 'DIV') || (savedBookElements[i].tagName == 'LI') || (savedBookElements[i].tagName == 'DT') || (savedBookElements[i].tagName == 'DL')) {
					savedBookElements[i].style.fontFamily = 'Source Serif Pro';
				}
			}
	} else {
		for (var i = start; i < end; i++) {	
			if ((savedBookElements[i].tagName == 'P') || (savedBookElements[i].tagName == 'DIV') || (savedBookElements[i].tagName == 'LI') || (savedBookElements[i].tagName == 'DT') || (savedBookElements[i].tagName == 'DL')) {
				savedBookElements[i].style.fontFamily = 'Source Sans Pro';
			}
		}
	}
}	


function doParaNosList () {
	setParaNumbers();
	//fillProgressBar();
}	

showParaNosList.onchange = function () {
    showSpinner(); // show spinner
    promiseToRunAsync(doParaNosList) // execute anync
    .then(() => {
        hideSpinner();
	});
}

function setParaNumbers () {
	var ParaNosList = document.getElementById("showParaNosList");
	var parastate = ParaNosList.selectedIndex;

	var wholebook = document.getElementById("thecontent");
	var section  = document.querySelectorAll(".content h1");
	var subsection  = document.querySelectorAll(".content h2");

	/* THE parastate variable is ...
			0 = Do not show numbers 
			1 = Count by whole book
			2 = Count by section
			3 = Count by subsection
	*/

	switch (parastate) {
		case 0: {
			wholebook.classList.remove('paracounterreset');
			for( var i = 0; i < section.length; i++ ) {
				section[i].classList.remove('paracounterreset');	
			}
			for( var i = 0; i < subsection.length; i++ ) {
				subsection[i].classList.remove('paracounterreset');	
			}
			break;
		}
		case 1: {
			wholebook.classList.add('paracounterreset');
			for( var i = 0; i < section.length; i++ ) {
				section[i].classList.remove('paracounterreset');	
			}
			for( var i = 0; i < subsection.length; i++ ) {
				subsection[i].classList.remove('paracounterreset');	
			}
			break;
		}
		case 2: {
			wholebook.classList.remove('paracounterreset');
			for( var i = 0; i < section.length; i++ ) {
				section[i].classList.add('paracounterreset');	
			}
			for( var i = 0; i < subsection.length; i++ ) {
				subsection[i].classList.remove('paracounterreset');	
			}
			break;
		}
		case 3: {
			wholebook.classList.remove('paracounterreset');
			for( var i = 0; i < section.length; i++ ) {
				section[i].classList.add('paracounterreset');	
			}
			for( var i = 0; i < subsection.length; i++ ) {
				subsection[i].classList.add('paracounterreset');	
			}
			break;
		}
	}
	var allpara = document.querySelectorAll(".content p");
	//var allquotes = document.querySelectorAll(".content div.quote");
	if (parastate > 0) {
		for( var i = 0; i < allpara.length; i++ ) {
			allpara[i].classList.add('parashow');	
		}
		/*
		for( var i = 0; i < allquotes.length; i++ ) {
			allquotes[i].classList.add('parashow');	
		}
		*/
	} else {
		for( var i = 0; i < allpara.length; i++ ) {
			allpara[i].classList.remove('parashow');	
		}
		/*
		for( var i = 0; i < allquotes.length; i++ ) {
			allquotes[i].classList.remove('parashow');	
		}
		*/	
	}
}



window.onpopstate = function (event) {
	var scroller = history.state.scrollState;
	window.scrollTo(0, scroller);
}


// NAVIGATION FUNCTIONS

function scrollToID (id) {
	exitStaticModal();
	var scroller = Math.floor(window.scrollY);
	if ( history.state.scrollState != scroller) { 
		history.pushState({scrollState: scroller},'',''); // for the back button to work see onpopstate above
	}
	var elmnt = document.getElementById(id);
	let parentElmnt = elmnt.parentElement;
	if (parentElmnt.classList.contains('booknote')) {
		setModalStyle ("Notes");
		showModal("Notes");
		savedsup = elmnt;
		clearhighlightnote();
		highlightnote(parentElmnt.dataset.note); 
		stopBookScroll ();

	} else {
		elmnt.scrollIntoView({block: 'start', behavior: 'auto',});
		window.scrollBy(0, -150);
		//bodge for the highlight - needs a better mechanism for highlighting
		savedsup = elmnt;
		clearhighlightnote();
	}
	scroller = Math.floor(window.scrollY);
	history.pushState({scrollState: scroller},'',''); // for the back button to work see onpopstate above	
}

function goToTOCTarget (toctarget) {
	var scroller = Math.floor(window.scrollY);
	if ( history.state.scrollState != scroller) { 
		history.pushState({scrollState: scroller},'',''); // for the back button to work see onpopstate above
	}
	var elmnt = document.getElementById(toctarget);
	elmnt.scrollIntoView();
	var tbHeight = -Math.abs(parseFloat(((window.getComputedStyle(document.getElementById("topbar")).height))));
	window.scrollBy(0, tbHeight); // scroll the toctarget below the topnav bar so you can see it
	scroller = Math.floor(window.scrollY);
	history.pushState({scrollState: scroller},'',''); // for the back button to work see onpopstate above	
}

// TOC Navigation - uses event delegation on UL LI
document.getElementById("TOC").addEventListener("click", function(e) {
	if ((forceMobileUI) && (!(isBookShelf()))) {
		hideSideNav ();
	}
	// e.target is the clicked element!
	// If it was a list item
	if(e.target && e.target.nodeName == "LI") {

		var loadaudio = 0;
		var loadpara = 0;
		if (isAudioBook()) {
			for (let i = 0; i < alltoc.length; i++) {
				if (e.target.id == alltoc[i][0]) {
					loadaudio = alltoc[i][1];
					loadpara = alltoc[i][2];
					break;
				}	
			}
			playthis(loadaudio,loadpara);

		} else {
			if (!(e.target.classList.contains('notTOC'))) { // if there isn't a class notTOC on the li
				var tocNumber = e.target.id.replace("TOC", "");
				var toctarget = "TOCTarget" + tocNumber;
				goToTOCTarget(toctarget);
			}
		}
	}
});

// hide and show the top and bottom bars by placing them off canvas when window is scrolled up (show) and down (hide) - 
// this is a automatic setting mobileUI or the user-setting/cookie forceMobileUI. Then set progress bar

window.onscroll = function() {
	var currentScrollPos = window.pageYOffset;
	if (forceMobileUI) {
		if (sidebarIsOpen == false){
			if ((prevScrollpos > currentScrollPos)) { // show top bar when scrolling up
				theTopBar.style.top = "0";

			} else {  // hide top bar when scrolling down
				theTopBar.style.top = "-120px";
			}
		} else {
			theTopBar.style.top = "-120px";
		}
	} else {
		theTopBar.style.top = "0";
	}
	prevScrollpos = currentScrollPos;
	//populate progress bar
	fillProgressBar();
	// save position
	getNavTarget();
	//savePlaceInBook();
}


function afterResize() {
	setPageBreak(false);
	setPageBreakSize();
}

var doit;

window.addEventListener('resize', function () {
	scrollToNavTarget();
	clearTimeout(doit);
	doit = setTimeout(afterResize, 100);
});

var savedHeadingsElements = thebook.querySelectorAll("h1[id], h2[id], h3[id]");

function fillProgressBar() {

	var tbHeight = Math.abs(parseFloat(((window.getComputedStyle(document.getElementById("topbar")).height))));
	var currentTOCTarget = '';
	for (var i = 0; i < savedHeadingsElements.length; i++) {
		currentTOCTarget = savedHeadingsElements[i].id;
		if (savedHeadingsElements[i].getBoundingClientRect().top > tbHeight+5) {
			break;
		}
	}
	var currentTOC = currentTOCTarget.replace('Target', '');

	if (currentTOC !== '') {
		for (var i = 0; i < savedTOCElements.length; i++) {
			savedTOCElements[i].style.background = 'unset';
			savedTOCElements[i].style.opacity = '1';
			savedTOCElements[i].setAttribute('data-progress', '');
		}
		for (var i = 0; i < savedTOCElements.length; i++) {
			if (savedTOCElements[i].id !== currentTOC) {
				savedTOCElements[i].style.background = 'var(--TOCprogress)';
				savedTOCElements[i].style.opacity = '0.4';
			} else {
				savedTOCElements[i-1].style.opacity = '1';
				savedTOCElements[i-1].scrollIntoView({block: 'center', behavior: 'auto',});
				var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
				var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
				var scrolled = Math.floor(((winScroll / height) * 100)* 10) /10;
				if (!isNaN(scrolled)) {
					savedTOCElements[i-1].setAttribute('data-progress',scrolled.toFixed(1) + '%');
				} 
				break;
			}
		}
	}
	
}

//Open and close the TOC (Table of Contents) side navigation bar
var tocbtn = document.getElementById("tocBtn");

tocbtn.onclick = function() {
	if (sidebarIsOpen == true) {
		hideSideNav();
	} else {
		showSideNav();
	}
}

var fsTOCTopElement = 0; // fix for errant scrolling of main window in ffs mode  

function showSideNav() {
	var elem = document.getElementById("tocnav");
	sidebarIsOpen = true;
	var tb = document.getElementById("tocbtn2"); // the fullscreen mobile TOC '<Contents' btn
	getNavTarget();
	if (forceMobileUI) {
		fsTOCTopElement = theTopElement;
		elem.style.top = "0";
		elem.style.width = "100%";
		showElement(tb);
		document.getElementById("tocbtn2").style.display = "block";
		hideElement(theTopBar);		
		document.getElementById("TOC").style.paddingTop ="50px";
		if(isBookShelf()) {
			var blc = document.getElementById('bookListCount');
			blc.style.top='5px';
		}
	} else {
		var tocposition = document.getElementById("tocBtn").getBoundingClientRect().bottom;
		elem.style.top = tocposition;
		if (isBookShelf()) {
			elem.style.width = "30%";	
		} else {
			elem.style.width = "25%";	
		}
		hideElement(tb)
		if (isBookShelf()) {
			document.getElementById("bookwrap").style.marginLeft = "30%";
		} else {
			document.getElementById("bookwrap").style.marginLeft = "25%";
		}

		document.getElementById("TOC").style.paddingTop ="100px";
		scrollToNavTarget ();
		
		if(isBookShelf()) {
			var blc = document.getElementById('bookListCount');
			blc.style.top='-100px';
		}
	}
	if (isBookShelf()) {
		tocbtn.innerHTML = "&#10094; Find";
	} else {
		tocbtn.innerHTML = "&#10094; Contents";
	}

	//setTimeout(() => { tocnav.scrollTo({top:TOCscrollpos,}) }, 100);
	setTimeout(() => {
		fillProgressBar();
	}, 500);
}


//var TOCscrollpos = 0; // TOC position used when hiding and showing the TOC, initialised from local storage 

function hideSideNav() {
	//TOCscrollpos = tocnav.scrollTop;
	if (forceMobileUI) {
		showElement(theTopBar);
		document.getElementById("tocbtn2").style.display = "none";
		setTimeout (wiggle,300);
	} else {
		getNavTarget();
	}
	var elem = document.getElementById("tocnav");
	elem.style.width = "0";
	sidebarIsOpen = false;
	document.getElementById("bookwrap").style.marginLeft = "0";	
	if (isBookShelf()) {
		tocbtn.innerHTML = "&#10095; Find"; 
	} else {
		tocbtn.innerHTML = "&#10095; Contents";
	}
	scrollToNavTarget();
	if(isBookShelf()) {
		var blc = document.getElementById('bookListCount');
		blc.style.top='-100px';
	}
}

function closeFromTocbtn2 () { 
	theTopElement = fsTOCTopElement;
	hideSideNav();
}

function wiggle () { // to get the topbar to scroll into view after navigation
	window.scrollBy(0, 1); 
	window.scrollBy(0,-1);
}


// theMettaShelf Button
var homebtn = document.getElementById('homebutton');

homebtn.onclick = function() {
	stopBookScroll();
	savePlaceInBook();
	startBookScroll();
	window.location.href = '../';
}


// MODALS

// Get the modal
var modal = document.getElementById('Modal');
var modalheader = document.getElementById('ModalHeader');
var modalheadertext = document.getElementById('ModalHeaderText');
var modalcontent = document.getElementById('ModalContent');
var modalbody = document.getElementById("ModalBody");

var settingsadv = document.getElementById('SettingsAdv');

// Get the content in the modal body
//var modalsearch = document.getElementById('ModalSearch');
var modaldetails = document.getElementById('ModalDetails');
var modalsettings = document.getElementById('ModalSettings');
var modaldownload = document.getElementById('ModalDownload');
var modalalert = document.getElementById('ModalDownloadAlert');
var modalnotes = document.getElementById('ModalNotes');
var modalsutta = document.getElementById('ModalSutta');


// Get the buttons that open the modals
var searchbtn = document.getElementById("searchBtn");
var detailsbtn = document.getElementById("detailsBtn");
var settingsbtn = document.getElementById("settingsBtn");
var downloadbtn = document.getElementById("downloadBtn");

// Get the <span> element that closes the modal
var closebtn =  document.getElementById("modalCloseBtn");


function showElement (elem) {
	elem.classList.remove("hide");
}	

function hideElement (elem) {
	elem.classList.add("hide");
}	

// When the user clicks the button, create the modal content and style settings and open the modal 

detailsbtn.onclick = function() {
	setModalStyle ("Info");
	showModal ("Info");
	stopBookScroll();
	modalbody.scrollTop = 0;
}

settingsbtn.onclick = function() {
	setModalStyle ("Settings");
	showModal ("Settings");
	stopBookScroll();
}


downloadbtn.onclick = function() {
	if (navigator.onLine) {
		if (isBookShelf()) {
			window.location.href = '../../bookdownloads';
			return;
		} else {
			setModalStyle ("Download");
			showModal ("Download");
		}
	} else {
		var alertHTML;
		if (isBookShelf()) {
			alertHTML = "<p>You need to be online to go to the Wisdom & Wonders download page.</p>";
		} else {
			alertHTML = "<p>Downloads of Epub, Mobi and PDF versions are only available when you are connected to the Internet.</p>";
		}
		showAlert(alertHTML);	
		return;
	}	

	stopBookScroll ();
}

function setModalTheme (theme) {
	switch(theme) {
		case 'Simple':
			// simple modal style 
			modalheader.style.background = "white";
			modalheader.style.color = "black";
			closebtn.style.color = "black";
			//modalheadertext.innerHTML = heading;
			modalbody.style.background = "#fcfcfc";
			modalbody.style.backgroundImage = 'unset';
			modalbody.style.color = "#000";
			settingsadv.style.background = "white";
			settingsadv.style.borderTopColor ="#000";
			modalbody.classList.add('bright-scroll');
			modalbody.classList.add('bright-scroll-track');
			modalbody.classList.add('bright-scroll-thumb');
			modalbody.classList.remove('dark-scroll'); 
			modalbody.classList.remove('dark-scroll-track');
			modalbody.classList.remove('dark-scroll-thumb');
			modalbody.classList.remove('mellow-scroll'); 
			modalbody.classList.remove('mellow-scroll-track');
			modalbody.classList.remove('mellow-scroll-thumb');
			break;
		case 'SimpleDark':
			modalheader.style.background = "#121212";
			modalheader.style.color = "#f7f7f7";
			closebtn.style.color = "#f7f7f7";
			//modalheadertext.innerHTML = heading;
			modalbody.style.background = "#292929";
			modalbody.style.backgroundImage = 'unset';
			modalbody.style.color = "#f7f7f7";
			settingsadv.style.background = "#121212";
			settingsadv.style.borderTopColor ="#f7f7f7";
			modalbody.classList.remove('bright-scroll');
			modalbody.classList.remove('bright-scroll-track');
			modalbody.classList.remove('bright-scroll-thumb');
			modalbody.classList.add('dark-scroll'); 
			modalbody.classList.add('dark-scroll-track');
			modalbody.classList.add('dark-scroll-thumb');
			modalbody.classList.remove('mellow-scroll'); 
			modalbody.classList.remove('mellow-scroll-track');
			modalbody.classList.remove('mellow-scroll-thumb');
			break;
		case 'Sepia':
			modalheader.style.background = "#f5efd0";
			modalheader.style.color = "#00008b";
			closebtn.style.color = "#00008b";
			//modalheadertext.innerHTML = heading;
			modalbody.style.background = "#f5efd0";
			modalbody.style.backgroundImage = 'url("../_resources/images/themes/paper1.jpg")';
			modalbody.style.color = "#00008b";
			settingsadv.style.background = "#f5efd0";
			settingsadv.style.borderTopColor ="#00008b";
			modalbody.classList.remove('bright-scroll');
			modalbody.classList.remove('bright-scroll-track');
			modalbody.classList.remove('bright-scroll-thumb');
			modalbody.classList.remove('dark-scroll'); 
			modalbody.classList.remove('dark-scroll-track');
			modalbody.classList.remove('dark-scroll-thumb');
			modalbody.classList.add('mellow-scroll'); 
			modalbody.classList.add('mellow-scroll-track');
			modalbody.classList.add('mellow-scroll-thumb');
			break;
		default:
			// alert box modal style 
			modalheader.style.background = "#E28F2E";
			modalheader.style.color = "white";
			closebtn.style.color = "white";
			modalheadertext.innerHTML = "Alert";
	}
}


// Set styles for modals
function setModalStyle (heading) {
	
	modalheadertext.innerHTML = heading.toUpperCase();
	switch (heading) {
		case 'Alert':
			modalbody.style.height = "unset";
			modalbody.style.maxHeight = "unset";
			modalbody.style.padding = "1em";
			modalcontent.style.width = "80%";
			modalcontent.style.maxWidth = "1100px";
			modalcontent.style.position ="relative";
			modalcontent.style.right = "0";
			modalcontent.style.top = "0";
			modalcontent.style.padding = "0";
			break;
		case 'Settings':
			modalbody.style.height = "unset";
			modalbody.style.maxHeight = "75vh";
			modalbody.style.padding = "0";
			modalcontent.style.width = "320px";
			modalcontent.style.maxWidth = "320px";
			modalcontent.style.position ="fixed";
			modalcontent.style.right = "20px";
			modalcontent.style.top = "20px";
			modalcontent.style.padding = "0";
			break;
		case 'Download':
			modalbody.style.height = "unset";
			modalbody.style.maxHeight = "75vh";
			modalbody.style.padding = "0";
			modalcontent.style.width = "320px";
			modalcontent.style.maxWidth = "320px";
			modalcontent.style.position ="fixed";
			modalcontent.style.right = "20px";
			modalcontent.style.top = "20px";
			modalcontent.style.padding = "0";
			modalcontent.style.padding = "0";
			break;
		case 'Notes':
			/*
			modalbody.style.maxHeight = "50vh";
			modalbody.style.padding = "0";
			modalcontent.style.maxWidth = "80%";
			modalcontent.style.width = "80%";
			modalcontent.style.position ="relative";
			modalcontent.style.right = "0";
			modalcontent.style.top = "0";	
			modalcontent.style.padding = "0";
			*/
			modalbody.style.height = "65vh";
			modalbody.style.maxHeight = "65vh";
			modalbody.style.padding = "0";
			modalcontent.style.width = "95%";
			modalcontent.style.maxWidth = "55em";
			modalcontent.style.position ="relative";
			modalcontent.style.right = "0";
			modalcontent.style.top = "0";
			modalcontent.style.padding = "0";
			break;
		case 'Sutta':
			modalbody.style.height = "auto";
			modalbody.style.maxHeight = "85vh";
			modalbody.style.padding = "0";
			modalcontent.style.width = "95%";
			modalcontent.style.maxWidth = "55em";
			modalcontent.style.position ="relative";
			modalcontent.style.right = "0";
			modalcontent.style.top = "0";
			modalcontent.style.padding = "0";
			break;
		default:
			modalbody.style.maxHeight = "75vh";
			modalbody.style.padding = "0";
			modalcontent.style.width = "90%";
			modalcontent.style.maxWidth = "1100px";
			modalcontent.style.position ="relative";
			modalcontent.style.right = "0";
			modalcontent.style.top = "0";
			modalcontent.style.padding = "0";
	}
}

function showModal (theModal) {
	switch (theModal) {
		case 'Info':
			hideElement(modalsettings);
			hideElement(modalnotes);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modalsutta);
			showElement(modaldetails);		
			break;
		case 'Settings':
			hideElement(modaldetails);
			hideElement(modalnotes);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modalsutta);
			showElement(modalsettings);		
			break;
		case 'Download':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modalnotes);
			hideElement(modalalert);
			hideElement(modalsutta);
			showElement(modaldownload);		
			break;
		case 'Alert':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modalnotes);
			hideElement(modaldownload);
			hideElement(modalsutta);
			showElement(modalalert);		
			break;
		case 'Notes':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modalsutta);
			showElement(modalnotes);
			break;
		case 'Sutta':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modalnotes);		
			showElement(modalsutta);
			break;
		}
	showElement(modal);
	showElement(modalcontent);
}

var calledFromNotes = false;

// use event delagation on the book to show notes or move to internal links
document.getElementById("thebook").addEventListener("click", function(e) {

	if(e.target && (e.target.nodeName == "SUP" || e.target.className == "suttaref" || e.target.className == "TOCref")) { 
		if (e.target.className == "suttaref" || e.target.className == "TOCref") {
			var toctarget ='';
			if (e.target.className == "TOCref") {
				toctarget = e.target.getAttribute("data-TOCref");
			} else {
				var tocNumber = e.target.id.substring(3);
				toctarget = "TOCTarget" + tocNumber;
			}
			goToTOCTarget(toctarget);
			if (true) {e.preventDefault();}
		} else {	
			savedsup = e.target;
			setModalStyle ("Notes");
			showModal("Notes");
			highlightnote(e.target.innerHTML); 
			stopBookScroll ();
			if (true) {e.preventDefault();}
		}	
	}

	if (e.target.classList.contains('sclinktext')) {
		displaySutta(e.target.innerHTML);
		savedsup = e.target;
		if (true) {e.preventDefault();}
	}

	if ((e.target.parentNode.parentNode.id == 'references') || (e.target.parentNode.parentNode.id == 'shelffooter') || (e.target.classList.contains('extlink'))) {
			if (e.target.closest('A') !== null) {
				doOutAppHREF(e.target.closest('A').getAttribute('href'));
				if (true) {e.preventDefault();}
		}
	}
});



document.getElementById("ModalDetails").addEventListener("click", function(e) {
	if (e.target.closest('A') !== null) {
		if (!(e.target.closest('A').classList.contains('booklink'))) {
			doOutAppHREF(e.target.closest('A').getAttribute('href'));
			if (true) {e.preventDefault();}
		}
	}

	if (e.target.parentNode.id == 'LOT') {
		var tocNumber = e.target.id.replace("TOC", "");
		var toctarget = "TOCTarget" + tocNumber;
		doCloseModal();
		goToTOCTarget(toctarget);
	}

	if (e.target.className == "sclinkref") {
		var gotoID = 'slt_' + e.target.id.replace("screflinkfrom_","")
		scrollToID(gotoID);
	}

});


function showAlert(HTMLToShow) {
	restorePlaceInBook();
	//var mda = document.getElementById('ModalDownloadAlert');
	modalalert.innerHTML = HTMLToShow;
	setModalStyle ("Alert");
	showModal ("Alert");
}



var savedsup = '';
function formatbooknotes() { // adds the notes numbers to the booknotes - called once at onload
	for (var i = 1; i < savedNotesElements.length; i++) {
		savedNotesElements[i].innerHTML = "<span style='font-weight: bold;'>" + (i) + ": </span> " + savedNotesElements[i].innerHTML;
	}
}
var highlightedNote = 0;
function highlightnote (notetohighlight) {
	highlightedNote = parseInt(notetohighlight);
	savedNotesElements[highlightedNote].style.border = "3px solid grey";
	savedNotesElements[highlightedNote].style.background = "#c0c0c030";
	savedNotesElements[highlightedNote].scrollIntoView({block: "start",});
	ModalBody.scrollBy(0,-40);
}
function clearhighlightnote() {
	savedNotesElements[highlightedNote].style.border = "unset";
	savedNotesElements[highlightedNote].style.background = "unset";
	if (!(savedsup === '')) {
		savedsup.style.outlineWidth="20px";
		setTimeout(function() {
			savedsup.style.transition = "0.3s linear";
			savedsup.style.outlineWidth ="0";
		}, 300);
		setTimeout(function() {
			savedsup.style.transition = "none";
			savedsup='';
		},600);
	}
}

/* for setting sutta font size */
function getFontLevel() {
	return document.getElementById("flvalue").innerHTML +'px';
}

function reformatBook () {

	var fontlevel = parseInt(document.getElementById("flvalue").innerHTML);
	setFontLevel(fontlevel, 0, savedBookElements.length);
	setDetailsLevel(fontlevel);
	setNotesLevel(fontlevel);

	var lhlevel = parseFloat(document.getElementById("lhvalue").innerHTML);
	setLH (lhlevel, 0, savedBookElements.length);

	setSerif (0, savedBookElements.length);

	setPageBreak(false); 
	setPageBreakSize();
}


var settingTouched = false;

function exitSettingsModal () {
	reformatBook();
	startBookScroll();
	scrollToNavTarget();
	saveCookies();
	return true;
}

function exitStaticModal () {
	if (calledFromNotes) {
		setModalStyle ("Notes");
		showModal("Notes");
		savedNotesElements[highlightedNote].scrollIntoView({block: "start",});
		ModalBody.scrollBy(0,-40);
		calledFromNotes = false;
	} else {
		startBookScroll();
		clearhighlightnote();
		hideElement(modal);
		hideElement(modalcontent);
	}
}

/*
closebtn.onclick = function () {
	exitModal ();
}	
*/

function doCloseModal () {
	if (settingTouched) {
		spinnerExitSettingsModal();
		settingTouched = false;
	} else {
		exitStaticModal	();
	}	
}

closebtn.addEventListener('click',doCloseModal);


window.onclick = function(event) {
    if (event.target == modal) {doCloseModal()}
}

function showSpinner() {
    document.querySelector('#spinbox').style.display = 'block';
}
function hideSpinner() {
    document.querySelector('#spinbox').style.display = 'none';
}

function promiseToRunAsync(executor, ...params) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try { resolve(executor(...params)); }
            catch (error) { reject(error); }
        }, 0);
    });
}

function spinnerExitSettingsModal() {
    showSpinner(); // show spinner
    promiseToRunAsync(exitSettingsModal) // execute anync
    .then(() => {
        hideSpinner();
	});
	// code here will run before the spinner is hidden
	hideElement(modal);
	hideElement(modalcontent);
}

function shadowSearchBar () {
	var searchBar = document.getElementById("SearchBar");
	if (forceMobileUI) {
		searchBar.classList.add('uplift');
	} else {
		searchBar.classList.remove('uplift');
	}
}

function stopBookScroll () {
	document.getElementById("tocnav").style.top = "0"; // make sure the tocnav doesn't wander off
	var thebody = document.getElementById("thebody");
	var y = window.scrollY;
	thebody.style.overflowY ='scroll';
	thebody.style.top =  "-"+y+"px";
	thebody.style.position = 'fixed';
}

function startBookScroll () {
	const scrollY = document.body.style.top;
	document.body.style.position = '';
	document.body.style.top = '';
	window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

var theTopElement = 0;
var theTopElementTopEdge = 0;

function getNavTarget () {
	for (var i = 0; i < savedBookElements.length; i++) {
		if (isElementInViewport (savedBookElements[i])) {
			theTopElement = i;
			theTopElementTopEdge = savedBookElements[i].getBoundingClientRect().top;
			theTopElementTopEdge = Math.floor(theTopElementTopEdge);
			break;
		}
	}
}	

function scrollToNavTarget () {
	savedBookElements[theTopElement].scrollIntoView({block: "start"});
	scrollBy(0, -1 * (theTopElementTopEdge));
}

function restorePlaceInBook () {
	startBookScroll();
	scrollToNavTarget ();
	stopBookScroll();
}
	
function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) 
    );
}

function isElementPartiallyInViewport(el)
{
    var rect = el.getBoundingClientRect();
	var tbHeight = -Math.abs(parseFloat(((window.getComputedStyle(document.getElementById("topbar")).height)))); //take into account topbar
    var windowHeight = (window.innerHeight || document.documentElement.clientHeight)+tbHeight;
    var windowWidth = (window.innerWidth || document.documentElement.clientWidth);
    var vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    var horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    return (vertInView && horInView);
}


function getFullReference (shortReference = '') {

	var references = document.getElementById('references');
	var referenceChildren = references.children;

	for (let i = 0; i < references.children.length; i++) {
		if (references.children[i].tagName == 'DT') {
			if (references.children[i].innerHTML == shortReference) {
				return references.children[i].nextElementSibling.innerHTML;
			}
		}
	}
	return 'reference not found';
}


function doOutAppHREF (href) {
		if (navigator.onLine) {
			showSpinner();
			window.location.href = href;
		} else {
			showAlert('<p><br>You need to be online to go to: <br>' + href + '<br><br></p>');
		}
}

document.getElementById("ModalNotes").addEventListener("click", function(e) {
	if (e.target.classList.contains ('expander')) {
		var fullReference = getFullReference(e.target.dataset.reference);
		if (e.target.classList.contains('expanded')) {
			e.target.innerHTML = '►';
			e.target.classList.remove('expanded');

		} else {
			e.target.innerHTML = '◄ ' + '<span class="expansion">' + fullReference + '</span>';
			e.target.classList.add('expanded');

		}
	}

	if (e.target.classList.contains ('TOCref')) {
		var toctarget = e.target.getAttribute("data-TOCref");
		closebtn.click();
		goToTOCTarget(toctarget);
	}

	if (e.target.classList.contains('sclinktext')) {
		calledFromNotes = true;
		displaySutta( e.target.innerHTML);
		restorePlaceInBook();
		if (true) {e.preventDefault();}
	}

	if (e.target.nodeName == 'A') {
		doOutAppHREF (e.target.getAttribute('href'));
		if (true) {e.preventDefault();}
	}
});

function displaySutta (linkText) {
	setModalStyle('Sutta');
	showModal('Sutta');
	modalbody.scrollTop = 0;
	stopBookScroll ();
	showBD(linkText);
	document.getElementById('ModalHeaderText').innerHTML = linkText;
}

$(function() {
	// the input field
	var $input = $("input[type='search']"),
	  // clear button
	  $clearBtn = $("button[data-search='clear']"),
	  // prev button
	  $prevBtn = $("button[data-search='prev']"),
	  // next button
	  $nextBtn = $("button[data-search='next']"),
	  // revert button
	  $revertBtn = $("button[data-search='revert']"),
	  // the context where to search
	  $content = $("#thebook"),
	  // jQuery object to save <mark> elements
	  $results,
	  // the class that will be appended to the current
	  // focused element
	  currentClass = "current",
	  // top offset for the jump (the search bar)
	  offsetTop = 50,
	  // the current index of the focused element
	  currentIndex = 0;
  

	function jumpTo() {
	  if ($results.length) {
		var position,
		  $current = $results.eq(currentIndex);
		$results.removeClass(currentClass);
		if ($current.length) {
		  $current.addClass(currentClass);
		  position = $current.offset().top - offsetTop;
		  window.scrollTo(0, position -100);
		}
	  }
	}
  


	var totRes = document.getElementById("totalresults");
	var curRes = document.getElementById("currentresult");
	var sercnt = document.getElementById("searchcount");
	sercnt.innerHTML = "Minimum 5 characters";
	sercnt.style.color = '#cea140';


	$input.on("input", function() {
	var searchVal = this.value;
		if (searchVal.length > 4) {
		$content.unmark({
			done: function() {
			$content.mark(searchVal, {
				separateWordSearch: false, diacritics: true, acrossElements: true, ignoreJoiners: true, ignorePunctuation: [":;.,-–—‒_(){}[]!'\"+=".split("")], exclude: ["sup", ".pageno *"],
				done: function() {
				$results = $content.find("mark");
				totRes.innerHTML = ' / '+$results.length;
				sercnt.style.color = 'unset';
				sercnt.innerHTML = "Count: ";
				if ($results.length < 1) {
					curRes.innerHTML = 0;
				} else {
					curRes.innerHTML = currentIndex+1;
				}
				currentIndex = 0;
				jumpTo();
				}
			});
			}
		});
		}  else {
			$content.unmark();
			sercnt.style.color = '#cea140';
			sercnt.innerHTML = "Minimum 5 characters";
			totRes.innerHTML = "";
			curRes.innerHTML = "";
		}
	});

	$clearBtn.on("click", function() {
		$content.unmark();
		$input.val("").focus();
		sercnt.style.color = '#cea140';
		sercnt.innerHTML = "Minimum 5 characters";
		curRes.innerHTML ="";
		totRes.innerHTML ="";
		searchBar.style.display = "none";
		searchbtn.style.display = "block";
	});
  
	var revertTopElement;
	$revertBtn.on("click", function() {
		savedBookElements[revertTopElement].scrollIntoView();
	  });

	$nextBtn.add($prevBtn).on("click", function() {
		if ($results.length) {
			currentIndex += $(this).is($prevBtn) ? -1 : 1;
			if (currentIndex < 0) {
			currentIndex = $results.length - 1;
			}
			if (currentIndex > $results.length - 1) {
			currentIndex = 0;
			}
			jumpTo();
			if ($results.length > 0) {
				curRes.innerHTML = currentIndex +1;
			}			
		}
	});

	var searchBar = document.getElementById("SearchBar");

	searchbtn.onclick = function() {
		getNavTarget();
		revertTopElement = theTopElement;
		searchBar.style.display = "block";
		searchbtn.style.display = "none";
		$input.val("").focus();	
		shadowSearchBar();
	}
});


