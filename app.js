
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
  .text("Damage Dealt");

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("class", "label")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Damage Dealt");

var role = 'ADC';
var data = [];
d3.csv("data.csv", function(error, data) {
  window.data = data;

  window.roles = [];
  data.forEach(function(thing) {
    if (roles.indexOf(thing['Role']) == -1) {
      roles.push(thing['Role']);
    }
  });
  var $select = document.querySelector('select[name="role"]');
  roles.forEach(function(role) {
    var node = document.createElement('option');
    var textNode = document.createTextNode(role);
    node.appendChild(textNode);
    node.value = role;
    $select.appendChild(node);
  });

  function refreshPlayerList() {
    $select = document.querySelector('select[name="player"]');
    $select.innerHTML = '';
    data.forEach(function(thing) {
      if (thing.Role == document.querySelector('select[name="role"]').value) {
        var node = document.createElement('option');
        var textNode = document.createTextNode(thing.Player);
        node.appendChild(textNode);
        node.value = thing.Player;
        $select.appendChild(node);
      }
    });
  }

  refreshPlayerList();

  document.querySelector('select[name="role"]').addEventListener('change', function() {
    role = document.querySelector('select[name="role"]').value;
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);

    refreshPlayerList();
  });

  document.querySelector('select[name="player"]').addEventListener('change', function() {
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  document.querySelector('input[name="x-axis-label"]').value = 'Damage Dealt';
  document.querySelector('input[name="y-axis-label"]').value = 'Damage Dealt';

  document.querySelector('select[name="x-axis"]').addEventListener('change', function() {
    svg.selectAll('g .x.axis .label').text(document.querySelector('select[name="x-axis"]').value);
    document.querySelector('input[name="x-axis-label"]').value = document.querySelector('select[name="x-axis"]').value;
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  document.querySelector('select[name="y-axis"]').addEventListener('change', function() {
    svg.selectAll('g .y.axis .label').text(document.querySelector('select[name="y-axis"]').value);
    document.querySelector('input[name="y-axis-label"]').value = document.querySelector('select[name="y-axis"]').value;
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  document.querySelector('input[name="x-axis-label"]').addEventListener('keyup', function() {
    svg.selectAll('g .x.axis .label').text(document.querySelector('input[name="x-axis-label"]').value);
  });

  document.querySelector('input[name="y-axis-label"]').addEventListener('keyup', function() {
    svg.selectAll('g .y.axis .label').text(document.querySelector('input[name="y-axis-label"]').value);
  });

  drawGraph('Damage Dealt', 'Damage Dealt');
});

function getData() {
  return data.filter(function(item) {
    return item.Role == role;
  });
}

function drawGraph(xColumn, yColumn) {
  x.domain(d3.extent(getData(), function(d) { return +d[xColumn]; })).nice();
  y.domain(d3.extent(getData(), function(d) { return +d[yColumn]; })).nice();

  color = d3.scale.category10();

  svg.selectAll('.dot').remove();

  svg.selectAll(".dot")
    .data(getData())
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) { return x(d[xColumn]); })
    .attr("cy", function(d) { return y(d[yColumn]); })
    .style("fill", function(d) {
      if (document.querySelector('select[name="player"]').value == d.Player) {
        return color(d.Player);
      } else {
        color(d.Player);
        return '#ccc';
      }
    });

  svg.selectAll('g .x.axis').call(xAxis);
  svg.selectAll('g .y.axis').call(yAxis);

  svg.selectAll(".legend").remove();

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
}