const express = require("express")
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express();
app.use(bodyParser.json())

const postsUrl = process.env.POSTS_URL || 'posts-srv:4000'
const commentsUrl = process.env.COMMENTS_URL || 'comments-srv:4001'
const queryUrl = process.env.QUERY_URL || 'query-srv:4002'
const moderationUrl = process.env.MODERATION_URL || 'moderation-srv:4003'


const events = [];

app.post('/events', (req, res) => {
  const event = req.body

  events.push(event)

  axios.post(`http://${postsUrl}/events`, event).catch(err => {
    console.log(err)
  })

  axios.post(`http://${commentsUrl}/events`, event).catch(err => {
    console.log(err)
  })

  axios.post(`http://${queryUrl}/events`, event).catch(err => {
    console.log(err)
  })

  axios.post(`http://${moderationUrl}/events`, event).catch(err => {
    console.log(err)
  })

  res.send({ status: 'OK' });
})

app.get('/events', (req, res) => {
  res.send(events)
})

app.listen(4005, () => {
  console.log("Listening on port 4005, sending to ", postsUrl, commentsUrl, queryUrl, moderationUrl)
})