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

    svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        // .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    // Then d3.treemap computes the position of each element of the hierarchy
    // The coordinates are added to the root object above
    d3.treemap()
        .size([width, height])
        .padding(4)
        (root)

    // use this information to add rectangles:
    svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", "#69b3a2");

    // and to add the text labels
    svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
        .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        .text(function(d){ return d.data.name})
        .attr("font-size", "15px")
        .attr("fill", "white")
  
    return Object.assign(svg.node(), {scales: {colors}});
}