# Golden Try-On

Build a minimal, single-page AI Jewellery Virtual Try-On website using React and Tailwind CSS.

Important:

Enable Lovable Cloud.

Enable Lovable AI for image generation and editing.

Use only Lovable's built-in AI capabilities and Cloud backend.

Do not use OpenAI, Gemini, or any external API keys.

If Lovable AI does not support image editing directly, explain the limitation instead of creating fake results.

UI Requirements:

Display only 3 jewellery products with images and "Try On" buttons.

When a customer clicks "Try On", allow them to upload their photo.

Add a "Generate Try-On" button.

Use Lovable Cloud and its available AI image-editing capabilities to generate a realistic image of the customer wearing the selected jewellery.

Display the generated image on the same page.

Below the image, add a small dress color picker with 6 colors.

When the customer selects a color and clicks "Apply Color", generate a new image with the dress changed to that color.

Preserve the customer's face, pose, hairstyle, skin tone, background, and jewellery.

Add a "Download Image" button.

Design:

Very simple, clean, white UI with subtle gold accents.

Single page only, mobile responsive.

No login, cart, payments, or extra pages.

Backend:

Use Lovable Cloud for backend functions and image storage only if needed.

Use Lovable AI for supported AI operations.

Keep uploaded customer photos private.

Show loading indicators and error messages.

Do not use mock responses or placeholder generated images.

Keep the implementation lightweight to minimize Lovable credits.

Build the complete functional website, not just the UI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/904bd008-a318-415b-9d7c-12dc5ac573c2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
