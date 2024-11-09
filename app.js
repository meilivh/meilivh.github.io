const DOWN = 'down'
const UP = 'up'
const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
const h = 400
console.log(vh,30*vh/100)
// Fix/unfix chart
new Waypoint({
    element: document.getElementById('experience'),
    handler: direction => {
        if (direction === DOWN) {
            console.log(DOWN)
            d3.select('#title').style('visibility', 'hidden')
            d3.select('#header').style('visibility', 'visible')

        }
        else if (direction === UP) {
            console.log(UP)
            d3.select('#title').style('visibility', 'visible')
            d3.select('#header').style('visibility', 'hidden')
        }
    },
    offset: `30%`
})