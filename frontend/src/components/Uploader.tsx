import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
	Upload,
	FileText,
	ArrowRight,
	Check,
	X,
	UploadCloud,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadResume } from "@/api/start";
import { motion, AnimatePresence } from "framer-motion";
// import { Progress } from "@/components/ui/progress";

interface ResumeUploaderProps {
	onFileUpload: (file: File) => void;
	activeTab: string;
	setAnalysisData: (data: any) => void;
}

export default function Uploader({
	onFileUpload,
	activeTab,
	setAnalysisData,
}: ResumeUploaderProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const [uploadState, setUploadState] = useState<
		"idle" | "uploading" | "processing" | "success" | "error"
	>("idle");
	const [progress, setProgress] = useState(0);
	const [processingStage, setProcessingStage] = useState(0);
	const [errorMessage, setErrorMessage] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadedFileName, setUploadedFileName] = useState("");

	// Processing stages animation
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (uploadState === "processing") {
			interval = setInterval(() => {
				setProcessingStage((prev) => (prev + 1) % 4);
			}, 1500);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [uploadState]);

	const handleFileUpload = async (file: File) => {
		console.log("Starting file upload...", file.name);
		setUploadState("uploading");
		setProgress(0);
		setUploadedFileName(file.name);

		// Simulate upload progress with smoother animation
		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				const increment = Math.random() * 10;
				const newProgress = Math.min(prev + increment, 85);
				return newProgress;
			});
		}, 300);

		try {
			setProgress(30);
			await new Promise((r) => setTimeout(r, 800)); // Simulate initial network delay

			const response = await uploadResume(file, activeTab);

			// Simulate processing after upload
			setUploadState("processing");
			setProgress(95);
			await new Promise((r) => setTimeout(r, 1500));

			clearInterval(progressInterval);

			console.log("Upload response:", response);

			if (response && response.analysis) {
				setProgress(100);
				setUploadState("success");
				setAnalysisData(response.analysis);
				onFileUpload(file);
			} else {
				console.error("Invalid response format:", response);
				setUploadState("error");
				setErrorMessage("Server returned an invalid response format");
				setProgress(0);
			}
		} catch (error) {
			clearInterval(progressInterval);
			console.error("Error in handleFileUpload:", error);
			setUploadState("error");
			setErrorMessage(
				error instanceof Error ? error.message : "An unknown error occurred"
			);
			setProgress(0);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			await handleFileUpload(file);
		}
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			if (
				file.type === "application/pdf" ||
				file.type === "application/msword" ||
				file.type ===
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
			) {
				await handleFileUpload(file);
			} else {
				setUploadState("error");
				setErrorMessage("Please upload a PDF or Word document");
			}
		}
	};

	const handleButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const reset = () => {
		setUploadState("idle");
		setErrorMessage("");
		setProgress(0);
		setUploadedFileName("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const isGenuine = activeTab === "genuine";
	const primaryColor = isGenuine ? "rgb(99, 102, 241)" : "rgb(244, 63, 94)";
	const secondaryColor = isGenuine ? "rgb(79, 70, 229)" : "rgb(249, 115, 22)";
	const hoverPrimary = isGenuine ? "rgb(129, 140, 248)" : "rgb(251, 113, 133)";
	const hoverSecondary = isGenuine ? "rgb(99, 102, 241)" : "rgb(249, 115, 22)";

	// New function to get character icon for files
	const getFileIcon = (fileName: string) => {
		const extension = fileName.split(".").pop()?.toLowerCase();

		if (extension === "pdf") {
			return (
				<div className="flex items-center justify-center w-8 h-8 rounded bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M8 2V5C8 5.53043 8.21071 6.03914 8.58579 6.41421C8.96086 6.78929 9.46957 7 10 7H13M8 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8M8 2L20 8M14 15H8M16 11H8M16 19H8"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			);
		} else if (extension === "doc" || extension === "docx") {
			return (
				<div className="flex items-center justify-center w-8 h-8 rounded bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M8 2V5C8 5.53043 8.21071 6.03914 8.58579 6.41421C8.96086 6.78929 9.46957 7 10 7H13M8 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8M8 2L20 8M12 18V12M9 15H15"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			);
		} else {
			return (
				<div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
					<FileText className="h-4 w-4" />
				</div>
			);
		}
	};

	// Processing stage names
	const processingStages = [
		"Extracting content...",
		"Analyzing format...",
		"Evaluating skills alignment...",
		"Generating insights...",
	];

	// Render based on upload state
	const renderContent = () => {
		switch (uploadState) {
			case "uploading":
				return (
					<div className="w-full flex flex-col items-center justify-center space-y-6">
						<div className="relative">
							<div className="w-28 h-28 flex items-center justify-center">
								{/* Animated glowing background */}
								<div
									className={cn(
										"absolute inset-0 rounded-full blur-md animate-pulse",
										isGenuine ? "bg-blue-500/20" : "bg-rose-500/20"
									)}
								></div>

								{/* Progress Ring */}
								<svg
									className="absolute inset-0 w-full h-full"
									viewBox="0 0 100 100"
								>
									{/* Track Ring with dashed pattern */}
									<circle
										className="text-muted-foreground/10"
										cx="50"
										cy="50"
										r="42"
										strokeWidth="4"
										stroke="currentColor"
										strokeDasharray="4 4"
										fill="transparent"
									/>

									{/* Background Ring */}
									<circle
										className="text-muted-foreground/20"
										cx="50"
										cy="50"
										r="42"
										strokeWidth="8"
										stroke="currentColor"
										fill="transparent"
									/>

									{/* Glowing effect under progress */}
									<circle
										className={cn(
											"blur-sm",
											isGenuine ? "text-blue-500/30" : "text-rose-500/30"
										)}
										cx="50"
										cy="50"
										r="42"
										strokeWidth="12"
										strokeLinecap="round"
										stroke="currentColor"
										fill="transparent"
										strokeDasharray={`${(2 * Math.PI * 42 * progress) / 100} ${
											2 * Math.PI * 42
										}`}
										style={{
											transformOrigin: "center",
											transform: "rotate(-90deg)",
										}}
									/>

									{/* Main Progress Ring */}
									<motion.circle
										className={cn(
											isGenuine ? "text-blue-500" : "text-rose-500"
										)}
										cx="50"
										cy="50"
										r="42"
										strokeWidth="8"
										stroke="currentColor"
										fill="transparent"
										strokeLinecap="round"
										initial={{ pathLength: 0 }}
										animate={{ pathLength: progress / 100 }}
										transition={{ duration: 0.4, ease: "easeOut" }}
										style={{
											transformOrigin: "center",
											transform: "rotate(-90deg)",
										}}
									/>
								</svg>

								{/* Percentage display */}
								<div className="absolute inset-0 flex items-center justify-center flex-col">
									<span
										className={cn(
											"text-2xl font-semibold",
											isGenuine ? "text-blue-500" : "text-rose-500"
										)}
									>
										{Math.round(progress)}%
									</span>
								</div>
							</div>
						</div>

						{/* File info */}
						<div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg border border-muted">
							{uploadedFileName && getFileIcon(uploadedFileName)}
							<div className="flex flex-col">
								<span className="text-sm font-medium truncate max-w-[200px]">
									{uploadedFileName}
								</span>
								<span className="text-xs text-muted-foreground">
									Uploading...
								</span>
							</div>
						</div>

						<div className="space-y-2 text-center">
							<h3 className="text-lg font-medium">Uploading Resume</h3>
							<p className="text-sm text-muted-foreground">
								Please wait while we upload your file
							</p>
						</div>

						{/* Progress bar with animated gradient */}
						<div className="w-full max-w-md">
							<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
								<motion.div
									className={cn(
										"h-full rounded-full bg-gradient-to-r",
										isGenuine
											? "from-blue-500 via-indigo-500 to-blue-500"
											: "from-rose-500 via-orange-500 to-rose-500"
									)}
									style={{
										width: `${progress}%`,
										backgroundSize: "200% 100%",
										animation: "gradientMove 2s linear infinite",
									}}
								/>
							</div>
							<div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
								<span>Preparing</span>
								<span>Uploading</span>
								<span>Processing</span>
							</div>
						</div>

						<div className="pt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={reset}
								className="hover:bg-background/80"
							>
								<X className="mr-2 h-4 w-4" /> Cancel
							</Button>
						</div>
					</div>
				);

			case "processing":
				return (
					<div className="w-full flex flex-col items-center justify-center space-y-6">
						<div className="relative">
							<div className="w-28 h-28 flex items-center justify-center">
								{/* Animated pulse background */}
								<div
									className={cn(
										"absolute inset-0 rounded-full blur-xl",
										isGenuine ? "bg-blue-500/20" : "bg-rose-500/20"
									)}
								></div>

								{/* Orbit animation */}
								<div className="absolute inset-0">
									<div className="w-full h-full relative animate-spin-slow">
										<div
											className={cn(
												"absolute w-4 h-4 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
												isGenuine ? "bg-blue-500" : "bg-rose-500"
											)}
										></div>
									</div>
								</div>

								{/* Inner rotating circle */}
								<div
									className={cn(
										"absolute w-20 h-20 rounded-full border-2 border-dashed animate-spin-reverse",
										isGenuine ? "border-blue-500/40" : "border-rose-500/40"
									)}
								></div>

								{/* Icon */}
								<div
									className={cn(
										"relative z-10 animate-pulse",
										isGenuine ? "text-blue-500" : "text-rose-500"
									)}
								>
									<Sparkles className="w-8 h-8" />
								</div>
							</div>
						</div>

						{/* File info with processing stage */}
						<AnimatePresence mode="wait">
							<motion.div
								key={processingStage}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
								className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg border border-muted"
							>
								{uploadedFileName && getFileIcon(uploadedFileName)}
								<div className="flex flex-col">
									<span className="text-sm font-medium truncate max-w-[200px]">
										{uploadedFileName}
									</span>
									<span className="text-xs text-muted-foreground">
										{processingStages[processingStage]}
									</span>
								</div>
							</motion.div>
						</AnimatePresence>

						<div className="space-y-2 text-center">
							<h3 className="text-lg font-medium">Analyzing Resume</h3>
							<p className="text-sm text-muted-foreground">
								Our AI is examining your resume to provide detailed feedback
							</p>
						</div>

						{/* Advanced progress visualization */}
						<div className="w-full max-w-md space-y-3">
							{/* Progress bar */}
							<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
								<div
									className={cn(
										"h-full rounded-full",
										isGenuine ? "bg-blue-500" : "bg-rose-500"
									)}
									style={{ width: "95%" }}
								/>
							</div>

							{/* Processing steps */}
							<div className="grid grid-cols-4 gap-1">
								{[0, 1, 2, 3].map((step) => (
									<div
										key={step}
										className={cn(
											"h-1 rounded-full transition-colors duration-300",
											step === processingStage
												? isGenuine
													? "bg-blue-500 animate-pulse"
													: "bg-rose-500 animate-pulse"
												: step < processingStage
												? "bg-primary/50"
												: "bg-muted"
										)}
									></div>
								))}
							</div>

							{/* Step labels */}
							<div className="flex justify-between text-xs text-muted-foreground">
								<span
									className={cn(
										processingStage === 0 && "font-medium",
										isGenuine ? "text-blue-500" : "text-rose-500"
									)}
								>
									Extract
								</span>
								<span
									className={cn(
										processingStage === 1 && "font-medium",
										isGenuine ? "text-blue-500" : "text-rose-500"
									)}
								>
									Format
								</span>
								<span
									className={cn(
										processingStage === 2 && "font-medium",
										isGenuine ? "text-blue-500" : "text-rose-500"
									)}
								>
									Skills
								</span>
								<span
									className={cn(
										processingStage === 3 && "font-medium",
										isGenuine ? "text-blue-500" : "text-rose-500"
									)}
								>
									Report
								</span>
							</div>
						</div>

						<div className="pt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={reset}
								className="hover:bg-background/80"
							>
								<X className="mr-2 h-4 w-4" /> Cancel
							</Button>
						</div>
					</div>
				);

			case "error":
				return (
					<div className="w-full flex flex-col items-center justify-center space-y-6 text-center">
						{/* Error animation */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: [0, 1.2, 1] }}
							transition={{ duration: 0.5, times: [0, 0.6, 1] }}
							className="relative"
						>
							<div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping-slow blur-md"></div>
							<div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 relative">
								<X className="h-12 w-12" />
							</div>
						</motion.div>

						<div className="space-y-2">
							<h3 className="text-xl font-medium">Upload Failed</h3>
							<p className="text-sm text-muted-foreground max-w-md">
								{errorMessage || "There was a problem uploading your resume"}
							</p>
						</div>

						<Button
							className={cn(
								"mt-4 transition-all duration-300 hover:shadow-lg gap-2",
								"bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
							)}
							onClick={reset}
						>
							<ArrowRight className="h-4 w-4" />
							Try Again
						</Button>
					</div>
				);

			case "success":
				return (
					<div className="w-full flex flex-col items-center justify-center space-y-6 text-center">
						{/* Success animation */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: [0, 1.2, 1] }}
							transition={{ duration: 0.5, times: [0, 0.6, 1] }}
							className="relative"
						>
							<div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow blur-md"></div>
							<div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 relative z-10">
								<Check className="h-12 w-12" />

								{/* Confetti-like particles */}
								<motion.div
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
									transition={{
										duration: 1.5,
										delay: 0.2,
										repeat: Infinity,
										repeatDelay: 3,
									}}
									className="absolute w-full h-full"
								>
									{[...Array(8)].map((_, i) => {
										const angle = (i / 8) * Math.PI * 2;
										return (
											<motion.div
												key={i}
												initial={{
													x: 0,
													y: 0,
													opacity: 1,
													scale: 0,
												}}
												animate={{
													x: Math.cos(angle) * 50,
													y: Math.sin(angle) * 50,
													opacity: 0,
													scale: 1.5,
												}}
												transition={{
													duration: 0.8,
													delay: 0.1 * i,
													repeat: Infinity,
													repeatDelay: 3,
												}}
												className={cn(
													"absolute top-1/2 left-1/2 w-2 h-2 rounded-full",
													isGenuine ? "bg-blue-500" : "bg-rose-500"
												)}
											/>
										);
									})}
								</motion.div>
							</div>
						</motion.div>

						{/* File info */}
						<div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg border border-muted">
							{uploadedFileName && getFileIcon(uploadedFileName)}
							<div className="flex flex-col">
								<span className="text-sm font-medium truncate max-w-[200px]">
									{uploadedFileName}
								</span>
								<span className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
									Analysis Complete
								</span>
							</div>
						</div>

						<div className="space-y-2">
							<h3 className="text-xl font-medium">
								Resume Analyzed Successfully
							</h3>
							<p className="text-sm text-muted-foreground">
								{isGenuine
									? "Professional analysis of your resume is ready to view"
									: "Your resume roast is hot off the grill and ready to serve"}
							</p>
						</div>

						{/* Glowing button with animation */}
						<motion.div
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							className="relative"
						>
							<div
								className={cn(
									"absolute inset-0 rounded-md blur-md opacity-70",
									isGenuine ? "bg-blue-500/30" : "bg-rose-500/30"
								)}
							></div>

							<Button
								className={cn(
									"mt-4 relative z-10 font-medium border-0 shadow-lg",
									"group transition-all duration-300",
									isGenuine
										? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
										: "bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700"
								)}
							>
								<div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-soft-light rounded-md"></div>
								<span className="absolute inset-0 rounded-md bg-gradient-to-tr from-white/10 via-white/0 to-white/0"></span>

								<span className="relative z-10 flex items-center gap-2">
									<ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
									<span>View Results</span>
								</span>
							</Button>
						</motion.div>
					</div>
				);

			default:
				return (
					<>
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="w-full flex flex-col items-center justify-center"
						>
							<div
								className="relative z-10 mb-8"
								style={{
									transform: isDragging
										? "translateY(-10px) scale(1.05)"
										: "translateY(0) scale(1)",
									transition: "transform 0.5s ease",
								}}
							>
								{/* Decorative rings */}
								<motion.div
									animate={{ rotate: 360 }}
									transition={{
										duration: 10,
										repeat: Infinity,
										ease: "linear",
									}}
									className={cn(
										"absolute -inset-3 rounded-full border-2 border-dashed opacity-20",
										isGenuine ? "border-blue-400" : "border-rose-400"
									)}
								></motion.div>

								<motion.div
									animate={{ rotate: -360 }}
									transition={{
										duration: 20,
										repeat: Infinity,
										ease: "linear",
									}}
									className={cn(
										"absolute -inset-6 rounded-full border border-dashed opacity-10",
										isGenuine ? "border-blue-400" : "border-rose-400"
									)}
								></motion.div>

								<div
									className={cn(
										"icon-container flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500",
										isDragging
											? isGenuine
												? "bg-blue-100/80 dark:bg-blue-900/30"
												: "bg-rose-100/80 dark:bg-rose-900/30"
											: "bg-background dark:bg-muted/20 backdrop-blur-sm border-2",
										isGenuine
											? "border-blue-200/30 dark:border-blue-800/30"
											: "border-rose-200/30 dark:border-rose-800/30"
									)}
								>
									<motion.div
										animate={{
											y: [0, -5, 0],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "easeInOut",
										}}
										style={{
											transform: isDragging
												? "scale(1.1) translateY(-5px)"
												: "scale(1)",
											transition: "transform 0.5s ease",
										}}
									>
										<UploadCloud
											className={cn(
												"h-12 w-12 transition-colors duration-500",
												isDragging
													? isGenuine
														? "text-blue-600"
														: "text-rose-600"
													: "text-muted-foreground"
											)}
										/>
									</motion.div>
								</div>
							</div>

							<motion.h3
								animate={{ y: isDragging ? -5 : 0 }}
								transition={{ duration: 0.3 }}
								className="relative z-10 mb-3 text-2xl font-medium bg-clip-text text-transparent"
								style={{
									backgroundImage: `linear-gradient(to right, var(--primary-color), var(--secondary-color))`,
								}}
							>
								{isDragging ? "Drop to Upload" : "Upload Your Resume"}
							</motion.h3>

							<motion.p
								animate={{
									y: isDragging ? -5 : 0,
									opacity: isDragging ? 0.7 : 1,
								}}
								transition={{ duration: 0.5 }}
								className="relative z-10 mb-8 text-center text-muted-foreground max-w-md"
							>
								{isDragging
									? "Release to start analyzing your resume"
									: "Drop your PDF or Word document here, or click the button below"}
							</motion.p>

							{/* Futuristic File Types Pills */}
							<div className="flex gap-2 mb-8 flex-wrap justify-center">
								<div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-background/50 backdrop-blur-sm text-muted-foreground">
									<svg className="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none">
										<path
											d="M14 3v4a1 1 0 001 1h4M17 21h-10a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M9 9h1M9 13h6M9 17h6"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									PDF
								</div>
								<div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-background/50 backdrop-blur-sm text-muted-foreground">
									<svg className="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none">
										<path
											d="M14 3v4a1 1 0 001 1h4M17 21h-10a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M9 9h6M9 13h6M9 17h6"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									DOC
								</div>
								<div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-background/50 backdrop-blur-sm text-muted-foreground">
									<svg className="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none">
										<path
											d="M14 3v4a1 1 0 001 1h4M17 21h-10a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M9 9h6M9 13h6M9 17h6"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									DOCX
								</div>
							</div>

							{/* Futuristic Button */}
							<motion.div
								className="relative z-10"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<div
									className={cn(
										"absolute inset-0 blur-md opacity-50 rounded-lg -z-10",
										isGenuine ? "bg-blue-500/20" : "bg-rose-500/20"
									)}
								></div>

								<Button
									onClick={handleButtonClick}
									size="lg"
									className="upload-button relative overflow-hidden shadow-lg hover:shadow-xl transition-all border-0"
									style={{
										background: `linear-gradient(to right, var(--primary-color), var(--secondary-color))`,
									}}
								>
									<span className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05] mix-blend-soft-light"></span>
									<span className="absolute inset-0 rounded-md bg-gradient-to-tr from-white/10 via-white/0 to-white/0"></span>

									<span className="relative z-10 flex items-center gap-2 font-medium">
										<Upload className="h-5 w-5" />
										Browse Files
									</span>
								</Button>
							</motion.div>

							{/* Text with animated particles */}
							<div className="mt-8 text-sm text-muted-foreground relative">
								<div className="flex items-center gap-1.5">
									<div className="relative">
										<motion.span
											className={cn(
												"absolute -inset-1 rounded-full opacity-75 blur-sm",
												isGenuine ? "bg-blue-500/20" : "bg-rose-500/20"
											)}
											animate={{
												scale: [1, 1.2, 1],
												opacity: [0.5, 0.8, 0.5],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										/>
										<Sparkles className="h-4 w-4" />
									</div>
									<span>
										{isGenuine
											? "Get professional insights about your resume"
											: "Find out what's wrong with your resume"}
									</span>
								</div>
							</div>
						</motion.div>
					</>
				);
		}
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			className={cn(
				"uploader-container relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-xl border transition-all duration-500",
				isDragging
					? isGenuine
						? "border-blue-500/50 bg-blue-500/5"
						: "border-rose-500/50 bg-rose-500/5"
					: isHovering
					? "border-muted-foreground/30 bg-muted/10"
					: "border-muted bg-background/50 dark:bg-muted/10 backdrop-blur-sm",
				"p-8"
			)}
			style={
				{
					"--primary-color": primaryColor,
					"--secondary-color": secondaryColor,
					"--hover-primary": hoverPrimary,
					"--hover-secondary": hoverSecondary,
				} as React.CSSProperties
			}
		>
			{/* Dynamic background decorations */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{/* Animated gradient blobs */}
				<div
					className={cn(
						"absolute -right-10 -top-10 h-32 w-32 rounded-full blur-xl opacity-20 animate-blob",
						isGenuine ? "bg-blue-500" : "bg-rose-500"
					)}
				></div>
				<div
					className={cn(
						"absolute -left-10 -bottom-10 h-32 w-32 rounded-full blur-xl opacity-20 animate-blob animation-delay-2000",
						isGenuine ? "bg-indigo-500" : "bg-orange-500"
					)}
				></div>
				<div
					className={cn(
						"absolute right-1/3 bottom-1/4 h-24 w-24 rounded-full blur-xl opacity-10 animate-blob animation-delay-4000",
						isGenuine ? "bg-sky-500" : "bg-red-500"
					)}
				></div>

				{/* Grid lines effect */}
				<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]"></div>

				{/* Edge highlights */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>
				<div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>
				<div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-foreground/10 to-transparent"></div>
				<div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-foreground/10 to-transparent"></div>
			</div>

			{renderContent()}

			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept=".pdf,.doc,.docx"
				className="hidden"
			/>

			{/* Add some CSS for animations */}
			<style dangerouslySetInnerHTML={{__html: `
				@keyframes gradientMove {
					0% {
						background-position: 0% 50%;
					}
					100% {
						background-position: 100% 50%;
					}
				}

				@keyframes shimmer {
					0% {
						transform: translateX(-100%);
					}
					100% {
						transform: translateX(100%);
					}
				}

				.animate-ping-slow {
					animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
				}

				.animate-spin-slow {
					animation: spin 3s linear infinite;
				}

				.animate-spin-reverse {
					animation: spin 8s linear infinite reverse;
				}

				.animate-blob {
					animation: blob-movement 7s infinite ease;
				}

				.animation-delay-2000 {
					animation-delay: 2s;
				}

				.animation-delay-4000 {
					animation-delay: 4s;
				}

				@keyframes blob-movement {
					0% {
						transform: translate(0px, 0px) scale(1);
					}
					33% {
						transform: translate(30px, -50px) scale(1.1);
					}
					66% {
						transform: translate(-20px, 20px) scale(0.9);
					}
					100% {
						transform: translate(0px, 0px) scale(1);
					}
				}
			`}} />
		</div>
	);
}
