var query = "http://localhost:8080/";

d3.json(query, (err, obj) => {

    if (err != null) {
        return d3.select("div")
            .text("Error")
    }

    // Min and max values
    var ymin = d3.min(obj, (d) => { return d.failed_tests })
    var ymax = d3.max(obj, (d) => { return d.failed_tests })
    var xmin = d3.min(obj, (d) => { return new Date(d.start_time) })
    var xmax = d3.max(obj, (d) => { return new Date(d.start_time) })

    // Size and padding for the chart
    var width = 1400,
        height = 600,
        pad = 100;

    // Scale y axis linearly
    var yScale = d3.scaleLinear()
	    .domain([ymin, ymax])
		.range([height, 0]);

    // Same for x axis but use scaleTime
    var xScale = d3.scaleTime()
	    .domain([xmin, xmax])
		.range([0, width]);

    // Add the SVG
    var svg = d3.select(".my_div")
        .append("svg")
        .attr("width", $(window).width())
        .attr("height", $(window).height())
        .call(d3.zoom().on("zoom", () => { // This makes the chart zoomable
            g.attr("transform", d3.event.transform.toString());
        }))

    // This is the topmost SVG group where all the elements are added
    var g = svg.append("g")
        .attr("transform", "translate(" + pad / 2 + "," + pad / 2 + ")")

    // Created a stepped line for the test results
    var line = d3.line()
        .y((d) => { return yScale(d.failed_tests); })
        .x((d) => { return xScale(new Date(d.start_time)); })
        .curve(d3.curveStepAfter)

    g.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(d3.axisBottom(xScale))

    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .text("Failed Tests")
        .attr("transform", "translate(10,-40)")
        .attr("y", 10)
        .attr("dy", "0.5em")
        .attr("fill", "black")

    // The test failure rate is displayed as a stepped line
    g.append("path")
        .datum(obj)
        .attr("d", line)
        .attr("stroke", "blue")
        .attr("fill", "none")

    var tooltip = g.append("text")
        .attr("y", 15)
        .attr("dy", "0.5em")
        .attr("fill", "black")
        .attr("display", "none")

    // Padding for the tooltip
    const padX = -30
    const padY = -35

    // Each test run is displayed as a circle
    var circle = g.selectAll("circle")
        .data(obj)

    circle.exit().remove()

    circle.enter()
        .append("circle")
        .attr("r", "5")
        .attr("cx", (d) => { return xScale(new Date(d.start_time)); })
        .attr("cy", (d) => { return yScale(d.failed_tests); })
        .attr("fill", "blue")
        .attr("fill", "blue")
        .on("mouseover", (d, i, n) => {
            tooltip.attr("display", "block")
                .text("" + d.target + " " + d.failed_tests + " failed tests")

            var mouse = d3.mouse(n[i])
            tooltip.attr("transform", "translate(" + (mouse[0] + padX) + "," + (mouse[1] + padY) + ")")
        })
        .on("mouseout", () => {
            tooltip.attr("display", "none")
        })
        .on("mousemove", (d, i, n) => {
            var mouse = d3.mouse(n[i])
            tooltip.attr("transform", "translate(" + (mouse[0] + padX) + "," + (mouse[1] + padY) + ")")
        })
        .merge(circle)

    // Add a legend to the chart
    g.append("text")
        .text("Test failures by build")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("dy", "0.75em")
        .attr("fill", "black")

});
