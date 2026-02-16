interface YamlPreviewProps {
  yaml: string;
}

export default function YamlPreview({ yaml }: YamlPreviewProps) {
  return (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm flex-1">
      <code>{yaml}</code>
    </pre>
  );
}
