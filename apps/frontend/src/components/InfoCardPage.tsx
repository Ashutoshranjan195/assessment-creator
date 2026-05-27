import Link from 'next/link';

export default function InfoCardPage({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}): JSX.Element {
  return (
    <main className="mx-auto flex max-w-5xl items-center justify-center py-6 sm:py-10">
      <div className="w-full rounded-[32px] bg-white px-6 py-10 text-center shadow-[0_18px_40px_rgba(0,0,0,0.07)] sm:px-10 sm:py-14">
        <h1 className="text-[1.8rem] font-semibold tracking-tight text-slate-800 sm:text-[2.1rem]">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[1rem] leading-7 text-slate-500">{description}</p>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#171717] px-6 py-3 text-[15px] font-medium text-white shadow-[0_12px_26px_rgba(0,0,0,0.2)]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </main>
  );
}