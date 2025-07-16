import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <div className="flex w-full flex-1 items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>ログイン</CardTitle>
                    <CardDescription>管理者名とパスワードを入力してください</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">管理者名</Label>
                                <Input id="email" type="email" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">パスワード</Label>
                                <Input id="password" type="password" required />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full">
                        ログイン
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
