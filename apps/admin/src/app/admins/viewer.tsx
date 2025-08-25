"use client";
import {
    createAdmin,
    deleteAdmin,
    getAllAdmins,
    updateAdminPassword,
    updateAdminSafe,
    updateAdminUnsafe,
} from "@/impl/database-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { UpdateResult } from "@seiseisai/database/enums";
import type { AdminModel } from "@seiseisai/database/models";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@seiseisai/ui/components/alert-dialog";
import { Button } from "@seiseisai/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@seiseisai/ui/components/card";
import { Checkbox } from "@seiseisai/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@seiseisai/ui/components/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@seiseisai/ui/components/form";
import { Input } from "@seiseisai/ui/components/input";
import { Label } from "@seiseisai/ui/components/label";
import { Separator } from "@seiseisai/ui/components/separator";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { KeyRound, ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const authorityDescriptions: Record<string, string> = {
    authorityNews: "ニュースの閲覧・編集",
    authorityGoods: "グッズの閲覧・編集",
    authorityGoodsStock: "グッズの在庫の編集",
    authorityTickets: "Web整理券の閲覧・編集",
    authorityAdmins: "管理者の閲覧・編集",
};

const adminSchema = z.object({
    id: z
        .string()
        .min(1, "IDは必須です。")
        .min(16, "IDは16文字以上でなければなりません。")
        .max(256, "IDが長すぎます。")
        .or(z.literal("superadmin")),
    newPassword: z.string().min(8, "パスワードは8文字以上でなければなりません。").max(256, "パスワードが長すぎます。"),
    confirmPassword: z.string(),
    name: z.string().min(1, "管理者名は必須です。").max(256, "管理者名が長すぎます。"),
    authorityNews: z.boolean(),
    authorityGoods: z.boolean(),
    authorityGoodsStock: z.boolean(),
    authorityTickets: z.boolean(),
    authorityAdmins: z.boolean(),
});

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

function AdminEditor({
    placeholder,
    create = false,
    open,
    setOpen,
}: {
    placeholder: AdminModel;
    create?: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [overwriteWarning, setOverwriteWarning] = useState(false);
    const initializer = useInitAdminsAtom();
    const form = useForm({
        resolver: zodResolver(adminSchema),
        defaultValues: {
            ...placeholder,
            newPassword: create ? "" : "AAAAAAAA",
            confirmPassword: "",
        },
    });
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (open) {
            form.reset({
                ...placeholder,
                newPassword: create ? "" : "AAAAAAAA",
                confirmPassword: "",
            });
        }
    }, [open, placeholder, form, create]);
    async function onSubmitSafe(allData: z.infer<typeof adminSchema>) {
        const { newPassword, confirmPassword, ...data } = allData;
        if (create) {
            if (typeof newPassword !== "string" || newPassword !== confirmPassword) {
                toast.error("パスワードが一致していません。", {
                    duration: 2000,
                });
                return;
            }
            const result = await createAdmin(data, newPassword);
            if (result === null) {
                toast.error("作成に失敗しました。", {
                    duration: 2000,
                });
                return;
            }
            toast.success("追加しました。", {
                duration: 2000,
            });
            setOpen(false);
            initializer(false);
        } else {
            const result = await updateAdminSafe(placeholder, data);
            if (result === null || result === UpdateResult.Invalid) {
                toast.error("保存に失敗しました。", {
                    duration: 2000,
                });
                return;
            } else if (result === UpdateResult.Overwrite) {
                setOverwriteWarning(true);
                return;
            } else if (result === UpdateResult.NameExists) {
                toast.error("名前が重複しています。", {
                    duration: 2000,
                });
                return;
            } else if (result === UpdateResult.NotFound) {
                toast.error("IDが見つかりません。", {
                    duration: 2000,
                });
                return;
            } else if (result === UpdateResult.Success) {
                toast.success("保存しました。", {
                    duration: 2000,
                });
            }
            setOpen(false);
            initializer(false);
        }
    }
    async function onSubmitUnsafe(allData: z.infer<typeof adminSchema>) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { newPassword, confirmPassword, ...data } = allData;
        const result = await updateAdminUnsafe(data);
        if (result) {
            toast.success("保存しました。", {
                duration: 2000,
            });
            setOpen(false);
            initializer(false);
        } else {
            toast.error("保存に失敗しました。", {
                duration: 2000,
            });
        }
    }
    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <Form {...form}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>管理者の編集</AlertDialogTitle>
                            <AlertDialogDescription></AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex w-full flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID</FormLabel>
                                        <FormControl>
                                            <Input {...field} autoComplete="off" disabled={!create} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>管理者名</FormLabel>
                                        <FormControl>
                                            <Input {...field} autoComplete="off" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {create && (
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>パスワード</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} autoComplete="new-password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {create && (
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>パスワードの確認</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} autoComplete="new-password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <div>
                                <Label>権限</Label>
                                <div className="mt-1 flex w-full flex-wrap gap-0.5">
                                    {Object.keys(authorityDescriptions).map((key) => (
                                        <FormField
                                            key={key}
                                            control={form.control}
                                            name={key as keyof z.infer<typeof adminSchema>}
                                            render={({ field }) => (
                                                <FormItem className="mt-1 flex w-full items-center gap-2 text-[13px] sm:w-auto sm:flex-1/3">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value as boolean}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="mt-0 font-normal">
                                                        {authorityDescriptions[key]}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmitSafe)();
                                }}
                            >
                                {create ? "追加" : "保存"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </Form>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={overwriteWarning} onOpenChange={setOverwriteWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>設定は変更されています</AlertDialogTitle>
                        <AlertDialogDescription>
                            この管理者の設定は他の管理者によって編集された可能性があります。
                            <br />
                            上書きしてもよろしいですか？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                form.handleSubmit(onSubmitUnsafe)();
                                setOverwriteWarning(false);
                            }}
                        >
                            上書き
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function PasswordEditor({
    admin,
    open,
    setOpen,
}: {
    admin: AdminModel;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>パスワードの変更</AlertDialogTitle>
                    <AlertDialogDescription>
                        {admin.name} (ID: {admin.id}) のパスワードを変更します。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Label>新しいパスワード</Label>
                <Input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <Label>新しいパスワードの確認</Label>
                <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={() => {
                            setNewPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        キャンセル
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async (e) => {
                            e.preventDefault();
                            if (newPassword !== confirmPassword) {
                                toast.error("パスワードが一致していません。", {
                                    duration: 2000,
                                });
                            } else {
                                if (newPassword.length < 8) {
                                    toast.error("パスワードは8文字以上でなければなりません。", {
                                        duration: 2000,
                                    });
                                } else {
                                    setOpen(false);
                                    const result = await updateAdminPassword(admin.id, newPassword);
                                    if (result === null) {
                                        toast.error("パスワードの変更に失敗しました。", {
                                            duration: 2000,
                                        });
                                    } else {
                                        toast.success("パスワードを変更しました。", {
                                            duration: 2000,
                                        });
                                    }
                                }
                            }
                            setNewPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        変更
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function DeleteDialog({
    admin,
    open,
    setOpen,
}: {
    admin: AdminModel;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const initializer = useInitAdminsAtom();
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>管理者の削除</AlertDialogTitle>
                    <AlertDialogDescription>
                        {admin.name} (ID: {admin.id}) を削除します。
                        <br />
                        この操作は取り消せません。よろしいですか？
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            const result = await deleteAdmin(admin.id);
                            if (result) {
                                toast.success("削除しました。", {
                                    duration: 2000,
                                });
                                initializer(false);
                            } else {
                                toast.error("削除に失敗しました。", {
                                    duration: 2000,
                                });
                            }
                        }}
                    >
                        削除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function AdminSettings({ admin }: { admin: AdminModel }) {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    return (
        <>
            <Card className="w-full sm:w-auto sm:flex-1/3">
                <div className="flex justify-between">
                    <CardHeader className="w-full gap-0 pr-0">
                        <CardTitle className="text-xl">{admin.name}</CardTitle>
                        <CardDescription>ID: {admin.id}</CardDescription>
                    </CardHeader>
                    <DropdownMenu>
                        {admin.id !== "superadmin" && (
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="mr-6 size-8 p-0">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                        )}
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenEditDialog(true);
                                }}
                            >
                                <Pencil />
                                編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenPasswordDialog(true);
                                }}
                            >
                                <KeyRound />
                                パスワード変更
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenDeleteDialog(true);
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
                        {Object.entries(authorityDescriptions).map(([key, description]) => (
                            <div key={key} className="flex items-center gap-2 text-[14px]">
                                <Checkbox
                                    checked={admin[key as keyof AdminModel] as boolean}
                                    className="pointer-events-none"
                                />
                                {description}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <AdminEditor placeholder={admin} open={openEditDialog} setOpen={setOpenEditDialog} />
            <PasswordEditor admin={admin} open={openPasswordDialog} setOpen={setOpenPasswordDialog} />
            <DeleteDialog admin={admin} open={openDeleteDialog} setOpen={setOpenDeleteDialog} />
        </>
    );
}

function getEmptyAdmin(id: string): AdminModel {
    const result = {
        id,
        name: "",
    };
    for (const key of Object.keys(authorityDescriptions)) {
        // @ts-expect-error key is keyof AdminModel
        result[key as keyof AdminModel] = false;
    }
    return result as AdminModel;
}

export default function AdminsViewer({ initialadmins }: { initialadmins: AdminModel[] }) {
    useHydrateAtoms([[adminsAtom, initialadmins]]);
    const admins = useAtomValue(adminsAtom);
    const initializer = useInitAdminsAtom();
    const [adminId, setAdminId] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    return (
        <>
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-[52rem]">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">管理者</h1>
                <div className="mb-2 flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setAdminId(createId());
                            setEditorOpen(true);
                        }}
                    >
                        <ListPlus />
                        追加
                    </Button>
                    <Separator orientation="vertical" className="h-6!" />
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
            <AdminEditor placeholder={getEmptyAdmin(adminId)} create open={editorOpen} setOpen={setEditorOpen} />
        </>
    );
}
