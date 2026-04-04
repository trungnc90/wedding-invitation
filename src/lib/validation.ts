export interface ValidationResult {
  valid: boolean;
  fields: Record<string, string>;
}

export function validateRSVP(payload: unknown): ValidationResult {
  const fields: Record<string, string> = {};

  if (typeof payload !== "object" || payload === null) {
    return { valid: false, fields: { _form: "Invalid payload" } };
  }

  const data = payload as Record<string, unknown>;

  // Name: required, non-empty string, max 100 chars
  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    fields.name = "Name is required";
  } else if (data.name.trim().length > 100) {
    fields.name = "Name must be at most 100 characters";
  }

  // Attending: required, boolean
  if (typeof data.attending !== "boolean") {
    fields.attending = "Attendance confirmation is required";
  }

  // NumberOfAttendees: required when attending=true, integer 1-10
  if (data.attending === true) {
    if (
      typeof data.numberOfAttendees !== "number" ||
      !Number.isInteger(data.numberOfAttendees) ||
      data.numberOfAttendees < 1 ||
      data.numberOfAttendees > 10
    ) {
      fields.numberOfAttendees =
        "Number of attendees must be an integer between 1 and 10";
    }
  }

  // Message: optional, max 500 chars
  if (data.message !== undefined && data.message !== null) {
    if (typeof data.message !== "string") {
      fields.message = "Message must be a string";
    } else if (data.message.length > 500) {
      fields.message = "Message must be at most 500 characters";
    }
  }

  return { valid: Object.keys(fields).length === 0, fields };
}

export function validateWish(payload: unknown): ValidationResult {
  const fields: Record<string, string> = {};

  if (typeof payload !== "object" || payload === null) {
    return { valid: false, fields: { _form: "Invalid payload" } };
  }

  const data = payload as Record<string, unknown>;

  // Name: required, non-empty string, max 100 chars
  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    fields.name = "Name is required";
  } else if (data.name.trim().length > 100) {
    fields.name = "Name must be at most 100 characters";
  }

  // Message: required, non-empty string, max 1000 chars
  if (typeof data.message !== "string" || data.message.trim().length === 0) {
    fields.message = "Message is required";
  } else if (data.message.trim().length > 1000) {
    fields.message = "Message must be at most 1000 characters";
  }

  return { valid: Object.keys(fields).length === 0, fields };
}
