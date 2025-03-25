import { useState, useEffect } from "react";
import { uploadResume } from "./api/start";
import { motion, AnimatePresence } from "framer-motion";
import {
	FiUpload,
	FiCheckCircle,
	FiAlertCircle,
	FiMoon,
	FiSun,
} from "react-icons/fi";
import { RiUserStarLine, RiEmotionLaughLine } from "react-icons/ri";
import ReviewFeedback from "./components/FeedBack";

function App() {
	const [file, setFile] = useState<File | null>(null);
	const [mode, setMode] = useState<string>("genuine");
	const [userDescription, setUserDescription] = useState<string>("");
	const [review, setReview] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [dragActive, setDragActive] = useState<boolean>(false);
	const [darkMode, setDarkMode] = useState<boolean>(false);

	useEffect(() => {
		// Check for user preference on load
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;
		const savedTheme = localStorage.getItem("theme");
		const initialDarkMode =
			savedTheme === "dark" || (savedTheme === null && prefersDark);
		setDarkMode(initialDarkMode);
	}, []);

	useEffect(() => {
		// Update body class and localStorage when darkMode changes
		if (darkMode) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [darkMode]);

	const toggleTheme = () => {
		setDarkMode(!darkMode);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setFile(e.dataTransfer.files[0]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) {
			setError("Please select a resume file");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await uploadResume(file, mode, userDescription);
			setReview(response.data.review);
		} catch (err: any) {
			setError(err.response?.data?.error || "Failed to process resume");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${
				darkMode ? "bg-black text-gray-100" : "bg-gray-50 text-gray-800"
			}`}
		>
			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<motion.main
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="space-y-8"
				>
					<div className="flex justify-between items-center">
						<div>
							<h1
								className={`text-4xl font-bold ${
									darkMode ? "text-white" : "text-gray-900"
								}`}
							>
								Resume<span className="text-blue-500">Me</span>
							</h1>
							<p
								className={`mt-2 ${
									darkMode ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Professional AI-powered resume feedback
							</p>
						</div>
						<motion.button
							onClick={toggleTheme}
							whileHover={{ scale: 1.1, rotate: 15 }}
							whileTap={{ scale: 0.9 }}
							className={`p-3 rounded-full ${
								darkMode
									? "bg-gray-800 text-yellow-300"
									: "bg-gray-200 text-blue-600"
							}`}
							aria-label="Toggle theme"
						>
							{darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
						</motion.button>
					</div>

					<motion.div
						className={`p-8 rounded-lg backdrop-blur-sm shadow-lg border ${
							darkMode
								? "bg-gray-800/50 border-gray-700"
								: "bg-white/80 border-gray-200"
						} transition-all duration-300`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6 }}
					>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div
								className={`relative p-6 rounded-lg border-2 border-dashed transition-all duration-300 ${
									dragActive
										? darkMode
											? "bg-blue-900/30 border-blue-500"
											: "bg-blue-50 border-blue-400"
										: darkMode
										? "bg-gray-800/50 border-gray-600"
										: "bg-gray-50 border-gray-300"
								}`}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
							>
								<input
									type="file"
									accept=".pdf"
									onChange={handleFileChange}
									className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								/>
								<div className="text-center">
									<FiUpload
										className={`mx-auto h-8 w-8 mb-3 ${
											darkMode ? "text-gray-400" : "text-gray-400"
										}`}
									/>
									<p
										className={`text-lg font-medium ${
											darkMode ? "text-gray-200" : "text-gray-700"
										}`}
									>
										{file
											? file.name
											: "Drag your resume here or click to browse"}
									</p>
									<p
										className={`text-sm mt-2 ${
											darkMode ? "text-gray-400" : "text-gray-500"
										}`}
									>
										{file ? "File selected" : "PDF files only"}
									</p>
									{file && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="flex justify-center mt-2"
										>
											<FiCheckCircle className="text-green-500 h-6 w-6" />
										</motion.div>
									)}
								</div>
							</div>

							<div className="space-y-3">
								<label
									className={`block text-lg font-medium ${
										darkMode ? "text-gray-200" : "text-gray-700"
									}`}
								>
									Review Mode
								</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<motion.label
										className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
											mode === "true_review"
												? darkMode
													? "bg-blue-900/30 border border-blue-700"
													: "bg-blue-50 border border-blue-200"
												: darkMode
												? "bg-gray-800/50 border border-gray-700"
												: "bg-gray-50 border border-gray-200"
										}`}
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
									>
										<div className="flex items-center">
											<RiUserStarLine className="h-5 w-5 mr-3 text-blue-500" />
											<span className={darkMode ? "text-gray-200" : ""}>
												Professional Review
											</span>
										</div>
										<input
											type="radio"
											name="mode"
											value="true_review"
											checked={mode === "true_review"}
											onChange={() => setMode("true_review")}
											className="form-radio h-4 w-4 text-blue-600"
										/>
									</motion.label>

									<motion.label
										className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
											mode === "roast"
												? darkMode
													? "bg-blue-900/30 border border-blue-700"
													: "bg-blue-50 border border-blue-200"
												: darkMode
												? "bg-gray-800/50 border border-gray-700"
												: "bg-gray-50 border border-gray-200"
										}`}
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
									>
										<div className="flex items-center">
											<RiEmotionLaughLine className="h-5 w-5 mr-3 text-blue-500" />
											<span className={darkMode ? "text-gray-200" : ""}>
												Roast My Resume
											</span>
										</div>
										<input
											type="radio"
											name="mode"
											value="roast"
											checked={mode === "roast"}
											onChange={() => setMode("roast")}
											className="form-radio h-4 w-4 text-blue-600"
										/>
									</motion.label>
								</div>
							</div>

							<div className="space-y-2">
								<label
									className={`block text-lg font-medium ${
										darkMode ? "text-gray-200" : "text-gray-700"
									}`}
								>
									Additional Information
								</label>
								<textarea
									value={userDescription}
									onChange={(e) => setUserDescription(e.target.value)}
									placeholder="Describe your target role, industry, or any specific feedback you're looking for..."
									className={`w-full p-3 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-400 ${
										darkMode
											? "bg-gray-800/50 border-gray-700 text-gray-200 focus:border-blue-600"
											: "bg-gray-50 border border-gray-300 text-gray-700 focus:border-blue-500"
									}`}
									rows={4}
								/>
							</div>

							<motion.button
								type="submit"
								disabled={loading}
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.99 }}
								className={`w-full py-3 px-6 rounded-lg font-medium text-white ${
									loading
										? "bg-blue-500/70"
										: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
								} disabled:opacity-70 transition-all duration-200 shadow-md`}
							>
								{loading ? (
									<div className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Analyzing Resume...
									</div>
								) : (
									"Get Feedback"
								)}
							</motion.button>

							<AnimatePresence>
								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className={`flex items-center p-3 rounded-lg ${
											darkMode
												? "bg-red-900/30 border border-red-800"
												: "bg-red-50 border border-red-200"
										}`}
									>
										<FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
										<p className={darkMode ? "text-red-400" : "text-red-600"}>
											{error}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</form>
					</motion.div>

					<AnimatePresence>
						<ReviewFeedback mode={mode} />
					</AnimatePresence>
				</motion.main>
			</div>
		</div>
	);
}

export default App;
