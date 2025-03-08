// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_Line = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...
let parseDate = d3.timeParse("%m/%d/%Y");

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {

    // 2.b: ... AND TRANSFORM DATA
    data.forEach(d => {
        d.newDate = new Date(d.date);
        d.temperature = +d.actual_mean_temp;

    });
    console.log(data);
    console.log(
        "newDate:",
        typeof data[0]["newDate"]
    );

    const filteredData = data;
    const groupedData1 = d3.groups(filteredData, d => d.city, d => d.newDate)
        .map(([city, newDates]) => ({
            city,
            values: newDates.map(([newDate, entries]) => ({
                newDate,
                theTempurature: d3.mean(entries, e => e.temperature) // Aggregating data
            }))
        }));

    const flattenedData = groupedData1.flatMap(({ city, values }) =>
        values.map(({ newDate, theTempurature }) => ({
            newDate,
            theTempurature,
            city
        }))
    );
    ;
    console.log(flattenedData);
    // console.log(typeof data[0].date);
    // 3.a: SET SCALES FOR CHART 1
    // X SCALE
    let xNewDate = d3.scaleTime()
        .domain(d3.extent(flattenedData, d => d.newDate))
        .range([0, width]);

    // Y SCALE
    let yTheTemperature = d3.scaleLinear()
        .domain([0, d3.max(flattenedData, d => d.theTempurature)])
        .range([height, 0]);

    // 4.a: PLOT DATA FOR CHART 1
    const colorScale = d3.scaleOrdinal()
        .domain(flattenedData.map(d => d.city))
        .range(d3.schemeCategory10);

    const line = d3.line()
        .x(d => xNewDate(d.newDate))
        .y(d => yTheTemperature(d.theTempurature))



    const cityData = d3.groups(flattenedData, d => d.city);
    console.log(cityData);
    svg1_Line.selectAll("path")
        .data(cityData)
        .enter()
        .append("path")
        .style("stroke", d => colorScale(d[0]))
        .style("fill", "none")
        .style("stroke-width", 2)
        .attr("d", d => {
            const city = d[0];
            const values = d[1];

            return line(values);
        });



    // 5.a: ADD AXES FOR CHART 1
    svg1_Line.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xNewDate));


    svg1_Line.append("g")
        .call(d3.axisLeft(yTheTemperature));

    // 6.a: ADD LABELS FOR CHART 1

    svg1_Line.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    svg1_Line.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Tempurature");

    const legend = svg1_Line.selectAll(".legend")
        .data(cityData.map(d => d[0]))
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 120}, ${i * 20 + 170})`)



    legend.append("rect")
        .attr("x", 10)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .text(d => d);

    // 7.a: ADD INTERACTIVITY FOR CHART 1
    function updateChart(selectedCategory) {
        // Filter the data based on the selected category
        var selectedCategoryData = flattenedData.filter(function (d) {
            return d.city === selectedCategory;
        });
    
        // Remove existing lines
        svg1_Line.selectAll("path").remove();
    
        // Redraw lines
        svg1_Line.append("path")
            .datum(selectedCategoryData)
            .attr("class", "city-line")
            .attr("fill", "none")
            .attr("stroke", colorScale(selectedCategory))
            .attr("stroke-width", 2)
            .attr("d", line);
    }
    
    // updateChart("Chicago");
    // Event listener for when the dropdown selection changes
    d3.select("#categorySelect").on("change", function () {
        var selectedCategory = d3.select(this).property("value");
        updateChart(selectedCategory); 
    });







});