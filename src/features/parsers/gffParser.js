
import { ConnectingAirportsOutlined } from "@mui/icons-material"
import { text } from "d3-fetch"


async function parseGFF(demoFile, collinearityFile = undefined) {

    let x = text(demoFile).then(data => {
        let temporary = data.split(/\n/)
        let dataset = {}
        let trackType = 'default'

        // BED file processor for methylation data
        if (demoFile.indexOf('.bed') > -1) {

            trackType = 'scatter'

            temporary.forEach(d => {
                let info = d.split('\t')
                if (info.length > 1) {
                    let key = info[0] + "-" + info[1] + "-" + info[2]
                    var stats = {
                        chromosome: info[0],
                        start: info[1],
                        end: info[2],
                        key,
                        ortholog: false,
                        siblings: [],
                        value: info[3]
                    }
                    dataset[key] = stats
                }
            })
        }

        // gff file parser
        else {
            temporary.forEach(d => {
                let info = d.split('\t')
                if (info.length > 1) {
                    let key = info[1].toLowerCase()
                    var stats = {
                        chromosome: info[0],
                        start: info[2],
                        end: info[3],
                        key: key,
                        ortholog: false,
                        siblings: [],
                        value: 0
                    }
                    dataset[key] = stats
                }
            })
        }

        if (collinearityFile) {

            let nomenclature = [temporary[0].split('\t')[0].slice(0, 2)]

            let m = pullGeneInfo(collinearityFile, nomenclature).then(pairs => {
                pairs.forEach(x => {
                    let sourceIndex = x.source.toLowerCase()
                    let targetIndex = x.target.toLowerCase()
                    dataset[sourceIndex].ortholog = true
                    dataset[targetIndex].ortholog = true
                    dataset[sourceIndex].siblings.push(x.target)
                    dataset[targetIndex].siblings.push(x.source)

                })
               
                return buildModel(dataset, trackType)
            })
            return m
        }
        else{
            return buildModel(dataset, trackType)
        }

    })
    // debugger
    return x

}

function buildModel(dataset, trackType) {

    // Building up the different chromosomes
    let chromosomeNameList = []
    let chromosomalData = []
    let ignore = "Scaffold"

    for (let item in dataset) {
        if (!chromosomeNameList.some((x) => x.chromosome == dataset[item].chromosome) && !dataset[item].chromosome.includes(ignore)) {
            var check = item
            var temp = {
                chromosome: dataset[item].chromosome,
                designation: check.slice(0, check.indexOf('g'))
            }
            // Building a list of the chromosome names, used for later finding information on that dataset
            chromosomeNameList.push(temp)
        }
    }

    // Changing the default lexicographical order, since chromosome11 should come after chromosome2 
    // additional logic so that all chromosomes from the same line should be grouped   
    chromosomeNameList.sort((a, b) => {
        if (a.chromosome[0].localeCompare(b.chromosome[0]) == 0) {
            return a.chromosome.length - b.chromosome.length
        }
        else {
            return a.chromosome[0].localeCompare(b.chromosome[0])
        }
    })

    chromosomeNameList.forEach((chr, chrIndex) => {
        var subset = Object.entries(dataset).filter(d => {
            return d[1].chromosome == chr.chromosome
        }).map(x => x[1])

        //   temporary stub for demo purposes 
        let tempTrackType = trackType;
        if (trackType === 'scatter') {

            if (chrIndex % 3 === 1) {
                tempTrackType = 'scatter';
            }
            else if (chrIndex % 3 === 2) {
                tempTrackType = 'line';
            }
            else {
                tempTrackType = 'histogram';
            }
        }

        var temp = {
            key: chr,
            data: subset,
            trackType: tempTrackType,
        }
        chromosomalData.push(temp)
    })
    return { chromosomalData, dataset }
}


function process(collinearityData) {
    // The first 11 lines contain information regarding the MCSCANX Parameters
    // and can be processed seperately 
    var FileLines = collinearityData.split('\n'),
        information = parseInformation(FileLines.slice(0, 11)),
        alignmentList = [],
        alignmentBuffer = {};
    // remove the first 11 lines and then process the file line by line
    FileLines.slice(11).forEach(function (line, index) {
        if (line.indexOf('Alignment') > -1) {
            // store the previous alignment in list , 
            // and skip for the first iteration since buffer is empty
            if (alignmentBuffer.links) {
                alignmentList.push(alignmentBuffer);
            }
            alignmentBuffer = parseAlignmentDetails(line);
            alignmentBuffer.links = [];
        } else if (line.trim().length > 1) {
            // condition to skip empty lines
            alignmentBuffer.links.push(parseLink(line));
        }
    })
    // push the last alignment still in the buffer
    alignmentList.push(alignmentBuffer);
    // get the unique list of IDs of all chromosomes or scaffolds that have alignments mapped to them
    let uniqueIDList = [];
    alignmentList.map((d) => { uniqueIDList.push(d.source, d.target) });
    return { "information": information, "alignmentList": alignmentList, 'uniqueIDList': uniqueIDList.filter(onlyUnique) };
};


function parseInformation(informationLines) {
    return {
        'parameters': [
            ['match score', informationLines[1].split(':')[1].trim()],
            ['match size', informationLines[2].split(':')[1].trim()],
            ['gap penality', informationLines[3].split(':')[1].trim()],
            ['overlap wndow', informationLines[4].split(':')[1].trim()],
            ['e value', informationLines[5].split(':')[1].trim()],
            ['maximum gaps', informationLines[6].split(':')[1].trim()]
        ],
        'stats': {
            'no_of_collinear_genes': informationLines[8].split(',')[0].split(":")[1].trim(),
            'percentage': Number(informationLines[8].split(',')[1].split(":")[1].trim()),
            'no_of_all_genes': informationLines[8].split(',')[1].split(":")[1].trim()
        }
    };
}

function parseAlignmentDetails(alignmentDetails) {
    let alignmentDetailsList = alignmentDetails.split(' ');
    return {
        'score': Number(alignmentDetailsList[3].split('=')[1].trim()),
        'e_value': Number(alignmentDetailsList[4].split('=')[1].trim()),
        'count': Number(alignmentDetailsList[5].split('=')[1].trim()),
        'type': alignmentDetailsList[7].trim() == 'plus' ? 'regular' : 'flipped',
        'source': alignmentDetailsList[6].split('&')[0].trim(),
        'target': alignmentDetailsList[6].split('&')[1].trim(),
        'sourceKey': Number(alignmentDetailsList[6].split('&')[0].trim().slice(2)),
        'targetKey': Number(alignmentDetailsList[6].split('&')[1].trim().slice(2)),
        'alignmentID': Number(alignmentDetailsList[2].split(':')[0].trim())
    };
}

function parseLink(link) {
    let linkInfo = link.split('\t');
    return {
        'source': linkInfo[1],
        'target': linkInfo[2],
        'e_value': linkInfo[3]
    };
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

// Pulls collinearity info and makes links
async function pullGeneInfo(collinearityFile, nomenclature) {

    return text(collinearityFile).then(function (data) {
        let rawCollinearity = process(data);
        let selectedCollinearity = []
        nomenclature.forEach(n => {
            let temporaryCollinearity = rawCollinearity.alignmentList.filter((d) => d.source.indexOf(n) > -1 && d.target.indexOf(n) > -1)
            selectedCollinearity.push(...temporaryCollinearity)
        })
        let genePairs = selectedCollinearity.reduce((c, e) => { return [...c, ...e.links] }, [])
        let trueMatch = genePairs.filter((x) => +x.e_value == 0)

        return trueMatch
    })
}

export default parseGFF