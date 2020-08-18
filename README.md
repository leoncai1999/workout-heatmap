# Workout Heatmap
[![WelcomeScreen](https://i.postimg.cc/NF4wZNsR/Welcome-Screen.png)](https://postimg.cc/T5pSDJWP)

Workout Heatmap is a React Web App that connects with a user's Strava account to deliver an interactive
heatmap and additional analytics based on their workout activites. The user has discretion over what degree
of access is granted to their Strava information, and none of the user's information is stored externally.
The user's information is temporarily stored locally to avoid having to refetch the user's data between
page refreshes. This site is free to use and anyone can access it at workoutheatmap.me, pending API Call limits. 
Below are the features of the app.

## Heatmap
[![MapScreen](https://i.postimg.cc/tJPzgfZV/Map-Screen.png)](https://postimg.cc/kRJS1Tyn)
The interactive Heatmap allows the user to filter activites by sport, workout type, number of members and
time of day in the left pannel. The right dropdown consists of all the cities the user has outdoor activites
logged in and selecting a particular city will reposition the map as appropriate.

## List
[![ListScreen](https://i.postimg.cc/LXF5pbpW/List-Screen.png)](https://postimg.cc/v1Xb7XD7)
The list includes all types of activities that the user has granted access to (either public activites only,
or public and private activities) and includes activities that cannot be shown on the map. The activites can
be sorted by various attributes and downloaded to Excel.

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

## Routes
[![RoutesScreen](https://i.postimg.cc/x14DMJpy/Routes-Screen.png)](https://postimg.cc/87M0V5Sj)
The app's algorithm scans all of the user's map plottable activites to determine which activities have similar
routes to each other based on path, distance and elevation gain. Commonly repeated routes are then displayed.

## App Components
**Built With:** React, HTML/CSS and JavaScript

**APIs:** [Strava API](http://developers.strava.com/docs/reference/) (user authentication and accessing workout data), [Google Maps API](https://developers.google.com/maps/documentation/javascript/overview) (heatmap and individual route cards), [Here API](https://developer.here.com/develop/rest-apis) (retrieving the cities of activites), [Mapbox API](https://docs.mapbox.com/api/) (geocoding the cities of activities)

**Dependencies:** React Bootstrap, React Bootstrap Table 2, React ChartJs 2, Geolib, React Router, Axios, Decode Google Map Polyline Js, Express,
Firebase Js SDK

**Hosting:** Heroku with automatic GitHub deployment

**Domain:** GoDaddy

**Database:** Firebase Realtime Database (for storing and retrieving Demo account data)

## Recreating the Project

To recreate and run this project on your own machine, start by cloning down this repository. Next, create a .env file
in the root directory of the project, obtain the necessary API keys as specified in the APIKeys and Firebase file,
and store those keys in the .env file.

If running the project locally, type **yarn start** in the root directory of the project and the project will run on
localhost:3000. In the Strava API application settings, set the authorized callback domain to localhost:3000.
Set the base_url in the code to localhost:3000.

To run the project in production, create a project in Heroku and link it to the GitHub repository of your project.
Specifiy the Heroku domain as the base_url in the code and the authorized callback domain in the Strava API
application. Every subsequent Git commit will trigger a deployment of the site.

If you have questions, suggestions, or would like to report any issues, please feel free to reach out to me
via email!
