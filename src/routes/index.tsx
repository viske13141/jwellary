import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowLeft, Check, LoaderCircle, LockKeyhole, Sparkles, Upload, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import pearlEarrings from "@/assets/jewelry-pearl-earrings.jpg";
import emeraldPendant from "@/assets/jewelry-emerald-pendant.jpg";
import goldHoops from "@/assets/jewelry-gold-hoops.jpg";
import { streamImage } from "@/lib/stream-image";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lustre — Jewellery, made personal" },
      {
        name: "description",
        content: "Meet three considered pieces of jewellery and see how they look on you with a private AI try-on.",
      },
      { property: "og:title", content: "Lustre — Jewellery, made personal" },
      {
        property: "og:description",
        content: "Meet three considered pieces of jewellery and see how they look on you with a private AI try-on.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JewelleryTryOn,
});

type Product = {
  id: string;
  name: string;
  detail: string;
  image: string;
  alt: string;
  placement: string;
};

const products: Product[] = [
  {
    id: "pearl-drops",
    name: "Pearl Drop Earrings",
    detail: "A luminous everyday classic",
    image: pearlEarrings,
    alt: "Gold drop earrings finished with luminous white pearls",
    placement: "earlobes",
  },
  {
    id: "emerald-pendant",
    name: "Emerald Pendant",
    detail: "A little colour, close to the heart",
    image: emeraldPendant,
    alt: "Gold pendant set with a vivid green oval gemstone",
    placement: "neckline",
  },
  {
    id: "gold-hoops",
    name: "Sculpted Gold Hoops",
    detail: "Softly sculptural, always effortless",
    image: goldHoops,
    alt: "Pair of sculpted polished gold hoop earrings",
    placement: "earlobes",
  },
];

const dressColors = [
  { name: "Rose", utility: "swatch-rose" },
  { name: "Sage", utility: "swatch-sage" },
  { name: "Ivory", utility: "swatch-ivory" },
  { name: "Navy", utility: "swatch-navy" },
  { name: "Cobalt", utility: "swatch-cobalt" },
  { name: "Berry", utility: "swatch-berry" },
] as const;

function JewelleryTryOn() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(dressColors[0].name);
  const [busy, setBusy] = useState<"try-on" | "recolor" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!selectedProduct) return;
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedProduct]);

  const chooseProduct = (product: Product) => {
    setSelectedProduct(product);
    setPhoto(null);
    setPhotoPreview(null);
    setResult(null);
    setError(null);
    setSelectedColor(dressColors[0].name);
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;
    setError(null);
    setResult(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("This photo is larger than 12 MB. Choose a smaller image to continue.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const makeTryOn = async () => {
    if (!selectedProduct || !photo || busy) return;
    setBusy("try-on");
    setError(null);
    setResult(null);
    try {
      const resizedPhoto = await resizePhoto(photo);
      const productFile = await fetchProductImage(selectedProduct);
      const form = new FormData();
      form.append(
        "prompt",
        `Image 1 is the customer's real portrait photo. Image 2 is the exact ${selectedProduct.name} product reference. Create a realistic, natural-looking photograph of this same customer wearing this exact piece of jewellery, correctly placed at the ${selectedProduct.placement}. Match its design, gemstone, pearl, metal, shape and details precisely to the product reference; scale and light it naturally to the portrait. Keep the customer's face and identity, expression, pose, hairstyle, skin tone, body, clothing, background, lighting and camera framing unchanged. Do not add other jewellery, accessories, text or watermarks. Photorealistic, subtle and true to the source photograph.`,
      );
      form.append("image[]", resizedPhoto);
      form.append("image[]", productFile);
      await streamImage("/api/try-on", form, (image, isFinal) => {
        setResult(image);
        if (isFinal) setError(null);
      });
    } catch (cause) {
      setError(errorMessage(cause));
      setResult(null);
    } finally {
      setBusy(null);
    }
  };

  const applyColor = async () => {
    if (!selectedProduct || !result || busy) return;
    const previousResult = result;
    const color = dressColors.find((option) => option.name === selectedColor) ?? dressColors[0];
    setBusy("recolor");
    setError(null);
    try {
      const form = new FormData();
      form.append(
        "prompt",
        `Image 1 is the completed customer jewellery try-on. Change only the visible dress or garment to ${color.name.toLowerCase()}. Preserve the customer's exact face, identity, expression, pose, hairstyle, skin tone, body, jewellery design and placement, garment shape and fabric texture, background, lighting and camera framing. Do not change, remove, add or reinterpret any other detail. Make the new garment colour look natural under the original lighting.`,
      );
      form.append("image[]", await dataUrlToFile(previousResult));
      await streamImage("/api/try-on", form, (image, isFinal) => {
        setResult(image);
        if (isFinal) setError(null);
      });
    } catch (cause) {
      setResult(previousResult);
      setError(errorMessage(cause));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Lustre home">
            <span className="brand-mark" aria-hidden="true">L</span>
            <span className="font-display text-[19px] font-semibold leading-none">lustre</span>
          </a>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:block">
            Jewellery, made personal
          </span>
          <a href="#collection" className="text-xs font-medium text-foreground transition-colors hover:text-primary">
            The collection <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section id="top" className="mx-auto grid max-w-7xl gap-7 px-5 pb-9 pt-10 sm:px-8 sm:pb-12 sm:pt-14 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-8">
        <div>
          <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
            <span className="eyebrow-rule" aria-hidden="true" /> A more personal kind of try-on
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-medium leading-[1.08] sm:text-5xl">
            The finishing touch,<br className="hidden sm:block" /> made <span className="text-gold">yours.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            Three considered pieces. One little glimpse of how they might feel on you.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground lg:mb-1">
          <LockKeyhole className="size-3.5 text-gold" strokeWidth={1.6} />
          <span>Your photo stays private and is never saved.</span>
        </div>
      </section>

      <section id="collection" className="border-y border-border/70 bg-catalog">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-medium">The collection</h2>
            <span className="text-xs text-muted-foreground">Three pieces to discover</span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4 lg:gap-6">
            {products.map((product, index) => {
              const isSelected = selectedProduct?.id === product.id;
              return (
                <article key={product.id} className={`product-item ${isSelected ? "product-item-selected" : ""}`}>
                  <div className="product-photo-wrap">
                    <img
                      src={product.image}
                      alt={product.alt}
                      width={1024}
                      height={1280}
                      loading="lazy"
                      className="product-photo"
                    />
                    <span className="product-number">0{index + 1}</span>
                    {isSelected ? <span className="product-check" aria-label="Selected"><Check className="size-3.5" /></span> : null}
                  </div>
                  <div className="flex items-start justify-between gap-3 pt-3.5">
                    <div className="min-w-0">
                      <h3 className="font-display text-[17px] font-medium leading-5">{product.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{product.detail}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? "secondary" : "outline"}
                      className="shrink-0"
                      disabled={busy !== null}
                      onClick={() => chooseProduct(product)}
                    >
                      {isSelected ? "Selected" : "Try On"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {selectedProduct ? (
        <section ref={workspaceRef} className="mx-auto max-w-7xl scroll-mt-6 px-5 py-10 sm:px-8 sm:py-14">
          <div className="mb-7 flex items-center justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Your fitting room</p>
              <h2 className="mt-1.5 font-display text-2xl font-medium">{selectedProduct.name}</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                setSelectedProduct(null);
                setPhoto(null);
                setPhotoPreview(null);
                setResult(null);
                setError(null);
              }}
            >
              <ArrowLeft className="size-3.5" /> Collection
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div>
              <label htmlFor="customer-photo" className="mb-2 block text-sm font-medium">Your photo</label>
              <p className="mb-4 text-xs leading-5 text-muted-foreground">
                Choose a clear photo with your face and {selectedProduct.placement === "neckline" ? "neckline" : "ears"} visible.
              </p>
              <input
                ref={fileInputRef}
                id="customer-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => handlePhoto(event.currentTarget.files?.[0])}
              />
              <button
                type="button"
                className={`upload-zone ${photoPreview ? "upload-zone-ready" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                aria-describedby="photo-privacy"
                disabled={busy !== null}
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Your selected photo" className="upload-preview" />
                    <span className="mt-3 text-sm font-medium">{photo?.name}</span>
                    <span className="mt-1 text-xs text-muted-foreground">Choose a different photo</span>
                  </>
                ) : (
                  <>
                    <span className="upload-icon"><Upload className="size-4" strokeWidth={1.7} /></span>
                    <span className="mt-3 text-sm font-medium">Choose a photo</span>
                    <span className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP · up to 12 MB</span>
                  </>
                )}
              </button>
              <div id="photo-privacy" className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
                <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-gold" strokeWidth={1.6} />
                <span>Sent privately for your try-on, then held only in this browser session.</span>
              </div>
              <Button
                type="button"
                size="lg"
                className="mt-5 w-full"
                disabled={!photo || busy !== null}
                onClick={() => void makeTryOn()}
              >
                {busy === "try-on" ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {busy === "try-on" ? "Creating your try-on…" : "Generate Try-On"}
              </Button>
            </div>

            <div aria-live="polite" aria-busy={busy !== null}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Your preview</span>
                {result ? <span className="text-[11px] text-muted-foreground">Made just for you</span> : null}
              </div>
              {result ? (
                <div className="result-frame">
                  <img
                    src={result}
                    alt={`Your try-on with ${selectedProduct.name}`}
                    className={`result-image ${busy ? "result-image-working" : ""}`}
                  />
                  {busy ? (
                    <div className="result-progress">
                      <LoaderCircle className="size-4 animate-spin" />
                      <span>{busy === "recolor" ? "Changing the colour…" : "Finishing your preview…"}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="result-empty">
                  {busy === "try-on" ? (
                    <>
                      <LoaderCircle className="size-6 animate-spin text-gold" />
                      <p className="mt-3 text-sm font-medium">A little moment, just for you</p>
                      <p className="mt-1 text-xs text-muted-foreground">Your private preview is taking shape.</p>
                    </>
                  ) : (
                    <>
                      <span className="result-empty-mark"><WandSparkles className="size-5" strokeWidth={1.5} /></span>
                      <p className="mt-3 text-sm font-medium">Your preview will appear here</p>
                      <p className="mt-1 max-w-[250px] text-center text-xs leading-5 text-muted-foreground">
                        Add your photo to see how this piece looks on you.
                      </p>
                    </>
                  )}
                </div>
              )}

              {error ? (
                <p role="alert" className="mt-3 border-l-2 border-destructive px-3 py-2 text-xs leading-5 text-destructive">
                  {error}
                </p>
              ) : null}

              {result ? (
                <div className="mt-5 border-t border-border/70 pt-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">Try a different colour</p>
                      <p className="mt-1 text-xs text-muted-foreground">Choose a shade for your outfit.</p>
                      <div className="mt-3 flex items-center gap-2" role="group" aria-label="Dress colour">
                        {dressColors.map((color) => (
                          <Button
                            key={color.name}
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={color.name}
                            aria-pressed={selectedColor === color.name}
                            title={color.name}
                            className={`color-choice ${color.utility} ${selectedColor === color.name ? "color-choice-selected" : ""}`}
                            onClick={() => setSelectedColor(color.name)}
                            disabled={busy !== null}
                          >
                            {selectedColor === color.name ? <Check className="size-3.5" /> : null}
                          </Button>
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">{selectedColor}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:pb-0.5">
                      <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void applyColor()}>
                        {busy === "recolor" ? <LoaderCircle className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}
                        {busy === "recolor" ? "Applying…" : "Apply Color"}
                      </Button>
                      <Button asChild variant="secondary" disabled={busy !== null}>
                        <a href={result} download={`${selectedProduct.id}-try-on.png`}>
                          <ArrowDownToLine className="size-4" /> Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© Lustre Jewellery</span>
          <span className="flex items-center gap-1.5"><LockKeyhole className="size-3 text-gold" /> Your photo is private. Your choice is yours.</span>
        </div>
      </footer>
    </main>
  );
}

async function resizePhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const longestEdge = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, 1536 / longestEdge);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Your photo could not be prepared. Please choose another image.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Your photo could not be prepared. Please choose another image.");
  return new File([blob], "private-photo.jpg", { type: "image/jpeg" });
}

async function fetchProductImage(product: Product): Promise<File> {
  const response = await fetch(product.image);
  if (!response.ok) throw new Error("The selected jewellery could not be loaded. Please try again.");
  const blob = await response.blob();
  return new File([blob], `${product.id}.jpg`, { type: blob.type || "image/jpeg" });
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], "try-on-result.png", { type: blob.type || "image/png" });
}

function errorMessage(cause: unknown): string {
  if (!(cause instanceof Error)) return "Your preview could not be created. Please try again.";
  const rawMessage = cause.message.trim();
  try {
    const parsed = JSON.parse(rawMessage.replace(/^Image generation failed:\s*\d+\s*/, "")) as {
      error?: { message?: string };
      message?: string;
    };
    return parsed.error?.message ?? parsed.message ?? rawMessage;
  } catch {
    return rawMessage || "Your preview could not be created. Please try again.";
  }
}