import fetch from 'node-fetch';

const fitbackApi = 'http://fitbackchallengeapi-env.eba-ymyfxde2.us-east-2.elasticbeanstalk.com';

(async () => {

   // You can comment out these first two steps if you already initialized the database before. Initializing the database takes time.

   // Remove all the data in the database, so we can properly initialize it.
   console.log('\nRemoving everything in the database...');
   await fetch (`${fitbackApi}/everything`, {
      method: 'DELETE',
   })
      .catch(err => console.log(err));
   console.log('Done.');

   // Initialize the database with the songs of one artist.
   console.log('\nInitializing the database...');
   await fetch (`${fitbackApi}/populate-db-with-artists`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         artistsIds: ['3p7Bs02UWDt5ENoJeUGqaB'] // 'Porta' artist.
      }),
   })
      .catch(err => console.log(err));
   console.log('Done.');

   // Look for songs of the 'Porta' artist.
   console.log('\nLooking for songs of the "Porta" artist...');
   const songsFound = await fetch (`${fitbackApi}/songs?artistName=Porta&limit=10&offset=10`)
      .then(res => res.json())
      .catch(err => console.log(err));
   console.log('Done. Response:');
   console.log(songsFound);

   // Look for a single song.
   console.log('\nLooking for the song with the "0rYTQgq4LFLCIHT13qBtna" UUID...'); // 'Nuestra Historia de Dos' de Porta.
   const songFound = await fetch (`${fitbackApi}/songs/0rYTQgq4LFLCIHT13qBtna`)
      .then(res => res.json())
      .catch(err => console.log(err));
   console.log('Done. Response:');
   console.log(songFound);

})();
