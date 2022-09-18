import { OrderStatus } from '@leapconsulting/common';
import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the order is not found', async () => { 
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .delete(`/api/orders/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404)
});

it('returns a 401 if the user does not own an order', async () => { 
  const title = 'concert'
  const price = 20
  const ticketId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    id: ticketId,
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
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401)  
});

it('returns the order if the order is found and it has a status of cancelled', async () => { 
  const title = 'concert'
  const price = 20
  const ticketId = new mongoose.Types.ObjectId().toHexString();


  const ticket = Ticket.build({
    id: ticketId,
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
 
  const { body:cancelOrder} = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)  

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
});

it('emits a order cancelled event', async () => {
  const title = 'concert'
  const price = 20
  const ticketId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    id: ticketId,
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
 
  const { body:cancelOrder} = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)
  
  expect(natsWrapper.client.publish).toHaveBeenCalled()
});
