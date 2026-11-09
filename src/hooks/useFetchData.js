import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function getJson(path, signal) {
  let res;

  try {
    res = await fetch(`${API_URL}${path}`, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;

    throw new Error(
      "Cannot reach the server. Please try again."
    );
  }

  const contentType = res.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    const responseText = await res.text();

    console.error("Invalid API response:", {
      url: res.url,
      status: res.status,
      contentType,
      response: responseText.substring(0, 300),
    });

    throw new Error(
      `The server returned an invalid response (${res.status}). Please check the API URL and backend route.`
    );
  }

  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("The server returned invalid JSON.");
  }

  if (!res.ok) {
    throw new Error(
      data.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

export function useFetchData(path) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: "",
  });

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState((previous) => ({
      ...previous,
      loading: true,
      error: "",
    }));

    getJson(path, controller.signal)
      .then((data) => {
        setState({
          data,
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        setState({
          data: null,
          loading: false,
          error: error.message,
        });
      });

    return () => controller.abort();
  }, [path, reloadKey]);

  return {
    ...state,
    reload: () => setReloadKey((key) => key + 1),
  };
}
