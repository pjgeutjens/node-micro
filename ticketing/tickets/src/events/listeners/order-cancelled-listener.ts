import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@leapconsulting/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'] , msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)
    // if no ticket throw an error
    if (!ticket) {
      throw new Error('Ticket not found')
    }
    // mark the ticket as reserved by setting orderId
    ticket.set({ orderId: undefined })

    // save ticket
    await ticket.save()
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
      userId: ticket.userId,
      orderId: ticket.orderId
    });
    // ack msg
    msg.ack()
  }

}