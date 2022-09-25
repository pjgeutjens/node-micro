import mongoose from 'mongoose'
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log("Starting..")
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY not defined')
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID not defined')
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID not defined')
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL not defined')
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not defined')
  }

  if (!process.env.STRIPE_KEY) {
    throw new Error('STRIPE_KEY not defined')
  }

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed')
      process.exit()
    })
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()

    await mongoose.connect(process.env.MONGO_URI)
    console.log('connected to mongodb at', process.env.MONGO_URI);
    
  } catch (error) {
    console.log(error)
  }

  app.listen(3000, () => { 
    console.log("listening on port 3000!!")
   })
}

start();

