import { WorkforceByGender } from "../types";
import { saveAs } from "file-saver";

export function calculateTotalEmployees(employeeData: WorkforceByGender[]) {
    return employeeData.reduce((total, item) => total + item.employee_count, 0);
};

export async function handleDownloadReport(data: any, type: string) {

    function base64ToBlob(base64String: string, mimeType: string) {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    if (type === "pdf") {
        if (data?.files?.pdf) {
            const { filename, base64 } = data.files.pdf;
            const pdfBlob = base64ToBlob(base64, "application/pdf");
            saveAs(pdfBlob, filename);
        }
    } else if (type === "docx") {
        if (data?.files?.docx) {
            const { filename, base64 } = data.files.docx;
            const docxBlob = base64ToBlob(
                base64,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );
            saveAs(docxBlob, filename);
        }
    }
    return
}

