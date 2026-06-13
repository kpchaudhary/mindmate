function parseBlock(block: string): React.ReactNode {
  const lines = block.split("\n").filter(Boolean);
  const isList = lines.every((line) => /^[-*]\s/.test(line));

  if (isList && lines.length > 0) {
    return (
      <ul className="list-inside list-disc space-y-1">
        {lines.map((line) => (
          <li key={line}>{line.replace(/^[-*]\s/, "")}</li>
        ))}
      </ul>
    );
  }

  return <p>{block}</p>;
}

export function MarkdownLite({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, i) => (
        <div key={i}>{parseBlock(block)}</div>
      ))}
    </div>
  );
}
