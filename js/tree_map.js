function TreeMap(
    {
        svg,
        data // an iterable of data
    },
    {
        colors = d3.schemeTableau10, // an array of color strings, for the node groups
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

    console.log('leaves',leaves)

    // use this information to add rectangles:
    svg
    .selectAll("rect")
    .data(leaves)
    .join(
        enter => enter.append("rect")
            .attr("fill", "green")
            .attr("width", 0)
            .attr("height", 0)
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .call(enter => enter.transition(t)
            .style("stroke", "black")
            .style("fill", "#69b3a2")
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })),
        update => update.attr("fill", "blue")
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .call(update => update.transition(t)
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })),
        exit => exit.remove()
    )

    // and to add the text labels
    svg
    .selectAll("text")
    .data(leaves)
    .join(
        enter => enter.append("text")
            .attr("color", "green")
            .attr("x", function(d){ return d.x0+10}) 
            .attr("y", function(d){ return d.y0+20})
            .text(function(d){ return d.data.name})
            .attr("font-size", "15px")
            .attr("fill", "white"),
        update => update.attr("color", "blue")
            .attr("x", function(d){ return d.x0+10}) 
            .attr("y", function(d){ return d.y0+20})
            .text(function(d){ return d.data.name})
            .attr("font-size", "15px")
            .attr("fill", "white"),
        exit => exit.remove()
    )
  
    return Object.assign(svg.node(), {scales: {colors}});
}