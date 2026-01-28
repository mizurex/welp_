"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Check, X } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { createProject, checkDomainExists } from "@/lib/actions";

// Validation helpers
function validateName(name: string): string | null {
    const trimmed = name.trim();
    if (trimmed.length < 3) return "Name must be at least 3 characters";
    if (trimmed.length > 50) return "Name must be less than 50 characters";
    return null;
}

function validateDomainFormat(domain: string): string | null {
    if (!domain.trim()) return "Domain is required";
    
    // Remove protocol and www if present
    const cleaned = domain.trim().replace(/^(https?:\/\/)?(www\.)?/, "").toLowerCase();
    
    // Domain pattern: something.tld (e.g., example.com, site.co.uk)
    const domainPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/;
    
    if (!domainPattern.test(cleaned)) {
        return "Enter a valid domain (e.g., example.com)";
    }
    
    return null;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export function CreateProjectSheet() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const [errors, setErrors] = useState<{ name?: string; domain?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Domain checking state
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [domainExists, setDomainExists] = useState<boolean | null>(null);
    
    // Debounce domain input (500ms delay)
    const debouncedDomain = useDebounce(domain, 500);

    // Check domain availability when debounced value changes
    useEffect(() => {
        const checkDomain = async () => {
            // Only check if domain format is valid
            const formatError = validateDomainFormat(debouncedDomain);
            if (formatError || !debouncedDomain.trim()) {
                setDomainExists(null);
                return;
            }

            setIsCheckingDomain(true);
            try {
                const result = await checkDomainExists(debouncedDomain);
                setDomainExists(result.exists);
                if (result.exists) {
                    setErrors(prev => ({ ...prev, domain: "This domain is already registered" }));
                } else {
                    setErrors(prev => ({ ...prev, domain: undefined }));
                }
            } catch (error) {
                console.error("Error checking domain:", error);
            } finally {
                setIsCheckingDomain(false);
            }
        };

        checkDomain();
    }, [debouncedDomain]);

    // Real-time format validation
    const nameError = validateName(name);
    const domainFormatError = validateDomainFormat(domain);
    
    // Form is valid only if: name is valid, domain format is valid, domain doesn't exist, and we're not checking
    const isValid = !nameError && !domainFormatError && domainExists === false && !isCheckingDomain;

    const handleNameChange = (value: string) => {
        setName(value);
        if (errors.name && !validateName(value)) {
            setErrors(prev => ({ ...prev, name: undefined }));
        }
    };

    const handleDomainChange = (value: string) => {
        setDomain(value);
        setDomainExists(null); // Reset check status when typing
        if (errors.domain) {
            setErrors(prev => ({ ...prev, domain: undefined }));
        }
    };

    const handleBlur = (field: "name" | "domain") => {
        if (field === "name" && nameError) {
            setErrors(prev => ({ ...prev, name: nameError }));
        } else if (field === "domain" && domainFormatError) {
            setErrors(prev => ({ ...prev, domain: domainFormatError }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Final validation check
        if (nameError || domainFormatError || domainExists) {
            setErrors({ 
                name: nameError || undefined, 
                domain: domainFormatError || (domainExists ? "This domain is already registered" : undefined)
            });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("domain", domain.trim().replace(/^(https?:\/\/)?(www\.)?/, "").toLowerCase());
            
            await createProject(formData);
            
            // Reset form on success
            setName("");
            setDomain("");
            setErrors({});
            setDomainExists(null);
            setOpen(false);
        } catch (error) {
            console.error("Failed to create project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when sheet closes
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setName("");
            setDomain("");
            setErrors({});
            setDomainExists(null);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    New
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6">
                <SheetHeader>
                    <SheetTitle>Create new project</SheetTitle>
                    <SheetDescription>
                        Add a new project to start tracking its analytics.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-900">
                            Project name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onBlur={() => handleBlur("name")}
                            className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors ${
                                errors.name 
                                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                                    : "border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary"
                            }`}
                            placeholder="My website"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name}</p>
                        )}
                        <p className="text-xs text-stone-400">3-50 characters</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-900">
                            Domain
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="domain"
                                value={domain}
                                onChange={(e) => handleDomainChange(e.target.value)}
                                onBlur={() => handleBlur("domain")}
                                className={`w-full bg-white border rounded-lg px-3 py-2 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors ${
                                    errors.domain || domainExists
                                        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                                        : domainExists === false
                                        ? "border-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        : "border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary"
                                }`}
                                placeholder="example.com"
                            />
                            {/* Status indicator on the right */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isCheckingDomain && (
                                    <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                                )}
                                {!isCheckingDomain && domainExists === false && !domainFormatError && (
                                    <Check className="w-4 h-4 text-green-500" />
                                )}
                                {!isCheckingDomain && domainExists === true && (
                                    <X className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                        </div>
                        {errors.domain && (
                            <p className="text-xs text-red-500">{errors.domain}</p>
                        )}
                        {!errors.domain && domainExists === false && !domainFormatError && (
                            <p className="text-xs text-green-600">Domain available</p>
                        )}
                        <p className="text-xs text-stone-400">Without http:// or www</p>
                    </div>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Project"
                        )}
                    </button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
