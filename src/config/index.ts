const config = {
    // API routes live in this Next.js app, so requests are same-origin by default.
    // Set NEXT_PUBLIC_API_URL only if the API is hosted elsewhere.
    baseUrl: process.env.NEXT_PUBLIC_API_URL || ""
}

export default config;
