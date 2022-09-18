import { TicketUpdatedEvent } from "@leapconsulting/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  })
  await ticket.save()
  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'movie',
    price: 25,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg }
};

it('finds, updates and saves a ticket',async () => {
  const {listener, ticket, data, msg} = await setup()
  // call onMessage(data, msg)
  await listener.onMessage(data, msg)
  // assert that the ticket was created
  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
})

it('acks the message',async () => {
  const {listener, data, msg, ticket} = await setup()
  // call onMessage(data, msg)
  await listener.onMessage(data, msg)
  // assert that the ack function is called
  expect(msg.ack).toHaveBeenCalled()
  
})

it('does not call ack if the event has a skipped version',async () => {
  const { listener, data, msg, ticket } = await setup()
  data.version = 10

  try {
    await listener.onMessage(data, msg)
  } catch (error) {}
  
  expect(msg.ack).not.toHaveBeenCalled()

})