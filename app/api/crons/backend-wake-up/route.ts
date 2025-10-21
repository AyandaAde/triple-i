import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: NextResponse) {
    try {
        await axios.get("https://triple-i-backend.onrender.com");

        return new NextResponse("Successfully woke up backend.");
    } catch (error) {
        console.error("Error waking up backend", error);
        return new NextResponse(JSON.stringify(error), { status: 500 });
    }

}