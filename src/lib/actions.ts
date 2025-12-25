"use server";

import prisma from "@/lib/prisma";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateProjectId(): string {
    const randomPart = Math.random().toString(36).slice(2);
    const timePart = Date.now().toString(36);
    return "prj_" + randomPart + timePart;
}

export async function createProject(formData: FormData) {
    console.log("Creating project...");
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return;
    }

    const email = session.user.email as string;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return;
    }

    const nameValue = formData.get("name");
    const domainValue = formData.get("domain");

    const name = typeof nameValue === "string" ? nameValue.trim() : "";
    const domain = typeof domainValue === "string" ? domainValue.trim() : "";

    if (!name || !domain) {
        return;
    }

    const projectId = generateProjectId();

    await prisma.project.create({
        data: {
            name,
            domain,
            publicId: projectId,
            ownerId: user.id,
            analytics: {
                create: {
                    totalPageVisits: 0,
                    totalVisits: 0,
                },
            },
        },
    });

    revalidatePath("/dashboard/analytics");
    redirect(`/dashboard/analytics/${projectId}`);
}

export async function updateProject(projectId: string, formData: FormData) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    const nameValue = formData.get("name");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";

    if (!name) {
        throw new Error("Name is required");
    }

    await prisma.project.update({
        where: { publicId: projectId },
        data: { name },
    });

    revalidatePath(`/dashboard/settings/${projectId}`);
    revalidatePath("/dashboard/analytics");
}

export async function updateProjectDomain(projectId: string, formData: FormData) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    const domainValue = formData.get("domain");
    const domain = typeof domainValue === "string" ? domainValue.trim() : "";

    if (!domain) {
        throw new Error("Domain is required");
    }

    await prisma.project.update({
        where: { publicId: projectId },
        data: { domain },
    });

    revalidatePath(`/dashboard/settings/${projectId}`);
    revalidatePath("/dashboard/analytics");
}

export async function deleteProject(projectId: string) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    const email = session.user.email as string;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const project = await prisma.project.findUnique({
        where: { publicId: projectId },
    });

    if (!project || project.ownerId !== user.id) {
        throw new Error("Project not found or unauthorized");
    }

    // Delete project
    await prisma.project.delete({
        where: { publicId: projectId },
    });

    revalidatePath("/dashboard/analytics");
    redirect("/dashboard/analytics");
}
