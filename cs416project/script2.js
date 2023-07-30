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


  deathData.sort(function (a, b) {
    return a.Year - b.Year;
  });
  // Store data in the global variable for access across functions
  data = deathData;


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
  updateScene2(currentState);
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
function updateScene2(state) {
  currentState = state;
  const filteredData = data.filter((d) => d.State === state);
  console.log(filteredData)

  const totalDeathsByYear = new Map(
    filteredData
      .filter((d) => d.Cause === 'All causes')
      .map((d) => [d.Year, d.Deaths])
  );
  console.log(totalDeathsByYear)

  // Divide the deaths for each cause by the total deaths
  filteredData.forEach((d) => {
    d.DeathsNormalized = d.Deaths / totalDeathsByYear.get(d.Year);
  });
  console.log(filteredData)

  noAllCausesfilteredData = filteredData.filter((d) => d.Cause !== 'All causes')

  // Set up chart dimensions
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Remove previous chart content
  d3.select("#chart2").html("");

  // Set up a color scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const causes = Array.from(new Set(noAllCausesfilteredData.map((d) => d.Cause)));
  colorScale.domain(causes);

  // Append SVG and group, and apply transformations
  var svg = d3.select("#chart2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleBand()
    .range([0, width]);
  var yScale = d3.scaleLinear().range([height, 0]);
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Set the domain of your scales
  xScale.domain(noAllCausesfilteredData.map(function (d) { return d.Year; }));
  yScale.domain([0, d3.max(noAllCausesfilteredData, function (d) { return d.DeathsNormalized; })]);

  // Define the line
  var line = d3.line()
    .x(function (d) { return xScale(d.Year); })
    .y(function (d) { return yScale(d.DeathsNormalized); });




  // Group the data by cause, and create a new line for each
  const dataByCause = d3.group(noAllCausesfilteredData, d => d.Cause);
  dataByCause.forEach((value, key) => {
    svg.append("path")
      .datum(value)
      .attr("fill", "none")
      .attr("stroke", colorScale(key))
      .attr("stroke-width", 1.5)
      .attr("d", line)
      .on("mouseover", function (d) {
        // On mouseover, show the tooltip and set its text to the cause of death
        tooltip.text(key);
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function (event, d) {
        const [x, y] = d3.pointer(event);
        return tooltip
          .style("left", (x + 10) + "px") // slight offset to the right
          .style("top", (y + 200) + "px"); // slight offset to the top
      })
      .on("mouseout", function (d) {
        // On mouseout, hide the tooltip
        return tooltip.style("visibility", "hidden");
      });
  });


  // Add the X Axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  const stateSelect = d3.select("#state-select");
  stateSelect.on("change", () => {
    const selectedState = stateSelect.property("value");
    updateScene2(selectedState);
  });


  var leadingCause = d3.max(noAllCausesfilteredData, function (d) { return d.Deaths; });

  // Find the corresponding data entries
  var leadingCauseData = filteredData.find(d => d.Deaths === leadingCause);
  console.log(leadingCauseData)


  const annotations = [
    {
      note: {
        title: "Leading cause of death",
        label: `${leadingCauseData.Cause} with ${leadingCauseData.Deaths} deaths in ${leadingCauseData.Year}`,
      },
      x: xScale(leadingCauseData.Year),
      y: yScale(leadingCauseData.DeathsNormalized),
      dy: 100,
      dx: 100,
    }
  ];

  const makeAnnotations = d3.annotation()
    .annotations(annotations)
    .type(d3.annotationLabel);

  svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);

}
