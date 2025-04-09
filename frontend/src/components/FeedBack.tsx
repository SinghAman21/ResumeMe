import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Award, Frown, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

// Define interfaces for props and data structures
interface ReviewFeedbackProps {
  mode: "genuine" | "roast"
  analysisData?: {
    genuine: {
      format: CategoryFeedback
      content_quality: CategoryFeedback
      skills_presentation: CategoryFeedback
      ats_compatibility: CategoryFeedback
    }
    roast: {
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
  const [animationComplete, setAnimationComplete] = useState(false)

  // Main effect for processing analysis data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)

      if (analysisData) {
        const currentModeData = analysisData[mode];
        
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
        // Fallback demo data
        const feedbackData = mode === "genuine" 
          ? {
              score: 78,
              items: [
                {
                  category: "Format & Layout",
                  score: 85,
                  feedback: "Your resume has a clean, professional layout that is easy to scan.",
                  improvement: "Consider adding more white space between sections for better readability.",
                },
                // Other items removed for brevity
              ]
            }
          : {
              score: 42,
              items: [
                {
                  category: "Format & Layout",
                  score: 35,
                  feedback: "Did you design this in MS Paint?",
                },
                // Other items removed for brevity
              ]
            };

        setOverallScore(feedbackData.score);
        setFeedback(feedbackData.items);
      }

      setTimeout(() => setAnimationComplete(true), 1500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [mode, analysisData]);

  // Utility functions for styling
  const getScoreColor = (score: number) => 
    score >= 80 ? "text-emerald-500 dark:text-emerald-400" :
    score >= 60 ? "text-amber-500 dark:text-amber-400" :
    "text-rose-500 dark:text-rose-400";

  const getProgressColor = (score: number) => 
    score >= 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" :
    score >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-600" :
    "bg-gradient-to-r from-rose-500 to-rose-600";

  const getGlowColor = (score: number) => 
    score >= 80 ? "shadow-[0_0_15px_theme(colors.emerald.500/30)]" :
    score >= 60 ? "shadow-[0_0_15px_theme(colors.amber.500/30)]" :
    "shadow-[0_0_15px_theme(colors.rose.500/30)]";

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-800/50"></div>
        </div>
        <p className="text-lg font-medium">
          {mode === "genuine" ? "Analyzing your resume..." : "Preparing to roast..."}
        </p>
      </div>
    );
  }

  // Main render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Score Display */}
      <motion.div className="relative overflow-hidden rounded-xl border p-8 text-center">
        <div className="relative z-10">
          <motion.div className={cn("relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4",
            getGlowColor(overallScore))}>
            <motion.span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              <Counter from={0} to={overallScore} duration={1.5} />
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Feedback Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {feedback.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl border p-5"
          >
            {/* Feedback content */}
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-base font-medium">{item.category}</h4>
                <div className={`flex items-center ${getScoreColor(item.score)}`}>
                  <Counter from={0} to={item.score} duration={1.5} />
                </div>
              </div>
              
              <div className="relative h-2 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  className={`absolute inset-y-0 left-0 ${getProgressColor(item.score)}`}
                />
              </div>

              <p className="mt-4 text-sm">{item.feedback}</p>

              {item.improvement && (
                <motion.div className="mt-3 flex items-start rounded-md p-3">
                  <Award className="mr-2 mt-0.5 h-4 w-4" />
                  <p className="text-xs">{item.improvement}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Button */}
      <motion.div className="flex justify-center pt-4">
        <Button onClick={() => window.print()}>
          {mode === "genuine" ? (
            <>
              <Smile className="mr-2 h-5 w-5" /> Save Feedback
            </>
          ) : (
            <>
              <Frown className="mr-2 h-5 w-5" /> Save Roast
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
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
