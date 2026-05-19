import { Raleway } from "next/font/google";

const raleway = Raleway({
  weight: "700",
  subsets: ["latin"],
});

type InvoiceLogoProps = {
  className?: string;
};

export function InvoiceLogo({ className }: InvoiceLogoProps) {
  return (
    <a
      href="https://toms.work"
      className={`${raleway.className} inline-block text-5xl leading-none font-bold tracking-[-0.06em] text-black no-underline decoration-transparent lowercase visited:text-black hover:text-black ${className ?? ""}`}
      aria-label="Tom Hubble"
    >
      tw
    </a>
  );
}
