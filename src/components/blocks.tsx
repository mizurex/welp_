interface BlockProps {
    title: string;
    value: any;
    icon: React.ReactNode;
}

export default function Block({ title, value, icon }: BlockProps) {
    return (
        <div className="rounded-[4px] bg-bg-primary flex items-center gap-3.5 text-foreground py-6 px-6 border border-stone-200">
            <div className=" size-9 flex items-center justify-center bg-neutral-100 shadow-sm border border-neutral-200 rounded-[8px] p-6">
                {icon}


            </div>

            <div>
                <p className="text-sm font-medium text-muted-foreground ">
                    {title}
                </p>
                <p className="text-3xl font-medium font-sans ">
                    {value.toLocaleString()}
                </p>

            </div>


        </div>
    )
}