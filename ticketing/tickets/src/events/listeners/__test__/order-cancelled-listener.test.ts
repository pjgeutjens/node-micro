import { OrderCancelledEvent } from "@leapconsulting/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup =async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  // create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'aflfjljf',
  })
  ticket.set({ orderId })
  await ticket.save();

  // create a fake data object
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
        id: ticket.id
    }
  }

  // create a fake msg object
  // @ts-ignore
  const msg: Message = { 
    ack: jest.fn()
  }

  return { listener, ticket, orderId, data, msg }
}

it('updates the ticket', async () => {
  const { listener, ticket, msg, orderId, data } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined()
})

it('acks the message',async () => {
  const { listener, ticket, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event',async () => {
  const { listener, ticket, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})