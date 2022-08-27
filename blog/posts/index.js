const express = require("express")
const { randomBytes } = require("crypto")
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express();
app.use(bodyParser.json())
app.use(cors())

const eventBusUrl = process.env.EVENT_BUS_URL || 'event-bus-srv:4005'

const posts = {}

app.get('/posts', (req, res) => {
  res.send(posts)
})


app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  posts[id] = {
    id, title
  };

  await axios.post(`http://${eventBusUrl}/events`, {
    type: 'PostCreated',
    data: {
      id, title
    }
  }).catch(err => console.log(err))
  res.status(201).send(posts[id])
});

app.post('/events', (req, res) => { 
  console.log('event received:', req.body.type)
  res.send({})
})

app.listen(4000, () => { 
  console.log("Version: 1000")
  console.log("listening on port 4000, event bus at", eventBusUrl)
 })

