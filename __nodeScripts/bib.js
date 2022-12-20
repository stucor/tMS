/*  bib.js
    Build Book Info (bib) node script
    Builds the info modal json for all books
*/


const path = require('path');
const fs = require('fs');

function buildBookInfo (bookID) {

    let bookData = require(path.join(__dirname, '..', '_resources', 'book-data', bookID, 'info.json'));
    let authors = bookData.Authors;
    bookDataStr = JSON.stringify(bookData, null, '\t');
    let jsonStr = `${bookDataStr.substring(0, bookDataStr.length-1)},`;
    
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
  //  console.log (Object.keys(CCLongLicenses));



            //console.log(newjson.CCLicense);
            for (let i = 0; i< Object.keys(CCLongLicenses).length; i++) {
                if (newjson.CCLicense == Object.keys(CCLongLicenses)[i]) {
                    newjson.CCLicense = Object.values(CCLongLicenses)[i];
                }
            }

            //console.log(Object.keys(CCLongLicenses)[0]);

        //newjson.CCLicense = CCLongLicense;
        
    jsonStr = JSON.stringify(newjson, null, '\t');

    fs.mkdirSync(path.join(__dirname, '..', '_resources', 'built-info-data', bookID), { recursive: true }, (err) => {
        if (err) throw err;
      });
    fs.writeFileSync(path.join(__dirname, '..', '_resources', 'built-info-data', bookID, 'info.json'), jsonStr);
}


function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path+'/'+file).isDirectory();
    });
}

allBooksArr = getDirectories(path.join(__dirname, '..', '_resources', 'book-data'));

for (i in allBooksArr) {
    buildBookInfo(allBooksArr[i]);
}
