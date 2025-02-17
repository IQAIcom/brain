import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export const formatMessageWithCodeBlocks = (text: string) => {
  // Split text into segments based on code block markers
  const segments = text.split(/(```[\s\S]*?```)/);

  console.log(segments, "segments");

  return segments.map((segment) => {
    if (segment.startsWith("```")) {
      const [firstLine, ...rest] = segment.slice(3, -3).split("\n");
      const language = firstLine.trim();
      const code = rest.join("\n");

      return (
        <div key={segment} className="relative">
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            {language}
          </div>
          <pre className="bg-muted p-4 rounded-md my-2 overflow-x-auto">
            <code className={`language-${language}`}>{code}</code>
          </pre>
          <div className="absolute bottom-2 right-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigator.clipboard.writeText(code)}
            >
              <Copy className="h-4 w-4 text-muted-foreground bg-red-400" />
            </Button>
          </div>
        </div>
      );
    }
    return segment;
  });
};
