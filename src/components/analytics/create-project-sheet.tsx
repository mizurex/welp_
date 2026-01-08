"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { createProject } from "@/lib/actions";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                </>
            ) : (
                "Create Project"
            )}
        </button>
    );
}

export function CreateProjectSheet() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add project
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6">
                <SheetHeader>
                    <SheetTitle>Create new project</SheetTitle>
                    <SheetDescription>
                        Add a new project to start tracking its analytics.
                    </SheetDescription>
                </SheetHeader>
                <form
                    action={async (formData) => {
                        await createProject(formData);
                    }}
                    className="mt-6 space-y-4"
                >
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-900">
                            Project name
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="My website"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-900">
                            Domain
                        </label>
                        <input
                            type="text"
                            name="domain"
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="example.com"
                            required
                        />
                    </div>
                    <SubmitButton />
                </form>
            </SheetContent>
        </Sheet>
    );
}
