import { describe, it, expect, vi } from "vitest";
import { PaymentMethods } from "../../../../src/client/methods/payments.js";

class ConcretePaymentClient extends PaymentMethods {}

describe("PaymentMethods Unit Tests (1:1 mapping)", () => {
  const createMock = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { client: new ConcretePaymentClient("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("sendInvoice, createInvoiceLink, answerShippingQuery, answerPreCheckoutQuery", async () => {
    const { client } = createMock(true);
    expect(await client.sendInvoice({
      chat_id: 123,
      title: "T",
      description: "D",
      payload: "P",
      currency: "USD",
      prices: [{ label: "item", amount: 100 }],
    })).toBe(true);
    expect(await client.createInvoiceLink({
      title: "T",
      description: "D",
      payload: "P",
      currency: "USD",
      prices: [{ label: "item", amount: 100 }],
    })).toBe(true);
    expect(await client.answerShippingQuery({ shipping_query_id: "q1", ok: true })).toBe(true);
    expect(await client.answerPreCheckoutQuery({ pre_checkout_query_id: "pq1", ok: true })).toBe(true);
  });

  it("refundStarPayment, getStarTransactions, editUserStarSubscription, getMyStarBalance", async () => {
    const { client } = createMock(true);
    expect(await client.refundStarPayment(123, "charge_1")).toBe(true);
    expect(await client.getStarTransactions(0, 10)).toBe(true);
    expect(await client.editUserStarSubscription(123, "charge_1", true)).toBe(true);
    expect(await client.getMyStarBalance()).toBe(true);
  });
});
