let height = 700;
let width = 1300;
let margin = { top: 0, right: 40, bottom: 34, left: 40 };

const genre_cat = [
  {
    id: 28,
    name: 'Action',
  },
  {
    id: 12,
    name: 'Adventure',
  },
  {
    id: 16,
    name: 'Animation',
  },
  {
    id: 35,
    name: 'Comedy',
  },
  {
    id: 80,
    name: 'Crime',
  },
  {
    id: 99,
    name: 'Documentary',
  },
  {
    id: 18,
    name: 'Drama',
  },
  {
    id: 10751,
    name: 'Family',
  },
  {
    id: 14,
    name: 'Fantasy',
  },
  {
    id: 36,
    name: 'History',
  },
  {
    id: 27,
    name: 'Horror',
  },
  {
    id: 10402,
    name: 'Music',
  },
  {
    id: 9648,
    name: 'Mystery',
  },
  {
    id: 10749,
    name: 'Romance',
  },
  {
    id: 878,
    name: 'Science Fiction',
  },
  {
    id: 10770,
    name: 'TV Movie',
  },
  {
    id: 53,
    name: 'Thriller',
  },
  {
    id: 10752,
    name: 'War',
  },
  {
    id: 37,
    name: 'Western',
  },
];
const genre_cat_names = genre_cat.map((g) => g.name);

const color_hexs =
  '#EF9A9A #B71C1C #CE93D8 #4A148C #9FA8DA #283593 #81D4FA #0277BD #80CBC4 #00695C #C5E1A5 #558B2F #FFF59D #F9A825 #FFCC80 #E65100 #5D4037 #757575 #FFAB91';
const color_hex_arr = color_hexs.split(' ');

// declare data variable to assign value after data call
let movies, decade;

function buildGenreCheckboxes(arr) {
  let genresCheckDiv = document.querySelector('.checkboxes-list');
  arr.forEach((g, i) => {
    let genre = document.createElement('div');
    genre.classList.add('field', 'my-0', 'mx-1');
    genre.innerHTML = `<input class="is-checkradio has-background-color is-dark is-small" id=${g}
    value=${g} type="checkbox" name=${g} checked="checked">
<label for=${g} class="p-0 is-flex is-align-items-center"><span
        class="ml-4 pl-1">${g}</span><span id="${g}Color"
        class="check-dot is-size-7 material-symbols-rounded ml-1" style="color: ${color_hex_arr[i]};">
        circle
    </span></label>`;
    genresCheckDiv.appendChild(genre);
  });
}

// build checkboxes
` <span style="position:relative; top: 3px">Toggle Continents:&nbsp;&nbsp;</span>
<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
    <input type="checkbox" value="africa" class="mdl-checkbox__input continent" checked="">Africa
    <span class="mdl-checkbox__label" id="africaColor"
        style="font-size: 20px; color: #1976D2;">&#9679;&nbsp;&nbsp;</span>
</label>`;

`<div class="field my-0 mx-1">
<input class="is-checkradio has-background-color is-dark is-small" id="Comedy"
    value="Comedy" type="checkbox" name="Comedy" checked="checked">
<label for="Comedy" class="p-0 is-flex is-align-items-center"><span
        class="ml-4 pl-1">Comedy</span><span id="comedyColor"
        class="check-dot is-size-7 material-symbols-rounded ml-1">
        circle
    </span></label>
</div>`;

//data key names
const sales = 'adjusted_gross';
const date = 'Release Date';
const title = 'Title';
const desc = 'Movie Info';
const length = 'Movie Runtime';
const genre = 'Genre';
const wordTotal = 'Word Counts';

//parsing tools
const formatTime = d3.timeFormat('%B %d, %Y');
const parseTime = d3.timeParse('%Y-%m-%d');
const parseYear = d3.timeParse('%Y');
const formatYear = d3.timeFormat('%Y');

// Data structure describing chart scales
let Scales = {
  lin: 'scaleLinear',
  log: 'scaleLog',
};

// Data structure describing volume of displayed data
let Count = {
  total: 'word_counts',
  perCap: 'count_per_hour',
};

// Data structure describing legend fields value
let Legend = {
  total: 'Total Words',
  perCap: 'Words per Hour',
};

let chartState = {};

chartState.measure = Count.total;
chartState.scale = Scales.lin;
chartState.legend = Legend.total;

//Colors used for poster rect depending on genre
const cat = d3.scaleOrdinal().range(color_hex_arr).domain(genre_cat_names);

// Colors used for circles depending on continent
let colors = d3
  .scaleOrdinal()
  .domain([
    'asia',
    'africa',
    'northAmerica',
    'europe',
    'southAmerica',
    'oceania',
  ])
  .range(['#D81B60', '#1976D2', '#388E3C', '#FBC02D', '#E64A19', '#455A64']);

d3.select('#asiaColor').style('color', colors('asia'));
d3.select('#africaColor').style('color', colors('africa'));
d3.select('#northAmericaColor').style('color', colors('northAmerica'));
d3.select('#southAmericaColor').style('color', colors('southAmerica'));
d3.select('#europeColor').style('color', colors('europe'));
d3.select('#oceaniaColor').style('color', colors('oceania'));

let svg = d3
  .select('#svganchor')
  .append('svg')
  .attr('viewBox', [0, 0, width, height]);
// .attr('width', width)
// .attr('height', height);

let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);

svg
  .append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,' + (height - margin.bottom) + ')');

// Create line that connects circle and X axis
let xLine = svg
  .append('line')
  .attr('stroke', 'rgb(96,125,139)')
  .attr('stroke-dasharray', '1,2');

// ToolTip;
const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .html((event, d) => {
    let div = `<div class="box box--tip p-3">
    <article class="columns is-gapless is-mobile">
      <div class="column is-4 mr-2">
        <figure class="image">
        <img src=${d.posterURL}>
        </figure>
      </div>
      <div class="column is-8">
        <div class="content">
        <table>
        <tbody>
          <tr>
            <td class="p-1 has-text-weight-semibold is-uppercase is-size-7">${
              d.name
            }
            </td>
          </tr>
          <tr>
            <td class="p-1 is-size-7">${formatTime(d[date])} </td>
          </tr>
          <tr>
            <td class="p-1 is-size-7">${d3.format('~s')(
              d[chartState.measure]
            )} ${chartState.legend}</td>
          </tr>
        </tbody>
      </table>
        </div>
      </div>
    </article>
  </div>`;
    return div;
  });
svg.call(tip);

//request to movie database to search for movie
function search(movie) {
  let movieTitle = movie.Title;
  let movieYear = formatYear(movie.Year);
  return axios
    .get(
      `https://api.themoviedb.org/3/search/movie?api_key=f7f9fe195f863c63a5e2f42428f3c16b&language=en-US&query=${movieTitle}&page=1&include_adult=false`
    )
    .then((res) => res.data)
    .then((data) => {
      let movie = data.results.find((m) => {
        return movieYear == m.release_date.slice(0, 4);
      });
      return movie;
    })
    .then((movie) => {
      return axios.get(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=f7f9fe195f863c63a5e2f42428f3c16b&language=en-US`
      );
    })
    .then((res) => {
      return res.data;
    });
}

//async collection of movie searches
async function fetchMovies(data) {
  const promises = data.map((movie) => search(movie));
  return await Promise.all(promises);
}

// call data
const dataCall = d3
  .json('../data/final_movies_combined_adjusted.json', d3.autoType)
  .then((data) => {
    data.forEach((movie) => {
      movie['Year'] = parseYear(movie['Year']);
    });

    return data;
  })
  .then((data) => {
    const promises = fetchMovies(data);
    return Promise.all([data, promises]);
  })
  .then(([movies, tmdb_movies]) => {
    // set posterURL from the promise value to the returned value
    return movies.map((movie, i) => {
      movie.posterURL = !tmdb_movies[i].poster_path
        ? 'img/no-poster-movie.png'
        : `https://image.tmdb.org/t/p/w92${tmdb_movies[i].poster_path}`;
      movie[date] = parseTime(tmdb_movies[i].release_date);
      movie.revenue = tmdb_movies[i].revenue;
      movie.runtime = tmdb_movies[i].runtime;
      movie.genres = tmdb_movies[i].genres.map((g) => g.name);
      movie.tmdb_id = tmdb_movies[i].id;
      movie.imdb_id = tmdb_movies[i].imdb_id;
      movie.name = tmdb_movies[i].original_title;
      movie.count_per_hour = Math.round(
        (movie['Word Counts'] * 60) / tmdb_movies[i].runtime
      );
      movie.word_counts = movie['Word Counts'];
      return movie;
    });
  })
  .then((movieData) => {
    // dataSet = data
    //Decoade Select
    const decadeSelect = d3.select('.decade').on('change', redraw);
    // set min/max values from data set
    // Set chart domain max value to the highest total value in data set
    xScale.domain(
      d3.extent(movieData, function (d) {
        return +d[wordTotal];
      })
    );

    redraw();

    // Listen to click on "total" and "per capita" buttons and trigger redraw when they are clicked
    d3.selectAll('.measure').on('click', function () {
      let thisClicked = this.value;
      chartState.measure = thisClicked;
      if (thisClicked === Count.total) {
        chartState.legend = Legend.total;
      }
      if (thisClicked === Count.perCap) {
        chartState.legend = Legend.perCap;
      }
      redraw();
    });

    function redraw() {
      // Set decade
      decade = Number(decadeSelect.node().value.slice(0, 4));
      let startYear = parseYear(decade);
      let finishYear = parseYear(decade + 10);
      movies = movieData.filter((m) => {
        return m[date] > startYear && m[date] < finishYear;
      });
      // Set scale type based on button clicked
      if (chartState.scale === Scales.lin) {
        xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
      }

      if (chartState.scale === Scales.log) {
        xScale = d3.scaleLog().range([margin.left, width - margin.right]);
      }

      // sets domain as total or per capita
      xScale.domain(
        d3.extent(movies, function (d) {
          return +d[chartState.measure];
        })
      );

      let xAxis;
      // Set X axis based on new scale. If chart is set to "per capita" use numbers with one decimal point
      if (chartState.measure === Count.perCap) {
        xAxis = d3.axisBottom(xScale).ticks(10, '3f').tickSizeOuter(0);
      } else {
        xAxis = d3.axisBottom(xScale).ticks(10, '3f').tickSizeOuter(0);
      }

      d3.transition(svg)
        .select('.x.axis')
        .transition()
        .duration(1000)
        .call(xAxis);

      // Create simulation with specified dataset
      let simulation = d3
        .forceSimulation(movies)
        // Apply positioning force to push nodes towards desired position along X axis
        .force(
          'x',
          d3
            .forceX(function (d) {
              // Mapping of values from total/perCapita column of dataset to range of SVG chart (<margin.left, margin.right>)
              return xScale(+d[chartState.measure]); // This is the desired position
            })
            .strength(2)
        ) // Increase velocity
        .force('y', d3.forceY(height / 2 - margin.bottom / 2)) // // Apply positioning force to push nodes towards center along Y axis
        .force('collide', d3.forceCollide(25)) // Apply collision force with radius of 9 - keeps nodes centers 9 pixels apart
        .stop(); // Stop simulation from starting automatically

      // Manually run simulation
      for (let i = 0; i < movies.length; ++i) {
        simulation.tick(10);
      }

      // create els and attach data
      // background rectangles while awaiting poster image
      let posters = svg.selectAll('.poster').data(movies, function (d) {
        return d.name;
      });

      posters
        .exit()
        .transition()
        .duration(1000)
        .attr('transform', `translate(0, ${height / 2 - margin.bottom / 2})`)
        .remove();

      let postersEnter = posters
        .enter()
        .append('g')
        .attr('class', 'poster')
        .attr('transform', `translate(0, ${height / 2 - margin.bottom / 2})`);

      postersEnter
        .append('rect')
        .attr('width', '20')
        .attr('height', '30')
        .attr('fill', (d) => cat(d.genres[0]))
        .attr('stroke', (d) => cat(d.genres[0]))
        .attr('stroke-width', '6px');

      postersEnter
        .append('svg:image')
        .attr('xlink:href', (d) => d.posterURL)
        .attr('width', '20')
        .attr('height', '30')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      posters = postersEnter.merge(posters);

      posters
        .transition()
        .duration(2000)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    }
  });

// Load and process data
// d3.csv('../data/who_suicide_stats.csv')
//   .then(function (data) {
//     let dataSet = data;

//     // Set chart domain max value to the highest total value in data set
//     xScale.domain(
//       d3.extent(data, function (d) {
//         return +d.total;
//       })
//     );

//     redraw();

//     // Listen to click on "total" and "per capita" buttons and trigger redraw when they are clicked
//     d3.selectAll('.measure').on('click', function () {
//       let thisClicked = this.value;
//       chartState.measure = thisClicked;
//       if (thisClicked === Count.total) {
//         chartState.legend = Legend.total;
//       }
//       if (thisClicked === Count.perCap) {
//         chartState.legend = Legend.perCap;
//       }
//       redraw();
//     });

//     // Listen to click on "scale" buttons and trigger redraw when they are clicked
//     d3.selectAll('.scale').on('click', function () {
//       chartState.scale = this.value;
//       redraw(chartState.measure);
//     });

//     // Trigger filter function whenever checkbox is ticked/unticked
//     d3.selectAll('input').on('change', filter);

//     function redraw() {
//       // Set scale type based on button clicked
//       if (chartState.scale === Scales.lin) {
//         xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
//       }

//       if (chartState.scale === Scales.log) {
//         xScale = d3.scaleLog().range([margin.left, width - margin.right]);
//       }

//       // sets domain as total or per capita
//       xScale.domain(
//         d3.extent(dataSet, function (d) {
//           return +d[chartState.measure];
//         })
//       );

//     // Filter data based on which checkboxes are ticked
//     function filter() {
//       function getCheckedBoxes(checkboxName) {
//         let checkboxes = d3.selectAll(checkboxName).nodes();
//         let checkboxesChecked = [];
//         for (let i = 0; i < checkboxes.length; i++) {
//           if (checkboxes[i].checked) {
//             checkboxesChecked.push(checkboxes[i].defaultValue);
//           }
//         }
//         return checkboxesChecked.length > 0 ? checkboxesChecked : null;
//       }

//       let checkedBoxes = getCheckedBoxes('.continent');

//       let newData = [];

//       if (checkedBoxes == null) {
//         dataSet = newData;
//         redraw();
//         return;
//       }

//       for (let i = 0; i < checkedBoxes.length; i++) {
//         let newArray = data.filter(function (d) {
//           return d.continent === checkedBoxes[i];
//         });
//         Array.prototype.push.apply(newData, newArray);
//       }

//       dataSet = newData;
//       redraw();
//     }
//   })
//   .catch(function (error) {
//     if (error) throw error;
//   });
