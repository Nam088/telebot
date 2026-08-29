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
    expect(
      await client.sendInvoice({
        chat_id: 123,
        title: "T",
        description: "D",
        payload: "P",
        currency: "USD",
        prices: [{ label: "item", amount: 100 }],
      }),
    ).toBe(true);
    expect(
      await client.createInvoiceLink({
        title: "T",
        description: "D",
        payload: "P",
        currency: "USD",
        prices: [{ label: "item", amount: 100 }],
      }),
    ).toBe(true);
    expect(await client.answerShippingQuery({ shipping_query_id: "q1", ok: true })).toBe(true);
    expect(await client.answerPreCheckoutQuery({ pre_checkout_query_id: "pq1", ok: true })).toBe(
      true,
    );
  });

  it("refundStarPayment, getStarTransactions, editUserStarSubscription, getMyStarBalance", async () => {
    const { client } = createMock(true);
    expect(await client.refundStarPayment(123, "charge_1")).toBe(true);
    expect(await client.getStarTransactions(0, 10)).toBe(true);
    expect(await client.editUserStarSubscription(123, "charge_1", true)).toBe(true);
    expect(await client.getMyStarBalance()).toBe(true);
  });

  it("getAvailableGifts, sendGift", async () => {
    const mockGifts = {
      gifts: [
        {
          id: "gift_1",
          sticker: {
            file_id: "s1",
            file_unique_id: "su1",
            type: "regular" as const,
            width: 512,
            height: 512,
            is_animated: false,
            is_video: false,
          },
          star_count: 50,
          total_count: 1000,
          remaining_count: 500,
          upgrade_star_count: 25,
        },
      ],
    };
    const { client } = createMock(mockGifts);
    expect(await client.getAvailableGifts()).toEqual(mockGifts);

    const { client: sendClient } = createMock(true);
    expect(
      await sendClient.sendGift({
        user_id: 12345,
        gift_id: "gift_1",
        pay_for_upgrade: true,
        text: "Here is your gift!",
        text_parse_mode: "HTML",
        text_entities: [],
      }),
    ).toBe(true);
  });
});
