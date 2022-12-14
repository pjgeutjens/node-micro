const express = require("express")
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

const eventBusUrl = process.env.EVENT_BUS_URL || 'event-bus-srv:4005'

app.post('/events', async (req, res) => {
  console.log('event received:', req.body.type)
  const { type, data } = req.body;
  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved'

    await axios.post(`http://${eventBusUrl}/events`, {
      type: 'CommentModerated',
      data: {
        id: data.id, postId: data.postId, content: data.content, status
      }
    }).catch(err => console.log(err))
  }
  res.send({})
})

app.listen(4003, () => {
  console.log("Listening on port 4003")
})