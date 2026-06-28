import Link from "next/link";

type Props = {
  address: string;
  tokenIds: number[];
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function PublicRosterGrid({ address, tokenIds }: Props) {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h1 className="font-pixel-square text-3xl text-neutral-900">Roster</h1>
        <p className="font-mono text-sm text-neutral-400">{shortAddr(address)}</p>
        <p className="text-base text-neutral-500">
          {tokenIds.length} normie{tokenIds.length === 1 ? "" : "s"} on file.
        </p>
      </div>

      {tokenIds.length === 0 ? (
        <p className="text-base text-neutral-500">No normies on this wallet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 items-start">
          {tokenIds.map((id) => (
            <Link
              key={id}
              href={`/collections/normies/works/${id}`}
              className="group block bg-white rounded-xl p-1 space-y-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.09)] transition-shadow"
            >
              <div className="overflow-hidden bg-neutral-100 rounded-t-[10px] rounded-b-[5px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.normies.art/normie/${id}/image.svg`}
                  alt={`normie #${id}`}
                  className="block w-full"
                />
              </div>
              <div className="bg-neutral-100 rounded-t-[5px] rounded-b-[10px] px-2 py-2">
                <p className="font-mono text-sm text-neutral-400 tabular-nums group-hover:text-neutral-600">
                  #{String(id).padStart(4, "0")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
