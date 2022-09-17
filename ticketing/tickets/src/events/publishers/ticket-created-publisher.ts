import { Publisher, Subjects, TicketCreatedEvent } from '@leapconsulting/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}