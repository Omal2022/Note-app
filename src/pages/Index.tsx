import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NoteSidebar } from "@/components/NoteSidebarNew";
import { NoteEditorNew } from "@/components/NoteEditorNew";
import { useNoteStorage, Note } from "@/hooks/use-note-storage";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Wifi,
  WifiOff,
  Cloud,
} from "lucide-react";

const Index = () => {
  const {
    notes,
    folders,
    isLoading,
    lastSync,
    saveNote,
    deleteNote,
    getNotesInFolder,
    searchNotes,
    syncNotes,
    categorizeNote,
  } = useNoteStorage();

  const { theme, setTheme, actualTheme } = useTheme();
  const { toast } = useToast();

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [activeFolderId, setActiveFolderId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && lastSync) {
      const timeSinceLastSync = Date.now() - lastSync.getTime();
      if (timeSinceLastSync > 5 * 60 * 1000) {
        // 5 minutes
        handleSync();
      }
    }
  }, [isOnline, lastSync]);

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    setActiveNote(null);
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "",
      content: "",
      tags: [],
      folder: activeFolderId === "all" ? "quick-notes" : activeFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      wordCount: 0,
    };

    const savedNote = saveNote(newNote);
    setActiveNote(savedNote);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    // Auto-categorize if folder not explicitly set
    if (noteData.content && !noteData.folder) {
      noteData.folder = categorizeNote(noteData.content);
    }

    const savedNote = saveNote(noteData);
    setActiveNote(savedNote);

    // Show appropriate folder if auto-categorized
    if (noteData.folder && noteData.folder !== activeFolderId) {
      toast({
        title: "Note auto-categorized",
        description: `Moved to ${
          folders.find((f) => f.id === noteData.folder)?.name || "folder"
        }`,
      });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);

    if (activeNote?.id === noteId) {
      const remainingNotes = getDisplayedNotes().filter(
        (note) => note.id !== noteId
      );
      setActiveNote(remainingNotes[0] || null);
    }

    toast({
      title: "Note deleted",
      description: "Note has been removed successfully.",
    });
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Offline mode",
        description: "Connect to the internet to sync your notes.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    const success = await syncNotes();
    setIsSyncing(false);

    if (success) {
      toast({
        title: "Sync completed",
        description: "Your notes are up to date.",
      });
    } else {
      toast({
        title: "Sync failed",
        description: "Unable to sync notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDisplayedNotes = () => {
    if (searchQuery.trim()) {
      return searchNotes(searchQuery);
    }
    return getNotesInFolder(activeFolderId);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full md:ml-80">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Notes Pro</h1>
                <p className="text-sm text-muted-foreground">
                  {getDisplayedNotes().length} notes •{" "}
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Status */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isOnline ? (
                <Cloud className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {getThemeIcon()}
              {theme === "system"
                ? "Auto"
                : theme === "light"
                ? "Light"
                : "Dark"}
            </Button>

            {/* AI Features Indicator */}
            <Button variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Ready
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)] w-full">
        <NoteSidebar
          notes={getDisplayedNotes()}
          folders={folders}
          activeNoteId={activeNote?.id || null}
          activeFolderId={activeFolderId}
          searchQuery={searchQuery}
          onSelectNote={handleSelectNote}
          onSelectFolder={handleSelectFolder}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onSearchChange={setSearchQuery}
        />

        {activeNote ? (
          <NoteEditorNew
            note={activeNote}
            folders={folders}
            onSave={handleSaveNote}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold">Welcome to AI Notes Pro</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Experience the future of note-taking with AI-powered writing
                  assistance, smart organization, offline sync, and advanced
                  search capabilities.
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={handleCreateNote} size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Your First Note
                </Button>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                  </div>
                  <div className="flex items-center gap-1">
                    {isOnline ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <WifiOff className="h-4 w-4" />
                    )}
                    {isOnline ? "Online Sync" : "Offline Mode"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
