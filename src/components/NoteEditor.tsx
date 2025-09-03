import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  Sparkles, 
  FileText, 
  Tag,
  Copy,
  Check,
  Mic,
  MicOff,
  Square
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
}

export function NoteEditor({ note, onSave }: NoteEditorProps) {
  const [content, setContent] = useState(note?.content || "");
  const [title, setTitle] = useState(note?.title || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          // Insert transcribed text at cursor position
          const textarea = textareaRef.current;
          if (textarea) {
            const cursorPos = textarea.selectionStart;
            const textBefore = content.substring(0, cursorPos);
            const textAfter = content.substring(cursorPos);
            const newContent = textBefore + finalTranscript + textAfter;
            setContent(newContent);
            
            // Move cursor after inserted text
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
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        
        let errorMessage = 'Speech recognition failed';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
        }
        
        toast({
          title: "Recording Error",
          description: errorMessage,
          variant: "destructive"
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
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition. Please try a different browser.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start recording
        recognitionRef.current?.start();
        setIsRecording(true);
        
        toast({
          title: "Recording started",
          description: "Speak now, and your words will be transcribed automatically.",
        });
      } catch (error) {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice recording.",
          variant: "destructive"
        });
      }
    }
  };

  // Simulated AI functions - in a real app, these would call actual AI APIs
  const handleAutocomplete = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = [
      " and this opens up new possibilities for innovation in the field.",
      " which demonstrates the importance of continuous learning and adaptation.",
      " leading to improved efficiency and better outcomes for all stakeholders."
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setContent(prev => prev + suggestion);
    setIsProcessing(false);
    
    toast({
      title: "Text completed",
      description: "AI suggestion added to your note.",
    });
  };

  const handlePolish = async () => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple polishing simulation
    const polishedContent = content
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, '$1 $2')
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
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.slice(0, 3).map((sentence, index) => 
      `• ${sentence.trim()}${index < 2 ? '.' : ''}`
    ).join('\n');
    
    const summary = `Summary:\n${keyPoints}\n\nAction Items:\n• Review key findings\n• Implement suggested changes`;
    
    setContent(prev => `${prev}\n\n${summary}`);
    setIsProcessing(false);
    
    toast({
      title: "Summary generated",
      description: "Key points and action items added.",
    });
  };

  const handleAutoTag = async () => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const commonTags = ["meeting", "idea", "task", "project", "research", "brainstorm"];
    const newTags = commonTags.slice(0, Math.floor(Math.random() * 3) + 2);
    
    setTags(prev => [...new Set([...prev, ...newTags])]);
    setIsProcessing(false);
    
    toast({
      title: "Tags generated",
      description: "Relevant tags added to your note.",
    });
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

  const handleSave = () => {
    onSave({
      id: note?.id,
      title: title || "Untitled Note",
      content,
      tags,
      updatedAt: new Date()
    });
    
    toast({
      title: "Note saved",
      description: "Your changes have been saved.",
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      {/* Note Header */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground writing-text"
        />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 space-y-4">
        <Textarea
          ref={textareaRef}
          placeholder="Start writing your note, or click the microphone to record your voice..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[400px] resize-none border-none shadow-none text-base leading-relaxed writing-text focus:bg-editor-focus transition-smooth"
        />
        
        {/* Voice Recording Button */}
        <div className="flex justify-center">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            className={`gap-2 px-6 transition-smooth ${
              isRecording ? 'ai-glow animate-pulse' : ''
            } ${isListening ? 'bg-primary text-primary-foreground' : ''}`}
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
        
        {/* AI Assistant Panel */}
        <Card className="p-4 ai-glow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Writing Assistant
              {isListening && (
                <Badge variant="outline" className="text-xs bg-primary-soft text-primary ml-2">
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
              <FileText className="h-3 w-3" />
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
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6">
          Save Note
        </Button>
      </div>
    </div>
  );
}