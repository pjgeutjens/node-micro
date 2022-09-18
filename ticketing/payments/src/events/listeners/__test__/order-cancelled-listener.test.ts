import { OrderCancelledEvent, OrderStatus } from "@leapconsulting/common"
import mongoose from "mongoose"
import { Order } from "../../../models/order"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup =async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  // create an order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
    userId: 'ljflfjlj',
    version: 0
  })
  await order.save()

  // create a fake data object
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    }   
  }

  // create a fake msg object
  // @ts-ignore
  const msg: Message = { 
    ack: jest.fn()
  }

  return { listener, data, order, msg }
}

it('updates the status of the order', async () => {
  const { listener, msg, data, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message',async () => {
  const { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled()
})