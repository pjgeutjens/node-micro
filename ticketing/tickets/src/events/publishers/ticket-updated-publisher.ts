import { Publisher, Subjects, TicketUpdatedEvent } from '@leapconsulting/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}