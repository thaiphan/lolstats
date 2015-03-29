var labels = {
  "CS": "CS",
  "Gold": "Gold (000s)",
  "Damage Dealt": "Damage Dealt (000s)",
  "Damage Taken": "Damage Taken (000s)",
  "Healing": "Healing (000s)",
  "Ward Placed": "Ward Placed",
  "Ward Killed": "Ward Killed"
};

function getLabel(key) {
  return labels[key];
}

var margin = {top: 20, right: 120, bottom: 30, left: 40},
  height = 500 - margin.top - margin.bottom;

function getWidth() {
  return d3.select('svg').node().getBoundingClientRect().width - margin.left - margin.right;
}

var x = d3.scale.linear();
var y = d3.scale.linear();

function getX() {
  return x.range([0, getWidth()]);
}
function getY() {
  return y.range([height, 0]);
}

var color = d3.scale.category10();

function getXAxis() {
  return d3.svg.axis()
    .scale(getX())
    .orient("bottom");
}

function getYAxis() {
  return d3.svg.axis()
    .scale(getY())
    .orient("left");
}

var svg = d3.select("svg")
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(getXAxis())
  .append("text")
  .attr("class", "label")
  .attr("x", getWidth())
  .attr("y", -6)
  .text("CS");

svg.append("g")
  .attr("class", "y axis")
  .call(getYAxis())
  .append("text")
  .attr("class", "label")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .text("CS");

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
    var playersAlreadyAddedToList = [];
    data.forEach(function(thing) {
      // Skip adding duplicate player names to the dropdown box
      if (playersAlreadyAddedToList.indexOf(thing.Player) == -1) {
        if (thing.Role == document.querySelector('select[name="role"]').value) {
          var node = document.createElement('option');
          var textNode = document.createTextNode(thing.Player);
          node.appendChild(textNode);
          node.value = thing.Player;
          $select.appendChild(node);
          playersAlreadyAddedToList.push(thing.Player);
        }
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

  document.querySelector('select[name="x-axis"]').addEventListener('change', function() {
    svg.selectAll('g .x.axis .label').text(getLabel(document.querySelector('select[name="x-axis"]').value));
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  document.querySelector('select[name="y-axis"]').addEventListener('change', function() {
    svg.selectAll('g .y.axis .label').text(getLabel(document.querySelector('select[name="y-axis"]').value));
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  drawGraph('CS', 'CS');
});

function getData() {
  return data.filter(function(item) {
    return item.Role == role;
  });
}

function drawGraph(xColumn, yColumn) {
  getX().domain(d3.extent(getData(), function(d) { return +d[xColumn]; })).nice();
  getY().domain(d3.extent(getData(), function(d) { return +d[yColumn]; })).nice();

  color = d3.scale.category10();

  svg.selectAll('.dot').remove();

  svg.selectAll(".dot")
    .data(getData())
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) { return getX()(d[xColumn]); })
    .attr("cy", function(d) { return getY()(d[yColumn]); })
    .style("fill", function(d) {
      if (document.querySelector('select[name="player"]').value == d.Player) {
        return color(d.Player);
      } else {
        color(d.Player);
        return '#ccc';
      }
    });

  svg.selectAll('g .x.axis').call(getXAxis());
  svg.selectAll('g .y.axis').call(getYAxis());

  svg.selectAll(".legend").remove();

  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(120," + i * 20 + ")"; });

  legend.append("rect")
    .attr("x", getWidth() - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", getWidth() - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });
}

d3.select(window).on('resize', function() {
  drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
});