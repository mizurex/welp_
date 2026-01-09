import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // TODO: Add your project creation logic here
        // Example: await prisma.project.create({ data: body })

        return NextResponse.json(
            { message: "Project created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
