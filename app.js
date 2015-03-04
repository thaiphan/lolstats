
var margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
  .range([0, width]);

var y = d3.scale.linear()
  .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
  .append("text")
  .attr("class", "label")
  .attr("x", width)
  .attr("y", -6)
  .style("text-anchor", "end")
  .text("Minutes (m)");

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("class", "label")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Damage Dealt ('000s)");

var data = [];
d3.csv("data.csv", function(error, data) {
  window.data = data;
  drawGraph('Damage Dealt', 'Damage Dealt');
});

function drawGraph(xColumn, yColumn) {
  x.domain(d3.extent(data, function(d) { return +d[xColumn]; })).nice();
  y.domain(d3.extent(data, function(d) { return +d[yColumn]; })).nice();

  svg.selectAll('.dot').remove();

  svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) { return x(d[xColumn]); })
    .attr("cy", function(d) { return y(d[yColumn]); })
    .style("fill", function(d) { return color(d.Player); });

  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

  svg.selectAll('g .x.axis').call(xAxis);

  svg.selectAll('g .y.axis').call(yAxis);
}

document.querySelector('select[name="x-axis"]').addEventListener('change', function() {
  drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
});

document.querySelector('select[name="y-axis"]').addEventListener('change', function() {
  drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
});