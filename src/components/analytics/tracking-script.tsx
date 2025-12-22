"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingScriptProps {
    projectPublicId: string;
    baseUrl: string;
}

export default function TrackingScript({ projectPublicId, baseUrl }: TrackingScriptProps) {
    const [activeTab, setActiveTab] = useState<"js" | "next">("js");
    const [copied, setCopied] = useState(false);

    const trackerUrl = `${baseUrl}/tracker.js`;

    const snippets = {
        js: `<script \n  src="${trackerUrl}" \n  data-project-id="${projectPublicId}"\n></script>`,
        next: `import Script from "next/script";\n\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <body>\n        {children}\n        <Script \n          src="${trackerUrl}" \n          data-project-id="${projectPublicId}" \n        />\n      </body>\n    </html>\n  );\n}`,
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(snippets[activeTab]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="bg-white border border-stone-200 rounded-[6px] overflow-hidden shadow-sm font-sans">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white border border-stone-200 rounded-md shadow-sm">
                        <Terminal className="w-4 h-4 text-stone-600" />
                    </div>
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
                    {copied ? "Copied!" : "Copy Code"}
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

                    <div className="bg-stone-950 rounded-lg p-5 overflow-x-auto min-h-[160px] flex items-center">
                        <pre className="text-xs md:text-sm font-mono text-stone-300 leading-relaxed">
                            <code>{snippets[activeTab]}</code>
                        </pre>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-stone-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>Script is ready to deploy. Data will appear automatically within seconds.</span>
                </div>
            </div>
        </section>
    );
}
