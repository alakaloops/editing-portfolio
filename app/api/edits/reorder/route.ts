import { NextResponse } from 'next/server';
import { saveEdits, MediaItem } from '@/lib/edits';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    await saveEdits(items as MediaItem[]);
    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error('Error reordering edits:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save new order' },
      { status: 500 }
    );
  }
}
