import Link from "next/link";

export default function V2CheckoutExplainer() {
  return (
    <main className="min-h-[60vh] grid place-items-center bg-white">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold">We’re creating your session…</h1>
        <p className="mt-3 text-gray-600">
          If your browser didn’t redirect, you can try again or return to pricing.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/v2/pricing" className="underline text-gray-700">
            Back to pricing
          </Link>
          <Link href="/v2/checkout" className="underline text-gray-700">
            Try again
          </Link>
        </div>
      </div>
    </main>
  );
}
