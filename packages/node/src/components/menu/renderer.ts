/**
 * Menu keyboard rendering engine.
 *
 * @packageDocumentation
 */

import type { InlineKeyboardMarkup, InlineKeyboardButton } from "../../client/types.js";
import type { CallbackContext } from "../../kernel/context.js";
import type { MenuButtonItem } from "./types.js";

export function buildMenuKeyboard(
  id: string,
  rows: MenuButtonItem[][],
  ctx?: CallbackContext,
): InlineKeyboardMarkup {
  const inline_keyboard: InlineKeyboardButton[][] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const keyboardRow: InlineKeyboardButton[] = [];
    for (let c = 0; c < row.length; c++) {
      const item = row[c]!;
      let text: string;
      if (typeof item.label === "function") {
        try {
          const res = item.label(ctx as CallbackContext);
          text = typeof res === "string" ? res : "";
        } catch {
          text = "";
        }
      } else {
        text = item.label;
      }

      switch (item.type) {
        case "text":
          keyboardRow.push({
            text,
            callback_data: `m:${id}:b:${r}:${c}`,
          });
          break;
        case "submenu":
          keyboardRow.push({
            text,
            callback_data: `m:${id}:s:${item.targetMenu.id}:${r}:${c}`,
          });
          break;
        case "back":
          keyboardRow.push({
            text,
            callback_data: `m:${id}:k:${r}:${c}`,
          });
          break;
        case "url":
          keyboardRow.push({
            text,
            url: item.url,
          });
          break;
      }
    }

    if (keyboardRow.length > 0) {
      inline_keyboard.push(keyboardRow);
    }
  }

  return { inline_keyboard };
}

export async function renderMenuKeyboard(
  id: string,
  rows: MenuButtonItem[][],
  ctx?: CallbackContext,
): Promise<InlineKeyboardMarkup> {
  const inline_keyboard: InlineKeyboardButton[][] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const keyboardRow: InlineKeyboardButton[] = [];
    for (let c = 0; c < row.length; c++) {
      const item = row[c]!;
      let text: string;
      if (typeof item.label === "function") {
        try {
          const res = await item.label(ctx as CallbackContext);
          text = typeof res === "string" ? res : "";
        } catch {
          text = "";
        }
      } else {
        text = item.label;
      }

      switch (item.type) {
        case "text":
          keyboardRow.push({
            text,
            callback_data: `m:${id}:b:${r}:${c}`,
          });
          break;
        case "submenu":
          keyboardRow.push({
            text,
            callback_data: `m:${id}:s:${item.targetMenu.id}:${r}:${c}`,
          });
          break;
        case "back":
          keyboardRow.push({
            text,
            callback_data: `m:${id}:k:${r}:${c}`,
          });
          break;
        case "url":
          keyboardRow.push({
            text,
            url: item.url,
          });
          break;
      }
    }

    if (keyboardRow.length > 0) {
      inline_keyboard.push(keyboardRow);
    }
  }

  return { inline_keyboard };
}
