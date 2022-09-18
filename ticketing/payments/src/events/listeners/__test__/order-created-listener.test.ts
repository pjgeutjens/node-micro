import { OrderCreatedEvent, OrderStatus } from "@leapconsulting/common"
import mongoose from "mongoose"
import { Order } from "../../../models/order"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup =async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // create a fake data object
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'kfljkfh',
    status: OrderStatus.Created,
    userId: 'kljdfkfhk',
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 19
    }   
  }

  // create a fake msg object
  // @ts-ignore
  const msg: Message = { 
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it('repliates the order info', async () => {
  const { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message',async () => {
  const { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled()
})