import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  FileText, 
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NoteSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
}

export function NoteSidebar({ 
  notes, 
  activeNoteId, 
  onSelectNote, 
  onCreateNote,
  onDeleteNote 
}: NoteSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  return (
    <div className=" border-r bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Notes</h2>
          <Button 
            onClick={onCreateNote}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "No notes found" : "No notes yet"}
              </p>
              <p className="text-xs mt-1">
                {searchQuery ? "Try a different search term" : "Create your first note to get started"}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-smooth hover:bg-accent group",
                  activeNoteId === note.id && "bg-accent border border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm truncate flex-1">
                    {note.title || "Untitled"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-quick"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {getPreview(note.content) || "No content"}
                </p>
                
                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs h-5">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs h-5">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(note.updatedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}