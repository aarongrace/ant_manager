import Colony from "../baseClasses/Colony";
import { useGenericStore } from "./genericStore";

export const useColonyStore = useGenericStore<Colony>();

//todo add methods to update colony by calling background routes