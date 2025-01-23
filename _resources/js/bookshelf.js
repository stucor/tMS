
var options = {
    valueNames: [ 'bookshelftitle', 'bookshelfauthor', 'bookshelfpubdate', { attr: 'data-suttalist', name: 'suttalist' }, { attr: 'data-liblist', name: 'liblist' }  ],
    listClass:['booklist']
};

var bookList = new List('bookshelf', options);

var filterCount = document.getElementById('filterCount');
filterCount.innerHTML = bookList.size();
filterTotal.innerHTML = bookList.size();

bookList.on('filterComplete', updateBookCount);
bookList.on('searchComplete', updateBookCount);

function updateBookCount () {
    var filterCount = document.getElementById('filterCount');
    var filterTotal = document.getElementById('filterTotal');
    var count = bookList.update().matchingItems.length;
    filterCount.innerHTML = bookList.update().matchingItems.length;
    filterTotal.innerHTML = bookList.size();

    var xmessage = document.getElementById('filterMessage');


    var searchby = '';
    if (searchbyTitleAuthor.classList.contains('selected')) {
        searchby="Title or Author";
    } else {
        searchby="Sutta Number";
    }



    if (filterCount.innerHTML == 0) {
        xmessage.innerHTML = "<span style='color:crimson; font-weight:700'>No Books Found:</span><span> please use the 'Find' menu on the left to change the search and filter settings.</span>";
    } else {
        if (filterCount.innerHTML === filterTotal.innerHTML) {
            xmessage.innerHTML = "You are currently <strong>viewing all books</strong> in the library. You can use the 'Find' menu on left to narrow your search";
        } else {
            var countmessage = "<span style='font-variant: small-caps; font-size:1.2em; font-family:Source Sans Pro'>found <span style='color: crimson; font-weight:700;'>" + filterCount.innerHTML + "</span><span> / " +filterTotal.innerHTML + "</span> books.</span><br />";
            var searchmessage1 = "Searching: <strong>“"+ bookSearchInput.value + "”</strong>";
            var searchmessage2 = " in: <strong>" + searchby + "</strong>";
            var filterauthors = brahm + ((brahm == '') ? '' : ', ') + 
                                brahmali + ((brahmali == '') ? '' : ', ') + 
                                chatchai + ((chatchai == '') ? '' : ', ') + 
                                sdhammika  + ((sdhammika  == '') ? '' : ', ') +
                                sujato + ((sujato  == '') ? '' : ', ') + 
                                sunyo;
            var filterauthorsmessage = "<br />Authors included:" + " <strong>" + filterauthors + "</strong>";
            var xmessageText = "";

            if (bookSearchInput.value == '') {
                if (searchby == 'Title or Author') {
                    searchmessage1 = 'You are not Searching.';
                    searchmessage2 = '';
                } else {
                    searchmessage1 = "Showing <strong>only</strong> books with sutta references currently indexed";
                    searchmessage2 = "";
                }
            } 
            if (filterauthors == 'Ajahn Brahm, Ajahn Brahmali, Ajahn Chatchai, Bhante S. Dhammika, Bhikkhu Sujato, Bhikkhu Sunyo') {
                filterauthorsmessage = "<br />All Authors included.";
            }
            xmessageText = countmessage + searchmessage1  + searchmessage2 + filterauthorsmessage;

            xmessage.innerHTML = xmessageText;
        }
    }
    window.scrollTo(0,0);

    if (listOrGrid == 'list') {dolist();} else {dogrid();}
}


var resetall = document.getElementById('resetallsettings');
resetall.addEventListener('click', clearallsettings );

function clearallsettings () {
    localStorage.clear();
    nuclearOption = true;
}




/* SEARCHING */
/*
var titleCheck = document.querySelector("input[name=titleCheck]");
titleCheck.addEventListener('change', function() {filterBookSearch();});
var authorCheck = document.querySelector("input[name=authorCheck]");
authorCheck.addEventListener('change', function() {filterBookSearch();});
var suttanumCheck = document.querySelector("input[name=suttanumCheck]");
suttanumCheck.addEventListener('change', function() {filterBookSearch();});
*/

var searchbyTitleAuthor = document.getElementById('searchbyTitleAuthor');
searchbyTitleAuthor.addEventListener('click', doTitleAuthorSearch);

var searchbySuttaNumber = document.getElementById('searchbySuttaNumber');
searchbySuttaNumber.addEventListener('click',doSuttaNumberSearch);

var bookSearchInput = document.getElementById('bookSearchInput');
bookSearchInput.addEventListener('keyup', filterBookSearch);
var clearBookSearchInput = document.getElementById("clearBookSearchInput");
clearBookSearchInput.addEventListener('click', doSearchInputClear);




function doTitleAuthorSearch() {
    searchbyTitleAuthor.classList.add('selected');
    searchbySuttaNumber.classList.remove('selected');
    bookSearchInput.placeholder="Title or Author ...";
    filterBookSearch();
}

function doSuttaNumberSearch() {
    searchbySuttaNumber.classList.add('selected');
    searchbyTitleAuthor.classList.remove('selected');
    bookSearchInput.placeholder="Sutta Number ...";
    filterBookSearch();
}



function filterBookSearch () {
    let filterValue = document.getElementById('bookSearchInput').value;
    var bst, bsa, sl = '';

    if (searchbyTitleAuthor.classList.contains('selected')) {
        bst = "bookshelftitle";
        bsa = "bookshelfauthor";
        sl = "";
    } else {
        bst = "";
        bsa = "";
        sl = "suttalist";
    }


    var es = document.getElementById('exactSearch');
    var es2 = document.getElementById('suttanumberinfo');
    if ((sl == "suttalist") && (bsa =="") && (bst == "")){
        filterValue = filterValue.replace(/\./g,'_');
        filterValue = filterValue.replace(/\:/g,'_');
        filterValue = filterValue + '@';
        bookList.search(filterValue, [bst, bsa, sl]);
        es.innerHTML= 'enter exact sutta number. e.g. an4.170';
//        es2.innerHTML= "<img style='position:relative; top:5px;' src=\"../_resources/images/icons/help.svg\" width=\"20px\" height=\"20px\"></span>" + " More info" ;
//        es2.classList.add('showinfobutton');
    } else {
        bookList.fuzzySearch(filterValue, [bst, bsa, sl]);
        es.innerHTML= '';
//        es2.innerHTML= '';
//        es2.classList.remove('showinfobutton');
    }
    //poptoc0 (filterValue);
}
function doSearchInputClear () {
    var inputField = document.getElementById('bookSearchInput'); 
    inputField.value ='';
    filterBookSearch();
}

var suttanumberinfo = document.getElementById('suttanumberinfo');
suttanumberinfo.addEventListener('click', openInfoModal);

function openInfoModal(){
    detailsbtn.click();
    document.getElementById('snsInfo').scrollIntoView();
}



/* SORTING */
var sortbyAuthor = document.getElementById('sortbyAuthor');
sortbyAuthor.addEventListener('click', authorSort);
var sortbyTitle = document.getElementById('sortbyTitle');
sortbyTitle.addEventListener('click', titleSort);
var sortbyPubdate = document.getElementById('sortbyPubdate');
sortbyPubdate.addEventListener('click', pubdateSort);
var sortbyLatest = document.getElementById('sortbyLatest');
sortbyLatest.addEventListener('click', latestSort);

function resetSortExcept(exceptThis) {
    switch (exceptThis) {
        case 'author':
            sortbyTitle.classList.remove("asc");
            sortbyTitle.classList.remove("desc");
            sortbyPubdate.classList.remove("asc");
            sortbyPubdate.classList.remove("desc");
            sortbyLatest.classList.remove("asc");
            sortbyLatest.classList.remove("desc");
            break;
        case 'title':
            sortbyAuthor.classList.remove("asc");
            sortbyAuthor.classList.remove("desc");
            sortbyPubdate.classList.remove("asc");
            sortbyPubdate.classList.remove("desc");
            sortbyLatest.classList.remove("asc");
            sortbyLatest.classList.remove("desc");
            break;	
        case 'pubdate':
            sortbyAuthor.classList.remove("asc");
            sortbyAuthor.classList.remove("desc");
            sortbyTitle.classList.remove("asc");
            sortbyTitle.classList.remove("desc");
            sortbyLatest.classList.remove("asc");
            sortbyLatest.classList.remove("desc");
        break;
        case 'latest':
            sortbyAuthor.classList.remove("asc");
            sortbyAuthor.classList.remove("desc");
            sortbyTitle.classList.remove("asc");
            sortbyTitle.classList.remove("desc");
            sortbyPubdate.classList.remove("asc");
            sortbyPubdate.classList.remove("desc");
        break;	
    }
}
function authorSort () {
    var r = document.querySelector(':root');
    r.style.setProperty('--asctext', '"A►Z"');
    r.style.setProperty('--desctext', '"Z►A"');

    resetSortExcept('author');
    bookList.sort('bookshelftitle', { order: "asc" }); // order by title first to make sure that books are always in alphabetical order within authors
    if (sortbyAuthor.classList.contains('asc'))  {
        bookList.sort('bookshelfauthor', { order: "desc" });
        sortbyAuthor.classList.remove("asc");
        sortbyAuthor.classList.add("desc");
    } else {
        bookList.sort('bookshelfauthor', { order: "asc" });
        sortbyAuthor.classList.add("asc");
        sortbyAuthor.classList.remove("desc");
    }
}
function titleSort () {
    var r = document.querySelector(':root');
    r.style.setProperty('--asctext', '"A►Z"');
    r.style.setProperty('--desctext', '"Z►A"');

    resetSortExcept('title');
    if (sortbyTitle.classList.contains('asc'))  {
        bookList.sort('bookshelftitle', { order: "desc" });
        sortbyTitle.classList.remove("asc");
        sortbyTitle.classList.add("desc");
    } else {
        bookList.sort('bookshelftitle', { order: "asc" });
        sortbyTitle.classList.add("asc");
        sortbyTitle.classList.remove("desc");
    }
}
function pubdateSort () {
    var r = document.querySelector(':root');
    r.style.setProperty('--asctext', '"old►new"');
    r.style.setProperty('--desctext', '"new►old"');

    resetSortExcept('pubdate');
    if (sortbyPubdate.classList.contains('asc'))  {
        bookList.sort('bookshelfpubdate', { order: "desc" });
        sortbyPubdate.classList.remove("asc");
        sortbyPubdate.classList.add("desc");
    } else {
        bookList.sort('bookshelfpubdate', { order: "asc" });
        sortbyPubdate.classList.add("asc");
        sortbyPubdate.classList.remove("desc");
    }


}
function latestSort () {
    var r = document.querySelector(':root');
    r.style.setProperty('--asctext', '"old►new"');
    r.style.setProperty('--desctext', '"new►old"');

        resetSortExcept('latest');
    if (sortbyLatest.classList.contains('asc'))  {
        bookList.sort('liblist', { order: "desc" });
        sortbyLatest.classList.remove("asc");
        sortbyLatest.classList.add("desc");
    } else {
        bookList.sort('liblist', { order: "asc" });
        sortbyLatest.classList.add("asc");
        sortbyLatest.classList.remove("desc");
    }
}
function getSort () {

    if (sortbyAuthor.classList.contains('asc'))  {
        return {
            sortby: 'A',
            sortorder: 'asc'
        }
    }

    if (sortbyAuthor.classList.contains('desc'))  {
        return {
            sortby: 'A',
            sortorder: 'desc'
        }
    }

    if (sortbyTitle.classList.contains('asc'))  {
        return {
            sortby: 'T',
            sortorder: 'asc'
        }
    }

    if (sortbyTitle.classList.contains('desc'))  {
        return {
            sortby: 'T',
            sortorder: 'desc'
        }
    }

    if (sortbyPubdate.classList.contains('asc'))  {
        return {
            sortby: 'P',
            sortorder: 'asc'
        }
    }

    if (sortbyPubdate.classList.contains('desc'))  {
        return {
            sortby: 'P',
            sortorder: 'desc'
        }
    }

    if (sortbyLatest.classList.contains('asc'))  {
        return {
            sortby: 'L',
            sortorder: 'asc'
        }
    }

    if (sortbyLatest.classList.contains('desc'))  {
        return {
            sortby: 'L',
            sortorder: 'desc'
        }
    }

}
function doSort (on, ascdesc) {
    switch (on) {
    case "L":
        sortbyLatest.click();
        if (ascdesc == "desc") {
            sortbyLatest.click();
        }
        break;
    case "P":
        sortbyPubdate.click();
        if (ascdesc == "desc") {
            sortbyPubdate.click();
        }
        break;
    case "T":
        sortbyTitle.click();
        if (ascdesc == "desc") {
            sortbyTitle.click();
        }
        break;
    case "A":
        sortbyAuthor.click();
        if (ascdesc == "desc") {
            sortbyAuthor.click();
        }
        break;
    }
}



/* FILTERS */
var selectAllAuthors = document.getElementById('selectAllAuthors');
selectAllAuthors.addEventListener('click', markAllAuthorsSelected);
var clearAllAuthors = document.getElementById('clearAllAuthors');
clearAllAuthors.addEventListener('click', markAllAuthorsClear);

var brahmCheck = document.querySelector("input[name=BrahmCheck]");
brahmCheck.addEventListener('change', function() {filterNames();});
var brahmaliCheck = document.querySelector("input[name=BrahmaliCheck]");
brahmaliCheck.addEventListener('change', function() {filterNames();});
var chatchaiCheck = document.querySelector("input[name=ChatchaiCheck]");
chatchaiCheck.addEventListener('change', function() {filterNames();});
var sdhammikaCheck = document.querySelector("input[name=SDhammikaCheck]");
sdhammikaCheck.addEventListener('change', function() {filterNames();});
var sujatoCheck = document.querySelector("input[name=SujatoCheck]");
sujatoCheck.addEventListener('change', function() {filterNames();});
var sunyoCheck = document.querySelector("input[name=SunyoCheck]");
sunyoCheck.addEventListener('change', function() {filterNames();});

function markAllAuthorsSelected() {
    brahmCheck.checked = true;
    brahmaliCheck.checked = true;
    chatchaiCheck.checked = true;
    sdhammikaCheck.checked = true;
    sujatoCheck.checked = true;
    sunyoCheck.checked = true;
    filterNames();
}
function markAllAuthorsClear() {
    brahmCheck.checked = false;
    brahmaliCheck.checked = false;
    chatchaiCheck.checked = false;
    sdhammikaCheck.checked = false;
    sujatoCheck.checked = false;
    sunyoCheck.checked = false;
    filterNames();
}

var brahm = '';
var brahmali = '';
var chatchai = '';
var sdhammika = '';
var sujato = '';
var sunyo = '';
var sujatobrahmali = '';
function filterNames () {
    if (brahmCheck.checked) {
        brahm = "Ajahn Brahm";
    } else {
        brahm = "";
    }
    if (brahmaliCheck.checked) {
        brahmali = "Ajahn Brahmali";
    } else {
        brahmali = "";
    }
    if (chatchaiCheck.checked) {
        chatchai = "Ajahn Chatchai";
    } else {
        chatchai = "";
    }
    if (sdhammikaCheck.checked) {
        sdhammika = "Bhante S. Dhammika";
    } else {
        sdhammika = "";
    }
    if (sujatoCheck.checked) {
        sujato = "Bhikkhu Sujato";
    } else {
        sujato = "";
    }
    if (sunyoCheck.checked) {
        sunyo = "Bhikkhu Sunyo";
    } else {
        sunyo = "";
    }

    if ((sujatoCheck.checked) || (brahmaliCheck.checked)) {
        sujatobrahmali = "Bhikkhu Sujato and Bhikkhu Brahmali";
    } else {
        sujatobrahmali = "";
    }

    bookList.filter(function(item) {
        if ((item.values().bookshelfauthor == brahm) 
        || (item.values().bookshelfauthor == brahmali) 
        || (item.values().bookshelfauthor == chatchai)
        || (item.values().bookshelfauthor == sdhammika)
        || (item.values().bookshelfauthor == sujato)
        || (item.values().bookshelfauthor == sunyo)
        || (item.values().bookshelfauthor == sujatobrahmali)
        ){
            return true;
        } else { 
            return false; 
        } 
    });
}

var gridlistbtn = document.getElementById('gridlistBtn');
gridlistbtn.addEventListener('click', gridlist);
var listOrGrid = 'list';
function gridlist () {
    if (listOrGrid == 'list') {
        dogrid();
        gridlistbtn.style.background = 'url("../_resources/images/icons/list.svg")';
    } else {
        dolist();
        gridlistbtn.style.background = 'url("../_resources/images/icons/grid.svg")';

    }
}
function dogrid () {
    var ul = document.querySelectorAll('.booklist');
    var list = document.querySelectorAll('.booklist > li');
    var anchor = document.querySelectorAll('.booklist > li > a');
    var infotext = document.querySelectorAll('.booklist > li > a > div');
    var cover = document.querySelectorAll('.booklist > li > a > img');
    ul[0].style.gridTemplateColumns = 'repeat(auto-fit, 134px)';
    for( var i = 0; i < list.length; i++ ) {
        list[i].style.border = 'none';
    }
    for( var i = 0; i < anchor.length; i++ ) {
        anchor[i].style.padding = '0';
    }
    for( var i = 0; i < infotext.length; i++ ) {
        infotext[i].style.display = 'none';
    }
    for( var i = 0; i < cover.length; i++ ) {
        cover[i].style.height = '200px';
        cover[i].style.margin = '0';
    }
    listOrGrid = 'grid';
}
function dolist () {
    var ul = document.querySelectorAll('.booklist');
    var list = document.querySelectorAll('.booklist > li');
    var anchor = document.querySelectorAll('.booklist > li > a');
    var infotext = document.querySelectorAll('.booklist > li > a > div');
    var cover = document.querySelectorAll('.booklist > li > a > img');
    ul[0].style.gridTemplateColumns = 'repeat(auto-fit, 100%)';
    for( var i = 0; i < list.length; i++ ) {
        list[i].style.border = '1px solid var(--primarycolor)';
    }
    for( var i = 0; i < anchor.length; i++ ) {
        anchor[i].style.padding = '5px';
    }
    for( var i = 0; i < infotext.length; i++ ) {
        infotext[i].style.display = 'block';
    }
    for( var i = 0; i < cover.length; i++ ) {
        cover[i].style.height = '100px';
        cover[i].style.margin = '10px';
    }
    listOrGrid = 'list';
}




filterNames();
//filterBookSearch();


