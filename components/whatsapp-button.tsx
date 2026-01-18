"use client";

export default function WhatsAppButton({
  phone,
  message,
}: {
  phone: string;
  message: string;
}) {
  const href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-full items-center justify-center rounded bg-pink-500 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-600"
    >
      Pedir por Whatsapp
    </a>
  );
}
