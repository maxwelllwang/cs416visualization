// Initialize parameters
let currentState = "United States";
let currentYear = 1999
let data;

// Data loading and preprocessing
d3.csv("causes-of-death.csv").then((deathData) => {
  // Convert numerical columns to numbers
  deathData.forEach((d) => {
    d.Year = +d.Year;
    d.Deaths = +d.Deaths;
  });


  deathData.sort(function (a, b) {
    return a.Year - b.Year;
  });
  // Store data in the global variable for access across functions
  data = deathData;


  const states = Array.from(new Set(deathData.map((d) => d.State)));
  const statesSelect = d3.select("#state-select");
  statesSelect
    .selectAll("option")
    .data(states)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  // Create the initial chart
  updateScene3(currentState, currentYear);
});

var tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("background", "#fff")
  .style("padding", "10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "5px")
  .style("pointer-events", "none")
  .text("a simple tooltip");

// Function to update scene based on selected year
function updateScene3(state, year) {
  currentState = state;
  currentYear = year;
  var filteredData = data.filter(function (d) {
    return d.State === state && d.Year === year && d.Cause !== 'All causes';
  })



  // Remove previous chart content
  d3.select("#chart3").html("");

  
  // Compute pie layout
  // Convert your data to the format needed by d3.pie()
  var pieData = filteredData.map(function (d) {
    return {
      Cause: d.Cause,
      Deaths: d.Deaths
    };
  });

  // Set up chart dimensions
  var width = 500;
  var height = 500;
  var radius = Math.min(width, height) / 2;

  // Create an ordinal color scale with 11 distinct colors
  var color = d3.scaleOrdinal(d3.schemeCategory10.concat(["#8c564b"])); // d3.schemeCategory10 provides 10 colors. We add an extra color for the 11th category.

  // Create the pie layout function
  var pie = d3.pie()
    .value(function (d) { return d.Deaths; });

  // Create the arc function
  var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  // Append the SVG
  var svg = d3.select("#chart3").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Compute the pie slices
  var g = svg.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");

  // Draw the pie slices
  g.append("path")
    .attr("d", arc)
    .style("fill", function (d) { return color(d.data.Cause); });

    g.append("text")
    .attr("transform", function(d) { 
        var _d = arc.centroid(d);
        _d[0] *= 1.5;	//multiply by a constant factor
        _d[1] *= 1.5;	//multiply by a constant factor
        return "translate(" + _d + ")"; 
    })
    .attr("dy", ".50em")
    .style("text-anchor", "middle")
    .text(function(d) { return d.data.Cause; });




  const stateSelect = d3.select("#state-select");
  stateSelect.on("change", () => {
    const selectedState = stateSelect.property("value");

    updateScene3(selectedState, currentYear);
  });

  const yearSlider = document.getElementById('year-slider');
  const yearDisplay = document.getElementById('year-display');

  // Display the default slider value
  yearDisplay.innerHTML = yearSlider.value;

  // Update the current slider value (each time you drag the slider handle)
  yearSlider.oninput = function () {
    yearDisplay.innerHTML = this.value;
    // Call the function to update your chart here, for example:
    updateScene3(currentState, +this.value);
  }



}
