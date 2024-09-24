import { montserratRegular } from "@/app/fonts"
import { twMerge } from "tailwind-merge"

export const ButtonApp = ({title, className, handleNavigate}: {title:string, className?: string, handleNavigate?: () => void}) => {
    return(
        <button className={twMerge("bg-themeDark rounded-lg", className)} onClick={handleNavigate}>
            <p className={twMerge(montserratRegular.className, "text-themeWhite text-sm mx-5 my-3")}>{title}</p>
        </button>
    )
}