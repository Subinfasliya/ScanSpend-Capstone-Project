import { extractAmount } from "../utils/amountExtractor";
import { extractDate } from "../utils/dateExtractor";
import { extractItems } from "../utils/itemsExtractor";
import { extractStore } from "../utils/storeExtractor";
import { extractTime } from "../utils/timeExtractor";

export const parseReceipt = (text) => {

   
  return {
    merchant: extractStore(text) || "",
    date: extractDate(text) || "",
    time: extractTime(text) || "",
    amount: extractAmount(text) || "",
    items: extractItems(text) || "",
    note: "",
    rawText: text,
   
    
  };


  
};
