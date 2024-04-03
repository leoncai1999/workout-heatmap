const express = require('express');
const app = express();
const PORT = 3001
const strava = require('strava-v3')

app.get("/activities/:page/:token", (req, res) => {
  strava.athlete.listActivities({"per_page": "200", "page": req.params.page, "access_token": req.params.token}, (err, payload, limits) => {
    if (!err) {
      res.json(payload)
    } else {
      console.error(err)
    }
  })
})

app.listen(PORT, () => { console.log("Server started on port 3001")})