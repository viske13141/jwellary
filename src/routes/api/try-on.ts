import { createFileRoute } from "@tanstack/react-router";
import { editCustomerImage } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/try-on")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (!origin || origin !== new URL(request.url).origin) {
          return new Response("This request could not be verified. Reload the page and try again.", { status: 403 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("The photo upload could not be read. Please try again.", { status: 400 });
        }

        const prompt = form.get("prompt");
        const images = [...form.entries()]
          .filter(([name]) => name === "image" || name === "image[]")
          .map(([, value]) => value)
          .filter((value): value is File => value instanceof File);
        if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 2_000) {
          return new Response("Please add a valid image instruction and try again.", { status: 400 });
        }
        if (images.length < 1 || images.length > 2) {
          return new Response("Please include a customer photo and one jewellery image.", { status: 400 });
        }
        if (images.some((value) => value.size > 12 * 1024 * 1024)) {
          return new Response("Each image must be 12 MB or smaller.", { status: 413 });
        }
        if (images.some((value) => !value.type.startsWith("image/"))) {
          return new Response("Please upload supported image files.", { status: 415 });
        }

        // UI workflow labels are not part of the image-editing API contract.
        form.delete("mode");
        const upstream = await editCustomerImage(form);
        const headers = new Headers({
          "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        });
        for (const [name, value] of upstream.headers) {
          if (name.toLowerCase().startsWith("x-lovable-aig-")) headers.set(name, value);
        }
        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});