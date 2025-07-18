import React, { useState } from 'react';
import './PDFViewer.scss';

function PDFViewer({ pdfUrl }) {
    const [isFullSize, setIsFullSize] = useState(false);

    const toggleFullSize = () => {
        setIsFullSize(!isFullSize);
    };

    return (
        <div className={isFullSize ? 'pdf-viewer-fullsize' : ''}>
            <button 
                onClick={toggleFullSize}
                className={`pdf-viewer-btn${isFullSize ? ' fullsize' : ''}`}
            >
                {isFullSize ? 'יציאה ממסך מלא' : 'צפה במסך מלא'}
            </button>
            <iframe
                src={pdfUrl}
                title="Recipe PDF"
                width="100%"
                height="600px"
                className={isFullSize ? 'pdf-viewer-iframe-fullsize' : 'pdf-viewer-iframe'}
            />
        </div>
    );
}

export default PDFViewer;
