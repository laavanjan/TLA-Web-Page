const SERVER_URL = "http://localhost:3001/api";

/**
 * A utility function to handle server requests.
 * @param {string} endpoint - The endpoint of the server.
 * @param {RequestInit} config - Configuration for the fetch request.
 * @returns {Promise<any>} - The response from the server.
 */
function server(endpoint, config = {}) {
  /** @type {RequestInit} */
  const _config = {
    credentials: "include", // Ensures cookies are included in requests.
    method: config.method || (config.body ? "POST" : "GET"),
    ...config,
  };

  return fetch(`${SERVER_URL}${endpoint}`, _config).then(async (response) => {
    if (!response.ok) {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }

    const type = response.headers.get("Content-Type");

    if (type && type.includes("application/json")) {
      return response.json();
    }

    return response.text();
  });
}

export async function login(data) {
  if (!data.email || !data.password) {
    throw new Error("Email or password is not provided");
  }
  return server("/users/login", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });
}

export async function currentUser() {
  return server("/users/current");
}

export async function logout() {
  return server("/users/logout", {
    method: "POST",
  });
}

export async function signup(formData) {
  // Log form data content
  formData.forEach((value, key) => {
    console.log(`from server file ${key}: ${value}`);
  });
  return server("/users", {
    method: "POST",
    body: formData,
  });
}

export async function createMemory(data) {
  const form = new FormData();
  form.append("title", data.title);
  form.append("description", data.description);

  data.images.forEach((image) => {
    form.append("images", image);
  });

  return server("/shared-memories", {
    method: "POST",
    body: form,
  });
}

export async function getAllSharedMemories() {
  return server("/shared-memories");
}

export async function updateUser(data, userId) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const endpoint = `/users/${userId}`;

  return server(endpoint, {
    method: "PUT",
    body: formData,
  });
}
