const suttaArea = document.getElementById("sutta");



function showBD(linktext) {

  function decodeBDLinkText (linkText) {
    let [slug, verses] = linkText.split(":");
    if (typeof verses == 'undefined') {
      verses ='';
    } else {
      verses = verses.replace(/&nbsp;/g, ' '); //replace nbsp
      verses = verses.replace(/\s/g, ''); //strip spaces
    }
    return [slug, verses];
  }
  
  function BDSegmentRange (segmentrange = "") {
    if (!segmentrange) {return []}
    let output = [];
    const segmentrangeArr = segmentrange.split(",");
    let i=0;
    while (i < segmentrangeArr.length) {
      let [left, right] = segmentrangeArr[i].split("–");
      output.push(left);
      if (!right) {
        output.push(left);
      } else {
        output.push(right);
      }
      i++
    }
    return output;
  }

  function getMultiSuttaJSONFileName (suttaNumber) {//suttanumber(slug), file, slug
    const multiSuttaArr = [
      ['an1.170','an1.170-187',''],
      ['an1.188','an1.188-197',''],
      ['an1.239','an1.235-247',''],
      ['an1.328','an1.316-332',''],
      ['an1.49','an1.41-50',''],
      ['an2.31','an2.21-31',''],
      ['an2.172','an2.163-179',''],
      ['an2.310','an2.310-479','an2.310-319'],
      ['an2.5', 'an2.1-10', ''],
      ['an2.11','an2.11-20',''],
      ['dhp49','dhp44-59',''],
      ['dhp60','dhp60-75',''],
      ['dhp64','dhp60-75',''],
      ['dhp142','dhp129-145',''],
      ['dhp157','dhp157-166',''],
      ['dhp188','dhp179-196',''],
      ['dhp204','dhp197-208',''],
      ['dhp228','dhp221-234',''],
      ['dhp273','dhp273-289',''],
      ['dhp274','dhp273-289',''],
      ['dhp277','dhp273-289',''],
      ['dhp278','dhp273-289',''],
      ['dhp279','dhp273-289',''],
      ['dhp348','dhp334-359',''],
      ['dhp372','dhp360-382',''],
      ['dhp387','dhp383-423',''],
      ['dhp409','dhp383-423',''],
      ['sn43.20','sn43.14-43',''],
      ['sn43.22','sn43.14-43','']
    ];
    let fileSlug = '';
    let suttaNo = '';
    for (let i=0; i < multiSuttaArr.length; i++) {
      if (suttaNumber == multiSuttaArr[i][0]) {
        fileSlug = multiSuttaArr[i][1];
        suttaNo = multiSuttaArr[i][2];
        break;
      }
    }
    if (suttaNo == '') {
      suttaNo = suttaNumber;
    }
    if (fileSlug) {
      return [fileSlug, suttaNo];
    } else {
      return [suttaNo, suttaNo]
    }
  }

  let [scprintText, highlight] = decodeBDLinkText (linktext);
  let sclinkText = slugStrip(scprintText);

  let highlightArr = BDSegmentRange(highlight);
  suttaArea.innerHTML ='';

  let [JSONFile, slug] = getMultiSuttaJSONFileName(slugStrip(scprintText));

  if (typeof showSpinner === "function") { 
	  showSpinner();
  }


  buildSutta (JSONFile, slug, highlightArr, sclinkText, scprintText);

	const observer = new MutationObserver(function(mutations_list) {
		mutations_list.forEach(function(mutation) {
			mutation.addedNodes.forEach(function(added_node) {
				if(added_node.id == 'sc-translator') {
					scrollToFirstSuttaHighlight();
          if (typeof hideSpinner === "function") { 
            hideSpinner();
          }
					observer.disconnect();
				}
			});
		});
	});
	observer.observe(document.querySelector("#sutta"), { subtree: true, childList: true });
}

function slugStrip(slug) {
  slug = slug.replace(/&nbsp;/g, ' '); //replace nbsp
	slug = slug.replace(/\s/g, ''); //strip spaces
  slug = slug.toLowerCase();
  return slug;
}

function buildSutta (file, slug, highlightArr =[], sclink, scdisplayText) {
/*
  console.log('file: '+ file); //file
  console.log('slug: '+ slug); //slug
  console.log('highlightArr: '+ highlightArr); //highlight array
  console.log('sclink: '+ sclink);
  console.log('scdisplayText: '+ scdisplayText); //printtext
*/
  let html = '';

  html += `<div class="button-area">
  <label class="checkcontainer" for="PaliCheck"><span class="checktext">Pali</span>
  <input type="checkbox" name="PaliCheck" id="PaliCheck" checked >
  <span class="checkmark"></span></label>
  <span class="sc-link"><a href="https://suttacentral.net/${sclink}/"><img>` + scdisplayText + `<span class="nomobile"> on SuttaCentral</span></a></span>
  <button id="next-highlight" class="greyedout">Next Highlight</button></div>
  <div id="messagecontainer"><span id="messagetext"></span></div>`

  const rootResponse = fetch(
    `../_resources/bilara-data/published/root/pli/ms/sutta/${parseSlug(
      file
    )}_root-pli-ms.json`
  )
    .then(response => response.json())
    .catch(error => {
      suttaArea.innerHTML = `Sorry, "${decodeURIComponent(file)}" is not a valid sutta citation`;
    });

  const translationResponse = fetch(
    `../_resources/bilara-data/published/translation/en/sujato/sutta/${parseSlug(
      file
    )}_translation-en-sujato.json`
  ).then(response => response.json());

  const htmlResponse = fetch(
    `../_resources/bilara-data/published/html/pli/ms/sutta/${parseSlug(
      file
    )}_html.json`
  ).then(response => response.json());

  /*
  function hasNumber(myString) {
    return /\d/.test(myString);
  }
  */

  Promise.all([rootResponse, translationResponse, htmlResponse]).then(responses => {
    const [paliData, transData, htmlData] = responses;

    let highlightArrCounter = 0;
    let inMark = false;

    let keyCount = 0;
    Object.keys(htmlData).forEach(segment => {
      keyCount += 1;
      if (transData[segment] === undefined) {
        transData[segment] = "";
      }
      transData[segment] = parseMarkdown(transData[segment]); 

      /* Highlight ranges specified in highlightArr */
      var marker = removeHead = "";
      const [segSuttaNo, segSegmentNo] = segment.split(":");

      if (segSegmentNo == highlightArr[highlightArrCounter]) {
        inMark=true; // turns highlighting on
      }
      if (inMark) {
        marker = "sc-mark"; //add the class sc-mark
      } 
      if (segSegmentNo == highlightArr[highlightArrCounter+1]) {
        inMark=false; // turns highlighting off
        if (highlightArr.length-1 >= highlightArrCounter+2) {
          highlightArrCounter = highlightArrCounter+2;
         }
      }

      /* Extract a sutta within a multi sutta JSON file */
      let printThis = true;
      if (file != slug) {
        printThis=false;
        if (transData[segment] == paliData[segment]) { //remove duplicate if pali and eng are the same
          removeHead = "noshow";
        }
        if (keyCount == 1) {
          html += `<header><ul><li class='division'><span class="pli-lang" lang="pi">${paliData[segment]}</span><span class="eng-lang" lang="en">${transData[segment]}</span></li>`;
        }
        if (keyCount == 2) {
          html += `<li class='subdivision'><span class="pli-lang" lang="pi">${paliData[segment]}</span><span class="eng-lang" lang="en">${transData[segment]}</span></li></ul>`;
        }
        if (keyCount == 3) {
          html += `<h1 class='range-title'><span class="pli-lang ${removeHead}" lang="pi">${paliData[segment]}</span><span class="eng-lang" lang="en">${transData[segment]}</span></h1><h4>${scdisplayText}</h4></header>`;
        }
        if ((slug == segSuttaNo ) && (segSegmentNo !== '1.0') && (segSegmentNo !== '0') && (segSegmentNo !== '0.1') && (segSegmentNo !== '0.2') && (segSegmentNo !== '0.3')) {
          printThis = true;
        }
      }

      const [openHtml, closeHtml] = htmlData[segment].split(/{}/);
      if (printThis) {
        html += `${openHtml}<span class="pli-lang ${marker} ${removeHead}" lang="pi"><span class="segno">${segSegmentNo} <br /></span>${paliData[segment]}</span><span class="eng-lang ${marker}" lang="en">${transData[segment]}</span>${closeHtml}\n\n`;
      }

    });

    const sctranslator = `<p id="sc-translator">&#8212; transl. Bhikkhu Sujato</p>`;
    html += sctranslator;
    suttaArea.innerHTML = html;
    toggleThePali();
  });


}



function parseMarkdown(markdownText) {
	const htmlText = markdownText
//		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
//		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
//		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
//		.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
		.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
		.replace(/\*(.*)\*/gim, '<i>$1</i>')
//		.replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
//		.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
//		.replace(/\n$/gim, '<br />')
	return htmlText.trim()
}

// initialize
//suttaArea.innerHTML = `<div class="instructions"><p>Fetching the Sutta <br /> please wait ...</p></div>`;


function toggleThePali() {
  const paliCheck = document.getElementById('PaliCheck');
  // initial state
  if (localStorage.paliToggle) {
    if (localStorage.paliToggle === "hide") {
      suttaArea.classList.add("hide-pali");
      paliCheck.click();
      suttaArea.style.textAlign = 'var(--textalign)';
    }
  } else {
    localStorage.paliToggle = "show";
  }
  
  paliCheck.addEventListener("change", () => {
    const modalBody = document.getElementById ('ModalBody');
    const eles = suttaArea.querySelectorAll(".eng-lang");
    var matchedElement = eles[0];
    let i=0;
    while (i < eles.length) {
      if (isVisible(eles[i], modalBody)) {
        matchedElement = eles[i];
        break;
      } i++;
    }
     if (localStorage.paliToggle === "show") {
      suttaArea.classList.add("hide-pali");
      localStorage.paliToggle = "hide";
      paliCheck.checked = false;
      suttaArea.style.textAlign = 'var(--textalign)';
      matchedElement.scrollIntoView();
      checkForHiddenHighlights();
    } else {
      suttaArea.classList.remove("hide-pali");
      localStorage.paliToggle = "show";
      paliCheck.checked = true;
      suttaArea.style.textAlign = 'left';
      clearmessage();
      matchedElement.previousSibling.scrollIntoView();
    }
    if (i==0) {
      modalBody.scrollTo(0,0);
    }
  });
}

const isVisible = function (ele, container) {
  const eleTop = ele.offsetTop;
  const eleBottom = eleTop + ele.clientHeight;
  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;
  // The element is fully visible in the container
  return (
      (eleTop >= containerTop && eleBottom <= containerBottom) //||
      // Some part of the element is visible in the container
      //(eleTop < containerTop && containerTop < eleBottom) ||
      //(eleTop < containerBottom && containerBottom < eleBottom)
  );
};

function clearmessage() {
  const mc = document.getElementById('messagecontainer');
  mc.style.display='none';
}

function message (messagetosend) {
  const mc = document.getElementById('messagecontainer');
  const mt = document.getElementById('messagetext');
  mc.style.display='block';
  mt.innerHTML = messagetosend;
} 

function checkForHiddenHighlights () {
  var elArr = document.querySelectorAll(".sc-mark");
  const paliCheck = document.getElementById('PaliCheck');
  for (let i = 1; i < elArr.length; i=i+2) {
    if ((elArr[i].innerHTML=='') && (!paliCheck.checked)) {
      message('There are hidden highlights. Select ‘Pali’ to show all.');
    }
  }
}

function scrollToFirstSuttaHighlight () {
  var nextcounter = 1;
  var elArr = document.querySelectorAll(".sc-mark");
  if (elArr.length != 0) {
    elArr[1].scrollIntoView({block: "center"});
    checkForHiddenHighlights();

      const modalBody = document.getElementById ('ModalBody');
      const nextHighlightBtn = document.getElementById('next-highlight');
      nextHighlightBtn.classList.remove('greyedout');

      nextHighlightBtn.addEventListener("click", () => {
        if (isVisible(elArr[elArr.length-1], modalBody) && isVisible(elArr[1], modalBody)) {
          function blink(target, time) {
            if (!target.style.opacity) {
              target.style.opacity = 1;
            }
            target.style.opacity = 0;
            
            setTimeout (function() {
              target.style.opacity = 1;
            }, time/3);
            setTimeout (function() {
              target.style.opacity = 0;
            }, time/2);
            setTimeout (function() {
              target.style.opacity = 1;
            }, time);
          }
  
          for (let i=0; i < elArr.length; i++) {
            blink(elArr[i],450);
          }
        }

        for (let i=nextcounter; i < elArr.length; i=i+2) {
          if (!(isVisible(elArr[i],modalBody))) {
            nextcounter = i;
            elArr[nextcounter].scrollIntoView({block: "center", behavior: "smooth"});
            break;
          } 
        }

        const lastMark = elArr[elArr.length-1];
        function lmoCallback(payload) {
          if (payload[0].isIntersecting) {
            nextcounter=1;
          } 
        }
        const lastMarkOb = new IntersectionObserver(lmoCallback)
        lastMarkOb.observe(lastMark);
      });
  }
}

function parseSlug(slug) {
  const slugParts = slug.match(/^([a-z]+)(\d*)\.*(\d*)/);
  const book = slugParts[1];
  const firstNum = slugParts[2];

  if (book === "dn" || book === "mn") {
    return `${book}/${slug}`;
  } else if (book === "sn" || book === "an") {
    return `${book}/${book}${firstNum}/${slug}`;
  } else if (book === "kp") {
    return `kn/kp/${slug}`;
  } else if (book === "dhp") {
    return `kn/dhp/${slug}`;
  } else if (book === "ud") {
    return `kn/ud/vagga${firstNum}/${slug}`;
  } else if (book === "iti") {
    return `kn/iti/vagga${findItiVagga(firstNum)}/${slug}`;
  } else if (book === "snp") {
    return `kn/snp/vagga${firstNum}/${slug}`;
  } else if (book === "thag" || book === "thig") {
    return `kn/${book}/${slug}`;
  }
}

function findItiVagga(suttaNumber) {
  if (suttaNumber >= 1 && suttaNumber <= 10) {
    return "1";
  } else if (suttaNumber >= 1 && suttaNumber <= 10) {
    return "1";
  } else if (suttaNumber >= 11 && suttaNumber <= 20) {
    return "2";
  } else if (suttaNumber >= 21 && suttaNumber <= 27) {
    return "3";
  } else if (suttaNumber >= 28 && suttaNumber <= 37) {
    return "4";
  } else if (suttaNumber >= 38 && suttaNumber <= 49) {
    return "5";
  } else if (suttaNumber >= 50 && suttaNumber <= 59) {
    return "6";
  } else if (suttaNumber >= 60 && suttaNumber <= 69) {
    return "7";
  } else if (suttaNumber >= 70 && suttaNumber <= 79) {
    return "8";
  } else if (suttaNumber >= 80 && suttaNumber <= 89) {
    return "9";
  } else if (suttaNumber >= 90 && suttaNumber <= 99) {
    return "10";
  } else if (suttaNumber >= 100 && suttaNumber <= 112) {
    return "11";
  }
}


