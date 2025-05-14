'use client';

import React, { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFileToStorage } from '@/utils/supabase-helpers';
import { supabase } from '@/utils/supabase';

export interface UniversalPromptBarProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  acceptedFileTypes?: string;
  fileCategory?: string;
  intentType?: string;
  placeholder?: string;
  promptLabel?: string;
  showPrompt?: boolean;
  buttonText?: string;
  onPromptSubmit?: (prompt: string) => void;
  onFileUpload?: (fileUrl: string, metadata: any) => void;
  onComplete?: (data: { 
    prompt: string, 
    fileUrl?: string, 
    fileName?: string, 
    fileType?: string,
    fileSize?: number 
  }) => void;
  compact?: boolean;
  minimalUI?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export default function UniversalPromptBar({
  title = 'Upload File',
  description = 'Upload a file and provide optional instructions.',
  icon,
  acceptedFileTypes = '.pdf,.doc,.docx,.txt',
  fileCategory = 'document',
  intentType = 'process',
  placeholder = 'How would you like us to handle your file? Any specific instructions?',
  promptLabel = 'Describe your request (optional):',
  showPrompt = true,
  buttonText = 'Upload',
  onPromptSubmit,
  onFileUpload,
  onComplete,
  compact = false,
  minimalUI = false,
  className = '',
  theme = 'dark',
}: UniversalPromptBarProps) {
  const pathname = usePathname() || '';
  const isDashboard = pathname.startsWith('/dashboard');

  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isListening = focused || prompt.length > 0 || uploading;
  const themeCls = {
    container: theme === 'dark' ? 'glass-card' : 'bg-white shadow-lg',
    input: theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900',
    button: theme === 'dark' ? 'bg-electric-blue text-white' : 'bg-blue-600 text-white',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    second: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    error: 'text-red-400',
    successBg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
    successText: theme === 'dark' ? 'text-green-400' : 'text-green-700',
  };

  const selectFile = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setError(''); }
  };
  const submitPromptOnly = () => {
    if (!prompt.trim()) { setError('Enter prompt'); return; }
    setUploading(true);
    onPromptSubmit?.(prompt);
    onComplete?.({ prompt });
    setPrompt(''); setSuccess(true);
    setTimeout(() => { setSuccess(false); setUploading(false); }, 2000);
  };
  const upload = async () => {
    if (!file && !prompt.trim()) { setError('Select file or enter prompt'); return; }
    if (!file && prompt.trim()) { submitPromptOnly(); return; }
    try {
      setUploading(true); setProgress(10);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login required');
      const path = `${intentType}/${user.id}/${fileCategory}/${Date.now()}_${file!.name}`;
      setProgress(30);
      const res = await uploadFileToStorage(file!, path);
      if (!res.success || !res.url) throw new Error('Upload failed');
      setProgress(70);
      const meta = { ...res, userPrompt: prompt.trim() };
      if (onFileUpload) onFileUpload(res.url, meta);
      else await supabase.from('agent_jobs').insert({ ...meta, category: fileCategory, intentType });
      onComplete?.({ prompt, fileUrl: res.url, fileName: file!.name, fileType: file!.type, fileSize: file!.size });
      setProgress(100); setSuccess(true); setFile(null); setPrompt('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message||'Error');
    } finally { setUploading(false); }
  };

  const render = () => (
    <>
      {success && <div className="text-center"><div className={`${themeCls.successBg} p-3 rounded mb-4`}><p className={themeCls.successText}>Success!</p></div></div>}
      {!minimalUI && <div className="flex items-center mb-4"><div className="mr-3">{icon}</div><div><h2 className={`text-xl ${themeCls.text}`}>{title}</h2><p className={themeCls.second}>{description}</p></div></div>}
      {showPrompt && <div className="mb-4"><label htmlFor="uprompt" className={`block text-sm ${themeCls.text} mb-1`}>{promptLabel}</label><textarea id="uprompt" title={placeholder} placeholder={placeholder} value={prompt} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={e=>setPrompt(e.target.value)} className={`w-full ${themeCls.input} rounded p-2 h-24`} />{isListening && <p className="text-xs text-electric-blue animate-pulse">Percy is listening…</p>}</div>}
      {file ? <div className="mb-4"><p className="truncate text-white">{file.name}</p><motion.button onClick={upload} disabled={uploading} whileHover={{scale:1.02}} className={`mt-2 ${uploading?'bg-gray-500':' '+themeCls.button} px-4 py-2 rounded ${uploading?'opacity-50 animate-pulse cursor-not-allowed':''}`} >{uploading?'Sending...':buttonText}</motion.button></div>
        : <motion.button onClick={selectFile} whileHover={{scale:1.02}} className="w-full py-6 border-2 border-dashed border-white/20 rounded flex flex-col items-center"><p className={`text-sm ${themeCls.text}`}>Drop or browse file</p><input ref={fileRef} type="file" title={`Upload ${title} file`} aria-label={`Upload ${title} file`} accept={acceptedFileTypes} onChange={onFileChange} className="hidden" /></motion.button>}  
      {prompt.trim() && !file && <motion.button onClick={submitPromptOnly} disabled={uploading} whileHover={{scale:1.02}} className={`w-full py-2 rounded mt-4 ${themeCls.button} ${uploading?'opacity-50 animate-pulse cursor-not-allowed':''}`}>{uploading?'Sending...':'Submit'}</motion.button>}
      {error && <p className={`${themeCls.error} mt-2`}>{error}</p>}
      {uploading && <div className="w-full bg-gray-700 rounded h-2 mt-4"><div className={`bg-gradient-to-r from-electric-blue to-teal-400 h-full rounded ${progress}%`}></div></div>}
    </>
  );

  return (
    <AnimatePresence>
      <motion.div key={pathname} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:0.3}} className={`${themeCls.container} p-6 rounded-xl ${className}`}> {render()} </motion.div>
    </AnimatePresence>
  );
}
