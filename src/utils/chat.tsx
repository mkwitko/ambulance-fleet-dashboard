export function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

  return text.split(urlRegex).map((part, i) => {
    if (urlRegex.test(part)) {
      const url = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline break-words"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
