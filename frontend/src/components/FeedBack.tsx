import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	CheckCircle,
	AlertCircle,
	Save,
	TrendingUp,
	BarChart,
	ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { Progress } from "@/components/ui/progress"

// Define interfaces for props and data structures
interface ReviewFeedbackProps {
	mode: "genuine" | "roast";
	analysisData?: {
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
	};
}

interface CategoryFeedback {
	score: number;
	good_point: string;
	improvement_area: string;
}

interface FeedbackItem {
	category: string;
	score: number;
	feedback: string;
	improvement?: string;
}

export default function ReviewFeedback({
	mode,
	analysisData,
}: ReviewFeedbackProps) {
	// State management
	const [loading, setLoading] = useState(true);
	const [overallScore, setOverallScore] = useState(0);
	const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
	const [animationComplete, setAnimationComplete] = useState(false);
	const [overallReview, setOverallReview] = useState("");
	const [loadingStage, setLoadingStage] = useState(0);
	const [activeFeedbackCard, setActiveFeedbackCard] = useState<number | null>(
		null
	);

	// Main effect for processing analysis data
	useEffect(() => {
		// Simulate progressive loading stages
		const stageTimings = [800, 1600, 2400, 3000];

		const timers = stageTimings.map((timing, index) => {
			return setTimeout(() => {
				setLoadingStage(index + 1);

				// On final stage, complete the loading
				if (index === stageTimings.length - 1) {
					setTimeout(() => {
						setLoading(false);

						if (analysisData) {
							const currentModeData = analysisData[mode];

							// Store overall review
							setOverallReview(currentModeData.overall_review);

							// Calculate overall score for current mode
							const scores = [
								currentModeData.format.score,
								currentModeData.content_quality.score,
								currentModeData.skills_presentation.score,
								currentModeData.ats_compatibility.score,
							];
							const avgScore = Math.round(
								(scores.reduce((a, b) => a + b, 0) / scores.length) * 10
							);

							// Transform data to FeedbackItem structure
							const transformedFeedback: FeedbackItem[] = [
								{
									category: "Format & Layout",
									score: currentModeData.format.score * 10,
									feedback: currentModeData.format.good_point,
									improvement: currentModeData.format.improvement_area,
								},
								{
									category: "Content Quality",
									score: currentModeData.content_quality.score * 10,
									feedback: currentModeData.content_quality.good_point,
									improvement: currentModeData.content_quality.improvement_area,
								},
								{
									category: "Skills Presentation",
									score: currentModeData.skills_presentation.score * 10,
									feedback: currentModeData.skills_presentation.good_point,
									improvement:
										currentModeData.skills_presentation.improvement_area,
								},
								{
									category: "ATS Compatibility",
									score: currentModeData.ats_compatibility.score * 10,
									feedback: currentModeData.ats_compatibility.good_point,
									improvement:
										currentModeData.ats_compatibility.improvement_area,
								},
							];

							setOverallScore(avgScore);
							setFeedback(transformedFeedback);
						} else {
							// Fallback demo data
							const feedbackData =
								mode === "genuine"
									? {
											score: 78,
											review:
												"Your resume has a clean structure but could benefit from more targeted content. Strong in presenting technical skills, but work experience lacks impact statements and quantifiable achievements. The format is appealing, though ATS compatibility could be improved with more industry-specific keywords.",
											items: [
												{
													category: "Format & Layout",
													score: 85,
													feedback:
														"Your resume has a clean, professional layout that is easy to scan. The consistent formatting and clear section headers help guide the reader through your professional story effectively.",
													improvement:
														"Consider adding more white space between sections for better readability and using a slightly larger font for section headers to create clearer visual hierarchy.",
												},
												// Other items removed for brevity
											],
									  }
									: {
											score: 42,
											review:
												"This resume looks like it was designed by someone who thinks Comic Sans is 'professional' and that 'attention to detail' is just something you put in your skills section without actually having it.",
											items: [
												{
													category: "Format & Layout",
													score: 35,
													feedback:
														"Congratulations! Your resume successfully achieves the rare feat of being both cluttered and empty at the same time. At least you managed to keep it all on one page, even if that page looks like it's having an identity crisis.",
													improvement:
														"Try embracing the revolutionary concept of 'margins' – they're these magical spaces on the edges of documents that help content breathe. Also, pick a font that doesn't scream 'I still use a flip phone from 2005.'",
												},
												// Other items removed for brevity
											],
									  };

							setOverallScore(feedbackData.score);
							setOverallReview(feedbackData.review);
							setFeedback(feedbackData.items);
						}

						setTimeout(() => setAnimationComplete(true), 500);
					}, 500);
				}
			}, timing);
		});

		// Cleanup timers
		return () => timers.forEach((timer) => clearTimeout(timer));
	}, [mode, analysisData]);

	// Utility functions for styling
	const getScoreColor = (score: number) =>
		score >= 80
			? "text-emerald-500 dark:text-emerald-400"
			: score >= 60
			? "text-amber-500 dark:text-amber-400"
			: "text-rose-500 dark:text-rose-400";

	const getBgScoreColor = (score: number) =>
		score >= 80
			? "bg-emerald-500"
			: score >= 60
			? "bg-amber-500"
			: "bg-rose-500";

	const getGradient = (score: number) =>
		score >= 80
			? "from-emerald-500 to-green-600"
			: score >= 60
			? "from-amber-500 to-yellow-600"
			: "from-rose-500 to-red-600";

	// Get theme based colors
	const getThemeColors = () => {
		if (mode === "genuine") {
			return {
				primary: "text-blue-600 dark:text-blue-400",
				secondary: "text-indigo-600 dark:text-indigo-400",
				bg: "bg-blue-500",
				bgSecondary: "bg-indigo-500",
				bgGradient: "from-blue-600 to-indigo-600",
				bgHoverGradient: "hover:from-blue-700 hover:to-indigo-700",
				bgLight: "bg-blue-50 dark:bg-blue-900/20",
				bgLightSecondary: "bg-indigo-50 dark:bg-indigo-900/20",
				border: "border-blue-500/20",
				bgLightGradient:
					"from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20",
			};
		} else {
			return {
				primary: "text-rose-600 dark:text-rose-400",
				secondary: "text-orange-600 dark:text-orange-400",
				bg: "bg-rose-500",
				bgSecondary: "bg-orange-500",
				bgGradient: "from-rose-600 to-orange-600",
				bgHoverGradient: "hover:from-rose-700 hover:to-orange-700",
				bgLight: "bg-rose-50 dark:bg-rose-900/20",
				bgLightSecondary: "bg-orange-50 dark:bg-orange-900/20",
				border: "border-rose-500/20",
				bgLightGradient:
					"from-rose-50/50 to-orange-50/50 dark:from-rose-900/20 dark:to-orange-900/20",
			};
		}
	};

	const colors = getThemeColors();

	// Advanced loading state
	if (loading) {
		const loadingPhrases = [
			"Analyzing document structure...",
			"Evaluating content quality...",
			"Assessing skill presentation...",
			"Finalizing feedback...",
		];

		return (
			<div className="flex flex-col items-center justify-center py-10 px-4 min-h-[400px]">
				<div className="w-full max-w-md relative">
					{/* Decorative elements */}
					<div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
						<div
							className={cn(
								"absolute -right-20 top-10 h-40 w-40 rounded-full blur-3xl opacity-10",
								mode === "genuine" ? "bg-blue-500" : "bg-rose-500"
							)}
						></div>
						<div
							className={cn(
								"absolute -left-20 bottom-10 h-40 w-40 rounded-full blur-3xl opacity-10",
								mode === "genuine" ? "bg-indigo-500" : "bg-orange-500"
							)}
						></div>
					</div>

					<div className="space-y-10">
						{/* Header */}
						<div className="text-center space-y-2">
							<h3
								className={cn(
									"text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r",
									mode === "genuine"
										? "from-blue-600 to-indigo-600"
										: "from-rose-600 to-orange-600"
								)}
							>
								{mode === "genuine" ? "Professional Analysis" : "Resume Roast"}
							</h3>
							<p
								className={cn(
									"text-sm font-medium",
									mode === "genuine"
										? "text-blue-600 dark:text-blue-400"
										: "text-rose-600 dark:text-rose-400"
								)}
							>
								{
									loadingPhrases[
										Math.min(loadingStage, loadingPhrases.length - 1)
									]
								}
							</p>
						</div>

						{/* Progress & Steps */}
						<div className="space-y-6">
							{/* Main circular progress indicator */}
							<div className="flex justify-center">
								<div className="relative h-40 w-40">
									{/* Blurred background glow */}
									<div
										className={cn(
											"absolute inset-4 rounded-full blur-xl",
											mode === "genuine" ? "bg-blue-500/20" : "bg-rose-500/20"
										)}
									></div>

									{/* Outer circle track */}
									<svg
										className="absolute inset-0 w-full h-full"
										viewBox="0 0 100 100"
									>
										<circle
											cx="50"
											cy="50"
											r="46"
											fill="none"
											strokeWidth="2"
											stroke="currentColor"
											className="text-muted/20"
										/>

										{/* Progress arc */}
										<circle
											cx="50"
											cy="50"
											r="46"
											fill="none"
											strokeWidth="2"
											stroke="currentColor"
											strokeLinecap="round"
											strokeDasharray={`${
												(2 * Math.PI * 46 * loadingStage) / 4
											} ${2 * Math.PI * 46}`}
											transform="rotate(-90 50 50)"
											className={cn(
												mode === "genuine" ? "text-blue-500" : "text-rose-500"
											)}
										/>
									</svg>

									{/* Inner circle with dashed border */}
									<svg
										className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)]"
										viewBox="0 0 100 100"
									>
										<circle
											cx="50"
											cy="50"
											r="46"
											fill="none"
											strokeWidth="1"
											stroke="currentColor"
											strokeDasharray="3 3"
											className="text-muted/40"
										/>
									</svg>

									{/* Inner content */}
									<div className="absolute inset-0 flex items-center justify-center flex-col">
										<div
											className={cn(
												"text-2xl font-medium",
												mode === "genuine"
													? "text-blue-600 dark:text-blue-500"
													: "text-rose-600 dark:text-rose-500"
											)}
										>
											{loadingStage * 25}%
										</div>
										<div className="text-xs text-muted-foreground">
											analyzing
										</div>
									</div>

									{/* Orbiting dot */}
									<div className="absolute inset-0 w-full h-full animate-spin-slow origin-center">
										<div
											className={cn(
												"absolute w-2.5 h-2.5 rounded-full",
												mode === "genuine" ? "bg-blue-500" : "bg-rose-500",
												loadingStage >= 1 ? "top-0" : "opacity-0",
												"left-1/2 -translate-x-1/2 -translate-y-1/2"
											)}
										></div>
										<div
											className={cn(
												"absolute w-2.5 h-2.5 rounded-full",
												mode === "genuine" ? "bg-blue-500" : "bg-rose-500",
												loadingStage >= 2 ? "right-0" : "opacity-0",
												"top-1/2 translate-x-1/2 -translate-y-1/2"
											)}
										></div>
										<div
											className={cn(
												"absolute w-2.5 h-2.5 rounded-full",
												mode === "genuine" ? "bg-blue-500" : "bg-rose-500",
												loadingStage >= 3 ? "bottom-0" : "opacity-0",
												"left-1/2 -translate-x-1/2 translate-y-1/2"
											)}
										></div>
										<div
											className={cn(
												"absolute w-2.5 h-2.5 rounded-full",
												mode === "genuine" ? "bg-blue-500" : "bg-rose-500",
												loadingStage >= 4 ? "left-0" : "opacity-0",
												"top-1/2 -translate-x-1/2 -translate-y-1/2"
											)}
										></div>
									</div>
								</div>
							</div>

							{/* Multi-step progress */}
							<div className="space-y-3 px-3">
								<div className="relative h-1">
									{/* Base track */}
									<div className="absolute inset-0 bg-muted/30 rounded-full overflow-hidden"></div>

									{/* Animated progress */}
									<motion.div
										initial={{ width: 0 }}
										animate={{ width: `${loadingStage * 25}%` }}
										transition={{ duration: 0.5, ease: "easeOut" }}
										className={cn(
											"absolute inset-y-0 left-0 rounded-full",
											mode === "genuine"
												? "bg-gradient-to-r from-blue-500 to-indigo-500"
												: "bg-gradient-to-r from-rose-500 to-orange-500"
										)}
									></motion.div>

									{/* Step indicators */}
									<div className="absolute inset-y-0 w-full flex justify-between">
										{[0, 1, 2, 3].map((step) => (
											<div
												key={step}
												className={cn(
													"w-2.5 h-2.5 rounded-full bg-background border relative top-1/2 -translate-y-1/2",
													step < loadingStage
														? mode === "genuine"
															? "border-blue-500"
															: "border-rose-500"
														: "border-muted/50"
												)}
											>
												{step < loadingStage && (
													<motion.div
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														transition={{ duration: 0.3 }}
														className={cn(
															"absolute inset-0.5 rounded-full",
															mode === "genuine" ? "bg-blue-500" : "bg-rose-500"
														)}
													></motion.div>
												)}
											</div>
										))}
									</div>
								</div>

								{/* Step labels */}
								<div className="flex justify-between text-xs">
									<div
										className={cn(
											"w-14 text-center transition-colors",
											loadingStage > 0
												? mode === "genuine"
													? "text-blue-600"
													: "text-rose-600"
												: "text-muted-foreground"
										)}
									>
										Structure
									</div>
									<div
										className={cn(
											"w-14 text-center transition-colors",
											loadingStage > 1
												? mode === "genuine"
													? "text-blue-600"
													: "text-rose-600"
												: "text-muted-foreground"
										)}
									>
										Content
									</div>
									<div
										className={cn(
											"w-14 text-center transition-colors",
											loadingStage > 2
												? mode === "genuine"
													? "text-blue-600"
													: "text-rose-600"
												: "text-muted-foreground"
										)}
									>
										Skills
									</div>
									<div
										className={cn(
											"w-14 text-center transition-colors",
											loadingStage > 3
												? mode === "genuine"
													? "text-blue-600"
													: "text-rose-600"
												: "text-muted-foreground"
										)}
									>
										Report
									</div>
								</div>
							</div>
						</div>

						{/* Loading message */}
						<div className="text-center text-sm text-muted-foreground">
							{mode === "genuine"
								? "Your resume is being analyzed by our AI..."
								: "Roasting your resume to crispy perfection..."}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Main render for results
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="space-y-12"
			>
				{/* Overall Review */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="relative z-10"
				>
					<div className="backdrop-blur-sm rounded-xl overflow-hidden border">
						{/* Background gradient with blur */}
						<div
							className={cn(
								"absolute inset-0 bg-gradient-to-br opacity-20",
								colors.bgLightGradient
							)}
						></div>

						{/* Accent borders */}
						<div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>
						<div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>

						<div className="relative z-10 p-6">
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<div className={cn("p-1.5 rounded-md", colors.bgLight)}>
										{mode === "genuine" ? (
											<BarChart className={colors.primary + " h-5 w-5"} />
										) : (
											<TrendingUp className={colors.primary + " h-5 w-5"} />
										)}
									</div>
									<h2 className={cn("text-xl font-medium", colors.primary)}>
										{mode === "genuine"
											? "Professional Assessment"
											: "Resume Roast"}
									</h2>
								</div>

								<p className="text-lg leading-relaxed">{overallReview}</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Score Display */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="relative z-10"
				>
					<div className="rounded-xl border overflow-hidden backdrop-blur-sm">
						<div className="absolute inset-0 bg-gradient-to-br from-background/95 to-background/80"></div>

						<div className="relative z-10 p-6">
							<div className="flex flex-col md:flex-row md:items-center gap-8">
								{/* Score visualization */}
								<div className="md:w-1/3 flex justify-center">
									<div className="relative w-40 h-40">
										{/* Background blur effect */}
										<div
											className={cn(
												"absolute inset-4 rounded-full blur-xl opacity-30",
												getBgScoreColor(overallScore)
											)}
										></div>

										{/* Circular progress background */}
										<svg className="absolute inset-0 w-full h-full rotate-90">
											<circle
												cx="80"
												cy="80"
												r="74"
												fill="none"
												strokeWidth="2"
												stroke="currentColor"
												className="text-muted/30"
											/>
										</svg>

										{/* Score circle with gradient */}
										<svg className="absolute inset-0 w-full h-full -rotate-90">
											<defs>
												<linearGradient
													id={`scoreGradient-${mode}`}
													x1="0%"
													y1="0%"
													x2="100%"
													y2="0%"
												>
													<stop
														offset="0%"
														className={`stop-color-${colors.bg}`}
													/>
													<stop
														offset="100%"
														className={`stop-color-${colors.bgSecondary}`}
													/>
												</linearGradient>
											</defs>
											<circle
												cx="80"
												cy="80"
												r="74"
												fill="none"
												strokeWidth="8"
												strokeLinecap="round"
												stroke={`url(#scoreGradient-${mode})`}
												strokeDasharray={`${
													(2 * Math.PI * 74 * overallScore) / 100
												} ${2 * Math.PI * 74}`}
											/>
										</svg>

										{/* Secondary decorative circle */}
										<svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] rotate-45">
											<circle
												cx="80"
												cy="80"
												r="60"
												fill="none"
												strokeWidth="1"
												strokeDasharray="4 4"
												stroke="currentColor"
												className="text-muted/40"
											/>
										</svg>

										{/* Score text */}
										<div className="absolute inset-0 flex items-center justify-center flex-col">
											<motion.div
												initial={{ scale: 0.5, opacity: 0 }}
												animate={{ scale: 1, opacity: 1 }}
												transition={{ duration: 0.5, delay: 0.6 }}
												className={cn(
													"text-4xl font-bold",
													getScoreColor(overallScore)
												)}
											>
												<Counter from={0} to={overallScore} duration={1.5} />
											</motion.div>
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ duration: 0.5, delay: 0.8 }}
												className="text-xs text-muted-foreground"
											>
												out of 100
											</motion.div>
										</div>
									</div>
								</div>

								{/* Score interpretation */}
								<div className="md:w-2/3 space-y-4">
									<div className="space-y-2">
										<div className="flex justify-between items-center">
											<h3 className="text-xl font-medium">Resume Score</h3>
											<div
												className={cn(
													"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
													overallScore >= 80
														? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
														: overallScore >= 60
														? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
														: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
												)}
											>
												<span className="relative flex h-2 w-2">
													<span
														className={cn(
															"animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
															getBgScoreColor(overallScore)
														)}
													></span>
													<span
														className={cn(
															"relative inline-flex rounded-full h-2 w-2",
															getBgScoreColor(overallScore)
														)}
													></span>
												</span>
												{overallScore >= 80
													? "Excellent"
													: overallScore >= 70
													? "Very Good"
													: overallScore >= 60
													? "Good"
													: overallScore >= 50
													? "Average"
													: overallScore >= 40
													? "Needs Work"
													: "Critical Issues"}
											</div>
										</div>

										<p className="text-muted-foreground">
											{overallScore >= 80
												? "Your resume is well-positioned to make a strong impression on recruiters and pass through ATS systems. Excellent job!"
												: overallScore >= 60
												? "Your resume has solid elements but would benefit from targeted improvements to maximize its effectiveness."
												: "Your resume needs significant enhancements to effectively showcase your qualifications and pass through automated screening systems."}
										</p>
									</div>

									{/* Category score bars */}
									<div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
										{feedback.map((item, index) => (
											<motion.div
												key={item.category}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
												className="space-y-1.5"
											>
												<div className="flex justify-between text-sm">
													<span>{item.category}</span>
													<span className={getScoreColor(item.score)}>
														{item.score}%
													</span>
												</div>

												<div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${item.score}%` }}
														transition={{
															duration: 1,
															delay: 1 + index * 0.1,
															ease: "easeOut",
														}}
														className={cn(
															"h-full rounded-full bg-gradient-to-r",
															getGradient(item.score)
														)}
													></motion.div>
												</div>
											</motion.div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Detailed Feedback Cards */}
				<div className="space-y-4">
					<h3 className="text-xl font-medium">Detailed Feedback</h3>

					<div className="grid gap-4 md:grid-cols-2">
						{feedback.map((item, index) => (
							<motion.div
								key={item.category}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
								onClick={() =>
									setActiveFeedbackCard(
										activeFeedbackCard === index ? null : index
									)
								}
								className={cn(
									"rounded-xl overflow-hidden cursor-pointer group border backdrop-blur-sm",
									"transition-all duration-300",
									activeFeedbackCard === index
										? "ring-2 ring-offset-2 shadow-lg"
										: "hover:shadow-md",
									activeFeedbackCard === index
										? colors.border +
												" ring-" +
												(mode === "genuine" ? "blue" : "rose") +
												"-500"
										: ""
								)}
							>
								<div className="relative">
									{/* Background gradient */}
									<div
										className={cn(
											"absolute inset-0 bg-gradient-to-br opacity-10",
											colors.bgLightGradient
										)}
									></div>

									{/* Title bar */}
									<div className="relative p-4 pb-3 border-b border-muted/30 flex justify-between items-center">
										<div className="flex items-center gap-2">
											<h4 className="font-medium">{item.category}</h4>
										</div>

										<div className="flex items-center gap-2">
											<div
												className={cn(
													"flex items-center px-2 py-0.5 rounded-full text-sm font-medium",
													item.score >= 80
														? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
														: item.score >= 60
														? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
														: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
												)}
											>
												{item.score}%
											</div>

											<ChevronRight
												className={cn(
													"h-5 w-5 text-muted-foreground transition-transform",
													activeFeedbackCard === index && "rotate-90"
												)}
											/>
										</div>
									</div>

									{/* Progress bar */}
									<div className="h-1 w-full relative">
										<div className="absolute inset-0 bg-muted/30"></div>
										<div
											className={cn(
												"absolute inset-y-0 left-0 bg-gradient-to-r",
												getGradient(item.score)
											)}
											style={{ width: `${item.score}%` }}
										></div>
									</div>

									{/* Content - expandable */}
									<AnimatePresence>
										{activeFeedbackCard === index && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.3 }}
												className="overflow-hidden"
											>
												<div className="p-4 space-y-4">
													{/* Strengths */}
													<div>
														<h5 className="flex items-center text-sm font-medium text-muted-foreground mb-2">
															<CheckCircle
																className={cn(
																	"w-4 h-4 mr-1.5",
																	"text-emerald-500"
																)}
															/>
															Strengths
														</h5>
														<div
															className={cn(
																"rounded-lg p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20"
															)}
														>
															<p className="text-sm">{item.feedback}</p>
														</div>
													</div>

													{/* Improvement areas */}
													<div>
														<h5 className="flex items-center text-sm font-medium text-muted-foreground mb-2">
															<AlertCircle
																className={cn("w-4 h-4 mr-1.5", colors.primary)}
															/>
															Areas for Improvement
														</h5>
														<div
															className={cn(
																"rounded-lg p-3",
																mode === "genuine"
																	? "bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20"
																	: "bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20"
															)}
														>
															<p className="text-sm">{item.improvement}</p>
														</div>
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Action Button */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 1 }}
					className="flex justify-center pt-4"
				>
					<Button
						onClick={() => window.print()}
						size="lg"
						className={cn(
							"px-6 py-6 text-base border-0 shadow-lg hover:shadow-xl relative overflow-hidden group",
							"bg-gradient-to-r",
							colors.bgGradient,
							colors.bgHoverGradient
						)}
					>
						{/* Background texture */}
						<span className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-soft-light"></span>

						{/* Highlight overlay */}
						<span className="absolute inset-0 rounded-md bg-gradient-to-tr from-white/10 via-white/0 to-white/0"></span>

						{/* Shine effect on hover */}
						<span className="absolute inset-0 translate-x-full group-hover:translate-x-[-250%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out"></span>

						{/* Button content */}
						<span className="relative flex items-center gap-2">
							<Save className="h-5 w-5" />
							Save {mode === "genuine" ? "Analysis" : "Roast"}
						</span>
					</Button>
				</motion.div>

				<style
					dangerouslySetInnerHTML={{
						__html: `
          @keyframes ping-slow {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          
          @keyframes spin-slow {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          
          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          .stop-color-bg-blue-500 {
            stop-color: rgb(59, 130, 246);
          }
          
          .stop-color-bg-indigo-500 {
            stop-color: rgb(99, 102, 241);
          }
          
          .stop-color-bg-rose-500 {
            stop-color: rgb(244, 63, 94);
          }
          
          .stop-color-bg-orange-500 {
            stop-color: rgb(249, 115, 22);
          }
        `,
					}}
				/>
			</motion.div>
		</AnimatePresence>
	);
}

// Counter component for animated number transitions
function Counter({
	from,
	to,
	duration = 1,
}: {
	from: number;
	to: number;
	duration?: number;
}) {
	const [count, setCount] = useState(from);

	useEffect(() => {
		let startTime: number;
		let animationFrame: number;

		const updateCount = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
			setCount(Math.floor(from + progress * (to - from)));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(updateCount);
			}
		};

		animationFrame = requestAnimationFrame(updateCount);
		return () => cancelAnimationFrame(animationFrame);
	}, [from, to, duration]);

	return <>{count}</>;
}
