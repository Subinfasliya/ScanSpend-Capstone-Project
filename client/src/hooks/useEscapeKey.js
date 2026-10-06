import { useEffect } from "react"

export const useEscapeKey = (enabled,callback) => {
    useEffect(()=> {
        if(!enabled) return;

        const handleKeyDown = (e) => {
            if(e.key === "Escape"){
                callback();
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        return ()=> {
            document.removeEventListener("keydown",handleKeyDown)
        }
    },[enabled,callback])
}