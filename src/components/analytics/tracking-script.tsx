"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface TrackingScriptProps {
    projectPublicId: string;
    baseUrl: string;
}

export default function TrackingScript({ projectPublicId, baseUrl }: TrackingScriptProps) {
    const [activeTab, setActiveTab] = useState<"js" | "next">("js");
    const [copied, setCopied] = useState(false);

    const trackerUrl = `${baseUrl}/tracker.js`;

    const snippets = {
        js: `<script 
  src="${trackerUrl}" 
  data-project-id="${projectPublicId}"
></script>`,
        next: `import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script 
          src="${trackerUrl}" 
          data-project-id="${projectPublicId}" 
        />
      </body>
    </html>
  );
}`,
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(snippets[activeTab]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="bg-white border border-stone-200 rounded-[6px] overflow-hidden shadow-sm font-sans">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                 
                    <div>
                        <h2 className="text-sm font-semibold text-stone-900">Tracking Installation</h2>
                        <p className="text-xs text-stone-500">Add the snippet below to start collecting data</p>
                    </div>
                </div>

                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:opacity-90 transition-all shadow-sm active:scale-95"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                   
                </button>
            </div>

            <div className="p-4">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-stone-100 rounded-lg w-fit mb-4">
                    <button
                        onClick={() => setActiveTab("js")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            activeTab === "js"
                                ? "bg-white text-stone-900 shadow-sm"
                                : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        HTML / JavaScript
                    </button>
                    <button
                        onClick={() => setActiveTab("next")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            activeTab === "next"
                                ? "bg-white text-stone-900 shadow-sm"
                                : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        Next.js
                    </button>
                </div>

                {/* Code Editor Area */}
                <div className="relative group">
                    {/* Corner accents to match your Top Pages style */}
                    <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-stone-300 group-hover:border-primary transition-all rounded-tl-sm" />
                    <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-stone-300 group-hover:border-primary transition-all rounded-tr-sm" />
                    <span className="pointer-events-none absolute left-0 bottom-0 h-3 w-3 border-l border-b border-stone-300 group-hover:border-primary transition-all rounded-bl-sm" />
                    <span className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 border-r border-b border-stone-300 group-hover:border-primary transition-all rounded-br-sm" />

                    <div className="overflow-hidden">
                        <SyntaxHighlighter
                            language={activeTab === "js" ? "html" : "jsx"}
                            style={oneLight}
                            customStyle={{
                                margin: 0,
                                padding: "1.25rem",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                lineHeight: "1.6",
                                minHeight: "160px",
                                borderRadius: "0.5rem",
                            }}
                            showLineNumbers={false}
                        >
                            {snippets[activeTab]}
                        </SyntaxHighlighter>
                    </div>
                </div>


            </div>
        </section>
    );
}
