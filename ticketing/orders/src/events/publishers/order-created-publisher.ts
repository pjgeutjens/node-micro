import { OrderCreatedEvent, Publisher, Subjects } from "@leapconsulting/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}