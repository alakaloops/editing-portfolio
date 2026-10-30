import fs from 'fs/promises';
import path from 'path';

export interface MediaItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  src: string;
  duration?: string;
  isPlaceholder?: boolean;
  createdAt?: string;
}

export const defaultMediaItems: MediaItem[] = [
  {
    id: '5',
    title: 'Visual Edit 05',
    category: 'After Effects / VFX',
    thumbnail: '/thumbnails/edit5.jpg',
    src: '/videos/edit5.mp4',
    duration: '0:30',
  },
  {
    id: '6',
    title: 'Visual Edit 06',
    category: 'Cinematic Motion',
    thumbnail: '/thumbnails/edit6.jpg',
    src: '/videos/edit6.mp4',
    duration: '0:45',
  },
  {
    id: '7',
    title: 'Visual Edit 07',
    category: 'Rhythm & Color',
    thumbnail: '/thumbnails/edit7.jpg',
    src: '/videos/edit7.mp4',
    duration: '0:40',
  },
  {
    id: '8',
    title: 'Visual Edit 08',
    category: 'CapCut / Dynamics',
    thumbnail: '/thumbnails/edit8.jpg',
    src: '/videos/edit8.mp4',
    duration: '0:35',
  },
  {
    id: '10',
    title: 'Visual Edit 10',
    category: 'Visual Composition',
    thumbnail: '/thumbnails/edit10.jpg',
    src: '/videos/edit10.mp4',
    duration: '0:50',
  },
  {
    id: '11',
    title: 'Visual Edit 11',
    category: 'VFX Showcase',
    thumbnail: '/thumbnails/edit11.jpeg',
    src: '/videos/edit11.mp4',
    duration: '1:05',
  },
  {
    id: '12',
    title: 'Visual Edit 12',
    category: 'High-Energy Edit',
    thumbnail: '/thumbnails/edit12.jpeg',
    src: '/videos/edit12.mp4',
    duration: '0:25',
  },
  {
    id: '1',
    title: 'Shadow Edit 01',
    category: 'Creative Cut',
    thumbnail: '/thumbnails/edit1.jpg',
    src: '/videos/edit1.mp4',
    duration: '0:45',
  },
];

const dataFilePath = path.join(process.cwd(), 'data', 'edits.json');

export async function getEdits(): Promise<MediaItem[]> {
  try {
    const content = await fs.readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // If missing or unreadable, write default edits
    try {
      await saveEdits(defaultMediaItems);
    } catch (writeErr) {
      console.error('Error writing default edits:', writeErr);
    }
  }
  return defaultMediaItems;
}

export async function saveEdits(items: MediaItem[]): Promise<void> {
  const dir = path.dirname(dataFilePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2), 'utf-8');
}

export async function addEdit(item: Omit<MediaItem, 'id'> & { id?: string }): Promise<MediaItem> {
  const edits = await getEdits();
  const newItem: MediaItem = {
    ...item,
    id: item.id || `edit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  // Prepend to top of list so newly added edits appear front and center
  edits.unshift(newItem);
  await saveEdits(edits);
  return newItem;
}

export async function updateEdit(id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> {
  const edits = await getEdits();
  const index = edits.findIndex((item) => item.id === id);
  if (index === -1) return null;
  edits[index] = {
    ...edits[index],
    ...updates,
    id, // Keep ID unchanged
  };
  await saveEdits(edits);
  return edits[index];
}

export async function deleteEdit(id: string): Promise<boolean> {
  const edits = await getEdits();
  const target = edits.find((item) => item.id === id);
  if (!target) return false;

  const filtered = edits.filter((item) => item.id !== id);
  await saveEdits(filtered);

  // NOTE: Never delete video or thumbnail files from disk!
  // All uploaded and existing assets remain permanently preserved.
  return true;
}

export async function resetEditsToDefault(): Promise<MediaItem[]> {
  await saveEdits(defaultMediaItems);
  return defaultMediaItems;
}
