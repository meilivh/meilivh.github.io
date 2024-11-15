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
const vh = original_vh*0.75

let chart_width = vw*0.3
let chart_height = vh

let circleRadius = chart_width/8

let w_h_ratio = (chart_width/chart_height <= 0.5)? HORIZONTAL : VERTICAL

if (w_h_ratio === HORIZONTAL) {
    chart_width = vw*0.6
    chart_height = vh*0.45
    circleRadius = chart_height/10

    d3.select('#svg-tools').attr('class', 'row chart')
    d3.select('#skills-title').style('padding-bottom', '0px')
    d3.select('#svg-skills').attr('class', 'row chart')
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
            d3.select('#title').style('visibility', 'hidden')
            d3.select('#header').style('visibility', 'visible')
            d3.select('#footer').style('visibility', 'visible')
            d3.select('#transition-title').attr('class', 'grey darken-4 btn-floating btn-large scale-transition scale-out')
        }
        else if (direction === UP) {
            d3.select('#title').style('visibility', 'visible')
            d3.select('#header').style('visibility', 'hidden')
            d3.select('#footer').style('visibility', 'hidden')
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
            d3.select('#right-wrapper')
                .style('position', 'fixed')
                .style('top', `${margin.top}px`)
            
        }
        else if (direction === UP) {
            d3.select('#right-wrapper')
                .style('position', 'unset')
                .style('top', '')            
                .style('left', '')
        }
    },
    offset: `${margin.top}px`
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
        
        const color_graph = d3.scaleOrdinal([... new Set(nds.map(d => d.type))], colors_7);

        /**
         * Creates skills chart & details.
        */
        const svgSkills = d3
            .select("#svg-skills")
            .append('svg')
            .attr("width", `${chart_width*0.9}px`)
            .attr("height", `${chart_height*0.7}px`)
            .attr("viewBox", [0, 0, chart_width*0.9, chart_height*0.7])
            
        d3.json('data/skills.json').then(skills => {
            const color_tree = d3.scaleOrdinal([... new Set(skills.map(d => d.size? d.parent: '').filter(d => d !== ''))], colors_2);
            TreeMap({
                svg: svgSkills, 
                data: skills
            },{
                width: chart_width*0.9,
                height: chart_height*0.7,
                color: color_tree
            })

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
                    .attr('target','_blank')
                    .attr('class','link')
                    .attr('href', d => d.website)
                    .text(d => d.employer)

                detailsDiv.append('ul')
                    .selectAll('li')
                    .data(d => d.tasks)
                    .join('li')
                    .text(d => d)

                let projects = detailsDiv.append('div')
                    .attr('class','projects')
                    
                projects.append('p')
                    .append('b')
                    .text(d => `${d.projects.length > 0? 'Relevant Projects':''}`)

                projects.append('div')
                    .selectAll('.project')
                    .data(d => d.projects)
                    .join(
                        enter => {
                            let card = enter.append('div')
                                .attr('class','project row')
                                .append('div')
                                .attr('class','col m12')
                                .append('div')
                                .attr('class','card')

                            let title = card.append('div')
                                .attr('class','card-image')
                            
                            title.append('img')
                                .attr('src', d => d.visual)

                            title.append('span')
                                .attr('class', 'card-title black-text')
                                .text(d => d.name)

                            title.append('a')
                                .attr('class', 'btn-floating halfway-fab waves-effect waves-light black')
                                .attr('target', '_blank')
                                .attr('href', d=>d.website)
                                .append('i')
                                .attr('class','material-icons')
                                .text('add')

                            let content = card.append('div')
                                .attr('class','card-content')
                                .append('p')
                                .text(d => d.description)
                        }                        
                    )

                experiences.map((experience, i) => {

                    new Waypoint({
                        element: document.getElementById(experience.id),
                        handler: direction => {
                            if (direction === DOWN) {
                                console.log(DOWN)

                                let filteredSkills = skills.filter(d => experience.skills.includes(d.name) || ['Origin',''].includes(d.parent))
                            
                                TreeMap({
                                    svg: svgSkills, 
                                    data: filteredSkills
                                },{
                                    width: chart_width*0.9,
                                    height: chart_height*0.7,
                                    color: color_tree
                                })

                                let filteredNodes = nds.filter(d => experience.tools.includes(d.name))
                                let filteredLinks = links.filter(d => filteredNodes.map(d => d.id).includes(d.id))
                                
                                ForceGraph({
                                    svg: svgTools, 
                                    nds: filteredNodes, 
                                    links: filteredLinks
                                }, 
                                {
                                    nodeGroup: 'type',
                                    width: chart_width, 
                                    height: chart_height,
                                    linkStrokeOpacity: 0,
                                    nodeTitle: d => `${d.name}\n${d.type}`,
                                    nodeStrength: -100,
                                    nodeRadius: circleRadius,
                                    nodeText: d => d.name,
                                    color: color_graph
                                })

                            }
                            else if (direction === UP) {
                                
                                let filteredSkills = skills
                                let filteredNodes = nds
                                let filteredLinks = links

                                if (i > 0) {
                                    filteredSkills = skills.filter(d => experiences[i-1].skills.includes(d.name) || ['Origin',''].includes(d.parent))
                                    filteredNodes = nds.filter(d => experiences[i-1].tools.includes(d.name))
                                    filteredLinks = links.filter(d => filteredNodes.map(d => d.id).includes(d.id))
                                }
                 
                                TreeMap({
                                    svg: svgSkills, 
                                    data: filteredSkills
                                },{
                                    width: chart_width*0.9,
                                    height: chart_height*0.7,
                                    color: color_tree
                                })

              
                                ForceGraph({
                                    svg: svgTools, 
                                    nds: filteredNodes, 
                                    links: filteredLinks
                                }, 
                                {
                                    nodeGroup: 'type',
                                    width: chart_width, 
                                    height: chart_height,
                                    linkStrokeOpacity: 0,
                                    nodeTitle: d => `${d.name}\n${d.type}`,
                                    nodeStrength: -100,
                                    nodeRadius: circleRadius,
                                    nodeText: d => d.name,
                                    color: color_graph
                                })                                

                        }
                        },
                        offset: `60%`
                    })
                })
                
                /**
                 * Fix/Unfix charts.
                */

                // new Waypoint({
                //     element: document.getElementById(experiences[experiences.length-1].id),
                //     handler: direction => {
                //         if (direction === DOWN) {
                //             console.log(DOWN, w_h_ratio)
                //             d3.select('#right-wrapper')
                //                 .style('position', 'unset')
                //                 .style('top', '')            
                //                 .style('left', '')
                //         }
                //         else if (direction === UP) {
                //             d3.select('#right-wrapper')
                //                 .style('position', 'fixed')
                //                 .style('top', `${margin.top}px`)
                //         }
                //     },
                //     offset: '-10%'
                // })

            })
        })
    })
})
