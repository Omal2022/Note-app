import { useState, useEffect } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  summary?: string;
  actionItems?: string[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
}

const STORAGE_KEYS = {
  notes: "ai-notes-notes",
  folders: "ai-notes-folders",
  lastSync: "ai-notes-last-sync"
};

const DEFAULT_FOLDERS: Folder[] = [
  {
    id: "all",
    name: "All Notes",
    color: "blue",
    icon: "FileText",
    createdAt: new Date()
  },
  {
    id: "quick-notes",
    name: "Quick Notes",
    color: "green",
    icon: "Zap",
    createdAt: new Date()
  },
  {
    id: "meetings",
    name: "Meetings",
    color: "purple",
    icon: "Users",
    createdAt: new Date()
  },
  {
    id: "ideas",
    name: "Ideas",
    color: "yellow",
    icon: "Lightbulb",
    createdAt: new Date()
  },
  {
    id: "tasks",
    name: "Tasks",
    color: "red",
    icon: "CheckSquare",
    createdAt: new Date()
  }
];

export function useNoteStorage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load notes
        const savedNotes = localStorage.getItem(STORAGE_KEYS.notes);
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }));
          setNotes(parsedNotes);
        } else {
          // Create welcome note if no notes exist
          const welcomeNote: Note = {
            id: "1",
            title: "Welcome to AI Notes Pro",
            content: "🎉 Welcome to your enhanced AI-powered note-taking app!\n\n✨ **New Features:**\n\n📁 **Smart Organization**: Notes are now organized in folders with AI-powered categorization\n\n🌙 **Dark Mode**: Toggle between light and dark themes in the header\n\n💾 **Offline Mode**: Your notes are automatically saved locally and will sync when online\n\n🔍 **Advanced Search**: Full-text search with highlighting across all your notes\n\n📊 **AI Summaries**: Get automatic summaries and action items for your notes\n\n🎤 **Voice Recording**: Continue using voice-to-text for hands-free note-taking\n\nStart exploring these features and boost your productivity!",
            tags: ["welcome", "features", "getting-started"],
            folder: "quick-notes",
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 95,
            summary: "Introduction to new AI Notes Pro features including smart organization, dark mode, offline sync, advanced search, AI summaries, and voice recording.",
            actionItems: [
              "Explore the folder organization system",
              "Try the dark mode toggle",
              "Test voice recording functionality",
              "Use AI summarization on longer notes"
            ]
          };
          setNotes([welcomeNote]);
        }

        // Load folders
        const savedFolders = localStorage.getItem(STORAGE_KEYS.folders);
        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders).map((folder: any) => ({
            ...folder,
            createdAt: new Date(folder.createdAt)
          }));
          setFolders(parsedFolders);
        }

        // Load last sync
        const savedLastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
        if (savedLastSync) {
          setLastSync(new Date(savedLastSync));
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && notes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    }
  }, [notes, isLoading]);

  // Save folders to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.folders, JSON.stringify(folders));
    }
  }, [folders, isLoading]);

  const saveNote = (noteData: Partial<Note>): Note => {
    const now = new Date();
    
    if (!noteData.id) {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteData.title || "Untitled",
        content: noteData.content || "",
        tags: noteData.tags || [],
        folder: noteData.folder || "quick-notes",
        createdAt: now,
        updatedAt: now,
        wordCount: (noteData.content || "").split(/\s+/).filter(word => word.length > 0).length,
        summary: noteData.summary,
        actionItems: noteData.actionItems
      };
      
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } else {
      // Update existing note
      const updatedNote = {
        ...noteData,
        updatedAt: now,
        wordCount: (noteData.content || "").split(/\s+/).filter(word => word.length > 0).length
      } as Note;
      
      setNotes(prev => prev.map(note => 
        note.id === noteData.id ? updatedNote : note
      ));
      
      return updatedNote;
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const createFolder = (name: string, color: string = "blue", icon: string = "Folder") => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      color,
      icon,
      createdAt: new Date()
    };
    
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const deleteFolder = (folderId: string) => {
    if (DEFAULT_FOLDERS.some(f => f.id === folderId)) {
      return; // Don't delete default folders
    }
    
    // Move notes from deleted folder to "quick-notes"
    setNotes(prev => prev.map(note => 
      note.folder === folderId ? { ...note, folder: "quick-notes" } : note
    ));
    
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  const getNotesInFolder = (folderId: string): Note[] => {
    if (folderId === "all") {
      return notes;
    }
    return notes.filter(note => note.folder === folderId);
  };

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;
    
    const searchTerm = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (note.summary && note.summary.toLowerCase().includes(searchTerm))
    );
  };

  // Simulate sync (in a real app, this would sync with a backend)
  const syncNotes = async (): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      setLastSync(now);
      localStorage.setItem(STORAGE_KEYS.lastSync, now.toISOString());
      
      return true;
    } catch (error) {
      console.error("Sync failed:", error);
      return false;
    }
  };

  // Auto-categorize notes based on content
  const categorizeNote = (content: string): string => {
    const text = content.toLowerCase();
    
    if (text.includes("meeting") || text.includes("agenda") || text.includes("discussed")) {
      return "meetings";
    }
    if (text.includes("idea") || text.includes("brainstorm") || text.includes("concept")) {
      return "ideas";
    }
    if (text.includes("todo") || text.includes("task") || text.includes("action item")) {
      return "tasks";
    }
    
    return "quick-notes";
  };

  return {
    notes,
    folders,
    isLoading,
    lastSync,
    saveNote,
    deleteNote,
    createFolder,
    deleteFolder,
    getNotesInFolder,
    searchNotes,
    syncNotes,
    categorizeNote
  };
}