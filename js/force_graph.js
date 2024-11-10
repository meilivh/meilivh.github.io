function ForceGraph(
    {
        svg,
        nds, // an iterable of node objects (typically [{id}, …])
        links // an iterable of link objects (typically [{source, target}, …])
    },
    {
        nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
        nodeGroup, // given d in nodes, returns an (ordinal) value for color
        nodeGroups, // an array of ordinal values representing the node groups
        nodeTitle, // given d in nodes, a title string
        nodeText, // given d in nodes, a text string
        nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
        nodeStroke = "#fff", // node stroke color
        nodeStrokeWidth = 1.5, // node stroke width, in pixels
        nodeStrokeOpacity = 1, // node stroke opacity
        nodeRadius = 5, // node radius, in pixels
        nodeStrength,
        linkSource = ({ source }) => source, // given d in links, returns a node identifier string
        linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
        linkStroke = "#999", // link stroke color
        linkStrokeOpacity = 0.6, // link stroke opacity
        linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
        linkStrokeLinecap = "round", // link stroke linecap
        linkStrength,
        colors = d3.schemeTableau10, // an array of color strings, for the node groups
        width = 600, // outer width, in pixels
        height = 900, // outer height, in pixels
        invalidation // when this promise resolves, stop the simulation
    } = {}
) {
    // Compute values.
    const N = d3.map(nds, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nds, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nds, nodeGroup).map(intern);
    const W =
      typeof linkStrokeWidth !== "function"
        ? null
        : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);
  
    // Replace the input nodes and links with mutable objects for the simulation.
    let nodes = d3.map(nds, (d, i) => ({ id: N[i], name: d.name }));
    links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }));
  
    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);
  
    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
  
    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3
      .forceLink(links)
      .id(({ index: i }) => N[i])
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);
  
    var simulation = d3.forceSimulation(nodes)
      .force("charge", forceNode)
      .force("link", forceLink)
      .force('x', d3.forceX().x(100))
      .force("center", d3.forceCenter())
      .force('collision', d3.forceCollide().radius(nodeRadius))
      .on('tick', ticked);
    
    const link = svg
      .append("g")
      .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
      .attr("stroke-opacity", linkStrokeOpacity)
      .attr(
        "stroke-width",
        typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null
      )
      .attr("stroke-linecap", linkStrokeLinecap)
      .selectAll("line")
      .data(links)
      .join("line");
  
    const node = svg
      .append("g")
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-opacity", 0)
      .attr("stroke-width", nodeStrokeWidth)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", nodeRadius);
  
    const text = svg
      .selectAll("text")
      .data(nodes)
      .join("text")
      .style("font-size", "12px")
      .text(nodeText)
      .attr("text-anchor", "middle");
  
    node.call(drag(simulation));
  
    // if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
    // if (L) link.attr("stroke", ({ index: i }) => L[i]);
    if (G) node.attr("fill", ({index: i}) => color(G[i]));
    if (T) node.append("title").text(({ index: i }) => T[i]);
    if (invalidation != null) invalidation.then(() => simulation.stop());
  
    function intern(value) {
      return value !== null && typeof value === "object"
        ? value.valueOf()
        : value;
    }
  
    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
  
      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      text.attr("x", (d) => d.x).attr("y", (d) => d.y);
    }
  
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
  
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
  
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
  
      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return Object.assign(svg.node(), { scales: { color } });
}