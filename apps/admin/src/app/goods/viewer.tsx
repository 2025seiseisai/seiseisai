"use client";
import { useSession } from "@/impl/auth-client";
import { createGoods, deleteGoods, getAllGoods, updateGoodsSafe, updateGoodsUnsafe } from "@/impl/database-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { GoodsStock, UpdateResult } from "@seiseisai/database/enums";
import { GoodsModel } from "@seiseisai/database/models";
import { Alert, AlertDescription, AlertTitle } from "@seiseisai/ui/components/alert";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@seiseisai/ui/components/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@seiseisai/ui/components/form";
import { Input } from "@seiseisai/ui/components/input";
import { Label } from "@seiseisai/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@seiseisai/ui/components/radio-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@seiseisai/ui/components/select";
import { Separator } from "@seiseisai/ui/components/separator";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { AlertCircleIcon, ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const goodsSchema = z.object({
    id: z
        .string()
        .min(1, "IDは必須です。")
        .min(16, "IDは16文字以上でなければなりません。")
        .max(256, "IDが長すぎます。"),
    name: z.string().min(1, "名前は必須です。").max(256, "名前が長すぎます。"),
    stock: z.enum(GoodsStock),
});

const goodsAmount = {
    [GoodsStock.売り切れ]: 0,
    [GoodsStock.残りわずか]: 1,
    [GoodsStock.在庫少なめ]: 2,
    [GoodsStock.在庫あり]: 3,
};

const goodsAtom = atom<GoodsModel[]>([]);

function useInitGoodsAtom() {
    const setGoods = useSetAtom(goodsAtom);
    return async (showSuccessToast = true) => {
        const fetchedGoods = await getAllGoods();
        if (fetchedGoods) {
            setGoods(fetchedGoods);
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

function DeleteDialog({
    goods,
    open,
    setOpen,
}: {
    goods: GoodsModel;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const initializer = useInitGoodsAtom();
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>グッズの削除</AlertDialogTitle>
                    <AlertDialogDescription>
                        {goods.name} (ID: {goods.id}) を削除します。
                        <br />
                        この操作は取り消せません。よろしいですか？
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            const result = await deleteGoods(goods.id);
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

function GoodsEditor({
    placeholder,
    create = false,
    open,
    setOpen,
}: {
    placeholder: GoodsModel;
    create?: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [overwriteWarning, setOverwriteWarning] = useState(false);
    const form = useForm<GoodsModel>({
        resolver: zodResolver(goodsSchema),
        defaultValues: placeholder,
    });
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (open) {
            form.reset(placeholder);
        }
    }, [open, placeholder, form]);
    const initializer = useInitGoodsAtom();
    async function onSubmitSafe(data: z.infer<typeof goodsSchema>) {
        if (create) {
            const result = await createGoods(data);
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
            const result = await updateGoodsSafe(placeholder, data);
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
    async function onSubmitUnsafe(data: z.infer<typeof goodsSchema>) {
        const result = await updateGoodsUnsafe(data);
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
    const session = useSession();
    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <Form {...form}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>グッズの編集</AlertDialogTitle>
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
                                        <FormLabel>グッズ名</FormLabel>
                                        <FormControl>
                                            <Input {...field} autoComplete="off" disabled={!session.authorityGoods} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <>
                                        <FormItem>
                                            <FormLabel>在庫</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="在庫を選択" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {Object.values(GoodsStock).map((stock) => (
                                                            <SelectItem key={stock} value={stock}>
                                                                {stock}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        {goodsAmount[placeholder.stock] < goodsAmount[form.getValues().stock] && (
                                            <Alert variant="destructive">
                                                <AlertCircleIcon />
                                                <AlertTitle>在庫が編集前より増加しています</AlertTitle>
                                                <AlertDescription>
                                                    本当にこの設定が正しいか確認してください。
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </>
                                )}
                            />
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

function GoodsCard({ goods }: { goods: GoodsModel }) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const session = useSession();
    return (
        <>
            <Card className="w-full sm:w-auto sm:flex-1/3">
                <div className="flex justify-between">
                    <CardHeader className="w-full gap-0 pr-0">
                        <CardTitle className="text-xl">{goods.name}</CardTitle>
                        <CardDescription>ID: {goods.id}</CardDescription>
                    </CardHeader>
                    {session.authorityGoods ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="mr-6 size-8 p-0">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setEditorOpen(true);
                                    }}
                                >
                                    <Pencil />
                                    編集
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
                    ) : (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="mr-5 ml-1 size-8 self-center p-0"
                            onClick={(e) => {
                                e.preventDefault();
                                setEditorOpen(true);
                            }}
                        >
                            <Pencil />
                        </Button>
                    )}
                </div>
                <CardContent>
                    <Label className="text-[18px]">在庫</Label>
                    <RadioGroup value={goods.stock} className="mt-1 ml-1 grid gap-0.75">
                        {Object.keys(GoodsStock).map((key) => (
                            <div key={key} className="flex items-center gap-2">
                                <RadioGroupItem value={key} className="pointer-events-none" />
                                <p className="text-[14px]">{key}</p>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
            <GoodsEditor placeholder={goods} open={editorOpen} setOpen={setEditorOpen} />
            <DeleteDialog goods={goods} open={openDeleteDialog} setOpen={setOpenDeleteDialog} />
        </>
    );
}

export default function GoodsViewer({ initgoods }: { initgoods: GoodsModel[] }) {
    useHydrateAtoms([[goodsAtom, initgoods]]);
    const goods = useAtomValue(goodsAtom);
    const initializer = useInitGoodsAtom();
    const [goodsId, setGoodsId] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const session = useSession();
    return (
        <>
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-[39rem]">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">グッズ</h1>
                <div className="mb-2 flex items-center gap-1.5">
                    {session.authorityGoods && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setGoodsId(createId());
                                    setEditorOpen(true);
                                }}
                            >
                                <ListPlus />
                                追加
                            </Button>
                            <Separator orientation="vertical" className="h-6!" />
                        </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => initializer()}>
                        <ListRestart />
                        更新
                    </Button>
                </div>
                <div className="flex w-full flex-wrap gap-4">
                    {goods.map((g) => (
                        <GoodsCard key={g.id} goods={g} />
                    ))}
                </div>
            </div>
            <GoodsEditor
                placeholder={{ id: goodsId, name: "", stock: GoodsStock.在庫あり }}
                create
                open={editorOpen}
                setOpen={setEditorOpen}
            />
        </>
    );
}
