import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './PDFViewer.scss';

function PDFViewer({ pdfUrl }) {
    const [isFullSize, setIsFullSize] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleFullSize = () => {
        setIsFullSize(!isFullSize);
    };

    // New strategy: embed direct URL (Cloudinary or server /api/recipe/:id) without fetching.
    // This avoids CORS/401 issues with signed Cloudinary transformations or access controls.
    useEffect(() => {
        if (!pdfUrl) return;
        setError('');
        setLoading(false);
        // Clean previous created blob object if any (we no longer create new ones here)
        if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
        }
        // Accept direct embed if Cloudinary host or our API route
        if (/res\.cloudinary\.com/.test(pdfUrl) || /\/api\/recipe\//.test(pdfUrl)) {
            setBlobUrl(pdfUrl);
            return;
        }
        // Fallback: attempt fetch (rare path)
        let canceled = false;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(pdfUrl, { headers: { 'Accept': 'application/pdf' } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const fetched = await res.blob();
                if (canceled) return;
                const url = URL.createObjectURL(fetched.type === 'application/pdf' ? fetched : new Blob([fetched], { type: 'application/pdf' }));
                setBlobUrl(url);
            } catch (e) {
                setError(String(e.message).includes('404') ? 'הקובץ לא נמצא' : 'שגיאה בטעינת הקובץ');
                console.error('[PDFViewer] Failed to load PDF', e);
            } finally {
                if (!canceled) setLoading(false);
            }
        })();
        return () => { canceled = true; };
    }, [pdfUrl]);

    return (
        <div className={isFullSize ? 'pdf-viewer-fullsize' : ''}>
            <button 
                onClick={toggleFullSize}
                className={`pdf-viewer-btn${isFullSize ? ' fullsize' : ''}`}
            >
                {isFullSize ? 'יציאה ממסך מלא' : 'צפה במסך מלא'}
            </button>
            {loading && <div style={{ padding: '1rem', textAlign: 'center' }}>טוען...</div>}
            {error && <div style={{ color: 'red', padding: '0.5rem', textAlign: 'center' }}>{error}</div>}
            {!loading && !error && blobUrl && (
                <iframe
                    src={blobUrl}
                    title="Recipe PDF"
                    width="100%"
                    height="600px"
                    className={isFullSize ? 'pdf-viewer-iframe-fullsize' : 'pdf-viewer-iframe'}
                />
            )}
        </div>
    );
}

export default PDFViewer;
