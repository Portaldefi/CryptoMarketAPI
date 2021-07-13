var xpath = require('xpath'),
dom = require('xmldom').DOMParser,
fs = require('fs');

var xml = fs.readFileSync('/Users/manoj/Desktop/sample.xml', 'utf8').toString();
var select = xpath.useNamespaces({"xsi":"http://www.w3.org/2001/XMLSchema-instance", "ClinicalDocument":"http://www.cdisc.org/ns/odm/v1.3", "def":"http://www.cdisc.org/ns/def/v2.0"});

var doc = new dom().parseFromString(xml)
var nodes = xpath.select("//XML", doc);
console.log(nodes);

// var doc1 = new dom().parseFromString(nodes[0].firstChild.data)
// var RegistraionNumber = xpath.select("//table/tr[1]/td[2]/text()", doc1)
