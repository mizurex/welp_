"use server";

import { query, queryOne, transaction } from "@/lib/db";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User, Project } from "@/types/models";

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

    const user = await queryOne<User>(
        `SELECT * FROM "User" WHERE "email" = $1`,
        [email]
    );

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

    // Create project and analytics in a transaction
    await transaction(async (q) => {
        const project = (await q<Project>(
            `INSERT INTO "Project" ("publicId", "name", "domain", "ownerId")
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [projectId, name, domain, user.id]
        ))[0];

        await q(
            `INSERT INTO "Analytics" ("projectId", "totalPageVisits", "totalVisits", "avgDuration", "bounceRate")
             VALUES ($1, 0, 0, 0, 0)`,
            [project.id]
        );
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

    await query(
        `UPDATE "Project" SET "name" = $2 WHERE "publicId" = $1`,
        [projectId, name]
    );

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

    await query(
        `UPDATE "Project" SET "domain" = $2 WHERE "publicId" = $1`,
        [projectId, domain]
    );

    revalidatePath(`/dashboard/settings/${projectId}`);
    revalidatePath("/dashboard/analytics");
}

export async function deleteProject(projectId: string) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    const email = session.user.email as string;

    const user = await queryOne<User>(
        `SELECT * FROM "User" WHERE "email" = $1`,
        [email]
    );

    if (!user) {
        throw new Error("User not found");
    }

    const project = await queryOne<Project>(
        `SELECT * FROM "Project" WHERE "publicId" = $1`,
        [projectId]
    );

    if (!project || project.ownerId !== user.id) {
        throw new Error("Project not found or unauthorized");
    }

    // Delete project and related data in a transaction
    await transaction(async (q) => {
        await q(`DELETE FROM "PageView" WHERE "projectId" = $1`, [project.id]);
        await q(`DELETE FROM "Session" WHERE "projectId" = $1`, [project.id]);
        await q(`DELETE FROM "Analytics" WHERE "projectId" = $1`, [project.id]);
        await q(`DELETE FROM "Project" WHERE "id" = $1`, [project.id]);
    });

    revalidatePath("/dashboard/analytics");
    redirect("/dashboard/analytics");
}
