# Workout Heatmap
[![WelcomeScreen](https://i.postimg.cc/NF4wZNsR/Welcome-Screen.png)](https://postimg.cc/T5pSDJWP)

WorkoutHeatmap.me is a Web App that connects with a user's Strava account to create a personalized and
interactive heatmap of their activities. Additionally, it delivers statistics on their workout habits
and allows them to download their data. Your information is retrieved from the Strava API and none of it
is stored externally. You may revoke your Strava access at any time. If you do not have a Stava account,
there is a sample account if you would still like to explore the app. This site is free for anyone to use
pending Strava API call limits. Below are the features of the app.

## Heatmap
[![MapScreen](https://i.postimg.cc/9MVNjQxk/map-screen-13f795f3.png)](https://postimg.cc/8FKbRNgd)
The interactive Heatmap allows the user to filter activites by sport, workout type, number of members and
time of day in the left panel. The right dropdown consists of all the cities the user has outdoor activites
logged in and selecting a particular city will reposition the map as appropriate.

## List
[![ListScreen](https://i.postimg.cc/SQGPzjHb/List-Screen.png)](https://postimg.cc/PNPygftS)
The list includes all types of activities that the user has granted access to (either public activites only,
or public and private activities) and includes activities that cannot be shown on the map. The activites can
be sorted by various attributes and downloaded to Excel. Clicking on an activity name opens the
activity details in an external Strava link.

## Stats
[![StatsCities](https://i.postimg.cc/ZRmNcRC0/Stats-Cities.png)](https://postimg.cc/qtmgBpcd)
[![StatsYearMonth](https://i.postimg.cc/MG7MvSdw/Stats-Year-Month.png)](https://postimg.cc/B8vQVRr7)
[![StatsWeekDay](https://i.postimg.cc/gk1nsJ7d/Stats-Week-Day.png)](https://postimg.cc/CzHhLFY6)
[![StatsTimeOfDay](https://i.postimg.cc/CxjL44DH/Stats-Time-Of-Day.png)](https://postimg.cc/PC5jXYSP)
[![StatsIntensity](https://i.postimg.cc/4xTXnhMK/Stats-Intensity.png)](https://postimg.cc/vcXJNDG)
The Stats page displays trends in the user's Strava activities with a variety of charts and visuals.
In order to see Stats regarding activity intensity and estimated workout effort percentage by day,
the user must enable access to their Strava profile information. Allowing this gives the web app
access to the user's heart rate zones which can then be used to bring these insights.

## App Components
**Built With:** MongoDB (for storing sample account data), Express, React, and NodeJS

**APIs:** [Strava API](http://developers.strava.com/docs/reference/) (user authentication and accessing workout data), [Google Maps API](https://developers.google.com/maps/documentation/javascript/overview) (map overlay)

**Hosting** Both the frontend and backend are deployed to Render with autotmatic GitHub deployment. DNS and SSL Certification
are managed by Cloudflare and a custom domain name was bought from NameCheap

**Key Dependencies:** React Bootstrap, React Bootstrap Table 2, React ChartJs 2, Mongoose, Decode Google Map Polyline Js,
Google Maps React

## Recreating the Project

To recreate and run this project on your own machine, start by cloning down this repository. Create a .env file
in the frontend directory with the following variables:

`REACT_APP_GOOGLE_MAPS_API_KEY = {Your Google Maps API key}`\
`REACT_APP_STRAVA_CLIENT_ID = {Your Strava Client ID}`\
`REACT_APP_STRAVA_SECRET = {Your Strava Secret}`

Then for the backend, create a MongoDB project and a .env variable in the backend directory with the following
variable:

`MONGO_DB_URI = {Your MongoDB URI}`

After this setup, a docker compose file is provided for your convenience to run the project while handling
potential dependency conflicts. Install the docker app and docker CLI. Then run the following commands to build
the front end & backend docker files, and then run:

`cd frontend && docker build . -f Dockerfile -t workoutheatmap-fe:1`
`cd ..backend && docker build . -f Dockerfile -t workoutheatmap-be:1`
`cd .. & docker compose up`

Afterwards, your frontend and backend will be running on `localhost:3000` and `localhost:3001`
respectively. 
In the Strava API application settings, set the authorized callback domain to `localhost:3000`.

You can also run the project without docker by running `npm start` in the frontend and `npm run dev` in the
backend.

If you have questions, suggestions, or would like to report any issues, please feel free to reach out to me
via email!
