"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { MediaItem } from '@/lib/edits';

function notifyPortfolioUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('edits-updated'));
  }
}

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('alaka_admin_auth') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Edits & Dashboard State
  const [edits, setEdits] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Upload Studio Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<'file' | 'url'>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const [thumbSourceType, setThumbSourceType] = useState<'capture' | 'file' | 'url'>('capture');
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbUrl, setThumbUrl] = useState('');
  const [capturedThumbData, setCapturedThumbData] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('After Effects / VFX');
  const [customCategory, setCustomCategory] = useState('');
  const [duration, setDuration] = useState('0:30');
  const [placement, setPlacement] = useState<'start' | 'end'>('start');

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Modals State
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Hidden Video ref for auto-duration & thumbnail capture
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const presetCategories = [
    'After Effects / VFX',
    'Cinematic Motion',
    'Rhythm & Color',
    'CapCut / Dynamics',
    'Visual Composition',
    'VFX Showcase',
    'High-Energy Edit',
    'Creative Cut',
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Helper to re-fetch edits after mutations
  const loadEdits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/edits');
      if (res.ok) {
        const data = await res.json();
        setEdits(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // Synchronize edits on authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;

    fetch('/api/edits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setEdits(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  // Authenticate Admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        sessionStorage.setItem('alaka_admin_auth', 'true');
        showToast('Welcome back, Alaka!', 'success');
      } else {
        setAuthError(data.message || 'Incorrect passcode. Try again.');
      }
    } catch {
      setAuthError('Authentication service unreachable');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('alaka_admin_auth');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Handle Video File Selection
  const handleVideoFileChange = (file: File | null) => {
    setVideoFile(file);
    setCapturedThumbData(null);

    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);

      // Auto fill title if empty
      if (!title) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const formattedTitle = nameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setTitle(formattedTitle);
      }
    } else {
      setVideoPreviewUrl(null);
    }
  };

  // Handle Video URL change
  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    setVideoPreviewUrl(url ? url : null);
    setCapturedThumbData(null);
  };

  // Handle Video Metadata Loaded (Auto-detect duration)
  const handleVideoLoadedMetadata = () => {
    if (previewVideoRef.current) {
      const totalSec = Math.floor(previewVideoRef.current.duration);
      if (!isNaN(totalSec) && totalSec > 0) {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        setDuration(`${m}:${s.toString().padStart(2, '0')}`);
      }
    }
  };

  // Capture Frame from Video as Thumbnail
  const handleCaptureThumbnail = () => {
    const video = previewVideoRef.current;
    if (!video) {
      showToast('Load a video preview first before capturing', 'info');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedThumbData(dataUrl);
        setThumbSourceType('capture');
        showToast('Thumbnail captured from video frame!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not capture frame (cross-origin or unsupported video)', 'error');
    }
  };


  // Submit Upload New Edit
  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim();
    const finalCategory = category === 'CUSTOM' ? customCategory.trim() : category;

    if (!finalTitle) {
      showToast('Please provide a title for the edit', 'error');
      return;
    }

    if (!finalCategory) {
      showToast('Please specify a category', 'error');
      return;
    }

    if (videoSourceType === 'file' && !videoFile) {
      showToast('Please select a video file to upload', 'error');
      return;
    }

    if (videoSourceType === 'url' && !videoUrl.trim()) {
      showToast('Please enter a valid video URL', 'error');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading video asset...');

    try {
      let finalVideoSrc = videoUrl.trim();
      let finalThumbSrc = '';

      // 1. Upload Video File if applicable
      if (videoSourceType === 'file' && videoFile) {
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('type', 'video');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Video upload failed');
        }
        const uploadData = await uploadRes.json();
        finalVideoSrc = uploadData.url;
      }

      // 2. Handle Thumbnail
      setUploadStatus('Processing thumbnail asset...');
      if (thumbSourceType === 'capture' && capturedThumbData) {
        const thumbRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: capturedThumbData,
            type: 'thumbnail',
            filename: `${finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_thumb`,
          }),
        });
        if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          finalThumbSrc = thumbData.url;
        }
      } else if (thumbSourceType === 'file' && thumbFile) {
        const formData = new FormData();
        formData.append('file', thumbFile);
        formData.append('type', 'thumbnail');

        const thumbRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          finalThumbSrc = thumbData.url;
        }
      } else if (thumbSourceType === 'url' && thumbUrl.trim()) {
        finalThumbSrc = thumbUrl.trim();
      }

      // 3. Save Edit to Portfolio
      setUploadStatus('Publishing edit to portfolio...');
      const createRes = await fetch('/api/edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          category: finalCategory,
          src: finalVideoSrc,
          thumbnail: finalThumbSrc,
          duration: duration.trim() || '0:30',
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to save edit');
      }

      const createdData = await createRes.json();

      // If placement is 'end', re-order items
      if (placement === 'end') {
        const currentEdits = await (await fetch('/api/edits')).json();
        // remove the newly created item from top and append to end
        const item = createdData.item;
        const rest = currentEdits.filter((i: MediaItem) => i.id !== item.id);
        const reordered = [...rest, item];
        await fetch('/api/edits/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reordered }),
        });
      }

      await loadEdits();
      notifyPortfolioUpdate();
      showToast(`'${finalTitle}' uploaded and published!`, 'success');

      // Reset form
      setTitle('');
      setVideoFile(null);
      setVideoUrl('');
      setVideoPreviewUrl(null);
      setThumbFile(null);
      setThumbUrl('');
      setCapturedThumbData(null);
      setShowUploadForm(false);
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : 'Upload process failed', 'error');
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  // Reorder Items (Move Up)
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const newItems = [...edits];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;

    setEdits(newItems);
    try {
      await fetch('/api/edits/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      });
      notifyPortfolioUpdate();
      showToast('Order updated', 'info');
    } catch {
      showToast('Failed to save order', 'error');
      loadEdits();
    }
  };

  // Reorder Items (Move Down)
  const handleMoveDown = async (index: number) => {
    if (index >= edits.length - 1) return;
    const newItems = [...edits];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;

    setEdits(newItems);
    try {
      await fetch('/api/edits/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      });
      notifyPortfolioUpdate();
      showToast('Order updated', 'info');
    } catch {
      showToast('Failed to save order', 'error');
      loadEdits();
    }
  };

  // Save Edit Updates from Edit Modal
  const handleSaveEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch('/api/edits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        showToast('Edit details updated!', 'success');
        setEditingItem(null);
        await loadEdits();
        notifyPortfolioUpdate();
      } else {
        showToast('Failed to update edit', 'error');
      }
    } catch {
      showToast('Network error updating edit', 'error');
    }
  };

  // Delete Edit
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      const res = await fetch(`/api/edits?id=${encodeURIComponent(deletingItem.id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast(`'${deletingItem.title}' was deleted`, 'success');
        setDeletingItem(null);
        await loadEdits();
        notifyPortfolioUpdate();
      } else {
        showToast('Failed to delete edit', 'error');
      }
    } catch {
      showToast('Network error while deleting', 'error');
    }
  };

  // Reset to Defaults
  const handleConfirmReset = async () => {
    try {
      const res = await fetch('/api/edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (res.ok) {
        showToast('Restored default portfolio edits', 'success');
        setShowResetConfirm(false);
        await loadEdits();
        notifyPortfolioUpdate();
      } else {
        showToast('Reset failed', 'error');
      }
    } catch {
      showToast('Network error during reset', 'error');
    }
  };

  // Filtered Edits
  const filteredEdits = edits.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const uniqueCategories = Array.from(new Set(edits.map((e) => e.category)));

  // 1. Passcode Gate Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient atmospheric red glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-md w-full bg-zinc-950/80 border border-zinc-900/90 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-red-950/50 border border-red-800/40 text-red-400 text-[10px] uppercase font-mono tracking-widest rounded-full mb-3">
              RESTRICTED ACCESS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              ALAKA<span className="text-red-600">.</span>EDITS
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1 uppercase tracking-wider">
              PORTFOLIO ADMIN STUDIO
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2 tracking-wider">
                Admin Passkey
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passkey"
                className="w-full px-4 py-3 bg-black/60 border border-zinc-800 focus:border-red-500 focus:outline-none rounded-xl text-white font-mono text-sm tracking-wider transition"
                autoFocus
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-900/60 rounded-xl text-red-300 text-xs font-mono">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-mono uppercase tracking-widest text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/20 cursor-pointer"
            >
              Authenticate &amp; Enter
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-900/80 text-center">
            <Link
              href="/"
              className="text-xs font-mono text-zinc-500 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <span>←</span> Return to Public Portfolio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl font-mono text-xs shadow-2xl flex items-center gap-3 border transition-all transform animate-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-700 text-red-200'
              : toast.type === 'info'
              ? 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
              : 'bg-zinc-900/95 border-emerald-600/60 text-emerald-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-900/90 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex flex-col justify-center">
              <span className="text-lg font-black tracking-tighter uppercase text-white group-hover:text-red-500 transition leading-none">
                ALAKA<span className="text-red-600">.</span>EDITS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                ADMIN STUDIO
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE SYNC
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span>View Portfolio</span>
              <span>↗</span>
            </Link>
            <Link
              href="/gallery"
              target="_blank"
              className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 text-zinc-300 hover:text-white transition"
            >
              Gallery ↗
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg border border-red-900/40 bg-red-950/30 hover:bg-red-900/50 text-red-400 transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Quick Stats Overview */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              Active Edits
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{edits.length}</span>
              <span className="text-xs font-mono text-zinc-500">items</span>
            </div>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              Categories
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-500">{uniqueCategories.length}</span>
              <span className="text-xs font-mono text-zinc-500">genres</span>
            </div>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              Carousel Drift
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">GSAP</span>
              <span className="text-xs font-mono text-zinc-500">infinite</span>
            </div>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              Quick Actions
            </span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-[11px] font-mono text-zinc-400 hover:text-red-400 transition text-left underline"
            >
              Restore Defaults...
            </button>
          </div>
        </section>

        {/* Action Header & Upload Studio Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950/40 p-6 rounded-2xl border border-zinc-900">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Portfolio Edits Management
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Upload new video edits, arrange carousel display order, and manage portfolio content.
            </p>
          </div>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono uppercase tracking-wider text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <span>{showUploadForm ? '✕ Close Studio' : '+ Upload New Edit'}</span>
          </button>
        </div>

        {/* UPLOAD STUDIO FORM (Expands smoothly) */}
        {showUploadForm && (
          <section className="bg-zinc-950 border border-red-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-transparent" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 bg-red-950/50 border border-red-900/40 px-3 py-1 rounded-full">
                  NEW ASSET PUBLISHER
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white mt-2">
                  Upload &amp; Add Edit
                </h3>
              </div>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1: Video File / Source & Live Preview */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Video Source
                    </label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoSourceType('file');
                          setVideoPreviewUrl(videoFile ? URL.createObjectURL(videoFile) : null);
                        }}
                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg border transition ${
                          videoSourceType === 'file'
                            ? 'bg-red-950/60 border-red-600 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Upload Video File (.mp4 / .webm)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoSourceType('url');
                          setVideoPreviewUrl(videoUrl ? videoUrl : null);
                        }}
                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg border transition ${
                          videoSourceType === 'url'
                            ? 'bg-red-950/60 border-red-600 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Existing / External URL
                      </button>
                    </div>

                    {videoSourceType === 'file' ? (
                      <div className="border-2 border-dashed border-zinc-800 hover:border-red-500/60 rounded-xl p-6 text-center transition bg-black/40">
                        <input
                          type="file"
                          id="video-upload-input"
                          accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                          onChange={(e) => handleVideoFileChange(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label
                          htmlFor="video-upload-input"
                          className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 text-lg font-bold">
                            ↑
                          </div>
                          <span className="text-xs font-mono text-zinc-300 font-medium">
                            {videoFile ? videoFile.name : 'Click to select video or drag and drop'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {videoFile
                              ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`
                              : 'Supports MP4, WebM, MOV up to 250MB'}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        placeholder="e.g. /videos/edit10.mp4 or https://..."
                        className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Video Live Preview Box & Capture Frame */}
                  {videoPreviewUrl && (
                    <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                        <span>Live Video Preview</span>
                        <button
                          type="button"
                          onClick={handleCaptureThumbnail}
                          className="text-[11px] text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/50 px-2.5 py-1 rounded-md transition flex items-center gap-1"
                        >
                          <span>📸 Capture Frame as Thumbnail</span>
                        </button>
                      </div>

                      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-zinc-900">
                        <video
                          ref={previewVideoRef}
                          src={videoPreviewUrl}
                          controls
                          playsInline
                          onLoadedMetadata={handleVideoLoadedMetadata}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Option Selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Cover Thumbnail
                    </label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setThumbSourceType('capture')}
                        className={`flex-1 py-1.5 text-[11px] font-mono uppercase rounded-lg border transition ${
                          thumbSourceType === 'capture'
                            ? 'bg-red-950/60 border-red-600 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Auto-Capture Frame
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbSourceType('file')}
                        className={`flex-1 py-1.5 text-[11px] font-mono uppercase rounded-lg border transition ${
                          thumbSourceType === 'file'
                            ? 'bg-red-950/60 border-red-600 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Upload Image File
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbSourceType('url')}
                        className={`flex-1 py-1.5 text-[11px] font-mono uppercase rounded-lg border transition ${
                          thumbSourceType === 'url'
                            ? 'bg-red-950/60 border-red-600 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Image URL
                      </button>
                    </div>

                    {thumbSourceType === 'capture' && (
                      <div className="p-3 bg-black/40 border border-zinc-800/80 rounded-xl text-xs font-mono text-zinc-400 flex items-center justify-between">
                        <span>
                          {capturedThumbData
                            ? '✓ Frame snapshot ready'
                            : 'Play video to desired second and click "Capture Frame"'}
                        </span>
                        {capturedThumbData && (
                          <img
                            src={capturedThumbData}
                            alt="Captured snapshot"
                            className="w-14 h-9 object-cover rounded border border-zinc-700"
                          />
                        )}
                      </div>
                    )}

                    {thumbSourceType === 'file' && (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                        className="w-full text-xs font-mono text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-zinc-900 file:text-zinc-300 hover:file:bg-zinc-800"
                      />
                    )}

                    {thumbSourceType === 'url' && (
                      <input
                        type="text"
                        value={thumbUrl}
                        onChange={(e) => setThumbUrl(e.target.value)}
                        placeholder="e.g. /thumbnails/edit5.jpg or https://..."
                        className="w-full px-4 py-2 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Column 2: Edit Metadata & Publishing Config */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Edit Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Visual Edit 13 / Cyber Drift"
                      className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-sans text-sm focus:outline-none font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Category / Style Tag *
                    </label>
                    {/* Quick Preset Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {presetCategories.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setCategory(preset);
                            setCustomCategory('');
                          }}
                          className={`px-2.5 py-1 text-[10px] font-mono rounded-full border transition ${
                            category === preset
                              ? 'bg-red-950/80 border-red-500 text-red-300'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCategory('CUSTOM')}
                        className={`px-2.5 py-1 text-[10px] font-mono rounded-full border transition ${
                          category === 'CUSTOM'
                            ? 'bg-red-950/80 border-red-500 text-red-300'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        + Custom
                      </button>
                    </div>

                    {category === 'CUSTOM' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Type custom category name..."
                        className="w-full px-4 py-2 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 0:45"
                        className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                      />
                      <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                        Auto-detected from video
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                        Display Position
                      </label>
                      <select
                        value={placement}
                        onChange={(e) => setPlacement(e.target.value as 'start' | 'end')}
                        className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                      >
                        <option value="start">Front (Featured First)</option>
                        <option value="end">End of Carousel</option>
                      </select>
                      <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                        Position in the GSAP loop
                      </span>
                    </div>
                  </div>

                  {/* Summary Preview Box */}
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                      Card Preview
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-zinc-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-mono text-zinc-500">
                        {capturedThumbData ? (
                          <img src={capturedThumbData} alt="Thumb" className="w-full h-full object-cover" />
                        ) : (
                          'EDIT'
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-mono text-red-500 uppercase tracking-widest">
                          {category === 'CUSTOM' ? customCategory || 'Custom' : category}
                        </p>
                        <h4 className="text-sm font-bold text-white">{title || 'Untitled Edit'}</h4>
                        <p className="text-[10px] font-mono text-zinc-400">{duration || '0:30'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-zinc-900">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-mono uppercase tracking-widest text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>{uploadStatus || 'Processing Asset...'}</span>
                        </>
                      ) : (
                        <span>Publish Edit to Portfolio Carousel</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* Search, Filter, and Controls Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search edits by title or category..."
              className="w-full max-w-sm px-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              <option value="ALL">All Categories ({edits.length})</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
            <span>Showing {filteredEdits.length} of {edits.length} edits</span>
          </div>
        </section>

        {/* EDITS GRID / LIST */}
        <section className="space-y-3">
          {loading ? (
            <div className="py-20 text-center font-mono text-zinc-500 text-xs">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>SYNCING EDITS FROM PORTFOLIO...</span>
            </div>
          ) : filteredEdits.length === 0 ? (
            <div className="py-16 text-center bg-zinc-950/50 border border-zinc-900 rounded-2xl p-8">
              <p className="text-zinc-400 font-mono text-sm mb-3">No edits matching current filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                }}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 hover:text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEdits.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between transition-all group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: Index Badge & Reorder Arrows */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/80 px-2.5 py-0.5 rounded-full">
                        #{index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Move earlier in carousel"
                          className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white flex items-center justify-center text-xs transition"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === edits.length - 1}
                          title="Move later in carousel"
                          className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white flex items-center justify-center text-xs transition"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    {/* Preview / Thumbnail */}
                    <div
                      className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-zinc-900 group-hover:border-zinc-800 cursor-pointer"
                      onClick={() => setPreviewItem(item)}
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : item.src ? (
                        <video
                          src={`${item.src}#t=0.001`}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs text-zinc-600">
                          Placeholder Slot
                        </div>
                      )}

                      {/* Play overlay button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-mono tracking-widest uppercase rounded-full">
                          ▶ Play
                        </span>
                      </div>

                      {/* Duration Tag */}
                      {item.duration && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[10px] font-mono rounded">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div>
                      <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest block mb-1">
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[10px] font-mono text-zinc-500 truncate mt-1">
                        Src: {item.src || 'No media file'}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-zinc-900/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="flex-1 py-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex-1 py-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="px-3 py-1.5 text-xs font-mono text-red-400 hover:text-white hover:bg-red-600/80 bg-red-950/40 border border-red-900/60 rounded-lg transition"
                      title="Delete Edit"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 1. VIDEO PREVIEW MODAL */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-zinc-950 border border-zinc-800 max-w-3xl w-full rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-red-500 bg-red-950/60 border border-red-900/40 px-2.5 py-0.5 rounded-full">
                  {previewItem.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center font-mono"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-zinc-900 mb-4">
              <video
                src={previewItem.src}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
              <span>Path: {previewItem.src}</span>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT DETAILS MODAL */}
      {editingItem && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="bg-zinc-950 border border-zinc-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                Edit Item Details
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-zinc-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditModal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-4 py-2 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  value={editingItem.duration || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Video Source URL / Path
                </label>
                <input
                  type="text"
                  value={editingItem.src}
                  onChange={(e) => setEditingItem({ ...editingItem, src: e.target.value })}
                  className="w-full px-4 py-2 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Thumbnail Image URL / Path
                </label>
                <input
                  type="text"
                  value={editingItem.thumbnail}
                  onChange={(e) => setEditingItem({ ...editingItem, thumbnail: e.target.value })}
                  className="w-full px-4 py-2 bg-black/60 border border-zinc-800 focus:border-red-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setDeletingItem(null)}
        >
          <div
            className="bg-zinc-950 border border-red-900/60 max-w-md w-full rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-500 text-xl font-bold mb-4">
              🗑
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Remove from portfolio?</h3>
            <p className="text-xs text-zinc-400 font-mono mb-6 leading-relaxed">
              Remove <strong className="text-white">&quot;{deletingItem.title}&quot;</strong> from your portfolio carousel?
              <br />
              <span className="text-emerald-400 mt-2 block">✓ Safe: Your video and thumbnail files will NOT be deleted from disk and remain preserved.</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition shadow-lg shadow-red-600/30"
              >
                Remove from Carousel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESTORE DEFAULTS CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-zinc-950 border border-zinc-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Restore Default Edits?</h3>
            <p className="text-xs text-zinc-400 font-mono mb-6 leading-relaxed">
              This will restore the original 8 showcase edits back to your portfolio carousel. Any custom edits you uploaded will be replaced with defaults.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-mono transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Studio Footer */}
      <footer className="border-t border-zinc-900/90 py-6 text-center text-xs font-mono text-zinc-500">
        ALAKA.EDITS PORTFOLIO ADMIN &bull; NEXT.JS 16 TURBOPACK &bull; GSAP CONTINUOUS LOOP
      </footer>
    </div>
  );
}
