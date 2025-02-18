import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "./utils";
import { useState } from "react";

export const MarkDown = ({text}: {text: string}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Code blocks with syntax highlighting
        code: ({ node, inline, className, children, ...props }) => {
          const [copied, setCopied] = useState(false);
          
          const handleCopy = () => {
            navigator.clipboard.writeText(String(children));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
          };

          if (inline) {
            return (
              <code className='bg-muted px-1.5 py-0.5 rounded-sm' {...props}>
                {children}
              </code>
            );
          }

          const language = className?.replace("language-", "");
          return (
            <div className='relative min-h-8'>
              {language && (
                <div className='text-xs text-muted-foreground absolute top-2 right-2'>
                  {language}
                </div>
              )}
              <pre className='bg-muted p-4 rounded-md my-2 overflow-x-auto'>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
              <div className='absolute bottom-2 right-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className='h-4 w-4 text-green-500' />
                  ) : (
                    <Copy className='h-4 w-4 text-muted-foreground' />
                  )}
                </Button>
              </div>
            </div>
          );
        },        // Lists with proper indentation
        li: ({ className, ...props }) => (
          <li className={cn("ml-4", className)} {...props} />
        ),
        ol: ({ className, ...props }) => (
          <ol className={cn("ml-4 list-decimal", className)} {...props} />
        ),
        ul: ({ className, ...props }) => (
          <ul className={cn("ml-4 list-disc", className)} {...props} />
        ),
        // Links with styling
        a: ({ className, ...props }) => (
          <a className={cn("text-blue-500 hover:underline", className)} {...props} />
        ),
        // Headers with proper spacing
        h1: ({ className, ...props }) => (
          <h1 className={cn("text-2xl font-bold mt-6 mb-4", className)} {...props} />
        ),
        h2: ({ className, ...props }) => (
          <h2 className={cn("text-xl font-bold mt-5 mb-3", className)} {...props} />
        ),
        h3: ({ className, ...props }) => (
          <h3 className={cn("text-lg font-bold mt-4 mb-2", className)} {...props} />
        ),
        // Blockquotes
        blockquote: ({ className, ...props }) => (
          <blockquote className={cn("border-l-4 border-muted pl-4 italic", className)} {...props} />
        ),
        // Tables
        table: ({ className, ...props }) => (
          <table className={cn("border-collapse table-auto w-full", className)} {...props} />
        ),
        th: ({ className, ...props }) => (
          <th className={cn("border px-4 py-2 bg-muted", className)} {...props} />
        ),
        td: ({ className, ...props }) => (
          <td className={cn("border px-4 py-2", className)} {...props} />
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
};