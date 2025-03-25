import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

interface UploadResumeResponse {
    data: any;
    status: number;
}

export const uploadResume = async (file: File, mode: string,user_description:string): Promise<UploadResumeResponse> => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("mode", mode);
    formData.append("user_description", user_description);
    
    return await axios.post(`${API_URL}/upload`, formData);
};