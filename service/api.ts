const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "")

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_URL}/${path.replace(/^\//, "")}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  })

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data && typeof data === "object" && "message" in data
      ? data.message
      : null

    throw new ApiError(
      typeof message === "string"
        ? message
        : Array.isArray(message) && message.every((item) => typeof item === "string")
          ? message.join(". ")
          : `So'rov bajarilmadi (${response.status})`,
      response.status
    )
  }

  return data as T
}
