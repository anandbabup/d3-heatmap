var margin = { top: 20, right: 90, bottom: 30, left: 50 },
  width = window.innerWidth * 0.9 - margin.left - margin.right,
  height = window.innerHeight * 0.8 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, width]),
  y = d3.scaleLinear().range([0, height]),
  z = d3.scaleSequential(d3.interpolateRdBu); //STEP1
//interpolateGreens

// The size of the buckets in the CSV data file.
// This could be inferred from the data if it weren't sparse.
var xStep = 1,
  yStep = 15;

var svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  

d3.csv("DEN_TGSAR.csv", function (error, buckets) {
  if (error) throw error;

  // Coerce the CSV data to the appropriate types.
  buckets.forEach(function (d) {
    d.id = +d.id;
    d.DEPT = +d.DEPT;
    d.DEN_TGSAR = +d.DEN_TGSAR;
  });

  // Compute the scale domains.
  // Curve limits
  // 'DEN_TGSAR':(1.9,2.8), 'GR_TGSAR':(0,150), 'NEUT_TGSAR':(-0.15,0.8), 'RES_TGSAR':(0,300), 'SON_TGSAR':(40,100)
  x.domain(d3.extent(buckets, function (d) { return d.id; }));
  y.domain([-4000, 10000]); //d3.extent(buckets, function(d) { return d.DEPT; }));
  z.domain([1.9, 2.8]); //d3.extent(buckets, function(d) { return d.SON_TGSAR; }));
  //z.domain(d3.extent(buckets, function(d) { return d.DEN_TGSAR; })); //STEP2


  // Extend the x- and y-domain to fit the last bucket.
  // For example, the y-bucket 3200 corresponds to values [3200, 3300].
  x.domain([x.domain()[0], +x.domain()[1] + xStep]);
  y.domain([y.domain()[0], y.domain()[1] + yStep]);

  // Display the tiles for each non-zero bucket.
  // See http://bl.ocks.org/3074470 for an alternative implementation.
  svg.selectAll(".tile")
    .data(buckets)
    .enter().append("rect")
    .attr("class", "tile")
    .attr("x", function (d) { return x(d.id); })
    .attr("y", function (d) { return y(d.DEPT + yStep); })
    .attr("width", x(xStep) - x(0))
    .attr("height", y(yStep) - y(0))
    .style("fill", function (d) { return z(d.DEN_TGSAR); })
    .attr('pointer-events', 'all')
    .style("opacity", "1")
    .on('mouseover', (d) => {
      console.log("mouseover:", d);
    });


  // Add a legend for the color values.
  var legend = svg.selectAll(".legend")
    .data(z.ticks(10).slice(1).reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(" + (width + 20) + "," + (20 + i * 20) + ")"; });


  legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", z);

  legend.append("text")
    .attr("x", 26)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text(String);

  svg.append("text")
    .attr("class", "label")
    .attr("x", width + 20)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text("Density");

  // Add an x-axis with label.
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom().scale(x))
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .attr("text-anchor", "end")
    .style("fill", "black")
    .text("Well number");

  // Add a y-axis with label.
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft().scale(y))
    .append("text")
    .attr("class", "label")
    .attr("y", 6)
    .attr("dy", ".71em")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .style("fill", "black")
    .text("Depth");

  var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");

  mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .attr("stroke-dasharray", "3,3")
    .style("opacity", "0");

  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', width) // can't catch mouse events on a g element
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function () { // on mouse out hide line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "0");  
        mouseout();    
    })
    .on('mouseover', function () { // on mouse in show line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "1");
     
    })
    .on('mousemove', function () { // mouse moving over canvas
      var mouse = d3.mouse(this);
      mousemove(mouse);
      d3.select(".mouse-line")
        .attr("d", function () {
          var d = "M" + 0 + "," + mouse[1];
          d += " " + width + "," + mouse[1];
          console.log("d:", d);
          return d;
        });
    });

  //step 1:
  //var bisect = d3.bisector(function(d) { return d.DEPT; }).left;
  var focusText = svg
  .append('g')
  .append('text')
  .style("opacity", 0)
  .attr("text-anchor", "left")
  .attr("transform", "translate(5,-5)");
  //.attr("alignment-baseline", "top");
  
  //Step 2:
  function mousemove(e) {
    // recover coordinate we need
    var y0 = y.invert(e[1]);
    focusText
      .html("Dept:"+ d3.format('.2f')(y0))
      .attr("x", e[0])
      .attr("y", e[1])
      .style("opacity", "1");
  }
  function mouseout() {
    focusText.style("opacity", 0);
  }
});