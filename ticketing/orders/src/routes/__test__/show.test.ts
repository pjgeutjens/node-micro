import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket';

it('returns a 404 if the order is not found', async () => { 
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .get(`/api/orders/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404)
});

it('returns a 401 if the user does not own an order', async () => { 
  const title = 'concert'
  const price = 20

  const ticket = Ticket.build({
    title, price
  })
  await ticket.save()


  const { body:order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201)
  
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401)  
});

it('returns the order if the order is found', async () => { 
  const title = 'concert'
  const price = 20

  const ticket = Ticket.build({
    title, price
  })
  await ticket.save()

  const user = global.signin()

  const { body:order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id
    })
    .expect(201)
 
  const { body:fetchOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)  

  expect(fetchOrder.id).toEqual(order.id)
});