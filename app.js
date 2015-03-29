// Set the possible values of the "X Axis" and "Y Axis" dropdowns (key is the
// CSV column and value is what we want it to say on the frontend).
var labels = {
  "CS": "CS",
  "Gold": "Gold (000s)",
  "Damage Dealt": "Damage Dealt (000s)",
  "Damage Taken": "Damage Taken (000s)",
  "Healing": "Healing (000s)",
  "Ward Placed": "Ward Placed",
  "Ward Killed": "Ward Killed"
};

// Get the frontend label for the given "X / Y Axis" dropdown, given the CSV
// column name
function getLabel(key) {
  return labels[key];
}

// Random variables for storing the margining and stuff of the graph
var margin = {top: 20, right: 120, bottom: 30, left: 40},
  height = 500 - margin.top - margin.bottom;

// Calculate the width of the graph
function getWidth() {
  return d3.select('svg').node().getBoundingClientRect().width - margin.left - margin.right;
}

// Initialise the x and y axes
var x = d3.scale.linear();
var y = d3.scale.linear();

// Calculate the range of the x-axis
function getX() {
  return x.range([0, getWidth()]);
}

// Calculate the range of the y-axis
function getY() {
  return y.range([height, 0]);
}

// Initialise the colours used for players
var color = d3.scale.category10();

// Get some random x-axis thing (used for drawing the x-axis)
function getXAxis() {
  return d3.svg.axis()
    .scale(getX())
    .orient("bottom");
}

// Get some random y-axis thing (used for drawing the y-axis)
function getYAxis() {
  return d3.svg.axis()
    .scale(getY())
    .orient("left");
}

// Create the SVG element we'll be drawing on
var svg = d3.select("svg")
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Draw the initial x-axis
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(getXAxis())
  .append("text")
  .attr("class", "label")
  .attr("x", getWidth())
  .attr("y", -6)
  .text("CS");

// Draw the initial y-axis
svg.append("g")
  .attr("class", "y axis")
  .call(getYAxis())
  .append("text")
  .attr("class", "label")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .text("CS");

// Set the default role
var role = 'ADC';

var data = [];

// Load the CSV file and then do stuff once loaded
d3.csv("data.csv", function(error, data) {
  window.data = data;

  // Calculate the data for the "Roles" dropdown
  window.roles = [];
  // Only add to "Roles" dropdown if the entry doesn't already exist
  data.forEach(function(thing) {
    if (roles.indexOf(thing['Role']) == -1) {
      roles.push(thing['Role']);
    }
  });

  // Populate the "Roles" dropdown
  var $select = document.querySelector('select[name="role"]');
  roles.forEach(function(role) {
    var node = document.createElement('option');
    var textNode = document.createTextNode(role);
    node.appendChild(textNode);
    node.value = role;
    $select.appendChild(node);
  });

  // Update the values of the "Player" dropdown based on the "Roles" dropdown
  function refreshPlayerList() {
    // Clear the "Player" dropdown
    $select = document.querySelector('select[name="player"]');
    $select.innerHTML = '';

    // Variable to store players currently already in the "Player" dropdown (so
    // we don't get duplicates)
    var playersAlreadyAddedToList = [];

    data.forEach(function(thing) {
      // Skip adding duplicate player names to the dropdown box
      if (playersAlreadyAddedToList.indexOf(thing.Player) == -1) {
        // If player is in the currently selected role...
        if (thing.Role == document.querySelector('select[name="role"]').value) {
          // Add player to the "Player" dropdown
          var node = document.createElement('option');
          var textNode = document.createTextNode(thing.Player);
          node.appendChild(textNode);
          node.value = thing.Player;
          $select.appendChild(node);

          // Add the player to the list of players already added
          playersAlreadyAddedToList.push(thing.Player);
        }
      }
    });
  }

  // Initial load of the player dropdown
  refreshPlayerList();

  // Do the following stuff when you change the value of the "Role" dropdown
  document.querySelector('select[name="role"]').addEventListener('change', function() {
    // Redraw graph based on selected role
    role = document.querySelector('select[name="role"]').value;
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);

    // Filter the "Player" dropdown to only contain players of the selected
    // role
    refreshPlayerList();
  });

  // Do the following stuff when you change the value of the "Player" dropdown
  document.querySelector('select[name="player"]').addEventListener('change', function() {
    // Redraw the graph to highlight the graph dots for the selected player
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  // Do the following stuff when you change the value of the "X Axis" dropdown
  document.querySelector('select[name="x-axis"]').addEventListener('change', function() {
    // Update the x-axis label
    svg.selectAll('g .x.axis .label').text(getLabel(document.querySelector('select[name="x-axis"]').value));

    // Redraw the graph
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  // Do the following stuff when you change the value of the "Y Axis" dropdown
  document.querySelector('select[name="y-axis"]').addEventListener('change', function() {
    // Update the y-axis label
    svg.selectAll('g .y.axis .label').text(getLabel(document.querySelector('select[name="y-axis"]').value));

    // Redraw the graph
    drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
  });

  // Draw the graph once the CSV file has been parsed
  drawGraph('CS', 'CS');
});

// Only return the players that are in the currently selected role
function getData() {
  return data.filter(function(item) {
    return item.Role == role;
  });
}

function drawGraph(xColumn, yColumn) {
  // Calculate the graph points we need to draw based on the "X / Y Axis"
  // dropdowns
  getX().domain(d3.extent(getData(), function(d) { return +d[xColumn]; })).nice();
  getY().domain(d3.extent(getData(), function(d) { return +d[yColumn]; })).nice();

  // Initialise the colours for each player
  color = d3.scale.category10();

  // Remove all the current graph points
  svg.selectAll('.dot').remove();

  // Rebuild all the graph points
  svg.selectAll(".dot")
    .data(getData())
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) { return getX()(d[xColumn]); })
    .attr("cy", function(d) { return getY()(d[yColumn]); })
    .style("fill", function(d) {
      // The only dot we want to have colour is the currently selected player
      // from the "Player" dropdown. Otherwise, colour the dot grey.
      if (document.querySelector('select[name="player"]').value == d.Player) {
        return color(d.Player);
      } else {
        color(d.Player);
        return '#ccc';
      }
    });

  // Draw the legend
  drawLegend();

  // Redraw the x-axis
  svg.selectAll('g .x.axis').call(getXAxis());

  // Redraw the y-axis
  svg.selectAll('g .y.axis').call(getYAxis());
}

// Draw the legend
function drawLegend() {
  // Remove the old legend
  svg.selectAll(".legend").remove();

  // Add the new legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        // Shift the legend 120px to the right
        return "translate(120," + i * 20 + ")";
      });

  // Add the little coloured boxes to the legend
  legend.append("rect")
    .attr("x", getWidth() - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  // Add the text beside each coloured box in the legend
  legend.append("text")
      .attr("x", getWidth() - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}

// Redraw the draph each time we resize the browser window (this is to achieve
// that responsive effect).
d3.select(window).on('resize', function() {
  drawGraph(document.querySelector('select[name="x-axis"]').value, document.querySelector('select[name="y-axis"]').value);
});