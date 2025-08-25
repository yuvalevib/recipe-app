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

    // Fetch PDF as blob with auth header (since iframe cannot send Authorization header by itself)
    useEffect(() => {
        if (!pdfUrl) return;
        let revoked = false;
        async function load() {
            setLoading(true); setError('');
            // Revoke existing
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
            }
            try {
                // Use axios instance to get base URL/header, but need raw blob; fallback to fetch for streaming
                const res = await fetch(pdfUrl);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const blob = await res.blob();
                if (revoked) return; // component unmounted
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
            } catch (e) {
                setError('שגיאה בטעינת הקובץ');
                console.error('[PDFViewer] Failed to load PDF', e);
            } finally {
                if (!revoked) setLoading(false);
            }
        }
        load();
        return () => { revoked = true; if (blobUrl) URL.revokeObjectURL(blobUrl); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
