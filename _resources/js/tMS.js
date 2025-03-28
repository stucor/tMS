var nuclearOption = false;
// SETTINGS VARIABLES
var sidebarIsOpen = false;
var forceMobileUI;
var themeName = "Simple";
var marginName = "";

var prevScrollpos = window.scrollY;

document.getElementById(`tmsindexBtn`).onclick = function () {
}

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

// generic useful functions

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

// build sections

function buildSettings (_callback) {
	//buildRef();
	let parentDiv = document.getElementById('ModalSettings');
	if (parentDiv.innerHTML == '') {
		let html = 
		`
			<div class="settingsbox">
				<span class ="settingsheadersleft">Font size:</span>
				<span class="settingsheadersright">
					<button class="decrease" id ="decfont"></button>
					<span class="level" id="flvalue"></span>
					<button class="increase" id ="incfont"></button>
				</span>
			</div>
			<div class="settingsbox">
			<span class ="settingsheadersleft">Line spacing:</span>
			<span class="settingsheadersright">
				<button class="decrease" id ="declh"></button>
				<span class="level" id="lhvalue"></span>
				<button class="increase" id ="inclh"></button>
			</span>
			</div>
			<div class="settingsbox">
				<span class ="settingsheadersleft">Serif Font:</span>
				<span class = "settingsheadersright"><label class="switch"><input type="checkbox" id="serifFont"><span class="slider round"></span></label></span>
			</div>
			<div class="settingsbox">			
				<p class ="settingsheaders">Colour:</p>
				<div class="radio-toolbar">
					<input type="radio" id="radioSimple" name="themeRadio" value="simple">
					<label for="radioSimple">Bright</label>
				
					<input type="radio" id="radioSimpleDark" name="themeRadio" value="simpledark">
					<label for="radioSimpleDark">Dark</label>
				
					<input type="radio" id="radioSepia" name="themeRadio" value="sepia">
					<label for="radioSepia">Mellow</label> 
				</div>
			</div>
			<!--
			<div class="settingsbox">
				<span class ="settingsheadersleft">Show book pages:</span>
				<span class = "settingsheadersright"><label class="switch"><input type="checkbox" id="showPageCheck"><span class="slider round"></span></label></span>
			</div>
			-->
			<div class="settingsbox">
				<p class ="settingsheaders">Margins:</p>
				<div class="radio-toolbar">
					<input type="radio" id="radioMargNarrow" name="marginRadio" value="narrowmargin">
					<label for="radioMargNarrow">
						<img class = "marginicons" src="../_resources/images/icons/marginwide.svg" alt="Wide Margins">
					</label>
					<input type="radio" id="radioMargMid" name="marginRadio" value="midmargin">
					<label for="radioMargMid">
						<img class = "marginicons" src="../_resources/images/icons/marginmid.svg" alt="Normal Margins">
					</label>
					<input type="radio" id="radioMargWide" name="marginRadio" value="widemargin">
					<label for="radioMargWide">
						<img class = "marginicons" src="../_resources/images/icons/marginnarrow.svg" alt="Narrow Margins">
					</label> 
				</div>
			</div>
			<div class="settingsbox">
				<span class ="settingsheadersleft">Justification:</span>
				<span class = "settingsheadersright"><label class="switch"><input type="checkbox" id="justifyCheck"><span class="slider round"></span></label></span>
			</div>
			<div class="settingsbox">
				<span class ="settingsheadersleft">Hyphenation:</span>
				<span class = "settingsheadersright"><label class="switch"><input type="checkbox" id="hyphenCheck"><span class="slider round"></span></label></span>
			</div>
			<div class="settingsbox">
				<span class ="settingsheadersleft">show segments (§):</span>
				<span class = "settingsheadersright"><label class="switch"><input type="checkbox" id="showtMSIndexCheck"><span class="slider round"></span></label></span>
			</div>
			<div class="settingsbox">
				<span class ="settingsheadersleft">Full Screen Mode:</span>
				<span class = "settingsheadersright"><label class="switch"><input type="checkbox" id="mobileUIAlwaysOnCheck"><span class="slider round"></span></label></span>
			</div>
		`;

		parentDiv.innerHTML = html;

	}
	_callback();
}


function startup () {
	/*
	console.log("local storage:");
	for (var i = 0; i < localStorage.length; i++)   {
		console.log(localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]");
	}
	*/

	buildSettings(function(){
		//the following is done after buildSettings completes:
		document.getElementById('topbar').style.display='block';
		document.getElementById('thebook').style.display='block';
		initialiseCommonSettings();
		if (!isAudioBook()) {
			initialiseBookSettings ();
		} 
		// give tables an id starting at table_1
		let tabrefArr = document.querySelectorAll('table');
		if (tabrefArr.length  > 0) {
			for (let i = 0; i < tabrefArr.length; i++) {
				tabrefArr[i].setAttribute("id", "table_"+ (i+1));
			}
		}
		//populate lastsegcount
		let lastSegCount = ``
		for (let i in savedBookElements) {
			if (savedBookElements[i].id && savedBookElements[i].id != `999999999`) {
				lastSegCount = savedBookElements[i].id
			}
		}
		lastSegCount = lastSegCount.replace(`seg-`, `/`)
		document.getElementById('lastsegcount').innerText = lastSegCount;

		var scroller = Math.floor(window.scrollY);
		history.replaceState({scrollState: scroller},'',''); 
		history.scrollRestoration = 'manual';
		if (isAudioBook()) { 
			initialiseAudioBookSettings();
			initplayer();
			document.getElementById('head-0').style.display='none';
		}
		if (isBookShelf()) {
			initialiseBookShelfSettings ();
			document.getElementById('head-0').style.display='none';
		}
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
		document.getElementById("justifyCheck").onclick = function () {
			showSpinner();
			promiseToRunAsync(doJustifyCheck) 
			.then(() => {
				hideSpinner();
			});
		}
		document.getElementById("hyphenCheck").onclick = function () {
			showSpinner();
			promiseToRunAsync(doHyphenCheck) 
			.then(() => {
				hideSpinner();
			});
		}
		document.getElementById("decfont").onclick = function () { // minus button
				showSpinner();
				promiseToRunAsync(doDecFont) 
				.then(() => {
					hideSpinner();
				});
		}
		document.getElementById("incfont").onclick = function () { //plus button
			showSpinner();
			promiseToRunAsync(doIncFont) 
			.then(() => {
				hideSpinner();
			});
		}
		declh.onclick = function () {
			showSpinner();
			promiseToRunAsync(doDecLH) 
			.then(() => {
				hideSpinner();
			});
		}
		inclh.onclick = function () {
			showSpinner();
			promiseToRunAsync(doIncLH) 
			.then(() => {
				hideSpinner();
			});
		} 
		radioSimple.onclick = function () {
			setTheme ();
		}
		radioSimpleDark.onclick = function () {
			setTheme ();
		}
		radioSepia.onclick = function () {
			setTheme ();
		}
		radioMargNarrow.onclick = function () {
			showSpinner();
			promiseToRunAsync(doSetMargin) 
			.then(() => {
				hideSpinner();
			});
		}
		radioMargMid.onclick = function () {
			showSpinner();
			promiseToRunAsync(doSetMargin) 
			.then(() => {
				hideSpinner();
			});
		}
		radioMargWide.onclick = function () {
			showSpinner();
			promiseToRunAsync(doSetMargin) 
			.then(() => {
				hideSpinner();
			});
		}
		serifFont.onclick = function () {
			showSpinner();
			promiseToRunAsync(doSetSerif) 
			.then(() => {
				hideSpinner();
			});
		}
		showtMSIndexCheck.onchange = function () {
			showSpinner();
			promiseToRunAsync(doTMSIndex) 
			.then(() => {
				hideSpinner();
			});
		}
		if (!(isBookShelf() || isAudioBook())) {
			let engrave = document.getElementsByClassName("engrave");
			let smallEngrave = document.getElementsByClassName("smallEngrave");
			engrave[0].classList.add('noshow')
			smallEngrave[0].classList.add('noshow')
		}

		let selfquoteArr = document.getElementsByClassName("selfquote");
		if (selfquoteArr) {
			for (i = 0; i < selfquoteArr.length; i++) {
				selfquoteArr[i].setAttribute('data-before-selfquote', `§${i+1}`); //§
			}
			
		}

	});
}

function parseInfoText(infoText) {
	const htmlText = infoText
//		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
//		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
//		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
//		.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
		.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // markdown style bold
		.replace(/\*(.*)\*/gim, '<i>$1</i>') // markdown style italics
//		.replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
		.replace(/\[(.*?)\]\X\((.*?)\)/gim, "<a class='extlink' href='$2'>$1</a>") //like markdown but and X inbetween like this: [text]X(link) - to denote an external link
		.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>") // markdown style link
		.replace('lulugraphic', '<img style="max-height: 35px;" alt="Seeds, Paintings and a Beam of Light at Lulu" src="../_resources/images/icons/lulu-logo.svg" ></img>')
		.replace(/\n/gim, '<br />') //markdown style linebreaks
	return htmlText.trim()
}

// Populates the Info Modal
function buildInfo () {
	let parentDiv = document.getElementById('ModalDetails');

	if (parentDiv.innerHTML == '') {
		let shortCode = shortcode();
		let html ='';
		function populateInfo (bookInfoData) {
			html += `<h1>${bookInfoData.BookTitle}</h1>`;
			if (bookInfoData.BookSubtitle) {
				html += `<h3>${bookInfoData.BookSubtitle}</h3>`;
			}
			html += `<h2>${bookInfoData.Authors}</h2>`;
			//Add Ons
			if (bookInfoData.AddInfo.length > 0) {
				html += `<section class="infocontainer">`;
				for (i in bookInfoData.AddInfo) {
					for (j in bookInfoData.AddInfo[i]) {
						if (j == 0) {
							x = `<h3>${bookInfoData.AddInfo[i][j]}</h3>`;
						} else if (j == 1) {
							html += `<div class="info-addon">`;
							x = `<p>${parseInfoText(bookInfoData.AddInfo[i][j])}</p>`;
						} else {
							x = `<p>${parseInfoText(bookInfoData.AddInfo[i][j])}</p>`;
						}
						html += x;
					}
					html += `</div>`;
				}
				html += `</section>`
			}	

			if (isAudioBook()) {
				html += `
				<section class="infocontainer">
					<h3>Audio Controls</h3>
					<div class="info-addon">
						<p>The <strong>MettāShelf AudioPlayer</strong> allows you to:</p> 
						<ul>
							<li>Jump backwards and forwards through chapter using the CHAPTER keys.</li>
							<li>Jump backwards and forwards through paragraphs using the PARAGRAPH keys.</li>
							<li>You can toggle through the speed using the speed button which is marked as X1 by default.</li>
							<li>On those devices which permit it, volume can be changed using the slider.</li>
						</ul>
						<p>The following keyboard shortcuts are available:</p>
						<table class="borderlessTable">
							<tbody>
								<tr><td>Arrow Right:</td><td>Next Chapter</td></tr>
								<tr><td>Arrow Left:</td><td>Previous Chapter</td></tr>
								<tr><td>Arrow Down:</td><td>Next Paragraph</td></tr>
								<tr><td>Arrow Up:</td><td>Previous Paragraph</td></tr>
								<tr><td>Space Bar:</td><td>Play/Pause</td></tr>
								<tr><td>Uppercase V:</td><td>Volume Up</td></tr>
								<tr><td>Lowercase v:</td><td>Volume Down</td></tr>
							</tbody>
						</table>
						<br>
					</div>
				</section>
				`;
			}
			
			//Author(s)
			let authors = '';
			let authorCount = 0;
			while (authorCount < bookInfoData.AuthorsData.length) {
				authors += 
				`<section class="infocontainer">
					<div class="fifty-fifty-grid">
						<div>
						<img src="${bookInfoData.AuthorsData[authorCount].InfoImage}" alt="${bookInfoData.AuthorsData[authorCount].ShortName}">
						</div>
						<div>
							<p><strong>${bookInfoData.AuthorsData[authorCount].ShortName}: </strong>`;
				for (i in bookInfoData.AuthorsData[authorCount].ShortBio) {
					authors += `${bookInfoData.AuthorsData[authorCount].ShortBio[i]}`;
				}
				authors += 
						`</p></div>
					</div>
				</section>`;
				authorCount++;
			}
			html += authors;

			//Book Cover and Copyright
			html += 
			`<section class="infocontainer">
				<div class="fifty-fifty-grid">
				<div>
				<img src="${bookInfoData.FrontCover}" alt="${bookInfoData.BookTitle} Cover" >
				</div>
				<div class="copyright">`;
				
				let copyrightParaCount = 0
				while (copyrightParaCount < bookInfoData.Copyright.length) {
					html += `<p>${parseInfoText(bookInfoData.Copyright[copyrightParaCount])}</p>`;
					copyrightParaCount++;
				}
				
			html += bookInfoData.CCLicense;

			html += `</div></div></section>`;

			// BackCover and Back Matter
			if (bookInfoData.BackCover != "") {
				html += 
				`<section class="infocontainer">
					<div class="fifty-fifty-grid">
					<div>`;
				
					html +=
					`
					<img src="${bookInfoData.BackCover}" alt="${bookInfoData.BookTitle} Cover" >
					</div>
					<div>`;
					if (bookInfoData.BackMatter != "") {
						html +=
						`<h3>Back Matter:</h3>`;
						for (i in bookInfoData.BackMatter) {
						html += `<p>${parseInfoText(bookInfoData.BackMatter[i])}</p>`;
						};
					}
				html += `</div></div></section>`;
			}
			
			parentDiv.innerHTML = html;
			
			setTheme();
		
		}

		fetch(`../_resources/book-data/${shortCode}/info.json`)
			.then(response => response.json())
			.then (data => populateInfo(data))
			.catch(error => {
			console.log(`ERROR: Can't fetch ../_resources/book-data/${shortCode}/info.json`);
			}
		);

	}
}


//ONLOAD
window.onload = function () {
    showSpinner();
    promiseToRunAsync(startup) 
    .then(() => {
        hideSpinner();
		getPlaceInBook();
	});
};

var savedBookElements = thebook.querySelectorAll("h1:not(.titlepage), h2:not(.titlepage), h3:not(.titlepage), p:not(.tablepara), .tablewrap, figure");
var savedTOCElements = tocnav.querySelectorAll('li, button');
var savedDetailsElements = ModalDetails.querySelectorAll('p, figcaption, h1, h2, li, table');

var theTopBar = document.getElementById("topbar");

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
		setFontLevel(local_wiswobooks_font_size);
		setTOCLevel(local_wiswobooks_font_size);
		setDetailsLevel(local_wiswobooks_font_size);
		//setNotesLevel(local_wiswobooks_font_size);
	}	
}

function initialiseBookSettings () {
	//LINE-SPACING
	var local_wiswobooks_line_spacing = getCookie("wiswobooks_line_spacing");
	document.getElementById("lhvalue").innerHTML = 1.5;
	if (local_wiswobooks_line_spacing == '') {
		local_wiswobooks_line_spacing = '1.5';
		setCookie ('wiswobooks_line_spacing',local_wiswobooks_line_spacing,365);
	} else {
		document.getElementById("lhvalue").innerHTML = local_wiswobooks_line_spacing;
		setLH (local_wiswobooks_line_spacing);
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
	setSerif();

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
	// tMS Reference
	var local_wiswobooks_tMSIndex = getCookie("wiswobooks_tMSIndex");
	switch (local_wiswobooks_tMSIndex) {
		case 'true' :
			document.getElementById("showtMSIndexCheck").checked = true;
			break;
		case 'false' :
			document.getElementById("showtMSIndexCheck").checked = false;
			break;	
		default :
			document.getElementById("showtMSIndexCheck").checked = false;
			local_wiswobooks_tMSIndex = 'false';
			setCookie('wiswobooks_tMSIndex',local_wiswobooks_tMSIndex,365);
	}
	setTMSIndex();

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

	filterBookSearch();lsTEname

	//GRID or LIST
	if (localStorage.getItem('msgridlist') === null) {
		localStorage.setItem('msgridlist', 'list');
	} else {
		if (localStorage.getItem('msgridlist') === 'grid') {gridlistbtn.click();}
	}

	document.getElementById('bookshelf').classList.remove('noshow');
	document.getElementById('shelffooter').classList.remove('noshow');
}

window.onhashchange = function(e) {
	e.preventDefault();
    getPlaceInBook ()
}


function getPlaceInBook () {
	let hash = ''
	let hashValidatedIndex = -1;
	if(window.location.hash) {
		hash = window.location.hash.substring(1);
		let bookurl = window.location.href.replace(`#${hash}`,``)
		history.replaceState( {} , '', bookurl );
		for (let i in savedBookElements) {
			if (savedBookElements[i].id) {
				if (savedBookElements[i].id == hash) {
					hashValidatedIndex = i
				} else 
				if (savedBookElements[i].id == `seg-${hash}`) {
					hash = `seg-`+ hash
					hashValidatedIndex = i
				}
			}
		}
	}
	//PLACE-IN-BOOK - gets the top element and it's top edge
	var lsTEname, lsTETEname;
	lsTEname= 'ms' + shortcode() + 'TE';
	lsTETEname = 'ms' + shortcode() + 'TETE';
	if ((localStorage.getItem(lsTEname) === null) && (localStorage.getItem(lsTETEname) === null)) {
		localStorage.setItem(lsTEname, "0");
		localStorage.setItem(lsTETEname, "0");
		theTopElement = 0;
		theTopElementTopEdge = 0;
		if (hash) {
			if (hashValidatedIndex >=0) {
				theTopElement = i
				scrollToNavTarget();
				segCount.innerHTML =  `${hash}`
			} else {
				showAlert(`The tMS Reference <strong>${hash}</strong> that you are trying to go to does not exist in this book`, `tMS Reference Error in URL`)
			}
		}
	} else {
		theTopElement = parseInt(localStorage.getItem(lsTEname));
		theTopElementTopEdge = parseInt(localStorage.getItem(lsTETEname));
		
		if(hash) {
			if (hashValidatedIndex >=0) {
				if (hash != savedBookElements[theTopElement].id) {
					showAlert (`<p>You are already reading this book on this device.<br>
								Your bookmark is currently at tMS Reference <b>${savedBookElements[theTopElement].id}</b>.<br>
								<button id="goHashBtn" data-ref="${hash}">Go to <b>${hash}</b> as asked for in url instead</button></p>`,`Bookmark Found!`,`goHashBtn`)
				}
			} else {
				showAlert(`The tMS Reference—<strong>${hash}</strong>—that you are trying to go to does not exist in this book. Returning you to your last bookmarked tMS Reference <b>${savedBookElements[theTopElement].id}</b>`, `tMS Reference Error in URL`)
			}

		}
		scrollToNavTarget();
	}
}

function savePlaceInBook () {
	//PLACE-IN-BOOK - saves the top element and it's top edge
	var lsTEname, lsTETEname;
	lsTEname= 'ms' + shortcode() + 'TE';
	lsTETEname = 'ms' + shortcode() + 'TETE';
	localStorage.setItem(lsTEname, String(theTopElement));
	localStorage.setItem(lsTETEname, String(theTopElementTopEdge));
	//alert(lsTEname + '::' +theTopElement);
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

window.onbeforeunload = finalExit;

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
		//JUSTIFICATION
		var local_wiswobooks_justification = document.getElementById("justifyCheck").checked;
		setCookie('wiswobooks_justification',local_wiswobooks_justification,365);
		//HYPHENATION
		var local_wiswobooks_hyphenation = document.getElementById("hyphenCheck").checked;
		setCookie('wiswobooks_hyphenation',local_wiswobooks_hyphenation,365);
		//tMS Reference
		var local_wiswobooks_tMSIndex = document.getElementById("showtMSIndexCheck").checked;
		setCookie('wiswobooks_tMSIndex',local_wiswobooks_tMSIndex,365);

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

function setFFS () {
	var ffsCheck = document.getElementById("mobileUIAlwaysOnCheck");
	if (ffsCheck.checked){
		forceMobileUI = true;
    } else {
        forceMobileUI = false;
    }	
}

function buildpageBreak(e) {
	var thepagenumber = e.getAttribute("data-page");
	var affect = '–';
	if (thepagenumber == '') { affect ='';}
	var wordcut = e.getAttribute("data-wordcut"); // is a word cut into two because of the page break, if so add a -
	if (wordcut === null) {wordcut ='';} else {wordcut ='&#x02014;';}
	e.innerHTML = wordcut + "<div class=pagenumber>"+affect+" " + thepagenumber + " "+affect+"</div><hr class='pagebreak'>";
}

// JUSTIFICATION
function doJustifyCheck () {
	setJustify();
}
function setJustify () {
	//var bookPages = document.getElementById("thebook");
	var justificationCheck = document.getElementById("justifyCheck")
	if (justificationCheck.checked){
		//bookPages.style.textAlign = "justify";
		document.querySelector(':root').style.setProperty('--textalign', 'justify');
    } else {
		//bookPages.style.textAlign = "left";
		document.querySelector(':root').style.setProperty('--textalign', 'left');
    }	
}

// HYPHENATION
function doHyphenCheck () {
	setHyphenation();
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

// FONT SIZE
function doDecFont () {
	var fontlevel = parseInt(document.getElementById("flvalue").innerHTML);
	if (fontlevel > 9) {
		fontlevel = fontlevel -1;
		document.getElementById("flvalue").innerHTML = fontlevel;
		setFontLevel(fontlevel);
		setTOCLevel (fontlevel);
		//setNotesLevel(fontlevel);
		restorePlaceInBook();
	}
}
function doIncFont () {
	var fontlevel = parseInt(document.getElementById("flvalue").innerHTML);
	if (fontlevel < 32) {
		fontlevel = fontlevel +1;
		document.getElementById("flvalue").innerHTML = fontlevel;
		setTOCLevel (fontlevel);
		setFontLevel(fontlevel);
		//setNotesLevel(fontlevel);
		restorePlaceInBook();
	}
}
function setFontLevel (level) {
	if (!isAudioBook()) {
		document.querySelector(':root').style.setProperty('--fontsize', level+'px');
	};

	let bookImagesArray = document.querySelectorAll('img');
	for (i in bookImagesArray) {
		if (bookImagesArray[i].className == 'emojify') {
			bookImagesArray[i].style.width = (parseInt(level)+parseInt(level/3))+'px';
		} else if (bookImagesArray[i].className == 'fleuron') {
			bookImagesArray[i].style.width = (parseInt(level)*3)+'px';
		}
	}
}
function setTOCLevel (level) { // if level is between 16 and 24 set it to that otherwise set it to either 16 or 24
	for (var i = 0; i < savedTOCElements.length; i++) { 
		if (savedTOCElements[i].classList.contains('sub')) {
			savedTOCElements[i].style.fontSize = (parseInt(level))+'px';
		} else if (savedTOCElements[i].classList.contains('subsub')) {
			savedTOCElements[i].style.fontSize = (parseInt(level)-1)+'px';
		} else {
			savedTOCElements[i].style.fontSize = (parseInt(level)+1)+'px';
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

// LINE SPACING
function setLH (level) {
	if (!isAudioBook()) {
		document.querySelector(':root').style.setProperty('--lineheight', level);
	};
}
function doDecLH () {
	var lhlevel = parseFloat(document.getElementById("lhvalue").innerHTML);
	if (lhlevel > 1) {
		lhlevel = lhlevel -0.1;
		document.getElementById("lhvalue").innerHTML = Math.round(lhlevel * 100)/100;
		setLH (lhlevel);
		restorePlaceInBook();
	}	
} 
function doIncLH () {
	var lhlevel = parseFloat(document.getElementById("lhvalue").innerHTML);
	if (lhlevel < 3) {
		lhlevel = lhlevel + 0.1;
		document.getElementById("lhvalue").innerHTML = Math.round(lhlevel * 100)/100;
		setLH (lhlevel);
		restorePlaceInBook();
	}
}

  

//THEMES
function setTheme(){
	var whatIsPressed = document.querySelector('input[name="themeRadio"]:checked').value;
	var theBody = document.getElementById("thebody");
	var bookPages = document.getElementById("thecontent"); 

	var theTocNav = document.getElementById("tocnav");

	var imgs = document.querySelectorAll("img");
	var righticons = document.querySelectorAll(".topnav-right > a > img ");
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
	
			lefticons[0].style.filter="invert(0) hue-rotate(0) saturate(1) brightness(1) contrast(1) grayscale(0) sepia(0) ";

			theBody.style.background = '#f7f7f7';
			bookPages.style.backgroundImage = 'unset';

			theTopBar.style.background = '#fff';
			theTopBar.style.boxShadow = '0 2px 6px 0 #777';

			theTocNav.classList.add('bright-scroll');
			theTocNav.classList.add('bright-scroll-track');
			theTocNav.classList.add('bright-scroll-thumb');
			theTocNav.classList.remove('dark-scroll'); 
			theTocNav.classList.remove('dark-scroll-track');
			theTocNav.classList.remove('dark-scroll-thumb');
			theTocNav.classList.remove('mellow-scroll'); 
			theTocNav.classList.remove('mellow-scroll-track');
			theTocNav.classList.remove('mellow-scroll-thumb');

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
			searchBar.style.borderColor = "#000";

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

			r.style.setProperty('--TOCprogress', '#ffffcf28');//'#d6630f09');  //'#d6630f08'); '#f0f2fd80');
			r.style.setProperty('--primarytextcolor', '#13036c');
			r.style.setProperty('--secondarytextcolor', '#8f3e00'); //'#5a5a81');//'#577096');
			r.style.setProperty('--primarybackground', '#fff');

			r.style.setProperty('--primaryinterfacecolor', '#000');
			r.style.setProperty('--imgbackground', '#00000000');

			r.style.setProperty('--pickedtext', '#1c222b');
			r.style.setProperty('--buttontext', '#000');
			r.style.setProperty('--buttonbackground', '#fc88320B');//'#f0f2fd');
			r.style.setProperty('--sliderbackground', '#fc88320B');//'#c9d5fc');
			r.style.setProperty('--primarycolor', '#217cbe');//'#06036ea0');
			r.style.setProperty('--listlinkhover', '#217cbe1F');//'#d5dcfd60');
			r.style.setProperty('--bdtexthighlighter', '#ffffcf28');//'#fc88320B');//'#e0f4fbb0');//'#eef0fb');
			r.style.setProperty('--bdtexthighlightborder', '#8f3e00');//'#fc8832C0');
			r.style.setProperty('--sesamebackground', '#fffff8');

			r.style.setProperty('--tableborder', '#c0c0c0');
			r.style.setProperty('--tablecaption', '#ffffff50');
			r.style.setProperty('--tablehead', '#eaeaea');
			r.style.setProperty('--tableodd', '#fefefe');
			r.style.setProperty('--tableeven', '#f8f8f8');
			r.style.setProperty('--tablefoot', '#fcfcfc');

			r.style.setProperty('--figureimgborder', '#808080');

			r.style.setProperty('--scsegmentnumbercolor', '#5a5a81');//'#a5670a');

			r.style.setProperty('--sidenavboxshadow', '6px 0 3px -3px #BBB');

			r.style.setProperty('--infoaddonbackground', '#80808008');

			var engrave = document.getElementById('head-0');
			engrave.style.color ='#bdbdbd';
			engrave.style.textShadow ='0px 1px 0px #000000';

			themeName = "Simple";
			break;

		case "simpledark":
			for( var i = 0; i < imgs.length; i++ ) {
				imgs[i].style.filter="brightness(.8) contrast(1.2) grayscale(50%)";
			}
			for( var i = 0; i < righticons.length; i++ ) {
				righticons[i].style.filter="invert(75%)";
			}

			lefticons[0].style.filter="invert(75%)";

			theBody.style.background = '#000';
			bookPages.style.backgroundImage = 'unset';

			theTopBar.style.background = '#121212';
			theTopBar.style.boxShadow = '0 1px 0 1px #595959';

			theTocNav.classList.remove('mellow-scroll'); 
			theTocNav.classList.remove('mellow-scroll-track');
			theTocNav.classList.remove('mellow-scroll-thumb');
			theTocNav.classList.remove('bright-scroll'); 
			theTocNav.classList.remove('bright-scroll-track');
			theTocNav.classList.remove('bright-scroll-thumb');
			theTocNav.classList.add('dark-scroll'); 
			theTocNav.classList.add('dark-scroll-track');
			theTocNav.classList.add('dark-scroll-thumb');

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
			searchBar.style.borderColor = "#cfcfcf";

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

			r.style.setProperty('--primarytextcolor', '#d7d7d7');
			r.style.setProperty('--secondarytextcolor', '#c4cdda');
			r.style.setProperty('--primarybackground', '#121212');

			r.style.setProperty('--primaryinterfacecolor', '#d7d7d7');
			r.style.setProperty('--imgbackground', '#667b9e8f');

			r.style.setProperty('--TOCprogress', '#475f7a');
			r.style.setProperty('--pickedtext', '#cfcfcf');
			r.style.setProperty('--buttontext', '#cfcfcf');
			r.style.setProperty('--buttonbackground', '#475f7a');
			r.style.setProperty('--sliderbackground', '#475f7a');
			r.style.setProperty('--primarycolor', '#667b9e');
			r.style.setProperty('--listlinkhover', '#9db4ff40');
			r.style.setProperty('--bdtexthighlighter', '#484c5e40');
			r.style.setProperty('--bdtexthighlightborder', 'grey');
			r.style.setProperty('--sesamebackground', '#000');

			r.style.setProperty('--tableborder', '#c0c0c0');
			r.style.setProperty('--tablecaption', '#25252550');
			r.style.setProperty('--tablehead', '#363636');
			r.style.setProperty('--tableodd', '#0d0d0d');
			r.style.setProperty('--tableeven', '#1e1e1e');
			r.style.setProperty('--tablefoot', '#131313');

			r.style.setProperty('--figureimgborder', '#b9b9b9');

			r.style.setProperty('--scsegmentnumbercolor', '#c4cdda');

			r.style.setProperty('--sidenavboxshadow', '2px 0 2px 1px #595959');

			r.style.setProperty('--infoaddonbackground', '#afafaf48');

			var engrave = document.getElementById('head-0');
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

			//theBody.style.background = '#f1e8bb';
			theBody.style.background = '#f1e8bbb0';
			bookPages.style.backgroundImage = 'url("../_resources/images/themes/paper1.jpg")';

			theTopBar.style.background = '#f5efd0';
			theTopBar.style.boxShadow = '0 2px 6px 0 #777';

			theTocNav.classList.remove('bright-scroll');
			theTocNav.classList.remove('bright-scroll-track');
			theTocNav.classList.remove('bright-scroll-thumb');
			theTocNav.classList.remove('dark-scroll'); 
			theTocNav.classList.remove('dark-scroll-track');
			theTocNav.classList.remove('dark-scroll-thumb'); 
			theTocNav.classList.add('mellow-scroll'); 
			theTocNav.classList.add('mellow-scroll-track');
			theTocNav.classList.add('mellow-scroll-thumb');

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
			searchBar.style.borderColor = "#00008b";

			searchInput.style.background = "#f5efd0";
			searchInput.style.color = "#00008b";
			searchInput.style.setProperty ("--c", "#00008b");
			searchInput.style.setProperty ("--f", "#000089");

			for(i=0;i<searchbuttons.length;i++){
				searchbuttons[i].style.color = "#00008b";
			}			


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
			r.style.setProperty('--primarytextcolor', '#382500');
			r.style.setProperty('--secondarytextcolor', '#5c0909');
			r.style.setProperty('--primarybackground', '#f8f4da');

			r.style.setProperty('--primaryinterfacecolor', '#00008b');
			r.style.setProperty('--imgbackground', '#00000000');

			r.style.setProperty('--pickedtext', '#5c0909');
			r.style.setProperty('--buttontext', '#382500');
			r.style.setProperty('--buttonbackground', '#ecd38d');
			r.style.setProperty('--sliderbackground', '#ecd38d');
			r.style.setProperty('--primarycolor', '#cea140');
			r.style.setProperty('--listlinkhover', '#cea14030');
			r.style.setProperty('--bdtexthighlighter', '#fa807210'); 
			r.style.setProperty('--bdtexthighlightborder', '#ddc9a2');
			r.style.setProperty('--sesamebackground', '#ffffff30');

			r.style.setProperty('--tableborder', '#c0c0c0');
			r.style.setProperty('--tablecaption', '#f9edce50');
			r.style.setProperty('--tablehead', '#eadbbf');
			r.style.setProperty('--tableodd', '#f9f9e4');
			r.style.setProperty('--tableeven', '#f9f4d5');
			r.style.setProperty('--tablefoot', '#f9f9df');

			r.style.setProperty('--figureimgborder', '#b88b7b');

			r.style.setProperty('--scsegmentnumbercolor', '#5c0909');

			r.style.setProperty('--sidenavboxshadow', '3px 0 6px -3px #888');

			r.style.setProperty('--infoaddonbackground', '#cea1400a');


			var engrave = document.getElementById('head-0');
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
}	
function setMargin() {
	var whatIsPressed = document.querySelector('input[name="marginRadio"]:checked').value;
	var thebook = document.getElementById("thebook");
	var root = document.querySelector(':root');
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
 	setSelfquoteMargins();	
}

function doSetSerif () {
	setSerif();
	restorePlaceInBook();
}
//Font
function setSerif () {

	if (document.getElementById('serifFont').checked) {
		if (!isAudioBook()) {
			document.querySelector(':root').style.setProperty('--fontfamily', 'Source Serif Pro');
		};
	} else {
		if (!isAudioBook()) {
			document.querySelector(':root').style.setProperty('--fontfamily', 'Source Sans Pro');
		};
	}
	
}	
//tMSIndex
function doTMSIndex () {
	setTMSIndex ()
	restorePlaceInBook();
}
function setTMSIndex () {
	let theBook = document.getElementById('thebook')
	let paragraphArr = theBook.querySelectorAll('p, .tablewrap, figure')
	for (let i in paragraphArr) {
		if (paragraphArr[i].id) {
			let injectSpan = `<span class="tMSIndex">${paragraphArr[i].id.replace('seg-', '§')}</span>`
			if (document.getElementById('showtMSIndexCheck').checked) {
				paragraphArr[i].innerHTML = injectSpan + paragraphArr[i].innerHTML
			} else {
				paragraphArr[i].innerHTML = paragraphArr[i].innerHTML.replaceAll(injectSpan, '')
			}
		}
	}
	let headingsArr = theBook.querySelectorAll('h1, h2, h3')
	for (let i in headingsArr) {
		if ((headingsArr[i].id) && (headingsArr[i].id != '999999999') && (headingsArr[i].id != 'seg-0-1') ) {
			let injectSpan = `<span class="tMSIndex">${headingsArr[i].id.replace('seg-', '§')}</span>`
			if (document.getElementById('showtMSIndexCheck').checked) {
				headingsArr[i].innerHTML = injectSpan + headingsArr[i].innerHTML
			} else {
				headingsArr[i].innerHTML = headingsArr[i].innerHTML.replaceAll(injectSpan, '')
			}
		}
	}
}


window.onpopstate = function (event) {
	if (history.state) {
		var scroller = history.state.scrollState;
		window.scrollTo(0, scroller);
	}
}


// NAVIGATION FUNCTIONS

function scrollToID (id) {
	exitStaticModal();
	var scroller = Math.floor(window.scrollY);
	if ( history.state.scrollState != scroller) { 
		history.pushState({scrollState: scroller},'',''); // for the back button to work see onpopstate above
	}
	var elmnt = document.getElementById(id);
	elmnt.scrollIntoView({block: 'start', behavior: 'auto',});
	window.scrollBy(0, -150);
	scroller = Math.floor(window.scrollY);
	history.pushState({scrollState: scroller},'',''); // for the back button to work see onpopstate above	
}

function goToTarget (target, IDOrElement ='ID', startOrCenter = 'start') { // scrolls to an element given either an ID or an Element
	var scroller = Math.floor(window.scrollY);
	if ( history.state.scrollState != scroller) { 
		history.pushState({scrollState: scroller},'',''); // for the back button to work see onpopstate above
	}
	var elmnt;
	if (IDOrElement == 'ID') {
		elmnt = document.getElementById(target);
	} else if (IDOrElement == 'ELEMENT'){
		elmnt = target;
	}
	//console.log(target.innerHTML)
	if (startOrCenter == 'center') {
		elmnt.scrollIntoView({ behavior: "instant", block: `center`, inline: "nearest"});
	} else {
		elmnt.scrollIntoView({ behavior: "instant", block: `start`, inline: "nearest"});
		var tbHeight = -Math.abs(parseFloat(((window.getComputedStyle(document.getElementById("topbar")).height))));
		window.scrollBy(0, tbHeight); // scroll the target below the topnav bar so you can see it	
	}
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
				var tocSegment = e.target.id.replace("TOC", "");
				goToTarget(tocSegment);
			}
		}
	}
});

// hide and show the top and bottom bars by placing them off canvas when window is scrolled up (show) and down (hide) - 
// this is a automatic setting mobileUI or the user-setting/cookie forceMobileUI. Then set progress bar

segCount = document.getElementById('segcount')
window.onscroll = function() {
	
	var currentScrollPos = window.scrollY;
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

	let dataprogArr = document.querySelectorAll("[data-progress]")
	for (i = 0; i < dataprogArr.length; i++) {
		if (dataprogArr[i].dataset.progress) {
			elem = dataprogArr[i].getBoundingClientRect()
			if (prevScrollpos > currentScrollPos) {
				//console.log('scrolling up')
				let elemtop = elem.top-120
				if (elemtop < 0 ) {
					dataprogArr[i].parentNode.parentNode.scrollBy({top: elemtop, left: 0, behavior: "smooth" });
				}
			} else {
				//console.log('scrolling down')
				let elembot = elem.bottom
				let parentElembot = dataprogArr[i].parentNode.parentNode.getBoundingClientRect().bottom
				if (elembot > parentElembot)  {
					dataprogArr[i].parentNode.parentNode.scrollBy({top: elembot-parentElembot+10, left: 0, behavior: "smooth" });
				} 
			}
		}
	}

	prevScrollpos = currentScrollPos;

	//populate progress bar
	fillProgressBar();

	// save position
	getNavTarget();
	savePlaceInBook();
	//populate the tMSIndex counter
	segCount.innerHTML =  `${savedBookElements[theTopElement].id.replace('seg-','§')}`
}

function setSelfquoteMargins () {
	var root = document.querySelector(':root');
	if ( document.querySelector('input[name="marginRadio"]:checked').value == "narrowmargin") {
		root.style.setProperty('--selfquoteleftmargin', '-1em');
		root.style.setProperty('--selfquotetopmargin', '-1em');
	} else {
		if (window.innerWidth > 666) {
			root.style.setProperty('--selfquoteleftmargin', '-5em');
			root.style.setProperty('--selfquotetopmargin', '0');
		} else {
			root.style.setProperty('--selfquoteleftmargin', '-3.5em');
			root.style.setProperty('--selfquotetopmargin', '0');	
		}
	}
}

window.addEventListener('resize', function () {
	scrollToNavTarget();
	setSelfquoteMargins();
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
	//var currentTOC = currentTOCTarget.replace('head-', 'TOC');
	var currentTOC = 'TOC' + currentTOCTarget
	//console.log(currentTOC)

	if (currentTOC !== '') {
		for (var i = 0; i < savedTOCElements.length; i++) {
			savedTOCElements[i].style.background = 'unset';
			savedTOCElements[i].style.opacity = '1';
			savedTOCElements[i].style.border = "none";
			savedTOCElements[i].style.color = "var(--primarytextcolor)";
			savedTOCElements[i].setAttribute('data-progress', '');
		}
		for (var i = 0; i < savedTOCElements.length; i++) {
			if (savedTOCElements[i].id !== currentTOC) {
				savedTOCElements[i].style.background = 'var(--TOCprogress)';
				savedTOCElements[i].style.opacity = '0.35';
			} else {
				savedTOCElements[i-1].style.opacity = '1';
				savedTOCElements[i-1].style.borderTop = "thin dotted var(--secondarycolor)";//#d6630f8F";
				savedTOCElements[i-1].style.borderBottom = "thin dotted var(--secondarycolor)";
				savedTOCElements[i-1].style.color = "var(--secondarytextcolor)";
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
		let dataprogArr = document.querySelectorAll("[data-progress]")
		for (i = 0; i < dataprogArr.length; i++) {
			if (dataprogArr[i].dataset.progress) {
				dataprogArr[i].scrollIntoView({block: 'center', behavior: 'auto',});
			}
		}
	}, 400);
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
var modalalert = document.getElementById('ModalAlert');
var modallists = document.getElementById('ModalLists');
var modalsutta = document.getElementById('ModalSutta');
var modalselfquote = document.getElementById('ModalSelfquote');


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
	buildInfo();
	stopBookScroll();
	//modalbody.scrollTop = 0;
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
			modalbody.style.backgroundImage = 'unset';
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
			modalbody.style.backgroundImage = 'unset';
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
			modalbody.style.backgroundImage = 'url("../_resources/images/themes/paper1.jpg")';
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
			modalbody.style.maxHeight = "75vh";
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
		case 'Lists':
			modalbody.style.height = "85vh";
			modalbody.style.maxHeight = "85vh";
			modalbody.style.padding = "0";
			modalcontent.style.width = "95%";
			modalcontent.style.maxWidth = "65em";
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
			modalcontent.style.maxWidth = "65em";
			modalcontent.style.position ="relative";
			modalcontent.style.right = "0";
			modalcontent.style.top = "0";
			modalcontent.style.padding = "0";
			break;
		case 'Selfquote':
			modalbody.style.height = "auto";
			modalbody.style.maxHeight = "85vh";
			modalbody.style.padding = "0";
			modalcontent.style.width = "95%";
			modalcontent.style.maxWidth = "65em";
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
			hideElement(modallists);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modalsutta);
			hideElement(modalselfquote);
			showElement(modaldetails);		
			break;
		case 'Settings':
			hideElement(modaldetails);
			hideElement(modallists);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modalsutta);
			hideElement(modalselfquote);
			showElement(modalsettings);		
			break;
		case 'Download':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modallists);
			hideElement(modalalert);
			hideElement(modalsutta);
			hideElement(modalselfquote);
			showElement(modaldownload);		
			break;
		case 'Alert':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modallists);
			hideElement(modaldownload);
			hideElement(modalsutta);
			hideElement(modalselfquote);
			showElement(modalalert);		
			break;
		case 'Lists':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modalsutta);
			hideElement(modalselfquote);
			showElement(modallists);
			break;
		case 'Sutta':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modallists);
			hideElement(modalselfquote);		
			showElement(modalsutta);
			break;
		case 'Selfquote':
			hideElement(modaldetails);
			hideElement(modalsettings);
			hideElement(modaldownload);
			hideElement(modalalert);
			hideElement(modallists);		
			hideElement(modalsutta);
			showElement(modalselfquote);
			break;
		}
	showElement(modal);
	showElement(modalcontent);
}

//var calledFromNotes = false;

// use event delagation on the book to show notes or move to internal links
document.getElementById("thebook").addEventListener("click", function(e) {

	if(e.target && (/* e.target.nodeName == "SUP" || */ e.target.className == "suttaref" || e.target.className == "TOCref")) { 
		if (e.target.className == "suttaref" || e.target.className == "TOCref") {
			var toctarget ='';
			if (e.target.className == "TOCref") {
				toctarget = e.target.getAttribute("data-TOCref");
			} else {
				var tocNumber = e.target.id.substring(3);
				toctarget = "head-" + tocNumber;
			}
			goToTarget(toctarget);
			if (true) {e.preventDefault();}
		} else {	
/* 			savedsup = e.target;
			setModalStyle ("Notes");
			showModal("Notes");
			//highlightnote(e.target.innerHTML); 
			stopBookScroll ();
			if (true) {e.preventDefault();} */
		}	
	}

	if (e.target.classList.contains('sclinktext') || e.target.classList.contains('scsegments')) {
		let linkNode = e.target;
		if (e.target.classList.contains('scsegments')) {
			linkNode = e.target.parentNode;
		}
		displaySutta(linkNode.innerText);
		//savedsup = linkNode;
		if (true) {e.preventDefault();}
	}

	if ((e.target.parentNode.parentNode.id == 'references') || (e.target.parentNode.parentNode.id == 'shelffooter') || (e.target.classList.contains('extlink'))) {
			if (e.target.closest('A') !== null) {
				doOutAppHREF(e.target.closest('A').getAttribute('href'));
				if (true) {e.preventDefault();}
		}
	}

	if ((e.target.classList.contains('goselfquote'))) {
			displaySelfquote(e.target.innerHTML);
			//savedsup = e.target;
	}

	if (e.target.classList.contains('bookSegment')){
		var [bookSeg, mark_paragraph] = decodeBookSegment(e.target.innerText);
		goToTarget(bookSeg);
	}
	
	if (e.target.classList.contains('manualLink')) {
		var whereTo = e.target.getAttribute('data-target').substring(1);
		goToTarget(whereTo);
	}

	if (e.target.classList.contains('sesame')) {
		showSpinner();
		toggleSesame (e.target)
	} else if (e.target.parentNode.classList.contains('sesame')) {
		showSpinner();
		toggleSesame (e.target.parentNode)
	}

});


document.getElementById("ModalDetails").addEventListener("click", function(e) {
	if (e.target.closest('A') !== null) {
		if (!(e.target.closest('A').classList.contains('booklink'))) {
			doOutAppHREF(e.target.closest('A').getAttribute('href'));
			if (true) {e.preventDefault();}
		}
	}
});


function showAlert(HTMLToShow, alertHeader='ALERT', focusButton = '') {
	restorePlaceInBook()
	modalalert.innerHTML = HTMLToShow
	setModalStyle ("Alert")
	showModal ("Alert")
	document.getElementById('ModalHeaderText').innerText = alertHeader
	if (focusButton) {
		document.getElementById(`${focusButton}`).focus()
	}
}

modalalert.addEventListener("click", function(e) {
	if (e.target.id == 'goHashBtn') {
		let refTarget = e.target.getAttribute(`data-ref`)
		exitStaticModal();
		goToTarget(refTarget);
	}
	if (e.target.id == 'shareAtHere') {
		let urlTarget = e.target.getAttribute(`data-toShare`)
		exitStaticModal();
		navigator.clipboard.writeText(urlTarget)
	}
	if (e.target.id == 'shareNoHash') {
		let urlTarget = e.target.getAttribute(`data-toShare`)
		exitStaticModal();
		navigator.clipboard.writeText(urlTarget)
	}
});


function exitStaticModal () {
	startBookScroll();
	hideElement(modal);
	hideElement(modalcontent);
}


closebtn.addEventListener('click',exitStaticModal);

window.onclick = function(event) {if (event.target == modal) {exitStaticModal()}}

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
	if (isElementInViewport(document.getElementById('seg-0-1'))) {
		theTopElement = 0
		theTopElementTopEdge = Math.floor(theTopElementTopEdge);
	} else {
		for (var i = 0; i < savedBookElements.length; i++) {
			if (isElementInViewport (savedBookElements[i])) {
				theTopElement = i;
				theTopElementTopEdge = savedBookElements[i].getBoundingClientRect().top;
				theTopElementTopEdge = Math.floor(theTopElementTopEdge);
				break;
			}
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

function doOutAppHREF (href) {
		if (navigator.onLine) {
			showSpinner();
			window.location.href = href;
		} else {
			showAlert('<p><br>You need to be online to go to: <br>' + href + '<br><br></p>');
		}
}

function decodeBookSegment (anchortext) {
	let str = ''
	let unmarked_paragraph = false
	if (anchortext.substring(0,5).toLowerCase() == 'table') {
		let tableNum = anchortext.toLowerCase().replace(/\s/g,'').replace('table', '')
		str = `table_${tableNum}`
	} else if (anchortext.substring(0,6).toLowerCase() == 'figure') {
		let figNum = anchortext.toLowerCase().replace(/\s/g,'').replace('figure', '')
		str = `fig${figNum}`
	} else if (anchortext.substring(0,7).toLowerCase() == 'segment') {
		let segNum = anchortext.toLowerCase().replace(/\s/g,'').replace('segment', '')
		str = `seg-${segNum}`
	} else	{
		str = anchortext.toLowerCase().replace(/\s/g,'').replace(',','').replace ('chapter', 'c' ).replace ('paragraph', 'p')
		if ( str.search('p') == -1 ) {
			str = `head-${str.substring(1)}`
		} else {
			unmarked_paragraph = true
		}
	}
	return [str, unmarked_paragraph]
}

function blink (element) {
	element.classList.add ('blink')
	function removeBlink () {
		element.classList.remove ('blink')
	}
	setTimeout (removeBlink, 600)
}

document.getElementById("ModalLists").addEventListener("click", function(e) {
	if (e.target.id == 'tablesListTab') {
		tablesList.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" })
	}
	if (e.target.id == 'figuresListTab') {
		figuresList.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" })
	}
	if (e.target.id == 'textsListTab') {
		textsList.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" })
	}
	if (e.target.id == 'footnotesListTab') {
		footnotesList.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" })
	}

	if (e.target.closest('.reflistitem')) {
		let noteNumberToOpen =``
		let bookSeg = ``
		if (e.target.closest('#lot-list') || e.target.closest('#figures-list')) {
			bookSeg = e.target.closest('.reflistitem').getAttribute('data-segref')
		} else 
		if (e.target.closest('#texts-list') || e.target.closest('#footnotes-list') ) {
			bookSeg = e.target.closest('.reflistitem').getAttribute('data-segref')
			noteNumberToOpen = e.target.closest('.reflistitem').getAttribute('data-fnnumber')
		} else {
			console.log('Something else')
		}
		if (bookSeg) {
			closebtn.click();
			if (e.target.closest('#lot-list') || e.target.closest('#figures-list')) {
				goToTarget(bookSeg, undefined, 'start');
			} else {
				goToTarget(bookSeg, undefined, 'center')
			}
			if (noteNumberToOpen) {
				let allSups = document.querySelectorAll ('sup')
				for (let j in allSups) {
					if (allSups[j].innerText == noteNumberToOpen) {
						if (!allSups[j].classList.contains('closebutton')) {
 							allSups[j].click()
						}
						goToTarget(allSups[j], 'ELEMENT', 'center')
						setTimeout(() => {
							blink(allSups[j].nextElementSibling)
						  }, 200); 
						break
					}
				}
			} else {
				blink (document.getElementById(bookSeg))
			}
		}

	}

});

function toggleSesame (el) {

	if ((el.nextElementSibling) && (el.nextElementSibling.classList.contains('opensesame') || el.nextElementSibling.classList.contains('opensesameref'))) {
		el.nextElementSibling.remove();
		el.classList.remove('closebutton');
		hideSpinner()
	} else {
		 function openSesame () {
			async function decodeSesameKey (sesameKey) {
				let sesameKeyArr = sesameKey.split(':')
/* 				console.log(`0::${sesameKeyArr[0]}`) // type
				console.log(`1::${sesameKeyArr[1]}`) // key
				console.log(`2::${sesameKeyArr[2]}`) // a zotero reference that appears in the biblio for the book */
				let biblio = `` // NEED TO WRITE BIBLIO BIT if there's a biblio entry specified
				if (sesameKeyArr[2]) {
					biblio = sesameKeyArr[2]
				}
				if (sesameKeyArr[0].includes('-blurbs')) {
					let fetchPath = `../_resources/sesame-data/blurbs/scblurbs.json`
					function populateSesame (quoteData) {
						function capitalizeFirstLetter(val) {
							return String(val).charAt(0).toUpperCase() + String(val).slice(1);
						}
						for (let i in quoteData) {
							if (quoteData[i].suttaRef == sesameKeyArr[1]) {
								let linkHTML = ``
								if (quoteData[i].type == 'leaf') {
									let linkTextArr = sesameKeyArr[1].match(/[a-z]+|[^a-z]+/gi);
									switch (linkTextArr[0]) {
										case "dn":
										case "an":
										case "sn":
										case "mn":
											linkTextArr[0] = linkTextArr[0].toUpperCase()
											break
										case "snp":
											if (linkTextArr[2]) { // its a vagga
												linkTextArr[0] = ``
											} else {
											linkTextArr[0] = capitalizeFirstLetter(linkTextArr[0]);
											}
											break
										case "ja" :
											linkTextArr[0] = ``
											break
									}
									if (linkTextArr[0]) {
										let linkText = `${linkTextArr[0]} ${linkTextArr[1]}`
										linkHTML= `<span class='sclinktext'>${linkText}</span>`
									}
								}
								let scRefHTML = `<a class="extlink" href="https://suttacentral.net/${sesameKeyArr[1]}">source: <img src='../_resources/images/icons/sc-icon.png' style='width:1em; position:relative; top:0.2em;' alt="SuttaCentral Logo">SuttaCentral</a>`
								let quoteHTML =`${scRefHTML}<br><h3>${quoteData[i].rootTitle}<br>${quoteData[i].transTitle}<br>${linkHTML}</h3><hr><p>${quoteData[i].blurb}</p>`
								el.insertAdjacentHTML("afterend", `<div class=opensesame>${quoteHTML}<br>${biblio}</div>`);
								el.classList.add('closebutton')
							}
						}
					}
					await fetch(fetchPath)
					.then(response => response.json())
					.then (data => populateSesame(data))
					.catch(error => {
						console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
					});
				} else 
				if (sesameKeyArr[0] == 'wp') {
					let fetchPath = `../_resources/sesame-data/wikipedia/${sesameKeyArr[1]}.json`
					function populateSesame (quoteData) {
						let sourceHTML = `<span class='extlink'><a alt='wikipedia page' href = 'https://en.wikipedia.org/wiki/${sesameKeyArr[1].replace('-', '#')}'>source: <img class='icon' src='../_resources/images/icons/Wikipedia-logo-v2.svg'> Wikipedia</a></span>`
						let localHTML = `<h3>${quoteData.Page}<br>${quoteData.Title}</h3>${quoteData.Text}`
						let quoteHTML =`${sourceHTML}<br>${localHTML}`
						el.insertAdjacentHTML("afterend", `<div class=opensesame>${quoteHTML}<br>${biblio}</div>`);
						el.classList.add('closebutton') 
					}
					await fetch(fetchPath)
					.then(response => response.json())
					.then (data => populateSesame(data))
					.catch(error => {
						console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
					});

				} else 
				if (sesameKeyArr[0] == `bodhi-nikaya-notes`) {
					let fetchPath = `../_resources/sesame-data/${sesameKeyArr[0]}/${sesameKeyArr[1]}.json`

					function populateSesame(quoteData) {
						let subSectionSpacer = ''
						if (quoteData.SubSection) {
							subSectionSpacer = '<br>'
						}
						let author = ''
						if (quoteData.Author) {
							author = `by ${quoteData.Author}`
						}
						let quoteHTML = ''
						quoteHTML += `<h3>${quoteData.Document}<br>${quoteData.Section}${subSectionSpacer}${quoteData.SubSection}<br>${quoteData.Title}<br>${author}</h3>`
						quoteHTML += quoteData.Quote.replaceAll(/<sup>[0-9]+<\/sup>/gi, '');
						quoteHTML += `<div style='text-align:left'><hr style='width:50%; margin:1em auto;'><span style='font-variant:small-caps'>Bibliography Entry: </span>${quoteData.ZotRef}`
						el.insertAdjacentHTML("afterend", `<div class=opensesame>${quoteHTML}</div>`);
						el.classList.add('closebutton')
					}

					fetch(fetchPath)
						.then(response => response.json())
						.then (data => populateSesame(data))
						.catch(error => {
							console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
						}
					);

				} else 
				if (sesameKeyArr[0] == `DPPN`) {
					let fetchPath = `../_resources/sesame-data/dictionaries/complex/en/pli2en_dppn.json`

					function populateSesame (quoteData) {
						let localHTML = ``
						for (let i in quoteData) {
							if (quoteData[i].word == sesameKeyArr[1]) {
								localHTML = quoteData[i].text
								localHTML = localHTML.slice(0, localHTML.lastIndexOf('</dt>')+5) + '<hr>' + localHTML.slice(localHTML.lastIndexOf('</dt>')+5, localHTML.length)

								break;
							}
						}
 						let sourceHTML = `<a class="extlink" href="https://suttacentral.net/">source: DPPD—<img src='../_resources/images/icons/sc-icon.png' style='width:1em; position:relative; top:0.2em;' alt="SuttaCentral Logo">SuttaCentral Edition</a>`
						let quoteHTML =`${sourceHTML}<br>${localHTML}`
						el.insertAdjacentHTML("afterend", `<div class=opensesame>${quoteHTML}<br>${biblio}</div>`);
						el.classList.add('closebutton') 
					}

					await fetch(fetchPath)
					.then(response => response.json())
					.then (data => populateSesame(data))
					.catch(error => {
						console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
					});
				} else 
				if (sesameKeyArr[0] == `zotref`) {
					let zotBiblioEntries = document.querySelectorAll('.zotbiblio > p')
					let bibReference = ``
					for (let i in zotBiblioEntries) {
						if (zotBiblioEntries[i].getAttribute('data-zotref') == sesameKeyArr[1]) {
							bibReference = zotBiblioEntries[i].innerHTML
							break
						}
					}
					el.insertAdjacentHTML("afterend", `<span class=opensesame>${bibReference}</span>`);
					el.classList.add('closebutton')
				}
			}

			async function populateFootnote () {
				let fetchPath = `../_resources/book-data/${shortcode()}/footnotes.json`
				function populateSesame (noteData) {
					for (let i in noteData) {
						if (noteData[i].fnNumber == el.innerText) {
							let localHTML = noteData[i].fnHTML
							el.insertAdjacentHTML("afterend", `<div class=opensesame><span>note: ${el.innerText}</span> ${localHTML}</div>`);
							el.classList.add('closebutton')
							break
						}
					}
				}

				await fetch(fetchPath)
				.then(response => response.json())
				.then (data => populateSesame(data))
				.catch(error => {
					console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
				});
			}

			if (el.nodeName == 'SUP') {
				populateFootnote()
			} else {
				decodeSesameKey(el.getAttribute('data-sesame-key'))
			}
		}
		openSesame()
		hideSpinner()
	}
}


function displaySutta (linkText) {
	setModalStyle('Sutta');
	showModal('Sutta');
	modalbody.scrollTop = 0;
	stopBookScroll ();
	showBD(linkText);
	let [slug, verses] = linkText.split(":");
	if (!verses) {
		verses = ''
	} else {
		verses = `<span style='font-size:smaller; font-weight:300'>:${verses}</span>`
	}
	document.getElementById('ModalHeaderText').innerHTML = `${slug}${verses}`;
}


/* SelfQuote */

document.getElementById("ModalSelfquote").addEventListener("click", function(e) {
	if (e.target.classList.contains('goselfquote')) {
		//calledFromNotes = false
		exitStaticModal()
		goToTarget(`bqseg${e.target.innerText.replace('§','').replace(' in the main text','')}`)
	}
});

function displaySelfquote (linktext) {
	setModalStyle('Selfquote');
	showModal('Selfquote');
	modalbody.scrollTop = 0;
	stopBookScroll ();
	let selfquoteArea = document.getElementById("selfquotearea");

	let buildHTML = '';

	if (linktext.substring(0,1) == '§') {
		let SQHeaderArray = [];
		let shortCode = shortcode();

		function buildText (headerData) {
			SQHeaderArray = headerData;
			buildHTML += `<div style="margin-top: 0; font-variant: small-caps; text-align: right"><span class="goselfquote">${linktext} in the main text</span></div>`
			let selfquoteArr = document.getElementsByClassName("selfquote");
			for (i = 0; i < selfquoteArr.length; i++) {
				if ( linktext.substring(1) == selfquoteArr[i].id.replace("bqseg", "")) {
					let modalHeader = 'Section'
					let supHTML = '';
					
					for (let j=0; j<SQHeaderArray.length; j++) {
						if (linktext.slice(1) == SQHeaderArray[j].section) {
							buildHTML += `<h4>${SQHeaderArray[j].modalHead}`
							buildHTML += `<br>${SQHeaderArray[j].bodyHead}`
							modalHeader = SQHeaderArray[j].modalHead
							supHTML = SQHeaderArray[j].supHTML
						}
					}
	
					let bookNoteNumber = selfquoteArr[i].innerHTML.substring(selfquoteArr[i].innerHTML.lastIndexOf('<sup>')+5,selfquoteArr[i].innerHTML.lastIndexOf('</sup>'))
					if (supHTML != '' ) {
						buildHTML += `<br>${supHTML}</h4>`
					} else {
						let allBookNotes = document.getElementsByClassName("booknotesNumber");
						for (let k=0; k < allBookNotes.length; k++) {
							if (allBookNotes[k].innerText == bookNoteNumber) {
								buildHTML += `<br>${allBookNotes[k].nextElementSibling.innerHTML}</h4>`
							}
						}
					}
	
					buildHTML += selfquoteArr[i].innerHTML.replaceAll(/ style=""/g, "").replaceAll(/<sup>[0-9]+<\/sup>/g, "").replaceAll(/<span class="goselfquote">(§[0-9]+)<\/span>/g, '$1' )
	
					document.getElementById('ModalHeaderText').innerHTML = `${linktext}`;
				}
			}
			selfquoteArea.innerHTML = buildHTML;
		}

		fetch(`../_resources/book-data/${shortCode}/selfquoteHeaders.json`)
			.then(response => response.json())
			.then (data => buildText(data))
			.catch(error => {
				console.log(`${error}ERROR: Can't fetch ../_resources/book-data/${shortCode}/selfquoteHeaders.json`);
			}
		);


	} else { // it's (currently) a Figure
		let figureID = linktext.replace(/&nbsp;/, '').replace(' ','').toLowerCase().replace('ure', '')
		buildHTML = `<div style="text-align: center">`
		buildHTML += document.getElementById(figureID).innerHTML
		buildHTML += `</div>`
		document.getElementById('ModalHeaderText').innerHTML = `Figure ${figureID.slice(3)}`;
		selfquoteArea.innerHTML = buildHTML;
	}
	
}



// Share Functions
shareBtn.onclick = function() {


	let selection = window.getSelection()
	let alertStr = ``
	let shareFrom = savedBookElements[theTopElement].id
	let bookPath = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${shortcode()}`

	if (selection.toString() != '') {

		function doStuff (footnotesData) {
			let range = selection.getRangeAt(0)
			let startTag = range.startContainer.parentNode.tagName
			let startID = range.startContainer.parentNode.id
			let starter = startID
			if ((startTag == 'SPAN') || (startTag == 'SUP')) {
				starter = range.startContainer.parentNode.parentNode.id
			} 
	
	/* 		let startOff = range.startOffset
			let endTag = range.endContainer.parentNode.tagName
			let endID = range.endContainer.parentNode.id
			let endOff = range.endOffset
			let ender = endID
			 if ((endTag == 'SPAN') || (endTag == 'SUP')) {
				ender = range.endContainer.parentNode.parentNode.id
			}   
			alertStr = `startTag: ${startTag}<br>startID: ${startID}<br>startOff: ${startOff}<br>starter: ${starter}<br><br>endTag ${endTag}<br>endID: ${endID}<br>endOff: ${endOff}<br>ender: ${ender}`
	 */		
	
			//Create the copyDiv
			let copyDiv = document.createElement("div")
			copyDiv.id = `copydiv`
			copyDiv.classList.add('copybox')
			
			//Make the Link
			let linkText = `<p>Text from: <strong><em>${document.title.replace(`-`, `by`)}</em></strong>, starting at: <a href='${bookPath}#${starter}'> <strong>[${starter.replace('seg-','§')}]:</strong></a></p><hr>\n\n`
	
	
			let copyQuote = document.createElement("blockquote")
			//Add the user selection
			for(let i = 0; i < selection.rangeCount; i++) {
				copyQuote.append(selection.getRangeAt(i).cloneContents())
			   }
			let originalHTML = copyQuote.innerHTML
	
			//let allElements = copyQuote.querySelectorAll('*')
	
			//Add the Notes
			function addnotes () {
				let notesStr =``
				let allSups = copyQuote.querySelectorAll('sup')
				for (let i = 0; i < allSups.length; i++) {
					if (i == 0) {
						notesStr += `<hr style="width: 10rem;margin-left:0; "><p>Notes:</p>`
					}
					let supNo = allSups[i].innerText
					let tempText = ` [${allSups[i].innerText}]`
					allSups[i].innerText = tempText
		
					if (allSups[i].classList.contains('closebutton')) {
						allSups[i].nextElementSibling.remove()
						allSups[i].classList.remove('closebutton')
						console.log (allSups[i].classList)
					} else {
						console.log(`sesame is closed`)
					}
					for (let i=0; i < footnotesData.length; i++) {
						if (supNo == footnotesData[i].fnNumber) {
							let newfnHTML = footnotesData[i].fnHTML.replaceAll(`<p>`,``)
															.replaceAll(`</p>`,`<br>`)
							notesStr += `<p style='font-size: smaller'>[${supNo}] ${newfnHTML}</p>`
						}
					}
				}
				copyQuote.innerHTML += notesStr
			}
		
			addnotes();
	
			function suttaCentralIt (suttaReference) {
				let newlink = ''
				 let [head,tail] = suttaReference.replace(/\s+/g, '').toLowerCase().split('–')[0].split(',')[0].split(':')
				  if (tail) {
					 tail = '#' + tail
					 newlink = `<a href = "https://suttacentral.net/${head}/en/sujato/${tail}">${suttaReference}</a>`
				 } else {
					 newlink = `<a href = "https://suttacentral.net/${head}/en/sujato">${suttaReference}</a>`
				 }
				  return newlink
			 }
	
			//Process the text
			let allSpans = copyQuote.getElementsByTagName('span')
			for (let i in allSpans) {
				if ((allSpans[i]) && (allSpans[i].tagName == 'SPAN')) {
					if (allSpans[i].lang == 'pi') {
						allSpans[i].innerHTML = `<em>${allSpans[i].innerHTML}</em>`
					}
					if (allSpans[i].className == 'tMSIndex') {
						let tempHTML = `[${allSpans[i].innerHTML}] `
						allSpans[i].className = ''
						allSpans[i].innerHTML=tempHTML
						allSpans[i].style = `font-weight: normal; font-size: 11pt; font-variant:normal;`
					}
					if (allSpans[i].className == 'ptsref') {
						let tempHTML = `[${allSpans[i].innerHTML}] `
						allSpans[i].className = ''
						allSpans[i].innerHTML=tempHTML
					}
					if (allSpans[i].className == 'chapnum') {
						allSpans[i].className = ''
					}
					if (allSpans[i].className == 'sesame') {
						allSpans[i].className = ''
					}
					if (allSpans[i].className == 'list-margin') {
						allSpans[i].innerHTML = allSpans[i].innerHTML + ' ' 
						allSpans[i].className = ''
					}
					if (allSpans[i].className == 'sclinktext') {
						allSpans[i].innerHTML = suttaCentralIt(allSpans[i].innerText)
						allSpans[i].classList.remove('sclinktext')
					}
					 if (allSpans[i].classList.contains('closebutton')) {
						allSpans[i].classList.remove('closebutton')
					} 
					 if (allSpans[i].classList.contains('opensesame')) { // just span level opensesame
						let el = document.createElement('div')
						el.innerHTML = allSpans[i].innerHTML
						let allInside = el.querySelectorAll('*')
						for (let j in allInside) {
							//console.log(allInside[j].tagName)
							if (allInside[j].className == 'bibhead') {
								allInside[j].className = ''
							} else
							if (allInside[j].className == 'linkContainer'){
								allInside[j].remove()
							}
						}
						allSpans[i].innerHTML = el.innerHTML.replaceAll(`<span class="">`, ``).replaceAll('</span>', '')
						allSpans[i].className = ''
						allSpans[i].innerText = ` [${allSpans[i].innerText}]`
					}
				}
			}
	
			let allH1s = copyQuote.querySelectorAll('h1')
			for (let i in allH1s) {
				allH1s[i].style = `font-weight:bold; font-style:normal; font-variant:small-caps;`
			}
			let allH2s = copyQuote.querySelectorAll('h2')
			for (let i in allH2s) {
				allH2s[i].style = `font-variant:small-caps;`
			}
			let allH3s = copyQuote.querySelectorAll('h3')
			for (let i in allH3s) {
				allH3s[i].style = `text-align:left`
			}
			let allDivs = copyQuote.querySelectorAll('div')
			for (let i in allDivs) {
				 if (allDivs[i].className == 'epigram') {
					allDivs[i].className = ''
					allDivs[i].style = `text-align: center; font-style:italic;`
				}
				 if (allDivs[i].className == 'epigram-cite') {
					allDivs[i].className = ''
					allDivs[i].style = `text-align: center; font-variant:small-caps;`
				}
				if (allDivs[i].className == 'opensesame') { 
					allDivs[i].classList = ''
					let el = document.createElement('html')
					el.innerHTML = allDivs[i].innerHTML
					let allEls = el.querySelectorAll('*')
					for (let j in allEls) {
							if (allEls[j].tagName == 'IMG') {
								allEls[j].remove()
							} else
							if (allEls[j].tagName == 'HR') {
								allEls[j].remove()
							}
							if (allEls[j].tagName == 'BR') {
								allEls[j].remove()
							}
							if (allEls[j].tagName == 'A') {
								if (allEls[j].innerText.substring(0,7) == `source:`) {
									let newNode = document.createElement("p")
									newNode.style = `font-weight:500; font-style:italics; font-variant:small-caps`
									newNode.innerHTML = 'Definition of term:'
									allEls[j].parentNode.insertBefore(newNode, allEls[j])
								}
							}
							if (allEls[j].tagName == 'H3') {
								let [a,b] = allEls[j].innerHTML.split('<br>')
								allEls[j].outerHTML = `<p style='margin-top:0; margin-bottom:0'><b>${a}—${b}</b></p>` 
							}
							
							else {
								allEls[j].classList = ''
							}
					}
					allDivs[i].innerHTML = `<blockquote style='font-size:smaller'>${el.innerHTML}</blockquote>`
				}
	
	
	/*			if (allDivs[i].className == 'line-block') {
					allDivs[i].className = ''
				} */
			}
	
			let allAs = copyQuote.querySelectorAll('a')
			for (let i in allAs) {
				if (allAs[i].className == 'extlink tipref') {
					allAs[i].className = ''
				}
			}
	
			copyQuote.innerHTML = copyQuote.innerHTML.replaceAll(`class="" `, '')
												 .replaceAll(`class=""`, '')
												 .replaceAll(`class="OAstart"`, '' )
											 
			copyDiv.innerHTML = `${linkText}${copyQuote.outerHTML}`
	
	
			navigator.clipboard.write([new ClipboardItem({
				'text/plain': new Blob([copyDiv.innerText], {type: 'text/plain'}),
				'text/html': new Blob([copyDiv.innerHTML], {type: 'text/html'})
			})])
	
			let pureHTMLStr = `<h1>Original HTML with classes:</h1><div class='copybox'></textarea>
												  <textarea id='originacopyhtml' style='width:100%; height:200px'>${originalHTML.replaceAll('</p>', '</p>\n')
												  .replaceAll('</h1>', '</h1>\n')
												  .replaceAll('</h2>', '</h2>\n')
												  .replaceAll('<hr>', '\n<hr>')
												  .replaceAll('</ul>', '</ul>\n')
												  .replaceAll('</li>', '</li>\n')
												  .replaceAll('</blockquote>', '</blockquote>\n')
												  .replaceAll('<blockquote>', '\n<blockquote>')
												  .replaceAll('\n\n', '\n')
												  .replaceAll('<hr style="width: 10rem;margin-left:0; ">', '\n<hr>')}</textarea>
								</div>`
	/* 		let pureHTMLStr = `<p>As HTML:</p><div class='copybox'><textarea  id='copyhtml' style='width:100%; height:400px'>${copyDiv.innerHTML.replaceAll('</p>', '</p>\n')
												  .replaceAll('</h1>', '</h1>\n')
												  .replaceAll('</h2>', '</h2>\n')
												  .replaceAll('<hr>', '\n<hr>')
												  .replaceAll('</ul>', '</ul>\n')
												  .replaceAll('</li>', '</li>\n')
												  .replaceAll('</blockquote>', '</blockquote>\n')
												  .replaceAll('<blockquote>', '\n<blockquote>')
												  .replaceAll('<br></p>', '</p>')
												  .replaceAll('\n\n', '\n')
												  .replaceAll('<hr style="width: 10rem;margin-left:0; ">', '\n<hr>')}</textarea><p>Original HTML with classes:</p>
												  <textarea id='originacopyhtml' style='width:100%; height:200px'>${originalHTML.replaceAll('</p>', '</p>\n')
												  .replaceAll('</h1>', '</h1>\n')
												  .replaceAll('</h2>', '</h2>\n')
												  .replaceAll('<hr>', '\n<hr>')
												  .replaceAll('</ul>', '</ul>\n')
												  .replaceAll('</li>', '</li>\n')
												  .replaceAll('</blockquote>', '</blockquote>\n')
												  .replaceAll('<blockquote>', '\n<blockquote>')
												  .replaceAll('\n\n', '\n')
												  .replaceAll('<hr style="width: 10rem;margin-left:0; ">', '\n<hr>')}</textarea>
								</div>` */
	
			showAlert (`<h1>Copied to your Clipboard:</h1><p>The following (which includes a link to the text, reconstructed Notes and links to suttas) has been <strong>copied to your clipboard:</strong></p>${copyDiv.outerHTML}<br><hr>${pureHTMLStr}`, `Clipboard Copy`)
	
		}
		// Get all the footnotes
		if (document.querySelectorAll('sup').length > 0 ) {
			let fetchPath = `../_resources/book-data/${shortcode()}/footnotes.json`
			fetch (fetchPath)
			.then(response => response.json())
			.then (data => doStuff(data))
			.catch(error => {
				console.log(`${error}ERROR: Can't fetch ${fetchPath}`);
			});
		} else {
			doStuff('')
		}


	} else {
		if (navigator.share) {
			let navSharetitle= `${document.title.replace(`-`, `by`)}`
			let navSharetext= `This link goes directly to tMS Reference: [${shareFrom}]`
			let navShareurl= `${bookPath}#${shareFrom}`
			navigator.share({
				title: navSharetitle,
				text: navSharetext,
				url: navShareurl
			});
		} else {
			alertStr = `<p>You have not selected any text to share.<br>You are currently reading <b>${shareFrom.replace('seg-','§')}</b> in the book.<br>You can do one of the following:</p>
						<p style="font-family:'Courier New'">${bookPath}#${shareFrom}<br>
						<button id="shareAtHere" data-toShare="${bookPath}#${shareFrom}">Copy the url for book to go directly to <b>${shareFrom.replace('seg-','§')}</b></button></p>
						<p style="font-family:'Courier New'">${bookPath}/<br>
						<button id="shareNoHash" data-toShare="${bookPath}">Copy the url for book without a specified position.</button></p>`
			showAlert (`${alertStr}`)
		} 
	}
}

listsBtn.onclick = function() {
	setModalStyle ("Lists");
	showModal("Lists");
	stopBookScroll ();
	let atLeastOneListExists = false

	function tables () {
		let tabrefArr = document.querySelectorAll('table');
		let parentDiv = document.getElementById('tablesList');
		let html = "";
		if (tabrefArr.length  > 0) {
			atLeastOneListExists = true
			html = `<section id='lot-list' class="infocontainer">`
			html += `<h3>Tables:</h3>`;
			html += `<div class="reflistbuttons"><h4>Sort by:</h4>`
			html += `<button class="sort asc" data-sort="lotSegRef">Segment</button> `
			html += `<button class="sort" data-sort="lotCaption">Caption</button></div>`
			html += `<ul class="list reflist">`
			for (let i = 0; i < tabrefArr.length; i++) {
				if ((tabrefArr[i].caption) && (tabrefArr[i].id.slice(0,5) == 'table')){ // it's a standard table rather than a table genreated in a note from an external source
					let segment = `<span class='lotSegRef'>${tabrefArr[i].parentNode.id.substring(4)}</span>`
					let segRef = tabrefArr[i].parentNode.id
					let caption = `<span class='lotCaption'>${tabrefArr[i].caption.innerHTML.replace('<br>', ' ')}</span>`;
					html += `<li class='reflistitem' data-segref='${segRef}'>${segment}${caption}</li>`;
				}
			}
			html += `</ul></section>`;
			parentDiv.innerHTML = html;
			var options = {valueNames: [ 'lotSegRef', 'lotCaption' ]};
			var lotList = new List('lot-list', options);
		}
	}
	
	function figures () {
		let figArr = document.querySelectorAll('figure')
		let parentDiv = document.getElementById('figuresList')
		let html = "";
		if (figArr.length > 0) {
			atLeastOneListExists = true
			html = `<section id='figures-list' class="infocontainer">`
			html += `<h3>Figures:</h3>`;
			html += `<div class="reflistbuttons"><h4>Sort by:</h4>`
			html += `<button class="sort asc" data-sort="figureSegRef">Segment</button> `
			html += `<button class="sort" data-sort="figureCaption">Caption</button></div>`
			html += `<ul class="list reflist">`
			for (let i = 0; i < figArr.length; i++) {
				let segment = `<span class='figureSegRef'>${figArr[i].id.substring(4)}</span>`
				let segRef = figArr[i].id
				let caption = `<span class='figureCaption'>${figArr[i].getElementsByTagName("figcaption")[0].innerHTML}</span>`;
				html += `<li class='reflistitem' data-segref='${segRef}'>${segment}${caption}</li>`;
			}
			html += `</ul></section>`;
			parentDiv.innerHTML = html;
			var options = {valueNames: [ 'figureSegRef', 'figureCaption' ]};
			var figuresList = new List('figures-list', options);
		}
	}

	function sctexts () {
		function populateSCTexts (sclinksdata) {
			atLeastOneListExists = true
			let parentDiv = document.getElementById('textsList');
			let html =``
			html = `<section id="texts-list" class="infocontainer">`;
			html += `<h3>Texts:</h3>`;
			html += `<div class="reflistbuttons"><h4>Sort by:</h4><button class="sort asc" data-sort="textSegRef">Segment</button>`
			html += `  <button class="sort" data-sort="sclinktext">Reference</button></div>`
			html += `<ul class="list reflist">`
			for (let i in sclinksdata) {
				let segRef = ``
				let segment = ``
				let data_fnnumber = ``
				let footnote = `<span class='footnoteinlist'></span>`
				if (sclinksdata[i].location.substring(0,4) == 'seg-') {
					segment = sclinksdata[i].location.substring(4)
					segRef = sclinksdata[i].location
				} else { // its a footnote
					let allSups = document.querySelectorAll('sup') 
					for (let j in allSups) {
						if (allSups[j].innerText == sclinksdata[i].location.substring(3)) { 
							segRef = allSups[j].closest('p').id
							segment = segRef.substring(4)
							data_fnnumber = `data-fnnumber='${sclinksdata[i].location.substring(3)}'`
							footnote = `<span class='footnoteinlist'>note: ${sclinksdata[i].location.substring(3)}</span>`
						}
					}
				}
				let linktext = `<span class='textSegRef'>${segment}</span>${footnote} ${sclinksdata[i].sclinkHTML}`
				html += `<li class='reflistitem' data-segref='${segRef}' ${data_fnnumber}>${linktext}</li>`;
			}
			html += `</ul></section>`;
			parentDiv.innerHTML = html
			var options = {valueNames: [ 'textSegRef', 'sclinktext' ]};
			var textList = new List('texts-list', options);
		}
		fetch(`../_resources/book-data/${shortcode()}/sclinks.json`)
		.then (showSpinner())
		.then(response => response.json())
		.then (data => populateSCTexts(data))
		.catch(error => {
		console.log(`ERROR: Can't fetch ../_resources/book-data/${shortCode}/info.json`);
		}
		);

	}

	function notes () {
		let allSups = document.querySelectorAll ('sup')
		if (allSups.length > 0) {
			atLeastOneListExists = true
		function populateNotes (footnotesData) {
			let parentDiv = document.getElementById('footnotesList');
			let html = ``
			html += `<section id='footnotes-list' class='infocontainer'>`
			html += `<h3>Notes:</h3>`
			html += `<div class="reflistbuttons"><h4>Sort by:</h4><button class="sort asc" data-sort="notesSegRef">Segment</button>`
				html += `  <button class="sort" data-sort="footNoteText">Note Text</button></div>`
			html += `<ul class="list reflist">`
			for (let i in footnotesData) {
				let fnNumber = footnotesData[i].fnNumber
				let fnHTML = footnotesData[i].fnHTML
				let segNo = ``
				for (let j in allSups) {
					if (allSups[j].innerText == fnNumber) {
						segNo = `${allSups[j].parentNode.id}`
						break
					}
				}
				let linkHTML = `<span class='notesSegRef'>${segNo.substring(4)}</span> <span class='footnoteinlist'>note: ${fnNumber}</span> <span class='footNoteText'>${fnHTML}</span>`
				html += `<li class='reflistitem' data-segref='${segNo}' data-fnnumber='${fnNumber}'>${linkHTML}</li>`
			}
			html += `</ul></section>` 
			parentDiv.innerHTML = html
			var options = {valueNames: [ 'notesSegRef', 'footNoteText' ]};
			var footnotesList = new List('footnotes-list', options);
		}
		fetch(`../_resources/book-data/${shortcode()}/footnotes.json`)
		.then (showSpinner())
		.then(response => response.json())
		.then (data => populateNotes(data))
		.catch(error => {
		console.log(`ERROR: Can't fetch ../_resources/book-data/${shortcode()}/footnotes.json`);
		});
		}

	}
	tables()
	figures()
	sctexts()
	notes()
	if (!atLeastOneListExists) {
		let parentDiv = document.getElementById('ModalLists');
		let html = `<section class='infocontainer'>`
		html += `<p style='font-family: "Source Sans Pro"; font-variant: small-caps; font-size: 1.4em; text-align: center'>There are no lists available for this book</p>`
		html += `</section>`
		parentDiv.innerHTML = html
	}
	hideSpinner()
}


// SEARCH FUNCTIONALITY
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


