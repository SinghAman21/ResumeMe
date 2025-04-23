import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Save, BarChart, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFeedbackProps {
  mode: "genuine" | "roast"
  analysisData?: {
    genuine: {
      overall_review: string
      format: CategoryFeedback
      content_quality: CategoryFeedback
      skills_presentation: CategoryFeedback
      ats_compatibility: CategoryFeedback
    }
    roast: {
      overall_review: string
      format: CategoryFeedback
      content_quality: CategoryFeedback
      skills_presentation: CategoryFeedback
      ats_compatibility: CategoryFeedback
    }
  }
}

interface CategoryFeedback {
  score: number
  good_point: string
  improvement_area: string
}

interface FeedbackItem {
  category: string
  score: number
  feedback: string
  improvement?: string
}

export default function ReviewFeedback({ mode, analysisData }: ReviewFeedbackProps) {
  // State management
  const [loading, setLoading] = useState(true)
  const [overallScore, setOverallScore] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [overallReview, setOverallReview] = useState("")
  const [loadingStage, setLoadingStage] = useState(0)
  const [progress, setProgress] = useState(0)

  // Main effect for processing analysis data
  useEffect(() => {
    // Simulate progressive loading with a smoother effect
    const loadingDuration = 3000; // 3 seconds total
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / loadingDuration, 1);
      setProgress(newProgress);
      
      // Update loading stage based on progress
      if (newProgress < 0.25) {
        setLoadingStage(0);
      } else if (newProgress < 0.5) {
        setLoadingStage(1);
      } else if (newProgress < 0.75) {
        setLoadingStage(2);
      } else if (newProgress < 1) {
        setLoadingStage(3);
      } else {
        setLoadingStage(4);
        clearInterval(progressInterval);
        
        // Complete loading and process data
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
              currentModeData.ats_compatibility.score
            ];
            const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10);

            // Transform data to FeedbackItem structure
            const transformedFeedback: FeedbackItem[] = [
              {
                category: "Format & Layout",
                score: currentModeData.format.score * 10,
                feedback: currentModeData.format.good_point,
                improvement: currentModeData.format.improvement_area
              },
              {
                category: "Content Quality",
                score: currentModeData.content_quality.score * 10,
                feedback: currentModeData.content_quality.good_point,
                improvement: currentModeData.content_quality.improvement_area
              },
              {
                category: "Skills Presentation",
                score: currentModeData.skills_presentation.score * 10,
                feedback: currentModeData.skills_presentation.good_point,
                improvement: currentModeData.skills_presentation.improvement_area
              },
              {
                category: "ATS Compatibility",
                score: currentModeData.ats_compatibility.score * 10,
                feedback: currentModeData.ats_compatibility.good_point,
                improvement: currentModeData.ats_compatibility.improvement_area
              }
            ];

            setOverallScore(avgScore);
            setFeedback(transformedFeedback);
          } else {
            // ...existing code...
          }
        }, 500);
      }
    }, 50); // Update every 50ms for smooth progress

    return () => clearInterval(progressInterval);
  }, [mode, analysisData]);

  // Utility functions for styling
  const getScoreColor = (score: number) => 
    score >= 80 ? "text-emerald-500" :
    score >= 60 ? "text-amber-500" :
    "text-rose-500";

  const getBgScoreColor = (score: number) => 
    score >= 80 ? "bg-emerald-500" :
    score >= 60 ? "bg-amber-500" :
    "bg-rose-500";
    
  const getGradient = (score: number) => 
    score >= 80 ? "from-emerald-500 to-green-600" :
    score >= 60 ? "from-amber-500 to-yellow-600" :
    "from-rose-500 to-red-600";

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
        bgLightGradient: "from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20"
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
        bgLightGradient: "from-rose-50/50 to-orange-50/50 dark:from-rose-900/20 dark:to-orange-900/20"
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
      "Finalizing feedback..."
    ];

    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[400px]">
        <div className="w-full max-w-md relative space-y-10">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className={cn(
              "text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r",
              mode === "genuine" ? "from-blue-600 to-indigo-600" : "from-rose-600 to-orange-600"
            )}>
              {mode === "genuine" ? "Professional Analysis" : "Resume Roast"}
            </h3>
            <p className={cn(
              "text-sm font-medium",
              mode === "genuine" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {loadingPhrases[loadingStage < 4 ? loadingStage : 3]}
            </p>
          </div>
          
          {/* Progress display */}
          <div className="space-y-8">
            {/* Circular progress */}
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                {/* Blurred background */}
                <div className={cn(
                  "absolute inset-4 rounded-full blur-xl opacity-20",
                  mode === "genuine" ? "bg-blue-500" : "bg-rose-500"
                )}></div>
                
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="6"
                    className="stroke-gray-100 dark:stroke-gray-800"
                  />
                  
                  {/* Progress arc with gradient */}
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={mode === "genuine" ? "stop-color-blue-500" : "stop-color-rose-500"} />
                    <stop offset="100%" className={mode === "genuine" ? "stop-color-indigo-600" : "stop-color-orange-600"} />
                  </linearGradient>
                  
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    stroke="url(#progressGradient)"
                    strokeDasharray={`${2 * Math.PI * 45 * progress} ${2 * Math.PI * 45}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                
                {/* Inner dashed circle */}
                <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)]" viewBox="0 0 100 100">
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
                
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={cn(
                    "text-3xl font-bold",
                    mode === "genuine" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {Math.round(progress * 100)}%
                  </span>
                  <span className="text-sm text-gray-500">analyzing</span>
                </div>
              </div>
            </div>
            
            {/* Linear progress with steps */}
            <div className="space-y-4">
              {/* Steps indicator */}
              <div className="relative h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className={cn(
                    "absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r",
                    mode === "genuine" 
                      ? "from-blue-500 to-indigo-600" 
                      : "from-rose-500 to-orange-600"
                  )}
                  style={{ width: `${progress * 100}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              
              {/* Step labels */}
              <div className="flex justify-between text-sm">
                <div className={cn(
                  "text-center w-16",
                  loadingStage >= 0 
                    ? mode === "genuine" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400" 
                    : "text-gray-400"
                )}>
                  Structure
                </div>
                <div className={cn(
                  "text-center w-16",
                  loadingStage >= 1 
                    ? mode === "genuine" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400" 
                    : "text-gray-400"
                )}>
                  Content
                </div>
                <div className={cn(
                  "text-center w-16",
                  loadingStage >= 2 
                    ? mode === "genuine" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400" 
                    : "text-gray-400"
                )}>
                  Skills
                </div>
                <div className={cn(
                  "text-center w-16",
                  loadingStage >= 3 
                    ? mode === "genuine" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400" 
                    : "text-gray-400"
                )}>
                  Report
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading message */}
          <div className="text-center text-sm text-gray-500">
            {mode === "genuine" 
              ? "Your resume is being analyzed by our AI..." 
              : "Roasting your resume to crispy perfection..."}
          </div>
        </div>
      </div>
    );
  }

  // Main render for results
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-10 py-6"
      >
        {/* Overall Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="backdrop-blur-sm rounded-xl overflow-hidden border">
            {/* Background gradient with blur */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-20",
              colors.bgLightGradient
            )}></div>
            
            <div className="relative z-10 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-md",
                    colors.bgLight
                  )}>
                    {mode === "genuine" 
                      ? <BarChart className={colors.primary + " h-5 w-5"} /> 
                      : <TrendingUp className={colors.primary + " h-5 w-5"} />}
                  </div>
                  <h2 className={cn(
                    "text-xl font-medium",
                    colors.primary
                  )}>
                    {mode === "genuine" ? "Professional Assessment" : "Resume Roast"}
                  </h2>
                </div>
                
                <p className="text-lg leading-relaxed">
                  {overallReview}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Score Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10"
        >
          <div className="rounded-xl border overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-background/95 to-background/80"></div>
            
            <div className="relative z-10 p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                {/* Score visualization */}
                <div className="md:w-1/3 flex justify-center">
                  <div className="relative w-40 h-40">
                    <div className={cn(
                      "absolute inset-4 rounded-full blur-xl opacity-30",
                      getBgScoreColor(overallScore)
                    )}></div>
                    
                    {/* Score circle with gradient */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        strokeWidth="10" 
                        className="stroke-gray-100 dark:stroke-gray-700"
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        strokeWidth="10" 
                        strokeLinecap="round"
                        stroke="currentColor"
                        strokeDasharray={`${2 * Math.PI * 45 * overallScore / 100} ${2 * Math.PI * 45}`}
                        className={getBgScoreColor(overallScore)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className={cn("text-4xl font-bold", getScoreColor(overallScore))}>
                        <Counter from={0} to={overallScore} duration={1} />
                      </div>
                      <div className="text-sm text-gray-500">
                        out of 100
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-medium">Resume Score</h3>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                        overallScore >= 80 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : overallScore >= 60 
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                      )}>
                        <span className="relative flex h-2 w-2">
                          <span className={cn(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            getBgScoreColor(overallScore)
                          )}></span>
                          <span className={cn(
                            "relative inline-flex rounded-full h-2 w-2",
                            getBgScoreColor(overallScore)
                          )}></span>
                        </span>
                        {overallScore >= 80 ? "Excellent" : 
                        overallScore >= 70 ? "Very Good" : 
                        overallScore >= 60 ? "Good" : 
                        overallScore >= 50 ? "Average" : 
                        overallScore >= 40 ? "Needs Work" : 
                        "Critical Issues"}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400">
                      {overallScore >= 80 
                        ? "Your resume is well-positioned to make a strong impression on recruiters and pass through ATS systems."
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
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        className="space-y-1"
                      >
                        <div className="flex justify-between text-sm">
                          <span>{item.category}</span>
                          <span className={getScoreColor(item.score)}>{item.score}%</span>
                        </div>
                        
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 0.7, delay: 0.5 + index * 0.1 }}
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r",
                              getGradient(item.score)
                            )}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Feedback Cards in 2x2 Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-medium">Detailed Feedback</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedback.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="rounded-xl border backdrop-blur-sm overflow-hidden"
              >
                {/* Background gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10",
                  colors.bgLightGradient
                )}></div>
                
                {/* Title with score */}
                <div className="relative p-4 border-b border-muted/30 flex justify-between items-center">
                  <h4 className="font-medium text-lg">{item.category}</h4>
                  
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    item.score >= 80 
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : item.score >= 60 
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}>
                    {item.score}%
                  </div>
                </div>
                
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
                
                {/* Feedback content - always visible */}
                <div className="relative p-5 space-y-6">
                  {/* Strengths */}
                  <div>
                    <h5 className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Strengths
                    </h5>
                    <div className="rounded-lg p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                      <p className="text-sm">{item.feedback}</p>
                    </div>
                  </div>
                  
                  {/* Improvement areas */}
                  <div>
                    <h5 className="flex items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      <AlertCircle className={cn("w-4 h-4 mr-2", colors.primary)} />
                      Areas for Improvement
                    </h5>
                    <div className={cn(
                      "rounded-lg p-4",
                      mode === "genuine" 
                        ? "bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20" 
                        : "bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20"
                    )}>
                      <p className="text-sm">{item.improvement}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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
            <span className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"></span>
            
            {/* Highlight overlay */}
            <span className="absolute inset-0 rounded-md bg-gradient-to-tr from-white/10 via-white/0 to-white/0"></span>
            
            {/* Button content */}
            <span className="relative flex items-center gap-2">
              <Save className="h-5 w-5" /> 
              Save {mode === "genuine" ? "Analysis" : "Roast"}
            </span>
          </Button>
        </motion.div>
        
        <style jsx global>{`
          .stop-color-blue-500 { stop-color: rgb(59, 130, 246); }
          .stop-color-indigo-600 { stop-color: rgb(79, 70, 229); }
          .stop-color-rose-500 { stop-color: rgb(244, 63, 94); }
          .stop-color-orange-600 { stop-color: rgb(234, 88, 12); }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

// Counter component for animated number transitions
function Counter({ from, to, duration = 1 }: { from: number; to: number; duration?: number }) {
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
