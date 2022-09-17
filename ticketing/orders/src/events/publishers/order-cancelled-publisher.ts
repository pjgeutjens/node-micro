import { OrderCancelledEvent, Publisher, Subjects } from "@leapconsulting/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}