const express = require('express');
const app = express();
const PORT = 3001
const axios = require('axios');

app.get("/activities/:token", async (req, res) => {
  var all_activities = []
  var page_num = 1

  while (page_num) {
    var batch_activities = await axios
    .get("https://www.strava.com/api/v3/athlete/activities?", {
      params: {
        per_page: '200',
        page: page_num,
        access_token: req.params.token
      }
    })

    batch_activities = batch_activities.data

    if (batch_activities === undefined || batch_activities.length === 0) {
      page_num = 0
      res.json(all_activities)
    } else {
      all_activities = all_activities.concat(batch_activities)
      page_num += 1
    }
  }
})

app.listen(PORT, () => { console.log("Server started on port 3001")})