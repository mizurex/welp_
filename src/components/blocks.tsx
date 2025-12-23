import { ArrowUp } from "lucide-react";

interface BlockProps {
    title: string;
    value: any;
    icon: React.ReactNode;
}

export default function Block({ title, value, icon }: BlockProps) {
    return (
        <div className="rounded-[6px] bg-bg-primary flex flex-col text-foreground border border-stone-300">
            <div className=" flex items-center rounded-[6px] rounded-b-none justify-between pl-[6px] pr-[3px]  bg-muted border-b border-stone-200 gap-[4px] py-[2px]">
                <p className="text-sm font-medium text-foreground/80 ">
                    {title}
                </p>
                <div className="p-1 bg-white shadow-md rounded-[4.5px]">
                    {icon}
                </div>
            </div>

            <div className="flex items-center gap-[6px]">
                <div className="py-[8px] px-[6px]">

                    <p className="text-2xl font-medium font-sans text-foreground ">
                        {value.toLocaleString()}
                    </p>

                </div>

                <div className="py-[3px] px-[6px] border border-border rounded-[6px] ">
                    <span className="flex items-center gap-[4px]">
                        <ArrowUp className="size-2 text-green-500" />

                        <p className="text-xs font-medium text-green-500">
                            20%
                        </p>
                    </span>
                </div>
            </div>




        </div>
    )
}