// in order to run tests with a mocked version of the stripe object
// - rename this file to stripe.ts
// - rename ../routes/__test__/new.test.inactive.ts to new.test.ts 

export const stripe = {
  charges: {
    //@ts-ignore
    create: jest.fn().mockResolvedValue({})
  }
}