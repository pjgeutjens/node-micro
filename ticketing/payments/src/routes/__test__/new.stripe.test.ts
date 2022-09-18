import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe'

// jest.mock('../../stripe')

it('returns a 404 when charging for an order that does not exist',async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: 'abc'
    })
    .expect(404)
})

it('returns a 401 when charging for an order that does not belong to the user',async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 20
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'abc'
    })
    .expect(401)
})

it('returns a 400 when purchasing a cancelled order',async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'abc'
    })
    .expect(400)
});

it('returns a 201 with valid inputs',async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100000)
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'tok_visa'
    })
    .expect(201)

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => { return charge.amount == price * 100})
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('eur');

  const payment = await Payment.findOne({
    orderId: order.id, 
    stripeId: stripeCharge!.id
  })
  expect(payment).not.toBeNull()
})