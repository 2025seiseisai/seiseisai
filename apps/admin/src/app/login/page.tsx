import LogInForm from "./form";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    return <LogInForm key={JSON.stringify(await searchParams)} />;
}
