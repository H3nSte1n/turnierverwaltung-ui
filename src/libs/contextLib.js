/**
 * @file contextLib.js
 * @desc Acc-Context handler (Check Login state)
 * @author AH
 */

// Third-Party
import { useContext, createContext } from "react";

// Code
export const AppContext = createContext(null);

export function useAppContext() {
	return useContext(AppContext);
}