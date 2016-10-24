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

    // Each test run is displayed as a circle
    var circle = g.selectAll("circle")
        .data(obj)

    circle.exit().remove()

    circle = circle.enter()
        .append("circle")
        .attr("r", "5")
        .attr("cx", (d) => { return xScale(new Date(d.start_time)); })
        .attr("cy", (d) => { return yScale(d.failed_tests); })
        .attr("fill", "blue")
        .attr("fill", "blue")
        .merge(circle)


    var bgWidth = 0,
        bgHeight = 0;

    // This is the group for the tooltip
    var tooltip = g.append("g")
        .attr("display", "none")

    // Add a background rectangle for the tooltip
    tooltip.append("rect")
        .attr("fill", "steelblue")
        .attr("rx", "0.3em")
        .attr("ry", "0.3em")

    // Padding for the tooltip
    const padX = 10
    const padY = 10

    circle.on("mouseover", (d, i, n) => {
        var tt_text = tooltip.attr("display", "block")
            .selectAll("text")
            .data([
                d.target,
                d.failed_tests + " failed tests",
                d.start_time,
                d.maxscale_commit_id
            ])

        tt_text.enter()
            .append("text")
            .attr("y", "1.1em")
            .attr("x", "0.15em")
            .attr("dy", (d, i) => {return (1 * i) + "em"})
            .attr("fill", "black")
            .merge(tt_text)
            .text((d) => {return d})

        var texts = tooltip.selectAll("text")

        bgWidth = d3.max(texts.nodes(), (d, i, n) => {return n[i].getBBox().width;})
        bgHeight = d3.max(texts.nodes(), (d, i, n) => {return n[i].getBBox().height;}) * (texts.size() + 1)

        var rect = tooltip.select("rect")
            .attr("width", bgWidth + padX / 2)
            .attr("height", bgHeight + padY / 2)

        var mouse = d3.mouse(n[i])
        tooltip.attr("transform", "translate(" + (mouse[0] - (bgWidth + padX)) + "," + (mouse[1] - (bgHeight + padY)) + ")")
    })
        .on("mouseout", () => {
            tooltip.attr("display", "none")
        })
        .on("mousemove", (d, i, n) => {
            var mouse = d3.mouse(n[i])
            tooltip.attr("transform", "translate(" + (mouse[0] - (bgWidth + padX)) + "," + (mouse[1] - (bgHeight + padY)) + ")")
        })

    // Add a legend to the chart
    g.append("text")
        .text("Test failures by build")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("dy", "0.75em")
        .attr("fill", "black")

});
