import { PaymentCreatedEvent, Publisher, Subjects } from "@leapconsulting/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}