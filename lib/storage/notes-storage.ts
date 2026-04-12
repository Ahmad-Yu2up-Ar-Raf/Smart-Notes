import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = 'SMART_NOTES_DATA';

/**
 * ✅ NOTE INTERFACE: Struktur data untuk satu note
 * Simple, clean, scalable
 */
export interface Note {
  id: string; // UUID atau timestamp
  title: string;
  content: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

/**
 * ✅ CRUD OPERATIONS FOR NOTES
 *
 * Best Practice Pattern:
 * - Try/catch untuk error handling
 * - Validate input sebelum save
 * - Atomic operations (read-modify-write)
 * - Async/await untuk clarity
 */

/**
 * ✅ CREATE: Tambah note baru
 * @param title - Judul note
 * @param content - Isi content
 * @returns note yang sudah tersimpan
 */
export async function createNote(title: string, content: string): Promise<Note> {
  try {
    // Validate input
    if (!title.trim()) {
      throw new Error('❌ Title tidak boleh kosong!');
    }

    // Buat note baru dengan ID dan timestamp
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // unique ID
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Get existing notes
    const existingNotes = await getAllNotes();

    // Add new note
    const allNotes = [newNote, ...existingNotes]; // Latest first

    // Save to storage
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));

    console.log('✅ Note created:', newNote.id);
    return newNote;
  } catch (error) {
    console.error('❌ createNote error:', error);
    throw error;
  }
}

/**
 * ✅ READ: Get semua notes
 * @returns array of notes (latest first)
 */
export async function getAllNotes(): Promise<Note[]> {
  try {
    const data = await AsyncStorage.getItem(NOTES_KEY);
    if (!data) return [];

    const notes = JSON.parse(data) as Note[];
    return notes;
  } catch (error) {
    console.error('❌ getAllNotes error:', error);
    return [];
  }
}

/**
 * ✅ READ: Get single note by ID
 * @param id - Note ID
 * @returns note atau null jika tidak ditemukan
 */
export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const notes = await getAllNotes();
    const note = notes.find((n) => n.id === id);
    return note || null;
  } catch (error) {
    console.error('❌ getNoteById error:', error);
    return null;
  }
}

/**
 * ✅ UPDATE: Update existing note
 * @param id - Note ID
 * @param title - New title
 * @param content - New content
 * @returns updated note
 */
export async function updateNote(id: string, title: string, content: string): Promise<Note | null> {
  try {
    // Validate
    if (!title.trim()) {
      throw new Error('❌ Title tidak boleh kosong!');
    }

    const notes = await getAllNotes();
    const noteIndex = notes.findIndex((n) => n.id === id);

    if (noteIndex === -1) {
      console.warn(`⚠️ Note dengan ID ${id} tidak ditemukan`);
      return null;
    }

    // Update note
    const updatedNote: Note = {
      ...notes[noteIndex],
      title: title.trim(),
      content: content.trim(),
      updatedAt: Date.now(),
    };

    notes[noteIndex] = updatedNote;

    // Save
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));

    console.log('✅ Note updated:', id);
    return updatedNote;
  } catch (error) {
    console.error('❌ updateNote error:', error);
    throw error;
  }
}

/**
 * ✅ DELETE: Hapus note by ID
 * @param id - Note ID
 * @returns true jika berhasil dihapus
 */
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const notes = await getAllNotes();
    const filteredNotes = notes.filter((n) => n.id !== id);

    // Jika tidak ada yang dihapus, return false
    if (filteredNotes.length === notes.length) {
      console.warn(`⚠️ Note dengan ID ${id} tidak ditemukan`);
      return false;
    }

    // Save
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));

    console.log('✅ Note deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ deleteNote error:', error);
    throw error;
  }
}

/**
 * ✅ CLEAR ALL: Hapus semua notes (use with caution!)
 */
export async function clearAllNotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTES_KEY);
    console.log('✅ All notes cleared');
  } catch (error) {
    console.error('❌ clearAllNotes error:', error);
    throw error;
  }
}

/**
 * ✅ HELPER: Get note count
 */
export async function getNoteCount(): Promise<number> {
  try {
    const notes = await getAllNotes();
    return notes.length;
  } catch (error) {
    console.error('❌ getNoteCount error:', error);
    return 0;
  }
}

/**
 * ✅ HELPER: Search notes by title or content
 */
export async function searchNotes(query: string): Promise<Note[]> {
  try {
    const notes = await getAllNotes();
    const lowerQuery = query.toLowerCase();

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('❌ searchNotes error:', error);
    return [];
  }
}
