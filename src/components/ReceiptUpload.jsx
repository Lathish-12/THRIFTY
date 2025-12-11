import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ReceiptUpload = ({ file, setFile }) => {
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            // Create object URL for preview
            const file = acceptedFiles[0];
            file.preview = URL.createObjectURL(file);
            setFile(file);
        }
    }, [setFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Receipt / Invoice</label>
            {!file ? (
                <div
                    {...getRootProps()}
                    style={{
                        border: '2px dashed var(--glass-border)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: isDragActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        transition: 'all 0.2s',
                        minHeight: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <input {...getInputProps()} />
                    <Upload size={24} color={isDragActive ? '#6366f1' : '#94a3b8'} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {isDragActive ? 'Drop receipt here' : 'Drag & drop receipt, or click'}
                    </p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    <img
                        src={file.preview}
                        alt="Receipt"
                        style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                        onLoad={() => { URL.revokeObjectURL(file.preview) }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FileText size={12} /> {file.name.substring(0, 15)}...
                        </span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ReceiptUpload;
