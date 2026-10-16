export type ImageConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  format: "openai" | "gemini-chat" | "generate-content" | "cloudflare-input";
};

export async function editImage(config: ImageConfig, form: FormData): Promise<Response> {
  const prompt = form.get("prompt");
  const images = [...form.entries()].filter(
    ([name, value]) => (name === "image" || name === "image[]") && value instanceof File,
  );
  if (typeof prompt !== "string" || !prompt.trim() || images.length === 0) {
    return new Response("A photo and edit instruction are required.", { status: 400 });
  }

  form.set("model", config.model);
  if (form.get("stream") !== "false") {
    form.set("stream", "true");
    if (!form.has("partial_images")) form.set("partial_images", "1");
  } else {
    form.delete("stream");
    form.delete("partial_images");
  }

  return fetch(`${config.baseURL}/v1/images/edits`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: form,
  });
}