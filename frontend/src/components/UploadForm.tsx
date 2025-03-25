import { useState } from "react";
import { uploadResume } from "@/api/start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"true_review" | "roast">("true_review");
  const [userDescription, setUserDescription] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a file!");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await uploadResume(file, mode, userDescription);
      setFeedback(response.data.review);
    } catch (error) {
      console.error(error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-10 border border-zinc-800 bg-zinc-950 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Upload Your Resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx"
            className="bg-zinc-900 border-zinc-800 file:bg-zinc-800 file:text-zinc-100 file:border-0"
          />

            <Select 
            onValueChange={(value: string) => setMode(value as "true_review" | "roast")}
            defaultValue="true_review"
            >
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Select review mode" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="true_review">True Review</SelectItem>
              <SelectItem value="roast">Roast Mode</SelectItem>
            </SelectContent>
            </Select>

          <Textarea
            placeholder="Describe yourself (optional)"
            className="bg-zinc-900 border-zinc-800 min-h-24"
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
          />

          <Button 
            variant="default" 
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </div>
      </CardContent>

      {loading && (
        <div className="py-4 flex justify-center">
          <Loader2 className="animate-spin text-zinc-400 w-8 h-8" />
        </div>
      )}

      {feedback && (
        <CardContent className="border-t border-zinc-800 mt-4 pt-4">
          <div className={`rounded-md p-4 ${mode === "roast" ? "bg-red-950/50" : "bg-zinc-900"}`}>
            <h3 className={`font-medium text-base mb-2 ${mode === "roast" ? "text-red-400" : "text-zinc-200"}`}>
              {mode === "roast" ? "🔥 Roasted Review" : "📄 Professional Review"}
            </h3>
            <p className="text-zinc-300 whitespace-pre-line text-sm">{feedback}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
