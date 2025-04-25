import { useState } from "react";
import { FileUp, Trash2, ThumbsUp, Flame, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ModeToggle from "./components/ModeToggle";
import Uploader from "./components/Uploader";
import ReviewFeedback from "./components/FeedBack";

export interface CategoryFeedback {
	score: number;
	good_point: string;
	improvement_area: string;
}

export interface AnalysisData {
  genuine: {
    overall_review: string;
    format: CategoryFeedback;
    content_quality: CategoryFeedback;
    skills_presentation: CategoryFeedback;
    ats_compatibility: CategoryFeedback;
  };
  roast: {
    overall_review: string;
    format: CategoryFeedback;
    content_quality: CategoryFeedback;
    skills_presentation: CategoryFeedback;
    ats_compatibility: CategoryFeedback;
  };
}

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [isReviewing, setIsReviewing] = useState(false);
	const [isReviewed, setIsReviewed] = useState(false);
	const [reviewMode, setReviewMode] = useState<"genuine" | "roast">("genuine");
	const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

	const handleFileUpload = (uploadedFile: File) => {
		setFile(uploadedFile);
		setIsReviewed(false);
	};

	const handleRemoveFile = () => {
		setFile(null);
		setIsReviewed(false);
		setAnalysisData(null);
	};

	const handleReview = async () => {
		if (!file) return;
		setIsReviewing(true);
		try {
			setIsReviewing(false);
			setIsReviewed(true);
		} catch (error) {
			console.error("Error during review:", error);
			setIsReviewing(false);
		}
	};

	const handleReset = () => {
		setIsReviewed(false);
		setAnalysisData(null);
	};

	return (
		<main className="min-h-screen bg-gradient-to-b bg-background text-foreground">
			<div className="container mx-auto max-w-6xl px-6 py-10 md:py-16">
				<div className="mb-10 md:mb-14 flex items-center justify-between">
					<h1 className="text-3xl md:text-4xl font-medium tracking-tight lg:text-5xl">
						Resume
						<span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500
						 to-indigo-600 dark:from-teal-400 dark:to-teal-500">Me</span>
					</h1>
					<ModeToggle />
				</div>

				<div className="card-container space-y-8">
					<div className="flex gap-4 justify-center">
						<Button
							onClick={() => setReviewMode("genuine")}
							className={cn(
								"relative px-6 py-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg",
								reviewMode === "genuine"
									? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
									: "bg-gray-100 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200"
							)}
						>
							<div className="flex items-center justify-center gap-2">
								<ThumbsUp className="h-5 w-5" />
								<span className="font-medium">Professional Review</span>
							</div>
						</Button>
						<Button
							onClick={() => setReviewMode("roast")}
							className={cn(
								"relative px-6 py-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg",
								reviewMode === "roast"
									? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
									: "bg-gray-100 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200"
							)}
						>
							<div className="flex items-center justify-center gap-2">
								<Flame className="h-5 w-5" />
								<span className="font-medium">Roast My Resume</span>
							</div>
						</Button>
					</div>

					<div className="space-y-6 mt-6">
						{!file ? (
							<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
								<Uploader 
  onFileUpload={handleFileUpload} 
  activeTab={reviewMode} 
  setAnalysisData={setAnalysisData}
/>
							</div>
						) : (
							<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg transition-all dark:border-zinc-800
							 dark:bg-zinc-900/90 hover:shadow-xl">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-5">
										<div
											className={cn(
												"flex h-14 w-14 items-center justify-center rounded-xl",
												reviewMode === "genuine"
													? "bg-blue-500/10 dark:bg-blue-500/20"
													: "bg-orange-500/10 dark:bg-orange-500/20"
											)}
										>
											<FileUp
												className={cn(
													"h-6 w-6",
													reviewMode === "genuine"
														? "text-blue-600 dark:text-blue-400"
														: "text-orange-600 dark:text-orange-400"
												)}
											/>
										</div>
										<div>
											<p className="font-medium text-xl">{file.name}</p>
											<p className="text-sm text-zinc-500 dark:text-zinc-400">
												{(file.size / 1024).toFixed(2)} KB · PDF
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={handleRemoveFile}
										className="rounded-full h-10 w-10 text-zinc-500 hover:text-zinc-900
										 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
									>
										<Trash2 className="h-5 w-5" />
									</Button>
								</div>
							</div>
						)}

						{file && !isReviewed && (
							<div className="flex justify-center mt-10">
								<Button
									onClick={handleReview}
									size="lg"
									disabled={isReviewing}
									className={cn(
										"px-10 py-7 text-lg font-medium rounded-xl shadow-lg transition-all hover:shadow-xl",
										reviewMode === "genuine"
											? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
											: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
									)}
								>
									{isReviewing ? (
										<>
											<svg
												className="animate-spin -ml-1 mr-3 h-5 w-5"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
												></path>
											</svg>
											Analyzing Resume...
										</>
									) : (
										<>
											{reviewMode === "genuine"
												? "Get Professional Review"
												: "Roast My Resume"}
										</>
									)}
								</Button>
							</div>
						)}

						{file && isReviewed && (
							<>
								<div className="mt-6 rounded-2xl overflow-hidden">
									
									<ReviewFeedback mode={reviewMode} analysisData={analysisData} />
								</div>

								<div className="flex justify-center my-6">
									<Button
										onClick={handleReset}
										variant="outline"
										className="px-6 py-5 rounded-xl text-zinc-700 hover:text-zinc-900
										 bg-white border-zinc-300 hover:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-600 flex items-center gap-3 transition-all shadow-md hover:shadow-lg"
									>
										<RotateCcw className="h-5 w-5" />
										Start New Review
									</Button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
