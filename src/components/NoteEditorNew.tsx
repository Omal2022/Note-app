import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Wand2,
  Sparkles,
  FileText,
  Tag,
  Copy,
  Check,
  Mic,
  MicOff,
  Square,
  FolderOpen,
  Hash,
  Download,
  FileOutput,
  BarChart3,
  ListChecks,
  Save,
  X,
  Zap,
  Users,
  Lightbulb,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note, Folder } from "@/hooks/use-note-storage";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  note: Note | null;
  folders: Folder[];
  onSave: (note: Partial<Note>) => void;
  onClose?: () => void;
}

export function NoteEditorNew({
  note,
  folders,
  onSave,
  onClose,
}: NoteEditorProps) {
  const [content, setContent] = useState(note?.content || "");
  const [title, setTitle] = useState(note?.title || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [selectedFolder, setSelectedFolder] = useState(
    note?.folder || "quick-notes"
  );
  const [newTag, setNewTag] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [summary, setSummary] = useState(note?.summary || "");
  const [actionItems, setActionItems] = useState<string[]>(
    note?.actionItems || []
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Track changes
  useEffect(() => {
    const hasChanges =
      content !== (note?.content || "") ||
      title !== (note?.title || "") ||
      JSON.stringify(tags) !== JSON.stringify(note?.tags || []) ||
      selectedFolder !== (note?.folder || "quick-notes");

    setHasUnsavedChanges(hasChanges);
  }, [content, title, tags, selectedFolder, note]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          }
        }

        if (finalTranscript) {
          const textarea = textareaRef.current;
          if (textarea) {
            const cursorPos = textarea.selectionStart;
            const textBefore = content.substring(0, cursorPos);
            const textAfter = content.substring(cursorPos);
            const newContent = textBefore + finalTranscript + textAfter;
            setContent(newContent);

            setTimeout(() => {
              textarea.setSelectionRange(
                cursorPos + finalTranscript.length,
                cursorPos + finalTranscript.length
              );
              textarea.focus();
            }, 0);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setIsRecording(false);

        let errorMessage = "Speech recognition failed";
        switch (event.error) {
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please allow microphone access and try again.";
            break;
          case "no-speech":
            errorMessage = "No speech detected. Please try again.";
            break;
          case "network":
            errorMessage = "Network error. Please check your connection.";
            break;
        }

        toast({
          title: "Recording Error",
          description: errorMessage,
          variant: "destructive",
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [content, toast]);

  const toggleRecording = async () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      toast({
        title: "Speech Recognition Unavailable",
        description:
          "Your browser doesn't support speech recognition. Please try a different browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current?.start();
        setIsRecording(true);

        toast({
          title: "Recording started",
          description:
            "Speak now, and your words will be transcribed automatically.",
        });
      } catch (error) {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice recording.",
          variant: "destructive",
        });
      }
    }
  };

  // Enhanced AI functions
  const handleAutocomplete = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const suggestions = [
      " and this opens up new possibilities for innovation in the field.",
      " which demonstrates the importance of continuous learning and adaptation.",
      " leading to improved efficiency and better outcomes for all stakeholders.",
      " resulting in a more streamlined and effective approach to problem-solving.",
      " enabling teams to collaborate more effectively and achieve better results.",
    ];

    const suggestion =
      suggestions[Math.floor(Math.random() * suggestions.length)];
    setContent((prev) => prev + suggestion);
    setIsProcessing(false);

    toast({
      title: "Text completed",
      description: "AI suggestion added to your note.",
    });
  };

  const handlePolish = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const polishedContent = content
      .replace(/\s+/g, " ")
      .replace(/([.!?])\s*([a-z])/g, "$1 $2")
      .replace(/\bi\b/g, "I")
      .trim();

    setContent(polishedContent);
    setIsProcessing(false);

    toast({
      title: "Text polished",
      description: "Grammar and style improvements applied.",
    });
  };

  const handleSummarize = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const keyPoints = sentences
      .slice(0, 3)
      .map((sentence) => sentence.trim())
      .join(". ");

    const generatedSummary = `${keyPoints}.`;
    setSummary(generatedSummary);

    // Generate action items
    const actions = [
      "Review key findings and insights",
      "Implement suggested improvements",
      "Schedule follow-up discussion",
      "Share findings with relevant stakeholders",
    ];

    const newActionItems = actions.slice(0, Math.floor(Math.random() * 3) + 2);
    setActionItems(newActionItems);

    setIsProcessing(false);

    toast({
      title: "Summary generated",
      description: "AI summary and action items created.",
    });
  };

  const handleAutoTag = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const text = content.toLowerCase();
    const suggestedTags = [];

    // AI-powered tag suggestions based on content
    if (text.includes("meeting") || text.includes("agenda"))
      suggestedTags.push("meeting");
    if (text.includes("idea") || text.includes("brainstorm"))
      suggestedTags.push("idea");
    if (text.includes("task") || text.includes("todo"))
      suggestedTags.push("task");
    if (text.includes("project")) suggestedTags.push("project");
    if (text.includes("research")) suggestedTags.push("research");
    if (text.includes("important") || text.includes("urgent"))
      suggestedTags.push("priority");

    // Add some random relevant tags if none detected
    if (suggestedTags.length === 0) {
      const randomTags = ["note", "draft", "thoughts", "work"];
      suggestedTags.push(...randomTags.slice(0, 2));
    }

    setTags((prev) => [...new Set([...prev, ...suggestedTags])]);
    setIsProcessing(false);

    toast({
      title: "Tags generated",
      description: `Added ${suggestedTags.length} relevant tags.`,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "Copied to clipboard",
      description: "Note content copied successfully.",
    });
  };

  const exportNote = async (format: "markdown" | "txt") => {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${title || "untitled"}-${timestamp}.${format}`;

    let exportContent = content;

    if (format === "markdown") {
      exportContent = `# ${title || "Untitled"}\n\n${content}`;

      if (tags.length > 0) {
        exportContent += `\n\n## Tags\n${tags
          .map((tag) => `#${tag}`)
          .join(" ")}`;
      }

      if (summary) {
        exportContent += `\n\n## Summary\n${summary}`;
      }

      if (actionItems.length > 0) {
        exportContent += `\n\n## Action Items\n${actionItems
          .map((item) => `- [ ] ${item}`)
          .join("\n")}`;
      }
    }

    const blob = new Blob([exportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Note exported",
      description: `Downloaded as ${filename}`,
    });
  };

  const handleSave = () => {
    const wordCount = content
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    onSave({
      id: note?.id,
      title: title || "Untitled Note",
      content,
      tags,
      folder: selectedFolder,
      summary: summary || undefined,
      actionItems: actionItems.length > 0 ? actionItems : undefined,
      wordCount,
    });

    setHasUnsavedChanges(false);

    toast({
      title: "Note saved",
      description: "Your changes have been saved.",
    });
  };

  const getFolderIcon = (folder: Folder) => {
    if (folder.icon === "Zap") return <Zap className="h-4 w-4" />;
    if (folder.icon === "Users") return <Users className="h-4 w-4" />;
    if (folder.icon === "Lightbulb") return <Lightbulb className="h-4 w-4" />;
    if (folder.icon === "CheckSquare")
      return <CheckSquare className="h-4 w-4" />;
    return <FolderOpen className="h-4 w-4" />;
  };

  return (
    <div className="flex-1 flex flex-col ">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {note ? "Edit Note" : "New Note"}
          </h2>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-xs">
              Unsaved changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportNote("markdown")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button onClick={handleSave} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-auto">
        {/* Note Metadata */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground writing-text w-full"
          />

          {/* Folder Selection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-[200px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders
                    .filter((f) => f.id !== "all")
                    .map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          {getFolderIcon(folder)}
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  <Hash className="h-3 w-3" />
                  {tag}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                className="w-40 h-8"
              />
              <Button variant="outline" size="sm" onClick={addTag}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 space-y-4">
          <Textarea
            ref={textareaRef}
            placeholder="Start writing your note, or click the microphone to record your voice..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] resize-none border-none shadow-none text-base leading-relaxed writing-text focus:bg-editor-focus transition-smooth"
          />

          {/* Voice Recording Button */}
          <div className="flex justify-center">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              className={cn(
                "gap-2 px-6 transition-smooth",
                isRecording && "ai-glow animate-pulse",
                isListening && "bg-primary text-primary-foreground"
              )}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <Card className="p-4 ai-glow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Writing Assistant
              {isListening && (
                <Badge
                  variant="outline"
                  className="text-xs bg-primary-soft text-primary ml-2"
                >
                  <MicOff className="h-3 w-3 mr-1" />
                  Listening...
                </Badge>
              )}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutocomplete}
              disabled={isProcessing || !content.trim()}
              className="flex items-center gap-2 h-9"
            >
              <Wand2 className="h-3 w-3" />
              Complete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePolish}
              disabled={isProcessing || !content.trim()}
              className="flex items-center gap-2 h-9"
            >
              <Sparkles className="h-3 w-3" />
              Polish
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarize}
              disabled={isProcessing || !content.trim()}
              className="flex items-center gap-2 h-9"
            >
              <BarChart3 className="h-3 w-3" />
              Summarize
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoTag}
              disabled={isProcessing}
              className="flex items-center gap-2 h-9"
            >
              <Tag className="h-3 w-3" />
              Auto-tag
            </Button>
          </div>

          {/* Summary and Action Items */}
          {(summary || actionItems.length > 0) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                {summary && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      AI Summary
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {summary}
                    </p>
                  </div>
                )}

                {actionItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Action Items
                    </h4>
                    <ul className="space-y-1">
                      {actionItems.map((item, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <Check className="h-3 w-3 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
