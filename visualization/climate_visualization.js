// Define width and height of the globe visualization
let width = d3
    .select("#climate-prediction")
    .node()
    .getBoundingClientRect().width;
let height = 1000;

// Define the html sections used
let svg = d3
    .select("#climate-prediction")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
let countries = svg.append("g").attr("id", "countries");
let cities = svg.append("g").attr("id", "cities");

// Map for the world coordinates
let projection = d3
    .geoOrthographic()
    .scale(250)
    .translate([width / 2, height / 2]);
let path = d3.geoPath().projection(projection);

// Constants for the roations and zoom
const initialScale = projection.scale();
const sensitivity = 90;

// Load Data
const city_data = d3.json("./cities.json");
const world_data = d3.json("./world_countries.json");

Promise.all([world_data, city_data]).then((values) => {

    // Draw cities
    cities
        .selectAll("path")
        .data(values[1])
        .enter()
        .append("path")
        .attr("d", (city) => {
            let c = d3.geoCircle().center(city[2], city[3]).radius(0.5);
            return path(c());
        });

    // Draw country borders
    countries
        .selectAll("path")
        .data(values[0].features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", 0.4)
        .style("opacity", 0.8);

    // Draw Circle around the globe to give border
    let globe = svg
        .append("circle")
        .attr("fill", "#EEE")
        .attr("stroke", "#000")
        .attr("stroke-width", "0.2")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", initialScale)
        .lower();
    
    // Methods for pan and zoom
    svg.call(
        d3.drag().on("drag", () => {
            const rotate = projection.rotate();
            const k = sensitivity / projection.scale();
            projection.rotate([
                rotate[0] + d3.event.dx * k,
                rotate[1] - d3.event.dy * k,
            ]);
            path = d3.geoPath().projection(projection);
            countries.selectAll("path").attr("d", path);
        })
    ).call(
        d3.zoom().on("zoom", () => {
            if (d3.event.transform.k > 0.3) {
                projection.scale(initialScale * d3.event.transform.k);
                path = d3.geoPath().projection(projection);
                countries.selectAll("path").attr("d", path);
                globe.attr("r", projection.scale());
            } else {
                d3.event.transform.k = 0.3;
            }
        })
    );
});
