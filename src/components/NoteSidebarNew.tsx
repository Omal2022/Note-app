import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Plus, 
  Search, 
  FileText, 
  MoreHorizontal,
  Calendar,
  FolderPlus,
  Zap,
  Users,
  Lightbulb,
  CheckSquare,
  Folder as FolderIcon,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Note, Folder as FolderType } from "@/hooks/use-note-storage";

interface NoteSidebarProps {
  notes: Note[];
  folders: FolderType[];
  activeNoteId: string | null;
  activeFolderId: string;
  searchQuery: string;
  onSelectNote: (note: Note) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onSearchChange: (query: string) => void;
}

const FOLDER_ICONS = {
  FileText,
  Zap,
  Users,
  Lightbulb,
  CheckSquare,
  FolderIcon
};

const FOLDER_COLORS = {
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400", 
  purple: "text-purple-600 dark:text-purple-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  red: "text-red-600 dark:text-red-400",
  gray: "text-gray-600 dark:text-gray-400"
};

export function NoteSidebar({ 
  notes, 
  folders,
  activeNoteId, 
  activeFolderId,
  searchQuery,
  onSelectNote, 
  onSelectFolder,
  onCreateNote,
  onDeleteNote,
  onSearchChange
}: NoteSidebarProps) {
  const { state } = useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    folders: true,
    recentNotes: true
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getPreview = (content: string) => {
    return content.length > 60 ? content.substring(0, 60) + "..." : content;
  };

  const getFolderIcon = (iconName: string) => {
    const IconComponent = FOLDER_ICONS[iconName as keyof typeof FOLDER_ICONS] || FolderIcon;
    return IconComponent;
  };

  const getFolderColorClass = (color: string) => {
    return FOLDER_COLORS[color as keyof typeof FOLDER_COLORS] || FOLDER_COLORS.gray;
  };

  const getNotesInFolder = (folderId: string) => {
    if (folderId === "all") return notes;
    return notes.filter(note => note.folder === folderId);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Show recent notes in collapsed sidebar
  const collapsed = state === "collapsed";
  const recentNotes = notes.slice(0, 5);

  return (
    <Sidebar className={cn("border-r", collapsed ? "w-14" : "w-80")}>
      <SidebarContent>
        {/* Header with search */}
        {!collapsed && (
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Notes</h2>
              <Button 
                onClick={onCreateNote}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        )}

        {/* Collapsed header */}
        {collapsed && (
          <div className="p-2 border-b">
            <Button 
              onClick={onCreateNote}
              size="sm"
              className="w-full h-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Folders Section */}
        <SidebarGroup>
          <SidebarGroupLabel 
            onClick={() => !collapsed && toggleGroup("folders")}
            className={cn("cursor-pointer", !collapsed && "hover:bg-accent")}
          >
            {!collapsed && "Folders"}
          </SidebarGroupLabel>
          
          {(!collapsed || expandedGroups.folders) && (
            <SidebarGroupContent>
              <SidebarMenu>
                {folders.map((folder) => {
                  const notesCount = getNotesInFolder(folder.id).length;
                  const IconComponent = getFolderIcon(folder.icon);
                  const isActive = activeFolderId === folder.id;

                  return (
                    <SidebarMenuItem key={folder.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectFolder(folder.id)}
                        className={cn(
                          "justify-between",
                          isActive && "bg-accent border border-border font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent 
                            className={cn("h-4 w-4", getFolderColorClass(folder.color))} 
                          />
                          {!collapsed && <span>{folder.name}</span>}
                        </div>
                        {!collapsed && notesCount > 0 && (
                          <Badge variant="secondary" className="text-xs h-5">
                            {notesCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <Separator />

        {/* Recent Notes Section */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel 
              onClick={() => toggleGroup("recentNotes")}
              className="cursor-pointer hover:bg-accent"
            >
              Recent Notes
            </SidebarGroupLabel>
            
            {expandedGroups.recentNotes && (
              <SidebarGroupContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1 p-1">
                    {recentNotes.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notes yet</p>
                        <p className="text-xs mt-1">Create your first note</p>
                      </div>
                    ) : (
                      recentNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => onSelectNote(note)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent group",
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
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note.id);
                              }}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {getPreview(note.content) || "No content"}
                          </p>
                          
                          {/* Tags */}
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {note.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs h-4 px-1">
                                  <Hash className="h-2 w-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs h-4 px-1">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Date and word count */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(note.updatedAt)}
                            </div>
                            <span>{note.wordCount} words</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* Collapsed mini preview */}
        {collapsed && recentNotes.length > 0 && (
          <div className="p-1 space-y-1">
            {recentNotes.slice(0, 3).map((note) => (
              <Button
                key={note.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full h-8 p-1 justify-center",
                  activeNoteId === note.id && "bg-accent"
                )}
                onClick={() => onSelectNote(note)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}