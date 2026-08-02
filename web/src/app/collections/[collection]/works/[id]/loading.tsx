export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-start pt-12 pb-24 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start animate-pulse">
        <div className="w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1 space-y-1">
          <div className="bg-neutral-100 rounded-t-[10px] rounded-b-[5px] aspect-square" />
          <div className="bg-neutral-100 rounded-[5px] p-3.5 space-y-3">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-8 w-3/4 bg-neutral-200 rounded" />
            <div className="h-4 w-full bg-neutral-200 rounded" />
          </div>
        </div>
        <div className="hidden lg:block rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 space-y-3">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-4 w-full bg-neutral-100 rounded" />
          <div className="h-4 w-5/6 bg-neutral-100 rounded" />
          <div className="h-24 w-full bg-neutral-100 rounded-lg mt-2" />
        </div>
      </div>
    </main>
  );
}
