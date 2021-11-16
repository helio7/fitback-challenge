# fitback-challenge

I followed the instructions in the 'Technical Review - Backend Developer.pdf' file, and these are the requirementes I found:
- Create a script that uploads information about all the songs of a list of artists to a database...
- Create an API with de endpoints required (GET /songs and GET /songs/:songId).
- Add pagination functionality to the GET /songs endpoint.

This is how I satisfied the requirementes:
- I created a MySQL database that you can access with the following credentials:
   Username: admin
   Password: f3=KX3-E}7G7MKBv
   Host: database-1.cfjswzxrrrp5.us-east-2.rds.amazonaws.com
   Port: 3306
   Database name: fitback
   - It will contain the songs data..
   - It has 3 tables:
      - 'songs', where the songs data is saved.
      - 'artists', where the data of the artists related to the songs is saved.
      - 'songs-artists', where the 'which songs belong to which artists' information is saved.
- I created and deployed an API whose base URL is http://fitbackchallengeapi-env.eba-ymyfxde2.us-east-2.elasticbeanstalk.com/.
   - It has 4 endpoints and doesn't require authentication:
      - POST /populate-db-with-artists
         - It receives an array of artist IDS, downloads the data of all their songs, and uploads it to the database (this is the endpoint that contains the script required in the first requirement).
         - This endpoint is supposed to be called only when the database is empty, so make sure to call DELETE /everything first so you can start from zero.
         - What does it expect?
            - A JSON body with a 'artistsIds' property. Its value is an array of Spotify Artist ID's.
         - What is its response?
            - If everything goes well, it'll return a 200 'Finished.' message once the process ended.
      - DELETE /everything
         - It removes all the data in the database, so it can be initialized again.
         - It doesn't expect any additional data..
         - It just returns a 200 'Finished.' message once the process ended.
      - GET /songs
         - It receives an artist name, and optional limit and offset values. It looks for an artist that matches the name received, and returns data about the songs of that artist. Limit and offset control which and how many songs will be returned.
         - It expects an 'artistName' query parameter, with the artist name to search for. It can also receive 2 optional 'limit' and 'offset' query parameters, which are numbers. 'limit' and 'offset' are 20 and 0 by default, respectively.
         - It returns a JSON object with the following properties:
            - songs: an array with data about each song.
            - limit: the limit used in the request.
            - offset: the offset used in the request.
            - nextPage: an URL that can be accessed to get the data of the next page, or null if there isn't a next page.
            - previousPage: an URL that can be accessed to get the data of the previous page, or null if there isn't a previous page.
            - total: the total number of songs that were found for these artists.
      - GET /songs/:songId
         - It receives the Spotify UUID of one song, and looks for it in the database.
         - It expects a UUID in the :songId URL parameter place.
         - It returns a 200 and the song data in a JSON object if it's found. It returns a 404 and a 'Song not found.' message if it's not found.
- I added an script that shows how you can use this API.
   - It is located in /source_code/script
      - It first deletes all data in the database, then populates it with the songs of the artist 'Porta', and then gets some data from it.
      - To run it:
         - Go to /source_code/script
         - Run 'npm install'
         - Run 'node index'
      - After executing it, you will see the data in the database if you connect to it, and the console will show you some data that was returned from the GET endpoints..
