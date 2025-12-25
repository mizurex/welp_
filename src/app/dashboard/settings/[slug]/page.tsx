import { auth } from "../../../../../auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { updateProject, updateProjectDomain, deleteProject } from "@/lib/actions";
import TrackingScript from "@/components/analytics/tracking-script";
import { Settings, Trash2, Globe, LayoutGrid, Fingerprint, ChevronRight, Save, Wand2, AlertTriangle } from "lucide-react";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProjectSettingsPage({
    params,
}: PageProps) {
    const { slug } = await params;
    const projectPublicId = slug;

    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        redirect("/");
    }

    const email = session.user.email as string;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        redirect("/");
    }

    const project = await prisma.project.findUnique({
        where: { publicId: projectPublicId },
    });

    if (!project || project.ownerId !== user.id) {
        notFound();
    }

    const trackingEndpoint = process.env.NEXT_PUBLIC_URL || "https://welp.dev";

    return (
        <div className="min-h-screen bg-zinc-50 font-sans pb-20">
            <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <MobileMenuButton />
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Project Settings</h1>
                            <p className="text-sm text-stone-500 mt-0.5">Configure your tracking preferences </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                    {/* General Configuration Block */}
                    <div className="rounded-[6px] bg-bg-primary flex flex-col text-foreground border border-stone-300">
                        <div className="flex items-center rounded-[6px] rounded-b-none justify-between pl-[10px] pr-[3px] bg-muted border-b border-stone-200 gap-[4px] py-[4px]">
                            <p className="text-sm font-semibold text-foreground/80">
                                General Configuration
                            </p>
                            <div className="p-1 bg-white shadow-md rounded-[4.5px]">
                                <Settings className="size-3.5 text-stone-600" />
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Project Name Form */}
                            <form action={updateProject.bind(null, project.publicId)} className="relative group">
                                {/* Corner accents */}
                                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-stone-200 group-hover:border-primary transition-all" />
                                <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-stone-200 group-hover:border-primary transition-all" />

                                <div className="p-3 border border-stone-200 rounded-lg group-hover:border-stone-300 transition-colors">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Project Name</label>
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid className="size-4 text-stone-400" />
                                        <input
                                            name="name"
                                            defaultValue={project.name}
                                            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm font-medium outline-none"
                                        />
                                        <button type="submit" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Save</button>
                                    </div>
                                </div>
                            </form>

                            {/* Domain Form */}
                            <form action={updateProjectDomain.bind(null, project.publicId)} className="relative group">
                                <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-stone-200 group-hover:border-primary transition-all" />
                                <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-stone-200 group-hover:border-primary transition-all" />

                                <div className="p-3 border border-stone-200 rounded-lg group-hover:border-stone-300 transition-colors">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Domain</label>
                                    <div className="flex items-center gap-2">
                                        <Globe className="size-4 text-stone-400" />
                                        <input
                                            name="domain"
                                            defaultValue={project.domain}
                                            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm font-medium outline-none"
                                        />
                                        <button type="submit" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Save</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* API Credentials Block */}
                    <div className="rounded-[6px] bg-bg-primary flex flex-col text-foreground border border-stone-300">
                        <div className="flex items-center rounded-[6px] rounded-b-none justify-between pl-[10px] pr-[3px] bg-muted border-b border-stone-200 gap-[4px] py-[4px]">
                            <p className="text-sm font-semibold text-foreground/80">
                                API Credentials
                            </p>
                            <div className="p-1 bg-white shadow-md rounded-[4.5px]">
                                <Fingerprint className="size-3.5 text-stone-600" />
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block pl-1">Project Identifier</label>
                                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 group relative overflow-hidden">
                                    <span className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-primary/20" />
                                    <code className="text-xs font-mono text-stone-600 select-all block break-all">{project.publicId}</code>
                                </div>
                            </div>
                            <p className="text-[10px] text-stone-400 italic">This ID is required to initialize the tracker. Keep it secure.</p>
                        </div>
                    </div>

                    {/* Tracking Integration (Wide) */}
                    <div className="md:col-span-2">
                        <TrackingScript projectPublicId={project.publicId} baseUrl={trackingEndpoint} />
                    </div>

                    {/* Danger Zone Block (Wide) */}
                    <div className="md:col-span-2 rounded-[6px] bg-white flex flex-col text-foreground border border-blue-200">
                        <div className="flex items-center rounded-[6px] rounded-b-none justify-between pl-[10px] pr-[3px] bg-blue-50/50 border-b border-blue-100 gap-[4px] py-[4px]">
                            <p className="text-sm font-semibold text-blue-900 uppercase tracking-widest">
                                Danger Zone
                            </p>
                            <div className="p-1 bg-white shadow-sm rounded-[4.5px]">
                                <AlertTriangle className="size-3.5 text-blue-600" />
                            </div>
                        </div>

                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-stone-900">Delete Project</h3>
                                <p className="text-xs text-stone-500 leading-relaxed max-w-xl">
                                    Once you delete a project, there is no going back. Please be certain. All data, settings and history will be permanently erased.
                                </p>
                            </div>
                            <form action={deleteProject.bind(null, project.publicId)}>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-md hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                >
                                    Delete Permanently
                                </button>
                            </form>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
