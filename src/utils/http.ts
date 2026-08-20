/**
 * HTTP and multipart request serialization utilities.
 *
 * @packageDocumentation
 */

/**
 * Represents a binary file or file payload to be uploaded to the Telegram Bot API.
 */
export interface InputFile {
  /**
   * Optional name of the file to attach.
   */
  filename?: string;
  /**
   * Binary data buffer, Blob, or file path/string.
   */
  data: Uint8Array | ArrayBuffer | Blob | string;
  /**
   * Optional MIME content type (e.g. `image/png`, `application/pdf`).
   */
  contentType?: string;
}

/**
 * Type guard to check if an arbitrary object conforms to the {@link InputFile} interface.
 *
 * @param obj - Object or value to check.
 * @returns `true` if `obj` is an {@link InputFile}, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isInputFile(payload.photo)) {
 *   console.log("Found file upload:", payload.photo.filename);
 * }
 * ```
 */
export function isInputFile(obj: unknown): obj is InputFile {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "data" in obj &&
    (typeof (obj as InputFile).data === "string" ||
      (obj as InputFile).data instanceof Uint8Array ||
      (obj as InputFile).data instanceof ArrayBuffer ||
      (typeof Blob !== "undefined" && (obj as InputFile).data instanceof Blob))
  );
}

/**
 * Builds either a JSON string body or a `FormData` multipart body for Telegram Bot API requests.
 *
 * Automatically inspects the payload properties for binary {@link InputFile} or `Blob` instances:
 * - If binary data is present, serializes as multipart `FormData`.
 * - If only primitive/JSON data is present, serializes as JSON with `application/json` header.
 *
 * @param payload - Key-value map of parameters to send with the Telegram API request.
 * @returns Object containing the serialized `body` and optional request `headers`.
 *
 * @example
 * ```ts
 * const { body, headers } = buildRequestBody({ chat_id: 12345, text: "Hello!" });
 * ```
 */
export function buildRequestBody(payload: Record<string, unknown>): {
  body: BodyInit;
  headers?: Record<string, string>;
} {
  let hasFiles = false;
  for (const value of Object.values(payload)) {
    if (value && (isInputFile(value) || value instanceof Blob)) {
      hasFiles = true;
      break;
    }
  }

  if (!hasFiles) {
    return {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    };
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;

    if (isInputFile(value)) {
      if (typeof value.data === "string") {
        formData.append(key, value.data);
      } else if (value.data instanceof Blob) {
        formData.append(key, value.data, value.filename);
      } else {
        const blob = new Blob([value.data as any], { type: value.contentType || "application/octet-stream" });
        formData.append(key, blob, value.filename);
      }
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  return { body: formData };
}

