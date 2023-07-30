// Scene 1: Overview of Movie Ratings by Genre and Release Year
// Initialize parameters
let currentState = "United States";
let data;

// Data loading and preprocessing
d3.csv("causes-of-death.csv").then((deathData) => {
  // Convert numerical columns to numbers
  deathData.forEach((d) => {
    d.Year = +d.Year;
    d.Deaths = +d.Deaths;
  });


  // Group and sum data by year
  var sumData = Array.from(d3.rollup(deathData,
    v => d3.sum(v, leaf => leaf.Deaths),
    d => d.State, d => d.Year
  ), (([state, yearMap]) => Array.from(yearMap, ([year, deaths]) => ({ State: state, Year: year, Deaths: deaths }))))
    .flat();


  // Store data in the global variable for access across functions
  console.log(sumData)
  var allcause = deathData.filter(d => d.Cause === "All causes");;

  allcause.sort(function (a, b) {
    return a.Year - b.Year;
  });
  data = allcause

  const states = Array.from(new Set(deathData.map((d) => d.State)));
  console.log(states)
  const statesSelect = d3.select("#state-select");
  statesSelect
    .selectAll("option")
    .data(states)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  // Create the initial chart
  updateScene1(currentState);
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
function updateScene1(state) {
  currentState = state;
  const filteredData = data.filter((d) => d.State === state);
  console.log(filteredData)

  // Set up chart dimensions
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Remove previous chart content
  d3.select("#chart1").html("");


  // Append SVG and group, and apply transformations
  var svg = d3.select("#chart1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleBand()
    .range([0, width]); // output 
  var yScale = d3.scaleLinear().range([height, 0]);
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);



  // Load your CSV file
  // Set the domain of your scales
  xScale.domain(filteredData.map(function (d) { return d.Year; })); // define domain for x with discrete values
  yScale.domain([d3.min(filteredData, function (d) { return d.Deaths; }), d3.max(filteredData, function (d) { return d.Deaths; }) + 1]);
  // console.log(filteredData.map(d => yScale(d.Deaths)));
  // console.log(yScale.domain());
  // filteredData.pop()
  console.log(filteredData.map(d => [xScale(d.Year), yScale(d.Deaths)]));

  // Define the line
  var line = d3.line()
    .x(function (d) { return xScale(d.Year); })
    .y(function (d) { return yScale(d.Deaths); });

  // Add the line path.
  svg.append("path")
    .data([filteredData])
    .attr("class", "line")
    .attr("d", line)


  svg.selectAll(".dot")
    .data(filteredData)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", function (d) { return xScale(d.Year); })
    .attr("cy", function (d) { return yScale(d.Deaths); })
    .attr("r", 3)
    .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible")
        .text(`Year: ${d.Year}, Deaths: ${d.Deaths}`);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
    });



  // Find the data points with the min and max deaths
  var minDeathsData = d3.min(filteredData, function (d) { return d.Deaths; });
  var maxDeathsData = d3.max(filteredData, function (d) { return d.Deaths; });

  // Find the corresponding data entries
  var minDeathsEntry = filteredData.find(d => d.Deaths === minDeathsData);
  var maxDeathsEntry = filteredData.find(d => d.Deaths === maxDeathsData);

  // Create annotations
  var annotations = [
    {
      type: d3.annotationLabel,
      note: {
        title: "Min deaths: " + minDeathsEntry.Deaths,
        label: "Year: " + minDeathsEntry.Year,
        wrap: 190
      },
      x: xScale(minDeathsEntry.Year),
      y: yScale(minDeathsEntry.Deaths),
      dy: -30,
      dx: 0
    },
    {
      type: d3.annotationLabel,
      note: {
        title: "Max deaths: " + maxDeathsEntry.Deaths,
        label: "Year: " + maxDeathsEntry.Year,
        wrap: 190
      },
      x: xScale(maxDeathsEntry.Year),
      y: yScale(maxDeathsEntry.Deaths),
      dy: 0,
      dx: -60
    }
  ];

  // Add annotation to the chart
  var makeAnnotations = d3.annotation()
    .annotations(annotations);

  svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);
  // Add the X Axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  // ... other code ..


  const stateSelect = d3.select("#state-select");
  stateSelect.on("change", () => {
    const selectedState = stateSelect.property("value");
    updateScene1(selectedState);
  });
}
