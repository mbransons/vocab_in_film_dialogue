// data source https://www.kaggle.com/sanjeetsinghnaik/top-1000-highest-grossing-movies/version/1
const apiKey = 'f7f9fe195f863c63a5e2f42428f3c16b';

// set margins, width/height
const margin = { left: 80, right: 100, top: 70, bottom: 50 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
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

// declare data variable to assign value after data call
let movies;

// use viewBox rather than x and y values so that a aspect ratio is set and the visualization can be responsively scaled
const svg = d3
  .select('#chart-area')
  .append('svg')
  .attr(
    'viewBox',
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  );

// Visualization
// offset a group based on margins so that height and width can be used when building scales
const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

//Scales
// Initially set ranges based on the visualization width/height
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLog().range([height, 0]).base(10);
const cat = d3
  .scaleOrdinal()
  .range([
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#ffff99',
    '#b15928',
  ])
  .domain(genre_cat_names);

// Labels
// Title top-center
const chartTitle = g
  .append('text')
  .attr('class', 'x axis-label title')
  .attr('x', width / 2)
  .attr('y', -30)
  .attr('font-size', '15px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Top Grossing Hollywood Films');

// X Axis bottom-center
const xLabel = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', height + 40)
  .attr('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Year');

// Y Axis label left-center-rotated
const yLabel = g
  .append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(height / 2))
  .attr('y', -60)
  .attr('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Gross');

//data key names
const sales = 'adjusted_gross';
const date = 'Release Date';
const title = 'Title';
const desc = 'Movie Info';
const length = 'Movie Runtime';
const genre = 'Genre';

//parsing tools
const formatTime = d3.timeFormat('%B %d, %Y');
const parseTime = d3.timeParse('%Y-%m-%d');
const parseYear = d3.timeParse('%Y');
const formatYear = d3.timeFormat('%Y');

//request to movie database to search for movie
function search(movie) {
  let movieTitle = movie.Title;
  let movieYear = formatYear(movie.Year);
  let page = 1;
  let search;
  function searchMovie(page) {
    return axios
      .get(
        `https://api.themoviedb.org/3/search/movie?api_key=f7f9fe195f863c63a5e2f42428f3c16b&language=en-US&query=${movieTitle}&page=${page}&include_adult=false`
      )
      .then((res) => res.data)
      .then((data) => {
        let movie = data.results.find((m) => {
          return movieYear == m.release_date.slice(0, 4);
        });
        if (!movie.id) {
          page = page + 1;
          search = searchMovie(page);
        }
        return movie;
      });
  }

  search = searchMovie(page);
  return search
    .then((movie) => {
      let id = movie.id;
      return axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=f7f9fe195f863c63a5e2f42428f3c16b&language=en-US`
      );
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error('Request failed', err);
    });
}

//ToolTip
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
            <td class="p-1 is-size-7">${d3
              .format('$,.3s')(d[sales])
              .replace(/G/, 'B')}</td>
          </tr>
        </tbody>
      </table>
        </div>
      </div>
    </article>
  </div>`;
    return div;
  });
g.call(tip);

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
    console.log(data);
    const promises = fetchMovies(data);
    console.log(promises);
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
      movie.count_per_hour =
        (movie['Word Counts'] * 60) / tmdb_movies[i].runtime;
      return movie;
    });
  })
  .then((movieData) => {
    movies = movieData;
    // set min/max values from data set
    const minDate = d3.min(movieData, (d) => d[date]);
    console.log(minDate);
    const maxDate = d3.max(movieData, (d) => d[date]);
    const minSales = d3.min(movieData, (d) => d[sales]);
    const maxSales = d3.max(movieData, (d) => d[sales]);

    // set domains to your scales
    x.domain([minDate / 0.95, maxDate * 1.05]);
    y.domain([minSales / 1.25, maxSales * 1.25]);

    // Axis generator
    // X Axis
    const xAxisCall = d3
      .axisBottom(x)
      .ticks(10)
      .tickFormat(d3.timeFormat('%Y'));
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisCall);

    //Y Axis
    const yAxisCall = d3
      .axisLeft(y)
      .ticks(10)
      .tickFormat((d) => d3.format('$,.3s')(d).replace(/G/, 'B'));
    g.append('g').attr('class', 'y axis').call(yAxisCall);

    // shade sales domains in chart background
    const salesRangeLow = g
      .append('rect')
      .attr('width', width)
      .attr('height', height - y(200000000))
      .attr('x', 0)
      .attr('y', y(200000000))
      .attr('fill', '#969696');

    const salesRangeMid = g
      .append('rect')
      .attr('width', width)
      .attr('height', y(200000000) - y(1000000000))
      .attr('x', 0)
      .attr('y', y(1000000000))
      .attr('fill', '#cccccc');

    const salesRangeHigh = g
      .append('rect')
      .attr('width', width)
      .attr('height', y(1000000000))
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#f7f7f7');

    // create els and attach data
    // background rectangles while awaiting poster image
    const posters = g.selectAll('.posters').data(movieData);
    const poster = posters.enter().append('g').attr('class', 'poster');

    poster
      .append('rect')
      .attr('width', '10')
      .attr('height', '15')
      .attr('x', (d) => x(d[date]))
      .attr('y', (d) => y(d[sales]))
      .attr('fill', (d) => cat(d.genres[0]))
      .attr('stroke', (d) => cat(d.genres[0]))
      .attr('stroke-width', '2px');

    poster
      .append('svg:image')
      .attr('xlink:href', (d) => d.posterURL)
      .attr('x', (d) => x(d[date]))
      .attr('y', (d) => y(d[sales]))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .attr('width', '10')
      .attr('height', '15');
    // const posterRects = g.selectAll('rect').data(movieData);
    // posterRects
    //   .enter()
    //   .append('rect')
    //   .attr('width', '10')
    //   .attr('height', '15')
    //   .attr('x', (d) => x(d[date]))
    //   .attr('y', (d) => y(d[sales]))
    //   .attr('class', 'poster')
    //   .attr('fill', (d) => cat(d.genres[0]))
    //   .attr('stroke', (d) => cat(d.genres[0]))
    //   .attr('stroke-width', '4px');

    // // poster images called from data and set to SVG
    // const images = g.selectAll('image').data(movieData);
    // images
    //   .enter()
    //   .append('svg:image')
    //   .attr('xlink:href', (d) => d.posterURL)
    //   .attr('x', (d) => x(d[date]))
    //   .attr('y', (d) => y(d[sales]))
    //   .attr('class', 'poster')
    //   .on('mouseover', tip.show)
    //   .on('mouseout', tip.hide)
    //   .attr('width', '10')
    //   .attr('height', '15');
    // return movieData;
  });

// Inflation API to allow option to adjust the gross values by inflation
// https://www.statbureau.org/en/inflation-api
// to be used for a future version
// const res = axios
//   .get(
//     'https://www.statbureau.org/calculate-inflation-price-jsonp?jsoncallback=?',
//     {
//       params: {
//         country: 'united-states',
//         start: parseTime('March 25, 1977'),
//         end: new Date(),
//         amount: 775000000,
//         format: true,
//       },
//     }
//   )
//   .then((res) => res.data)
//   .then((val) => val.slice(4, val.length - 2))
//   .then((val) => Number(val.replaceAll(' ', '')));
