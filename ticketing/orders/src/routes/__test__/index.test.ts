import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';


it('returns the list of orders for a particular user', async () => {
  // create three tickets
  const ticket1 = await Ticket.create({
    title: 'concert',
    price: '20'
  })

  const ticket2 = await Ticket.create({
    title: 'museum',
    price: '80'
  })

  const ticket3 = await Ticket.create({
    title: 'movie',
    price: '10'
  })

  await ticket1.save()
  await ticket2.save()
  await ticket3.save()

  const user1 = global.signin()
  const user2 = global.signin()
  // create 1 order as user 1
  await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({
      ticketId: ticket1.id
    })
    .expect(201)
  
    // create 2 orders as user 2
  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({
      ticketId: ticket2.id
    })
    .expect(201)
    const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({
      ticketId: ticket3.id
    })
    .expect(201)

  // get the orders for user 2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)

  // expect 2 orders to return with the right data
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order1.id)
  expect(response.body[1].id).toEqual(order2.id)
  expect(response.body[0].ticket.id).toEqual(ticket2.id)
  expect(response.body[1].ticket.id).toEqual(ticket3.id)
});