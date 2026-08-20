"use client";

type UploadedDocument = {
  name: string;
  text: string;
};

type SearchBoxProps = {
  document?: UploadedDocument | null;
};

export default function SearchBox({
  document,
}: SearchBoxProps) {
  if (!document?.text) {
    return null;
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-300">
      <div className="font-medium text-white">
        {document.name}
      </div>

      <div className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap">
        {document.text}
      </div>
    </div>
  );
}