function ForceGraph(
  {
      svg,
      nds, // an iterable of node objects (typically [{id}, …])
      links // an iterable of link objects (typically [{source, target}, …])
  },
  {
      nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
      nodeGroup,
      nodeTitle, // given d in nodes, a title string
      nodeText, // given d in nodes, a text string
      nodeRadius = 5, // node radius, in pixels
      nodeStrength,
      linkSource = ({ source }) => source, // given d in links, returns a node identifier string
      linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
      linkStrength,
      color, // an array of color strings, for the node groups
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

  // Replace the input nodes and links with mutable objects for the simulation.
  let nodes = d3.map(nds, (d, i) => ({ id: N[i], name: d.name, group: d[nodeGroup] }));
  links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }));

  // Construct the scales.
  const t = svg.transition().duration(750);

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
    .force('x', d3.forceX().x(width/2))
    .force('y', d3.forceY().y(height/2))
    .force("center", d3.forceCenter())
    .force('collision', d3.forceCollide().radius(nodeRadius))
    .on('tick', ticked);

  const node = svg
    .selectAll("circle")
    .data(nodes)
    .join(
      enter => enter
        .append("circle")
        .attr("cx", (d) => d.x).attr("cy", (d) => d.y)
        .attr("r", 0)
        .call(enter => enter.transition(t)
        .attr("fill", d => color && nodeGroup ? color(d.group): 'blue')
        .attr("r", nodeRadius)
      ),
      update => update
        .attr("r", nodeRadius*1.5)
        .attr("cx", (d) => d.x).attr("cy", (d) => d.y)       
        .call(update => update.transition(t)
        .attr("fill", d => color && nodeGroup ? color(d.group): 'blue')
        .attr("r", nodeRadius)
      ),
      exit => exit.remove()      
    );

  const text = svg
    .selectAll("text")
    .data(nodes)
    .join(
      enter => enter.append("text")
        .attr("x", (d) => d.x).attr("y", (d) => d.y)
        .style("font-size", "0px")
        .attr("text-anchor", "middle")
        .call(enter => enter.transition(t)
        .style("font-size", "12px")
        .attr("fill", d => color && nodeGroup && color(d.group) === '#025259' ? '#F4E2DE': 'black')
        .text(nodeText)
      ),
      update => update
        .attr("x", (d) => d.x).attr("y", (d) => d.y)
        .style("font-size", "0px")
        .call(enter => enter.transition(t)
        .style("font-size", "12px")
        .attr("fill", d => color && nodeGroup && color(d.group) === '#025259' ? '#F4E2DE': 'black')
        .text(nodeText)
      ),        
      exit => exit.remove()        
    );

  node.call(drag(simulation));

  if (invalidation != null) invalidation.then(() => simulation.stop());

  function intern(value) {
    return value !== null && typeof value === "object"
      ? value.valueOf()
      : value;
  }

  function ticked() {
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