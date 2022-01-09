// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/) and axios (https://www.npmjs.com/package/axios)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("./spotify/auth");
const { searchArtists, getRecommendations } = require("./spotify/actions");

const BASE_URL = "https://api.spotify.com/v1"


const app = express(); // initialize an express instance called 'app' 

// Log an error message if any of the secret values needed for this app are missing
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.error("ERROR: Missing one or more critical Spotify environment variables. Check .env file");
}

app.use(express.json()); // set up the app to parse JSON request bodies

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// return the public/index.html file when a GET request is made to the root path "/"
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/recommendations", async (req, res) => {
  if(!req.body) {
    return res.status(400).send({ message: "Bad Request - must send a JSON body with track and artist" })
  }
  
  const { artist1, artist2, artist3 } = req.body
  
  if(!artist1 || !artist2 || !artist3) {
    return res.status(400).send({ message: "Bad Request - must pass all 3 artists" })
  }
  
  // 1. Get access token
  let accessToken
  try {
    accessToken = await getAccessToken()
  } catch(err) {
    console.error(err.message)
    return res.status(500).send({ message: "Something went wrong when fetching access token" })
  }
  
  // Create an instance of axios to apply access token to all request headers
  const http = axios.create({ headers: { 'Authorization': `Bearer ${accessToken}` }})
  
  // 2. get artist's id from search
  let art1id;
  
  try {
    const result = await searchArtists (http, {artist: artist1 })
    const { artists } = result
    
    if(!artists || !artists.items || !artists.items.length ) {
      return res.status(404).send({ message: `Artist '${artist1}' not found.` })
    }
    
    art1id = artists.items[0].id
  }catch(err){
    console.error(err.message)
    res.status(500).send({ message: `Error when searching artist '${artist1}'` })
  }
  
  let art2id;
  
  try {
    const result = await searchArtists (http, {artist: artist2 })
    const { artists } = result
    
    if(!artists || !artists.items || !artists.items.length ) {
      return res.status(404).send({ message: `Artist '${artist2}' not found.` })
    }
    
    art2id = artists.items[0].id
  }catch(err){
    console.error(err.message)
    res.status(500).send({ message: `Error when searching artist '${artist2}'` })
  }
  
  let art3id;
  
  try {
    const result = await searchArtists (http, {artist: artist3 })
    const { artists } = result
    
    if(!artists || !artists.items || !artists.items.length ) {
      return res.status(404).send({ message: `Artist '${artist3}' not found.` })
    }
    
    art3id = artists.items[0].id
  }catch(err){
    console.error(err.message)
    res.status(500).send({ message: `Error when searching artist '${artist3}'` })
  }
  
  
  // 5. get song recommendations
  try {
    const result = await getRecommendations(http, { artists: [art1id, art2id, art3id] })
    const { tracks } = result

    if(!tracks || !tracks.length ) {
      res.status(404).send({ message: "No recommendations found." })
    }
    
    // Success! Send track recommendations back to client
    res.send({ tracks })
  } catch(err) {
    console.error(err.message)
    res.status(500).send({ message: "Internal Server Error" })
  }
});  
  
// start listening on a port provided by Glitch
app.listen(process.env.PORT, () => {
  console.log(`Example app listening at port ${process.env.PORT}`);
});

