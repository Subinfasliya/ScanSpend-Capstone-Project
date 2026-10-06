import { createWorker } from "tesseract.js"


export const scanReceipt = async(image) => {
    const worker = await createWorker("eng")

    
     const {data:{text},} = await worker.recognize(image);

    await worker.terminate();

    return text;

}