const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const sitemapStatus = require('./sitemap-refinement-status.json');

(async () => {
    const bc = "?bc=HL";



    const unreachableUrls = {};
    for (const [path, v] of Object.entries(sitemapStatus)) {
        if (v.valid) {
            let reportLine;
            let reportBlock = {path:'', valid: true, reason: 'unreachable'}

            //console.log(path) 
            try {
                const resp = await fetch('https://www.salesforce.com' + path + bc, {
                    method: "GET",
                    redirect: "manual",
                    follow: 0
                });

                if (resp.status !== 200) {
                    //console.log(path + " " + resp.status); 
                    if (resp.status === 301 || resp.status === 302) {
                        reportLine = path + "\t" + resp.status + "\t" + resp.headers.get("location") + "\t\t";
                        reportBlock.path = path;
                        reportBlock.valid = false;
                        reportBlock.reason = "redirect to " + resp.headers.get("location");
                    } else {
                        reportLine = path + "\t" + resp.status + "\t\t\t";
                        reportBlock.path = path;
                        reportBlock.valid = false;
                        reportBlock.reason = "invalid status " + resp.status + " " + resp.statusText;

                    }
                    //fs.appendFileSync(unreachableDir + loc + "unreachable.json", reportLine);

                } else {
                    const dom = new JSDOM(await resp.text());

                    const metaTagsFound = dom.window.document.getElementsByTagName("meta");
                    for (const metaTag of metaTagsFound) {
                        if (metaTag.name === "robots") {
                            //console.log("Robots setting: " + metaTag.attributes.getNamedItem("content").nodeValue);
                            const robotsTag = metaTag.attributes.getNamedItem("content");
                            if (robotsTag) {
                                const arrRobots = robotsTag.nodeValue.split(",");
                                /*
                                if (arrRobots.includes("noindex") || arrRobots.includes("nofollow")) {
                                    reportLine = path + "\t200\t\t" + arrRobots.includes("noindex") + "\t" + arrRobots.includes("nofollow") + "\t";
                                }
                                */
                                if (arrRobots.includes("noindex")) {
                                    reportLine = path + "\t200\t\t" + arrRobots.includes("noindex") + "\t\t";
                                    reportBlock.path = path;
                                    reportBlock.valid = false;
                                    reportBlock.reason = "No Index set in Robots";
            
                                }

                            }
                            break;
                        }
                    }
                }
            } catch (e) {
                
                reportLine = path + "\tERROR\t\t\t\t" + e;
                reportBlock.path = path;
                reportBlock.valid = false;
                reportBlock.reason = "Unknown error " + e;

            }
            if (reportLine) {
                console.log(reportLine);
            }
            if(!reportBlock.valid){
                unreachableUrls[path] = reportBlock;
                console.log(JSON.stringify(reportBlock));
                fs.writeFileSync('../output/unreachableStatus.json', JSON.stringify(unreachableUrls, null, 2));
            }

        }
    }

})();