export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

type ResponseShape<T> = {
  data: T;
  status: number;
};

async function handleResponse<T>(res: Response): Promise<ResponseShape<T>> {
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(
      typeof body === "string" ? body : body?.message || "Server Error"
    );
  }

  return { data: body, status: res.status };
}

function buildUrl(path: string) {
  if (!apiBaseUrl) return path; // fallback localhost
  return path.startsWith("/")
    ? `${apiBaseUrl}${path}`
    : `${apiBaseUrl}/${path}`;
}

export const api = {
  get<T>(path: string) {
    return fetch(buildUrl(path), {
      method: "GET",
    }).then(handleResponse<T>);
  },

  post<T>(path: string, data?: any) {
    const isForm = data instanceof FormData;
    return fetch(buildUrl(path), {
      method: "POST",
      body: isForm ? data : JSON.stringify(data),
      headers: isForm ? undefined : { "Content-Type": "application/json" },
    }).then(handleResponse<T>);
  },

  put<T>(path: string, data?: any) {
    const isForm = data instanceof FormData;
    return fetch(buildUrl(path), {
      method: "PUT",
      body: isForm ? data : JSON.stringify(data),
      headers: isForm ? undefined : { "Content-Type": "application/json" },
    }).then(handleResponse<T>);
  },

  delete<T>(path: string) {
    return fetch(buildUrl(path), {
      method: "DELETE",
    }).then(handleResponse<T>);
  },
};
