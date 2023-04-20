// Define width and height of the globe visualization
let width = d3
    .select("#climate-prediction")
    .node()
    .getBoundingClientRect().width;
let height = 900;

let margin = {
    top: 30,
    bottom: 60,
    right: 30,
    left: 30,
};

// Define the html sections used
let svg = d3
    .select("#climate-prediction")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
let countries = svg.append("g").attr("id", "countries");
let cities = svg.append("g").attr("id", "cities");
let line_graph = d3
    .select("#graphs")
    .append("svg")
    .attr('id', 'line_graph_svg')
    .attr("width", width)
    .attr("height", height);

//Button to go to visualization for graphs
const toTop = () => {
    d3.select('#line_graph_svg').selectAll('*').remove();
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};
d3.select("#worldmapbutton").on("click", toTop);

// Map for the world coordinates
let projection = d3
    .geoOrthographic()
    .scale(400)
    .translate([width / 2, height / 2]);
let path = d3.geoPath().projection(projection);

// Time format
const parse_date = d3.timeParse("%Y-%m-%d");
const format_date = d3.timeFormat("%Y-%m");

// Constants for the roations and zoom
const initialScale = projection.scale();
const sensitivity = 90;
const base_value = 3448 / 2;
const default_radius = 0.25;
const min_year = 1900;
const max_year = 2127;

let processing = false;

// Load Data
const city_data = d3.json("./cities.json");
const world_data = d3.json("./world_countries.json");

// Load world data
Promise.all([world_data, city_data]).then((values) => {
    // Grab world data
    const w = values[0];
    // Create geocircles for cities
    const c = values[1].map((d) => {
        let circle = d3
            .geoCircle()
            .center([d[3], d[2]])
            .radius(default_radius)();
        circle.city = d[0];
        circle.country = d[1];
        circle.lat = d[2];
        circle.lng = d[3];
        return circle;
    });

    // Line Graph info
    const draw_line_graph = (x, y) => {
        // console.log(x);
        // console.log(y);

        let x_scale = d3
            .scaleTime()
            .range([margin.left, width - margin.right])
            .domain(d3.extent(x));

        let min_ = d3.min(y);

        if (min_ > 0) {
            min_ = 0;
        }

        let y_scale = d3
            .scaleLinear()
            .range([height - margin.bottom, margin.top])
            .domain([min_, d3.max(y)]);

        line_graph
            .append("g")
            .attr(
                "transform",
                "translate(" + 0 + " ," + (height - margin.bottom) + ")"
            )
            .call(d3.axisBottom().scale(x_scale).tickFormat(format_date));

        line_graph
            .append("g")
            .attr("transform", "translate(" + margin.left + " ," + 0 + ")")
            .call(d3.axisLeft(y_scale));

        const data = [];
        x.map((d, i) => {
            data.push({ time: d, temp: y[i] });
        });

        let line = d3
            .line()
            .x((d) => {
                return x_scale(d.time);
            })
            .y((d) => {
                return y_scale(d.temp);
            });

        line_graph
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);
    };

    const to_graphs = () => {
        window.scrollTo(0, document.body.scrollHeight);
    };

    const get_city_temperatures = (
        start_year,
        end_year,
        city_name,
        country_name
    ) => {
        let promises = [];
        curr_year = start_year;
        while (curr_year <= end_year) {
            file = "../data/data_" + curr_year + ".csv";
            let p = d3.csv(file);
            promises.push(p);
            curr_year++;
        }

        Promise.all(promises).then((values) => {
            const times = [];
            const temperatures = [];
            values.forEach((year) => {
                year.forEach((row) => {
                    if (row.City === city_name) {
                        parsed_date = parse_date(row.dt);
                        times.push(parsed_date);
                        temperatures.push(+row.AverageTemperature);
                    }
                });
            });

            draw_line_graph(times, temperatures, city_name, country_name);
            to_graphs();
            processing = false;
        });
    };

    // Draw cities
    const draw_cities = (city_circles) => {
        cities
            .selectAll("path")
            .data(city_circles)
            .enter()
            .append("path")
            .attr("d", path)
            .on("click", (d) => {
                if (processing) {
                    return; // City was already clicked
                }
                processing = true;
                d3.select('#line_graph_svg').selectAll('*').remove();
                get_city_temperatures(1990, 2030, d.city, d.country);
            });
    };

    // Redraw circles based on slider value
    d3.select("#nCity")
        .attr("width", width)
        .on("input", function () {
            let new_order = d3.shuffle(c.slice()).slice(0, this.value);
            cities.selectAll("path").remove();
            draw_cities(new_order);
        });

    // Draw all the cities
    draw_cities(c);

    // Draw country borders
    countries
        .selectAll("path")
        .data(w.features)
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
            cities.selectAll("path").attr("d", path);
        })
    ).call(
        d3.zoom().on("zoom", () => {
            if (d3.event.transform.k > 0.3) {
                projection.scale(initialScale * d3.event.transform.k);
                path = d3.geoPath().projection(projection);
                countries.selectAll("path").attr("d", path);
                globe.attr("r", projection.scale());
                cities.selectAll("path").attr("d", path);
            } else {
                d3.event.transform.k = 0.3;
            }
        })
    );
});
