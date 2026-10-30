import { NextResponse } from 'next/server';
import { getEdits, addEdit, updateEdit, deleteEdit, resetEditsToDefault } from '@/lib/edits';

export async function GET() {
  try {
    const edits = await getEdits();
    return NextResponse.json(edits);
  } catch (error) {
    console.error('Error fetching edits:', error);
    return NextResponse.json({ error: 'Failed to retrieve edits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if reset action requested
    if (body.action === 'reset') {
      const resetItems = await resetEditsToDefault();
      return NextResponse.json({ success: true, items: resetItems });
    }

    const { title, category, src, thumbnail = '', duration = '0:30', isPlaceholder = false } = body;

    if (!title || !category || (!src && !isPlaceholder)) {
      return NextResponse.json(
        { error: 'Missing required fields (title, category, and video source)' },
        { status: 400 }
      );
    }

    const newItem = await addEdit({
      title: title.trim(),
      category: category.trim(),
      src: src ? src.trim() : '',
      thumbnail: thumbnail ? thumbnail.trim() : '',
      duration: duration.trim(),
      isPlaceholder,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error adding edit:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add edit' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Edit ID is required for update' }, { status: 400 });
    }

    const updated = await updateEdit(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Edit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating edit:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update edit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // body may be empty
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Edit ID is required' }, { status: 400 });
    }

    const success = await deleteEdit(id);
    if (!success) {
      return NextResponse.json({ error: 'Edit not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting edit:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete edit' },
      { status: 500 }
    );
  }
}
