async function drawScatter() {

  // 1. Access data

  const dataset = await d3.csv("./ticket_ir_seg.csv")

  const xAccessor = d => Number(d.TicktProm)
  const yAccessor = d => Number(d.ir)
  const zAccessor = d => Number(d.IDENTIFICACION)
 /*  const typeAccessor= d=> String(d.Segmento2019) */
  const colorAccessor = d => d.Segmento2019

  console.table(dataset)

  // 2. Create chart dimensions

  const width = d3.min([
    window.innerWidth * 0.70,
    window.innerHeight * 0.75,
  ])
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  // 4. Create scales

  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice()

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

 /*  const colorScale = d3.scaleLinear()
    .domain(d3.extent(dataset, colorAccessor))
    .range(["skyblue", "darkslategrey"])   */
  const colorScale = d3.scaleOrdinal()
    .domain(d3.extent(dataset, colorAccessor))
    .range(d3.schemeSet2)

  console.log(colorScale("EXPERTOS"))

  const drawDots = (dataset) => {

    // 5. Draw data

    const dots = bounds.selectAll("circle")
      .data(dataset, d => d[0])

    const newDots = dots.enter().append("circle")

    const allDots = newDots.merge(dots)
        .attr("cx", d => xScale(xAccessor(d)))
        .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", 4)
        .style("fill", d => colorScale(colorAccessor(d)))

    const oldDots = dots.exit()
        .remove()
  }
  drawDots(dataset)

  // 6. Draw peripherals

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  const xAxisLabel = xAxis.append("text")
      .attr("class", "x-axis-label")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 10)
      .html("Ticket Promedio(COP)")

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(4)

  const yAxis = bounds.append("g")
      .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
      .attr("class", "y-axis-label")
      .attr("x", -dimensions.boundedHeight / 2)
      .attr("y", -dimensions.margin.left + 10)
      .text("Indice de retiro")

  // 7. Set up interactions

  const delaunay = d3.Delaunay.from(
    dataset,
    d => xScale(xAccessor(d)),
    d => yScale(yAccessor(d)),
  )
  const voronoi = delaunay.voronoi()
  voronoi.xmax = dimensions.boundedWidth
  voronoi.ymax = dimensions.boundedHeight

  bounds.selectAll(".voronoi")
    .data(dataset)
    .enter().append("path")
      .attr("class", "voronoi")
      .attr("d", (d,i) => voronoi.renderCell(i))
      // .attr("stroke", "salmon")
      .on("mouseenter", onMouseEnter)
      .on("mouseleave", onMouseLeave)

  const tooltip = d3.select("#tooltip")
  function onMouseEnter(datum) {
    const dayDot = bounds.append("circle")
        .attr("class", "tooltipDot")
        .attr("cx", xScale(xAccessor(datum)))
        .attr("cy", yScale(yAccessor(datum)))
        .attr("r", 7)
        .style("fill", "maroon")
        .style("pointer-events", "none")

    const formatHumidity = d3.format(".2f")
    tooltip.select("#humidity")
        .text(formatHumidity(yAccessor(datum)))

    const formatDewPoint = d3.format(".2f")
    tooltip.select("#dew-point")
        .text(formatDewPoint(xAccessor(datum)))

    const formatId = d3.format(".2f")
    tooltip.select("#id")
        .text(formatId(zAccessor(datum)))

  /*   const formatType = d3.format(".2f")
        tooltip.select("#type")
            .text(formatType(colorAccessor(datum))) */


    const x = xScale(xAccessor(datum))
      + dimensions.margin.left
    const y = yScale(yAccessor(datum))
      + dimensions.margin.top

    tooltip.style("transform", `translate(`
      + `calc( -50% + ${x}px),`
      + `calc(-100% + ${y}px)`
      + `)`)

    tooltip.style("opacity", 1)
  }

  function onMouseLeave() {
    d3.selectAll(".tooltipDot")
      .remove()

    tooltip.style("opacity", 0)
  }
}
drawScatter()
