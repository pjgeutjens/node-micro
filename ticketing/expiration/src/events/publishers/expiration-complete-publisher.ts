import { ExpirationCompleteEvent, Publisher, Subjects } from "@leapconsulting/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}