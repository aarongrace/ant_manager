import { create } from "zustand";

interface WarningStore {
    warningText: string;
    isDisplayed: boolean;
    startWarning: (text: string) => void;
}

export const useWarningStore = create<WarningStore>((set, get)=>({
    warningText:  "",
    isDisplayed:  false,
    startWarning: (text: string) =>{
        console.log("starting warning");
        set({warningText: text, isDisplayed: true});
        console.log(get().warningText);
        console.log(get().isDisplayed);
        setTimeout(()=>{
            set({ isDisplayed: false,
                warningText: "",
            })
        }, 2000)
    }
}))

export const WarningBar = ()=>{
    const { warningText, isDisplayed} = useWarningStore();

    return (
        <div id="WarningBar" style={{ 
            display: isDisplayed ? "block" : "none", 
            backgroundColor: "yellow", 
            color: "red",
            padding: "10px", 
            border: "1px solid red", 
            position: "fixed", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)",
            fontSize: "1.5rem",
            zIndex: 9999,
        }}>
            <h1>Warning: {warningText}</h1>
        </div>
    )
}