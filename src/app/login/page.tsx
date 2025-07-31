import LogInForm from "./form";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    return <LogInForm key={JSON.stringify(await searchParams)} />;
}
