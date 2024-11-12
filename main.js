const DOWN = 'down'
const UP = 'up'
const VERTICAL = 'vertical'
const HORIZONTAL = 'horizontal'

// const original_vw = Math.max(document.documentElement.clientHeight, window.innerWidth || 0)
const original_vw = d3.select('body').node().getBoundingClientRect().width
const original_vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

const margin = {
    top:original_vh*0.1, 
    left:original_vw*0.05, 
    bottom:original_vh*0.05, 
    right:original_vw*0.05
}

const vw = original_vw*0.9
const vh = original_vh*0.85

let chart_width = vw*0.3
let chart_height = vh

let w_h_ratio = (chart_width/chart_height <= 0.5)? HORIZONTAL : VERTICAL

if (w_h_ratio === HORIZONTAL) {
    chart_width = vw*0.6
    chart_height = vh*0.5

    d3.select('#svg-tools').attr('class', 'row')
    d3.select('#svg-skills').attr('class', 'row')
}

console.log(w_h_ratio)
console.log(vw, chart_width)
console.log(vh, chart_height)

/**
 * Hiddes/Shows header.
*/
new Waypoint({
    element: document.getElementById('chapter1'),
    handler: direction => {
        if (direction === DOWN) {
            console.log(DOWN, 'Title')
            d3.select('#title').style('visibility', 'hidden')
            d3.select('#header').style('visibility', 'visible')
            d3.select('#transition-title').attr('class', 'grey darken-4 btn-floating btn-large scale-transition scale-out')
        }
        else if (direction === UP) {
            console.log(UP, 'Title')
            d3.select('#title').style('visibility', 'visible')
            d3.select('#header').style('visibility', 'hidden')
        d3.select('#transition-title').attr('class', 'grey darken-4 btn-floating btn-large scale-transition scale-in')
    }
    },
    offset: `66%`
})

/**
 * Shows go down button.
*/
setTimeout(() => {
    d3.select('#transition-title').attr('class', 'grey darken-4 btn-floating btn-large scale-transition scale-in')
}, 500)

/**
 * Fix/Unfix charts.
*/
new Waypoint({
    element: document.getElementById('charts'),
    handler: direction => {
        if (direction === DOWN) {
            console.log(DOWN, w_h_ratio)
            d3.select('#svg-tools')
                .style('position', 'fixed')
                .style('top', `${margin.top}px`)

            d3.select('#svg-skills')
                .style('position', 'fixed')
                .style('top', `${w_h_ratio === VERTICAL? 0: chart_height}px`)
                .style('left', `${margin.left + (w_h_ratio === VERTICAL? chart_width: 0)}px`)
            
        }
        else if (direction === UP) {
            console.log(UP, w_h_ratio)
            d3.select('#svg-tools')
                .style('position', 'unset')
                .style('top', '')

            d3.select('#svg-skills')
                .style('position', 'unset')
                .style('left', '')
                .style('top', '')

        }
    },
    offset: `0%`
})

/**
 * Creates tools chart.
*/
const svgTools = d3
    .select("#svg-tools")
    .append('svg')
    .attr("width", `${chart_width}px`)
    .attr("height", `${chart_height}px`)
    .attr("viewBox", [-chart_width / 2, -chart_height / 2, chart_width, chart_height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

d3.json('data/tools.json').then(nds => {
    d3.json('data/tools_links.json').then(links => {
        
        ForceGraph({
            svg: svgTools, 
            nds, 
            links
        }, 
        {
            width: chart_width, 
            height: chart_height,
            linkStrokeOpacity:0,
            nodeGroup: d => d.type,
            nodeTitle: d => `${d.name}\n${d.type}`,
            nodeStrength: -300,
            nodeRadius: 30,
            nodeText: d => d.name
        })
    })
})

/**
 * Creates skills chart & details.
*/
const svgSkills = d3
    .select("#svg-skills")
    .append('svg')
    .attr("width", `${chart_width}px`)
    .attr("height", `${chart_height}px`)
    .attr("viewBox", [0, 0, chart_width, chart_height])
    .style('left', `${(w_h_ratio === VERTICAL? chart_width: 0)}px`)
    .style('top', `${(margin.top + (w_h_ratio === VERTICAL? 0: chart_height))}px`)
    
    
d3.json('data/skills.json').then(skills => {
    d3.json('data/experiences.json').then(experiences => {

        let detailsDiv = d3.select('#details-experiences')
            .selectAll('div')
            .data(experiences)
            .join('div')
            .attr('class', 'experience')
            .attr('id', d => d.id)
            .append('div')

        detailsDiv.append('p')
            .text(d => `${d.start} - ${d.end}`)        

        detailsDiv.append('p')
            .text(d => d.position)

        detailsDiv.append('a')
            .append('p')
            .attr('target','_blank')
            .attr('class','link')
            .attr('href', d => d.website)
            .text(d => d.employer)

        detailsDiv.append('ul')
            .selectAll('li')
            .data(d => d.tasks)
            .join('li')
            .text(d => d)

        experiences.map(experience => {

            new Waypoint({
                element: document.getElementById(experience.id),
                handler: direction => {
                    if (direction === DOWN) {
                        console.log(DOWN)

                        let filteredSkills = skills.filter(d => experience.skills.includes(d.name) || ['Origin',''].includes(d.parent))
                        
                        TreeMap({
                            svg: svgSkills, 
                            data: filteredSkills
                        }, 
                        {
                            width: chart_width, 
                            height: chart_height
                        })
                    }
                    else if (direction === UP) {
                        console.log(UP)
                        // d3.select(`#${experience.id}`).style('visibility', 'hidden')
                }
                },
                offset: `80%`
            })
        })
    })
})

// /**
//  * Shows experience.
// */
// d3.json('data/experiences.json').then(experiences => {
//     experiences.map(experience => {
//         new Waypoint({
//             element: document.getElementById(experience.id),
//             handler: direction => {
//                 if (direction === DOWN) {
//                     console.log(DOWN)
//                     d3.select(`#${experience.id}`).style('visibility', 'visible')
//                 }
//                 else if (direction === UP) {
//                     console.log(UP)
//                     d3.select(`#${experience.id}`).style('visibility', 'hidden')
//             }
//             },
//             offset: `80%`
//         })
//     })
// })

// /**
//  * Hides experience.
// */
// d3.json('data/experiences.json').then(experiences => {
//     experiences.map(experience => {
//         new Waypoint({
//             element: document.getElementById(experience.id),
//             handler: direction => {
//                 if (direction === DOWN) {
//                     console.log(DOWN)
//                     d3.select(`#${experience.id}`).style('visibility', 'hidden')
//                 }
//                 else if (direction === UP) {
//                     console.log(UP)
//                     d3.select(`#${experience.id}`).style('visibility', 'visible')
//             }
//             },
//             offset: `10%`
//         })
//     })
// })


