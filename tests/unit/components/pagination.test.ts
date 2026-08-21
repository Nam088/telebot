import { describe, it, expect } from "vitest";
import { PaginationKeyboard } from "../../../src/components/pagination.js";

describe("PaginationKeyboard Tests", () => {
  const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"];

  it("builds correct page 1 structure with next navigation button", () => {
    const pagination = new PaginationKeyboard({
      items,
      page: 1,
      pageSize: 3,
      itemButton: (item) => ({ text: item, callback_data: `select:${item}` }),
    });

    expect(pagination.totalPages).toBe(3);
    expect(pagination.currentPage).toBe(1);

    const markup = pagination.build();
    // 3 item rows + 1 navigation row = 4 rows
    expect(markup.inline_keyboard).toHaveLength(4);
    expect(markup.inline_keyboard[0]?.[0]?.text).toBe("Apple");
    expect(markup.inline_keyboard[1]?.[0]?.text).toBe("Banana");
    expect(markup.inline_keyboard[2]?.[0]?.text).toBe("Cherry");

    // Nav row
    const navRow = markup.inline_keyboard[3]!;
    expect(navRow[0]?.text).toBe("-"); // Prev disabled on page 1
    expect(navRow[1]?.text).toBe("1 / 3");
    expect(navRow[2]?.text).toBe("Next");
    expect(navRow[2]?.callback_data).toBe("pagination:next:2");
  });

  it("builds correct middle page with both prev and next buttons", () => {
    const pagination = new PaginationKeyboard({
      items,
      page: 2,
      pageSize: 3,
      itemButton: (item) => ({ text: item, callback_data: `select:${item}` }),
    });

    const markup = pagination.build();
    expect(markup.inline_keyboard[0]?.[0]?.text).toBe("Date");

    const navRow = markup.inline_keyboard[3]!;
    expect(navRow[0]?.text).toBe("Previous");
    expect(navRow[0]?.callback_data).toBe("pagination:prev:1");
    expect(navRow[1]?.text).toBe("2 / 3");
    expect(navRow[2]?.text).toBe("Next");
    expect(navRow[2]?.callback_data).toBe("pagination:next:3");
  });

  it("does not render navigation row when all items fit on 1 page", () => {
    const pagination = new PaginationKeyboard({
      items: ["Only1", "Only2"],
      pageSize: 5,
      itemButton: (item) => ({ text: item, callback_data: item }),
    });

    expect(pagination.totalPages).toBe(1);
    const markup = pagination.build();
    expect(markup.inline_keyboard).toHaveLength(2);
  });

  it("supports fully customized navigation buttons without emojis and hiding disabled buttons", () => {
    const pagination = new PaginationKeyboard({
      items,
      page: 1,
      pageSize: 3,
      itemButton: (item) => ({ text: item, callback_data: item }),
      navigation: {
        prev: "Previous Page",
        next: "Next Page",
        pageIndicator: (curr, total) => `Trang ${curr} trên ${total}`,
        hideDisabled: true,
      },
    });

    const markup = pagination.build();
    const navRow = markup.inline_keyboard[3]!;
    // With hideDisabled=true on page 1, disabled Prev is omitted, so navRow has [PageIndicator, Next]
    expect(navRow).toHaveLength(2);
    expect(navRow[0]?.text).toBe("Trang 1 trên 3");
    expect(navRow[1]?.text).toBe("Next Page");
  });

  it("builds last page correctly with disabled next placeholder or hidden disabled", () => {
    const paginationDefault = new PaginationKeyboard({
      items,
      page: 3,
      pageSize: 3,
      itemButton: (item) => ({ text: item, callback_data: item }),
    });

    const markupDefault = paginationDefault.build();
    const navRowDefault = markupDefault.inline_keyboard[1]!; // page 3 has 1 item ("Grape") + 1 nav row
    expect(navRowDefault[0]?.text).toBe("Previous");
    expect(navRowDefault[1]?.text).toBe("3 / 3");
    expect(navRowDefault[2]?.text).toBe("-"); // disabled next placeholder

    const paginationHidden = new PaginationKeyboard({
      items,
      page: 3,
      pageSize: 3,
      itemButton: (item) => ({ text: item, callback_data: item }),
      navigation: { hideDisabled: true },
    });

    const markupHidden = paginationHidden.build();
    const navRowHidden = markupHidden.inline_keyboard[1]!;
    expect(navRowHidden).toHaveLength(2); // [Previous, PageIndicator]
    expect(navRowHidden[0]?.text).toBe("Previous");
    expect(navRowHidden[1]?.text).toBe("3 / 3");
  });
});
