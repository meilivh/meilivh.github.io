const DOWN = 'down'
const UP = 'up'
const original_vw = Math.max(document.documentElement.clientHeight, window.innerWidth || 0)
const margin = {top:0, left:original_vw*0.021, bottom:0, right:original_vw*0.021}
const vw = original_vw*0.95
const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

/**
 * Hiddes/Shows header.
*/
new Waypoint({
    element: document.getElementById('end'),
    handler: direction => {
        if (direction === DOWN) {
            console.log(DOWN)
            d3.select('#title').style('visibility', 'hidden')
            d3.select('#header').style('visibility', 'visible')
            d3.select('#transition-title').attr('class', 'grey darken-4 btn-floating btn-large scale-transition scale-out')
        }
        else if (direction === UP) {
            console.log(UP)
            d3.select('#title').style('visibility', 'visible')
            d3.select('#header').style('visibility', 'hidden')
        d3.select('#transition-title').attr('class', 'grey darken-4 btn-floating btn-large scale-transition scale-in')
    }
    },
    offset: `66%`
})

/**
 * Fixes network.
*/
new Waypoint({
    element: document.getElementById('tools'),
    handler: direction => {
        if (direction === DOWN) {
            console.log(DOWN)
            d3.select('#svg-tools')
                .style('position', 'fixed')
                .style('top', '5%')

            d3.select('#svg-skills')
                .style('position', 'fixed')
                .style('top', '5%')
                .style('left', `${0.3*vw+margin.left}px`)
        }
        else if (direction === UP) {
            console.log(UP)
            d3.select('#svg-tools')
                .style('position', 'unset')
                .style('top', '')

            d3.select('#svg-skills')
                .style('position', 'unset')
                .style('top', '')
                .style('left', '')
        }
    },
    offset: `5%`
})

/**
 * Shows go down button.
*/

setTimeout(() => {
    d3.select('#transition-title').attr('class', 'grey darken-4 btn-floating btn-large scale-transition scale-in')
}, 500)

const svgTools = d3
    .select("#svg-tools").append('svg')

d3.json('data/tools.json').then(nds => {
    d3.json('data/tools_links.json').then(links => {
        ForceGraph({
            svg: svgTools, 
            nds, 
            links
        }, 
        {
            width:vw*0.3, 
            height:vw*0.5 < vh? vw*0.5 : vh,
            linkStrokeOpacity:0,
            nodeGroup: d => d.type,
            nodeTitle: d => `${d.name}\n${d.type}`,
            nodeStrength: -300,
            nodeRadius: 30,
            nodeText: d => d.name
        })
    })
})

const svgSkills = d3
    .select("#svg-skills").append('svg')

d3.json('data/skills.json').then(data => {
    // /**
    //      * Shows experience.
    //     */
    // d3.json('data/experiences.json').then(experiences => {
    //     experiences.map(experience => {
    //         new Waypoint({
    //             element: document.getElementById(experience.id),
    //             handler: direction => {
    //                 if (direction === DOWN) {
    //                     console.log(DOWN)
    //                     d3.select(`#${experience.id}`).style('visibility', 'visible')

    //                     let data = nds.map(d => Object.assign(d, { size: experience.experiences.includes(d.name)? 3: "" }))

    //                     TreeMap({
    //                         svg: svgSkills, 
    //                         data
    //                     }, 
    //                     {
    //                         width:vw*0.3, 
    //                         height:vw*0.5 < vh*0.5 ? vw*0.5 : vh*0.5
    //                     })
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
    //             offset: `20%`
    //         })
    //     })
    // })

    TreeMap({
        svg: svgSkills, 
        data
    }, 
    {
        width:vw*0.3, 
        height:vw*0.5 < vh*0.5 ? vw*0.5 : vh*0.5
    })
})

/**
 * Shows experience.
*/
d3.json('data/experiences.json').then(experiences => {
    experiences.map(experience => {
        new Waypoint({
            element: document.getElementById(experience.id),
            handler: direction => {
                if (direction === DOWN) {
                    console.log(DOWN)
                    d3.select(`#${experience.id}`).style('visibility', 'visible')
                }
                else if (direction === UP) {
                    console.log(UP)
                    d3.select(`#${experience.id}`).style('visibility', 'hidden')
            }
            },
            offset: `80%`
        })
    })
})

/**
 * Hides experience.
*/
d3.json('data/experiences.json').then(experiences => {
    experiences.map(experience => {
        new Waypoint({
            element: document.getElementById(experience.id),
            handler: direction => {
                if (direction === DOWN) {
                    console.log(DOWN)
                    d3.select(`#${experience.id}`).style('visibility', 'hidden')
                }
                else if (direction === UP) {
                    console.log(UP)
                    d3.select(`#${experience.id}`).style('visibility', 'visible')
            }
            },
            offset: `10%`
        })
    })
})


