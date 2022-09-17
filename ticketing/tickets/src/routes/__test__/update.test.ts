import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the ticket is not found', async () => { 
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .get(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'fljfljf',
      price: 10
    })
    .expect(404)
});

it('returns a 401 if the user is not authenticed', async () => { 
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'fljfljf',
      price: 10
    })
    .expect(401)
});

it('returns a 401 if the user is not the owner', async () => { 
  const title = 'concert'
  const price = 20

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title, price})
    .expect(201)  
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'newstuff',
        price: 40
      })
      .expect(401)
});

it('returns a 400 if the user provides an invalid price or title', async () => { 
  const title = 'concert'
  const price = 20

  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({title, price})
    .expect(201)  
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 20
      })
      .expect(400)
    
      await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new',
        price: -10
      })
      .expect(400)
});

it('returns the updated ticket if a valid ticket is updated with a valid price or title', async () => { 
  const title = 'concert'
  const price = 20

  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({title, price})
    .expect(201)  
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 100 
      })
      .expect(200)

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
   
    expect(ticketResponse.body.title).toEqual('new title')
    expect(ticketResponse.body.price).toEqual(100)
});

it('publishes an event', async () => {
  const title = 'concert'
  const price = 20

  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({title, price})
    .expect(201)  
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 100 
      })
      .expect(200)
    
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})


