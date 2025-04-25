import { AnalysisData } from "../App";

export async function uploadResume(
	file: File,
	mode: string
): Promise<{ analysis: AnalysisData }> {
	try {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("mode", mode);

		const response = await fetch("http://localhost:5000/analyze", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to analyze resume");
		}

		const data = await response.json();

		if (
			!data.analysis ||
			!data.analysis.genuine ||
			!data.analysis.roast ||
			!data.analysis.genuine.overall_review ||
			!data.analysis.roast.overall_review
		) {
			throw new Error("Invalid response format from server");
		}

		return data;
	} catch (error) {
		console.error("Error in uploadResume:", error);
		throw error;
	}
}
