import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/orders for post requests', async () => { 
  const response = await request(app)
    .post('/api/orders')
    .send({});
  expect(response.status).not.toEqual(404)
});

it('can only be accessed if the user is signed in', async () => { 
  await request(app)
    .post('/api/orders')
    .send({})
    .expect(401)
});

it('returns a status other than 401 if the user is signed in', async () => { 
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({})

  expect(response.status).not.toEqual(401)
});

it('returns an error if no ticketId is provided', async () => { 
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({})
    .expect(400)
});

it('returns an error if the ticket does not exist', async () => { 
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId
    })
    .expect(404)
});

it('returns an error if the ticket is already reserved', async () => { 
  const ticketId = new mongoose.Types.ObjectId().toString('hex')
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 20
  });
  await ticket.save()
  
  const order = Order.build({
    ticket,
    userId: 'kfhjfkhflshlh',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(400)
});

it('reserves a ticket', async () => {
  let orders = await Order.find({});
  expect(orders.length).toEqual(0);

  const price = 20
  const title = 'concert'
  const ticketId = new mongoose.Types.ObjectId().toString('hex')

  const ticket = Ticket.build({
    id: ticketId,
    title, price
  });
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201)
  
  orders = await Order.find({})
  expect(orders.length).toEqual(1)
})

it('publishes an event', async () => {
  const ticketId = new mongoose.Types.ObjectId().toString('hex')
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert', price: 20
  });
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})