interface Props {
  content: string;
}

export default function UserMessage({ content }: Props) {
  return (
    <div className="flex justify-end mb-3">
      <div className="bg-gradient-to-br from-orange-400 to-rose-500 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[75%] text-sm shadow-md leading-relaxed whitespace-pre-wrap break-words font-medium">
        {content}
      </div>
    </div>
  );
}