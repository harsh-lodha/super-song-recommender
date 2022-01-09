const BASE_URL = "https://api.spotify.com/v1"

// uses Spotify's Search API to search tracks by track name and artist
const searchArtists = (http, { artist }) => {
  const config = {
    method: 'get',
    url: `${BASE_URL}/search?q=artist:${artist}&type=artist`,
  };  

  return http(config)
    .then((res) => res.data)
}

/// uses Spotify's Search API to search tracks by track name and artist
const getRecommendations = (http, { artists }) => {
  const commaSeparatedArtists = artists.join(",")
  
  const config = {
    method: 'get',
    url: `${BASE_URL}/recommendations?seed_artists=${commaSeparatedArtists}`,
  };

  return http(config)
    .then((res) => res.data);
}

module.exports = { searchArtists, getRecommendations }