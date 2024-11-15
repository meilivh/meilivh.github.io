function TreeMap(
    {
        svg,
        data // an iterable of data
    },
    {
        color, // an array of color strings, for the node groups
        width = 600, // outer width, in pixels
        height = 900, // outer height, in pixels
    } = {}
) {
    var root = d3.stratify()
    .id(function(d) { return d.name; })   // Name of the entity (column name is name in csv)
    .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
    (data);
    root.sum(function(d) { return +d.size })   // Compute the numeric value for each entity

    const t = svg.transition().duration(750);

    d3.treemap()
        .size([width, height])
        .padding(4)
        (root)

    let leaves = root.leaves().filter(d => d.data.size)

    // use this information to add rectangles:
    svg
    .selectAll("rect")
    .data(leaves)
    .join(
        enter => enter.append("rect")
            .attr("width", 0)
            .attr("height", 0)
            .attr('x', function (d) { return d.x0 + (d.x1 - d.x0)/2; })
            .attr('y', function (d) { return d.y0 + (d.y1 - d.y0)/2; })
            .call(enter => enter.transition(t)
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })),
        update => update
            .attr('x', function (d) { return d.x0 + (d.x1 - d.x0)/2; })
            .attr('y', function (d) { return d.y0 + (d.y1 - d.y0)/2; })
            .attr('width', 0)
            .attr('height', 0)       
            .call(update => update.transition(t)
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })            
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })),
        exit => exit.remove()
    )
    .style("fill", d => color(d.parent.id))


    // and to add the text labels
    svg
    .selectAll("text")
    .data(leaves)
    .join(
        enter => enter.append("text")
            .attr('x', function (d) { return d.x0 + (d.x1 - d.x0)/2; })
            .attr('y', function (d) { return d.y0 + (d.y1 - d.y0)/2; })            
            .attr("font-size", "0px")
            .text(function(d){ return d.data.name})
            .call(enter => enter.transition(t)
            .attr("x", function(d){ return d.x0+10}) 
            .attr("y", function(d){ return d.y0+20})            
            .attr("font-size", "15px")
            .attr("fill", "white")
        ),
        update => update
            .attr('x', function (d) { return d.x0 + (d.x1 - d.x0)/2; })
            .attr('y', function (d) { return d.y0 + (d.y1 - d.y0)/2; })
            .text(function(d){ return d.data.name})
            .attr("font-size", "0px")
            .call(enter => enter.transition(t)
            .attr("x", function(d){ return d.x0+10}) 
            .attr("y", function(d){ return d.y0+20})            
            .attr("font-size", "15px")
            .attr("fill", "white")
        ),
        exit => exit.remove()
    )
  
    return Object.assign(svg.node());
}