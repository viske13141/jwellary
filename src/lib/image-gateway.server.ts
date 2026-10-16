import { editImage, type ImageConfig } from "@/lib/image-request.server";

export const imageSettings: Omit<ImageConfig, "apiKey"> = {
  baseURL: "https://ai.gateway.lovable.dev",
  model: "openai/gpt-image-2.5-flare",
  format: "openai",
};

export async function editCustomerImage(form: FormData): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return new Response("Image editing is not configured yet.", { status: 503 });

  form.set("model", imageSettings.model);
  form.set("quality", "low");
  form.set("output_format", "png");

  return editImage({ ...imageSettings, apiKey }, form);
}