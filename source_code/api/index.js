const express = require('express');
const jsonParser = require('body-parser').json();
const fetch = require('isomorphic-unfetch');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Instantiate Express application.
const app = express();

// Import environment variables.
require('dotenv').config();

// Connect to the database.
const sequelize_initializer = require('./src/db');
const sequelize = sequelize_initializer();

// Define models.
const sequelizeModels = require('./src/models');
for (const model of sequelizeModels) {
   const {modelName, attributes, options} = model;
   sequelize.define(modelName, attributes, options)
}

// This middleware allows us to access the request body easily through the .body property.
app.use(jsonParser);

// This endpoints receis a list of artist ID's, and adds to the database all the songs of each one of them.
app.post('/populate-db-with-artists', async (req, res) => {

   const { Song, Artist, SongArtist } = sequelize.models;

   // Artists whose songs we're looking for.
   const artistsIds = req.body.artistsIds;

   const spotifyApi = process.env.SPOTIFY_API;
   const accountsApi = process.env.ACCOUNTS_API;

   const clientId = process.env.CLIENT_ID;
   const clientSecret = process.env.CLIENT_SECRET;

   // Prepare the 'application/x-www-form-urlencoded' encoded body form.
   const form = { 'grant_type': 'client_credentials' };
   const formBody = [];
   for (const property in form) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(form[property]);
      formBody.push(encodedKey + "=" + encodedValue);
   }
   const body = formBody.join("&");

   // Send a request to get a token to access the Spotify API.
   const spotifyAccessToken = await fetch(`${accountsApi}/api/token`, {
      method: 'POST',
      headers: {
         Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
         'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
   })
      .then(res => res.json())
      .then(res => res.access_token)
      .catch(err => console.log(err));

   // Final songs array.
   let songs = [];

   // For each artist...
   for (const artistId of artistsIds) {
      // Get all albums for this artist.
      let artistAlbums = [];
      let areThereRemainingAlbums = true;
      let offset = 0;
      while (areThereRemainingAlbums) {
         // Get 50 albums (50 is the maximum we can get in each request).
         const artist50Albums = await fetch(`${spotifyApi}/artists/${artistId}/albums?limit=50&offset=${offset}`, {
            headers: { Authorization: `Bearer ${spotifyAccessToken}` }
         })
            .then(res => res.json())
            .then(res => res.items)
            .catch(err => console.log(err));

         // Check if we need to continue looking for more albums, or we check for the next page.
         if (artist50Albums.length < 50) areThereRemainingAlbums = false;
         else offset = offset + 50;

         // Save albums.
         for (const albumToSave of artist50Albums) {
            // Ignore 'compilation' albums.
            if (albumToSave.album_type !== 'compilation') {
               // If an album with the same name was saved before, don't save this one again.
               let isAlbumNameRepeated = false;
               for (const savedAlbum of artistAlbums) {
                  if (albumToSave.name === savedAlbum.name) {
                     isAlbumNameRepeated = true;
                     break;
                  }
               }
               if (!isAlbumNameRepeated) artistAlbums.push(albumToSave);
            }
         }
      }

      // For each album...
      for (const album of artistAlbums) {
         // Get all songs for this album.
         let albumSongs = [];
         let areThereRemainingSongs = true;
         let offset = 0;
         while (areThereRemainingSongs) {
            // Get 50 songs (50 is the maximum we can get in each request).
            const album50Songs = await fetch(`${spotifyApi}/albums/${album.id}/tracks?limit=50&offset=${offset}`, {
               headers: { Authorization: `Bearer ${spotifyAccessToken}` }
            })
               .then(res => res.json())
               .then(res => res.items)
               .catch(err => console.log(err));

            // Check if we need to continue looking for more songs, or we check for the next page.
            if (album50Songs.length < 50) areThereRemainingSongs = false;
            else offset = offset + 50;

            // Save albums.
            albumSongs = albumSongs.concat(album50Songs);
         }

         // Prepare data for the database where it'll be inserted.
         albumSongs.forEach((song, index) => {
            // The 'artists', 'available_markets' and 'external_urls' properties will be saved as a JSON strings.
            albumSongs[index].artists = JSON.stringify(albumSongs[index].artists);
            albumSongs[index].available_markets = JSON.stringify(albumSongs[index].available_markets);
            albumSongs[index].external_urls = JSON.stringify(albumSongs[index].external_urls);
            // The 'id' property will be replaced by 'uuid', because the key 'id' is used by MySQL as primary key.
            albumSongs[index].uuid = albumSongs[index].id;
            delete albumSongs[index].id;
         });

         // Add songs to the final songs array.
         songs = songs.concat(albumSongs);
      }
   }

   // Add songs to the database.
   await Song.bulkCreate(songs);

   // Get a list of all the related artists.
   const artists = [];
   for (const song of songs) {
      for (const artistToSave of JSON.parse(song.artists)) {
         let isArtistRepeated = false;
         for (const savedArtist of artists) {
            if (artistToSave.id === savedArtist.id) {
               isArtistRepeated = true;
               break;
            }
         }
         if (!isArtistRepeated) artists.push(artistToSave);
      }
   }

   // Prepare data for the database where it'll be inserted.
   artists.forEach((artist, index) => {
      // The 'external_urls' property will be saved as a JSON string.
      artists[index].external_urls = JSON.stringify(artists[index].external_urls);
      // The 'id' property will be replaced by 'uuid', because the key 'id' is used by MySQL as primary key.
      artists[index].uuid = artists[index].id;
      delete artists[index].id;
   });

   // Add artists to the database.
   await Artist.bulkCreate(artists);

   // Add relations between songs and artists to the database.
   const songArtistRelations = [];
   for (const song of songs) {
      for (const artist of JSON.parse(song.artists)) {
         songArtistRelations.push({
            songUuid: song.uuid,
            artistUuid: artist.id,
         });
      }
   }
   await SongArtist.bulkCreate(songArtistRelations);

   // Return response.
   res.send('Finished.');

});

// This endpoint removes everything in the database.
app.delete('/everything', async (req, res) => {
   const { Song, Artist, SongArtist } = sequelize.models;

   // Delete everything.
   await Song.destroy({ where: {} });
   await Artist.destroy({ where: {} });
   await SongArtist.destroy({ where: {} });

   // Return response.
   res.send('Finished.');
})

app.get('/songs/:songUuid', async (req, res) => {
   const { Song } = sequelize.models;

   const song = await Song.findOne({
      where: {
         uuid: req.params.songUuid,
      },
   });

   if (song === null) res.status(404).json({ message: 'Song not found.' });
   else {
      res.json({
         artists: JSON.parse(song.artists),
         disc_number: song.disc_number,
         duration_ms: song.duration_ms,
         explicit: song.explicit,
         external_urls: song.external_urls,
         href: song.href,
         id: song.uuid,
         is_local: song.is_local,
         is_playable: song.is_playable,
         name: song.name,
         preview_url: song.preview_url,
         track_number: song.track_number,
         type: song.type,
         uri: song.uri,
      });
   }
});

app.get('/songs', async (req, res) => {

   const { artistName, limit = 20, offset = 0 } = req.query;

   if (offset < 0) offset = 0;
   else if (offset > 50) offset = 50;

   const { Artist, SongArtist, Song } = sequelize.models;

   const foundSongs = [];

   const artists = await Artist.findAll({
      where: {
         name: {
            [Op.like]: `%${artistName}%`,
         },
      },
   });

   for (const artist of artists) {
      const songArtistRelationsUuids = await SongArtist.findAll({
         where: {
            artistUuid: artist.uuid,
         },
      })
         .then((relations) => {
            const ids = [];
            for (const relation of relations) {
               ids.push(relation.songUuid);
            }
            return ids;
         })

      await Song.findAll({
         where: {
            uuid: {
               [Op.in]: songArtistRelationsUuids,
            },
         },
      })
         .then((songs) => {
            for (const song of songs) {
               foundSongs.push({
                  songId: song.uuid,
                  songTitle: song.name,
               });
            }
         })
   }

   const finalSongs = [];

   let remainingSongs = limit;
   let songIndex = offset;
   while (remainingSongs && (songIndex < foundSongs.length)) {
      finalSongs.push(foundSongs[songIndex]);
      songIndex++;
      remainingSongs--;
   }

   const fitbackApi = `${process.env.FITBACK_API}`;

   let previousPage;
   if (!offset) previousPage = null;
   else {
      previousPage = `${fitbackApi}/songs?artistName=${artistName}&limit=${limit}&offset=`;
      let newOffset = offset - limit;
      if (newOffset < 0) newOffset = 0;
      previousPage += newOffset;
   }

   let nextPage;
   if (songIndex === foundSongs) nextPage = null;
   else nextPage = `${fitbackApi}/songs?artistName=${artistName}&limit=${limit}&offset=${songIndex}`;

   res.json({
      songs: finalSongs,
      limit,
      offset,
      nextPage,
      previousPage,
      total: foundSongs.length,
   });
})

app.get('/', (req, res) => {
   res.send("This is Fitback's Challenge API. 2021/11/15.")
});

sequelize.sync({
   force: false,
   logging: false,
})
   .then(() => {
      const serverPort = process.env.SERVER_PORT;
      app.listen(serverPort, () => {
         console.log(`E-commerce backend listening at http://localhost:${serverPort}`);
      });
   });

