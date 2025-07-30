"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdminModel } from "@/impl/database";
import { getAllAdmins } from "@/impl/database-actions";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const adminsAtom = atom<AdminModel[]>([]);

function useInitAdminsAtom() {
    const setAdmins = useSetAtom(adminsAtom);
    return async (showSuccessToast = true) => {
        const fetchedAdmins = await getAllAdmins();
        if (fetchedAdmins) {
            setAdmins(fetchedAdmins);
            if (showSuccessToast) {
                toast.success("更新しました。", {
                    duration: 2000,
                });
            }
        } else {
            toast.error("取得に失敗しました。", {
                duration: 2000,
            });
        }
    };
}

function ShowAuthority({ authority, children }: { authority: boolean; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-[14px]">
            <Checkbox checked={authority} className="pointer-events-none" />
            {children}
        </div>
    );
}

function AdminSettings({ admin }: { admin: AdminModel }) {
    return (
        <Card className="w-full sm:w-auto sm:flex-1/3">
            <div className="flex justify-between">
                <CardHeader className="w-full gap-0">
                    <CardTitle className="text-xl">{admin.name}</CardTitle>
                    <CardDescription>ID: {admin.id}</CardDescription>
                </CardHeader>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="mr-6 h-8 w-8 p-0">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                //setOpenEditDialog(true);
                            }}
                        >
                            <Pencil />
                            名前の編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                //setOpenEditDialog(true);
                            }}
                        >
                            <Pencil />
                            パスワードの編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                //setOpenEditDialog(true);
                            }}
                        >
                            <Pencil />
                            権限の編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => {
                                e.preventDefault();
                                //setOpenDeleteDialog(true);
                            }}
                        >
                            <Trash2 />
                            削除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <CardContent>
                <Label className="text-[18px]">権限</Label>
                <div className="mt-1 ml-1 flex flex-col gap-0.5">
                    <ShowAuthority authority={admin.authorityNews}>ニュースの閲覧・編集</ShowAuthority>
                    <ShowAuthority authority={admin.authorityGoods}>グッズの閲覧・編集</ShowAuthority>
                    <ShowAuthority authority={admin.authorityGoodsStock}>グッズの在庫の編集</ShowAuthority>
                    <ShowAuthority authority={admin.authorityTickets}>Web整理券の閲覧・編集</ShowAuthority>
                    <ShowAuthority authority={admin.authorityAdmins}>管理者の閲覧・編集</ShowAuthority>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminsViewer({ initialadmins }: { initialadmins: AdminModel[] }) {
    useHydrateAtoms([[adminsAtom, initialadmins]]);
    const admins = useAtomValue(adminsAtom);
    const initializer = useInitAdminsAtom();
    return (
        <>
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-[39rem]">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">管理者</h1>
                <div className="mb-2 flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => {}}>
                        <ListPlus />
                        追加
                    </Button>
                    <Separator orientation="vertical" className="!h-6" />
                    <Button variant="ghost" size="sm" onClick={() => initializer()}>
                        <ListRestart />
                        更新
                    </Button>
                </div>
                <div className="flex w-full flex-wrap gap-4">
                    {admins.map((admin) => (
                        <AdminSettings key={admin.id} admin={admin} />
                    ))}
                </div>
            </div>
        </>
    );
}
